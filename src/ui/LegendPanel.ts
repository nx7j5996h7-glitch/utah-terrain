/**
 * LegendPanel — terrain color legend.
 * Collapsed "Legend" button in the bottom-left; press L to toggle.
 */

import { TERRAIN_COLORS } from '@/constants';
import type { TerrainType } from '@/constants';

const TERRAIN_LABELS: Record<TerrainType, string> = {
  salt_flat:       'Salt Flat',
  desert:          'Desert',
  sagebrush:       'Sagebrush',
  red_sandstone:   'Red Sandstone',
  white_sandstone: 'White Sandstone',
  canyon_floor:    'Canyon Floor',
  mountain:        'Mountain',
  conifer_forest:  'Conifer Forest',
  alpine:          'Alpine',
  river_valley:    'River Valley',
  marsh:           'Marsh',
  urban:           'Urban',
  badlands:        'Badlands',
  lava_field:      'Lava Field',
  water:           'Water',
};

// Ordered list (15 entries) for the panel.
const TERRAIN_ORDER: TerrainType[] = [
  'salt_flat', 'desert', 'sagebrush', 'red_sandstone', 'white_sandstone',
  'canyon_floor', 'badlands', 'lava_field', 'river_valley', 'marsh',
  'conifer_forest', 'mountain', 'alpine', 'urban', 'water',
];

// Simple 0–15 elevation ramp (dark → light with a red-rock tint).
function elevationRampColor(i: number): string {
  const t = i / 15;
  // Lerp: #3a4a3a (low) → #c45b28 (mid) → #f0ede4 (high)
  const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const u = t / 0.5;
    r = lerp(0x3a, 0xc4, u);
    g = lerp(0x4a, 0x5b, u);
    b = lerp(0x3a, 0x28, u);
  } else {
    const u = (t - 0.5) / 0.5;
    r = lerp(0xc4, 0xf0, u);
    g = lerp(0x5b, 0xed, u);
    b = lerp(0x28, 0xe4, u);
  }
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export class LegendPanel {
  private readonly root: HTMLDivElement;
  private readonly toggleBtn: HTMLButtonElement;
  private readonly body: HTMLDivElement;
  private readonly styleEl: HTMLStyleElement;
  private expanded = false;

  constructor() {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = LegendPanel.CSS;
    document.head.appendChild(this.styleEl);

    this.root = document.createElement('div');
    this.root.className = 'utah-legend-panel';

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'utah-legend-toggle';
    this.toggleBtn.type = 'button';
    this.toggleBtn.textContent = 'Legend';
    this.toggleBtn.addEventListener('click', () => this.toggle());

    this.body = document.createElement('div');
    this.body.className = 'utah-legend-body';
    this.body.style.display = 'none';
    this.buildBody();

    this.root.appendChild(this.toggleBtn);
    this.root.appendChild(this.body);

    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.appendChild(this.root);
    else document.body.appendChild(this.root);
  }

  toggle(): void {
    this.setVisible(!this.expanded);
  }

  setVisible(visible: boolean): void {
    this.expanded = visible;
    this.body.style.display = visible ? 'block' : 'none';
    this.toggleBtn.classList.toggle('open', visible);
  }

  dispose(): void {
    this.root.remove();
    this.styleEl.remove();
  }

  // ── Internal ────────────────────────────────────────────────────────────
  private buildBody(): void {
    const terrainSection = document.createElement('div');
    terrainSection.className = 'utah-legend-section';
    const terrainTitle = document.createElement('div');
    terrainTitle.className = 'utah-legend-title';
    terrainTitle.textContent = 'Terrain';
    terrainSection.appendChild(terrainTitle);

    for (const type of TERRAIN_ORDER) {
      const row = document.createElement('div');
      row.className = 'utah-legend-row';
      const swatch = document.createElement('span');
      swatch.className = 'utah-legend-swatch';
      swatch.style.background = TERRAIN_COLORS[type];
      const label = document.createElement('span');
      label.className = 'utah-legend-label';
      label.textContent = TERRAIN_LABELS[type];
      row.appendChild(swatch);
      row.appendChild(label);
      terrainSection.appendChild(row);
    }
    this.body.appendChild(terrainSection);

    const elevSection = document.createElement('div');
    elevSection.className = 'utah-legend-section';
    const elevTitle = document.createElement('div');
    elevTitle.className = 'utah-legend-title';
    elevTitle.textContent = 'Elevation';
    elevSection.appendChild(elevTitle);

    const ramp = document.createElement('div');
    ramp.className = 'utah-legend-ramp';
    const stops: string[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = (i / 15) * 100;
      stops.push(`${elevationRampColor(i)} ${t.toFixed(1)}%`);
    }
    ramp.style.background = `linear-gradient(to right, ${stops.join(', ')})`;
    elevSection.appendChild(ramp);

    const scale = document.createElement('div');
    scale.className = 'utah-legend-scale';
    const lo = document.createElement('span');
    lo.textContent = '0';
    const hi = document.createElement('span');
    hi.textContent = '15';
    scale.appendChild(lo);
    scale.appendChild(hi);
    elevSection.appendChild(scale);

    this.body.appendChild(elevSection);
  }

  private static readonly CSS = `
.utah-legend-panel {
  position: fixed;
  left: 16px;
  bottom: 16px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #e8e4d8;
  z-index: 40;
}
.utah-legend-toggle {
  display: inline-block;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #e8e4d8;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-legend-toggle:hover,
.utah-legend-toggle.open {
  border-color: #c45b28;
  color: #fff;
  box-shadow: 0 0 12px rgba(196, 91, 40, 0.25);
}
.utah-legend-body {
  width: 180px;
  margin-top: 6px;
  padding: 10px 12px;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-legend-section { margin-bottom: 10px; }
.utah-legend-section:last-child { margin-bottom: 0; }
.utah-legend-title {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c45b28;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(196, 91, 40, 0.2);
}
.utah-legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-size: 11px;
  color: #d0c8b8;
}
.utah-legend-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}
.utah-legend-label { white-space: nowrap; }
.utah-legend-ramp {
  width: 100%;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.4);
}
.utah-legend-scale {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #7a6a5a;
  margin-top: 3px;
  letter-spacing: 1px;
}
`;
}
