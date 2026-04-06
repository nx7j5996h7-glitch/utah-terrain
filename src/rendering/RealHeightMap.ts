/**
 * Loads and samples the real USGS-derived heightmap for Utah.
 *
 * The heightmap is an RGB PNG where elevation is encoded as:
 *   elevation_normalized = R * 256 + G  (0-65535 range)
 *   elevation_meters = MIN_ELEV + (normalized / 65535) * RANGE
 *
 * This gives 16-bit precision (65,536 elevation levels = ~6cm per level)
 * through the standard 8-bit-per-channel canvas API.
 */

// Heightmap metadata (from fetch-heightmap-rgb.mjs output)
const HEIGHTMAP_BOUNDS = {
  west: -114.609375,
  east: -108.984375,
  north: 42.03297433244139,
  south: 36.5978891330702,
};
const HEIGHTMAP_MIN_ELEV = 226;   // meters
const HEIGHTMAP_MAX_ELEV = 4354;  // meters
const HEIGHTMAP_RANGE = HEIGHTMAP_MAX_ELEV - HEIGHTMAP_MIN_ELEV; // 4128m

let heightmapData: Uint16Array | null = null;
let heightmapWidth = 0;
let heightmapHeight = 0;
let loaded = false;

/** Load the RGB-encoded elevation PNG. Call once during init. */
export async function loadHeightmap(): Promise<void> {
  const img = new Image();
  img.src = './utah-elevation.png';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load utah-elevation.png'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  heightmapWidth = img.width;
  heightmapHeight = img.height;
  heightmapData = new Uint16Array(img.width * img.height);

  // Decode R*256+G → 16-bit elevation
  for (let i = 0; i < heightmapData.length; i++) {
    const r = imageData.data[i * 4];
    const g = imageData.data[i * 4 + 1];
    heightmapData[i] = r * 256 + g; // 0-65535
  }

  loaded = true;
  console.log(`Heightmap loaded: ${heightmapWidth}x${heightmapHeight}, 16-bit precision (${HEIGHTMAP_MIN_ELEV}m to ${HEIGHTMAP_MAX_ELEV}m)`);
}

/** Sample elevation in meters at a geographic coordinate. Bilinear interpolation. */
export function sampleElevationGeo(lon: number, lat: number): number | undefined {
  if (!loaded || !heightmapData) return undefined;

  const u = (lon - HEIGHTMAP_BOUNDS.west) / (HEIGHTMAP_BOUNDS.east - HEIGHTMAP_BOUNDS.west);
  const v = (HEIGHTMAP_BOUNDS.north - lat) / (HEIGHTMAP_BOUNDS.north - HEIGHTMAP_BOUNDS.south);

  if (u < 0 || u > 1 || v < 0 || v > 1) return undefined;

  const px = u * (heightmapWidth - 1);
  const py = v * (heightmapHeight - 1);

  const x0 = Math.floor(px);
  const y0 = Math.floor(py);
  const x1 = Math.min(x0 + 1, heightmapWidth - 1);
  const y1 = Math.min(y0 + 1, heightmapHeight - 1);
  const fx = px - x0;
  const fy = py - y0;

  const v00 = heightmapData[y0 * heightmapWidth + x0];
  const v10 = heightmapData[y0 * heightmapWidth + x1];
  const v01 = heightmapData[y1 * heightmapWidth + x0];
  const v11 = heightmapData[y1 * heightmapWidth + x1];

  const val16 = v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) +
                v01 * (1 - fx) * fy + v11 * fx * fy;

  return HEIGHTMAP_MIN_ELEV + (val16 / 65535) * HEIGHTMAP_RANGE;
}

/** Sample elevation in world-space Y units (with exaggeration). */
export function sampleElevationWorld(lon: number, lat: number, exaggeration: number): number {
  const meters = sampleElevationGeo(lon, lat);
  if (meters === undefined) return 0;
  // Normalize to 0-1 range, then apply exaggeration
  const normalized = (meters - HEIGHTMAP_MIN_ELEV) / HEIGHTMAP_RANGE;
  return normalized * exaggeration;
}

export function isHeightmapLoaded(): boolean {
  return loaded;
}

export function getElevationRange(): { min: number; max: number } {
  return { min: HEIGHTMAP_MIN_ELEV, max: HEIGHTMAP_MAX_ELEV };
}
