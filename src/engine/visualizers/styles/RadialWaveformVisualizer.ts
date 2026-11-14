import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class RadialWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'radial-waveform'
  public readonly name = 'Radial Waveform'
  public readonly category = 'Circular'
  public readonly description = 'Continuous circular vector waveform oscilloscope loop'

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

    // 1. Draw Closed Waveform Path
    ctx2d.beginPath()
    for (let i = 0; i <= points; i++) {
      const idx = i % points
      const sampleIdx = Math.floor((idx / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const radius = baseRadius + sample * amplitude

      const angle = idx * angleStep + this.rotationAngle
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) {
        ctx2d.moveTo(x, y)
      } else {
        ctx2d.lineTo(x, y)
      }
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

    // 2. Translucent fill for neon glow center
    ctx2d.fillStyle = `${config.primaryColor}15`
    ctx2d.fill()

    // 3. Second harmonic wave (accent layer)
    ctx2d.beginPath()
    for (let i = 0; i <= points; i++) {
      const idx = i % points
      const sampleIdx = Math.floor(((idx + points / 2) % points / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const radius = Math.max(10, baseRadius * 0.85 + sample * amplitude * 0.6)

      const angle = -(idx * angleStep) - this.rotationAngle
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) {
        ctx2d.moveTo(x, y)
      } else {
        ctx2d.lineTo(x, y)
      }
    }
    ctx2d.closePath()

    ctx2d.strokeStyle = config.accentColor
    ctx2d.lineWidth = Math.max(1, (config.thickness || 4) * 0.5)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
