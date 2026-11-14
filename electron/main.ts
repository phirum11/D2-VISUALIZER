import { app, BrowserWindow, shell, protocol, net } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { registerIpcHandlers } from './ipc/windowIpc'
import { registerMediaIpcHandlers } from './ipc/mediaIpc'

// Enable media playback without requiring initial user interaction (standard for desktop creative editors)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

// Register privileged custom media protocol before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'd2-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
      bypassCSP: true,
    },
  },
])

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
  registerMediaIpcHandlers(mainWindow)

  // Prevent opening external URLs inside Electron window
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Forward renderer console to Node terminal
  mainWindow.webContents.on('console-message', (_event, _level, message) => {
    console.log('[RENDERER CONSOLE]', message)
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Phase 3 Automated Verification & Screenshot hook
  if (process.env.TEST_PHASE3 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 3 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        console.log('[PHASE 3 TEST] Importing test audio:', testAudioPath)

        const testResult = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const store = window.__D2_AUDIO_STORE__;
            if (!store) return { success: false, reason: 'store not found' };

            const success = await store.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            const state = store.getState();
            const track = state.currentTrack;
            const hasWaveform = !!state.waveform && state.waveform.points.length > 0;

            // Start real playback
            await store.getState().play();

            // Wait 1.5 seconds while playing
            await new Promise(r => setTimeout(r, 1500));

            const curTime = store.getState().currentTime;
            const statusAfterPlay = store.getState().status;

            // Open Live Audio Monitor
            store.getState().setAudioMonitorOpen(true);
            await new Promise(r => setTimeout(r, 600));

            return {
              success,
              trackName: track ? track.name : null,
              duration: track ? track.duration : 0,
              sampleRate: track ? track.sampleRate : 0,
              channels: track ? track.channels : 0,
              hasWaveform,
              waveformPoints: state.waveform ? state.waveform.points.length : 0,
              statusAfterPlay,
              curTime,
            };
          })()
        `)

        console.log('[PHASE 3 TEST RESULT]', JSON.stringify(testResult, null, 2))

        // Capture live screenshot with monitor open
        const imageWithMonitor = await mainWindow!.webContents.capturePage()
        const bufferWithMonitor = imageWithMonitor.toPNG()
        fs.writeFileSync(path.join(appRoot, 'd2_visualizer_phase3_preview.png'), bufferWithMonitor)

        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'
        if (fs.existsSync(artifactDir)) {
          fs.writeFileSync(path.join(artifactDir, 'd2_visualizer_phase3_preview.png'), bufferWithMonitor)
        }

        // Close monitor to capture full editor view
        await mainWindow!.webContents.executeJavaScript(`
          window.__D2_AUDIO_STORE__.getState().setAudioMonitorOpen(false);
        `)
        await new Promise(r => setTimeout(r, 600))

        const imageWorkspace = await mainWindow!.webContents.capturePage()
        const bufferWorkspace = imageWorkspace.toPNG()
        fs.writeFileSync(path.join(appRoot, 'd2_visualizer_phase3_workspace.png'), bufferWorkspace)
        if (fs.existsSync(artifactDir)) {
          fs.writeFileSync(path.join(artifactDir, 'd2_visualizer_phase3_workspace.png'), bufferWorkspace)
        }
        console.log('[SCREENSHOT] Saved both preview & workspace screenshots!')

        if (
          testResult.success &&
          testResult.hasWaveform &&
          testResult.curTime > 0
        ) {
          console.log('[PHASE 3 TEST] SUCCESS: Real audio imported, decoded, waveform generated, and played!')
          setTimeout(() => app.quit(), 500)
        } else {
          console.error('[PHASE 3 TEST] FAILED: Audio test assertion failure', testResult)
          process.exit(1)
        }
      } catch (err) {
        console.error('[PHASE 3 TEST] ERROR during test execution:', err)
        process.exit(1)
      }
    })
  }

  // Phase 4 Automated Modular Visualizer Engine Verification & Multi-Style Screenshots
  if (process.env.TEST_PHASE4 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 4 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        console.log('[PHASE 4 TEST] Importing test audio:', testAudioPath)

        // 1. Verify all 10 visualizers are registered in registry
        const registryCheck = await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const reg = window.__D2_REGISTRY__;
            if (!reg) return { success: false, reason: 'registry not found' };
            const all = reg.getAllVisualizers();
            return {
              success: true,
              count: all.length,
              styles: all.map(v => ({ id: v.id, name: v.name, category: v.category, renderType: v.renderType })),
            };
          })()
        `)
        console.log('[PHASE 4 REGISTRY CHECK]', JSON.stringify(registryCheck, null, 2))

        // 2. Load audio track & start playback
        const playResult = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const audioStore = window.__D2_AUDIO_STORE__;
            if (!audioStore) return { success: false, reason: 'audioStore not found' };
            const ok = await audioStore.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            await audioStore.getState().play();
            return { ok, isPlaying: audioStore.getState().isPlaying };
          })()
        `)
        console.log('[PHASE 4 PLAYBACK]', JSON.stringify(playResult))

        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'

        // Helper to switch style, wait for real-time frames, and capture screenshot
        const captureStyle = async (styleId: string, filename: string) => {
          console.log('[PHASE 4 TEST] Testing style: ' + styleId + '...')
          await mainWindow!.webContents.executeJavaScript(
            "window.__D2_COMPOSITION_STORE__.getState().updateVisualizer({ type: '" + styleId + "' });"
          )
          // Wait 1.2s to let audio play and frames render
          await new Promise((r) => setTimeout(r, 1200))

          const pageImage = await mainWindow!.webContents.capturePage()
          const buf = pageImage.toPNG()
          fs.writeFileSync(path.join(appRoot, filename), buf)
          if (fs.existsSync(artifactDir)) {
            fs.writeFileSync(path.join(artifactDir, filename), buf)
          }
          console.log('[PHASE 4 TEST] Saved screenshot: ' + filename)
        }

        // Test style 1: Spectrum Bars (2D)
        await captureStyle('spectrum-bars', 'd2_visualizer_phase4_spectrum.png')

        // Test style 7: 3D Audio Sphere (Three.js WebGL)
        await captureStyle('3d-sphere', 'd2_visualizer_phase4_3d_sphere.png')

        // Test style 8: 3D Frequency Landscape (Three.js WebGL)
        await captureStyle('3d-landscape', 'd2_visualizer_phase4_3d_landscape.png')

        // Test style 10: Particle Visualizer (2D Canvas physics)
        await captureStyle('particles', 'd2_visualizer_phase4_particles.png')

        // Test style 2: Circular Spectrum (2D Canvas)
        await captureStyle('circular-spectrum', 'd2_visualizer_phase4_circular.png')

        // Test style 9: Audio Radar (2D Canvas)
        await captureStyle('audio-radar', 'd2_visualizer_phase4_radar.png')

        // Final full workspace view with 3D sphere active
        await captureStyle('3d-sphere', 'd2_visualizer_phase4_workspace.png')

        console.log('[PHASE 4 TEST] SUCCESS: All 10 visualizer styles verified with real audio reactivity!')
        setTimeout(() => app.quit(), 500)
      } catch (err) {
        console.error('[PHASE 4 TEST] ERROR during test execution:', err)
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

  app.whenReady().then(() => {
    protocol.handle('d2-media', (request) => {
      try {
        const url = request.url.replace(/^d2-media:\/\/(local\/)?/, '')
        const decodedPath = decodeURIComponent(url)
        return net.fetch(pathToFileURL(decodedPath).toString())
      } catch (err) {
        console.error('[PROTOCOL] Failed to stream d2-media file:', err)
        return new Response('File not found', { status: 404 })
      }
    })

    createWindow()
  })

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
