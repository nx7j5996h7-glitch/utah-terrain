/**
 * roads.ts — Polyline data for Utah's significant roads and highways.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 */

export interface RoadDef {
  name: string;
  points: [number, number][]; // [lon, lat] waypoints
  width: number;
  type: 'interstate' | 'highway' | 'road';
}

export const ROADS: RoadDef[] = [
  // ── Interstate 15 ───────────────────────────────────────────────
  // N-S backbone of Utah. St. George through Cedar City, Beaver,
  // Fillmore, Nephi, Provo, SLC, Ogden, Brigham City, to Idaho border.
  {
    name: 'Interstate 15',
    type: 'interstate',
    width: 1.0,
    points: [
      [-113.58, 37.08], // St. George (southern end near AZ border)
      [-113.52, 37.10],
      [-113.44, 37.12],
      [-113.38, 37.15], // Washington area
      [-113.30, 37.22],
      [-113.22, 37.30],
      [-113.15, 37.42],
      [-113.08, 37.54],
      [-113.06, 37.68], // Cedar City
      [-112.92, 37.82],
      [-112.78, 37.96],
      [-112.64, 38.10],
      [-112.56, 38.20], // Beaver
      [-112.44, 38.36],
      [-112.32, 38.52],
      [-112.20, 38.66], // Richfield junction area
      [-112.12, 38.78],
      [-112.06, 38.92],
      [-112.00, 39.08],
      [-111.96, 39.22], // Scipio / I-70 junction
      [-111.92, 39.38],
      [-111.88, 39.52],
      [-111.84, 39.72], // Nephi
      [-111.82, 39.90],
      [-111.78, 40.06],
      [-111.74, 40.18], // Provo/Orem
      [-111.78, 40.34],
      [-111.82, 40.46],
      [-111.86, 40.58],
      [-111.88, 40.66],
      [-111.90, 40.76], // Salt Lake City
      [-111.92, 40.88],
      [-111.96, 41.06],
      [-111.98, 41.22], // Ogden
      [-112.00, 41.38],
      [-112.02, 41.52], // Brigham City
      [-112.04, 41.66],
      [-112.02, 41.82],
      [-112.00, 42.00], // Idaho border
    ],
  },

  // ── Interstate 80 ──────────────────────────────────────────────
  // E-W through northern Utah. Nevada border at Wendover,
  // across Bonneville Salt Flats, through SLC, Parley's Canyon,
  // through Wasatch Range, to Wyoming border at Evanston.
  {
    name: 'Interstate 80',
    type: 'interstate',
    width: 1.0,
    points: [
      [-114.05, 40.74], // Nevada border (Wendover)
      [-113.70, 40.74],
      [-113.40, 40.74], // Bonneville Salt Flats
      [-113.10, 40.73],
      [-112.80, 40.72],
      [-112.50, 40.71],
      [-112.20, 40.70],
      [-112.00, 40.69],
      [-111.90, 40.68], // SLC area (junction with I-15)
      [-111.82, 40.68],
      [-111.74, 40.68],
      [-111.66, 40.70], // Parley's Canyon
      [-111.56, 40.72],
      [-111.48, 40.74],
      [-111.40, 40.76],
      [-111.30, 40.78],
      [-111.18, 40.80],
      [-111.06, 40.82],
      [-110.90, 40.84],
      [-110.70, 40.86],
      [-110.50, 40.88],
      [-110.30, 40.90],
      [-110.10, 40.92],
      [-109.80, 40.94],
      [-109.50, 40.96],
      [-109.20, 40.98],
      [-109.05, 41.00], // Wyoming border
    ],
  },

  // ── Interstate 70 ──────────────────────────────────────────────
  // E-W through central Utah. Meets I-15 near Cove Fort,
  // through Sevier Valley, Fish Lake area, Fremont Junction,
  // Capitol Reef area (scenic!), San Rafael Swell, Green River, to CO.
  {
    name: 'Interstate 70',
    type: 'interstate',
    width: 1.0,
    points: [
      [-112.20, 38.60], // I-15/I-70 junction (Cove Fort)
      [-112.08, 38.62],
      [-111.96, 38.64],
      [-111.84, 38.66],
      [-111.72, 38.68],
      [-111.60, 38.70],
      [-111.48, 38.70],
      [-111.36, 38.68],
      [-111.24, 38.66],
      [-111.12, 38.66],
      [-111.00, 38.68],
      [-110.88, 38.72],
      [-110.76, 38.76],
      [-110.64, 38.80],
      [-110.50, 38.84],
      [-110.36, 38.88],
      [-110.22, 38.92],
      [-110.16, 38.96], // Green River town
      [-110.04, 38.98],
      [-109.80, 38.98],
      [-109.60, 38.98],
      [-109.40, 38.98],
      [-109.20, 38.98],
      [-109.05, 38.98], // Colorado border
    ],
  },

  // ── Interstate 84 ──────────────────────────────────────────────
  // Ogden NW to Idaho border, through Tremonton/Snowville.
  {
    name: 'Interstate 84',
    type: 'interstate',
    width: 1.0,
    points: [
      [-111.98, 41.22], // junction with I-15 near Ogden
      [-112.08, 41.26],
      [-112.18, 41.30],
      [-112.28, 41.36],
      [-112.38, 41.44],
      [-112.48, 41.52],
      [-112.58, 41.60],
      [-112.68, 41.68],
      [-112.78, 41.78],
      [-112.88, 41.88],
      [-112.98, 41.96],
      [-113.06, 42.00], // Idaho border
    ],
  },

  // ── US-89 ───────────────────────────────────────────────────────
  // N-S scenic highway. Kanab, Mt. Carmel, Sevier Valley,
  // Provo Canyon, SLC, Logan, Garden City/Bear Lake area.
  {
    name: 'US-89',
    type: 'highway',
    width: 0.6,
    points: [
      [-112.53, 37.05], // Kanab (near AZ border)
      [-112.50, 37.14],
      [-112.48, 37.22], // Mt. Carmel Junction
      [-112.42, 37.32],
      [-112.38, 37.42],
      [-112.32, 37.54],
      [-112.28, 37.66],
      [-112.24, 37.78], // near Panguitch
      [-112.20, 37.90],
      [-112.16, 38.04],
      [-112.12, 38.20],
      [-112.10, 38.40],
      [-112.08, 38.60],
      [-112.08, 38.78], // Richfield
      [-112.04, 38.96],
      [-111.96, 39.14],
      [-111.88, 39.36],
      [-111.84, 39.56],
      [-111.80, 39.72], // Nephi area
      [-111.76, 39.90],
      [-111.70, 40.10],
      [-111.66, 40.24], // Provo (overlaps I-15 briefly)
      [-111.72, 40.50],
      [-111.82, 41.04],
      [-111.84, 41.36],
      [-111.84, 41.54],
      [-111.82, 41.74], // Logan
      [-111.60, 41.84],
      [-111.40, 41.90],
      [-111.30, 41.94], // Garden City / Bear Lake
    ],
  },

  // ── US-191 ──────────────────────────────────────────────────────
  // Moab corridor: from I-70 south through Moab, to Monticello/Blanding.
  // Also extends north to Vernal.
  {
    name: 'US-191',
    type: 'highway',
    width: 0.6,
    points: [
      [-109.52, 40.46], // Vernal
      [-109.50, 40.32],
      [-109.48, 40.18],
      [-109.50, 40.06],
      [-109.56, 39.88],
      [-109.58, 39.70],
      [-109.56, 39.52],
      [-109.54, 39.32],
      [-109.52, 39.14],
      [-109.52, 38.98], // I-70 junction at Crescent Junction
      [-109.54, 38.82],
      [-109.56, 38.66],
      [-109.55, 38.57], // Moab
      [-109.52, 38.44],
      [-109.48, 38.28],
      [-109.44, 38.12],
      [-109.40, 37.96],
      [-109.36, 37.86], // Monticello
      [-109.32, 37.72],
      [-109.48, 37.62], // Blanding
    ],
  },

  // ── US-6 ────────────────────────────────────────────────────────
  // Spanish Fork through Soldier Summit, Helper, Price, to Green River.
  {
    name: 'US-6',
    type: 'highway',
    width: 0.6,
    points: [
      [-111.66, 40.10], // Spanish Fork
      [-111.56, 40.06],
      [-111.46, 40.00],
      [-111.36, 39.94],
      [-111.26, 39.88],
      [-111.16, 39.82], // Soldier Summit
      [-111.06, 39.76],
      [-110.96, 39.70],
      [-110.86, 39.64],
      [-110.82, 39.60], // Price
      [-110.72, 39.50],
      [-110.58, 39.36],
      [-110.44, 39.22],
      [-110.30, 39.10],
      [-110.16, 39.00], // Green River
    ],
  },

  // ── US-40 ───────────────────────────────────────────────────────
  // Heber City through Strawberry Reservoir, Duchesne, to Vernal.
  {
    name: 'US-40',
    type: 'highway',
    width: 0.6,
    points: [
      [-111.42, 40.50], // Heber City (junction from I-80/Parley's)
      [-111.32, 40.46],
      [-111.22, 40.40],
      [-111.12, 40.34],
      [-111.02, 40.28],
      [-110.88, 40.24],
      [-110.72, 40.22],
      [-110.56, 40.22],
      [-110.40, 40.22],
      [-110.24, 40.26], // Duchesne
      [-110.08, 40.30],
      [-109.88, 40.36],
      [-109.70, 40.42],
      [-109.52, 40.46], // Vernal
    ],
  },

  // ── Scenic Byway 12 ────────────────────────────────────────────
  // One of America's most scenic roads. Torrey through Boulder Mountain,
  // Boulder, Escalante, to Bryce Canyon junction at US-89.
  {
    name: 'Scenic Byway 12',
    type: 'road',
    width: 0.4,
    points: [
      [-111.42, 38.30], // Torrey (junction with SR-24)
      [-111.46, 38.24],
      [-111.48, 38.18],
      [-111.50, 38.12],
      [-111.52, 38.06],
      [-111.52, 38.00], // Boulder Mountain summit (~9600 ft)
      [-111.52, 37.94],
      [-111.50, 37.88],
      [-111.46, 37.84], // Boulder
      [-111.50, 37.80],
      [-111.55, 37.78],
      [-111.60, 37.77], // Escalante
      [-111.66, 37.74],
      [-111.72, 37.70],
      [-111.80, 37.66],
      [-111.88, 37.62],
      [-111.96, 37.58],
      [-112.06, 37.56],
      [-112.12, 37.56], // Red Canyon
      [-112.18, 37.58],
      [-112.20, 37.62], // Bryce Canyon junction
    ],
  },

  // ── US-163 ──────────────────────────────────────────────────────
  // Monument Valley road — the iconic Forrest Gump straight.
  // Mexican Hat south to AZ border through Monument Valley.
  {
    name: 'US-163',
    type: 'highway',
    width: 0.6,
    points: [
      [-109.87, 37.15], // Mexican Hat
      [-109.88, 37.10],
      [-109.90, 37.06],
      [-109.95, 37.02],
      [-110.00, 37.00], // approaching Monument Valley
      [-110.05, 37.00],
      [-110.10, 37.00],
      [-110.18, 37.00], // AZ border / Monument Valley
    ],
  },

  // ── SR-128 ──────────────────────────────────────────────────────
  // Colorado River Scenic Byway near Moab. Fisher Towers,
  // Castle Valley viewpoint, from I-70 along river to Moab.
  {
    name: 'SR-128',
    type: 'road',
    width: 0.4,
    points: [
      [-109.30, 38.98], // junction with I-70 near Cisco
      [-109.34, 38.94],
      [-109.38, 38.90],
      [-109.40, 38.86],
      [-109.42, 38.82], // Dewey Bridge area
      [-109.44, 38.78], // Fisher Towers viewpoint
      [-109.46, 38.74],
      [-109.48, 38.70], // Castle Valley view
      [-109.52, 38.66],
      [-109.55, 38.62],
      [-109.58, 38.58], // junction in Moab
    ],
  },

  // ── SR-24 ───────────────────────────────────────────────────────
  // Capitol Reef highway. Hanksville through Capitol Reef NP to Torrey.
  {
    name: 'SR-24',
    type: 'road',
    width: 0.4,
    points: [
      [-110.72, 38.37], // Hanksville
      [-110.80, 38.34],
      [-110.90, 38.32],
      [-111.00, 38.30],
      [-111.10, 38.28], // Capitol Reef NP
      [-111.18, 38.28],
      [-111.26, 38.29],
      [-111.34, 38.30],
      [-111.42, 38.30], // Torrey
    ],
  },

  // ── SR-9 ────────────────────────────────────────────────────────
  // Zion Park road. Hurricane through La Verkin, Springdale,
  // Zion Canyon, Mt. Carmel tunnel, to Mt. Carmel Junction (US-89).
  {
    name: 'SR-9',
    type: 'road',
    width: 0.4,
    points: [
      [-113.28, 37.17], // Hurricane
      [-113.20, 37.18],
      [-113.14, 37.19],
      [-113.06, 37.17], // Virgin
      [-112.99, 37.19],
      [-112.95, 37.20], // Springdale
      [-112.94, 37.24], // Zion Canyon entrance
      [-112.90, 37.28],
      [-112.84, 37.28], // Zion-Mt. Carmel tunnel
      [-112.72, 37.24],
      [-112.60, 37.22],
      [-112.48, 37.22], // Mt. Carmel Junction (US-89)
    ],
  },

  // ── SR-12 through Grand Staircase ──────────────────────────────
  // Bryce Canyon area, Henrieville, Cannonville, Kodachrome Basin
  // access, through Grand Staircase-Escalante to Escalante.
  // (Overlaps with Scenic Byway 12 in part but this traces the
  // eastern segment from Bryce through the GSENM heartland.)
  {
    name: 'SR-12 (Grand Staircase)',
    type: 'road',
    width: 0.4,
    points: [
      [-112.20, 37.62], // Bryce Canyon junction / Red Canyon
      [-112.14, 37.62],
      [-112.08, 37.60],
      [-112.04, 37.58],
      [-112.00, 37.56],
      [-111.96, 37.58],
      [-111.90, 37.60],
      [-111.84, 37.62],
      [-111.78, 37.66],
      [-111.72, 37.70], // Cannonville / Kodachrome area
      [-111.66, 37.74],
      [-111.60, 37.77], // Escalante
    ],
  },
];
