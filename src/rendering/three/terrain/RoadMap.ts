import * as THREE from 'three';
import type { RoadDef } from '@/data/roads';
import type { GameMap } from '@/core/map/GameMap';
import {
  HEX_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  UTAH_WEST,
  UTAH_NORTH,
  DEG_PER_HEX_LON,
  DEG_PER_HEX_LAT,
} from '@/constants';
import { hexToPixel } from '@/core/hex/HexUtils';

const TEX_SIZE = 2048;
const SQRT3 = Math.sqrt(3);

/**
 * Convert geographic (lon, lat) to world pixel coordinates using continuous hex math.
 */
function geoToWorldPixel(lon: number, lat: number): { x: number; z: number } {
  const q = (lon - UTAH_WEST) / DEG_PER_HEX_LON;
  const r = (UTAH_NORTH - lat) / DEG_PER_HEX_LAT;
  const x = -HEX_SIZE * 1.5 * q;
  const y = HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r);
  return { x, z: -y };
}

/** Compute the world-space bounding box of the hex map. */
function computeWorldBounds(): { minX: number; minZ: number; maxX: number; maxZ: number } {
  const origin = hexToPixel({ q: 0, r: 0 }, HEX_SIZE);
  const corner = hexToPixel({ q: MAP_WIDTH - 1, r: MAP_HEIGHT - 1 }, HEX_SIZE);
  const minX = Math.min(origin.x, corner.x) - HEX_SIZE;
  const maxX = Math.max(origin.x, corner.x) + HEX_SIZE;
  const minY = Math.min(origin.y, corner.y) - HEX_SIZE;
  const maxY = Math.max(origin.y, corner.y) + HEX_SIZE;
  return { minX, minZ: -maxY, maxX, maxZ: -minY };
}

/** Rasterizes roads into an R-channel SDF texture for the terrain shader. */
export class RoadMap {
  private texture: THREE.DataTexture | null = null;
  private bounds = new THREE.Vector4(0, 0, 1, 1);

  build(roads: RoadDef[], _gameMap: GameMap): void {
    const wb = computeWorldBounds();
    const rangeX = wb.maxX - wb.minX;
    const rangeZ = wb.maxZ - wb.minZ;
    // Bounds: (minX, minZ, 1/rangeX, 1/rangeZ) — shader does UV = (pos - min) * invRange
    this.bounds.set(wb.minX, wb.minZ, 1 / rangeX, 1 / rangeZ);

    const data = new Uint8Array(TEX_SIZE * TEX_SIZE);
    data.fill(0);

    const worldToTexX = (wx: number) => ((wx - wb.minX) / rangeX) * TEX_SIZE;
    const worldToTexZ = (wz: number) => ((wz - wb.minZ) / rangeZ) * TEX_SIZE;

    for (const road of roads) {
      // Convert waypoints to world coords via continuous hex math
      let worldPts = road.points.map(([lon, lat]) => {
        const w = geoToWorldPixel(lon, lat);
        return { x: w.x, z: w.z };
      });

      // Add gentle winding to long straight segments
      worldPts = addWinding(worldPts);

      const texPts = worldPts.map(p => ({
        x: worldToTexX(p.x),
        z: worldToTexZ(p.z),
      }));

      // Road half-width in texels (interstates wider, roads narrow)
      const baseWidth = road.width * 2.5;
      const halfWidth = (baseWidth * TEX_SIZE) / rangeX;
      // SDF search radius: road width + falloff zone
      const searchRadius = halfWidth + 6;

      for (let i = 0; i < texPts.length - 1; i++) {
        const p0 = texPts[i];
        const p1 = texPts[i + 1];

        const pad = searchRadius;
        const minX = Math.max(0, Math.floor(Math.min(p0.x, p1.x) - pad));
        const maxX = Math.min(TEX_SIZE - 1, Math.ceil(Math.max(p0.x, p1.x) + pad));
        const minZ = Math.max(0, Math.floor(Math.min(p0.z, p1.z) - pad));
        const maxZ = Math.min(TEX_SIZE - 1, Math.ceil(Math.max(p0.z, p1.z) + pad));

        for (let tz = minZ; tz <= maxZ; tz++) {
          for (let tx = minX; tx <= maxX; tx++) {
            const t = clampedProjection(p0.x, p0.z, p1.x, p1.z, tx + 0.5, tz + 0.5);
            const cx = p0.x + t * (p1.x - p0.x);
            const cz = p0.z + t * (p1.z - p0.z);
            const dist = Math.sqrt((tx + 0.5 - cx) ** 2 + (tz + 0.5 - cz) ** 2);

            // SDF: 0.5 = road edge, >0.5 = inside, <0.5 = outside
            // Map signed distance to [0, 255] with 128 = edge
            const signedDist = halfWidth - dist; // positive inside
            const sdfNorm = 128 + signedDist * 4;
            const sdfVal = Math.max(0, Math.min(255, Math.round(sdfNorm)));

            const idx = tz * TEX_SIZE + tx;
            if (sdfVal > data[idx]) {
              data[idx] = sdfVal;
            }
          }
        }
      }
    }

    this.texture = new THREE.DataTexture(
      data, TEX_SIZE, TEX_SIZE,
      THREE.RedFormat, THREE.UnsignedByteType,
    );
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.DataTexture {
    if (!this.texture) throw new Error('RoadMap not built');
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

// -- Helpers -----------------------------------------------------------------

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

/** Add gentle winding to long straight segments by offsetting midpoints. */
function addWinding(pts: { x: number; z: number }[]): { x: number; z: number }[] {
  if (pts.length < 2) return pts;
  const out: { x: number; z: number }[] = [pts[0]];

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const segLen = Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);

    // Only add winding to segments longer than 80 world units
    if (segLen > 80) {
      const mx = (a.x + b.x) * 0.5;
      const mz = (a.z + b.z) * 0.5;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const perpX = -dz / len;
      const perpZ = dx / len;
      const h = ((mx * 127.1 + mz * 311.7) % 1000) / 1000;
      const offset = (h - 0.5) * segLen * 0.05;
      out.push({ x: mx + perpX * offset, z: mz + perpZ * offset });
    }

    out.push(b);
  }

  return out;
}
