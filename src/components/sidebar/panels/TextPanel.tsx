import React, { useState } from 'react'
import {
  Type,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Disc,
  Shield,
  FileText,
  Play,
} from 'lucide-react'
import { useCompositionStore } from '@/stores/compositionStore'
import { TYPOGRAPHY_PRESETS } from '@/engine/overlay/presets'
import {
  TextOverlay,
  ArtworkOverlay,
  LogoOverlay,
  CreditsOverlay,
  TextAnimationPreset,
  WatermarkPlacement,
  ArtworkShape,
} from '@/engine/overlay/types'
import { OverlayRenderer } from '@/engine/overlay/OverlayRenderer'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Select } from '@/components/ui/Select'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { Tooltip } from '@/components/ui/Tooltip'

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern Sans)' },
  { value: 'Montserrat', label: 'Montserrat (Geometric)' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Technical)' },
  { value: 'Georgia', label: 'Georgia (Serif Classic)' },
  { value: 'Impact', label: 'Impact (Heavy Bass/EDM)' },
  { value: 'Khmer OS', label: 'Khmer OS / Battambang (Unicode)' },
]

const animationOptions = [
  { value: 'none', label: 'None (Static)' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'fade-out', label: 'Fade Out' },
  { value: 'fade-in-out', label: 'Fade In & Out' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'letter-reveal', label: 'Letter Reveal' },
  { value: 'tracking-reveal', label: 'Tracking Reveal (Cinematic)' },
  { value: 'blur-in', label: 'Blur In' },
  { value: 'glitch-reveal', label: 'Glitch Reveal (Cyberpunk)' },
  { value: 'cinematic-title', label: 'Cinematic Title Reveal' },
]

