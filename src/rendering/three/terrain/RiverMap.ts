import * as THREE from 'three';
import type { WaterwayDef } from '@/data/rivers-detailed';
import type { GameMap } from '@/core/map/GameMap';
import { geoToWorld, computeWorldBounds } from '@/core/geo/GeoCoord';

import { getRiverColor } from '@/data/rivers';

const TEX_SIZE = 4096;

/** Rasterizes river paths into a 4096x4096 RGBA DataTexture for the terrain shader.
 *
 *  Channel encoding:
 *    R = river mask (0-255, antialiased)
 *    G = river ID (0-15, used for per-river color lookup in shader)
 *    B = flow angle (0-255 = 0-360 degrees)
 *    A = valley depth (0-255)
 */
export class RiverMap {
  private texture: THREE.DataTexture | null = null;
  private rawData: Uint8Array | null = null;
  private bounds = new THREE.Vector4(0, 0, 1, 1);
  private riverColors: [number, number, number][] = [];

  /** Get per-river color array for shader uniform. */
  /** Get per-river colors as THREE.Vector3 array for shader uniform vec3[16]. */
  getRiverColorsVec3Array(): THREE.Vector3[] {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      const c = this.riverColors[i] ?? [0.15, 0.42, 0.52];
      arr.push(new THREE.Vector3(c[0], c[1], c[2]));
    }
    return arr;
  }

  build(rivers: WaterwayDef[], _gameMap: GameMap): void {
    const wb = computeWorldBounds(20);
    const rangeX = wb.maxX - wb.minX;
    const rangeZ = wb.maxZ - wb.minZ;
    this.bounds.set(wb.minX, wb.minZ, 1 / rangeX, 1 / rangeZ);

    const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);

    // Build river color table (up to 16 rivers)
    this.riverColors = rivers.slice(0, 16).map(r =>
      r.color ?? getRiverColor(r.name)
    );

    const worldToTexX = (wx: number) => ((wx - wb.minX) / rangeX) * TEX_SIZE;
    const worldToTexZ = (wz: number) => ((wz - wb.minZ) / rangeZ) * TEX_SIZE;

    for (let ri = 0; ri < rivers.length; ri++) {
      const river = rivers[ri];
      const riverId = Math.min(ri, 15); // clamp to 0-15

      // Convert waypoints to world coords
      const worldPts = river.points.map(([lon, lat]) => {
        const w = geoToWorld(lon, lat);
        return { x: w.x, z: w.z };
      });

      // Adaptive Chaikin: only subdivide sparse segments
      let pts = worldPts;
      const avgSegLen = pathLength(worldPts) / Math.max(1, worldPts.length - 1);
      const chaikinPasses = avgSegLen > 100 ? 3 : avgSegLen > 30 ? 1 : 0;
      for (let pass = 0; pass < chaikinPasses; pass++) {
        pts = chaikinSubdivide(pts);
      }

      // Convert to texel coords
      const texPts = pts.map(p => ({
        x: worldToTexX(p.x),
        z: worldToTexZ(p.z),
      }));

      // River half-width in texels: use meter-based width or legacy relative width
      const widthWorld = river.widthMeters ?? (river.width * 180); // legacy: width*180 ≈ old behavior
      const baseHalfWidth = (widthWorld / 2) * TEX_SIZE / rangeX;
      const valleyDepth = Math.round((river.valleyDepth ?? 0) * 255);
      const totalLen = pathLength(texPts);

      // Rasterize each segment
      let cumLen = 0;
      for (let i = 0; i < texPts.length - 1; i++) {
        const p0 = texPts[i];
        const p1 = texPts[i + 1];

        const segLen = Math.sqrt((p1.x - p0.x) ** 2 + (p1.z - p0.z) ** 2);

        // Flow direction (normalized)
        const dx = p1.x - p0.x;
        const dz = p1.z - p0.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const flowX = len > 0 ? dx / len : 0;
        const flowZ = len > 0 ? dz / len : 0;

        // Flow angle encoded as 0-255 = 0-360 degrees
        const flowAngle = Math.atan2(flowZ, flowX);
        const flowAngleEnc = Math.round(((flowAngle + Math.PI) / (2 * Math.PI)) * 255);
        // River ID encoded as 0-255 (maps to 0-15 in shader via floor(g * 15/255))
        const riverIdEnc = Math.round(riverId * (255 / 15));

        // Bounding box in texels (with padding)
        const pad = baseHalfWidth + 2;
        const minX = Math.max(0, Math.floor(Math.min(p0.x, p1.x) - pad));
        const maxX = Math.min(TEX_SIZE - 1, Math.ceil(Math.max(p0.x, p1.x) + pad));
        const minZ = Math.max(0, Math.floor(Math.min(p0.z, p1.z) - pad));
        const maxZ = Math.min(TEX_SIZE - 1, Math.ceil(Math.max(p0.z, p1.z) + pad));

        for (let tz = minZ; tz <= maxZ; tz++) {
          for (let tx = minX; tx <= maxX; tx++) {
            // Closest point on segment to texel center
            const t = clampedProjection(p0.x, p0.z, p1.x, p1.z, tx + 0.5, tz + 0.5);
            const cx = p0.x + t * (p1.x - p0.x);
            const cz = p0.z + t * (p1.z - p0.z);
            const dist = Math.sqrt((tx + 0.5 - cx) ** 2 + (tz + 0.5 - cz) ** 2);

            // Source taper: first 15% from 30% to 100% width
            const paramAlongPath = (cumLen + t * segLen) / totalLen;
            let widthScale = 1.0;
            if (paramAlongPath < 0.15) {
              widthScale = 0.3 + 0.7 * (paramAlongPath / 0.15);
            }
            const hw = baseHalfWidth * widthScale;

            if (dist > hw + 1.5) continue;

            // Anti-aliased mask with 1.5-pixel soft falloff
            let mask: number;
            if (dist <= hw - 1.5) {
              mask = 255;
            } else if (dist >= hw + 1.5) {
              mask = 0;
            } else {
              mask = Math.round(255 * (1 - (dist - (hw - 1.5)) / 3.0));
            }

            // Take max at confluences
            const idx = (tz * TEX_SIZE + tx) * 4;
            if (mask > data[idx]) {
              data[idx] = mask;            // R: river mask
              data[idx + 1] = riverIdEnc;  // G: river ID (for per-river color lookup)
              data[idx + 2] = flowAngleEnc;// B: flow direction angle
              data[idx + 3] = valleyDepth; // A: valley depth
            }
          }
        }

        cumLen += segLen;
      }
    }

    // Single-pass 3x3 Gaussian blur on R channel
    gaussianBlurR(data, TEX_SIZE);

    this.rawData = data;

    this.texture = new THREE.DataTexture(
      data, TEX_SIZE, TEX_SIZE,
      THREE.RGBAFormat, THREE.UnsignedByteType,
    );
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.DataTexture {
    if (!this.texture) throw new Error('RiverMap not built');
    return this.texture;
  }

  getBounds(): THREE.Vector4 {
    return this.bounds;
  }

  /** Returns the raw RGBA data buffer for valley carving in TerrainMeshBuilder. */
  getRawData(): Uint8Array {
    if (!this.rawData) throw new Error('RiverMap not built');
    return this.rawData;
  }

  dispose(): void {
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    this.rawData = null;
  }
}

