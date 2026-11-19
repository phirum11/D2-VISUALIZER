import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
  isAccent: boolean
  alpha: number
  angle: number
  dist: number
  speed: number
}

export class ParticleVisualizer extends Base2DVisualizer {
  public readonly id = 'particles'
  public readonly name = 'Particle Visualizer'
  public readonly category = 'Particle Reactive'
  public readonly description = 'Dynamic physics particle cloud reacting to audio transients and frequency energy'

  private particles: Particle[] = []
  private maxParticles: number = 220
  private lastBass: number = 0

  private initParticles(): void {
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
        isAccent: Math.random() > 0.45,
        alpha: 0.35 + Math.random() * 0.65,
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
      this.initParticles()
    }

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const { subBass, bass, treble } = audioFrame.bands
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

      p.vx += dirX * restoreForce
      p.vy += dirY * restoreForce

      p.x += p.vx
      p.y += p.vy

      // Dynamic reactive radius
      const r = p.baseRadius * (1 + trebleEnergy * 0.8)

      ctx2d.save()
      ctx2d.globalAlpha = p.alpha * config.opacity
      ctx2d.fillStyle = p.isAccent ? config.accentColor : config.primaryColor
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx2d.fill()
      ctx2d.restore()
    }

    ctx2d.restore()
  }

  public override dispose(): void {
    this.particles = []
  }
}
