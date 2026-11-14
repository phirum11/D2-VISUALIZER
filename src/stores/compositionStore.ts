import { create } from 'zustand'

export interface VisualizerConfig {
  type: string
  barCount: number
  thickness: number
  spacing: number
  sensitivity: number
  smoothing: number
  glow: number
  primaryColor: string
  accentColor: string
  positionX: number // percentage -50 to +50
  positionY: number
  scale: number
  rotation: number
  opacity: number
}

export type BackgroundType = 'color' | 'gradient' | 'image' | 'video'
export type BackgroundSizing = 'fit' | 'fill' | 'stretch' | 'crop'

export interface BackgroundConfig {
  type: BackgroundType
  // Gradient
  gradientType: 'linear' | 'radial'
  color1: string
  color2: string
  color3?: string
  gradientAngle: number // degrees (0-360)
  // Media (Image or Video)
  mediaPath: string | null
  mediaName: string | null
  mediaType: 'image' | 'video' | null
  sizing: BackgroundSizing
  // Transform & Geometry
  positionX: number
  positionY: number
  scale: number
  rotation: number
  opacity: number
  // Atmospheric filters
  blur: number
  brightness: number
  contrast: number
  saturation: number
  // Video-specific playback controls
  videoVolume: number
  videoMuted: boolean
  playbackSpeed: number
  loop: boolean
  trimStart: number
  trimEnd: number
}

export interface TextConfig {
  songTitle: string
  artistName: string
  subtitle: string
  fontFamily: string
  fontSize: number
  color: string
  outlineColor: string
  outlineWidth: number
  alignment: 'left' | 'center' | 'right'
  positionX: number
  positionY: number
  opacity: number
}

export interface EffectsConfig {
  glow: number
  bloom: number
  vignette: number
  grain: number
  brightness: number
  contrast: number
  saturation: number
  colorTint: string
  colorTintOpacity: number
  chromaticAberration: number
  lightLeaks: number
  softLensGlow: number
  beatPulse: number
}

export type AmbientParticlePreset =
  | 'dust'
  | 'stars'
  | 'snow'
  | 'glowing'
  | 'fireflies'
  | 'sparks'
  | 'cosmic'

export interface AmbientParticlesConfig {
  enabled: boolean
  preset: AmbientParticlePreset
  particleCount: number
  size: number
  speed: number
  direction: 'float' | 'up' | 'down' | 'radial'
  opacity: number
  color: string
  glow: number
  audioReactivity: number
}

export type CinematicMotionPreset =
  | 'none'
  | 'slow-zoom-in'
  | 'slow-zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'vertical-pan'
  | 'subtle-motion'
  | 'beat-pulse'

export interface CinematicMotionConfig {
  preset: CinematicMotionPreset
  intensity: number
}

export interface VisualLayer {
  id: string
  name: string
  type:
    | 'base-background'
    | 'media-background'
    | 'color-overlay'
    | 'ambient-particles'
    | 'visualizer'
    | 'artwork'
    | 'typography'
    | 'watermark'
    | 'foreground-effects'
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: GlobalCompositeOperation
}

export interface CompositionState {
  visualizer: VisualizerConfig
  background: BackgroundConfig
  text: TextConfig
  effects: EffectsConfig
  ambientParticles: AmbientParticlesConfig
  cinematicMotion: CinematicMotionConfig
  layers: VisualLayer[]

  // History for Undo / Redo
  past: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
    ambientParticles: AmbientParticlesConfig
    cinematicMotion: CinematicMotionConfig
    layers: VisualLayer[]
  }>
  future: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
    ambientParticles: AmbientParticlesConfig
    cinematicMotion: CinematicMotionConfig
    layers: VisualLayer[]
  }>

  // Actions
  updateVisualizer: (patch: Partial<VisualizerConfig>) => void
  updateBackground: (patch: Partial<BackgroundConfig>) => void
  updateText: (patch: Partial<TextConfig>) => void
  updateEffects: (patch: Partial<EffectsConfig>) => void
  updateAmbientParticles: (patch: Partial<AmbientParticlesConfig>) => void
  updateCinematicMotion: (patch: Partial<CinematicMotionConfig>) => void

  // Layer Actions
  setLayerVisibility: (id: string, visible: boolean) => void
  setLayerOpacity: (id: string, opacity: number) => void
  setLayerLocked: (id: string, locked: boolean) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void

  resetVisualizerSection: () => void
  resetTransform: () => void
  resetBackground: () => void
  resetEffects: () => void
  undo: () => void
  redo: () => void
}

const initialVisualizer: VisualizerConfig = {
  type: 'spectrum-bars',
  barCount: 48,
  thickness: 8,
  spacing: 4,
  sensitivity: 1.2,
  smoothing: 0.8,
  glow: 15,
  primaryColor: '#6366f1',
  accentColor: '#06b6d4',
  positionX: 0,
  positionY: 15,
  scale: 1,
  rotation: 0,
  opacity: 1,
}

