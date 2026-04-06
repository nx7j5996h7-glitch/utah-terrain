import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';
import { computeWorldBounds } from '@/core/geo/GeoCoord';
import { GLOBAL_TERRAIN_SEED } from '@/constants';
import { fbm2D } from '@/rendering/ProceduralNoise';

const RESOLUTION = 512;

const SHADOW_STEPS = 20;
const SHADOW_TOTAL_DIST = 300;
const SHADOW_STEP_SIZE = SHADOW_TOTAL_DIST / SHADOW_STEPS;
const PENUMBRA_SAMPLES = 2;
const PENUMBRA_RADIUS = 10;
const SHADOW_MIN_BRIGHTNESS = 0.55;

const AO_RAYS = 6;
const AO_STEPS = 4;
const AO_RADIUS = 30;
const AO_MIN = 0.50;
const AO_BIAS = 0.3;

const DETAIL_SCALES = [0.12, 0.35, 0.8];
const DETAIL_AMP = 20;

export class ShadowBaker {
  private texture: THREE.DataTexture | null = null;
  private bounds = new THREE.Vector4(0, 0, 1, 1);

  build(
    _gameMap: GameMap,
    sunDir: THREE.Vector3,
    heightSampler: (wx: number, wz: number) => number | undefined,
  ): void {
    const sunNorm = sunDir.clone().normalize();
    const wb = computeWorldBounds();
    this.bounds.set(wb.minX, wb.minZ, wb.maxX, wb.maxZ);

    const rangeX = wb.maxX - wb.minX;
    const rangeZ = wb.maxZ - wb.minZ;

    const data = new Uint8Array(RESOLUTION * RESOLUTION * 4);

    const aoRays = buildAORays();

    const jitterDX = 0.6 * PENUMBRA_RADIUS;
    const jitterDZ = 0.8 * PENUMBRA_RADIUS;

    const getH = (wx: number, wz: number): number => heightSampler(wx, wz) ?? 0;

    for (let py = 0; py < RESOLUTION; py++) {
      const v = py / (RESOLUTION - 1);
      const wz = wb.minZ + v * rangeZ;

      for (let px = 0; px < RESOLUTION; px++) {
        const u = px / (RESOLUTION - 1);
        const wx = wb.minX + u * rangeX;
        const surfaceH = getH(wx, wz);

        // ---- R: Sun shadow (raymarched with penumbra) ----
        let litSum = 0;
        for (let s = 0; s < PENUMBRA_SAMPLES; s++) {
          const sampleX = s === 0 ? wx : wx + jitterDX;
          const sampleZ = s === 0 ? wz : wz + jitterDZ;
          const sampleH = s === 0 ? surfaceH : getH(sampleX, sampleZ);
          litSum += rayShadow(sampleX, sampleZ, sampleH, sunNorm, getH) ? 0 : 1;
        }
        const shadowFactor = litSum / PENUMBRA_SAMPLES;
        const shadowVal = SHADOW_MIN_BRIGHTNESS + shadowFactor * (1 - SHADOW_MIN_BRIGHTNESS);

        // ---- G: Ambient occlusion ----
        let aoBlocked = 0;
        for (let r = 0; r < AO_RAYS; r++) {
          const ray = aoRays[r];
          let occluded = false;
          for (let step = 1; step <= AO_STEPS; step++) {
            const t = step / AO_STEPS;
            const rx = wx + ray.dx * t * AO_RADIUS;
            const rz = wz + ray.dz * t * AO_RADIUS;
            const rh = surfaceH + AO_BIAS + ray.dy * t * AO_RADIUS;
            if (getH(rx, rz) > rh) {
              occluded = true;
              break;
            }
          }
          if (occluded) aoBlocked++;
        }
        const aoOpen = 1 - aoBlocked / AO_RAYS;
        const aoVal = AO_MIN + aoOpen * (1 - AO_MIN);

        // ---- B: Detail noise (3-octave FBM) ----
        let detailSum = 0;
        for (let o = 0; o < DETAIL_SCALES.length; o++) {
          const scale = DETAIL_SCALES[o];
          detailSum += fbm2D(wx * scale, wz * scale, GLOBAL_TERRAIN_SEED + 500 + o, 3) - 0.5;
        }
        const detailVal = 128 + detailSum * DETAIL_AMP;

        // ---- Write RGBA ----
        const idx = (py * RESOLUTION + px) * 4;
        data[idx] = Math.max(0, Math.min(255, Math.round(shadowVal * 255)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(aoVal * 255)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(detailVal)));
        data[idx + 3] = 255;
      }
    }

    this.texture = new THREE.DataTexture(
      data,
      RESOLUTION,
      RESOLUTION,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.DataTexture {
    if (!this.texture) throw new Error('ShadowBaker: call build() first');
    return this.texture;
  }

  getBounds(): THREE.Vector4 {
    return this.bounds;
  }

  dispose(): void {
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** March along sun direction; return true if occluded. */
function rayShadow(
  wx: number,
  wz: number,
  surfaceH: number,
  sunDir: THREE.Vector3,
  getH: (wx: number, wz: number) => number,
): boolean {
  for (let i = 1; i <= SHADOW_STEPS; i++) {
    const d = i * SHADOW_STEP_SIZE;
    const sx = wx + sunDir.x * d;
    const sz = wz + sunDir.z * d;
    const sh = surfaceH + sunDir.y * d;
    if (getH(sx, sz) > sh) return true;
  }
  return false;
}

interface AORay { dx: number; dy: number; dz: number }

function buildAORays(): AORay[] {
  const rays: AORay[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < AO_RAYS; i++) {
    const elevDeg = 15 + (90 - 15) * (i / (AO_RAYS - 1));
    const elevRad = (elevDeg * Math.PI) / 180;
    const azimuth = goldenAngle * i;

    const cosElev = Math.cos(elevRad);
    const sinElev = Math.sin(elevRad);

    rays.push({
      dx: Math.cos(azimuth) * cosElev,
      dy: sinElev,
      dz: Math.sin(azimuth) * cosElev,
    });
  }
  return rays;
}
