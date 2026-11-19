import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

interface ParticleNode {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseRadius: number
  angle: number
}

export class ParticleAudioFieldVisualizer extends Base2DVisualizer {
  public readonly id = 'particle-audio-field'
  public readonly name = 'Particle Audio Field'
  public readonly category = 'Particle Reactive'
  public readonly description = 'Constellation physics field of 120+ reactive particle nodes connecting with energy lines'

  private particles: ParticleNode[] = []
  private readonly count = 120

  public override init(_container: HTMLElement | HTMLCanvasElement): void {
    this.particles = []
    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 50 + Math.random() * 220
      this.particles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: 1.5 + Math.random() * 2.5,
        baseRadius: dist,
        angle,
      })
    }
  }

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    if (this.particles.length === 0) {
      this.init(context.canvas)
    }

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const { bass, subBass, treble } = audioFrame.bands
    const bassImpact = subBass * 0.7 + bass * 0.5

    this.applyGlow(ctx2d, config.accentColor, config.glow, audioFrame.bassEnergy)

    // Update particle positions
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      p.angle += 0.005 + p.vx * 0.01
      const currentRadius = p.baseRadius * (1 + bassImpact * 0.45)
      p.x = Math.cos(p.angle) * currentRadius
      p.y = Math.sin(p.angle) * currentRadius
    }

    // Connect close neighbors with translucent lines
    const maxDist = 55 + bassImpact * 40
    ctx2d.strokeStyle = `${config.primaryColor}44`
    ctx2d.lineWidth = 0.8
    ctx2d.beginPath()

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x
        const dy = this.particles[i].y - this.particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < maxDist) {
          ctx2d.moveTo(this.particles[i].x, this.particles[i].y)
          ctx2d.lineTo(this.particles[j].x, this.particles[j].y)
        }
      }
    }
    ctx2d.stroke()

    // Draw particle nodes
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      const sz = p.size * (1 + treble * 1.5)

      ctx2d.fillStyle = i % 3 === 0 ? '#ffffff' : config.accentColor
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, sz, 0, Math.PI * 2)
      ctx2d.fill()
    }

    ctx2d.restore()
  }

  public override dispose(): void {
    this.particles = []
  }
}
