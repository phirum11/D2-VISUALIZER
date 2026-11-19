import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class CosmicFrequencyVisualizer extends Base2DVisualizer {
  public readonly id = 'cosmic-frequency'
  public readonly name = 'Cosmic Frequency Visualizer'
  public readonly category = 'Cinematic'
  public readonly description = 'Galactic logarithmic vortex curling spiral arms outward with cosmic audio turbulence'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const arms = 3
    const pointsPerArm = 50
    const { bass } = audioFrame.bands
    const bassScale = 1 + bass * 0.5

    this.applyGlow(ctx2d, config.accentColor, config.glow, audioFrame.bassEnergy)

    const freqs = this.sampleLogFrequencies(audioFrame, pointsPerArm, config.sensitivity)

    for (let a = 0; a < arms; a++) {
      const armOffset = (a / arms) * Math.PI * 2 + time * 0.4

      ctx2d.beginPath()
      for (let i = 0; i < pointsPerArm; i++) {
        const t = i / pointsPerArm
        const angle = armOffset + t * Math.PI * 3.5
        const mag = freqs[i] || 0
        const radius = (t * 220 + mag * 35) * bassScale
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)

        // Stardust particle dots along spiral arm
        if (i % 3 === 0) {
          ctx2d.save()
          ctx2d.fillStyle = t > 0.6 ? '#ffffff' : config.primaryColor
          ctx2d.beginPath()
          ctx2d.arc(x, y, 1.5 + mag * 3, 0, Math.PI * 2)
          ctx2d.fill()
          ctx2d.restore()
        }
      }

      ctx2d.strokeStyle = a % 2 === 0 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = Math.max(1.5, config.thickness * (1 - a * 0.2))
      ctx2d.stroke()
    }

    // Stellar bright galactic core
    const coreGrad = ctx2d.createRadialGradient(0, 0, 2, 0, 0, 30 * bassScale)
    coreGrad.addColorStop(0, '#ffffff')
    coreGrad.addColorStop(0.5, config.accentColor)
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx2d.fillStyle = coreGrad
    ctx2d.beginPath()
    ctx2d.arc(0, 0, 30 * bassScale, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }
}
