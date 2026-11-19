import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class EqualizerColumnsVisualizer extends Base2DVisualizer {
  public readonly id = 'equalizer-columns'
  public readonly name = 'Equalizer Columns'
  public readonly category = 'Spectrum'
  public readonly description = 'Discrete retro-mastering studio VU columns with progressive color thresholds'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const cols = Math.max(16, Math.min(64, config.barCount || 32))
    const colWidth = Math.max(6, config.thickness * 1.5)
    const spacing = Math.max(3, config.spacing)
    const totalW = cols * (colWidth + spacing) - spacing
    const startX = -totalW / 2

    const freqs = this.sampleLogFrequencies(audioFrame, cols, config.sensitivity)
    const maxSegments = 24
    const segH = 5
    const segGap = 2

    for (let c = 0; c < cols; c++) {
      const mag = freqs[c] || 0
      const activeSegs = Math.floor(mag * maxSegments)
      const x = startX + c * (colWidth + spacing)

      for (let s = 0; s < maxSegments; s++) {
        const y = -(s * (segH + segGap) + segH)
        const isActive = s <= activeSegs

        if (isActive) {
          if (s > maxSegments * 0.85) {
            ctx2d.fillStyle = '#ef4444' // Red clip
          } else if (s > maxSegments * 0.65) {
            ctx2d.fillStyle = '#f59e0b' // Amber warm
          } else {
            ctx2d.fillStyle = config.primaryColor // Normal
          }
        } else {
          ctx2d.fillStyle = 'rgba(255, 255, 255, 0.05)' // Inactive slot
        }

        ctx2d.fillRect(x, y, colWidth, segH)
      }
    }

    ctx2d.restore()
  }
}
