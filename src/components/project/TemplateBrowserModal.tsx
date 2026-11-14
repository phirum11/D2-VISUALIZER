import React, { useState } from 'react'
import { X, Sparkles, Check, ArrowRight } from 'lucide-react'
import { TEMPLATES } from '@/engine/templates/TemplateRegistry'
import { ProjectTemplate, TemplateCategory } from '@/engine/templates/types'
import { ProjectManager } from '@/engine/project/ProjectManager'
import { useProjectStore } from '@/stores/projectStore'

export const TemplateBrowserModal: React.FC = () => {
  const { isTemplateBrowserOpen, setTemplateBrowserOpen } = useProjectStore()
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All')
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(TEMPLATES[0])

  if (!isTemplateBrowserOpen) return null

  const categories: TemplateCategory[] = [
    'All',
    'House & Club',
    'Chill & Ambient',
    'Bass & Phonk',
    'Podcast & Studio',
    'Social Media',
  ]

  const filteredTemplates = TEMPLATES.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  )

  const handleApply = (tpl: ProjectTemplate) => {
    ProjectManager.createProjectFromTemplate(tpl)
    setTemplateBrowserOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-in fade-in-50">
      <div className="w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-d2-surface border border-d2-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-d2-border bg-d2-surfaceElevated/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Starter Template Library</h2>
              <p className="text-xs text-d2-textMuted">
                Instant professional visualizer projects with pre-configured timeline and typography
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplateBrowserOpen(false)}
            className="p-1.5 rounded-lg hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-d2-border bg-d2-surface flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-d2-accent text-white shadow-sm'
                  : 'bg-d2-surfaceElevated text-d2-textMuted hover:text-white border border-d2-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body: Grid + Preview Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4 custom-scrollbar">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id
              const visType = tpl.composition.visualizer.type || 'visualizer'
              const visColor = tpl.composition.visualizer.primaryColor || '#06b6d4'

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`group relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-d2-accent/15 border-d2-accent shadow-md'
                      : 'bg-d2-surfaceElevated/40 border-d2-border hover:border-d2-borderHover'
                  }`}
                >
                  {/* Aspect Ratio Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-d2-text border border-white/10 uppercase">
                        {tpl.aspectRatio}
                      </span>
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-d2-surfaceElevated text-d2-textMuted border border-d2-border">
                        {tpl.category}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-d2-accent flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-d2-accent transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-2xs text-d2-textSubtle mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Visualizer Style Preview Pill */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-d2-border/60 text-3xs text-d2-textMuted font-mono">
                    <span className="flex items-center gap-1.5 capitalize">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: visColor }}
                      />
                      {visType.replace('-', ' ')}
                    </span>
                    <span>
                      {tpl.canvas.width}×{tpl.canvas.height}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Detailed Template Inspector */}
          {selectedTemplate && (
            <div className="w-80 border-l border-d2-border bg-d2-surfaceElevated/30 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xs font-mono px-2 py-0.5 rounded bg-d2-accent/20 text-d2-accent border border-d2-accent/30 uppercase font-bold">
                    {selectedTemplate.aspectRatio} Format
                  </span>
                  <span className="text-2xs text-d2-textSubtle font-mono">
                    {selectedTemplate.canvas.width} × {selectedTemplate.canvas.height}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{selectedTemplate.name}</h3>
                <p className="text-xs text-d2-textMuted leading-relaxed mb-4">
                  {selectedTemplate.description}
                </p>

                {/* Specs Box */}
                <div className="space-y-2.5 bg-black/40 border border-d2-border p-3.5 rounded-xl text-xs">
                  <div className="flex justify-between">
                    <span className="text-d2-textSubtle">Visualizer:</span>
                    <span className="font-mono text-white capitalize">
                      {selectedTemplate.composition.visualizer.type?.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-d2-textSubtle">Frame Rate:</span>
                    <span className="font-mono text-white">{selectedTemplate.canvas.fps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-d2-textSubtle">Particles:</span>
                    <span className="font-mono text-white capitalize">
                      {selectedTemplate.composition.ambientParticles.preset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-d2-textSubtle">Export Bitrate:</span>
                    <span className="font-mono text-white">{selectedTemplate.export.bitrate}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selectedTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-3xs px-2 py-0.5 rounded bg-d2-surface border border-d2-border text-d2-textSubtle font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-d2-border mt-4">
                <button
                  onClick={() => handleApply(selectedTemplate)}
                  className="w-full py-2.5 rounded-xl bg-d2-accent hover:bg-d2-accent/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-d2-accent/25 transition-all"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
