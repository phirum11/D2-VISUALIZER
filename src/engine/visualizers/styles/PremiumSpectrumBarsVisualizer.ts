import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class PremiumSpectrumBarsVisualizer extends Base2DVisualizer {
  public readonly id = 'premium-spectrum-bars'
  public readonly name = 'Premium Spectrum Bars'
  public readonly category = 'Spectrum'
  public readonly description = 'Multi-segmented LED master equalizer with dynamic peak physics and glowing caps'

  private peakHeights: number[] = []
  private peakVelocities: number[] = []

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(16, Math.min(128, config.barCount || 48))
    const thickness = config.thickness || 8
    const spacing = config.spacing || 4
    const totalW = barCount * (thickness + spacing) - spacing
    const startX = -totalW / 2

    if (this.peakHeights.length !== barCount) {
      this.peakHeights = new Array(barCount).fill(0)
      this.peakVelocities = new Array(barCount).fill(0)
    }

    const { bassEnergy } = audioFrame
    this.applyGlow(ctx2d, config.primaryColor, config.glow, bassEnergy)

    const freqs = this.sampleLogFrequencies(audioFrame, barCount, config.sensitivity)
    const maxHeight = Math.min(context.height * 0.45, 360)
    const segmentHeight = 4
    const segmentGap = 2
    const totalSegStep = segmentHeight + segmentGap

    for (let i = 0; i < barCount; i++) {
      const mag = freqs[i] || 0
      const barHeight = Math.max(6, mag * maxHeight)
      const x = startX + i * (thickness + spacing)

      // Peak physics
      if (barHeight >= this.peakHeights[i]) {
        this.peakHeights[i] = barHeight
        this.peakVelocities[i] = 0
      } else {
        this.peakVelocities[i] += 0.45
        this.peakHeights[i] = Math.max(0, this.peakHeights[i] - this.peakVelocities[i])
      }

      // Draw segmented LED stack
      const numSegments = Math.floor(barHeight / totalSegStep)
      for (let s = 0; s < numSegments; s++) {
        const segY = -(s * totalSegStep + segmentHeight)
        const progress = s / Math.max(1, maxHeight / totalSegStep)
        
        ctx2d.fillStyle = progress > 0.8 ? config.accentColor : config.primaryColor
        ctx2d.beginPath()
        ctx2d.roundRect(x, segY, thickness, segmentHeight, 1.5)
        ctx2d.fill()
      }

      // Draw glowing floating peak cap
      if (this.peakHeights[i] > 6) {
        ctx2d.save()
        ctx2d.shadowColor = config.accentColor
        ctx2d.shadowBlur = 8
        ctx2d.fillStyle = '#ffffff'
        ctx2d.beginPath()
        ctx2d.roundRect(x, -this.peakHeights[i] - 5, thickness, 3, 1)
        ctx2d.fill()
        ctx2d.restore()
      }
    }

    // Baseline mirror reflection
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = 1.5
    ctx2d.globalAlpha = config.opacity * 0.6
    ctx2d.beginPath()
    ctx2d.moveTo(startX - 15, 0)
    ctx2d.lineTo(-startX + 15, 0)
    ctx2d.stroke()

    ctx2d.restore()
  }

  public override dispose(): void {
    this.peakHeights = []
    this.peakVelocities = []
  }
}
