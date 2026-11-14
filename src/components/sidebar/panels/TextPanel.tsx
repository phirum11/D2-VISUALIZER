import React from 'react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Select } from '@/components/ui/Select'

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern Sans)' },
  { value: 'Montserrat', label: 'Montserrat (Geometric)' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Technical)' },
  { value: 'Georgia', label: 'Georgia (Serif Classic)' },
  { value: 'Impact', label: 'Impact (Heavy EDM/Bass)' },
]

export const TextPanel: React.FC = () => {
  const { text, updateText } = useCompositionStore()

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Text & Branding
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          Song title, artist branding, and credit typography
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Fields */}
        <div className="space-y-2">
          <label className="block text-2xs font-semibold text-d2-text uppercase tracking-wider">
            Content
          </label>
          <div className="space-y-2">
            <div>
              <span className="text-2xs text-d2-textMuted">Track Title</span>
              <input
                type="text"
                value={text.songTitle}
                onChange={(e) => updateText({ songTitle: e.target.value })}
                className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-d2-accent mt-0.5"
              />
            </div>

            <div>
              <span className="text-2xs text-d2-textMuted">Artist Name</span>
              <input
                type="text"
                value={text.artistName}
                onChange={(e) => updateText({ artistName: e.target.value })}
                className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-d2-accent mt-0.5"
              />
            </div>

            <div>
              <span className="text-2xs text-d2-textMuted">Subtitle / Tagline</span>
              <input
                type="text"
                value={text.subtitle}
                onChange={(e) => updateText({ subtitle: e.target.value })}
                className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-d2-accent mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="pt-2 border-t border-d2-borderSubtle space-y-3">
          <label className="block text-2xs font-semibold text-d2-text uppercase tracking-wider">
            Typography Style
          </label>

          <Select
            label="Typeface"
            value={text.fontFamily}
            options={fontOptions}
            onChange={(f) => updateText({ fontFamily: f })}
          />

          <Slider
            label="Font Size"
            value={text.fontSize}
            min={16}
            max={72}
            step={2}
            unit="px"
            defaultValue={32}
            onChange={(s) => updateText({ fontSize: s })}
            onReset={() => updateText({ fontSize: 32 })}
          />

          {/* Alignment */}
          <div className="space-y-1">
            <span className="text-2xs text-d2-textMuted font-medium">Alignment</span>
            <div className="flex items-center gap-1 p-1 bg-d2-canvas border border-d2-border rounded">
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon =
                  align === 'left'
                    ? AlignLeft
                    : align === 'center'
                    ? AlignCenter
                    : AlignRight
                const isSelected = text.alignment === align
                return (
                  <button
                    key={align}
                    onClick={() => updateText({ alignment: align })}
                    className={`flex-1 py-1 rounded flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-d2-accent text-white'
                        : 'text-d2-textSubtle hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                )
              })}
            </div>
          </div>

          <ColorPicker
            label="Font Color"
            value={text.color}
            onChange={(c) => updateText({ color: c })}
          />
        </div>
      </div>
    </div>
  )
}
