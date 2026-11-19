import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class DualRingSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'dual-ring-spectrum'
  public readonly name = 'Dual Ring Spectrum'
  public readonly category = 'Circular'
  public readonly description = 'Counter-rotating concentric spectrum rings with inward and outward frequency teeth'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(32, Math.min(128, config.barCount || 64))
    const baseRadius = Math.min(context.width, context.height) * 0.18
    const maxBarLen = Math.min(context.width, context.height) * 0.12 * config.sensitivity

    const freqs = this.sampleLogFrequencies(audioFrame, barCount, config.sensitivity)
    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    const rotOuter = time * 0.35
    const rotInner = -time * 0.35

    // Outer Ring: Frequency bars radiating outward
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2 + rotOuter
      const mag = freqs[i] || 0
      const len = Math.max(4, mag * maxBarLen)
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      const x1 = cosA * (baseRadius + 15)
      const y1 = sinA * (baseRadius + 15)
      const x2 = cosA * (baseRadius + 15 + len)
      const y2 = sinA * (baseRadius + 15 + len)

      ctx2d.strokeStyle = config.primaryColor
      ctx2d.lineWidth = Math.max(2, config.thickness * 0.5)
      ctx2d.beginPath()
      ctx2d.moveTo(x1, y1)
      ctx2d.lineTo(x2, y2)
      ctx2d.stroke()
    }

    // Inner Ring: Frequency bars radiating inward
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2 + rotInner
      const mag = freqs[(i + Math.floor(barCount / 2)) % barCount] || 0
      const len = Math.max(3, mag * maxBarLen * 0.7)
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      const x1 = cosA * baseRadius
      const y1 = sinA * baseRadius
      const x2 = cosA * Math.max(10, baseRadius - len)
      const y2 = sinA * Math.max(10, baseRadius - len)

      ctx2d.strokeStyle = config.accentColor
      ctx2d.lineWidth = Math.max(1.5, config.thickness * 0.4)
      ctx2d.beginPath()
      ctx2d.moveTo(x1, y1)
      ctx2d.lineTo(x2, y2)
      ctx2d.stroke()
    }

    // Concentric base circles
    ctx2d.strokeStyle = '#ffffff'
    ctx2d.lineWidth = 1.5
    ctx2d.beginPath()
    ctx2d.arc(0, 0, baseRadius + 15, 0, Math.PI * 2)
    ctx2d.stroke()

    ctx2d.beginPath()
    ctx2d.arc(0, 0, baseRadius, 0, Math.PI * 2)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
