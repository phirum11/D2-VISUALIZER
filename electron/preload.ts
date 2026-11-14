import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './ipc/channels'

const electronAPI = {
  // App info & diagnostics
  getVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  getPlatform: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PLATFORM),
  ping: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PING),

  // Window management
  minimize: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  onMaximizeChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => {
      callback(isMaximized)
    }
    ipcRenderer.on(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, handler)
    }
  },

  // Media & Audio IPC
  openAudioFileDialog: (): Promise<{
    canceled: boolean
    filePath?: string
    fileName?: string
    fileSize?: number
  }> => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_AUDIO),

  openBackgroundFileDialog: (): Promise<{
    canceled: boolean
    filePath?: string
    fileName?: string
    fileSize?: number
    mediaType?: 'image' | 'video'
  }> => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_BACKGROUND),

  readAudioBuffer: (filePath: string): Promise<Uint8Array> =>
    ipcRenderer.invoke(IPC_CHANNELS.MEDIA_READ_BUFFER, filePath),

  getFileStats: (filePath: string): Promise<{
    size: number
    name: string
    extension: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_STATS, filePath),

  // Helper to convert safe local path to d2-media URL
  getMediaUrl: (filePath: string): string => {
    return `d2-media://media/?path=${encodeURIComponent(filePath)}`
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
