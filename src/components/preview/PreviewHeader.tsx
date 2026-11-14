import React from 'react'
import {
  Maximize2,
  Minimize2,
  Tv,
  Smartphone,
  Square,
  Shield,
  Eye,
} from 'lucide-react'
import {
  usePreviewStore,
  AspectRatio,
  PreviewQuality,
} from '@/stores/previewStore'
import { Tooltip } from '@/components/ui/Tooltip'

export const PreviewHeader: React.FC = () => {
  const {
    aspectRatio,
    setAspectRatio,
    zoom,
    setZoom,
    fitMode,
    setFitMode,
    showSafeGuides,
    toggleSafeGuides,
    previewQuality,
    setPreviewQuality,
  } = usePreviewStore()

  const aspectButtons: { id: AspectRatio; label: string; icon: React.ElementType }[] = [
    { id: '16:9', label: '16:9 Landscape', icon: Tv },
    { id: '9:16', label: '9:16 Portrait (Shorts)', icon: Smartphone },
    { id: '1:1', label: '1:1 Square', icon: Square },
  ]

  return (
    <div className="h-10 w-full bg-d2-surface border-b border-d2-border px-3 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Aspect Ratio Selector */}
      <div className="flex items-center gap-1">
        <span className="text-2xs font-semibold text-d2-textSubtle uppercase tracking-wider mr-1">
          Format
        </span>
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-d2-surfaceElevated border border-d2-border">
          {aspectButtons.map((btn) => {
            const Icon = btn.icon
            const isSelected = aspectRatio === btn.id
            return (
              <Tooltip key={btn.id} content={btn.label} side="bottom">
                <button
                  onClick={() => setAspectRatio(btn.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-2xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-d2-accent text-white shadow-sm'
                      : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceActive'
                  }`}
                  aria-label={btn.label}
                >
                  <Icon className="w-3 h-3" />
                  <span>{btn.id}</span>
                </button>
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Center: Viewport Zoom & Fit Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-d2-surfaceElevated border border-d2-border rounded px-2 py-0.5">
          <span className="text-2xs text-d2-textSubtle font-mono">Zoom:</span>
          <select
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="bg-transparent text-2xs text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="0" className="bg-d2-surface text-white">
              Fit View
            </option>
            <option value="0.25" className="bg-d2-surface text-white">
              25%
            </option>
            <option value="0.5" className="bg-d2-surface text-white">
              50%
            </option>
            <option value="0.75" className="bg-d2-surface text-white">
              75%
            </option>
            <option value="1.0" className="bg-d2-surface text-white">
              100% (1:1)
            </option>
            <option value="1.5" className="bg-d2-surface text-white">
              150%
            </option>
          </select>
        </div>

        <div className="flex items-center gap-0.5 bg-d2-surfaceElevated border border-d2-border rounded p-0.5">
          <Tooltip content="Fit to screen" side="bottom">
            <button
              onClick={() => setFitMode('fit')}
              className={`p-1 rounded text-2xs font-medium transition-colors ${
                fitMode === 'fit'
                  ? 'bg-d2-surfaceActive text-white'
                  : 'text-d2-textSubtle hover:text-white'
              }`}
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </Tooltip>

          <Tooltip content="Fill screen" side="bottom">
            <button
              onClick={() => setFitMode('fill')}
              className={`p-1 rounded text-2xs font-medium transition-colors ${
                fitMode === 'fill'
                  ? 'bg-d2-surfaceActive text-white'
                  : 'text-d2-textSubtle hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right: Guides & Quality */}
      <div className="flex items-center gap-2">
        <Tooltip content="Toggle Safe Margin Guides" side="bottom">
          <button
            onClick={toggleSafeGuides}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-2xs font-medium border transition-colors ${
              showSafeGuides
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400'
                : 'bg-d2-surfaceElevated border-d2-border text-d2-textSubtle hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Guides</span>
          </button>
        </Tooltip>

        <div className="flex items-center gap-1 bg-d2-surfaceElevated border border-d2-border rounded px-2 py-0.5">
          <Eye className="w-3 h-3 text-d2-textSubtle" />
          <select
            value={previewQuality}
            onChange={(e) =>
              setPreviewQuality(e.target.value as PreviewQuality)
            }
            className="bg-transparent text-2xs text-white font-medium focus:outline-none cursor-pointer capitalize"
          >
            <option value="performance" className="bg-d2-surface text-white">
              Performance (Fast)
            </option>
            <option value="balanced" className="bg-d2-surface text-white">
              Balanced (Standard)
            </option>
            <option value="quality" className="bg-d2-surface text-white">
              Quality (Full Res)
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}
