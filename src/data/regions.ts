import type { TerrainType } from '@/constants';

export interface RegionDef {
  name: string;
  terrain: TerrainType;
  polygon: [number, number][];
  elevation?: number;
}

export interface TerrainZoneDef {
  polygon: [number, number][];
  terrain: TerrainType;
  elevation?: number;
}

// ============================================================
// REGIONS — Major physiographic provinces of Utah
// ============================================================

export const REGIONS: RegionDef[] = [
  // Mojave Fringe MUST be checked before Great Basin (it's a subset).
  // Utah's lowest and warmest area — extreme SW corner around St. George.
  {
    name: 'Mojave Fringe',
    terrain: 'desert',
    elevation: 1,
    polygon: [
      [-114.05, 37.60], [-113.60, 37.60], [-113.40, 37.40], [-113.10, 37.30],
      [-112.95, 37.30], [-112.70, 37.15], [-112.50, 37.00], [-114.05, 37.00],
    ],
  },

  // 1. Great Basin / Basin and Range — western third of Utah
  //    Flat desert basins with N-S trending mountain ranges.
  //    West of the Wasatch Fault (~-111.8 lon) to the Nevada border.
  {
    name: 'Great Basin',
    terrain: 'desert',
    elevation: 2,
    polygon: [
      [-114.05, 42.00], [-112.10, 42.00], [-111.85, 41.80], [-111.80, 41.30],
      [-111.85, 40.80], [-112.00, 40.50], [-112.10, 40.20], [-112.00, 39.80],
      [-111.95, 39.50], [-112.05, 39.15], [-112.15, 38.80], [-112.30, 38.40],
      [-112.50, 38.00], [-112.70, 37.60], [-112.95, 37.30], [-113.10, 37.00],
      [-114.05, 37.00],
    ],
  },

  // 2. Wasatch Front Corridor — narrow populated valley strip
  //    Logan south to Nephi along the base of the Wasatch Range.
  {
    name: 'Wasatch Front',
    terrain: 'sagebrush',
    elevation: 3,
    polygon: [
      [-112.10, 42.00], [-111.70, 42.00], [-111.65, 41.70], [-111.60, 41.30],
      [-111.55, 40.90], [-111.60, 40.50], [-111.65, 40.10], [-111.70, 39.70],
      [-111.80, 39.50], [-111.95, 39.50], [-112.00, 39.80], [-112.10, 40.20],
      [-112.00, 40.50], [-111.85, 40.80], [-111.80, 41.30], [-111.85, 41.80],
    ],
  },

  // 3. Uinta Basin — south of the Uinta Mountains, east of the Wasatch Plateau
  //    Duchesne / Roosevelt / Vernal area.
  {
    name: 'Uinta Basin',
    terrain: 'sagebrush',
    elevation: 3,
    polygon: [
      [-111.30, 40.55], [-110.80, 40.50], [-110.20, 40.48], [-109.80, 40.45],
      [-109.20, 40.40], [-109.05, 40.35], [-109.05, 39.70], [-109.50, 39.70],
      [-110.00, 39.65], [-110.50, 39.65], [-111.00, 39.80], [-111.30, 40.00],
    ],
  },

  // 4. Colorado Plateau — North — San Rafael Swell, Book Cliffs.
  //    North of I-70, east of the Wasatch Plateau.
  {
    name: 'Colorado Plateau North',
    terrain: 'red_sandstone',
    elevation: 4,
    polygon: [
      [-111.00, 39.80], [-110.50, 39.65], [-110.00, 39.65], [-109.50, 39.70],
      [-109.05, 39.70], [-109.05, 38.85], [-109.50, 38.90], [-110.10, 38.90],
      [-110.50, 38.80], [-111.00, 38.65], [-111.30, 38.60], [-111.50, 38.70],
      [-111.60, 39.00], [-111.50, 39.30], [-111.30, 39.60],
    ],
  },

  // 5. Colorado Plateau — South — Canyon country south of I-70.
  //    Moab, Canyonlands, Capitol Reef, Natural Bridges.
  {
    name: 'Colorado Plateau South',
    terrain: 'red_sandstone',
    elevation: 4,
    polygon: [
      [-111.50, 38.70], [-111.00, 38.65], [-110.50, 38.80], [-110.10, 38.90],
      [-109.50, 38.90], [-109.05, 38.85], [-109.05, 37.00], [-110.00, 37.00],
      [-110.50, 37.05], [-111.00, 37.10], [-111.30, 37.30], [-111.50, 37.50],
      [-111.60, 37.80], [-111.60, 38.10], [-111.55, 38.40],
    ],
  },

  // 6. Grand Staircase — the 5-color cliff staircase region
  //    Between Bryce Canyon and the Arizona border.
  {
    name: 'Grand Staircase',
    terrain: 'red_sandstone',
    elevation: 5,
    polygon: [
      [-112.50, 37.60], [-111.60, 37.80], [-111.50, 37.50], [-111.30, 37.30],
      [-111.00, 37.10], [-110.00, 37.00], [-110.00, 37.00], [-112.10, 37.00],
      [-112.50, 37.00], [-112.70, 37.15], [-112.65, 37.40],
    ],
  },

  // 7. High Plateaus — central spine of forested highlands
  //    Wasatch Plateau, Fish Lake, Aquarius, Markagunt, Paunsaugunt.
  {
    name: 'High Plateaus',
    terrain: 'conifer_forest',
    elevation: 7,
    polygon: [
      [-111.95, 39.50], [-111.80, 39.50], [-111.70, 39.70], [-111.65, 40.10],
      [-111.60, 40.50], [-111.55, 40.90], [-111.30, 40.55], [-111.30, 40.00],
      [-111.30, 39.60], [-111.50, 39.30], [-111.60, 39.00], [-111.50, 38.70],
      [-111.55, 38.40], [-111.60, 38.10], [-111.60, 37.80], [-112.50, 37.60],
      [-112.65, 37.40], [-112.70, 37.60], [-112.50, 38.00], [-112.30, 38.40],
      [-112.15, 38.80], [-112.05, 39.15],
    ],
  },

  // Fill remaining NE corner (Uinta Mountains area and above) with the
  // Wasatch Front / Rocky Mountain transition so no tiles are "Unknown".
  {
    name: 'Northern Wasatch-Uinta',
    terrain: 'conifer_forest',
    elevation: 6,
    polygon: [
      [-111.70, 42.00], [-109.05, 42.00], [-109.05, 40.35], [-109.20, 40.40],
      [-109.80, 40.45], [-110.20, 40.48], [-110.80, 40.50], [-111.30, 40.55],
      [-111.55, 40.90], [-111.60, 41.30], [-111.65, 41.70],
    ],
  },
];