export const TextPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'presets' | 'layers' | 'style' | 'branding' | 'credits' | 'animation'
  >('presets')

  const {
    overlays,
    activeOverlayId,
    setActiveOverlay,
    addOverlay,
    updateOverlay,
    removeOverlay,
    duplicateOverlay,
    applyTypographyPreset,
    text,
    updateText,
  } = useCompositionStore()

  const activeOverlay =
    overlays.find((o) => o.id === activeOverlayId) || overlays[0] || null

  const handleSelectImageForOverlay = async (
    targetType: 'artwork' | 'logo'
  ) => {
    try {
      if (window.electronAPI?.openImageFileDialog) {
        const res = await window.electronAPI.openImageFileDialog()
        if (!res.canceled && res.filePath) {
          const mediaUrl = window.electronAPI.getMediaUrl(res.filePath)
          await OverlayRenderer.getInstance().preloadImage(mediaUrl)

          if (targetType === 'artwork') {
            const newArt: ArtworkOverlay = {
              id: 'artwork-' + Date.now(),
              name: res.fileName || 'Album Artwork',
              type: 'artwork',
              src: mediaUrl,
              mediaName: res.fileName || 'Artwork',
              shape: 'circle',
              width: 280,
              height: 280,
              positionX: 0,
              positionY: -5,
              scale: 1,
              rotation: 0,
              borderRadius: 16,
              borderWidth: 3,
              borderColor: '#6366f1',
              shadowColor: 'rgba(0,0,0,0.85)',
              shadowBlur: 20,
              glowColor: '#6366f1',
              glowBlur: 16,
              opacity: 1,
              startTime: 0,
              endTime: 0,
              animation: {
                preset: 'zoom-in',
                startTime: 0,
                duration: 1.2,
                delay: 0.1,
                easing: 'ease-out',
                intensity: 1,
              },
              visible: true,
              locked: false,
            }
            addOverlay(newArt)
            setActiveTab('branding')
          } else {
            const newLogo: LogoOverlay = {
              id: 'logo-' + Date.now(),
              name: res.fileName || 'Watermark Logo',
              type: 'logo',
              src: mediaUrl,
              mediaName: res.fileName || 'Watermark',
              placement: 'top-right',
              positionX: 0,
              positionY: 0,
              scale: 0.8,
              rotation: 0,
              shadowColor: 'rgba(0,0,0,0.8)',
              shadowBlur: 8,
              glowColor: 'transparent',
              glowBlur: 0,
              opacity: 0.85,
              startTime: 0,
              endTime: 0,
              animation: {
                preset: 'fade-in',
                startTime: 0,
                duration: 1.0,
                delay: 0.3,
                easing: 'ease-out',
                intensity: 1,
              },
              visible: true,
              locked: false,
            }
            addOverlay(newLogo)
            setActiveTab('branding')
          }
        }
      }
    } catch (err) {
      console.error('[TEXT PANEL] Failed to pick image:', err)
    }
  }

  const handleAddTextOverlay = (role: 'title' | 'artist' | 'subtitle' | 'custom') => {
    const newText: TextOverlay = {
      id: 'text-' + Date.now(),
      name: role === 'custom' ? 'Custom Text' : `${role.toUpperCase()} Text`,
      type: 'text',
      role,
      text:
        role === 'title'
          ? text.songTitle || 'NEW TITLE'
          : role === 'artist'
          ? text.artistName || 'ARTIST NAME'
          : role === 'subtitle'
          ? 'OFFICIAL VISUALIZER'
          : 'Custom Lyric / Label',
      fontFamily: 'Montserrat',
      fontSize: role === 'title' ? 36 : role === 'artist' ? 20 : 13,
      fontWeight: role === 'title' ? '700' : '500',
      fontStyle: 'normal',
      color: '#ffffff',
      alignment: 'center',
      letterSpacing: 3,
      lineHeight: 1.2,
      positionX: 0,
      positionY: role === 'title' ? -22 : role === 'artist' ? -15 : -8,
      scale: 1,
      rotation: 0,
      opacity: 1,
      shadowColor: 'rgba(0,0,0,0.85)',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      outlineColor: '',
      outlineWidth: 0,
      glowColor: '#6366f1',
      glowBlur: 10,
      bgBox: false,
      bgBoxColor: '#000000',
      bgBoxPadding: 8,
      bgBoxRadius: 4,
      bgBoxOpacity: 0.6,
      startTime: 0,
      endTime: 0,
      animation: {
        preset: 'fade-in',
        startTime: 0,
        duration: 1.0,
        delay: 0.2,
        easing: 'ease-out',
        intensity: 1,
      },
      visible: true,
      locked: false,
    }
    addOverlay(newText)
    setActiveTab('style')
  }

  const handleAddCreditsOverlay = () => {
    const newCredits: CreditsOverlay = {
      id: 'credits-' + Date.now(),
      name: 'Music Credits',
      type: 'credits',
      title: 'OFFICIAL MUSIC CREDITS',
      credits: {
        artist: text.artistName || 'Starlight Echoes',
        producer: 'Alex Vance',
        composer: 'Elena Rostova',
        arranger: 'D2 Visualizer Studio',
        mixing: 'Studio 101 Paris',
        mastering: 'Abbey Road UK',
        recordLabel: 'Deepmind Sonic Records',
        copyright: '© 2026 All Rights Reserved',
        releaseYear: '2026',
      },
      layout: 'card',
      fontFamily: 'Inter',
      fontSize: 13,
      textColor: '#ffffff',
      labelColor: 'rgba(6, 182, 212, 0.95)',
      positionX: 0,
      positionY: 0,
      bgBox: true,
      bgBoxColor: 'rgba(2, 6, 23, 0.85)',
      bgBoxOpacity: 0.85,
      opacity: 1,
      startTime: 0,
      endTime: 0,
      animation: {
        preset: 'fade-in',
        startTime: 0,
        duration: 1.2,
        delay: 0.2,
        easing: 'ease-out',
        intensity: 1,
      },
      visible: true,
      locked: false,
    }
    addOverlay(newCredits)
    setActiveTab('credits')
  }

  return (
    <div className="flex flex-col h-full select-none text-xs bg-d2-surface">
      {/* Header */}
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-d2-accent" />
            Typography & Overlays
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            Titles, artwork, watermarks & cinematic animations
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1.5 border-b border-d2-borderSubtle bg-d2-surfaceElevated/50 text-3xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('presets')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'presets'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'layers'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Layers ({overlays.length})
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'style'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'branding'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Branding
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'credits'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Credits
        </button>
        <button
          onClick={() => setActiveTab('animation')}
          className={`py-1.5 px-1 rounded text-center truncate transition-colors ${
            activeTab === 'animation'
              ? 'bg-d2-accent text-white shadow-sm'
              : 'text-d2-textSubtle hover:text-white'
          }`}
        >
          Motion
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ========================================================
            TAB 1: TYPOGRAPHY PRESETS
        ======================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-d2-text uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                10 Curated Typography Presets
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {TYPOGRAPHY_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => applyTypographyPreset(p.id)}
                  className="p-2.5 rounded border border-d2-border bg-d2-surfaceElevated hover:border-d2-accent hover:bg-d2-canvas/80 cursor-pointer transition-all flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-d2-accent transition-colors">
                      {p.name}
                    </span>
                    <span className="text-3xs px-1.5 py-0.5 rounded bg-d2-surface border border-d2-border text-d2-textSubtle uppercase">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-3xs text-d2-textMuted leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <button className="text-3xs px-2 py-0.5 rounded bg-d2-accent/20 border border-d2-accent/40 text-cyan-300 group-hover:bg-d2-accent group-hover:text-white transition-all flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Apply Preset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: OVERLAY LAYERS STACK
        ======================================================== */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-d2-text uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Overlay Stack ({overlays.length})
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleAddTextOverlay('custom')}
                className="py-1.5 px-2 rounded bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent text-3xs text-white font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                Text
              </button>
              <button
                onClick={() => handleSelectImageForOverlay('artwork')}
                className="py-1.5 px-2 rounded bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent text-3xs text-white font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Disc className="w-3 h-3 text-indigo-400" />
                Artwork
              </button>
              <button
                onClick={() => handleSelectImageForOverlay('logo')}
                className="py-1.5 px-2 rounded bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent text-3xs text-white font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Shield className="w-3 h-3 text-amber-400" />
                Watermark
              </button>
              <button
                onClick={handleAddCreditsOverlay}
                className="py-1.5 px-2 rounded bg-d2-surfaceElevated border border-d2-border hover:border-d2-accent text-3xs text-white font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <FileText className="w-3 h-3 text-rose-400" />
                Credits
              </button>
            </div>

            {/* Overlay Layers List */}
            <div className="space-y-1.5 mt-2">
              {overlays.map((ov) => {
                const isSelected = activeOverlay?.id === ov.id
                return (
                  <div
                    key={ov.id}
                    onClick={() => setActiveOverlay(ov.id)}
                    className={`p-2 rounded border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-d2-accent bg-d2-accent/15 shadow-sm'
                        : 'border-d2-border bg-d2-surfaceElevated hover:border-d2-borderFocus'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                      {ov.type === 'text' && <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      {ov.type === 'artwork' && <Disc className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      {ov.type === 'logo' && <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      {ov.type === 'credits' && <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      <span className="text-2xs font-semibold text-white truncate">
                        {ov.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip content={ov.visible ? 'Hide Layer' : 'Show Layer'}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateOverlay(ov.id, { visible: !ov.visible })
                          }}
                          className="p-1 rounded text-d2-textSubtle hover:text-white"
                        >
                          {ov.visible ? (
                            <Eye className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-d2-textMuted" />
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip content={ov.locked ? 'Unlock' : 'Lock'}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateOverlay(ov.id, { locked: !ov.locked })
                          }}
                          className="p-1 rounded text-d2-textSubtle hover:text-white"
                        >
                          {ov.locked ? (
                            <Lock className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Unlock className="w-3 h-3 text-d2-textMuted" />
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip content="Duplicate Layer">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateOverlay(ov.id)
                          }}
                          className="p-1 rounded text-d2-textSubtle hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Delete Layer">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeOverlay(ov.id)
                          }}
                          className="p-1 rounded text-d2-textSubtle hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: STYLE & CONTENT (FOR ACTIVE TEXT OVERLAY)
        ======================================================== */}
        {activeTab === 'style' && activeOverlay && activeOverlay.type === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-2xs font-semibold text-d2-text uppercase tracking-wider">
                Text Content
              </label>
              <textarea
                rows={2}
                value={(activeOverlay as TextOverlay).text}
                onChange={(e) => {
                  updateOverlay(activeOverlay.id, { text: e.target.value })
                  const role = (activeOverlay as TextOverlay).role
                  if (role === 'title') updateText({ songTitle: e.target.value })
                  if (role === 'artist') updateText({ artistName: e.target.value })
                  if (role === 'subtitle') updateText({ subtitle: e.target.value })
                }}
                placeholder="Enter song title, artist, or lyrics..."
                className="w-full bg-d2-canvas border border-d2-border rounded p-2 text-xs text-white focus:outline-none focus:border-d2-accent"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-d2-borderSubtle">
              <Select
                label="Typeface"
                value={(activeOverlay as TextOverlay).fontFamily}
                options={fontOptions}
                onChange={(f) => updateOverlay(activeOverlay.id, { fontFamily: f })}
              />

              <Slider
                label="Font Size"
                value={(activeOverlay as TextOverlay).fontSize}
                min={12}
                max={96}
                step={2}
                unit="px"
                defaultValue={36}
                onChange={(v) => updateOverlay(activeOverlay.id, { fontSize: v })}
                onReset={() => updateOverlay(activeOverlay.id, { fontSize: 36 })}
              />

              {/* Weight & Style */}
              <div className="space-y-1">
                <span className="text-2xs text-d2-textMuted font-medium">Font Weight</span>
                <div className="grid grid-cols-4 gap-1 p-0.5 rounded bg-d2-canvas border border-d2-borderSubtle">
                  {[
                    { id: '300', label: 'Light' },
                    { id: '500', label: 'Regular' },
                    { id: '700', label: 'Bold' },
                    { id: '900', label: 'Black' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => updateOverlay(activeOverlay.id, { fontWeight: w.id })}
                      className={`py-1 rounded text-3xs font-semibold transition-colors ${
                        (activeOverlay as TextOverlay).fontWeight === w.id
                          ? 'bg-d2-accent text-white'
                          : 'text-d2-textSubtle hover:text-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1">
                <span className="text-2xs text-d2-textMuted font-medium">Alignment</span>
                <div className="flex items-center gap-1 p-1 bg-d2-canvas border border-d2-border rounded">
                  {(['left', 'center', 'right'] as const).map((align) => {
                    const Icon =
                      align === 'left'
                        ? AlignLeft
                        : align === 'center'
                        ? AlignCenter
                        : AlignRight
                    const isSelected = (activeOverlay as TextOverlay).alignment === align
                    return (
                      <button
                        key={align}
                        onClick={() => updateOverlay(activeOverlay.id, { alignment: align })}
                        className={`flex-1 py-1 rounded flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-d2-accent text-white'
                            : 'text-d2-textSubtle hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <Slider
                label="Letter Spacing"
                value={(activeOverlay as TextOverlay).letterSpacing}
                min={-2}
                max={24}
                step={1}
                unit="px"
                defaultValue={4}
                onChange={(v) => updateOverlay(activeOverlay.id, { letterSpacing: v })}
                onReset={() => updateOverlay(activeOverlay.id, { letterSpacing: 4 })}
              />

              <ColorPicker
                label="Text Color"
                value={(activeOverlay as TextOverlay).color}
                onChange={(c) => updateOverlay(activeOverlay.id, { color: c })}
              />

              <Slider
                label="Neon Outer Glow"
                value={(activeOverlay as TextOverlay).glowBlur}
                min={0}
                max={40}
                step={2}
                unit="px"
                defaultValue={10}
                onChange={(v) => updateOverlay(activeOverlay.id, { glowBlur: v })}
                onReset={() => updateOverlay(activeOverlay.id, { glowBlur: 0 })}
              />

              <ColorPicker
                label="Glow Tint Color"
                value={(activeOverlay as TextOverlay).glowColor || '#6366f1'}
                onChange={(c) => updateOverlay(activeOverlay.id, { glowColor: c })}
              />

              <CollapsibleSection title="Text Backdrop Box">
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs text-d2-textMuted">Enable Box</span>
                    <button
                      onClick={() =>
                        updateOverlay(activeOverlay.id, {
                          bgBox: !(activeOverlay as TextOverlay).bgBox,
                        })
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        (activeOverlay as TextOverlay).bgBox ? 'bg-d2-accent' : 'bg-d2-canvas'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          (activeOverlay as TextOverlay).bgBox ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <ColorPicker
                    label="Box Color"
                    value={(activeOverlay as TextOverlay).bgBoxColor}
                    onChange={(c) => updateOverlay(activeOverlay.id, { bgBoxColor: c })}
                  />

                  <Slider
                    label="Box Opacity"
                    value={Math.round((activeOverlay as TextOverlay).bgBoxOpacity * 100)}
                    min={10}
                    max={100}
                    step={5}
                    unit="%"
                    defaultValue={60}
                    onChange={(v) => updateOverlay(activeOverlay.id, { bgBoxOpacity: v / 100 })}
                  />
                </div>
              </CollapsibleSection>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: BRANDING (ALBUM ARTWORK & WATERMARK LOGO)
        ======================================================== */}
        {activeTab === 'branding' && (
          <div className="space-y-4">
            <span className="text-2xs font-bold text-d2-text uppercase tracking-wider flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-indigo-400" />
              Artwork & Watermark System
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectImageForOverlay('artwork')}
                className="p-3 rounded border border-d2-border bg-d2-surfaceElevated hover:border-d2-accent flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Disc className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Import Artwork</span>
                <span className="text-3xs text-d2-textMuted">JPG, PNG, WebP</span>
              </button>

              <button
                onClick={() => handleSelectImageForOverlay('logo')}
                className="p-3 rounded border border-d2-border bg-d2-surfaceElevated hover:border-d2-accent flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-white">Import Logo</span>
                <span className="text-3xs text-d2-textMuted">Transparent PNG/SVG</span>
              </button>
            </div>

            {/* Active Artwork Properties */}
            {activeOverlay && activeOverlay.type === 'artwork' && (
              <div className="space-y-3 pt-2 border-t border-d2-borderSubtle">
                <span className="text-2xs font-bold text-indigo-400 uppercase tracking-wider">
                  Artwork Settings: {activeOverlay.name}
                </span>

                <div className="space-y-1">
                  <span className="text-2xs text-d2-textMuted font-medium">Shape Geometry</span>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded bg-d2-canvas border border-d2-borderSubtle">
                    {(['circle', 'rounded', 'square'] as ArtworkShape[]).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => updateOverlay(activeOverlay.id, { shape })}
                        className={`py-1 rounded text-3xs font-semibold uppercase transition-colors ${
                          (activeOverlay as ArtworkOverlay).shape === shape
                            ? 'bg-d2-accent text-white'
                            : 'text-d2-textSubtle hover:text-white'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider
                  label="Artwork Size"
                  value={(activeOverlay as ArtworkOverlay).width}
                  min={120}
                  max={600}
                  step={10}
                  unit="px"
                  defaultValue={280}
                  onChange={(v) => updateOverlay(activeOverlay.id, { width: v, height: v })}
                />

                <Slider
                  label="Border Width"
                  value={(activeOverlay as ArtworkOverlay).borderWidth}
                  min={0}
                  max={12}
                  step={1}
                  unit="px"
                  defaultValue={3}
                  onChange={(v) => updateOverlay(activeOverlay.id, { borderWidth: v })}
                />

                <ColorPicker
                  label="Border Color"
                  value={(activeOverlay as ArtworkOverlay).borderColor}
                  onChange={(c) => updateOverlay(activeOverlay.id, { borderColor: c })}
                />

                <Slider
                  label="Sub-Bass Beat Glow"
                  value={(activeOverlay as ArtworkOverlay).glowBlur}
                  min={0}
                  max={50}
                  step={2}
                  unit="px"
                  defaultValue={16}
                  onChange={(v) => updateOverlay(activeOverlay.id, { glowBlur: v })}
                />
              </div>
            )}

            {/* Active Logo Properties */}
            {activeOverlay && activeOverlay.type === 'logo' && (
              <div className="space-y-3 pt-2 border-t border-d2-borderSubtle">
                <span className="text-2xs font-bold text-amber-400 uppercase tracking-wider">
                  Logo / Watermark: {activeOverlay.name}
                </span>

                <div className="space-y-1">
                  <span className="text-2xs text-d2-textMuted font-medium">Placement Anchor</span>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded bg-d2-canvas border border-d2-borderSubtle">
                    {(
                      [
                        'top-left',
                        'top-right',
                        'bottom-left',
                        'bottom-right',
                        'center',
                      ] as WatermarkPlacement[]
                    ).map((placement) => (
                      <button
                        key={placement}
                        onClick={() => updateOverlay(activeOverlay.id, { placement })}
                        className={`py-1 rounded text-3xs font-semibold uppercase transition-colors ${
                          (activeOverlay as LogoOverlay).placement === placement
                            ? 'bg-d2-accent text-white'
                            : 'text-d2-textSubtle hover:text-white'
                        }`}
                      >
                        {placement.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider
                  label="Watermark Scale"
                  value={Math.round((activeOverlay as LogoOverlay).scale * 100)}
                  min={20}
                  max={200}
                  step={5}
                  unit="%"
                  defaultValue={80}
                  onChange={(v) => updateOverlay(activeOverlay.id, { scale: v / 100 })}
                />

                <Slider
                  label="Opacity"
                  value={Math.round((activeOverlay as LogoOverlay).opacity * 100)}
                  min={10}
                  max={100}
                  step={5}
                  unit="%"
                  defaultValue={85}
                  onChange={(v) => updateOverlay(activeOverlay.id, { opacity: v / 100 })}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: MUSIC CREDITS
        ======================================================== */}
        {activeTab === 'credits' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-d2-text uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                Music Credits Card
              </span>
              <button
                onClick={handleAddCreditsOverlay}
                className="text-3xs px-2 py-0.5 rounded bg-d2-accent text-white flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
                Add Credits
              </button>
            </div>

            {activeOverlay && activeOverlay.type === 'credits' ? (
              <div className="space-y-2.5">
                <div>
                  <span className="text-3xs text-d2-textMuted uppercase font-semibold">
                    Credits Card Header
                  </span>
                  <input
                    type="text"
                    value={(activeOverlay as CreditsOverlay).title}
                    onChange={(e) =>
                      updateOverlay(activeOverlay.id, { title: e.target.value })
                    }
                    className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-d2-accent mt-0.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-3xs text-d2-textMuted">Artist</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.artist}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            artist: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Producer</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.producer}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            producer: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Composer</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.composer}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            composer: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Arranger</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.arranger}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            arranger: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Mixing</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.mixing}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            mixing: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Mastering</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.mastering}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            mastering: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Record Label</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.recordLabel}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            recordLabel: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>

                  <div>
                    <span className="text-3xs text-d2-textMuted">Release Year</span>
                    <input
                      type="text"
                      value={(activeOverlay as CreditsOverlay).credits.releaseYear}
                      onChange={(e) =>
                        updateOverlay(activeOverlay.id, {
                          credits: {
                            ...(activeOverlay as CreditsOverlay).credits,
                            releaseYear: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-d2-canvas border border-d2-border rounded px-2 py-1 text-xs text-white mt-0.5"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <ColorPicker
                    label="Label Highlight Color"
                    value={(activeOverlay as CreditsOverlay).labelColor}
                    onChange={(c) => updateOverlay(activeOverlay.id, { labelColor: c })}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded border border-d2-border border-dashed text-center text-d2-textMuted text-2xs">
                Select a Credits overlay in the Layers tab or click "Add Credits" above.
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 6: ANIMATION & MOTION
        ======================================================== */}
        {activeTab === 'animation' && activeOverlay && (
          <div className="space-y-3">
            <span className="text-2xs font-bold text-d2-text uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Motion Engine: {activeOverlay.name}
            </span>

            <Select
              label="Animation Preset"
              value={activeOverlay.animation.preset}
              options={animationOptions}
              onChange={(p) =>
                updateOverlay(activeOverlay.id, {
                  animation: {
                    ...activeOverlay.animation,
                    preset: p as TextAnimationPreset,
                  },
                })
              }
            />

            <Slider
              label="Transition Duration"
              value={Math.round(activeOverlay.animation.duration * 10)}
              min={2}
              max={50}
              step={1}
              unit="s/10"
              defaultValue={12}
              onChange={(v) =>
                updateOverlay(activeOverlay.id, {
                  animation: {
                    ...activeOverlay.animation,
                    duration: v / 10,
                  },
                })
              }
            />

            <Slider
              label="Start Delay"
              value={Math.round(activeOverlay.animation.delay * 10)}
              min={0}
              max={50}
              step={1}
              unit="s/10"
              defaultValue={2}
              onChange={(v) =>
                updateOverlay(activeOverlay.id, {
                  animation: {
                    ...activeOverlay.animation,
                    delay: v / 10,
                  },
                })
              }
            />

            <div className="space-y-1">
              <span className="text-2xs text-d2-textMuted font-medium">Easing Curve</span>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded bg-d2-canvas border border-d2-borderSubtle">
                {(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() =>
                      updateOverlay(activeOverlay.id, {
                        animation: {
                          ...activeOverlay.animation,
                          easing: e,
                        },
                      })
                    }
                    className={`py-1 rounded text-3xs font-semibold transition-colors ${
                      activeOverlay.animation.easing === e
                        ? 'bg-d2-accent text-white'
                        : 'text-d2-textSubtle hover:text-white'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
