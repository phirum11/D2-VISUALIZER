import React from 'react'
import { useCompositionStore } from '@/stores/compositionStore'
import { BASS_RESPONSE_PRESETS, DEFAULT_BASS_REACTIVITY, BassReactivityConfig, normalizeBassConfig } from '@/engine/audio/BassReactivity'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { Slider } from '@/components/ui/Slider'
import { Switch } from '@/components/ui/Switch'
import { Select } from '@/components/ui/Select'
import { BassMeter } from './BassMeter'

export const BassReactivitySection: React.FC = () => {
  const stored = useCompositionStore(state => state.visualizer.bassReactivity)
  const updateVisualizer = useCompositionStore(state => state.updateVisualizer)
  const config = normalizeBassConfig(stored)
  const update = (patch: Partial<BassReactivityConfig>) => updateVisualizer({ bassReactivity: normalizeBassConfig({ ...config, ...patch }) })
  const selectedResponse = BASS_RESPONSE_PRESETS.find(preset => Object.entries(preset.config).every(([key, value]) => config[key as keyof BassReactivityConfig] === value))?.id ?? 'custom'

  return (
    <CollapsibleSection title="Bass Reactivity Rack" onReset={() => updateVisualizer({ bassReactivity: { ...DEFAULT_BASS_REACTIVITY } })}>
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-2xs text-d2-textMuted">Bass processing</span>
        <Switch label="Bass reactivity" checked={config.enabled} onChange={enabled => update({ enabled })} />
      </div>
      <Select label="Bass response preset" value={selectedResponse}
        options={[{ value: 'custom', label: 'Custom' }, ...BASS_RESPONSE_PRESETS.map(preset => ({ value: preset.id, label: preset.name }))]}
        onChange={id => { const preset = BASS_RESPONSE_PRESETS.find(item => item.id === id); if (preset) update({ ...preset.config, enabled: true }) }} />
      <div className="mt-3"><BassMeter /></div>
      <p className="mt-1 text-3xs text-d2-textSubtle leading-relaxed">Envelope and kick response drive visuals only. Your audio stays unchanged.</p>
      <div className="grid grid-cols-2 gap-x-3 mt-2">
        <Slider label="Low Cut" value={config.lowHz} min={20} max={490} unit=" Hz" step={5}
          onChange={lowHz => update({ lowHz, highHz: Math.max(config.highHz, lowHz + 10) })} />
        <Slider label="High Cut" value={config.highHz} min={config.lowHz + 10} max={500} unit=" Hz" step={5}
          onChange={highHz => update({ highHz })} />
        <Slider label="Bass Gain" value={config.gain} min={0.25} max={4} step={0.05} unit="×" onChange={gain => update({ gain })} />
        <Slider label="Gate Threshold" value={Math.round(config.threshold * 100)} min={0} max={95} unit="%" onChange={v => update({ threshold: v / 100 })} />
        <Slider label="Attack" value={config.attackMs} min={1} max={200} unit=" ms" onChange={attackMs => update({ attackMs })} />
        <Slider label="Release" value={config.releaseMs} min={20} max={1000} step={5} unit=" ms" onChange={releaseMs => update({ releaseMs })} />
        <Slider label="Kick Emphasis" value={config.kickEmphasis} min={0} max={2} step={0.05} unit="×" onChange={kickEmphasis => update({ kickEmphasis })} />
        <Slider label="Peak Hold" value={config.holdMs} min={0} max={300} step={5} unit=" ms" onChange={holdMs => update({ holdMs })} />
      </div>
      <div className="mt-2 pt-2 border-t border-d2-borderSubtle">
        <h3 className="text-2xs font-medium text-d2-text mb-1">Visual modulation</h3>
        <Slider label="Response Mix" value={Math.round(config.mix * 100)} min={0} max={100} unit="%" onChange={v => update({ mix: v / 100 })} />
        <div className="grid grid-cols-2 gap-x-3">
          <Slider label="Bass Scale Pulse" value={Math.round(config.pulseScale * 100)} min={0} max={50} unit="%" onChange={v => update({ pulseScale: v / 100 })} />
          <Slider label="Bass Glow Boost" value={config.glowBoost} min={0} max={40} unit=" px" onChange={glowBoost => update({ glowBoost })} />
        </div>
        <Slider label="Visual Sidechain" value={Math.round(config.sidechain * 100)} min={0} max={100} unit="%" onChange={v => update({ sidechain: v / 100 })} />
        <p className="text-3xs text-d2-textSubtle">Sidechain ducks mid/treble visual energy during bass hits.</p>
      </div>
    </CollapsibleSection>
  )
}
