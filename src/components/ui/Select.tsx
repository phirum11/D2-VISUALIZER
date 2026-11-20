import React, { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  description?: string
}

interface SelectProps {
  label?: string
  ariaLabel?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
  compact?: boolean
  placeholder?: string
  icon?: React.ElementType
  align?: 'left' | 'right'
  disabled?: boolean
}

export const Select: React.FC<SelectProps> = ({
  label, ariaLabel, value, options, onChange, className = '', compact = false,
  placeholder = 'Select', icon: Icon, align = 'left', disabled = false,
}) => {
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const typeahead = useRef({ text: '', timestamp: 0 })
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200, maxHeight: 320 })
  const selectedIndex = options.findIndex(option => option.value === value)
  const selected = options[selectedIndex]

  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }
  const show = (index = Math.max(0, selectedIndex)) => {
    if (disabled || !options.length) return
    setFocused(index)
    setOpen(true)
  }
  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    close(true)
  }

  const placeMenu = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const margin = 8
    const gap = 6
    const width = Math.min(Math.max(rect.width, compact ? 220 : 200), window.innerWidth - margin * 2)
    const below = window.innerHeight - rect.bottom - gap - margin
    const above = rect.top - gap - margin
    const naturalHeight = menuRef.current?.scrollHeight || options.length * 48 + 8
    const upwards = below < Math.min(naturalHeight, 240) && above > below
    const maxHeight = Math.max(40, Math.min(320, upwards ? above : below))
    const height = Math.min(naturalHeight, maxHeight)
    const left = Math.max(margin, Math.min(align === 'right' ? rect.right - width : rect.left,
      window.innerWidth - width - margin))
    const top = upwards ? Math.max(margin, rect.top - gap - height) : rect.bottom + gap
    setPosition(previous => previous.top === top && previous.left === left && previous.width === width && previous.maxHeight === maxHeight
      ? previous : { top, left, width, maxHeight })
  }, [align, compact, options.length])

  useLayoutEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useLayoutEffect(() => {
    if (!open) return
    placeMenu()
    const dismiss = (event: Event) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false)
    }
    const observer = new ResizeObserver(placeMenu)
    if (triggerRef.current) observer.observe(triggerRef.current)
    if (menuRef.current) observer.observe(menuRef.current)
    document.addEventListener('pointerdown', dismiss, true)
    document.addEventListener('focusin', dismiss)
    window.addEventListener('resize', placeMenu)
    window.addEventListener('scroll', placeMenu, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', dismiss, true)
      document.removeEventListener('focusin', dismiss)
      window.removeEventListener('resize', placeMenu)
      window.removeEventListener('scroll', placeMenu, true)
    }
  }, [open, placeMenu])

  useLayoutEffect(() => {
    if (!open) return
    const option = optionRefs.current[focused]
    option?.focus({ preventScroll: true })
    option?.scrollIntoView({ block: 'nearest' })
  }, [open, focused])

  const handleKeys = (event: React.KeyboardEvent) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (event.key === 'Tab') {
      close(true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(focused)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setFocused(index => (index + delta + options.length) % options.length)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setFocused(event.key === 'Home' ? 0 : options.length - 1)
    } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const timestamp = Date.now()
      const text = (timestamp - typeahead.current.timestamp < 500 ? typeahead.current.text : '') + event.key.toLowerCase()
      typeahead.current = { text, timestamp }
      const index = options.findIndex(option => option.label.toLowerCase().startsWith(text))
      if (index >= 0) setFocused(index)
    }
  }

  return (
    <div className={`${label ? 'space-y-1.5' : ''} ${className}`}>
      {label && <label htmlFor={`${id}-trigger`} className="block text-2xs font-medium text-d2-textMuted">{label}</label>}
      <button ref={triggerRef} id={`${id}-trigger`} type="button" role="combobox"
        disabled={disabled}
        aria-label={ariaLabel || label || placeholder} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        onClick={() => open ? close() : show()}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            show(event.key === 'ArrowUp' && selectedIndex < 0 ? options.length - 1 : Math.max(0, selectedIndex))
          }
        }}
        className={`w-full flex items-center gap-2 rounded-md text-xs text-d2-text text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          compact ? 'h-8 px-2 hover:bg-d2-surfaceActive' : 'min-h-9 px-2.5 py-2 bg-d2-surfaceElevated border border-d2-border hover:bg-d2-surfaceActive'
        } ${open ? 'bg-d2-surfaceActive ring-1 ring-d2-accent/60' : ''}`}>
        {Icon && <Icon className="w-3.5 h-3.5 text-d2-textMuted shrink-0" />}
        <span className="flex-1 truncate">{selected?.label || placeholder}</span>
        <ChevronDown className={`w-3 h-3 text-d2-textSubtle shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <div ref={menuRef} id={`${id}-listbox`} role="listbox" aria-label={ariaLabel || label || placeholder}
          onKeyDown={handleKeys}
          className="fixed z-[200] overflow-y-auto rounded-lg border border-d2-border bg-d2-surfaceElevated p-1 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          style={position}>
          {options.map((option, index) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} tabIndex={-1}
              ref={node => { optionRefs.current[index] = node }}
              onFocus={() => setFocused(index)} onClick={() => choose(index)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 text-left rounded-md outline-none ${
                focused === index ? 'bg-d2-surfaceActive' : 'hover:bg-d2-surfaceActive'
              }`}>
              <span className="flex-1 min-w-0">
                <span className={`block text-xs ${option.value === value ? 'text-white font-medium' : 'text-d2-text'}`}>{option.label}</span>
                {option.description && <span className="block text-2xs mt-0.5 text-d2-textMuted">{option.description}</span>}
              </span>
              {option.value === value && <Check className="w-3.5 h-3.5 text-d2-accent shrink-0" />}
            </button>
          ))}
        </div>, document.body,
      )}
    </div>
  )
}
