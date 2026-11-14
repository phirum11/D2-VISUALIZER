import React, { useRef, useEffect } from 'react'
import {
  FilePlus,
  FolderOpen,
  Save,
  FileCode,
  Settings,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { useAppStore } from '@/stores/appStore'

interface ProjectMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const ProjectMenu: React.FC<ProjectMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const { setSettingsOpen } = useUIStore()
  const { undo, redo, past, future } = useCompositionStore()
  const { projectName, setProjectName, setIsDirty } = useAppStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNewProject = () => {
    setProjectName('New Project')
    setIsDirty(false)
    onClose()
  }

  const handleSaveProject = () => {
    setIsDirty(false)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-9 left-28 z-50 w-56 rounded-md bg-d2-surface border border-d2-border shadow-2xl py-1 text-xs text-d2-text animate-in fade-in-50 zoom-in-95"
    >
      <div className="px-3 py-1.5 border-b border-d2-borderSubtle text-2xs text-d2-textSubtle font-mono">
        Active: {projectName}
      </div>

      <div className="py-1">
        <button
          onClick={handleNewProject}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <FilePlus className="w-3.5 h-3.5 text-d2-accent" />
            New Project
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+N</span>
        </button>

        <button
          onClick={() => onClose()}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-d2-textMuted" />
            Open Project...
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+O</span>
        </button>

        <button
          onClick={handleSaveProject}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <Save className="w-3.5 h-3.5 text-d2-textMuted" />
            Save Project
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+S</span>
        </button>

        <button
          onClick={() => onClose()}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-d2-textMuted" />
            Save Project As...
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+Shift+S</span>
        </button>
      </div>

      <div className="border-t border-d2-borderSubtle py-1">
        <button
          onClick={() => {
            undo()
            onClose()
          }}
          disabled={past.length === 0}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-d2-textMuted" />
            Undo
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+Z</span>
        </button>

        <button
          onClick={() => {
            redo()
            onClose()
          }}
          disabled={future.length === 0}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-d2-textMuted" />
            Redo
          </span>
          <span className="text-2xs text-d2-textSubtle">Ctrl+Y</span>
        </button>
      </div>

      <div className="border-t border-d2-borderSubtle pt-1">
        <button
          onClick={() => {
            setSettingsOpen(true)
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left text-d2-accent"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings & Preferences
        </button>
      </div>
    </div>
  )
}
