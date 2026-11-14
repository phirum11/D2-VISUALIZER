import React from 'react'
import {
  BarChart2,
  Disc,
  Radio,
  Activity,
  Layers,
  Sparkles,
  Grid,
  Globe2,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'

interface VisualizerPreset {
  id: string
  name: string
  category: '2D Spectrum' | 'Circular' | 'Waveform' | '3D / FX'
  icon: React.ElementType
  description: string
}

const presets: VisualizerPreset[] = [
  {
    id: 'spectrum-bars',
    name: 'Spectrum Bars',
    category: '2D Spectrum',
    icon: BarChart2,
    description: 'Classic vertical frequency bars with gradient fill',
  },
  {
    id: 'circular-spectrum',
    name: 'Circular Spectrum',
    category: 'Circular',
    icon: Disc,
    description: 'Radial bars projecting outward around central art',
  },
  {
    id: 'radial-waveform',
    name: 'Radial Waveform',
    category: 'Circular',
    icon: Radio,
    description: 'Continuous circular vector waveform oscilloscope',
  },
  {
    id: 'classic-waveform',
    name: 'Classic Waveform',
    category: 'Waveform',
    icon: Activity,
    description: 'Horizontal linear audio oscillograph line',
  },
  {
    id: 'mirrored-spectrum',
    name: 'Mirrored Spectrum',
    category: '2D Spectrum',
    icon: Layers,
    description: 'Symmetrical vertical bars mirrored across the center',
  },
  {
    id: 'dual-rings',
    name: 'Dual Circular Rings',
    category: 'Circular',
    icon: Disc,
    description: 'Twin reactive circular rings for bass & treble separation',
  },
  {
    id: 'particles',
    name: 'Particle Visualizer',
    category: '3D / FX',
    icon: Sparkles,
    description: 'Dynamic physics particle cloud driven by audio transients',
  },
  {
    id: 'equalizer-grid',
    name: 'Equalizer Grid',
    category: '2D Spectrum',
    icon: Grid,
    description: 'LED dot-matrix studio equalizer grid',
  },
  {
    id: '3d-sphere',
    name: '3D Audio Sphere',
    category: '3D / FX',
    icon: Globe2,
    description: 'Three.js wireframe sphere deforming to audio frequencies',
  },
  {
    id: 'minimal-pulse',
    name: 'Minimal Audio Pulse',
    category: 'Waveform',
    icon: Zap,
    description: 'Understated pulsing neon ring for subtle visualizers',
  },
]

export const VisualizersPanel: React.FC = () => {
  const { visualizer, updateVisualizer } = useCompositionStore()

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
            Visualizer Library
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            {presets.length} Audio-Reactive Styles
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {presets.map((preset) => {
          const Icon = preset.icon
          const isSelected = visualizer.type === preset.id

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
                <span className="inline-block mt-1 text-2xs px-1.5 py-0.2 rounded bg-d2-canvas/60 text-d2-textSubtle border border-d2-borderSubtle font-mono">
                  {preset.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
