import { AmbientParticlesConfig, AmbientParticlePreset } from '@/stores/compositionStore'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'

interface AmbientParticle {
  x: number // 0 to 1 normalized
  y: number // 0 to 1 normalized
  baseSize: number
  speedX: number
  speedY: number
  phase: number
  colorOffset: number
}

export class AmbientParticleSystem {
  private particles: AmbientParticle[] = []
  private currentPreset: AmbientParticlePreset | null = null
  private currentCount: number = 0

  constructor() {
    this.initParticles('dust', 120)
  }

  public initParticles(preset: AmbientParticlePreset, count: number): void {
    this.currentPreset = preset
    this.currentCount = count
    this.particles = []

    for (let i = 0; i < count; i++) {
      const phase = (i / count) * Math.PI * 2
      let speedX = (Math.random() - 0.5) * 0.0003
      let speedY = (Math.random() - 0.5) * 0.0003
      let baseSize = 1.5 + Math.random() * 2.5

      switch (preset) {
        case 'snow':
          speedY = 0.0004 + Math.random() * 0.0008 // falls downward
          speedX = (Math.random() - 0.5) * 0.0002
          baseSize = 2.0 + Math.random() * 3.0
          break
        case 'sparks':
          speedY = -0.0008 - Math.random() * 0.0012 // rises upward
          speedX = (Math.random() - 0.5) * 0.0004
          baseSize = 1.2 + Math.random() * 2.0
          break
        case 'fireflies':
          speedX = (Math.random() - 0.5) * 0.0004
          speedY = (Math.random() - 0.5) * 0.0004
          baseSize = 2.5 + Math.random() * 3.5
          break
        case 'stars':
          speedX = 0
          speedY = 0
          baseSize = 1.0 + Math.random() * 2.0
          break
        case 'cosmic':
          speedX = (Math.random() - 0.5) * 0.0005
          speedY = (Math.random() - 0.5) * 0.0005
          baseSize = 2.0 + Math.random() * 4.0
          break
        case 'glowing':
          speedX = (Math.random() - 0.5) * 0.0002
          speedY = (Math.random() - 0.5) * 0.0002
          baseSize = 3.0 + Math.random() * 4.0
          break
        case 'dust':
        default:
          speedX = (Math.random() - 0.5) * 0.00015
          speedY = -0.0001 - Math.random() * 0.0002
          baseSize = 1.5 + Math.random() * 2.0
          break
      }

      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        baseSize,
        speedX,
        speedY,
        phase,
        colorOffset: Math.random(),
      })
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: AmbientParticlesConfig,
    audioFrame: AudioFrameData,
    timestamp: number
  ): void {
    if (!config.enabled) return

    // Reinitialize if preset or count changed
    if (this.currentPreset !== config.preset || this.currentCount !== config.particleCount) {
      this.initParticles(config.preset, config.particleCount)
    }

    const { bassEnergy, overallEnergy } = audioFrame
    const audioBoost = 1 + (bassEnergy * 0.8 + overallEnergy * 0.4) * config.audioReactivity

    ctx.save()
    ctx.globalCompositeOperation = 'screen'

    const particleCount = this.particles.length
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i]

      // Deterministic position calculation from timestamp + initial phase
      let currentX = (p.x + p.speedX * config.speed * audioBoost * timestamp * 60) % 1.0
      let currentY = (p.y + p.speedY * config.speed * audioBoost * timestamp * 60) % 1.0

      if (currentX < 0) currentX += 1.0
      if (currentY < 0) currentY += 1.0

      // Add harmonic sinusoidal sway based on preset
      if (config.preset === 'snow') {
        currentX += Math.sin(timestamp * 1.5 + p.phase) * 0.015
      } else if (config.preset === 'fireflies') {
        currentX += Math.sin(timestamp * 2.0 + p.phase) * 0.02
        currentY += Math.cos(timestamp * 1.8 + p.phase) * 0.02
      }

      const pixelX = currentX * width
      const pixelY = currentY * height

      // Dynamic size and twinkle
      const twinkle = 0.5 + 0.5 * Math.sin(timestamp * 3.0 + p.phase * 4)
      const currentSize =
        p.baseSize * (config.size / 2.0) * (0.8 + 0.4 * twinkle) * (1 + bassEnergy * 0.5 * config.audioReactivity)

      const alpha = Math.min(1.0, config.opacity * (0.4 + 0.6 * twinkle))

      // Glow halo
      if (config.glow > 0) {
        ctx.shadowColor = config.color
        ctx.shadowBlur = config.glow * (0.8 + bassEnergy * 0.6)
      } else {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      ctx.fillStyle = config.color
      ctx.globalAlpha = alpha

      ctx.beginPath()
      ctx.arc(pixelX, pixelY, Math.max(0.5, currentSize), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}
