import {
  VisualizerConfig,
  BackgroundConfig,
  TextConfig,
  EffectsConfig,
  AmbientParticlesConfig,
  CinematicMotionConfig,
  VisualLayer,
} from '@/stores/compositionStore'
import { OverlayElement } from '@/engine/overlay/types'
import {
  TimelineTrack,
  TimelineMarker,
} from '@/engine/timeline/types'
import { AudioMetadata } from '@/engine/audio/AudioMetadata'
import { ResolutionPresetId, QualityPresetId } from '@/stores/exportStore'
import { AspectRatio } from '@/stores/previewStore'

export const D2_PROJECT_SCHEMA_VERSION = '1.0.0'
export const D2_PROJECT_FORMAT_MAGIC = 'd2proj'

export interface D2ProjectMetadata {
  id: string
  name: string
  version: string // Schema version, e.g. '1.0.0'
  d2AppVersion: string // App version, e.g. '0.1.0'
  createdAt: string // ISO timestamp
  modifiedAt: string // ISO timestamp
  author?: string
  description?: string
  tags?: string[]
}

export interface D2ProjectCanvas {
  width: number
  height: number
  aspectRatio: AspectRatio
  fps: number
  duration: number
}

export interface D2ProjectAssetReference {
  id: string
  type: 'audio' | 'image' | 'video' | 'font' | 'logo'
  originalPath: string
  relativePath?: string
  fileName: string
  fileSize?: number
  isBundled?: boolean
  sha256?: string
  exists?: boolean
}

export interface D2ProjectComposition {
  visualizer: VisualizerConfig
  background: BackgroundConfig
  text: TextConfig
  effects: EffectsConfig
  ambientParticles: AmbientParticlesConfig
  cinematicMotion: CinematicMotionConfig
  layers: VisualLayer[]
  overlays: OverlayElement[]
}

export interface D2ProjectTimeline {
  tracks: TimelineTrack[]
  markers: TimelineMarker[]
  fps: number
  snapEnabled: boolean
}

export interface D2ProjectAudio {
  currentTrack: AudioMetadata | null
  filePath: string | null
  fileName: string | null
  volume: number
  isMuted: boolean
  isLooping: boolean
}

export interface D2ProjectExportSettings {
  selectedPresetId: ResolutionPresetId
  width: number
  height: number
  aspectRatio: AspectRatio
  fps: number
  videoCodec: 'auto' | 'h264_nvenc' | 'libx264'
  quality: QualityPresetId
  bitrate: string
  audioBitrate: string
  fileName: string
  outputFolder?: string
}

/**
 * Complete Native D2 Project Data Structure (.d2proj)
 */
export interface D2ProjectData {
  d2Format: typeof D2_PROJECT_FORMAT_MAGIC
  schemaVersion: string
  metadata: D2ProjectMetadata
  canvas: D2ProjectCanvas
  composition: D2ProjectComposition
  timeline: D2ProjectTimeline
  audio: D2ProjectAudio
  export: D2ProjectExportSettings
  assets: D2ProjectAssetReference[]
  thumbnailDataUrl?: string
}

export interface RecentProjectItem {
  id: string
  name: string
  filePath: string
  createdAt: string
  modifiedAt: string
  canvas: {
    width: number
    height: number
    aspectRatio: AspectRatio
    fps: number
    duration: number
  }
  fileSize?: number
  thumbnailDataUrl?: string
  exists?: boolean
}

export interface RecoverySession {
  hasRecovery: boolean
  timestamp?: string
  project?: D2ProjectData
  originalPath?: string | null
}
