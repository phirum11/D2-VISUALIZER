import { create } from 'zustand'

interface AppState {
  version: string
  platform: string
  ipcConnected: boolean
  isMaximized: boolean
  projectName: string
  isDirty: boolean

  // Actions
  setAppInfo: (version: string, platform: string, ipcConnected: boolean) => void
  setIsMaximized: (isMaximized: boolean) => void
  setProjectName: (name: string) => void
  setIsDirty: (isDirty: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  version: '0.2.0',
  platform: 'win32',
  ipcConnected: false,
  isMaximized: false,
  projectName: 'Untitled Project',
  isDirty: false,

  setAppInfo: (version, platform, ipcConnected) =>
    set({ version, platform, ipcConnected }),

  setIsMaximized: (isMaximized) => set({ isMaximized }),
  setProjectName: (projectName) => set({ projectName }),
  setIsDirty: (isDirty) => set({ isDirty }),
}))
