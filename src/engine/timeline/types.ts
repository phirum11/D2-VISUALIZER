export type TrackType =
  | 'audio-master'
  | 'visualizer'
  | 'background'
  | 'typography'
  | 'artwork'
  | 'logo'
  | 'particles'
  | 'effects'

export type KeyframeInterpolation =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bezier'

export type KeyframeProperty =
  | 'positionX'
  | 'positionY'
  | 'scale'
  | 'rotation'
  | 'opacity'
  | 'volume'
  | 'blur'
  | 'sensitivity'
  | 'glow'

export interface Keyframe {
  id: string
  time: number // Relative to clip start in seconds
  value: number
  easing: KeyframeInterpolation
  bezierHandles?: {
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
  }
}

export interface KeyframeTrack {
  property: KeyframeProperty
  keyframes: Keyframe[]
}

export interface TimelineClip {
  id: string
  trackId: string
  name: string
  type: TrackType
  startTime: number // Timeline position in seconds
  duration: number // Duration in seconds
  offset: number // Source in-point / trim start in seconds
  color: string // Hex color code for UI
  muted?: boolean
  keyframes?: KeyframeTrack[]
  data?: Record<string, any> // Custom clip payload (e.g. text overlay id, visualizer type, media path)
}

export interface TimelineTrack {
  id: string
  name: string
  type: TrackType
  visible: boolean
  locked: boolean
  muted?: boolean
  volume?: number // 0 to 1
  height?: number // px
  order: number
  clips: TimelineClip[]
}

export interface TimelineMarker {
  id: string
  time: number // in seconds
  name: string
  color: string
}

export interface SnapTarget {
  time: number
  type: 'playhead' | 'clip-start' | 'clip-end' | 'marker' | 'origin' | 'duration'
}

export type TimelineTool = 'select' | 'blade' | 'hand'

export interface TimelineSnapshot {
  tracks: TimelineTrack[]
  markers: TimelineMarker[]
  selectedClipId: string | null
  description?: string
}
