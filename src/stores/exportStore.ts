import { create } from 'zustand'
import { AspectRatio } from './previewStore'
import { OfflineRenderEngine, RenderProgress } from '@/engine/render/OfflineRenderEngine'
import { AudioEngine } from '@/engine/audio/AudioEngine'
import { useAudioStore } from './audioStore'
import { usePreviewStore } from './previewStore'

export type ResolutionPresetId = '1080p' | '1440p' | '4k' | 'shorts' | 'square'
export type QualityPresetId = 'draft' | 'balanced' | 'high' | 'pro'

export interface ResolutionPreset {
  id: ResolutionPresetId
  name: string
  width: number
  height: number
  aspectRatio: AspectRatio
  description: string
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: '1080p',
    name: '1080p Full HD',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Landscape (1920 × 1080) — YouTube & Video',
  },
  {
    id: '1440p',
    name: '2K Quad HD',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'Landscape (2560 × 1440) — High Definition Display',
  },
  {
    id: '4k',
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Landscape (3840 × 2160) — Cinema & Ultra HD',
  },
  {
    id: 'shorts',
    name: '9:16 Vertical Story',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Portrait (1080 × 1920) — TikTok, Shorts & Reels',
  },
  {
    id: 'square',
    name: '1:1 Square Post',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Square (1080 × 1080) — Instagram & Square Posts',
  },
]

export interface ExportState {
  // Configuration
  selectedPresetId: ResolutionPresetId
  width: number
  height: number
  aspectRatio: AspectRatio
  fps: number
  videoCodec: 'auto' | 'h264_nvenc' | 'libx264'
  quality: QualityPresetId
  bitrate: string
  audioBitrate: string
  outputFolder: string
  fileName: string

  // Hardware encoders
  hasNvenc: boolean
  recommendedCodec: string

  // Live export status
  isExporting: boolean
  exportStage: RenderProgress['stage']
  progress: number
  currentFrame: number
  totalFrames: number
  renderingFps: number
  elapsedSeconds: number
  remainingSeconds: number
  lastExportedPath: string | null
  errorMessage: string | null

  // Actions
  setPreset: (presetId: ResolutionPresetId) => void
  setFps: (fps: number) => void
  setQuality: (quality: QualityPresetId) => void
  setVideoCodec: (codec: 'auto' | 'h264_nvenc' | 'libx264') => void
  setAudioBitrate: (bitrate: string) => void
  setOutputFolder: (folder: string) => void
  setFileName: (name: string) => void
  detectEncoders: () => Promise<void>
  selectOutputFolder: () => Promise<void>
  startExport: () => Promise<boolean>
  cancelExport: () => void
  openExportFolder: () => Promise<void>
  resetStatus: () => void
}

