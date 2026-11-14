import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class ClassicWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'classic-waveform'
  public readonly name = 'Classic Waveform'
  public readonly category = 'Waveform'
  public readonly description = 'Horizontal linear audio oscillograph line with neon glow'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const points = Math.max(64, Math.min(256, (config.barCount || 48) * 3))
    const totalWidth = width * 0.75
    const timeDomain = audioFrame.normalizedTimeDomain
    const { bassEnergy } = audioFrame

    this.applyGlow(ctx2d, config.primaryColor, config.glow, bassEnergy)

    const startX = -totalWidth / 2
    const stepX = totalWidth / (points - 1)
    const maxAmplitude = height * 0.25 * config.sensitivity

    // 1. Draw Lower Reflection Fill
    ctx2d.beginPath()
    ctx2d.moveTo(startX, 0)
    for (let i = 0; i < points; i++) {
      const sampleIdx = Math.floor((i / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const x = startX + i * stepX
      const y = -sample * maxAmplitude
      ctx2d.lineTo(x, y)
    }
    ctx2d.lineTo(startX + totalWidth, 0)
    ctx2d.closePath()

    const fillGrad = ctx2d.createLinearGradient(0, -maxAmplitude, 0, maxAmplitude)
    fillGrad.addColorStop(0, `${config.accentColor}25`)
    fillGrad.addColorStop(0.5, `${config.primaryColor}10`)
    fillGrad.addColorStop(1, 'transparent')
    ctx2d.fillStyle = fillGrad
    ctx2d.fill()

    // 2. Draw Main Oscilloscope Trace
    ctx2d.beginPath()
    for (let i = 0; i < points; i++) {
      const sampleIdx = Math.floor((i / points) * timeDomain.length)
      const sample = timeDomain[sampleIdx] || 0
      const x = startX + i * stepX
      const y = -sample * maxAmplitude

      if (i === 0) {
        ctx2d.moveTo(x, y)
      } else {
        ctx2d.lineTo(x, y)
      }
    }

    const strokeGrad = ctx2d.createLinearGradient(startX, 0, startX + totalWidth, 0)
    strokeGrad.addColorStop(0, `${config.primaryColor}00`)
    strokeGrad.addColorStop(0.15, config.primaryColor)
    strokeGrad.addColorStop(0.5, config.accentColor)
    strokeGrad.addColorStop(0.85, config.primaryColor)
    strokeGrad.addColorStop(1, `${config.primaryColor}00`)

    ctx2d.strokeStyle = strokeGrad
    ctx2d.lineWidth = Math.max(2, config.thickness || 4)
    ctx2d.lineCap = 'round'
    ctx2d.lineJoin = 'round'
    ctx2d.stroke()

    // 3. Subtle center zero-axis dashed line
    ctx2d.save()
    ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx2d.lineWidth = 1
    ctx2d.setLineDash([4, 6])
    ctx2d.beginPath()
    ctx2d.moveTo(startX, 0)
    ctx2d.lineTo(startX + totalWidth, 0)
    ctx2d.stroke()
    ctx2d.restore()

    ctx2d.restore()
  }
}
