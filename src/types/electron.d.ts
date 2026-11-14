export interface OpenAudioResult {
  canceled: boolean
  filePath?: string
  fileName?: string
  fileSize?: number
}

export interface OpenBackgroundResult {
  canceled: boolean
  filePath?: string
  fileName?: string
  fileSize?: number
  mediaType?: 'image' | 'video'
}

export interface FileStatsResult {
  size: number
  name: string
  extension: string
}

export interface ElectronAPI {
  // App info & diagnostics
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  ping: () => Promise<string>

  // Window management
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void

  // Media & Audio IPC
  openAudioFileDialog: () => Promise<OpenAudioResult>
  openBackgroundFileDialog: () => Promise<OpenBackgroundResult>
  openImageFileDialog: () => Promise<OpenAudioResult>
  readAudioBuffer: (filePath: string) => Promise<Uint8Array>
  getFileStats: (filePath: string) => Promise<FileStatsResult>
  getMediaUrl: (filePath: string) => string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
