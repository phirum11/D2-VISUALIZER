import React, { useEffect } from 'react'
import {
  Activity,
  Minus,
  Square,
  Copy,
  X,
  ShieldCheck,
  Disc3,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

export const TitleBar: React.FC = () => {
  const {
    projectName,
    isDirty,
    isMaximized,
    ipcConnected,
    setIsMaximized,
  } = useAppStore()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Check initial maximized state
      window.electronAPI.isMaximized().then(setIsMaximized)

      // Subscribe to maximize/unmaximize changes
      const unsubscribe = window.electronAPI.onMaximizeChange((maximized) => {
        setIsMaximized(maximized)
      })

      return () => unsubscribe()
    }
  }, [setIsMaximized])

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximize()
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  return (
    <header className="h-9 w-full bg-d2-surface border-b border-d2-border flex items-center justify-between select-none app-drag-region px-3 z-50">
      {/* Left: Branding & Logo */}
      <div className="flex items-center gap-2 app-no-drag">
        <div className="flex items-center justify-center w-5 h-5 rounded bg-d2-accent/20 text-d2-accent">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold tracking-wider text-d2-text uppercase">
          D2 Visualizer
        </span>
        <span className="text-2xs px-1.5 py-0.5 rounded bg-d2-surfaceElevated border border-d2-border text-d2-textMuted font-mono">
          v0.1.0
        </span>
      </div>

      {/* Center: Active Project Indicator */}
      <div className="flex items-center gap-2">
        <Disc3 className="w-3.5 h-3.5 text-d2-accent animate-spin-slow opacity-75" />
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
            <span>IPC READY</span>
          </div>
        )}
      </div>

      {/* Right: Windows Window Controls */}
      <div className="flex items-center gap-0.5 app-no-drag -mr-2">
        <button
          onClick={handleMinimize}
          className="w-10 h-9 flex items-center justify-center text-d2-textMuted hover:text-d2-text hover:bg-d2-surfaceElevated transition-colors"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleMaximize}
          className="w-10 h-9 flex items-center justify-center text-d2-textMuted hover:text-d2-text hover:bg-d2-surfaceElevated transition-colors"
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
          onClick={handleClose}
          className="w-10 h-9 flex items-center justify-center text-d2-textMuted hover:text-white hover:bg-d2-danger transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
