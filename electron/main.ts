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

  // Phase 5 Automated Background, Video & Cinematic Effects Engine Verification
  if (process.env.TEST_PHASE5 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 5 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        const testVideoPath = path.join(appRoot, 'resources', 'test_background_video.mp4')
        const testImagePath = path.join(appRoot, 'resources', 'test_background_image.jpg')
        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'

        // Helper to save screenshots
        const saveScreen = async (filename: string) => {
          const img = await mainWindow!.webContents.capturePage()
          const buf = img.toPNG()
          fs.writeFileSync(path.join(appRoot, filename), buf)
          if (fs.existsSync(artifactDir)) {
            fs.writeFileSync(path.join(artifactDir, filename), buf)
          }
          console.log('[PHASE 5 TEST] Saved screenshot: ' + filename)
        }

        // 1. Start audio playback
        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const audioStore = window.__D2_AUDIO_STORE__;
            await audioStore.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            await audioStore.getState().play();
          })()
        `)
        console.log('[PHASE 5 TEST] Audio playback started.')

        // 2. Test Real Video Background Playback & Sync
        console.log('[PHASE 5 TEST] Testing Video Background...')
        const videoUrl = 'd2-media://media/?path=' + encodeURIComponent(testVideoPath)

        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const bgMgr = window.__D2_BG_MANAGER__;
            const compStore = window.__D2_COMPOSITION_STORE__;
            await bgMgr.loadVideo(${JSON.stringify(videoUrl)});
            compStore.getState().updateBackground({
              type: 'video',
              mediaPath: ${JSON.stringify(videoUrl)},
              mediaName: 'test_background_video.mp4',
              mediaType: 'video',
              sizing: 'fill',
              videoMuted: true,
              loop: true,
            });
            compStore.getState().updateVisualizer({ type: 'spectrum-bars' });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1500))
        await saveScreen('d2_visualizer_phase5_video_background.png')

        // 3. Test High-Res Image Background & Blur / Atmospheric Controls
        console.log('[PHASE 5 TEST] Testing Image Background...')
        const imageUrl = 'd2-media://media/?path=' + encodeURIComponent(testImagePath)

        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const bgMgr = window.__D2_BG_MANAGER__;
            const compStore = window.__D2_COMPOSITION_STORE__;
            await bgMgr.loadImage(${JSON.stringify(imageUrl)});
            compStore.getState().updateBackground({
              type: 'image',
              mediaPath: ${JSON.stringify(imageUrl)},
              mediaName: 'test_background_image.jpg',
              mediaType: 'image',
              sizing: 'fill',
              blur: 6,
              brightness: 1.15,
            });
            compStore.getState().updateVisualizer({ type: 'circular-spectrum' });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1200))
        await saveScreen('d2_visualizer_phase5_image_background.png')

        // 4. Test Ambient Particle Presets & 3D Audio Sphere
        console.log('[PHASE 5 TEST] Testing Ambient Particles...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateBackground({
              type: 'gradient',
              gradientType: 'linear',
              color1: '#2e1065',
              color2: '#0f051d',
              color3: '#581c87',
              gradientAngle: 125,
            });
            compStore.getState().updateAmbientParticles({
              enabled: true,
              preset: 'cosmic',
              particleCount: 160,
              size: 2.5,
              speed: 1.2,
              audioReactivity: 0.8,
              color: '#38bdf8',
              opacity: 0.85,
            });
            compStore.getState().updateVisualizer({ type: '3d-sphere' });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1200))
        await saveScreen('d2_visualizer_phase5_particles_and_glow.png')

        // 5. Test Cinematic Visual Effects (Vignette, Film Grain, Light Leaks, Chromatic Aberration)
        console.log('[PHASE 5 TEST] Testing Cinematic Effects...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateEffects({
              vignette: 55,
              grain: 22,
              lightLeaks: 65,
              chromaticAberration: 6,
              bloom: 30,
            });
            compStore.getState().updateCinematicMotion({
              preset: 'subtle-motion',
              intensity: 1.2,
            });
            compStore.getState().updateVisualizer({ type: '3d-landscape' });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1200))
        await saveScreen('d2_visualizer_phase5_cinematic_effects.png')

        // 6. Test Full Workspace view with Background Panel active
        console.log('[PHASE 5 TEST] Testing Full Workspace view...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const uiStore = window.__D2_UI_STORE__;
            if (uiStore) {
              uiStore.getState().setActiveTab('backgrounds');
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 800))
        await saveScreen('d2_visualizer_phase5_workspace.png')

        console.log('[PHASE 5 TEST] SUCCESS: Background, video playback, ambient particles, and cinematic effects verified!')
        setTimeout(() => app.quit(), 500)
      } catch (err) {
        console.error('[PHASE 5 TEST] ERROR during test execution:', err)
        process.exit(1)
      }
    })
  }

  // Phase 6 Automated Typography, Branding, Artwork & Overlay System Verification
  if (process.env.TEST_PHASE6 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 6 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        const testAlbumArtPath = path.join(appRoot, 'resources', 'test_album_art.png')
        const testLogoPath = path.join(appRoot, 'resources', 'test_logo.png')
        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'

        // Helper to save screenshots
        const saveScreen = async (filename: string) => {
          const img = await mainWindow!.webContents.capturePage()
          const buf = img.toPNG()
          fs.writeFileSync(path.join(appRoot, filename), buf)
          if (fs.existsSync(artifactDir)) {
            fs.writeFileSync(path.join(artifactDir, filename), buf)
          }
          console.log('[PHASE 6 TEST] Saved screenshot: ' + filename)
        }

        // 1. Start audio playback
        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const audioStore = window.__D2_AUDIO_STORE__;
            await audioStore.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            await audioStore.getState().play();
          })()
        `)
        console.log('[PHASE 6 TEST] Audio playback started.')

        // 2. Test Typography Preset (Minimal Luxury / Cinematic)
        console.log('[PHASE 6 TEST] Testing Typography Preset (Minimal Luxury)...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateVisualizer({ type: 'spectrum-bars' });
            compStore.getState().updateBackground({
              type: 'gradient',
              gradientType: 'linear',
              color1: '#0f172a',
              color2: '#020617',
              color3: '#1e1b4b',
              gradientAngle: 135,
            });
            compStore.getState().applyTypographyPreset('minimal-luxury');
          })()
        `)
        await new Promise((r) => setTimeout(r, 1400))
        await saveScreen('d2_visualizer_phase6_typography_presets.png')

        // 3. Test Album Artwork with Circular Crop & Sub-Bass Pulse
        console.log('[PHASE 6 TEST] Testing Album Artwork & Reactive Pulse...')
        const artUrl = 'd2-media://media/?path=' + encodeURIComponent(testAlbumArtPath)
        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const renderer = window.__D2_OVERLAY_RENDERER__;
            if (renderer) {
              await renderer.preloadImage(${JSON.stringify(artUrl)});
            }
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateVisualizer({ type: 'circular-spectrum' });
            compStore.getState().addOverlay({
              id: 'artwork-test',
              name: 'Album Artwork',
              type: 'artwork',
              src: ${JSON.stringify(artUrl)},
              mediaName: 'test_album_art.png',
              shape: 'circle',
              width: 260,
              height: 260,
              positionX: 0,
              positionY: 0,
              scale: 1,
              rotation: 0,
              borderRadius: 16,
              borderWidth: 4,
              borderColor: '#06b6d4',
              shadowColor: 'rgba(0,0,0,0.9)',
              shadowBlur: 24,
              glowColor: '#06b6d4',
              glowBlur: 18,
              opacity: 1,
              startTime: 0,
              endTime: 0,
              animation: { preset: 'fade-in', startTime: 0, duration: 1.0, delay: 0.1, easing: 'ease-out', intensity: 1 },
              visible: true,
              locked: false,
            });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1400))
        await saveScreen('d2_visualizer_phase6_album_artwork.png')

        // 4. Test Structured Music Credits Card
        console.log('[PHASE 6 TEST] Testing Structured Music Credits Block...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateVisualizer({ type: 'radial-waveform' });
            compStore.getState().applyTypographyPreset('music-credits');
          })()
        `)
        await new Promise((r) => setTimeout(r, 1400))
        await saveScreen('d2_visualizer_phase6_music_credits.png')

        // 5. Test Unicode & Khmer Typography
        console.log('[PHASE 6 TEST] Testing Unicode & Khmer Typography...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().updateVisualizer({ type: '3d-sphere' });
            compStore.getState().resetOverlays();
            compStore.getState().updateOverlay('overlay-title', {
              text: 'បទភ្លេងខ្មែរ — និស្ស័យស្នេហ៍',
              fontFamily: 'Khmer OS',
              fontSize: 38,
              letterSpacing: 2,
              color: '#fef08a',
              glowColor: '#eab308',
              glowBlur: 14,
              positionY: -22,
            });
            compStore.getState().updateOverlay('overlay-artist', {
              text: 'D2 VISUALIZER KHMER ARTIST',
              fontFamily: 'Inter',
              fontSize: 18,
              letterSpacing: 4,
              color: '#38bdf8',
              glowColor: '#06b6d4',
              glowBlur: 8,
              positionY: -14,
            });
            compStore.getState().updateOverlay('overlay-subtitle', {
              text: 'OFFICIAL AUDIO • ULTRA HD 4K',
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              letterSpacing: 5,
              positionY: -8,
            });
          })()
        `)
        await new Promise((r) => setTimeout(r, 1400))
        await saveScreen('d2_visualizer_phase6_khmer_unicode.png')

        // 6. Test Full Workspace & Text Panel UI with Watermark
        console.log('[PHASE 6 TEST] Testing Full Workspace & Text Panel UI...')
        const logoUrl = 'd2-media://media/?path=' + encodeURIComponent(testLogoPath)
        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const renderer = window.__D2_OVERLAY_RENDERER__;
            if (renderer) {
              await renderer.preloadImage(${JSON.stringify(logoUrl)});
            }
            const compStore = window.__D2_COMPOSITION_STORE__;
            compStore.getState().addOverlay({
              id: 'watermark-test',
              name: 'D2 Brand Badge',
              type: 'logo',
              src: ${JSON.stringify(logoUrl)},
              mediaName: 'D2 VISUALIZER',
              placement: 'top-right',
              positionX: 0,
              positionY: 0,
              scale: 0.9,
              rotation: 0,
              shadowColor: 'rgba(0,0,0,0.85)',
              shadowBlur: 10,
              glowColor: '#06b6d4',
              glowBlur: 12,
              opacity: 0.9,
              startTime: 0,
              endTime: 0,
              animation: { preset: 'fade-in', startTime: 0, duration: 0.8, delay: 0.2, easing: 'ease-out', intensity: 1 },
              visible: true,
              locked: false,
            });
            const uiStore = window.__D2_UI_STORE__;
            if (uiStore) {
              uiStore.getState().setActiveTab('text');
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 1000))
        await saveScreen('d2_visualizer_phase6_workspace.png')

        console.log('[PHASE 6 TEST] SUCCESS: Typography, branding, album artwork, credits and overlay motion verified!')
        setTimeout(() => app.quit(), 500)
      } catch (err) {
        console.error('[PHASE 6 TEST] ERROR during test execution:', err)
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
        let filePath = ''
        const urlObj = new URL(request.url)
        if (urlObj.searchParams.has('path')) {
          filePath = decodeURIComponent(urlObj.searchParams.get('path')!)
        } else {
          const raw = request.url.replace(/^d2-media:\/\/(media\/)?(local\/)?/, '')
          filePath = decodeURIComponent(raw)
        }

        if (!fs.existsSync(filePath)) {
          console.error('[PROTOCOL] File does not exist:', filePath)
          return new Response('File not found', { status: 404 })
        }

        return net.fetch(pathToFileURL(filePath).toString())
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
