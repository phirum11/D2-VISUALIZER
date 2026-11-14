import React from 'react'
import { Sparkles, Zap, Eye, Disc } from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'
import { Slider } from '@/components/ui/Slider'

export const EffectsPanel: React.FC = () => {
  const { effects, updateEffects } = useCompositionStore()

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Visual Effects & FX
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          Atmospheric post-processing and beat reactivity
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Glow & Bloom */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/40 border border-d2-borderSubtle space-y-2">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-d2-accent" />
            <span>Optic Glow & Bloom</span>
          </div>
          <Slider
            label="Glow Intensity"
            value={effects.glow}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={30}
            onChange={(v) => updateEffects({ glow: v })}
            onReset={() => updateEffects({ glow: 30 })}
          />
        </div>

        {/* Cinematic Vignette & Grain */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/40 border border-d2-borderSubtle space-y-2">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cinematic Lens</span>
          </div>
          <Slider
            label="Vignette Falloff"
            value={effects.vignette}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={40}
            onChange={(v) => updateEffects({ vignette: v })}
            onReset={() => updateEffects({ vignette: 40 })}
          />
          <Slider
            label="Film Grain"
            value={effects.grain}
            min={0}
            max={50}
            step={5}
            unit="%"
            defaultValue={10}
            onChange={(v) => updateEffects({ grain: v })}
            onReset={() => updateEffects({ grain: 10 })}
          />
        </div>

        {/* Audio Reactivity */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/40 border border-d2-borderSubtle space-y-2">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Beat Reactivity</span>
          </div>
          <Slider
            label="Bass Kick Pulse"
            value={effects.beatPulse}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={50}
            onChange={(v) => updateEffects({ beatPulse: v })}
            onReset={() => updateEffects({ beatPulse: 50 })}
          />
          <Slider
            label="Ambient Particles"
            value={effects.particles}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={25}
            onChange={(v) => updateEffects({ particles: v })}
            onReset={() => updateEffects({ particles: 25 })}
          />
        </div>

        {/* Chromatic Aberration */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/40 border border-d2-borderSubtle space-y-2">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Disc className="w-3.5 h-3.5 text-rose-400" />
            <span>Lens Aberration</span>
          </div>
          <Slider
            label="RGB Split"
            value={effects.chromaticAberration}
            min={0}
            max={20}
            step={1}
            unit="px"
            defaultValue={0}
            onChange={(v) => updateEffects({ chromaticAberration: v })}
            onReset={() => updateEffects({ chromaticAberration: 0 })}
          />
        </div>
      </div>
    </div>
  )
}
