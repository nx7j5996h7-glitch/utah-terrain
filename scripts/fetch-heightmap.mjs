#!/usr/bin/env node
/**
 * Fetches real USGS-derived elevation data from AWS Terrain Tiles (Mapzen Terrarium format)
 * and creates a 16-bit grayscale PNG heightmap of Utah.
 *
 * Tile encoding (Terrarium): elevation = (R * 256 + G + B / 256) - 32768
 *
 * Usage: node scripts/fetch-heightmap.mjs [zoom]
 * Default zoom: 9 (~150m/pixel, good balance of detail and size)
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public');

// Utah bounding box
const BOUNDS = { west: -114.05, east: -109.05, south: 37.0, north: 42.0 };

const ZOOM = parseInt(process.argv[2] || '9', 10);
const TILE_SIZE = 256;

// --- Tile math ---
function lonToTileX(lon, z) {
  return Math.floor(((lon + 180) / 360) * (1 << z));
}
function latToTileY(lat, z) {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * (1 << z));
}
function tileXToLon(x, z) {
  return (x / (1 << z)) * 360 - 180;
}
function tileYToLat(y, z) {
  const n = Math.PI - (2 * Math.PI * y) / (1 << z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

const xMin = lonToTileX(BOUNDS.west, ZOOM);
const xMax = lonToTileX(BOUNDS.east, ZOOM);
const yMin = latToTileY(BOUNDS.north, ZOOM); // y is inverted (north = smaller y)
const yMax = latToTileY(BOUNDS.south, ZOOM);

const tilesX = xMax - xMin + 1;
const tilesY = yMax - yMin + 1;
const totalPixelsX = tilesX * TILE_SIZE;
const totalPixelsY = tilesY * TILE_SIZE;

console.log(`Zoom level: ${ZOOM}`);
console.log(`Tile range: X=${xMin}-${xMax} (${tilesX} tiles), Y=${yMin}-${yMax} (${tilesY} tiles)`);
console.log(`Total tiles: ${tilesX * tilesY}`);
console.log(`Output size: ${totalPixelsX} x ${totalPixelsY} pixels`);
console.log(`Geo coverage: ${tileXToLon(xMin, ZOOM).toFixed(2)}°W to ${tileXToLon(xMax + 1, ZOOM).toFixed(2)}°W, ${tileYToLat(yMax + 1, ZOOM).toFixed(2)}°N to ${tileYToLat(yMin, ZOOM).toFixed(2)}°N`);

// Fetch a single tile
async function fetchTile(x, y, z, retries = 3) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
      return Buffer.from(await resp.arrayBuffer());
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

// Decode Terrarium tile to elevation array
async function decodeTile(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const elevations = new Float32Array(info.width * info.height);
  for (let i = 0; i < elevations.length; i++) {
    const r = data[i * info.channels];
    const g = data[i * info.channels + 1];
    const b = data[i * info.channels + 2];
    elevations[i] = (r * 256 + g + b / 256) - 32768;
  }
  return elevations;
}

// --- Main ---
console.log('\nFetching tiles...');
const allElevations = new Float32Array(totalPixelsX * totalPixelsY);
let fetched = 0;
const total = tilesX * tilesY;

// Fetch tiles in batches of 10 to avoid overwhelming the server
const tileJobs = [];
for (let ty = yMin; ty <= yMax; ty++) {
  for (let tx = xMin; tx <= xMax; tx++) {
    tileJobs.push({ tx, ty });
  }
}

const BATCH_SIZE = 10;
for (let i = 0; i < tileJobs.length; i += BATCH_SIZE) {
  const batch = tileJobs.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(async ({ tx, ty }) => {
    const pngBuf = await fetchTile(tx, ty, ZOOM);
    const elevs = await decodeTile(pngBuf);

    // Copy into full image
    const ox = (tx - xMin) * TILE_SIZE;
    const oy = (ty - yMin) * TILE_SIZE;
    for (let row = 0; row < TILE_SIZE; row++) {
      for (let col = 0; col < TILE_SIZE; col++) {
        const srcIdx = row * TILE_SIZE + col;
        const dstIdx = (oy + row) * totalPixelsX + (ox + col);
        allElevations[dstIdx] = elevs[srcIdx];
      }
    }
    fetched++;
    process.stdout.write(`\r  ${fetched}/${total} tiles fetched`);
  }));
}
console.log('\n');

// Find min/max elevation
let minElev = Infinity, maxElev = -Infinity;
for (let i = 0; i < allElevations.length; i++) {
  if (allElevations[i] < minElev) minElev = allElevations[i];
  if (allElevations[i] > maxElev) maxElev = allElevations[i];
}
console.log(`Elevation range: ${minElev.toFixed(0)}m to ${maxElev.toFixed(0)}m`);
console.log(`Relief: ${(maxElev - minElev).toFixed(0)}m`);

// Encode as 16-bit grayscale PNG
// Value 0 = minElev, value 65535 = maxElev
const range = maxElev - minElev || 1;
const output16 = new Uint16Array(totalPixelsX * totalPixelsY);
for (let i = 0; i < allElevations.length; i++) {
  output16[i] = Math.round(((allElevations[i] - minElev) / range) * 65535);
}

// sharp expects Buffer for 16-bit grayscale
const buf16 = Buffer.from(output16.buffer);

// Swap endianness (sharp expects native endian, Uint16Array is little-endian on most systems)
// Actually sharp with raw input handles this correctly

mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, 'utah-heightmap.png');

await sharp(buf16, {
  raw: {
    width: totalPixelsX,
    height: totalPixelsY,
    channels: 1,
  },
})
  .png({ compressionLevel: 9 })
  .toFile(outPath);

// Also write metadata JSON
const metaPath = join(OUTPUT_DIR, 'utah-heightmap-meta.json');
const meta = {
  width: totalPixelsX,
  height: totalPixelsY,
  zoom: ZOOM,
  bounds: {
    west: tileXToLon(xMin, ZOOM),
    east: tileXToLon(xMax + 1, ZOOM),
    north: tileYToLat(yMin, ZOOM),
    south: tileYToLat(yMax + 1, ZOOM),
  },
  elevation: {
    min: minElev,
    max: maxElev,
  },
};
writeFileSync(metaPath, JSON.stringify(meta, null, 2));

console.log(`\nWritten: ${outPath}`);
console.log(`Metadata: ${metaPath}`);
console.log(`Size: ${totalPixelsX}x${totalPixelsY} pixels`);
console.log('Done!');
