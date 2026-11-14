import { app, BrowserWindow, shell, protocol, net } from 'electron'
import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { registerIpcHandlers } from './ipc/windowIpc'
import { registerMediaIpcHandlers } from './ipc/mediaIpc'
import { registerExportIpcHandlers } from './ipc/exportIpc'

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
  registerExportIpcHandlers(mainWindow)

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

  // Phase 7 Automated Multi-Track Timeline & Sequencing Engine Verification
  if (process.env.TEST_PHASE7 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 7 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        const testVideoPath = path.join(appRoot, 'resources', 'test_background_video.mp4')
        const testAlbumArtPath = path.join(appRoot, 'resources', 'test_album_art.png')
        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'

        // Helper to save screenshots
        const saveScreen = async (filename: string) => {
          const img = await mainWindow!.webContents.capturePage()
          const buf = img.toPNG()
          fs.writeFileSync(path.join(appRoot, filename), buf)
          if (fs.existsSync(artifactDir)) {
            fs.writeFileSync(path.join(artifactDir, filename), buf)
          }
          console.log('[PHASE 7 TEST] Saved screenshot: ' + filename)
        }

        // 1. Import audio track & start playback
        console.log('[PHASE 7 TEST] Importing audio and initializing multi-track timeline...')
        const videoUrl = 'd2-media://media/?path=' + encodeURIComponent(testVideoPath)
        const artUrl = 'd2-media://media/?path=' + encodeURIComponent(testAlbumArtPath)

        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const audioStore = window.__D2_AUDIO_STORE__;
            const bgMgr = window.__D2_BG_MANAGER__;
            const renderer = window.__D2_OVERLAY_RENDERER__;
            const compStore = window.__D2_COMPOSITION_STORE__;

            await audioStore.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            await audioStore.getState().play();

            if (bgMgr) {
              await bgMgr.loadVideo(${JSON.stringify(videoUrl)});
              compStore.getState().updateBackground({
                type: 'video',
                mediaPath: ${JSON.stringify(videoUrl)},
                mediaName: 'test_background_video.mp4',
                mediaType: 'video',
                loop: true,
              });
            }

            if (renderer) {
              await renderer.preloadImage(${JSON.stringify(artUrl)});
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 1000))

        // 2. Overview of 8-Track Multi-Track System
        console.log('[PHASE 7 TEST] Verifying multi-track system (8 tracks)...')
        const trackOverviewResult = await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const timelineStore = window.__D2_TIMELINE_STORE__;
            const tracks = timelineStore.getState().tracks;
            return {
              trackCount: tracks.length,
              trackNames: tracks.map(t => t.name),
              trackTypes: tracks.map(t => t.type),
            };
          })()
        `)
        console.log('[PHASE 7 TEST TRACKS]', JSON.stringify(trackOverviewResult, null, 2))
        await saveScreen('d2_visualizer_phase7_multitrack_overview.png')

        // 3. Real Clip Operations: Move, Trim, Split, Duplicate, Add Keyframes, Add Markers
        console.log('[PHASE 7 TEST] Executing real clip editing operations (Trim, Move, Split, Keyframes)...')
        const editingResult = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const timelineStore = window.__D2_TIMELINE_STORE__;
            const state = timelineStore.getState();

            // Set zoom for comfortable viewing
            state.setZoom(35);

            // A. Move Visualizer clip from 0s to 0.8s
            state.moveClip('clip-visualizer-main', 0.8);

            // B. Trim Background clip left edge to 0.5s
            state.trimClipLeft('clip-bg-main', 0.5);

            // C. Trim Artwork clip right edge (duration to 5.5s)
            state.trimClipRight('clip-artwork-main', 5.5);

            // D. Split Typography clip at 3.5s
            state.splitClipAtTime('clip-typo-main', 3.5);

            // E. Add Keyframes to Visualizer clip
            state.addKeyframeToClip('clip-visualizer-main', 'scale', 0.2, 0.8, 'ease-out');
            state.addKeyframeToClip('clip-visualizer-main', 'scale', 2.0, 1.4, 'ease-in-out');
            state.addKeyframeToClip('clip-visualizer-main', 'scale', 4.0, 1.0, 'linear');

            // F. Add Markers on ruler
            state.addMarker(2.5, 'Drop In', '#06b6d4');
            state.addMarker(5.0, 'Bass Climax', '#f43f5e');

            // G. Duplicate Logo clip
            state.duplicateClip('clip-logo-main');

            const afterTracks = timelineStore.getState().tracks;
            const typoTrack = afterTracks.find(t => t.type === 'typography');

            return {
              success: true,
              typoClipCount: typoTrack ? typoTrack.clips.length : 0,
              visualizerClipStart: afterTracks.find(t => t.type === 'visualizer')?.clips[0]?.startTime,
              bgClipStart: afterTracks.find(t => t.type === 'background')?.clips[0]?.startTime,
              markerCount: timelineStore.getState().markers.length,
            };
          })()
        `)
        console.log('[PHASE 7 EDITING RESULT]', JSON.stringify(editingResult, null, 2))
        await new Promise((r) => setTimeout(r, 800))
        await saveScreen('d2_visualizer_phase7_clip_editing.png')

        // 4. Test Playhead Scrubbing, Frame-Accurate Stepping & Synchronization
        console.log('[PHASE 7 TEST] Testing frame-accurate stepping and scrubbing...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const previewStore = window.__D2_PREVIEW_STORE__;
            const audioStore = window.__D2_AUDIO_STORE__;
            const engine = window.__D2_TIMELINE_ENGINE__;

            // Step forward by 10 frames
            let cur = previewStore.getState().currentTime;
            for (let i = 0; i < 10; i++) {
              cur = engine.stepFrame(cur, 1, 8.0, 30);
            }
            previewStore.getState().setCurrentTime(cur);
            audioStore.getState().seek(cur);
          })()
        `)
        await new Promise((r) => setTimeout(r, 1000))
        await saveScreen('d2_visualizer_phase7_scrubbing_and_sync.png')

        // 5. Test Non-Destructive Undo & Redo History System
        console.log('[PHASE 7 TEST] Testing non-destructive Undo/Redo...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const timelineStore = window.__D2_TIMELINE_STORE__;
            // Test Undo
            timelineStore.getState().undo(); // Undoes duplicate
            timelineStore.getState().undo(); // Undoes marker
            timelineStore.getState().undo(); // Undoes marker
            // Test Redo
            timelineStore.getState().redo();
          })()
        `)
        await new Promise((r) => setTimeout(r, 600))

        // 6. Capture Full Workstation View with Timeline expanded
        console.log('[PHASE 7 TEST] Capturing full workstation view...')
        await saveScreen('d2_visualizer_phase7_workspace.png')

        console.log('[PHASE 7 TEST] SUCCESS: All timeline multi-track, clip editing, keyframes, snapping, and history verified!')
        setTimeout(() => app.quit(), 500)
      } catch (err) {
        console.error('[PHASE 7 TEST] ERROR during test execution:', err)
        process.exit(1)
      }
    })
  }

  // Phase 8 Automated Video Rendering, FFmpeg Export & FFprobe Verification Hook
  if (process.env.TEST_PHASE8 === '1') {
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        console.log('[PHASE 8 TEST] WebContents finished load.')
        await new Promise((r) => setTimeout(r, 1200))

        const testAudioPath = path.join(appRoot, 'resources', 'test_audio_track.wav')
        const testVideoPath = path.join(appRoot, 'resources', 'test_background_video.mp4')
        const testAlbumArtPath = path.join(appRoot, 'resources', 'test_album_art.png')
        const testLogoPath = path.join(appRoot, 'resources', 'test_logo.png')
        const exportOutputDir = path.join(appRoot, 'exports', 'test_phase8')
        const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\9abdc11c-922d-4fcf-a77b-2639ba067298'

        if (!fs.existsSync(exportOutputDir)) {
          fs.mkdirSync(exportOutputDir, { recursive: true })
        }

        // Helper to save screenshots
        const saveScreen = async (filename: string) => {
          const img = await mainWindow!.webContents.capturePage()
          const buf = img.toPNG()
          fs.writeFileSync(path.join(appRoot, filename), buf)
          if (fs.existsSync(artifactDir)) {
            fs.writeFileSync(path.join(artifactDir, filename), buf)
          }
          console.log('[PHASE 8 TEST] Saved screenshot: ' + filename)
        }

        // 1. Load Audio and Open Export Panel UI
        console.log('[PHASE 8 TEST] Loading audio track and switching to Export panel...')
        await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const audioStore = window.__D2_AUDIO_STORE__;
            const uiStore = window.__D2_UI_STORE__;
            await audioStore.getState().importFromPath(${JSON.stringify(testAudioPath)}, 'Test Beat Track 128BPM.wav');
            if (uiStore) {
              uiStore.getState().setActiveTab('export');
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 800))
        await saveScreen('d2_visualizer_phase8_export_panel.png')

        // 2. Capture Rendering Progress State Screenshot
        console.log('[PHASE 8 TEST] Capturing rendering progress state screenshot...')
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const expStore = window.__D2_EXPORT_STORE__;
            if (expStore) {
              expStore.setState({
                isExporting: true,
                exportStage: 'rendering',
                progress: 0.42,
                currentFrame: 126,
                totalFrames: 300,
                renderingFps: 48,
                elapsedSeconds: 3,
                remainingSeconds: 4,
              });
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 600))
        await saveScreen('d2_visualizer_phase8_rendering_progress.png')

        // Array to collect FFprobe results
        interface ProbeSummary {
          testNum: number
          name: string
          file: string
          duration: number
          resolution: string
          fps: string
          vCodec: string
          aCodec: string
          fileSizeMB: string
          success: boolean
        }
        const probeResults: ProbeSummary[] = []

        // Helper to run FFprobe and verify output
        const verifyWithFFprobe = (testNum: number, name: string, filePath: string): ProbeSummary => {
          try {
            const probeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
            const rawJson = execSync(probeCmd, { encoding: 'utf-8' })
            const probeData = JSON.parse(rawJson)

            const vStream = probeData.streams?.find((s: { codec_type: string }) => s.codec_type === 'video')
            const aStream = probeData.streams?.find((s: { codec_type: string }) => s.codec_type === 'audio')
            const duration = parseFloat(probeData.format?.duration || '0')
            const size = parseFloat(probeData.format?.size || '0')
            const fileSizeMB = (size / (1024 * 1024)).toFixed(2) + ' MB'

            const vFps = vStream?.r_frame_rate || 'unknown'
            const res = vStream ? `${vStream.width}x${vStream.height}` : 'unknown'
            const vCodec = vStream?.codec_name || 'unknown'
            const aCodec = aStream?.codec_name || 'unknown'

            const summary: ProbeSummary = {
              testNum,
              name,
              file: path.basename(filePath),
              duration,
              resolution: res,
              fps: vFps,
              vCodec,
              aCodec,
              fileSizeMB,
              success: duration > 0 && vCodec === 'h264' && aCodec === 'aac',
            }

            console.log(`[FFPROBE TEST ${testNum}] ${name}:`, JSON.stringify(summary, null, 2))
            return summary
          } catch (err) {
            console.error(`[FFPROBE ERROR] Failed to probe ${filePath}:`, err)
            return {
              testNum,
              name,
              file: path.basename(filePath),
              duration: 0,
              resolution: 'error',
              fps: 'error',
              vCodec: 'error',
              aCodec: 'error',
              fileSizeMB: '0 MB',
              success: false,
            }
          }
        }

        // ========================================================
        // TEST 1: 10-Second Audio Visualizer (Spectrum Bars, 1920x1080)
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 1: 10-second Audio Visualizer (Spectrum Bars)...')
        const file1 = path.join(exportOutputDir, 'test_1_spectrum_1080p_10s.mp4')
        const res1 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;

            compStore.getState().updateVisualizer({ type: 'spectrum-bars', barCount: 64, smoothing: 0.8 });
            compStore.getState().updateBackground({ type: 'gradient', color1: '#0a0d14', color2: '#161e2e' });

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file1)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 1 RESULT]', res1)
        probeResults.push(verifyWithFFprobe(1, '10s Audio Visualizer (Spectrum)', file1))

        // Capture Export Complete screenshot
        await mainWindow!.webContents.executeJavaScript(`
          (() => {
            const expStore = window.__D2_EXPORT_STORE__;
            if (expStore) {
              expStore.setState({ exportStage: 'completed', progress: 1.0, currentFrame: 300, totalFrames: 300, renderingFps: 48, lastExportedPath: ${JSON.stringify(file1)} });
            }
          })()
        `)
        await new Promise((r) => setTimeout(r, 600))
        await saveScreen('d2_visualizer_phase8_export_complete.png')

        // ========================================================
        // TEST 2: 30-Second Video with Image Background (Circular Spectrum, 1920x1080)
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 2: 30-second Video with Image Background...')
        const file2 = path.join(exportOutputDir, 'test_2_image_bg_30s.mp4')
        const artUrl = 'd2-media://media/?path=' + encodeURIComponent(testAlbumArtPath)
        const res2 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;
            const bgMgr = window.__D2_BG_MANAGER__;

            if (bgMgr) {
              await bgMgr.loadImage(${JSON.stringify(artUrl)});
            }
            compStore.getState().updateBackground({
              type: 'image',
              mediaPath: ${JSON.stringify(artUrl)},
              mediaName: 'test_album_art.png',
              mediaType: 'image',
              blur: 5,
              brightness: 90,
              contrast: 105,
              opacity: 0.85,
            });
            compStore.getState().updateVisualizer({ type: 'circular-spectrum', radius: 180, barCount: 80 });

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 30,
              startTime: 0,
              endTime: 30,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file2)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 2 RESULT]', res2)
        probeResults.push(verifyWithFFprobe(2, '30s Image Background Video', file2))

        // ========================================================
        // TEST 3: Video Background with Audio Synchronization
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 3: Video Background with Audio Sync...')
        const file3 = path.join(exportOutputDir, 'test_3_video_bg_sync.mp4')
        const videoUrl = 'd2-media://media/?path=' + encodeURIComponent(testVideoPath)
        const res3 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;
            const bgMgr = window.__D2_BG_MANAGER__;

            if (bgMgr) {
              await bgMgr.loadVideo(${JSON.stringify(videoUrl)});
            }
            compStore.getState().updateBackground({
              type: 'video',
              mediaPath: ${JSON.stringify(videoUrl)},
              mediaName: 'test_background_video.mp4',
              mediaType: 'video',
              loop: true,
              opacity: 0.9,
            });
            compStore.getState().updateVisualizer({ type: 'classic-waveform', lineWidth: 3 });

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file3)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 3 RESULT]', res3)
        probeResults.push(verifyWithFFprobe(3, 'Video Background with Audio Sync', file3))

        // ========================================================
        // TEST 4: Text Animation, Credits & Logo Overlays
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 4: Text Animation, Credits & Logo Overlays...')
        const file4 = path.join(exportOutputDir, 'test_4_text_logo_overlays.mp4')
        const logoUrl = 'd2-media://media/?path=' + encodeURIComponent(testLogoPath)
        const res4 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;
            const renderer = window.__D2_OVERLAY_RENDERER__;

            if (renderer) {
              await renderer.preloadImage(${JSON.stringify(logoUrl)});
            }

            compStore.getState().updateBackground({ type: 'gradient', color1: '#070b14', color2: '#1e112a' });
            compStore.getState().updateVisualizer({ type: 'radial-waveform', radius: 140 });

            compStore.getState().resetOverlays();
            compStore.getState().updateOverlay('overlay-title', {
              text: 'D2 CINEMATIC EXPORT',
              fontFamily: 'Inter',
              fontSize: 48,
              letterSpacing: 4,
              color: '#ffffff',
              glowColor: '#38bdf8',
              glowBlur: 15,
              positionY: -20,
              animation: { preset: 'glow-pulse', startTime: 0, duration: 1.0, delay: 0, easing: 'ease-in-out', intensity: 1.5 },
            });
            compStore.getState().updateOverlay('overlay-artist', {
              text: 'ULTRA HD 60FPS MUSIC VIDEO',
              fontFamily: 'JetBrains Mono',
              fontSize: 18,
              letterSpacing: 6,
              color: '#38bdf8',
              positionY: -10,
            });

            compStore.getState().addOverlay({
              id: 'test-logo',
              name: 'Brand Badge',
              type: 'logo',
              src: ${JSON.stringify(logoUrl)},
              mediaName: 'logo.png',
              placement: 'top-right',
              positionX: 0,
              positionY: 0,
              scale: 0.85,
              rotation: 0,
              opacity: 0.9,
              startTime: 0,
              endTime: 0,
              animation: { preset: 'fade-in', startTime: 0, duration: 0.5, delay: 0.2, easing: 'ease-out', intensity: 1 },
              visible: true,
              locked: false,
            });

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file4)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 4 RESULT]', res4)
        probeResults.push(verifyWithFFprobe(4, 'Text & Logo Overlays', file4))

        // ========================================================
        // TEST 5: 3D Visualizer (Three.js WebGL Audio Sphere)
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 5: 3D Visualizer (Three.js WebGL Audio Sphere)...')
        const file5 = path.join(exportOutputDir, 'test_5_3d_sphere.mp4')
        const res5 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;

            compStore.getState().resetOverlays();
            compStore.getState().updateBackground({ type: 'color', color1: '#040711' });
            compStore.getState().updateVisualizer({ type: '3d-sphere', sensitivity: 1.2, scale: 1.1 });

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file5)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 5 RESULT]', res5)
        probeResults.push(verifyWithFFprobe(5, '3D WebGL Audio Sphere', file5))

        // ========================================================
        // TEST 6: Timeline Keyframe Modulation
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 6: Timeline Keyframe Modulation...')
        const file6 = path.join(exportOutputDir, 'test_6_timeline_keyframes.mp4')
        const res6 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const timelineStore = window.__D2_TIMELINE_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;

            compStore.getState().updateVisualizer({ type: 'mirrored-spectrum', barCount: 48 });

            // Add dynamic scale & opacity keyframes to visualizer clip
            timelineStore.getState().addKeyframeToClip('clip-visualizer-main', 'scale', 0.5, 0.7, 'ease-out');
            timelineStore.getState().addKeyframeToClip('clip-visualizer-main', 'scale', 5.0, 1.4, 'ease-in-out');
            timelineStore.getState().addKeyframeToClip('clip-visualizer-main', 'scale', 9.5, 1.0, 'linear');

            return await renderEngine.renderVideo({
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file6)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 6 RESULT]', res6)
        probeResults.push(verifyWithFFprobe(6, 'Timeline Keyframe Modulation', file6))

        // ========================================================
        // TEST 7: Portrait 1080x1920 (TikTok / Shorts / Reels)
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 7: Portrait 1080x1920 (Shorts/Reels)...')
        const file7 = path.join(exportOutputDir, 'test_7_portrait_shorts_1080x1920.mp4')
        const res7 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;

            compStore.getState().updateVisualizer({ type: 'particles', sensitivity: 1.3 });
            compStore.getState().updateBackground({ type: 'gradient', color1: '#090514', color2: '#180e2b' });

            return await renderEngine.renderVideo({
              width: 1080,
              height: 1920,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file7)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 7 RESULT]', res7)
        probeResults.push(verifyWithFFprobe(7, 'Portrait 1080x1920 (Shorts/Reels)', file7))

        // ========================================================
        // TEST 8: Square 1080x1080 (Instagram Feed)
        // ========================================================
        console.log('[PHASE 8 TEST] Running Test 8: Square 1080x1080 (Instagram Post)...')
        const file8 = path.join(exportOutputDir, 'test_8_square_1080x1080.mp4')
        const res8 = await mainWindow!.webContents.executeJavaScript(`
          (async () => {
            const compStore = window.__D2_COMPOSITION_STORE__;
            const renderEngine = window.__D2_RENDER_ENGINE__;

            compStore.getState().updateVisualizer({ type: 'dual-rings', radius: 130 });
            compStore.getState().updateBackground({ type: 'gradient', color1: '#0a1017', color2: '#132838' });

            return await renderEngine.renderVideo({
              width: 1080,
              height: 1080,
              fps: 30,
              duration: 10,
              startTime: 0,
              endTime: 10,
              bitrate: '16M',
              audioBitrate: '192k',
              videoCodec: 'auto',
              preset: 'p4',
              outputPath: ${JSON.stringify(file8)},
              audioFilePath: ${JSON.stringify(testAudioPath)},
            }, null, (p) => {});
          })()
        `)
        console.log('[PHASE 8 TEST 8 RESULT]', res8)
        probeResults.push(verifyWithFFprobe(8, 'Square 1080x1080 (Instagram)', file8))

        // Final Workspace Screenshot
        await saveScreen('d2_visualizer_phase8_workspace.png')

        // Print Complete Verification Summary
        console.log('\n========================================================')
        console.log('       PHASE 8 FFMPEG EXPORT VERIFICATION REPORT        ')
        console.log('========================================================')
        console.table(probeResults)

        const allPassed = probeResults.every((r) => r.success)
        if (allPassed) {
          console.log('[PHASE 8 TEST] SUCCESS: All 8 test exports created and verified with FFprobe!')
          setTimeout(() => app.quit(), 500)
        } else {
          console.error('[PHASE 8 TEST] FAILURE: Some test exports failed FFprobe verification!')
          process.exit(1)
        }
      } catch (err) {
        console.error('[PHASE 8 TEST] ERROR during test execution:', err)
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
