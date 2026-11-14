import React from 'react'
import { TitleBar } from './TitleBar'
import { SidebarContainer } from '../sidebar/SidebarContainer'
import { PreviewWorkspace } from '../preview/PreviewWorkspace'
import { InspectorPanel } from '../inspector/InspectorPanel'
import { TimelinePanel } from '../timeline/TimelinePanel'
import { SettingsModal } from './SettingsModal'
import { LiveAudioMonitor } from '../audio/LiveAudioMonitor'
import { useAudioStore } from '@/stores/audioStore'

export const MainLayout: React.FC = () => {
  const { audioMonitorOpen, setAudioMonitorOpen } = useAudioStore()

  return (
    <div className="flex flex-col h-screen w-screen bg-d2-canvas text-d2-text overflow-hidden select-none">
      {/* 1. Top Native Application Bar */}
      <TitleBar />

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

      {/* Overlays & Diagnostic Modals */}
      <SettingsModal />
      <LiveAudioMonitor
        isOpen={audioMonitorOpen}
        onClose={() => setAudioMonitorOpen(false)}
      />
    </div>
  )
}
