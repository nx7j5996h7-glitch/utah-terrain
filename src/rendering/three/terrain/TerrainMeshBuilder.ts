/**
 * Generates terrain mesh using a global uniform grid (Civ-style approach).
 * Each vertex samples continuous height/color functions at its world position,
 * then looks up which hex tile it belongs to for terrain type. No per-hex ring
 * topology — mountains flow naturally across hex boundaries.
 *
 * The grid covers all land tiles at GRID_SPACING intervals. Water-only cells
 * are placed below the water plane (Y=-4). Land-water boundaries form sloped
 * triangles. The mesh is split into CHUNK_COLS × CHUNK_ROWS spatial chunks.
 *
 * Mountain height profiles are Utah-specific:
 *   'range'     — ridged noise with domain warping (Wasatch, Deep Creek, Uinta)
 *   'laccolith' — smooth dome profile (La Sal, Henry, Abajo, Navajo Mountain)
 *   'plateau'   — flat-topped with steep edges (Markagunt, Aquarius, Wasatch Plateau)
 */

import * as THREE from 'three';
import { GameMap } from '@/core/map/GameMap';
import { geoToWorld, worldToGeo, computeWorldBounds } from '@/core/geo/GeoCoord';
import { sampleTerrainAt, type TerrainProperties } from '@/core/map/UtahMapData';
import type { TerrainType } from '@/constants';
import {
  ELEVATION_SCALE,
  MOUNTAIN_HEIGHT_BOOST,
  GRID_SPACING,
  WATER_MESH_Y,
  TERRAIN_COLORS,
  TERRAIN_COLORS_SECONDARY,
  TERRAIN_COLORS_TERTIARY,
  TERRAIN_INDEX,
  GLOBAL_TERRAIN_SEED,
  TINT_NONE,
  FORMATION_COLORS,
} from '@/constants';
import { valueNoise2D } from '@/rendering/ProceduralNoise';
import { heightMap } from '@/rendering/HeightMapGenerator';
import { REGION_TINT, TINT_COLORS } from '@/rendering/RegionalMappings';

// ── Module constants ──────────────────────────────────────────────────────────

const SEED = GLOBAL_TERRAIN_SEED;

/** Number of chunk columns/rows for spatial partitioning. */
const CHUNK_COLS = 4;
const CHUNK_ROWS = 4;

/** Below-water height for water vertices. */
const WATER_Y = WATER_MESH_Y;

/** Mountain smoothing — disabled because real USGS heightmap provides natural mountain profiles. */
const MTN_SMOOTH_RADIUS = 12;
const MTN_SMOOTH_PASSES = 0; // Real data doesn't need procedural smoothing


// ── Parse terrain color hex strings into [r,g,b] float arrays ─────────────────

function hexToRGB(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}

const TERRAIN_RGB: Partial<Record<TerrainType, [number, number, number]>> = {};
const TERRAIN_RGB_SEC: Partial<Record<TerrainType, [number, number, number]>> = {};
const TERRAIN_RGB_TER: Partial<Record<TerrainType, [number, number, number]>> = {};

for (const key of Object.keys(TERRAIN_COLORS) as TerrainType[]) {
  TERRAIN_RGB[key] = hexToRGB(TERRAIN_COLORS[key]);
  TERRAIN_RGB_SEC[key] = hexToRGB(TERRAIN_COLORS_SECONDARY[key]);
  TERRAIN_RGB_TER[key] = hexToRGB(TERRAIN_COLORS_TERTIARY[key]);
}

