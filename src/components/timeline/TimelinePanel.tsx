import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
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
import { TimelineToolbar } from './TimelineToolbar'
import { TimelineRenderer } from '@/engine/timeline/TimelineRenderer'
import { Tooltip } from '@/components/ui/Tooltip'

export const TimelinePanel: React.FC = () => {
  const { zoom, tracks, setScrollLeft } = useTimelineStore()
  const { isTimelineCollapsed, toggleTimeline, timelineHeight, setTimelineHeight } = useUIStore()
  const { duration } = usePreviewStore()
  const [filterActiveOnly, setFilterActiveOnly] = useState(false)

  const displayedTracks = useMemo(() => {
    if (!filterActiveOnly) return tracks
    return tracks.filter(
      (t) => t.clips.length > 0 || t.type === 'audio-master' || t.type === 'visualizer'
    )
  }, [tracks, filterActiveOnly])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const headerContainerRef = useRef<HTMLDivElement>(null)
  const isResizingHeightRef = useRef(false)

  const totalWidth = TimelineRenderer.calculateTotalWidth(duration, zoom)

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === 'v' || e.key === 'V') {
        useTimelineStore.getState().setActiveTool('select')
      } else if (e.key === 'c' || e.key === 'C') {
        useTimelineStore.getState().setActiveTool('blade')
      } else if (e.key === 'n' || e.key === 'N') {
        useTimelineStore.getState().toggleSnap()
      } else if (e.key === 'm' || e.key === 'M') {
        const cur = usePreviewStore.getState().currentTime
        useTimelineStore.getState().addMarker(cur)
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = useTimelineStore.getState().selectedClipId
        if (sel) useTimelineStore.getState().deleteClip(sel)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        const sel = useTimelineStore.getState().selectedClipId
        if (sel) useTimelineStore.getState().duplicateClip(sel)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        const cur = usePreviewStore.getState().currentTime
        useTimelineStore.getState().splitAtPlayhead(cur)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) {
          useTimelineStore.getState().redo()
        } else {
          useTimelineStore.getState().undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault()
        useTimelineStore.getState().redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync horizontal scroll state with store
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft)
      // Sync vertical scroll with track headers
      if (headerContainerRef.current) {
        headerContainerRef.current.scrollTop = scrollContainerRef.current.scrollTop
      }
    }
  }

  // Handle timeline panel vertical resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingHeightRef.current = true
    const startY = e.clientY
    const startHeight = timelineHeight

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingHeightRef.current) return
      const deltaY = startY - ev.clientY
      const newH = Math.max(160, Math.min(500, startHeight + deltaY))
      setTimelineHeight(newH)
    }

    const handleMouseUp = () => {
      isResizingHeightRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  if (isTimelineCollapsed) {
    return (
      <div className="h-7 w-full bg-d2-surface border-t border-d2-border px-3 flex items-center justify-between select-none z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-d2-accent" />
          <span className="text-2xs font-semibold uppercase tracking-wider text-d2-textSubtle">
            Sequence Timeline ({tracks.length} Multi-Tracks)
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
      className="w-full bg-d2-surface border-t border-d2-border flex flex-col select-none z-20 shrink-0 overflow-hidden relative"
    >
      {/* Top Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-d2-accent/60 z-40 transition-colors"
      />

      {/* Timeline Professional Toolbar */}
      <div className="flex items-center justify-between border-b border-d2-border bg-d2-surfaceElevated/40">
        <div className="flex-1">
          <TimelineToolbar />
        </div>
        <div className="px-2">
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
        <div className="w-64 h-full bg-d2-surface border-r border-d2-border flex flex-col shrink-0 z-20 shadow-md">
          <div className="h-8 bg-d2-surfaceElevated/70 border-b border-d2-border px-3 flex items-center justify-between text-3xs font-semibold uppercase tracking-wider text-d2-textSubtle shrink-0 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-bold">Tracks ({displayedTracks.length})</span>
              <button
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                className={`px-1.5 py-0.2 rounded text-4xs font-mono font-semibold transition-colors ${
                  filterActiveOnly
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'bg-d2-canvas text-d2-textSubtle hover:text-white border border-d2-borderSubtle'
                }`}
                title="Toggle showing only tracks with active clips"
              >
                {filterActiveOnly ? 'ACTIVE' : 'ALL'}
              </button>
            </div>
            <span className="text-4xs font-mono text-d2-textSubtle uppercase tracking-wider">Mute / Lock</span>
          </div>

          <div
            ref={headerContainerRef}
            className="flex-1 overflow-hidden"
          >
            {displayedTracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Right Scrollable Column: Ruler & Clip Lanes */}
        <div
          id="d2-timeline-scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 h-full overflow-x-auto overflow-y-auto relative bg-d2-canvas/60"
        >
          <div style={{ width: `${totalWidth}px` }} className="relative min-h-full">
            {/* Top Seconds & Frame Time Ruler */}
            <TimeRuler />

            {/* Playhead Vertical Guide Needle */}
            <Playhead />

            {/* Track Clip Lanes */}
            <div className="divide-y divide-d2-borderSubtle">
              {displayedTracks.map((track) => (
                <TrackLane key={track.id} track={track} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
