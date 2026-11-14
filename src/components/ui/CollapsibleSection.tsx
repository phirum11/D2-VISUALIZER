import React, { useState } from 'react'
import { ChevronRight, RotateCcw } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  onReset?: () => void
  children: React.ReactNode
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  onReset,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-d2-borderSubtle">
      <div className="flex items-center justify-between py-2 px-3 hover:bg-d2-surfaceElevated/50 transition-colors cursor-pointer select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 flex-1 text-left"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-d2-textSubtle transition-transform duration-150 ${
              isOpen ? 'rotate-90 text-d2-accent' : ''
            }`}
          />
          <span className="text-2xs font-semibold tracking-wider text-d2-text uppercase">
            {title}
          </span>
        </button>

        {onReset && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReset()
            }}
            className="text-d2-textSubtle hover:text-d2-text p-1 transition-colors"
            title={`Reset ${title}`}
            aria-label={`Reset ${title}`}
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {isOpen && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}
