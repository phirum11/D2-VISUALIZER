import React, { useRef, useEffect } from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { AudioEngine } from '@/engine/audio/AudioEngine'
import { VisualizerRegistry } from '@/engine/visualizers/VisualizerRegistry'
import { VisualizerRenderContext } from '@/engine/visualizers/types'

export const PreviewCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { aspectRatio, zoom, showSafeGuides, isPlaying } = usePreviewStore()
  const { visualizer, background, text, effects } = useCompositionStore()

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

    const render = () => {
      const w = nativeWidth
      const h = nativeHeight

      // Set canvas pixel buffer
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      // Query real-time FFT audio frame
      const audioFrame = engine.getLiveFrameData()

      ctx.clearRect(0, 0, w, h)

      // 1. Render Background
      if (background.type === 'color') {
        ctx.fillStyle = background.color1
        ctx.fillRect(0, 0, w, h)
      } else {
        // Gradient background
        const rad = (background.gradientAngle * Math.PI) / 180
        const x1 = w / 2 - (Math.cos(rad) * w) / 2
        const y1 = h / 2 - (Math.sin(rad) * h) / 2
        const x2 = w / 2 + (Math.cos(rad) * w) / 2
        const y2 = h / 2 + (Math.sin(rad) * h) / 2
        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, background.color1)
        grad.addColorStop(1, background.color2)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      // 2. Render Audio-Reactive Visualizer via Modular Engine Plugin
      const registry = VisualizerRegistry.getInstance()
      const activeVisualizer = registry.setActiveVisualizer(visualizer.type)

      const renderContext: VisualizerRenderContext = {
        canvas,
        ctx2d: ctx,
        audioFrame,
        config: visualizer,
        effects,
        time: performance.now() / 1000,
        width: w,
        height: h,
        dpr: window.devicePixelRatio || 1,
      }

      activeVisualizer.render(renderContext)

      // 3. Render Typography & Branding
      ctx.save()
      ctx.textAlign = text.alignment
      ctx.textBaseline = 'middle'
      const textX =
        text.alignment === 'center'
          ? w / 2 + (text.positionX / 100) * w
          : text.alignment === 'left'
          ? w * 0.1 + (text.positionX / 100) * w
          : w * 0.9 + (text.positionX / 100) * w

      const textY = h / 2 + (text.positionY / 100) * h
      ctx.globalAlpha = text.opacity

      // Song Title
      ctx.font = `bold ${text.fontSize}px ${text.fontFamily}, sans-serif`
      ctx.fillStyle = text.color
      ctx.shadowColor = 'rgba(0,0,0,0.85)'
      ctx.shadowBlur = 12
      ctx.fillText(text.songTitle, textX, textY - 24)

      // Artist Name
      ctx.font = `500 ${Math.round(text.fontSize * 0.65)}px ${text.fontFamily}, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillText(text.artistName, textX, textY + 20)

      // Subtitle
      if (text.subtitle) {
        ctx.font = `400 ${Math.round(text.fontSize * 0.45)}px ${text.fontFamily}, sans-serif`
        ctx.fillStyle = 'rgba(99, 102, 241, 0.9)'
        ctx.fillText(text.subtitle.toUpperCase(), textX, textY + 54)
      }

      ctx.restore()

      // 4. Render Post Effects (Vignette & Atmospheric Glow)
      if (effects.vignette > 0) {
        const vigGrad = ctx.createRadialGradient(
          w / 2,
          h / 2,
          Math.min(w, h) * 0.35,
          w / 2,
          h / 2,
          Math.max(w, h) * 0.75
        )
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
        vigGrad.addColorStop(1, `rgba(0,0,0,${effects.vignette / 100})`)
        ctx.fillStyle = vigGrad
        ctx.fillRect(0, 0, w, h)
      }

      // 5. Render Safe Area Guides
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
