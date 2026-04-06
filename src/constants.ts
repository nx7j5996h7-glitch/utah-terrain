// === Grid Dimensions ===
export const SQRT3 = Math.sqrt(3);
export const HEX_SIZE = 20;
export const MAP_WIDTH = 160;  // hex columns (q: 0-159) — ~3.5 km/hex
export const MAP_HEIGHT = 140; // hex rows (r: 0-139) — ~4 km/hex

// === Geographic Bounds (WGS84) ===
export const UTAH_WEST = -114.05;
export const UTAH_EAST = -109.05;
export const UTAH_NORTH = 42.0;
export const UTAH_SOUTH = 37.0;
export const DEG_PER_HEX_LON = (UTAH_EAST - UTAH_WEST) / MAP_WIDTH;   // ~0.0556 deg/hex
export const DEG_PER_HEX_LAT = (UTAH_NORTH - UTAH_SOUTH) / MAP_HEIGHT; // ~0.0714 deg/hex

// === Terrain Mesh ===
export const GRID_SPACING = 2.0;       // vertex spacing in world units
export const ELEVATION_SCALE = 12.0;   // tile elevation → world Y multiplier
export const MOUNTAIN_HEIGHT_BOOST = 7.0;
export const CANYON_DEPTH_SCALE = 4.0;
export const WATER_PLANE_Y = 0.0;    // At zero level
export const WATER_MESH_Y = -1.5;    // Water tile terrain sinks below water plane

// === Camera ===
export const CAMERA_MIN_DISTANCE = 15;
export const CAMERA_MAX_DISTANCE = 1400; // Far enough to see full map, close enough for drama
export const CAMERA_MIN_POLAR = 0.087;  // ~5 deg from zenith
export const CAMERA_MAX_POLAR = 1.396;  // ~80 deg from zenith
export const CAMERA_PAN_SPEED = 0.25;

// === LOD ===
export const SCATTER_LOD_NEAR = 300;
export const SCATTER_LOD_FAR = 500;
export const SCATTER_LOD_UPDATE_THRESHOLD = 25;

// === Terrain Types ===
export type TerrainType =
  | 'salt_flat' | 'desert' | 'sagebrush' | 'red_sandstone' | 'white_sandstone'
  | 'canyon_floor' | 'mountain' | 'conifer_forest' | 'alpine' | 'river_valley'
  | 'marsh' | 'urban' | 'badlands' | 'lava_field' | 'water';

export const TERRAIN_INDEX: Record<TerrainType, number> = {
  salt_flat: 0, desert: 1, sagebrush: 2, red_sandstone: 3, white_sandstone: 4,
  canyon_floor: 5, mountain: 6, conifer_forest: 7, alpine: 8, river_valley: 9,
  marsh: 10, urban: 11, badlands: 12, lava_field: 13, water: 14,
};

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  salt_flat:       '#F5F3F0',
  desert:          '#D4BA88',
  sagebrush:       '#8B9A6B',
  red_sandstone:   '#C45B28',
  white_sandstone: '#E8D8C0',
  canyon_floor:    '#A08060',
  mountain:        '#7A7A6A',
  conifer_forest:  '#2D5A3D',
  alpine:          '#9A9A9A',
  river_valley:    '#5A7A3A',
  marsh:           '#4A6840',
  urban:           '#988878',
  badlands:        '#8A8A98',
  lava_field:      '#3A3A3A',
  water:           '#2A6B88',
};

// Secondary and tertiary colors for noise variation
export const TERRAIN_COLORS_SECONDARY: Record<TerrainType, string> = {
  salt_flat:       '#F0EDE4',
  desert:          '#C49860',
  sagebrush:       '#7A8A5A',
  red_sandstone:   '#D47038',
  white_sandstone: '#F0E8DC',
  canyon_floor:    '#8A7050',
  mountain:        '#6A6A5A',
  conifer_forest:  '#1A4A2D',
  alpine:          '#D0D0D0',
  river_valley:    '#4A6A2A',
  marsh:           '#3A5830',
  urban:           '#887868',
  badlands:        '#7A7A88',
  lava_field:      '#4A3A2A',
  water:           '#3A7B98',
};

export const TERRAIN_COLORS_TERTIARY: Record<TerrainType, string> = {
  salt_flat:       '#FAFAFA',
  desert:          '#E8D8A8',
  sagebrush:       '#9BAA7B',
  red_sandstone:   '#8B3A1A',
  white_sandstone: '#E0D4B8',
  canyon_floor:    '#B89070',
  mountain:        '#8A8A7A',
  conifer_forest:  '#3D6A4D',
  alpine:          '#F0F0F0',
  river_valley:    '#6A8A4A',
  marsh:           '#5A7850',
  urban:           '#A89888',
  badlands:        '#9A9AA8',
  lava_field:      '#2A2A2A',
  water:           '#1A5A78',
};

