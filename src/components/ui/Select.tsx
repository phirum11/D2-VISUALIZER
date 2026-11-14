import React from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-2xs font-medium text-d2-textMuted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded bg-d2-surfaceElevated border border-d2-border px-2.5 py-1.5 text-xs text-d2-text focus:border-d2-accent focus:outline-none cursor-pointer pr-8 hover:bg-d2-surfaceActive transition-colors"
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-d2-surface text-d2-text"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-d2-textSubtle" />
      </div>
    </div>
  )
}
