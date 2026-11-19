import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class FloatingSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'floating-spectrum'
  public readonly name = 'Floating Spectrum'
  public readonly category = 'Spectrum'
  public readonly description = 'Detached floating rounded pill bars bobbing dynamically on harmonic waves'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(16, Math.min(96, config.barCount || 40))
    const thickness = config.thickness || 8
    const spacing = config.spacing || 6
    const totalW = barCount * (thickness + spacing) - spacing
    const startX = -totalW / 2

    const freqs = this.sampleLogFrequencies(audioFrame, barCount, config.sensitivity)
    const maxHeight = Math.min(context.height * 0.4, 300)

    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    for (let i = 0; i < barCount; i++) {
      const mag = freqs[i] || 0
      const x = startX + i * (thickness + spacing)
      const pillHeight = Math.max(8, mag * maxHeight)
      // Floating sinusoidal bobbing offset
      const floatOffset = Math.sin(time * 2 + i * 0.15) * 12 * (1 + mag)
      const y = -pillHeight / 2 + floatOffset

      const grad = ctx2d.createLinearGradient(0, y - pillHeight / 2, 0, y + pillHeight / 2)
      grad.addColorStop(0, config.accentColor)
      grad.addColorStop(1, config.primaryColor)

      ctx2d.fillStyle = grad
      ctx2d.beginPath()
      ctx2d.roundRect(x, y - pillHeight / 2, thickness, pillHeight, thickness / 2)
      ctx2d.fill()

      // Small secondary mirrored pill with lower opacity
      const mirrorY = -y + 40
      ctx2d.save()
      ctx2d.globalAlpha = config.opacity * 0.35
      ctx2d.fillStyle = config.accentColor
      ctx2d.beginPath()
      ctx2d.roundRect(x, mirrorY, thickness, pillHeight * 0.4, thickness / 2)
      ctx2d.fill()
      ctx2d.restore()
    }

    ctx2d.restore()
  }
}
