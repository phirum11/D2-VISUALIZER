import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class DigitalGridSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'digital-grid-spectrum'
  public readonly name = 'Digital Grid Spectrum'
  public readonly category = 'Geometric'
  public readonly description = 'Cyberpunk 3D perspective wireframe horizon runway with rolling audio frequency undulations'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const cols = 28
    const rows = 16
    const freqs = this.sampleLogFrequencies(audioFrame, cols, config.sensitivity)

    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    const horizonY = -60
    const bottomY = 180
    const topW = 120
    const bottomW = Math.min(context.width * 0.85, 750)

    // Draw perspective columns (rays)
    for (let c = 0; c <= cols; c++) {
      const t = c / cols
      const topX = -topW / 2 + t * topW
      const botX = -bottomW / 2 + t * bottomW

      ctx2d.strokeStyle = `${config.primaryColor}55`
      ctx2d.lineWidth = 1
      ctx2d.beginPath()
      ctx2d.moveTo(topX, horizonY)
      ctx2d.lineTo(botX, bottomY)
      ctx2d.stroke()
    }

    // Draw horizontal undulating audio wave rows
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1)
      const depth = Math.pow(t, 1.8) // Perspective compression
      const y = horizonY + depth * (bottomY - horizonY)
      const currentW = topW + depth * (bottomW - topW)
      const startX = -currentW / 2
      const stepX = currentW / cols

      ctx2d.beginPath()
      for (let c = 0; c <= cols; c++) {
        const mag = freqs[c % cols] || 0
        const wave = Math.sin(time * 3 + r * 0.4 + c * 0.3) * (mag * 35 * depth)
        const x = startX + c * stepX
        const finalY = y - wave

        if (c === 0) ctx2d.moveTo(x, finalY)
        else ctx2d.lineTo(x, finalY)
      }

      ctx2d.strokeStyle = r === rows - 1 ? config.accentColor : config.primaryColor
      ctx2d.lineWidth = Math.max(1, depth * 2.5)
      ctx2d.stroke()
    }

    ctx2d.restore()
  }
}
