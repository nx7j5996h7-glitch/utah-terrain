/**
 * Generates continuous world-space height values for Utah terrain.
 * Uses ridged noise for sharp mountain ridgelines with large-scale FBM variation.
 * Also provides micro-elevation and hillshade for non-mountain terrain types.
 *
 * Adapted from Aveneg's HeightMapGenerator for Utah's terrain palette.
 */

import { GLOBAL_TERRAIN_SEED, ELEVATION_SCALE, VERTICAL_EXAGGERATION } from '@/constants';
import { worldToGeo } from '@/core/geo/GeoCoord';
import type { TerrainType } from '@/constants';
import {
  ridgedNoise2D,
  fbm2D,
  domainWarpedFbm,
  directionalNoise,
  erosionNoise2D,
  voronoi2D,
  valueNoise2D,
  smoothstep,
} from './ProceduralNoise';
import { sampleElevationGeo, isHeightmapLoaded } from './RealHeightMap';

const SEED = GLOBAL_TERRAIN_SEED;

// Light direction (0.893, 0.643, 1) matches sun at Three.js (250, 280, -180)
const LIGHT_X = 250 / 280;
const LIGHT_Y = 180 / 280;
const INV_SQRT_LIGHT = 1 / Math.sqrt(LIGHT_X * LIGHT_X + LIGHT_Y * LIGHT_Y + 1);

const SQRT3 = Math.sqrt(3);

// Unique seed offsets per terrain to avoid cross-terrain correlation
const TERRAIN_SEED_OFFSETS: Record<string, number> = {
  salt_flat: 3000,
  desert: 3100,
  sagebrush: 3200,
  red_sandstone: 3300,
  white_sandstone: 3400,
  canyon_floor: 3500,
  conifer_forest: 3600,
  alpine: 3700,
  river_valley: 3800,
  marsh: 3900,
  urban: 4000,
  badlands: 4100,
  lava_field: 4200,
};

// =========================================================================
// Mountain height sampling
// =========================================================================

/**
 * Sample mountain height at world coordinates.
 * Returns 0–1 where 0 is valley floor, 1 is peak.
 *
 * @param worldX World-space X coordinate
 * @param worldY World-space Y (Z) coordinate
 * @param mountainDepth 0-1 normalized depth from mountain edge (used externally, not used in noise)
 * @param ridgeAngle Optional directional ridge angle in degrees (0-360)
 * @param mountainType 'range' (ridged), 'laccolith' (dome), or 'plateau' (flat-topped)
 */
