import React from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-2xs font-medium text-d2-textMuted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-2xs font-mono text-d2-textSubtle uppercase">
          {value}
        </span>
        <div className="relative w-6 h-6 rounded border border-d2-border overflow-hidden cursor-pointer shadow-inner">
          <input
            type="color"
            value={value}
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
  )
}
