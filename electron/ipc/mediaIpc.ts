import { BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { IPC_CHANNELS } from './channels'

export function registerMediaIpcHandlers(mainWindow: BrowserWindow): void {
  // Open Native Audio File Picker
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_AUDIO, async () => {
    if (mainWindow.isDestroyed()) return { canceled: true }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Audio Track — D2 VISUALIZER',
      buttonLabel: 'Import Audio',
      properties: ['openFile'],
      filters: [
        {
          name: 'Audio Files',
          extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }

    const filePath = result.filePaths[0]
    const fileName = path.basename(filePath)
    try {
      const stats = fs.statSync(filePath)
      return {
        canceled: false,
        filePath,
        fileName,
        fileSize: stats.size,
      }
    } catch (err) {
      console.error('[MEDIA IPC] Failed to read file stats:', err)
      return {
        canceled: false,
        filePath,
        fileName,
        fileSize: 0,
      }
    }
  })

  // Read Audio File as binary Buffer (for AudioContext.decodeAudioData)
  ipcMain.handle(
    IPC_CHANNELS.MEDIA_READ_BUFFER,
    async (_event, filePath: string) => {
      try {
        if (!fs.existsSync(filePath)) {
          throw new Error(`File does not exist: ${filePath}`)
        }
        const buffer = await fs.promises.readFile(filePath)
        // Return as Uint8Array
        return new Uint8Array(buffer)
      } catch (err) {
        console.error('[MEDIA IPC] Failed to read audio buffer:', err)
        throw err
      }
    }
  )

  // Get File Stats (for drag-and-drop file verification)
  ipcMain.handle(
    IPC_CHANNELS.MEDIA_GET_STATS,
    async (_event, filePath: string) => {
      try {
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`)
        }
        const stats = await fs.promises.stat(filePath)
        return {
          size: stats.size,
          name: path.basename(filePath),
          extension: path.extname(filePath).toLowerCase(),
        }
      } catch (err) {
        console.error('[MEDIA IPC] Failed to get stats:', err)
        throw err
      }
    }
  )
}
