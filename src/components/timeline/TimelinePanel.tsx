import React, { useRef } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Magnet,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTimelineStore } from '@/stores/timelineStore'
import { useUIStore } from '@/stores/uiStore'
import { usePreviewStore } from '@/stores/previewStore'
import { TimeRuler } from './TimeRuler'
import { Playhead } from './Playhead'
import { TrackHeader, TrackLane } from './TrackRow'
import { Tooltip } from '@/components/ui/Tooltip'

export const TimelinePanel: React.FC = () => {
  const { zoom, setZoom, tracks } = useTimelineStore()
  const { isTimelineCollapsed, toggleTimeline, timelineHeight } = useUIStore()
  const { duration } = usePreviewStore()

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const totalWidth = Math.max(1200, duration * zoom + 200)

  if (isTimelineCollapsed) {
    return (
      <div className="h-7 w-full bg-d2-surface border-t border-d2-border px-3 flex items-center justify-between select-none z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-d2-accent" />
          <span className="text-2xs font-semibold uppercase tracking-wider text-d2-textSubtle">
            Sequence Timeline ({tracks.length} Tracks)
          </span>
        </div>
        <button
          onClick={toggleTimeline}
          className="flex items-center gap-1 text-2xs text-d2-textSubtle hover:text-white"
        >
          <span>Expand Timeline</span>
          <ChevronUp className="w-3.5 h-3.5 text-d2-accent" />
        </button>
      </div>
    )
  }

  return (
    <div
      style={{ height: `${timelineHeight}px` }}
      className="w-full bg-d2-surface border-t border-d2-border flex flex-col select-none z-20 shrink-0 overflow-hidden"
    >
      {/* Timeline Toolbar Header */}
      <div className="h-8 w-full bg-d2-surfaceElevated/50 border-b border-d2-border px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-d2-accent" />
            <span className="text-2xs font-bold uppercase tracking-wider text-white">
              Sequence Timeline
            </span>
            <span className="text-3xs px-1.5 py-0.2 rounded bg-d2-surface border border-d2-border text-d2-textSubtle font-mono">
              {tracks.length} Tracks
            </span>
          </div>

          <Tooltip content="Snap to Clips & Playhead" side="top">
            <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-d2-surface border border-d2-border text-3xs text-cyan-400 font-medium">
              <Magnet className="w-2.5 h-2.5" />
              <span>Snap: ON</span>
            </button>
          </Tooltip>
        </div>

        {/* Center / Right: Zoom & Collapse controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-d2-surface border border-d2-border rounded px-2 py-0.5">
            <Tooltip content="Zoom Out" side="top">
              <button
                onClick={() => setZoom(zoom - 2)}
                className="text-d2-textSubtle hover:text-white"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
            </Tooltip>

            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-16 h-1 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent"
            />

            <Tooltip content="Zoom In" side="top">
              <button
                onClick={() => setZoom(zoom + 2)}
                className="text-d2-textSubtle hover:text-white"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </Tooltip>
          </div>

          <Tooltip content="Collapse Timeline" side="top">
            <button
              onClick={toggleTimeline}
              className="p-1 rounded text-d2-textSubtle hover:text-white hover:bg-d2-surface transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Track Grid & Ruler */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Fixed Column: Channels / Headers */}
        <div className="w-56 h-full bg-d2-surface border-r border-d2-border flex flex-col shrink-0 z-10 shadow-md">
          <div className="h-6 bg-d2-surfaceElevated/70 border-b border-d2-border px-3 flex items-center text-3xs font-semibold uppercase tracking-wider text-d2-textSubtle shrink-0">
            Channels
          </div>
          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Right Scrollable Column: Ruler & Clip Lanes */}
        <div
          ref={scrollContainerRef}
          className="flex-1 h-full overflow-x-auto overflow-y-hidden relative bg-d2-canvas/60"
        >
          <div style={{ width: `${totalWidth}px` }} className="relative h-full">
            {/* Top Seconds Time Ruler */}
            <TimeRuler />

            {/* Playhead Vertical Guide Needle */}
            <Playhead />

            {/* Track Clip Lanes */}
            <div className="divide-y divide-d2-borderSubtle">
              {tracks.map((track) => (
                <TrackLane key={track.id} track={track} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
