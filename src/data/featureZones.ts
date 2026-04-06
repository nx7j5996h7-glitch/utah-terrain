/**
 * featureZones.ts — Terrain feature overlay zones for Utah.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 */

import type { TerrainFeature } from '@/constants';

export interface FeatureZoneDef {
  name?: string;
  polygon: [number, number][];
  feature: TerrainFeature;
}

export const FEATURE_ZONES: FeatureZoneDef[] = [

  // ============================================================
  // HOODOO FIELDS
  // ============================================================

  // Bryce Canyon amphitheaters — densest hoodoo concentration on Earth
  {
    name: 'Bryce Canyon Amphitheaters',
    feature: 'hoodoo_field',
    polygon: [
      [-112.28, 37.65], [-112.15, 37.66], [-112.08, 37.63], [-112.06, 37.58],
      [-112.08, 37.53], [-112.12, 37.50], [-112.18, 37.49], [-112.25, 37.51],
      [-112.29, 37.55], [-112.30, 37.60],
    ],
  },

  // Cedar Breaks amphitheater — high-altitude hoodoos at 10,000 ft
  {
    name: 'Cedar Breaks Amphitheater',
    feature: 'hoodoo_field',
    polygon: [
      [-112.90, 37.68], [-112.82, 37.68], [-112.78, 37.65], [-112.78, 37.60],
      [-112.80, 37.57], [-112.85, 37.56], [-112.90, 37.58], [-112.92, 37.62],
    ],
  },

  // Goblin Valley mushroom rocks and hoodoos
  {
    name: 'Goblin Valley',
    feature: 'hoodoo_field',
    polygon: [
      [-110.78, 38.61], [-110.68, 38.62], [-110.63, 38.58], [-110.62, 38.53],
      [-110.65, 38.49], [-110.72, 38.48], [-110.78, 38.50], [-110.80, 38.55],
    ],
  },

  // Kodachrome Basin — sedimentary pipes and sand pipes
  {
    name: 'Kodachrome Basin',
    feature: 'hoodoo_field',
    polygon: [
      [-112.06, 37.54], [-111.98, 37.54], [-111.95, 37.50], [-111.96, 37.46],
      [-112.00, 37.44], [-112.06, 37.45], [-112.08, 37.49],
    ],
  },

  // Red Canyon hoodoos along Scenic Byway 12
  {
    name: 'Red Canyon Hoodoos',
    feature: 'hoodoo_field',
    polygon: [
      [-112.38, 37.78], [-112.28, 37.78], [-112.25, 37.74], [-112.26, 37.70],
      [-112.30, 37.68], [-112.36, 37.69], [-112.39, 37.73],
    ],
  },

  // ============================================================
  // ARCH CONCENTRATIONS
  // ============================================================

  // Arches NP — densest natural arch concentration on Earth (2000+ arches)
  {
    name: 'Arches National Park',
    feature: 'arch_concentration',
    polygon: [
      [-109.68, 38.80], [-109.55, 38.82], [-109.48, 38.78], [-109.46, 38.72],
      [-109.48, 38.65], [-109.52, 38.60], [-109.58, 38.58], [-109.65, 38.60],
      [-109.70, 38.66], [-109.72, 38.73],
    ],
  },

  // Natural Bridges NM — Sipapu, Kachina, Owachomo bridges
  {
    name: 'Natural Bridges NM',
    feature: 'arch_concentration',
    polygon: [
      [-110.06, 37.64], [-109.96, 37.65], [-109.92, 37.61], [-109.92, 37.56],
      [-109.96, 37.53], [-110.02, 37.52], [-110.07, 37.55], [-110.08, 37.60],
    ],
  },

  // ============================================================
  // SLOT CANYONS
  // ============================================================

  // Zion Narrows — iconic slot canyon on North Fork Virgin River
  {
    name: 'Zion Narrows',
    feature: 'slot_canyon',
    polygon: [
      [-113.00, 37.40], [-112.92, 37.40], [-112.88, 37.36], [-112.87, 37.30],
      [-112.90, 37.26], [-112.95, 37.24], [-113.00, 37.26], [-113.02, 37.32],
    ],
  },

  // Escalante slot canyon complex — Peek-a-boo, Spooky, Zebra
  {
    name: 'Escalante Slot Canyons',
    feature: 'slot_canyon',
    polygon: [
      [-111.55, 37.72], [-111.40, 37.73], [-111.35, 37.68], [-111.34, 37.60],
      [-111.38, 37.55], [-111.45, 37.53], [-111.52, 37.55], [-111.56, 37.62],
      [-111.57, 37.68],
    ],
  },

  // Antelope Canyon area — near UT/AZ border
  {
    name: 'Antelope Canyon Area',
    feature: 'slot_canyon',
    polygon: [
      [-111.48, 37.05], [-111.36, 37.05], [-111.32, 37.02], [-111.33, 37.00],
      [-111.38, 37.00], [-111.48, 37.00],
    ],
  },

  // Little Wild Horse / Bell Canyon — San Rafael Swell
  {
    name: 'Little Wild Horse Canyon',
    feature: 'slot_canyon',
    polygon: [
      [-110.88, 38.58], [-110.78, 38.59], [-110.74, 38.55], [-110.74, 38.50],
      [-110.78, 38.47], [-110.85, 38.46], [-110.89, 38.50], [-110.90, 38.55],
    ],
  },

  // Buckskin Gulch — longest slot canyon in the SW (on UT/AZ border)
  {
    name: 'Buckskin Gulch',
    feature: 'slot_canyon',
    polygon: [
      [-112.05, 37.08], [-111.92, 37.08], [-111.88, 37.04], [-111.90, 37.00],
      [-111.98, 37.00], [-112.05, 37.02],
    ],
  },

  // ============================================================
  // SAND DUNES
  // ============================================================

  // Coral Pink Sand Dunes — aeolian dunes from eroded Navajo Sandstone
  {
    name: 'Coral Pink Sand Dunes',
    feature: 'sand_dune',
    polygon: [
      [-112.80, 37.08], [-112.70, 37.09], [-112.65, 37.05], [-112.64, 37.00],
      [-112.68, 36.97], [-112.75, 36.96], [-112.80, 36.99], [-112.82, 37.04],
    ],
  },

  // Little Sahara Recreation Area — large aeolian dune field
  {
    name: 'Little Sahara',
    feature: 'sand_dune',
    polygon: [
      [-112.45, 39.72], [-112.30, 39.73], [-112.24, 39.68], [-112.22, 39.62],
      [-112.26, 39.56], [-112.35, 39.54], [-112.42, 39.57], [-112.46, 39.64],
    ],
  },

  // ============================================================
  // PINYON-JUNIPER WOODLAND (~25% of Utah)
  // ============================================================

  // Colorado Plateau PJ belt — vast SE Utah mesa country
  {
    name: 'Colorado Plateau PJ (Southeast)',
    feature: 'pinyon_juniper',
    polygon: [
      [-111.40, 39.60], [-110.50, 39.60], [-109.80, 39.40], [-109.20, 39.20],
      [-109.10, 38.60], [-109.10, 37.80], [-109.20, 37.20], [-109.80, 37.10],
      [-110.40, 37.20], [-111.00, 37.40], [-111.40, 37.80], [-111.50, 38.40],
      [-111.50, 39.00],
    ],
  },

  // Western foothills PJ belt — Stansbury to Deep Creek
  {
    name: 'Western Foothills PJ Belt',
    feature: 'pinyon_juniper',
    polygon: [
      [-113.90, 40.20], [-113.40, 40.25], [-112.80, 40.10], [-112.60, 39.80],
      [-112.70, 39.40], [-113.00, 39.10], [-113.40, 39.00], [-113.80, 39.10],
      [-114.00, 39.50], [-114.05, 39.90],
    ],
  },

  // Central high plateaus PJ belt — Sevier Valley flanks
  {
    name: 'Central Plateaus PJ',
    feature: 'pinyon_juniper',
    polygon: [
      [-112.40, 39.40], [-111.90, 39.40], [-111.80, 39.00], [-111.90, 38.60],
      [-112.10, 38.30], [-112.40, 38.20], [-112.60, 38.50], [-112.60, 39.00],
    ],
  },

  // Grand Staircase PJ — south-central Utah
  {
    name: 'Grand Staircase PJ',
    feature: 'pinyon_juniper',
    polygon: [
      [-112.50, 37.80], [-111.80, 37.80], [-111.60, 37.50], [-111.70, 37.20],
      [-112.00, 37.05], [-112.40, 37.05], [-112.60, 37.30], [-112.60, 37.60],
    ],
  },

  // Tavaputs Plateau PJ — between Price and Uinta Basin
  {
    name: 'Tavaputs Plateau PJ',
    feature: 'pinyon_juniper',
    polygon: [
      [-111.00, 40.10], [-110.20, 40.10], [-109.80, 39.90], [-109.60, 39.60],
      [-109.80, 39.40], [-110.40, 39.30], [-111.00, 39.50], [-111.10, 39.80],
    ],
  },

  // ============================================================
  // DENSE FOREST (high-elevation conifers)
  // ============================================================

  // Uinta high country — spruce-fir above 9000 ft
  {
    name: 'Uinta Dense Forest',
    feature: 'dense_forest',
    polygon: [
      [-111.25, 40.90], [-110.70, 40.90], [-110.15, 40.85], [-109.70, 40.78],
      [-109.55, 40.68], [-109.70, 40.60], [-110.15, 40.58], [-110.70, 40.62],
      [-111.25, 40.68],
    ],
  },

  // Upper Wasatch — Big/Little Cottonwood, Park City ridgelines
  {
    name: 'Upper Wasatch Dense Forest',
    feature: 'dense_forest',
    polygon: [
      [-111.78, 41.20], [-111.62, 41.22], [-111.56, 41.05], [-111.58, 40.80],
      [-111.62, 40.60], [-111.68, 40.45], [-111.75, 40.42], [-111.80, 40.55],
      [-111.78, 40.80], [-111.76, 41.00],
    ],
  },

  // ============================================================
  // FOREST (mid-elevation mixed conifer / ponderosa)
  // ============================================================

  // Manti-La Sal NF — Manti Division
  {
    name: 'Manti-La Sal Forest (Manti)',
    feature: 'forest',
    polygon: [
      [-111.70, 39.50], [-111.40, 39.55], [-111.30, 39.30], [-111.35, 39.00],
      [-111.50, 38.80], [-111.65, 38.75], [-111.75, 39.00], [-111.75, 39.30],
    ],
  },

  // Fishlake NF
  {
    name: 'Fishlake National Forest',
    feature: 'forest',
    polygon: [
      [-112.20, 38.75], [-111.80, 38.80], [-111.55, 38.65], [-111.50, 38.40],
      [-111.60, 38.20], [-111.80, 38.10], [-112.10, 38.15], [-112.30, 38.35],
      [-112.30, 38.55],
    ],
  },

  // Dixie NF — Pine Valley & Markagunt
  {
    name: 'Dixie National Forest',
    feature: 'forest',
    polygon: [
      [-112.90, 37.85], [-112.50, 37.88], [-112.20, 37.80], [-112.00, 37.65],
      [-112.10, 37.45], [-112.30, 37.35], [-112.60, 37.35], [-112.85, 37.45],
      [-112.95, 37.65],
    ],
  },

  // La Sal Mountains forest
  {
    name: 'La Sal Mountain Forest',
    feature: 'forest',
    polygon: [
      [-109.42, 38.58], [-109.22, 38.58], [-109.12, 38.45], [-109.15, 38.30],
      [-109.25, 38.25], [-109.40, 38.30], [-109.45, 38.45],
    ],
  },

  // Abajo Mountains forest
  {
    name: 'Abajo Mountains Forest',
    feature: 'forest',
    polygon: [
      [-109.55, 37.92], [-109.38, 37.93], [-109.30, 37.80], [-109.32, 37.70],
      [-109.42, 37.65], [-109.55, 37.70], [-109.58, 37.82],
    ],
  },

  // ============================================================
  // WOODLAND (transition zones, gambel oak, mountain brush)
  // ============================================================

  // Wasatch foothills woodland belt
  {
    name: 'Wasatch Foothills Woodland',
    feature: 'woodland',
    polygon: [
      [-112.00, 41.60], [-111.82, 41.62], [-111.78, 41.30], [-111.80, 40.95],
      [-111.82, 40.60], [-111.88, 40.35], [-111.95, 40.32], [-112.02, 40.50],
      [-112.00, 40.90], [-112.02, 41.30],
    ],
  },

  // Cache Valley / Bear River Range woodland
  {
    name: 'Bear River Range Woodland',
    feature: 'woodland',
    polygon: [
      [-111.70, 42.00], [-111.50, 42.00], [-111.45, 41.80], [-111.48, 41.60],
      [-111.55, 41.50], [-111.65, 41.50], [-111.72, 41.65], [-111.72, 41.85],
    ],
  },

  // Tushar Mountains woodland transition
  {
    name: 'Tushar Woodland',
    feature: 'woodland',
    polygon: [
      [-112.55, 38.55], [-112.30, 38.58], [-112.18, 38.40], [-112.20, 38.22],
      [-112.35, 38.18], [-112.55, 38.25], [-112.60, 38.40],
    ],
  },

  // ============================================================
  // ASPEN GROVES
  // ============================================================

  // Fishlake / Pando area — home of the world's largest organism
  {
    name: 'Pando Aspen Grove',
    feature: 'aspen_grove',
    polygon: [
      [-111.82, 38.58], [-111.72, 38.59], [-111.68, 38.55], [-111.67, 38.50],
      [-111.70, 38.46], [-111.76, 38.44], [-111.82, 38.47], [-111.84, 38.53],
    ],
  },

  // Wasatch autumn color zone — Big Cottonwood, Millcreek
  {
    name: 'Wasatch Aspen Zone',
    feature: 'aspen_grove',
    polygon: [
      [-111.72, 40.72], [-111.62, 40.73], [-111.58, 40.65], [-111.60, 40.55],
      [-111.65, 40.50], [-111.72, 40.52], [-111.75, 40.60], [-111.74, 40.68],
    ],
  },

  // La Sal Mountain aspen belt
  {
    name: 'La Sal Aspen Belt',
    feature: 'aspen_grove',
    polygon: [
      [-109.38, 38.52], [-109.25, 38.53], [-109.18, 38.45], [-109.20, 38.35],
      [-109.28, 38.32], [-109.38, 38.36], [-109.40, 38.45],
    ],
  },

  // Logan Canyon / Bear Lake aspen
  {
    name: 'Logan Canyon Aspen',
    feature: 'aspen_grove',
    polygon: [
      [-111.60, 41.90], [-111.45, 41.91], [-111.40, 41.85], [-111.42, 41.78],
      [-111.50, 41.75], [-111.58, 41.78], [-111.62, 41.85],
    ],
  },

  // ============================================================
  // VOLCANIC FEATURES
  // ============================================================

  // Black Rock Desert cinder cones — Quaternary volcanic field
  {
    name: 'Black Rock Desert Cinder Cones',
    feature: 'volcanic_cone',
    polygon: [
      [-112.58, 39.12], [-112.45, 39.13], [-112.40, 39.07], [-112.38, 39.00],
      [-112.42, 38.95], [-112.50, 38.93], [-112.58, 38.96], [-112.60, 39.04],
    ],
  },

  // Tabernacle Hill / Ice Springs volcanic field
  {
    name: 'Tabernacle Hill Volcanic Field',
    feature: 'volcanic_cone',
    polygon: [
      [-112.62, 38.80], [-112.50, 38.81], [-112.46, 38.76], [-112.48, 38.70],
      [-112.54, 38.68], [-112.62, 38.70], [-112.64, 38.76],
    ],
  },

  // Snow Canyon lava tubes and basalt flows
  {
    name: 'Snow Canyon Lava Flows',
    feature: 'volcanic_cone',
    polygon: [
      [-113.72, 37.25], [-113.60, 37.26], [-113.55, 37.22], [-113.54, 37.16],
      [-113.58, 37.12], [-113.65, 37.10], [-113.72, 37.13], [-113.74, 37.19],
    ],
  },

  // Markagunt Plateau lava flows — Brian Head area
  {
    name: 'Markagunt Plateau Lava Flows',
    feature: 'volcanic_cone',
    polygon: [
      [-112.90, 37.75], [-112.75, 37.76], [-112.68, 37.70], [-112.70, 37.62],
      [-112.78, 37.58], [-112.88, 37.60], [-112.92, 37.68],
    ],
  },

  // ============================================================
  // CRYPTOBIOTIC CRUST
  // ============================================================

  // Canyonlands NP — extensive biological soil crust
  {
    name: 'Canyonlands Cryptobiotic Crust',
    feature: 'cryptobiotic_crust',
    polygon: [
      [-110.20, 38.50], [-109.80, 38.55], [-109.70, 38.35], [-109.75, 38.10],
      [-109.90, 37.95], [-110.10, 37.90], [-110.30, 38.00], [-110.35, 38.20],
      [-110.30, 38.40],
    ],
  },

  // Arches NP cryptobiotic zone
  {
    name: 'Arches Cryptobiotic Crust',
    feature: 'cryptobiotic_crust',
    polygon: [
      [-109.70, 38.82], [-109.55, 38.84], [-109.46, 38.76], [-109.45, 38.64],
      [-109.50, 38.56], [-109.60, 38.54], [-109.68, 38.58], [-109.72, 38.68],
      [-109.72, 38.78],
    ],
  },

  // Capitol Reef cryptobiotic crust
  {
    name: 'Capitol Reef Cryptobiotic Crust',
    feature: 'cryptobiotic_crust',
    polygon: [
      [-111.30, 38.40], [-111.12, 38.42], [-111.00, 38.30], [-110.98, 38.15],
      [-111.05, 38.00], [-111.18, 37.95], [-111.30, 38.02], [-111.35, 38.18],
      [-111.35, 38.32],
    ],
  },

  // General Colorado Plateau crypto — broad mesa country
  {
    name: 'Colorado Plateau Cryptobiotic (South)',
    feature: 'cryptobiotic_crust',
    polygon: [
      [-110.40, 37.80], [-109.80, 37.80], [-109.50, 37.50], [-109.50, 37.20],
      [-109.80, 37.10], [-110.20, 37.15], [-110.50, 37.40], [-110.50, 37.65],
    ],
  },

  // ============================================================
  // MINES
  // ============================================================

  // Bingham Canyon Mine — largest open-pit copper mine
  {
    name: 'Bingham Canyon Mine',
    feature: 'mine',
    polygon: [
      [-112.18, 40.56], [-112.12, 40.56], [-112.10, 40.53], [-112.10, 40.50],
      [-112.13, 40.48], [-112.18, 40.49], [-112.20, 40.52],
    ],
  },

  // Park City mining district — historic silver mining
  {
    name: 'Park City Mining District',
    feature: 'mine',
    polygon: [
      [-111.55, 40.68], [-111.45, 40.69], [-111.42, 40.65], [-111.43, 40.61],
      [-111.48, 40.59], [-111.55, 40.60], [-111.57, 40.64],
    ],
  },

  // Tintic Mining District — historic, near Eureka
  {
    name: 'Tintic Mining District',
    feature: 'mine',
    polygon: [
      [-112.15, 39.98], [-112.08, 39.98], [-112.05, 39.94], [-112.07, 39.90],
      [-112.12, 39.89], [-112.16, 39.92],
    ],
  },

  // ============================================================
  // CLIFF DWELLINGS
  // ============================================================

  // Grand Gulch — Ancestral Puebloan ruins
  {
    name: 'Grand Gulch Cliff Dwellings',
    feature: 'cliff_dwelling',
    polygon: [
      [-110.10, 37.55], [-109.90, 37.56], [-109.82, 37.48], [-109.80, 37.38],
      [-109.88, 37.30], [-110.00, 37.28], [-110.10, 37.35], [-110.12, 37.45],
    ],
  },

  // Hovenweep NM — towers and cliff dwellings
  {
    name: 'Hovenweep',
    feature: 'cliff_dwelling',
    polygon: [
      [-109.12, 37.42], [-109.04, 37.42], [-109.02, 37.38], [-109.04, 37.34],
      [-109.10, 37.33], [-109.14, 37.36],
    ],
  },

  // ============================================================
  // PETRIFIED FOREST
  // ============================================================

  // Escalante Petrified Forest State Park
  {
    name: 'Escalante Petrified Forest',
    feature: 'petrified_forest',
    polygon: [
      [-111.65, 37.80], [-111.56, 37.81], [-111.52, 37.77], [-111.53, 37.72],
      [-111.58, 37.70], [-111.64, 37.72], [-111.66, 37.76],
    ],
  },

  // ============================================================
  // HANGING GARDENS
  // ============================================================

  // Zion hanging gardens — seep-fed gardens on canyon walls
  {
    name: 'Zion Hanging Gardens',
    feature: 'hanging_garden',
    polygon: [
      [-113.02, 37.32], [-112.92, 37.33], [-112.88, 37.28], [-112.90, 37.22],
      [-112.96, 37.20], [-113.02, 37.22], [-113.04, 37.28],
    ],
  },

  // Capitol Reef hanging gardens — along Fremont River
  {
    name: 'Capitol Reef Hanging Gardens',
    feature: 'hanging_garden',
    polygon: [
      [-111.28, 38.32], [-111.18, 38.33], [-111.14, 38.28], [-111.16, 38.23],
      [-111.22, 38.21], [-111.28, 38.24], [-111.30, 38.28],
    ],
  },

  // ============================================================
  // NATURAL BRIDGES
  // ============================================================

  // Rainbow Bridge area — largest natural bridge
  {
    name: 'Rainbow Bridge',
    feature: 'natural_bridge',
    polygon: [
      [-110.98, 37.10], [-110.92, 37.10], [-110.90, 37.07], [-110.92, 37.04],
      [-110.97, 37.03], [-111.00, 37.06],
    ],
  },

  // ============================================================
  // ESCARPMENTS
  // ============================================================

  // Book Cliffs — 200-mile escarpment, longest continuous cliff in North America
  {
    name: 'Book Cliffs',
    feature: 'escarpment',
    polygon: [
      [-111.00, 39.80], [-110.50, 39.75], [-110.00, 39.70], [-109.60, 39.60],
      [-109.30, 39.50], [-109.10, 39.40], [-109.10, 39.30], [-109.30, 39.38],
      [-109.60, 39.48], [-110.00, 39.58], [-110.50, 39.62], [-111.00, 39.68],
    ],
  },

  // San Rafael Reef — eastern escarpment of San Rafael Swell
  {
    name: 'San Rafael Reef',
    feature: 'escarpment',
    polygon: [
      [-110.55, 39.10], [-110.45, 39.15], [-110.35, 39.00], [-110.30, 38.80],
      [-110.32, 38.60], [-110.40, 38.50], [-110.50, 38.55], [-110.55, 38.70],
      [-110.58, 38.90],
    ],
  },

  // Hurricane Cliffs — major fault escarpment in SW Utah
  {
    name: 'Hurricane Cliffs',
    feature: 'escarpment',
    polygon: [
      [-113.35, 37.70], [-113.25, 37.72], [-113.15, 37.55], [-113.10, 37.35],
      [-113.15, 37.18], [-113.20, 37.10], [-113.30, 37.12], [-113.30, 37.30],
      [-113.32, 37.50],
    ],
  },

  // Waterpocket Fold — 100-mile monoclinal escarpment (Capitol Reef)
  {
    name: 'Waterpocket Fold',
    feature: 'escarpment',
    polygon: [
      [-111.25, 38.35], [-111.15, 38.38], [-111.05, 38.25], [-110.95, 38.05],
      [-110.90, 37.85], [-110.88, 37.65], [-110.92, 37.55], [-111.02, 37.52],
      [-111.05, 37.65], [-111.05, 37.85], [-111.10, 38.05], [-111.18, 38.25],
    ],
  },

  // Comb Ridge — 80-mile monocline in SE Utah
  {
    name: 'Comb Ridge',
    feature: 'escarpment',
    polygon: [
      [-109.70, 37.70], [-109.60, 37.72], [-109.55, 37.55], [-109.52, 37.35],
      [-109.50, 37.15], [-109.55, 37.08], [-109.65, 37.10], [-109.62, 37.30],
      [-109.65, 37.50],
    ],
  },

  // Cockscomb — sharp Navajo Sandstone ridge between Kanab and Kodachrome
  {
    name: 'Cockscomb Ridge',
    feature: 'escarpment',
    polygon: [
      [-112.02, 37.50], [-111.95, 37.52], [-111.88, 37.40], [-111.85, 37.25],
      [-111.88, 37.15], [-111.95, 37.12], [-112.00, 37.20], [-112.02, 37.35],
    ],
  },

  // ============================================================
  // HOT SPRINGS
  // ============================================================

  // Mystic Hot Springs — Monroe
  {
    name: 'Mystic Hot Springs',
    feature: 'hot_spring',
    polygon: [
      [-112.15, 38.66], [-112.10, 38.66], [-112.08, 38.63], [-112.10, 38.60],
      [-112.14, 38.60], [-112.16, 38.63],
    ],
  },

  // Meadow / Hatton hot springs area
  {
    name: 'Meadow Hot Springs',
    feature: 'hot_spring',
    polygon: [
      [-112.45, 38.95], [-112.40, 38.95], [-112.38, 38.92], [-112.40, 38.89],
      [-112.44, 38.89], [-112.46, 38.92],
    ],
  },

  // Fifth Water Hot Springs — near Spanish Fork
  {
    name: 'Fifth Water Hot Springs',
    feature: 'hot_spring',
    polygon: [
      [-111.40, 40.10], [-111.35, 40.10], [-111.33, 40.07], [-111.35, 40.04],
      [-111.39, 40.04], [-111.41, 40.07],
    ],
  },
];
