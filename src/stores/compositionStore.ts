import { create } from 'zustand'
import { OverlayElement } from '@/engine/overlay/types'
import { TYPOGRAPHY_PRESETS } from '@/engine/overlay/presets'

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
  overlays: OverlayElement[]
  activeOverlayId: string | null

  // History for Undo / Redo
  past: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
    ambientParticles: AmbientParticlesConfig
    cinematicMotion: CinematicMotionConfig
    layers: VisualLayer[]
    overlays: OverlayElement[]
  }>
  future: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
    ambientParticles: AmbientParticlesConfig
    cinematicMotion: CinematicMotionConfig
    layers: VisualLayer[]
    overlays: OverlayElement[]
  }>

  // Actions
  updateVisualizer: (patch: Partial<VisualizerConfig>) => void
  updateBackground: (patch: Partial<BackgroundConfig>) => void
  updateText: (patch: Partial<TextConfig>) => void
  updateEffects: (patch: Partial<EffectsConfig>) => void
  updateAmbientParticles: (patch: Partial<AmbientParticlesConfig>) => void
  updateCinematicMotion: (patch: Partial<CinematicMotionConfig>) => void

  // Overlay Actions
  addOverlay: (overlay: OverlayElement) => void
  updateOverlay: (id: string, patch: Partial<OverlayElement>) => void
  removeOverlay: (id: string) => void
  duplicateOverlay: (id: string) => void
  reorderOverlays: (fromIndex: number, toIndex: number) => void
  applyTypographyPreset: (presetId: string) => void
  setActiveOverlay: (id: string | null) => void
  resetOverlays: () => void

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

const initialOverlays: OverlayElement[] = [
  {
    id: 'overlay-title',
    name: 'Song Title',
    type: 'text',
    role: 'title',
    text: 'Midnight Resonance',
    fontFamily: 'Montserrat',
    fontSize: 34,
    fontWeight: '700',
    fontStyle: 'normal',
    color: '#ffffff',
    alignment: 'center',
    letterSpacing: 4,
    lineHeight: 1.2,
    positionX: 0,
    positionY: -22,
    scale: 1,
    rotation: 0,
    opacity: 1,
    shadowColor: 'rgba(0,0,0,0.85)',
    shadowBlur: 14,
    shadowOffsetX: 0,
    shadowOffsetY: 3,
    outlineColor: '',
    outlineWidth: 0,
    glowColor: '#6366f1',
    glowBlur: 10,
    bgBox: false,
    bgBoxColor: '#000000',
    bgBoxPadding: 8,
    bgBoxRadius: 4,
    bgBoxOpacity: 0.5,
    startTime: 0,
    endTime: 0,
    animation: {
      preset: 'tracking-reveal',
      startTime: 0,
      duration: 1.2,
      delay: 0.2,
      easing: 'ease-out',
      intensity: 1,
    },
    visible: true,
    locked: false,
  },
  {
    id: 'overlay-artist',
    name: 'Artist Name',
    type: 'text',
    role: 'artist',
    text: 'Starlight Echoes',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    color: 'rgba(255, 255, 255, 0.85)',
    alignment: 'center',
    letterSpacing: 3,
    lineHeight: 1.2,
    positionX: 0,
    positionY: -15,
    scale: 1,
    rotation: 0,
    opacity: 0.9,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    outlineColor: '',
    outlineWidth: 0,
    glowColor: '',
    glowBlur: 0,
    bgBox: false,
    bgBoxColor: '',
    bgBoxPadding: 0,
    bgBoxRadius: 0,
    bgBoxOpacity: 0,
    startTime: 0,
    endTime: 0,
    animation: {
      preset: 'fade-in',
      startTime: 0,
      duration: 1.0,
      delay: 0.5,
      easing: 'ease-out',
      intensity: 1,
    },
    visible: true,
    locked: false,
  },
  {
    id: 'overlay-subtitle',
    name: 'Official Audio Tag',
    type: 'text',
    role: 'subtitle',
    text: 'OFFICIAL AUDIO VISUALIZER',
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'normal',
    color: '#06b6d4',
    alignment: 'center',
    letterSpacing: 4,
    lineHeight: 1.2,
    positionX: 0,
    positionY: -9,
    scale: 1,
    rotation: 0,
    opacity: 0.85,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 6,
    shadowOffsetX: 0,
    shadowOffsetY: 1,
    outlineColor: '',
    outlineWidth: 0,
    glowColor: '#06b6d4',
    glowBlur: 8,
    bgBox: false,
    bgBoxColor: '',
    bgBoxPadding: 0,
    bgBoxRadius: 0,
    bgBoxOpacity: 0,
    startTime: 0,
    endTime: 0,
    animation: {
      preset: 'fade-in',
      startTime: 0,
      duration: 0.8,
      delay: 0.8,
      easing: 'ease-out',
      intensity: 1,
    },
    visible: true,
    locked: false,
  },
]

