export type DirtySource =
  | 'camera' | 'hover' | 'selection' | 'overlay' | 'animation' | 'resize' | 'settings' | 'startup';

// Target frame intervals (ms)
const FRAME_INTERVAL_ACTIVE = 1000 / 60; // 60fps when camera/animation active
const FRAME_INTERVAL_IDLE = 1000 / 30;   // 30fps for less critical updates

export class RenderScheduler {
  private dirty: Set<DirtySource> = new Set();
  private continuous = false;
  private lastRenderTime = 0;

  constructor() {
    // Start dirty so first frame always renders
    this.dirty.add('startup');
  }

  /** Mark a source as dirty, requiring a render */
  setDirty(source: DirtySource): void {
    this.dirty.add(source);
  }

  /** Check if a render is needed this frame */
  shouldRender(timestamp: number): boolean {
    if (this.continuous) {
      // Always render in continuous mode, but still respect 60fps cap
      if (timestamp - this.lastRenderTime >= FRAME_INTERVAL_ACTIVE) {
        return true;
      }
      return false;
    }

    if (this.dirty.size === 0) return false;

    // Pick frame interval based on what's dirty
    const hasActive = this.dirty.has('camera') || this.dirty.has('animation');
    const interval = hasActive ? FRAME_INTERVAL_ACTIVE : FRAME_INTERVAL_IDLE;

    if (timestamp - this.lastRenderTime < interval) return false;
    return true;
  }

  /** Call after rendering to reset dirty flags (except animation) */
  markRendered(): void {
    this.lastRenderTime = performance.now();
    // Animation stays dirty (continuous); clear everything else
    const animDirty = this.dirty.has('animation');
    this.dirty.clear();
    if (animDirty) this.dirty.add('animation');
  }

  /** Continuous-animation mode: renders always */
  setContinuous(enabled: boolean): void {
    this.continuous = enabled;
    if (enabled) {
      this.dirty.add('animation');
    }
  }
}
