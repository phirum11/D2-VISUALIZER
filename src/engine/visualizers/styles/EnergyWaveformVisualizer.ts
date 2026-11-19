import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class EnergyWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'energy-waveform'
  public readonly name = 'Energy Waveform'
  public readonly category = 'Waveform'
  public readonly description = 'High-voltage electric discharge waveform with spark arcs and transient spikes'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const waveData = audioFrame.normalizedTimeDomain
    const points = Math.min(waveData.length, 120)
    const totalW = context.width * 0.8
    const startX = -totalW / 2
    const stepX = totalW / (points - 1)
    const amp = Math.min(context.height * 0.35, 220) * config.sensitivity

    const isTransient = audioFrame.bassEnergy > 0.65 || audioFrame.bands.subBass > 0.65
    this.applyGlow(ctx2d, config.accentColor, isTransient ? config.glow * 1.5 : config.glow, audioFrame.bassEnergy)

    // Lightning discharge multi-strokes
    const passes = isTransient ? 3 : 2
    for (let p = 0; p < passes; p++) {
      ctx2d.beginPath()
      const step = Math.floor(waveData.length / points)

      for (let i = 0; i < points; i++) {
        const val = waveData[i * step] || 0
        const jitter = (Math.sin(time * 30 + i * 5 + p) * 8 * (isTransient ? 2 : 1))
        const x = startX + i * stepX
        const y = val * amp + (p > 0 ? jitter : 0)

        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      }

      ctx2d.strokeStyle = p === 0 ? '#ffffff' : p === 1 ? config.primaryColor : config.accentColor
      ctx2d.lineWidth = p === 0 ? Math.max(1, config.thickness * 0.3) : Math.max(2, config.thickness * 0.8)
      ctx2d.stroke()
    }

    ctx2d.restore()
  }
}
