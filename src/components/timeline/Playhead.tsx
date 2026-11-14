import React from 'react'
import { usePreviewStore } from '@/stores/previewStore'
import { useTimelineStore } from '@/stores/timelineStore'

export const Playhead: React.FC = () => {
  const { currentTime } = usePreviewStore()
  const { zoom } = useTimelineStore()

  const positionX = currentTime * zoom

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-30"
      style={{ left: `${positionX}px` }}
    >
      {/* Scrubber Needle Head */}
      <div className="relative -left-2 top-0 w-4 h-6 flex items-center justify-center pointer-events-auto cursor-ew-resize">
        <div className="w-3.5 h-3.5 bg-cyan-400 border border-white rotate-45 rounded-sm shadow-md" />
      </div>

      {/* Vertical Needle Line */}
      <div className="w-0.5 h-full bg-cyan-400 shadow-sm opacity-90 -translate-x-1/2" />
    </div>
  )
}
