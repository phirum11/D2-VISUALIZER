import { LayerCompositor } from '../layers/LayerCompositor'
import { AudioAnalysisCache } from './AudioAnalysisCache'
import { useCompositionStore } from '@/stores/compositionStore'
import { BackgroundManager } from '../background/BackgroundManager'

export interface RenderJobConfig {
  width: number
  height: number
  fps: number
  duration: number
  startTime?: number
  endTime?: number
  bitrate: string
  audioBitrate: string
  videoCodec: 'libx264' | 'h264_nvenc' | 'auto'
  preset: string
  crf?: number
  outputPath: string
  audioFilePath?: string
}

export interface RenderProgress {
  currentFrame: number
  totalFrames: number
  progress: number
  renderingFps: number
  elapsedSeconds: number
  remainingSeconds: number
  stage: 'idle' | 'analyzing-audio' | 'rendering' | 'finalizing' | 'completed' | 'error' | 'cancelled'
  error?: string
}

export class OfflineRenderEngine {
  private static instance: OfflineRenderEngine | null = null

  private isRendering: boolean = false
  private cancelRequested: boolean = false
  private audioCache = new AudioAnalysisCache(2048)
  private compositor = LayerCompositor.getInstance()
  private bgManager = BackgroundManager.getInstance()

  private constructor() {}

  public static getInstance(): OfflineRenderEngine {
    if (!OfflineRenderEngine.instance) {
      OfflineRenderEngine.instance = new OfflineRenderEngine()
    }
    return OfflineRenderEngine.instance
  }

  public getAudioCache(): AudioAnalysisCache {
    return this.audioCache
  }

  public cancel(): void {
    if (this.isRendering) {
      this.cancelRequested = true
    }
  }

  /**
   * Pre-analyzes audio buffer for deterministic offline rendering
   */
  public async prepareAudio(
    audioBuffer: AudioBuffer | null,
    fps: number,
    duration: number,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await this.audioCache.analyzeBuffer(audioBuffer, fps, duration, (p) => {
      onProgress?.(p.progress)
    })
  }

  /**
   * Executes deterministic offline frame rendering and streams directly to FFmpeg
   */
  public async renderVideo(
    config: RenderJobConfig,
    audioBuffer: AudioBuffer | null,
    onProgress: (p: RenderProgress) => void
  ): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    if (this.isRendering) {
      return { success: false, error: 'A render job is already running' }
    }

    this.isRendering = true
    this.cancelRequested = false

    const {
      width,
      height,
      fps,
      duration,
      startTime = 0,
      endTime = duration,
      outputPath,
      audioFilePath,
      bitrate,
      audioBitrate,
      videoCodec,
      preset,
      crf,
    } = config

    const renderDuration = Math.max(0.1, endTime - startTime)
    const totalFrames = Math.max(1, Math.ceil(renderDuration * fps))

    try {
      // 1. Analyze Audio Track
      onProgress({
        currentFrame: 0,
        totalFrames,
        progress: 0,
        renderingFps: 0,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        stage: 'analyzing-audio',
      })

      await this.prepareAudio(audioBuffer, fps, renderDuration, (analysisProgress) => {
        onProgress({
          currentFrame: 0,
          totalFrames,
          progress: analysisProgress * 0.05,
          renderingFps: 0,
          elapsedSeconds: 0,
          remainingSeconds: 0,
          stage: 'analyzing-audio',
        })
      })

      if (this.cancelRequested) {
        this.isRendering = false
        onProgress({
          currentFrame: 0,
          totalFrames,
          progress: 0,
          renderingFps: 0,
          elapsedSeconds: 0,
          remainingSeconds: 0,
          stage: 'cancelled',
        })
        return { success: false, error: 'Render was cancelled' }
      }

      // 2. Start FFmpeg session in Electron Main via IPC
      if (!window.electronAPI) {
        throw new Error('Electron API not available for FFmpeg export')
      }

      const startRes = await window.electronAPI.exportStart({
        width,
        height,
        fps,
        duration: renderDuration,
        startTime,
        outputPath,
        audioFilePath,
        bitrate,
        audioBitrate,
        videoCodec,
        preset,
        crf,
      })

      if (!startRes.success) {
        throw new Error(startRes.error || 'Failed to initialize FFmpeg exporter')
      }

      // 3. Create Offscreen Rendering Canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        throw new Error('Failed to create offscreen 2D canvas context')
      }