function sampleMountainHeight(
  worldX: number,
  worldY: number,
  mountainDepth: number = 1,
  ridgeAngle: number = 0,
  mountainType: 'range' | 'laccolith' | 'plateau' = 'range',
): number {
  if (mountainType === 'laccolith') {
    return sampleLaccolith(worldX, worldY);
  }
  if (mountainType === 'plateau') {
    return samplePlateau(worldX, worldY, ridgeAngle);
  }

  // ── 'range' type: ridged mountain range ──

  // Domain warp: organic distortion of all noise coordinates
  const warpAmt = 6.0;
  const wx = worldX + fbm2D(worldX * 0.006, worldY * 0.006, SEED + 2070, 3) * warpAmt;
  const wy = worldY + fbm2D(worldX * 0.006 + 5.3, worldY * 0.006 + 1.7, SEED + 2071, 3) * warpAmt;

  // Voronoi peak clustering
  const vor = voronoi2D(wx * 0.007, wy * 0.007, SEED + 2050);
  const cellEdge = vor.dist2 - vor.dist;
  const t = Math.min(1, Math.max(0, (cellEdge - 0.02) * 3.0));
  const clusterMask = t * t * (3 - 2 * t);

  // Spatially varying roughness
  const roughness = fbm2D(wx * 0.01, wy * 0.01, SEED + 2080, 2);

  // Core noise layers
  const ridge = ridgedNoise2D(wx * 0.03, wy * 0.03, SEED + 2000, 4);
  const large = fbm2D(wx * 0.012, wy * 0.012, SEED + 2001, 3);
  const peaks = domainWarpedFbm(wx * 0.02, wy * 0.02, SEED + 2003, 3, 0.5);
  const peakShape = peaks * peaks * Math.sqrt(peaks); // pow 2.5
  const erosion = erosionNoise2D(wx * 0.025, wy * 0.025, SEED + 2004, 3, 1.8);
  const secondary = ridgedNoise2D(wx * 0.06, wy * 0.06, SEED + 2005, 3);

  // High-freq detail modulated by roughness
  const roughMod = 0.5 + roughness * 0.5;
  const peakBumps = ridgedNoise2D(wx * 0.08, wy * 0.08, SEED + 2006, 2) * roughMod;
  const micro = fbm2D(wx * 0.10, wy * 0.10, SEED + 2002, 2) * roughMod;

  // Valley network: slope-smoothing corridors
  const valleyRidge = ridgedNoise2D(wx * 0.011, wy * 0.011, SEED + 2060, 3);
  const valleySmooth = Math.max(0, 1.0 - valleyRidge);

  // Directional ridge bias
  let dirRidge = 0;
  if (ridgeAngle !== 0) {
    const angleRad = (ridgeAngle * Math.PI) / 180;
    dirRidge = directionalNoise(wx * 0.025, wy * 0.025, angleRad, 4, SEED + 2010);
    const perpAngle = angleRad + Math.PI * 0.5;
    const crossRidge = directionalNoise(wx * 0.03, wy * 0.03, perpAngle, 2.5, SEED + 2011);
    dirRidge = dirRidge * 0.65 + crossRidge * 0.35;
  }

  // Combine
  const dirWeight = dirRidge > 0 ? 0.22 : 0;
  const isoWeight = 1 - dirWeight;
  const shape = (ridge * 0.26 + large * 0.22 + peakShape * 0.13 + secondary * 0.12) * isoWeight
    + dirRidge * dirWeight;
  const carved = shape * (0.45 + erosion * 0.55);
  const raw = carved + peakBumps * 0.10 + micro * 0.06;

  // Voronoi clustering
  const clustered = raw * (0.60 + clusterMask * 0.40);

  // Valley corridors: smooth along the valley axis
  const smoothTarget = large * 0.50 + 0.08;
  const deviation = Math.abs(clustered - smoothTarget);

  const gradStep = 8.0;
  const hLeft = ridgedNoise2D((wx - gradStep) * 0.03, wy * 0.03, SEED + 2001, 4);
  const hRight = ridgedNoise2D((wx + gradStep) * 0.03, wy * 0.03, SEED + 2001, 4);
  const hUp = ridgedNoise2D(wx * 0.03, (wy - gradStep) * 0.03, SEED + 2001, 4);
  const hDown = ridgedNoise2D(wx * 0.03, (wy + gradStep) * 0.03, SEED + 2001, 4);
  const gradX = Math.abs(hRight - hLeft) / (gradStep * 2);
  const gradZ = Math.abs(hDown - hUp) / (gradStep * 2);
  const alongValleySteepness = Math.min(gradX, gradZ);

  const slopeAwareBlend = valleySmooth * (0.35 + deviation * 0.6 + alongValleySteepness * 1.5);
  const valleyBlend = Math.min(slopeAwareBlend, 0.65);
  const valleyed = clustered * (1.0 - valleyBlend) + smoothTarget * valleyBlend;

  let h = Math.max(0, Math.min(1, (valleyed - 0.03) * 2.1));

  // Peak softening
  if (h > 0.85) return 0.85 + (h - 0.85) * 0.40;
  if (h > 0.62) return 0.62 + (h - 0.62) * 0.82;
  return h;
}

/** Laccolith dome profile — La Sal, Henry, Abajo, Navajo Mountain */
function sampleLaccolith(worldX: number, worldY: number): number {
  // Smooth dome shape from domain-warped noise
  const dome = domainWarpedFbm(worldX * 0.008, worldY * 0.008, SEED + 5000, 3, 0.4);
  const broad = fbm2D(worldX * 0.005, worldY * 0.005, SEED + 5001, 2);
  // Rock detail
  const detail = ridgedNoise2D(worldX * 0.04, worldY * 0.04, SEED + 5002, 3);
  // Dome peaks up in middle, gentle falloff
  const domeShape = dome * dome; // emphasize peaks
  return Math.min(1, domeShape * 0.55 + broad * 0.30 + detail * 0.15);
}

