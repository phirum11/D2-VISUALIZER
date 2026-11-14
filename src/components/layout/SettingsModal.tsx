import React, { useState } from 'react'
import {
  X,
  Sliders,
  Cpu,
  Video,
  Info,
  CheckCircle2,
  Gauge,
  Keyboard,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'
import { usePreviewStore, PreviewQuality } from '@/stores/previewStore'
import { useProjectStore } from '@/stores/projectStore'

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen } = useUIStore()
  const { version, platform } = useAppStore()
  const { previewQuality, setPreviewQuality } = usePreviewStore()
  const {
    autoSaveEnabled,
    autoSaveIntervalSeconds,
    setAutoSaveSettings,
  } = useProjectStore()

  const [activeTab, setActiveTab] = useState<
    'general' | 'performance' | 'audio' | 'export' | 'shortcuts' | 'about'
  >('general')

  // Audio & Export settings
  const [fftSize, setFftSize] = useState('2048')
  const [sampleRate, setSampleRate] = useState('48000')
  const [hwAccel, setHwAccel] = useState(true)
  const [defaultFormat, setDefaultFormat] = useState('mp4')

  if (!settingsOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-3xl bg-d2-surface border border-d2-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[560px]">
        {/* Header */}
        <div className="h-12 border-b border-d2-border px-5 flex items-center justify-between bg-d2-surfaceElevated/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-d2-accent" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Application Settings & Preferences
            </h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-d2-surfaceElevated text-d2-textMuted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body with Left Nav */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Nav */}
          <div className="w-48 border-r border-d2-border p-3 space-y-1 bg-d2-canvas/40 select-none">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              General
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-d2-accent" />
              Performance Mode
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'audio'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Audio Engine
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'export'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Video & Export
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'shortcuts'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Shortcuts
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textMuted hover:text-white hover:bg-d2-surfaceElevated/50'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About & System
            </button>
          </div>

          {/* Tab Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-d2-accent" />
                  Editor & Project Persistence
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Automatic Background Saving
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Periodically writes crash-recovery snapshots to protect your work
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveEnabled}
                      onChange={(e) =>
                        setAutoSaveSettings(e.target.checked, autoSaveIntervalSeconds)
                      }
                      className="w-4 h-4 accent-d2-accent rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Auto-Save Interval
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Frequency of automated project snapshots
                      </div>
                    </div>
                    <select
                      value={autoSaveIntervalSeconds.toString()}
                      onChange={(e) =>
                        setAutoSaveSettings(autoSaveEnabled, parseInt(e.target.value, 10))
                      }
                      disabled={!autoSaveEnabled}
                      className="rounded bg-d2-surface border border-d2-border px-2.5 py-1 text-xs text-white disabled:opacity-50"
                    >
                      <option value="15">Every 15 Seconds (Real-time safety)</option>
                      <option value="30">Every 30 Seconds (Default recommended)</option>
                      <option value="60">Every 60 Seconds</option>
                      <option value="180">Every 3 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PERFORMANCE MODE TAB */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-d2-accent" />
                  Real-time Preview Performance Engine
                </h3>

                <div className="p-3.5 rounded bg-d2-accent/10 border border-d2-accent/30 text-2xs text-d2-text">
                  <span className="font-semibold text-d2-accent">Non-Destructive Scaling: </span>
                  Preview performance modes scale the canvas fill-rate during interactive editing to ensure smooth 60 FPS playback on laptops and integrated GPUs. <span className="font-semibold text-white">Final video export quality is NEVER compromised</span> and always renders at full native resolution (1080p, 1440p, or 4K).
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: 'performance' as PreviewQuality,
                      title: 'Performance',
                      desc: '0.6x resolution scale. Optimized for battery life and laptop iGPUs.',
                      badge: 'Fastest 60fps',
                    },
                    {
                      id: 'balanced' as PreviewQuality,
                      title: 'Balanced',
                      desc: '0.85x resolution scale. Smooth editing with sharp visual detail.',
                      badge: 'Recommended',
                    },
                    {
                      id: 'quality' as PreviewQuality,
                      title: 'Quality',
                      desc: '1.0x native unthrottled resolution. Pixel-perfect studio fidelity.',
                      badge: 'Studio Native',
                    },
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setPreviewQuality(mode.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        previewQuality === mode.id
                          ? 'bg-d2-accent/15 border-d2-accent text-white shadow-lg'
                          : 'bg-d2-surfaceElevated/30 border-d2-borderSubtle hover:border-d2-border text-d2-textMuted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{mode.title}</span>
                        <span
                          className={`text-3xs px-1.5 py-0.5 rounded font-medium ${
                            previewQuality === mode.id
                              ? 'bg-d2-accent text-black font-semibold'
                              : 'bg-d2-surface text-d2-textSubtle'
                          }`}
                        >
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-2xs leading-relaxed text-d2-textSubtle">{mode.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Hardware Acceleration Status
                  </h4>
                  <div className="p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-d2-textSubtle block text-2xs">GPU Acceleration:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enabled (WebGL 2.0 Active)
                      </span>
                    </div>
                    <div>
                      <span className="text-d2-textSubtle block text-2xs">Hardware Video Encoder:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> NVENC / QSV Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIO TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-d2-accent" />
                  Audio DSP & Analysis
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        FFT Analyser Resolution
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Higher values yield finer bass/mid frequency analysis
                      </div>
                    </div>
                    <select
                      value={fftSize}
                      onChange={(e) => setFftSize(e.target.value)}
                      className="rounded bg-d2-surface border border-d2-border px-2 py-1 text-xs text-white"
                    >
                      <option value="1024">1024 Bins (Low Latency)</option>
                      <option value="2048">2048 Bins (Balanced Studio)</option>
                      <option value="4096">4096 Bins (High Definition)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Default Processing Sample Rate
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Internal sample rate for Web Audio decoding
                      </div>
                    </div>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value)}
                      className="rounded bg-d2-surface border border-d2-border px-2 py-1 text-xs text-white"
                    >
                      <option value="44100">44.1 kHz (CD Quality)</option>
                      <option value="48000">48.0 kHz (Broadcast Video Standard)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-d2-accent" />
                  Rendering & FFmpeg Pipeline
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Hardware Accelerated Video Encoding
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Use NVIDIA NVENC or Intel QSV when supported by hardware
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hwAccel}
                      onChange={(e) => setHwAccel(e.target.checked)}
                      className="w-4 h-4 accent-d2-accent rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Default Video Container
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Output container for visualizer videos
                      </div>
                    </div>
                    <select
                      value={defaultFormat}
                      onChange={(e) => setDefaultFormat(e.target.value)}
                      className="rounded bg-d2-surface border border-d2-border px-2 py-1 text-xs text-white"
                    >
                      <option value="mp4">MP4 (H.264 + AAC)</option>
                      <option value="webm">WebM (VP9 + Opus)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle space-y-2">
                    <div className="text-xs font-medium text-white">
                      Disk Space Safety Threshold
                    </div>
                    <div className="text-2xs text-d2-textSubtle">
                      The exporter automatically enforces a minimum of 500 MB free space before starting any video rendering job to protect against disk exhaustion.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHORTCUTS TAB */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-d2-accent" />
                  Keyboard Shortcuts & Hotkeys
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'Space', desc: 'Play / Pause Preview & Audio' },
                    { key: 'Ctrl + S', desc: 'Save Project (.d2proj)' },
                    { key: 'Ctrl + Shift + S', desc: 'Save Project As...' },
                    { key: 'Ctrl + O', desc: 'Open Project File' },
                    { key: 'Ctrl + N', desc: 'Create New Empty Project' },
                    { key: 'Ctrl + Z', desc: 'Undo Timeline Edit' },
                    { key: 'Ctrl + Y', desc: 'Redo Timeline Edit' },
                    { key: 'Ctrl + K', desc: 'Split Clip at Current Playhead' },
                    { key: 'Delete / Backspace', desc: 'Delete Selected Clip' },
                    { key: '1 – 9', desc: 'Switch Active Visualizer Style' },
                    { key: 'F', desc: 'Zoom Canvas to Fit' },
                    { key: 'Esc', desc: 'Close Active Modal / Sheet' },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle"
                    >
                      <span className="text-d2-textMuted text-2xs">{s.desc}</span>
                      <kbd className="px-2 py-0.5 rounded bg-d2-surface border border-d2-border text-2xs font-mono text-d2-accent font-semibold">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-d2-accent" />
                  System & Engine Environment
                </h3>

                <div className="p-4 rounded-lg bg-d2-surfaceElevated/40 border border-d2-border space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Application Name</span>
                    <span className="font-semibold text-white">D2 VISUALIZER</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Production Release</span>
                    <span className="font-mono text-d2-accent font-bold">v{version} (Production)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Operating System</span>
                    <span className="font-mono text-white capitalize">{platform} 64-bit (Windows 10/11)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Bundled Video Pipeline</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Standalone FFmpeg & FFprobe (Bundled Gyan.dev x64)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Audio DSP Engine</span>
                    <span className="font-mono text-white">Web Audio API + Real-Time FFT Analyser</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-d2-textMuted">Graphics & Visualizers</span>
                    <span className="font-mono text-white">HTML5 Canvas 2D + Three.js WebGL (10 Styles)</span>
                  </div>
                </div>

                <div className="text-3xs text-d2-textSubtle text-center">
                  © 2026 D2 Visualizer Studio. Designed for professional music visualization and cinematic video creation.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-d2-border px-5 flex items-center justify-end gap-2 bg-d2-surfaceElevated/50">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 rounded bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
