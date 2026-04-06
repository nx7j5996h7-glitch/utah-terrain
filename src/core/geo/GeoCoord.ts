/**
 * GeoCoord.ts — 1:1 metric geographic coordinate ↔ world-space conversion.
 *
 * Maps WGS84 (lon, lat) to Three.js world space (x, z) where 1 world unit = 1 meter.
 * Uses a simple equirectangular projection corrected for Utah's latitude.
 *
 * Orientation: north at top (screen up), east on right.
 * Camera at azimuth=PI looks north from south of center.
 *
 * World coordinates are all negative (matching the original system's sign convention):
 *   - X goes from 0 (UTAH_WEST) to ~-429,000 (UTAH_EAST)
 *   - Z goes from 0 (UTAH_NORTH) to ~-556,600 (UTAH_SOUTH)
 */

import {
  UTAH_WEST,
  UTAH_EAST,
  UTAH_NORTH,
  UTAH_SOUTH,
} from '@/constants';

// ── Metric conversion constants ──────────────────────────────────────────
// WGS84 meters per degree at Utah's central latitude (39.5°)
const CENTRAL_LAT_RAD = 39.5 * Math.PI / 180;
const METERS_PER_DEG_LON = 111320 * Math.cos(CENTRAL_LAT_RAD);  // ≈ 85,816 m/deg
const METERS_PER_DEG_LAT = 111320;                                // ≈ 111,320 m/deg

// Sign convention: X and Z are negative (east and south from reference corner)
// This matches the original system where geoToWorld(UTAH_WEST, UTAH_NORTH) = (0, 0)
const WS_X_PER_DEG = -METERS_PER_DEG_LON;   // ≈ -85,816
const WS_Z_PER_DEG = -METERS_PER_DEG_LAT;   // ≈ -111,320

/**
 * Convert geographic coordinates to world-space position.
 * 1 world unit = 1 meter. Origin at (UTAH_WEST, UTAH_NORTH).
 */
export function geoToWorld(lon: number, lat: number): { x: number; z: number } {
  return {
    x: (lon - UTAH_WEST) * WS_X_PER_DEG,
    z: (UTAH_NORTH - lat) * WS_Z_PER_DEG,
  };
}

/**
 * Convert world-space position back to geographic coordinates.
 * Inverse of geoToWorld.
 */
export function worldToGeo(wx: number, wz: number): { lon: number; lat: number } {
  return {
    lon: UTAH_WEST + wx / WS_X_PER_DEG,
    lat: UTAH_NORTH - wz / WS_Z_PER_DEG,
  };
}

// ── World bounds ───────────────────────────────────────────────────────────

const _nw = geoToWorld(UTAH_WEST, UTAH_NORTH);   // (0, 0)
const _se = geoToWorld(UTAH_EAST, UTAH_SOUTH);    // (~-429080, ~-556600)

/** World-space bounding box of the full Utah map. */
export const WORLD_BOUNDS = {
  minX: Math.min(_nw.x, _se.x),
  maxX: Math.max(_nw.x, _se.x),
  minZ: Math.min(_nw.z, _se.z),
  maxZ: Math.max(_nw.z, _se.z),
};

/** World-space center of the map. */
export const WORLD_CENTER = {
  x: (WORLD_BOUNDS.minX + WORLD_BOUNDS.maxX) / 2,
  z: (WORLD_BOUNDS.minZ + WORLD_BOUNDS.maxZ) / 2,
};

/** World-space width and depth of the map (positive values). */
export const WORLD_WIDTH = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
export const WORLD_DEPTH = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;

/**
 * Compute world-space bounding box with padding (in meters).
 */
export function computeWorldBounds(padding = 1000): {
  minX: number; minZ: number; maxX: number; maxZ: number;
} {
  return {
    minX: WORLD_BOUNDS.minX - padding,
    maxX: WORLD_BOUNDS.maxX + padding,
    minZ: WORLD_BOUNDS.minZ - padding,
    maxZ: WORLD_BOUNDS.maxZ + padding,
  };
}