const initialBackground: BackgroundConfig = {
  type: 'gradient',
  gradientType: 'linear',
  color1: '#0f172a',
  color2: '#020617',
  color3: '#1e1b4b',
  gradientAngle: 135,
  mediaPath: null,
  mediaName: null,
  mediaType: null,
  sizing: 'fill',
  positionX: 0,
  positionY: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  videoVolume: 0,
  videoMuted: true,
  playbackSpeed: 1,
  loop: true,
  trimStart: 0,
  trimEnd: 0,
}

const initialText: TextConfig = {
  songTitle: 'Midnight Resonance',
  artistName: 'Starlight Echoes',
  subtitle: 'Official Audio Visualizer',
  fontFamily: 'Inter',
  fontSize: 32,
  color: '#ffffff',
  outlineColor: '#000000',
  outlineWidth: 2,
  alignment: 'center',
  positionX: 0,
  positionY: -20,
  opacity: 1,
}

const initialEffects: EffectsConfig = {
  glow: 30,
  bloom: 20,
  vignette: 40,
  grain: 12,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  colorTint: '#000000',
  colorTintOpacity: 0,
  chromaticAberration: 0,
  lightLeaks: 0,
  softLensGlow: 0,
  beatPulse: 50,
}

const initialAmbientParticles: AmbientParticlesConfig = {
  enabled: true,
  preset: 'dust',
  particleCount: 120,
  size: 2.0,
  speed: 1.0,
  direction: 'float',
  opacity: 0.65,
  color: '#ffffff',
  glow: 8,
  audioReactivity: 0.5,
}

const initialCinematicMotion: CinematicMotionConfig = {
  preset: 'none',
  intensity: 1.0,
}

const initialLayers: VisualLayer[] = [
  { id: 'layer-base-bg', name: 'Base Background', type: 'base-background', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-media-bg', name: 'Media Background', type: 'media-background', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-tint', name: 'Color Overlay / Tint', type: 'color-overlay', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-particles', name: 'Ambient Particles', type: 'ambient-particles', visible: true, locked: false, opacity: 1, blendMode: 'screen' },
  { id: 'layer-visualizer', name: 'Audio Visualizer', type: 'visualizer', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-artwork', name: 'Artist Artwork', type: 'artwork', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-typography', name: 'Song Title & Artist', type: 'typography', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-watermark', name: 'Logo / Watermark', type: 'watermark', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
  { id: 'layer-fx', name: 'Foreground Effects (Vignette, Grain, RGB)', type: 'foreground-effects', visible: true, locked: false, opacity: 1, blendMode: 'source-over' },
]

export const useCompositionStore = create<CompositionState>((set, get) => ({
  visualizer: initialVisualizer,
  background: initialBackground,
  text: initialText,
  effects: initialEffects,
  ambientParticles: initialAmbientParticles,
  cinematicMotion: initialCinematicMotion,
  layers: initialLayers,
  past: [],
  future: [],

  updateVisualizer: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      visualizer: { ...visualizer, ...patch },
    })
  },

  updateBackground: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      background: { ...background, ...patch },
    })
  },

  updateText: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      text: { ...text, ...patch },
    })
  },

  updateEffects: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      effects: { ...effects, ...patch },
    })
  },

  updateAmbientParticles: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      ambientParticles: { ...ambientParticles, ...patch },
    })
  },

  updateCinematicMotion: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: [],
      cinematicMotion: { ...cinematicMotion, ...patch },
    })
  },

  setLayerVisibility: (id, visible) => {
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, visible } : l)),
    }))
  },

  setLayerOpacity: (id, opacity) => {
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
    }))
  },

  setLayerLocked: (id, locked) => {
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, locked } : l)),
    }))
  },

  reorderLayers: (fromIndex, toIndex) => {
    set((s) => {
      const updated = [...s.layers]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return { layers: updated }
    })
  },

  resetVisualizerSection: () => {
    set((s) => ({ visualizer: { ...s.visualizer, ...initialVisualizer, type: s.visualizer.type } }))
  },

  resetTransform: () => {
    set((s) => ({
      visualizer: {
        ...s.visualizer,
        positionX: 0,
        positionY: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
      },
    }))
  },

  resetBackground: () => {
    set({ background: initialBackground })
  },

  resetEffects: () => {
    set({ effects: initialEffects, ambientParticles: initialAmbientParticles, cinematicMotion: initialCinematicMotion })
  },

  undo: () => {
    const { past, future, visualizer, background, text, effects, ambientParticles, cinematicMotion, layers } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    set({
      past: newPast,
      future: [{ visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }, ...future],
      visualizer: previous.visualizer,
      background: previous.background,
      text: previous.text,
      effects: previous.effects,
      ambientParticles: previous.ambientParticles,
      cinematicMotion: previous.cinematicMotion,
      layers: previous.layers,
    })
  },

  redo: () => {
    const { past, future, visualizer, background, text, effects, ambientParticles, cinematicMotion, layers } = get()
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    set({
      past: [...past, { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers }],
      future: newFuture,
      visualizer: next.visualizer,
      background: next.background,
      text: next.text,
      effects: next.effects,
      ambientParticles: next.ambientParticles,
      cinematicMotion: next.cinematicMotion,
      layers: next.layers,
    })
  },
}))
