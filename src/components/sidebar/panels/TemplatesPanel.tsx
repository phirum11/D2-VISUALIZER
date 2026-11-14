import React from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'

interface TemplateItem {
  id: string
  name: string
  category: string
  description: string
  visualizerType: string
  bgC1: string
  bgC2: string
  visPrimary: string
  visAccent: string
}

const templates: TemplateItem[] = [
  {
    id: 'minimal-black',
    name: 'Minimal Obsidian',
    category: 'Minimalist',
    description: 'Pitch black background with clean white monochrome waveform',
    visualizerType: 'classic-waveform',
    bgC1: '#000000',
    bgC2: '#0b0d11',
    visPrimary: '#ffffff',
    visAccent: '#9ca3af',
  },
  {
    id: 'neon-purple',
    name: 'Neon Cyberpunk',
    category: 'Electronic',
    description: 'Deep violet gradient with high-intensity neon purple spectrum',
    visualizerType: 'spectrum-bars',
    bgC1: '#3b0764',
    bgC2: '#0f172a',
    visPrimary: '#a855f7',
    visAccent: '#ec4899',
  },
  {
    id: 'blue-circular',
    name: 'Futuristic Radar',
    category: 'Sci-Fi',
    description: 'Electric cyan circular rings with dark navy atmosphere',
    visualizerType: 'circular-spectrum',
    bgC1: '#082f49',
    bgC2: '#020617',
    visPrimary: '#06b6d4',
    visAccent: '#3b82f6',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Horizon',
    category: 'Acoustic / Lo-Fi',
    description: 'Rich amber and sunset gradient with soft glowing bars',
    visualizerType: 'mirrored-spectrum',
    bgC1: '#451a03',
    bgC2: '#0f172a',
    visPrimary: '#f59e0b',
    visAccent: '#ef4444',
  },
  {
    id: 'dark-luxury',
    name: 'Dark Gold Luxury',
    category: 'Hip-Hop / Trap',
    description: 'Smoky charcoal with subtle gold accents and radial waveform',
    visualizerType: 'radial-waveform',
    bgC1: '#18181b',
    bgC2: '#09090b',
    visPrimary: '#eab308',
    visAccent: '#ca8a04',
  },
  {
    id: 'particle-universe',
    name: 'Particle Nebula',
    category: 'Ambient',
    description: 'Starfield background with dynamic audio-reactive particle cloud',
    visualizerType: 'particles',
    bgC1: '#020617',
    bgC2: '#172554',
    visPrimary: '#38bdf8',
    visAccent: '#818cf8',
  },
]

export const TemplatesPanel: React.FC = () => {
  const { updateVisualizer, updateBackground, visualizer } = useCompositionStore()

  const applyTemplate = (tpl: TemplateItem) => {
    updateVisualizer({
      type: tpl.visualizerType,
      primaryColor: tpl.visPrimary,
      accentColor: tpl.visAccent,
    })
    updateBackground({
      type: 'gradient',
      color1: tpl.bgC1,
      color2: tpl.bgC2,
    })
  }

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Visualizer Templates
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          One-click curated themes for YouTube & Social Media
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {templates.map((tpl) => {
          const isCurrent = visualizer.type === tpl.visualizerType

          return (
            <div
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className={`p-3 rounded-lg border transition-all cursor-pointer group relative overflow-hidden ${
                isCurrent
                  ? 'border-d2-accent bg-d2-surfaceElevated/80 shadow-md'
                  : 'border-d2-borderSubtle bg-d2-surfaceElevated/30 hover:border-d2-border hover:bg-d2-surfaceElevated/60'
              }`}
            >
              {/* Color swatch bar */}
              <div
                className="h-1.5 w-full rounded-full mb-2"
                style={{
                  background: `linear-gradient(90deg, ${tpl.visPrimary}, ${tpl.visAccent})`,
                }}
              />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-2xs">
                  {tpl.name}
                </span>
                {isCurrent && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-d2-accent" />
                )}
              </div>

              <p className="text-2xs text-d2-textSubtle mt-1 leading-relaxed">
                {tpl.description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-d2-borderSubtle text-2xs text-d2-textSubtle">
                <span className="font-mono">{tpl.category}</span>
                <span className="flex items-center gap-1 text-d2-accent font-medium">
                  <Sparkles className="w-2.5 h-2.5" />
                  Apply Theme
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
