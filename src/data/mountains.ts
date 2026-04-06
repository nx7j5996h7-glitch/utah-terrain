export interface MountainRangeDef {
  name: string;
  polygon: [number, number][];
  elevation: number;       // 0-15
  ridgeAngle?: number;     // degrees: 0=N-S, 90=E-W
  type?: 'range' | 'laccolith' | 'plateau';
}

// ============================================================
// MOUNTAIN RANGES — All significant Utah mountain ranges
// ============================================================

export const MOUNTAIN_RANGES: MountainRangeDef[] = [

  // ====================
  // Rocky Mountain Province
  // ====================

  // Wasatch Range — 160mi N-S spine from Idaho border to Mt. Nebo
  // Narrow, steep, faulted western face
  {
    name: 'Wasatch Range',
    elevation: 11,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-111.82, 42.00], [-111.62, 42.00], [-111.58, 41.60], [-111.55, 41.20],
      [-111.55, 40.80], [-111.58, 40.40], [-111.62, 40.10], [-111.68, 39.85],
      [-111.75, 39.72], [-111.88, 39.72], [-111.82, 39.90], [-111.78, 40.15],
      [-111.75, 40.45], [-111.72, 40.80], [-111.72, 41.20], [-111.75, 41.60],
    ],
  },

  // Uinta Mountains — unique E-W trending range, Kings Peak (13,534 ft)
  // ~150mi long, ~35mi wide. Proterozoic quartzite core.
  {
    name: 'Uinta Mountains',
    elevation: 14,
    ridgeAngle: 90,
    type: 'range',
    polygon: [
      [-111.20, 40.95], [-110.80, 40.93], [-110.40, 40.90], [-110.00, 40.85],
      [-109.65, 40.80], [-109.40, 40.72], [-109.35, 40.60], [-109.40, 40.52],
      [-109.65, 40.55], [-110.00, 40.58], [-110.40, 40.60], [-110.80, 40.62],
      [-111.20, 40.65],
    ],
  },

  // Bear River Range — Cache Valley east side, runs N into Idaho
  {
    name: 'Bear River Range',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-111.62, 42.00], [-111.48, 42.00], [-111.42, 41.85], [-111.40, 41.68],
      [-111.42, 41.52], [-111.52, 41.50], [-111.58, 41.65], [-111.60, 41.82],
    ],
  },

  // Wellsville Mountains — extremely narrow and steep, west of Logan
  {
    name: 'Wellsville Mountains',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-111.98, 41.68], [-111.90, 41.68], [-111.88, 41.58], [-111.90, 41.50],
      [-111.98, 41.52],
    ],
  },

  // ====================
  // Basin and Range Mountains
  // ====================

  // Deep Creek Range — far western Utah, Ibapah Peak (12,101 ft)
  {
    name: 'Deep Creek Range',
    elevation: 11,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-114.00, 40.10], [-113.82, 40.10], [-113.78, 39.95], [-113.78, 39.75],
      [-113.82, 39.65], [-114.00, 39.68],
    ],
  },

  // Stansbury Mountains — west of Tooele, Deseret Peak (11,031 ft)
  {
    name: 'Stansbury Mountains',
    elevation: 10,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.70, 40.68], [-112.52, 40.68], [-112.48, 40.55], [-112.48, 40.38],
      [-112.55, 40.32], [-112.70, 40.35],
    ],
  },

  // Oquirrh Mountains — Bingham Canyon copper mine, west of SLC
  {
    name: 'Oquirrh Mountains',
    elevation: 9,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.22, 40.72], [-112.06, 40.72], [-112.02, 40.58], [-112.02, 40.42],
      [-112.08, 40.38], [-112.22, 40.42],
    ],
  },

  // House Range — Notch Peak (9,655 ft), western desert
  {
    name: 'House Range',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.30, 39.30], [-113.12, 39.30], [-113.08, 39.15], [-113.08, 38.95],
      [-113.15, 38.88], [-113.30, 38.92],
    ],
  },

  // Confusion Range — west of House Range
  {
    name: 'Confusion Range',
    elevation: 6,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.65, 39.25], [-113.48, 39.25], [-113.45, 39.12], [-113.45, 38.98],
      [-113.50, 38.92], [-113.65, 38.95],
    ],
  },

  // Wah Wah Mountains — remote, western desert range
  {
    name: 'Wah Wah Mountains',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.60, 38.70], [-113.42, 38.70], [-113.38, 38.55], [-113.38, 38.35],
      [-113.45, 38.28], [-113.60, 38.32],
    ],
  },

  // Sheeprock Mountains — south of Tooele County
  {
    name: 'Sheeprock Mountains',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.48, 39.95], [-112.32, 39.95], [-112.28, 39.82], [-112.28, 39.68],
      [-112.35, 39.62], [-112.48, 39.65],
    ],
  },

  // Pilot Range — far NW Utah near Pilot Peak
  {
    name: 'Pilot Range',
    elevation: 9,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-114.05, 41.20], [-113.88, 41.20], [-113.85, 41.08], [-113.85, 40.95],
      [-113.90, 40.90], [-114.05, 40.92],
    ],
  },

  // Silver Island Mountains — east of Bonneville Salt Flats
  {
    name: 'Silver Island Mountains',
    elevation: 7,
    ridgeAngle: 10,
    type: 'range',
    polygon: [
      [-113.50, 40.85], [-113.32, 40.88], [-113.25, 40.82], [-113.28, 40.72],
      [-113.38, 40.68], [-113.50, 40.72],
    ],
  },

  // Newfoundland Mountains — south of Bonneville Salt Flats
  {
    name: 'Newfoundland Mountains',
    elevation: 6,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.58, 40.58], [-113.45, 40.60], [-113.40, 40.52], [-113.42, 40.42],
      [-113.52, 40.40], [-113.58, 40.48],
    ],
  },

  // Grassy Mountains — southwest of Bonneville
  {
    name: 'Grassy Mountains',
    elevation: 5,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.68, 40.65], [-113.55, 40.68], [-113.52, 40.58], [-113.58, 40.52],
      [-113.68, 40.55],
    ],
  },

  // Cedar Mountains — west of Tooele, south of GSL
  {
    name: 'Cedar Mountains',
    elevation: 6,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-113.00, 40.82], [-112.85, 40.82], [-112.82, 40.68], [-112.82, 40.55],
      [-112.88, 40.50], [-113.00, 40.52],
    ],
  },

  // Mineral Mountains — near Milford, geothermal area
  {
    name: 'Mineral Mountains',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.62, 38.55], [-112.48, 38.55], [-112.45, 38.40], [-112.45, 38.22],
      [-112.50, 38.15], [-112.62, 38.18],
    ],
  },

  // Pahvant Range — east of Fillmore
  {
    name: 'Pahvant Range',
    elevation: 8,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.35, 39.08], [-112.18, 39.08], [-112.15, 38.95], [-112.15, 38.78],
      [-112.20, 38.72], [-112.35, 38.75],
    ],
  },

  // Canyon Range — east of Delta
  {
    name: 'Canyon Range',
    elevation: 7,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.25, 39.55], [-112.10, 39.55], [-112.08, 39.42], [-112.08, 39.28],
      [-112.12, 39.22], [-112.25, 39.25],
    ],
  },

  // Raft River Mountains — NW Utah, E-W trending (unusual for Basin and Range)
  {
    name: 'Raft River Mountains',
    elevation: 8,
    ridgeAngle: 90,
    type: 'range',
    polygon: [
      [-113.50, 41.90], [-113.20, 41.92], [-112.95, 41.90], [-112.90, 41.82],
      [-112.95, 41.75], [-113.20, 41.73], [-113.50, 41.75],
    ],
  },

  // ====================
  // Laccolithic Mountains (dome-shaped intrusions, no ridge angle)
  // ====================

  // La Sal Mountains — near Moab, Mt. Peale (12,721 ft)
  {
    name: 'La Sal Mountains',
    elevation: 12,
    type: 'laccolith',
    polygon: [
      [-109.28, 38.55], [-109.15, 38.58], [-109.05, 38.50], [-109.05, 38.38],
      [-109.12, 38.28], [-109.28, 38.28], [-109.40, 38.35], [-109.42, 38.48],
    ],
  },

  // Henry Mountains — last range mapped in contiguous US, Mt. Ellen (11,522 ft)
  {
    name: 'Henry Mountains',
    elevation: 11,
    type: 'laccolith',
    polygon: [
      [-110.72, 38.12], [-110.58, 38.15], [-110.48, 38.08], [-110.48, 37.92],
      [-110.55, 37.82], [-110.72, 37.82], [-110.82, 37.90], [-110.82, 38.05],
    ],
  },

  // Abajo Mountains (Blue Mountains) — near Monticello
  {
    name: 'Abajo Mountains',
    elevation: 10,
    type: 'laccolith',
    polygon: [
      [-109.48, 37.95], [-109.35, 37.98], [-109.25, 37.90], [-109.25, 37.78],
      [-109.32, 37.70], [-109.48, 37.72], [-109.55, 37.80], [-109.55, 37.90],
    ],
  },

  // Navajo Mountain — on UT/AZ border near Lake Powell
  {
    name: 'Navajo Mountain',
    elevation: 9,
    type: 'laccolith',
    polygon: [
      [-110.58, 37.05], [-110.48, 37.08], [-110.38, 37.02], [-110.38, 36.95],
      [-110.45, 36.90], [-110.58, 36.92], [-110.62, 36.98],
    ],
  },

  // ====================
  // High Plateaus (flat-topped, broad, forested)
  // ====================

  // Tushar Mountains — volcanic origin, Delano Peak (12,174 ft)
  // Third-highest range in Utah. Steep and rugged, NOT a plateau.
  {
    name: 'Tushar Mountains',
    elevation: 11,
    ridgeAngle: 0,
    type: 'range',
    polygon: [
      [-112.48, 38.52], [-112.28, 38.52], [-112.22, 38.42], [-112.22, 38.28],
      [-112.28, 38.18], [-112.48, 38.20], [-112.55, 38.32],
    ],
  },

  // Markagunt Plateau — Cedar Breaks, Brian Head, ~11,300 ft
  {
    name: 'Markagunt Plateau',
    elevation: 10,
    type: 'plateau',
    polygon: [
      [-112.98, 37.85], [-112.68, 37.85], [-112.58, 37.72], [-112.55, 37.52],
      [-112.62, 37.38], [-112.80, 37.35], [-112.98, 37.42],
    ],
  },

  // Aquarius Plateau / Boulder Mountain — highest timbered plateau in N. America
  {
    name: 'Aquarius Plateau',
    elevation: 10,
    type: 'plateau',
    polygon: [
      [-111.58, 38.22], [-111.32, 38.22], [-111.22, 38.10], [-111.22, 37.92],
      [-111.32, 37.82], [-111.55, 37.85], [-111.62, 37.98], [-111.62, 38.12],
    ],
  },

  // Paunsaugunt Plateau — Bryce Canyon's host plateau
  {
    name: 'Paunsaugunt Plateau',
    elevation: 8,
    type: 'plateau',
    polygon: [
      [-112.25, 37.70], [-112.08, 37.70], [-112.02, 37.58], [-112.02, 37.42],
      [-112.08, 37.32], [-112.25, 37.35], [-112.30, 37.50],
    ],
  },

  // Fish Lake Plateau — Fish Lake, highest lake in Utah in regular use
  {
    name: 'Fish Lake Plateau',
    elevation: 10,
    type: 'plateau',
    polygon: [
      [-111.78, 38.72], [-111.55, 38.72], [-111.48, 38.58], [-111.48, 38.42],
      [-111.58, 38.35], [-111.78, 38.38], [-111.82, 38.52],
    ],
  },

  // Wasatch Plateau — long N-S high plateau, ~10,000-11,000 ft
  {
    name: 'Wasatch Plateau',
    elevation: 9,
    type: 'plateau',
    polygon: [
      [-111.48, 39.65], [-111.28, 39.65], [-111.22, 39.45], [-111.22, 39.10],
      [-111.25, 38.85], [-111.38, 38.78], [-111.48, 38.85], [-111.52, 39.10],
      [-111.52, 39.45],
    ],
  },

  // Tavaputs Plateau — remote, between Uinta Basin and Book Cliffs
  {
    name: 'Tavaputs Plateau',
    elevation: 8,
    type: 'plateau',
    polygon: [
      [-110.60, 39.85], [-110.10, 39.85], [-109.70, 39.80], [-109.50, 39.75],
      [-109.50, 39.55], [-109.70, 39.50], [-110.10, 39.52], [-110.60, 39.55],
      [-110.80, 39.65],
    ],
  },

  // Kaiparowits Plateau — remote, part of Grand Staircase-Escalante
  {
    name: 'Kaiparowits Plateau',
    elevation: 6,
    type: 'plateau',
    polygon: [
      [-111.60, 37.55], [-111.30, 37.55], [-111.15, 37.42], [-111.10, 37.22],
      [-111.18, 37.10], [-111.40, 37.08], [-111.60, 37.18], [-111.65, 37.38],
    ],
  },

  // Pine Valley Mountains — near St. George, Signal Peak (10,365 ft)
  {
    name: 'Pine Valley Mountains',
    elevation: 9,
    type: 'range',
    polygon: [
      [-113.58, 37.48], [-113.40, 37.48], [-113.35, 37.38], [-113.35, 37.25],
      [-113.42, 37.18], [-113.58, 37.20], [-113.62, 37.32],
    ],
  },
];
