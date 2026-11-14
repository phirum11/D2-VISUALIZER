import React, { useState } from 'react'
import {
  Download,
  Film,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
} from 'lucide-react'
import { usePreviewStore, AspectRatio } from '@/stores/previewStore'

const exportPresets = [
  {
    id: '1080p',
    name: '1080p Full HD',
    res: '1920 × 1080',
    aspect: '16:9' as AspectRatio,
    platform: 'YouTube & Desktop',
  },
  {
    id: 'shorts',
    name: '9:16 Vertical Story',
    res: '1080 × 1920',
    aspect: '9:16' as AspectRatio,
    platform: 'TikTok, Shorts, Reels',
  },
  {
    id: 'square',
    name: '1:1 Square Post',
    res: '1080 × 1080',
    aspect: '1:1' as AspectRatio,
    platform: 'Instagram Feed',
  },
  {
    id: '4k',
    name: '4K Ultra HD',
    res: '3840 × 2160',
    aspect: '16:9' as AspectRatio,
    platform: 'Ultra High Definition',
  },
]

export const ExportPanel: React.FC = () => {
  const { setAspectRatio } = usePreviewStore()
  const [selectedPreset, setSelectedPreset] = useState('1080p')
  const [fps, setFps] = useState('60')
  const [bitrate, setBitrate] = useState('16M')
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSelectPreset = (id: string, aspect: AspectRatio) => {
    setSelectedPreset(id)
    setAspectRatio(aspect)
  }

  const handleSimulateExport = () => {
    setIsExporting(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsExporting(false), 800)
          return 100
        }
        return p + 10
      })
    }, 200)
  }

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Video Export Engine
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          Deterministic offline rendering via FFmpeg
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Preset Resolution Selection */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider">
            Format Presets
          </span>
          <div className="space-y-1.5">
            {exportPresets.map((preset) => {
              const isSelected = selectedPreset === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id, preset.aspect)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-d2-accent/15 border-d2-accent shadow-sm'
                      : 'bg-d2-surfaceElevated/40 border-d2-borderSubtle hover:border-d2-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center ${
                        isSelected
                          ? 'bg-d2-accent text-white'
                          : 'bg-d2-surface border border-d2-border text-d2-textSubtle'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-2xs">
                        {preset.name}
                      </div>
                      <div className="text-2xs text-d2-textSubtle font-mono">
                        {preset.res} • {preset.platform}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-d2-accent" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Video Encoding Settings */}
        <div className="space-y-3 pt-2 border-t border-d2-borderSubtle">
          <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider">
            Encoding Parameters
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-2xs text-d2-textMuted font-medium">
                Frame Rate
              </span>
              <select
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                className="w-full mt-1 bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-d2-accent"
              >
                <option value="24">24 FPS (Cinematic)</option>
                <option value="30">30 FPS (Standard)</option>
                <option value="60">60 FPS (Ultra Smooth)</option>
              </select>
            </div>

            <div>
              <span className="text-2xs text-d2-textMuted font-medium">
                Target Bitrate
              </span>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="w-full mt-1 bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-d2-accent"
              >
                <option value="10M">10 Mbps (Fast)</option>
                <option value="16M">16 Mbps (High Quality)</option>
                <option value="30M">30 Mbps (Mastering)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-borderSubtle space-y-1.5 text-2xs text-d2-textMuted">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-d2-accent" />
                Duration
              </span>
              <span className="font-mono text-white">03:18 (198s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-d2-accent" />
                Est. File Size
              </span>
              <span className="font-mono text-white">~380 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-d2-accent" />
                Encoder
              </span>
              <span className="font-mono text-white">FFmpeg libx264 / AAC</span>
            </div>
          </div>
        </div>

        {/* Export Progress or Trigger Button */}
        <div className="pt-2">
          {isExporting ? (
            <div className="space-y-2 p-3 bg-d2-surfaceElevated rounded-lg border border-d2-border">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-white font-medium">
                  {progress < 100
                    ? `Rendering Frame ${Math.round((progress / 100) * 11880)} / 11880...`
                    : 'Export Complete!'}
                </span>
                <span className="font-mono text-d2-accent font-bold">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-d2-canvas rounded-full overflow-hidden border border-d2-borderSubtle">
                <div
                  className="h-full bg-d2-accent transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleSimulateExport}
              className="w-full py-2.5 px-4 rounded-lg bg-d2-accent hover:bg-d2-accentHover text-white font-bold text-xs shadow-lg shadow-d2-accent/20 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Start Video Export</span>
            </button>
          )}

          <p className="text-2xs text-d2-textSubtle text-center mt-2 leading-relaxed">
            Phase 7 connects native FFmpeg child piping for production video creation.
          </p>
        </div>
      </div>
    </div>
  )
}
