/**
 * VegetationScatter.ts — Utah-specific procedural vegetation using InstancedMesh
 * with dual LOD levels, region-aware density, feature overrides, and riparian boosts.
 *
 * 12 vegetation types placed on hex tiles based on terrain, elevation, features,
 * region, and waterway proximity. Uses spatial grid for efficient LOD updates.
 */

import * as THREE from 'three';
import {
  SCATTER_LOD_NEAR, SCATTER_LOD_FAR, SCATTER_LOD_UPDATE_THRESHOLD,
  GLOBAL_TERRAIN_SEED,
} from '@/constants';
import type { TerrainType, TerrainFeature } from '@/constants';
import type { GameMap } from '@/core/map/GameMap';
import { geoToWorld } from '@/core/geo/GeoCoord';
import { gridToGeo } from '@/core/map/UtahMapData';

// ── Vegetation Types ───────────────────────────────────────────────────────

const VEG_TYPES = [
  'conifer',       // 0: Engelmann spruce / subalpine fir
  'aspen',         // 1: Quaking aspen, white bark
  'pinyon',        // 2: Pinyon pine, short round crown
  'juniper',       // 3: Utah juniper, gnarled
  'cottonwood',    // 4: Fremont cottonwood, tall riparian
  'sagebrush',     // 5: Big sagebrush
  'rabbitbrush',   // 6: Rubber rabbitbrush, yellow
  'cactus',        // 7: Prickly pear / barrel cactus
  'joshua_tree',   // 8: Joshua tree (Mojave only)
  'rock',          // 9: Grey/red rock outcrop
  'boulder',       // 10: Large boulder
  'grass_tuft',    // 11: Desert grass / cheatgrass
] as const;

type VegType = typeof VEG_TYPES[number];

// ── Instance Caps ──────────────────────────────────────────────────────────

const MAX_INSTANCES: Record<VegType, number> = {
  conifer:     25000,
  aspen:       15000,
  pinyon:      20000,
  juniper:     20000,
  cottonwood:   8000,
  sagebrush:   30000,
  rabbitbrush: 12000,
  cactus:       3000,
  joshua_tree:  2000,
  rock:         8000,
  boulder:      4000,
  grass_tuft:  15000,
};

// ── Density Row: base densities per veg type for a given terrain ───────────

type DensityRow = Partial<Record<VegType, number>>;

const DENSITY_TABLE: Partial<Record<TerrainType, DensityRow>> = {
  conifer_forest: {
    conifer: 2.0, aspen: 1.5, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0.1, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 0.3, boulder: 0.1, grass_tuft: 0.2,
  },
  sagebrush: {
    conifer: 0, aspen: 0, pinyon: 0, juniper: 0.2, cottonwood: 0,
    sagebrush: 2.5, rabbitbrush: 1.0, cactus: 0, joshua_tree: 0,
    rock: 0.1, boulder: 0, grass_tuft: 1.5,
  },
  desert: {
    conifer: 0, aspen: 0, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0.3, rabbitbrush: 0.1, cactus: 0, joshua_tree: 0,
    rock: 0.05, boulder: 0, grass_tuft: 0.5,
  },
  mountain: {
    conifer: 1.0, aspen: 0.5, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0.2, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 0.8, boulder: 0.3, grass_tuft: 0.3,
  },
  alpine: {
    conifer: 0.2, aspen: 0, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 1.5, boulder: 0.8, grass_tuft: 0.2,
  },
  red_sandstone: {
    conifer: 0, aspen: 0, pinyon: 0.6, juniper: 0.6, cottonwood: 0,
    sagebrush: 0.2, rabbitbrush: 0.1, cactus: 0, joshua_tree: 0,
    rock: 0.4, boulder: 0.1, grass_tuft: 0.3,
  },
  white_sandstone: {
    conifer: 0, aspen: 0, pinyon: 0.3, juniper: 0.3, cottonwood: 0,
    sagebrush: 0.1, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 0.5, boulder: 0.1, grass_tuft: 0.2,
  },
  canyon_floor: {
    conifer: 0, aspen: 0, pinyon: 0.2, juniper: 0.1, cottonwood: 0.5,
    sagebrush: 0.3, rabbitbrush: 0.1, cactus: 0, joshua_tree: 0,
    rock: 0.2, boulder: 0.1, grass_tuft: 0.6,
  },
  river_valley: {
    conifer: 0.2, aspen: 0.3, pinyon: 0, juniper: 0, cottonwood: 1.0,
    sagebrush: 0.3, rabbitbrush: 0.1, cactus: 0, joshua_tree: 0,
    rock: 0.05, boulder: 0, grass_tuft: 1.0,
  },
  marsh: {
    conifer: 0, aspen: 0, pinyon: 0, juniper: 0, cottonwood: 0.5,
    sagebrush: 0.2, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 0, boulder: 0, grass_tuft: 2.0,
  },
  badlands: {
    conifer: 0, aspen: 0, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0.3, rabbitbrush: 0.1, cactus: 0, joshua_tree: 0,
    rock: 0.8, boulder: 0.2, grass_tuft: 0.3,
  },
  lava_field: {
    conifer: 0, aspen: 0, pinyon: 0, juniper: 0, cottonwood: 0,
    sagebrush: 0.1, rabbitbrush: 0, cactus: 0, joshua_tree: 0,
    rock: 0.8, boulder: 0.3, grass_tuft: 0.1,
  },
  salt_flat: {},
  urban:     {},
  water:     {},
};

