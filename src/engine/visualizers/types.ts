import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'
import { VisualizerConfig, EffectsConfig } from '@/stores/compositionStore'

export type VisualizerCategory =
  | '2D Spectrum'
  | 'Circular'
  | 'Waveform'
  | '3D / WebGL'
  | 'Particles'

export type VisualizerRenderType = '2d' | '3d'

export interface VisualizerRenderContext {
  canvas: HTMLCanvasElement
  ctx2d?: CanvasRenderingContext2D
  audioFrame: AudioFrameData
  config: VisualizerConfig
  effects: EffectsConfig
  time: number
  width: number
  height: number
  dpr: number
}

export interface IVisualizerPlugin {
  readonly id: string
  readonly name: string
  readonly category: VisualizerCategory
  readonly renderType: VisualizerRenderType
  readonly description: string

  /**
   * Initializes the visualizer.
   * For 2D visualizers, container can be the canvas.
   * For 3D WebGL visualizers, container is the parent DOM element hosting the Three.js WebGL canvas.
   */
  init(container: HTMLElement | HTMLCanvasElement): void

  /**
   * Renders a single frame. Invoked within requestAnimationFrame or offline video export pipeline.
   */
  render(context: VisualizerRenderContext): void

  /**
   * Handles resizing of the viewport/canvas.
   */
  resize(width: number, height: number): void

  /**
   * Releases WebGL contexts, geometries, textures, and event listeners.
   */
  dispose(): void
}
