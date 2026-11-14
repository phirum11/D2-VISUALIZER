import React from 'react'
import { AlertTriangle, FileQuestion, FolderOpen } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useAudioStore } from '@/stores/audioStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { BackgroundManager } from '@/engine/background/BackgroundManager'

export const MissingMediaModal: React.FC = () => {
  const {
    isMissingMediaModalOpen,
    setMissingMediaModalOpen,
    missingAssets,
  } = useProjectStore()

  if (!isMissingMediaModalOpen || missingAssets.length === 0) return null

  const handleRelink = async (asset: any) => {
    if (typeof window === 'undefined' || !window.electronAPI) return

    if (asset.type === 'audio') {
      const res = await window.electronAPI.openAudioFileDialog()
      if (!res.canceled && res.filePath) {
        await useAudioStore.getState().importFromPath(res.filePath, res.fileName)
        asset.exists = true
      }
    } else if (asset.type === 'image' || asset.type === 'logo') {
      const res = await window.electronAPI.openImageFileDialog()
      if (!res.canceled && res.filePath) {
        const mediaUrl = window.electronAPI.getMediaUrl(res.filePath)
        if (asset.type === 'logo') {
          useCompositionStore.getState().updateOverlay('test-logo', { src: mediaUrl })
        } else {
          useCompositionStore.getState().updateBackground({ mediaPath: mediaUrl, mediaName: res.fileName })
          await BackgroundManager.getInstance().loadImage(mediaUrl)
        }
        asset.exists = true
      }
    } else if (asset.type === 'video') {
      const res = await window.electronAPI.openBackgroundFileDialog()
      if (!res.canceled && res.filePath) {
        const mediaUrl = window.electronAPI.getMediaUrl(res.filePath)
        useCompositionStore.getState().updateBackground({ mediaPath: mediaUrl, mediaName: res.fileName, mediaType: 'video' })
        await BackgroundManager.getInstance().loadVideo(mediaUrl)
        asset.exists = true
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-in fade-in-50">
      <div className="w-full max-w-xl flex flex-col rounded-2xl bg-d2-surface border border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-d2-border bg-amber-500/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Missing Media Assets</h2>
            <p className="text-xs text-amber-200/80">Some media files linked to this project could not be found on disk.</p>
          </div>
        </div>

        {/* Assets List */}
        <div className="p-6 space-y-3 max-h-72 overflow-y-auto">
          {missingAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 rounded-xl bg-d2-surfaceElevated border border-d2-border"
            >
              <div className="flex items-center gap-3">
                <FileQuestion className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{asset.fileName}</span>
                    <span className="text-3xs px-1.5 py-0.2 rounded bg-d2-surface border border-d2-border text-d2-textSubtle uppercase">
                      {asset.type}
                    </span>
                  </div>
                  <p className="text-3xs text-d2-textSubtle font-mono truncate max-w-xs mt-0.5">
                    {asset.originalPath}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRelink(asset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-d2-accent/20 hover:bg-d2-accent text-d2-accent hover:text-white border border-d2-accent/30 text-xs font-medium transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Locate File...
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-d2-border bg-d2-surfaceElevated/50">
          <button
            onClick={() => setMissingMediaModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-d2-accent hover:bg-d2-accent/90 text-xs font-bold text-white transition-colors"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  )
}
