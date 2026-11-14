import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { registerIpcHandlers } from './ipc/windowIpc'

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

  // Verification & Screenshot hook
  if (process.env.TEST_MODE === '1' || process.env.SCREENSHOT_MODE === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[TEST] WebContents finished load.')
        // Wait 1.2s for React and Canvas to render
        await new Promise((r) => setTimeout(r, 1200))

        const testResult = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const hasAPI = typeof window.electronAPI !== 'undefined';
            const ping = hasAPI ? await window.electronAPI.ping() : null;
            const titlePresent = !!document.querySelector('header');
            const canvasPresent = !!document.querySelector('canvas');
            const tracksPresent = document.querySelectorAll('.flex.h-11').length;
            return { hasAPI, ping, titlePresent, canvasPresent, tracksPresent };
          })()
        `)
        console.log('[TEST RESULT]', JSON.stringify(testResult, null, 2))

        if (process.env.SCREENSHOT_MODE === '1') {
          const image = await mainWindow!.webContents.capturePage()
          const buffer = image.toPNG()
          const localPath = path.join(appRoot, 'd2_visualizer_phase2_preview.png')
          fs.writeFileSync(localPath, buffer)
          console.log('[SCREENSHOT] Saved local screenshot to:', localPath)

          // Also copy to artifact dir for direct embedding
          const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'
          if (fs.existsSync(artifactDir)) {
            const artifactPath = path.join(artifactDir, 'd2_visualizer_phase2_preview.png')
            fs.writeFileSync(artifactPath, buffer)
            console.log('[SCREENSHOT] Saved artifact screenshot to:', artifactPath)
          }
        }

        if (testResult.hasAPI && testResult.titlePresent && testResult.canvasPresent) {
          console.log('[TEST] SUCCESS: Professional Editor UI verified!')
          setTimeout(() => app.quit(), 500)
        } else {
          console.error('[TEST] FAILED: Missing essential UI components', testResult)
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

// Single instance lock
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
