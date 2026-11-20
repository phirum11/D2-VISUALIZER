import React from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Maximize, Shield, Tv, Scan, Gauge } from 'lucide-react'
import { usePreviewStore, AspectRatio, PreviewQuality } from '@/stores/previewStore'
import { Select } from '@/components/ui/Select'

const formats = [
  { value: '16:9', label: '16:9', description: 'Landscape · YouTube and desktop' },
  { value: '9:16', label: '9:16', description: 'Portrait · Shorts and Reels' },
  { value: '1:1', label: '1:1', description: 'Square · Social posts' },
  { value: '4:5', label: '4:5', description: 'Portrait · Social feeds' },
  { value: '21:9', label: '21:9', description: 'Ultrawide · Cinematic' },
]
const zoomLevels = [
  { value: '0', label: 'Fit view', description: 'Show the entire composition' },
  { value: '0.25', label: '25%' }, { value: '0.5', label: '50%' },
  { value: '0.75', label: '75%' }, { value: '1', label: '100%', description: 'Actual pixel size' },
  { value: '1.5', label: '150%' }, { value: '2', label: '200%' },
]
const qualities = [
  { value: 'performance', label: 'Performance', description: '30 FPS · Reduced preview resolution' },
  { value: 'balanced', label: 'Balanced', description: '60 FPS · Viewport-sized preview' },
  { value: 'quality', label: 'Quality', description: '60 FPS · Full-resolution preview' },
]

export const PreviewHeader: React.FC = () => {
  const {
    aspectRatio, setAspectRatio, zoom, setZoom, fitMode, setFitMode,
    showSafeGuides, toggleSafeGuides, previewQuality, setPreviewQuality,
    isFullscreenPreview, toggleFullscreenPreview,
  } = usePreviewStore(useShallow(s => ({
    aspectRatio: s.aspectRatio, setAspectRatio: s.setAspectRatio, zoom: s.zoom, setZoom: s.setZoom,
    fitMode: s.fitMode, setFitMode: s.setFitMode, showSafeGuides: s.showSafeGuides, toggleSafeGuides: s.toggleSafeGuides,
    previewQuality: s.previewQuality, setPreviewQuality: s.setPreviewQuality,
    isFullscreenPreview: s.isFullscreenPreview, toggleFullscreenPreview: s.toggleFullscreenPreview,
  })))

  return (
    <div data-preview-toolbar className="min-h-12 bg-d2-surface border-b border-d2-border px-3 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 shrink-0 select-none">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-d2-textMuted mr-2">Preview</span>
        <Select ariaLabel="Composition format" value={aspectRatio} options={formats}
          onChange={value => setAspectRatio(value as AspectRatio)} compact icon={Tv} className="w-[90px]" />
        <span className="h-4 w-px bg-d2-border mx-1" />
        <Select ariaLabel="Preview zoom" value={String(zoom)} options={zoomLevels}
          onChange={value => { setZoom(Number(value)); setFitMode('fit') }} compact className="w-[90px]" />
        <button type="button" title={fitMode === 'fit' ? 'Fill viewport' : 'Fit composition'}
          aria-label="Fill viewport" aria-pressed={fitMode === 'fill'}
          onClick={() => { setZoom(0); setFitMode(fitMode === 'fit' ? 'fill' : 'fit') }}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${fitMode === 'fill'
            ? 'bg-d2-surfaceActive text-white' : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceActive'}`}>
          <Scan className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" title="Safe margin guides" aria-label="Safe margin guides" aria-pressed={showSafeGuides}
          onClick={toggleSafeGuides}
          className={`h-8 flex items-center gap-1.5 px-2 rounded-md text-2xs transition-colors ${showSafeGuides
            ? 'bg-d2-surfaceActive text-white' : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceActive'}`}>
          <Shield className="w-3.5 h-3.5" /><span>Guides</span>
        </button>
        <Select ariaLabel="Preview quality" value={previewQuality} options={qualities}
          onChange={value => setPreviewQuality(value as PreviewQuality)} compact icon={Gauge} align="right" className="w-[132px]" />
        <button type="button" title={isFullscreenPreview ? 'Exit fullscreen (Esc)' : 'Fullscreen preview (Ctrl+F)'}
          aria-label="Fullscreen Preview" aria-pressed={isFullscreenPreview} onClick={toggleFullscreenPreview}
          className="w-8 h-8 rounded-md text-d2-textMuted hover:text-white hover:bg-d2-surfaceActive flex items-center justify-center transition-colors">
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
