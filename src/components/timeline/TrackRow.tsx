import React, { useRef, useEffect } from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Music,
  Activity,
  Type,
  Layers,
  Image as ImageIcon,
} from 'lucide-react'
import { TimelineTrack, useTimelineStore } from '@/stores/timelineStore'
import { useAudioStore } from '@/stores/audioStore'
import { WaveformGenerator } from '@/engine/audio/WaveformGenerator'

interface TrackProps {
  track: TimelineTrack
}

export const TrackHeader: React.FC<TrackProps> = ({ track }) => {
  const { toggleTrackVisibility, toggleTrackLock, toggleTrackMute } =
    useTimelineStore()

  const getTrackIcon = () => {
    switch (track.type) {
      case 'audio':
        return Music
      case 'visualizer':
        return Activity
      case 'text':
        return Type
      case 'overlay':
        return Layers
      case 'background':
        return ImageIcon
      default:
        return Layers
    }
  }

  const TrackIcon = getTrackIcon()

  return (
    <div className="h-11 border-b border-d2-borderSubtle px-2.5 flex items-center justify-between select-none bg-d2-surface">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-d2-surfaceElevated text-d2-textMuted shrink-0">
          <TrackIcon className="w-3 h-3 text-d2-accent" />
        </div>
        <span
          className={`text-2xs font-medium truncate ${
            track.visible ? 'text-white' : 'text-d2-textSubtle line-through'
          }`}
        >
          {track.name}
        </span>
      </div>

      {/* Action Toggles */}
      <div className="flex items-center gap-1 shrink-0">
        {track.type === 'audio' && (
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`p-1 rounded hover:bg-d2-surfaceElevated transition-colors ${
              track.muted ? 'text-d2-danger' : 'text-d2-textSubtle hover:text-white'
            }`}
            title={track.muted ? 'Unmute' : 'Mute'}
          >
            {track.muted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>
        )}

        <button
          onClick={() => toggleTrackVisibility(track.id)}
          className={`p-1 rounded hover:bg-d2-surfaceElevated transition-colors ${
            track.visible
              ? 'text-d2-textSubtle hover:text-white'
              : 'text-amber-500'
          }`}
          title={track.visible ? 'Hide track' : 'Show track'}
        >
          {track.visible ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => toggleTrackLock(track.id)}
          className={`p-1 rounded hover:bg-d2-surfaceElevated transition-colors ${
            track.locked ? 'text-amber-400' : 'text-d2-textSubtle hover:text-white'
          }`}
          title={track.locked ? 'Unlock track' : 'Lock track'}
        >
          {track.locked ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  )
}

export const TrackLane: React.FC<TrackProps> = ({ track }) => {
  const { zoom, selectedClipId, setSelectedClipId } = useTimelineStore()
  const waveform = useAudioStore((s) => s.waveform)
  const currentTime = useAudioStore((s) => s.currentTime)

  return (
    <div className="h-11 relative overflow-visible flex items-center bg-d2-canvas/30 hover:bg-d2-surfaceElevated/15 transition-colors">
      {track.clips.map((clip) => {
        const isSelected = selectedClipId === clip.id
        const clipLeft = clip.startTime * zoom
        const clipWidth = Math.max(20, clip.duration * zoom)

        return (
          <div
            key={clip.id}
            onClick={() => setSelectedClipId(clip.id)}
            style={{
              left: `${clipLeft}px`,
              width: `${clipWidth}px`,
              backgroundColor: clip.color + '26',
              borderColor: clip.color,
            }}
            className={`absolute top-1 bottom-1 rounded border px-2.5 flex items-center justify-between cursor-pointer select-none transition-all ${
              isSelected
                ? 'ring-1 ring-white shadow-md'
                : 'hover:brightness-110'
            } ${!track.visible ? 'opacity-30' : ''}`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden z-10">
              <span className="text-3xs font-semibold text-white truncate drop-shadow-sm">
                {clip.name}
              </span>
            </div>

            {/* Real Decoded Waveform Canvas for Audio Track */}
            {track.type === 'audio' && (
              <div className="absolute inset-0 flex items-center px-1 overflow-hidden pointer-events-none opacity-60">
                {waveform ? (
                  <WaveformCanvas
                    waveform={waveform}
                    width={clipWidth}
                    progress={clip.duration > 0 ? currentTime / clip.duration : 0}
                  />
                ) : (
                  <div className="w-full flex items-center justify-around opacity-40">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-indigo-300 rounded-full"
                        style={{
                          height: `${Math.abs(Math.sin(i * 0.45)) * 75 + 15}%`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <span className="text-3xs font-mono text-white/70 shrink-0 ml-1 z-10">
              {clip.duration.toFixed(1)}s
            </span>
          </div>
        )
      })}
    </div>
  )
}

const WaveformCanvas: React.FC<{
  waveform: any
  width: number
  progress: number
}> = ({ waveform, width, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = Math.max(10, Math.floor(width))
    canvas.height = 34

    WaveformGenerator.drawWaveform(
      ctx,
      waveform,
      canvas.width,
      canvas.height,
      '#818cf8',
      progress
    )
  }, [waveform, width, progress])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
