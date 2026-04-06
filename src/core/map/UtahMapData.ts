/**
 * UtahMapData.ts — Continuous terrain sampling for Utah terrain.
 *
 * Provides sampleTerrainAt(lon, lat) which returns terrain properties
 * for any continuous geographic point. No hex quantization.
 *
 * Also provides generateUtahMap() for backward compatibility with
 * GameMap-based systems during the transition.
 */

import {
  type TerrainType, type TerrainFeature,
} from '@/constants';
import type { TileData } from './Tile';
import { sampleElevationGeo, isHeightmapLoaded } from '@/rendering/RealHeightMap';

// Import all geographic data
import { WATER_BODIES } from '@/data/waterBodies';
import { REGIONS, TERRAIN_ZONES } from '@/data/regions';
import { MOUNTAIN_RANGES } from '@/data/mountains';
import { RIVERS } from '@/data/rivers-detailed';
import { ROADS } from '@/data/roads';
import { CITIES } from '@/data/cities';
import { FEATURE_ZONES } from '@/data/featureZones';
import { FORMATION_ZONES } from '@/data/formations';
import { PARKS } from '@/data/parks';

// Re-export for use by rendering systems
export { MOUNTAIN_RANGES } from '@/data/mountains';
export { RIVERS } from '@/data/rivers-detailed';
export { ROADS } from '@/data/roads';
export { PARKS } from '@/data/parks';
export { CITIES } from '@/data/cities';
export { WATER_BODIES } from '@/data/waterBodies';

// === Geometry Utilities ===

