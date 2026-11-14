import React from 'react'
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Film,
  CheckCircle2,
} from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'

const gradientPresets = [
  { name: 'Cosmic Slate', c1: '#0f172a', c2: '#020617' },
  { name: 'Neon Purple', c1: '#3b0764', c2: '#0f172a' },
  { name: 'Midnight Cyan', c1: '#083344', c2: '#020617' },
  { name: 'Warm Ember', c1: '#431407', c2: '#0c0a09' },
  { name: 'Deep Emerald', c1: '#022c22', c2: '#020617' },
  { name: 'Obsidian Pure', c1: '#000000', c2: '#0b0d11' },
]

export const BackgroundsPanel: React.FC = () => {
  const { background, updateBackground } = useCompositionStore()

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Background Layer
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          Configure video backing and atmospheric mood
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Background Type Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-d2-canvas border border-d2-border">
          {[
            { id: 'gradient', label: 'Gradient', icon: Sparkles },
            { id: 'color', label: 'Color', icon: Palette },
            { id: 'image', label: 'Image', icon: ImageIcon },
            { id: 'video', label: 'Video', icon: Film },
          ].map((type) => {
            const Icon = type.icon
            const isSelected = background.type === type.id
            return (
              <button
                key={type.id}
                onClick={() =>
                  updateBackground({
                    type: type.id as 'color' | 'gradient' | 'image' | 'video',
                  })
                }
                className={`flex flex-col items-center gap-1 py-1.5 rounded text-2xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-d2-accent text-white shadow-sm'
                    : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>

        {/* Gradient Presets */}
        {background.type === 'gradient' && (
          <div className="space-y-2">
            <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider">
              Gradient Palettes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {gradientPresets.map((gp) => {
                const isSelected =
                  background.color1 === gp.c1 && background.color2 === gp.c2
                return (
                  <div
                    key={gp.name}
                    onClick={() =>
                      updateBackground({ color1: gp.c1, color2: gp.c2 })
                    }
                    className={`h-12 rounded border p-2 flex items-end justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-d2-accent ring-1 ring-d2-accent'
                        : 'border-d2-borderSubtle hover:border-d2-border'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${gp.c1}, ${gp.c2})`,
                    }}
                  >
                    <span className="text-2xs font-semibold text-white/90 drop-shadow">
                      {gp.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-2 space-y-1">
              <ColorPicker
                label="Primary Tone"
                value={background.color1}
                onChange={(c) => updateBackground({ color1: c })}
              />
              <ColorPicker
                label="Secondary Tone"
                value={background.color2}
                onChange={(c) => updateBackground({ color2: c })}
              />
            </div>
          </div>
        )}

        {/* Single Color */}
        {background.type === 'color' && (
          <div className="space-y-2">
            <ColorPicker
              label="Solid Background"
              value={background.color1}
              onChange={(c) => updateBackground({ color1: c })}
            />
          </div>
        )}

        {/* Image / Video Info */}
        {(background.type === 'image' || background.type === 'video') && (
          <div className="p-3 rounded-lg bg-d2-surfaceElevated border border-d2-border space-y-2">
            <div className="text-2xs font-semibold text-white">
              Active Media Layer
            </div>
            <div className="text-2xs text-d2-textMuted flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-d2-accent" />
              <span>Cosmic_Nebula_Background.png</span>
            </div>
          </div>
        )}

        {/* Atmospheric Controls */}
        <div className="pt-2 border-t border-d2-borderSubtle space-y-2">
          <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider">
            Atmospheric Adjustments
          </span>
          <Slider
            label="Background Blur"
            value={background.blur}
            min={0}
            max={20}
            step={1}
            unit="px"
            defaultValue={0}
            onChange={(v) => updateBackground({ blur: v })}
            onReset={() => updateBackground({ blur: 0 })}
          />
          <Slider
            label="Brightness"
            value={background.brightness}
            min={0.2}
            max={1.5}
            step={0.1}
            defaultValue={1}
            onChange={(v) => updateBackground({ brightness: v })}
            onReset={() => updateBackground({ brightness: 1 })}
          />
          <Slider
            label="Layer Opacity"
            value={Math.round(background.opacity * 100)}
            min={10}
            max={100}
            step={5}
            unit="%"
            defaultValue={100}
            onChange={(v) => updateBackground({ opacity: v / 100 })}
            onReset={() => updateBackground({ opacity: 1 })}
          />
        </div>
      </div>
    </div>
  )
}