// ── Forest Tier Multipliers ────────────────────────────────────────────────

interface ForestTier {
  densityMul: number;
  scaleMul: number;
}

const FOREST_TIERS: Partial<Record<TerrainFeature, ForestTier>> = {
  dense_forest: { densityMul: 14, scaleMul: 1.25 },
  forest:       { densityMul: 8,  scaleMul: 1.15 },
  woodland:     { densityMul: 5,  scaleMul: 1.05 },
};

// ── Feature Override Functions ─────────────────────────────────────────────
// These modify a density row in-place based on tile feature.

function applyFeatureOverrides(row: DensityRow, feature: TerrainFeature | undefined): void {
  if (!feature) return;

  switch (feature) {
    case 'pinyon_juniper':
      row.pinyon = 1.5;
      row.juniper = 1.5;
      break;
    case 'aspen_grove':
      row.aspen = 3.0;
      row.conifer = 0.5;
      break;
    case 'dense_forest':
      row.conifer = (row.conifer ?? 0) * 3;
      row.aspen = (row.aspen ?? 0) * 2;
      break;
    case 'forest':
      row.conifer = (row.conifer ?? 0) * 2;
      row.aspen = (row.aspen ?? 0) * 1.5;
      break;
    case 'woodland':
      row.conifer = (row.conifer ?? 0) * 1.2;
      row.pinyon = Math.max(row.pinyon ?? 0, 1.0);
      row.juniper = Math.max(row.juniper ?? 0, 1.0);
      break;
  }
}

// ── Region Override Functions ──────────────────────────────────────────────

function applyRegionOverrides(row: DensityRow, region: string): void {
  if (/mojave/i.test(region)) {
    row.cactus = 0.8;
    row.joshua_tree = 0.5;
    row.sagebrush = Math.max(row.sagebrush ?? 0, 0.5);
  }

  if (/high plateaus/i.test(region)) {
    row.conifer = (row.conifer ?? 0) * 1.5;
    row.aspen = (row.aspen ?? 0) * 1.5;
  }

  if (/colorado plateau/i.test(region)) {
    row.pinyon = (row.pinyon ?? 0) * 1.3;
    row.juniper = (row.juniper ?? 0) * 1.3;
    row.rock = Math.max((row.rock ?? 0) * 1.0, 0.5);
  }
}

// ── Riparian Boost ─────────────────────────────────────────────────────────

function applyRiparianBoost(row: DensityRow, terrain: TerrainType): void {
  if (terrain === 'desert' || terrain === 'sagebrush' || terrain === 'red_sandstone') {
    row.cottonwood = Math.max(row.cottonwood ?? 0, 0.8);
    row.sagebrush = Math.max(row.sagebrush ?? 0, 0.3);
    row.grass_tuft = Math.max(row.grass_tuft ?? 0, 0.5);
  }
}

// ── Forest Tier Density/Scale ──────────────────────────────────────────────

function getForestTier(feature: TerrainFeature | undefined): ForestTier | null {
  if (!feature) return null;
  return FOREST_TIERS[feature] ?? null;
}

// ── Spatial Grid ───────────────────────────────────────────────────────────

const SPATIAL_CELL_SIZE = 10000; // 10km cells at 1:1 metric scale

interface VegInstance {
  x: number;
  y: number;
  z: number;
  type: VegType;
  scale: number;
  rotationY: number;
  regionIsRedRock: boolean; // for rock/boulder color
}

class SpatialGrid {
  private cells = new Map<string, VegInstance[]>();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  insert(inst: VegInstance): void {
    const cx = Math.floor(inst.x / this.cellSize);
    const cz = Math.floor(inst.z / this.cellSize);
    const k = this.key(cx, cz);
    let arr = this.cells.get(k);
    if (!arr) {
      arr = [];
      this.cells.set(k, arr);
    }
    arr.push(inst);
  }