// -- Helpers -----------------------------------------------------------------

function chaikinSubdivide(pts: { x: number; z: number }[]): { x: number; z: number }[] {
  if (pts.length < 2) return pts;
  const out: { x: number; z: number }[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    out.push({ x: a.x * 0.75 + b.x * 0.25, z: a.z * 0.75 + b.z * 0.25 });
    out.push({ x: a.x * 0.25 + b.x * 0.75, z: a.z * 0.25 + b.z * 0.75 });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function pathLength(pts: { x: number; z: number }[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.sqrt((pts[i].x - pts[i - 1].x) ** 2 + (pts[i].z - pts[i - 1].z) ** 2);
  }
  return len;
}

function clampedProjection(
  ax: number, az: number, bx: number, bz: number,
  px: number, pz: number,
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const abLen2 = abx * abx + abz * abz;
  if (abLen2 < 1e-8) return 0;
  const t = ((px - ax) * abx + (pz - az) * abz) / abLen2;
  return Math.max(0, Math.min(1, t));
}

function gaussianBlurR(data: Uint8Array, size: number): void {
  const temp = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    temp[i] = data[i * 4];
  }
  const w = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      let sum = 0;
      let ki = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += temp[(y + dy) * size + (x + dx)] * w[ki++];
        }
      }
      data[(y * size + x) * 4] = Math.round(sum / 16);
    }
  }
}
