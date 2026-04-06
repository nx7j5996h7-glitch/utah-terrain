import type { Tile } from '@/core/map/Tile';

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

function formatParkType(parkType: string): string {
  return titleCase(parkType);
}

export class Tooltip {
  private el: HTMLDivElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'tile-tooltip';
    Object.assign(this.el.style, {
      position: 'fixed',
      background: 'rgba(26, 26, 26, 0.92)',
      color: '#fff',
      font: '12px "SF Mono", "Fira Code", Consolas, monospace',
      padding: '8px',
      borderRadius: '3px',
      border: '1px solid #555',
      pointerEvents: 'none',
      zIndex: '50',
      display: 'none',
      whiteSpace: 'nowrap',
      lineHeight: '1.5',
    } as CSSStyleDeclaration);

    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.appendChild(this.el);
    else document.body.appendChild(this.el);
  }

  show(tile: Tile, mouseX: number, mouseY: number): void {
    const lines: string[] = [];

    lines.push(
      `<div style="font-size:13px;font-weight:700;margin-bottom:2px;">${escapeHtml(tile.region)}</div>`,
    );
    lines.push(
      `<div>Elevation ${tile.elevation} (${elevationLabel(tile.elevation)})</div>`,
    );
    lines.push(`<div>${escapeHtml(titleCase(tile.terrain))}</div>`);

    if (tile.feature) {
      lines.push(`<div>${escapeHtml(titleCase(tile.feature))}</div>`);
    }
    if (tile.park) {
      const pt = tile.parkType ? ` (${formatParkType(tile.parkType)})` : '';
      lines.push(`<div>${escapeHtml(tile.park)}${escapeHtml(pt)}</div>`);
    }
    if (tile.city) {
      lines.push(`<div>&bull; City: ${escapeHtml(tile.city)}</div>`);
    }
    if (tile.waterway) {
      lines.push(`<div>&bull; River: ${escapeHtml(tile.waterway)}</div>`);
    }
    if (tile.road) {
      lines.push(`<div>&bull; Road: ${escapeHtml(tile.road)}</div>`);
    }

    this.el.innerHTML = lines.join('');
    this.el.style.display = 'block';
    this.el.style.left = `${mouseX + 12}px`;
    this.el.style.top = `${mouseY + 12}px`;
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  dispose(): void {
    this.el.remove();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
