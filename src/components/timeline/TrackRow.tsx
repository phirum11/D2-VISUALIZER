import React, { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
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
import { TimelineWaveform } from './TimelineWaveform'

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
  } = useTimelineStore(useShallow((s) => ({
    toggleTrackVisibility: s.toggleTrackVisibility, toggleTrackLock: s.toggleTrackLock,
    toggleTrackMute: s.toggleTrackMute, deleteTrack: s.deleteTrack, renameTrack: s.renameTrack,
    selectedTrackId: s.selectedTrackId,
  })))

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
      onClick={() => useTimelineStore.setState({ selectedTrackId: track.id })}
      className={`h-9 border-b border-d2-borderSubtle px-3 flex items-center justify-between select-none transition-colors cursor-pointer ${
        isSelected ? 'bg-d2-surfaceActive' : 'bg-d2-surface hover:bg-d2-surfaceElevated/60'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0 text-d2-textMuted"
        >
          <TrackIcon className="w-3 h-3" />
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
      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
  } = useTimelineStore(useShallow((s) => ({
    zoom: s.zoom, selectedClipId: s.selectedClipId, selectClip: s.selectClip,
    moveClip: s.moveClip, trimClipLeft: s.trimClipLeft, trimClipRight: s.trimClipRight,
    splitClipAtTime: s.splitClipAtTime, activeTool: s.activeTool,
  })))

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
    <div className="h-9 relative overflow-visible flex items-center bg-d2-canvas hover:bg-d2-surfaceElevated/15 transition-colors">
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
              backgroundColor: isSelected ? 'var(--color-surface-active)' : 'var(--color-surface-elevated)',
              borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
            }}
            className={`absolute top-1 bottom-1 rounded border px-3 flex items-center justify-between cursor-pointer select-none transition-colors group overflow-hidden ${
              isSelected ? 'z-20' : 'hover:border-white/40 z-10'
            } ${!track.visible ? 'opacity-30' : ''} ${track.locked ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {/* Top Accent Strip */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-0.5 ${isSelected ? 'bg-d2-accent' : 'bg-d2-border'}`}
            />
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
              <span className="text-2xs font-medium text-d2-text truncate">
                {clip.name}
              </span>
            </div>

            {/* Waveform Visualization for Audio Master Track */}
            {track.type === 'audio-master' && (
              <div className="absolute inset-0 flex items-center px-1 overflow-hidden pointer-events-none opacity-65">
                <TimelineWaveform width={clipWidth} startTime={clip.startTime} duration={clip.duration} />
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
