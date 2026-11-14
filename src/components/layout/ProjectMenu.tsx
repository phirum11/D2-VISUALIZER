import React, { useRef, useEffect } from 'react'
import {
  FilePlus,
  FolderOpen,
  Save,
  FileCode,
  Settings,
  RotateCcw,
  RotateCw,
  Sparkles,
  Bookmark,
  Package,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { useProjectStore } from '@/stores/projectStore'

interface ProjectMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const ProjectMenu: React.FC<ProjectMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const { setSettingsOpen } = useUIStore()
  const { undo, redo, past, future } = useCompositionStore()
  const {
    projectName,
    saveProject,
    saveProjectAs,
    openProjectViaDialog,
    setProjectBrowserOpen,
    setTemplateBrowserOpen,
    setPresetManagerOpen,
    collectAndBundleAssets,
  } = useProjectStore()

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

  const handleNew = () => {
    setProjectBrowserOpen(true)
    onClose()
  }

  const handleOpen = async () => {
    onClose()
    await openProjectViaDialog()
  }

  const handleSave = async () => {
    onClose()
    await saveProject()
  }

  const handleSaveAs = async () => {
    onClose()
    await saveProjectAs()
  }

  const handleBundle = async () => {
    onClose()
    const ok = await collectAndBundleAssets()
    if (ok) {
      alert('Assets collected and bundled successfully into project folder!')
    }
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-9 left-28 z-50 w-64 rounded-xl bg-d2-surface border border-d2-border shadow-2xl py-1.5 text-xs text-d2-text animate-in fade-in-50 zoom-in-95"
    >
      <div className="px-3.5 py-1.5 border-b border-d2-borderSubtle text-2xs text-d2-textSubtle font-mono truncate">
        Active: <span className="text-white font-medium">{projectName}</span>
      </div>

      <div className="py-1">
        <button
          onClick={handleNew}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2.5">
            <FilePlus className="w-3.5 h-3.5 text-d2-accent" />
            New Project / Hub...
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+N</span>
        </button>

        <button
          onClick={handleOpen}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2.5">
            <FolderOpen className="w-3.5 h-3.5 text-d2-textMuted" />
            Open Project...
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+O</span>
        </button>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2.5">
            <Save className="w-3.5 h-3.5 text-d2-textMuted" />
            Save Project
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+S</span>
        </button>

        <button
          onClick={handleSaveAs}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <span className="flex items-center gap-2.5">
            <FileCode className="w-3.5 h-3.5 text-d2-textMuted" />
            Save Project As...
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+Shift+S</span>
        </button>
      </div>

      <div className="border-t border-d2-borderSubtle py-1">
        <button
          onClick={() => {
            setTemplateBrowserOpen(true)
            onClose()
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Starter Template Library...
        </button>

        <button
          onClick={() => {
            setPresetManagerOpen(true)
            onClose()
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
          Preset Library...
        </button>

        <button
          onClick={handleBundle}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left"
        >
          <Package className="w-3.5 h-3.5 text-d2-textMuted" />
          Collect & Bundle Assets...
        </button>
      </div>

      <div className="border-t border-d2-borderSubtle py-1">
        <button
          onClick={() => {
            undo()
            onClose()
          }}
          disabled={past.length === 0}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="flex items-center gap-2.5">
            <RotateCcw className="w-3.5 h-3.5 text-d2-textMuted" />
            Undo
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+Z</span>
        </button>

        <button
          onClick={() => {
            redo()
            onClose()
          }}
          disabled={future.length === 0}
          className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="flex items-center gap-2.5">
            <RotateCw className="w-3.5 h-3.5 text-d2-textMuted" />
            Redo
          </span>
          <span className="text-2xs text-d2-textSubtle font-mono">Ctrl+Y</span>
        </button>
      </div>

      <div className="border-t border-d2-borderSubtle pt-1">
        <button
          onClick={() => {
            setSettingsOpen(true)
            onClose()
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-d2-surfaceElevated transition-colors text-left text-d2-accent"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings & Preferences
        </button>
      </div>
    </div>
  )
}
