import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class NeonPulseRingsVisualizer extends Base2DVisualizer {
  public readonly id = 'neon-pulse-rings'
  public readonly name = 'Neon Shockwave Rings'
  public readonly category = 'Radial'
  public readonly description = 'Concentric electric neon shockwaves exploding outward on bass impacts'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const maxRadius = Math.min(width, height) * 0.38
    const ringCount = 8
    const { subBass, bass } = audioFrame.bands
    const bassImpact = subBass * 0.7 + bass * 0.3
    const freqs = audioFrame.normalizedFrequencies

    this.applyGlow(ctx2d, config.accentColor, config.glow * 1.25, bassImpact)

    for (let i = 0; i < ringCount; i++) {
      const phase = ((i / ringCount) + (time * 0.6) + bassImpact * 0.15) % 1.0
      const radius = 20 + phase * maxRadius
      const alpha = (1 - phase) * config.opacity

      const bin = Math.min(freqs.length - 1, Math.floor(i * 12))
      const mag = (freqs[bin] || 0) * config.sensitivity

      ctx2d.beginPath()
      const segments = 48
      const step = (Math.PI * 2) / segments

      for (let s = 0; s <= segments; s++) {
        const a = s * step
        const ripple = Math.sin(a * 6 + time * 4) * (mag * 12)
        const r = radius + ripple
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r

        if (s === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      }
      ctx2d.closePath()

      ctx2d.strokeStyle = i % 2 === 0 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = Math.max(1.5, (config.thickness || 4) * (1 - phase * 0.5))
      ctx2d.globalAlpha = alpha
      ctx2d.stroke()

      // Micro ticks radiating from ring
      if (i % 2 === 0 && phase > 0.3) {
        ctx2d.strokeStyle = '#ffffff'
        ctx2d.lineWidth = 1
        ctx2d.globalAlpha = alpha * 0.6
        for (let t = 0; t < 12; t++) {
          const ta = (t * Math.PI * 2) / 12 + time * 0.5
          const x1 = Math.cos(ta) * radius
          const y1 = Math.sin(ta) * radius
          const x2 = Math.cos(ta) * (radius + 6 + mag * 10)
          const y2 = Math.sin(ta) * (radius + 6 + mag * 10)
          ctx2d.beginPath()
          ctx2d.moveTo(x1, y1)
          ctx2d.lineTo(x2, y2)
          ctx2d.stroke()
        }
      }
    }

    // High energy center core
    ctx2d.globalAlpha = 1
    const coreRad = 16 * (1 + bassImpact * 0.5)
    ctx2d.fillStyle = config.primaryColor
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRad, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.fillStyle = '#ffffff'
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRad * 0.45, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }
}
