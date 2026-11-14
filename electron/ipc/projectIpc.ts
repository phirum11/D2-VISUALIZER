import { ipcMain, dialog, shell } from 'electron'
import fs from 'node:fs'
import { IPC_CHANNELS } from './channels'
import { ProjectStorage } from '../project/ProjectStorage'

export function registerProjectIpc(): void {
  const storage = ProjectStorage.getInstance()

  // 1. Save Project File
  ipcMain.handle(IPC_CHANNELS.PROJECT_SAVE, async (_event, filePath: string, data: any) => {
    return await storage.saveProjectFile(filePath, data)
  })

  // 2. Open Project Dialog & Load
  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN_DIALOG, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Open D2 Project',
      filters: [
        { name: 'D2 Visualizer Project (*.d2proj)', extensions: ['d2proj'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }

    const filePath = result.filePaths[0]
    const loadResult = await storage.loadProjectFile(filePath)

    return {
      canceled: false,
      filePath,
      success: loadResult.success,
      data: loadResult.data,
      error: loadResult.error,
    }
  })

  // 3. Save Project As Dialog
  ipcMain.handle(IPC_CHANNELS.PROJECT_SAVE_DIALOG, async (_event, defaultName?: string) => {
    const result = await dialog.showSaveDialog({
      title: 'Save D2 Project As',
      defaultPath: (defaultName || 'Untitled') + '.d2proj',
      filters: [
        { name: 'D2 Visualizer Project (*.d2proj)', extensions: ['d2proj'] },
      ],
    })

    if (result.canceled || !result.filePath) {
      return { canceled: true }
    }

    return {
      canceled: false,
      filePath: result.filePath,
    }
  })

  // 4. Load Project from path
  ipcMain.handle(IPC_CHANNELS.PROJECT_LOAD, async (_event, filePath: string) => {
    return await storage.loadProjectFile(filePath)
  })

  // 5. Auto Save Recovery
  ipcMain.handle(IPC_CHANNELS.PROJECT_AUTOSAVE, async (_event, data: any, originalPath?: string) => {
    return await storage.writeAutoSave(data, originalPath)
  })

  // 6. Get Recovery Session
  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_RECOVERY, async () => {
    return storage.getRecoverySession()
  })

  // 7. Discard Recovery Session
  ipcMain.handle(IPC_CHANNELS.PROJECT_DISCARD_RECOVERY, async () => {
    return storage.discardRecovery()
  })

  // 8. Recent Projects
  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_RECENTS, async () => {
    return storage.getRecentProjects()
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_REMOVE_RECENT, async (_event, filePath: string) => {
    return storage.removeRecentProject(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE_FILE, async (_event, filePath: string) => {
    return storage.deleteProjectFile(filePath)
  })

  // 9. Collect & Bundle Assets
  ipcMain.handle(IPC_CHANNELS.PROJECT_BUNDLE_ASSETS, async (_event, projectFilePath: string, assets: any[]) => {
    return await storage.collectAndBundleAssets(projectFilePath, assets)
  })

  // 10. Reveal in File Explorer
  ipcMain.handle(IPC_CHANNELS.PROJECT_REVEAL_IN_EXPLORER, async (_event, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 11. Presets Management
  ipcMain.handle(IPC_CHANNELS.PRESETS_GET_USER, async () => {
    return storage.getUserPresets()
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_SAVE_USER, async (_event, preset: any) => {
    return storage.saveUserPreset(preset)
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_DELETE_USER, async (_event, category: string, id: string) => {
    return storage.deleteUserPreset(category, id)
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_EXPORT_FILE, async (_event, bundle: any) => {
    const result = await dialog.showSaveDialog({
      title: 'Export Presets Bundle',
      defaultPath: 'd2_presets_bundle.json',
      filters: [{ name: 'JSON Presets (*.json)', extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(bundle, null, 2), 'utf-8')
      return { canceled: false, success: true, filePath: result.filePath }
    } catch (err: any) {
      return { canceled: false, success: false, error: err.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_IMPORT_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Presets Bundle',
      filters: [{ name: 'JSON Presets (*.json)', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    try {
      const content = fs.readFileSync(result.filePaths[0], 'utf-8')
      const parsed = JSON.parse(content)
      return { canceled: false, success: true, data: parsed }
    } catch (err: any) {
      return { canceled: false, success: false, error: err.message }
    }
  })
}
