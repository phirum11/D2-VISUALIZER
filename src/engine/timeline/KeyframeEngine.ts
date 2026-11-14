import {
  TimelineClip,
  KeyframeProperty,
  Keyframe,
  KeyframeTrack,
  KeyframeInterpolation,
} from './types'

export class KeyframeEngine {
  /**
   * Evaluates the interpolated value of a property at a specific timeline timestamp
   */
  public static evaluate(
    clip: TimelineClip,
    property: KeyframeProperty,
    timelineTime: number
  ): number | null {
    if (!clip.keyframes || clip.keyframes.length === 0) return null

    const track = clip.keyframes.find((k) => k.property === property)
    if (!track || track.keyframes.length === 0) return null

    // Compute relative time inside clip
    const relTime = timelineTime - clip.startTime
    const sorted = [...track.keyframes].sort((a, b) => a.time - b.time)

    // Before first keyframe
    if (relTime <= sorted[0].time) {
      return sorted[0].value
    }

    // After last keyframe
    if (relTime >= sorted[sorted.length - 1].time) {
      return sorted[sorted.length - 1].value
    }

    // Find surrounding keyframe pair
    for (let i = 0; i < sorted.length - 1; i++) {
      const k0 = sorted[i]
      const k1 = sorted[i + 1]

      if (relTime >= k0.time && relTime <= k1.time) {
        const span = k1.time - k0.time
        if (span <= 0) return k0.value

        const rawT = (relTime - k0.time) / span
        const easedT = this.applyEasing(rawT, k0.easing)

        return k0.value + (k1.value - k0.value) * easedT
      }
    }

    return sorted[0].value
  }

  /**
   * Applies easing curve to normalized parameter t in [0, 1]
   */
  public static applyEasing(t: number, easing: KeyframeInterpolation): number {
    const clamped = Math.max(0, Math.min(1, t))
    switch (easing) {
      case 'ease-in':
        return clamped * clamped
      case 'ease-out':
        return 1 - (1 - clamped) * (1 - clamped)
      case 'ease-in-out':
        return clamped < 0.5
          ? 2 * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 2) / 2
      case 'bezier':
        // Standard smooth cubic hermite curve
        return clamped * clamped * (3 - 2 * clamped)
      case 'linear':
      default:
        return clamped
    }
  }

  /**
   * Adds or updates a keyframe on a clip for a specified property
   */
  public static addKeyframe(
    clip: TimelineClip,
    property: KeyframeProperty,
    time: number,
    value: number,
    easing: KeyframeInterpolation = 'linear'
  ): TimelineClip {
    const tracks: KeyframeTrack[] = clip.keyframes ? [...clip.keyframes] : []
    const trackIndex = tracks.findIndex((t) => t.property === property)

    const newKf: Keyframe = {
      id: `kf-${property}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: Math.max(0, Math.min(clip.duration, time)),
      value,
      easing,
    }

    if (trackIndex >= 0) {
      const existing = tracks[trackIndex]
      // Replace existing keyframe if at same timestamp (within 0.02s)
      const filtered = existing.keyframes.filter((k) => Math.abs(k.time - time) > 0.02)
      tracks[trackIndex] = {
        ...existing,
        keyframes: [...filtered, newKf].sort((a, b) => a.time - b.time),
      }
    } else {
      tracks.push({
        property,
        keyframes: [newKf],
      })
    }

    return {
      ...clip,
      keyframes: tracks,
    }
  }

  /**
   * Removes a keyframe by ID from a clip
   */
  public static removeKeyframe(
    clip: TimelineClip,
    property: KeyframeProperty,
    keyframeId: string
  ): TimelineClip {
    if (!clip.keyframes) return clip

    const tracks = clip.keyframes.map((t) => {
      if (t.property === property) {
        return {
          ...t,
          keyframes: t.keyframes.filter((k) => k.id !== keyframeId),
        }
      }
      return t
    })

    return {
      ...clip,
      keyframes: tracks.filter((t) => t.keyframes.length > 0),
    }
  }
}
