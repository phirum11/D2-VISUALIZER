import React, { useEffect, useRef } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { WaveformGenerator } from '@/engine/audio/WaveformGenerator'

interface TimelineWaveformProps {
  width: number
  startTime: number
  duration: number
}

export const TimelineWaveform: React.FC<TimelineWaveformProps> = ({ width, startTime, duration }) => {
  const waveform = useAudioStore((s) => s.waveform)
  const progress = useAudioStore((s) => duration > 0
    ? Math.max(0, Math.min(1, (s.currentTime - startTime) / duration)) : 0)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const playedRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!waveform) return
    for (const [canvas, color] of [[baseRef.current, '#6f718e'], [playedRef.current, '#c4b4e9']] as const) {
      if (!canvas) continue
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      // Cap allocation for long projects; CSS still fills the complete clip width.
      canvas.width = Math.max(10, Math.min(16384, Math.floor(width)))
      canvas.height = 34
      WaveformGenerator.drawWaveform(ctx, waveform, canvas.width, canvas.height, color, -1)
    }
  }, [waveform, width])

  if (!waveform) {
    return (
      <div className="w-full flex items-center justify-around opacity-40">
        {Array.from({ length: 48 }, (_, i) => (
          <div key={i} className="w-0.5 bg-indigo-300 rounded-full"
            style={{ height: `${Math.abs(Math.sin(i * 0.45)) * 75 + 15}%` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={baseRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={playedRef} data-waveform-progress className="absolute inset-0 w-full h-full"
        style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }} />
    </div>
  )
}
