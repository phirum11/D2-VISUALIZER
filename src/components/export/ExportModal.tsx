import React from 'react'
import { Download } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useExportStore } from '@/stores/exportStore'
import { Modal } from '@/components/ui/Modal'
import { ExportPanel } from './ExportPanel'

export const ExportModal: React.FC = () => {
  const open = useUIStore(state => state.exportOpen)
  const setExportOpen = useUIStore(state => state.setExportOpen)
  const isExporting = useExportStore(state => state.isExporting)

  return (
    <Modal open={open} onClose={() => setExportOpen(false)} title="Export Video"
      subtitle="Resolution, encoding and output destination" icon={Download}
      className="max-w-4xl h-[660px]"
      footer={
        <div className="flex items-center justify-between gap-4">
          <span className="text-2xs text-d2-textSubtle">
            {isExporting ? 'Rendering continues if you close this window. Reopen Export to view progress.' : 'Preview performance settings do not affect export resolution.'}
          </span>
          <button type="button" onClick={() => setExportOpen(false)}
            className="shrink-0 px-4 py-1.5 rounded-md bg-d2-surfaceElevated border border-d2-border text-xs text-d2-text hover:bg-d2-surfaceActive transition-colors">
            Close
          </button>
        </div>
      }>
      <ExportPanel />
    </Modal>
  )
}
