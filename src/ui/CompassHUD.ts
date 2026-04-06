/**
 * CompassHUD — Dynamic compass rose that rotates with camera azimuth.
 *
 * Shows N/S/E/W cardinal directions, rotating in real-time as the user
 * orbits the camera with Q/E or mouse drag. Positioned in the top-right corner.
 *
 * The map is oriented with real-world cardinal directions:
 *   - North is screen-up at default camera angle (azimuth=0)
 *   - q increases eastward, r increases southward
 */

export class CompassHUD {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentAngle = 0;
  private readonly size = 80;

  constructor() {
    // Container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      width: ${this.size}px;
      height: ${this.size}px;
      z-index: 50;
      pointer-events: none;
      user-select: none;
    `;

    // Canvas for drawing
    this.canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);

    document.getElementById('ui-overlay')?.appendChild(this.container)
      ?? document.body.appendChild(this.container);

    this.draw();
  }

  /**
   * Update compass rotation from camera azimuth angle (radians).
   * azimuth=0 means camera is looking from south (default), north is up.
   */
  update(azimuthRadians: number): void {
    // Only redraw if angle changed significantly (avoid per-frame redraws)
    const rounded = Math.round(azimuthRadians * 100) / 100;
    if (rounded === this.currentAngle) return;
    this.currentAngle = rounded;
    this.draw();
  }

  private draw(): void {
    const ctx = this.ctx;
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.size / 2 - 4;

    ctx.clearRect(0, 0, this.size, this.size);

    // Outer ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rotate canvas to match camera azimuth
    ctx.translate(cx, cy);
    ctx.rotate(-this.currentAngle + Math.PI); // +PI offset because camera default is azimuth=PI

    // Compass needle — North (red triangle pointing up)
    const needleLen = r * 0.65;
    const needleW = 4;

    // North half (red)
    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo(-needleW, 0);
    ctx.lineTo(needleW, 0);
    ctx.closePath();
    ctx.fillStyle = '#c45b28';
    ctx.fill();

    // South half (white/grey)
    ctx.beginPath();
    ctx.moveTo(0, needleLen);
    ctx.lineTo(-needleW, 0);
    ctx.lineTo(needleW, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 190, 170, 0.5)';
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#c8b89a';
    ctx.fill();

    // Cardinal direction labels
    ctx.font = 'bold 11px "SF Mono", "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelR = r * 0.85;

    // N (highlighted)
    ctx.fillStyle = '#c45b28';
    ctx.fillText('N', 0, -labelR);

    // S
    ctx.fillStyle = 'rgba(200, 190, 170, 0.6)';
    ctx.fillText('S', 0, labelR);

    // E
    ctx.fillText('E', labelR, 0);

    // W
    ctx.fillText('W', -labelR, 0);

    // Tick marks for intercardinal directions
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.2)';
    ctx.lineWidth = 0.5;
    const tickInner = r * 0.72;
    const tickOuter = r * 0.78;
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) continue; // skip cardinal directions (already labeled)
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.sin(angle) * tickInner, -Math.cos(angle) * tickInner);
      ctx.lineTo(Math.sin(angle) * tickOuter, -Math.cos(angle) * tickOuter);
      ctx.stroke();
    }

    ctx.restore();
  }

  dispose(): void {
    this.container.remove();
  }
}