// === Terrain Features ===
export type TerrainFeature =
  | 'hoodoo_field' | 'arch_concentration' | 'slot_canyon' | 'sand_dune'
  | 'pinyon_juniper' | 'aspen_grove' | 'cryptobiotic_crust' | 'hot_spring'
  | 'mine' | 'cliff_dwelling' | 'petrified_forest' | 'hanging_garden'
  | 'natural_bridge' | 'escarpment' | 'volcanic_cone'
  | 'dense_forest' | 'forest' | 'woodland';

// === Regional Tint Indices ===
export const TINT_NONE = 0;
export const TINT_WASATCH = 1;
export const TINT_UINTA = 2;
export const TINT_GREAT_BASIN = 3;
export const TINT_COLORADO_PLATEAU = 4;
export const TINT_GRAND_STAIRCASE = 5;
export const TINT_MOJAVE = 6;
export const TINT_HIGH_PLATEAUS = 7;
export const TINT_UINTA_BASIN = 8;
export const TINT_CANYON_COUNTRY = 9;
export const TINT_BOOK_CLIFFS = 10;

// === Geological Formation Indices (for shader coloring) ===
export const FORMATION_NONE = 0;
export const FORMATION_NAVAJO = 1;       // cream/white/pink sandstone
export const FORMATION_ENTRADA = 2;      // salmon-orange sandstone
export const FORMATION_WINGATE = 3;      // dark red-brown sandstone
export const FORMATION_CLARON = 4;       // pink/orange/white (Bryce hoodoos)
export const FORMATION_MANCOS = 5;       // blue-grey shale (badlands)
export const FORMATION_CEDAR_MESA = 6;   // white-red banded (Needles)
export const FORMATION_MOENKOPI = 7;     // chocolate brown
export const FORMATION_CHINLE = 8;       // purple/green/maroon
export const FORMATION_KAYENTA = 9;      // red-brown ledgy
export const FORMATION_DE_CHELLY = 10;   // deep red (Monument Valley)
export const FORMATION_KAIBAB = 11;      // grey-white limestone
export const FORMATION_MORRISON = 12;    // banded green/grey/purple (dinosaurs)
export const FORMATION_UINTA_GROUP = 13; // red-purple quartzite (Uintas)
export const FORMATION_WASATCH_LIME = 14;// grey limestone (Wasatch)

// === Formation Colors (for vertex coloring by geological formation) ===
export const FORMATION_COLORS: Record<number, [number, number, number]> = {
  1:  [0.91, 0.85, 0.75],  // Navajo: cream-white-pink sandstone
  2:  [0.83, 0.44, 0.22],  // Entrada: salmon-orange
  3:  [0.55, 0.22, 0.10],  // Wingate: dark red-brown
  4:  [0.90, 0.55, 0.40],  // Claron: pink-orange (Bryce hoodoos)
  5:  [0.54, 0.54, 0.60],  // Mancos: blue-grey shale
  6:  [0.85, 0.70, 0.55],  // Cedar Mesa: white-red banded
  7:  [0.45, 0.28, 0.15],  // Moenkopi: chocolate brown
  8:  [0.50, 0.35, 0.45],  // Chinle: purple-maroon
  9:  [0.65, 0.30, 0.18],  // Kayenta: red-brown ledgy
  10: [0.72, 0.20, 0.10],  // De Chelly: deep red
  11: [0.78, 0.78, 0.72],  // Kaibab: grey-white limestone
  12: [0.55, 0.60, 0.50],  // Morrison: banded green-grey
  13: [0.55, 0.30, 0.38],  // Uinta Group: red-purple quartzite
  14: [0.70, 0.70, 0.68],  // Wasatch Limestone: grey
};

// === Depth Layers ===
export const DEPTH_TERRAIN = 0;
export const DEPTH_WATER = 10;
export const DEPTH_RIVER = 15;
export const DEPTH_VEGETATION = 20;
export const DEPTH_LANDMARK = 30;
export const DEPTH_UI = 90;
export const DEPTH_TOOLTIP = 100;

// === Render Settings ===
export const MAX_RENDER_SCALE = 0.75;
export const MAX_DPR = 1.5;
export const MAX_GERSTNER_WAVES = 4;
export const TERRAIN_MAX_LOD = 1;

// === Seed ===
export const GLOBAL_TERRAIN_SEED = 42;
