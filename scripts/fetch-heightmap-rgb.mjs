#!/usr/bin/env node
/**
 * Fetches real elevation data and saves as an RGB-encoded PNG where:
 *   elevation_meters = R * 256 + G + B * (1/256) + OFFSET
 *
 * This gives 16-bit precision (0-65535) via R and G channels,
 * plus fractional precision from B.
 *
 * Also outputs a raw Float32 binary file for maximum precision.
 *
 * Usage: node scripts/fetch-heightmap-rgb.mjs [zoom]
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public');

const BOUNDS = { west: -114.05, east: -109.05, south: 37.0, north: 42.0 };
const ZOOM = parseInt(process.argv[2] || '9', 10);
const TILE_SIZE = 256;

function lonToTileX(lon, z) { return Math.floor(((lon + 180) / 360) * (1 << z)); }
function latToTileY(lat, z) {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * (1 << z));
}
function tileXToLon(x, z) { return (x / (1 << z)) * 360 - 180; }
function tileYToLat(y, z) {
  const n = Math.PI - (2 * Math.PI * y) / (1 << z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

const xMin = lonToTileX(BOUNDS.west, ZOOM);
const xMax = lonToTileX(BOUNDS.east, ZOOM);
const yMin = latToTileY(BOUNDS.north, ZOOM);
const yMax = latToTileY(BOUNDS.south, ZOOM);

const tilesX = xMax - xMin + 1;
const tilesY = yMax - yMin + 1;
const totalPixelsX = tilesX * TILE_SIZE;
const totalPixelsY = tilesY * TILE_SIZE;

console.log(`Zoom: ${ZOOM}, Tiles: ${tilesX}x${tilesY} = ${tilesX * tilesY}`);
console.log(`Output: ${totalPixelsX}x${totalPixelsY} pixels`);

const tileBounds = {
  west: tileXToLon(xMin, ZOOM),
  east: tileXToLon(xMax + 1, ZOOM),
  north: tileYToLat(yMin, ZOOM),
  south: tileYToLat(yMax + 1, ZOOM),
};
console.log(`Geo: ${tileBounds.west.toFixed(3)}° to ${tileBounds.east.toFixed(3)}°, ${tileBounds.south.toFixed(3)}° to ${tileBounds.north.toFixed(3)}°`);

async function fetchTile(x, y, z, retries = 3) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return Buffer.from(await resp.arrayBuffer());
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

async function decodeTile(pngBuf) {
  const { data, info } = await sharp(pngBuf).raw().toBuffer({ resolveWithObject: true });
  const elevations = new Float32Array(info.width * info.height);
  for (let i = 0; i < elevations.length; i++) {
    const r = data[i * info.channels];
    const g = data[i * info.channels + 1];
    const b = data[i * info.channels + 2];
    elevations[i] = (r * 256 + g + b / 256) - 32768;
  }
  return elevations;
}

console.log('\nFetching tiles...');
const allElevations = new Float32Array(totalPixelsX * totalPixelsY);
let fetched = 0;
const total = tilesX * tilesY;

const tileJobs = [];
for (let ty = yMin; ty <= yMax; ty++) {
  for (let tx = xMin; tx <= xMax; tx++) {
    tileJobs.push({ tx, ty });
  }
}

for (let i = 0; i < tileJobs.length; i += 10) {
  const batch = tileJobs.slice(i, i + 10);
  await Promise.all(batch.map(async ({ tx, ty }) => {
    const pngBuf = await fetchTile(tx, ty, ZOOM);
    const elevs = await decodeTile(pngBuf);
    const ox = (tx - xMin) * TILE_SIZE;
    const oy = (ty - yMin) * TILE_SIZE;
    for (let row = 0; row < TILE_SIZE; row++) {
      for (let col = 0; col < TILE_SIZE; col++) {
        allElevations[(oy + row) * totalPixelsX + (ox + col)] = elevs[row * TILE_SIZE + col];
      }
    }
    fetched++;
    process.stdout.write(`\r  ${fetched}/${total}`);
  }));
}
console.log('\n');

let minElev = Infinity, maxElev = -Infinity;
for (let i = 0; i < allElevations.length; i++) {
  if (allElevations[i] < minElev) minElev = allElevations[i];
  if (allElevations[i] > maxElev) maxElev = allElevations[i];
}
console.log(`Elevation: ${minElev.toFixed(0)}m to ${maxElev.toFixed(0)}m (${(maxElev - minElev).toFixed(0)}m relief)`);

// Save as raw Float32 binary — exact precision, no encoding loss
const binPath = join(OUTPUT_DIR, 'utah-elevation.bin');
writeFileSync(binPath, Buffer.from(allElevations.buffer));
console.log(`Raw binary: ${binPath} (${(allElevations.byteLength / 1024 / 1024).toFixed(1)} MB)`);

// Save as RGB PNG — 16-bit precision via R*256+G encoding
// Offset elevation so 0 in file = minElev
const range = maxElev - minElev || 1;
const rgbData = Buffer.alloc(totalPixelsX * totalPixelsY * 3);
for (let i = 0; i < allElevations.length; i++) {
  const normalized = (allElevations[i] - minElev) / range; // 0-1
  const val16 = Math.round(normalized * 65535); // 0-65535
  rgbData[i * 3] = (val16 >> 8) & 0xFF;     // R = high byte
  rgbData[i * 3 + 1] = val16 & 0xFF;         // G = low byte
  rgbData[i * 3 + 2] = 0;                     // B = unused
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const pngPath = join(OUTPUT_DIR, 'utah-elevation.png');
await sharp(rgbData, {
  raw: { width: totalPixelsX, height: totalPixelsY, channels: 3 },
}).png({ compressionLevel: 6 }).toFile(pngPath);
console.log(`RGB PNG: ${pngPath}`);

// Save metadata
const meta = {
  width: totalPixelsX,
  height: totalPixelsY,
  zoom: ZOOM,
  bounds: tileBounds,
  elevation: { min: minElev, max: maxElev },
  encoding: 'R*256+G gives 0-65535 mapping to min-max elevation in meters',
};
writeFileSync(join(OUTPUT_DIR, 'utah-elevation-meta.json'), JSON.stringify(meta, null, 2));
console.log('Done!');