// Indexed lookup for terrain boundary color blending
const TERRAIN_TYPE_KEYS = Object.keys(TERRAIN_INDEX) as TerrainType[];
const TERRAIN_RGB_BY_IDX: ([number, number, number] | null)[] = new Array(
  TERRAIN_TYPE_KEYS.length,
).fill(null);
for (const key of TERRAIN_TYPE_KEYS) {
  const idx = TERRAIN_INDEX[key];
  TERRAIN_RGB_BY_IDX[idx] = TERRAIN_RGB[key] ?? null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Vertex key for height lookup (quantized to 2 decimal digits). */
function vertKey(wx: number, wz: number): string {
  return `${(wx * 100) | 0},${(wz * 100) | 0}`;
}

// ── Height computation ────────────────────────────────────────────────────────

/**
 * Compute world-space Y height for a vertex using real USGS heightmap data.
 * The real heightmap provides the base terrain shape; procedural noise is
 * only used for fine-grain surface texture.
 *
 * Falls back to the old procedural height if the heightmap is not loaded.
 */
function getHeight(
  wx: number,
  wy: number,
  elevation: number,
  terrain: TerrainType,
  ridgeAngle?: number,
  mountainType?: 'range' | 'laccolith' | 'plateau',
): number {
  // Primary source: real USGS heightmap
  const realH = heightMap.sampleRealHeight(wx, wy);
  if (realH !== 0) return realH;

  // Fallback: procedural height (only if heightmap not loaded or outside bounds)
  if (terrain === 'mountain') {
    const base = elevation * ELEVATION_SCALE;
    const mtnSample = heightMap.sampleMountainHeight(
      wx,
      wy,
      1,
      ridgeAngle ?? 0,
      mountainType ?? 'range',
    );
    return base + mtnSample * MOUNTAIN_HEIGHT_BOOST * elevation * 0.5;
  }

  const base = elevation * ELEVATION_SCALE * 0.3;
  const terrainNoise = heightMap.sampleDesertHeight(wx, wy, terrain);
  return base + terrainNoise * ELEVATION_SCALE;
}

// ── Varied color computation ──────────────────────────────────────────────────

/**
 * Blends primary, secondary, and tertiary color palettes with multi-octave
 * noise for natural color variation per vertex. Applies regional tint and
 * elevation-based darkening.
 */
function computeVariedColor(
  wx: number,
  wz: number,
  terrain: TerrainType,
  elevation: number,
  tint: number,
  formation: number | undefined,
  wy: number,
): [number, number, number] {
  const primary = TERRAIN_RGB[terrain] ?? [0.5, 0.5, 0.5];
  const secondary = TERRAIN_RGB_SEC[terrain] ?? primary;
  const tertiary = TERRAIN_RGB_TER[terrain] ?? primary;

  // Multi-octave noise for natural palette blending
  const n1 = valueNoise2D(wx * 0.015, wz * 0.015, SEED);
  const n2 = valueNoise2D(wx * 0.04, wz * 0.04, SEED + 100);
  const n3 = valueNoise2D(wx * 0.1, wz * 0.1, SEED + 200);

  // Weight each palette
  const w1 = 0.45 + (n1 - 0.5) * 0.25;
  const w2 = 0.30 + (n2 - 0.5) * 0.15;
  const w3Raw = 1 - w1 - w2;
  const w3 = Math.max(0, w3Raw);

  let r = primary[0] * w1 + secondary[0] * w2 + tertiary[0] * w3;
  let g = primary[1] * w1 + secondary[1] * w2 + tertiary[1] * w3;
  let b = primary[2] * w1 + secondary[2] * w2 + tertiary[2] * w3;

  // Fine-grain noise variation
  const detail = (n3 - 0.5) * 0.08;
  r += detail;
  g += detail;
  b += detail;

  // Formation-aware coloring — geological rock type shifts vertex color
  if (formation && FORMATION_COLORS[formation]) {
    const fc = FORMATION_COLORS[formation];
    const fmNoise = valueNoise2D(wx * 0.008, wz * 0.008, SEED + 5000);
    const blendStr = 0.25 + fmNoise * 0.30; // 25-55% organic blend
    r = r * (1 - blendStr) + fc[0] * blendStr;
    g = g * (1 - blendStr) + fc[1] * blendStr;
    b = b * (1 - blendStr) + fc[2] * blendStr;
  }

  // Regional tint
  if (tint > 0 && TINT_COLORS[tint]) {
    const tc = TINT_COLORS[tint];
    r += tc[0];
    g += tc[1];
    b += tc[2];
  }

  // Elevation-based darkening for high terrain
  if (elevation > 10) {
    const darkFactor = 1 - (elevation - 10) * 0.03;
    r *= darkFactor;
    g *= darkFactor;
    b *= darkFactor;
  }

  // ── Hillshade: slope-based light/dark from real heightmap ──
  // Larger step = smoother hillshade that doesn't highlight individual triangles
  const step = 8.0;
  const hL = heightMap.sampleRealHeight(wx - step, -wz) || wy;
  const hR = heightMap.sampleRealHeight(wx + step, -wz) || wy;
  const hU = heightMap.sampleRealHeight(wx, -(wz - step)) || wy;
  const hD = heightMap.sampleRealHeight(wx, -(wz + step)) || wy;
  const dhdx = (hR - hL) / (2 * step);
  const dhdz = (hD - hU) / (2 * step);
  const shade = Math.max(0, (-0.893 * dhdx - 0.643 * dhdz + 1) * 0.577);

  // Gentler light ranges — avoid extreme dark that highlights every facet
  let lightFactor: number;
  if (terrain === 'mountain' || terrain === 'alpine') {
    lightFactor = 0.58 + shade * 0.50;
  } else if (terrain === 'desert' || terrain === 'red_sandstone' || terrain === 'badlands') {
    lightFactor = 0.62 + shade * 0.45;
  } else if (terrain === 'conifer_forest' || terrain === 'sagebrush') {
    lightFactor = 0.68 + shade * 0.38;
  } else {
    lightFactor = 0.75 + shade * 0.30;
  }
  r *= lightFactor;
  g *= lightFactor;
  b *= lightFactor;

  // ── Slope-based cliff darkening ──
  const slopeProxy = Math.abs(shade - 0.5) * 2;
  if (slopeProxy > 0.4 && terrain === 'mountain') {
    const darkAmount = (slopeProxy - 0.4) * 0.15;
    r -= darkAmount;
    g -= darkAmount;
    b -= darkAmount * 0.8;
  }

  // ── Snow cover: altitude-based with noise-warped treeline ──
  const SNOW_RGB = [0.98, 0.97, 0.96];
  if ((terrain === 'mountain' || terrain === 'alpine') && wy > 120) {
    const snowAmount = Math.min(1, (wy - 120) / 60);
    const snowNoise = valueNoise2D(wx * 0.01, wz * 0.01, SEED + 7777);
    const snowBlend = snowAmount * (0.5 + snowNoise * 0.5);
    const snowShade = 0.85 + shade * 0.15;
    r = r * (1 - snowBlend) + SNOW_RGB[0] * snowShade * snowBlend;
    g = g * (1 - snowBlend) + SNOW_RGB[1] * snowShade * snowBlend;
    b = b * (1 - snowBlend) + SNOW_RGB[2] * snowShade * snowBlend;
  }

  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b)),
  ];
}

// ── Chunk info ────────────────────────────────────────────────────────────────

interface ChunkInfo {
  geometry: THREE.BufferGeometry;
  baseColors: Float32Array;
  tileIndices: number[];
  tileLocalVerts: Map<number, number[]>;
}

// ══════════════════════════════════════════════════════════════════════════════
// TerrainMeshBuilder
// ══════════════════════════════════════════════════════════════════════════════

export class TerrainMeshBuilder {
  private chunks: ChunkInfo[] = [];

  // Grid parameters for bilinear height interpolation
  private gridMinX = 0;
  private gridMinZ = 0;
  private gridCols = 0;
  private gridRows = 0;
  private gridHeights: Float32Array | null = null;

  // River data for CPU-side valley carving
  private riverData: Uint8Array | null = null;
  private riverTexWidth = 0;
  private riverBoundsMinX = 0;
  private riverBoundsMinZ = 0;
  private riverBoundsInvRangeX = 1;
  private riverBoundsInvRangeZ = 1;

  /** Accept river map raw pixel data for valley carving. Call before build(). */
  setRiverData(
    data: Uint8Array,
    width: number,
    bounds: { x: number; y: number; z: number; w: number },
  ): void {
    this.riverData = data;
    this.riverTexWidth = width;
    this.riverBoundsMinX = bounds.x;
    this.riverBoundsMinZ = bounds.y;
    this.riverBoundsInvRangeX = bounds.z;
    this.riverBoundsInvRangeZ = bounds.w;
  }

