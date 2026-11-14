import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
  color: string
  alpha: number
  angle: number
  dist: number
  speed: number
}

export class ParticleVisualizer extends Base2DVisualizer {
  public readonly id = 'particles'
  public readonly name = 'Particle Visualizer'
  public readonly category = 'Particles'
  public readonly description = 'Dynamic physics particle cloud reacting to audio transients and frequency energy'

  private particles: Particle[] = []
  private maxParticles: number = 220
  private lastBass: number = 0

  private initParticles(primaryColor: string, accentColor: string): void {
    this.particles = []
    for (let i = 0; i < this.maxParticles; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 50 + Math.random() * 240
      this.particles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        baseRadius: 1.5 + Math.random() * 3.5,
        color: Math.random() > 0.4 ? primaryColor : accentColor,
        alpha: 0.3 + Math.random() * 0.7,
        angle,
        dist,
        speed: (Math.random() - 0.5) * 0.02,
      })
    }
  }

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    if (this.particles.length === 0) {
      this.initParticles(config.primaryColor, config.accentColor)
    }

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const { subBass, bass, treble } = audioFrame.bands
    const overallEnergy = audioFrame.overallEnergy
    const bassEnergy = subBass * 0.65 + bass * 0.35
    const trebleEnergy = treble

    this.applyGlow(ctx2d, config.accentColor, config.glow, bassEnergy)

    // Detect bass kick transient (attack)
    const isBassHit = bassEnergy > 0.45 && bassEnergy - this.lastBass > 0.12
    this.lastBass = bassEnergy

    // Update & draw particles
    const particleCount = this.particles.length
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i]

      // Orbit motion around center
      p.angle += p.speed * (1 + trebleEnergy * 2.5)

      // Transient bass explosion push
      if (isBassHit) {
        const kickImpulse = (15 + bassEnergy * 30) * config.sensitivity
        p.vx += Math.cos(p.angle) * kickImpulse
        p.vy += Math.sin(p.angle) * kickImpulse
      }

      // Treble jitter
      if (trebleEnergy > 0.3) {
        p.vx += (Math.random() - 0.5) * trebleEnergy * 3
        p.vy += (Math.random() - 0.5) * trebleEnergy * 3
      }

      // Drag / damping
      p.vx *= 0.92
      p.vy *= 0.92

      // Restoring force toward original orbital distance
      const curDist = Math.sqrt(p.x * p.x + p.y * p.y) || 1
      const targetDist = p.dist * (0.85 + bassEnergy * 0.4)
      const diff = targetDist - curDist
      const restoreForce = diff * 0.04

      const dirX = p.x / curDist
      const dirY = p.y / curDist

      p.x += p.vx + dirX * restoreForce - dirY * p.speed * curDist
      p.y += p.vy + dirY * restoreForce + dirX * p.speed * curDist

      // Particle visual size and brightness driven by audio
      const size = p.baseRadius * (0.8 + overallEnergy * 0.8 + bassEnergy * 0.6)
      const alpha = Math.min(1.0, p.alpha * (0.6 + overallEnergy * 0.8))

      // Particle dot
      ctx2d.fillStyle = p.color
      ctx2d.globalAlpha = alpha * config.opacity
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx2d.fill()

      // Particle connecting line to nearest neighbor if close
      if (i % 3 === 0 && i + 1 < particleCount) {
        const next = this.particles[i + 1]
        const dx = p.x - next.x
        const dy = p.y - next.y
        const distSq = dx * dx + dy * dy
        if (distSq < 3600) {
          // within 60px
          const lineAlpha = (1 - Math.sqrt(distSq) / 60) * 0.25 * config.opacity
          ctx2d.strokeStyle = config.primaryColor
          ctx2d.globalAlpha = lineAlpha
          ctx2d.lineWidth = 1
          ctx2d.beginPath()
          ctx2d.moveTo(p.x, p.y)
          ctx2d.lineTo(next.x, next.y)
          ctx2d.stroke()
        }
      }
    }

    // Central pulsing energy core
    const coreRadius = 25 * (1 + bassEnergy * 0.6)
    const coreGrad = ctx2d.createRadialGradient(0, 0, 0, 0, 0, coreRadius)
    coreGrad.addColorStop(0, `${config.accentColor}cc`)
    coreGrad.addColorStop(0.6, `${config.primaryColor}44`)
    coreGrad.addColorStop(1, 'transparent')

    ctx2d.fillStyle = coreGrad
    ctx2d.beginPath()
    ctx2d.arc(0, 0, coreRadius, 0, Math.PI * 2)
    ctx2d.fill()

    ctx2d.restore()
  }

  public override dispose(): void {
    this.particles = []
  }
}
