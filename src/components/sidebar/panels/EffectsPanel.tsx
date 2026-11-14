import React from 'react'
import {
  Sparkles,
  Eye,
  Sun,
  Video,
  CheckCircle2,
} from 'lucide-react'
import {
  useCompositionStore,
  AmbientParticlePreset,
  CinematicMotionPreset,
} from '@/stores/compositionStore'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'

const particlePresets: { id: AmbientParticlePreset; label: string; icon: string }[] = [
  { id: 'dust', label: 'Floating Dust', icon: '✨' },
  { id: 'stars', label: 'Starfield', icon: '⭐' },
  { id: 'snow', label: 'Snowfall', icon: '❄️' },
  { id: 'glowing', label: 'Glowing Orbs', icon: '🔮' },
  { id: 'fireflies', label: 'Fireflies', icon: '🦗' },
  { id: 'sparks', label: 'Light Sparks', icon: '⚡' },
  { id: 'cosmic', label: 'Cosmic Drift', icon: '🌌' },
]

const motionPresets: { id: CinematicMotionPreset; label: string }[] = [
  { id: 'none', label: 'Static' },
  { id: 'slow-zoom-in', label: 'Slow Zoom In' },
  { id: 'slow-zoom-out', label: 'Slow Zoom Out' },
  { id: 'pan-left', label: 'Pan Left' },
  { id: 'pan-right', label: 'Pan Right' },
  { id: 'vertical-pan', label: 'Vertical Pan' },
  { id: 'subtle-motion', label: 'Camera Drift' },
  { id: 'beat-pulse', label: 'Beat Zoom Pulse' },
]

export const EffectsPanel: React.FC = () => {
  const {
    effects,
    updateEffects,
    ambientParticles,
    updateAmbientParticles,
    cinematicMotion,
    updateCinematicMotion,
  } = useCompositionStore()

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border">
        <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
          Visual Effects & Atmosphere
        </h2>
        <span className="text-2xs text-d2-textSubtle">
          Cinematic post-effects, ambient particles, and camera motion
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ========================================================
            1. AMBIENT PARTICLE LAYER
        ======================================================== */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-d2-accent" />
              <span>Ambient Particle Layer</span>
            </div>
            <button
              onClick={() => updateAmbientParticles({ enabled: !ambientParticles.enabled })}
              className={`px-2 py-0.5 rounded text-3xs font-mono font-bold transition-colors ${
                ambientParticles.enabled
                  ? 'bg-d2-accent text-white shadow-xs'
                  : 'bg-d2-surface border border-d2-border text-d2-textSubtle'
              }`}
            >
              {ambientParticles.enabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {ambientParticles.enabled && (
            <div className="space-y-2 pt-1">
              <span className="text-3xs text-d2-textSubtle font-semibold uppercase tracking-wider">
                Particle Preset
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {particlePresets.map((p) => {
                  const isSelected = ambientParticles.preset === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateAmbientParticles({ preset: p.id })}
                      className={`p-1.5 rounded flex items-center justify-between text-2xs transition-colors border ${
                        isSelected
                          ? 'bg-d2-accent/20 border-d2-accent text-white font-semibold'
                          : 'bg-d2-canvas border-d2-borderSubtle text-d2-textSubtle hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{p.icon}</span>
                        <span className="truncate">{p.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-d2-accent shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="pt-2 space-y-1">
                <Slider
                  label="Particle Count"
                  value={ambientParticles.particleCount}
                  min={30}
                  max={250}
                  step={10}
                  defaultValue={120}
                  onChange={(v) => updateAmbientParticles({ particleCount: v })}
                  onReset={() => updateAmbientParticles({ particleCount: 120 })}
                />
                <Slider
                  label="Speed & Drift"
                  value={Math.round(ambientParticles.speed * 100)}
                  min={20}
                  max={250}
                  step={10}
                  unit="%"
                  defaultValue={100}
                  onChange={(v) => updateAmbientParticles({ speed: v / 100 })}
                  onReset={() => updateAmbientParticles({ speed: 1.0 })}
                />
                <Slider
                  label="Audio Reactivity"
                  value={Math.round(ambientParticles.audioReactivity * 100)}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  defaultValue={50}
                  onChange={(v) => updateAmbientParticles({ audioReactivity: v / 100 })}
                  onReset={() => updateAmbientParticles({ audioReactivity: 0.5 })}
                />
                <ColorPicker
                  label="Particle Color"
                  value={ambientParticles.color}
                  onChange={(c) => updateAmbientParticles({ color: c })}
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            2. CINEMATIC CAMERA MOTION
        ======================================================== */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-border space-y-3">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cinematic Camera Motion</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {motionPresets.map((m) => {
              const isSelected = cinematicMotion.preset === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => updateCinematicMotion({ preset: m.id })}
                  className={`p-1.5 rounded text-2xs transition-colors border truncate ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500 text-white font-semibold'
                      : 'bg-d2-canvas border-d2-borderSubtle text-d2-textSubtle hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {cinematicMotion.preset !== 'none' && (
            <Slider
              label="Motion Intensity"
              value={Math.round(cinematicMotion.intensity * 100)}
              min={20}
              max={200}
              step={10}
              unit="%"
              defaultValue={100}
              onChange={(v) => updateCinematicMotion({ intensity: v / 100 })}
              onReset={() => updateCinematicMotion({ intensity: 1.0 })}
            />
          )}
        </div>

        {/* ========================================================
            3. CINEMATIC POST-EFFECTS
        ======================================================== */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-border space-y-3">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Cinematic Lens & Post FX</span>
          </div>

          {/* Vignette */}
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

          {/* Film Grain */}
          <Slider
            label="Film Grain"
            value={effects.grain}
            min={0}
            max={50}
            step={2}
            unit="%"
            defaultValue={12}
            onChange={(v) => updateEffects({ grain: v })}
            onReset={() => updateEffects({ grain: 12 })}
          />

          {/* Bloom & Highlights */}
          <Slider
            label="Optic Bloom & Glow"
            value={effects.bloom}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={20}
            onChange={(v) => updateEffects({ bloom: v })}
            onReset={() => updateEffects({ bloom: 20 })}
          />

          {/* Light Leaks */}
          <Slider
            label="Anamorphic Light Leaks"
            value={effects.lightLeaks}
            min={0}
            max={100}
            step={5}
            unit="%"
            defaultValue={0}
            onChange={(v) => updateEffects({ lightLeaks: v })}
            onReset={() => updateEffects({ lightLeaks: 0 })}
          />

          {/* Chromatic Aberration */}
          <Slider
            label="RGB Chromatic Aberration"
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

        {/* ========================================================
            4. COLOR TINT & GRADING
        ======================================================== */}
        <div className="p-3 rounded-lg bg-d2-surfaceElevated/50 border border-d2-border space-y-3">
          <div className="flex items-center gap-2 text-2xs font-semibold text-white">
            <Sun className="w-3.5 h-3.5 text-rose-400" />
            <span>Color Grading & Tint</span>
          </div>

          <ColorPicker
            label="Tint Overlay Tone"
            value={effects.colorTint}
            onChange={(c) => updateEffects({ colorTint: c })}
          />

          <Slider
            label="Tint Opacity"
            value={effects.colorTintOpacity}
            min={0}
            max={60}
            step={5}
            unit="%"
            defaultValue={0}
            onChange={(v) => updateEffects({ colorTintOpacity: v })}
            onReset={() => updateEffects({ colorTintOpacity: 0 })}
          />
        </div>
      </div>
    </div>
  )
}
