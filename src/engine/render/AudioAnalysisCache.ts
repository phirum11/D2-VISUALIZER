import { AudioBands, AudioFrameData } from '../audio/FrequencyExtractor'

export interface AnalysisProgress {
  currentFrame: number
  totalFrames: number
  progress: number
}

/**
 * Pre-analyzes an entire AudioBuffer and caches frame-accurate FFT analysis data
 * for deterministic offline rendering decoupled from real-time audio playback.
 */
export class AudioAnalysisCache {
  private frames: AudioFrameData[] = []
  private sampleRate: number = 44100
  private fps: number = 30
  private duration: number = 0
  private totalFrames: number = 0
  private fftSize: number = 2048

  public isReady: boolean = false

  constructor(fftSize: number = 2048) {
    this.fftSize = fftSize
  }

  /**
   * Pre-analyzes an AudioBuffer for the given frame rate and duration
   */
  public async analyzeBuffer(
    buffer: AudioBuffer | null,
    fps: number = 30,
    targetDuration?: number,
    onProgress?: (p: AnalysisProgress) => void
  ): Promise<void> {
    this.fps = fps
    this.frames = []

    if (!buffer) {
      // Generate synthetic beat analysis frames if no buffer is provided (e.g. synth demo)
      this.sampleRate = 44100
      this.duration = targetDuration || 10
      this.totalFrames = Math.max(1, Math.ceil(this.duration * this.fps))
      this.generateSyntheticFrames(onProgress)
      this.isReady = true
      return
    }

    this.sampleRate = buffer.sampleRate
    this.duration = targetDuration && targetDuration > 0 ? targetDuration : buffer.duration
    this.totalFrames = Math.max(1, Math.ceil(this.duration * this.fps))

    // Use channel 0 (or downmix stereo)
    const channel0 = buffer.getChannelData(0)
    const channel1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : channel0
    const totalSamples = buffer.length

    // Downmix if stereo
    const pcm = new Float32Array(totalSamples)
    if (buffer.numberOfChannels > 1) {
      for (let i = 0; i < totalSamples; i++) {
        pcm[i] = (channel0[i] + channel1[i]) * 0.5
      }
    } else {
      pcm.set(channel0)
    }

    // Precompute Hann window
    const N = this.fftSize
    const hann = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)))
    }

    // Allocate FFT workspace
    const real = new Float32Array(N)
    const imag = new Float32Array(N)
    const binCount = N / 2
    const nyquist = this.sampleRate / 2

    // Helper to map Hz to FFT bin index
    const hzToBin = (hz: number): number => {
      const bin = Math.round((hz / nyquist) * binCount)
      return Math.max(0, Math.min(binCount - 1, bin))
    }

    const subBassStart = hzToBin(20), subBassEnd = Math.max(subBassStart + 1, hzToBin(60))
    const bassStart = hzToBin(60), bassEnd = Math.max(bassStart + 1, hzToBin(250))
    const lowMidStart = hzToBin(250), lowMidEnd = Math.max(lowMidStart + 1, hzToBin(500))
    const midStart = hzToBin(500), midEnd = Math.max(midStart + 1, hzToBin(2000))
    const highMidStart = hzToBin(2000), highMidEnd = Math.max(highMidStart + 1, hzToBin(6000))
    const trebleStart = hzToBin(6000), trebleEnd = Math.max(trebleStart + 1, hzToBin(20000))

    // Helper to compute band energy
    const getBandEnergy = (rawFreq: Uint8Array, start: number, end: number): number => {
      let sum = 0
      for (let i = start; i < end; i++) {
        sum += rawFreq[i]
      }
      const count = end - start
      return count > 0 ? Math.min(1.0, sum / (count * 255)) : 0
    }

    // EMA smoothing state
    const smoothedBands: AudioBands = {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0,
    }

    const applyEma = (cur: number, target: number): number => {
      const rate = target > cur ? 0.85 : 0.2 * (1 - 0.7)
      return cur + (target - cur) * rate
    }

    // Process frames in chunked batches so the UI remains responsive
    const batchSize = 60
    for (let f = 0; f < this.totalFrames; f++) {
      const time = f / this.fps
      const centerSample = Math.floor(time * this.sampleRate)

      // Windowing & Time-domain extraction
      const rawTimeDomain = new Uint8Array(binCount)
      const normTimeDomain = new Float32Array(binCount)
      let rmsSum = 0

      for (let i = 0; i < N; i++) {
        const sampleIdx = centerSample - Math.floor(N / 2) + i
        const sampleVal = sampleIdx >= 0 && sampleIdx < totalSamples ? pcm[sampleIdx] : 0
        real[i] = sampleVal * hann[i]
        imag[i] = 0

        // Capture time domain for the first binCount samples
        if (i < binCount) {
          const val = sampleVal
          rmsSum += val * val
          normTimeDomain[i] = val
          rawTimeDomain[i] = Math.max(0, Math.min(255, Math.floor((val + 1) * 127.5)))
        }
      }

      // Fast Radix-2 In-place FFT
      this.radix2FFT(real, imag)

      // Frequency magnitude extraction
      const rawFrequencies = new Uint8Array(binCount)
      const normalizedFrequencies = new Float32Array(binCount)
      let freqSum = 0

      for (let i = 0; i < binCount; i++) {
        // Linear magnitude scaled with logarithmic dB approximation
        const r = real[i]
        const im = imag[i]
        const mag = Math.sqrt(r * r + im * im) / N
        // Convert to pseudo-dB [0, 255]
        const db = 20 * Math.log10(Math.max(1e-5, mag))
        // Typical dynamic range: -80 dB to 0 dB
        const norm = Math.max(0, Math.min(1.0, (db + 80) / 75))
        normalizedFrequencies[i] = norm
        rawFrequencies[i] = Math.floor(norm * 255)
        freqSum += norm
      }

      // 6-Band Extraction
      const rawSub = getBandEnergy(rawFrequencies, subBassStart, subBassEnd)
      const rawB = getBandEnergy(rawFrequencies, bassStart, bassEnd)
      const rawLM = getBandEnergy(rawFrequencies, lowMidStart, lowMidEnd)
      const rawM = getBandEnergy(rawFrequencies, midStart, midEnd)
      const rawHM = getBandEnergy(rawFrequencies, highMidStart, highMidEnd)
      const rawT = getBandEnergy(rawFrequencies, trebleStart, trebleEnd)

      smoothedBands.subBass = applyEma(smoothedBands.subBass, rawSub)
      smoothedBands.bass = applyEma(smoothedBands.bass, rawB)
      smoothedBands.lowMid = applyEma(smoothedBands.lowMid, rawLM)
      smoothedBands.mid = applyEma(smoothedBands.mid, rawM)
      smoothedBands.highMid = applyEma(smoothedBands.highMid, rawHM)
      smoothedBands.treble = applyEma(smoothedBands.treble, rawT)

      const overallEnergy = binCount > 0 ? freqSum / binCount : 0
      const rms = Math.sqrt(rmsSum / binCount)
      const bassEnergy = (smoothedBands.subBass * 0.6 + smoothedBands.bass * 0.4)
      const midEnergy = (smoothedBands.lowMid * 0.4 + smoothedBands.mid * 0.6)
      const trebleEnergy = (smoothedBands.highMid * 0.3 + smoothedBands.treble * 0.7)

      this.frames.push({
        sampleRate: this.sampleRate,
        rawFrequencies,
        normalizedFrequencies,
        timeDomainData: rawTimeDomain,
        normalizedTimeDomain: normTimeDomain,
        bands: { ...smoothedBands },
        overallEnergy,
        rms,
        bassEnergy,
        midEnergy,
        trebleEnergy,
      })

      if (f % batchSize === 0) {
        onProgress?.({
          currentFrame: f,
          totalFrames: this.totalFrames,
          progress: f / this.totalFrames,
        })
        // Allow microtask yield
        await new Promise((r) => setTimeout(r, 0))
      }
    }

    onProgress?.({
      currentFrame: this.totalFrames,
      totalFrames: this.totalFrames,
      progress: 1.0,
    })

    this.isReady = true
  }

  /**
   * Generates deterministic synthetic beat analysis frames (e.g. for demo mode)
   */
  private generateSyntheticFrames(onProgress?: (p: AnalysisProgress) => void): void {
    const binCount = this.fftSize / 2
    const bpm = 128
    const secondsPerBeat = 60 / bpm

    for (let f = 0; f < this.totalFrames; f++) {
      const time = f / this.fps
      const beatFraction = (time % secondsPerBeat) / secondsPerBeat
      const isKick = beatFraction < 0.2
      const isHat = Math.abs(beatFraction - 0.5) < 0.15

      const bassFactor = isKick ? Math.max(0, 1 - beatFraction * 4.5) : 0.05
      const trebleFactor = isHat ? 0.8 : 0.15
      const midFactor = 0.3 + 0.2 * Math.sin(time * 3.0)

      const rawFrequencies = new Uint8Array(binCount)
      const normalizedFrequencies = new Float32Array(binCount)
      const rawTimeDomain = new Uint8Array(binCount)
      const normalizedTimeDomain = new Float32Array(binCount)

      for (let i = 0; i < binCount; i++) {
        const freqRatio = i / binCount
        let mag = 0
        if (freqRatio < 0.1) mag = bassFactor
        else if (freqRatio < 0.4) mag = midFactor
        else mag = trebleFactor

        mag = Math.max(0, Math.min(1, mag * (1 - freqRatio * 0.4)))
        normalizedFrequencies[i] = mag
        rawFrequencies[i] = Math.floor(mag * 255)

        const wave = Math.sin(i * 0.1 + time * 10) * (isKick ? 0.8 : 0.2)
        normalizedTimeDomain[i] = wave
        rawTimeDomain[i] = Math.floor((wave + 1) * 127.5)
      }

      this.frames.push({
        sampleRate: this.sampleRate,
        rawFrequencies,
        normalizedFrequencies,
        timeDomainData: rawTimeDomain,
        normalizedTimeDomain,
        bands: {
          subBass: bassFactor * 0.9,
          bass: bassFactor,
          lowMid: midFactor * 0.7,
          mid: midFactor,
          highMid: trebleFactor * 0.6,
          treble: trebleFactor,
        },
        overallEnergy: (bassFactor + midFactor + trebleFactor) / 3,
        rms: bassFactor * 0.6 + 0.1,
        bassEnergy: bassFactor,
        midEnergy: midFactor,
        trebleEnergy: trebleFactor,
      })
    }

    onProgress?.({
      currentFrame: this.totalFrames,
      totalFrames: this.totalFrames,
      progress: 1.0,
    })
  }

  /**
   * Cooley-Tukey Radix-2 Decimation-in-Time FFT
   */
  private radix2FFT(re: Float32Array, im: Float32Array): void {
    const n = re.length
    if ((n & (n - 1)) !== 0) return // Must be power of 2

    // Bit-reversal permutation
    let j = 0
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tr = re[i]
        re[i] = re[j]
        re[j] = tr
        const ti = im[i]
        im[i] = im[j]
        im[j] = ti
      }
      let k = n >> 1
      while (k <= j) {
        j -= k
        k >>= 1
      }
      j += k
    }

    // Butterfly calculations
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1
      const angle = (-2 * Math.PI) / len
      const wStepR = Math.cos(angle)
      const wStepI = Math.sin(angle)

      for (let i = 0; i < n; i += len) {
        let wR = 1.0
        let wI = 0.0
        for (let k = 0; k < halfLen; k++) {
          const uR = re[i + k]
          const uI = im[i + k]
          const vR = re[i + k + halfLen] * wR - im[i + k + halfLen] * wI
          const vI = re[i + k + halfLen] * wI + im[i + k + halfLen] * wR

          re[i + k] = uR + vR
          im[i + k] = uI + vI
          re[i + k + halfLen] = uR - vR
          im[i + k + halfLen] = uI - vI

          const nextWR = wR * wStepR - wI * wStepI
          wI = wR * wStepI + wI * wStepR
          wR = nextWR
        }
      }
    }
  }

  /**
   * Retrieves the frame-accurate AudioFrameData at timestamp t
   */
  public getFrameAtTime(time: number): AudioFrameData {
    if (this.frames.length === 0) {
      return this.getEmptyFrame()
    }
    const idx = Math.max(0, Math.min(this.frames.length - 1, Math.floor(time * this.fps)))
    return this.frames[idx]
  }

  /**
   * Retrieves the frame-accurate AudioFrameData at frame index
   */
  public getFrameAtIndex(index: number): AudioFrameData {
    if (this.frames.length === 0) {
      return this.getEmptyFrame()
    }
    const idx = Math.max(0, Math.min(this.frames.length - 1, index))
    return this.frames[idx]
  }

  public getTotalFrames(): number {
    return this.frames.length
  }

  public getDuration(): number {
    return this.duration
  }

  private getEmptyFrame(): AudioFrameData {
    const binCount = this.fftSize / 2
    return {
      rawFrequencies: new Uint8Array(binCount),
      normalizedFrequencies: new Float32Array(binCount),
      timeDomainData: new Uint8Array(binCount),
      normalizedTimeDomain: new Float32Array(binCount),
      bands: { subBass: 0, bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
      overallEnergy: 0,
      rms: 0,
      bassEnergy: 0,
      midEnergy: 0,
      trebleEnergy: 0,
    }
  }

  public clear(): void {
    this.frames = []
    this.isReady = false
  }
}
