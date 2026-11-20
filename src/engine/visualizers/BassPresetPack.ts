import type { VisualizerPreset } from './VisualizerPresetCatalog'
import { DEFAULT_BASS_REACTIVITY, normalizeBassConfig } from '../audio/BassReactivity'

// 25 renderer families × 8 response arrangements = 200 additional presets.
const families: { id: string; name: string; category: VisualizerPreset['category']; points: number; thickness: number; scale: number }[] = [
  { id: 'spectrum-bars', name: 'Studio Columns', category: 'Spectrum', points: 56, thickness: 12, scale: 1.1 },
  { id: 'premium-spectrum-bars', name: 'Peak LED Rack', category: 'Spectrum', points: 64, thickness: 8, scale: 1 },
  { id: 'gradient-spectrum', name: 'Gradient Equalizer', category: 'Spectrum', points: 72, thickness: 6, scale: 1 },
  { id: 'floating-spectrum', name: 'Floating Faders', category: 'Spectrum', points: 48, thickness: 10, scale: 1.05 },
  { id: 'mirrored-frequency-spectrum', name: 'Split Frequency', category: 'Spectrum', points: 56, thickness: 6, scale: 1 },
  { id: 'equalizer-columns', name: 'Mixer Towers', category: 'Spectrum', points: 40, thickness: 12, scale: 1 },
  { id: 'neon-waveform', name: 'Neon Scope', category: 'Waveform', points: 64, thickness: 4, scale: 1 },
  { id: 'dual-audio-waveform', name: 'Dual Trace', category: 'Waveform', points: 64, thickness: 3, scale: 1 },
  { id: 'smooth-oscilloscope', name: 'Analog Scope', category: 'Waveform', points: 72, thickness: 3, scale: 1 },
  { id: 'energy-waveform', name: 'Energy Ribbon', category: 'Waveform', points: 80, thickness: 4, scale: 1 },
  { id: 'minimal-line-waveform', name: 'Fine Line', category: 'Minimal', points: 64, thickness: 2, scale: 1 },
  { id: 'circular-spectrum', name: 'Spectrum Halo', category: 'Circular', points: 64, thickness: 5, scale: 1 },
  { id: 'dual-ring-spectrum', name: 'Twin Halos', category: 'Circular', points: 72, thickness: 4, scale: 1 },
  { id: 'radial-energy-pulse', name: 'Pressure Pulse', category: 'Radial', points: 56, thickness: 5, scale: 1 },
  { id: 'circular-frequency-bars', name: 'Radial Meter', category: 'Radial', points: 64, thickness: 5, scale: 1 },
  { id: 'orbit-spectrum', name: 'Orbital Harmonics', category: 'Circular', points: 48, thickness: 4, scale: 1 },
  { id: 'rotating-audio-ring', name: 'Rotating Reactor', category: 'Circular', points: 64, thickness: 4, scale: 1 },
  { id: 'particle-audio-field', name: 'Particle Pressure', category: 'Particle Reactive', points: 72, thickness: 3, scale: 1 },
  { id: 'cosmic-frequency', name: 'Cosmic Resonance', category: 'Cinematic', points: 64, thickness: 4, scale: 1 },
  { id: 'laser-audio-lines', name: 'Laser Transients', category: 'Neon', points: 36, thickness: 3, scale: 1 },
  { id: 'digital-grid-spectrum', name: 'Digital Matrix', category: 'Geometric', points: 48, thickness: 4, scale: 1 },
  { id: 'liquid-energy', name: 'Liquid Subwoofer', category: 'Experimental', points: 64, thickness: 4, scale: 1 },
  { id: 'aurora-wave', name: 'Aurora Flow', category: 'Cinematic', points: 64, thickness: 3, scale: 1 },
  { id: 'hyper-tunnel', name: 'Tunnel Drive', category: 'Geometric', points: 48, thickness: 4, scale: 1 },
  { id: 'neon-pulse-rings', name: 'Neon Kick Rings', category: 'Neon', points: 56, thickness: 5, scale: 1 },
]

