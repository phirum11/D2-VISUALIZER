import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { registerIpcHandlers } from './ipc/windowIpc'

// Built directory structure:
// ├─┬ dist-electron
// │ ├── main.js
// │ └── preload.js
// ├─┬ dist
// │ └── index.html

const appRoot = path.join(__dirname, '..')
export const MAIN_DIST = path.join(appRoot, 'dist-electron')
export const RENDERER_DIST = path.join(appRoot, 'dist')

process.env.APP_ROOT = appRoot
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(appRoot, 'public')
  : RENDERER_DIST

let mainWindow: BrowserWindow | null = null

function getPreloadPath(): string {
  const cjs = path.join(__dirname, 'preload.cjs')
  if (fs.existsSync(cjs)) return cjs
  const js = path.join(__dirname, 'preload.js')
  if (fs.existsSync(js)) return js
  return path.join(__dirname, 'preload.mjs')
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: 'D2 VISUALIZER',
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0b0d11',
    frame: false, // Frameless window with custom D2 title bar
    show: false, // Prevents white flash before rendering
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  })

  // Register secure IPC handlers
  registerIpcHandlers(mainWindow)

  // Prevent opening external URLs inside Electron window
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Verification hook for automated CI / smoke testing
  if (process.env.TEST_MODE === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        const testResult = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const hasAPI = typeof window.electronAPI !== 'undefined';
            const ping = hasAPI ? await window.electronAPI.ping() : null;
            const version = hasAPI ? await window.electronAPI.getVersion() : null;
            const platform = hasAPI ? await window.electronAPI.getPlatform() : null;
            return { hasAPI, ping, version, platform };
          })()
        `)
        if (testResult.hasAPI && testResult.ping && testResult.ping.includes('pong')) {
          console.log('[TEST] SUCCESS: IPC Bridge and Renderer verified!')
          setTimeout(() => app.quit(), 500)
        } else {
          console.error('[TEST] FAILED: Invalid test result', testResult)
          process.exit(1)
        }
      } catch (err) {
        console.error('[TEST] ERROR executing test script:', err)
        process.exit(1)
      }
    })
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}