  /** Sample river texture with bilinear interpolation. Returns [mask 0-1, valleyDepth 0-1]. */
  private sampleRiver(wx: number, wz: number): [number, number] {
    if (!this.riverData) return [0, 0];
    const u = (wx - this.riverBoundsMinX) * this.riverBoundsInvRangeX;
    const v = (wz - this.riverBoundsMinZ) * this.riverBoundsInvRangeZ;
    if (u < 0 || u > 1 || v < 0 || v > 1) return [0, 0];
    const w = this.riverTexWidth;
    const fx = u * w - 0.5;
    const fy = v * w - 0.5;
    const x0 = Math.max(0, Math.floor(fx));
    const y0 = Math.max(0, Math.floor(fy));
    const x1 = Math.min(w - 1, x0 + 1);
    const y1 = Math.min(w - 1, y0 + 1);
    const sx = fx - x0;
    const sy = fy - y0;
    const d = this.riverData;
    const i00 = (y0 * w + x0) * 4;
    const i10 = (y0 * w + x1) * 4;
    const i01 = (y1 * w + x0) * 4;
    const i11 = (y1 * w + x1) * 4;
    const mask =
      (d[i00] * (1 - sx) * (1 - sy) +
        d[i10] * sx * (1 - sy) +
        d[i01] * (1 - sx) * sy +
        d[i11] * sx * sy) /
      255;
    const valley =
      (d[i00 + 3] * (1 - sx) * (1 - sy) +
        d[i10 + 3] * sx * (1 - sy) +
        d[i01 + 3] * (1 - sx) * sy +
        d[i11 + 3] * sx * sy) /
      255;
    return [mask, valley];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // build() — Full terrain generation pipeline
  // ─────────────────────────────────────────────────────────────────────────

  async build(
    gameMap: GameMap,
    yieldFn?: () => Promise<void>,
  ): Promise<THREE.BufferGeometry[]> {
    // ── Step 1: Dispose old chunks ──
    for (const chunk of this.chunks) chunk.geometry.dispose();
    this.chunks = [];

    // ── Step 2-3: Skipped — no hex tile lookup or mountain depth BFS needed ──
    // Terrain properties are now sampled directly at each vertex position.

    // ── Step 4: World bounding box from geographic bounds ──
    const wb = computeWorldBounds(20);
    let minX = wb.minX;
    let maxX = wb.maxX;
    let minZ = wb.minZ;
    let maxZ = wb.maxZ;

    // ── Step 5: Generate vertex grid with direct geo sampling ──
    const numCols = Math.ceil((maxX - minX) / GRID_SPACING) + 1;
    const numRows = Math.ceil((maxZ - minZ) / GRID_SPACING) + 1;
    const totalVerts = numCols * numRows;

    const positions = new Float32Array(totalVerts * 3);
    const colors = new Float32Array(totalVerts * 3);
    const baseColorsArr = new Float32Array(totalVerts * 3);
    const terrainTypes = new Float32Array(totalVerts);
    const terrainBlendArr = new Float32Array(totalVerts);
    const snowCoverArr = new Float32Array(totalVerts);
    const coastDistArr = new Float32Array(totalVerts).fill(1.0);
    const geoCoords = new Float32Array(totalVerts * 2); // repurposed as geo UV coords
    const uvs = new Float32Array(totalVerts * 2);
    const vertIsLand = new Uint8Array(totalVerts); // 1=land, 0=water
    const heightLookup = new Map<string, number>();

    // Cache terrain samples per vertex for later use in boundary blending
    const vertTerrain = new Array<TerrainProperties | null>(totalVerts).fill(null);

    for (let row = 0; row < numRows; row++) {
      if (yieldFn && row > 0 && row % 50 === 0) await yieldFn();

      for (let col = 0; col < numCols; col++) {
        const vi = row * numCols + col;
        const wx = minX + col * GRID_SPACING;
        const wz = minZ + row * GRID_SPACING;

        // Convert world position to geographic coordinates for terrain sampling
        const geo = worldToGeo(wx, wz);
        const props = sampleTerrainAt(geo.lon, geo.lat);
        vertTerrain[vi] = props;

        positions[vi * 3] = wx;
        positions[vi * 3 + 2] = wz;
        uvs[vi * 2] = wx * 0.01;
        uvs[vi * 2 + 1] = wz * 0.01;

        // Store geographic coordinates for shader lookups
        geoCoords[vi * 2] = geo.lon;
        geoCoords[vi * 2 + 1] = geo.lat;

        // ── Water ──
        if (props.isWater) {
          let waterY = 0.0;
          const realH = getHeight(wx, -wz, 2, 'desert');
          waterY = Math.min(0.0, Math.max(-0.5, realH * 0.02));
          positions[vi * 3 + 1] = waterY;
          terrainTypes[vi] = TERRAIN_INDEX['water'];
          const waterRGB: [number, number, number] = [0.05, 0.18, 0.28];
          colors[vi * 3] = waterRGB[0];
          colors[vi * 3 + 1] = waterRGB[1];
          colors[vi * 3 + 2] = waterRGB[2];
          baseColorsArr[vi * 3] = waterRGB[0];
          baseColorsArr[vi * 3 + 1] = waterRGB[1];
          baseColorsArr[vi * 3 + 2] = waterRGB[2];
          continue;
        }

        vertIsLand[vi] = 1;

        const terrain = props.terrain;
        const elev = props.elevation;
        let wy: number;

        // Primary height: real USGS heightmap
        wy = getHeight(wx, -wz, elev, terrain);

        positions[vi * 3 + 1] = wy;

        // Vertex color
        const tint = REGION_TINT[props.region] ?? TINT_NONE;
        const color = computeVariedColor(wx, wz, terrain, elev, tint, props.formation, wy);
        colors[vi * 3] = color[0];
        colors[vi * 3 + 1] = color[1];
        colors[vi * 3 + 2] = color[2];
        baseColorsArr[vi * 3] = color[0];
        baseColorsArr[vi * 3 + 1] = color[1];
        baseColorsArr[vi * 3 + 2] = color[2];

        terrainTypes[vi] = TERRAIN_INDEX[terrain] ?? 0;

        // Snow cover
        if (terrain === 'mountain' || terrain === 'alpine') {
          const snowThreshold = ELEVATION_SCALE * 6;
          if (wy > snowThreshold) {
            const noiseBreak = valueNoise2D(wx * 0.02, wz * 0.02, SEED + 7777);
            const snowT = Math.min(1, (wy - snowThreshold) / (ELEVATION_SCALE * 3));
            snowCoverArr[vi] = snowT * (0.6 + noiseBreak * 0.4);
          }
        }

        // Coast distance: check neighboring grid vertices for water
        if (terrain === 'river_valley' || terrain === 'canyon_floor' || terrain === 'marsh') {
          coastDistArr[vi] = 0.0;
        }
        // Coast proximity will be refined in coastal smoothing pass below

        heightLookup.set(vertKey(wx, wz), wy);
      }
    }

    // Store grid metadata early so landmark sculpting and smoothing can use it
    this.gridMinX = minX;
    this.gridMinZ = minZ;
    this.gridCols = numCols;
    this.gridRows = numRows;
    this.gridHeights = new Float32Array(totalVerts);
    for (let i = 0; i < totalVerts; i++) this.gridHeights[i] = positions[i * 3 + 1];

    // ── Step 7a: Global terrain smoothing — SKIPPED ──
    // No hex boundaries exist in the new system — terrain types are sampled
    // continuously from geographic polygons. No hex-boundary smoothing needed.
    // Real USGS heightmap provides natural mountain/terrain profiles.

    // ── Step 7a2: Coastal smoothing (water↔land transitions) ──
    // Two phases: first flatten land near water, then smooth water side.
    // Without this, real heightmap creates massive cliffs at lake edges.
    {
      // Reduced coastal smoothing — just enough to prevent jagged water edges
      const COAST_SMOOTH_RADIUS = 12;
      const COAST_SMOOTH_PASSES = 12;
      const COAST_LAND_FLAT_RADIUS = 8; // pull land down over 16 world units toward water level

      // BFS from land↔water boundary
      const coastVertDist = new Int16Array(totalVerts).fill(-1);
      const coastBfs: number[] = [];

      for (let row = 1; row < numRows - 1; row++) {
        for (let col = 1; col < numCols - 1; col++) {
          const vi = row * numCols + col;
          const isWater = !vertIsLand[vi];
          const cardinals = [vi - 1, vi + 1, vi - numCols, vi + numCols];
          for (const nvi of cardinals) {
            if (nvi < 0 || nvi >= totalVerts) continue;
            const nIsWater = !vertIsLand[nvi];
            if (isWater !== nIsWater) {
              coastVertDist[vi] = 0;
              coastBfs.push(vi);
              break;
            }
          }
        }
      }

      // BFS flood outward
      let bfsHead = 0;
      while (bfsHead < coastBfs.length) {
        const vi = coastBfs[bfsHead++];
        const d = coastVertDist[vi];
        if (d >= COAST_SMOOTH_RADIUS) continue;
        const row = Math.floor(vi / numCols);
        const col = vi % numCols;
        if (row < 1 || row >= numRows - 1 || col < 1 || col >= numCols - 1) continue;
        for (const nvi of [vi - 1, vi + 1, vi - numCols, vi + numCols]) {
          if (nvi >= 0 && nvi < totalVerts && coastVertDist[nvi] < 0) {
            coastVertDist[nvi] = d + 1;
            coastBfs.push(nvi);
          }
        }
      }

      // Phase 1: Flatten LAND vertices near water — pull them down toward water level
      // This prevents the massive cliff between real-heightmap land and water at Y=-12
      for (let vi = 0; vi < totalVerts; vi++) {
        if (!vertIsLand[vi]) continue; // skip water vertices
        const cd = coastVertDist[vi];
        if (cd < 0 || cd >= COAST_LAND_FLAT_RADIUS) continue;
        // Flatten strength: strongest at boundary (cd=0), fading inland
        const flatT = 1 - cd / COAST_LAND_FLAT_RADIUS;
        const flatBlend = 0.9 * flatT * flatT; // strong quadratic — must eliminate cliff walls
        // Pull toward just above water level
        const baseY = 0.3; // just above water plane at Y=0
        positions[vi * 3 + 1] = positions[vi * 3 + 1] * (1 - flatBlend) + baseY * flatBlend;
      }

      // Phase 2: Multi-pass smoothing on coastal band water vertices
      const _coastBuf = new Float32Array(totalVerts);
      for (let pass = 0; pass < COAST_SMOOTH_PASSES; pass++) {
        for (let i = 0; i < totalVerts; i++) _coastBuf[i] = positions[i * 3 + 1];
        for (let row = 1; row < numRows - 1; row++) {
          for (let col = 1; col < numCols - 1; col++) {
            const vi = row * numCols + col;
            if (coastVertDist[vi] < 0) continue;
            if (vertIsLand[vi]) continue; // only smooth water side
            const t = 1 - coastVertDist[vi] / COAST_SMOOTH_RADIUS;
            const blend = 0.5 * t * t * t;
            if (blend < 0.005) continue;
            const n = [vi - 1, vi + 1, vi - numCols, vi + numCols,
                       vi - numCols - 1, vi - numCols + 1,
                       vi + numCols - 1, vi + numCols + 1];
            let sum = 0, cnt = 0;
            for (const nvi of n) {
              if (nvi >= 0 && nvi < totalVerts) { sum += _coastBuf[nvi]; cnt++; }
            }
            if (cnt === 0) continue;
            positions[vi * 3 + 1] = _coastBuf[vi] + (sum / cnt - _coastBuf[vi]) * blend;
          }
        }
      }
    }

    // Sync gridHeights from smoothed positions before landmark sculpting
    for (let i = 0; i < totalVerts; i++) this.gridHeights![i] = positions[i * 3 + 1];

    if (yieldFn) await yieldFn();

    // ── Step 7b: Landmark sculpting — exaggerated terrain for iconic locations ──
    // Modifies heights and colors for national parks, canyons, monuments, etc.
    // Applied BEFORE smoothing so landmarks integrate naturally into the mesh.
    try {
      const { LandmarkSculptor } = await import('@/rendering/three/objects/LandmarkSculptor');
      const sculptor = new LandmarkSculptor();
      // Apply height sculpting and color tinting to raw grid arrays
      sculptor.applyToTerrain(this.gridHeights!, numCols, numRows);
      sculptor.applyTintsToColorGrid(colors, numCols, numRows, minX, minZ);
      // Sync modified heights back to positions and lookup
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const vi = row * numCols + col;
          if (vertIsLand[vi]) {
            const wx = minX + col * GRID_SPACING;
            const wz = minZ + row * GRID_SPACING;
            positions[vi * 3 + 1] = this.gridHeights![vi];
            heightLookup.set(vertKey(wx, wz), this.gridHeights![vi]);
          }
        }
      }
    } catch (e) {
      console.warn('LandmarkSculptor failed, continuing without landmarks:', e);
    }

