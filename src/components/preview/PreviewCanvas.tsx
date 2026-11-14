import React, { useRef, useEffect } from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { AudioEngine } from '@/engine/audio/AudioEngine'
import { LayerCompositor } from '@/engine/layers/LayerCompositor'

export const PreviewCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { aspectRatio, zoom, showSafeGuides, isPlaying } = usePreviewStore()
  const { visualizer, background, text, effects, ambientParticles, cinematicMotion, layers } =
    useCompositionStore()

  // Native internal rendering dimensions
  const getNativeDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 1080, height: 1920 }
      case '1:1':
        return { width: 1080, height: 1080 }
      case '16:9':
      default:
        return { width: 1920, height: 1080 }
    }
  }

  const { width: nativeWidth, height: nativeHeight } = getNativeDimensions()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const engine = AudioEngine.getInstance()
    const compositor = LayerCompositor.getInstance()

    const render = () => {
      const w = nativeWidth
      const h = nativeHeight

      // Set canvas pixel buffer
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      // Query real-time FFT audio frame and playhead
      const audioFrame = engine.getLiveFrameData()
      const audioTime = engine.getCurrentTime()
      const timestamp = audioTime > 0 ? audioTime : performance.now() / 1000
      const state = useCompositionStore.getState()

      // Delegate complete multi-layer rendering to LayerCompositor
      compositor.render({
        canvas,
        ctx,
        state,
        audioFrame,
        timestamp,
        width: w,
        height: h,
        dpr: window.devicePixelRatio || 1,
        showSafeGuides,
        isPlaying,
        audioTime,
      })

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [
    nativeWidth,
    nativeHeight,
    aspectRatio,
    isPlaying,
    visualizer,
    background,
    text,
    effects,
    ambientParticles,
    cinematicMotion,
    layers,
    showSafeGuides,
  ])

  // Compute CSS display scaling
  const getContainerStyle = () => {
    if (zoom > 0) {
      return {
        width: `${nativeWidth * zoom * 0.5}px`,
        height: `${nativeHeight * zoom * 0.5}px`,
      }
    }
    const aspectStyle =
      aspectRatio === '9:16'
        ? 'h-[85%] aspect-[9/16]'
        : aspectRatio === '1:1'
        ? 'h-[85%] aspect-square'
        : 'w-[90%] aspect-video'
    return { className: aspectStyle }
  }

  const containerStyle = getContainerStyle()

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full bg-d2-canvas flex items-center justify-center p-6 overflow-hidden relative"
      style={{
        backgroundImage:
          'radial-gradient(circle, #1a202c 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className={`relative shadow-2xl rounded border border-d2-border overflow-hidden flex items-center justify-center bg-black transition-all ${
          containerStyle.className || ''
        }`}
        style={
          zoom > 0
            ? { width: containerStyle.width, height: containerStyle.height }
            : {}
        }
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Aspect Ratio Badge Overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-2xs font-mono text-white/80 pointer-events-none">
          {aspectRatio} • {nativeWidth}×{nativeHeight}
        </div>
      </div>
    </div>
  )
}
