import React from 'react'
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Activity,
} from 'lucide-react'
import { useAudioStore } from '@/stores/audioStore'
import { formatTimecode } from '@/engine/audio/AudioMetadata'
import { Tooltip } from '@/components/ui/Tooltip'

export const PlaybackToolbar: React.FC = () => {
  const {
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    toggleLooping,
    setAudioMonitorOpen,
  } = useAudioStore()

  const isPlaying = status === 'playing'

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    seek(val)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const displayedVolume = isMuted ? 0 : volume
  const volumePercent = Math.round(displayedVolume * 100)

  return (
    <div data-playback-toolbar className="min-h-12 w-full bg-d2-surface border-t border-d2-border px-3 py-2 flex flex-wrap gap-y-2 items-center justify-between select-none z-10 shrink-0">
      {/* Left: Transport Buttons */}
      <div className="flex items-center gap-1.5">
        <Tooltip content="Return to Start" side="top">
          <button
            onClick={() => seek(0)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <button
          onClick={handleTogglePlay}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            isPlaying
              ? 'bg-d2-accent text-d2-canvas'
              : 'bg-d2-surfaceActive text-d2-accent hover:bg-d2-border'
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
            onClick={stop}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </Tooltip>

        <Tooltip content="Forward 5s" side="top">
          <button
            onClick={() => seek(Math.min(duration, currentTime + 5))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Center: Real Timecode & Scrubber */}
      <div className="flex-1 min-w-[160px] mx-3 flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-white min-w-[65px] text-right">
          {formatTimecode(currentTime)}
        </span>

        {/* Scrubber Bar */}
        <div className="flex-1 relative flex items-center group cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleScrub}
            aria-label="Playback position"
            className="w-full h-1 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${progressPercent}%, var(--color-border) ${progressPercent}%)`,
            }}
          />
        </div>

        <span className="font-mono text-xs text-d2-textSubtle min-w-[65px]">
          {formatTimecode(duration)}
        </span>
      </div>

      {/* Right: Audio Monitor, Loop & Volume */}
      <div className="flex shrink-0 items-center gap-2.5">
        <Tooltip content="Live FFT Frequency Monitor" side="top">
          <button
            onClick={() => setAudioMonitorOpen(true)}
            className="flex items-center gap-1 text-2xs px-2 py-1 rounded text-d2-textMuted hover:bg-d2-surfaceElevated hover:text-white transition-colors"
            aria-label="Open audio monitor"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="font-mono">FFT</span>
          </button>
        </Tooltip>

        <Tooltip
          content={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
          side="top"
        >
          <button
            onClick={toggleLooping}
            aria-label="Loop playback"
            aria-pressed={isLooping}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              isLooping
                ? 'bg-d2-surfaceActive text-d2-accent'
                : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated transition-colors"
          >
            {isMuted || volume === 0 ? (
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
            value={displayedVolume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            aria-valuetext={`${volumePercent}%`}
            title={`Volume: ${volumePercent}%`}
            className="w-20 min-w-[80px] h-1.5 shrink-0 rounded-full appearance-none cursor-pointer accent-d2-accent"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${volumePercent}%, var(--color-text-muted) ${volumePercent}%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
