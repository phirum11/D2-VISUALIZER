import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class MirroredSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'mirrored-spectrum'
  public readonly name = 'Mirrored Spectrum'
  public readonly category = '2D Spectrum'
  public readonly description = 'Symmetrical vertical bars mirrored across center baseline'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, height } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const halfBarCount = Math.max(12, Math.min(64, Math.floor((config.barCount || 48) / 2)))
    const thickness = config.thickness || 6
    const spacing = config.spacing || 4
    const halfWidth = halfBarCount * (thickness + spacing)

    const { bassEnergy } = audioFrame
    this.applyGlow(ctx2d, config.accentColor, config.glow, bassEnergy)

    // Sample frequency spectrum with logarithmic scaling
    const sampledFreqs = this.sampleLogFrequencies(
      audioFrame,
      halfBarCount,
      config.sensitivity
    )

    const maxHeight = Math.min(height * 0.35, 260)

    // Render bars symmetrically: index 0 (bass) at center, radiating outward to left and right
    for (let i = 0; i < halfBarCount; i++) {
      const mag = sampledFreqs[i] || 0
      const barHeight = Math.max(4, mag * maxHeight)
      const offset = i * (thickness + spacing)

      // Right bar position and Left bar position
      const xRight = offset
      const xLeft = -offset - thickness

      // Gradient for vertical symmetry
      const grad = ctx2d.createLinearGradient(0, -barHeight, 0, barHeight)
      grad.addColorStop(0, config.accentColor)
      grad.addColorStop(0.5, config.primaryColor)
      grad.addColorStop(1, config.accentColor)

      ctx2d.fillStyle = grad

      const radius = Math.min(thickness / 2, 3)

      // Draw Right bar (top and bottom)
      ctx2d.beginPath()
      ctx2d.roundRect(xRight, -barHeight, thickness, barHeight * 2, radius)
      ctx2d.fill()

      // Draw Left bar (top and bottom)
      ctx2d.beginPath()
      ctx2d.roundRect(xLeft, -barHeight, thickness, barHeight * 2, radius)
      ctx2d.fill()
    }

    // Center divider beam
    ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx2d.lineWidth = 1.5
    ctx2d.beginPath()
    ctx2d.moveTo(-halfWidth - 16, 0)
    ctx2d.lineTo(halfWidth + 16, 0)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