  queryRadius(wx: number, wz: number, radius: number): VegInstance[] {
    const result: VegInstance[] = [];
    const minCx = Math.floor((wx - radius) / this.cellSize);
    const maxCx = Math.floor((wx + radius) / this.cellSize);
    const minCz = Math.floor((wz - radius) / this.cellSize);
    const maxCz = Math.floor((wz + radius) / this.cellSize);
    const r2 = radius * radius;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const arr = this.cells.get(this.key(cx, cz));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const inst = arr[i];
          const dx = inst.x - wx;
          const dz = inst.z - wz;
          if (dx * dx + dz * dz <= r2) {
            result.push(inst);
          }
        }
      }
    }
    return result;
  }

  clear(): void {
    this.cells.clear();
  }
}

// ── Deterministic Hash ─────────────────────────────────────────────────────

function tileHash(q: number, r: number, idx: number, seed: number): number {
  let h = seed;
  h = (h ^ (q * 374761393)) >>> 0;
  h = (h ^ (r * 668265263)) >>> 0;
  h = (h ^ (idx * 2654435761)) >>> 0;
  h = (((h >> 13) ^ h) * 1274126177) >>> 0;
  h = ((h >> 16) ^ h) >>> 0;
  return h;
}

function hashFloat(h: number): number {
  return (h & 0x7fffffff) / 0x7fffffff;
}

// ── Geometry Merge Utility ─────────────────────────────────────────────────

function mergeGeometries(
  geos: THREE.BufferGeometry[],
  transforms: THREE.Matrix4[],
): THREE.BufferGeometry {
  const transformed: THREE.BufferGeometry[] = [];
  for (let i = 0; i < geos.length; i++) {
    const g = geos[i].clone();
    g.applyMatrix4(transforms[i]);
    transformed.push(g);
  }

  let totalVerts = 0;
  let totalIdx = 0;
  for (const g of transformed) {
    totalVerts += g.getAttribute('position').count;
    totalIdx += g.index ? g.index.count : g.getAttribute('position').count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices: number[] = [];

  let vertOff = 0;
  for (const g of transformed) {
    const pos = g.getAttribute('position');
    const nor = g.getAttribute('normal');
    for (let j = 0; j < pos.count; j++) {
      positions[(vertOff + j) * 3] = pos.getX(j);
      positions[(vertOff + j) * 3 + 1] = pos.getY(j);
      positions[(vertOff + j) * 3 + 2] = pos.getZ(j);
      if (nor) {
        normals[(vertOff + j) * 3] = nor.getX(j);
        normals[(vertOff + j) * 3 + 1] = nor.getY(j);
        normals[(vertOff + j) * 3 + 2] = nor.getZ(j);
      }
    }
    if (g.index) {
      for (let j = 0; j < g.index.count; j++) {
        indices.push(g.index.array[j] + vertOff);
      }
    } else {
      for (let j = 0; j < pos.count; j++) {
        indices.push(vertOff + j);
      }
    }
    vertOff += pos.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  return merged;
}

// ── Material Helper ────────────────────────────────────────────────────────

function mat(color: string): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: new THREE.Color(color) });
}

// ── Geometry Builders (Detail + LOD for each type) ─────────────────────────

// Geometry scale: 1 unit = 1 meter at 1:1 scale
// Real Utah tree heights: conifer 15-25m, aspen 10-20m, pinyon 4-8m, juniper 5-10m

// 0: Conifer — Engelmann spruce / subalpine fir (~20m tall)
function buildConiferDetail(): THREE.BufferGeometry {
  const canopy = new THREE.ConeGeometry(5, 18, 6);
  const trunk = new THREE.CylinderGeometry(0.8, 0.8, 5, 4);
  return mergeGeometries(
    [canopy, trunk],
    [
      new THREE.Matrix4().makeTranslation(0, 14, 0),
      new THREE.Matrix4().makeTranslation(0, 2.5, 0),
    ],
  );
}
function buildConiferLOD(): THREE.BufferGeometry {
  return new THREE.ConeGeometry(5, 22, 4);
}

// 1: Aspen — quaking aspen with white bark (~15m tall)
function buildAspenDetail(): THREE.BufferGeometry {
  const canopy = new THREE.SphereGeometry(4, 6, 4);
  const trunk = new THREE.CylinderGeometry(0.5, 0.5, 12, 5);
  return mergeGeometries(
    [trunk, canopy],
    [
      new THREE.Matrix4().makeTranslation(0, 6, 0),
      new THREE.Matrix4().makeTranslation(0, 14, 0),
    ],
  );
}
function buildAspenLOD(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(4, 4, 3);
}

