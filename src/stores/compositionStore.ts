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

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'video'
  color1: string
  color2: string
  gradientAngle: number
  blur: number
  brightness: number
  opacity: number
  scale: number
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
  vignette: number
  grain: number
  particles: number
  beatPulse: number
  chromaticAberration: number
}

export interface CompositionState {
  visualizer: VisualizerConfig
  background: BackgroundConfig
  text: TextConfig
  effects: EffectsConfig

  // History for Undo / Redo
  past: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
  }>
  future: Array<{
    visualizer: VisualizerConfig
    background: BackgroundConfig
    text: TextConfig
    effects: EffectsConfig
  }>

  // Actions
  updateVisualizer: (patch: Partial<VisualizerConfig>) => void
  updateBackground: (patch: Partial<BackgroundConfig>) => void
  updateText: (patch: Partial<TextConfig>) => void
  updateEffects: (patch: Partial<EffectsConfig>) => void
  resetVisualizerSection: () => void
  resetTransform: () => void
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
  color1: '#0f172a',
  color2: '#020617',
  gradientAngle: 135,
  blur: 0,
  brightness: 1,
  opacity: 1,
  scale: 1,
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
  vignette: 40,
  grain: 10,
  particles: 25,
  beatPulse: 50,
  chromaticAberration: 0,
}

export const useCompositionStore = create<CompositionState>((set, get) => ({
  visualizer: initialVisualizer,
  background: initialBackground,
  text: initialText,
  effects: initialEffects,
  past: [],
  future: [],

  updateVisualizer: (patch) => {
    const { visualizer, background, text, effects, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects }],
      future: [],
      visualizer: { ...visualizer, ...patch },
    })
  },

  updateBackground: (patch) => {
    const { visualizer, background, text, effects, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects }],
      future: [],
      background: { ...background, ...patch },
    })
  },

  updateText: (patch) => {
    const { visualizer, background, text, effects, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects }],
      future: [],
      text: { ...text, ...patch },
    })
  },

  updateEffects: (patch) => {
    const { visualizer, background, text, effects, past } = get()
    set({
      past: [...past.slice(-20), { visualizer, background, text, effects }],
      future: [],
      effects: { ...effects, ...patch },
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

  undo: () => {
    const { past, future, visualizer, background, text, effects } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    set({
      past: newPast,
      future: [{ visualizer, background, text, effects }, ...future],
      visualizer: previous.visualizer,
      background: previous.background,
      text: previous.text,
      effects: previous.effects,
    })
  },

  redo: () => {
    const { past, future, visualizer, background, text, effects } = get()
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    set({
      past: [...past, { visualizer, background, text, effects }],
      future: newFuture,
      visualizer: next.visualizer,
      background: next.background,
      text: next.text,
      effects: next.effects,
    })
  },
}))
