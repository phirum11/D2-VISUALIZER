import React, { useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAppStore } from '@/stores/appStore'

export const App: React.FC = () => {
  const { setAppInfo } = useAppStore()

  useEffect(() => {
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
  }, [setAppInfo])

  return <MainLayout />
}
