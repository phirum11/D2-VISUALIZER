/**
 * Timecode and frame calculation utilities for D2 VISUALIZER.
 * Provides frame-accurate conversions across timecode, seconds, and frame counts.
 */
export class TimecodeUtils {
  /**
   * Converts seconds into standard SMPTE timecode string (HH:MM:SS:FF)
   */
  public static secondsToTimecode(seconds: number, fps: number = 30): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0
    const totalFrames = Math.floor(seconds * fps)
    const frames = totalFrames % fps
    const totalSeconds = Math.floor(totalFrames / fps)
    const secs = totalSeconds % 60
    const totalMinutes = Math.floor(totalSeconds / 60)
    const mins = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60)

    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`
  }

  /**
   * Converts seconds into compact display timecode (MM:SS:FF)
   */
  public static secondsToCompactTimecode(seconds: number, fps: number = 30): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0
    const totalFrames = Math.floor(seconds * fps)
    const frames = totalFrames % fps
    const totalSeconds = Math.floor(totalFrames / fps)
    const secs = totalSeconds % 60
    const mins = Math.floor(totalSeconds / 60)

    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(mins)}:${pad(secs)}:${pad(frames)}`
  }

  /**
   * Parses timecode string (HH:MM:SS:FF or MM:SS:FF) into seconds
   */
  public static timecodeToSeconds(timecode: string, fps: number = 30): number {
    const parts = timecode.split(':').map((p) => parseInt(p, 10) || 0)
    if (parts.length === 4) {
      const [h, m, s, f] = parts
      return h * 3600 + m * 60 + s + f / fps
    }
    if (parts.length === 3) {
      const [m, s, f] = parts
      return m * 60 + s + f / fps
    }
    if (parts.length === 2) {
      const [m, s] = parts
      return m * 60 + s
    }
    return 0
  }

  /**
   * Converts seconds to exact integer frame index
   */
  public static secondsToFrames(seconds: number, fps: number = 30): number {
    return Math.floor(Math.max(0, seconds) * fps)
  }

  /**
   * Converts frame index to exact seconds
   */
  public static framesToSeconds(frames: number, fps: number = 30): number {
    return Math.max(0, frames) / fps
  }

  /**
   * Snaps a timestamp to the closest discrete frame boundary
   */
  public static snapToFrame(seconds: number, fps: number = 30): number {
    return Math.round(seconds * fps) / fps
  }

  /**
   * Formats seconds into human-readable duration (e.g. 03:24.5)
   */
  public static formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00.0'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const tenths = Math.floor((seconds % 1) * 10)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`
  }
}
