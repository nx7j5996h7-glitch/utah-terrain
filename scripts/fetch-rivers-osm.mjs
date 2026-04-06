#!/usr/bin/env node
/**
 * Fetches detailed river paths from OpenStreetMap via the Overpass API.
 * Stitches multi-way segments into continuous polylines.
 * Applies Douglas-Peucker simplification with tighter tolerance near iconic meanders.
 * Outputs src/data/rivers-detailed.ts with per-river colors and meter-based widths.
 *
 * Usage: node scripts/fetch-rivers-osm.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'rivers-detailed.ts');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Utah bounding box
const UTAH_BBOX = '36.9,-114.1,42.1,-108.9';

// Iconic meander zones — use tighter simplification tolerance
const MEANDER_ZONES = [
  { name: 'Dead Horse Point', minLon: -109.80, maxLon: -109.65, minLat: 38.38, maxLat: 38.52 },
  { name: 'Goosenecks', minLon: -110.00, maxLon: -109.85, minLat: 37.12, maxLat: 37.22 },
  { name: 'Cataract Canyon', minLon: -110.15, maxLon: -109.80, minLat: 37.80, maxLat: 38.25 },
  { name: 'Zion Narrows', minLon: -113.00, maxLon: -112.90, minLat: 37.25, maxLat: 37.35 },
  { name: 'Labyrinth Canyon', minLon: -110.20, maxLon: -109.90, minLat: 38.40, maxLat: 38.90 },
];

// River definitions with metadata
const RIVER_DEFS = [
  { name: 'Colorado River', widthMeters: 150, color: [0.55, 0.35, 0.17], valleyDepth: 0.9, valleyWidth: 2.0 },
  { name: 'Green River', widthMeters: 90, color: [0.45, 0.50, 0.35], valleyDepth: 0.8, valleyWidth: 1.8 },
  { name: 'San Juan River', widthMeters: 70, color: [0.55, 0.35, 0.17], valleyDepth: 0.85, valleyWidth: 1.5 },
  { name: 'Virgin River', widthMeters: 20, color: [0.25, 0.55, 0.50], valleyDepth: 0.95, valleyWidth: 1.0 },
  { name: 'Bear River', widthMeters: 40, color: [0.15, 0.42, 0.52], valleyDepth: 0.3, valleyWidth: 1.2 },
  { name: 'Sevier River', widthMeters: 25, color: [0.35, 0.40, 0.30], valleyDepth: 0.4, valleyWidth: 1.0 },
  { name: 'Weber River', widthMeters: 20, color: [0.15, 0.42, 0.52], valleyDepth: 0.5, valleyWidth: 1.0 },
  { name: 'Provo River', widthMeters: 15, color: [0.15, 0.42, 0.52], valleyDepth: 0.5, valleyWidth: 0.8 },
  { name: 'Jordan River', widthMeters: 15, color: [0.20, 0.38, 0.45], valleyDepth: 0.15, valleyWidth: 0.8 },
  { name: 'Duchesne River', widthMeters: 15, color: [0.40, 0.38, 0.28], valleyDepth: 0.4, valleyWidth: 1.0 },
  { name: 'Price River', widthMeters: 12, color: [0.40, 0.38, 0.28], valleyDepth: 0.5, valleyWidth: 0.8 },
  { name: 'San Rafael River', widthMeters: 10, color: [0.40, 0.38, 0.28], valleyDepth: 0.5, valleyWidth: 0.8 },
  { name: 'Fremont River', widthMeters: 12, color: [0.48, 0.35, 0.22], valleyDepth: 0.6, valleyWidth: 0.8 },
  { name: 'Dirty Devil River', widthMeters: 15, color: [0.48, 0.29, 0.19], valleyDepth: 0.7, valleyWidth: 1.0 },
  { name: 'Escalante River', widthMeters: 8, color: [0.30, 0.45, 0.40], valleyDepth: 0.7, valleyWidth: 0.6 },
  { name: 'Dolores River', widthMeters: 20, color: [0.50, 0.32, 0.18], valleyDepth: 0.6, valleyWidth: 1.0 },
  { name: 'White River', widthMeters: 25, color: [0.40, 0.40, 0.32], valleyDepth: 0.4, valleyWidth: 1.0 },
];

// ── Overpass Query ─────────────────────────────────────────────────────────

async function fetchRiverFromOverpass(riverName) {
  // Escape for Overpass regex
  const escapedName = riverName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const query = `
[out:json][timeout:120][bbox:${UTAH_BBOX}];
(
  way["waterway"="river"]["name"="${riverName}"];
  way["waterway"="river"]["name"~"^${escapedName}$",i];
);
out body;
>;
out skel qt;
`;

  console.log(`  Fetching ${riverName}...`);

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) {
    console.error(`  HTTP ${res.status} for ${riverName}`);
    return null;
  }

  const data = await res.json();
  return data;
}

// ── Segment Stitching ──────────────────────────────────────────────────────

function stitchSegments(osmData) {
  // Build node ID → coordinate lookup
  const nodeCoords = new Map();
  for (const el of osmData.elements) {
    if (el.type === 'node') {
      nodeCoords.set(el.id, [el.lon, el.lat]);
    }
  }

  // Extract way segments as coordinate arrays
  const segments = [];
  for (const el of osmData.elements) {
    if (el.type === 'way' && el.nodes) {
      const coords = [];
      for (const nid of el.nodes) {
        const c = nodeCoords.get(nid);
        if (c) coords.push(c);
      }
      if (coords.length >= 2) {
        segments.push({ coords, startNode: el.nodes[0], endNode: el.nodes[el.nodes.length - 1] });
      }
    }
  }

  if (segments.length === 0) return [];

  // Stitch segments end-to-end by matching node IDs
  const used = new Set();
  const chains = [];

  // Build adjacency: node ID → [segment indices that start/end there]
  const nodeToSegs = new Map();
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    for (const nid of [seg.startNode, seg.endNode]) {
      if (!nodeToSegs.has(nid)) nodeToSegs.set(nid, []);
      nodeToSegs.get(nid).push(i);
    }
  }

  for (let startIdx = 0; startIdx < segments.length; startIdx++) {
    if (used.has(startIdx)) continue;
    used.add(startIdx);

    let chain = [...segments[startIdx].coords];
    let currentEndNode = segments[startIdx].endNode;
    let currentStartNode = segments[startIdx].startNode;

    // Extend forward
    let changed = true;
    while (changed) {
      changed = false;
      const candidates = nodeToSegs.get(currentEndNode) || [];
      for (const ci of candidates) {
        if (used.has(ci)) continue;
        const seg = segments[ci];
        if (seg.startNode === currentEndNode) {
          // Append forward
          chain.push(...seg.coords.slice(1));
          currentEndNode = seg.endNode;
          used.add(ci);
          changed = true;
          break;
        } else if (seg.endNode === currentEndNode) {
          // Append reversed
          const reversed = [...seg.coords].reverse();
          chain.push(...reversed.slice(1));
          currentEndNode = seg.startNode;
          used.add(ci);
          changed = true;
          break;
        }
      }
    }

    // Extend backward
    changed = true;
    while (changed) {
      changed = false;
      const candidates = nodeToSegs.get(currentStartNode) || [];
      for (const ci of candidates) {
        if (used.has(ci)) continue;
        const seg = segments[ci];
        if (seg.endNode === currentStartNode) {
          // Prepend forward
          chain = [...seg.coords.slice(0, -1), ...chain];
          currentStartNode = seg.startNode;
          used.add(ci);
          changed = true;
          break;
        } else if (seg.startNode === currentStartNode) {
          // Prepend reversed
          const reversed = [...seg.coords].reverse();
          chain = [...reversed.slice(0, -1), ...chain];
          currentStartNode = seg.endNode;
          used.add(ci);
          changed = true;
          break;
        }
      }
    }

    chains.push(chain);
  }

  // Return the longest chain (main river course)
  // Also return other chains longer than 10 points (major tributaries/sections)
  chains.sort((a, b) => b.length - a.length);
  return chains;
}

// ── Douglas-Peucker Simplification ─────────────────────────────────────────

function perpendicularDistance(point, lineStart, lineEnd) {
  const [px, py] = point;
  const [ax, ay] = lineStart;
  const [bx, by] = lineEnd;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}

function isInMeanderZone(lon, lat) {
  for (const zone of MEANDER_ZONES) {
    if (lon >= zone.minLon && lon <= zone.maxLon &&
        lat >= zone.minLat && lat <= zone.maxLat) {
      return true;
    }
  }
  return false;
}

function adaptiveSimplify(points, generalTolerance, meanderTolerance) {
  // Split into segments by meander zone membership
  const segments = [];
  let currentSegment = [points[0]];
  let currentInZone = isInMeanderZone(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    const inZone = isInMeanderZone(points[i][0], points[i][1]);
    if (inZone !== currentInZone) {
      currentSegment.push(points[i]);
      segments.push({ points: currentSegment, inZone: currentInZone });
      currentSegment = [points[i]];
      currentInZone = inZone;
    } else {
      currentSegment.push(points[i]);
    }
  }
  if (currentSegment.length > 0) {
    segments.push({ points: currentSegment, inZone: currentInZone });
  }

  // Simplify each segment with appropriate tolerance
  const result = [];
  for (const seg of segments) {
    const tolerance = seg.inZone ? meanderTolerance : generalTolerance;
    const simplified = douglasPeucker(seg.points, tolerance);
    if (result.length > 0) {
      // Skip first point (duplicate of last segment's end)
      result.push(...simplified.slice(1));
    } else {
      result.push(...simplified);
    }
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching Utah rivers from OpenStreetMap...\n');

  const results = [];
  const GENERAL_TOLERANCE = 0.001;   // ~111m
  const MEANDER_TOLERANCE = 0.0003;  // ~33m

  for (const def of RIVER_DEFS) {
    try {
      const osmData = await fetchRiverFromOverpass(def.name);
      if (!osmData || !osmData.elements || osmData.elements.length === 0) {
        console.log(`  No data for ${def.name}, skipping`);
        continue;
      }

      const chains = stitchSegments(osmData);
      if (chains.length === 0) {
        console.log(`  No segments for ${def.name}, skipping`);
        continue;
      }

      // Use the longest chain as the main river
      const mainChain = chains[0];
      const simplified = adaptiveSimplify(mainChain, GENERAL_TOLERANCE, MEANDER_TOLERANCE);

      console.log(`  ${def.name}: ${mainChain.length} raw points → ${simplified.length} simplified`);

      results.push({
        name: def.name,
        points: simplified,
        widthMeters: def.widthMeters,
        color: def.color,
        valleyDepth: def.valleyDepth,
        valleyWidth: def.valleyWidth,
      });

      // Rate limit: Overpass API asks for max 2 requests/second
      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.error(`  Error fetching ${def.name}:`, err.message);
    }
  }

  if (results.length === 0) {
    console.error('No rivers fetched! Check network connectivity.');
    process.exit(1);
  }

  // Generate TypeScript output
  const tsContent = generateTypeScript(results);
  writeFileSync(OUTPUT_PATH, tsContent);
  console.log(`\nWrote ${results.length} rivers to ${OUTPUT_PATH}`);
  console.log(`Total waypoints: ${results.reduce((s, r) => s + r.points.length, 0)}`);
}

function generateTypeScript(rivers) {
  let ts = `/**
 * Utah river data fetched from OpenStreetMap Overpass API.
 * Auto-generated by scripts/fetch-rivers-osm.mjs — do not edit manually.
 *
 * Per-river colors based on real geology:
 *   - Colorado/San Juan: muddy red-brown (red sandstone sediment)
 *   - Green River: greenish upper, olive-brown lower
 *   - Virgin: clear milky green-blue
 *   - Bear/Weber/Provo: blue-green mountain streams
 *   - Dirty Devil: extremely muddy dark red-brown
 */

export interface WaterwayDef {
  name: string;
  points: [number, number][];
  widthMeters: number;
  color: [number, number, number];
  valleyDepth?: number;
  valleyWidth?: number;
}

export const RIVERS: WaterwayDef[] = [\n`;

  for (const river of rivers) {
    ts += `  {\n`;
    ts += `    name: '${river.name}',\n`;
    ts += `    widthMeters: ${river.widthMeters},\n`;
    ts += `    color: [${river.color.map(c => c.toFixed(2)).join(', ')}],\n`;
    if (river.valleyDepth !== undefined) ts += `    valleyDepth: ${river.valleyDepth},\n`;
    if (river.valleyWidth !== undefined) ts += `    valleyWidth: ${river.valleyWidth},\n`;
    ts += `    points: [\n`;

    // Write points in rows of 4 for readability
    for (let i = 0; i < river.points.length; i += 4) {
      const batch = river.points.slice(i, i + 4);
      const formatted = batch.map(p => `[${p[0].toFixed(5)}, ${p[1].toFixed(5)}]`).join(', ');
      ts += `      ${formatted},\n`;
    }

    ts += `    ],\n`;
    ts += `  },\n`;
  }

  ts += `];\n`;
  return ts;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
