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

  openImageFileDialog: (): Promise<{
    canceled: boolean
    filePath?: string
    fileName?: string
    fileSize?: number
  }> => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_IMAGE),

  readAudioBuffer: (filePath: string): Promise<Uint8Array> =>
    ipcRenderer.invoke(IPC_CHANNELS.MEDIA_READ_BUFFER, filePath),

  getFileStats: (filePath: string): Promise<{
    size: number
    name: string
    extension: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_STATS, filePath),

  getDemoTrack: (): Promise<{
    exists: boolean
    filePath?: string
    fileName?: string
    fileSize?: number
  }> => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_DEMO_TRACK),

  // Helper to convert safe local path to d2-media URL
  getMediaUrl: (filePath: string): string => {
    return `d2-media://media/?path=${encodeURIComponent(filePath)}`
  },

  // FFmpeg Offline Video Rendering & Export
  selectOutputFolderDialog: (defaultPath?: string): Promise<{
    canceled: boolean
    folderPath?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_OUTPUT_FOLDER, defaultPath),

  exportGetEncoders: (): Promise<{
    nvenc: boolean
    libx264: boolean
    recommended: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_GET_ENCODERS),

  exportStart: (options: unknown): Promise<{
    success: boolean
    error?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_START, options),

  exportWriteFrame: (buffer: Uint8Array): Promise<{
    success: boolean
    error?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_WRITE_FRAME, buffer),

  exportFinish: (): Promise<{
    success: boolean
    outputPath?: string
    error?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_FINISH),

  exportCancel: (): Promise<{
    success: boolean
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_CANCEL),

  exportShowInFolder: (filePath: string): Promise<{
    success: boolean
    error?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_SHOW_IN_FOLDER, filePath),

  // Project Persistence (.d2proj)
  projectSave: (filePath: string, data: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_SAVE, filePath, data),

  projectOpenDialog: (): Promise<{
    canceled: boolean
    filePath?: string
    success?: boolean
    data?: any
    error?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_OPEN_DIALOG),

  projectSaveDialog: (defaultName?: string): Promise<{
    canceled: boolean
    filePath?: string
  }> => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_SAVE_DIALOG, defaultName),

  projectLoad: (filePath: string): Promise<{ success: boolean; data?: any; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_LOAD, filePath),

  projectAutoSave: (data: any, originalPath?: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_AUTOSAVE, data, originalPath),

  projectGetRecovery: (): Promise<{
    hasRecovery: boolean
    timestamp?: string
    originalPath?: string | null
    data?: any
  }> => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_GET_RECOVERY),

  projectDiscardRecovery: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_DISCARD_RECOVERY),

  projectGetRecents: (): Promise<any[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_GET_RECENTS),

  projectRemoveRecent: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_REMOVE_RECENT, filePath),

  projectDeleteFile: (filePath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_DELETE_FILE, filePath),

  projectBundleAssets: (
    projectFilePath: string,
    assets: any[]
  ): Promise<{ success: boolean; bundledAssets: any[]; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_BUNDLE_ASSETS, projectFilePath, assets),

  projectRevealInExplorer: (filePath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECT_REVEAL_IN_EXPLORER, filePath),

  // Presets Library
  presetsGetUser: (): Promise<any[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.PRESETS_GET_USER),

  presetsSaveUser: (preset: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PRESETS_SAVE_USER, preset),

  presetsDeleteUser: (category: string, id: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.PRESETS_DELETE_USER, category, id),

  presetsExportFile: (bundle: any): Promise<{ canceled: boolean; success?: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PRESETS_EXPORT_FILE, bundle),

  presetsImportFile: (): Promise<{ canceled: boolean; success?: boolean; data?: any; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.PRESETS_IMPORT_FILE),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
