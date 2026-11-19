import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class SpectrumBarsVisualizer extends Base2DVisualizer {
  public readonly id = 'spectrum-bars'
  public readonly name = 'Spectrum Bars'
  public readonly category = 'Spectrum'
  public readonly description = 'Classic vertical frequency bars with gradient fill, peak caps, and floor reflection'

  // Peak cap heights and decay velocity
  private peakHeights: number[] = []
  private peakVelocities: number[] = []
  private smoothedBars: number[] = []

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(16, Math.min(128, config.barCount || 48))
    const thickness = Math.max(2, config.thickness || 8)
    const spacing = Math.max(1, config.spacing || 4)
    const totalW = barCount * (thickness + spacing) - spacing
    const startX = -totalW / 2

    // Initialize arrays if barCount changed
    if (this.peakHeights.length !== barCount) {
      this.peakHeights = new Array(barCount).fill(0)
      this.peakVelocities = new Array(barCount).fill(0)
      this.smoothedBars = new Array(barCount).fill(0)
    }

    const { bassEnergy } = audioFrame
    this.applyGlow(ctx2d, config.primaryColor, config.glow, bassEnergy)

    // Sample real FFT frequencies with logarithmic distribution
    const sampledFreqs = this.sampleLogFrequencies(
      audioFrame,
      barCount,
      config.sensitivity
    )

    const maxHeight = Math.min(context.height * 0.45, 360)
    const smoothFactor = config.smoothing ?? 0.8

    for (let i = 0; i < barCount; i++) {
      const targetMag = sampledFreqs[i] || 0
      // EMA smoothing: rise fast, decay smoothly
      if (targetMag > this.smoothedBars[i]) {
        this.smoothedBars[i] = targetMag * 0.7 + this.smoothedBars[i] * 0.3
      } else {
        this.smoothedBars[i] = targetMag * (1 - smoothFactor) + this.smoothedBars[i] * smoothFactor
      }

      const barHeight = Math.max(4, this.smoothedBars[i] * maxHeight)
      const x = startX + i * (thickness + spacing)

      // Peak cap calculation
      if (barHeight >= this.peakHeights[i]) {
        this.peakHeights[i] = barHeight
        this.peakVelocities[i] = 0
      } else {
        this.peakVelocities[i] += 0.35
        this.peakHeights[i] = Math.max(0, this.peakHeights[i] - this.peakVelocities[i])
      }

      // Bar gradient fill
      const grad = ctx2d.createLinearGradient(0, 0, 0, -barHeight)
      grad.addColorStop(0, config.primaryColor)
      grad.addColorStop(1, config.accentColor)

      ctx2d.fillStyle = grad

      // Draw rounded vertical bar
      const radius = Math.min(thickness / 2, 4)
      ctx2d.beginPath()
      ctx2d.roundRect(x, -barHeight, thickness, barHeight, [radius, radius, 0, 0])
      ctx2d.fill()

      // Mirrored floor reflection with linear fade
      const reflGrad = ctx2d.createLinearGradient(0, 0, 0, barHeight * 0.35)
      reflGrad.addColorStop(0, `${config.primaryColor}55`)
      reflGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx2d.fillStyle = reflGrad
      ctx2d.beginPath()
      ctx2d.roundRect(x, 0, thickness, barHeight * 0.35, [0, 0, radius, radius])
      ctx2d.fill()

      // Draw glowing peak cap
      if (this.peakHeights[i] > 6) {
        ctx2d.save()
        ctx2d.fillStyle = '#ffffff'
        ctx2d.shadowColor = config.accentColor
        ctx2d.shadowBlur = 4
        ctx2d.beginPath()
        ctx2d.roundRect(x, -this.peakHeights[i] - 3, thickness, 2.5, 1)
        ctx2d.fill()
        ctx2d.restore()
      }
    }

    // Baseline accent glow line
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = 1.5
    ctx2d.globalAlpha = config.opacity * 0.7
    ctx2d.beginPath()
    ctx2d.moveTo(startX - 15, 0)
    ctx2d.lineTo(-startX + 15, 0)
    ctx2d.stroke()

    ctx2d.restore()
  }

  public override dispose(): void {
    this.peakHeights = []
    this.peakVelocities = []
    this.smoothedBars = []
  }
}
