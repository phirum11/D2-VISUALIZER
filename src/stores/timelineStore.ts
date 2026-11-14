import { create } from 'zustand'
import {
  TimelineTrack,
  TimelineClip,
  TimelineMarker,
  TimelineTool,
  TrackType,
  KeyframeProperty,
  KeyframeInterpolation,
} from '@/engine/timeline/types'
import { TrackManager } from '@/engine/timeline/TrackManager'
import { ClipManager } from '@/engine/timeline/ClipManager'
import { TimelineHistory } from '@/engine/timeline/TimelineHistory'
import { KeyframeEngine } from '@/engine/timeline/KeyframeEngine'

export interface TimelineState {
  tracks: TimelineTrack[]
  markers: TimelineMarker[]
  fps: number
  zoom: number // pixels per second
  scrollLeft: number
  selectedClipId: string | null
  selectedTrackId: string | null
  activeTool: TimelineTool
  snapEnabled: boolean
  clipboardClip: TimelineClip | null
  canUndo: boolean
  canRedo: boolean

  // Track Actions
  addTrack: (type: TrackType, name?: string) => void
  deleteTrack: (trackId: string) => void
  reorderTracks: (fromIndex: number, toIndex: number) => void
  toggleTrackLock: (trackId: string) => void
  toggleTrackVisibility: (trackId: string) => void
  toggleTrackMute: (trackId: string) => void
  renameTrack: (trackId: string, name: string) => void
  syncTracksWithDuration: (duration: number, audioName?: string) => void

  // Clip Actions
  selectClip: (clipId: string | null) => void
  moveClip: (clipId: string, newStartTime: number) => void
  trimClipLeft: (clipId: string, newStartTime: number) => void
  trimClipRight: (clipId: string, newDuration: number) => void
  splitClipAtTime: (clipId: string, splitTime: number) => void
  splitAtPlayhead: (currentTime: number) => void
  duplicateClip: (clipId: string) => void
  deleteClip: (clipId: string) => void
  copyClip: (clipId: string) => void
  pasteClip: (currentTime: number) => void
  addKeyframeToClip: (
    clipId: string,
    property: KeyframeProperty,
    time: number,
    value: number,
    easing?: KeyframeInterpolation
  ) => void
  removeKeyframeFromClip: (
    clipId: string,
    property: KeyframeProperty,
    keyframeId: string
  ) => void

  // Marker Actions
  addMarker: (time: number, name?: string, color?: string) => void
  deleteMarker: (id: string) => void
  renameMarker: (id: string, name: string) => void

  // Navigation & Tool Actions
  setZoom: (zoom: number) => void
  setScrollLeft: (scroll: number) => void
  setActiveTool: (tool: TimelineTool) => void
  toggleSnap: () => void
  fitToProject: (duration: number, containerWidth: number) => void

  // History Actions
  undo: () => void
  redo: () => void
}

const history = new TimelineHistory(60)

const initialTracks = TrackManager.createDefaultTracks(198.0)

