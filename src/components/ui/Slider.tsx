import React from 'react'
import { RotateCcw } from 'lucide-react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  defaultValue?: number
  onChange: (value: number) => void
  onReset?: () => void
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  defaultValue,
  onChange,
  onReset,
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  )

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-2xs">
        <span className="text-d2-textMuted font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-d2-text font-semibold px-1 rounded bg-d2-surfaceElevated border border-d2-borderSubtle">
            {step < 1 ? value.toFixed(1) : value}
            {unit}
          </span>
          {onReset && defaultValue !== undefined && value !== defaultValue && (
            <button
              onClick={onReset}
              className="text-d2-textSubtle hover:text-d2-accent transition-colors"
              title="Reset to default"
              aria-label="Reset to default"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex items-center h-4 group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-d2-surfaceElevated rounded-lg appearance-none cursor-pointer accent-d2-accent focus:outline-none"
          style={{
            background: `linear-gradient(to right, #6366f1 ${percentage}%, #1c222d ${percentage}%)`,
          }}
        />
      </div>
    </div>
  )
}
