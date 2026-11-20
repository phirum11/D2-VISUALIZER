import React, { useEffect, useState } from 'react'
import {
  Activity,
  Minus,
  Square,
  Copy,
  X,
  Disc3,
  RotateCcw,
  RotateCw,
  Settings,
  ChevronDown,
  Download,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { useAudioStore } from '@/stores/audioStore'
import { useProjectStore } from '@/stores/projectStore'
import { ProjectMenu } from './ProjectMenu'
import { Tooltip } from '@/components/ui/Tooltip'

export const TitleBar: React.FC = () => {
  const { version, isMaximized, setIsMaximized } = useAppStore()
  const { projectName, saveStatus, setProjectBrowserOpen } = useProjectStore()
  const { setSettingsOpen, exportOpen, setExportOpen } = useUIStore()
  const { undo, redo, past, future } = useCompositionStore()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized)
      const unsubscribe = window.electronAPI.onMaximizeChange((maximized) => {
        setIsMaximized(maximized)
      })
      return () => unsubscribe()
    }
  }, [setIsMaximized])

  return (
    <header className="h-11 w-full bg-d2-surface border-b border-d2-border flex items-center justify-between select-none app-drag-region px-3 z-50">
      {/* Left: Branding & Project Menu Button */}
      <div className="flex items-center gap-1 app-no-drag">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-d2-surfaceActive border border-d2-border text-white">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-white font-sans">
            D2 Visualizer
          </span>
          <span className="text-3xs text-d2-textSubtle font-mono ml-1">
            v{version}
          </span>
        </div>

        {/* Project Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-d2-surfaceElevated text-xs font-medium text-d2-textMuted hover:text-white transition-colors border border-transparent hover:border-d2-border"
          >
            <span>Project</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          <ProjectMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>

        {/* Undo / Redo Toolbar */}
        <div className="flex items-center gap-0.5 ml-1 border-l border-d2-borderSubtle pl-2">
          <Tooltip content="Undo (Ctrl+Z)" side="bottom">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-1 rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Redo (Ctrl+Y)" side="bottom">
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-1 rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Center: Active Project Indicator & Save Status */}
      <div className="flex items-center gap-2 app-drag-region">
        <button
          onClick={() => setProjectBrowserOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-d2-surfaceElevated transition-colors app-no-drag group"
          title="Click to open Project Hub"
        >
          <Disc3 className="w-3.5 h-3.5 text-d2-textMuted" />
          <span className="text-xs font-semibold text-white/90 group-hover:text-white">
            {projectName}
          </span>
        </button>

        {/* Save Status Indicator */}
        <div className="text-3xs font-mono app-no-drag">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-d2-textSubtle">
              <span className="w-1 h-1 rounded-full bg-d2-textMuted" />
              <span className="font-medium">Saved</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-d2-textMuted">
              <span className="w-1 h-1 rounded-full bg-d2-textMuted animate-pulse" />
              <span className="font-medium">Saving...</span>
            </div>
          )}
          {saveStatus === 'unsaved' && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 text-d2-textMuted cursor-pointer hover:text-white transition-colors"
              title="Unsaved changes (Ctrl+S to save)"
              onClick={() => useProjectStore.getState().saveProject()}
            >
              <span className="w-1 h-1 rounded-full bg-d2-text" />
              <span className="font-medium">Unsaved</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Audio Monitor, Export, Settings & Window Controls */}
      <div className="flex items-center gap-0.5 app-no-drag">
        {/* Live Audio FFT Monitor button */}
        <Tooltip content="Live Audio FFT Monitor" side="bottom">
          <button
            onClick={() => useAudioStore.getState().setAudioMonitorOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-cyan-400 hover:text-white transition-colors"
            aria-label="Audio Monitor"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Export Video" side="bottom">
          <button type="button" onClick={() => setExportOpen(true)}
            aria-label="Export Video" aria-haspopup="dialog" aria-expanded={exportOpen}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-accent hover:text-d2-accentHover transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        {/* Settings button */}
        <Tooltip content="Application Settings" side="bottom">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-d2-borderSubtle mx-1" />

        {/* Windows Control Buttons */}
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-9 h-8 flex items-center justify-center text-d2-textMuted hover:text-d2-text hover:bg-d2-surfaceElevated transition-colors"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => window.electronAPI?.maximize()}
          className="w-9 h-8 flex items-center justify-center text-d2-textMuted hover:text-d2-text hover:bg-d2-surfaceElevated transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3 rotate-180" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => window.electronAPI?.close()}
          className="w-9 h-8 flex items-center justify-center text-d2-textMuted hover:text-white hover:bg-d2-danger transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