export const useTimelineStore = create<TimelineState>((set, get) => ({
  tracks: initialTracks,
  markers: [
    { id: 'marker-intro', time: 0, name: 'Intro', color: '#6366f1' },
    { id: 'marker-drop', time: 15.0, name: 'Main Drop', color: '#06b6d4' },
    { id: 'marker-bridge', time: 64.0, name: 'Bridge', color: '#f59e0b' },
  ],
  fps: 30,
  zoom: 12,
  scrollLeft: 0,
  selectedClipId: 'clip-audio-master',
  selectedTrackId: 'track-audio',
  activeTool: 'select',
  snapEnabled: true,
  clipboardClip: null,
  canUndo: false,
  canRedo: false,

  // Helper to commit snapshot before mutation
  ...(() => {
    const saveHistory = () => {
      const { tracks, markers, selectedClipId } = get()
      history.pushState({ tracks, markers, selectedClipId })
      set({ canUndo: history.canUndo(), canRedo: history.canRedo() })
    }

    return {
      addTrack: (type, name) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.addTrack(s.tracks, type, name) }))
      },

      deleteTrack: (trackId) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.deleteTrack(s.tracks, trackId) }))
      },

      reorderTracks: (fromIndex, toIndex) => {
        saveHistory()
        set((s) => ({
          tracks: TrackManager.reorderTracks(s.tracks, fromIndex, toIndex),
        }))
      },

      toggleTrackLock: (trackId) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.toggleLock(s.tracks, trackId) }))
      },

      toggleTrackVisibility: (trackId) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.toggleVisibility(s.tracks, trackId) }))
      },

      toggleTrackMute: (trackId) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.toggleMute(s.tracks, trackId) }))
      },

      renameTrack: (trackId, name) => {
        saveHistory()
        set((s) => ({ tracks: TrackManager.renameTrack(s.tracks, trackId, name) }))
      },

      syncTracksWithDuration: (duration, audioName) => {
        const { tracks } = get()
        const updated = tracks.map((t) => {
          if (t.clips.length === 1 && t.clips[0].startTime === 0) {
            return {
              ...t,
              clips: [
                {
                  ...t.clips[0],
                  name: t.type === 'audio-master' && audioName ? audioName : t.clips[0].name,
                  duration: Math.max(1, duration),
                },
              ],
            }
          }
          return t
        })
        set({ tracks: updated })
      },

      selectClip: (clipId) => {
        const { tracks } = get()
        let trackId: string | null = null
        if (clipId) {
          for (const t of tracks) {
            if (t.clips.some((c) => c.id === clipId)) {
              trackId = t.id
              break
            }
          }
        }
        set({ selectedClipId: clipId, selectedTrackId: trackId })
      },

      moveClip: (clipId, newStartTime) => {
        saveHistory()
        const { tracks, markers, zoom, snapEnabled } = get()
        const snapPoints = snapEnabled
          ? TrackManager.getAllSnapPoints(tracks, markers)
          : []

        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            return ClipManager.moveClip(
              track,
              clipId,
              newStartTime,
              snapPoints,
              zoom,
              snapEnabled
            )
          }
          return track
        })
        set({ tracks: updated })
      },

      trimClipLeft: (clipId, newStartTime) => {
        saveHistory()
        const { tracks } = get()
        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            return ClipManager.trimClipLeft(track, clipId, newStartTime)
          }
          return track
        })
        set({ tracks: updated })
      },

      trimClipRight: (clipId, newDuration) => {
        saveHistory()
        const { tracks } = get()
        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            return ClipManager.trimClipRight(track, clipId, newDuration)
          }
          return track
        })
        set({ tracks: updated })
      },

      splitClipAtTime: (clipId, splitTime) => {
        saveHistory()
        const { tracks } = get()
        let createdPart2Id: string | null = null

        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            const res = ClipManager.splitClip(track, clipId, splitTime)
            if (res) {
              createdPart2Id = res.right.id
              return res.track
            }
          }
          return track
        })

        set({
          tracks: updated,
          selectedClipId: createdPart2Id || clipId,
        })
      },

      splitAtPlayhead: (currentTime) => {
        const { selectedClipId, tracks } = get()
        if (!selectedClipId) return

        let targetTrack: TimelineTrack | null = null
        for (const t of tracks) {
          if (t.clips.some((c) => c.id === selectedClipId)) {
            targetTrack = t
            break
          }
        }
        if (!targetTrack || targetTrack.locked) return

        get().splitClipAtTime(selectedClipId, currentTime)
      },

      duplicateClip: (clipId) => {
        saveHistory()
        const { tracks } = get()
        let newSelectedId: string | null = null

        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            const res = ClipManager.duplicateClip(track, clipId)
            if (res) {
              newSelectedId = res.duplicated.id
              return res.track
            }
          }
          return track
        })

        set({
          tracks: updated,
          selectedClipId: newSelectedId || clipId,
        })
      },

      deleteClip: (clipId) => {
        saveHistory()
        const { tracks } = get()
        const updated = tracks.map((track) => {
          if (track.clips.some((c) => c.id === clipId)) {
            return ClipManager.deleteClip(track, clipId)
          }
          return track
        })
        set({ tracks: updated, selectedClipId: null })
      },

      copyClip: (clipId) => {
        const { tracks } = get()
        for (const t of tracks) {
          const found = t.clips.find((c) => c.id === clipId)
          if (found) {
            set({ clipboardClip: JSON.parse(JSON.stringify(found)) })
            break
          }
        }
      },

      pasteClip: (currentTime) => {
        const { clipboardClip, selectedTrackId, tracks } = get()
        if (!clipboardClip) return

        saveHistory()
        const targetTrackId = selectedTrackId || tracks[0]?.id
        if (!targetTrackId) return

        const pastedClip: TimelineClip = {
          ...JSON.parse(JSON.stringify(clipboardClip)),
          id: `clip-paste-${Date.now().toString(36)}`,
          name: `${clipboardClip.name} (Paste)`,
          startTime: currentTime,
        }

        const updated = tracks.map((t) => {
          if (t.id === targetTrackId && !t.locked) {
            const clips = [...t.clips, pastedClip].sort((a, b) => a.startTime - b.startTime)
            return { ...t, clips }
          }
          return t
        })

        set({ tracks: updated, selectedClipId: pastedClip.id })
      },

      addKeyframeToClip: (clipId, property, time, value, easing = 'linear') => {
        saveHistory()
        const { tracks } = get()
        const updated = tracks.map((track) => {
          const clip = track.clips.find((c) => c.id === clipId)
          if (clip) {
            const updatedClip = KeyframeEngine.addKeyframe(clip, property, time, value, easing)
            return {
              ...track,
              clips: track.clips.map((c) => (c.id === clipId ? updatedClip : c)),
            }
          }
          return track
        })
        set({ tracks: updated })
      },

      removeKeyframeFromClip: (clipId, property, keyframeId) => {
        saveHistory()
        const { tracks } = get()
        const updated = tracks.map((track) => {
          const clip = track.clips.find((c) => c.id === clipId)
          if (clip) {
            const updatedClip = KeyframeEngine.removeKeyframe(clip, property, keyframeId)
            return {
              ...track,
              clips: track.clips.map((c) => (c.id === clipId ? updatedClip : c)),
            }
          }
          return track
        })
        set({ tracks: updated })
      },

      addMarker: (time, name = 'Marker', color = '#06b6d4') => {
        saveHistory()
        const newMarker: TimelineMarker = {
          id: `marker-${Date.now()}`,
          time: Math.max(0, time),
          name,
          color,
        }
        set((s) => ({
          markers: [...s.markers, newMarker].sort((a, b) => a.time - b.time),
        }))
      },

      deleteMarker: (id) => {
        saveHistory()
        set((s) => ({ markers: s.markers.filter((m) => m.id !== id) }))
      },

      renameMarker: (id, name) => {
        saveHistory()
        set((s) => ({
          markers: s.markers.map((m) => (m.id === id ? { ...m, name } : m)),
        }))
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(4, Math.min(100, zoom)) })
      },

      setScrollLeft: (scroll) => {
        set({ scrollLeft: Math.max(0, scroll) })
      },

      setActiveTool: (tool) => {
        set({ activeTool: tool })
      },

      toggleSnap: () => {
        set((s) => ({ snapEnabled: !s.snapEnabled }))
      },

      fitToProject: (duration, containerWidth) => {
        if (duration <= 0 || containerWidth <= 0) return
        const targetZoom = Math.max(4, (containerWidth - 60) / duration)
        set({ zoom: targetZoom, scrollLeft: 0 })
      },

      undo: () => {
        const { tracks, markers, selectedClipId } = get()
        const prev = history.undo({ tracks, markers, selectedClipId })
        if (prev) {
          set({
            tracks: prev.tracks,
            markers: prev.markers,
            selectedClipId: prev.selectedClipId,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
          })
        }
      },

      redo: () => {
        const { tracks, markers, selectedClipId } = get()
        const next = history.redo({ tracks, markers, selectedClipId })
        if (next) {
          set({
            tracks: next.tracks,
            markers: next.markers,
            selectedClipId: next.selectedClipId,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
          })
        }
      },
    }
  })(),
}))
