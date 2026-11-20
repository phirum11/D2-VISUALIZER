import React, { useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex="0"]'

export const Modal: React.FC<ModalProps> = ({
  open, onClose, title, subtitle, icon: Icon, children, footer, className = '',
}) => {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useLayoutEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const root = document.getElementById('root')
    const previousInert = root?.inert ?? false
    if (root) root.inert = true
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    const containFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (dialog?.contains(target)) return
      // Custom dropdowns are portalled siblings, but still belong to this dialog.
      const menu = target.closest('[role="listbox"]')
      if (menu && Array.from(dialog?.querySelectorAll('[aria-controls]') ?? [])
        .some(trigger => trigger.getAttribute('aria-controls') === menu.id)) return
      dialog?.querySelector<HTMLElement>(focusableSelector)?.focus({ preventScroll: true })
    }
    document.addEventListener('focusin', containFocus)
    return () => {
      document.removeEventListener('focusin', containFocus)
      if (root) root.inert = previousInert
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5"
      onMouseDown={event => { if (event.target === event.currentTarget) onCloseRef.current() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className={twMerge('modal-surface w-full max-w-3xl h-[560px] max-h-[calc(100dvh-40px)] min-h-0 flex flex-col overflow-hidden rounded-xl border border-d2-border bg-d2-surface shadow-2xl', className)}
        onKeyDown={event => {
          event.stopPropagation()
          if (event.key === 'Escape') {
            event.preventDefault()
            onCloseRef.current()
          } else if (event.key === 'Tab') {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector))
              .filter(control => !control.closest('[inert]') && control.getClientRects().length > 0)
            const first = controls[0]
            const last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first?.focus()
            }
          }
        }}>
        <div className="min-h-14 shrink-0 border-b border-d2-border px-5 py-3 flex items-center justify-between gap-3 bg-d2-surfaceElevated/40">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && <Icon className="w-4 h-4 text-d2-accent shrink-0" />}
            <div className="min-w-0">
              <h2 id={titleId} className="text-sm font-semibold text-d2-text">{title}</h2>
              {subtitle && <p className="mt-0.5 text-2xs text-d2-textSubtle">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-d2-textMuted hover:text-d2-text hover:bg-d2-surfaceActive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden flex flex-col">{children}</div>
        {footer && <div className="shrink-0 min-h-12 border-t border-d2-border px-5 py-3 bg-d2-surfaceElevated/40">{footer}</div>}
      </div>
    </div>, document.body,
  )
}
