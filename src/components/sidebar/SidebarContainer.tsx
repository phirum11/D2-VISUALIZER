import React from 'react'
import { useUIStore } from '@/stores/uiStore'
import { SidebarNav } from './SidebarNav'
import { MediaPanel } from './panels/MediaPanel'
import { VisualizersPanel } from './panels/VisualizersPanel'
import { BackgroundsPanel } from './panels/BackgroundsPanel'
import { TextPanel } from './panels/TextPanel'
import { EffectsPanel } from './panels/EffectsPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'
import { ExportPanel } from './panels/ExportPanel'

export const SidebarContainer: React.FC = () => {
  const { activeTab, isSidebarCollapsed, sidebarWidth } = useUIStore()

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
      case 'export':
        return <ExportPanel />
      default:
        return <VisualizersPanel />
    }
  }

  return (
    <div className="flex h-full select-none shrink-0 z-20 border-r border-d2-border">
      {/* Icon Tab Strip */}
      <SidebarNav />

      {/* Expandable Content Drawer */}
      {!isSidebarCollapsed && (
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="h-full bg-d2-surface border-r border-d2-border flex flex-col overflow-hidden transition-[width] duration-150 ease-out"
        >
          {renderActivePanel()}
        </div>
      )}
    </div>
  )
}
