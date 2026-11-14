import { CompositionState } from '@/stores/compositionStore'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'
import { BackgroundManager } from '@/engine/background/BackgroundManager'
import { AmbientParticleSystem } from '@/engine/effects/AmbientParticles'
import { CinematicEffects } from '@/engine/effects/CinematicEffects'
import { VisualizerRegistry } from '@/engine/visualizers/VisualizerRegistry'
import { VisualizerRenderContext } from '@/engine/visualizers/types'
import { OverlayRenderer } from '@/engine/overlay/OverlayRenderer'

export interface CompositeRenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  state: CompositionState
  audioFrame: AudioFrameData
  timestamp: number
  width: number
  height: number
  dpr: number
  showSafeGuides: boolean
  isPlaying: boolean
  audioTime: number
}

export class LayerCompositor {
  private static instance: LayerCompositor | null = null

  private bgManager = BackgroundManager.getInstance()
  private ambientParticles = new AmbientParticleSystem()
  private cinematicEffects = CinematicEffects.getInstance()
  private visualizerRegistry = VisualizerRegistry.getInstance()
  private overlayRenderer = OverlayRenderer.getInstance()

  private constructor() {}

  public static getInstance(): LayerCompositor {
    if (!LayerCompositor.instance) {
      LayerCompositor.instance = new LayerCompositor()
    }
    return LayerCompositor.instance
  }

  public render(context: CompositeRenderContext): void {
    const {
      canvas,
      ctx,
      state,
      audioFrame,
      timestamp,
      width: w,
      height: h,
      dpr,
      showSafeGuides,
      isPlaying,
      audioTime,
    } = context

    const { background, visualizer, effects, ambientParticles, cinematicMotion, layers } = state

    // 1. Synchronize Background Video Playback with audio time
    if (background.type === 'video') {
      this.bgManager.syncVideoPlayback(background, audioTime, isPlaying)
    }

    // 2. Clear canvas
    ctx.clearRect(0, 0, w, h)

    // 3. Compute Cinematic Camera Motion
    const camera = this.cinematicEffects.getCameraMotion(cinematicMotion, audioFrame, timestamp)

    ctx.save()
    // Apply camera motion around canvas center
    if (camera.scale !== 1 || camera.translateX !== 0 || camera.translateY !== 0) {
      ctx.translate(w / 2, h / 2)
      ctx.scale(camera.scale, camera.scale)
      ctx.translate(-w / 2 + camera.translateX, -h / 2 + camera.translateY)
    }

    // Helper map of layers by type
    const layerMap = new Map(layers.map((l) => [l.type, l]))

    // ========================================================
    // LAYER 1 & 2: BACKGROUND (BASE GRADIENT/COLOR OR MEDIA)
    // ========================================================
    const baseBgLayer = layerMap.get('base-background')
    const mediaBgLayer = layerMap.get('media-background')

    const isBgVisible =
      (background.type === 'color' || background.type === 'gradient')
        ? baseBgLayer?.visible ?? true
        : mediaBgLayer?.visible ?? true

    if (isBgVisible) {
      ctx.save()
      const bgOpacity =
        (background.type === 'color' || background.type === 'gradient')
          ? (baseBgLayer?.opacity ?? 1)
          : (mediaBgLayer?.opacity ?? 1) * background.opacity
      ctx.globalAlpha = bgOpacity
      this.bgManager.render(ctx, w, h, background, timestamp)
      ctx.restore()
    }

    // ========================================================
    // LAYER 4: AMBIENT PARTICLES
    // ========================================================
    const particlesLayer = layerMap.get('ambient-particles')
    if (ambientParticles.enabled && (particlesLayer?.visible ?? true)) {
      ctx.save()
      ctx.globalAlpha = (particlesLayer?.opacity ?? 1) * ambientParticles.opacity
      this.ambientParticles.render(ctx, w, h, ambientParticles, audioFrame, timestamp)
      ctx.restore()
    }

    // ========================================================
    // LAYER 5: AUDIO VISUALIZER (MODULAR ENGINE)
    // ========================================================
    const visualizerLayer = layerMap.get('visualizer')
    if (visualizerLayer?.visible ?? true) {
      ctx.save()
      ctx.globalAlpha = (visualizerLayer?.opacity ?? 1)

      const activeVisualizer = this.visualizerRegistry.setActiveVisualizer(visualizer.type)
      const vizContext: VisualizerRenderContext = {
        canvas,
        ctx2d: ctx,
        audioFrame,
        config: visualizer,
        effects,
        time: timestamp,
        width: w,
        height: h,
        dpr,
      }
      activeVisualizer.render(vizContext)
      ctx.restore()
    }

    // ========================================================
    // LAYER 6, 7 & 8: OVERLAYS (TYPOGRAPHY, ALBUM ARTWORK, LOGO & CREDITS)
    // ========================================================
    const typoLayer = layerMap.get('typography')
    const artworkLayer = layerMap.get('artwork')
    const watermarkLayer = layerMap.get('watermark')

    const overlaysToRender = (state.overlays || []).filter((item) => {
      if (!item.visible) return false
      if (item.type === 'text' && typoLayer && !typoLayer.visible) return false
      if (item.type === 'artwork' && artworkLayer && !artworkLayer.visible) return false
      if (item.type === 'logo' && watermarkLayer && !watermarkLayer.visible) return false
      if (item.type === 'credits' && typoLayer && !typoLayer.visible) return false
      return true
    })

    if (overlaysToRender.length > 0) {
      ctx.save()
      this.overlayRenderer.renderOverlays(
        ctx,
        w,
        h,
        overlaysToRender,
        timestamp,
        audioFrame
      )
      ctx.restore()
    }

    // ========================================================
    // LAYER 9: FOREGROUND EFFECTS (VIGNETTE, GRAIN, RGB SPLIT, LEAKS)
    // ========================================================
    const fxLayer = layerMap.get('foreground-effects')
    if (fxLayer?.visible ?? true) {
      ctx.save()
      ctx.globalAlpha = fxLayer?.opacity ?? 1
      this.cinematicEffects.applyPostEffects(ctx, w, h, effects, audioFrame, timestamp)
      ctx.restore()
    }

    // Restore camera motion transform
    ctx.restore()

    // ========================================================
    // LAYER 10: SAFE AREA GUIDES (PREVIEW ONLY)
    // ========================================================
    if (showSafeGuides) {
      ctx.save()
      // Action Safe (90%)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 6])
      ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9)

      // Title Safe (80%)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 6])
      ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8)

      // Guide Labels
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)'
      ctx.fillText('ACTION SAFE (90%)', w * 0.05 + 10, h * 0.05 + 20)
      ctx.fillStyle = 'rgba(244, 63, 94, 0.8)'
      ctx.fillText('TITLE SAFE (80%)', w * 0.1 + 10, h * 0.1 + 20)

      // Center crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(w / 2 - 20, h / 2)
      ctx.lineTo(w / 2 + 20, h / 2)
      ctx.moveTo(w / 2, h / 2 - 20)
      ctx.lineTo(w / 2, h / 2 + 20)
      ctx.stroke()
      ctx.restore()
    }
  }

  public dispose(): void {
    this.bgManager.dispose()
    this.visualizerRegistry.disposeAll()
    this.overlayRenderer.clearCache()
  }
}
