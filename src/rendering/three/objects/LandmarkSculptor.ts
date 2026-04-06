/**
 * LandmarkSculptor.ts — Custom height and tint sculpting for Utah's iconic formations.
 *
 * Each landmark has a geographic center, radius, height function, and optional tint.
 * applyToTerrain() modifies a Float32Array height grid and per-vertex color arrays
 * for chunk geometries that overlap each landmark's radius.
 *
 * Heights are ADDITIONAL (added on top of base terrain from the real heightmap).
 * Tints return [r, g, b, strength] to blend with existing vertex colors.
 */

import { GRID_SPACING, SQRT3 } from '@/constants';
import { geoToWorld } from '@/core/geo/GeoCoord';

// ── Height Profile Helpers ──────────────────────────────────────────────────

/** Linear cone falloff */
function cone(dist: number, radius: number, height: number): number {
  if (dist >= radius) return 0;
  return height * (1 - dist / radius);
}

/** Hemispherical dome */
function dome(dist: number, radius: number, height: number): number {
  if (dist >= radius) return 0;
  const t = dist / radius;
  return height * Math.sqrt(1 - t * t);
}

/** Gaussian spire — sigma = radius */
function spire(dist: number, sigma: number, height: number): number {
  return height * Math.exp(-(dist * dist) / (2 * sigma * sigma));
}

/** Flat-topped mesa with power-function cliff edges */
function mesa(dist: number, radius: number, height: number, edgeSharpness: number): number {
  if (dist >= radius) return 0;
  const t = dist / radius;
  if (t < 0.6) return height;
  const edgeT = (t - 0.6) / 0.4;
  return height * Math.pow(1 - edgeT, edgeSharpness);
}

/** Linear ridge along a given angle */
function ridge(dx: number, dz: number, width: number, height: number, angle: number): number {
  const perpX = -Math.sin(angle);
  const perpZ = Math.cos(angle);
  const perpDist = Math.abs(dx * perpX + dz * perpZ);
  if (perpDist >= width) return 0;
  const t = perpDist / width;
  return height * Math.exp(-3 * t * t);
}

/** Crater with rim and central depression */
function crater(dist: number, innerR: number, outerR: number, rimH: number, depth: number): number {
  if (dist >= outerR) return 0;
  if (dist <= innerR) {
    const t = dist / innerR;
    return -depth * (1 - t * t);
  }
  const rimT = (dist - innerR) / (outerR - innerR);
  return rimH * Math.sin(rimT * Math.PI);
}

// ── Seeded noise for procedural element placement ───────────────────────────

