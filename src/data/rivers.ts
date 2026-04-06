/**
 * rivers.ts — Polyline data for Utah's significant rivers and waterways.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 */

export interface WaterwayDef {
  name: string;
  points: [number, number][]; // [lon, lat] waypoints tracing the river course
  width: number;              // relative width (0.3-1.2)
  valleyDepth?: number;       // 0-1 (0=flat, 1=deep gorge)
  valleyWidth?: number;       // multiplier for valley bank width
  navigable?: boolean;
}

export const RIVERS: WaterwayDef[] = [
  // ── Colorado River ──────────────────────────────────────────────
  // Enters UT from CO near Westwater, flows SW through Moab/Arches area,
  // Potash, Dead Horse Point overlook, Cataract Canyon in Canyonlands,
  // through Narrow Canyon to Lake Powell.
  {
    name: 'Colorado River',
    width: 1.2,
    valleyDepth: 0.9,
    valleyWidth: 2.0,
    navigable: true,
    points: [
      [-109.05, 38.98], // state line from CO (Westwater area)
      [-109.10, 38.96],
      [-109.16, 38.93],
      [-109.22, 38.90],
      [-109.28, 38.87], // Westwater Canyon
      [-109.33, 38.84],
      [-109.38, 38.81],
      [-109.42, 38.79],
      [-109.44, 38.76], // Dewey Bridge area
      [-109.46, 38.73],
      [-109.48, 38.71],
      [-109.50, 38.68],
      [-109.53, 38.65],
      [-109.55, 38.62], // SR-128 corridor
      [-109.57, 38.60],
      [-109.58, 38.58],
      [-109.60, 38.57], // near Moab (big bend)
      [-109.62, 38.55],
      [-109.63, 38.53],
      [-109.62, 38.50],
      [-109.60, 38.48],
      [-109.59, 38.45], // Potash Road area
      [-109.62, 38.42],
      [-109.65, 38.40],
      [-109.68, 38.37],
      [-109.72, 38.35], // Dead Horse Point overlook area
      [-109.78, 38.32],
      [-109.82, 38.28],
      [-109.85, 38.24],
      [-109.88, 38.20],
      [-109.90, 38.16], // entering Cataract Canyon
      [-109.90, 38.12],
      [-109.92, 38.08],
      [-109.93, 38.05], // Green River confluence
      [-109.95, 38.02],
      [-109.98, 37.98],
      [-110.02, 37.94],
      [-110.06, 37.90], // Cataract Canyon rapids
      [-110.10, 37.86],
      [-110.14, 37.82],
      [-110.18, 37.78],
      [-110.22, 37.74],
      [-110.25, 37.70], // Narrow Canyon
      [-110.28, 37.66],
      [-110.30, 37.62],
      [-110.33, 37.58],
      [-110.36, 37.54],
      [-110.38, 37.50],
      [-110.40, 37.46],
      [-110.42, 37.42],
      [-110.44, 37.38],
      [-110.46, 37.34],
      [-110.48, 37.30],
      [-110.50, 37.26],
      [-110.53, 37.22],
      [-110.56, 37.18],
      [-110.60, 37.14],
      [-110.65, 37.10],
      [-110.72, 37.08],
      [-110.80, 37.06],
      [-110.88, 37.05], // entering Lake Powell
      [-110.95, 37.04],
    ],
  },

  // ── Green River ─────────────────────────────────────────────────
  // Enters from WY at Flaming Gorge, flows S through Browns Park,
  // Flaming Gorge Canyon, through Uinta Basin past Jensen/Ouray,
  // Desolation Canyon, Gray Canyon, town of Green River,
  // Labyrinth/Stillwater Canyons, meets Colorado at Canyonlands.
  {
    name: 'Green River',
    width: 1.0,
    valleyDepth: 0.85,
    valleyWidth: 1.8,
    navigable: true,
    points: [
      [-109.55, 41.00], // Flaming Gorge Dam area
      [-109.52, 40.96],
      [-109.50, 40.92],
      [-109.48, 40.88],
      [-109.46, 40.84],
      [-109.44, 40.80], // below Flaming Gorge
      [-109.42, 40.76],
      [-109.40, 40.72],
      [-109.38, 40.68],
      [-109.40, 40.64], // bending near Vernal
      [-109.44, 40.60],
      [-109.48, 40.56],
      [-109.52, 40.52],
      [-109.56, 40.48],
      [-109.58, 40.44],
      [-109.60, 40.40], // Jensen/Dinosaur area
      [-109.62, 40.36],
      [-109.64, 40.32],
      [-109.66, 40.28],
      [-109.68, 40.24],
      [-109.70, 40.20],
      [-109.72, 40.16],
      [-109.76, 40.12], // Ouray area
      [-109.80, 40.08],
      [-109.84, 40.04],
      [-109.88, 40.00],
      [-109.92, 39.96],
      [-109.96, 39.92],
      [-110.00, 39.86], // entering Desolation Canyon
      [-110.03, 39.80],
      [-110.06, 39.74],
      [-110.08, 39.68],
      [-110.10, 39.62],
      [-110.11, 39.56],
      [-110.12, 39.50], // Gray Canyon
      [-110.13, 39.44],
      [-110.14, 39.38],
      [-110.15, 39.32],
      [-110.15, 39.26],
      [-110.15, 39.20],
      [-110.16, 39.14],
      [-110.16, 39.08],
      [-110.16, 39.02], // town of Green River
      [-110.16, 38.96],
      [-110.15, 38.90], // Labyrinth Canyon
      [-110.14, 38.84],
      [-110.12, 38.78],
      [-110.10, 38.72],
      [-110.08, 38.66],
      [-110.06, 38.60], // Stillwater Canyon
      [-110.04, 38.54],
      [-110.02, 38.48],
      [-110.00, 38.42],
      [-109.98, 38.36],
      [-109.96, 38.30],
      [-109.95, 38.24],
      [-109.94, 38.18],
      [-109.93, 38.12],
      [-109.93, 38.06], // confluence with Colorado
    ],
  },

  // ── San Juan River ──────────────────────────────────────────────
  // Enters UT from CO/NM area, flows W through Bluff, Mexican Hat,
  // Goosenecks of the San Juan (entrenched meanders), to Lake Powell.
  {
    name: 'San Juan River',
    width: 0.8,
    valleyDepth: 0.7,
    valleyWidth: 1.5,
    points: [
      [-109.05, 37.28], // entering from CO/NM
      [-109.12, 37.28],
      [-109.20, 37.28],
      [-109.28, 37.27],
      [-109.35, 37.26],
      [-109.42, 37.25],
      [-109.48, 37.24],
      [-109.55, 37.24], // near Bluff
      [-109.62, 37.22],
      [-109.68, 37.20],
      [-109.74, 37.18],
      [-109.78, 37.17],
      [-109.82, 37.16], // Mexican Hat area
      [-109.88, 37.17], // Goosenecks — river meanders dramatically
      [-109.92, 37.16],
      [-109.96, 37.15],
      [-110.00, 37.14],
      [-110.05, 37.16],
      [-110.10, 37.15],
      [-110.16, 37.14],
      [-110.22, 37.13],
      [-110.28, 37.12],
      [-110.34, 37.10],
      [-110.38, 37.09],
      [-110.42, 37.08],
      [-110.46, 37.06],
      [-110.50, 37.05], // entering Lake Powell (San Juan Arm)
      [-110.55, 37.04],
      [-110.60, 37.03],
    ],
  },

  // ── Virgin River ────────────────────────────────────────────────
  // Rises on Markagunt Plateau near Navajo Lake, flows through
  // Zion Narrows (extremely deep/narrow!), Zion Canyon, Springdale,
  // Virgin, La Verkin, Hurricane, St. George, exits to AZ/NV.
  {
    name: 'Virgin River',
    width: 0.6,
    valleyDepth: 0.95,
    valleyWidth: 2.5,
    points: [
      [-112.68, 37.62], // headwaters Markagunt Plateau
      [-112.72, 37.58],
      [-112.76, 37.54],
      [-112.82, 37.50], // East Fork Virgin River
      [-112.88, 37.46],
      [-112.92, 37.42],
      [-112.95, 37.38], // Zion Narrows entrance
      [-112.97, 37.34],
      [-112.97, 37.30],
      [-112.96, 37.26], // Zion Canyon / Temple of Sinawava
      [-112.95, 37.23],
      [-112.94, 37.20], // Springdale
      [-112.96, 37.18],
      [-113.00, 37.17],
      [-113.06, 37.17], // Virgin
      [-113.12, 37.18],
      [-113.18, 37.19], // La Verkin
      [-113.24, 37.18],
      [-113.28, 37.17], // Hurricane
      [-113.34, 37.15],
      [-113.40, 37.13],
      [-113.46, 37.11],
      [-113.52, 37.10], // St. George area
      [-113.58, 37.09],
      [-113.64, 37.08],
      [-113.70, 37.07], // exits toward AZ/NV
    ],
  },

  // ── Bear River ──────────────────────────────────────────────────
  // Rises in Uinta Mountains, flows N into Wyoming, re-enters UT,
  // flows N into Idaho, loops back S through Cache Valley,
  // eventually reaches Great Salt Lake via Bear River Migratory Bird Refuge.
  {
    name: 'Bear River',
    width: 0.7,
    valleyDepth: 0.3,
    valleyWidth: 1.2,
    points: [
      [-110.88, 40.72], // headwaters in Uinta Mountains
      [-110.82, 40.80],
      [-110.78, 40.86],
      [-110.76, 40.92],
      [-110.80, 40.98], // flowing NE
      [-110.86, 41.04],
      [-110.90, 41.10],
      [-110.94, 41.16],
      [-110.96, 41.22],
      [-110.95, 41.30], // Evanston WY area (exits UT briefly)
      [-110.96, 41.38],
      [-110.98, 41.44],
      [-111.00, 41.50], // re-enters UT / into ID
      [-111.04, 41.56],
      [-111.10, 41.62],
      [-111.18, 41.68],
      [-111.26, 41.74],
      [-111.34, 41.78], // Bear Lake area / loops west
      [-111.42, 41.82],
      [-111.50, 41.86],
      [-111.58, 41.90], // entering Cache Valley from ID
      [-111.66, 41.92],
      [-111.72, 41.88],
      [-111.78, 41.84],
      [-111.82, 41.78], // through Cache Valley (Logan area)
      [-111.84, 41.72],
      [-111.88, 41.66],
      [-111.92, 41.60],
      [-111.98, 41.56],
      [-112.04, 41.52], // through Box Elder County
      [-112.10, 41.50],
      [-112.16, 41.48],
      [-112.22, 41.46],
      [-112.28, 41.44],
      [-112.34, 41.42], // Bear River Bay / Migratory Bird Refuge
      [-112.40, 41.40],
    ],
  },

  // ── Sevier River ────────────────────────────────────────────────
  // Longest river entirely in Utah. Rises near Panguitch, flows N
  // through Sevier Valley, Richfield, Salina, bends W through
  // Sevier Canyon, past Delta, ends at Sevier Lake (dry playa).
  {
    name: 'Sevier River',
    width: 0.6,
    valleyDepth: 0.3,
    valleyWidth: 1.0,
    points: [
      [-112.40, 37.82], // headwaters near Panguitch
      [-112.38, 37.88],
      [-112.36, 37.94],
      [-112.32, 38.00], // near Junction
      [-112.28, 38.06],
      [-112.24, 38.12],
      [-112.20, 38.18],
      [-112.16, 38.24],
      [-112.14, 38.30],
      [-112.12, 38.36],
      [-112.10, 38.42], // Sevier Valley
      [-112.08, 38.48],
      [-112.08, 38.54],
      [-112.08, 38.60],
      [-112.08, 38.66],
      [-112.08, 38.72],
      [-112.08, 38.78], // Richfield area
      [-112.10, 38.84],
      [-112.12, 38.90],
      [-112.14, 38.96], // Salina area
      [-112.18, 39.02],
      [-112.24, 39.06],
      [-112.30, 39.10], // bending west through canyon
      [-112.38, 39.12],
      [-112.46, 39.12],
      [-112.54, 39.10],
      [-112.62, 39.06],
      [-112.70, 39.02], // past Delta
      [-112.78, 38.98],
      [-112.86, 38.94],
      [-112.92, 38.90], // approaching Sevier Lake
      [-112.96, 38.88],
    ],
  },

  // ── Weber River ─────────────────────────────────────────────────
  // Rises in western Uinta Mountains, flows W through Heber Valley,
  // Wanship, Echo Reservoir, Weber Canyon, Ogden, to Great Salt Lake.
  {
    name: 'Weber River',
    width: 0.5,
    valleyDepth: 0.4,
    valleyWidth: 1.0,
    points: [
      [-110.88, 40.76], // headwaters in Uintas
      [-110.96, 40.74],
      [-111.04, 40.72],
      [-111.12, 40.70],
      [-111.20, 40.68],
      [-111.26, 40.66], // Wanship area
      [-111.30, 40.68],
      [-111.34, 40.72],
      [-111.36, 40.76], // Echo Reservoir area
      [-111.40, 40.80],
      [-111.44, 40.84],
      [-111.48, 40.88],
      [-111.52, 40.92],
      [-111.58, 40.96],
      [-111.66, 41.00], // Morgan area
      [-111.74, 41.04],
      [-111.82, 41.08],
      [-111.88, 41.12], // Weber Canyon
      [-111.92, 41.16],
      [-111.96, 41.20],
      [-111.98, 41.24], // Ogden area
      [-112.02, 41.26],
    ],
  },

  // ── Provo River ─────────────────────────────────────────────────
  // Rises in Uinta Mountains, flows through Jordanelle Reservoir,
  // Heber Valley, Deer Creek Reservoir, Provo Canyon, to Utah Lake.
  {
    name: 'Provo River',
    width: 0.5,
    valleyDepth: 0.5,
    valleyWidth: 1.0,
    points: [
      [-110.92, 40.62], // headwaters in Uintas
      [-111.00, 40.60],
      [-111.10, 40.60],
      [-111.20, 40.60],
      [-111.30, 40.60],
      [-111.36, 40.60], // Jordanelle area
      [-111.40, 40.58],
      [-111.44, 40.55], // Heber Valley
      [-111.48, 40.52],
      [-111.50, 40.48],
      [-111.52, 40.44], // Deer Creek Reservoir
      [-111.54, 40.40],
      [-111.58, 40.36], // Provo Canyon
      [-111.62, 40.32],
      [-111.66, 40.28],
      [-111.72, 40.24], // reaching Utah Lake / Provo
    ],
  },

  // ── Jordan River ────────────────────────────────────────────────
  // Flows N from Utah Lake through Salt Lake Valley to Great Salt Lake.
  // Very flat course through urban areas.
  {
    name: 'Jordan River',
    width: 0.4,
    valleyDepth: 0.15,
    valleyWidth: 0.6,
    points: [
      [-111.88, 40.36], // outlet from Utah Lake
      [-111.89, 40.40],
      [-111.90, 40.44],
      [-111.90, 40.50],
      [-111.90, 40.56],
      [-111.90, 40.62],
      [-111.90, 40.68],
      [-111.91, 40.72],
      [-111.92, 40.76], // through SLC
      [-111.93, 40.80],
      [-111.95, 40.84],
      [-112.00, 40.88],
      [-112.06, 40.92], // entering Great Salt Lake
    ],
  },

  // ── Escalante River ─────────────────────────────────────────────
  // From town of Escalante SE through deeply carved slickrock
  // canyons to Lake Powell. Very remote and dramatic.
  {
    name: 'Escalante River',
    width: 0.4,
    valleyDepth: 0.9,
    valleyWidth: 1.8,
    points: [
      [-111.60, 37.77], // town of Escalante
      [-111.56, 37.74],
      [-111.52, 37.72],
      [-111.48, 37.70],
      [-111.44, 37.68],
      [-111.40, 37.65],
      [-111.36, 37.62],
      [-111.32, 37.58],
      [-111.28, 37.54],
      [-111.24, 37.50],
      [-111.20, 37.46],
      [-111.16, 37.42],
      [-111.14, 37.38],
      [-111.12, 37.34],
      [-111.10, 37.30],
      [-111.08, 37.26],
      [-111.06, 37.22],
      [-111.04, 37.20],
      [-111.02, 37.18], // entering Lake Powell
      [-111.00, 37.16],
    ],
  },

  // ── Fremont River / Dirty Devil River ───────────────────────────
  // Fremont River rises near Fish Lake, flows E through Torrey/Capitol Reef,
  // becomes Dirty Devil River east of Capitol Reef, flows S to Lake Powell.
  {
    name: 'Fremont/Dirty Devil River',
    width: 0.5,
    valleyDepth: 0.6,
    valleyWidth: 1.2,
    points: [
      [-111.72, 38.56], // headwaters near Fish Lake
      [-111.66, 38.52],
      [-111.60, 38.48],
      [-111.54, 38.44],
      [-111.48, 38.40],
      [-111.42, 38.36],
      [-111.36, 38.32], // Torrey area
      [-111.28, 38.30],
      [-111.20, 38.28],
      [-111.14, 38.26], // Capitol Reef — Fruita
      [-111.08, 38.24],
      [-111.02, 38.22],
      [-110.96, 38.18],
      [-110.92, 38.14], // becomes Dirty Devil
      [-110.88, 38.10],
      [-110.84, 38.04],
      [-110.80, 37.98],
      [-110.78, 37.92],
      [-110.76, 37.86],
      [-110.74, 37.80],
      [-110.72, 37.74],
      [-110.70, 37.68],
      [-110.68, 37.62],
      [-110.66, 37.56],
      [-110.64, 37.50],
      [-110.62, 37.44], // entering Lake Powell (Dirty Devil arm)
    ],
  },

  // ── Dolores River ───────────────────────────────────────────────
  // Brief entry from CO, joins Colorado near Dewey Bridge.
  {
    name: 'Dolores River',
    width: 0.3,
    valleyDepth: 0.5,
    valleyWidth: 0.8,
    points: [
      [-109.05, 38.80], // state line from CO
      [-109.10, 38.78],
      [-109.16, 38.76],
      [-109.22, 38.74],
      [-109.28, 38.72],
      [-109.34, 38.73],
      [-109.40, 38.75],
      [-109.44, 38.76], // confluence with Colorado near Dewey Bridge
    ],
  },

  // ── Price River ─────────────────────────────────────────────────
  // Flows from Wasatch Plateau E through Helper, Price, to Green River.
  {
    name: 'Price River',
    width: 0.4,
    valleyDepth: 0.4,
    valleyWidth: 0.8,
    points: [
      [-111.20, 39.72], // headwaters Wasatch Plateau
      [-111.12, 39.68],
      [-111.04, 39.64],
      [-110.96, 39.62],
      [-110.88, 39.60], // Helper area
      [-110.82, 39.58],
      [-110.80, 39.60], // Price
      [-110.72, 39.54],
      [-110.62, 39.46],
      [-110.50, 39.38],
      [-110.38, 39.28],
      [-110.26, 39.18],
      [-110.18, 39.08], // confluence with Green River
    ],
  },

  // ── San Rafael River ────────────────────────────────────────────
  // Drains San Rafael Swell, flows E to Green River.
  {
    name: 'San Rafael River',
    width: 0.3,
    valleyDepth: 0.5,
    valleyWidth: 0.8,
    points: [
      [-111.20, 39.10], // headwaters on Wasatch Plateau
      [-111.12, 39.06],
      [-111.04, 39.00],
      [-110.96, 38.96],
      [-110.88, 38.92],
      [-110.78, 38.90],
      [-110.68, 38.88], // through San Rafael Swell
      [-110.58, 38.86],
      [-110.48, 38.84],
      [-110.40, 38.82],
      [-110.32, 38.80],
      [-110.24, 38.82],
      [-110.18, 38.86],
      [-110.14, 38.90],
      [-110.12, 38.94], // confluence with Green River
    ],
  },

  // ── Duchesne River ──────────────────────────────────────────────
  // Drains south slope of Uinta Mountains, flows S/SE to Green River.
  {
    name: 'Duchesne River',
    width: 0.4,
    valleyDepth: 0.3,
    valleyWidth: 0.8,
    points: [
      [-110.70, 40.60], // headwaters south slope Uintas
      [-110.62, 40.52],
      [-110.54, 40.46],
      [-110.46, 40.40],
      [-110.38, 40.34],
      [-110.30, 40.30],
      [-110.22, 40.26],
      [-110.14, 40.22], // Duchesne town area
      [-110.06, 40.18],
      [-109.96, 40.14],
      [-109.88, 40.10],
      [-109.80, 40.08], // confluence with Green River near Ouray
    ],
  },
];