// 2: Pinyon — short, round crown (~6m tall)
function buildPinyonDetail(): THREE.BufferGeometry {
  const canopy = new THREE.SphereGeometry(4, 6, 4);
  canopy.scale(1, 0.6, 1);
  const trunk = new THREE.CylinderGeometry(0.6, 0.6, 3, 4);
  return mergeGeometries(
    [canopy, trunk],
    [
      new THREE.Matrix4().makeTranslation(0, 5.5, 0),
      new THREE.Matrix4().makeTranslation(0, 1.5, 0),
    ],
  );
}
function buildPinyonLOD(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(4, 4, 3);
  g.scale(1, 0.6, 1);
  return g;
}

// 3: Juniper — gnarled, icosahedron canopy (~7m tall)
function buildJuniperDetail(): THREE.BufferGeometry {
  const canopy = new THREE.IcosahedronGeometry(4, 1);
  // Displace vertices for gnarled look
  const pos = canopy.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const noise = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 0.5;
    pos.setXYZ(i, x + noise, y + noise * 0.5, z + noise);
  }
  canopy.computeVertexNormals();
  const trunk = new THREE.CylinderGeometry(0.5, 0.7, 5, 4);
  return mergeGeometries(
    [canopy, trunk],
    [
      new THREE.Matrix4().makeTranslation(0, 7, 0),
      new THREE.Matrix4().makeTranslation(0, 2.5, 0),
    ],
  );
}
function buildJuniperLOD(): THREE.BufferGeometry {
  return new THREE.IcosahedronGeometry(4, 0);
}

// 4: Cottonwood — tall, large spherical canopy (~18m tall)
function buildCottonwoodDetail(): THREE.BufferGeometry {
  const canopy = new THREE.SphereGeometry(6, 6, 5);
  const trunk = new THREE.CylinderGeometry(0.8, 0.8, 14, 5);
  return mergeGeometries(
    [trunk, canopy],
    [
      new THREE.Matrix4().makeTranslation(0, 7, 0),
      new THREE.Matrix4().makeTranslation(0, 16, 0),
    ],
  );
}
function buildCottonwoodLOD(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(6, 4, 3);
}

// 5: Sagebrush — small hemisphere (~1m tall)
function buildSagebrushDetail(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1.2, 6, 4);
  g.scale(1, 0.7, 1);
  return g;
}
function buildSagebrushLOD(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1.2, 4, 2);
  g.scale(1, 0.7, 1);
  return g;
}

// 6: Rabbitbrush — small sphere (~0.8m)
function buildRabbitbrushDetail(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(1.0, 6, 4);
}
function buildRabbitbrushLOD(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(1.0, 4, 3);
}

// 7: Cactus — cylinder (~1.5m tall)
function buildCactusDetail(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6);
}
function buildCactusLOD(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.5, 0.5, 1.5, 4);
}

// 8: Joshua tree — forked branches (~8m tall)
function buildJoshuaTreeDetail(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.6, 0.8, 6, 5);
  const b1 = new THREE.CylinderGeometry(0.4, 0.4, 3, 4);
  const b2 = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 4);
  const tip1 = new THREE.SphereGeometry(1.2, 5, 4);
  const tip2 = new THREE.SphereGeometry(1.0, 5, 4);
  const mTrunk = new THREE.Matrix4().makeTranslation(0, 3, 0);
  const mB1 = new THREE.Matrix4().makeRotationZ(0.6)
    .multiply(new THREE.Matrix4().makeTranslation(1.5, 6.5, 0));
  const mB2 = new THREE.Matrix4().makeRotationZ(-0.5)
    .multiply(new THREE.Matrix4().makeTranslation(-1.2, 6, 0.5));
  const mT1 = new THREE.Matrix4().makeTranslation(3, 7.5, 0);
  const mT2 = new THREE.Matrix4().makeTranslation(-2.5, 7, 0.5);
  return mergeGeometries(
    [trunk, b1, b2, tip1, tip2],
    [mTrunk, mB1, mB2, mT1, mT2],
  );
}
function buildJoshuaTreeLOD(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(1.2, 0.8, 8, 4);
}

// 9: Rock — scraped icosahedron (~2m)
function buildRockDetail(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(2, 1);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const scrape = Math.sin(x * 2.5 + y * 0.8) * Math.cos(z * 1.8) * 0.4;
    pos.setXYZ(i, x + scrape, y * 0.7 + scrape * 0.3, z + scrape);
  }
  g.computeVertexNormals();
  return g;
}
function buildRockLOD(): THREE.BufferGeometry {
  return new THREE.IcosahedronGeometry(2, 0);
}

// 10: Boulder — larger scraped icosahedron (~4m)
function buildBoulderDetail(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(4, 1);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const scrape = Math.sin(x * 1.2 + z * 0.9) * Math.cos(y * 1.1) * 0.6;
    pos.setXYZ(i, x + scrape, y * 0.65 + scrape * 0.2, z + scrape);
  }
  g.computeVertexNormals();
  return g;
}
function buildBoulderLOD(): THREE.BufferGeometry {
  return new THREE.IcosahedronGeometry(4, 0);
}

