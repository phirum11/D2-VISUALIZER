import {
  IVisualizerPlugin,
  VisualizerCategory,
  VisualizerRenderType,
  VisualizerRenderContext,
} from '../types'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'

export abstract class Base2DVisualizer implements IVisualizerPlugin {
  public abstract readonly id: string
  public abstract readonly name: string
  public abstract readonly category: VisualizerCategory
  public readonly renderType: VisualizerRenderType = '2d'
  public abstract readonly description: string

  public init(_container: HTMLElement | HTMLCanvasElement): void {
    // 2D visualizers receive the canvas context directly per frame in render()
  }

  public abstract render(context: VisualizerRenderContext): void

  public resize(_width: number, _height: number): void {
    // Canvas dimensions are passed dynamically in render()
  }

  public dispose(): void {
    // Cleanup if needed by subclass
  }

  /**
   * Applies standard visualizer coordinate transformation (position, rotation, beat scale, opacity).
   * Returns calculated center coordinates [centerX, centerY].
   */
  protected applyTransform(
    ctx: CanvasRenderingContext2D,
    context: VisualizerRenderContext
  ): { centerX: number; centerY: number; beatScale: number } {
    const { width: w, height: h, config, effects, audioFrame } = context
    const centerX = w / 2 + (config.positionX / 100) * w
    const centerY = h / 2 + (config.positionY / 100) * h

    const { subBass, bass } = audioFrame.bands
    const beatScale =
      effects.beatPulse > 0
        ? 1 + (subBass * 0.45 + bass * 0.25) * (effects.beatPulse / 100)
        : 1

    ctx.translate(centerX, centerY)
    ctx.scale(config.scale * beatScale, config.scale * beatScale)
    ctx.rotate((config.rotation * Math.PI) / 180)
    ctx.globalAlpha = config.opacity

    return { centerX, centerY, beatScale }
  }

  /**
   * Configures canvas glow driven by configuration and audio bass
   */
  protected applyGlow(
    ctx: CanvasRenderingContext2D,
    color: string,
    glowAmount: number,
    bassIntensity: number = 0
  ): void {
    if (glowAmount > 0) {
      ctx.shadowColor = color
      ctx.shadowBlur = glowAmount * (0.6 + bassIntensity * 0.8)
    } else {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
  }

  /**
   * Samples frequency spectrum array with logarithmic perceptual distribution
   */
  protected sampleLogFrequencies(
    audioFrame: AudioFrameData,
    targetCount: number,
    sensitivity: number = 1.0
  ): number[] {
    const freqs = audioFrame.normalizedFrequencies
    const totalBins = freqs.length
    const result: number[] = new Array(targetCount)

    for (let i = 0; i < targetCount; i++) {
      // Logarithmic bin distribution
      const normIndex = i / (targetCount - 1 || 1)
      const binIndex = Math.min(
        totalBins - 1,
        Math.floor(Math.pow(normIndex, 1.6) * totalBins * 0.75)
      )
      const val = (freqs[binIndex] || 0) * sensitivity
      result[i] = Math.min(1.0, val)
    }

    return result
  }
}