export const useCompositionStore = create<CompositionState>((set, get) => ({
  visualizer: initialVisualizer,
  background: initialBackground,
  text: initialText,
  effects: initialEffects,
  ambientParticles: initialAmbientParticles,
  cinematicMotion: initialCinematicMotion,
  layers: initialLayers,
  overlays: initialOverlays,
  activeOverlayId: 'overlay-title',
  past: [],
  future: [],

  updateVisualizer: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      visualizer: { ...visualizer, ...patch },
    })
  },

  updateBackground: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      background: { ...background, ...patch },
    })
  },

  updateText: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    const updatedText = { ...text, ...patch }
    // Keep overlays in sync when text fields change
    const updatedOverlays = overlays.map((ov) => {
      if (ov.type === 'text') {
        if (ov.role === 'title' && patch.songTitle !== undefined) {
          return { ...ov, text: patch.songTitle }
        }
        if (ov.role === 'artist' && patch.artistName !== undefined) {
          return { ...ov, text: patch.artistName }
        }
        if (ov.role === 'subtitle' && patch.subtitle !== undefined) {
          return { ...ov, text: patch.subtitle }
        }
        if (patch.fontFamily !== undefined) {
          return { ...ov, fontFamily: patch.fontFamily }
        }
      }
      return ov
    })

    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      text: updatedText,
      overlays: updatedOverlays,
    })
  },

  updateEffects: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      effects: { ...effects, ...patch },
    })
  },

  updateAmbientParticles: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      ambientParticles: { ...ambientParticles, ...patch },
    })
  },

  updateCinematicMotion: (patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      cinematicMotion: { ...cinematicMotion, ...patch },
    })
  },

  addOverlay: (overlay) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      overlays: [...overlays, overlay],
      activeOverlayId: overlay.id,
    })
  },

  updateOverlay: (id, patch) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    const updatedOverlays = overlays.map((ov) => (ov.id === id ? ({ ...ov, ...patch } as OverlayElement) : ov))
    
    // Also sync back to text if changing role title/artist
    let updatedText = { ...text }
    const target = updatedOverlays.find((o) => o.id === id)
    if (target && target.type === 'text') {
      if (target.role === 'title') updatedText.songTitle = target.text
      if (target.role === 'artist') updatedText.artistName = target.text
      if (target.role === 'subtitle') updatedText.subtitle = target.text
    }

    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      overlays: updatedOverlays,
      text: updatedText,
    })
  },

  removeOverlay: (id) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past, activeOverlayId } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      overlays: overlays.filter((ov) => ov.id !== id),
      activeOverlayId: activeOverlayId === id ? null : activeOverlayId,
    })
  },

  duplicateOverlay: (id) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    const target = overlays.find((ov) => ov.id === id)
    if (!target) return
    const duplicated: OverlayElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}-${Date.now()}`,
      name: `${target.name} (Copy)`,
      positionY: (target as any).positionY !== undefined ? (target as any).positionY + 5 : 0,
    }
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      overlays: [...overlays, duplicated],
      activeOverlayId: duplicated.id,
    })
  },

  reorderOverlays: (fromIndex, toIndex) => {
    set((s) => {
      const updated = [...s.overlays]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return { overlays: updated }
    })
  },

  applyTypographyPreset: (presetId) => {
    const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays, past } = get()
    const preset = TYPOGRAPHY_PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    const newOverlays = preset.generateOverlays(text.songTitle, text.artistName, text.subtitle)
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: [],
      overlays: newOverlays,
      activeOverlayId: newOverlays[0]?.id || null,
    })
  },

  setActiveOverlay: (id) => {
    set({ activeOverlayId: id })
  },

  resetOverlays: () => {
    set({ overlays: initialOverlays, activeOverlayId: initialOverlays[0]?.id || null })
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
    const { past, future, visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    set({
      past: newPast,
      future: [{ visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }, ...future],
      visualizer: previous.visualizer,
      background: previous.background,
      text: previous.text,
      effects: previous.effects,
      ambientParticles: previous.ambientParticles,
      cinematicMotion: previous.cinematicMotion,
      layers: previous.layers,
      overlays: previous.overlays || initialOverlays,
    })
  },

  redo: () => {
    const { past, future, visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays } = get()
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    set({
      past: [...past, { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers, overlays }],
      future: newFuture,
      visualizer: next.visualizer,
      background: next.background,
      text: next.text,
      effects: next.effects,
      ambientParticles: next.ambientParticles,
      cinematicMotion: next.cinematicMotion,
      layers: next.layers,
      overlays: next.overlays || initialOverlays,
    })
  },
}))
