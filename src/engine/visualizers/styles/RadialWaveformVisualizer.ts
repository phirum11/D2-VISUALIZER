import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class RadialWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'radial-waveform'
  public readonly name = 'Radial Waveform'
  public readonly category = 'Radial'
  public readonly description = 'Continuous circular vector waveform oscilloscope with smooth harmonic curves'

  private rotationAngle: number = 0

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const points = Math.max(64, Math.min(256, (config.barCount || 48) * 2))
    const baseRadius = Math.min(width, height) * 0.18
    const timeDomain = audioFrame.normalizedTimeDomain
    const { bassEnergy, overallEnergy } = audioFrame

    this.applyGlow(ctx2d, config.primaryColor, config.glow, bassEnergy)

    this.rotationAngle += 0.004 + overallEnergy * 0.005
    const angleStep = (Math.PI * 2) / points
    const amplitude = Math.min(width, height) * 0.12 * config.sensitivity

    // Calculate smooth coordinate points
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < points; i++) {
      const sampleIdx = Math.floor((i / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const radius = baseRadius + sample * amplitude

      const angle = i * angleStep + this.rotationAngle
      pts.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    }

    // 1. Draw Smooth Curve Path
    ctx2d.beginPath()
    ctx2d.moveTo((pts[0].x + pts[points - 1].x) / 2, (pts[0].y + pts[points - 1].y) / 2)

    for (let i = 0; i < points; i++) {
      const next = pts[(i + 1) % points]
      const xc = (pts[i].x + next.x) / 2
      const yc = (pts[i].y + next.y) / 2
      ctx2d.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    ctx2d.closePath()

    // Stroke with dynamic gradient
    const grad = ctx2d.createLinearGradient(-baseRadius, -baseRadius, baseRadius, baseRadius)
    grad.addColorStop(0, config.primaryColor)
    grad.addColorStop(0.5, config.accentColor)
    grad.addColorStop(1, config.primaryColor)

    ctx2d.strokeStyle = grad
    ctx2d.lineWidth = Math.max(2, config.thickness || 4)
    ctx2d.lineJoin = 'round'
    ctx2d.stroke()

    // 2. Translucent neon glow center fill
    ctx2d.fillStyle = `${config.primaryColor}18`
    ctx2d.fill()

    // 3. Second counter-rotating harmonic wave (accent layer)
    ctx2d.beginPath()
    for (let i = 0; i < points; i++) {
      const sampleIdx = Math.floor(((i + points / 2) % points / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const radius = Math.max(10, baseRadius * 0.85 + sample * amplitude * 0.55)

      const angle = -(i * angleStep) - this.rotationAngle
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) ctx2d.moveTo(x, y)
      else ctx2d.lineTo(x, y)
    }
    ctx2d.closePath()

    ctx2d.strokeStyle = config.accentColor
    ctx2d.lineWidth = Math.max(1, (config.thickness || 4) * 0.5)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