export const useExportStore = create<ExportState>((set, get) => {
  return {
    selectedPresetId: '1080p',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    fps: 30,
    videoCodec: 'auto',
    quality: 'high',
    bitrate: '16M',
    audioBitrate: '192k',
    outputFolder: '',
    fileName: 'D2_Visualizer_Export.mp4',

    hasNvenc: false,
    recommendedCodec: 'libx264',

    isExporting: false,
    exportStage: 'idle',
    progress: 0,
    currentFrame: 0,
    totalFrames: 0,
    renderingFps: 0,
    elapsedSeconds: 0,
    remainingSeconds: 0,
    lastExportedPath: null,
    errorMessage: null,

    setPreset: (presetId) => {
      const preset = RESOLUTION_PRESETS.find((p) => p.id === presetId) || RESOLUTION_PRESETS[0]
      set({
        selectedPresetId: preset.id,
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.aspectRatio,
      })
      usePreviewStore.getState().setAspectRatio(preset.aspectRatio)
    },

    setFps: (fps) => set({ fps }),

    setQuality: (quality) => {
      let bitrate = '16M'
      if (quality === 'draft') bitrate = '6M'
      else if (quality === 'balanced') bitrate = '10M'
      else if (quality === 'high') bitrate = '18M'
      else if (quality === 'pro') bitrate = '32M'
      set({ quality, bitrate })
    },

    setVideoCodec: (videoCodec) => set({ videoCodec }),
    setAudioBitrate: (audioBitrate) => set({ audioBitrate }),
    setOutputFolder: (outputFolder) => set({ outputFolder }),
    setFileName: (fileName) => set({ fileName }),

    detectEncoders: async () => {
      if (typeof window !== 'undefined' && window.electronAPI?.exportGetEncoders) {
        try {
          const res = await window.electronAPI.exportGetEncoders()
          set({
            hasNvenc: res.nvenc,
            recommendedCodec: res.recommended,
          })
        } catch {
          // ignore
        }
      }
    },

    selectOutputFolder: async () => {
      if (typeof window !== 'undefined' && window.electronAPI?.selectOutputFolderDialog) {
        try {
          const res = await window.electronAPI.selectOutputFolderDialog(get().outputFolder)
          if (!res.canceled && res.folderPath) {
            set({ outputFolder: res.folderPath })
          }
        } catch (err) {
          console.error('[EXPORT STORE] Folder select failed:', err)
        }
      }
    },

    startExport: async () => {
      const state = get()
      if (state.isExporting) return false

      const audioEngine = AudioEngine.getInstance()
      const audioStore = useAudioStore.getState()
      const previewStore = usePreviewStore.getState()

      const currentTrack = audioStore.currentTrack
      const audioBuffer = audioEngine.getAudioBuffer()
      const totalDuration = currentTrack?.duration || previewStore.duration || 10

      // Formulate complete output path
      const folder = state.outputFolder || '.'
      let outName = state.fileName.trim()
      if (!outName.toLowerCase().endsWith('.mp4')) {
        outName += '.mp4'
      }

      const fullOutputPath = folder && folder !== '.'
        ? `${folder.replace(/[\\/]$/, '')}/${outName}`
        : outName

      set({
        isExporting: true,
        exportStage: 'analyzing-audio',
        progress: 0,
        currentFrame: 0,
        totalFrames: Math.ceil(totalDuration * state.fps),
        renderingFps: 0,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        errorMessage: null,
      })

      const engine = OfflineRenderEngine.getInstance()

      const result = await engine.renderVideo(
        {
          width: state.width,
          height: state.height,
          fps: state.fps,
          duration: totalDuration,
          startTime: 0,
          endTime: totalDuration,
          bitrate: state.bitrate,
          audioBitrate: state.audioBitrate,
          videoCodec: state.videoCodec,
          preset: state.hasNvenc && state.videoCodec !== 'libx264' ? 'p4' : 'medium',
          outputPath: fullOutputPath,
          audioFilePath: currentTrack?.filePath,
        },
        audioBuffer,
        (progressInfo: RenderProgress) => {
          set({
            currentFrame: progressInfo.currentFrame,
            totalFrames: progressInfo.totalFrames,
            progress: progressInfo.progress,
            renderingFps: progressInfo.renderingFps,
            elapsedSeconds: progressInfo.elapsedSeconds,
            remainingSeconds: progressInfo.remainingSeconds,
            exportStage: progressInfo.stage,
            errorMessage: progressInfo.error || null,
          })
        }
      )

      if (result.success) {
        set({
          isExporting: false,
          exportStage: 'completed',
          lastExportedPath: result.outputPath || fullOutputPath,
        })
        return true
      } else {
        set({
          isExporting: false,
          exportStage: 'error',
          errorMessage: result.error || 'Export failed',
        })
        return false
      }
    },

    cancelExport: () => {
      OfflineRenderEngine.getInstance().cancel()
      set({
        isExporting: false,
        exportStage: 'cancelled',
      })
    },

    openExportFolder: async () => {
      const path = get().lastExportedPath
      if (path && typeof window !== 'undefined' && window.electronAPI?.exportShowInFolder) {
        await window.electronAPI.exportShowInFolder(path)
      }
    },

    resetStatus: () => {
      set({
        isExporting: false,
        exportStage: 'idle',
        progress: 0,
        currentFrame: 0,
        renderingFps: 0,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        errorMessage: null,
      })
    },
  }
})
