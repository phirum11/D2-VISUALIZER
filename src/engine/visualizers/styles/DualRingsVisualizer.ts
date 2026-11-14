import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class DualRingsVisualizer extends Base2DVisualizer {
  public readonly id = 'dual-rings'
  public readonly name = 'Dual Circular Rings'
  public readonly category = 'Circular'
  public readonly description = 'Twin reactive circular rings for bass & treble frequency separation'

  private innerAngle: number = 0
  private outerAngle: number = 0

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const baseRadius = Math.min(width, height) * 0.14
    const { subBass, bass, highMid, treble } = audioFrame.bands
    const bassEnergy = subBass * 0.7 + bass * 0.3
    const trebleEnergy = highMid * 0.4 + treble * 0.6

    this.applyGlow(ctx2d, config.primaryColor, config.glow, bassEnergy)

    // Counter-rotations
    this.innerAngle += 0.005 + bassEnergy * 0.015
    this.outerAngle -= 0.003 + trebleEnergy * 0.01

    // ==========================================
    // 1. INNER RING — PURE SUB-BASS & BASS DRIVE
    // ==========================================
    const innerRadius = Math.max(20, baseRadius * (0.85 + bassEnergy * 0.45 * config.sensitivity))
    const innerPoints = 32
    const innerStep = (Math.PI * 2) / innerPoints

    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = Math.max(3, (config.thickness || 6) * (1 + bassEnergy))
    ctx2d.beginPath()

    for (let i = 0; i <= innerPoints; i++) {
      const idx = i % innerPoints
      const angle = idx * innerStep + this.innerAngle
      const rawBassMag = (audioFrame.normalizedFrequencies[idx % 16] || 0) * config.sensitivity
      const r = innerRadius + rawBassMag * 15

      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r
      if (i === 0) ctx2d.moveTo(x, y)
      else ctx2d.lineTo(x, y)
    }
    ctx2d.closePath()
    ctx2d.stroke()

    // Inner ring ambient fill
    ctx2d.fillStyle = `${config.primaryColor}18`
    ctx2d.fill()

    // ==========================================
    // 2. OUTER RING — HIGH-MID & TREBLE SPIKES
    // ==========================================
    const outerRadius = baseRadius * 1.5 + 10
    const outerSpikeCount = Math.max(32, Math.min(128, config.barCount || 64))
    const outerStep = (Math.PI * 2) / outerSpikeCount
    const maxSpike = Math.min(width, height) * 0.18 * config.sensitivity

    ctx2d.strokeStyle = config.accentColor
    ctx2d.lineWidth = Math.max(1.5, (config.thickness || 4) * 0.65)
    ctx2d.lineCap = 'round'

    for (let i = 0; i < outerSpikeCount; i++) {
      const angle = i * outerStep + this.outerAngle
      // Sample high-frequency bins for outer ring
      const binIdx = Math.floor(64 + (i / outerSpikeCount) * 192)
      const mag = (audioFrame.normalizedFrequencies[binIdx] || 0) * config.sensitivity
      const spikeLen = 4 + mag * maxSpike + trebleEnergy * 15

      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      const x1 = cos * outerRadius
      const y1 = sin * outerRadius
      const x2 = cos * (outerRadius + spikeLen)
      const y2 = sin * (outerRadius + spikeLen)

      ctx2d.beginPath()
      ctx2d.moveTo(x1, y1)
      ctx2d.lineTo(x2, y2)
      ctx2d.stroke()
    }

    // Outer baseline circle
    ctx2d.strokeStyle = `${config.accentColor}80`
    ctx2d.lineWidth = 1.5
    ctx2d.beginPath()
    ctx2d.arc(0, 0, outerRadius, 0, Math.PI * 2)
    ctx2d.stroke()

    ctx2d.restore()
  }
}