/** Plateau profile — flat-topped with steep edges (e.g., Aquarius, Markagunt) */
function samplePlateau(worldX: number, worldY: number, ridgeAngle: number): number {
  // Broad elevation defines the plateau surface
  const broad = fbm2D(worldX * 0.006, worldY * 0.006, SEED + 6000, 3);
  // Quantize to create flat tops with steep transitions
  const stepped = Math.floor(broad * 4) / 4;
  const smooth = broad;
  // Blend stepped and smooth for semi-flat top with natural variation
  const base = stepped * 0.6 + smooth * 0.4;
  // Edge detail — ridged noise for cliff edges
  const cliff = ridgedNoise2D(worldX * 0.02, worldY * 0.02, SEED + 6001, 3);
  // Surface texture
  const surface = fbm2D(worldX * 0.03, worldY * 0.03, SEED + 6002, 2);
  // Optional directional bias
  let dir = 0;
  if (ridgeAngle !== 0) {
    const angleRad = (ridgeAngle * Math.PI) / 180;
    dir = directionalNoise(worldX * 0.015, worldY * 0.015, angleRad, 3, SEED + 6003);
  }

  return Math.min(1, base * 0.50 + cliff * 0.20 + surface * 0.15 + dir * 0.15);
}

// =========================================================================
// Hillshade
// =========================================================================

/**
 * Compute mountain hillshade using finite differences.
 * Light direction matches DirectionalLight at (250, 280, -180).
 * Returns 0–1 where 0 is fully shadowed, 1 is fully lit.
 */
function hillshade(worldX: number, worldY: number, step: number): number {
  const hL = sampleMountainHeight(worldX - step, worldY);
  const hR = sampleMountainHeight(worldX + step, worldY);
  const hU = sampleMountainHeight(worldX, worldY - step);
  const hD = sampleMountainHeight(worldX, worldY + step);

  const dhdx = (hR - hL) / (2 * step);
  const dhdy = (hD - hU) / (2 * step);

  return Math.max(0, (-LIGHT_X * dhdx - LIGHT_Y * dhdy + 1) * INV_SQRT_LIGHT);
}

// =========================================================================
// Per-terrain desert/landscape height
// =========================================================================

/**
 * Sample micro-elevation for non-mountain terrain types.
 * Returns 0–1 height value shaped to each terrain's geology.
 *
 * @param worldX World-space X coordinate
 * @param worldY World-space Y (Z) coordinate
 * @param terrainType Utah terrain type string
 */
