import React, { useEffect } from 'react'
import { TitleBar } from './TitleBar'
import { SidebarContainer } from '../sidebar/SidebarContainer'
import { PreviewWorkspace } from '../preview/PreviewWorkspace'
import { InspectorPanel } from '../inspector/InspectorPanel'
import { TimelinePanel } from '../timeline/TimelinePanel'
import { SettingsModal } from './SettingsModal'
import { ExportModal } from '../export/ExportModal'
import { LiveAudioMonitor } from '../audio/LiveAudioMonitor'
import { ProjectBrowserModal } from '../project/ProjectBrowserModal'
import { TemplateBrowserModal } from '../project/TemplateBrowserModal'
import { PresetManagerModal } from '../project/PresetManagerModal'
import { MissingMediaModal } from '../project/MissingMediaModal'
import { RecoveryBanner } from '../project/RecoveryBanner'
import { useAudioStore } from '@/stores/audioStore'
import { useProjectStore } from '@/stores/projectStore'

export const MainLayout: React.FC = () => {
  const audioMonitorOpen = useAudioStore((s) => s.audioMonitorOpen)
  const setAudioMonitorOpen = useAudioStore((s) => s.setAudioMonitorOpen)
  const saveProject = useProjectStore((s) => s.saveProject)
  const saveProjectAs = useProjectStore((s) => s.saveProjectAs)
  const openProjectViaDialog = useProjectStore((s) => s.openProjectViaDialog)
  const setProjectBrowserOpen = useProjectStore((s) => s.setProjectBrowserOpen)

  // Global Project Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          saveProjectAs()
        } else {
          saveProject()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        openProjectViaDialog()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setProjectBrowserOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveProject, saveProjectAs, openProjectViaDialog, setProjectBrowserOpen])

  return (
    <div className="flex flex-col h-screen w-screen bg-d2-canvas text-d2-text overflow-hidden select-none">
      {/* 1. Top Native Application Bar */}
      <TitleBar />

      {/* Crash / Unsaved Recovery Banner */}
      <RecoveryBanner />

      {/* 2. Middle Editor Workstation: Sidebar + Center Preview + Right Inspector */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Navigation & Tool Panels */}
        <SidebarContainer />

        {/* Center Preview Viewport (Main Visual Focus) */}
        <PreviewWorkspace />

        {/* Right Properties & Controls Inspector */}
        <InspectorPanel />
      </div>

      {/* 3. Bottom Multi-Track Sequence Timeline */}
      <TimelinePanel />

      {/* Modals & Diagnostic Sheets */}
      <SettingsModal />
      <ExportModal />
      <ProjectBrowserModal />
      <TemplateBrowserModal />
      <PresetManagerModal />
      <MissingMediaModal />
      <LiveAudioMonitor
        isOpen={audioMonitorOpen}
        onClose={() => setAudioMonitorOpen(false)}
      />
    </div>
  )
}
