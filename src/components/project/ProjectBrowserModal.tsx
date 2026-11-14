import React, { useState } from 'react'
import {
  X,
  FolderOpen,
  Plus,
  Sparkles,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Film,
  Check,
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { RESOLUTION_PRESETS, ResolutionPresetId } from '@/stores/exportStore'
import { usePreviewStore } from '@/stores/previewStore'
import { useExportStore } from '@/stores/exportStore'
import { useTimelineStore } from '@/stores/timelineStore'
import { TrackManager } from '@/engine/timeline/TrackManager'

export const ProjectBrowserModal: React.FC = () => {
  const {
    isProjectBrowserOpen,
    setProjectBrowserOpen,
    recentProjects,
    loadProjectFromPath,
    openProjectViaDialog,
    initNewProject,
    deleteProjectFile,
    removeRecentProject,
    setTemplateBrowserOpen,
  } = useProjectStore()

  const [activeTab, setActiveTab] = useState<'recents' | 'new' | 'templates'>('recents')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  // New Project Form State
  const [newTitle, setNewTitle] = useState('My Visualizer Project')
  const [newPresetId, setNewPresetId] = useState<ResolutionPresetId>('1080p')
  const [newFps, setNewFps] = useState<number>(30)
  const [newDuration, setNewDuration] = useState<number>(180)

  if (!isProjectBrowserOpen) return null

  // Filter & Sort Recents
  const filteredRecents = recentProjects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.filePath.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    })

  const handleCreateNew = () => {
    const selectedPreset = RESOLUTION_PRESETS.find((p) => p.id === newPresetId) || RESOLUTION_PRESETS[0]
    initNewProject(newTitle.trim() || 'Untitled Project')

    // Set resolution & duration
    usePreviewStore.setState({
      aspectRatio: selectedPreset.aspectRatio,
      duration: newDuration,
    })
    useExportStore.setState({
      selectedPresetId: newPresetId,
      width: selectedPreset.width,
      height: selectedPreset.height,
      aspectRatio: selectedPreset.aspectRatio,
      fps: newFps,
      fileName: (newTitle.trim() || 'Untitled').replace(/[\\/:*?"<>|]/g, '_') + '.mp4',
    })
    useTimelineStore.setState({
      tracks: TrackManager.createDefaultTracks(newDuration),
      fps: newFps,
    })

    setProjectBrowserOpen(false)
  }

  const handleOpenRecent = async (filePath: string) => {
    const success = await loadProjectFromPath(filePath)
    if (success) {
      setProjectBrowserOpen(false)
    }
  }

  const handleReveal = (filePath: string) => {
    if (window.electronAPI) {
      window.electronAPI.projectRevealInExplorer(filePath)
    }
  }

  const handleDelete = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project file permanently?')) {
      await deleteProjectFile(filePath)
    }
  }

  const handleRemove = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRecentProject(filePath)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 select-none animate-in fade-in-50">
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl bg-d2-surface border border-d2-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-d2-border bg-d2-surfaceElevated/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-d2-accent/20 flex items-center justify-center text-d2-accent">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">D2 Project Hub</h2>
              <p className="text-xs text-d2-textMuted">Manage projects, templates, and recent sessions</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-d2-surface border border-d2-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab('recents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'recents'
                  ? 'bg-d2-accent text-white shadow-sm'
                  : 'text-d2-textMuted hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recent Projects
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-d2-accent text-white shadow-sm'
                  : 'text-d2-textMuted hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
            <button
              onClick={() => {
                setProjectBrowserOpen(false)
                setTemplateBrowserOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-d2-textMuted hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Starter Templates
            </button>
          </div>

          <button
            onClick={() => setProjectBrowserOpen(false)}
            className="p-1.5 rounded-lg hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Recent Projects */}
        {activeTab === 'recents' && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-d2-textSubtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recent projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-d2-surfaceElevated border border-d2-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-d2-textSubtle focus:outline-none focus:border-d2-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-d2-textMuted bg-d2-surfaceElevated border border-d2-border px-2.5 py-1.5 rounded-lg">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="date" className="bg-d2-surface">Last Modified</option>
                    <option value="name" className="bg-d2-surface">Project Name</option>
                  </select>
                </div>

                <button
                  onClick={async () => {
                    const ok = await openProjectViaDialog()
                    if (ok) setProjectBrowserOpen(false)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent text-xs font-medium text-white transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-d2-accent" />
                  Browse .d2proj...
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredRecents.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border border-dashed border-d2-border rounded-xl text-center p-6">
                  <Clock className="w-8 h-8 text-d2-textSubtle mb-2 opacity-50" />
                  <p className="text-sm font-medium text-d2-text">No recent projects found</p>
                  <p className="text-xs text-d2-textSubtle mt-1">
                    Create a new project or open an existing .d2proj file
                  </p>
                </div>
              ) : (
                filteredRecents.map((proj) => (
                  <div
                    key={proj.filePath}
                    onClick={() => handleOpenRecent(proj.filePath)}
                    className="group flex items-center justify-between p-3.5 rounded-xl bg-d2-surfaceElevated/50 hover:bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-d2-border flex items-center justify-center text-d2-accent font-bold text-sm">
                        {proj.canvas.aspectRatio}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-d2-accent transition-colors">
                            {proj.name}
                          </h4>
                          {proj.exists === false && (
                            <span className="text-3xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Missing file
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-d2-textSubtle truncate max-w-lg font-mono mt-0.5">
                          {proj.filePath}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-3xs text-d2-textMuted font-mono">
                          <span>{proj.canvas.width}×{proj.canvas.height}</span>
                          <span>•</span>
                          <span>{proj.canvas.fps} FPS</span>
                          <span>•</span>
                          <span>Modified {new Date(proj.modifiedAt).toLocaleDateString()} {new Date(proj.modifiedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Reveal in File Explorer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReveal(proj.filePath)
                        }}
                        className="p-1.5 rounded-lg hover:bg-d2-surface text-d2-textMuted hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Remove from recents"
                        onClick={(e) => handleRemove(proj.filePath, e)}
                        className="p-1.5 rounded-lg hover:bg-d2-surface text-d2-textMuted hover:text-amber-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete project file"
                        onClick={(e) => handleDelete(proj.filePath, e)}
                        className="p-1.5 rounded-lg hover:bg-d2-surface text-d2-textMuted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: New Project */}
        {activeTab === 'new' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-xs font-semibold text-d2-textMuted uppercase tracking-wider mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My Visualizer Project"
                className="w-full bg-d2-surfaceElevated border border-d2-border rounded-lg px-3.5 py-2 text-sm text-white placeholder-d2-textSubtle focus:outline-none focus:border-d2-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-d2-textMuted uppercase tracking-wider mb-3">
                Canvas Resolution & Format Preset
              </label>
              <div className="grid grid-cols-3 gap-3">
                {RESOLUTION_PRESETS.map((preset) => {
                  const isSelected = newPresetId === preset.id
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setNewPresetId(preset.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-d2-accent/15 border-d2-accent shadow-sm'
                          : 'bg-d2-surfaceElevated/50 border-d2-border hover:border-d2-borderHover'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-d2-accent" />}
                      </div>
                      <p className="text-2xs text-d2-textSubtle font-mono">
                        {preset.width} × {preset.height} ({preset.aspectRatio})
                      </p>
                      <p className="text-3xs text-d2-textMuted mt-1 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-d2-textMuted uppercase tracking-wider mb-2">
                  Project Frame Rate
                </label>
                <div className="flex gap-2">
                  {[24, 30, 60].map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => setNewFps(fps)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                        newFps === fps
                          ? 'bg-d2-accent text-white border-d2-accent'
                          : 'bg-d2-surfaceElevated border-d2-border text-d2-textMuted hover:text-white'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-d2-textMuted uppercase tracking-wider mb-2">
                  Initial Duration (Seconds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={1800}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Math.max(10, parseInt(e.target.value) || 180))}
                    className="w-full bg-d2-surfaceElevated border border-d2-border rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-d2-accent"
                  />
                  <span className="text-xs text-d2-textSubtle">sec</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-d2-border flex justify-end gap-3">
              <button
                onClick={() => setProjectBrowserOpen(false)}
                className="px-4 py-2 rounded-lg bg-d2-surfaceElevated border border-d2-border text-xs font-medium text-d2-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-d2-accent hover:bg-d2-accent/90 text-xs font-bold text-white transition-colors shadow-lg shadow-d2-accent/20"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
