import React, { useState, useEffect, useRef } from 'react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTempValue(step < 1 ? value.toFixed(2) : value.toString())
  }, [value, step])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleCommit = () => {
    setIsEditing(false)
    const num = parseFloat(tempValue)
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num))
      onChange(clamped)
    } else {
      setTempValue(value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempValue(value.toString())
    }
  }

  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  )

  const isChangedFromDefault =
    defaultValue !== undefined && Math.abs(value - defaultValue) > 0.001

  return (
    <div className="space-y-1.5 py-1.5">
      <div className="flex items-center justify-between text-2xs">
        <span className="text-d2-textMuted font-medium truncate max-w-[150px]">{label}</span>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <div className="flex items-center bg-d2-canvas border border-d2-accent rounded px-1 py-0.5">
              <input
                ref={inputRef}
                type="number"
                value={tempValue}
                step={step}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className="w-12 bg-transparent text-right font-mono text-3xs text-white focus:outline-none"
              />
              {unit && <span className="text-3xs text-d2-textSubtle ml-0.5">{unit}</span>}
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="font-mono text-3xs text-d2-text font-semibold px-1.5 py-0.5 rounded bg-d2-surfaceElevated border border-d2-borderSubtle hover:border-d2-accent/50 hover:bg-d2-surfaceActive transition-colors cursor-text"
              title="Click to type exact value"
            >
              {step < 1 ? value.toFixed(1) : value}
              {unit}
            </button>
          )}

          {onReset && isChangedFromDefault && (
            <button
              onClick={onReset}
              className="p-0.5 rounded hover:bg-d2-surfaceElevated text-d2-textSubtle hover:text-d2-accent transition-colors"
              title={`Reset to default (${defaultValue}${unit})`}
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
          aria-label={label}
          className="w-full h-1 bg-d2-surfaceElevated rounded appearance-none cursor-pointer accent-d2-accent"
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${percentage}%, var(--color-border) ${percentage}%)`,
          }}
        />
      </div>
    </div>
  )
}
