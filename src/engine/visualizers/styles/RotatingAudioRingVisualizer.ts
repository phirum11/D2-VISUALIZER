import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class RotatingAudioRingVisualizer extends Base2DVisualizer {
  public readonly id = 'rotating-audio-ring'
  public readonly name = 'Rotating Audio Ring'
  public readonly category = 'Radial'
  public readonly description = 'Segmented radial dash wheel accelerating dynamically with transient rhythm and tempo'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const baseRadius = Math.min(context.width, context.height) * 0.2
    const segments = Math.max(16, Math.min(64, config.barCount || 36))
    const { bass, treble } = audioFrame.bands
    const rotSpeed = time * 0.8 * (1 + bass * 1.5)

    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    const freqs = this.sampleLogFrequencies(audioFrame, segments, config.sensitivity)

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotSpeed
      const mag = freqs[i] || 0
      const arcLen = (Math.PI * 2) / segments * 0.65 * (1 + mag * 0.8)
      const r = baseRadius + mag * 40 * config.sensitivity

      ctx2d.strokeStyle = i % 2 === 0 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = Math.max(3, config.thickness * (0.8 + mag * 0.6))
      ctx2d.lineCap = 'round'
      ctx2d.beginPath()
      ctx2d.arc(0, 0, r, angle, angle + arcLen)
      ctx2d.stroke()
    }

    // Secondary inner counter-spinning ticker
    const innerSegments = 12
    const innerSpeed = -time * 1.2
    for (let i = 0; i < innerSegments; i++) {
      const angle = (i / innerSegments) * Math.PI * 2 + innerSpeed
      const x = Math.cos(angle) * (baseRadius * 0.6)
      const y = Math.sin(angle) * (baseRadius * 0.6)

      ctx2d.fillStyle = '#ffffff'
      ctx2d.beginPath()
      ctx2d.arc(x, y, 2.5 + treble * 3, 0, Math.PI * 2)
      ctx2d.fill()
    }

    ctx2d.restore()
  }
}
