import React, { useState } from 'react'
import {
  MousePointer,
  Scissors,
  Magnet,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Bookmark,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Split,
  ChevronDown,
} from 'lucide-react'
import { useTimelineStore } from '@/stores/timelineStore'
import { usePreviewStore } from '@/stores/previewStore'
import { useAudioStore } from '@/stores/audioStore'
import { TimelineEngine } from '@/engine/timeline/TimelineEngine'
import { TimecodeUtils } from '@/engine/timeline/TimecodeUtils'
import { TrackType } from '@/engine/timeline/types'
import { Tooltip } from '@/components/ui/Tooltip'

export const TimelineToolbar: React.FC = () => {
  const {
    zoom,
    setZoom,
    activeTool,
    setActiveTool,
    snapEnabled,
    toggleSnap,
    selectedClipId,
    splitAtPlayhead,
    duplicateClip,
    deleteClip,
    addMarker,
    markers,
    addTrack,
    fitToProject,
    canUndo,
    canRedo,
    undo,
    redo,
    fps,
  } = useTimelineStore()

  const { currentTime, duration, setCurrentTime } = usePreviewStore()
  const audioSeek = useAudioStore((s) => s.seek)

  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false)

  const handleStepFrame = (dir: 1 | -1) => {
    const nextTime = TimelineEngine.getInstance().stepFrame(
      currentTime,
      dir,
      duration,
      fps
    )
    setCurrentTime(nextTime)
    audioSeek(nextTime)
  }

  const handleJumpStart = () => {
    setCurrentTime(0)
    audioSeek(0)
  }

  const handleJumpEnd = () => {
    setCurrentTime(duration)
    audioSeek(duration)
  }

  const handleNextMarker = () => {
    const nextTime = TimelineEngine.getInstance().getNextMarkerTime(currentTime, markers)
    if (nextTime !== null) {
      setCurrentTime(nextTime)
      audioSeek(nextTime)
    }
  }

  const handlePrevMarker = () => {
    const prevTime = TimelineEngine.getInstance().getPrevMarkerTime(currentTime, markers)
    if (prevTime !== null) {
      setCurrentTime(prevTime)
      audioSeek(prevTime)
    }
  }

  const handleFit = () => {
    const container = document.getElementById('d2-timeline-scroll-container')
    if (container) {
      fitToProject(duration, container.clientWidth)
    }
  }

  const trackOptions: { type: TrackType; label: string }[] = [
    { type: 'audio-master', label: 'Audio Track' },
    { type: 'visualizer', label: 'Visualizer Track' },
    { type: 'background', label: 'Background Layer' },
    { type: 'typography', label: 'Typography Track' },
    { type: 'artwork', label: 'Album Artwork Track' },
    { type: 'logo', label: 'Logo / Watermark Track' },
    { type: 'particles', label: 'Particles Track' },
    { type: 'effects', label: 'Effects Track' },
  ]

  return (
    <div className="h-9 w-full bg-d2-surfaceElevated/60 border-b border-d2-border px-3 flex items-center justify-between shrink-0 select-none text-xs">
      {/* Left Group: Tools & Editing Operations */}
      <div className="flex items-center gap-1.5">
        {/* Tool Mode Selector */}
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-d2-surface border border-d2-border">
          <Tooltip content="Selection Tool (V)" side="top">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-1 rounded transition-colors ${
                activeTool === 'select'
                  ? 'bg-d2-accent text-white'
                  : 'text-d2-textSubtle hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Razor / Blade Tool (C) — Click clip to cut" side="top">
            <button
              onClick={() => setActiveTool('blade')}
              className={`p-1 rounded transition-colors ${
                activeTool === 'blade'
                  ? 'bg-d2-accent text-white'
                  : 'text-d2-textSubtle hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        <div className="h-4 w-px bg-d2-borderSubtle mx-0.5" />

        {/* Clip Operation Buttons */}
        <Tooltip content="Split Clip at Playhead" side="top">
          <button
            onClick={() => splitAtPlayhead(currentTime)}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-3xs font-medium transition-colors ${
              selectedClipId
                ? 'bg-d2-surface border-d2-border text-white hover:border-d2-accent'
                : 'bg-d2-surface/40 border-d2-borderSubtle text-d2-textMuted cursor-not-allowed'
            }`}
          >
            <Split className="w-3 h-3 text-cyan-400" />
            <span>Split</span>
          </button>
        </Tooltip>

        <Tooltip content="Duplicate Clip" side="top">
          <button
            onClick={() => selectedClipId && duplicateClip(selectedClipId)}
            disabled={!selectedClipId}
            className={`p-1 rounded border transition-colors ${
              selectedClipId
                ? 'bg-d2-surface border-d2-border text-white hover:border-d2-accent'
                : 'bg-d2-surface/40 border-d2-borderSubtle text-d2-textMuted cursor-not-allowed'
            }`}
          >
            <Copy className="w-3 h-3" />
          </button>
        </Tooltip>

        <Tooltip content="Delete Clip" side="top">
          <button
            onClick={() => selectedClipId && deleteClip(selectedClipId)}
            disabled={!selectedClipId}
            className={`p-1 rounded border transition-colors ${
              selectedClipId
                ? 'bg-d2-surface border-d2-border text-white hover:text-rose-400 hover:border-rose-400'
                : 'bg-d2-surface/40 border-d2-borderSubtle text-d2-textMuted cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-d2-borderSubtle mx-0.5" />

        {/* Snapping Toggle */}
        <Tooltip content="Toggle Magnetic Snapping" side="top">
          <button
            onClick={toggleSnap}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-3xs font-medium transition-colors ${
              snapEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-d2-surface border-d2-border text-d2-textSubtle'
            }`}
          >
            <Magnet className="w-3 h-3" />
            <span>Snap: {snapEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </Tooltip>

        {/* Marker Button */}
        <Tooltip content="Add Project Marker at Playhead (M)" side="top">
          <button
            onClick={() => addMarker(currentTime, `Marker ${markers.length + 1}`)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-d2-surface border border-d2-border text-3xs text-amber-300 hover:border-amber-400 transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            <span>+ Marker</span>
          </button>
        </Tooltip>

        {/* Add Track Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAddTrackOpen(!isAddTrackOpen)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-d2-surface border border-d2-border text-3xs text-white hover:border-d2-accent transition-colors"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>Track</span>
            <ChevronDown className="w-2.5 h-2.5 text-d2-textSubtle" />
          </button>

          {isAddTrackOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded bg-d2-surface border border-d2-border shadow-xl z-50 py-1 divide-y divide-d2-borderSubtle">
              {trackOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    addTrack(opt.type, opt.label)
                    setIsAddTrackOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1 text-2xs text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated transition-colors"
                >
                  + {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Group: Frame-Accurate Scrubbing & SMPTE Timecode */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-d2-surface border border-d2-border rounded px-1 py-0.5">
          <Tooltip content="Jump to Start (Home)" side="top">
            <button
              onClick={handleJumpStart}
              className="p-1 rounded text-d2-textSubtle hover:text-white"
            >
              <SkipBack className="w-3 h-3" />
            </button>
          </Tooltip>

          <Tooltip content="Previous Marker" side="top">
            <button
              onClick={handlePrevMarker}
              className="p-0.5 rounded text-d2-textSubtle hover:text-white"
            >
              <Bookmark className="w-2.5 h-2.5 text-amber-400/80" />
            </button>
          </Tooltip>

          <Tooltip content="Previous Frame (1/30s)" side="top">
            <button
              onClick={() => handleStepFrame(-1)}
              className="p-1 rounded text-d2-textSubtle hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Timecode display */}
          <div className="px-2 py-0.5 bg-d2-canvas rounded border border-d2-borderSubtle text-2xs font-mono font-bold text-cyan-400 tracking-wider">
            {TimecodeUtils.secondsToTimecode(currentTime, fps)}
          </div>

          <Tooltip content="Next Frame (1/30s)" side="top">
            <button
              onClick={() => handleStepFrame(1)}
              className="p-1 rounded text-d2-textSubtle hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Next Marker" side="top">
            <button
              onClick={handleNextMarker}
              className="p-0.5 rounded text-d2-textSubtle hover:text-white"
            >
              <Bookmark className="w-2.5 h-2.5 text-amber-400/80" />
            </button>
          </Tooltip>

          <Tooltip content="Jump to End (End)" side="top">
            <button
              onClick={handleJumpEnd}
              className="p-1 rounded text-d2-textSubtle hover:text-white"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right Group: Undo/Redo & Zoom Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <Tooltip content="Undo Timeline Action (Ctrl+Z)" side="top">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1 rounded border transition-colors ${
                canUndo
                  ? 'bg-d2-surface border-d2-border text-white hover:border-d2-accent'
                  : 'bg-d2-surface/40 border-d2-borderSubtle text-d2-textMuted cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3 h-3" />
            </button>
          </Tooltip>

          <Tooltip content="Redo Timeline Action (Ctrl+Y)" side="top">
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1 rounded border transition-colors ${
                canRedo
                  ? 'bg-d2-surface border-d2-border text-white hover:border-d2-accent'
                  : 'bg-d2-surface/40 border-d2-borderSubtle text-d2-textMuted cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>

        <div className="h-4 w-px bg-d2-borderSubtle mx-0.5" />

        {/* Zoom Slider & Fit */}
        <div className="flex items-center gap-1.5 bg-d2-surface border border-d2-border rounded px-2 py-0.5">
          <Tooltip content="Fit Entire Project to Window" side="top">
            <button
              onClick={handleFit}
              className="p-0.5 rounded text-d2-textSubtle hover:text-cyan-400"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </Tooltip>

          <Tooltip content="Zoom Out" side="top">
            <button
              onClick={() => setZoom(zoom - 3)}
              className="text-d2-textSubtle hover:text-white"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
          </Tooltip>

          <input
            type="range"
            min={4}
            max={80}
            step={2}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-16 h-1 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent"
          />

          <Tooltip content="Zoom In" side="top">
            <button
              onClick={() => setZoom(zoom + 3)}
              className="text-d2-textSubtle hover:text-white"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
