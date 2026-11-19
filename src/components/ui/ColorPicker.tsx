import React from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

const QUICK_SWATCHES = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#ffffff', // White
]

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-medium text-d2-textMuted">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 px-1.5 py-0.5 rounded bg-d2-canvas border border-d2-borderSubtle text-3xs font-mono text-white uppercase text-center focus:outline-none focus:border-d2-accent"
          />
          <div className="relative w-6 h-6 rounded border border-d2-border overflow-hidden cursor-pointer shadow-inner shrink-0 hover:scale-105 transition-transform">
            <input
              type="color"
              value={value.startsWith('#') ? value : '#6366f1'}
              onChange={(e) => onChange(e.target.value)}
              className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
            />
            <div
              className="w-full h-full rounded"
              style={{ backgroundColor: value }}
            />
          </div>
        </div>
      </div>

      {/* Quick Swatches Palette */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {QUICK_SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            className={`w-3.5 h-3.5 rounded-full border transition-all ${
              value.toLowerCase() === hex.toLowerCase()
                ? 'scale-125 border-white shadow-xs'
                : 'border-white/20 hover:scale-110 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>
    </div>
  )
}
