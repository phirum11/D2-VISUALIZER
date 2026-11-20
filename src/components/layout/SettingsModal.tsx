import React, { useState } from 'react'
import {
  Sliders,
  Cpu,
  Video,
  Info,
  CheckCircle2,
  Gauge,
  Keyboard,
  ShieldCheck,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'
import { usePreviewStore, PreviewQuality } from '@/stores/previewStore'
import { useProjectStore } from '@/stores/projectStore'
import { useExportStore } from '@/stores/exportStore'
import { Switch } from '@/components/ui/Switch'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { HardwareCheck } from './HardwareCheck'
import { useHardwareStore } from '@/stores/hardwareStore'

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen } = useUIStore()
  const { version, platform } = useAppStore()
  const { previewQuality, setPreviewQuality } = usePreviewStore()
  const recommendedMode = useHardwareStore(state => state.profile?.recommendedMode)
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
  const videoCodec = useExportStore(state => state.videoCodec)
  const setVideoCodec = useExportStore(state => state.setVideoCodec)
  const [defaultFormat, setDefaultFormat] = useState('mp4')

  if (!settingsOpen) return null

  return (
    <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Application Settings & Preferences" icon={Sliders}
      footer={
        <div className="flex justify-end">
          <button type="button" onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 rounded-md bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-xs font-medium text-d2-text transition-colors">
            Close
          </button>
        </div>
      }>
        {/* Content Body with Left Nav */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Nav */}
          <div className="w-48 shrink-0 overflow-y-auto border-r border-d2-border p-3 space-y-1 bg-d2-canvas/40 select-none">
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
          <div className="flex-1 min-w-0 p-6 overflow-y-auto space-y-6">
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
                    <Switch label="Automatic Background Saving"
                      checked={autoSaveEnabled}
                      onChange={(checked) =>
                        setAutoSaveSettings(checked, autoSaveIntervalSeconds)
                      }
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
                    <Select ariaLabel="Auto-Save Interval" className="w-56 shrink-0"
                      value={autoSaveIntervalSeconds.toString()}
                      onChange={(value) =>
                        setAutoSaveSettings(autoSaveEnabled, parseInt(value, 10))
                      }
                      disabled={!autoSaveEnabled}
                      options={[
                        { value: '15', label: 'Every 15 seconds' },
                        { value: '30', label: 'Every 30 seconds', description: 'Recommended' },
                        { value: '60', label: 'Every minute' },
                        { value: '180', label: 'Every 3 minutes' },
                      ]} />
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
                  Preview modes reduce interactive rendering load with 30 or 60 FPS budgets. Actual playback speed depends on hardware and scene complexity. <span className="font-semibold text-white">Export resolution stays unchanged</span> and renders at the selected output size.
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: 'performance' as PreviewQuality,
                      title: 'Performance',
                      desc: 'Viewport-sized preview, capped at 0.6× native resolution. Lower GPU and CPU load.',
                      badge: '30 FPS budget',
                    },
                    {
                      id: 'balanced' as PreviewQuality,
                      title: 'Balanced',
                      desc: 'Viewport-sized preview, capped at 0.85× native resolution. 60 FPS playback budget.',
                       badge: '60 FPS budget',
                    },
                    {
                      id: 'quality' as PreviewQuality,
                      title: 'Quality',
                      desc: 'Native-resolution preview with a 60 FPS playback budget. Highest GPU load.',
                      badge: 'Studio Native',
                    },
                  ].map((mode) => (
                    <button type="button"
                      key={mode.id}
                      onClick={() => setPreviewQuality(mode.id)}
                      aria-pressed={previewQuality === mode.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                        previewQuality === mode.id
                          ? 'bg-d2-accent/15 border-d2-accent text-white shadow-lg'
                          : 'bg-d2-surfaceElevated/30 border-d2-borderSubtle hover:border-d2-border text-d2-textMuted'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-xs font-bold text-white">{mode.title}</span>
                        <span
                          className={`text-3xs px-1.5 py-0.5 rounded font-medium ${
                            previewQuality === mode.id
                              ? 'bg-d2-accent text-black font-semibold'
                              : 'bg-d2-surface text-d2-textSubtle'
                          }`}
                        >
                           {recommendedMode === mode.id ? 'Recommended' : mode.badge}
                        </span>
                      </div>
                      <p className="text-2xs leading-relaxed text-d2-textSubtle">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                <HardwareCheck />
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
                    <Select ariaLabel="FFT Analyser Resolution" className="w-48 shrink-0"
                      value={fftSize}
                      onChange={setFftSize}
                      options={[
                        { value: '1024', label: '1024 bins', description: 'Low latency' },
                        { value: '2048', label: '2048 bins', description: 'Balanced studio' },
                        { value: '4096', label: '4096 bins', description: 'High definition' },
                      ]} />
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
                    <Select ariaLabel="Default Processing Sample Rate" className="w-48 shrink-0"
                      value={sampleRate}
                      onChange={setSampleRate}
                      options={[
                        { value: '44100', label: '44.1 kHz', description: 'CD quality' },
                        { value: '48000', label: '48.0 kHz', description: 'Broadcast video' },
                      ]} />
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
                        Use NVIDIA NVENC when available, otherwise fall back to CPU encoding
                      </div>
                    </div>
                    <Switch label="Hardware Accelerated Video Encoding"
                      checked={videoCodec !== 'libx264'}
                      onChange={(checked) => setVideoCodec(checked ? 'auto' : 'libx264')} />
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
                    <Select ariaLabel="Default Video Container" className="w-48 shrink-0"
                      value={defaultFormat}
                      onChange={setDefaultFormat}
                      options={[
                        { value: 'mp4', label: 'MP4', description: 'H.264 + AAC' },
                        { value: 'webm', label: 'WebM', description: 'VP9 + Opus' },
                      ]} />
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

    </Modal>
  )
}
