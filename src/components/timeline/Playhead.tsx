import React, { useRef } from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useTimelineStore } from '@/stores/timelineStore'
import { useAudioStore } from '@/stores/audioStore'
import { TimelineEngine } from '@/engine/timeline/TimelineEngine'

export const Playhead: React.FC = () => {
  const { currentTime, duration, setCurrentTime } = usePreviewStore()
  const { zoom } = useTimelineStore()
  const audioSeek = useAudioStore((s) => s.seek)

  const isDraggingRef = useRef(false)

  const positionX = Math.max(0, currentTime * zoom)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    isDraggingRef.current = true
    TimelineEngine.getInstance().setScrubbing(true)

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return
      // Relative to scroll container
      const container = document.getElementById('d2-timeline-scroll-container')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const scrollLeft = container.scrollLeft
      const offsetX = ev.clientX - rect.left + scrollLeft

      const newTime = Math.max(0, Math.min(duration, offsetX / zoom))
      setCurrentTime(newTime)
      audioSeek(newTime)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      TimelineEngine.getInstance().setScrubbing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-30"
      style={{ left: `${positionX}px` }}
    >
      {/* Scrubber Needle Head */}
      <div
        onMouseDown={handleMouseDown}
        className="relative -left-2.5 top-0 w-5 h-6 flex items-center justify-center pointer-events-auto cursor-ew-resize group"
      >
        <div className="w-3.5 h-3.5 bg-cyan-400 border border-white rotate-45 rounded-sm shadow-md group-hover:scale-110 group-hover:bg-cyan-300 transition-all" />
      </div>

      {/* Vertical Needle Line */}
      <div className="w-0.5 h-full bg-cyan-400 shadow-md opacity-90 -translate-x-1/2 pointer-events-none" />
    </div>
  )
}
