import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class SmoothOscilloscopeVisualizer extends Base2DVisualizer {
  public readonly id = 'smooth-oscilloscope'
  public readonly name = 'Smooth Oscilloscope'
  public readonly category = 'Minimal'
  public readonly description = 'CRT vector analog oscilloscope trace with phosphor trail simulation'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const waveData = audioFrame.normalizedTimeDomain
    const points = Math.min(waveData.length, 180)
    const totalW = context.width * 0.7
    const startX = -totalW / 2
    const stepX = totalW / (points - 1)
    const amp = Math.min(context.height * 0.28, 180) * config.sensitivity

    const pts: { x: number; y: number }[] = []
    const step = Math.floor(waveData.length / points)
    for (let i = 0; i < points; i++) {
      const val = waveData[i * step] || 0
      pts.push({ x: startX + i * stepX, y: val * amp })
    }

    // Reticle circular boundary
    const radius = Math.min(totalW / 2, 240)
    ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx2d.lineWidth = 1
    ctx2d.beginPath()
    ctx2d.arc(0, 0, radius, 0, Math.PI * 2)
    ctx2d.stroke()

    // Phosphor green/cyan CRT vector glow
    this.applyGlow(ctx2d, config.accentColor, config.glow + 10, audioFrame.bassEnergy)

    // Smooth Bezier spline
    ctx2d.strokeStyle = config.accentColor
    ctx2d.lineWidth = Math.max(1.5, config.thickness * 0.5)
    ctx2d.beginPath()
    ctx2d.moveTo(pts[0].x, pts[0].y)
    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2
      const yc = (pts[i].y + pts[i + 1].y) / 2
      ctx2d.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    const last = pts[pts.length - 1]
    ctx2d.lineTo(last.x, last.y)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
