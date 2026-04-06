/**
 * formations.ts — Geological formation zone data for Utah terrain shader coloring.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 *
 * Formation indices from constants.ts determine which shader color palette
 * is applied to the terrain surface.
 */

import {
  FORMATION_NAVAJO, FORMATION_ENTRADA, FORMATION_WINGATE, FORMATION_CLARON,
  FORMATION_MANCOS, FORMATION_CEDAR_MESA, FORMATION_MOENKOPI, FORMATION_CHINLE,
  FORMATION_KAYENTA, FORMATION_DE_CHELLY, FORMATION_KAIBAB, FORMATION_MORRISON,
  FORMATION_UINTA_GROUP, FORMATION_WASATCH_LIME,
} from '@/constants';

export interface FormationZoneDef {
  polygon: [number, number][];
  formation: number;
  name: string;
}

export const FORMATION_ZONES: FormationZoneDef[] = [

  // ============================================================
  // GRAND STAIRCASE — descending cliff steps from Bryce to Grand Canyon
  // Each step exposes progressively older rock from north to south
  // ============================================================

  // Pink Cliffs — Claron Formation (Bryce hoodoos, Cedar Breaks)
  {
    name: 'Pink Cliffs (Claron)',
    formation: FORMATION_CLARON,
    polygon: [
      [-113.00, 37.82], [-112.60, 37.84], [-112.20, 37.80], [-112.00, 37.75],
      [-112.00, 37.55], [-112.20, 37.50], [-112.60, 37.50], [-112.90, 37.55],
      [-113.00, 37.65],
    ],
  },

  // Grey Cliffs — Mancos Shale (between Pink and White cliffs)
  {
    name: 'Grey Cliffs (Mancos Shale)',
    formation: FORMATION_MANCOS,
    polygon: [
      [-113.10, 37.55], [-112.60, 37.52], [-112.20, 37.50], [-112.00, 37.48],
      [-112.00, 37.30], [-112.20, 37.25], [-112.60, 37.22], [-113.00, 37.28],
      [-113.10, 37.40],
    ],
  },

  // White Cliffs — Navajo Sandstone (Zion upper walls, sweeping cross-beds)
  {
    name: 'White Cliffs (Navajo)',
    formation: FORMATION_NAVAJO,
    polygon: [
      [-113.20, 37.42], [-112.80, 37.40], [-112.40, 37.35], [-112.10, 37.30],
      [-112.00, 37.18], [-112.10, 37.10], [-112.40, 37.08], [-112.80, 37.10],
      [-113.10, 37.15], [-113.20, 37.28],
    ],
  },

  // Vermilion Cliffs — Kayenta/Moenave (deep red ledgy sandstone)
  {
    name: 'Vermilion Cliffs (Kayenta)',
    formation: FORMATION_KAYENTA,
    polygon: [
      [-113.30, 37.18], [-112.90, 37.15], [-112.50, 37.10], [-112.20, 37.08],
      [-112.10, 37.00], [-112.20, 36.98], [-112.60, 36.98], [-113.00, 37.00],
      [-113.30, 37.05],
    ],
  },

  // Chocolate Cliffs — Moenkopi Formation (lowest step)
  {
    name: 'Chocolate Cliffs (Moenkopi)',
    formation: FORMATION_MOENKOPI,
    polygon: [
      [-113.50, 37.10], [-113.10, 37.08], [-112.70, 37.02], [-112.40, 37.00],
      [-112.30, 36.98], [-112.50, 36.96], [-112.90, 36.96], [-113.20, 36.98],
      [-113.50, 37.00],
    ],
  },

  // ============================================================
  // MONUMENT VALLEY — De Chelly Sandstone
  // ============================================================

  {
    name: 'Monument Valley (De Chelly)',
    formation: FORMATION_DE_CHELLY,
    polygon: [
      [-110.30, 37.20], [-109.90, 37.22], [-109.60, 37.15], [-109.40, 37.05],
      [-109.40, 36.98], [-109.70, 36.98], [-110.00, 37.00], [-110.30, 37.05],
    ],
  },

  // ============================================================
  // ARCHES / MOAB — Entrada Sandstone
  // ============================================================

  // Main Moab/Arches Entrada belt
  {
    name: 'Arches/Moab Entrada Belt',
    formation: FORMATION_ENTRADA,
    polygon: [
      [-109.80, 38.90], [-109.50, 38.92], [-109.35, 38.82], [-109.30, 38.65],
      [-109.35, 38.48], [-109.50, 38.40], [-109.70, 38.42], [-109.85, 38.55],
      [-109.88, 38.72],
    ],
  },

  // Goblin Valley / San Rafael Entrada
  {
    name: 'San Rafael Entrada',
    formation: FORMATION_ENTRADA,
    polygon: [
      [-110.90, 38.65], [-110.60, 38.68], [-110.40, 38.60], [-110.35, 38.45],
      [-110.40, 38.30], [-110.60, 38.25], [-110.80, 38.28], [-110.92, 38.42],
    ],
  },

  // ============================================================
  // CANYONLANDS NEEDLES — Cedar Mesa Sandstone
  // ============================================================

  {
    name: 'Canyonlands Needles (Cedar Mesa)',
    formation: FORMATION_CEDAR_MESA,
    polygon: [
      [-110.10, 38.20], [-109.80, 38.22], [-109.65, 38.10], [-109.60, 37.90],
      [-109.65, 37.75], [-109.80, 37.65], [-110.00, 37.68], [-110.15, 37.82],
      [-110.18, 38.00],
    ],
  },

  // Cedar Mesa plateau — broader extent west of Comb Ridge
  {
    name: 'Cedar Mesa Plateau',
    formation: FORMATION_CEDAR_MESA,
    polygon: [
      [-110.40, 37.65], [-110.10, 37.68], [-109.75, 37.60], [-109.60, 37.40],
      [-109.65, 37.20], [-109.90, 37.15], [-110.20, 37.20], [-110.40, 37.40],
    ],
  },

  // ============================================================
  // CAPITOL REEF — Wingate Sandstone (sheer red-brown cliff walls)
  // ============================================================

  {
    name: 'Capitol Reef Wingate Walls',
    formation: FORMATION_WINGATE,
    polygon: [
      [-111.40, 38.40], [-111.15, 38.42], [-111.00, 38.30], [-110.95, 38.10],
      [-111.00, 37.90], [-111.10, 37.75], [-111.25, 37.72], [-111.38, 37.82],
      [-111.42, 38.05], [-111.42, 38.25],
    ],
  },

  // Wingate cliffs along Colorado River corridor
  {
    name: 'Colorado River Wingate Corridor',
    formation: FORMATION_WINGATE,
    polygon: [
      [-110.20, 38.10], [-109.95, 38.15], [-109.80, 38.00], [-109.75, 37.80],
      [-109.85, 37.65], [-110.00, 37.60], [-110.15, 37.70], [-110.22, 37.90],
    ],
  },

  // ============================================================
  // UINTA MOUNTAINS — Uinta Group (Proterozoic red-purple quartzite)
  // ============================================================

  {
    name: 'Uinta Mountains Core (Uinta Group)',
    formation: FORMATION_UINTA_GROUP,
    polygon: [
      [-111.30, 40.92], [-110.70, 40.93], [-110.10, 40.88], [-109.70, 40.82],
      [-109.50, 40.72], [-109.50, 40.58], [-109.70, 40.55], [-110.10, 40.55],
      [-110.70, 40.60], [-111.30, 40.66],
    ],
  },

  // ============================================================
  // WASATCH RANGE — Wasatch Limestone (grey Paleozoic limestone)
  // ============================================================

  {
    name: 'Wasatch Range Limestone',
    formation: FORMATION_WASATCH_LIME,
    polygon: [
      [-111.85, 42.00], [-111.62, 42.00], [-111.55, 41.50], [-111.58, 41.00],
      [-111.62, 40.60], [-111.68, 40.25], [-111.78, 40.20], [-111.85, 40.30],
      [-111.82, 40.70], [-111.78, 41.10], [-111.75, 41.50],
    ],
  },

  // ============================================================
  // SAN RAFAEL SWELL — concentric ring of formations
  // ============================================================

  // Morrison Formation at center — famous dinosaur bone layer
  {
    name: 'San Rafael Swell Morrison Center',
    formation: FORMATION_MORRISON,
    polygon: [
      [-110.80, 39.00], [-110.55, 39.02], [-110.40, 38.90], [-110.35, 38.75],
      [-110.40, 38.60], [-110.55, 38.52], [-110.72, 38.55], [-110.82, 38.68],
      [-110.85, 38.85],
    ],
  },

  // San Rafael Swell outer ring — Navajo Sandstone reef
  {
    name: 'San Rafael Swell Navajo Rim',
    formation: FORMATION_NAVAJO,
    polygon: [
      [-110.95, 39.10], [-110.50, 39.15], [-110.25, 39.00], [-110.15, 38.78],
      [-110.20, 38.55], [-110.35, 38.40], [-110.55, 38.35], [-110.80, 38.38],
      [-110.98, 38.55], [-111.02, 38.78], [-111.00, 38.98],
    ],
  },

  // ============================================================
  // DINOSAUR NM — Morrison Formation
  // ============================================================

  {
    name: 'Dinosaur NM Morrison Beds',
    formation: FORMATION_MORRISON,
    polygon: [
      [-109.40, 40.55], [-109.15, 40.58], [-109.05, 40.48], [-109.05, 40.35],
      [-109.15, 40.25], [-109.30, 40.22], [-109.42, 40.30], [-109.45, 40.42],
    ],
  },

  // ============================================================
  // CHINLE FORMATION — Purple/green/maroon mudstones
  // ============================================================

  // Chinle along the Dirty Devil / Capitol Reef south
  {
    name: 'Capitol Reef Chinle Belt',
    formation: FORMATION_CHINLE,
    polygon: [
      [-111.10, 38.20], [-110.90, 38.22], [-110.80, 38.10], [-110.78, 37.95],
      [-110.85, 37.82], [-110.98, 37.78], [-111.10, 37.85], [-111.14, 38.00],
    ],
  },

  // Chinle along the San Juan River / Mexican Hat area
  {
    name: 'San Juan Chinle Belt',
    formation: FORMATION_CHINLE,
    polygon: [
      [-110.10, 37.25], [-109.70, 37.28], [-109.50, 37.18], [-109.45, 37.05],
      [-109.55, 36.98], [-109.80, 36.98], [-110.05, 37.05], [-110.12, 37.15],
    ],
  },

  // ============================================================
  // NAVAJO SANDSTONE — Major exposures beyond Grand Staircase
  // ============================================================

  // Zion Canyon proper — massive Navajo walls
  {
    name: 'Zion Canyon Navajo Walls',
    formation: FORMATION_NAVAJO,
    polygon: [
      [-113.10, 37.38], [-112.90, 37.40], [-112.82, 37.32], [-112.80, 37.22],
      [-112.85, 37.14], [-112.98, 37.10], [-113.08, 37.15], [-113.12, 37.28],
    ],
  },

  // Snow Canyon Navajo — red and white Navajo at St. George
  {
    name: 'Snow Canyon Navajo',
    formation: FORMATION_NAVAJO,
    polygon: [
      [-113.72, 37.22], [-113.58, 37.24], [-113.50, 37.16], [-113.52, 37.08],
      [-113.60, 37.02], [-113.70, 37.05], [-113.74, 37.14],
    ],
  },

  // ============================================================
  // KAIBAB LIMESTONE — Grey-white cap rock
  // ============================================================

  // Kaibab along the Kolob Plateau / Zion rim
  {
    name: 'Kolob Plateau Kaibab Cap',
    formation: FORMATION_KAIBAB,
    polygon: [
      [-113.20, 37.50], [-113.00, 37.52], [-112.88, 37.45], [-112.85, 37.35],
      [-112.90, 37.25], [-113.05, 37.22], [-113.18, 37.28], [-113.22, 37.40],
    ],
  },

  // ============================================================
  // MANCOS SHALE — Broad badlands exposures
  // ============================================================

  // Book Cliffs Mancos belt
  {
    name: 'Book Cliffs Mancos Shale',
    formation: FORMATION_MANCOS,
    polygon: [
      [-111.00, 39.75], [-110.40, 39.72], [-109.80, 39.60], [-109.40, 39.45],
      [-109.10, 39.30], [-109.10, 39.15], [-109.40, 39.25], [-109.80, 39.40],
      [-110.40, 39.52], [-111.00, 39.58],
    ],
  },

  // Factory Butte / Caineville Mancos badlands
  {
    name: 'Factory Butte Mancos Badlands',
    formation: FORMATION_MANCOS,
    polygon: [
      [-110.95, 38.52], [-110.70, 38.55], [-110.58, 38.45], [-110.55, 38.30],
      [-110.62, 38.20], [-110.78, 38.18], [-110.92, 38.25], [-110.98, 38.38],
    ],
  },

  // Uinta Basin Mancos — broad shale plain
  {
    name: 'Uinta Basin Mancos Plain',
    formation: FORMATION_MANCOS,
    polygon: [
      [-110.60, 40.20], [-110.00, 40.25], [-109.50, 40.15], [-109.20, 39.95],
      [-109.20, 39.70], [-109.50, 39.65], [-110.00, 39.70], [-110.40, 39.80],
      [-110.60, 40.00],
    ],
  },

  // ============================================================
  // MORRISON FORMATION — Broad Colorado Plateau exposures
  // ============================================================

  // Cleveland-Lloyd Dinosaur Quarry area
  {
    name: 'Cleveland-Lloyd Morrison',
    formation: FORMATION_MORRISON,
    polygon: [
      [-110.75, 39.40], [-110.50, 39.42], [-110.38, 39.32], [-110.35, 39.18],
      [-110.42, 39.08], [-110.58, 39.02], [-110.72, 39.10], [-110.78, 39.25],
    ],
  },

  // ============================================================
  // MOENKOPI — Chocolate-brown formation, broader extent
  // ============================================================

  // Capitol Reef Moenkopi — along highway 24
  {
    name: 'Capitol Reef Moenkopi',
    formation: FORMATION_MOENKOPI,
    polygon: [
      [-111.35, 38.32], [-111.15, 38.35], [-111.02, 38.25], [-110.98, 38.10],
      [-111.05, 37.98], [-111.18, 37.92], [-111.32, 38.00], [-111.38, 38.15],
    ],
  },

  // ============================================================
  // ENTRADA — Broader salmon-orange belt
  // ============================================================

  // Kodachrome Basin / Cannonville Entrada
  {
    name: 'Kodachrome Entrada',
    formation: FORMATION_ENTRADA,
    polygon: [
      [-112.10, 37.56], [-111.95, 37.58], [-111.88, 37.50], [-111.90, 37.42],
      [-111.98, 37.38], [-112.08, 37.40], [-112.12, 37.48],
    ],
  },

  // ============================================================
  // KAYENTA — Red-brown ledgy formation, broader extent
  // ============================================================

  // Kayenta along I-70 corridor in eastern Utah
  {
    name: 'I-70 Kayenta Ledges',
    formation: FORMATION_KAYENTA,
    polygon: [
      [-110.30, 39.05], [-109.90, 39.08], [-109.60, 38.98], [-109.50, 38.85],
      [-109.60, 38.72], [-109.85, 38.68], [-110.10, 38.72], [-110.30, 38.85],
    ],
  },
];
