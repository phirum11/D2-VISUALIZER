import React from 'react'
import { PreviewHeader } from './PreviewHeader'
import { PreviewCanvas } from './PreviewCanvas'
import { PlaybackToolbar } from './PlaybackToolbar'

export const PreviewWorkspace: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-d2-canvas overflow-hidden min-w-[320px] relative">
      {/* Top Preview Controls Bar */}
      <PreviewHeader />

      {/* Main Responsive Canvas Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <PreviewCanvas />
      </div>

      {/* Bottom Transport / Playback Controls Bar */}
      <PlaybackToolbar />
    </div>
  )
}
