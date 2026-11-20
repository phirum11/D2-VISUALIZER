import React from 'react'
import {
  Download,
  Film,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  FolderOpen,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import {
  useExportStore,
  RESOLUTION_PRESETS,
  QualityPresetId,
} from '@/stores/exportStore'
import { useAudioStore } from '@/stores/audioStore'
import { usePreviewStore } from '@/stores/previewStore'
import { Select } from '@/components/ui/Select'

export const ExportPanel: React.FC = () => {
  const {
    selectedPresetId,
    fps,
    videoCodec,
    quality,
    audioBitrate,
    outputFolder,
    fileName,
    hasNvenc,
    isExporting,
    exportStage,
    progress,
    currentFrame,
    totalFrames,
    renderingFps,
    elapsedSeconds,
    remainingSeconds,
    lastExportedPath,
    errorMessage,
    setPreset,
    setFps,
    setQuality,
    setVideoCodec,
    setAudioBitrate,
    setFileName,
    selectOutputFolder,
    startExport,
    cancelExport,
    openExportFolder,
    resetStatus,
  } = useExportStore()

  const currentTrack = useAudioStore((s) => s.currentTrack)
  const previewDuration = usePreviewStore((s) => s.duration)
  const duration = currentTrack?.duration || previewDuration || 10

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="flex flex-col h-full min-h-0 select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <span className="text-2xs text-d2-textMuted">Offline rendering via FFmpeg · H.264 / MP4</span>
        </div>
        {hasNvenc && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-3xs font-medium inline-flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            NVENC GPU Active
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        {/* Render Progress Modal / Card if Exporting */}
        {isExporting || exportStage === 'completed' || exportStage === 'error' ? (
          <div className="p-4 rounded-xl bg-d2-surfaceElevated border border-d2-border shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs flex items-center gap-2">
                {exportStage === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : exportStage === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
                {exportStage === 'analyzing-audio' && 'Pre-Analyzing Audio Spectrum...'}
                {exportStage === 'rendering' && 'Rendering & Streaming to FFmpeg...'}
                {exportStage === 'finalizing' && 'Muxing Audio & Finalizing MP4...'}
                {exportStage === 'completed' && 'Export Completed Successfully!'}
                {exportStage === 'error' && 'Export Failed'}
                {exportStage === 'cancelled' && 'Export Cancelled'}
              </span>
              <span className="font-mono text-cyan-400 font-bold text-xs">
                {Math.round(progress * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-d2-canvas overflow-hidden border border-d2-borderSubtle">
              <div
                className={`h-full transition-all duration-200 ${
                  exportStage === 'completed'
                    ? 'bg-emerald-500'
                    : exportStage === 'error'
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                }`}
                style={{ width: `${Math.max(2, Math.min(100, progress * 100))}%` }}
              />
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 gap-2 text-2xs bg-d2-canvas/60 p-2.5 rounded-lg border border-d2-borderSubtle font-mono">
              <div>
                <span className="text-d2-textSubtle block">Rendered Frames:</span>
                <span className="text-white font-semibold">
                  {currentFrame} / {totalFrames}
                </span>
              </div>
              <div>
                <span className="text-d2-textSubtle block">Encoding Speed:</span>
                <span className="text-cyan-400 font-semibold">{renderingFps} FPS</span>
              </div>
              <div>
                <span className="text-d2-textSubtle block">Time Elapsed:</span>
                <span className="text-white">{formatSeconds(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-d2-textSubtle block">Est. Remaining:</span>
                <span className="text-white">
                  {exportStage === 'completed' ? '0:00' : formatSeconds(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Error Message if failed */}
            {errorMessage && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-2xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {isExporting ? (
                <button
                  onClick={cancelExport}
                  className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-2xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Export
                </button>
              ) : exportStage === 'completed' ? (
                <>
                  <button
                    onClick={openExportFolder}
                    className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-2xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Open in Folder
                  </button>
                  <button
                    onClick={resetStatus}
                    className="px-3 py-1.5 rounded bg-d2-surfaceActive hover:bg-d2-surface border border-d2-border text-d2-text text-2xs font-medium transition-colors"
                  >
                    New Export
                  </button>
                </>
              ) : (
                <button
                  onClick={resetStatus}
                  className="px-3 py-1.5 rounded bg-d2-surfaceActive hover:bg-d2-surface border border-d2-border text-d2-text text-2xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Format / Resolution Presets */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider flex items-center justify-between">
            <span>Resolution & Format</span>
            <span className="text-d2-textSubtle font-normal">H.264 / MP4</span>
          </span>
          <div className="space-y-1.5">
            {RESOLUTION_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id
              return (
                 <button type="button"
                   key={preset.id}
                   onClick={() => setPreset(preset.id)}
                   aria-pressed={isSelected}
                   disabled={isExporting}
                   className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-d2-accent/15 border-d2-accent shadow-sm'
                      : 'bg-d2-surfaceElevated/40 border-d2-borderSubtle hover:border-d2-border'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-white block text-xs">
                      {preset.name}
                    </span>
                     <span className="text-3xs text-d2-textSubtle block truncate">
                       {preset.description}
                     </span>
                  </div>
                   <span className="text-2xs font-mono text-cyan-400 font-medium shrink-0">
                     {preset.width}×{preset.height}
                   </span>
                 </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
        {/* Frame Rate & Codec Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Select label="Frame Rate" value={String(fps)} disabled={isExporting}
              onChange={value => setFps(parseInt(value, 10))}
              options={[
                { value: '24', label: '24 FPS', description: 'Cinema' },
                { value: '30', label: '30 FPS', description: 'Standard' },
                { value: '50', label: '50 FPS', description: 'PAL' },
                { value: '60', label: '60 FPS', description: 'Smooth motion' },
              ]} />
          </div>

          <div className="space-y-1.5">
            <Select label="Video Encoder" disabled={isExporting}
              value={videoCodec}
              onChange={value => setVideoCodec(value as 'auto' | 'h264_nvenc' | 'libx264')}
              options={[
                { value: 'auto', label: 'Auto', description: hasNvenc ? 'NVENC GPU' : 'CPU libx264' },
                ...(hasNvenc ? [{ value: 'h264_nvenc', label: 'NVIDIA NVENC', description: 'GPU encoding' }] : []),
                { value: 'libx264', label: 'x264 Software', description: 'CPU encoding' },
              ]} />
          </div>
        </div>

        {/* Quality Preset & Audio Bitrate Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Select label="Video Quality" disabled={isExporting}
              value={quality}
              onChange={value => setQuality(value as QualityPresetId)}
              options={[
                { value: 'draft', label: 'Draft', description: '6 Mbps' },
                { value: 'balanced', label: 'Balanced', description: '10 Mbps' },
                { value: 'high', label: 'High Quality', description: '18 Mbps' },
                { value: 'pro', label: 'Pro Master', description: '32 Mbps' },
              ]} />
          </div>

          <div className="space-y-1.5">
            <Select label="Audio Bitrate" disabled={isExporting}
              value={audioBitrate}
              onChange={setAudioBitrate}
              options={[
                { value: '128k', label: '128 kbps AAC' },
                { value: '192k', label: '192 kbps AAC', description: 'Standard' },
                { value: '256k', label: '256 kbps AAC', description: 'High quality' },
                { value: '320k', label: '320 kbps AAC', description: 'Studio' },
              ]} />
          </div>
        </div>

        {/* Output Destination Settings */}
        <div className="space-y-2 pt-1 border-t border-d2-borderSubtle">
          <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider block">
            Destination & Filename
          </span>

          {/* Output Folder Picker */}
          <div className="space-y-1">
            <span className="text-3xs text-d2-textSubtle">Export Directory</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                readOnly
                aria-label="Export Directory"
                value={outputFolder || '(Default application folder)'}
                placeholder="Select output folder..."
                className="flex-1 bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-d2-text font-mono truncate"
              />
              <button
                 onClick={selectOutputFolder}
                 disabled={isExporting}
                className="px-2.5 py-1 rounded bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-d2-text hover:text-white transition-colors shrink-0 text-2xs inline-flex items-center gap-1"
                title="Browse folder"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Browse
              </button>
            </div>
          </div>

          {/* Filename Input */}
          <div className="space-y-1">
            <span className="text-3xs text-d2-textSubtle">File Name (.mp4)</span>
            <input
              type="text"
               value={fileName}
               disabled={isExporting}
               aria-label="Export File Name"
              onChange={(e) => setFileName(e.target.value)}
              placeholder="D2_Visualizer_Export.mp4"
              className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-white font-mono focus:outline-none focus:border-d2-accent"
            />
          </div>
        </div>

        {/* Project Summary Card */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-borderSubtle space-y-1.5 text-2xs text-d2-textMuted">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" /> Total Duration:
            </span>
            <span className="text-white font-mono">{formatSeconds(duration)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Film className="w-3 h-3 text-indigo-400" /> Total Frames:
            </span>
            <span className="text-white font-mono">{Math.ceil(duration * fps)} frames</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-emerald-400" /> Audio Track:
            </span>
            <span className="text-white truncate max-w-[140px]">
              {currentTrack?.name || 'Built-in Demo Signal'}
            </span>
          </div>
         </div>

        </div>
        </div>

        {lastExportedPath && !isExporting && exportStage === 'idle' && (
          <div className="p-2 rounded bg-d2-surfaceElevated border border-d2-border text-center">
            <span className="text-3xs text-d2-textSubtle block truncate">Last export: {lastExportedPath}</span>
          </div>
        )}
      </div>

         {/* Main Export Action Button */}
        <div className="shrink-0 px-5 py-3 border-t border-d2-borderSubtle">
        <button
          onClick={startExport}
          disabled={isExporting}
           className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
            isExporting
              ? 'bg-d2-surfaceActive text-d2-textSubtle cursor-not-allowed border border-d2-border'
               : 'bg-d2-accent hover:bg-d2-accentHover text-d2-canvas'
          }`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rendering Video...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
               Export Video
            </>
          )}
        </button>

        </div>
    </div>
  )
}
