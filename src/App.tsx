import React, { useEffect, useState } from 'react'
import { TitleBar } from '@/components/layout/TitleBar'
import { useAppStore } from '@/stores/appStore'
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AudioWaveform,
} from 'lucide-react'

export const App: React.FC = () => {
  const { setAppInfo, ipcConnected } = useAppStore()
  const [platform, setPlatform] = useState<string>('detecting...')
  const [appVersion, setAppVersion] = useState<string>('0.1.0')
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false)

  useEffect(() => {
    async function initSystem() {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const plat = await window.electronAPI.getPlatform()
          const ver = await window.electronAPI.getVersion()
          const pingRes = await window.electronAPI.ping()
          setPlatform(plat)
          setAppVersion(ver)
          setPingResult(pingRes)
          setAppInfo(ver, plat, true)
        } catch (err) {
          console.error('Failed to communicate with Electron IPC:', err)
          setAppInfo('0.1.0', 'unknown', false)
        }
      } else {
        // Fallback for browser testing
        setPlatform('browser-preview')
        setPingResult('Browser mock: electronAPI not present')
        setAppInfo('0.1.0', 'web', false)
      }
    }

    initSystem()
  }, [setAppInfo])

  const handleTestPing = async () => {
    setIsTestingPing(true)
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.ping()
        setPingResult(`${res} (${new Date().toLocaleTimeString()})`)
      } catch (err) {
        setPingResult(`Error: ${String(err)}`)
      }
    } else {
      setPingResult(`Simulated Web Ping OK (${new Date().toLocaleTimeString()})`)
    }
    setTimeout(() => setIsTestingPing(false), 300)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-d2-canvas text-d2-text overflow-hidden select-none">
      {/* Sleek Frameless TitleBar */}
      <TitleBar />

      {/* Main Workspace Foundation */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header Card */}
          <div className="bg-d2-surface border border-d2-border rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-d2-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-d2-surfaceElevated border border-d2-border text-xs font-medium text-d2-accent">
                  <AudioWaveform className="w-3.5 h-3.5 text-d2-accent" />
                  <span>Phase 1 Milestone Complete</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  D2 VISUALIZER
                  <span className="text-sm font-normal text-d2-textMuted px-2 py-0.5 rounded bg-d2-surfaceElevated border border-d2-border">
                    Architecture Ready
                  </span>
                </h1>
                <p className="text-sm text-d2-textMuted max-w-xl">
                  Desktop audio visualization and video editing application. Built
                  with Electron, React, TypeScript, Tailwind CSS, and Web Audio API.
                </p>
              </div>

              {/* Status Pill */}
              <div className="flex flex-col items-end gap-1.5">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                    ipcConnected
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{ipcConnected ? 'IPC BRIDGE SECURE' : 'BROWSER PREVIEW'}</span>
                </div>
                <span className="text-2xs text-d2-textSubtle font-mono">
                  Platform: {platform}
                </span>
              </div>
            </div>
          </div>

          {/* Architecture Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Security Card */}
            <div className="bg-d2-surface border border-d2-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Process Security</h3>
                <p className="text-xs text-d2-textMuted leading-relaxed">
                  Strict process isolation enabled. Zero unrestricted node access in
                  renderer.
                </p>
              </div>
              <ul className="text-2xs space-y-1.5 text-d2-textSubtle font-mono">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>contextIsolation: true</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>nodeIntegration: false</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Typed contextBridge</span>
                </li>
              </ul>
            </div>

            {/* Subsystem Readiness */}
            <div className="bg-d2-surface border border-d2-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-d2-accent/10 border border-d2-accent/20 flex items-center justify-center text-d2-accent">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Core Technology</h3>
                <p className="text-xs text-d2-textMuted leading-relaxed">
                  High-performance tooling stack configured for strict type-safety and
                  rapid HMR.
                </p>
              </div>
              <ul className="text-2xs space-y-1.5 text-d2-textSubtle font-mono">
                <li className="flex items-center gap-1.5 text-d2-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Electron v{appVersion} + Vite 6</span>
                </li>
                <li className="flex items-center gap-1.5 text-d2-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>React 18 + TS Strict</span>
                </li>
                <li className="flex items-center gap-1.5 text-d2-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tailwind Dark Tokens</span>
                </li>
              </ul>
            </div>

            {/* State & IPC Diagnostics */}
            <div className="bg-d2-surface border border-d2-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">IPC Communication</h3>
                <p className="text-xs text-d2-textMuted leading-relaxed">
                  Real-time bidirectional message channel between Electron Main and
                  Renderer.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-d2-canvas border border-d2-borderSubtle rounded p-2 text-2xs font-mono text-cyan-400 truncate">
                  {pingResult || 'Awaiting ping...'}
                </div>
                <button
                  onClick={handleTestPing}
                  disabled={isTestingPing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-xs font-medium text-white transition-colors"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isTestingPing ? 'animate-spin' : ''}`}
                  />
                  <span>Test IPC Roundtrip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Next Phase Roadmap Banner */}
          <div className="bg-d2-surfaceElevated/50 border border-d2-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-d2-surface border border-d2-border flex items-center justify-center text-d2-textMuted">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Next Milestone: Phase 2 — Professional Editor UI
                </h4>
                <p className="text-2xs text-d2-textMuted">
                  Multi-panel workstation, Aspect-ratio preview canvas, Properties
                  inspector, and Timeline shell.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-d2-textMuted">
              <Sparkles className="w-3.5 h-3.5 text-d2-accent" />
              <span>Foundation Verified</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
