import React, { useRef } from 'react'
import { useTimelineStore } from '@/stores/timelineStore'
import { usePreviewStore } from '@/stores/previewStore'
import { useAudioStore } from '@/stores/audioStore'
import { TimelineRenderer } from '@/engine/timeline/TimelineRenderer'
import { TimecodeUtils } from '@/engine/timeline/TimecodeUtils'

export const TimeRuler: React.FC = () => {
  const rulerRef = useRef<HTMLDivElement>(null)
  const { zoom, markers, fps, deleteMarker } = useTimelineStore()
  const { duration, setCurrentTime } = usePreviewStore()
  const audioSeek = useAudioStore((s) => s.seek)

  const isScrubbingRef = useRef(false)

  const totalWidth = TimelineRenderer.calculateTotalWidth(duration, zoom)
  const totalSeconds = Math.ceil(Math.max(10, duration))
  const interval = TimelineRenderer.getRulerInterval(zoom)

  const handleSeek = (clientX: number) => {
    if (!rulerRef.current) return
    const rect = rulerRef.current.getBoundingClientRect()
    const clickX = clientX - rect.left
    const newTime = Math.max(0, Math.min(duration, clickX / zoom))
    setCurrentTime(newTime)
    audioSeek(newTime)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isScrubbingRef.current = true
    handleSeek(e.clientX)

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isScrubbingRef.current) return
      handleSeek(ev.clientX)
    }

    const handleMouseUp = () => {
      isScrubbingRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const renderTicks = () => {
    const ticks: React.ReactNode[] = []
    const step = interval.minor
    const majorStep = interval.major

    for (let s = 0; s <= totalSeconds; s += step) {
      const isMajor = Math.abs(s % majorStep) < 0.001 || Math.abs((s % majorStep) - majorStep) < 0.001
      const x = s * zoom

      ticks.push(
        <div
          key={s}
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${x}px` }}
        >
          <div
            className={`w-px ${
              isMajor ? 'h-4 bg-d2-textSubtle' : 'h-2 bg-d2-borderSubtle'
            }`}
          />
          {isMajor && (
            <span className="text-3xs font-mono text-d2-textSubtle mt-1 select-none -translate-x-1/2">
              {TimecodeUtils.secondsToCompactTimecode(s, fps)}
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
      onMouseDown={handleMouseDown}
      style={{ width: `${totalWidth}px` }}
      className="h-8 bg-d2-surface border-b border-d2-border relative cursor-pointer select-none"
    >
      {/* Ticks and Timecode Labels */}
      {renderTicks()}

      {/* Timeline Markers */}
      {markers.map((m) => {
        const x = m.time * zoom
        return (
          <div
            key={m.id}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentTime(m.time)
              audioSeek(m.time)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              deleteMarker(m.id)
            }}
            style={{ left: `${x}px` }}
            title={`${m.name} (${TimecodeUtils.secondsToTimecode(m.time, fps)})\nRight-click to delete`}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
          >
            <div
              style={{ backgroundColor: m.color }}
              className="px-1.5 py-0.2 rounded-sm text-3xs font-semibold text-white shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform"
            >
              <span>{m.name}</span>
            </div>
            <div
              style={{ borderLeftColor: m.color }}
              className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current"
            />
          </div>
        )
      })}
    </div>
  )
}
