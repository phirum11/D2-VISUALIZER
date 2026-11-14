import React, { useState, useMemo } from 'react'
import {
  BarChart2,
  Disc,
  Radio,
  Activity,
  Layers,
  Sparkles,
  Mountain,
  Globe2,
  Compass,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'
import { VisualizerRegistry, VisualizerInfo } from '@/engine/visualizers/VisualizerRegistry'

const iconMap: Record<string, React.ElementType> = {
  'spectrum-bars': BarChart2,
  'circular-spectrum': Disc,
  'radial-waveform': Radio,
  'classic-waveform': Activity,
  'mirrored-spectrum': Layers,
  'dual-rings': Disc,
  '3d-sphere': Globe2,
  '3d-landscape': Mountain,
  'audio-radar': Compass,
  'particles': Sparkles,
}

export const VisualizersPanel: React.FC = () => {
  const { visualizer, updateVisualizer } = useCompositionStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const registry = VisualizerRegistry.getInstance()
  const allVisualizers: VisualizerInfo[] = useMemo(() => registry.getAllVisualizers(), [registry])

  const categories = useMemo(() => {
    const cats = new Set(allVisualizers.map((v) => v.category))
    return ['All', ...Array.from(cats)]
  }, [allVisualizers])

  const filteredVisualizers = useMemo(() => {
    return allVisualizers.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat =
        selectedCategory === 'All' || v.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [allVisualizers, searchQuery, selectedCategory])

  return (
    <div className="flex flex-col h-full select-none text-xs">
      {/* Header & Stats */}
      <div className="p-3 border-b border-d2-border space-y-2 bg-d2-surfaceElevated/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
              Visualizer Library
            </h2>
            <span className="text-2xs text-d2-textSubtle">
              {allVisualizers.length} Modular Audio-Reactive Styles
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-3xs font-mono font-semibold bg-d2-accent/20 text-d2-accent border border-d2-accent/30">
            ENGINE v4
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-d2-textSubtle pointer-events-none" />
          <input
            type="text"
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-8 pr-2.5 rounded bg-d2-canvas border border-d2-border text-2xs text-white placeholder:text-d2-textSubtle focus:outline-none focus:border-d2-accent"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-3xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-d2-accent text-white font-semibold shadow-xs'
                  : 'bg-d2-surface border border-d2-borderSubtle text-d2-textSubtle hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Presets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredVisualizers.length === 0 ? (
          <div className="py-8 text-center text-d2-textSubtle text-2xs">
            No visualizers match &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredVisualizers.map((preset) => {
            const Icon = iconMap[preset.id] || BarChart2
            const isSelected = visualizer.type === preset.id
            const is3D = preset.renderType === '3d'

            return (
              <div
                key={preset.id}
                onClick={() => updateVisualizer({ type: preset.id })}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer group flex items-start gap-3 ${
                  isSelected
                    ? 'bg-d2-accent/15 border-d2-accent shadow-md shadow-d2-accent/10'
                    : 'bg-d2-surfaceElevated/40 border-d2-borderSubtle hover:border-d2-border hover:bg-d2-surfaceElevated'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-d2-accent text-white shadow-sm'
                      : 'bg-d2-surface border border-d2-border text-d2-textMuted group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xs font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-d2-text'
                      }`}
                    >
                      {preset.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-d2-accent shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-2xs text-d2-textSubtle mt-0.5 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-3xs px-1.5 py-0.2 rounded bg-d2-canvas text-d2-textSubtle border border-d2-borderSubtle font-mono">
                      {preset.category}
                    </span>
                    <span
                      className={`text-3xs px-1.5 py-0.2 rounded font-mono font-medium ${
                        is3D
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                      }`}
                    >
                      {is3D ? '3D WebGL' : '2D Canvas'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
