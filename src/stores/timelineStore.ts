import { create } from 'zustand'

export interface TimelineClip {
  id: string
  name: string
  startTime: number // in seconds
  duration: number // in seconds
  color: string
}

export interface TimelineTrack {
  id: string
  name: string
  type: 'audio' | 'background' | 'visualizer' | 'text' | 'overlay'
  visible: boolean
  locked: boolean
  muted?: boolean
  clips: TimelineClip[]
}

interface TimelineState {
  zoom: number // pixels per second (e.g. 10 to 100)
  scrollLeft: number
  selectedClipId: string | null
  tracks: TimelineTrack[]

  // Actions
  setZoom: (zoom: number) => void
  setScrollLeft: (scroll: number) => void
  setSelectedClipId: (id: string | null) => void
  toggleTrackVisibility: (trackId: string) => void
  toggleTrackLock: (trackId: string) => void
  toggleTrackMute: (trackId: string) => void
}

const defaultTracks: TimelineTrack[] = [
  {
    id: 'track-audio',
    name: 'Audio Master',
    type: 'audio',
    visible: true,
    locked: false,
    muted: false,
    clips: [
      {
        id: 'clip-audio-1',
        name: 'Starlight_Echoes_Master_48k.wav',
        startTime: 0,
        duration: 198.0,
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
    clips: [
      {
        id: 'clip-vis-1',
        name: 'Spectrum Bars (Reactive)',
        startTime: 0,
        duration: 198.0,
        color: '#06b6d4',
      },
    ],
  },
  {
    id: 'track-text',
    name: 'Typography & Credits',
    type: 'text',
    visible: true,
    locked: false,
    clips: [
      {
        id: 'clip-text-1',
        name: 'Title & Artist Overlay',
        startTime: 0,
        duration: 198.0,
        color: '#a855f7',
      },
    ],
  },
  {
    id: 'track-overlay',
    name: 'Logo / Watermark',
    type: 'overlay',
    visible: true,
    locked: false,
    clips: [
      {
        id: 'clip-overlay-1',
        name: 'D2_Badge_Watermark.png',
        startTime: 0,
        duration: 198.0,
        color: '#ec4899',
      },
    ],
  },
  {
    id: 'track-background',
    name: 'Background Layer',
    type: 'background',
    visible: true,
    locked: false,
    clips: [
      {
        id: 'clip-bg-1',
        name: 'Cosmic Gradient Slate',
        startTime: 0,
        duration: 198.0,
        color: '#3b82f6',
      },
    ],
  },
]

export const useTimelineStore = create<TimelineState>((set) => ({
  zoom: 8, // pixels per second
  scrollLeft: 0,
  selectedClipId: 'clip-vis-1',
  tracks: defaultTracks,

  setZoom: (zoom) => set({ zoom: Math.max(2, Math.min(40, zoom)) }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
  setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
  toggleTrackVisibility: (trackId) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, visible: !t.visible } : t
      ),
    })),
  toggleTrackLock: (trackId) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, locked: !t.locked } : t
      ),
    })),
  toggleTrackMute: (trackId) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      ),
    })),
}))
