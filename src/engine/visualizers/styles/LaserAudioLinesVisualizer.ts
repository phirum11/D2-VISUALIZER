import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class LaserAudioLinesVisualizer extends Base2DVisualizer {
  public readonly id = 'laser-audio-lines'
  public readonly name = 'Laser Audio Lines'
  public readonly category = 'Neon'
  public readonly description = 'High-luminance laser projector beams sweeping angular fans across the viewport'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const beamCount = Math.max(16, Math.min(64, config.barCount || 32))
    const maxLen = Math.min(context.width, context.height) * 0.45 * config.sensitivity
    const freqs = this.sampleLogFrequencies(audioFrame, beamCount, config.sensitivity)

    this.applyGlow(ctx2d, config.accentColor, config.glow + 12, audioFrame.bassEnergy)

    const fanSpread = Math.PI * 0.8
    const baseAngle = -Math.PI / 2 + Math.sin(time * 0.5) * 0.2

    for (let i = 0; i < beamCount; i++) {
      const norm = (i / (beamCount - 1)) - 0.5
      const angle = baseAngle + norm * fanSpread
      const mag = freqs[i] || 0
      const len = 40 + mag * maxLen

      const x2 = Math.cos(angle) * len
      const y2 = Math.sin(angle) * len

      // Laser beam gradient
      const grad = ctx2d.createLinearGradient(0, 0, x2, y2)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.3, config.primaryColor)
      grad.addColorStop(1, config.accentColor)

      ctx2d.strokeStyle = grad
      ctx2d.lineWidth = Math.max(1.5, config.thickness * 0.5 * (1 + mag * 0.5))
      ctx2d.beginPath()
      ctx2d.moveTo(0, 0)
      ctx2d.lineTo(x2, y2)
      ctx2d.stroke()

      // Bright laser target point
      if (mag > 0.3) {
        ctx2d.fillStyle = '#ffffff'
        ctx2d.beginPath()
        ctx2d.arc(x2, y2, 2.5, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }

    // Projector lens aperture
    ctx2d.fillStyle = '#ffffff'
    ctx2d.beginPath()
    ctx2d.arc(0, 0, 6, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }
}
