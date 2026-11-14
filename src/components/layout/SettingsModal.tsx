import React, { useState } from 'react'
import {
  X,
  Sliders,
  Cpu,
  Video,
  Info,
  CheckCircle2,
  Folder,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen } = useUIStore()
  const { version, platform } = useAppStore()
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'export' | 'about'>('general')

  // Setting states
  const [autosave, setAutosave] = useState(true)
  const [autosaveInterval, setAutosaveInterval] = useState('5')
  const [fftSize, setFftSize] = useState('2048')
  const [sampleRate, setSampleRate] = useState('48000')
  const [hwAccel, setHwAccel] = useState(true)
  const [defaultFormat, setDefaultFormat] = useState('mp4')

  if (!settingsOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-2xl bg-d2-surface border border-d2-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="h-12 border-b border-d2-border px-5 flex items-center justify-between bg-d2-surfaceElevated/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-d2-accent" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Application Settings
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
          <div className="w-44 border-r border-d2-border p-3 space-y-1 bg-d2-canvas/40">
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
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Editor & Project Preferences
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Automatic Background Saving
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Saves recovery state periodically to prevent data loss
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autosave}
                      onChange={(e) => setAutosave(e.target.checked)}
                      className="w-4 h-4 accent-d2-accent rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Autosave Interval
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Interval in minutes between recovery snapshots
                      </div>
                    </div>
                    <select
                      value={autosaveInterval}
                      onChange={(e) => setAutosaveInterval(e.target.value)}
                      className="rounded bg-d2-surface border border-d2-border px-2 py-1 text-xs text-white"
                    >
                      <option value="2">2 Minutes</option>
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
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

            {activeTab === 'export' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rendering & FFmpeg Pipeline
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-d2-surfaceElevated/40 border border-d2-borderSubtle">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Hardware Accelerated Video Encoding
                      </div>
                      <div className="text-2xs text-d2-textSubtle">
                        Use NVIDIA NVENC or Intel QSV when supported by FFmpeg
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
                      Default Export Directory
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="C:\Users\User\Videos\D2_Visualizers"
                        className="flex-1 bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs font-mono text-d2-textMuted"
                      />
                      <button className="px-3 py-1 bg-d2-surfaceElevated border border-d2-border rounded text-2xs hover:bg-d2-surfaceActive flex items-center gap-1.5 text-white">
                        <Folder className="w-3 h-3 text-d2-accent" />
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  System Environment
                </h3>

                <div className="p-4 rounded-lg bg-d2-surfaceElevated/40 border border-d2-border space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Application Name</span>
                    <span className="font-semibold text-white">D2 VISUALIZER</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">App Version</span>
                    <span className="font-mono text-d2-accent">{version}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">Operating System</span>
                    <span className="font-mono text-white capitalize">{platform} 64-bit</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-d2-borderSubtle">
                    <span className="text-d2-textMuted">FFmpeg Engine</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Detected on PATH (Full Build)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-d2-textMuted">Renderer Model</span>
                    <span className="font-mono text-white">HTML5 Canvas 2D + Three.js</span>
                  </div>
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