// ============================================================
// TERRAIN ZONES — Sub-region terrain overrides
// ============================================================

export const TERRAIN_ZONES: TerrainZoneDef[] = [
  // --- Bonneville Salt Flats (west of Wendover) ---
  {
    terrain: 'salt_flat',
    elevation: 1,
    polygon: [
      [-114.05, 40.90], [-113.75, 40.90], [-113.65, 40.80], [-113.60, 40.72],
      [-113.70, 40.65], [-114.05, 40.60],
    ],
  },

  // --- Salt Lake Valley (urban core) ---
  {
    terrain: 'urban',
    elevation: 2,
    polygon: [
      [-112.10, 40.85], [-111.82, 40.85], [-111.78, 40.75], [-111.78, 40.60],
      [-111.82, 40.50], [-112.05, 40.48], [-112.10, 40.55],
    ],
  },

  // --- Utah Valley / Provo-Orem (urban) ---
  {
    terrain: 'urban',
    elevation: 2,
    polygon: [
      [-111.82, 40.35], [-111.68, 40.35], [-111.65, 40.28], [-111.65, 40.15],
      [-111.72, 40.08], [-111.82, 40.10], [-111.85, 40.20],
    ],
  },

  // --- Cache Valley / Logan (sagebrush valley) ---
  {
    terrain: 'sagebrush',
    elevation: 2,
    polygon: [
      [-111.95, 41.95], [-111.72, 41.95], [-111.70, 41.82], [-111.68, 41.68],
      [-111.72, 41.60], [-111.90, 41.58], [-111.95, 41.70],
    ],
  },

  // --- Factory Butte / Caineville Badlands ---
  {
    terrain: 'badlands',
    elevation: 4,
    polygon: [
      [-110.95, 38.55], [-110.60, 38.55], [-110.55, 38.40], [-110.55, 38.25],
      [-110.65, 38.20], [-110.95, 38.25],
    ],
  },

  // --- Black Rock Desert volcanic field (central-west Utah, Millard Co.) ---
  {
    terrain: 'lava_field',
    elevation: 3,
    polygon: [
      [-112.65, 38.80], [-112.45, 38.80], [-112.40, 38.70], [-112.42, 38.62],
      [-112.55, 38.58], [-112.65, 38.65],
    ],
  },

  // --- Snow Canyon lava flows (near St. George) ---
  {
    terrain: 'lava_field',
    elevation: 2,
    polygon: [
      [-113.72, 37.25], [-113.58, 37.25], [-113.55, 37.18], [-113.55, 37.12],
      [-113.62, 37.08], [-113.72, 37.12],
    ],
  },

  // --- Sevier Desert (salt flats and playa) ---
  {
    terrain: 'salt_flat',
    elevation: 1,
    polygon: [
      [-112.80, 39.30], [-112.40, 39.30], [-112.30, 39.15], [-112.25, 38.90],
      [-112.35, 38.75], [-112.65, 38.75], [-112.80, 38.95],
    ],
  },

  // --- Great Salt Lake marshes (eastern and southern shores) ---
  {
    terrain: 'marsh',
    elevation: 1,
    polygon: [
      [-112.20, 41.20], [-111.95, 41.15], [-111.90, 41.05], [-111.90, 40.90],
      [-112.00, 40.80], [-112.15, 40.78], [-112.30, 40.82], [-112.40, 40.90],
      [-112.45, 41.05], [-112.35, 41.15],
    ],
  },

  // --- White sandstone: Capitol Reef Navajo domes ---
  {
    terrain: 'white_sandstone',
    elevation: 5,
    polygon: [
      [-111.30, 38.40], [-111.10, 38.40], [-111.05, 38.25], [-111.05, 38.10],
      [-111.15, 38.00], [-111.30, 38.05], [-111.35, 38.20],
    ],
  },

  // --- White sandstone: Zion canyon walls ---
  {
    terrain: 'white_sandstone',
    elevation: 5,
    polygon: [
      [-113.05, 37.35], [-112.85, 37.35], [-112.82, 37.25], [-112.82, 37.15],
      [-112.90, 37.10], [-113.05, 37.15],
    ],
  },

  // --- Uinta alpine zone (high ridgeline above timberline) ---
  {
    terrain: 'alpine',
    elevation: 14,
    polygon: [
      [-111.15, 40.88], [-110.70, 40.86], [-110.30, 40.82], [-110.00, 40.78],
      [-109.70, 40.72], [-109.65, 40.65], [-109.70, 40.60], [-110.00, 40.62],
      [-110.30, 40.64], [-110.70, 40.67], [-111.15, 40.72],
    ],
  },

  // --- Wasatch conifer belt (forested flanks of the Wasatch Range) ---
  {
    terrain: 'conifer_forest',
    elevation: 8,
    polygon: [
      [-111.82, 41.60], [-111.62, 41.60], [-111.58, 41.20], [-111.58, 40.80],
      [-111.62, 40.40], [-111.68, 40.10], [-111.78, 39.85], [-111.85, 39.85],
      [-111.80, 40.10], [-111.78, 40.40], [-111.75, 40.80], [-111.75, 41.20],
      [-111.82, 41.60],
    ],
  },

  // --- High plateau forest: Aquarius Plateau / Boulder Mountain ---
  {
    terrain: 'conifer_forest',
    elevation: 8,
    polygon: [
      [-111.60, 38.25], [-111.30, 38.25], [-111.22, 38.10], [-111.22, 37.92],
      [-111.35, 37.85], [-111.60, 37.90], [-111.65, 38.05],
    ],
  },

  // --- High plateau forest: Markagunt Plateau ---
  {
    terrain: 'conifer_forest',
    elevation: 8,
    polygon: [
      [-113.00, 37.85], [-112.68, 37.85], [-112.60, 37.68], [-112.60, 37.45],
      [-112.72, 37.38], [-113.00, 37.42],
    ],
  },

  // --- High plateau forest: Fish Lake Plateau ---
  {
    terrain: 'conifer_forest',
    elevation: 8,
    polygon: [
      [-111.80, 38.70], [-111.55, 38.70], [-111.50, 38.55], [-111.52, 38.42],
      [-111.65, 38.38], [-111.80, 38.45],
    ],
  },
];
