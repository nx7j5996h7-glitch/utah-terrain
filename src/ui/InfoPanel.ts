import type { Tile } from '@/core/map/Tile';
import { CITIES } from '@/data/cities';

const FORMATION_NAMES: Record<number, string> = {
  1: 'Navajo Sandstone',
  2: 'Entrada Sandstone',
  3: 'Wingate Sandstone',
  4: 'Claron Formation',
  5: 'Mancos Shale',
  6: 'Cedar Mesa Sandstone',
  7: 'Moenkopi Formation',
  8: 'Chinle Formation',
  9: 'Kayenta Formation',
  10: 'De Chelly Sandstone',
  11: 'Kaibab Limestone',
  12: 'Morrison Formation',
  13: 'Uinta Group Quartzite',
  14: 'Wasatch Limestone',
};

function titleCase(s: string): string {
  return s
    .split('_')
    .map(w => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function elevationLabel(e: number): string {
  if (e <= 3) return 'low';
  if (e <= 7) return 'mid';
  if (e <= 11) return 'high';
  return 'peak';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class InfoPanel {
  private el: HTMLDivElement;
  private bodyEl: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private escHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'tile-info-panel';
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      width: '320px',
      background: 'rgba(20, 20, 20, 0.94)',
      color: '#e0e0e0',
      border: '1px solid #444',
      borderRadius: '4px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: '13px',
      lineHeight: '1.5',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      transform: 'translateX(340px)',
      transition: 'transform 0.25s ease-out',
      zIndex: '60',
      pointerEvents: 'auto',
    } as CSSStyleDeclaration);

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      borderBottom: '1px solid #333',
      background: 'rgba(0,0,0,0.3)',
    } as CSSStyleDeclaration);

    this.titleEl = document.createElement('div');
    Object.assign(this.titleEl.style, {
      fontWeight: '700',
      fontSize: '14px',
      color: '#fff',
    } as CSSStyleDeclaration);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00D7';
    Object.assign(closeBtn.style, {
      background: 'transparent',
      border: 'none',
      color: '#aaa',
      fontSize: '20px',
      lineHeight: '1',
      cursor: 'pointer',
      padding: '0 4px',
      marginLeft: '8px',
    } as CSSStyleDeclaration);
    closeBtn.addEventListener('mouseenter', () => (closeBtn.style.color = '#fff'));
    closeBtn.addEventListener('mouseleave', () => (closeBtn.style.color = '#aaa'));
    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(this.titleEl);
    header.appendChild(closeBtn);

    // Body
    this.bodyEl = document.createElement('div');
    Object.assign(this.bodyEl.style, {
      padding: '12px 14px',
    } as CSSStyleDeclaration);

    this.el.appendChild(header);
    this.el.appendChild(this.bodyEl);

    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.appendChild(this.el);
    else document.body.appendChild(this.el);

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.hide();
    };
    window.addEventListener('keydown', this.escHandler);
  }

  show(tile: Tile): void {
    this.titleEl.textContent = tile.region;

    const rows: string[] = [];

    const addRow = (label: string, value: string): void => {
      rows.push(
        `<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px dotted #2a2a2a;">
          <span style="color:#888;font-family:'SF Mono','Fira Code',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(label)}</span>
          <span style="color:#e8e8e8;text-align:right;">${value}</span>
        </div>`,
      );
    };

    addRow('Hex', `(${tile.q}, ${tile.r})`);
    addRow('Region', escapeHtml(tile.region));
    addRow('Terrain', escapeHtml(titleCase(tile.terrain)));
    addRow('Elevation', `${tile.elevation} (${elevationLabel(tile.elevation)})`);

    if (tile.formation !== undefined && tile.formation > 0) {
      const name = FORMATION_NAMES[tile.formation] ?? `Formation ${tile.formation}`;
      addRow('Formation', escapeHtml(name));
    }
    if (tile.feature) {
      addRow('Feature', escapeHtml(titleCase(tile.feature)));
    }
    if (tile.park) {
      const pt = tile.parkType ? titleCase(tile.parkType) : '';
      addRow('Park', escapeHtml(pt ? `${tile.park} (${pt})` : tile.park));
    }
    if (tile.city) {
      const cityDef = CITIES.find(c => c.name === tile.city);
      const popStr = cityDef ? ` (pop. ${cityDef.population.toLocaleString()})` : '';
      addRow('City', escapeHtml(`${tile.city}${popStr}`));
    }
    if (tile.waterway) {
      addRow('Waterway', escapeHtml(tile.waterway));
    }
    if (tile.road) {
      const rt = tile.roadType ? ` (${titleCase(tile.roadType)})` : '';
      addRow('Road', escapeHtml(`${tile.road}${rt}`));
    }

    this.bodyEl.innerHTML = rows.join('');
    this.el.style.transform = 'translateX(0)';
  }

  hide(): void {
    this.el.style.transform = 'translateX(340px)';
  }

  dispose(): void {
    window.removeEventListener('keydown', this.escHandler);
    this.el.remove();
  }
}
