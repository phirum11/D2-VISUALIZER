import React, { useRef, useEffect, useState } from 'react'
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
  Sparkles,
  Shield,
  Disc,
  Trash2,
} from 'lucide-react'
import { TimelineTrack, TimelineClip } from '@/engine/timeline/types'
import { useTimelineStore } from '@/stores/timelineStore'
import { useAudioStore } from '@/stores/audioStore'
import { WaveformGenerator } from '@/engine/audio/WaveformGenerator'

interface TrackProps {
  track: TimelineTrack
}

export const TrackHeader: React.FC<TrackProps> = ({ track }) => {
  const {
    toggleTrackVisibility,
    toggleTrackLock,
    toggleTrackMute,
    deleteTrack,
    renameTrack,
    selectedTrackId,
  } = useTimelineStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(track.name)

  const isSelected = selectedTrackId === track.id

  const getTrackIcon = () => {
    switch (track.type) {
      case 'audio-master':
        return Music
      case 'visualizer':
        return Activity
      case 'background':
        return ImageIcon
      case 'typography':
        return Type
      case 'artwork':
        return Disc
      case 'logo':
        return Shield
      case 'particles':
        return Sparkles
      case 'effects':
        return Layers
      default:
        return Layers
    }
  }

  const TrackIcon = getTrackIcon()

  const handleNameSubmit = () => {
    if (nameVal.trim()) {
      renameTrack(track.id, nameVal.trim())
    }
    setIsEditingName(false)
  }

  return (
    <div
      className={`h-11 border-b border-d2-borderSubtle px-2.5 flex items-center justify-between select-none transition-colors ${
        isSelected ? 'bg-d2-surfaceElevated border-l-2 border-l-d2-accent' : 'bg-d2-surface'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-d2-surfaceElevated text-d2-textMuted shrink-0">
          <TrackIcon className="w-3 h-3 text-d2-accent" />
        </div>

        {isEditingName ? (
          <input
            type="text"
            value={nameVal}
            autoFocus
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit()
              if (e.key === 'Escape') setIsEditingName(false)
            }}
            className="w-full bg-d2-canvas border border-d2-accent rounded px-1.5 py-0.5 text-2xs text-white focus:outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditingName(true)}
            title="Double-click to rename track"
            className={`text-2xs font-medium truncate cursor-pointer hover:underline ${
              track.visible ? 'text-white' : 'text-d2-textSubtle line-through'
            }`}
          >
            {track.name}
          </span>
        )}
      </div>

      {/* Action Toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        {track.type === 'audio-master' && (
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`p-1 rounded hover:bg-d2-surfaceElevated transition-colors ${
              track.muted ? 'text-d2-danger' : 'text-d2-textSubtle hover:text-white'
            }`}
            title={track.muted ? 'Unmute Track' : 'Mute Track'}
          >
            {track.muted ? (
              <VolumeX className="w-3 h-3 text-rose-400" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>
        )}

        <button
          onClick={() => toggleTrackVisibility(track.id)}
          className={`p-1 rounded hover:bg-d2-surfaceElevated transition-colors ${
            track.visible ? 'text-d2-textSubtle hover:text-white' : 'text-amber-500'
          }`}
          title={track.visible ? 'Hide Track' : 'Show Track'}
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
          title={track.locked ? 'Unlock Track' : 'Lock Track'}
        >
          {track.locked ? (
            <Lock className="w-3 h-3 text-amber-400" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => deleteTrack(track.id)}
          className="p-1 rounded text-d2-textSubtle hover:text-rose-400 hover:bg-d2-surfaceElevated transition-colors"
          title="Delete Track"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export const TrackLane: React.FC<TrackProps> = ({ track }) => {
  const {
    zoom,
    selectedClipId,
    selectClip,
    moveClip,
    trimClipLeft,
    trimClipRight,
    splitClipAtTime,
    activeTool,
  } = useTimelineStore()

  const waveform = useAudioStore((s) => s.waveform)
  const currentTime = useAudioStore((s) => s.currentTime)

  // Drag interaction state
  const dragRef = useRef<{
    clipId: string
    type: 'move' | 'trim-left' | 'trim-right'
    startX: number
    origStartTime: number
    origDuration: number
  } | null>(null)

  const handleMouseDown = (
    e: React.MouseEvent,
    clip: TimelineClip,
    action: 'move' | 'trim-left' | 'trim-right'
  ) => {
    if (track.locked) return
    e.stopPropagation()

    // If blade tool active, split clip at click position
    if (activeTool === 'blade') {
      const container = document.getElementById('d2-timeline-scroll-container')
      if (container) {
        const rect = container.getBoundingClientRect()
        const clickX = e.clientX - rect.left + container.scrollLeft
        const clickTime = clickX / zoom
        splitClipAtTime(clip.id, clickTime)
      }
      return
    }

    selectClip(clip.id)

    dragRef.current = {
      clipId: clip.id,
      type: action,
      startX: e.clientX,
      origStartTime: clip.startTime,
      origDuration: clip.duration,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const deltaPx = ev.clientX - dragRef.current.startX
      const deltaSec = deltaPx / zoom

      if (dragRef.current.type === 'move') {
        const targetStart = Math.max(0, dragRef.current.origStartTime + deltaSec)
        moveClip(dragRef.current.clipId, targetStart)
      } else if (dragRef.current.type === 'trim-left') {
        const targetStart = Math.max(0, dragRef.current.origStartTime + deltaSec)
        trimClipLeft(dragRef.current.clipId, targetStart)
      } else if (dragRef.current.type === 'trim-right') {
        const targetDuration = Math.max(0.2, dragRef.current.origDuration + deltaSec)
        trimClipRight(dragRef.current.clipId, targetDuration)
      }
    }

    const handleMouseUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="h-11 relative overflow-visible flex items-center bg-d2-canvas/30 hover:bg-d2-surfaceElevated/15 transition-colors">
      {track.clips.map((clip) => {
        const isSelected = selectedClipId === clip.id
        const clipLeft = clip.startTime * zoom
        const clipWidth = Math.max(20, clip.duration * zoom)

        return (
          <div
            key={clip.id}
            onMouseDown={(e) => handleMouseDown(e, clip, 'move')}
            style={{
              left: `${clipLeft}px`,
              width: `${clipWidth}px`,
              backgroundColor: clip.color + '26',
              borderColor: clip.color,
            }}
            className={`absolute top-1 bottom-1 rounded border px-2 flex items-center justify-between cursor-pointer select-none transition-all group ${
              isSelected ? 'ring-2 ring-white shadow-lg z-20' : 'hover:brightness-110 z-10'
            } ${!track.visible ? 'opacity-30' : ''} ${track.locked ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {/* Left Trim Handle */}
            {!track.locked && (
              <div
                onMouseDown={(e) => handleMouseDown(e, clip, 'trim-left')}
                className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-white/40 rounded-l flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
              >
                <div className="w-0.5 h-3 bg-white/70 rounded-full" />
              </div>
            )}

            {/* Clip Label */}
            <div className="flex items-center gap-1.5 overflow-hidden z-10 pointer-events-none">
              <span className="text-3xs font-semibold text-white truncate drop-shadow-sm">
                {clip.name}
              </span>
            </div>

            {/* Waveform Visualization for Audio Master Track */}
            {track.type === 'audio-master' && (
              <div className="absolute inset-0 flex items-center px-1 overflow-hidden pointer-events-none opacity-65">
                {waveform ? (
                  <WaveformCanvas
                    waveform={waveform}
                    width={clipWidth}
                    progress={clip.duration > 0 ? (currentTime - clip.startTime) / clip.duration : 0}
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

            {/* Keyframe Indicators (Diamonds) */}
            {clip.keyframes &&
              clip.keyframes.map((kt) =>
                kt.keyframes.map((kf) => (
                  <div
                    key={kf.id}
                    title={`${kt.property}: ${kf.value} @ ${kf.time.toFixed(2)}s`}
                    style={{ left: `${(kf.time / clip.duration) * 100}%` }}
                    className="absolute top-1 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45 border border-black/80 z-25 shadow-sm"
                  />
                ))
              )}

            {/* Duration Badge */}
            <span className="text-3xs font-mono text-white/70 shrink-0 ml-1 z-10 pointer-events-none">
              {clip.duration.toFixed(1)}s
            </span>

            {/* Right Trim Handle */}
            {!track.locked && (
              <div
                onMouseDown={(e) => handleMouseDown(e, clip, 'trim-right')}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-white/40 rounded-r flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
              >
                <div className="w-0.5 h-3 bg-white/70 rounded-full" />
              </div>
            )}
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
      Math.max(0, Math.min(1, progress))
    )
  }, [waveform, width, progress])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
