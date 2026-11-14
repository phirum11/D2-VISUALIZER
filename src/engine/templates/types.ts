import { AspectRatio } from '@/stores/previewStore'
import {
  VisualizerConfig,
  BackgroundConfig,
  EffectsConfig,
  AmbientParticlesConfig,
  CinematicMotionConfig,
} from '@/stores/compositionStore'
import { ResolutionPresetId, QualityPresetId } from '@/stores/exportStore'

export type TemplateCategory =
  | 'All'
  | 'House & Club'
  | 'Chill & Ambient'
  | 'Bass & Phonk'
  | 'Podcast & Studio'
  | 'Social Media'

export interface ProjectTemplate {
  id: string
  name: string
  category: TemplateCategory
  description: string
  tags: string[]
  aspectRatio: AspectRatio
  canvas: {
    width: number
    height: number
    fps: number
    duration: number
  }
  composition: {
    visualizer: Partial<VisualizerConfig>
    background: Partial<BackgroundConfig>
    effects: Partial<EffectsConfig>
    ambientParticles: Partial<AmbientParticlesConfig>
    cinematicMotion: Partial<CinematicMotionConfig>
    overlays: any[]
  }
  export: {
    selectedPresetId: ResolutionPresetId
    quality: QualityPresetId
    bitrate: string
  }
}
