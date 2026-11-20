import React, { useId, useState } from 'react'
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
  const contentId = useId()

  return (
    <div className="border-b border-d2-borderSubtle">
      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-d2-surfaceElevated/50 transition-colors select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex items-center gap-1.5 flex-1 text-left"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-d2-textSubtle transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-90 text-d2-textMuted' : ''
            }`}
          />
          <span className="text-xs font-medium text-d2-text">
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

      <div id={contentId} data-collapsible-content className="collapse-content" data-open={isOpen}
        aria-hidden={!isOpen} ref={node => { if (node) node.inert = !isOpen }}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-3 pb-3 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
