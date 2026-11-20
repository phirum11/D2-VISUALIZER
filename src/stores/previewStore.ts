import { create } from 'zustand'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9'
export type PreviewQuality = 'performance' | 'balanced' | 'quality'
export type FitMode = 'fit' | 'fill'

const previewQualityKey = 'd2-preview-quality'

function savedPreviewQuality(): PreviewQuality {
  try {
    const saved = localStorage.getItem(previewQualityKey)
    if (saved === 'performance' || saved === 'balanced' || saved === 'quality') return saved
  } catch { /* Storage can be unavailable in diagnostics or restricted environments. */ }
  return 'balanced'
}

interface PreviewState {
  aspectRatio: AspectRatio
  fitMode: FitMode
  zoom: number // 0 = Fit, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0
  showSafeGuides: boolean
  previewQuality: PreviewQuality
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLooping: boolean
  isFullscreenPreview: boolean

  // Actions
  setAspectRatio: (ratio: AspectRatio) => void
  setFitMode: (mode: FitMode) => void
  setZoom: (zoom: number) => void
  toggleSafeGuides: () => void
  setPreviewQuality: (quality: PreviewQuality) => void
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleLooping: () => void
  setIsFullscreenPreview: (fullscreen: boolean) => void
  toggleFullscreenPreview: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  aspectRatio: '16:9',
  fitMode: 'fit',
  zoom: 0, // Fit
  showSafeGuides: false,
  previewQuality: savedPreviewQuality(),
  isPlaying: false,
  currentTime: 0,
  duration: 198.0, // Default 3:18 project timeline length
  volume: 0.85,
  isLooping: true,
  isFullscreenPreview: false,

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setFitMode: (fitMode) => set({ fitMode }),
  setZoom: (zoom) => set({ zoom }),
  toggleSafeGuides: () => set((s) => ({ showSafeGuides: !s.showSafeGuides })),
  setPreviewQuality: (previewQuality) => {
    try { localStorage.setItem(previewQualityKey, previewQuality) } catch { /* Keep the session setting if persistence is unavailable. */ }
    set({ previewQuality })
  },
  setIsPlaying: (isPlaying) => set((s) => s.isPlaying === isPlaying ? s : { isPlaying }),
  setCurrentTime: (currentTime) => set((s) => s.currentTime === currentTime ? s : { currentTime }),
  setDuration: (duration) => set((s) => s.duration === duration ? s : { duration }),
  setVolume: (volume) => set({ volume }),
  toggleLooping: () => set((s) => ({ isLooping: !s.isLooping })),
  setIsFullscreenPreview: (isFullscreenPreview) => set({ isFullscreenPreview }),
  toggleFullscreenPreview: () => set((s) => ({ isFullscreenPreview: !s.isFullscreenPreview })),
}))