    if (yieldFn) await yieldFn();

    // ── Step 8: Terrain boundary color blending ──
    // Check grid neighbors (not hex neighbors) for different terrain types.
    // Blend vertex colors smoothly across terrain boundaries.
    {
      const BLEND_SCALE = 0.60;

      for (let row = 1; row < numRows - 1; row++) {
        for (let col = 1; col < numCols - 1; col++) {
          const vi = row * numCols + col;
          if (!vertIsLand[vi]) continue;
          const props = vertTerrain[vi]!;
          const ownTerrain = props.terrain;

          // Check 8 grid neighbors for different terrain
          const neighbors = [
            vi - 1, vi + 1, vi - numCols, vi + numCols,
            vi - numCols - 1, vi - numCols + 1,
            vi + numCols - 1, vi + numCols + 1,
          ];

          let totalWeight = 0;
          let blendR = 0, blendG = 0, blendB = 0;

          for (const nvi of neighbors) {
            if (nvi < 0 || nvi >= totalVerts) continue;
            if (!vertIsLand[nvi]) continue;
            const nProps = vertTerrain[nvi];
            if (!nProps || nProps.terrain === ownTerrain) continue;
            if (nProps.terrain === 'water') continue;

            const nIdx = TERRAIN_INDEX[nProps.terrain] ?? -1;
            const nRGB = nIdx >= 0 ? TERRAIN_RGB_BY_IDX[nIdx] : null;
            if (!nRGB) continue;

            // Weight by noise for organic transition
            const wx = positions[vi * 3];
            const wz = positions[vi * 3 + 2];
            const noise = valueNoise2D(wx * 0.03, wz * 0.03, SEED + 4000);
            const w = 0.3 + noise * 0.7;

            blendR += nRGB[0] * w;
            blendG += nRGB[1] * w;
            blendB += nRGB[2] * w;
            totalWeight += w;
          }

          if (totalWeight <= 0) continue;

          const avgR = blendR / totalWeight;
          const avgG = blendG / totalWeight;
          const avgB = blendB / totalWeight;

          const blendAmt = Math.min(1, totalWeight / 4) * BLEND_SCALE;
          terrainBlendArr[vi] = blendAmt;

          colors[vi * 3] = colors[vi * 3] * (1 - blendAmt) + avgR * blendAmt;
          colors[vi * 3 + 1] = colors[vi * 3 + 1] * (1 - blendAmt) + avgG * blendAmt;
          colors[vi * 3 + 2] = colors[vi * 3 + 2] * (1 - blendAmt) + avgB * blendAmt;
          baseColorsArr[vi * 3] = colors[vi * 3];
          baseColorsArr[vi * 3 + 1] = colors[vi * 3 + 1];
          baseColorsArr[vi * 3 + 2] = colors[vi * 3 + 2];
        }
      }
    }