// 11: Grass tuft — small flat cone (~0.3m)
function buildGrassTuftDetail(): THREE.BufferGeometry {
  return new THREE.ConeGeometry(0.6, 0.4, 5);
}
function buildGrassTuftLOD(): THREE.BufferGeometry {
  return new THREE.ConeGeometry(0.6, 0.4, 3);
}

// ── Mesh Definition Map ────────────────────────────────────────────────────

interface VegMeshDef {
  detail: THREE.BufferGeometry;
  lod: THREE.BufferGeometry;
  material: THREE.MeshLambertMaterial;
}

function buildAllMeshDefs(): Map<VegType, VegMeshDef> {
  const defs = new Map<VegType, VegMeshDef>();

  defs.set('conifer',     { detail: buildConiferDetail(),     lod: buildConiferLOD(),     material: mat('#1A4A2D') });
  defs.set('aspen',       { detail: buildAspenDetail(),       lod: buildAspenLOD(),       material: mat('#6BAA4B') });
  defs.set('pinyon',      { detail: buildPinyonDetail(),      lod: buildPinyonLOD(),      material: mat('#5A6A3A') });
  defs.set('juniper',     { detail: buildJuniperDetail(),     lod: buildJuniperLOD(),     material: mat('#5B6B3A') });
  defs.set('cottonwood',  { detail: buildCottonwoodDetail(),  lod: buildCottonwoodLOD(),  material: mat('#5A8A3A') });
  defs.set('sagebrush',   { detail: buildSagebrushDetail(),   lod: buildSagebrushLOD(),   material: mat('#8B9A6B') });
  defs.set('rabbitbrush', { detail: buildRabbitbrushDetail(), lod: buildRabbitbrushLOD(), material: mat('#B8A840') });
  defs.set('cactus',      { detail: buildCactusDetail(),      lod: buildCactusLOD(),      material: mat('#3A6A2A') });
  defs.set('joshua_tree', { detail: buildJoshuaTreeDetail(), lod: buildJoshuaTreeLOD(), material: mat('#8A9A6A') });
  defs.set('rock',        { detail: buildRockDetail(),        lod: buildRockLOD(),        material: mat('#7A7A7A') });
  defs.set('boulder',     { detail: buildBoulderDetail(),     lod: buildBoulderLOD(),     material: mat('#6A6A6A') });
  defs.set('grass_tuft',  { detail: buildGrassTuftDetail(),  lod: buildGrassTuftLOD(),  material: mat('#B8A878') });

  return defs;
}

// ── Color Variants ─────────────────────────────────────────────────────────

const ASPEN_GOLDEN = new THREE.Color('#D4AA40');
const ASPEN_GREEN = new THREE.Color('#6BAA4B');

const ROCK_GREY = new THREE.Color('#7A7A7A');
const ROCK_RED = new THREE.Color('#A05A3A');

const BOULDER_GREY = new THREE.Color('#6A6A6A');
const BOULDER_RED = new THREE.Color('#8A4A2A');

// ── Cluster Center Generator ───────────────────────────────────────────────

function generateClusterCenters(
  q: number, r: number, seed: number, count: number,
  hexCenterX: number, hexCenterZ: number, hexInnerR: number,
): { x: number; z: number }[] {
  const centers: { x: number; z: number }[] = [];
  for (let i = 0; i < count; i++) {
    const h0 = tileHash(q, r, 7000 + i * 2, seed);
    const h1 = tileHash(q, r, 7001 + i * 2, seed);
    const angle = hashFloat(h0) * Math.PI * 2;
    const dist = hashFloat(h1) * hexInnerR * 0.7;
    centers.push({
      x: hexCenterX + Math.cos(angle) * dist,
      z: hexCenterZ + Math.sin(angle) * dist,
    });
  }
  return centers;
}

// ── Slope Check ────────────────────────────────────────────────────────────

function sampleSlope(
  wx: number, wz: number,
  heightSampler: (x: number, z: number) => number | undefined,
): number {
  const step = 0.5;
  const hC = heightSampler(wx, wz);
  const hX = heightSampler(wx + step, wz);
  const hZ = heightSampler(wx, wz + step);
  if (hC === undefined || hX === undefined || hZ === undefined) return 0;
  const dx = (hX - hC) / step;
  const dz = (hZ - hC) / step;
  return Math.atan(Math.sqrt(dx * dx + dz * dz));
}

// ── Is Forest Feature ──────────────────────────────────────────────────────

