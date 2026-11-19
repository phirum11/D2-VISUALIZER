import { create } from 'zustand'

export type SidebarTab =
  | 'media'
  | 'visualizers'
  | 'backgrounds'
  | 'text'
  | 'effects'
  | 'templates'
  | 'export'

export type LayerId = 'visualizer' | 'background' | 'text' | 'overlay'

interface UIState {
  activeTab: SidebarTab
  isSidebarCollapsed: boolean
  isInspectorCollapsed: boolean
  isTimelineCollapsed: boolean
  sidebarWidth: number
  inspectorWidth: number
  timelineHeight: number
  selectedLayer: LayerId
  settingsOpen: boolean
  projectMenuOpen: boolean

  // Actions
  setActiveTab: (tab: SidebarTab) => void
  toggleSidebar: () => void
  toggleInspector: () => void
  toggleTimeline: () => void
  setSidebarWidth: (width: number) => void
  setInspectorWidth: (width: number) => void
  setTimelineHeight: (height: number) => void
  setSelectedLayer: (layer: LayerId) => void
  setSettingsOpen: (open: boolean) => void
  setProjectMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'visualizers',
  isSidebarCollapsed: false,
  isInspectorCollapsed: false,
  isTimelineCollapsed: false,
  sidebarWidth: 280,
  inspectorWidth: 300,
  timelineHeight: 210,
  selectedLayer: 'visualizer',
  settingsOpen: false,
  projectMenuOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab, isSidebarCollapsed: false }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  toggleInspector: () => set((s) => ({ isInspectorCollapsed: !s.isInspectorCollapsed })),
  toggleTimeline: () => set((s) => ({ isTimelineCollapsed: !s.isTimelineCollapsed })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(240, Math.min(420, width)) }),
  setInspectorWidth: (width) => set({ inspectorWidth: Math.max(260, Math.min(400, width)) }),
  setTimelineHeight: (height) => set({ timelineHeight: Math.max(160, Math.min(480, height)) }),
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setProjectMenuOpen: (open) => set({ projectMenuOpen: open }),
}))
