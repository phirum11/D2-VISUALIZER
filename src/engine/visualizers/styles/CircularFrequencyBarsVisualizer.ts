import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class CircularFrequencyBarsVisualizer extends Base2DVisualizer {
  public readonly id = 'circular-frequency-bars'
  public readonly name = 'Circular Frequency Bars'
  public readonly category = 'Circular'
  public readonly description = 'Full 360-degree radial frequency bars around a compass center dial with dual gradients'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(32, Math.min(128, config.barCount || 60))
    const baseRadius = Math.min(context.width, context.height) * 0.16
    const maxBarLen = Math.min(context.width, context.height) * 0.18 * config.sensitivity

    const freqs = this.sampleLogFrequencies(audioFrame, barCount, config.sensitivity)
    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    const rot = time * 0.2

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2 + rot
      const mag = freqs[i] || 0
      const len = Math.max(6, mag * maxBarLen)
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      const x1 = cosA * baseRadius
      const y1 = sinA * baseRadius
      const x2 = cosA * (baseRadius + len)
      const y2 = sinA * (baseRadius + len)

      // Radial bar gradient
      const grad = ctx2d.createLinearGradient(x1, y1, x2, y2)
      grad.addColorStop(0, config.primaryColor)
      grad.addColorStop(1, config.accentColor)

      ctx2d.strokeStyle = grad
      ctx2d.lineWidth = Math.max(2, config.thickness * 0.6)
      ctx2d.lineCap = 'round'
      ctx2d.beginPath()
      ctx2d.moveTo(x1, y1)
      ctx2d.lineTo(x2, y2)
      ctx2d.stroke()

      // Outer orbit dot at peak
      if (mag > 0.4) {
        ctx2d.fillStyle = '#ffffff'
        ctx2d.beginPath()
        ctx2d.arc(cosA * (baseRadius + len + 6), sinA * (baseRadius + len + 6), 2, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }

    // Dial ring
    ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx2d.lineWidth = 1.5
    ctx2d.beginPath()
    ctx2d.arc(0, 0, baseRadius, 0, Math.PI * 2)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
