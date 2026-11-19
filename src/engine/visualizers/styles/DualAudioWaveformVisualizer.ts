import { Base2DVisualizer } from '../base/Base2DVisualizer'
import { VisualizerRenderContext } from '../types'

export class DualAudioWaveformVisualizer extends Base2DVisualizer {
  public readonly id = 'dual-audio-waveform'
  public readonly name = 'Dual Audio Waveform'
  public readonly category = 'Waveform'
  public readonly description = 'Stereo phase complementary waveforms woven with semi-transparent energy ribbons'

  public render(context: VisualizerRenderContext): void {
    const { ctx2d, config, audioFrame } = context
    if (!ctx2d) return

    ctx2d.save()
    this.applyTransform(ctx2d, context)

    const waveData = audioFrame.normalizedTimeDomain
    const points = Math.min(waveData.length, 250)
    const totalW = context.width * 0.75
    const startX = -totalW / 2
    const stepX = totalW / (points - 1)
    const amp = Math.min(context.height * 0.3, 200) * config.sensitivity

    const topPts: { x: number; y: number }[] = []
    const bottomPts: { x: number; y: number }[] = []
    const step = Math.floor(waveData.length / points)

    for (let i = 0; i < points; i++) {
      const val = waveData[i * step] || 0
      const x = startX + i * stepX
      topPts.push({ x, y: -Math.abs(val) * amp - 5 })
      bottomPts.push({ x, y: Math.abs(val) * amp + 5 })
    }

    // Ribbon fill between dual waveforms
    ctx2d.beginPath()
    ctx2d.moveTo(topPts[0].x, topPts[0].y)
    for (let i = 1; i < topPts.length; i++) ctx2d.lineTo(topPts[i].x, topPts[i].y)
    for (let i = bottomPts.length - 1; i >= 0; i--) ctx2d.lineTo(bottomPts[i].x, bottomPts[i].y)
    ctx2d.closePath()

    const fillGrad = ctx2d.createLinearGradient(0, -amp, 0, amp)
    fillGrad.addColorStop(0, `${config.primaryColor}33`)
    fillGrad.addColorStop(0.5, 'rgba(0,0,0,0)')
    fillGrad.addColorStop(1, `${config.accentColor}33`)
    ctx2d.fillStyle = fillGrad
    ctx2d.fill()

    this.applyGlow(ctx2d, config.primaryColor, config.glow, audioFrame.bassEnergy)

    // Top Waveform Stroke
    ctx2d.strokeStyle = config.primaryColor
    ctx2d.lineWidth = Math.max(2, config.thickness * 0.5)
    ctx2d.beginPath()
    for (let i = 0; i < topPts.length; i++) {
      if (i === 0) ctx2d.moveTo(topPts[i].x, topPts[i].y)
      else ctx2d.lineTo(topPts[i].x, topPts[i].y)
    }
    ctx2d.stroke()

    // Bottom Waveform Stroke
    ctx2d.strokeStyle = config.accentColor
    ctx2d.beginPath()
    for (let i = 0; i < bottomPts.length; i++) {
      if (i === 0) ctx2d.moveTo(bottomPts[i].x, bottomPts[i].y)
      else ctx2d.lineTo(bottomPts[i].x, bottomPts[i].y)
    }
    ctx2d.stroke()

    ctx2d.restore()
  }
}
