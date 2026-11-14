import React, { useEffect } from 'react'
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
    detectEncoders,
    selectOutputFolder,
    startExport,
    cancelExport,
    openExportFolder,
    resetStatus,
  } = useExportStore()

  const currentTrack = useAudioStore((s) => s.currentTrack)
  const duration = currentTrack?.duration || usePreviewStore((s) => s.duration) || 10

  useEffect(() => {
    detectEncoders()
  }, [detectEncoders])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
            Video Export Engine
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            Deterministic offline rendering via FFmpeg
          </span>
        </div>
        {hasNvenc && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-3xs font-medium inline-flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            NVENC GPU Active
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
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
                <div
                  key={preset.id}
                  onClick={() => setPreset(preset.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
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
                </div>
              )
            })}
          </div>
        </div>

        {/* Frame Rate & Codec Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <span className="text-2xs font-medium text-d2-textSubtle">Frame Rate</span>
            <select
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full bg-d2-surfaceElevated border border-d2-border rounded px-2.5 py-1.5 text-2xs text-white focus:outline-none focus:border-d2-accent font-mono"
            >
              <option value="24">24 FPS (Cinema)</option>
              <option value="30">30 FPS (Standard)</option>
              <option value="50">50 FPS (PAL)</option>
              <option value="60">60 FPS (Smooth 60p)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-2xs font-medium text-d2-textSubtle">Video Encoder</span>
            <select
              value={videoCodec}
              onChange={(e) => setVideoCodec(e.target.value as 'auto' | 'h264_nvenc' | 'libx264')}
              className="w-full bg-d2-surfaceElevated border border-d2-border rounded px-2.5 py-1.5 text-2xs text-white focus:outline-none focus:border-d2-accent"
            >
              <option value="auto">
                Auto {hasNvenc ? '(NVENC GPU)' : '(CPU libx264)'}
              </option>
              {hasNvenc && <option value="h264_nvenc">NVIDIA NVENC (GPU)</option>}
              <option value="libx264">x264 Software (CPU)</option>
            </select>
          </div>
        </div>

        {/* Quality Preset & Audio Bitrate Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <span className="text-2xs font-medium text-d2-textSubtle">Video Quality</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityPresetId)}
              className="w-full bg-d2-surfaceElevated border border-d2-border rounded px-2.5 py-1.5 text-2xs text-white focus:outline-none focus:border-d2-accent"
            >
              <option value="draft">Draft (6 Mbps)</option>
              <option value="balanced">Balanced (10 Mbps)</option>
              <option value="high">High Quality (18 Mbps)</option>
              <option value="pro">Pro Master (32 Mbps)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-2xs font-medium text-d2-textSubtle">Audio Bitrate</span>
            <select
              value={audioBitrate}
              onChange={(e) => setAudioBitrate(e.target.value)}
              className="w-full bg-d2-surfaceElevated border border-d2-border rounded px-2.5 py-1.5 text-2xs text-white focus:outline-none focus:border-d2-accent font-mono"
            >
              <option value="128k">128 kbps AAC</option>
              <option value="192k">192 kbps AAC (Standard)</option>
              <option value="256k">256 kbps AAC (High)</option>
              <option value="320k">320 kbps AAC (Studio)</option>
            </select>
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
                value={outputFolder || '(Default application folder)'}
                placeholder="Select output folder..."
                className="flex-1 bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-d2-text font-mono truncate"
              />
              <button
                onClick={selectOutputFolder}
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

        {/* Main Export Action Button */}
        <button
          onClick={startExport}
          disabled={isExporting}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            isExporting
              ? 'bg-d2-surfaceActive text-d2-textSubtle cursor-not-allowed border border-d2-border'
              : 'bg-d2-accent hover:bg-d2-accentHover text-white shadow-d2-accent/25 hover:shadow-d2-accent/40 active:scale-[0.99]'
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
              Export Video via FFmpeg
            </>
          )}
        </button>

        {lastExportedPath && !isExporting && exportStage === 'idle' && (
          <div className="p-2 rounded bg-d2-surfaceElevated border border-d2-border text-center">
            <span className="text-3xs text-d2-textSubtle block truncate">
              Last export: {lastExportedPath}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
