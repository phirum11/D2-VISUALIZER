import { TimelineClip, TimelineTrack, KeyframeTrack } from './types'

export class ClipManager {
  /**
   * Snaps a target time to the nearest snap point if within threshold (pixels converted to seconds)
   */
  public static findSnapPoint(
    targetTime: number,
    snapPoints: number[],
    zoom: number,
    thresholdPx: number = 8
  ): { snappedTime: number; didSnap: boolean } {
    if (!snapPoints || snapPoints.length === 0) {
      return { snappedTime: targetTime, didSnap: false }
    }

    const thresholdSec = thresholdPx / Math.max(1, zoom)
    let closestDist = Infinity
    let closestPoint = targetTime

    for (const point of snapPoints) {
      const dist = Math.abs(targetTime - point)
      if (dist <= thresholdSec && dist < closestDist) {
        closestDist = dist
        closestPoint = point
      }
    }

    if (closestDist <= thresholdSec) {
      return { snappedTime: closestPoint, didSnap: true }
    }

    return { snappedTime: targetTime, didSnap: false }
  }

  /**
   * Moves a clip to a new start time, checking for track locks and snapping
   */
  public static moveClip(
    track: TimelineTrack,
    clipId: string,
    newStartTime: number,
    snapPoints: number[] = [],
    zoom: number = 10,
    snapEnabled: boolean = true
  ): TimelineTrack {
    if (track.locked) return track

    const clip = track.clips.find((c) => c.id === clipId)
    if (!clip) return track

    let finalStart = Math.max(0, newStartTime)

    if (snapEnabled && snapPoints.length > 0) {
      // Check snap for clip start
      const snapStart = this.findSnapPoint(finalStart, snapPoints, zoom)
      // Check snap for clip end
      const snapEnd = this.findSnapPoint(finalStart + clip.duration, snapPoints, zoom)

      if (snapStart.didSnap) {
        finalStart = snapStart.snappedTime
      } else if (snapEnd.didSnap) {
        finalStart = Math.max(0, snapEnd.snappedTime - clip.duration)
      }
    }

    const updatedClips = track.clips.map((c) =>
      c.id === clipId ? { ...c, startTime: finalStart } : c
    )

    return {
      ...track,
      clips: updatedClips.sort((a, b) => a.startTime - b.startTime),
    }
  }

  /**
   * Trims the left boundary of a clip (in-point)
   */
  public static trimClipLeft(
    track: TimelineTrack,
    clipId: string,
    requestedStart: number,
    minDuration: number = 0.1
  ): TimelineTrack {
    if (track.locked) return track

    const clip = track.clips.find((c) => c.id === clipId)
    if (!clip) return track

    const currentEnd = clip.startTime + clip.duration
    // Clamp so clip cannot be trimmed shorter than minDuration
    const maxStart = currentEnd - minDuration
    const newStart = Math.max(0, Math.min(maxStart, requestedStart))
    const delta = newStart - clip.startTime

    const updatedClips = track.clips.map((c) => {
      if (c.id === clipId) {
        return {
          ...c,
          startTime: newStart,
          offset: Math.max(0, (c.offset || 0) + delta),
          duration: currentEnd - newStart,
        }
      }
      return c
    })

    return { ...track, clips: updatedClips }
  }

  /**
   * Trims the right boundary of a clip (out-point / duration)
   */
  public static trimClipRight(
    track: TimelineTrack,
    clipId: string,
    requestedDuration: number,
    minDuration: number = 0.1
  ): TimelineTrack {
    if (track.locked) return track

    const clip = track.clips.find((c) => c.id === clipId)
    if (!clip) return track

    const newDuration = Math.max(minDuration, requestedDuration)

    const updatedClips = track.clips.map((c) => {
      if (c.id === clipId) {
        return { ...c, duration: newDuration }
      }
      return c
    })

    return { ...track, clips: updatedClips }
  }

  /**
   * Splits a clip at playhead position into two adjacent clips
   */
  public static splitClip(
    track: TimelineTrack,
    clipId: string,
    splitTime: number
  ): { track: TimelineTrack; left: TimelineClip; right: TimelineClip } | null {
    if (track.locked) return null

    const clip = track.clips.find((c) => c.id === clipId)
    if (!clip) return null

    // Split time must be strictly inside the clip
    const clipEnd = clip.startTime + clip.duration
    if (splitTime <= clip.startTime + 0.05 || splitTime >= clipEnd - 0.05) {
      return null
    }

    const leftDuration = splitTime - clip.startTime
    const rightDuration = clipEnd - splitTime
    const rightOffset = (clip.offset || 0) + leftDuration

    // Split keyframes between left and right clips
    const leftKeyframes: KeyframeTrack[] = []
    const rightKeyframes: KeyframeTrack[] = []

    if (clip.keyframes) {
      for (const kfTrack of clip.keyframes) {
        const leftKfs = kfTrack.keyframes.filter((k) => k.time <= leftDuration)
        const rightKfs = kfTrack.keyframes
          .filter((k) => k.time > leftDuration)
          .map((k) => ({ ...k, time: k.time - leftDuration }))

        if (leftKfs.length > 0) {
          leftKeyframes.push({ property: kfTrack.property, keyframes: leftKfs })
        }
        if (rightKfs.length > 0) {
          rightKeyframes.push({ property: kfTrack.property, keyframes: rightKfs })
        }
      }
    }

    const leftClip: TimelineClip = {
      ...clip,
      id: `${clip.id}-L-${Date.now().toString(36)}`,
      duration: leftDuration,
      keyframes: leftKeyframes,
    }

    const rightClip: TimelineClip = {
      ...clip,
      id: `${clip.id}-R-${(Date.now() + 1).toString(36)}`,
      name: `${clip.name} (Part 2)`,
      startTime: splitTime,
      duration: rightDuration,
      offset: rightOffset,
      keyframes: rightKeyframes,
    }

    const remainingClips = track.clips.filter((c) => c.id !== clipId)
    const newClips = [...remainingClips, leftClip, rightClip].sort(
      (a, b) => a.startTime - b.startTime
    )

    return {
      track: { ...track, clips: newClips },
      left: leftClip,
      right: rightClip,
    }
  }

  /**
   * Duplicates a clip and positions it immediately following the source clip
   */
  public static duplicateClip(
    track: TimelineTrack,
    clipId: string
  ): { track: TimelineTrack; duplicated: TimelineClip } | null {
    if (track.locked) return null

    const clip = track.clips.find((c) => c.id === clipId)
    if (!clip) return null

    const duplicated: TimelineClip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `clip-${clip.type}-${Date.now().toString(36)}`,
      name: `${clip.name} (Copy)`,
      startTime: clip.startTime + clip.duration,
    }

    const newClips = [...track.clips, duplicated].sort((a, b) => a.startTime - b.startTime)
    return {
      track: { ...track, clips: newClips },
      duplicated,
    }
  }

  /**
   * Deletes a clip from a track
   */
  public static deleteClip(track: TimelineTrack, clipId: string): TimelineTrack {
    if (track.locked) return track
    return {
      ...track,
      clips: track.clips.filter((c) => c.id !== clipId),
    }
  }
}
