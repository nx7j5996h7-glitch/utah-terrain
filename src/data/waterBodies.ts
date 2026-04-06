/**
 * waterBodies.ts — Polygon data for Utah's significant water bodies.
 *
 * All coordinates are [longitude, latitude] pairs (WGS84).
 * Grid bounds: UTAH_WEST=-114.05, UTAH_EAST=-109.05, UTAH_NORTH=42.0, UTAH_SOUTH=37.0
 */

export interface WaterBodyDef {
  name: string;
  polygon: [number, number][]; // [lon, lat] pairs
  color?: string;              // override color (e.g. pink, turquoise)
  elevation?: number;          // real surface elevation in meters above sea level
}

export const WATER_BODIES: WaterBodyDef[] = [
  // ── Great Salt Lake South Arm ──────────────────────────────────
  // Blue-green portion south of the railroad causeway (Lucin Cutoff).
  // NOTE: Antelope Island (~-112.25, 41.04) sits within this polygon
  //       and should be EXCLUDED (carved out) when rasterizing to tiles.
  {
    name: 'Great Salt Lake South Arm',
    elevation: 1280,
    polygon: [
      [-112.78, 41.30], [-112.60, 41.30], [-112.40, 41.27], [-112.22, 41.22],
      [-112.10, 41.16], [-112.02, 41.08], [-112.00, 40.98], [-112.02, 40.88],
      [-112.08, 40.80], [-112.15, 40.73], [-112.22, 40.68], [-112.33, 40.66],
      [-112.45, 40.68], [-112.55, 40.72], [-112.65, 40.78], [-112.72, 40.85],
      [-112.78, 40.93], [-112.82, 41.02], [-112.85, 41.12], [-112.82, 41.22],
    ],
  },

  // ── Great Salt Lake North Arm ──────────────────────────────────
  // Pink-tinted from halophilic archaea, north of the causeway.
  {
    name: 'Great Salt Lake North Arm',
    elevation: 1280,
    color: '#C47088',
    polygon: [
      [-112.78, 41.30], [-112.82, 41.38], [-112.88, 41.48], [-112.92, 41.55],
      [-112.98, 41.62], [-113.05, 41.68], [-113.10, 41.72], [-112.90, 41.72],
      [-112.70, 41.68], [-112.55, 41.62], [-112.42, 41.55], [-112.33, 41.47],
      [-112.27, 41.38], [-112.22, 41.30], [-112.22, 41.22], [-112.40, 41.27],
      [-112.60, 41.30],
    ],
  },

  // ── Utah Lake ──────────────────────────────────────────────────
  // Largest freshwater lake in Utah, shallow, in Utah Valley.
  {
    name: 'Utah Lake',
    elevation: 1368,
    color: '#4A7060', // murky olive-brown (shallow, eutrophic freshwater)
    polygon: [
      [-111.86, 40.36], [-111.80, 40.37], [-111.74, 40.35], [-111.71, 40.31],
      [-111.70, 40.26], [-111.71, 40.20], [-111.72, 40.14], [-111.74, 40.09],
      [-111.77, 40.05], [-111.82, 40.04], [-111.87, 40.05], [-111.90, 40.08],
      [-111.92, 40.13], [-111.93, 40.19], [-111.93, 40.25], [-111.91, 40.31],
      [-111.88, 40.35],
    ],
  },

  // ── Bear Lake ──────────────────────────────────────────────────
  // Straddles UT/ID border. Caribbean-turquoise from suspended calcium carbonate.
  {
    name: 'Bear Lake',
    elevation: 1805,
    color: '#40B8B0',
    polygon: [
      [-111.38, 42.00], [-111.30, 42.00], [-111.24, 41.98], [-111.20, 41.95],
      [-111.18, 41.90], [-111.18, 41.85], [-111.20, 41.82], [-111.24, 41.79],
      [-111.30, 41.78], [-111.35, 41.79], [-111.39, 41.82], [-111.41, 41.86],
      [-111.42, 41.91], [-111.41, 41.96],
    ],
  },

  // ── Lake Powell ────────────────────────────────────────────────
  // Massive reservoir in Glen Canyon. Complex dendritic shape with
  // side canyons (Escalante Arm, San Juan Arm, etc.).
  {
    name: 'Lake Powell',
    elevation: 1091,
    color: '#1A4A6A', // deep blue (massive cliff-surrounded reservoir)
    polygon: [
      // Main channel running roughly SW to NE
      [-111.52, 37.42], [-111.42, 37.38], [-111.32, 37.33], [-111.22, 37.28],
      [-111.12, 37.22], [-111.05, 37.18], [-110.95, 37.14], [-110.85, 37.12],
      [-110.75, 37.10], [-110.62, 37.07], [-110.50, 37.05], [-110.42, 37.02],
      // South shore (narrower, follows Glen Canyon)
      [-110.42, 37.00], [-110.55, 37.01], [-110.68, 37.04], [-110.80, 37.06],
      [-110.92, 37.09], [-111.02, 37.12], [-111.12, 37.16], [-111.22, 37.20],
      [-111.32, 37.25], [-111.42, 37.30], [-111.50, 37.35], [-111.55, 37.40],
    ],
  },

  // ── Flaming Gorge Reservoir ────────────────────────────────────
  // On the Green River in NE Utah, extending into Wyoming.
  {
    name: 'Flaming Gorge Reservoir',
    elevation: 1844,
    polygon: [
      [-109.65, 41.08], [-109.58, 41.06], [-109.52, 41.02], [-109.46, 40.98],
      [-109.42, 40.94], [-109.40, 40.90], [-109.38, 40.86], [-109.40, 40.84],
      [-109.44, 40.86], [-109.48, 40.90], [-109.52, 40.94], [-109.56, 40.98],
      [-109.60, 41.02], [-109.65, 41.05],
    ],
  },

  // ── Strawberry Reservoir ───────────────────────────────────────
  // High-elevation reservoir (7600 ft) in Wasatch County.
  {
    name: 'Strawberry Reservoir',
    elevation: 2316,
    polygon: [
      [-111.22, 40.19], [-111.16, 40.18], [-111.10, 40.16], [-111.06, 40.13],
      [-111.05, 40.10], [-111.07, 40.08], [-111.11, 40.08], [-111.16, 40.09],
      [-111.21, 40.11], [-111.24, 40.14], [-111.25, 40.17],
    ],
  },

  // ── Jordanelle Reservoir ───────────────────────────────────────
  // Near Heber City, Y-shaped reservoir on the Provo River.
  {
    name: 'Jordanelle Reservoir',
    elevation: 1860,
    polygon: [
      [-111.44, 40.63], [-111.41, 40.62], [-111.39, 40.61], [-111.38, 40.59],
      [-111.39, 40.58], [-111.41, 40.58], [-111.43, 40.59], [-111.45, 40.60],
      [-111.46, 40.62],
    ],
  },

  // ── Deer Creek Reservoir ───────────────────────────────────────
  // In Provo Canyon between Heber and Provo.
  {
    name: 'Deer Creek Reservoir',
    elevation: 1695,
    polygon: [
      [-111.54, 40.44], [-111.51, 40.43], [-111.49, 40.42], [-111.48, 40.40],
      [-111.49, 40.39], [-111.51, 40.38], [-111.53, 40.39], [-111.55, 40.41],
      [-111.55, 40.43],
    ],
  },

  // ── Scofield Reservoir ────────────────────────────────────────
  // High-altitude reservoir (7600 ft) in Carbon County.
  {
    name: 'Scofield Reservoir',
    elevation: 2316,
    polygon: [
      [-111.14, 39.82], [-111.11, 39.81], [-111.08, 39.79], [-111.07, 39.77],
      [-111.08, 39.75], [-111.10, 39.75], [-111.13, 39.76], [-111.15, 39.78],
      [-111.15, 39.80],
    ],
  },

  // ── Starvation Reservoir ──────────────────────────────────────
  // Near Duchesne, on the Strawberry River.
  {
    name: 'Starvation Reservoir',
    elevation: 1742,
    polygon: [
      [-110.50, 40.22], [-110.47, 40.21], [-110.44, 40.19], [-110.42, 40.17],
      [-110.43, 40.16], [-110.46, 40.16], [-110.49, 40.17], [-110.51, 40.19],
      [-110.51, 40.21],
    ],
  },

  // ── Sevier Lake ───────────────────────────────────────────────
  // Usually a dry playa / ephemeral lake in the Great Basin.
  {
    name: 'Sevier Lake',
    elevation: 1383,
    polygon: [
      [-113.00, 39.08], [-112.92, 39.08], [-112.87, 39.02], [-112.85, 38.95],
      [-112.86, 38.88], [-112.88, 38.82], [-112.92, 38.80], [-112.98, 38.80],
      [-113.03, 38.84], [-113.07, 38.90], [-113.08, 38.97], [-113.05, 39.04],
    ],
  },

  // ── Willard Bay ───────────────────────────────────────────────
  // Diked freshwater reservoir on the eastern shore of GSL.
  {
    name: 'Willard Bay',
    elevation: 1295,
    polygon: [
      [-112.10, 41.42], [-112.06, 41.42], [-112.03, 41.40], [-112.02, 41.38],
      [-112.04, 41.37], [-112.07, 41.37], [-112.10, 41.39],
    ],
  },

  // ── Fish Lake ─────────────────────────────────────────────────
  // Natural mountain lake in Sevier County at ~8800 ft.
  {
    name: 'Fish Lake',
    elevation: 2713,
    polygon: [
      [-111.73, 38.57], [-111.71, 38.57], [-111.69, 38.56], [-111.68, 38.55],
      [-111.69, 38.53], [-111.71, 38.53], [-111.73, 38.54], [-111.74, 38.56],
    ],
  },
];