      const state = useCompositionStore.getState()
      const startTimeStamp = performance.now()
      let lastFpsTime = startTimeStamp
      let framesSinceLastFps = 0
      let currentFps = 0

      // 4. Deterministic Frame-by-Frame Rendering Loop
      for (let f = 0; f < totalFrames; f++) {
        if (this.cancelRequested) {
          await window.electronAPI.exportCancel()
          this.isRendering = false
          onProgress({
            currentFrame: f,
            totalFrames,
            progress: f / totalFrames,
            renderingFps: currentFps,
            elapsedSeconds: (performance.now() - startTimeStamp) / 1000,
            remainingSeconds: 0,
            stage: 'cancelled',
          })
          return { success: false, error: 'Render was cancelled' }
        }

        const exactTime = startTime + f / fps

        // A. Video Background synchronization (exact seek if active)
        if (state.background.type === 'video') {
          await this.bgManager.seekVideoExact(state.background, exactTime)
        }

        // B. Query deterministic frame analysis
        const audioFrame = this.audioCache.getFrameAtIndex(f)

        // C. Render full layer composite
        this.compositor.render({
          canvas,
          ctx,
          state,
          audioFrame,
          timestamp: exactTime,
          width,
          height,
          dpr: 1,
          showSafeGuides: false,
          isPlaying: true,
          audioTime: exactTime,
        })

        // D. Extract RGBA pixel data
        const imageData = ctx.getImageData(0, 0, width, height)
        const frameBuffer = new Uint8Array(imageData.data.buffer)

        // E. Stream frame buffer to Electron Main FFmpeg pipe
        const writeRes = await window.electronAPI.exportWriteFrame(frameBuffer)
        if (!writeRes.success) {
          throw new Error(writeRes.error || `Failed to write frame ${f} to FFmpeg`)
        }

        // F. Calculate performance & progress metrics
        framesSinceLastFps++
        const now = performance.now()
        if (now - lastFpsTime >= 500) {
          currentFps = Math.round((framesSinceLastFps / (now - lastFpsTime)) * 1000)
          framesSinceLastFps = 0
          lastFpsTime = now
        }

        const elapsedSec = (now - startTimeStamp) / 1000
        const avgFps = (f + 1) / elapsedSec
        const remainingFrames = totalFrames - (f + 1)
        const remainingSec = avgFps > 0 ? remainingFrames / avgFps : 0
        const progress = 0.05 + ((f + 1) / totalFrames) * 0.9

        onProgress({
          currentFrame: f + 1,
          totalFrames,
          progress,
          renderingFps: currentFps || Math.round(avgFps),
          elapsedSeconds: Math.round(elapsedSec),
          remainingSeconds: Math.round(remainingSec),
          stage: 'rendering',
        })

        if (f % 30 === 0 || f === totalFrames - 1) {
          console.log(`[RENDER ENGINE] Frame ${f + 1}/${totalFrames} (${Math.round(progress * 100)}%) @ ${currentFps || Math.round(avgFps)} FPS`)
        }

        // Microtask yield every 10 frames to keep renderer responsive
        if (f % 10 === 0) {
          await new Promise((r) => setTimeout(r, 0))
        }
      }

      // 5. Finalize FFmpeg Muxing & Encoding
      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        progress: 0.98,
        renderingFps: currentFps,
        elapsedSeconds: Math.round((performance.now() - startTimeStamp) / 1000),
        remainingSeconds: 0,
        stage: 'finalizing',
      })

      const finishRes = await window.electronAPI.exportFinish()
      if (!finishRes.success) {
        throw new Error(finishRes.error || 'Failed to finalize exported MP4')
      }

      this.isRendering = false

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        progress: 1.0,
        renderingFps: currentFps,
        elapsedSeconds: Math.round((performance.now() - startTimeStamp) / 1000),
        remainingSeconds: 0,
        stage: 'completed',
      })

      return {
        success: true,
        outputPath: finishRes.outputPath || outputPath,
      }
    } catch (err: unknown) {
      this.isRendering = false
      const errorMsg = err instanceof Error ? err.message : String(err)
      try {
        if (window.electronAPI) {
          await window.electronAPI.exportCancel()
        }
      } catch {
        // ignore secondary error
      }

      onProgress({
        currentFrame: 0,
        totalFrames,
        progress: 0,
        renderingFps: 0,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        stage: 'error',
        error: errorMsg,
      })

      return { success: false, error: errorMsg }
    }
  }
}
