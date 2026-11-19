import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class NeonWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'neon-waveform'
  public readonly name = 'Neon Audio Waveform'
  public readonly category = 'Neon'
  public readonly description = 'Multi-pass electric neon waveform with harmonic bloom and vibrant luminescence'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const waveData = audioFrame.normalizedTimeDomain
    const points = Math.min(waveData.length, 300)
    const totalW = context.width * 0.8
    const startX = -totalW / 2
    const stepX = totalW / (points - 1)
    const amp = Math.min(context.height * 0.35, 240) * config.sensitivity

    const pts: { x: number; y: number }[] = []
    const step = Math.floor(waveData.length / points)
    for (let i = 0; i < points; i++) {
      const val = waveData[i * step] || 0
      pts.push({ x: startX + i * stepX, y: val * amp })
    }

    // Pass 1: Outer wide diffuse glow
    ctx2d.save()
    ctx2d.shadowColor = config.primaryColor
    ctx2d.shadowBlur = (config.glow || 20) * 1.8
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = Math.max(4, config.thickness * 1.5)
    ctx2d.beginPath()
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx2d.moveTo(pts[i].x, pts[i].y)
      else ctx2d.lineTo(pts[i].x, pts[i].y)
    }
    ctx2d.stroke()
    ctx2d.restore()

    // Pass 2: Sharp high-intensity center core
    ctx2d.save()
    ctx2d.shadowColor = config.accentColor
    ctx2d.shadowBlur = 8
    ctx2d.strokeStyle = '#ffffff'
    ctx2d.lineWidth = Math.max(1.5, config.thickness * 0.4)
    ctx2d.beginPath()
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx2d.moveTo(pts[i].x, pts[i].y)
      else ctx2d.lineTo(pts[i].x, pts[i].y)
    }
    ctx2d.stroke()
    ctx2d.restore()

    ctx2d.restore()
  }
}
