import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { canScrollHorizontally, horizontalWheelDelta } from './horizontalWheel'

interface ScrollableCategoryStripProps { label: string; children: React.ReactNode }

export const ScrollableCategoryStrip: React.FC<ScrollableCategoryStripProps> = ({ label, children }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false })
  const measure = useCallback(() => {
    const root = rootRef.current, viewport = viewportRef.current, content = contentRef.current
    if (!root || !viewport || !content) return
    const overflow = content.scrollWidth > root.clientWidth + 1
    const left = overflow && viewport.scrollLeft > 1
    const right = overflow && viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 1
    setEdges(previous => previous.overflow === overflow && previous.left === left && previous.right === right
      ? previous : { overflow, left, right })
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current, root = rootRef.current, content = contentRef.current
    if (!viewport || !root || !content) return
    const observer = new ResizeObserver(measure)
    observer.observe(root); observer.observe(viewport); observer.observe(content)
    const wheel = (event: WheelEvent) => {
      const delta = horizontalWheelDelta(event, viewport.clientWidth)
      if (!canScrollHorizontally(viewport.scrollLeft, viewport.scrollWidth - viewport.clientWidth, delta)) return
      event.preventDefault()
      viewport.scrollLeft += delta
      measure()
    }
    // A non-passive native listener is required to consume vertical wheel input.
    viewport.addEventListener('wheel', wheel, { passive: false })
    measure()
    return () => { observer.disconnect(); viewport.removeEventListener('wheel', wheel) }
  }, [measure])

  useLayoutEffect(measure, [children, edges.overflow, measure])
  const scroll = (direction: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollBy({ left: direction * Math.max(100, viewport.clientWidth * 0.7),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <div ref={rootRef} data-category-strip={label} className="flex items-center gap-1 min-w-0 w-full">
      {edges.overflow && <button type="button" aria-label={`${label}: scroll left`} disabled={!edges.left} onClick={() => scroll(-1)}
        className="h-7 w-6 shrink-0 flex items-center justify-center rounded border border-d2-border text-d2-textMuted hover:bg-d2-surfaceElevated disabled:opacity-30 disabled:cursor-default">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>}
      <div className="relative flex-1 min-w-0">
        <div ref={viewportRef} data-category-viewport role="group" aria-label={label} tabIndex={0}
          title="Mouse wheel or trackpad to browse categories"
          className="overflow-x-auto no-scrollbar py-0.5 rounded focus-visible:outline focus-visible:outline-1 focus-visible:outline-d2-accent"
          onScroll={measure}
          onFocusCapture={event => {
            const viewport = viewportRef.current
            if (!viewport || event.target === viewport) return
            const target = (event.target as HTMLElement).getBoundingClientRect(), bounds = viewport.getBoundingClientRect()
            if (target.left < bounds.left + 4) viewport.scrollLeft += target.left - bounds.left - 4
            else if (target.right > bounds.right - 4) viewport.scrollLeft += target.right - bounds.right + 4
          }}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return
            const viewport = event.currentTarget
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); scroll(event.key === 'ArrowLeft' ? -1 : 1) }
            else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); viewport.scrollLeft = event.key === 'Home' ? 0 : viewport.scrollWidth }
          }}>
          <div ref={contentRef} className="flex items-center gap-1 w-max">{children}</div>
        </div>
        {edges.left && <span aria-hidden="true" data-category-fade="left" className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-d2-surface to-transparent" />}
        {edges.right && <span aria-hidden="true" data-category-fade="right" className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-d2-surface to-transparent" />}
      </div>
      {edges.overflow && <button type="button" aria-label={`${label}: scroll right`} disabled={!edges.right} onClick={() => scroll(1)}
        className="h-7 w-6 shrink-0 flex items-center justify-center rounded border border-d2-border text-d2-textMuted hover:bg-d2-surfaceElevated disabled:opacity-30 disabled:cursor-default">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>}
    </div>
  )
}