function hashNoise(x: number, z: number, seed: number): number {
  let h = seed + x * 374761393 + z * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

/** Deterministic position generator for spire/hoodoo fields */
function hashPositions(count: number, seed: number, spreadRadius: number): { x: number; z: number; h: number; s: number }[] {
  const positions: { x: number; z: number; h: number; s: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = ((seed + i * 137.508) % 360) * (Math.PI / 180);
    const r = spreadRadius * 0.15 + spreadRadius * 0.85 * hashNoise(i, seed, 31337 + i * 7);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = hashNoise(i * 3, seed, 77231);
    const s = hashNoise(i * 7, seed, 44917);
    positions.push({ x, z, h, s });
  }
  return positions;
}

// ── Interface ───────────────────────────────────────────────────────────────

export interface LandmarkConfig {
  name: string;
  lon: number;
  lat: number;
  radius: number; // in hex units (converted to world units internally)
  heightFn: (dx: number, dz: number, dist: number, worldX: number, worldZ: number) => number;
  tintFn?: (dx: number, dz: number, dist: number) => [number, number, number, number] | null;
}

// ── Landmark Definitions ────────────────────────────────────────────────────

// Radius conversion: landmark radius in hex units → world units
// Old HEX_SIZE=20, so this is 20 * sqrt(3) ≈ 34.64
const HEX_WORLD_SCALE = 20 * SQRT3;

// Pre-compute procedural positions for spire/hoodoo fields
const BRYCE_SPIRES = hashPositions(18, 7723, 28);
const NEEDLES_SPIRES = hashPositions(15, 8812, 22);
const GOBLIN_MUSHROOMS = hashPositions(10, 9102, 18);
const FISHER_TOWERS = hashPositions(6, 6613, 15);
const KODACHROME_PIPES = hashPositions(8, 3319, 14);
const CEDAR_BREAKS_SPIRES = hashPositions(14, 4451, 25);
const MONUMENT_VALLEY_POSITIONS = [
  // West Mitten, East Mitten, Merrick Butte — fixed iconic positions
  { x: -18, z: -4, h: 12, s: 6.0 },
  { x: 4, z: -2, h: 10, s: 5.5 },
  { x: 16, z: 8, h: 8, s: 5.0 },
];

export const LANDMARK_CONFIGS: LandmarkConfig[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // NATIONAL PARKS — HIGHEST PRIORITY
  // ════════════════════════════════════════════════════════════════════════════

  // ── 1. Zion Canyon ────────────────────────────────────────────────────────
  // Deep narrow slot canyon cutting through massive Navajo Sandstone walls
  // Two parallel cliff walls (1000m tall) with narrow canyon floor between
  {
    name: 'Zion Canyon',
    lon: -112.95, lat: 37.25, radius: 3,
    heightFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      // Canyon axis runs roughly N-S (slight NNE tilt)
      const canyonAngle = Math.PI * 0.08;
      const ca = Math.cos(canyonAngle), sa = Math.sin(canyonAngle);
      // Perpendicular distance from canyon axis
      const perp = dx * (-sa) + dz * ca;
      // Along-canyon distance for length fade
      const along = dx * ca + dz * sa;
      const alongFade = Math.max(0, 1 - Math.abs(along) / (R * 0.9));

      const canyonHalfWidth = 8; // narrow canyon
      const absPerp = Math.abs(perp);

      if (absPerp < canyonHalfWidth) {
        // Canyon floor: depressed below rim
        const floorDepth = -18 * (1 - absPerp / canyonHalfWidth);
        return floorDepth * alongFade;
      }
      // Cliff walls: near-vertical using power function
      const wallDist = absPerp - canyonHalfWidth;
      const wallWidth = 20;
      if (wallDist < wallWidth) {
        // Steep sigmoid cliff rising from canyon to rim
        const wallT = wallDist / wallWidth;
        const wallH = 14 * Math.pow(wallT, 0.15); // very steep near base, levels off at rim
        return wallH * alongFade;
      }
      // Beyond walls: gentle rim slope
      const rimDist = absPerp - canyonHalfWidth - wallWidth;
      const rimFade = Math.max(0, 1 - rimDist / 15);
      return 14 * rimFade * alongFade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const canyonAngle = Math.PI * 0.08;
      const ca = Math.cos(canyonAngle), sa = Math.sin(canyonAngle);
      const perp = dx * (-sa) + dz * ca;
      const absPerp = Math.abs(perp);
      const canyonHalfWidth = 8;

      if (absPerp < canyonHalfWidth * 0.6) {
        // Dark canyon floor — Kayenta Formation red at base
        return [0.35, 0.25, 0.19, 0.75];
      }
      if (absPerp < canyonHalfWidth) {
        // Red Kayenta layer transition
        return [0.63, 0.27, 0.16, 0.7];
      }
      if (absPerp < canyonHalfWidth + 20) {
        // Cream-white Navajo sandstone walls
        const wallFrac = (absPerp - canyonHalfWidth) / 20;
        const r = 0.63 + wallFrac * 0.31;
        const g = 0.27 + wallFrac * 0.61;
        const b = 0.16 + wallFrac * 0.66;
        return [r, g, b, 0.7];
      }
      // Rim: Navajo cream-white
      return [0.94, 0.88, 0.82, 0.5];
    },
  },

  // ── 2. Bryce Canyon Amphitheater ──────────────────────────────────────────
  // Hundreds of tall narrow hoodoo spires in a semicircular amphitheater bowl
  // Flat plateau rim on west, spires descending eastward
  {
    name: 'Bryce Amphitheater',
    lon: -112.17, lat: 37.63, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Amphitheater: bowl opening to the east
      // West side = plateau rim (elevated), east side = spire field (lower)
      const rimGrad = -dx / R; // 0 at center, positive going west
      const plateauH = Math.max(0, rimGrad) * 10;

      // Amphitheater bowl depression in east half
      const bowlDepth = dx > 0 ? -4 * Math.min(1, dx / (R * 0.5)) : 0;

      // Hoodoo spires — 18 procedural spires in the bowl area
      let spireH = 0;
      for (const sp of BRYCE_SPIRES) {
        const sdx = dx - sp.x;
        const sdz = dz - sp.z;
        const sd = Math.sqrt(sdx * sdx + sdz * sdz);
        const sigma = 1.0 + sp.s * 0.5; // narrow sigma for hoodoos
        const h = 3 + sp.h * 5; // 3-8 world units
        const g = h * Math.exp(-(sd * sd) / (2 * sigma * sigma));
        if (g > spireH) spireH = g;
      }

      return (plateauH + bowlDepth + spireH) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Check proximity to spire for tip/base coloring
      let nearestSpireDist = 999;
      let nearestSpireH = 0;
      for (const sp of BRYCE_SPIRES) {
        const sdx = dx - sp.x;
        const sdz = dz - sp.z;
        const sd = Math.sqrt(sdx * sdx + sdz * sdz);
        if (sd < nearestSpireDist) {
          nearestSpireDist = sd;
          nearestSpireH = 3 + sp.h * 5;
        }
      }

      if (nearestSpireDist < 2.5) {
        // On a spire — Claron Formation orange-pink-white banding
        const heightFrac = Math.max(0, 1 - nearestSpireDist / 2.5);
        if (heightFrac > 0.7) {
          // Spire tip: lighter cream-white
          return [0.94, 0.75, 0.50, 0.75];
        }
        // Spire body: orange-pink
        return [0.77, 0.32, 0.13, 0.7];
      }

      // West plateau rim: dark conifer forest
      if (dx < -5) {
        return [0.18, 0.35, 0.24, 0.55];
      }

      // Amphitheater floor
      return [0.88, 0.55, 0.35, 0.5];
    },
  },

  // ── 3. Arches NP — Windows & Fins ────────────────────────────────────────
  // Parallel sandstone fins (thin vertical walls) with gaps between them
  // 8-10 parallel ridges oriented NW-SE, sharp peaks
  {
    name: 'Arches — Fiery Furnace Fins',
    lon: -109.57, lat: 38.73, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Fin orientation: NW-SE (~135 degrees)
      const finAngle = Math.PI * 0.75;
      const ca = Math.cos(finAngle), sa = Math.sin(finAngle);
      // Perpendicular distance to fin planes
      const perpDist = dx * (-sa) + dz * ca;

      // Create 9 parallel fins with tight spacing
      const finSpacing = 5.5;
      const finPhase = perpDist / finSpacing;
      const finFrac = finPhase - Math.floor(finPhase);

      // Sharp peaks: use high-power sin for fin sharpness
      const finProfile = Math.pow(Math.max(0, Math.sin(finFrac * Math.PI)), 6);
      const finHeight = 3 + 3 * hashNoise(Math.floor(finPhase), 0, 55102); // 3-6 wu

      return finHeight * finProfile * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const finAngle = Math.PI * 0.75;
      const ca = Math.cos(finAngle), sa = Math.sin(finAngle);
      const perpDist = dx * (-sa) + dz * ca;
      const finSpacing = 5.5;
      const finFrac = (perpDist / finSpacing) - Math.floor(perpDist / finSpacing);
      const finProfile = Math.pow(Math.max(0, Math.sin(finFrac * Math.PI)), 6);

      if (finProfile > 0.3) {
        // On a fin: Entrada salmon-orange
        // South faces get desert varnish
        const southFacing = dz > 0 ? 0.4 : 0;
        return [0.83 - southFacing * 0.6, 0.44 - southFacing * 0.32, 0.22 - southFacing * 0.16, 0.7];
      }
      // Between fins: desert floor
      return [0.85, 0.75, 0.60, 0.4];
    },
  },

  // ── 4. Canyonlands — Island in the Sky ────────────────────────────────────
  // Dramatic flat-topped mesa with 300m vertical cliff drop on all sides
  {
    name: 'Island in the Sky',
    lon: -109.82, lat: 38.46, radius: 3,
    heightFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Mesa plateau: flat top with steep sigmoid cliff edges
      const mesaRadius = R * 0.55;
      if (dist < mesaRadius * 0.85) {
        // Flat mesa top — 10 wu above surroundings
        return 10;
      }
      if (dist < mesaRadius) {
        // Very steep cliff edge: power-8 falloff
        const edgeT = (dist - mesaRadius * 0.85) / (mesaRadius * 0.15);
        return 10 * Math.pow(1 - edgeT, 8);
      }
      // Canyon floor around the mesa: depressed
      const floorDist = (dist - mesaRadius) / (R - mesaRadius);
      return -4 * Math.max(0, 1 - floorDist);
    },
    tintFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const mesaRadius = R * 0.55;

      if (dist < mesaRadius * 0.85) {
        // Mesa top: grey-tan desert with sparse sage
        return [0.75, 0.72, 0.63, 0.5];
      }
      if (dist < mesaRadius) {
        // Cliff face: red-brown Wingate sandstone
        return [0.63, 0.27, 0.16, 0.8];
      }
      // Canyon floor: dark shadowed
      return [0.38, 0.28, 0.22, 0.6];
    },
  },

  // ── 5. Canyonlands — The Needles ──────────────────────────────────────────
  // Dense cluster of red-and-white banded sandstone spires, narrower than Bryce
  {
    name: 'The Needles',
    lon: -109.75, lat: 38.05, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Dense cluster of needle-like spires
      let best = 0;
      for (const sp of NEEDLES_SPIRES) {
        const sdx = dx - sp.x;
        const sdz = dz - sp.z;
        const sd = Math.sqrt(sdx * sdx + sdz * sdz);
        // Very narrow sigma for needle shapes
        const sigma = 0.7 + sp.s * 0.3;
        const h = 4 + sp.h * 6; // 4-10 wu
        const g = h * Math.exp(-(sd * sd) / (2 * sigma * sigma));
        if (g > best) best = g;
      }

      return best * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Find nearest spire
      let nearestDist = 999;
      let nearestH = 0;
      for (const sp of NEEDLES_SPIRES) {
        const sdx = dx - sp.x;
        const sdz = dz - sp.z;
        const sd = Math.sqrt(sdx * sdx + sdz * sdz);
        if (sd < nearestDist) {
          nearestDist = sd;
          nearestH = 4 + sp.h * 6;
        }
      }

      if (nearestDist < 2.0) {
        // Red-white horizontal banding — Cedar Mesa Sandstone
        // Use sin of effective height for alternating bands
        const effectiveH = nearestH * (1 - nearestDist / 2.0);
        const band = Math.sin(effectiveH * 2.5) * 0.5 + 0.5;
        // Alternate between red and white
        const r = 0.69 + band * 0.22; // 0.69 - 0.91
        const g = 0.19 + band * 0.66; // 0.19 - 0.85
        const b = 0.13 + band * 0.62; // 0.13 - 0.75
        return [r, g, b, 0.7];
      }
      // Floor: desert tan
      return [0.82, 0.72, 0.55, 0.4];
    },
  },

  // ── 6. Capitol Reef — Waterpocket Fold ────────────────────────────────────
  // 100-mile monocline: west side high, east side low, sharp fold between
  // Elongated N-S linear feature
  {
    name: 'Waterpocket Fold',
    lon: -111.15, lat: 38.20, radius: 3,
    heightFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Fold axis runs N-S (slight NNE)
      const foldAngle = Math.PI * 0.05;
      const ca = Math.cos(foldAngle), sa = Math.sin(foldAngle);
      // Perpendicular: positive = west (high side), negative = east (low side)
      const perp = dx * (-sa) + dz * ca;
      // Along-fold distance for length fading
      const along = dx * ca + dz * sa;
      const alongFade = Math.max(0, 1 - Math.abs(along) / (R * 0.95));

      // Asymmetric step: sharp sigmoid transition
      const foldWidth = 12;
      if (perp > foldWidth) {
        // West (high) side — elevated plateau
        return 8 * alongFade;
      }
      if (perp > -foldWidth) {
        // The fold face — sharp sigmoid transition
        const t = (perp + foldWidth) / (2 * foldWidth);
        // Steep sigmoid
        const sigT = 1 / (1 + Math.exp(-10 * (t - 0.5)));
        return 8 * sigT * alongFade;
      }
      // East (low) side — depressed
      const lowFade = Math.max(0, 1 - (-perp - foldWidth) / 20);
      return -3 * lowFade * alongFade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const foldAngle = Math.PI * 0.05;
      const ca = Math.cos(foldAngle), sa = Math.sin(foldAngle);
      const perp = dx * (-sa) + dz * ca;
      const foldWidth = 12;

      if (perp > foldWidth) {
        // West plateau: Navajo white on top
        return [0.94, 0.91, 0.86, 0.55];
      }
      if (perp > 0) {
        // Upper fold face: Navajo white transitioning to Wingate red
        const t = perp / foldWidth;
        return [0.94 - t * 0.39, 0.91 - t * 0.68, 0.86 - t * 0.76, 0.65];
      }
      if (perp > -foldWidth) {
        // Lower fold face: Wingate dark red
        return [0.55, 0.23, 0.10, 0.7];
      }
      // Below fold: Chinle purple at base
      return [0.42, 0.25, 0.38, 0.5];
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MONUMENT VALLEY & SE UTAH
  // ════════════════════════════════════════════════════════════════════════════

  // ── 7. Monument Valley Buttes ─────────────────────────────────────────────
  // West Mitten, East Mitten, Merrick Butte — 3 iconic buttes on flat desert floor
  {
    name: 'Monument Valley Buttes',
    lon: -110.10, lat: 37.00, radius: 3,
    heightFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      let best = 0;
      for (const butte of MONUMENT_VALLEY_POSITIONS) {
        const bdx = dx - butte.x;
        const bdz = dz - butte.z;
        const bd = Math.sqrt(bdx * bdx + bdz * bdz);
        const butteRadius = butte.s;
        if (bd < butteRadius) {
          // Flat top with power-8 vertical walls
          const t = bd / butteRadius;
          let h: number;
          if (t < 0.55) {
            h = butte.h; // flat top
          } else {
            const edgeT = (t - 0.55) / 0.45;
            h = butte.h * Math.pow(1 - edgeT, 8); // near-vertical cliff
          }
          if (h > best) best = h;
        }
      }
      return best;
    },
    tintFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Check if on a butte
      for (const butte of MONUMENT_VALLEY_POSITIONS) {
        const bdx = dx - butte.x;
        const bdz = dz - butte.z;
        const bd = Math.sqrt(bdx * bdx + bdz * bdz);
        if (bd < butte.s) {
          const t = bd / butte.s;
          if (t > 0.5) {
            // Cliff walls: deep De Chelly red with desert varnish streaks
            const varnish = hashNoise(Math.floor(dx * 0.5), Math.floor(dz * 0.8), 22017);
            if (varnish > 0.75) {
              return [0.25, 0.15, 0.08, 0.75]; // dark desert varnish
            }
            return [0.66, 0.19, 0.13, 0.8]; // De Chelly red
          }
          // Flat top: slightly lighter red-brown
          return [0.72, 0.32, 0.20, 0.65];
        }
      }
      // Desert floor: golden sand
      return [0.85, 0.75, 0.60, 0.45];
    },
  },

  // ── 8. Dead Horse Point ───────────────────────────────────────────────────
  // Narrow mesa peninsula with dramatic overlook, river canyon below on three sides
  {
    name: 'Dead Horse Point',
    lon: -109.74, lat: 38.46, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Mesa finger extending to the south-southeast
      const fingerAngle = Math.PI * -0.4;
      const ca = Math.cos(fingerAngle), sa = Math.sin(fingerAngle);
      const along = dx * ca + dz * sa;
      const perp = Math.abs(dx * (-sa) + dz * ca);

      // Narrow peninsula: wider at base (north), narrows to point
      const fingerWidth = Math.max(2, 8 - along * 0.3);
      const onFinger = perp < fingerWidth && along > -R * 0.4 && along < R * 0.6;

      if (onFinger) {
        // Flat mesa top
        const edgeDist = fingerWidth - perp;
        if (edgeDist < 2) {
          // Cliff edge
          return 8 * Math.pow(edgeDist / 2, 0.3);
        }
        return 8;
      }
      // Canyon below: depressed
      if (dist < R * 0.8) {
        return -6 * Math.max(0, 1 - dist / (R * 0.8));
      }
      return 0;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const fingerAngle = Math.PI * -0.4;
      const ca = Math.cos(fingerAngle), sa = Math.sin(fingerAngle);
      const along = dx * ca + dz * sa;
      const perp = Math.abs(dx * (-sa) + dz * ca);
      const fingerWidth = Math.max(2, 8 - along * 0.3);
      const onFinger = perp < fingerWidth && along > -R * 0.4 && along < R * 0.6;

      if (onFinger) {
        // Red-brown Cutler sandstone mesa
        return [0.69, 0.28, 0.19, 0.7];
      }
      // Canyon floor with faint river
      const riverDist = Math.abs(perp - 3);
      if (riverDist < 2 && along > 0) {
        return [0.17, 0.28, 0.41, 0.65]; // dark blue river
      }
      return [0.42, 0.32, 0.24, 0.55]; // shadowed canyon
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CANYONS
  // ════════════════════════════════════════════════════════════════════════════

  // ── 9. Zion Narrows ───────────────────────────────────────────────────────
  // World's narrowest slot canyon — 600m walls, 6m wide at bottom
  {
    name: 'Zion Narrows',
    lon: -112.95, lat: 37.34, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Extreme V-cut: canyon axis N-S
      const canyonAngle = Math.PI * 0.05;
      const perp = dx * (-Math.sin(canyonAngle)) + dz * Math.cos(canyonAngle);
      const absPerp = Math.abs(perp);

      // Power-12 near-vertical walls with tiny floor gap
      const floorWidth = 2.5; // very narrow
      if (absPerp < floorWidth) {
        // Slot canyon floor — deeply depressed
        return -15 * (1 - absPerp / floorWidth) * fade;
      }
      // Near-vertical walls rising back up
      const wallDist = absPerp - floorWidth;
      const wallWidth = 14;
      if (wallDist < wallWidth) {
        const wallT = wallDist / wallWidth;
        // Power-12 creates near-vertical profile
        const wallH = -15 + 20 * Math.pow(wallT, 0.08);
        return wallH * fade;
      }
      return 5 * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const perp = Math.abs(dx * (-Math.sin(0.05 * Math.PI)) + dz * Math.cos(0.05 * Math.PI));
      if (perp < 2.5) {
        // Dark wet walls at bottom
        return [0.23, 0.19, 0.16, 0.8];
      }
      if (perp < 10) {
        // Transition zone
        const t = (perp - 2.5) / 7.5;
        return [0.23 + t * 0.71, 0.19 + t * 0.72, 0.16 + t * 0.70, 0.7];
      }
      // White Navajo at top
      return [0.94, 0.91, 0.86, 0.55];
    },
  },

  // ── 10. Glen Canyon / Lake Powell ─────────────────────────────────────────
  // Drowned canyon with turquoise water between red sandstone walls
  {
    name: 'Glen Canyon — Lake Powell',
    lon: -110.82, lat: 37.10, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Canyon running roughly SW-NE
      const canyonAngle = Math.PI * 0.3;
      const ca = Math.cos(canyonAngle), sa = Math.sin(canyonAngle);
      const perp = Math.abs(dx * (-sa) + dz * ca);

      // Terraced canyon walls stepping down to water level
      const canyonWidth = 20;
      if (perp < canyonWidth * 0.3) {
        // Water level (lake surface) — flat depression
        return -8 * fade;
      }
      if (perp < canyonWidth * 0.5) {
        // First terrace
        const t = (perp - canyonWidth * 0.3) / (canyonWidth * 0.2);
        return (-8 + 4 * Math.pow(t, 0.2)) * fade;
      }
      if (perp < canyonWidth * 0.7) {
        // Second terrace
        const t = (perp - canyonWidth * 0.5) / (canyonWidth * 0.2);
        return (-4 + 6 * Math.pow(t, 0.2)) * fade;
      }
      if (perp < canyonWidth) {
        // Third terrace to rim
        const t = (perp - canyonWidth * 0.7) / (canyonWidth * 0.3);
        return (2 + 5 * Math.pow(t, 0.3)) * fade;
      }
      // Rim plateau
      const rimFade = Math.max(0, 1 - (perp - canyonWidth) / 15);
      return 7 * rimFade * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const canyonAngle = Math.PI * 0.3;
      const perp = Math.abs(dx * (-Math.sin(canyonAngle)) + dz * Math.cos(canyonAngle));
      const canyonWidth = 20;

      if (perp < canyonWidth * 0.3) {
        // Turquoise water
        return [0.25, 0.63, 0.69, 0.75];
      }
      if (perp < canyonWidth * 0.5) {
        // Navajo sandstone lower walls
        return [0.88, 0.78, 0.63, 0.65];
      }
      if (perp < canyonWidth * 0.7) {
        // Red Wingate below
        return [0.63, 0.25, 0.19, 0.7];
      }
      // Upper walls and rim
      return [0.88, 0.78, 0.63, 0.5];
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // UNIQUE FORMATIONS
  // ════════════════════════════════════════════════════════════════════════════

  // ── 11. Goblin Valley ─────────────────────────────────────────────────────
  // Mushroom-shaped hoodoos — wide caps on narrow stems
  {
    name: 'Goblin Valley',
    lon: -110.70, lat: 38.56, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      let best = 0;
      for (const gob of GOBLIN_MUSHROOMS) {
        const gdx = dx - gob.x;
        const gdz = dz - gob.z;
        const gd = Math.sqrt(gdx * gdx + gdz * gdz);

        const gobH = 3 + gob.h * 4; // 3-7 wu
        const stemR = 0.8 + gob.s * 0.3; // narrow stem
        const capR = stemR * 2.2; // wide cap

        // Mushroom shape: narrow stem + wider cap offset upward
        if (gd < capR) {
          let h: number;
          if (gd < stemR) {
            // Full height within stem
            h = gobH;
          } else {
            // Cap extends beyond stem but at ~90% height, tapers down
            const capT = (gd - stemR) / (capR - stemR);
            h = gobH * 0.9 * Math.max(0, 1 - capT);
          }
          if (h > best) best = h;
        }
      }
      return best * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Check if on a goblin
      for (const gob of GOBLIN_MUSHROOMS) {
        const gdx = dx - gob.x;
        const gdz = dz - gob.z;
        const gd = Math.sqrt(gdx * gdx + gdz * gdz);
        const capR = (0.8 + gob.s * 0.3) * 2.2;
        if (gd < capR) {
          // Tan-grey Entrada sandstone
          return [0.75, 0.66, 0.53, 0.65];
        }
      }
      // Desert floor
      return [0.82, 0.72, 0.55, 0.4];
    },
  },

  // ── 12. Delicate Arch ─────────────────────────────────────────────────────
  // Single freestanding arch — curved bridge shape
  {
    name: 'Delicate Arch',
    lon: -109.50, lat: 38.74, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Two pillars connected by a curved bridge overhead
      // Pillar 1 (left leg)
      const p1x = dx + 5, p1z = dz;
      const p1d = Math.sqrt(p1x * p1x + p1z * p1z);
      const pillar1 = spire(p1d, 2.0, 8);

      // Pillar 2 (right leg)
      const p2x = dx - 5, p2z = dz;
      const p2d = Math.sqrt(p2x * p2x + p2z * p2z);
      const pillar2 = spire(p2d, 2.0, 8);

      // Bridge connecting tops: arch curve between pillars
      const bridgeX = dx; // centered
      const bridgeDist = Math.abs(dz); // perpendicular to bridge
      const bridgeSpan = 10;
      const bridgeCurve = Math.max(0, 1 - (bridgeX * bridgeX) / ((bridgeSpan / 2) * (bridgeSpan / 2)));
      const archHeight = 8 * bridgeCurve;
      const bridgeThickness = 1.5;
      const bridge = bridgeDist < bridgeThickness && Math.abs(bridgeX) < bridgeSpan / 2
        ? archHeight * Math.exp(-(bridgeDist * bridgeDist) / (bridgeThickness * bridgeThickness))
        : 0;

      // Gap under the arch: depressed area
      const underArch = Math.abs(bridgeX) < 4 && bridgeDist < 3 && pillar1 < 1 && pillar2 < 1
        ? -2
        : 0;

      return (Math.max(pillar1, pillar2, bridge) + underArch) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Warm Entrada salmon on the arch
      const p1d = Math.sqrt((dx + 5) * (dx + 5) + dz * dz);
      const p2d = Math.sqrt((dx - 5) * (dx - 5) + dz * dz);
      const onArch = p1d < 3 || p2d < 3 || (Math.abs(dz) < 2 && Math.abs(dx) < 5);
      if (onArch) {
        return [0.83, 0.44, 0.22, 0.7];
      }
      return [0.80, 0.65, 0.48, 0.4];
    },
  },

  // ── 13. Bonneville Salt Flats ─────────────────────────────────────────────
  // Perfectly flat white expanse — THE flattest place in the Western Hemisphere
  {
    name: 'Bonneville Salt Flats',
    lon: -113.85, lat: 40.73, radius: 3,
    heightFn: (_dx, _dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);
      // Flatten to 0: negate any base terrain variation by pushing down
      return -3 * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 3 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const fade = Math.max(0, 1 - dist / (R * 0.95));

      // Voronoi-based hexagonal crack pattern
      const scale = 0.08;
      const hx = dx * scale;
      const hz = dz * scale;
      // Approximate hexagonal grid for crack pattern
      const hexY = hz / 0.866;
      const hexRow = Math.round(hexY);
      const offset = hexRow % 2 === 0 ? 0 : 0.5;
      const hexX = hx - offset;
      const hexCol = Math.round(hexX);
      const cx = hexCol + offset;
      const cy = hexRow * 0.866;
      const hexDist = Math.sqrt((hx - cx) * (hx - cx) + (hz - cy) * (hz - cy));

      // Cracks at cell boundaries
      const isCrack = hexDist > 0.38;
      if (isCrack) {
        // Darker crack lines
        return [0.85, 0.83, 0.78, 0.65 * fade];
      }
      // Brilliant white salt surface
      return [0.94, 0.93, 0.89, 0.75 * fade];
    },
  },

  // ── 14. Coral Pink Sand Dunes ─────────────────────────────────────────────
  // Pink sand dunes against red cliff backdrop, asymmetric dune ridges
  {
    name: 'Coral Pink Sand Dunes',
    lon: -112.73, lat: 37.04, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Asymmetric dune ridges: gentle windward (SW), steep lee (NE)
      // Wind direction roughly from SW
      const windAngle = Math.PI * 0.25;
      const ca = Math.cos(windAngle), sa = Math.sin(windAngle);
      const windward = dx * ca + dz * sa;

      // Multiple dune ridges with directional asymmetry
      const duneSpacing = 7;
      const dunePhase = windward / duneSpacing;
      const duneFrac = dunePhase - Math.floor(dunePhase);

      let duneH: number;
      if (duneFrac < 0.7) {
        // Gentle windward slope
        duneH = 5 * (duneFrac / 0.7);
      } else {
        // Steep lee slope (avalanche face)
        const leeT = (duneFrac - 0.7) / 0.3;
        duneH = 5 * (1 - leeT * leeT);
      }

      // Cross-wind variation
      const crossWind = dx * (-sa) + dz * ca;
      const crossMod = 0.7 + 0.3 * Math.sin(crossWind * 0.3);

      return duneH * crossMod * fade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      // Coral pink sand
      return [0.88, 0.63, 0.53, 0.65];
    },
  },

  // ── 15. Fisher Towers ─────────────────────────────────────────────────────
  // Tall thin dark-red mud towers eroded from Cutler Formation
  {
    name: 'Fisher Towers',
    lon: -109.30, lat: 38.72, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      let best = 0;
      for (const ft of FISHER_TOWERS) {
        const fdx = dx - ft.x;
        const fdz = dz - ft.z;
        const fd = Math.sqrt(fdx * fdx + fdz * fdz);
        // Very narrow, very tall
        const sigma = 0.6 + ft.s * 0.2; // 0.6-0.8
        const h = 8 + ft.h * 4; // 8-12 wu
        const g = h * Math.exp(-(fd * fd) / (2 * sigma * sigma));
        if (g > best) best = g;
      }
      return best * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Check if on a tower
      for (const ft of FISHER_TOWERS) {
        const fdx = dx - ft.x;
        const fdz = dz - ft.z;
        const fd = Math.sqrt(fdx * fdx + fdz * fdz);
        if (fd < 2.0) {
          // Dark maroon-red Cutler sandstone
          return [0.48, 0.16, 0.09, 0.75];
        }
      }
      return [0.72, 0.55, 0.40, 0.4];
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // STATE PARKS
  // ════════════════════════════════════════════════════════════════════════════

  // ── 16. Snow Canyon ───────────────────────────────────────────────────────
  // Red and white Navajo sandstone canyon with black lava flows on floor
  {
    name: 'Snow Canyon',
    lon: -113.65, lat: 37.16, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Canyon cut running N-S
      const canyonAngle = Math.PI * 0.1;
      const perp = Math.abs(dx * (-Math.sin(canyonAngle)) + dz * Math.cos(canyonAngle));

      const canyonWidth = 10;
      let h: number;
      if (perp < canyonWidth * 0.4) {
        // Canyon floor with lava flow mounds
        const lavaMound = 1.5 * Math.sin(dx * 0.4) * Math.cos(dz * 0.5) * Math.max(0, 1 - perp / (canyonWidth * 0.4));
        h = -6 + Math.max(0, lavaMound);
      } else if (perp < canyonWidth) {
        // Canyon walls
        const wallT = (perp - canyonWidth * 0.4) / (canyonWidth * 0.6);
        h = -6 + 10 * Math.pow(wallT, 0.15);
      } else {
        // Rim
        const rimFade = Math.max(0, 1 - (perp - canyonWidth) / 10);
        h = 4 * rimFade;
      }
      return h * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const perp = Math.abs(dx * (-Math.sin(0.1 * Math.PI)) + dz * Math.cos(0.1 * Math.PI));
      const canyonWidth = 10;

      if (perp < canyonWidth * 0.25) {
        // Black basalt lava flows on floor
        const lavaHash = hashNoise(Math.floor(dx * 0.3), Math.floor(dz * 0.3), 2201);
        if (lavaHash > 0.45) {
          return [0.17, 0.17, 0.17, 0.75]; // basalt black
        }
        // Red sandstone floor between lava
        return [0.75, 0.25, 0.13, 0.6];
      }
      if (perp < canyonWidth * 0.6) {
        // Red sandstone walls
        return [0.75, 0.25, 0.13, 0.7];
      }
      if (perp < canyonWidth) {
        // White Navajo sandstone upper walls
        return [0.94, 0.88, 0.82, 0.65];
      }
      return null;
    },
  },

  // ── 17. Kodachrome Basin ──────────────────────────────────────────────────
  // Tall sedimentary pipes (sand pipes) rising from colorful badlands
  {
    name: 'Kodachrome Basin',
    lon: -112.00, lat: 37.49, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // 8 narrow tall cylinders — even narrower than Bryce hoodoos
      let best = 0;
      for (const pipe of KODACHROME_PIPES) {
        const pdx = dx - pipe.x;
        const pdz = dz - pipe.z;
        const pd = Math.sqrt(pdx * pdx + pdz * pdz);
        // Very narrow sigma, tall height
        const sigma = 0.5 + pipe.s * 0.3;
        const h = 6 + pipe.h * 6; // 6-12 wu
        const g = h * Math.exp(-(pd * pd) / (2 * sigma * sigma));
        if (g > best) best = g;
      }
      return best * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      // Check if on a pipe
      for (const pipe of KODACHROME_PIPES) {
        const pdx = dx - pipe.x;
        const pdz = dz - pipe.z;
        const pd = Math.sqrt(pdx * pdx + pdz * pdz);
        if (pd < 1.5) {
          // White sand pipes
          return [0.88, 0.85, 0.78, 0.7];
        }
      }
      // Red/orange badlands floor
      return [0.75, 0.41, 0.19, 0.5];
    },
  },

  // ── 18. Goosenecks State Park ─────────────────────────────────────────────
  // Deeply entrenched river meanders — 300m deep
  {
    name: 'Goosenecks State Park',
    lon: -109.93, lat: 37.17, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Sinusoidal canyon following meander pattern
      const meanderFreq = 0.25;
      const meanderAmp = 8;
      // River path: sinusoidal curve
      const riverZ = meanderAmp * Math.sin(dx * meanderFreq);
      const riverDist = Math.abs(dz - riverZ);

      const canyonWidth = 6;
      if (riverDist < canyonWidth) {
        // Canyon cut — deeply entrenched
        const depth = -12 * Math.pow(1 - riverDist / canyonWidth, 0.3);
        return depth * fade;
      }
      // Flat plateau rim
      return 2 * Math.max(0, 1 - (riverDist - canyonWidth) / 8) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const riverZ = 8 * Math.sin(dx * 0.25);
      const riverDist = Math.abs(dz - riverZ);

      if (riverDist < 2) {
        // Dark canyon floor
        return [0.31, 0.25, 0.19, 0.7];
      }
      if (riverDist < 6) {
        // Canyon walls
        return [0.55, 0.42, 0.30, 0.6];
      }
      // Grey-white limestone rim
      return [0.75, 0.75, 0.72, 0.45];
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ADDITIONAL LANDMARKS
  // ════════════════════════════════════════════════════════════════════════════

  // ── 19. Natural Bridges NM ────────────────────────────────────────────────
  // Three natural bridges: Sipapu, Kachina, Owachomo
  {
    name: 'Natural Bridges',
    lon: -110.00, lat: 37.60, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      let h = 0;
      // Three bridges at different positions
      const bridges = [
        { ox: -8, oz: -5, span: 5, thick: 1.2 },
        { ox: 2, oz: 3, span: 4, thick: 1.0 },
        { ox: 10, oz: -2, span: 3, thick: 0.8 },
      ];

      for (const br of bridges) {
        const bdx = dx - br.ox;
        const bdz = dz - br.oz;
        const bd = Math.sqrt(bdx * bdx + bdz * bdz);

        // Ring shape for bridge: arch at a specific radius
        const ringDist = Math.abs(bd - br.span);
        const bridgeH = 5 * Math.exp(-(ringDist * ringDist) / (br.thick * br.thick));
        // Gap in the ring for the opening
        const angle = Math.atan2(bdz, bdx);
        const gapMask = Math.max(0, 1 - Math.max(0, Math.cos(angle)) * 2.5);
        h += bridgeH * gapMask;
      }
      return h * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      // Cedar Mesa sandstone: white with red tinge
      return [0.82, 0.62, 0.45, 0.55];
    },
  },

  // ── 20. Cedar Breaks ──────────────────────────────────────────────────────
  // High-altitude amphitheater (like Bryce but at 10,000 ft)
  {
    name: 'Cedar Breaks Amphitheater',
    lon: -112.84, lat: 37.61, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Amphitheater bowl opening west
      const rimGrad = dx / R;
      const plateauH = Math.max(0, rimGrad) * 8;

      // Bowl depression
      const bowlDepth = dx < 0 ? -5 * Math.min(1, -dx / (R * 0.5)) : 0;

      // Hoodoo spires in the bowl
      let spireH = 0;
      for (const sp of CEDAR_BREAKS_SPIRES) {
        const sdx = dx - sp.x * 0.7; // scale to smaller radius
        const sdz = dz - sp.z * 0.7;
        const sd = Math.sqrt(sdx * sdx + sdz * sdz);
        const sigma = 1.2 + sp.s * 0.4;
        const h = 3 + sp.h * 4;
        const g = h * Math.exp(-(sd * sd) / (2 * sigma * sigma));
        if (g > spireH) spireH = g;
      }

      return (plateauH + bowlDepth + spireH) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      if (dx > 5) {
        // Plateau rim: subalpine forest
        return [0.15, 0.32, 0.20, 0.5];
      }
      // Amphitheater: orange-red-lavender Claron Formation
      const band = Math.sin(dist * 0.4) * 0.5 + 0.5;
      return [0.88 - band * 0.15, 0.45 + band * 0.15, 0.32 + band * 0.12, 0.6];
    },
  },

  // ── 21. Factory Butte ─────────────────────────────────────────────────────
  // Isolated grey Mancos Shale butte
  {
    name: 'Factory Butte',
    lon: -110.78, lat: 38.42, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Isolated mesa with steep walls
      const butteRadius = R * 0.4;
      if (dist < butteRadius * 0.6) {
        return 10; // flat top
      }
      if (dist < butteRadius) {
        const edgeT = (dist - butteRadius * 0.6) / (butteRadius * 0.4);
        return 10 * Math.pow(1 - edgeT, 7);
      }
      // Surrounding grey badlands: gently rolling
      const badlandH = 1.5 * Math.sin(dx * 0.3) * Math.cos(dz * 0.25);
      const badlandFade = Math.max(0, 1 - dist / R);
      return badlandH * badlandFade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const butteRadius = R * 0.4;

      if (dist < butteRadius) {
        // Grey Mancos Shale
        return [0.55, 0.55, 0.58, 0.65];
      }
      // Grey badlands floor
      return [0.60, 0.58, 0.55, 0.45];
    },
  },

  // ── 22. San Rafael Swell ──────────────────────────────────────────────────
  // Dome anticline with reef rim — elevated center with ring of exposed reef
  {
    name: 'San Rafael Swell',
    lon: -110.65, lat: 38.80, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Dome anticline: broad gentle dome
      const domeH = 6 * Math.max(0, 1 - (dist * dist) / (R * R * 0.4));

      // Reef rim: ring of resistant sandstone at the edge of the dome
      const reefRadius = R * 0.55;
      const reefWidth = 5;
      const reefDist = Math.abs(dist - reefRadius);
      const reefH = reefDist < reefWidth ? 4 * Math.exp(-(reefDist * reefDist) / (reefWidth * 0.8)) : 0;

      return (domeH + reefH) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const reefRadius = R * 0.55;
      const reefDist = Math.abs(dist - reefRadius);

      if (reefDist < 5) {
        // Reef: Navajo sandstone white-tan
        return [0.90, 0.82, 0.65, 0.6];
      }
      if (dist < reefRadius) {
        // Interior: red-brown Morrison/Summerville
        return [0.65, 0.40, 0.28, 0.5];
      }
      // Exterior: desert
      return [0.80, 0.72, 0.58, 0.35];
    },
  },

  // ── 23. Notch Peak ────────────────────────────────────────────────────────
  // 2nd tallest vertical cliff face in the US (2200ft sheer drop)
  {
    name: 'Notch Peak',
    lon: -113.20, lat: 39.15, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Massive cliff on the west face
      const angle = Math.atan2(dz, dx);
      const westFacing = Math.max(0, Math.cos(angle - Math.PI)); // 1.0 when facing west

      // Broad dome summit
      const summit = dome(dist, R * 0.7, 14);

      // Extra vertical cliff addition on the west side
      const cliffBoost = westFacing * 6 * Math.max(0, 1 - dist / (R * 0.5));

      return (summit + cliffBoost) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const angle = Math.atan2(dz, dx);
      const westFacing = Math.max(0, Math.cos(angle - Math.PI));
      if (westFacing > 0.5 && dist < R * 0.5) {
        // Sheer limestone cliff face: light grey
        return [0.82, 0.80, 0.76, 0.7];
      }
      // Mountain sides: grey-brown
      return [0.60, 0.55, 0.48, 0.5];
    },
  },

  // ── 24. Bingham Canyon Mine ───────────────────────────────────────────────
  // Deepest open-pit mine in the world — inverted cone with terraced rings
  {
    name: 'Bingham Canyon Mine',
    lon: -112.15, lat: 40.52, radius: 1,
    heightFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Inverted cone: deepest at center
      const pitRadius = R * 0.65;
      if (dist > pitRadius) {
        // Rim and tailings
        const rimFade = Math.max(0, 1 - (dist - pitRadius) / (R - pitRadius));
        return 2 * rimFade;
      }

      // Terraced pit
      const depthT = 1 - dist / pitRadius;
      const baseDepth = -16 * depthT;

      // Concentric terrace benches
      const terracePhase = dist * 0.5;
      const terraceFrac = terracePhase - Math.floor(terracePhase);
      const terraceStep = terraceFrac < 0.3 ? 0 : 1.2;

      return baseDepth + terraceStep * (1 - depthT);
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const pitRadius = R * 0.65;

      if (dist > pitRadius) {
        // Tailings: grey-brown disturbed earth
        return [0.58, 0.52, 0.42, 0.5];
      }
      // Pit: copper-bearing rock — grey-green-brown
      const depthT = 1 - dist / pitRadius;
      const r = 0.55 + depthT * 0.10;
      const g = 0.50 - depthT * 0.08;
      const b = 0.38 - depthT * 0.05;
      return [r, g, b, 0.65];
    },
  },

  // ── 25. Great Salt Lake Causeway ──────────────────────────────────────────
  // Linear railroad ridge dividing pink (north) and blue (south) water
  {
    name: 'Great Salt Lake Causeway',
    lon: -112.55, lat: 41.30, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Causeway runs roughly E-W
      const causeAngle = Math.PI * 0.5; // E-W
      return ridge(dx, dz, 4, 3, causeAngle) * Math.max(0, 1 - dist / R);
    },
    tintFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const fade = Math.max(0, 1 - dist / (R * 0.95));

      // Perpendicular to causeway (N-S)
      const perpDist = dz; // positive = north

      if (Math.abs(dx * Math.cos(Math.PI * 0.5) + dz * Math.sin(Math.PI * 0.5)) < 4) {
        // On the causeway: gravel/fill
        return [0.68, 0.63, 0.55, 0.45 * fade];
      }

      if (perpDist > 3) {
        // North side: pink-red hypersaline water (Dunaliella algae)
        return [0.78, 0.45, 0.50, 0.45 * fade];
      }
      if (perpDist < -3) {
        // South side: blue-green water
        return [0.30, 0.55, 0.62, 0.45 * fade];
      }
      return [0.68, 0.63, 0.55, 0.35 * fade];
    },
  },

  // ── 26. Temple of Sinawava ────────────────────────────────────────────────
  // Zion amphitheater terminus — massive curved cliff walls forming a natural amphitheater
  {
    name: 'Temple of Sinawava',
    lon: -112.95, lat: 37.29, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Amphitheater: semicircular cliff walls opening south
      const angle = Math.atan2(dz, dx);
      // Cliffs on north/east/west sides, open to south
      const southOpen = Math.max(0, -Math.sin(angle + Math.PI * 0.5)); // open to south
      const cliffPresence = 1 - southOpen;

      // Distance from amphitheater rim
      const rimRadius = R * 0.5;
      const rimDist = Math.abs(dist - rimRadius);

      if (dist > rimRadius * 0.8 && cliffPresence > 0.3) {
        // Cliff walls
        const wallH = 12 * cliffPresence * Math.exp(-(rimDist * rimDist) / 20);
        return wallH * fade;
      }
      // Amphitheater floor: slightly depressed
      if (dist < rimRadius * 0.6) {
        return -3 * (1 - dist / (rimRadius * 0.6)) * fade;
      }
      return 0;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const angle = Math.atan2(dz, dx);
      const southOpen = Math.max(0, -Math.sin(angle + Math.PI * 0.5));
      const rimRadius = R * 0.5;

      if (dist > rimRadius * 0.7 && (1 - southOpen) > 0.3) {
        // White Navajo sandstone walls
        return [0.92, 0.87, 0.80, 0.65];
      }
      // Floor: riparian green
      if (dist < rimRadius * 0.4) {
        return [0.35, 0.50, 0.28, 0.5];
      }
      return [0.80, 0.60, 0.40, 0.45];
    },
  },

  // ── 27. Angels Landing ────────────────────────────────────────────────────
  // Narrow knife-edge ridge with 400m drop on both sides
  {
    name: 'Angels Landing',
    lon: -112.95, lat: 37.27, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Knife-edge ridge running roughly N-S (slight NNE)
      const ridgeAngle = Math.PI * 0.1;
      const ca = Math.cos(ridgeAngle), sa = Math.sin(ridgeAngle);
      const perp = Math.abs(dx * (-sa) + dz * ca);
      const along = dx * ca + dz * sa;

      // Very narrow ridge: only 3-4 world units wide at top
      const ridgeWidth = 2.5;
      if (perp < ridgeWidth) {
        // Knife-edge top
        const ridgeProfile = Math.pow(1 - perp / ridgeWidth, 0.3);
        const alongFade = Math.max(0, 1 - Math.abs(along) / (R * 0.6));
        return 15 * ridgeProfile * alongFade * fade;
      }
      // Sheer drop on both sides
      const dropDist = perp - ridgeWidth;
      if (dropDist < 15) {
        const dropProfile = 15 * Math.pow(1 - dropDist / 15, 4);
        return -5 + dropProfile * fade;
      }
      return -5 * Math.max(0, 1 - (perp - ridgeWidth - 15) / 10) * fade;
    },
    tintFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;

      const perp = Math.abs(dx * (-Math.sin(0.1 * Math.PI)) + dz * Math.cos(0.1 * Math.PI));
      if (perp < 3) {
        // Ridge top: Navajo sandstone cream
        return [0.88, 0.78, 0.65, 0.65];
      }
      // Cliff faces: red-brown
      return [0.72, 0.35, 0.18, 0.6];
    },
  },

  // ── 28. The Great White Throne ────────────────────────────────────────────
  // Massive white Navajo sandstone monolith — sheer walls on all sides
  {
    name: 'Great White Throne',
    lon: -112.95, lat: 37.26, radius: 1,
    heightFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Massive monolith: flat top, power-8 near-vertical walls
      const monolithRadius = R * 0.35;
      if (dist < monolithRadius * 0.5) {
        // Flat summit
        return 18;
      }
      if (dist < monolithRadius) {
        // Near-vertical cliff faces
        const edgeT = (dist - monolithRadius * 0.5) / (monolithRadius * 0.5);
        return 18 * Math.pow(1 - edgeT, 8);
      }
      // Base talus slope
      const talusDist = dist - monolithRadius;
      const talusFade = Math.max(0, 1 - talusDist / (R * 0.5));
      return 3 * talusFade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const monolithRadius = R * 0.35;

      if (dist < monolithRadius) {
        // White Navajo sandstone — brilliant white with slight cream
        const heightFrac = dist < monolithRadius * 0.5 ? 1.0 : Math.pow(1 - (dist - monolithRadius * 0.5) / (monolithRadius * 0.5), 8);
        if (heightFrac > 0.5) {
          // Upper: brilliant white
          return [0.95, 0.92, 0.87, 0.8];
        }
        // Lower: slight red/pink staining at base
        return [0.88, 0.72, 0.60, 0.7];
      }
      // Talus: darker red-brown
      return [0.65, 0.40, 0.28, 0.5];
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SUPPLEMENTARY LANDMARKS — EXISTING FROM ORIGINAL
  // ════════════════════════════════════════════════════════════════════════════

  // ── Upheaval Dome ─────────────────────────────────────────────────────────
  // Impact crater / salt dome collapse structure
  {
    name: 'Upheaval Dome',
    lon: -109.93, lat: 38.44, radius: 1,
    heightFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      return crater(dist, R * 0.25, R * 0.7, 6, 8);
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const innerR = R * 0.25;
      if (dist < innerR) {
        // Exposed colorful rock at center
        const band = Math.sin(dist * 1.2) * 0.5 + 0.5;
        return [0.72 + band * 0.18, 0.50 + band * 0.15, 0.35, 0.55];
      }
      // Rim: grey-tan
      return [0.70, 0.65, 0.55, 0.45];
    },
  },

  // ── Mesa Arch ─────────────────────────────────────────────────────────────
  // Famous sunrise arch on Island in the Sky mesa rim
  {
    name: 'Mesa Arch',
    lon: -109.865, lat: 38.385, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Small arch at mesa edge
      const angle = Math.atan2(dz, dx);
      const ringDist = Math.abs(dist - 7);
      const ringH = 5 * Math.exp(-(ringDist * ringDist) / 4);
      // Arch opening faces east (sunrise)
      const halfMask = Math.max(0, Math.min(1, -Math.sin(angle) * 2));
      return (ringH * halfMask + mesa(dist, R * 0.6, 3, 4)) * fade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      // Warm Entrada orange
      return [0.83, 0.44, 0.22, 0.55];
    },
  },

  // ── Landscape Arch ────────────────────────────────────────────────────────
  // Longest natural arch in North America (290 ft span)
  {
    name: 'Landscape Arch',
    lon: -109.607, lat: 38.791, radius: 1,
    heightFn: (dx, dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Very long thin arch spanning nearly the full hex
      // Thin ridge representing the arch span
      return ridge(dx, dz, 2.5, 6, Math.PI * 0.05) * fade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      return [0.83, 0.55, 0.35, 0.5];
    },
  },

  // ── Thor's Hammer ─────────────────────────────────────────────────────────
  // Iconic Bryce Canyon hoodoo — narrow stem with hammer-shaped cap
  {
    name: "Thor's Hammer",
    lon: -112.164, lat: 37.623, radius: 1,
    heightFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;

      // Tall narrow stem with wide cap
      const stem = spire(dist, 2.0, 14);
      // Hammer cap: wider gaussian at the top
      const cap = dist < 4 ? 3 * Math.exp(-(dist * dist) / 6) : 0;
      return stem + cap;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      if (dist < 4) {
        // Cap: darker caprock
        return [0.75, 0.45, 0.25, 0.6];
      }
      // Stem: orange Claron
      return [0.92, 0.62, 0.38, 0.55];
    },
  },

  // ── Comb Ridge ────────────────────────────────────────────────────────────
  // 80-mile monocline cuesta ridge running N-S
  {
    name: 'Comb Ridge',
    lon: -109.66, lat: 37.35, radius: 2,
    heightFn: (dx, dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Long N-S oriented ridge (slight east tilt)
      const ridgeAngle = Math.PI * 0.02;
      return ridge(dx, dz, 8, 7, ridgeAngle) * fade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      // Navajo sandstone: cream-tan
      return [0.88, 0.78, 0.62, 0.45];
    },
  },

  // ── Henry Mountains ───────────────────────────────────────────────────────
  // Laccolith mountain range — dome-shaped igneous intrusions
  {
    name: 'Henry Mountains',
    lon: -110.73, lat: 38.01, radius: 2,
    heightFn: (_dx, _dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      // Broad dome: laccolith shape
      return dome(dist, R * 0.8, 16);
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 2 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const t = dist / (R * 0.8);
      if (t < 0.3) {
        // Summit: alpine grey
        return [0.70, 0.68, 0.63, 0.5];
      }
      if (t < 0.6) {
        // Mid-slopes: conifer forest
        return [0.22, 0.42, 0.25, 0.45];
      }
      // Lower slopes: desert tan
      return [0.78, 0.68, 0.52, 0.35];
    },
  },

  // ── Navajo Mountain ───────────────────────────────────────────────────────
  // Sacred laccolith dome south of Lake Powell
  {
    name: 'Navajo Mountain',
    lon: -110.865, lat: 37.005, radius: 1,
    heightFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      return dome(dist, R * 0.75, 18);
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const t = dist / (R * 0.75);
      if (t < 0.4) {
        // Summit: dark conifer forest
        return [0.18, 0.38, 0.22, 0.55];
      }
      // Lower: red-brown sandstone
      return [0.72, 0.40, 0.25, 0.45];
    },
  },

  // ── Capitol Reef Navajo Domes ─────────────────────────────────────────────
  // Slickrock domes in Capitol Reef
  {
    name: 'Capitol Reef Navajo Domes',
    lon: -111.26, lat: 38.28, radius: 1,
    heightFn: (_dx, _dz, dist, wx, wz) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R) return 0;
      const fade = Math.max(0, 1 - dist / R);

      // Cluster of smooth Navajo sandstone domes
      let h = 0;
      const gridX = Math.floor(wx / 12);
      const gridZ = Math.floor(wz / 12);
      const n = hashNoise(gridX, gridZ, 5577);
      if (n > 0.45) {
        const domeH = (n - 0.45) * 16;
        const lx = wx - (gridX + 0.5) * 12;
        const lz = wz - (gridZ + 0.5) * 12;
        h += dome(Math.sqrt(lx * lx + lz * lz), 6, domeH);
      }
      return h * fade;
    },
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      // Navajo sandstone: cream-white
      return [0.92, 0.88, 0.78, 0.55];
    },
  },

  // ── Bear Lake ─────────────────────────────────────────────────────────────
  // Turquoise "Caribbean of the Rockies"
  {
    name: 'Bear Lake',
    lon: -111.32, lat: 41.89, radius: 1,
    heightFn: () => 0,
    tintFn: (_dx, _dz, dist) => {
      const R = 1 * HEX_WORLD_SCALE;
      if (dist > R * 0.95) return null;
      const fade = Math.max(0, 1 - dist / (R * 0.9));
      return [0.20, 0.68, 0.75, 0.45 * fade];
    },
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// LandmarkSculptor
// ═════════════════════════════════════════════════════════════════════════════

export class LandmarkSculptor {

  applyToTerrain(
    heightGrid: Float32Array,
    heightGridCols: number,
    heightGridRows: number,
    chunkMeshes?: { mesh: any; gxStart: number; gzStart: number; chunkVertCols: number; chunkVertRows: number }[],
  ): void {
    for (const lm of LANDMARK_CONFIGS) {
      const { x: cx, z: cz } = geoToWorld(lm.lon, lm.lat);
      const radiusWorld = lm.radius * HEX_WORLD_SCALE;
      const fadeStart = radiusWorld * 0.7;

      const gxMin = Math.max(0, Math.floor((cx - radiusWorld) / GRID_SPACING));
      const gxMax = Math.min(heightGridCols - 1, Math.ceil((cx + radiusWorld) / GRID_SPACING));
      const gzMin = Math.max(0, Math.floor((-cz - radiusWorld) / GRID_SPACING));
      const gzMax = Math.min(heightGridRows - 1, Math.ceil((-cz + radiusWorld) / GRID_SPACING));

      for (let gz = gzMin; gz <= gzMax; gz++) {
        for (let gx = gxMin; gx <= gxMax; gx++) {
          const wx = gx * GRID_SPACING;
          const wz = -(gz * GRID_SPACING);

          const dx = wx - cx;
          const dz = wz - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > radiusWorld) continue;

          let fade = 1.0;
          if (dist > fadeStart) {
            fade = 1.0 - (dist - fadeStart) / (radiusWorld - fadeStart);
          }

          const heightOffset = lm.heightFn(dx, dz, dist, wx, wz) * fade;
          const gridIdx = gz * heightGridCols + gx;
          heightGrid[gridIdx] += heightOffset;
        }
      }

      if (lm.tintFn && chunkMeshes) {
        for (const chunk of chunkMeshes) {
          this.applyTintToChunk(lm, cx, cz, radiusWorld, fadeStart, chunk);
        }
      }
    }
  }

  /**
   * Apply landmark tints directly to the pre-chunk vertex color grid.
   * This runs BEFORE chunks are built, so colors are properly baked into chunk geometries.
   */
  applyTintsToColorGrid(
    colorGrid: Float32Array,
    gridCols: number,
    gridRows: number,
    gridMinX: number,
    gridMinZ: number,
  ): void {
    for (const lm of LANDMARK_CONFIGS) {
      if (!lm.tintFn) continue;
      const { x: cx, z: cz } = geoToWorld(lm.lon, lm.lat);
      const radiusWorld = lm.radius * HEX_WORLD_SCALE;
      const fadeStart = radiusWorld * 0.7;

      // Grid cell range overlapping this landmark
      const gxMin = Math.max(0, Math.floor((cx - radiusWorld - gridMinX) / GRID_SPACING));
      const gxMax = Math.min(gridCols - 1, Math.ceil((cx + radiusWorld - gridMinX) / GRID_SPACING));
      const gzMin = Math.max(0, Math.floor((cz - radiusWorld - gridMinZ) / GRID_SPACING));
      const gzMax = Math.min(gridRows - 1, Math.ceil((cz + radiusWorld - gridMinZ) / GRID_SPACING));

      for (let gz = gzMin; gz <= gzMax; gz++) {
        for (let gx = gxMin; gx <= gxMax; gx++) {
          const wx = gridMinX + gx * GRID_SPACING;
          const wz = gridMinZ + gz * GRID_SPACING;

          const dx = wx - cx;
          const dz = wz - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > radiusWorld) continue;

          let fade = 1.0;
          if (dist > fadeStart) {
            fade = 1.0 - (dist - fadeStart) / (radiusWorld - fadeStart);
          }

          const tint = lm.tintFn(dx, dz, dist);
          if (!tint) continue;

          const idx = (gz * gridCols + gx) * 3;
          const strength = tint[3] * fade;
          colorGrid[idx]     = colorGrid[idx]     * (1 - strength) + tint[0] * strength;
          colorGrid[idx + 1] = colorGrid[idx + 1] * (1 - strength) + tint[1] * strength;
          colorGrid[idx + 2] = colorGrid[idx + 2] * (1 - strength) + tint[2] * strength;
        }
      }
    }
  }

  build(): void {
    // Landmark sculpting is applied via applyToTerrain() during terrain build.
  }

  dispose(): void {
    // No GPU resources owned directly.
  }

  private applyTintToChunk(
    lm: LandmarkConfig,
    cx: number,
    cz: number,
    radiusWorld: number,
    fadeStart: number,
    chunk: { mesh: any; gxStart: number; gzStart: number; chunkVertCols: number; chunkVertRows: number },
  ): void {
    const { mesh, gxStart, gzStart, chunkVertCols, chunkVertRows } = chunk;
    const colorAttr = mesh.geometry?.getAttribute?.('color');
    if (!colorAttr) return;

    const gxEnd = gxStart + chunkVertCols;
    const gzEnd = gzStart + chunkVertRows;

    const lmGxMin = Math.floor((cx - radiusWorld) / GRID_SPACING);
    const lmGxMax = Math.ceil((cx + radiusWorld) / GRID_SPACING);
    const lmGzMin = Math.floor((-cz - radiusWorld) / GRID_SPACING);
    const lmGzMax = Math.ceil((-cz + radiusWorld) / GRID_SPACING);

    if (gxEnd < lmGxMin || gxStart > lmGxMax || gzEnd < lmGzMin || gzStart > lmGzMax) return;

    let modified = false;

    for (let lz = 0; lz < chunkVertRows; lz++) {
      const gz = gzStart + lz;
      for (let lx = 0; lx < chunkVertCols; lx++) {
        const gx = gxStart + lx;
        const wx = gx * GRID_SPACING;
        const wz = -(gz * GRID_SPACING);

        const dx = wx - cx;
        const dz = wz - cz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > radiusWorld) continue;

        const tint = lm.tintFn!(dx, dz, dist);
        if (!tint) continue;

        let fade = 1.0;
        if (dist > fadeStart) {
          fade = 1.0 - (dist - fadeStart) / (radiusWorld - fadeStart);
        }

        const [tr, tg, tb, ta] = tint;
        const alpha = ta * fade;
        const localIdx = lz * chunkVertCols + lx;

        const curR = colorAttr.getX(localIdx);
        const curG = colorAttr.getY(localIdx);
        const curB = colorAttr.getZ(localIdx);
        colorAttr.setXYZ(
          localIdx,
          curR * (1 - alpha) + tr * alpha,
          curG * (1 - alpha) + tg * alpha,
          curB * (1 - alpha) + tb * alpha,
        );
        modified = true;
      }
    }

    if (modified) {
      colorAttr.needsUpdate = true;
    }
  }
}
