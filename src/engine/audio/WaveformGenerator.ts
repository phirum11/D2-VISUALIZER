export interface WaveformPoint {
  min: number // -1.0 to 0.0
  max: number // 0.0 to 1.0
  rms: number // 0.0 to 1.0
}

export interface WaveformData {
  points: WaveformPoint[]
  duration: number
  sampleCount: number
}

export class WaveformGenerator {
  private static cache = new Map<string, WaveformData>()

  /**
   * Generates downsampled waveform peaks from an AudioBuffer
   * @param buffer The decoded AudioBuffer
   * @param targetPoints Number of discrete points to compute (default 800)
   * @param cacheKey Optional key to cache results
   */
  public static generateWaveform(
    buffer: AudioBuffer,
    targetPoints: number = 800,
    cacheKey?: string
  ): WaveformData {
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const channelData = buffer.getChannelData(0) // primary channel
    const length = channelData.length
    const blockSize = Math.floor(length / targetPoints)
    const points: WaveformPoint[] = new Array(targetPoints)

    for (let i = 0; i < targetPoints; i++) {
      const start = i * blockSize
      const end = Math.min(start + blockSize, length)
      let min = 0
      let max = 0
      let sumSquares = 0

      for (let j = start; j < end; j++) {
        const val = channelData[j]
        if (val < min) min = val
        if (val > max) max = val
        sumSquares += val * val
      }

      const count = end - start
      const rms = count > 0 ? Math.sqrt(sumSquares / count) : 0
      points[i] = { min, max, rms }
    }

    const result: WaveformData = {
      points,
      duration: buffer.duration,
      sampleCount: targetPoints,
    }

    if (cacheKey) {
      this.cache.set(cacheKey, result)
    }

    return result
  }

  /**
   * Helper to draw high-definition vector waveform onto an HTML Canvas 2D
   */
  public static drawWaveform(
    ctx: CanvasRenderingContext2D,
    waveform: WaveformData,
    width: number,
    height: number,
    color: string = '#6366f1',
    progress: number = 0 // 0.0 to 1.0 (played progress)
  ): void {
    const { points } = waveform
    if (!points || points.length === 0) return

    const midY = height / 2
    const step = width / points.length

    ctx.clearRect(0, 0, width, height)

    // Draw unplayed / played waveform with high contrast
    for (let i = 0; i < points.length; i++) {
      const x = i * step
      const pt = points[i]
      const top = midY - Math.abs(pt.max) * (height * 0.45)
      const bottom = midY + Math.abs(pt.min) * (height * 0.45)
      const barH = Math.max(1.5, bottom - top)

      const isPlayed = i / points.length <= progress

      ctx.fillStyle = isPlayed ? '#06b6d4' : color
      ctx.fillRect(x, top, Math.max(1, step - 0.5), barH)
    }
  }

  public static clearCache(): void {
    this.cache.clear()
  }
}