const arrangements = [
  { id: '808', name: 'Deep 808', lowHz: 20, highHz: 90, gain: 2.4, threshold: 0.08, attackMs: 20, releaseMs: 360, kickEmphasis: 0.2, holdMs: 100, sidechain: 0.1, pulseScale: 0.22, points: -8, thickness: 2, spacing: 2, rotation: 0, glow: 20, color: '#a78bfa', accent: '#38bdf8' },
  { id: 'kick', name: 'Tight Kick', lowHz: 35, highHz: 160, gain: 2, threshold: 0.18, attackMs: 3, releaseMs: 90, kickEmphasis: 1.2, holdMs: 45, sidechain: 0.35, pulseScale: 0.16, points: 8, thickness: 0, spacing: 4, rotation: 0, glow: 14, color: '#f59e0b', accent: '#f97316' },
  { id: 'pump', name: 'Club Pump', lowHz: 30, highHz: 220, gain: 1.8, threshold: 0.14, attackMs: 5, releaseMs: 240, kickEmphasis: 0.8, holdMs: 80, sidechain: 0.7, pulseScale: 0.18, points: 0, thickness: 1, spacing: 3, rotation: 0, glow: 24, color: '#22d3ee', accent: '#818cf8' },
  { id: 'reese', name: 'Reese Motion', lowHz: 40, highHz: 300, gain: 1.7, threshold: 0.1, attackMs: 45, releaseMs: 420, kickEmphasis: 0.3, holdMs: 60, sidechain: 0.2, pulseScale: 0.14, points: 16, thickness: -1, spacing: 1, rotation: 8, glow: 18, color: '#34d399', accent: '#a3e635' },
  { id: 'dub', name: 'Dub Pressure', lowHz: 20, highHz: 120, gain: 2.2, threshold: 0.06, attackMs: 30, releaseMs: 650, kickEmphasis: 0.15, holdMs: 150, sidechain: 0.15, pulseScale: 0.28, points: -16, thickness: 3, spacing: 6, rotation: -5, glow: 22, color: '#fb7185', accent: '#fbbf24' },
  { id: 'punch', name: 'Hard Punch', lowHz: 45, highHz: 250, gain: 2.6, threshold: 0.25, attackMs: 1, releaseMs: 65, kickEmphasis: 1.6, holdMs: 30, sidechain: 0.55, pulseScale: 0.25, points: 12, thickness: 2, spacing: 5, rotation: 0, glow: 28, color: '#f472b6', accent: '#c084fc' },
  { id: 'warm', name: 'Warm Groove', lowHz: 30, highHz: 350, gain: 1.3, threshold: 0.1, attackMs: 55, releaseMs: 280, kickEmphasis: 0.2, holdMs: 25, sidechain: 0, pulseScale: 0.07, points: -4, thickness: -1, spacing: 2, rotation: 3, glow: 10, color: '#fcd34d', accent: '#fdba74' },
  { id: 'clean', name: 'Clean Sub', lowHz: 20, highHz: 70, gain: 1.5, threshold: 0.12, attackMs: 15, releaseMs: 160, kickEmphasis: 0.4, holdMs: 50, sidechain: 0, pulseScale: 0.1, points: 4, thickness: 0, spacing: 0, rotation: 0, glow: 6, color: '#e2e8f0', accent: '#94a3b8' },
]

export const BASS_VISUALIZER_PRESETS: VisualizerPreset[] = families.flatMap(family => arrangements.map((arrangement, index) => ({
  id: `preset-bass-${family.id}-${arrangement.id}`,
  name: `${family.name} · ${arrangement.name}`,
  category: family.category,
  engineType: family.id,
  renderType: '2d' as const,
  description: `${arrangement.name} response over ${family.name.toLowerCase()}: ${arrangement.lowHz}–${arrangement.highHz} Hz, ${arrangement.attackMs} ms attack / ${arrangement.releaseMs} ms release.`,
  tags: ['Bass', 'Bass Pack', arrangement.name, 'Envelope', ...(arrangement.sidechain > 0.3 ? ['Sidechain'] : [])],
  config: {
    type: family.id, presetId: `preset-bass-${family.id}-${arrangement.id}`,
    barCount: Math.min(96, Math.max(16, family.points + arrangement.points)),
    thickness: Math.max(2, family.thickness + arrangement.thickness), spacing: arrangement.spacing,
    sensitivity: 1.1 + index * 0.07, smoothing: Math.min(0.95, 0.55 + arrangement.releaseMs / 2000),
    glow: arrangement.glow, primaryColor: arrangement.color, accentColor: arrangement.accent,
    positionX: 0, positionY: family.category === 'Spectrum' ? 12 : 0,
    scale: family.scale, rotation: arrangement.rotation, opacity: 1,
    bassReactivity: normalizeBassConfig({ ...DEFAULT_BASS_REACTIVITY, ...arrangement, enabled: true, mix: 0.9, glowBoost: arrangement.glow * 0.5 }),
  },
})))
