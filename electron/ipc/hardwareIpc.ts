import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from './channels'
import { HardwareProfileService } from '../hardware/HardwareProfileService'

export function registerHardwareIpcHandlers(mainWindow: BrowserWindow): void {
  for (const [channel, operation] of [
    [IPC_CHANNELS.HARDWARE_GET_SAVED, () => HardwareProfileService.getSaved()],
    [IPC_CHANNELS.HARDWARE_CHECK_ONCE, () => HardwareProfileService.checkOnce()],
  ] as const) {
    ipcMain.handle(channel, async event => {
      if (event.sender !== mainWindow.webContents) throw new Error('Unknown hardware request sender')
      return operation()
    })
  }
}
