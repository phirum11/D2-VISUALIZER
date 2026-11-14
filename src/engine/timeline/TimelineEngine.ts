import { TimecodeUtils } from './TimecodeUtils'
import { KeyframeEngine } from './KeyframeEngine'
import { TimelineTrack, TimelineClip } from './types'

export class TimelineEngine {
  private static instance: TimelineEngine | null = null

  private fps: number = 30
  private isScrubbing: boolean = false

  private constructor() {}

  public static getInstance(): TimelineEngine {
    if (!TimelineEngine.instance) {
      TimelineEngine.instance = new TimelineEngine()
    }
    return TimelineEngine.instance
  }

  public getFPS(): number {
    return this.fps
  }

  public setFPS(fps: number): void {
    this.fps = Math.max(1, fps)
  }

  public setScrubbing(scrubbing: boolean): void {
    this.isScrubbing = scrubbing
  }

  public getIsScrubbing(): boolean {
    return this.isScrubbing
  }

  /**
   * Advances or rewinds the playhead by exact frame intervals
   */
  public stepFrame(
    currentTime: number,
    direction: 1 | -1,
    duration: number,
    fps?: number
  ): number {
    const rate = fps || this.fps
    const currentFrame = TimecodeUtils.secondsToFrames(currentTime, rate)
    const targetFrame = Math.max(0, currentFrame + direction)
    const targetSeconds = TimecodeUtils.framesToSeconds(targetFrame, rate)
    return Math.min(duration, targetSeconds)
  }

  /**
   * Finds next marker after current timestamp
   */
  public getNextMarkerTime(
    currentTime: number,
    markers: { time: number }[]
  ): number | null {
    const sorted = [...markers].sort((a, b) => a.time - b.time)
    for (const m of sorted) {
      if (m.time > currentTime + 0.05) {
        return m.time
      }
    }
    return null
  }

  /**
   * Finds previous marker before current timestamp
   */
  public getPrevMarkerTime(
    currentTime: number,
    markers: { time: number }[]
  ): number | null {
    const sorted = [...markers].sort((a, b) => b.time - a.time)
    for (const m of sorted) {
      if (m.time < currentTime - 0.05) {
        return m.time
      }
    }
    return null
  }

  /**
   * Evaluates active clips on each track at current playhead time
   */
  public evaluateActiveClips(
    tracks: TimelineTrack[],
    time: number
  ): Map<string, TimelineClip> {
    const activeMap = new Map<string, TimelineClip>()
    for (const track of tracks) {
      if (!track.visible) continue
      for (const clip of track.clips) {
        if (time >= clip.startTime && time <= clip.startTime + clip.duration) {
          activeMap.set(track.type, clip)
          break
        }
      }
    }
    return activeMap
  }

  /**
   * Computes keyframe property overrides for an active clip at timestamp
   */
  public evaluateClipProperties(
    clip: TimelineClip,
    timestamp: number
  ): Record<string, number> {
    const values: Record<string, number> = {}
    if (!clip.keyframes) return values

    for (const kfTrack of clip.keyframes) {
      const val = KeyframeEngine.evaluate(clip, kfTrack.property, timestamp)
      if (val !== null) {
        values[kfTrack.property] = val
      }
    }
    return values
  }
}
