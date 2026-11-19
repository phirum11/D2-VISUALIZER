import { PresetCategory, PresetItem, PresetsBundle } from './types'

export const FACTORY_PRESETS: PresetItem[] = [
  // 1. Visualizer Presets
  {
    id: 'fac-vis-neon-bars',
    name: 'Cyber Neon Bars',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'High-intensity neon cyan and purple spectrum bars',
    data: {
      type: 'spectrum-bars',
      barCount: 72,
      thickness: 4,
      spacing: 2,
      sensitivity: 1.3,
      smoothing: 0.78,
      glow: 18,
      primaryColor: '#06b6d4',
      accentColor: '#a855f7',
      positionX: 0,
      positionY: 10,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'fac-vis-golden-radial',
    name: 'Golden Sun Radial',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Pulsing circular radial waveform with warm golden glow',
    data: {
      type: 'radial-waveform',
      barCount: 64,
      thickness: 3,
      sensitivity: 1.25,
      smoothing: 0.8,
      glow: 16,
      primaryColor: '#eab308',
      accentColor: '#f97316',
      positionX: 0,
      positionY: 0,
      scale: 1.15,
      rotation: 0,
      opacity: 0.95,
    },
  },
  {
    id: 'fac-vis-3d-sphere-cosmic',
    name: 'Cosmic 3D Audio Sphere',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Dynamic WebGL audio-reactive 3D sphere',
    data: {
      type: '3d-sphere',
      barCount: 64,
      thickness: 3,
      sensitivity: 1.4,
      smoothing: 0.75,
      glow: 20,
      primaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      positionX: 0,
      positionY: 0,
      scale: 1.2,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'fac-vis-neon-waveform',
    name: 'Electric Neon Waveform',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    description: 'Hyper-vibrant electric neon oscilloscope with harmonic bloom',
    data: {
      type: 'neon-waveform',
      barCount: 48,
      thickness: 6,
      spacing: 4,
      sensitivity: 1.35,
      smoothing: 0.8,
      glow: 24,
      primaryColor: '#06b6d4',
      accentColor: '#3b82f6',
      positionX: 0,
      positionY: 10,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'fac-vis-liquid-energy',
    name: 'Liquid Plasma Core',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    description: 'Dynamic liquid plasma blob undulating to sub-bass harmonics',
    data: {
      type: 'liquid-energy',
      barCount: 64,
      thickness: 4,
      spacing: 3,
      sensitivity: 1.2,
      smoothing: 0.82,
      glow: 22,
      primaryColor: '#6366f1',
      accentColor: '#ec4899',
      positionX: 0,
      positionY: 0,
      scale: 1.1,
      rotation: 0,
      opacity: 0.95,
    },
  },
  {
    id: 'fac-vis-dual-ring',
    name: 'Dual Ring Solar Orbit',
    category: 'visualizer',
    isFactory: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    description: 'Interlocking dual circular frequency teeth with counter-rotation',
    data: {
      type: 'dual-ring-spectrum',
      barCount: 64,
      thickness: 4,
      spacing: 2,
      sensitivity: 1.25,
      smoothing: 0.8,
      glow: 18,
      primaryColor: '#f59e0b',
      accentColor: '#ef4444',
      positionX: 0,
      positionY: 0,
      scale: 1.15,
      rotation: 0,
      opacity: 1,
    },
  },

  // 2. Background Presets
  {
    id: 'fac-bg-midnight-abyss',
    name: 'Midnight Abyss',
    category: 'background',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Deep navy-indigo gradient with soft atmospheric vignette',
    data: {
      type: 'gradient',
      gradientType: 'linear',
      color1: '#0b1329',
      color2: '#020617',
      gradientAngle: 135,
      blur: 0,
      brightness: 100,
      contrast: 105,
      saturation: 110,
    },
  },
  {
    id: 'fac-bg-crimson-dusk',
    name: 'Crimson Dusk',
    category: 'background',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Moody dark blood-red and charcoal vignette gradient',
    data: {
      type: 'gradient',
      gradientType: 'radial',
      color1: '#260408',
      color2: '#030102',
      gradientAngle: 0,
      blur: 0,
      brightness: 95,
      contrast: 115,
      saturation: 115,
    },
  },

  // 3. Typography Presets
  {
    id: 'fac-typo-cinematic-bold',
    name: 'Cinematic Title & Artist',
    category: 'typography',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Bold modern song title with letter-spaced artist subtitle',
    data: {
      songTitle: 'TRACK TITLE HERE',
      artistName: 'ARTIST NAME • OFFICIAL AUDIO',
      fontFamily: 'Inter',
      fontSize: 44,
      color: '#ffffff',
      glowColor: '#38bdf8',
      glowBlur: 16,
      letterSpacing: 4,
    },
  },
  {
    id: 'fac-typo-khmer-elegant',
    name: 'Khmer Traditional Elegance',
    category: 'typography',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Golden glowing Khmer typography with Unicode support',
    data: {
      songTitle: 'បទភ្លេងខ្មែរ — និស្ស័យស្នេហ៍',
      artistName: 'D2 KHMER ARTIST',
      fontFamily: 'Khmer OS',
      fontSize: 40,
      color: '#fef08a',
      glowColor: '#eab308',
      glowBlur: 14,
      letterSpacing: 2,
    },
  },

  // 4. Text Animation Presets
  {
    id: 'fac-anim-glow-pulse',
    name: 'Beat Glow Pulse',
    category: 'text-animation',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Rhythmic audio-synced text glow pulsation',
    data: {
      preset: 'glow-pulse',
      duration: 1.2,
      delay: 0,
      easing: 'ease-in-out',
      intensity: 1.5,
    },
  },
  {
    id: 'fac-anim-smooth-fade',
    name: 'Cinematic Fade In',
    category: 'text-animation',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Smooth exponential opacity ramp with subtle scale',
    data: {
      preset: 'fade-in',
      duration: 1.0,
      delay: 0.2,
      easing: 'ease-out',
      intensity: 1.0,
    },
  },

  // 5. Album Artwork Presets
  {
    id: 'fac-art-glowing-circle',
    name: 'Glowing Circular Vinyl Frame',
    category: 'artwork',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Circular album artwork mask with soft neon rim glow',
    data: {
      maskShape: 'circle',
      scale: 1.0,
      borderWidth: 2,
      borderColor: '#38bdf8',
      glowBlur: 15,
      glowColor: '#06b6d4',
      opacity: 1,
      rotation: 0,
    },
  },

  // 6. Logo / Watermark Presets
  {
    id: 'fac-logo-top-right',
    name: 'Top-Right Watermark Badge',
    category: 'watermark',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Subtle corner badge for brand identity',
    data: {
      placement: 'top-right',
      scale: 0.8,
      opacity: 0.85,
      positionX: 0,
      positionY: 0,
    },
  },

  // 7. Particle Effects Presets
  {
    id: 'fac-part-cosmic-embers',
    name: 'Cosmic Floating Embers',
    category: 'particles',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Glowing warm ember particles drifting upwards',
    data: {
      enabled: true,
      preset: 'fireflies',
      particleCount: 50,
      size: 2.8,
      speed: 0.9,
      direction: 'up',
      opacity: 0.6,
      color: '#f59e0b',
      glow: 14,
      audioReactivity: 0.7,
    },
  },

  // 8. Color Grading / Effects Presets
  {
    id: 'fac-fx-vintage-cinema',
    name: 'Vintage 35mm Cinema',
    category: 'color-grading',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Warm film grain, subtle chromatic aberration, and soft lens glow',
    data: {
      grain: 0.25,
      vignette: 0.4,
      chromaticAberration: 0.1,
      softLensGlow: 0.35,
      bloom: 0.3,
      brightness: 98,
      contrast: 105,
      saturation: 105,
    },
  },

  // 9. Keyframe Animation Presets
  {
    id: 'fac-key-drop-swell',
    name: 'Drop Build-Up Swell',
    category: 'keyframes',
    isFactory: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Automated scale and sensitivity swell building into drop',
    data: [
      { property: 'scale', timeOffset: 0, value: 0.8, easing: 'ease-in' },
      { property: 'scale', timeOffset: 8, value: 1.3, easing: 'ease-out' },
      { property: 'opacity', timeOffset: 0, value: 0.5, easing: 'linear' },
      { property: 'opacity', timeOffset: 8, value: 1.0, easing: 'ease-in-out' },
    ],
  },
]

export class PresetManager {
  private static userPresets: PresetItem[] = []

  public static getFactoryPresets(category?: PresetCategory): PresetItem[] {
    if (!category) return [...FACTORY_PRESETS]
    return FACTORY_PRESETS.filter((p) => p.category === category)
  }

  public static getUserPresets(category?: PresetCategory): PresetItem[] {
    if (!category) return [...this.userPresets]
    return this.userPresets.filter((p) => p.category === category)
  }

  public static getAllPresets(category?: PresetCategory): PresetItem[] {
    return [...this.getFactoryPresets(category), ...this.getUserPresets(category)]
  }

  public static setUserPresets(presets: PresetItem[]): void {
    this.userPresets = presets
  }

  public static addUserPreset(preset: Omit<PresetItem, 'isFactory' | 'createdAt'>): PresetItem {
    const newPreset: PresetItem = {
      ...preset,
      isFactory: false,
      createdAt: new Date().toISOString(),
    }
    this.userPresets = this.userPresets.filter((p) => p.id !== newPreset.id)
    this.userPresets.unshift(newPreset)
    return newPreset
  }

  public static deleteUserPreset(presetId: string): boolean {
    const before = this.userPresets.length
    this.userPresets = this.userPresets.filter((p) => p.id !== presetId)
    return this.userPresets.length < before
  }

  public static duplicatePreset(presetId: string): PresetItem | null {
    const existing = this.getAllPresets().find((p) => p.id === presetId)
    if (!existing) return null

    const dup: PresetItem = {
      ...existing,
      id: 'preset-' + Date.now(),
      name: `${existing.name} (Copy)`,
      isFactory: false,
      createdAt: new Date().toISOString(),
    }
    this.userPresets.unshift(dup)
    return dup
  }

  public static exportBundle(): PresetsBundle {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      presets: [...this.userPresets],
    }
  }

  public static importBundle(bundle: PresetsBundle): number {
    if (!bundle || !Array.isArray(bundle.presets)) return 0
    let importedCount = 0
    for (const p of bundle.presets) {
      if (p.id && p.name && p.category && p.data) {
        this.addUserPreset({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          data: p.data,
        })
        importedCount++
      }
    }
    return importedCount
  }
}
