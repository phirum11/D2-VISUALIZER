import { create } from 'zustand'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9'
export type PreviewQuality = 'performance' | 'balanced' | 'quality'
export type FitMode = 'fit' | 'fill'

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
  previewQuality: 'balanced',
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
  setPreviewQuality: (previewQuality) => set({ previewQuality }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleLooping: () => set((s) => ({ isLooping: !s.isLooping })),
  setIsFullscreenPreview: (isFullscreenPreview) => set({ isFullscreenPreview }),
  toggleFullscreenPreview: () => set((s) => ({ isFullscreenPreview: !s.isFullscreenPreview })),
}))
