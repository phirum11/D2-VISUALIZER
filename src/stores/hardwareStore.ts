import { create } from 'zustand'
import { HardwareProfile } from '@/engine/performance/HardwareRecommendation'
import { usePreviewStore } from './previewStore'
import { useExportStore } from './exportStore'

interface HardwareState {
  profile: HardwareProfile | null
  loaded: boolean
  checking: boolean
  error: string | null
  loadSaved: () => Promise<void>
  checkOnce: () => Promise<void>
  applyRecommendation: () => void
}

let loading: Promise<void> | null = null

const restoreEncoder = (profile: HardwareProfile) => useExportStore.setState({
  hasNvenc: profile.nvencSupported,
  recommendedCodec: profile.nvencSupported ? 'h264_nvenc' : 'libx264',
})

export const useHardwareStore = create<HardwareState>((set, get) => ({
  profile: null, loaded: false, checking: false, error: null,
  loadSaved: async () => {
    if (get().loaded) return
    if (loading) return loading
    loading = (async () => {
      try {
        const profile = await window.electronAPI?.hardwareGetSaved() ?? null
        if (profile) restoreEncoder(profile)
        set({ profile, loaded: true })
      } catch (error) {
        set({ loaded: true, error: String(error) })
      }
    })().finally(() => { loading = null })
    return loading
  },
  checkOnce: async () => {
    if (get().checking || get().profile) return
    set({ checking: true, error: null })
    try {
      if (!window.electronAPI?.hardwareCheckOnce) throw new Error('Hardware detection requires the desktop app')
      const profile = await window.electronAPI.hardwareCheckOnce()
      restoreEncoder(profile)
      set({ profile, loaded: true })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ checking: false })
    }
  },
  applyRecommendation: () => {
    const profile = get().profile
    if (profile) usePreviewStore.getState().setPreviewQuality(profile.recommendedMode)
  },
}))
