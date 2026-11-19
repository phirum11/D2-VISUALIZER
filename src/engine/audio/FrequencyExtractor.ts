export interface AudioBands {
  subBass: number // 20 - 60 Hz
  bass: number // 60 - 250 Hz
  lowMid: number // 250 - 500 Hz
  mid: number // 500 - 2,000 Hz
  highMid: number // 2,000 - 6,000 Hz
  treble: number // 6,000 - 20,000 Hz
}

export interface AudioFrameData {
  rawFrequencies: Uint8Array
  normalizedFrequencies: Float32Array
  timeDomainData: Uint8Array
  normalizedTimeDomain: Float32Array
  bands: AudioBands
  overallEnergy: number
  rms: number
  bassEnergy: number
  midEnergy: number
  trebleEnergy: number
}

export interface ExtractorConfig {
  fftSize?: number
  sensitivity?: number
  smoothing?: number // 0.0 (no smoothing) to 0.95 (heavy smoothing)
  attackRate?: number // 0.0 to 1.0 (faster response to hits)
  decayRate?: number // 0.0 to 1.0 (smoother release)
}

export class FrequencyExtractor {
  private analyser: AnalyserNode
  private sampleRate: number
  private fftSize: number
  private byteFrequencyData: Uint8Array<ArrayBuffer>
  private normalizedBuffer: Float32Array<ArrayBuffer>
  private byteTimeDomainData: Uint8Array<ArrayBuffer>
  private normalizedTimeDomain: Float32Array<ArrayBuffer>

  // Smoothed band state (for EMA smoothing)
  private smoothedBands: AudioBands = {
    subBass: 0,
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0,
  }

  public sensitivity: number = 1.0
  public smoothing: number = 0.8
  public attackRate: number = 0.85
  public decayRate: number = 0.2

  constructor(analyser: AnalyserNode, sampleRate: number, config?: ExtractorConfig) {
    this.analyser = analyser
    this.sampleRate = sampleRate
    this.fftSize = config?.fftSize || analyser.fftSize || 2048
    this.analyser.fftSize = this.fftSize
    this.analyser.smoothingTimeConstant = 0.4 // internal hardware analyser smoothing

    const binCount = this.analyser.frequencyBinCount
    this.byteFrequencyData = new Uint8Array(new ArrayBuffer(binCount))
    this.normalizedBuffer = new Float32Array(new ArrayBuffer(binCount * 4))
    this.byteTimeDomainData = new Uint8Array(new ArrayBuffer(binCount))
    this.normalizedTimeDomain = new Float32Array(new ArrayBuffer(binCount * 4))

    if (config?.sensitivity) this.sensitivity = config.sensitivity
    if (config?.smoothing) this.smoothing = config.smoothing
  }

  /**
   * Converts a frequency in Hz to the nearest FFT bin index
   */
  private hzToBin(hz: number): number {
    const binCount = this.analyser.frequencyBinCount
    const nyquist = this.sampleRate / 2
    const bin = Math.round((hz / nyquist) * binCount)
    return Math.max(0, Math.min(binCount - 1, bin))
  }

  /**
   * Computes the average normalized magnitude in a frequency range [startHz, endHz]
   */
  private getBandEnergy(startHz: number, endHz: number): number {
    const startBin = this.hzToBin(startHz)
    const endBin = Math.max(startBin + 1, this.hzToBin(endHz))
    let sum = 0

    for (let i = startBin; i < endBin; i++) {
      sum += this.byteFrequencyData[i]
    }

    const count = endBin - startBin
    const avg = count > 0 ? sum / (count * 255) : 0
    return Math.min(1.0, avg * this.sensitivity)
  }

  /**
   * Applies Exponential Moving Average (EMA) with asymmetric attack and decay
   */
  private applyEma(current: number, target: number): number {
    const rate = target > current ? this.attackRate : this.decayRate * (1 - this.smoothing)
    return current + (target - current) * rate
  }