    // ── Step 9: Multi-pass Laplacian smoothing on mountain + border band ──
    const mtnVertDist = new Int16Array(totalVerts).fill(-1);

    // Seed: mountain tile vertices (dist=0) and foothill-blended vertices (dist=1)
    const mtnBfsQueue: number[] = [];
    for (let vi = 0; vi < totalVerts; vi++) {
      if (!vertIsLand[vi]) continue;
      const props = vertTerrain[vi];
      if (props && props.terrain === 'mountain') {
        mtnVertDist[vi] = 0;
        mtnBfsQueue.push(vi);
      } else if (positions[vi * 3 + 1] > 3.0) {
        mtnVertDist[vi] = 1;
        mtnBfsQueue.push(vi);
      }
    }

    // BFS outward to tag border band
    let mtnHead = 0;
    while (mtnHead < mtnBfsQueue.length) {
      const vi = mtnBfsQueue[mtnHead++];
      const d = mtnVertDist[vi];
      if (d >= MTN_SMOOTH_RADIUS) continue;
      const r = Math.floor(vi / numCols);
      const c = vi % numCols;
      if (r < 1 || r >= numRows - 1 || c < 1 || c >= numCols - 1) continue;
      for (const nvi of [vi - 1, vi + 1, vi - numCols, vi + numCols]) {
        if (nvi >= 0 && nvi < totalVerts && mtnVertDist[nvi] < 0) {
          mtnVertDist[nvi] = d + 1;
          mtnBfsQueue.push(nvi);
        }
      }
    }

    // Multi-pass Laplacian smoothing — reuse single buffer across passes
    const _smoothBuf = new Float32Array(totalVerts);
    for (let pass = 0; pass < MTN_SMOOTH_PASSES; pass++) {
      for (let i = 0; i < totalVerts; i++) _smoothBuf[i] = positions[i * 3 + 1];

      for (let row = 1; row < numRows - 1; row++) {
        for (let col = 1; col < numCols - 1; col++) {
          const vi = row * numCols + col;
          if (mtnVertDist[vi] < 0) continue;

          const isMtn = mtnVertDist[vi] === 0;
          const borderT = isMtn ? 1.0 : 1 - mtnVertDist[vi] / MTN_SMOOTH_RADIUS;
          const vertY = _smoothBuf[vi];
          let blend: number;
          if (isMtn) {
            // Mountain interior: height-dependent smoothing
            const heightFade = Math.max(0.5, 1.0 - vertY * 0.004);
            const vProps = vertTerrain[vi];
            const tileElev = vProps ? vProps.elevation : 7;
            const elevSmooth = tileElev <= 5 ? 0.15 : 0.28;
            blend = elevSmooth * borderT * heightFade;
          } else {
            // Border band: strong smoothing for foothill-to-flat transition
            blend = 0.55 * borderT * borderT * borderT;
          }
          if (blend < 0.005) continue;

          const adj = [
            vi - 1, vi + 1, vi - numCols, vi + numCols,
            vi - numCols - 1, vi - numCols + 1,
            vi + numCols - 1, vi + numCols + 1,
          ];
          let avgH = 0, count = 0;
          for (const nvi of adj) {
            if (nvi >= 0 && nvi < totalVerts) {
              avgH += _smoothBuf[nvi];
              count++;
            }
          }
          if (count === 0) continue;
          avgH /= count;

          positions[vi * 3 + 1] = _smoothBuf[vi] + (avgH - _smoothBuf[vi]) * blend;
          if (vertIsLand[vi]) {
            heightLookup.set(
              vertKey(positions[vi * 3], positions[vi * 3 + 2]),
              positions[vi * 3 + 1],
            );
          }
        }
      }
    }

