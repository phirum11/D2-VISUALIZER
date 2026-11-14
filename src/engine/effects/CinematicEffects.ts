import { EffectsConfig, CinematicMotionConfig } from '@/stores/compositionStore'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'

export class CinematicEffects {
  private static instance: CinematicEffects | null = null

  // Pre-rendered noise canvas pattern for 60fps film grain without per-frame CPU noise computation
  private grainCanvas: HTMLCanvasElement | null = null
  private grainPattern: CanvasPattern | null = null
  private grainPatternWidth: number = 256
  private grainPatternHeight: number = 256

  private constructor() {
    this.createGrainPattern()
  }

  public static getInstance(): CinematicEffects {
    if (!CinematicEffects.instance) {
      CinematicEffects.instance = new CinematicEffects()
    }
    return CinematicEffects.instance
  }

  private createGrainPattern(): void {
    if (typeof document === 'undefined') return

    this.grainCanvas = document.createElement('canvas')
    this.grainCanvas.width = this.grainPatternWidth
    this.grainCanvas.height = this.grainPatternHeight
    const ctx = this.grainCanvas.getContext('2d')
    if (!ctx) return

    const imgData = ctx.createImageData(this.grainPatternWidth, this.grainPatternHeight)
    const data = imgData.data

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255)
      data[i] = val // R
      data[i + 1] = val // G
      data[i + 2] = val // B
      data[i + 3] = 40 // base alpha
    }

    ctx.putImageData(imgData, 0, 0)
    this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat')
  }

  /**
   * Computes camera motion transform matrix (scale, offsetX, offsetY) deterministically from timestamp
   */
  public getCameraMotion(
    motion: CinematicMotionConfig,
    audioFrame: AudioFrameData,
    timestamp: number
  ): { scale: number; translateX: number; translateY: number } {
    let scale = 1.0
    let translateX = 0
    let translateY = 0
    const intensity = motion.intensity || 1.0
    const { subBass, bass } = audioFrame.bands
    const bassFactor = subBass * 0.6 + bass * 0.4

    switch (motion.preset) {
      case 'slow-zoom-in':
        // Continuous slow zoom in
        scale = 1.0 + ((timestamp * 0.012 * intensity) % 0.12)
        break
      case 'slow-zoom-out':
        scale = 1.12 - ((timestamp * 0.012 * intensity) % 0.12)
        break
      case 'pan-left':
        translateX = Math.sin(timestamp * 0.3 * intensity) * 35 * intensity
        break
      case 'pan-right':
        translateX = -Math.sin(timestamp * 0.3 * intensity) * 35 * intensity
        break
      case 'vertical-pan':
        translateY = Math.sin(timestamp * 0.25 * intensity) * 25 * intensity
        break
      case 'subtle-motion':
        translateX = Math.sin(timestamp * 0.35 * intensity) * 15
        translateY = Math.cos(timestamp * 0.25 * intensity) * 12
        scale = 1.02 + Math.sin(timestamp * 0.2) * 0.02 * intensity
        break
      case 'beat-pulse':
        scale = 1.0 + bassFactor * 0.06 * intensity
        break
      case 'none':
      default:
        break
    }

    return { scale, translateX, translateY }
  }

  /**
   * Applies post-processing visual effects onto master canvas
   */
  public applyPostEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    effects: EffectsConfig,
    _audioFrame: AudioFrameData,
    timestamp: number
  ): void {
    ctx.save()

    // 1. Color Tint Overlay
    if (effects.colorTintOpacity > 0 && effects.colorTint) {
      ctx.fillStyle = effects.colorTint
      ctx.globalAlpha = Math.min(1.0, effects.colorTintOpacity / 100)
      ctx.fillRect(0, 0, width, height)
    }

    // 2. Anamorphic Light Leaks
    if (effects.lightLeaks > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const leakAlpha = (effects.lightLeaks / 100) * 0.45

      // Top-left warm leak
      const leakGrad1 = ctx.createRadialGradient(
        0,
        0,
        10,
        0,
        0,
        Math.max(width, height) * 0.65
      )
      leakGrad1.addColorStop(0, `rgba(245, 158, 11, ${leakAlpha})`)
      leakGrad1.addColorStop(0.5, `rgba(244, 63, 94, ${leakAlpha * 0.5})`)
      leakGrad1.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = leakGrad1
      ctx.fillRect(0, 0, width, height)

      // Bottom-right cool cyan leak (subtle sway)
      const leakGrad2 = ctx.createRadialGradient(
        width,
        height,
        20,
        width,
        height,
        Math.max(width, height) * 0.55
      )
      leakGrad2.addColorStop(0, `rgba(6, 182, 212, ${leakAlpha * 0.6})`)
      leakGrad2.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = leakGrad2
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }

    // 3. Cinematic Vignette
    if (effects.vignette > 0) {
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.78
      )
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
      vigGrad.addColorStop(1, `rgba(0,0,0,${effects.vignette / 100})`)
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, width, height)
    }

    // 4. Procedural Film Grain
    if (effects.grain > 0 && this.grainPattern) {
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = (effects.grain / 100) * 0.35

      // Slight animated offset per frame for organic grain jitter
      const shiftX = (Math.sin(timestamp * 45) * 50) % this.grainPatternWidth
      const shiftY = (Math.cos(timestamp * 45) * 50) % this.grainPatternHeight
      ctx.translate(shiftX, shiftY)

      ctx.fillStyle = this.grainPattern
      ctx.fillRect(-shiftX, -shiftY, width + 50, height + 50)
      ctx.restore()
    }

    // 5. Soft Lens Glow / Bloom Highlight Bleed
    if (effects.bloom > 0 || effects.softLensGlow > 0) {
      const bloomAmount = Math.max(effects.bloom, effects.softLensGlow)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = (bloomAmount / 100) * 0.15
      ctx.filter = `blur(${Math.round(bloomAmount * 0.4)}px)`
      ctx.drawImage(ctx.canvas, 0, 0, width, height)
      ctx.restore()
    }

    // 6. Chromatic Aberration (RGB shift split)
    if (effects.chromaticAberration > 0) {
      const splitDist = Math.max(1, Math.min(24, effects.chromaticAberration))
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.35

      // Red channel shift left
      ctx.drawImage(ctx.canvas, -splitDist, 0, width, height)
      // Blue channel shift right
      ctx.drawImage(ctx.canvas, splitDist, 0, width, height)
      ctx.restore()
    }

    ctx.restore()
  }
}
