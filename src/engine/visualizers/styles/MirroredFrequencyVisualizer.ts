import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class MirroredFrequencyVisualizer extends Base2DVisualizer {
  public readonly id = 'mirrored-frequency-spectrum'
  public readonly name = 'Mirrored Frequency Spectrum'
  public readonly category = 'Spectrum'
  public readonly description = 'Symmetrical dual-axis frequency spectrum radiating vertically with neon center glow'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(20, Math.min(100, config.barCount || 48))
    const thickness = config.thickness || 6
    const spacing = config.spacing || 3
    const totalW = barCount * (thickness + spacing) - spacing
    const startX = -totalW / 2

    const freqs = this.sampleLogFrequencies(audioFrame, barCount, config.sensitivity)
    const maxHeight = Math.min(context.height * 0.35, 260)

    this.applyGlow(ctx2d, config.accentColor, config.glow, audioFrame.bassEnergy)

    // Center divider beam
    ctx2d.strokeStyle = '#ffffff'
    ctx2d.lineWidth = 2
    ctx2d.beginPath()
    ctx2d.moveTo(startX - 20, 0)
    ctx2d.lineTo(-startX + 20, 0)
    ctx2d.stroke()

    for (let i = 0; i < barCount; i++) {
      const mag = freqs[i] || 0
      const h = Math.max(4, mag * maxHeight)
      const x = startX + i * (thickness + spacing)

      // Gradient top half
      const gradUp = ctx2d.createLinearGradient(0, 0, 0, -h)
      gradUp.addColorStop(0, config.primaryColor)
      gradUp.addColorStop(1, config.accentColor)
      ctx2d.fillStyle = gradUp
      ctx2d.beginPath()
      ctx2d.roundRect(x, -h, thickness, h, [thickness / 2, thickness / 2, 0, 0])
      ctx2d.fill()

      // Gradient bottom mirrored half
      const gradDown = ctx2d.createLinearGradient(0, 0, 0, h)
      gradDown.addColorStop(0, config.primaryColor)
      gradDown.addColorStop(1, config.accentColor)
      ctx2d.fillStyle = gradDown
      ctx2d.beginPath()
      ctx2d.roundRect(x, 0, thickness, h, [0, 0, thickness / 2, thickness / 2])
      ctx2d.fill()
    }

    ctx2d.restore()
  }
}
