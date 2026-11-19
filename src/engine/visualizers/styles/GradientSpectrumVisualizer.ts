import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class GradientSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'gradient-spectrum'
  public readonly name = 'Gradient Spectrum'
  public readonly category = 'Spectrum'
  public readonly description = 'Smooth interpolated Bezier frequency mountain with vibrant multi-stop linear gradient'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const pointsCount = Math.max(24, Math.min(128, config.barCount || 48))
    const totalW = context.width * 0.75
    const startX = -totalW / 2
    const stepX = totalW / (pointsCount - 1)

    const freqs = this.sampleLogFrequencies(audioFrame, pointsCount, config.sensitivity)
    const maxHeight = Math.min(context.height * 0.42, 340)

    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    // Build smooth curve points
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < pointsCount; i++) {
      const mag = freqs[i] || 0
      const h = mag * maxHeight
      pts.push({ x: startX + i * stepX, y: -h })
    }

    // Path 1: Gradient filled area
    ctx2d.beginPath()
    ctx2d.moveTo(startX, 0)
    ctx2d.lineTo(pts[0].x, pts[0].y)

    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2
      const yc = (pts[i].y + pts[i + 1].y) / 2
      ctx2d.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    const last = pts[pts.length - 1]
    ctx2d.lineTo(last.x, last.y)
    ctx2d.lineTo(-startX, 0)
    ctx2d.closePath()

    const grad = ctx2d.createLinearGradient(0, -maxHeight, 0, 0)
    grad.addColorStop(0, config.accentColor)
    grad.addColorStop(0.5, config.primaryColor)
    grad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx2d.fillStyle = grad
    ctx2d.fill()

    // Path 2: Glowing outline stroke
    ctx2d.beginPath()
    ctx2d.moveTo(pts[0].x, pts[0].y)
    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2
      const yc = (pts[i].y + pts[i + 1].y) / 2
      ctx2d.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    ctx2d.lineTo(last.x, last.y)
    ctx2d.strokeStyle = config.accentColor
    ctx2d.lineWidth = Math.max(2, config.thickness * 0.4)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
