/**
 * Generates a per-tile RGBA DataTexture encoding regional visual modifiers.
 * The shader reads this texture to vary terrain appearance by geographic region
 * without adding new TerrainType enums.
 *
 * Texture channels:
 *   R: Mountain ridge direction (0-255, 128=no angle, mapped from -PI to PI)
 *   G: Regional color tint index (0-255)
 *   B: Special terrain feature index (0=none, 1-5)
 *   A: Snow cover (0-255, based on elevation)
 *
 * Uses the same grid dimensions as the hex map (MAP_WIDTH x MAP_HEIGHT) so
 * each pixel corresponds to one hex tile at (q, r).
 */

import * as THREE from 'three';
import { GameMap } from '@/core/map/GameMap';
import { MAP_WIDTH, MAP_HEIGHT } from '@/constants';
import { REGION_TINT, RANGE_RIDGE_ANGLES } from './RegionalMappings';
import { MOUNTAIN_RANGES } from '@/data/mountains';

// ─── Point-in-polygon for mountain range detection ─────────────────────────
export function pointInPolygon(x: number, y: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export class RegionalFeatureMap {
  private texture: THREE.DataTexture | null = null;

  build(gameMap: GameMap): void {
    const data = new Uint8Array(MAP_WIDTH * MAP_HEIGHT * 4);

    for (const tile of gameMap.getAllTiles()) {
      const idx = (tile.r * MAP_WIDTH + tile.q) * 4;
      if (tile.q < 0 || tile.q >= MAP_WIDTH || tile.r < 0 || tile.r >= MAP_HEIGHT) continue;

      // R: ridge angle
      // Check which mountain range this tile belongs to
      if (tile.terrain === 'mountain') {
        // TODO: proper ridge angle from RANGE_RIDGE_ANGLES
        data[idx] = 128;
      } else {
        data[idx] = 128;
      }

      // G: regional tint
      data[idx + 1] = REGION_TINT[tile.region] ?? 0;

      // B: feature type (encode feature as index 0-17)
      data[idx + 2] = 0; // TODO: feature index

      // A: snow/elevation (higher = more snow potential)
      const snowLine = tile.elevation >= 12 ? 255 :
                       tile.elevation >= 10 ? 180 :
                       tile.elevation >= 8 ? 80 : 0;
      data[idx + 3] = snowLine;
    }

    if (this.texture) this.texture.dispose();
    this.texture = new THREE.DataTexture(data, MAP_WIDTH, MAP_HEIGHT, THREE.RGBAFormat);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.DataTexture | null { return this.texture; }

  getSize(): THREE.Vector2 { return new THREE.Vector2(MAP_WIDTH, MAP_HEIGHT); }

  dispose(): void {
    if (this.texture) { this.texture.dispose(); this.texture = null; }
  }
}
