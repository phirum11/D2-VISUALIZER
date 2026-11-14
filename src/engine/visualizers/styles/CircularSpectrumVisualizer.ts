import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class CircularSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'circular-spectrum'
  public readonly name = 'Circular Spectrum'
  public readonly category = 'Circular'
  public readonly description = 'Radial bars projecting outward around central circular core'

  private rotationAngle: number = 0

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const barCount = Math.max(24, Math.min(128, config.barCount || 64))
    const thickness = Math.max(2, config.thickness || 4)
    const baseRadius = Math.min(width, height) * 0.16

    const { bassEnergy, overallEnergy } = audioFrame
    this.applyGlow(ctx2d, config.accentColor, config.glow, bassEnergy)

    // Gentle slow rotation with slight audio acceleration
    this.rotationAngle += 0.003 + overallEnergy * 0.008

    const sampledFreqs = this.sampleLogFrequencies(
      audioFrame,
      barCount,
      config.sensitivity
    )

    const angleStep = (Math.PI * 2) / barCount
    const maxBarLength = Math.min(width, height) * 0.22

    // 1. Draw Radial Spectrum Bars
    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep + this.rotationAngle
      const mag = sampledFreqs[i] || 0
      const barH = 4 + mag * maxBarLength

      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      const xStart = cos * baseRadius
      const yStart = sin * baseRadius
      const xEnd = cos * (baseRadius + barH)
      const yEnd = sin * (baseRadius + barH)

      ctx2d.strokeStyle =
        i % 2 === 0 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = thickness
      ctx2d.lineCap = 'round'

      ctx2d.beginPath()
      ctx2d.moveTo(xStart, yStart)
      ctx2d.lineTo(xEnd, yEnd)
      ctx2d.stroke()
    }

    // 2. Inner reactive bass ring
    const innerRadius = Math.max(10, baseRadius - 6 + bassEnergy * 14)
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = 3 + bassEnergy * 4
    ctx2d.beginPath()
    ctx2d.arc(0, 0, innerRadius, 0, Math.PI * 2)
    ctx2d.stroke()

    // 3. Central glowing audio core
    const coreRadius = Math.max(4, innerRadius * 0.35 * (0.8 + overallEnergy * 0.4))
    const coreGrad = ctx2d.createRadialGradient(0, 0, 0, 0, 0, coreRadius)
    coreGrad.addColorStop(0, '#ffffff')
    coreGrad.addColorStop(0.5, config.accentColor)
    coreGrad.addColorStop(1, 'transparent')

    ctx2d.fillStyle = coreGrad
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRadius, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }
}
