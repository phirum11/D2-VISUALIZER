import React, { useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAppStore } from '@/stores/appStore'
import { useAudioStore } from '@/stores/audioStore'
import { useHardwareStore } from '@/stores/hardwareStore'

export const App: React.FC = () => {
  const { setAppInfo } = useAppStore()

  useEffect(() => {
    // Expose stores for diagnostics and automated smoke testing
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __D2_AUDIO_STORE__: typeof useAudioStore }).__D2_AUDIO_STORE__ = useAudioStore
    }

    async function initSystem() {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const plat = await window.electronAPI.getPlatform()
          const ver = await window.electronAPI.getVersion()
          await window.electronAPI.ping()
          setAppInfo(ver, plat, true)
        } catch (err) {
          console.error('Failed to communicate with Electron IPC:', err)
          setAppInfo('0.1.0', 'unknown', false)
        }
      } else {
        setAppInfo('0.1.0', 'web', false)
      }
    }

    initSystem()
    void useHardwareStore.getState().loadSaved()
  }, [setAppInfo])

  return <MainLayout />
}
