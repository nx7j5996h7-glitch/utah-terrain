/**
 * UtahMapData.ts — Hex-based map generation pipeline for Utah terrain.
 *
 * Imports geographic data from src/data/ files and runs the multi-step
 * generation pipeline to produce TileData[] for the hex grid.
 */

import {
  MAP_WIDTH, MAP_HEIGHT,
  UTAH_WEST, UTAH_NORTH,
  DEG_PER_HEX_LON, DEG_PER_HEX_LAT,
  type TerrainType, type TerrainFeature,
} from '@/constants';
import type { TileData } from './Tile';
import { sampleElevationGeo, isHeightmapLoaded } from '@/rendering/RealHeightMap';

// Import all geographic data
import { WATER_BODIES } from '@/data/waterBodies';
import { REGIONS, TERRAIN_ZONES } from '@/data/regions';
import { MOUNTAIN_RANGES } from '@/data/mountains';
import { RIVERS } from '@/data/rivers';
import { ROADS } from '@/data/roads';
import { CITIES } from '@/data/cities';
import { FEATURE_ZONES } from '@/data/featureZones';
import { FORMATION_ZONES } from '@/data/formations';
import { PARKS } from '@/data/parks';

// Re-export for use by rendering systems
export { MOUNTAIN_RANGES } from '@/data/mountains';
export { RIVERS } from '@/data/rivers';
export { ROADS } from '@/data/roads';
export { PARKS } from '@/data/parks';
export { CITIES } from '@/data/cities';
export { WATER_BODIES } from '@/data/waterBodies';

// === Geometry Utilities ===

function geoToHex(lon: number, lat: number): { q: number; r: number } {
  const q = Math.round((lon - UTAH_WEST) / DEG_PER_HEX_LON);
  const r = Math.round((UTAH_NORTH - lat) / DEG_PER_HEX_LAT);
  return { q, r };
}

export function hexToGeo(q: number, r: number): { lon: number; lat: number } {
  const lon = UTAH_WEST + q * DEG_PER_HEX_LON;
  const lat = UTAH_NORTH - r * DEG_PER_HEX_LAT;
  return { lon, lat };
}

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
// GENERATION PIPELINE
// ============================================================

export function generateUtahMap(): TileData[] {
  const tiles: TileData[] = [];
  const tileMap = new Map<string, TileData>();

  for (let q = 0; q < MAP_WIDTH; q++) {
    for (let r = 0; r < MAP_HEIGHT; r++) {
      const { lon, lat } = hexToGeo(q, r);

      // Defaults
      let terrain: TerrainType = 'desert';
      let region = 'Unknown';
      let elevation = 2;
      let city: string | undefined;
      let waterway: string | undefined;
      let road: string | undefined;
      let roadType: TileData['roadType'];
      let feature: TerrainFeature | undefined;
      let park: string | undefined;
      let parkType: TileData['parkType'];
      let formation: number | undefined;
      let waterColor: string | undefined;

      // Step 1: Check water bodies (checked first — water bodies override land)
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

      // Step 2: Check Antelope Island carve-out (within GSL but should be land)
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
        // Step 3: Check regions (sets base terrain and region name)
        for (const reg of REGIONS) {
          if (pointInPolygon(lon, lat, reg.polygon)) {
            terrain = reg.terrain;
            region = reg.name;
            elevation = reg.elevation ?? 2;
            break;
          }
        }

        // Step 4: Check terrain zones (override terrain within regions)
        for (const tz of TERRAIN_ZONES) {
          if (pointInPolygon(lon, lat, tz.polygon)) {
            terrain = tz.terrain;
            if (tz.elevation !== undefined) elevation = tz.elevation;
            break;
          }
        }

        // Step 5: Check mountain ranges (override to mountain terrain)
        for (const mt of MOUNTAIN_RANGES) {
          if (pointInPolygon(lon, lat, mt.polygon)) {
            terrain = 'mountain';
            elevation = mt.elevation;
            break;
          }
        }

        // Step 5b: Elevation-based terrain refinement using real heightmap
        // If the real elevation is high but the tile is typed 'desert' or 'sagebrush',
        // upgrade it — the hand-drawn polygons don't cover every mountain slope
        if (terrain === 'desert' || terrain === 'sagebrush') {
          if (isHeightmapLoaded()) {
            const realElev = sampleElevationGeo(lon, lat);
            if (realElev !== undefined) {
              if (realElev > 2800) {
                // Above ~9200 ft — conifer forest zone
                terrain = 'conifer_forest';
                elevation = Math.min(14, Math.round(realElev / 300));
              } else if (realElev > 2200) {
                // Above ~7200 ft — mountain/woodland zone
                terrain = 'mountain';
                elevation = Math.min(12, Math.round(realElev / 350));
              } else if (realElev > 1800 && terrain === 'desert') {
                // Above ~5900 ft desert → sagebrush (it's not desert at that elevation)
                terrain = 'sagebrush';
                elevation = Math.round(realElev / 400);
              }
            }
          }
        }

        // Step 6: Check rivers — mark waterway for shader overlay rendering.
        // Do NOT change terrain type — rivers are rendered as blue overlay on
        // whatever terrain they cross. Changing terrain to river_valley creates
        // unrealistic bright green bands over canyon/mountain terrain.
        for (const river of RIVERS) {
          const dist = distToPolyline(lon, lat, river.points);
          if (dist < river.width * 0.04) {
            waterway = river.name;
            break;
          }
        }

        // Step 7: Check roads
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

        // Step 8: Check feature zones
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

        // Step 9: Check formation zones
        for (const fz of FORMATION_ZONES) {
          if (pointInPolygon(lon, lat, fz.polygon)) {
            formation = fz.formation;
            break;
          }
        }

        // Step 10: Check parks (overlay — doesn't change terrain)
        if (!park) {
          for (const p of PARKS) {
            if (p.name === 'Antelope Island') continue; // already handled
            if (pointInPolygon(lon, lat, p.polygon)) {
              park = p.name;
              parkType = p.type;
              break;
            }
          }
        }
      }

      // Step 11: Check cities (force to urban + land)
      for (const c of CITIES) {
        const cHex = geoToHex(c.lon, c.lat);
        if (cHex.q === q && cHex.r === r) {
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

      // If still unknown region, label based on position
      if (region === 'Unknown' && !isWater) {
        region = 'Utah';
      }

      const tile: TileData = {
        q, r, terrain, region, elevation,
        city, waterway, road, roadType,
        feature, park, parkType,
        formation, waterColor,
      };

      tileMap.set(`${q},${r}`, tile);
      tiles.push(tile);
    }
  }

  return tiles;
}
