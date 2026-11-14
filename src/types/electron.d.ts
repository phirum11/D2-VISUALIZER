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

export interface DemoTrackResult {
  exists: boolean
  filePath?: string
  fileName?: string
  fileSize?: number
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
  getDemoTrack: () => Promise<DemoTrackResult>
  getMediaUrl: (filePath: string) => string

  // FFmpeg Offline Video Rendering & Export
  selectOutputFolderDialog: (defaultPath?: string) => Promise<{
    canceled: boolean
    folderPath?: string
  }>
  exportGetEncoders: () => Promise<{
    nvenc: boolean
    libx264: boolean
    recommended: string
  }>
  exportStart: (options: {
    width: number
    height: number
    fps: number
    duration: number
    startTime: number
    outputPath: string
    audioFilePath?: string
    bitrate: string
    audioBitrate: string
    videoCodec: string
    preset: string
    crf?: number
  }) => Promise<{
    success: boolean
    error?: string
  }>
  exportWriteFrame: (buffer: Uint8Array) => Promise<{
    success: boolean
    error?: string
  }>
  exportFinish: () => Promise<{
    success: boolean
    outputPath?: string
    error?: string
  }>
  exportCancel: () => Promise<{
    success: boolean
  }>
  exportShowInFolder: (filePath: string) => Promise<{
    success: boolean
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
