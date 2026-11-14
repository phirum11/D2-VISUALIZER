import React, { useState } from 'react'
import {
  X,
  Bookmark,
  Plus,
  Trash2,
  Download,
  Upload,
  Sliders,
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { PresetManager } from '@/engine/presets/PresetManager'
import { PresetCategory, PresetItem } from '@/engine/presets/types'
import { useCompositionStore } from '@/stores/compositionStore'

export const PresetManagerModal: React.FC = () => {
  const { isPresetManagerOpen, setPresetManagerOpen } = useProjectStore()
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetCategory, setNewPresetCategory] = useState<PresetCategory>('visualizer')

  if (!isPresetManagerOpen) return null

  const categories: Array<{ id: PresetCategory | 'all'; name: string }> = [
    { id: 'all', name: 'All Presets' },
    { id: 'visualizer', name: 'Visualizer Styles' },
    { id: 'background', name: 'Backgrounds' },
    { id: 'typography', name: 'Typography' },
    { id: 'text-animation', name: 'Text Animations' },
    { id: 'artwork', name: 'Album Artwork' },
    { id: 'watermark', name: 'Logo / Watermark' },
    { id: 'particles', name: 'Ambient Particles' },
    { id: 'color-grading', name: 'Color Grading / FX' },
    { id: 'keyframes', name: 'Keyframe Animations' },
  ]

  const allPresets = PresetManager.getAllPresets(
    selectedCategory === 'all' ? undefined : selectedCategory
  )

  const handleApplyPreset = (preset: PresetItem) => {
    const comp = useCompositionStore.getState()

    switch (preset.category) {
      case 'visualizer':
        comp.updateVisualizer(preset.data)
        break
      case 'background':
        comp.updateBackground(preset.data)
        break
      case 'typography':
        if (preset.data.songTitle) {
          comp.updateText(preset.data)
        }
        break
      case 'particles':
        comp.updateAmbientParticles(preset.data)
        break
      case 'color-grading':
        comp.updateEffects(preset.data)
        break
      default:
        break
    }
  }

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) return

    const comp = useCompositionStore.getState()
    let dataToSave: any = {}

    if (newPresetCategory === 'visualizer') {
      dataToSave = { ...comp.visualizer }
    } else if (newPresetCategory === 'background') {
      dataToSave = { ...comp.background }
    } else if (newPresetCategory === 'typography') {
      dataToSave = { ...comp.text }
    } else if (newPresetCategory === 'particles') {
      dataToSave = { ...comp.ambientParticles }
    } else if (newPresetCategory === 'color-grading') {
      dataToSave = { ...comp.effects }
    }

    const created = PresetManager.addUserPreset({
      id: 'usr-preset-' + Date.now(),
      name: newPresetName.trim(),
      category: newPresetCategory,
      description: 'Custom user preset',
      data: dataToSave,
    })

    if (window.electronAPI) {
      window.electronAPI.presetsSaveUser(created)
    }

    setIsCreatingNew(false)
    setNewPresetName('')
  }

  const handleDeletePreset = (id: string, cat: string) => {
    PresetManager.deleteUserPreset(id)
    if (window.electronAPI) {
      window.electronAPI.presetsDeleteUser(cat, id)
    }
  }

  const handleExportBundle = async () => {
    const bundle = PresetManager.exportBundle()
    if (window.electronAPI) {
      await window.electronAPI.presetsExportFile(bundle)
    }
  }

  const handleImportBundle = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.presetsImportFile()
      if (!res.canceled && res.data) {
        PresetManager.importBundle(res.data)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-in fade-in-50">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl bg-d2-surface border border-d2-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-d2-border bg-d2-surfaceElevated/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Preset Library</h2>
              <p className="text-xs text-d2-textMuted">Save, duplicate, and reuse visualizer styling presets</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-d2-accent hover:bg-d2-accent/90 text-xs font-bold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Save Current as Preset
            </button>
            <button
              onClick={handleExportBundle}
              title="Export presets bundle"
              className="p-2 rounded-lg bg-d2-surfaceElevated hover:bg-d2-surface border border-d2-border text-d2-textMuted hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleImportBundle}
              title="Import presets bundle"
              className="p-2 rounded-lg bg-d2-surfaceElevated hover:bg-d2-surface border border-d2-border text-d2-textMuted hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPresetManagerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create New Preset Drawer */}
        {isCreatingNew && (
          <div className="px-6 py-4 border-b border-d2-border bg-d2-surfaceElevated/80 flex items-center gap-4 animate-in slide-in-from-top-2">
            <div className="flex-1">
              <label className="block text-3xs font-semibold text-d2-textMuted uppercase mb-1">
                Preset Name
              </label>
              <input
                type="text"
                placeholder="My Custom Preset..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full bg-d2-surface border border-d2-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-d2-accent"
              />
            </div>
            <div>
              <label className="block text-3xs font-semibold text-d2-textMuted uppercase mb-1">
                Category
              </label>
              <select
                value={newPresetCategory}
                onChange={(e) => setNewPresetCategory(e.target.value as any)}
                className="bg-d2-surface border border-d2-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-d2-accent cursor-pointer"
              >
                <option value="visualizer">Visualizer</option>
                <option value="background">Background</option>
                <option value="typography">Typography</option>
                <option value="particles">Particles</option>
                <option value="color-grading">Color Grading / FX</option>
              </select>
            </div>
            <div className="flex items-end gap-2 pt-4">
              <button
                onClick={handleSaveCurrentAsPreset}
                disabled={!newPresetName.trim()}
                className="px-4 py-1.5 rounded-lg bg-d2-accent text-white text-xs font-bold disabled:opacity-40 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-d2-surface border border-d2-border text-d2-textMuted text-xs hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-56 border-r border-d2-border bg-d2-surfaceElevated/20 p-3 space-y-1 overflow-y-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-d2-accent text-white shadow-sm'
                    : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Presets List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 custom-scrollbar">
            {allPresets.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-d2-textSubtle">
                No presets in this category
              </div>
            ) : (
              allPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-d2-surfaceElevated/50 hover:bg-d2-surfaceElevated border border-d2-border hover:border-d2-borderHover transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-d2-surface border border-d2-border flex items-center justify-center text-d2-accent">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                        {preset.isFactory ? (
                          <span className="text-3xs px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            Built-in
                          </span>
                        ) : (
                          <span className="text-3xs px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            User
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-d2-textSubtle mt-0.5">{preset.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-lg bg-d2-accent/20 hover:bg-d2-accent text-d2-accent hover:text-white border border-d2-accent/30 text-xs font-medium transition-colors"
                    >
                      Apply
                    </button>
                    {!preset.isFactory && (
                      <button
                        onClick={() => handleDeletePreset(preset.id, preset.category)}
                        title="Delete preset"
                        className="p-1.5 rounded-lg hover:bg-d2-surface text-d2-textMuted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
