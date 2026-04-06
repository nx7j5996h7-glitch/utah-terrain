import { MAX_RENDER_SCALE, MAX_DPR } from '@/constants';

export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface GraphicsSettingsData {
  preset: QualityPreset;
  renderScale: number;       // 0.5-0.75
  pixelRatio: number;        // 1.0-1.5
  vegetationDensity: number; // 0.3-1.0 (quality scale for VegetationScatter)
  shadowQuality: boolean;    // baked shadows enabled
  weatherEffects: boolean;
  regionLabels: boolean;
}

const STORAGE_KEY = 'utah_graphics_settings_v1';

type Listener = (settings: GraphicsSettingsData) => void;

export class GraphicsSettingsManager {
  static readonly PRESETS: Record<QualityPreset, GraphicsSettingsData> = {
    low: {
      preset: 'low',
      renderScale: 0.5,
      pixelRatio: 1.0,
      vegetationDensity: 0.3,
      shadowQuality: false,
      weatherEffects: false,
      regionLabels: false,
    },
    medium: {
      preset: 'medium',
      renderScale: 0.65,
      pixelRatio: 1.25,
      vegetationDensity: 0.6,
      shadowQuality: true,
      weatherEffects: false,
      regionLabels: true,
    },
    high: {
      preset: 'high',
      renderScale: 0.75,
      pixelRatio: 1.5,
      vegetationDensity: 0.85,
      shadowQuality: true,
      weatherEffects: true,
      regionLabels: true,
    },
    ultra: {
      preset: 'ultra',
      renderScale: Math.min(0.75, MAX_RENDER_SCALE),
      pixelRatio: Math.min(1.5, MAX_DPR),
      vegetationDensity: 1.0,
      shadowQuality: true,
      weatherEffects: true,
      regionLabels: true,
    },
  };

  private settings: GraphicsSettingsData;
  private listeners: Listener[] = [];

  constructor() {
    // Try to load saved settings first
    const loaded = this.loadFromStorage();
    if (loaded) {
      this.settings = loaded;
    } else {
      // Auto-detect based on hardware
      const preset = GraphicsSettingsManager.autoDetectPreset();
      this.settings = { ...GraphicsSettingsManager.PRESETS[preset] };
    }
  }

  get(): GraphicsSettingsData {
    return { ...this.settings };
  }

  setPreset(preset: QualityPreset): void {
    this.settings = { ...GraphicsSettingsManager.PRESETS[preset] };
    this.emit();
    this.save();
  }

  update(partial: Partial<GraphicsSettingsData>): void {
    this.settings = { ...this.settings, ...partial };
    this.emit();
    this.save();
  }

  onChange(listener: Listener): void {
    this.listeners.push(listener);
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // localStorage unavailable or quota exceeded — ignore
    }
  }

  load(): void {
    const loaded = this.loadFromStorage();
    if (loaded) {
      this.settings = loaded;
      this.emit();
    }
  }

  private loadFromStorage(): GraphicsSettingsData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<GraphicsSettingsData>;
      if (!parsed || !parsed.preset) return null;
      const base = GraphicsSettingsManager.PRESETS[parsed.preset as QualityPreset];
      if (!base) return null;
      return { ...base, ...parsed };
    } catch {
      return null;
    }
  }

  private emit(): void {
    const snapshot = this.get();
    for (const l of this.listeners) l(snapshot);
  }

  static autoDetectPreset(): QualityPreset {
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
    // deviceMemory is in GB, non-standard but widely supported
    const memory = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) || 4;

    if (cores >= 8 && memory >= 8) return 'high';
    if (cores >= 6 && memory >= 4) return 'medium';
    if (cores >= 4 && memory >= 4) return 'medium';
    return 'low';
  }
}
