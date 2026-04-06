/**
 * Deterministic procedural noise for terrain texture variation.
 * All functions are pure — same inputs always produce same outputs.
 * Uses simplex-noise for smoother gradients.
 *
 * Adapted from Aveneg's ProceduralNoise.ts for Utah terrain.
 */

import { createNoise2D } from 'simplex-noise';

// --- Seeded RNG for deterministic noise instances ---

/** Simple mulberry32 PRNG for seeding simplex-noise */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cache of seeded noise functions to avoid re-creating per call */
const noiseCache = new Map<number, (x: number, y: number) => number>();
const MAX_NOISE_CACHE = 256;

function getSeededNoise(seed: number): (x: number, y: number) => number {
  let fn = noiseCache.get(seed);
  if (fn) return fn;
  if (noiseCache.size >= MAX_NOISE_CACHE) {
    const first = noiseCache.keys().next().value!;
    noiseCache.delete(first);
  }
  fn = createNoise2D(mulberry32(seed));
  noiseCache.set(seed, fn);
  return fn;
}

// --- Legacy hash retained for voronoi / tileHash ---

/** Fast integer hash (Robert Jenkins' 32-bit mix) */
function hash(n: number): number {
  n = ((n >> 16) ^ n) * 0x45d9f3b;
  n = ((n >> 16) ^ n) * 0x45d9f3b;
  n = (n >> 16) ^ n;
  return n & 0x7fffffff;
}

/** Deterministic seed from hex coordinates */
export function tileHash(q: number, r: number): number {
  return hash(q * 374761393 + r * 668265263 + 1013904223);
}

// --- Utility ---

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// --- Core noise (simplex-based, returns 0–1) ---

/** 2D simplex noise returning 0–1 (deterministic given seed) */
export function valueNoise2D(x: number, y: number, seed: number): number {
  const noise = getSeededNoise(seed);
  return noise(x, y) * 0.5 + 0.5;
}

/** Fractal Brownian Motion — layered noise for natural variation */
export function fbm2D(x: number, y: number, seed: number, octaves: number = 3): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise2D(x * frequency, y * frequency, seed + i * 1000);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Domain-warped FBM — offsets coords via secondary FBM before sampling.
 * Creates organic swirling patterns for marshes, deserts.
 */
export function domainWarpedFbm(
  x: number,
  y: number,
  seed: number,
  octaves: number = 3,
  warpStrength: number = 0.5,
): number {
  const warpX = fbm2D(x + 5.2, y + 1.3, seed + 100, octaves) * warpStrength;
  const warpY = fbm2D(x + 1.7, y + 9.2, seed + 200, octaves) * warpStrength;
  return fbm2D(x + warpX, y + warpY, seed, octaves);
}

/**
 * Ridged noise — 1 - abs(noise * 2 - 1), squared, accumulated.
 * Creates sharp ridgelines for mountains.
 */
export function ridgedNoise2D(x: number, y: number, seed: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;
  let weight = 1;

  for (let i = 0; i < octaves; i++) {
    let n = valueNoise2D(x * frequency, y * frequency, seed + i * 1000);
    n = 1 - Math.abs(n * 2 - 1);
    n = n * n;
    n *= weight;
    weight = Math.min(1, n * 2);
    value += n * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Voronoi / cellular noise — distance to nearest/second-nearest jittered grid points.
 * Returns { dist, dist2, cellValue }.
 */
export function voronoi2D(
  x: number,
  y: number,
  seed: number,
): { dist: number; dist2: number; cellValue: number } {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let f1sq = 999;
  let f2sq = 999;
  let cellId = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const jx = cx + (hash(cx + hash(cy + seed)) & 0xffff) / 0xffff;
      const jy = cy + (hash(cy + hash(cx + seed + 7777)) & 0xffff) / 0xffff;
      const distSq = (x - jx) * (x - jx) + (y - jy) * (y - jy);
      if (distSq < f1sq) {
        f2sq = f1sq;
        f1sq = distSq;
        cellId = hash(cx * 31337 + cy * 7919 + seed);
      } else if (distSq < f2sq) {
        f2sq = distSq;
      }
    }
  }

  return { dist: Math.sqrt(f1sq), dist2: Math.sqrt(f2sq), cellValue: (cellId & 0xffff) / 0xffff };
}

/**
 * Turbulence noise — sum of abs(noise*2-1) per octave.
 * Produces sharp vein/crack patterns for streets, dried riverbeds, rock strata.
 */
export function turbulence2D(x: number, y: number, seed: number, octaves: number = 3): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value +=
      amplitude * Math.abs(valueNoise2D(x * frequency, y * frequency, seed + i * 1000) * 2 - 1);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Erosion noise — two-pass: FBM flow warp then ridged sample with perpendicular stretch.
 * Creates carved-valley/channel patterns.
 */
export function erosionNoise2D(
  x: number,
  y: number,
  seed: number,
  octaves: number = 3,
  flowAngle: number = 0,
): number {
  const flow = fbm2D(x, y, seed, 2);
  const cos = Math.cos(flowAngle);
  const sin = Math.sin(flowAngle);
  const wx = x + cos * flow * 0.5;
  const wy = y + sin * flow * 0.5;
  const rx = wx * cos + wy * sin;
  const ry = (-wx * sin + wy * cos) / 3;
  return ridgedNoise2D(rx, ry, seed + 500, octaves);
}

/**
 * Voronoi cell value — returns per-cell random value without distance computation.
 * Cheaper than full voronoi2D when only cell identity matters.
 */
export function voronoiCellValue(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let f1 = 999;
  let cellId = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const jx = cx + (hash(cx + hash(cy + seed)) & 0xffff) / 0xffff;
      const jy = cy + (hash(cy + hash(cx + seed + 7777)) & 0xffff) / 0xffff;
      const distSq = (x - jx) * (x - jx) + (y - jy) * (y - jy);
      if (distSq < f1) {
        f1 = distSq;
        cellId = hash(cx * 31337 + cy * 7919 + seed);
      }
    }
  }

  return (cellId & 0xffff) / 0xffff;
}

/**
 * Directional noise — rotates coords by angle, scales perpendicular axis by stretch, samples FBM.
 * For wind ripples, wave direction, dune ridges.
 */
export function directionalNoise(
  x: number,
  y: number,
  angle: number,
  wavelength: number,
  seed: number,
): number {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rx = x * cos + y * sin;
  const ry = (-x * sin + y * cos) / wavelength;
  return fbm2D(rx, ry, seed, 3);
}

// Re-export smoothstep for external use
export { smoothstep };
