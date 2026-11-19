import React from 'react'
import {
  FolderOpen,
  Activity,
  Image,
  Type,
  Sparkles,
  LayoutTemplate,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useUIStore, SidebarTab } from '@/stores/uiStore'
import { Tooltip } from '@/components/ui/Tooltip'

interface TabItem {
  id: SidebarTab
  label: string
  icon: React.ElementType
}

const tabs: TabItem[] = [
  { id: 'media', label: 'Media Library', icon: FolderOpen },
  { id: 'visualizers', label: 'Visualizer Presets', icon: Activity },
  { id: 'backgrounds', label: 'Background Layer', icon: Image },
  { id: 'text', label: 'Text & Typography', icon: Type },
  { id: 'effects', label: 'Post-Effects', icon: Sparkles },
  { id: 'templates', label: 'Visualizer Templates', icon: LayoutTemplate },
  { id: 'export', label: 'Video Export', icon: Download },
]

export const SidebarNav: React.FC = () => {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar } =
    useUIStore()

  return (
    <aside className="w-12 h-full bg-d2-surface border-r border-d2-border flex flex-col items-center justify-between py-2 select-none z-20 shrink-0">
      <div className="flex flex-col items-center gap-1.5 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = !isSidebarCollapsed && activeTab === tab.id
          return (
            <Tooltip key={tab.id} content={tab.label} side="right">
              <button
                onClick={() => {
                  if (isSidebarCollapsed) {
                    toggleSidebar()
                  }
                  setActiveTab(tab.id)
                }}
                className={`w-9 h-9 rounded-lg relative flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-d2-accent text-white shadow-md shadow-d2-accent/30 font-semibold'
                    : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated'
                }`}
                aria-label={tab.label}
              >
                {isActive && (
                  <span className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r bg-white" />
                )}
                <Icon className="w-4 h-4" />
              </button>
            </Tooltip>
          )
        })}
      </div>

      {/* Collapse / Expand toggle button at bottom */}
      <div className="border-t border-d2-borderSubtle pt-2 w-full flex justify-center">
        <Tooltip
          content={isSidebarCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          side="right"
        >
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded flex items-center justify-center text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-d2-accent" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
