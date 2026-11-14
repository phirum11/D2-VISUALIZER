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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
