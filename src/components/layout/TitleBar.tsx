import React, { useEffect, useState } from 'react'
import {
  Activity,
  Minus,
  Square,
  Copy,
  X,
  ShieldCheck,
  Disc3,
  RotateCcw,
  RotateCw,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { ProjectMenu } from './ProjectMenu'
import { Tooltip } from '@/components/ui/Tooltip'

export const TitleBar: React.FC = () => {
  const { projectName, isDirty, isMaximized, ipcConnected, setIsMaximized } =
    useAppStore()
  const { setSettingsOpen } = useUIStore()
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
    <header className="h-9 w-full bg-d2-surface border-b border-d2-border flex items-center justify-between select-none app-drag-region px-2 z-50">
      {/* Left: Branding & Project Menu Button */}
      <div className="flex items-center gap-1 app-no-drag">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-d2-accent/20 text-d2-accent">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wider text-d2-text uppercase">
            D2 Visualizer
          </span>
          <span className="text-2xs px-1.5 py-0.2 rounded bg-d2-surfaceElevated border border-d2-border text-d2-textMuted font-mono">
            v0.1.0
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

      {/* Center: Active Project Indicator */}
      <div className="flex items-center gap-2 app-drag-region">
        <Disc3 className="w-3.5 h-3.5 text-d2-accent opacity-75" />
        <span className="text-xs font-medium text-d2-textMuted">
          {projectName}
          {isDirty && <span className="text-d2-accent ml-1">*</span>}
        </span>
        {ipcConnected && (
          <div
            className="flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-medium"
            title="Secure Isolated Preload IPC Active"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>IPC SECURE</span>
          </div>
        )}
      </div>

      {/* Right: Settings & Windows Window Controls */}
      <div className="flex items-center gap-0.5 app-no-drag">
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