    // ── Step 10: River valley carving ──
    if (this.riverData) {
      const VALLEY_CENTER_DEPTH = 15.0; // Deep enough to be visible against 100+ unit mountains
      const VALLEY_RADIUS_CELLS = 8;
      const VALLEY_WORLD_RADIUS = VALLEY_RADIUS_CELLS * GRID_SPACING;
      const riverBlend = new Float32Array(totalVerts);

      // Pass 1: sample river mask for all land vertices
      const riverMask = new Float32Array(totalVerts);
      const riverValley = new Float32Array(totalVerts);
      const riverDist = new Float32Array(totalVerts);
      riverDist.fill(Infinity);
      const riverQueue: number[] = [];

      for (let vi = 0; vi < totalVerts; vi++) {
        if (!vertIsLand[vi]) continue;
        const rwx = positions[vi * 3];
        const rwz = positions[vi * 3 + 2];
        const [mask, vd] = this.sampleRiver(rwx, rwz);
        riverMask[vi] = mask;
        riverValley[vi] = vd;
        if (mask > 0.1) {
          riverDist[vi] = 0;
          riverQueue.push(vi);
        }
      }

      // Pass 2: BFS flood-fill distance from river vertices
      const visited = new Uint8Array(totalVerts);
      for (const vi of riverQueue) visited[vi] = 1;
      let qStart = 0;
      while (qStart < riverQueue.length) {
        const vi = riverQueue[qStart++];
        const rw = Math.floor(vi / numCols);
        const cl = vi % numCols;
        const curDist = riverDist[vi];
        if (curDist >= VALLEY_WORLD_RADIUS) continue;
        const neighbors = [
          cl > 0 ? vi - 1 : -1,
          cl < numCols - 1 ? vi + 1 : -1,
          rw > 0 ? vi - numCols : -1,
          rw < numRows - 1 ? vi + numCols : -1,
        ];
        for (const ni of neighbors) {
          if (ni < 0 || visited[ni]) continue;
          if (!vertIsLand[ni]) continue;
          const ddx = positions[ni * 3] - positions[vi * 3];
          const ddz = positions[ni * 3 + 2] - positions[vi * 3 + 2];
          const dd = curDist + Math.sqrt(ddx * ddx + ddz * ddz);
          if (dd < riverDist[ni] && dd < VALLEY_WORLD_RADIUS) {
            riverDist[ni] = dd;
            if (riverValley[vi] > riverValley[ni]) riverValley[ni] = riverValley[vi];
            visited[ni] = 1;
            riverQueue.push(ni);
          }
        }
      }

      // Pass 3a: Compute locally-smoothed water Y for river center vertices
      const WATER_DROP = 1.4;
      const SMOOTH_RADIUS = 3;
      const waterTargetY = new Float32Array(totalVerts);
      waterTargetY.fill(NaN);
      {
        const riverCenterVerts: number[] = [];
        for (let vi = 0; vi < totalVerts; vi++) {
          if (riverMask[vi] > 0.15) riverCenterVerts.push(vi);
        }
        for (const vi of riverCenterVerts) {
          const rw = Math.floor(vi / numCols);
          const cl = vi % numCols;
          let sumY = 0;
          let cnt = 0;
          for (let dr = -SMOOTH_RADIUS; dr <= SMOOTH_RADIUS; dr++) {
            for (let dc = -SMOOTH_RADIUS; dc <= SMOOTH_RADIUS; dc++) {
              const nr = rw + dr, nc = cl + dc;
              if (nr < 0 || nr >= numRows || nc < 0 || nc >= numCols) continue;
              const ni = nr * numCols + nc;
              if (riverMask[ni] > 0.15) {
                sumY += positions[ni * 3 + 1];
                cnt++;
              }
            }
          }
          waterTargetY[vi] = (cnt > 0 ? sumY / cnt : positions[vi * 3 + 1]) - WATER_DROP;
        }
      }

      // Pass 3b: Apply valley depression
      for (let vi = 0; vi < totalVerts; vi++) {
        const dist = riverDist[vi];
        const mask = riverMask[vi];
        if (dist === Infinity && mask < 0.01) continue;

        const vp = vertTerrain[vi];
        let coastFade = 1.0;
        if (vp) {
          if (vp.isWater) coastFade = 0.0;
          else if (vp.elevation <= 1) coastFade = 0.5;
          else if (vp.elevation <= 2) coastFade = 0.8;
        }

        const currentY = positions[vi * 3 + 1];

        if (mask > 0.15 && !isNaN(waterTargetY[vi])) {
          const targetY = waterTargetY[vi];
          if (targetY < currentY) {
            positions[vi * 3 + 1] = targetY;
          }
          riverBlend[vi] = coastFade;
        } else if (mask > 0.01) {
          // Bank zone
          let nearestWaterY = currentY - WATER_DROP;
          const rw = Math.floor(vi / numCols);
          const cl = vi % numCols;
          let bestD2 = Infinity;
          const sr = 4;
          for (let dr = -sr; dr <= sr; dr++) {
            for (let dc = -sr; dc <= sr; dc++) {
              const nr = rw + dr, nc = cl + dc;
              if (nr < 0 || nr >= numRows || nc < 0 || nc >= numCols) continue;
              const ni = nr * numCols + nc;
              if (isNaN(waterTargetY[ni])) continue;
              const d2 = dr * dr + dc * dc;
              if (d2 < bestD2) {
                bestD2 = d2;
                nearestWaterY = waterTargetY[ni];
              }
            }
          }
          const t = mask / 0.15;
          const bankBlend = t * t * (3 - 2 * t) * coastFade;
          positions[vi * 3 + 1] = currentY * (1 - bankBlend) + nearestWaterY * bankBlend;
          riverBlend[vi] = bankBlend;
        } else {
          // Extended valley
          const vd = riverValley[vi] > 0 ? riverValley[vi] : 0.5;
          const valleyDrop = vd * VALLEY_CENTER_DEPTH * coastFade * 0.5;
          const t = 1 - dist / VALLEY_WORLD_RADIUS;
          const depression = valleyDrop * t * t;
          positions[vi * 3 + 1] -= depression;
          riverBlend[vi] = depression > 0.01 ? t * t * coastFade : 0;
        }

        positions[vi * 3 + 1] = Math.max(positions[vi * 3 + 1], -0.6);
      }

      // Smooth bank vertices
      const smoothedY = new Float32Array(totalVerts);
      for (let vi = 0; vi < totalVerts; vi++) smoothedY[vi] = positions[vi * 3 + 1];
      for (let vi = 0; vi < totalVerts; vi++) {
        const inf = riverBlend[vi];
        if (inf < 0.01 || inf > 0.9) continue;
        const rw = Math.floor(vi / numCols);
        const cl = vi % numCols;
        let sum = positions[vi * 3 + 1];
        let cnt = 1;
        if (cl > 0) { sum += positions[(vi - 1) * 3 + 1]; cnt++; }
        if (cl < numCols - 1) { sum += positions[(vi + 1) * 3 + 1]; cnt++; }
        if (rw > 0) { sum += positions[(vi - numCols) * 3 + 1]; cnt++; }
        if (rw < numRows - 1) { sum += positions[(vi + numCols) * 3 + 1]; cnt++; }
        smoothedY[vi] = positions[vi * 3 + 1] * 0.6 + (sum / cnt) * 0.4;
      }
      for (let vi = 0; vi < totalVerts; vi++) {
        if (riverBlend[vi] < 0.01) continue;
        positions[vi * 3 + 1] = smoothedY[vi];
        heightLookup.set(
          vertKey(positions[vi * 3], positions[vi * 3 + 2]),
          smoothedY[vi],
        );
      }
    }

