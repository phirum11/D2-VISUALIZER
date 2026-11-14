import React, { useRef, useEffect } from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { AudioEngine } from '@/engine/audio/AudioEngine'

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
      const rawFrequencies = audioFrame.normalizedFrequencies
      const { subBass, bass } = audioFrame.bands

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

      // 2. Render Audio-Reactive Visualizer
      ctx.save()
      const centerX = w / 2 + (visualizer.positionX / 100) * w
      const centerY = h / 2 + (visualizer.positionY / 100) * h

      // Beat Pulse reaction on scale driven by sub-bass
      const beatScale =
        effects.beatPulse > 0
          ? 1 + (subBass * 0.4 + bass * 0.2) * (effects.beatPulse / 100)
          : 1

      ctx.translate(centerX, centerY)
      ctx.scale(visualizer.scale * beatScale, visualizer.scale * beatScale)
      ctx.rotate((visualizer.rotation * Math.PI) / 180)
      ctx.globalAlpha = visualizer.opacity

      // Real audio-driven glow
      if (visualizer.glow > 0) {
        ctx.shadowColor = visualizer.primaryColor
        ctx.shadowBlur = visualizer.glow * (0.6 + bass * 0.8)
      }

      const barCount = visualizer.barCount || 48
      const binStep = Math.max(1, Math.floor(rawFrequencies.length / barCount))

      if (
        visualizer.type === 'circular-spectrum' ||
        visualizer.type === 'dual-rings'
      ) {
        // Render Circular Spectrum driven by real FFT bins
        const radius = Math.min(w, h) * 0.18
        const angleStep = (Math.PI * 2) / barCount

        for (let i = 0; i < barCount; i++) {
          const angle = i * angleStep
          // Sample real audio bin magnitude
          const binIndex = (i * binStep) % rawFrequencies.length
          const mag = rawFrequencies[binIndex] || 0
          const barH = 6 + mag * 130 * visualizer.sensitivity

          const xStart = Math.cos(angle) * radius
          const yStart = Math.sin(angle) * radius
          const xEnd = Math.cos(angle) * (radius + barH)
          const yEnd = Math.sin(angle) * (radius + barH)

          ctx.strokeStyle =
            i % 2 === 0 ? visualizer.primaryColor : visualizer.accentColor
          ctx.lineWidth = visualizer.thickness
          ctx.beginPath()
          ctx.moveTo(xStart, yStart)
          ctx.lineTo(xEnd, yEnd)
          ctx.stroke()
        }

        // Reactive inner bass ring
        ctx.strokeStyle = visualizer.accentColor
        ctx.lineWidth = 2 + bass * 4
        ctx.beginPath()
        ctx.arc(0, 0, radius - 4, 0, Math.PI * 2)
        ctx.stroke()
      } else if (
        visualizer.type === 'classic-waveform' ||
        visualizer.type === 'radial-waveform'
      ) {
        // Render Linear Oscillograph Waveform
        const length = w * 0.7
        const points = 100
        ctx.strokeStyle = visualizer.primaryColor
        ctx.lineWidth = visualizer.thickness
        ctx.beginPath()

        for (let i = 0; i < points; i++) {
          const x = -length / 2 + (i / points) * length
          const binIdx = Math.floor((i / points) * 128)
          const mag = rawFrequencies[binIdx] || 0
          const y = (i % 2 === 0 ? 1 : -1) * mag * 80 * visualizer.sensitivity
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      } else {
        // Default: Real Audio Frequency Spectrum Bars
        const totalW = barCount * (visualizer.thickness + visualizer.spacing)
        const startX = -totalW / 2

        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (visualizer.thickness + visualizer.spacing)
          const binIndex = Math.min(
            rawFrequencies.length - 1,
            Math.floor(i * binStep * 0.7) // weight toward bass/mid
          )
          const magnitude = rawFrequencies[binIndex] || 0
          const barHeight = Math.max(
            4,
            magnitude * 220 * visualizer.sensitivity
          )

          const barGrad = ctx.createLinearGradient(0, 0, 0, -barHeight)
          barGrad.addColorStop(0, visualizer.primaryColor)
          barGrad.addColorStop(1, visualizer.accentColor)

          ctx.fillStyle = barGrad
          ctx.fillRect(x, -barHeight / 2, visualizer.thickness, barHeight)
        }
      }

      ctx.restore()

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
