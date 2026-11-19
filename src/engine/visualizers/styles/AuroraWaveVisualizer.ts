import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class AuroraWaveVisualizer extends Base2DVisualizer {
  public readonly id = 'aurora-wave'
  public readonly name = 'Aurora Borealis Wave'
  public readonly category = 'Waveform'
  public readonly description = 'Multi-layered organic northern lights aurora wave with bioluminescent glow'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame, width, height, time } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const totalWidth = width * 0.82
    const startX = -totalWidth / 2
    const points = Math.max(64, (config.barCount || 48) * 2)
    const stepX = totalWidth / (points - 1)
    const { bassEnergy } = audioFrame
    const timeDomain = audioFrame.normalizedTimeDomain

    this.applyGlow(ctx2d, config.accentColor, config.glow * 1.2, bassEnergy)

    // Render 4 layered translucent ribbons with phase offsets
    const layers = [
      { color: config.primaryColor, alpha: 0.35, freqSpeed: 1.0, ampScale: 1.0, yOffset: 0 },
      { color: config.accentColor, alpha: 0.28, freqSpeed: 1.4, ampScale: 0.8, yOffset: -8 },
      { color: '#38bdf8', alpha: 0.22, freqSpeed: 0.8, ampScale: 0.6, yOffset: 6 },
      { color: '#ffffff', alpha: 0.45, freqSpeed: 1.8, ampScale: 0.4, yOffset: 0 },
    ]

    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l]
      const maxAmp = height * 0.22 * config.sensitivity * layer.ampScale

      ctx2d.beginPath()
      ctx2d.moveTo(startX, 0)

      for (let i = 0; i < points; i++) {
        const norm = i / (points - 1)
        const sampleIdx = Math.floor(norm * timeDomain.length)
        const audioSample = timeDomain[sampleIdx] || 0
        const harmonic = Math.sin(time * 2 * layer.freqSpeed + norm * 8) * 0.4
        const y = -(audioSample * 0.8 + harmonic * 0.2) * maxAmp + layer.yOffset
        const x = startX + i * stepX

        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      }

      ctx2d.lineTo(startX + totalWidth, height * 0.3)
      ctx2d.lineTo(startX, height * 0.3)
      ctx2d.closePath()

      // Gradient fill down to floor
      const grad = ctx2d.createLinearGradient(0, -maxAmp, 0, height * 0.25)
      grad.addColorStop(0, layer.color)
      grad.addColorStop(0.5, `${layer.color}60`)
      grad.addColorStop(1, 'transparent')

      ctx2d.fillStyle = grad
      ctx2d.globalAlpha = layer.alpha * config.opacity
      ctx2d.fill()

      // Sharp crest highlight line
      ctx2d.beginPath()
      for (let i = 0; i < points; i++) {
        const norm = i / (points - 1)
        const sampleIdx = Math.floor(norm * timeDomain.length)
        const audioSample = timeDomain[sampleIdx] || 0
        const harmonic = Math.sin(time * 2 * layer.freqSpeed + norm * 8) * 0.4
        const y = -(audioSample * 0.8 + harmonic * 0.2) * maxAmp + layer.yOffset
        const x = startX + i * stepX

        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
      }

      ctx2d.strokeStyle = layer.color
      ctx2d.lineWidth = Math.max(1.5, (config.thickness || 3) * 0.8)
      ctx2d.globalAlpha = (layer.alpha + 0.3) * config.opacity
      ctx2d.stroke()
    }

    // Bioluminescent floating stardust sparks along crest
    const sparkCount = 18
    ctx2d.fillStyle = '#ffffff'
    for (let s = 0; s < sparkCount; s++) {
      const sx = startX + Math.sin(s * 3.7 + time * 1.5) * (totalWidth * 0.45) + totalWidth * 0.5
      const sy = Math.cos(s * 2.3 + time * 2) * 45 - bassEnergy * 25
      const rad = 1.2 + Math.sin(s + time * 4) * 0.8
      ctx2d.beginPath()
      ctx2d.arc(sx, sy, Math.max(0.5, rad), 0, Math.PI * 2)
      ctx2d.fill()
    }

    ctx2d.restore()
  }
}
