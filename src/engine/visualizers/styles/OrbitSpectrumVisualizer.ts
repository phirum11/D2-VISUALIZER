import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class OrbitSpectrumVisualizer extends Base2DVisualizer {
  public readonly id = 'orbit-spectrum'
  public readonly name = 'Orbit Spectrum'
  public readonly category = 'Circular'
  public readonly description = 'Multi-layered orbital satellite tracks with frequency beads tracing celestial paths'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const baseRadius = Math.min(context.width, context.height) * 0.18
    const { bass, mid, treble } = audioFrame.bands
    const tracks = 3

    this.applyGlow(ctx2d, config.accentColor, config.glow, audioFrame.bassEnergy)

    for (let t = 0; t < tracks; t++) {
      const radius = baseRadius * (0.6 + t * 0.4)
      const speed = (0.5 - t * 0.15) * (t % 2 === 0 ? 1 : -1)
      const energy = t === 0 ? bass : t === 1 ? mid : treble

      // Orbital ellipse track
      ctx2d.save()
      ctx2d.rotate((t * Math.PI) / 4)
      ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx2d.lineWidth = 1
      ctx2d.beginPath()
      ctx2d.ellipse(0, 0, radius, radius * 0.65, 0, 0, Math.PI * 2)
      ctx2d.stroke()

      // Orbiting satellites
      const satellites = 4 + t * 2
      for (let s = 0; s < satellites; s++) {
        const angle = time * speed + (s / satellites) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * (radius * 0.65)
        const beadSize = 3 + energy * 8

        ctx2d.fillStyle = t % 2 === 0 ? config.primaryColor : config.accentColor
        ctx2d.beginPath()
        ctx2d.arc(x, y, beadSize, 0, Math.PI * 2)
        ctx2d.fill()

        // Tiny white star core
        ctx2d.fillStyle = '#ffffff'
        ctx2d.beginPath()
        ctx2d.arc(x, y, beadSize * 0.4, 0, Math.PI * 2)
        ctx2d.fill()
      }

      ctx2d.restore()
    }

    ctx2d.restore()
  }
}
