import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class LiquidEnergyVisualizer extends Base2DVisualizer {
  public readonly id = 'liquid-energy'
  public readonly name = 'Liquid Energy Visualizer'
  public readonly category = 'Experimental'
  public readonly description = 'Deforming fluid plasma blob modulated by harmonic Fourier synthesis and bass pressure'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const baseRadius = Math.min(context.width, context.height) * 0.16
    const points = 72
    const { bass, subBass, mid, treble } = audioFrame.bands
    const bassImpact = subBass * 0.7 + bass * 0.5

    this.applyGlow(ctx2d, config.accentColor, config.glow + 10, audioFrame.bassEnergy)

    // Compute harmonic liquid contours
    const pts: { x: number; y: number }[] = []
    const freqs = this.sampleLogFrequencies(audioFrame, points, config.sensitivity)

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2
      const mag = freqs[i] || 0
      // Multi-harmonic fluid undulation
      const fluid =
        Math.sin(angle * 3 + time * 2) * 12 * (1 + mid) +
        Math.cos(angle * 5 - time * 2.5) * 8 * (1 + treble) +
        mag * 45 * config.sensitivity
      const r = baseRadius * (1 + bassImpact * 0.3) + fluid

      pts.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      })
    }

    // Draw smooth liquid shape using quadratic curves
    ctx2d.beginPath()
    ctx2d.moveTo((pts[0].x + pts[points - 1].x) / 2, (pts[0].y + pts[points - 1].y) / 2)

    for (let i = 0; i < points; i++) {
      const next = pts[(i + 1) % points]
      const xc = (pts[i].x + next.x) / 2
      const yc = (pts[i].y + next.y) / 2
      ctx2d.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    ctx2d.closePath()

    // Liquid plasma radial gradient
    const grad = ctx2d.createRadialGradient(0, 0, 10, 0, 0, baseRadius * 1.6)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.35, config.accentColor)
    grad.addColorStop(0.85, config.primaryColor)
    grad.addColorStop(1, 'rgba(0,0,0,0.15)')

    ctx2d.fillStyle = grad
    ctx2d.fill()

    ctx2d.strokeStyle = '#ffffff'
    ctx2d.lineWidth = Math.max(1.5, config.thickness * 0.4)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