function isForestFeature(feature: TerrainFeature | undefined): boolean {
  if (!feature) return false;
  return feature === 'dense_forest' || feature === 'forest' || feature === 'woodland';
}

// ── Is Red Rock Region ─────────────────────────────────────────────────────

function isRedRockRegion(region: string, terrain: TerrainType): boolean {
  if (terrain === 'red_sandstone' || terrain === 'canyon_floor') return true;
  if (/colorado plateau/i.test(region)) return true;
  if (/grand staircase/i.test(region)) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// VegetationScatter
// ═══════════════════════════════════════════════════════════════════════════

export class VegetationScatter {
  private scene: THREE.Scene;

  private detailMeshes = new Map<VegType, THREE.InstancedMesh>();
  private lodMeshes = new Map<VegType, THREE.InstancedMesh>();

  private spatialGrid = new SpatialGrid(SPATIAL_CELL_SIZE);
  private allInstances: VegInstance[] = [];

  private lastCamX = Infinity;
  private lastCamZ = Infinity;
  private qualityScale = 1.0;

  // Reusable temporaries
  private _mat4 = new THREE.Matrix4();
  private _pos = new THREE.Vector3();
  private _quat = new THREE.Quaternion();
  private _scale = new THREE.Vector3();

  private meshDefs: Map<VegType, VegMeshDef> | null = null;
  private group: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'vegetation_scatter';
    this.scene.add(this.group);
  }

  // ── Public Interface ───────────────────────────────────────────────────

  build(
    gameMap: GameMap,
    scene: THREE.Scene,
    heightSampler: (wx: number, wz: number) => number | undefined,
  ): void {
    this.dispose();
    this.group = new THREE.Group();
    this.group.name = 'vegetation_scatter';
    this.scene.add(this.group);

    this.meshDefs = buildAllMeshDefs();
    this.allInstances = [];
    this.spatialGrid.clear();

    const typeCounts = new Map<VegType, number>();
    for (const t of VEG_TYPES) typeCounts.set(t, 0);

    const MAX_SLOPE = (50 * Math.PI) / 180; // 50 degrees
    const SNOWLINE_ELEV = 13; // elevation units above which = snowline

    const landTiles = gameMap.getLandTiles();

    for (const tile of landTiles) {
      const terrain = tile.terrain;
      if (terrain === 'water' || terrain === 'urban') continue;

      // Build base density row (clone to avoid mutating the table)
      const baseRow = DENSITY_TABLE[terrain];
      const row: DensityRow = baseRow ? { ...baseRow } : {};

      // Apply feature overrides
      applyFeatureOverrides(row, tile.feature);

      // Apply region overrides
      if (tile.region) {
        applyRegionOverrides(row, tile.region);
      }

      // Riparian boost for tiles with waterways
      if (tile.waterway) {
        applyRiparianBoost(row, terrain);
      }

      // Forest tier multiplier
      const forestTier = getForestTier(tile.feature);

      // Check if any densities are > 0
      const entries: [VegType, number][] = [];
      for (const key of VEG_TYPES) {
        const d = row[key];
        if (d !== undefined && d > 0) {
          let density = d;
          // Apply forest tier density multiplier
          if (forestTier) {
            density *= forestTier.densityMul;
          }
          entries.push([key, density]);
        }
      }

      if (entries.length === 0) continue;

      // Cell center in world coordinates
      const geo = gridToGeo(tile.q, tile.r);
      const worldPos = geoToWorld(geo.lon, geo.lat);
      const hexCenterX = worldPos.x;
      const hexCenterZ = worldPos.z;
      const hexInnerR = 1500; // ~cell radius in meters at 1:1 scale

      // Determine placement strategy
      const useForestGrid = isForestFeature(tile.feature);
      const redRock = isRedRockRegion(tile.region, terrain);

      // Pre-compute cluster centers for non-forest placement
      const clusterCount = 1 + Math.floor(hashFloat(tileHash(tile.q, tile.r, 6000, GLOBAL_TERRAIN_SEED)) * 3);
      const clusterCenters = useForestGrid
        ? []
        : generateClusterCenters(tile.q, tile.r, GLOBAL_TERRAIN_SEED, clusterCount, hexCenterX, hexCenterZ, hexInnerR);

      // Scale multiplier from forest tier
      const tierScaleMul = forestTier ? forestTier.scaleMul : 1.0;

      for (const [vegType, density] of entries) {
        const vegIdx = VEG_TYPES.indexOf(vegType);
        const scaledDensity = density * this.qualityScale;
        const wholeCount = Math.floor(scaledDensity);
        const fracProb = scaledDensity - wholeCount;
        const fracHash = hashFloat(tileHash(tile.q, tile.r, 9999, GLOBAL_TERRAIN_SEED + vegIdx));
        const totalForTile = wholeCount + (fracHash < fracProb ? 1 : 0);

        for (let i = 0; i < totalForTile; i++) {
          const curCount = typeCounts.get(vegType)!;
          const maxForType = Math.floor(MAX_INSTANCES[vegType] * this.qualityScale);
          if (curCount >= maxForType) break;

          const seed = GLOBAL_TERRAIN_SEED + vegIdx;
          const h0 = tileHash(tile.q, tile.r, i * 5, seed);
          const h1 = tileHash(tile.q, tile.r, i * 5 + 1, seed);
          const h2 = tileHash(tile.q, tile.r, i * 5 + 2, seed);
          const h3 = tileHash(tile.q, tile.r, i * 5 + 3, seed);
          const h4 = tileHash(tile.q, tile.r, i * 5 + 4, seed);

          let wx: number;
          let wz: number;

          if (useForestGrid) {
            // Grid-based scatter with 70% noise jitter
            const gridSpacing = hexInnerR * 2 / Math.ceil(Math.sqrt(totalForTile + 1));
            const gridCols = Math.max(1, Math.ceil(hexInnerR * 2 / gridSpacing));
            const gCol = i % gridCols;
            const gRow = Math.floor(i / gridCols);
            const baseX = hexCenterX - hexInnerR + gCol * gridSpacing + gridSpacing * 0.5;
            const baseZ = hexCenterZ - hexInnerR + gRow * gridSpacing + gridSpacing * 0.5;
            const jitterX = (hashFloat(h0) - 0.5) * gridSpacing * 0.7;
            const jitterZ = (hashFloat(h1) - 0.5) * gridSpacing * 0.7;
            wx = baseX + jitterX;
            wz = baseZ + jitterZ;
          } else {
            // Cluster-biased placement: 60% toward cluster center, 40% random
            const useCluster = hashFloat(h4) < 0.6 && clusterCenters.length > 0;
            if (useCluster) {
              const ci = Math.floor(hashFloat(tileHash(tile.q, tile.r, i * 5 + 10, seed)) * clusterCenters.length);
              const center = clusterCenters[Math.min(ci, clusterCenters.length - 1)];
              const spreadAngle = hashFloat(h0) * Math.PI * 2;
              const spreadDist = hashFloat(h1) * hexInnerR * 0.35;
              wx = center.x + Math.cos(spreadAngle) * spreadDist;
              wz = center.z + Math.sin(spreadAngle) * spreadDist;
            } else {
              const angle = hashFloat(h0) * Math.PI * 2;
              const radius = hashFloat(h1) * hexInnerR * 0.9;
              wx = hexCenterX + Math.cos(angle) * radius;
              wz = hexCenterZ + Math.sin(angle) * radius;
            }
          }

          // Sample height
          const wy = heightSampler(wx, wz);
          if (wy === undefined || wy < -0.1) continue;

          // Slope check
          const slope = sampleSlope(wx, wz, heightSampler);
          if (slope > MAX_SLOPE) continue;

          // Snowline check
          if (tile.elevation >= SNOWLINE_ELEV) continue;

          // Scale with variation and tier multiplier
          const baseScale = 0.7 + hashFloat(h2) * 0.6;
          const scale = baseScale * tierScaleMul;
          const rotY = hashFloat(h3) * Math.PI * 2;

          const inst: VegInstance = {
            x: wx, y: wy, z: wz,
            type: vegType,
            scale,
            rotationY: rotY,
            regionIsRedRock: redRock,
          };
          this.allInstances.push(inst);
          this.spatialGrid.insert(inst);
          typeCounts.set(vegType, curCount + 1);
        }
      }
    }

    this.createInstancedMeshes();
    this.lastCamX = Infinity;
    this.lastCamZ = Infinity;
  }

  update(cameraPos: THREE.Vector3): void {
    this.updateLOD(cameraPos.x, cameraPos.z);
  }

  updateLOD(cameraX: number, cameraZ: number): void {
    const dx = cameraX - this.lastCamX;
    const dz = cameraZ - this.lastCamZ;
    if (dx * dx + dz * dz < SCATTER_LOD_UPDATE_THRESHOLD * SCATTER_LOD_UPDATE_THRESHOLD) {
      return;
    }
    this.lastCamX = cameraX;
    this.lastCamZ = cameraZ;

    const nearInsts = this.spatialGrid.queryRadius(cameraX, cameraZ, SCATTER_LOD_NEAR);
    const farInsts = this.spatialGrid.queryRadius(cameraX, cameraZ, SCATTER_LOD_FAR);

    const nearSet = new Set(nearInsts);
    const farOnlyInsts: VegInstance[] = [];
    for (const inst of farInsts) {
      if (!nearSet.has(inst)) farOnlyInsts.push(inst);
    }

    const detailLists = new Map<VegType, VegInstance[]>();
    const lodLists = new Map<VegType, VegInstance[]>();
    for (const t of VEG_TYPES) {
      detailLists.set(t, []);
      lodLists.set(t, []);
    }

    for (const inst of nearInsts) {
      detailLists.get(inst.type)!.push(inst);
    }
    for (const inst of farOnlyInsts) {
      lodLists.get(inst.type)!.push(inst);
    }

    for (const vegType of VEG_TYPES) {
      this.fillInstancedMesh(this.detailMeshes.get(vegType), detailLists.get(vegType)!, vegType);
      this.fillInstancedMesh(this.lodMeshes.get(vegType), lodLists.get(vegType)!, vegType);
    }
  }

  setQuality(scale: number): void {
    this.qualityScale = Math.max(0.1, Math.min(1.0, scale));
  }

  dispose(): void {
    for (const mesh of this.detailMeshes.values()) {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) mesh.material.dispose();
      this.group.remove(mesh);
    }
    for (const mesh of this.lodMeshes.values()) {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) mesh.material.dispose();
      this.group.remove(mesh);
    }
    this.detailMeshes.clear();
    this.lodMeshes.clear();
    this.allInstances = [];
    this.spatialGrid.clear();

    if (this.meshDefs) {
      for (const def of this.meshDefs.values()) {
        def.detail.dispose();
        def.lod.dispose();
        def.material.dispose();
      }
      this.meshDefs = null;
    }

    this.scene.remove(this.group);
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  private createInstancedMeshes(): void {
    if (!this.meshDefs) return;

    for (const vegType of VEG_TYPES) {
      const def = this.meshDefs.get(vegType);
      if (!def) continue;

      const maxCount = MAX_INSTANCES[vegType];

      const detailMesh = new THREE.InstancedMesh(def.detail, def.material.clone(), maxCount);
      detailMesh.matrixAutoUpdate = false;
      detailMesh.matrixWorldAutoUpdate = false;
      detailMesh.frustumCulled = false;
      detailMesh.count = 0;
      detailMesh.name = `veg_detail_${vegType}`;
      this.detailMeshes.set(vegType, detailMesh);
      this.group.add(detailMesh);

      const lodMesh = new THREE.InstancedMesh(def.lod, def.material.clone(), maxCount);
      lodMesh.matrixAutoUpdate = false;
      lodMesh.matrixWorldAutoUpdate = false;
      lodMesh.frustumCulled = false;
      lodMesh.count = 0;
      lodMesh.name = `veg_lod_${vegType}`;
      this.lodMeshes.set(vegType, lodMesh);
      this.group.add(lodMesh);

      // Types that need per-instance color
      const needsColor = vegType === 'aspen' || vegType === 'rock' || vegType === 'boulder';
      if (needsColor) {
        detailMesh.instanceColor = new THREE.InstancedBufferAttribute(
          new Float32Array(maxCount * 3), 3,
        );
        lodMesh.instanceColor = new THREE.InstancedBufferAttribute(
          new Float32Array(maxCount * 3), 3,
        );
      }
    }
  }

  private fillInstancedMesh(
    mesh: THREE.InstancedMesh | undefined,
    instances: VegInstance[],
    vegType: VegType,
  ): void {
    if (!mesh) return;

    const count = Math.min(instances.length, mesh.instanceMatrix.count);
    mesh.count = count;

    const needsColor = vegType === 'aspen' || vegType === 'rock' || vegType === 'boulder';
    const _color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const inst = instances[i];

      this._pos.set(inst.x, inst.y, inst.z);
      this._quat.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, inst.rotationY);
      this._scale.setScalar(inst.scale);
      this._mat4.compose(this._pos, this._quat, this._scale);

      mesh.setMatrixAt(i, this._mat4);

      if (needsColor && mesh.instanceColor) {
        if (vegType === 'aspen') {
          // 30% golden, 70% green
          const h = tileHash(
            Math.floor(inst.x * 10),
            Math.floor(inst.z * 10),
            Math.floor(inst.x * 100) ^ Math.floor(inst.z * 100),
            GLOBAL_TERRAIN_SEED,
          );
          _color.copy(hashFloat(h) < 0.3 ? ASPEN_GOLDEN : ASPEN_GREEN);
        } else if (vegType === 'rock') {
          _color.copy(inst.regionIsRedRock ? ROCK_RED : ROCK_GREY);
        } else if (vegType === 'boulder') {
          _color.copy(inst.regionIsRedRock ? BOULDER_RED : BOULDER_GREY);
        }
        mesh.instanceColor.setXYZ(i, _color.r, _color.g, _color.b);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (needsColor && mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }
}