    // ── Step 11: Generate index buffer ──
    const allIndices: number[] = [];
    for (let row = 0; row < numRows - 1; row++) {
      for (let col = 0; col < numCols - 1; col++) {
        const v00 = row * numCols + col;
        const v10 = v00 + 1;
        const v01 = v00 + numCols;
        const v11 = v01 + 1;
        const anyLand =
          vertIsLand[v00] || vertIsLand[v10] ||
          vertIsLand[v01] || vertIsLand[v11];
        if (!anyLand) continue;
        // Alternate diagonal split direction per quad to hide grid pattern
        if ((row + col) % 2 === 0) {
          allIndices.push(v00, v01, v10);
          allIndices.push(v10, v01, v11);
        } else {
          allIndices.push(v00, v01, v11);
          allIndices.push(v00, v11, v10);
        }
      }
    }

    // ── Step 12: Split into chunks by world position ──
    const chunkW = (maxX - minX + 1) / CHUNK_COLS;
    const chunkH = (maxZ - minZ + 1) / CHUNK_ROWS;

    // Map each vertex to a chunk by its world position
    const vertChunk = new Uint16Array(totalVerts);
    for (let vi = 0; vi < totalVerts; vi++) {
      const wx = positions[vi * 3];
      const wz = positions[vi * 3 + 2];
      const cc = Math.min(CHUNK_COLS - 1, Math.max(0, Math.floor((wx - minX) / chunkW)));
      const cr = Math.min(CHUNK_ROWS - 1, Math.max(0, Math.floor((wz - minZ) / chunkH)));
      vertChunk[vi] = cr * CHUNK_COLS + cc;
    }

    const totalChunks = CHUNK_COLS * CHUNK_ROWS;
    const chunkTriIndices: number[][] = Array.from({ length: totalChunks }, () => []);
    const chunkVertSets: Set<number>[] = Array.from({ length: totalChunks }, () => new Set());

    for (let i = 0; i < allIndices.length; i += 3) {
      const a = allIndices[i], b = allIndices[i + 1], c = allIndices[i + 2];
      // Use the first land vertex's chunk, or first vertex's chunk
      let chunkIdx = vertChunk[a];
      for (const v of [a, b, c]) {
        if (vertIsLand[v]) { chunkIdx = vertChunk[v]; break; }
      }
      chunkTriIndices[chunkIdx].push(a, b, c);
      chunkVertSets[chunkIdx].add(a);
      chunkVertSets[chunkIdx].add(b);
      chunkVertSets[chunkIdx].add(c);
    }

    // ── Build chunk geometries ──
    const geometries: THREE.BufferGeometry[] = [];

