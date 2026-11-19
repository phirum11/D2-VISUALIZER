import { TimelineTrack, TrackType, TimelineClip } from './types'

export class TrackManager {
  /**
   * Generates the 8 standard default tracks for a project
   */
  public static createDefaultTracks(
    duration: number = 198.0,
    audioName: string = 'Test Beat Track 128BPM.wav'
  ): TimelineTrack[] {
    const validDuration = Math.max(10, duration)

    return [
      {
        id: 'track-audio',
        name: 'Audio Master',
        type: 'audio-master',
        visible: true,
        locked: false,
        muted: false,
        volume: 1.0,
        height: 44,
        order: 0,
        clips: [
          {
            id: 'clip-audio-master',
            trackId: 'track-audio',
            name: audioName,
            type: 'audio-master',
            startTime: 0,
            duration: validDuration,
            offset: 0,
            color: '#6366f1',
          },
        ],
      },
      {
        id: 'track-visualizer',
        name: 'Audio Visualizer',
        type: 'visualizer',
        visible: true,
        locked: false,
        height: 44,
        order: 1,
        clips: [
          {
            id: 'clip-visualizer-main',
            trackId: 'track-visualizer',
            name: 'Modular Spectrum Visualizer',
            type: 'visualizer',
            startTime: 0,
            duration: validDuration,
            offset: 0,
            color: '#06b6d4',
          },
        ],
      },
      {
        id: 'track-background',
        name: 'Background Layer',
        type: 'background',
        visible: true,
        locked: false,
        height: 44,
        order: 2,
        clips: [
          {
            id: 'clip-bg-main',
            trackId: 'track-background',
            name: 'Background Video / Gradient',
            type: 'background',
            startTime: 0,
            duration: validDuration,
            offset: 0,
            color: '#3b82f6',
          },
        ],
      },
      {
        id: 'track-typography',
        name: 'Typography & Credits',
        type: 'typography',
        visible: true,
        locked: false,
        height: 44,
        order: 3,
        clips: [
          {
            id: 'clip-typo-main',
            trackId: 'track-typography',
            name: 'Title & Artist Overlay',
            type: 'typography',
            startTime: 0,
            duration: validDuration,
            offset: 0,
            color: '#a855f7',
          },
        ],
      },
      {
        id: 'track-artwork',
        name: 'Album Artwork',
        type: 'artwork',
        visible: true,
        locked: false,
        height: 44,
        order: 4,
        clips: [],
      },
      {
        id: 'track-logo',
        name: 'Logo / Watermark',
        type: 'logo',
        visible: true,
        locked: false,
        height: 44,
        order: 5,
        clips: [],
      },
      {
        id: 'track-particles',
        name: 'Ambient Particles',
        type: 'particles',
        visible: true,
        locked: false,
        height: 44,
        order: 6,
        clips: [],
      },
      {
        id: 'track-effects',
        name: 'Visual Effects',
        type: 'effects',
        visible: true,
        locked: false,
        height: 44,
        order: 7,
        clips: [],
      },
    ]
  }

  /**
   * Adds a new track to the timeline
   */
  public static addTrack(
    tracks: TimelineTrack[],
    type: TrackType,
    name?: string
  ): TimelineTrack[] {
    const defaultNames: Record<TrackType, string> = {
      'audio-master': 'Audio Track',
      visualizer: 'Visualizer Track',
      background: 'Background Track',
      typography: 'Typography Track',
      artwork: 'Artwork Track',
      logo: 'Logo Track',
      particles: 'Particles Track',
      effects: 'Effects Track',
    }

    const newTrack: TimelineTrack = {
      id: `track-${type}-${Date.now().toString(36)}`,
      name: name || defaultNames[type] || 'New Track',
      type,
      visible: true,
      locked: false,
      muted: false,
      volume: 1.0,
      height: 44,
      order: tracks.length,
      clips: [],
    }

    return [...tracks, newTrack]
  }

  /**
   * Deletes a track by ID
   */
  public static deleteTrack(tracks: TimelineTrack[], trackId: string): TimelineTrack[] {
    return tracks
      .filter((t) => t.id !== trackId)
      .map((t, idx) => ({ ...t, order: idx }))
  }

  /**
   * Reorders tracks from source index to target index
   */
  public static reorderTracks(
    tracks: TimelineTrack[],
    fromIndex: number,
    toIndex: number
  ): TimelineTrack[] {
    const list = [...tracks]
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    return list.map((t, idx) => ({ ...t, order: idx }))
  }

  /**
   * Toggles lock state for a track
   */
  public static toggleLock(tracks: TimelineTrack[], trackId: string): TimelineTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t))
  }

  /**
   * Toggles visibility for a track
   */
  public static toggleVisibility(tracks: TimelineTrack[], trackId: string): TimelineTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t))
  }

  /**
   * Toggles mute for an audio track
   */
  public static toggleMute(tracks: TimelineTrack[], trackId: string): TimelineTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
  }

  /**
   * Renames a track
   */
  public static renameTrack(
    tracks: TimelineTrack[],
    trackId: string,
    newName: string
  ): TimelineTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, name: newName } : t))
  }

  /**
   * Gathers all active clips across all visible tracks at a specific timestamp
   */
  public static getActiveClipsAtTime(
    tracks: TimelineTrack[],
    timestamp: number
  ): TimelineClip[] {
    const active: TimelineClip[] = []
    for (const track of tracks) {
      if (!track.visible) continue
      for (const clip of track.clips) {
        if (timestamp >= clip.startTime && timestamp <= clip.startTime + clip.duration) {
          active.push(clip)
        }
      }
    }
    return active
  }

  /**
   * Collects all potential snap boundary times across clips, markers, playhead, and project ends
   */
  public static getAllSnapPoints(
    tracks: TimelineTrack[],
    markers: { time: number }[] = [],
    playheadTime: number = 0,
    projectDuration: number = 0
  ): number[] {
    const points = new Set<number>()
    points.add(0)
    if (projectDuration > 0) points.add(projectDuration)
    if (playheadTime >= 0) points.add(playheadTime)

    for (const marker of markers) {
      points.add(marker.time)
    }

    for (const track of tracks) {
      for (const clip of track.clips) {
        points.add(clip.startTime)
        points.add(clip.startTime + clip.duration)
      }
    }

    return Array.from(points).sort((a, b) => a - b)
  }
}
