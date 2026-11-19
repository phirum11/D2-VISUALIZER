import React, { useRef, useEffect } from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { AudioEngine } from '@/engine/audio/AudioEngine'
import { LayerCompositor } from '@/engine/layers/LayerCompositor'

export const PreviewCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { aspectRatio, zoom, showSafeGuides, isPlaying, previewQuality, isFullscreenPreview, toggleFullscreenPreview, setIsFullscreenPreview } = usePreviewStore()

  // Fullscreen keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false)
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        toggleFullscreenPreview()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreenPreview, setIsFullscreenPreview, toggleFullscreenPreview])

  // Native internal rendering dimensions
  const getNativeDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 1080, height: 1920 }
      case '1:1':
        return { width: 1080, height: 1080 }
      case '4:5':
        return { width: 1080, height: 1350 }
      case '21:9':
        return { width: 2560, height: 1080 }
      case '16:9':
      default:
        return { width: 1920, height: 1080 }
    }
  }

  const { width: nativeWidth, height: nativeHeight } = getNativeDimensions()
  const qualityScale =
    previewQuality === 'performance' ? 0.6 : previewQuality === 'balanced' ? 0.85 : 1.0
  const bufferWidth = Math.round(nativeWidth * qualityScale)
  const bufferHeight = Math.round(nativeHeight * qualityScale)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const engine = AudioEngine.getInstance()
    const compositor = LayerCompositor.getInstance()

    const render = () => {
      // Set canvas pixel buffer according to active performance mode
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth
        canvas.height = bufferHeight
      }

      // Query real-time FFT audio frame and playhead
      const audioFrame = engine.getLiveFrameData()
      const audioTime = engine.getCurrentTime()
      const timestamp = audioTime > 0 ? audioTime : performance.now() / 1000
      const state = useCompositionStore.getState()

      ctx.save()
      if (qualityScale !== 1) {
        ctx.scale(qualityScale, qualityScale)
      }

      // Delegate complete multi-layer rendering to LayerCompositor
      compositor.render({
        canvas,
        ctx,
        state,
        audioFrame,
        timestamp,
        width: nativeWidth,
        height: nativeHeight,
        dpr: window.devicePixelRatio || 1,
        showSafeGuides,
        isPlaying,
        audioTime,
      })

      ctx.restore()

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [
    nativeWidth,
    nativeHeight,
    bufferWidth,
    bufferHeight,
    qualityScale,
    aspectRatio,
    isPlaying,
    previewQuality,
    showSafeGuides,
  ])

  // Compute CSS display scaling
  const getContainerStyle = () => {
    if (isFullscreenPreview) {
      return { className: 'w-full h-full max-w-full max-h-full' }
    }
    if (zoom > 0) {
      return {
        width: `${nativeWidth * zoom * 0.5}px`,
        height: `${nativeHeight * zoom * 0.5}px`,
      }
    }
    const aspectStyle =
      aspectRatio === '9:16'
        ? 'h-full max-h-[92%] aspect-[9/16]'
        : aspectRatio === '1:1'
        ? 'h-full max-h-[92%] aspect-square'
        : aspectRatio === '4:5'
        ? 'h-full max-h-[92%] aspect-[4/5]'
        : aspectRatio === '21:9'
        ? 'w-full max-w-[94%] aspect-[21/9]'
        : 'max-w-[94%] max-h-[92%] aspect-video'
    return { className: aspectStyle }
  }

  const containerStyle = getContainerStyle()

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreenPreview
          ? 'fixed inset-0 z-50 bg-black p-0'
          : 'flex-1 w-full h-full bg-[#0a0c10] p-4 relative'
      } flex items-center justify-center overflow-hidden transition-all`}
      style={
        isFullscreenPreview
          ? {}
          : {
              backgroundImage:
                'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }
      }
    >
      {/* Floating Exit Button for Fullscreen */}
      {isFullscreenPreview && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsFullscreenPreview(false)}
            className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 text-xs font-mono backdrop-blur-md transition-all shadow-xl flex items-center gap-2"
          >
            <span>Exit Fullscreen</span>
            <span className="text-3xs px-1.5 py-0.5 rounded bg-white/20 text-white font-bold">ESC</span>
          </button>
        </div>
      )}

      <div
        className={`relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg overflow-hidden flex items-center justify-center bg-black transition-all ${
          containerStyle.className || ''
        }`}
        style={
          !isFullscreenPreview && zoom > 0
            ? { width: containerStyle.width, height: containerStyle.height }
            : {}
        }
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  )
}
