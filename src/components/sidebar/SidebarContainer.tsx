import React, { useRef, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { SidebarNav } from './SidebarNav'
import { MediaPanel } from './panels/MediaPanel'
import { VisualizersPanel } from './panels/VisualizersPanel'
import { BackgroundsPanel } from './panels/BackgroundsPanel'
import { TextPanel } from './panels/TextPanel'
import { EffectsPanel } from './panels/EffectsPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'

export const SidebarContainer: React.FC = () => {
  const { activeTab, isSidebarCollapsed, sidebarWidth, setSidebarWidth } = useUIStore()
  const isDraggingRef = useRef(false)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsResizing(true)
    const startX = e.clientX
    const startW = sidebarWidth

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = ev.clientX - startX
      setSidebarWidth(startW + deltaX)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'media':
        return <MediaPanel />
      case 'visualizers':
        return <VisualizersPanel />
      case 'backgrounds':
        return <BackgroundsPanel />
      case 'text':
        return <TextPanel />
      case 'effects':
        return <EffectsPanel />
      case 'templates':
        return <TemplatesPanel />
      default:
        return <VisualizersPanel />
    }
  }

  return (
    <div className="flex h-full select-none shrink-0 z-20 border-r border-d2-border relative">
      {/* Icon Tab Strip */}
      <SidebarNav />

      {/* Expandable Content Drawer */}
      <div data-sidebar-panel data-resizing={isResizing}
        style={{ width: isSidebarCollapsed ? 0 : sidebarWidth + 4 }}
        className="panel-size-transition h-full shrink-0 overflow-hidden"
        aria-hidden={isSidebarCollapsed} ref={node => { if (node) node.inert = isSidebarCollapsed }}>
        <div style={{ width: sidebarWidth + 4 }}
          className={`panel-fade flex h-full ${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div
            style={{ width: `${sidebarWidth}px` }}
            className="h-full bg-d2-surface flex flex-col overflow-hidden"
          >
            {renderActivePanel()}
          </div>
          {/* Vertical Resize Splitter */}
          <div
            onMouseDown={handleMouseDown}
            className="w-1 h-full cursor-col-resize z-30 bg-d2-border hover:bg-d2-accent active:bg-d2-accent transition-colors"
            title="Drag to resize panel"
          />
        </div>
      </div>
    </div>
  )
}
