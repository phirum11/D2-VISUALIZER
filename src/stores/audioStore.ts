import { create } from 'zustand'
import { AudioEngine, AudioEngineStatus } from '@/engine/audio/AudioEngine'
import { AudioMetadata } from '@/engine/audio/AudioMetadata'
import { WaveformData } from '@/engine/audio/WaveformGenerator'
import { useTimelineStore } from './timelineStore'
import { usePreviewStore } from './previewStore'

interface AudioState {
  currentTrack: AudioMetadata | null
  waveform: WaveformData | null
  status: AudioEngineStatus
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isLooping: boolean
  audioMonitorOpen: boolean
  importedFiles: AudioMetadata[]

  // Actions
  importAudioViaDialog: () => Promise<boolean>
  importAudioFile: (file: File) => Promise<boolean>
  importFromPath: (filePath: string, name?: string) => Promise<boolean>
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleLooping: () => void
  setAudioMonitorOpen: (open: boolean) => void
  removeTrack: (id: string) => void
}

export const useAudioStore = create<AudioState>((set, get) => {
  const engine = AudioEngine.getInstance()

  // Subscribe AudioEngine to update store on time & status changes
  engine.addListener({
    onTimeUpdate: (currentTime, duration) => {
      set({ currentTime, duration })
      usePreviewStore.getState().setCurrentTime(currentTime)
      if (duration > 0) {
        usePreviewStore.getState().setDuration(duration)
      }
    },
    onStatusChange: (status) => {
      set({ status })
      usePreviewStore.getState().setIsPlaying(status === 'playing')
    },
    onError: (err) => {
      console.error('[AUDIO STORE ERROR]', err)
    },
  })

  return {
    currentTrack: null,
    waveform: null,
    status: 'idle',
    currentTime: 0,
    duration: 180,
    volume: 0.85,
    isMuted: false,
    isLooping: true,
    audioMonitorOpen: false,
    importedFiles: [],

    importAudioViaDialog: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) {
        console.warn('Native dialog not supported in web environment')
        return false
      }

      try {
        const res = await window.electronAPI.openAudioFileDialog()
        if (res.canceled || !res.filePath) return false

        return await get().importFromPath(res.filePath, res.fileName)
      } catch (err) {
        console.error('[AUDIO STORE] Dialog import error:', err)
        return false
      }
    },

    importFromPath: async (filePath: string, name?: string) => {
      try {
        const fileName = name || filePath.split(/[/\\]/).pop() || 'Imported Audio'
        const rawBuffer = await window.electronAPI.readAudioBuffer(filePath)
        const mediaUrl = window.electronAPI.getMediaUrl(filePath)

        await engine.loadAudioFile(mediaUrl, { filePath, name: fileName }, rawBuffer)

        const meta = engine.getMetadata()
        const waveform = engine.getWaveform()

        if (meta) {
          set((s) => ({
            currentTrack: meta,
            waveform,
            duration: meta.duration,
            importedFiles: [meta, ...s.importedFiles.filter((f) => f.id !== meta.id)],
          }))

          // Update timeline audio track
          useTimelineStore.getState().syncTracksWithDuration(meta.duration, meta.name)

          usePreviewStore.getState().setDuration(meta.duration)
          return true
        }
      } catch (err) {
        console.error('[AUDIO STORE] Import from path error:', err)
      }
      return false
    },

    importAudioFile: async (file: File) => {
      try {
        await engine.loadAudioFile(file)
        const meta = engine.getMetadata()
        const waveform = engine.getWaveform()

        if (meta) {
          set((s) => ({
            currentTrack: meta,
            waveform,
            duration: meta.duration,
            importedFiles: [meta, ...s.importedFiles.filter((f) => f.id !== meta.id)],
          }))

          useTimelineStore.getState().syncTracksWithDuration(meta.duration, meta.name)
          usePreviewStore.getState().setDuration(meta.duration)
          return true
        }
      } catch (err) {
        console.error('[AUDIO STORE] Import file error:', err)
      }
      return false
    },

    play: async () => {
      await engine.play()
    },

    pause: () => {
      engine.pause()
    },

    stop: () => {
      engine.stop()
    },

    seek: (seconds: number) => {
      engine.seek(seconds)
    },

    setVolume: (volume: number) => {
      engine.setVolume(volume)
      set({ volume })
    },

    toggleMute: () => {
      const isMuted = engine.toggleMute()
      set({ isMuted })
    },

    toggleLooping: () => {
      const isLooping = !get().isLooping
      engine.setLoop(isLooping)
      set({ isLooping })
      usePreviewStore.getState().toggleLooping()
    },

    setAudioMonitorOpen: (open: boolean) => {
      set({ audioMonitorOpen: open })
    },

    removeTrack: (id: string) => {
      set((s) => ({
        importedFiles: s.importedFiles.filter((f) => f.id !== id),
        currentTrack: s.currentTrack?.id === id ? null : s.currentTrack,
        waveform: s.currentTrack?.id === id ? null : s.waveform,
      }))
    },
  }
})
