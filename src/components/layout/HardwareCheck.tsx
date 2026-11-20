import React from 'react'
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react'
import { useHardwareStore } from '@/stores/hardwareStore'
import { usePreviewStore } from '@/stores/previewStore'

const modeNames = { performance: 'Performance', balanced: 'Balanced', quality: 'Quality' }

export const HardwareCheck: React.FC = () => {
  const { profile, loaded, checking, error, checkOnce, applyRecommendation } = useHardwareStore()
  const previewQuality = usePreviewStore(state => state.previewQuality)

  return (
    <section className="space-y-3 pt-2" aria-label="Computer hardware recommendation">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-d2-text flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-d2-accent" /> Computer hardware
          </h3>
          <p className="mt-1 text-2xs text-d2-textSubtle">Checked only on request. Results are saved for future launches.</p>
        </div>
        <button type="button" onClick={() => void checkOnce()} disabled={!loaded || checking || !!profile}
          aria-label="Check computer hardware"
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-d2-border bg-d2-surfaceElevated text-2xs text-d2-text hover:bg-d2-surfaceActive transition-colors disabled:opacity-60 disabled:cursor-default">
          {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : profile ? <CheckCircle2 className="w-3.5 h-3.5 text-d2-accent" /> : <Cpu className="w-3.5 h-3.5" />}
          {checking ? 'Checking…' : profile ? 'Hardware checked' : 'Check hardware'}
        </button>
      </div>
      {error && <p role="alert" className="text-2xs text-d2-text p-3 rounded-md border border-d2-border">{error}</p>}
      {profile ? (
        <div className="space-y-3">
          <dl className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-d2-surfaceElevated/40 border border-d2-borderSubtle text-2xs">
            <div><dt className="text-d2-textSubtle">Processor</dt><dd className="mt-1 text-d2-text break-words">{profile.cpuName}</dd></div>
            <div><dt className="text-d2-textSubtle">Memory & CPU threads</dt><dd className="mt-1 text-d2-text">{profile.memoryGB} GB RAM · {profile.logicalCores} threads</dd></div>
            <div><dt className="text-d2-textSubtle">Graphics</dt><dd className="mt-1 text-d2-text break-words">{profile.gpuName}</dd></div>
            <div><dt className="text-d2-textSubtle">Acceleration</dt><dd className="mt-1 text-d2-text">{profile.gpuAccelerated ? 'WebGL accelerated' : 'Software graphics'}<br />{profile.nvencSupported ? 'NVENC encoding verified' : 'CPU video encoding'}</dd></div>
          </dl>
          <div className="p-3 rounded-lg border border-d2-accent/40 bg-d2-accent/10 space-y-2" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-d2-text">Recommended: {modeNames[profile.recommendedMode]}</span>
              <button type="button" onClick={applyRecommendation} disabled={previewQuality === profile.recommendedMode}
                aria-label="Apply recommended preview mode"
                className="shrink-0 text-2xs font-medium px-3 py-1.5 rounded-md bg-d2-accent text-d2-canvas hover:bg-d2-accentHover disabled:opacity-60 disabled:cursor-default transition-colors">
                {previewQuality === profile.recommendedMode ? 'Applied' : 'Apply recommendation'}
              </button>
            </div>
            <p className="text-2xs leading-relaxed text-d2-textMuted">{profile.reason}</p>
          </div>
          <p className="text-3xs text-d2-textSubtle">Saved {new Date(profile.checkedAt).toLocaleString()}. Hardware-based estimate, not a playback benchmark.</p>
        </div>
      ) : (
        <p className="p-3 rounded-md border border-d2-borderSubtle text-2xs text-d2-textMuted">
          Check CPU, memory, graphics acceleration and NVENC support to recommend a preview mode. No automatic hardware scans run at startup.
        </p>
      )}
    </section>
  )
}
