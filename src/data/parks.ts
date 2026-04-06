/**
 * parks.ts — Polygon data for Utah's parks, monuments, forests, and recreation areas.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 */

export interface ParkDef {
  name: string;
  polygon: [number, number][]; // [lon, lat] boundary
  type: 'national_park' | 'national_monument' | 'state_park' | 'national_forest' | 'national_recreation_area';
}

export const PARKS: ParkDef[] = [

  // ================================================================
  // NATIONAL PARKS (5)
  // ================================================================

  // ── Zion National Park ─────────────────────────────────────────
  // ~229 sq mi, centered ~37.30, -113.00. Deep sandstone canyons.
  {
    name: 'Zion',
    type: 'national_park',
    polygon: [
      [-113.18, 37.45], [-113.02, 37.46], [-112.88, 37.43], [-112.82, 37.35],
      [-112.83, 37.25], [-112.87, 37.17], [-112.95, 37.13], [-113.08, 37.12],
      [-113.18, 37.15], [-113.24, 37.22], [-113.25, 37.32], [-113.22, 37.40],
    ],
  },

  // ── Bryce Canyon National Park ─────────────────────────────────
  // ~56 sq mi, elongated N-S along the Paunsaugunt Plateau rim.
  {
    name: 'Bryce Canyon',
    type: 'national_park',
    polygon: [
      [-112.22, 37.68], [-112.14, 37.68], [-112.10, 37.64], [-112.08, 37.59],
      [-112.10, 37.54], [-112.13, 37.50], [-112.18, 37.50], [-112.23, 37.53],
      [-112.25, 37.58], [-112.24, 37.64],
    ],
  },

  // ── Arches National Park ───────────────────────────────────────
  // ~120 sq mi, north of Moab. Contains 2000+ natural arches.
  {
    name: 'Arches',
    type: 'national_park',
    polygon: [
      [-109.68, 38.82], [-109.55, 38.83], [-109.48, 38.80], [-109.46, 38.73],
      [-109.48, 38.65], [-109.52, 38.60], [-109.60, 38.58], [-109.68, 38.62],
      [-109.72, 38.68], [-109.73, 38.75],
    ],
  },

  // ── Canyonlands National Park ──────────────────────────────────
  // ~527 sq mi — largest Utah NP. Three districts: Island in the Sky,
  // Needles, and the Maze, split by Green and Colorado Rivers.
  {
    name: 'Canyonlands',
    type: 'national_park',
    polygon: [
      [-110.22, 38.58], [-109.95, 38.58], [-109.75, 38.50], [-109.68, 38.38],
      [-109.68, 38.22], [-109.72, 38.08], [-109.80, 37.98], [-109.92, 37.92],
      [-110.08, 37.90], [-110.22, 37.95], [-110.32, 38.05], [-110.38, 38.18],
      [-110.38, 38.32], [-110.35, 38.45],
    ],
  },

  // ── Capitol Reef National Park ─────────────────────────────────
  // ~378 sq mi — long and narrow along the Waterpocket Fold (100 mi monocline).
  {
    name: 'Capitol Reef',
    type: 'national_park',
    polygon: [
      [-111.30, 38.37], [-111.15, 38.37], [-111.05, 38.30], [-110.98, 38.20],
      [-110.95, 38.08], [-110.97, 37.95], [-111.00, 37.85], [-111.05, 37.78],
      [-111.12, 37.75], [-111.22, 37.78], [-111.28, 37.85], [-111.32, 37.95],
      [-111.35, 38.10], [-111.35, 38.25],
    ],
  },

  // ================================================================
  // NATIONAL MONUMENTS
  // ================================================================

  // ── Grand Staircase-Escalante ──────────────────────────────────
  // ~1.87 million acres — enormous, between Bryce Canyon and Glen Canyon.
  {
    name: 'Grand Staircase-Escalante',
    type: 'national_monument',
    polygon: [
      [-112.30, 37.90], [-111.85, 37.90], [-111.45, 37.85], [-111.18, 37.75],
      [-111.00, 37.60], [-110.95, 37.42], [-111.00, 37.25], [-111.10, 37.10],
      [-111.30, 37.02], [-111.55, 37.00], [-111.85, 37.05], [-112.10, 37.12],
      [-112.30, 37.25], [-112.40, 37.42], [-112.42, 37.60], [-112.38, 37.78],
    ],
  },

  // ── Bears Ears National Monument ───────────────────────────────
  // SE Utah, twin buttes. ~1.36 million acres (original boundary).
  {
    name: 'Bears Ears',
    type: 'national_monument',
    polygon: [
      [-110.20, 37.90], [-109.80, 37.90], [-109.55, 37.82], [-109.40, 37.68],
      [-109.35, 37.52], [-109.42, 37.38], [-109.55, 37.28], [-109.75, 37.22],
      [-109.95, 37.22], [-110.12, 37.30], [-110.25, 37.45], [-110.30, 37.62],
      [-110.28, 37.78],
    ],
  },

  // ── Natural Bridges National Monument ──────────────────────────
  // Small area with three natural bridges (Sipapu, Kachina, Owachomo).
  {
    name: 'Natural Bridges',
    type: 'national_monument',
    polygon: [
      [-110.05, 37.65], [-109.95, 37.65], [-109.92, 37.60], [-109.93, 37.56],
      [-109.98, 37.54], [-110.05, 37.55], [-110.08, 37.59],
    ],
  },

  // ── Cedar Breaks National Monument ─────────────────────────────
  // Amphitheater eroded in the Claron Formation at 10,000 ft.
  {
    name: 'Cedar Breaks',
    type: 'national_monument',
    polygon: [
      [-112.88, 37.65], [-112.80, 37.65], [-112.78, 37.60], [-112.80, 37.57],
      [-112.85, 37.56], [-112.90, 37.58], [-112.91, 37.62],
    ],
  },

  // ── Dinosaur National Monument (Utah portion) ──────────────────
  // Straddles UT/CO border. Famous for Jurassic dinosaur fossils.
  {
    name: 'Dinosaur',
    type: 'national_monument',
    polygon: [
      [-109.50, 40.58], [-109.20, 40.58], [-109.05, 40.52], [-109.05, 40.38],
      [-109.12, 40.30], [-109.25, 40.28], [-109.40, 40.32], [-109.52, 40.40],
      [-109.55, 40.50],
    ],
  },

  // ── Rainbow Bridge National Monument ───────────────────────────
  // Tiny area protecting the world's largest natural bridge.
  {
    name: 'Rainbow Bridge',
    type: 'national_monument',
    polygon: [
      [-110.98, 37.10], [-110.94, 37.10], [-110.93, 37.07], [-110.95, 37.06],
      [-110.98, 37.07],
    ],
  },

  // ================================================================
  // NATIONAL RECREATION AREAS
  // ================================================================

  // ── Glen Canyon National Recreation Area ───────────────────────
  // Surrounds Lake Powell. ~1.25 million acres.
  {
    name: 'Glen Canyon',
    type: 'national_recreation_area',
    polygon: [
      [-111.65, 37.55], [-111.30, 37.50], [-111.00, 37.40], [-110.72, 37.28],
      [-110.48, 37.15], [-110.30, 37.05], [-110.28, 37.00], [-110.50, 37.00],
      [-110.80, 37.00], [-111.10, 37.00], [-111.40, 37.00], [-111.60, 37.05],
      [-111.72, 37.15], [-111.78, 37.28], [-111.75, 37.42],
    ],
  },

  // ── Flaming Gorge National Recreation Area ─────────────────────
  // Surrounds the reservoir in NE Utah.
  {
    name: 'Flaming Gorge',
    type: 'national_recreation_area',
    polygon: [
      [-109.72, 41.15], [-109.52, 41.15], [-109.38, 41.05], [-109.30, 40.92],
      [-109.30, 40.80], [-109.38, 40.72], [-109.52, 40.68], [-109.68, 40.72],
      [-109.75, 40.82], [-109.78, 40.95], [-109.78, 41.08],
    ],
  },

  // ================================================================
  // NATIONAL FORESTS (4 — large, rough boundaries)
  // ================================================================

  // ── Uinta-Wasatch-Cache National Forest ────────────────────────
  // Largest NF in Utah. Runs along the Wasatch Range and Uinta Mountains.
  // Simplified to two main lobes joined at the Wasatch-Uinta junction.
  {
    name: 'Uinta-Wasatch-Cache',
    type: 'national_forest',
    polygon: [
      // Wasatch segment (N-S spine)
      [-112.00, 41.95], [-111.60, 41.95], [-111.48, 41.60], [-111.45, 41.20],
      [-111.50, 40.90], [-111.48, 40.65], [-111.55, 40.30], [-111.65, 40.05],
      [-111.75, 39.80], [-111.90, 39.80], [-111.95, 40.05], [-111.88, 40.30],
      // Uinta segment (E-W arm)
      [-111.80, 40.55], [-111.40, 40.58], [-111.10, 40.62], [-110.60, 40.60],
      [-110.15, 40.58], [-109.65, 40.55], [-109.55, 40.65], [-109.55, 40.82],
      [-109.65, 40.92], [-110.15, 40.92], [-110.60, 40.90], [-111.10, 40.88],
      [-111.40, 40.85], [-111.70, 40.78], [-111.85, 40.70], [-112.00, 40.68],
      [-112.05, 40.85], [-112.05, 41.20], [-112.05, 41.60],
    ],
  },

  // ── Manti-La Sal National Forest ───────────────────────────────
  // Two disjunct units: Manti (Wasatch Plateau) and La Sal (La Sal Mtns).
  {
    name: 'Manti-La Sal',
    type: 'national_forest',
    polygon: [
      // Manti Division (Wasatch Plateau / Sanpete Valley)
      [-111.70, 39.80], [-111.35, 39.80], [-111.20, 39.55], [-111.15, 39.25],
      [-111.20, 39.00], [-111.35, 38.80], [-111.55, 38.70], [-111.70, 38.80],
      [-111.80, 39.00], [-111.82, 39.25], [-111.80, 39.55],
    ],
  },

  // La Sal Division (separate polygon for the La Sal Mountains unit)
  {
    name: 'Manti-La Sal (La Sal Division)',
    type: 'national_forest',
    polygon: [
      [-109.48, 38.60], [-109.20, 38.60], [-109.08, 38.45], [-109.05, 38.30],
      [-109.12, 38.18], [-109.28, 38.12], [-109.45, 38.18], [-109.52, 38.32],
      [-109.52, 38.48],
    ],
  },

  // ── Fishlake National Forest ───────────────────────────────────
  // Central Utah highlands, includes Fish Lake and Tushar Mountains.
  {
    name: 'Fishlake',
    type: 'national_forest',
    polygon: [
      [-112.55, 38.65], [-112.10, 38.65], [-111.82, 38.55], [-111.60, 38.38],
      [-111.55, 38.15], [-111.60, 37.95], [-111.75, 37.82], [-111.95, 37.75],
      [-112.20, 37.78], [-112.42, 37.90], [-112.55, 38.10], [-112.60, 38.30],
      [-112.60, 38.50],
    ],
  },

  // ── Dixie National Forest ──────────────────────────────────────
  // SW Utah, spans from Cedar Breaks to Escalante. Largest NF in Utah by some measures.
  {
    name: 'Dixie',
    type: 'national_forest',
    polygon: [
      [-113.00, 37.90], [-112.55, 37.90], [-112.15, 37.80], [-111.80, 37.68],
      [-111.55, 37.55], [-111.45, 37.38], [-111.50, 37.22], [-111.65, 37.12],
      [-111.85, 37.05], [-112.10, 37.05], [-112.40, 37.12], [-112.65, 37.25],
      [-112.85, 37.40], [-112.98, 37.55], [-113.05, 37.72],
    ],
  },

  // ================================================================
  // STATE PARKS (distinctive ones)
  // ================================================================

  // ── Dead Horse Point State Park ────────────────────────────────
  // Dramatic mesa overlook above the Colorado River, near Moab.
  {
    name: 'Dead Horse Point',
    type: 'state_park',
    polygon: [
      [-109.78, 38.50], [-109.72, 38.50], [-109.70, 38.47], [-109.71, 38.44],
      [-109.75, 38.43], [-109.79, 38.45], [-109.80, 38.48],
    ],
  },

  // ── Goblin Valley State Park ───────────────────────────────────
  // Mushroom-shaped hoodoos eroded from Entrada Sandstone.
  {
    name: 'Goblin Valley',
    type: 'state_park',
    polygon: [
      [-110.72, 38.59], [-110.66, 38.59], [-110.63, 38.56], [-110.63, 38.52],
      [-110.66, 38.50], [-110.72, 38.50], [-110.74, 38.53], [-110.74, 38.57],
    ],
  },

  // ── Snow Canyon State Park ─────────────────────────────────────
  // Red and white Navajo sandstone with lava flows near St. George.
  {
    name: 'Snow Canyon',
    type: 'state_park',
    polygon: [
      [-113.68, 37.22], [-113.62, 37.22], [-113.60, 37.18], [-113.60, 37.14],
      [-113.63, 37.12], [-113.68, 37.13], [-113.70, 37.17],
    ],
  },

  // ── Coral Pink Sand Dunes State Park ───────────────────────────
  // Aeolian dunes of eroded Navajo Sandstone between Kanab and Mt. Carmel.
  {
    name: 'Coral Pink Sand Dunes',
    type: 'state_park',
    polygon: [
      [-112.78, 37.08], [-112.72, 37.08], [-112.68, 37.05], [-112.67, 37.01],
      [-112.70, 36.99], [-112.76, 36.99], [-112.79, 37.02], [-112.80, 37.06],
    ],
  },

  // ── Kodachrome Basin State Park ────────────────────────────────
  // Sandstone chimneys (sediment pipes) south of Cannonville.
  {
    name: 'Kodachrome Basin',
    type: 'state_park',
    polygon: [
      [-112.00, 37.52], [-111.95, 37.52], [-111.93, 37.49], [-111.94, 37.47],
      [-111.98, 37.46], [-112.02, 37.48], [-112.02, 37.51],
    ],
  },

  // ── Antelope Island State Park ─────────────────────────────────
  // Largest island in the Great Salt Lake; bison herd.
  {
    name: 'Antelope Island',
    type: 'state_park',
    polygon: [
      [-112.28, 41.10], [-112.22, 41.10], [-112.18, 41.06], [-112.17, 41.00],
      [-112.18, 40.95], [-112.20, 40.90], [-112.24, 40.88], [-112.28, 40.90],
      [-112.30, 40.95], [-112.30, 41.02], [-112.30, 41.07],
    ],
  },

  // ── Bear Lake State Park (Utah portion) ────────────────────────
  // Beaches and marina on the Utah side of Bear Lake.
  {
    name: 'Bear Lake',
    type: 'state_park',
    polygon: [
      [-111.40, 41.98], [-111.32, 41.98], [-111.25, 41.94], [-111.22, 41.88],
      [-111.22, 41.82], [-111.28, 41.80], [-111.35, 41.80], [-111.40, 41.84],
      [-111.42, 41.90],
    ],
  },

  // ── Goosenecks State Park ──────────────────────────────────────
  // Dramatic incised meanders of the San Juan River.
  {
    name: 'Goosenecks',
    type: 'state_park',
    polygon: [
      [-109.95, 37.18], [-109.90, 37.18], [-109.88, 37.16], [-109.89, 37.14],
      [-109.93, 37.13], [-109.96, 37.15],
    ],
  },
];
