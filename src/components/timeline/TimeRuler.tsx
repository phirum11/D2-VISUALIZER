import React, { useRef } from 'react'
import { useTimelineStore } from '@/stores/timelineStore'
import { usePreviewStore } from '@/stores/previewStore'

export const TimeRuler: React.FC = () => {
  const rulerRef = useRef<HTMLDivElement>(null)
  const { zoom } = useTimelineStore()
  const { duration, setCurrentTime } = usePreviewStore()

  // Generate tick markers every 5 seconds, major ticks every 15 seconds
  const totalSeconds = Math.ceil(duration)
  const totalWidth = totalSeconds * zoom

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return
    const rect = rulerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(0, Math.min(duration, clickX / zoom))
    setCurrentTime(newTime)
  }

  const renderTicks = () => {
    const ticks = []
    const step = zoom < 5 ? 15 : zoom < 15 ? 5 : 1

    for (let s = 0; s <= totalSeconds; s += step) {
      const isMajor = s % (step * 3) === 0
      const x = s * zoom
      const min = Math.floor(s / 60)
      const sec = s % 60

      ticks.push(
        <div
          key={s}
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${x}px` }}
        >
          <div
            className={`w-px bg-d2-border ${
              isMajor ? 'h-3 bg-d2-textSubtle' : 'h-1.5'
            }`}
          />
          {isMajor && (
            <span className="text-3xs font-mono text-d2-textSubtle mt-0.5 select-none -translate-x-1/2">
              {min}:{sec.toString().padStart(2, '0')}
            </span>
          )}
        </div>
      )
    }
    return ticks
  }

  return (
    <div
      ref={rulerRef}
      onClick={handleRulerClick}
      style={{ width: `${Math.max(800, totalWidth)}px` }}
      className="h-6 bg-d2-surface border-b border-d2-border relative cursor-pointer select-none"
    >
      {renderTicks()}
    </div>
  )
}
