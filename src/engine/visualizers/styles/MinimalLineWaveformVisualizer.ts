import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class MinimalLineWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'minimal-line-waveform'
  public readonly name = 'Minimal Line Waveform'
  public readonly category = 'Minimal'
  public readonly description = 'Architectural ultra-sleek hairline waveform with precision peak dots and minimalist poise'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const waveData = audioFrame.normalizedTimeDomain
    const points = Math.min(waveData.length, 160)
    const totalW = context.width * 0.7
    const startX = -totalW / 2
    const stepX = totalW / (points - 1)
    const amp = Math.min(context.height * 0.25, 160) * config.sensitivity

    const step = Math.floor(waveData.length / points)
    const pts: { x: number; y: number; val: number }[] = []

    for (let i = 0; i < points; i++) {
      const val = waveData[i * step] || 0
      pts.push({ x: startX + i * stepX, y: val * amp, val })
    }

    // Baseline reference line
    ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx2d.lineWidth = 1
    ctx2d.beginPath()
    ctx2d.moveTo(startX, 0)
    ctx2d.lineTo(-startX, 0)
    ctx2d.stroke()

    // Clean hairline waveform
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = Math.max(1.2, config.thickness * 0.3)
    ctx2d.beginPath()
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx2d.moveTo(pts[i].x, pts[i].y)
      else ctx2d.lineTo(pts[i].x, pts[i].y)
    }
    ctx2d.stroke()

    // Precision dots at prominent peaks
    ctx2d.fillStyle = config.accentColor
    for (let i = 0; i < pts.length; i += 6) {
      if (Math.abs(pts[i].val) > 0.15) {
        ctx2d.beginPath()
        ctx2d.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }

    ctx2d.restore()
  }
}
