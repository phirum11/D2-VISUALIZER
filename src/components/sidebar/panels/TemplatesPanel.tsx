import React from 'react'
import { Sparkles, LayoutGrid, ArrowRight } from 'lucide-react'
import { TEMPLATES } from '@/engine/templates/TemplateRegistry'
import { ProjectTemplate } from '@/engine/templates/types'
import { ProjectManager } from '@/engine/project/ProjectManager'
import { useProjectStore } from '@/stores/projectStore'

export const TemplatesPanel: React.FC = () => {
  const { setTemplateBrowserOpen } = useProjectStore()

  const handleApply = (tpl: ProjectTemplate) => {
    ProjectManager.createProjectFromTemplate(tpl)
  }

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-d2-border">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Starter Templates
          </h3>
          <p className="text-2xs text-d2-textMuted mt-0.5">
            10 professional pre-configured visualizer projects
          </p>
        </div>

        <button
          onClick={() => setTemplateBrowserOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-d2-accent/20 hover:bg-d2-accent text-d2-accent hover:text-white border border-d2-accent/30 text-2xs font-medium transition-colors"
          title="Browse all templates with detailed previews"
        >
          <LayoutGrid className="w-3 h-3" />
          <span>Browse All</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-2.5">
        {TEMPLATES.map((tpl) => {
          const visColor = tpl.composition.visualizer.primaryColor || '#06b6d4'
          const visType = tpl.composition.visualizer.type || 'visualizer'

          return (
            <div
              key={tpl.id}
              onClick={() => handleApply(tpl)}
              className="group p-3 rounded-xl bg-d2-surfaceElevated/60 hover:bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-d2-accent transition-colors">
                  {tpl.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xs font-mono font-bold px-1.5 py-0.2 rounded bg-black/60 text-d2-text border border-white/10 uppercase">
                    {tpl.aspectRatio}
                  </span>
                  <span className="text-3xs px-1.5 py-0.2 rounded bg-d2-surface text-d2-textSubtle border border-d2-border">
                    {tpl.category}
                  </span>
                </div>
              </div>

              <p className="text-2xs text-d2-textSubtle line-clamp-2 leading-relaxed">
                {tpl.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-d2-border/60 flex items-center justify-between text-3xs text-d2-textMuted font-mono">
                <span className="flex items-center gap-1.5 capitalize">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: visColor }}
                  />
                  {visType.replace('-', ' ')}
                </span>
                <span className="group-hover:text-d2-accent transition-colors flex items-center gap-1">
                  Apply Template <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
