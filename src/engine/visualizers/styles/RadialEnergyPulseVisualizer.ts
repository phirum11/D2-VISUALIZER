import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class RadialEnergyPulseVisualizer extends Base2DVisualizer {
  public readonly id = 'radial-energy-pulse'
  public readonly name = 'Radial Energy Pulse'
  public readonly category = 'Radial'
  public readonly description = 'Concentric expanding sonar shockwaves propelled by sub-bass drops and kick hits'

  private rings: { radius: number; maxRadius: number; alpha: number; speed: number }[] = []

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const baseRadius = Math.min(context.width, context.height) * 0.12
    const maxExpand = Math.min(context.width, context.height) * 0.42

    const { bass, subBass } = audioFrame.bands
    const bassImpact = subBass * 0.6 + bass * 0.4

    // Spawn new shockwave ring on transient hit
    if ((bassImpact > 0.55 || audioFrame.bassEnergy > 0.65) && this.rings.length < 8) {
      this.rings.push({
        radius: baseRadius,
        maxRadius: maxExpand,
        alpha: 1.0,
        speed: 4 + bassImpact * 6,
      })
    }

    this.applyGlow(ctx2d, config.accentColor, config.glow, audioFrame.bassEnergy)

    // Center Core Orb
    const coreRadius = baseRadius * (0.8 + bassImpact * 0.35)
    const coreGrad = ctx2d.createRadialGradient(0, 0, 5, 0, 0, coreRadius)
    coreGrad.addColorStop(0, '#ffffff')
    coreGrad.addColorStop(0.4, config.accentColor)
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx2d.fillStyle = coreGrad
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRadius, 0, Math.PI * 2)
    ctx2d.fill()

    // Update and draw expanding rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i]
      ring.radius += ring.speed
      const progress = (ring.radius - baseRadius) / (ring.maxRadius - baseRadius)
      ring.alpha = Math.max(0, 1 - progress)

      if (ring.radius >= ring.maxRadius || ring.alpha <= 0.01) {
        this.rings.splice(i, 1)
        continue
      }

      ctx2d.save()
      ctx2d.globalAlpha = config.opacity * ring.alpha
      ctx2d.strokeStyle = config.primaryColor
      ctx2d.lineWidth = Math.max(1.5, config.thickness * (1 - progress * 0.5))
      ctx2d.beginPath()
      ctx2d.arc(0, 0, ring.radius, 0, Math.PI * 2)
      ctx2d.stroke()
      ctx2d.restore()
    }

    ctx2d.restore()
  }

  public override dispose(): void {
    this.rings = []
  }
}
