/**
 * GeoCoord.ts — Direct geographic coordinate ↔ world-space conversion.
 *
 * Maps WGS84 (lon, lat) to Three.js world space (x, z).
 * Uses the same scale as the original hex-derived system (~4800x7600 world units).
 *
 * Orientation: north at top (screen up), east on right.
 * Camera at azimuth=PI looks north from south of center.
 */

import {
  UTAH_WEST,
  UTAH_EAST,
  UTAH_NORTH,
  UTAH_SOUTH,
} from '@/constants';

const SQRT3 = Math.sqrt(3);

// ── Derived world-space constants ──────────────────────────────────────────
// These produce numerically identical coordinates to the original hex system:
//   With HEX_SIZE=20, MAP_WIDTH=160, MAP_HEIGHT=140

const DEG_LON_RANGE = UTAH_EAST - UTAH_WEST;   // 5.0 degrees
const DEG_LAT_RANGE = UTAH_NORTH - UTAH_SOUTH;  // 5.0 degrees

// Per-degree world-space scale factors
const WS_X_PER_DEG = -30 / DEG_LON_RANGE * 160;  // = -960
const WS_Z_LON_PER_DEG = -(SQRT3 * 10) / DEG_LON_RANGE * 160; // ≈ -554.26
const WS_Z_LAT_PER_DEG = -(SQRT3 * 20) / DEG_LAT_RANGE * 140; // ≈ -969.95

/**
 * Convert geographic coordinates to world-space position.
 * This is the canonical function — all rendering code should use this.
 */
export function geoToWorld(lon: number, lat: number): { x: number; z: number } {
  const dLon = lon - UTAH_WEST;
  const dLat = lat - UTAH_NORTH; // negative (south of north boundary)
  return {
    x: WS_X_PER_DEG * dLon,
    z: WS_Z_LON_PER_DEG * dLon + WS_Z_LAT_PER_DEG * (-dLat),
  };
}

/**
 * Convert world-space position back to geographic coordinates.
 * Inverse of geoToWorld.
 */
export function worldToGeo(wx: number, wz: number): { lon: number; lat: number } {
  const dLon = wx / WS_X_PER_DEG;
  const dLatFromNorth = (wz - WS_Z_LON_PER_DEG * dLon) / WS_Z_LAT_PER_DEG;
  return {
    lon: UTAH_WEST + dLon,
    lat: UTAH_NORTH - dLatFromNorth,
  };
}

// ── World bounds ───────────────────────────────────────────────────────────

const _sw = geoToWorld(UTAH_WEST, UTAH_SOUTH);
const _ne = geoToWorld(UTAH_EAST, UTAH_NORTH);
const _nw = geoToWorld(UTAH_WEST, UTAH_NORTH);
const _se = geoToWorld(UTAH_EAST, UTAH_SOUTH);

/** World-space bounding box of the full Utah map. */
export const WORLD_BOUNDS = {
  minX: Math.min(_sw.x, _ne.x, _nw.x, _se.x),
  maxX: Math.max(_sw.x, _ne.x, _nw.x, _se.x),
  minZ: Math.min(_sw.z, _ne.z, _nw.z, _se.z),
  maxZ: Math.max(_sw.z, _ne.z, _nw.z, _se.z),
};

/** World-space center of the map. */
export const WORLD_CENTER = {
  x: (WORLD_BOUNDS.minX + WORLD_BOUNDS.maxX) / 2,
  z: (WORLD_BOUNDS.minZ + WORLD_BOUNDS.maxZ) / 2,
};

/** World-space width and depth of the map. */
export const WORLD_WIDTH = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
export const WORLD_DEPTH = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;

/**
 * Compute world-space bounding box with padding.
 */
export function computeWorldBounds(padding = 20): {
  minX: number; minZ: number; maxX: number; maxZ: number;
} {
  return {
    minX: WORLD_BOUNDS.minX - padding,
    maxX: WORLD_BOUNDS.maxX + padding,
    minZ: WORLD_BOUNDS.minZ - padding,
    maxZ: WORLD_BOUNDS.maxZ + padding,
  };
}