    for (let ci = 0; ci < totalChunks; ci++) {
      const chunkVerts = chunkVertSets[ci];
      const chunkTris = chunkTriIndices[ci];

      if (chunkVerts.size === 0) {
        const geom = new THREE.BufferGeometry();
        this.chunks.push({
          geometry: geom,
          baseColors: new Float32Array(0),
          tileIndices: [],
          tileLocalVerts: new Map(),
        });
        geometries.push(geom);
        continue;
      }

      // Build global->local mapping
      const g2l = new Map<number, number>();
      const localVerts = [...chunkVerts];
      for (let li = 0; li < localVerts.length; li++) g2l.set(localVerts[li], li);
      const localCount = localVerts.length;

      // Copy vertex data into per-chunk arrays
      const lPos = new Float32Array(localCount * 3);
      const lCol = new Float32Array(localCount * 3);
      const lBase = new Float32Array(localCount * 3);
      const lTerrain = new Float32Array(localCount);
      const lBlend = new Float32Array(localCount);
      const lSnow = new Float32Array(localCount);
      const lCoast = new Float32Array(localCount);
      const lGeo = new Float32Array(localCount * 2);
      const lUv = new Float32Array(localCount * 2);

      for (let li = 0; li < localCount; li++) {
        const gi = localVerts[li];
        const gi3 = gi * 3, li3 = li * 3;
        lPos[li3] = positions[gi3];
        lPos[li3 + 1] = positions[gi3 + 1];
        lPos[li3 + 2] = positions[gi3 + 2];
        lCol[li3] = colors[gi3];
        lCol[li3 + 1] = colors[gi3 + 1];
        lCol[li3 + 2] = colors[gi3 + 2];
        lBase[li3] = baseColorsArr[gi3];
        lBase[li3 + 1] = baseColorsArr[gi3 + 1];
        lBase[li3 + 2] = baseColorsArr[gi3 + 2];
        lTerrain[li] = terrainTypes[gi];
        lBlend[li] = terrainBlendArr[gi];
        lSnow[li] = snowCoverArr[gi];
        lCoast[li] = coastDistArr[gi];
        lGeo[li * 2] = geoCoords[gi * 2];
        lGeo[li * 2 + 1] = geoCoords[gi * 2 + 1];
        lUv[li * 2] = uvs[gi * 2];
        lUv[li * 2 + 1] = uvs[gi * 2 + 1];
      }

      // Remap triangle indices to local
      const lIndices = new Uint32Array(chunkTris.length);
      for (let j = 0; j < chunkTris.length; j++) {
        lIndices[j] = g2l.get(chunkTris[j])!;
      }

      // Build chunk->localVerts mapping (by chunk index)
      const tileLocalVerts = new Map<number, number[]>();

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(lCol, 3));
      geom.setAttribute('terrainType', new THREE.BufferAttribute(lTerrain, 1));
      geom.setAttribute('terrainBlend', new THREE.BufferAttribute(lBlend, 1));
      geom.setAttribute('snowCover', new THREE.BufferAttribute(lSnow, 1));
      geom.setAttribute('coastDist', new THREE.BufferAttribute(lCoast, 1));
      geom.setAttribute('geoCoord', new THREE.BufferAttribute(lGeo, 2));
      geom.setAttribute('uv', new THREE.BufferAttribute(lUv, 2));
      geom.setIndex(new THREE.BufferAttribute(lIndices, 1));
      geom.computeVertexNormals();

      // Gentle normal bias — prevents extreme dark faces on initial render
      const normalAttr = geom.getAttribute('normal') as THREE.BufferAttribute;
      for (let n = 0; n < localCount; n++) {
        const tt = lTerrain[n];
        const minNy = tt === TERRAIN_INDEX['mountain'] ? 0.2 : 0.3;
        let ny = normalAttr.getY(n);
        ny = Math.max(ny, minNy);
        const nx = normalAttr.getX(n), nz = normalAttr.getZ(n);
        const invLen = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
        normalAttr.setXYZ(n, nx * invLen, ny * invLen, nz * invLen);
      }

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      this.chunks.push({
        geometry: geom,
        baseColors: lBase,
        tileIndices: [],
        tileLocalVerts,
      });
      geometries.push(geom);
    }

    // ── Step 13: Finalize height grid for bilinear interpolation ──
    for (let i = 0; i < totalVerts; i++) this.gridHeights![i] = positions[i * 3 + 1];

    // ── Step 14: Publish terrain heights to GameMap ──
    // Sample grid cell centers and store by grid coord key
    const tiles = gameMap.getAllTiles();
    const terrainHeights = new Map<string, number>();
    const mountainDepths = new Map<string, number>();
    for (const t of tiles) {
      const key = `${t.q},${t.r}`;
      const w = geoToWorld(
        -114.05 + t.q * (5.0 / 160),
        42.0 - t.r * (5.0 / 140),
      );
      const gx = (w.x - minX) / GRID_SPACING;
      const gz = (w.z - minZ) / GRID_SPACING;
      const col0 = Math.max(0, Math.min(numCols - 1, Math.round(gx)));
      const row0 = Math.max(0, Math.min(numRows - 1, Math.round(gz)));
      const centerVi = row0 * numCols + col0;
      if (centerVi >= 0 && centerVi < totalVerts) {
        terrainHeights.set(key, this.gridHeights![centerVi]);
      }
      if (t.terrain === 'mountain') {
        mountainDepths.set(key, 0.5); // Default depth — no hex BFS needed
      }
    }
    gameMap.setTerrainHeights(terrainHeights);
    gameMap.setMountainDepths(mountainDepths);

    // Free build-time-only data
    this.riverData = null;

    return geometries;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // sampleHeight — bilinear interpolation on cached grid
  // ─────────────────────────────────────────────────────────────────────────

  sampleHeight(worldX: number, worldZ: number): number | undefined {
    const gh = this.gridHeights;
    if (!gh || this.gridCols <= 0) return undefined;

    const gx = (worldX - this.gridMinX) / GRID_SPACING;
    const gz = (worldZ - this.gridMinZ) / GRID_SPACING;
    const col0 = Math.floor(gx);
    const row0 = Math.floor(gz);

    if (col0 < 0 || row0 < 0 || col0 >= this.gridCols - 1 || row0 >= this.gridRows - 1) {
      return undefined;
    }

    const fx = gx - col0;
    const fz = gz - row0;
    const i00 = row0 * this.gridCols + col0;
    const i10 = i00 + 1;
    const i01 = i00 + this.gridCols;
    const i11 = i01 + 1;
    const h00 = gh[i00];
    const h10 = gh[i10];
    const h01 = gh[i01];
    const h11 = gh[i11];

    // Interpolate within the correct triangle to match the alternating
    // diagonal split used in mesh generation
    if ((row0 + col0) % 2 === 0) {
      // Even quad: diagonal v01->v10
      if (fx + fz <= 1.0) {
        return h00 + (h10 - h00) * fx + (h01 - h00) * fz;
      } else {
        return h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
      }
    } else {
      // Odd quad: diagonal v00->v11
      if (fz >= fx) {
        return h00 + (h11 - h01) * fx + (h01 - h00) * fz;
      } else {
        return h00 + (h10 - h00) * fx + (h11 - h10) * fz;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // dispose — cleanup all GPU resources
  // ─────────────────────────────────────────────────────────────────────────

  dispose(): void {
    for (const chunk of this.chunks) {
      chunk.geometry.dispose();
    }
    this.chunks = [];
    this.gridHeights = null;
    this.riverData = null;
  }
}
