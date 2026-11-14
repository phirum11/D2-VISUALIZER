export type PresetCategory =
  | 'visualizer'
  | 'background'
  | 'typography'
  | 'text-animation'
  | 'artwork'
  | 'watermark'
  | 'particles'
  | 'color-grading'
  | 'keyframes'

export interface PresetItem<T = any> {
  id: string
  name: string
  category: PresetCategory
  isFactory: boolean
  createdAt: string
  description?: string
  data: T
}

export interface PresetsBundle {
  version: string
  exportedAt: string
  presets: PresetItem[]
}
