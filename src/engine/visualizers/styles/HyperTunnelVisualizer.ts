import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class HyperTunnelVisualizer extends Base2DVisualizer {
  public readonly id = 'hyper-tunnel'
  public readonly name = 'Hyper Tunnel Portal'
  public readonly category = 'Cinematic'
  public readonly description = '3D perspective infinite warp tunnel with audio frequency ring pulses'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const rings = 16
    const baseRadius = Math.min(width, height) * 0.42
    const { subBass, bass } = audioFrame.bands
    const bassImpact = subBass * 0.7 + bass * 0.3
    const freqs = audioFrame.normalizedFrequencies

    this.applyGlow(ctx2d, config.accentColor, config.glow * 1.3, bassImpact)

    // Perspective concentric rings moving forward in depth
    for (let r = 0; r < rings; r++) {
      const depthPhase = (r / rings + time * 0.8) % 1.0
      // Non-linear perspective scaling (close rings are huge, far rings are tiny)
      const depthScale = Math.pow(depthPhase, 2.5)
      const currentRadius = baseRadius * depthScale

      if (currentRadius < 4) continue

      const ringAlpha = depthPhase * config.opacity
      const binIdx = Math.floor(r * 4)
      const mag = (freqs[binIdx] || 0) * config.sensitivity

      // Ring deformation vertices
      const sides = 8 // Octagonal futuristic tunnel
      const step = (Math.PI * 2) / sides
      const rot = time * 0.2 + (r % 2 === 0 ? 1 : -1) * 0.1

      ctx2d.beginPath()
      for (let s = 0; s <= sides; s++) {
        const a = s * step + rot
        const spike = 1 + Math.sin(a * 4 + time * 3) * 0.08 * mag
        const rx = Math.cos(a) * (currentRadius * spike + (r === 0 ? bassImpact * 20 : 0))
        const ry = Math.sin(a) * (currentRadius * spike * 0.7 + (r === 0 ? bassImpact * 15 : 0))

        if (s === 0) ctx2d.moveTo(rx, ry)
        else ctx2d.lineTo(rx, ry)
      }
      ctx2d.closePath()

      // Gradient color interpolation between primary and accent
      ctx2d.strokeStyle = r % 2 === 0 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = Math.max(1, (config.thickness || 3) * depthPhase * 1.5)
      ctx2d.globalAlpha = ringAlpha
      ctx2d.stroke()

      // Connect vertex rays to center portal
      if (r === rings - 1) {
        ctx2d.strokeStyle = `${config.accentColor}40`
        ctx2d.lineWidth = 1
        for (let s = 0; s < sides; s++) {
          const a = s * step + rot
          const rx = Math.cos(a) * currentRadius
          const ry = Math.sin(a) * (currentRadius * 0.7)
          ctx2d.beginPath()
          ctx2d.moveTo(0, 0)
          ctx2d.lineTo(rx, ry)
          ctx2d.stroke()
        }
      }
    }

    // Central singularity core
    ctx2d.globalAlpha = 1
    const coreRad = Math.max(8, 18 * (1 + bassImpact * 0.8))
    const coreGrad = ctx2d.createRadialGradient(0, 0, 0, 0, 0, coreRad * 2)
    coreGrad.addColorStop(0, '#ffffff')
    coreGrad.addColorStop(0.3, config.accentColor)
    coreGrad.addColorStop(1, 'transparent')

    ctx2d.fillStyle = coreGrad
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRad * 2, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }
}