function sampleDesertHeight(worldX: number, worldY: number, terrainType: TerrainType): number {
  const offset = TERRAIN_SEED_OFFSETS[terrainType] ?? 4500;

  switch (terrainType) {
    case 'salt_flat': {
      // Nearly zero variation — just micro ripples and polygon cracks
      const vor = voronoi2D(worldX * 0.03, worldY * 0.03, SEED + offset);
      const poly = smoothstep(0.02, 0.08, vor.dist2 - vor.dist);
      const gentle = fbm2D(worldX * 0.002, worldY * 0.002, SEED + offset + 1, 2);
      return poly * 0.02 + gentle * 0.03; // ~0.05 scale
    }

    case 'desert': {
      // Gentle rolling dunes
      const duneRidge = directionalNoise(worldX * 0.04, worldY * 0.04, Math.PI * 0.15, 4, SEED + offset);
      const broad = fbm2D(worldX * 0.008, worldY * 0.008, SEED + offset + 1, 2);
      const erode = erosionNoise2D(worldX * 0.03, worldY * 0.03, SEED + offset + 2, 2, Math.PI * 0.15);
      return (duneRidge * 0.4 + broad * 0.45 + erode * 0.15) * 0.35;
    }

    case 'sagebrush': {
      // Gentle rolling with mesa hints
      const rolling = fbm2D(worldX * 0.015, worldY * 0.015, SEED + offset, 3);
      const mesaBase = fbm2D(worldX * 0.008, worldY * 0.008, SEED + offset + 1, 2);
      const mesa = smoothstep(0.4, 0.6, mesaBase);
      const broad = fbm2D(worldX * 0.005, worldY * 0.005, SEED + offset + 2, 2);
      const erode = erosionNoise2D(worldX * 0.02, worldY * 0.02, SEED + offset + 3, 2, 0);
      return (rolling * 0.3 + mesa * 0.25 + broad * 0.3 + erode * 0.15) * 0.40;
    }

    case 'red_sandstone': {
      // Mesa-like stepped terrain
      const mesaBase = fbm2D(worldX * 0.01, worldY * 0.01, SEED + offset, 3);
      const mesa = Math.floor(mesaBase * 5) / 5; // quantize for ledges
      const crossBed = directionalNoise(worldX * 0.06, worldY * 0.06, Math.PI * 0.1, 5, SEED + offset + 1);
      const broad = fbm2D(worldX * 0.006, worldY * 0.006, SEED + offset + 2, 2);
      const detail = ridgedNoise2D(worldX * 0.04, worldY * 0.04, SEED + offset + 3, 3);
      return (mesa * 0.35 + crossBed * 0.15 + broad * 0.3 + detail * 0.2) * 0.50;
    }

    case 'white_sandstone': {
      // Dome-like smooth terrain (Navajo Sandstone)
      const domeN = domainWarpedFbm(worldX * 0.012, worldY * 0.012, SEED + offset, 2, 0.3);
      const rolling = fbm2D(worldX * 0.008, worldY * 0.008, SEED + offset + 1, 2);
      const soft = valueNoise2D(worldX * 0.02, worldY * 0.02, SEED + offset + 2);
      return (domeN * 0.45 + rolling * 0.35 + soft * 0.2) * 0.45;
    }

    case 'canyon_floor': {
      // Low flat with gentle rolling
      const gentle = fbm2D(worldX * 0.005, worldY * 0.005, SEED + offset, 2);
      const micro = valueNoise2D(worldX * 0.03, worldY * 0.03, SEED + offset + 1);
      return (gentle * 0.7 + micro * 0.3) * 0.15;
    }

    case 'conifer_forest': {
      // Moderate rolling hills
      const rolling = fbm2D(worldX * 0.012, worldY * 0.012, SEED + offset, 3);
      const broad = fbm2D(worldX * 0.005, worldY * 0.005, SEED + offset + 1, 2);
      const detail = valueNoise2D(worldX * 0.04, worldY * 0.04, SEED + offset + 2);
      return (rolling * 0.4 + broad * 0.4 + detail * 0.2) * 0.45;
    }

    case 'alpine': {
      // Rough rocky terrain
      const rock = ridgedNoise2D(worldX * 0.03, worldY * 0.03, SEED + offset, 4);
      const snow = fbm2D(worldX * 0.015, worldY * 0.015, SEED + offset + 1, 2);
      const micro = ridgedNoise2D(worldX * 0.08, worldY * 0.08, SEED + offset + 2, 3);
      return (rock * 0.4 + snow * 0.35 + micro * 0.25) * 0.55;
    }

    case 'river_valley': {
      // Low gentle terrain
      const gentle = fbm2D(worldX * 0.006, worldY * 0.006, SEED + offset, 2);
      const micro = valueNoise2D(worldX * 0.025, worldY * 0.025, SEED + offset + 1);
      return (gentle * 0.6 + micro * 0.4) * 0.20;
    }

    case 'marsh': {
      // Very low flat — hummock patterns
      const vor = voronoi2D(worldX * 0.05, worldY * 0.05, SEED + offset);
      const hummock = smoothstep(0.3, 0.1, vor.dist);
      const gentle = fbm2D(worldX * 0.008, worldY * 0.008, SEED + offset + 1, 2);
      return (hummock * 0.4 + gentle * 0.6) * 0.10;
    }

    case 'urban': {
      // Nearly flat with gentle broad variation
      const broad = fbm2D(worldX * 0.006, worldY * 0.006, SEED + offset, 2);
      const gentle = valueNoise2D(worldX * 0.015, worldY * 0.015, SEED + offset + 1);
      return (broad * 0.6 + gentle * 0.4) * 0.05;
    }

    case 'badlands': {
      // Rough eroded terrain (Mancos Shale)
      const ripple = ridgedNoise2D(worldX * 0.12, worldY * 0.12, SEED + offset, 5);
      const broad = fbm2D(worldX * 0.01, worldY * 0.01, SEED + offset + 1, 2);
      const erode = erosionNoise2D(worldX * 0.06, worldY * 0.06, SEED + offset + 2, 3, Math.PI * 0.3);
      return (ripple * 0.35 + broad * 0.35 + erode * 0.3) * 0.50;
    }

    case 'lava_field': {
      // Rough blocky basalt flow texture
      const vor = voronoi2D(worldX * 0.04, worldY * 0.04, SEED + offset);
      const cracks = smoothstep(0.05, 0.15, vor.dist2 - vor.dist);
      const rough = ridgedNoise2D(worldX * 0.05, worldY * 0.05, SEED + offset + 1, 4);
      const flow = directionalNoise(worldX * 0.02, worldY * 0.02, Math.PI * 0.6, 2, SEED + offset + 2);
      return (cracks * 0.3 + rough * 0.4 + flow * 0.3) * 0.40;
    }

    default:
      return fbm2D(worldX * 0.02, worldY * 0.02, SEED, 2) * 0.3;
  }
}