function pointInPolygon(px: number, py: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function distToPolyline(px: number, py: number, line: [number, number][]): number {
  let minDist = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const ax = line[i][0], ay = line[i][1];
    const bx = line[i + 1][0], by = line[i + 1][1];
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    const d = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ============================================================
// TERRAIN PROPERTIES — result of sampling at a point
// ============================================================

export interface TerrainProperties {
  terrain: TerrainType;
  region: string;
  elevation: number;
  city?: string;
  waterway?: string;
  road?: string;
  roadType?: 'interstate' | 'highway' | 'road';
  feature?: TerrainFeature;
  park?: string;
  parkType?: TileData['parkType'];
  formation?: number;
  waterColor?: string;
  isWater: boolean;
}

// ============================================================
// CONTINUOUS TERRAIN SAMPLER
// ============================================================

/**
 * Sample terrain properties at any continuous geographic point.
 * Runs the same multi-step pipeline as the old hex-based generator,
 * but operates on continuous (lon, lat) without hex quantization.
 */
export function sampleTerrainAt(lon: number, lat: number): TerrainProperties {
  let terrain: TerrainType = 'desert';
  let region = 'Unknown';
  let elevation = 2;
  let city: string | undefined;
  let waterway: string | undefined;
  let road: string | undefined;
  let roadType: TerrainProperties['roadType'];
  let feature: TerrainFeature | undefined;
  let park: string | undefined;
  let parkType: TerrainProperties['parkType'];
  let formation: number | undefined;
  let waterColor: string | undefined;

  // Step 1: Check water bodies
  let isWater = false;
  for (const wb of WATER_BODIES) {
    if (pointInPolygon(lon, lat, wb.polygon)) {
      terrain = 'water';
      waterway = wb.name;
      isWater = true;
      if (wb.color) waterColor = wb.color;
      break;
    }
  }

  // Step 2: Antelope Island carve-out
  if (isWater) {
    const antelopeIsland = PARKS.find(p => p.name === 'Antelope Island');
    if (antelopeIsland && pointInPolygon(lon, lat, antelopeIsland.polygon)) {
      isWater = false;
      terrain = 'sagebrush';
      region = 'Great Basin';
      elevation = 3;
      park = 'Antelope Island';
      parkType = 'state_park';
    }
  }

  if (!isWater) {
    // Step 3: Regions
    for (const reg of REGIONS) {
      if (pointInPolygon(lon, lat, reg.polygon)) {
        terrain = reg.terrain;
        region = reg.name;
        elevation = reg.elevation ?? 2;
        break;
      }
    }

    // Step 4: Terrain zones
    for (const tz of TERRAIN_ZONES) {
      if (pointInPolygon(lon, lat, tz.polygon)) {
        terrain = tz.terrain;
        if (tz.elevation !== undefined) elevation = tz.elevation;
        break;
      }
    }

    // Step 5: Mountain ranges
    for (const mt of MOUNTAIN_RANGES) {
      if (pointInPolygon(lon, lat, mt.polygon)) {
        terrain = 'mountain';
        elevation = mt.elevation;
        break;
      }
    }

    // Step 5b: Elevation-based terrain refinement
    // Upgrades terrain that shouldn't exist at high elevation.
    // salt_flat, desert, sagebrush, urban, marsh are wrong above treeline.
    const lowTerrains: Set<string> = new Set([
      'salt_flat', 'desert', 'sagebrush', 'urban', 'marsh', 'canyon_floor',
    ]);
    if (lowTerrains.has(terrain)) {
      if (isHeightmapLoaded()) {
        const realElev = sampleElevationGeo(lon, lat);
        if (realElev !== undefined) {
          if (realElev > 2800) {
            terrain = 'conifer_forest';
            elevation = Math.min(14, Math.round(realElev / 300));
          } else if (realElev > 2200) {
            terrain = 'mountain';
            elevation = Math.min(12, Math.round(realElev / 350));
          } else if (realElev > 1800 && (terrain === 'desert' || terrain === 'salt_flat')) {
            terrain = 'sagebrush';
            elevation = Math.round(realElev / 400);
          }
        }
      }
    }

    // Step 6: Rivers (overlay only — don't change terrain type)
    for (const river of RIVERS) {
      const dist = distToPolyline(lon, lat, river.points);
      if (dist < river.width * 0.04) {
        waterway = river.name;
        break;
      }
    }

    // Step 7: Roads
    for (const rd of ROADS) {
      const dist = distToPolyline(lon, lat, rd.points);
      if (dist < rd.width * 0.04) {
        if (!roadType ||
            (rd.type === 'interstate' && roadType !== 'interstate') ||
            (rd.type === 'highway' && roadType === 'road')) {
          road = rd.name;
          roadType = rd.type;
        }
      }
    }

    // Step 8: Feature zones
    for (const fz of FEATURE_ZONES) {
      if (pointInPolygon(lon, lat, fz.polygon)) {
        const ff = fz.feature;
        if ((ff === 'dense_forest' || ff === 'forest' || ff === 'woodland') &&
            terrain !== 'conifer_forest' && terrain !== 'mountain' &&
            terrain !== 'sagebrush' && terrain !== 'river_valley') {
          continue;
        }
        feature = ff;
        break;
      }
    }

    // Step 9: Formation zones
    for (const fz of FORMATION_ZONES) {
      if (pointInPolygon(lon, lat, fz.polygon)) {
        formation = fz.formation;
        break;
      }
    }

    // Step 10: Parks
    if (!park) {
      for (const p of PARKS) {
        if (p.name === 'Antelope Island') continue;
        if (pointInPolygon(lon, lat, p.polygon)) {
          park = p.name;
          parkType = p.type;
          break;
        }
      }
    }
  }

  // Step 11: Cities (closest city within threshold)
  for (const c of CITIES) {
    const dLon = Math.abs(lon - c.lon);
    const dLat = Math.abs(lat - c.lat);
    // ~3.5km city tile radius (half a hex in old system)
    if (dLon < 0.02 && dLat < 0.02) {
      city = c.name;
      terrain = 'urban';
      isWater = false;
      if (elevation < 1) elevation = 1;
      if (region === 'Unknown') {
        for (const reg of REGIONS) {
          if (pointInPolygon(c.lon, c.lat, reg.polygon)) {
            region = reg.name;
            break;
          }
        }
      }
      break;
    }
  }

  if (region === 'Unknown' && !isWater) {
    region = 'Utah';
  }

  return {
    terrain, region, elevation,
    city, waterway, road, roadType,
    feature, park, parkType,
    formation, waterColor, isWater,
  };
}

// ============================================================
// LEGACY: generateUtahMap for GameMap compatibility
// Now generates from a regular geographic grid instead of hex tiles.
// Each "tile" represents a geographic cell.
// ============================================================

/** Grid dimensions for the tile lookup grid. */
export const GRID_COLS = 160;
export const GRID_ROWS = 140;

const UTAH_LON_RANGE = -109.05 - (-114.05); // 5.0 degrees
const UTAH_LAT_RANGE = 42.0 - 37.0;          // 5.0 degrees
const DEG_PER_COL = UTAH_LON_RANGE / GRID_COLS;
const DEG_PER_ROW = UTAH_LAT_RANGE / GRID_ROWS;

export function gridToGeo(col: number, row: number): { lon: number; lat: number } {
  return {
    lon: -114.05 + col * DEG_PER_COL,
    lat: 42.0 - row * DEG_PER_ROW,
  };
}

export function geoToGrid(lon: number, lat: number): { col: number; row: number } {
  return {
    col: Math.round((lon - (-114.05)) / DEG_PER_COL),
    row: Math.round((42.0 - lat) / DEG_PER_ROW),
  };
}

export function generateUtahMap(): TileData[] {
  const tiles: TileData[] = [];

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      const { lon, lat } = gridToGeo(col, row);
      const props = sampleTerrainAt(lon, lat);

      const tile: TileData = {
        q: col,
        r: row,
        terrain: props.terrain,
        region: props.region,
        elevation: props.elevation,
        city: props.city,
        waterway: props.waterway,
        road: props.road,
        roadType: props.roadType,
        feature: props.feature,
        park: props.park,
        parkType: props.parkType,
        formation: props.formation,
        waterColor: props.waterColor,
      };

      tiles.push(tile);
    }
  }

  return tiles;
}
