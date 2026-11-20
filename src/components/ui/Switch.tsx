import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
    onClick={() => onChange(!checked)}
    onKeyDown={event => event.stopPropagation()}
    className="inline-flex shrink-0 items-center gap-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed group">
    <span className={`relative h-[22px] w-10 rounded-full border transition-colors duration-200 motion-reduce:transition-none ${
      checked ? 'bg-d2-accent border-d2-accent group-hover:bg-d2-accentHover'
        : 'bg-d2-surfaceActive border-d2-textSubtle group-hover:border-d2-textMuted'
    }`}>
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none ${
        checked ? 'translate-x-[18px] bg-d2-canvas' : 'translate-x-0 bg-d2-textMuted'
      }`} />
    </span>
    <span aria-hidden="true" className={`w-6 text-left text-2xs font-medium ${checked ? 'text-d2-accent' : 'text-d2-textSubtle'}`}>
      {checked ? 'On' : 'Off'}
    </span>
  </button>
)
