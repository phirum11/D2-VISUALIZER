import React, { useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { usePreviewStore } from '@/stores/previewStore'
import { Tooltip } from '@/components/ui/Tooltip'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export const PlaybackToolbar: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLooping,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    toggleLooping,
  } = usePreviewStore()

  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  // Simulation timer for playback interaction
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now()
      const step = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = (now - lastTimeRef.current) / 1000
          const current = usePreviewStore.getState().currentTime
          const next = current + delta
          if (next >= duration) {
            if (isLooping) {
              setCurrentTime(0)
            } else {
              setIsPlaying(false)
              setCurrentTime(duration)
            }
          } else {
            setCurrentTime(next)
          }
        }
        lastTimeRef.current = now
        animRef.current = requestAnimationFrame(step)
      }
      animRef.current = requestAnimationFrame(step)
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      lastTimeRef.current = null
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying, duration, isLooping, setCurrentTime, setIsPlaying])

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setCurrentTime(val)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="h-11 w-full bg-d2-surface border-t border-d2-border px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Transport Buttons */}
      <div className="flex items-center gap-1.5">
        <Tooltip content="Return to Start" side="top">
          <button
            onClick={() => setCurrentTime(0)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-d2-accent text-white shadow-lg shadow-d2-accent/30'
              : 'bg-d2-surfaceElevated border border-d2-border text-white hover:bg-d2-accent hover:border-transparent'
          }`}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          )}
        </button>

        <Tooltip content="Stop" side="top">
          <button
            onClick={handleStop}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </Tooltip>

        <Tooltip content="Forward 5s" side="top">
          <button
            onClick={() =>
              setCurrentTime(Math.min(duration, currentTime + 5))
            }
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Center: Timecode & Scrubber */}
      <div className="flex-1 max-w-xl mx-6 flex items-center gap-3">
        <span className="font-mono text-xs font-semibold text-white min-w-[65px] text-right">
          {formatTime(currentTime)}
        </span>

        {/* Scrubber Bar */}
        <div className="flex-1 relative flex items-center group cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleScrub}
            className="w-full h-1.5 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent focus:outline-none"
            style={{
              background: `linear-gradient(to right, #6366f1 ${progressPercent}%, #1c222d ${progressPercent}%)`,
            }}
          />
        </div>

        <span className="font-mono text-xs text-d2-textSubtle min-w-[65px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Right: Loop & Volume */}
      <div className="flex items-center gap-3">
        <Tooltip
          content={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
          side="top"
        >
          <button
            onClick={toggleLooping}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              isLooping
                ? 'bg-d2-accent/20 text-d2-accent'
                : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
            className="text-d2-textSubtle hover:text-white transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-d2-danger" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent"
          />
        </div>
      </div>
    </div>
  )
}
