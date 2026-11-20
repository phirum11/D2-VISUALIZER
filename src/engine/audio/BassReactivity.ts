import type { AudioFrameData } from './FrequencyExtractor'

export interface BassReactivityConfig {
  enabled: boolean
  lowHz: number
  highHz: number
  gain: number
  threshold: number // Normalized FFT magnitude, not a calibrated audio dB value.
  attackMs: number
  releaseMs: number
  kickEmphasis: number
  holdMs: number
  mix: number
  pulseScale: number
  glowBoost: number
  sidechain: number // Ducks visual mid/treble response only.
}

export const DEFAULT_BASS_REACTIVITY: Readonly<BassReactivityConfig> = Object.freeze({
  enabled: false, lowHz: 20, highHz: 250, gain: 1.5, threshold: 0.12,
  attackMs: 10, releaseMs: 180, kickEmphasis: 0.5, holdMs: 60,
  mix: 0.8, pulseScale: 0.12, glowBoost: 12, sidechain: 0,
})

export const BASS_RESPONSE_PRESETS = [
  { id: 'tight-kick', name: 'Tight Kick', config: { lowHz: 35, highHz: 160, gain: 2, threshold: 0.18, attackMs: 3, releaseMs: 90, kickEmphasis: 1.2, holdMs: 45, pulseScale: 0.16, sidechain: 0.35 } },
  { id: 'deep-808', name: 'Deep 808', config: { lowHz: 20, highHz: 90, gain: 2.4, threshold: 0.08, attackMs: 20, releaseMs: 360, kickEmphasis: 0.2, holdMs: 100, pulseScale: 0.22, sidechain: 0.1 } },
  { id: 'club-pump', name: 'Club Pump', config: { lowHz: 30, highHz: 220, gain: 1.8, threshold: 0.14, attackMs: 5, releaseMs: 240, kickEmphasis: 0.8, holdMs: 80, pulseScale: 0.18, sidechain: 0.7 } },
  { id: 'subtle', name: 'Subtle', config: { lowHz: 30, highHz: 250, gain: 1.1, threshold: 0.1, attackMs: 35, releaseMs: 260, kickEmphasis: 0.15, holdMs: 30, pulseScale: 0.05, sidechain: 0 } },
] satisfies { id: string; name: string; config: Partial<BassReactivityConfig> }[]

function bounded(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback
}

export function normalizeBassConfig(value?: Partial<BassReactivityConfig> | null): BassReactivityConfig {
  const defaults = DEFAULT_BASS_REACTIVITY
  const lowHz = bounded(value?.lowHz, defaults.lowHz, 20, 490)
  return {
    enabled: value?.enabled === true,
    lowHz, highHz: bounded(value?.highHz, defaults.highHz, lowHz + 10, 500),
    gain: bounded(value?.gain, defaults.gain, 0.25, 4),
    threshold: bounded(value?.threshold, defaults.threshold, 0, 0.95),
    attackMs: bounded(value?.attackMs, defaults.attackMs, 1, 200),
    releaseMs: bounded(value?.releaseMs, defaults.releaseMs, 20, 1000),
    kickEmphasis: bounded(value?.kickEmphasis, defaults.kickEmphasis, 0, 2),
    holdMs: bounded(value?.holdMs, defaults.holdMs, 0, 300),
    mix: bounded(value?.mix, defaults.mix, 0, 1),
    pulseScale: bounded(value?.pulseScale, defaults.pulseScale, 0, 0.5),
    glowBoost: bounded(value?.glowBoost, defaults.glowBoost, 0, 40),
    sidechain: bounded(value?.sidechain, defaults.sidechain, 0, 1),
  }
}

export interface BassResponse { input: number; envelope: number; kick: number }

// One instance per render stream. Shared FFT arrays are never mutated.
export class BassEnvelopeFollower {
  private envelope = 0
  private previousInput = 0
  private heldPeak = 0
  private holdUntil = 0
  private lastTime: number | null = null
  private lastConfig: Partial<BassReactivityConfig> | null | undefined
  private config = normalizeBassConfig()
  private response: BassResponse = { input: 0, envelope: 0, kick: 0 }

  public process(frame: AudioFrameData, value: Partial<BassReactivityConfig> | undefined, time: number): BassResponse {
    if (value !== this.lastConfig) {
      this.config = normalizeBassConfig(value)
      this.lastConfig = value
      this.reset()
    }
    const config = this.config
    if (!config.enabled || !Number.isFinite(time)) { this.reset(); return this.response }
    if (this.lastTime !== null && (time < this.lastTime || time - this.lastTime > 1)) this.reset()
    if (time === this.lastTime) return this.response
    const dt = this.lastTime === null ? 1 / 60 : Math.max(0, time - this.lastTime)
    this.lastTime = time

    // rawFrequencies excludes the extractor's idle animation: silence cannot produce false kicks.
    const raw = frame.rawFrequencies
    const rate = frame.sampleRate ?? 44100
    const count = Math.min(raw.length, 16384)
    const hzPerBin = rate / (2 * Math.max(1, count))
    const first = Math.min(count, Math.max(1, Math.ceil(config.lowHz / hzPerBin)))
    const end = Math.min(count, Math.max(first + 1, Math.floor(config.highHz / hzPerBin) + 1))
    let sumSquares = 0
    for (let index = first; index < end; index++) sumSquares += (raw[index] / 255) ** 2
    const input = end > first ? Math.min(1, Math.sqrt(sumSquares / (end - first)) * config.gain) : 0
    const gated = Math.max(0, (input - config.threshold) / (1 - config.threshold))
    const kick = Math.min(1, Math.max(0, input - this.previousInput) * config.kickEmphasis * 3)
    this.previousInput = input
    const target = Math.min(1, gated + kick)
    if (target > this.heldPeak || time >= this.holdUntil) {
      this.heldPeak = target
      if (target > this.envelope) this.holdUntil = time + config.holdMs / 1000
    }
    const held = time < this.holdUntil ? Math.max(target, this.heldPeak) : target
    const tau = (held > this.envelope ? config.attackMs : config.releaseMs) / 1000
    this.envelope += (held - this.envelope) * (1 - Math.exp(-dt / tau))
    this.response = { input, envelope: this.envelope, kick }
    return this.response
  }

  public apply(frame: AudioFrameData, value: Partial<BassReactivityConfig> | undefined, time: number): AudioFrameData {
    const response = this.process(frame, value, time)
    if (!this.config.enabled) return frame
    const bass = frame.bassEnergy * (1 - this.config.mix) + response.envelope * this.config.mix
    const duck = 1 - response.envelope * this.config.sidechain
    return { ...frame, bassEnergy: bass,
      bands: { ...frame.bands, subBass: bass, bass, lowMid: frame.bands.lowMid * duck,
        mid: frame.bands.mid * duck, highMid: frame.bands.highMid * duck, treble: frame.bands.treble * duck },
      midEnergy: frame.midEnergy * duck, trebleEnergy: frame.trebleEnergy * duck,
    }
  }

  public getResponse(): Readonly<BassResponse> { return this.response }
  public getConfig(): Readonly<BassReactivityConfig> { return this.config }
  public reset(): void {
    this.envelope = this.previousInput = this.heldPeak = this.holdUntil = 0
    this.lastTime = null
    this.response = { input: 0, envelope: 0, kick: 0 }
  }
}