// =========================================================================
// Real heightmap sampling — world coords to real USGS elevation
// =========================================================================

// worldToGeo is imported from @/core/geo/GeoCoord

/**
 * Get terrain height from real USGS heightmap data + micro-detail noise.
 * The real data provides the base elevation (mountains, canyons, valleys,
 * mesas, salt flats all in correct positions). Procedural noise adds only
 * fine-grain surface texture.
 *
 * @param worldX World-space X coordinate
 * @param worldY World-space Y (Z) coordinate (positive Y = south in world space)
 * @returns World-space height value, or 0 if heightmap not loaded / outside bounds
 */
function sampleRealHeight(worldX: number, worldY: number): number {
  if (!isHeightmapLoaded()) return 0;

  // worldY is pixel-Y (positive south), worldZ = -pixelY
  const geo = worldToGeo(worldX, -worldY);
  const realElev = sampleElevationGeo(geo.lon, geo.lat);
  if (realElev === undefined) return 0;

  // Convert meters to world units with exaggeration
  // Utah relief: 226m to 4354m = 4128m range
  const normalizedElev = (realElev - 226) / 4128;

  // 8x vertical exaggeration (was 18x — now more realistic proportions)
  const worldHeight = normalizedElev * ELEVATION_SCALE * VERTICAL_EXAGGERATION;

  // Add micro-detail noise for surface texture (very subtle)
  const microNoise = fbm2D(worldX * 0.05, worldY * 0.05, SEED, 2) * 0.5;

  return worldHeight + microNoise;
}

// =========================================================================
// Utility samplers (color noise, coast perturbation)
// =========================================================================

function sampleCoastPerturb(wx: number, wz: number): { dx: number; dz: number } {
  const scale = 0.015;
  const strength = 4.0;
  const dx = (valueNoise2D(wx * scale, wz * scale, SEED + 2000) - 0.5) * strength;
  const dz = (valueNoise2D(wx * scale, wz * scale, SEED + 2100) - 0.5) * strength;
  return { dx, dz };
}

function sampleColorNoise(wx: number, wz: number): number {
  return fbm2D(wx * 0.012, wz * 0.012, SEED + 3000, 2);
}

function sampleFineColorNoise(wx: number, wz: number): number {
  return valueNoise2D(wx * 0.04, wz * 0.04, SEED + 3100);
}

// =========================================================================
// Export
// =========================================================================

/** Simple dome profile for laccolith mountains: 1 at center, 0 at edge */
function dome(d: number): number {
  if (d >= 1) return 0;
  return Math.sqrt(1 - d * d);
}

export const heightMap = {
  sampleMountainHeight,
  /** Alias: sample mountain height at a position with optional ridge angle */
  sample: (wx: number, wy: number, ridgeAngle?: number) =>
    sampleMountainHeight(wx, wy, 1, ridgeAngle ?? 0),
  /** Alias: sample terrain micro-height for non-mountain terrain */
  sampleTerrain: sampleDesertHeight,
  /** Real USGS heightmap-based height sampling */
  sampleRealHeight,
  hillshade,
  sampleDesertHeight,
  sampleLaccolith,
  samplePlateau,
  sampleCoastPerturb,
  sampleColorNoise,
  sampleFineColorNoise,
  dome,
};