  /**
   * Extracts real-time frequency analysis frame
   */
  public getFrameData(): AudioFrameData {
    this.analyser.getByteFrequencyData(this.byteFrequencyData)

    const binCount = this.byteFrequencyData.length
    let totalSum = 0

    // Normalize entire frequency array
    for (let i = 0; i < binCount; i++) {
      const norm = (this.byteFrequencyData[i] / 255) * this.sensitivity
      const val = Math.min(1.0, norm)
      this.normalizedBuffer[i] = val
      totalSum += val
    }

    // 1. Calculate raw target energies for each of the 6 defined bands
    const rawSubBass = this.getBandEnergy(20, 60)
    const rawBass = this.getBandEnergy(60, 250)
    const rawLowMid = this.getBandEnergy(250, 500)
    const rawMid = this.getBandEnergy(500, 2000)
    const rawHighMid = this.getBandEnergy(2000, 6000)
    const rawTreble = this.getBandEnergy(6000, 20000)

    // 2. Smooth bands with EMA
    this.smoothedBands.subBass = this.applyEma(this.smoothedBands.subBass, rawSubBass)
    this.smoothedBands.bass = this.applyEma(this.smoothedBands.bass, rawBass)
    this.smoothedBands.lowMid = this.applyEma(this.smoothedBands.lowMid, rawLowMid)
    this.smoothedBands.mid = this.applyEma(this.smoothedBands.mid, rawMid)
    this.smoothedBands.highMid = this.applyEma(this.smoothedBands.highMid, rawHighMid)
    this.smoothedBands.treble = this.applyEma(this.smoothedBands.treble, rawTreble)

    const overallEnergy = binCount > 0 ? totalSum / binCount : 0
    const bassEnergy = (this.smoothedBands.subBass * 0.6 + this.smoothedBands.bass * 0.4)
    const midEnergy = (this.smoothedBands.lowMid * 0.5 + this.smoothedBands.mid * 0.5)
    const trebleEnergy = (this.smoothedBands.highMid * 0.5 + this.smoothedBands.treble * 0.5)

    // Capture time-domain waveform data and compute real audio RMS
    this.analyser.getByteTimeDomainData(this.byteTimeDomainData)
    let sumSquares = 0
    for (let i = 0; i < binCount; i++) {
      const sample = (this.byteTimeDomainData[i] - 128) / 128.0
      this.normalizedTimeDomain[i] = sample
      sumSquares += sample * sample
    }
    const rms = Math.min(1.0, Math.sqrt(sumSquares / binCount) * this.sensitivity * 1.5)

    // If audio is completely silent or stopped, produce ambient resting harmonics so visualizer is never a dead flat stick
    const isAudioSilent = totalSum < 0.008
    if (isAudioSilent) {
      const now = performance.now() / 1000
      const pulse = Math.sin(now * 2.2) * 0.12 + 0.32
      for (let i = 0; i < binCount; i++) {
        const norm = i / binCount
        const wave = Math.sin(now * 3.2 - norm * 9) * 0.5 + 0.5
        const val = Math.max(0.05, Math.pow(1 - norm, 0.65) * wave * pulse)
        this.normalizedBuffer[i] = val
        this.normalizedTimeDomain[i] = Math.sin(now * 4.5 + norm * 14) * 0.22 * pulse
      }
      return {
        rawFrequencies: this.byteFrequencyData,
        normalizedFrequencies: this.normalizedBuffer,
        timeDomainData: this.byteTimeDomainData,
        normalizedTimeDomain: this.normalizedTimeDomain,
        bands: {
          subBass: pulse * 0.65,
          bass: pulse * 0.55,
          lowMid: pulse * 0.4,
          mid: pulse * 0.32,
          highMid: pulse * 0.22,
          treble: pulse * 0.18,
        },
        overallEnergy: pulse * 0.35,
        rms: pulse * 0.28,
        bassEnergy: pulse * 0.6,
        midEnergy: pulse * 0.35,
        trebleEnergy: pulse * 0.2,
      }
    }

    return {
      rawFrequencies: this.byteFrequencyData,
      normalizedFrequencies: this.normalizedBuffer,
      timeDomainData: this.byteTimeDomainData,
      normalizedTimeDomain: this.normalizedTimeDomain,
      bands: { ...this.smoothedBands },
      overallEnergy,
      rms,
      bassEnergy,
      midEnergy,
      trebleEnergy,
    }
  }

  public reset(): void {
    this.smoothedBands = {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0,
    }
    this.byteFrequencyData.fill(0)
    this.normalizedBuffer.fill(0)
    this.byteTimeDomainData.fill(128)
    this.normalizedTimeDomain.fill(0)
  }
}
