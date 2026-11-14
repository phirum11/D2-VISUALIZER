import { BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { IPC_CHANNELS } from './channels'
import { FFmpegExporter, ExportStartOptions } from '../export/FFmpegExporter'

export function registerExportIpcHandlers(mainWindow: BrowserWindow): void {
  const exporter = FFmpegExporter.getInstance()

  // Select Output Folder dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_OUTPUT_FOLDER, async (_event, defaultPath?: string) => {
    if (mainWindow.isDestroyed()) return { canceled: true }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Export Destination Folder — D2 VISUALIZER',
      buttonLabel: 'Select Folder',
      properties: ['openDirectory', 'createDirectory'],
      defaultPath,
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }

    return { canceled: false, folderPath: result.filePaths[0] }
  })

  // Check hardware encoders (NVENC, libx264)
  ipcMain.handle(IPC_CHANNELS.EXPORT_GET_ENCODERS, async () => {
    const hasNvenc = await exporter.checkNvencSupport()
    return {
      nvenc: hasNvenc,
      libx264: true,
      recommended: hasNvenc ? 'h264_nvenc' : 'libx264',
    }
  })

  // Start FFmpeg Export session
  ipcMain.handle(IPC_CHANNELS.EXPORT_START, async (_event, options: ExportStartOptions) => {
    return await exporter.start(options)
  })

  // Stream raw frame to FFmpeg stdin pipe
  ipcMain.handle(IPC_CHANNELS.EXPORT_WRITE_FRAME, async (_event, buffer: Uint8Array) => {
    return await exporter.writeFrame(buffer)
  })

  // Finalize export and close pipe
  ipcMain.handle(IPC_CHANNELS.EXPORT_FINISH, async () => {
    return await exporter.finish()
  })

  // Cancel export
  ipcMain.handle(IPC_CHANNELS.EXPORT_CANCEL, async () => {
    await exporter.cancel()
    return { success: true }
  })

  // Show exported file in Windows Explorer
  ipcMain.handle(IPC_CHANNELS.EXPORT_SHOW_IN_FOLDER, async (_event, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (err) {
      console.error('[EXPORT IPC] Failed to show item in folder:', err)
      return { success: false, error: String(err) }
    }
  })
}
