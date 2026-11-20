import React, { useState } from 'react'
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  UploadCloud,
  Trash2,
  Volume2,
  VolumeX,
  Sliders,
} from 'lucide-react'
import {
  useCompositionStore,
  BackgroundSizing,
} from '@/stores/compositionStore'
import { BackgroundManager, GRADIENT_PRESETS } from '@/engine/background/BackgroundManager'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'

export const BackgroundsPanel: React.FC = () => {
  const { background, updateBackground } = useCompositionStore()
  const [isDragging, setIsDragging] = useState(false)
  const bgManager = BackgroundManager.getInstance()

  // Native file picker via IPC
  const handleOpenFileDialog = async () => {
    if (typeof window === 'undefined' || !window.electronAPI) return

    try {
      const res = await window.electronAPI.openBackgroundFileDialog()
      if (res.canceled || !res.filePath) return

      const mediaUrl = window.electronAPI.getMediaUrl(res.filePath)
      const mediaType = res.mediaType || 'image'

      if (mediaType === 'image') {
        await bgManager.loadImage(mediaUrl)
        updateBackground({
          type: 'image',
          mediaPath: mediaUrl,
          mediaName: res.fileName || 'Imported Image',
          mediaType: 'image',
        })
      } else {
        await bgManager.loadVideo(mediaUrl)
        updateBackground({
          type: 'video',
          mediaPath: mediaUrl,
          mediaName: res.fileName || 'Imported Video',
          mediaType: 'video',
        })
      }
    } catch (err) {
      console.error('[BACKGROUND PANEL] Failed to import background:', err)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const isVideo = ['mp4', 'webm'].includes(ext)
      const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext)

      if (!isImage && !isVideo) return

      // In Electron, File objects have a .path property
      const filePath = (file as unknown as { path?: string }).path
      const url = filePath && window.electronAPI
        ? window.electronAPI.getMediaUrl(filePath)
        : URL.createObjectURL(file)

      if (isVideo) {
        await bgManager.loadVideo(url)
        updateBackground({
          type: 'video',
          mediaPath: url,
          mediaName: file.name,
          mediaType: 'video',
        })
      } else {
        await bgManager.loadImage(url)
        updateBackground({
          type: 'image',
          mediaPath: url,
          mediaName: file.name,
          mediaType: 'image',
        })
      }
    }
  }

  const removeMedia = () => {
    updateBackground({
      type: 'gradient',
      mediaPath: null,
      mediaName: null,
      mediaType: null,
    })
  }

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
            Background Layer
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            Images, videos, gradients, and atmospheric lighting
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Background Type Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-d2-canvas border border-d2-border">
          {[
            { id: 'gradient', label: 'Gradient', icon: Sparkles },
            { id: 'color', label: 'Color', icon: Palette },
            { id: 'image', label: 'Image', icon: ImageIcon },
            { id: 'video', label: 'Video', icon: Film },
          ].map((type) => {
            const Icon = type.icon
            const isSelected = background.type === type.id
            return (
              <button
                key={type.id}
                onClick={() =>
                  updateBackground({
                    type: type.id as 'color' | 'gradient' | 'image' | 'video',
                  })
                }
                className={`flex flex-col items-center gap-1 py-1.5 rounded text-2xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-d2-surfaceActive text-d2-accent ring-1 ring-d2-accent/50'
                    : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>

        {/* Media Import Zone (For Image or Video) */}
        {(background.type === 'image' || background.type === 'video') && (
          <div className="space-y-3">
            {background.mediaPath ? (
              // Active Media Card
              <div className="p-3 rounded-lg bg-d2-surfaceElevated border border-d2-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {background.type === 'video' ? (
                      <Film className="w-4 h-4 text-d2-accent shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="text-2xs font-semibold text-white truncate max-w-[170px]">
                      {background.mediaName || 'Loaded Media'}
                    </span>
                  </div>
                  <button
                    onClick={removeMedia}
                    className="p-1 rounded text-d2-textSubtle hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Remove media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sizing Mode */}
                <div className="space-y-1">
                  <span className="text-3xs text-d2-textSubtle font-semibold uppercase tracking-wider">
                    Sizing Mode
                  </span>
                  <div className="grid grid-cols-4 gap-1 p-0.5 rounded bg-d2-canvas border border-d2-borderSubtle">
                    {(['fill', 'fit', 'stretch', 'crop'] as BackgroundSizing[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateBackground({ sizing: mode })}
                        className={`py-1 rounded text-3xs font-mono uppercase transition-colors ${
                          background.sizing === mode
                            ? 'bg-d2-surfaceActive text-d2-accent font-bold'
                            : 'text-d2-textSubtle hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Playback Controls (if Video) */}
                {background.type === 'video' && (
                  <div className="pt-2 border-t border-d2-borderSubtle space-y-2">
                    <span className="text-3xs text-d2-textSubtle font-semibold uppercase tracking-wider">
                      Video Audio & Sync
                    </span>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => updateBackground({ videoMuted: !background.videoMuted })}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-2xs border transition-colors ${
                          background.videoMuted
                            ? 'border-d2-border text-d2-textSubtle'
                            : 'border-d2-accent text-d2-accent bg-d2-accent/10'
                        }`}
                      >
                        {background.videoMuted ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>Muted</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Audio On</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => updateBackground({ playbackSpeed: rate })}
                            className={`px-1.5 py-0.5 rounded text-3xs font-mono transition-colors ${
                              background.playbackSpeed === rate
                                ? 'bg-d2-accent text-white font-bold'
                                : 'text-d2-textSubtle hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Empty Dropzone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleOpenFileDialog}
                className={`p-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-d2-accent bg-d2-accent/10 text-white'
                    : 'border-d2-border hover:border-d2-accent hover:bg-d2-surfaceElevated text-d2-textMuted'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-d2-accent mb-2 animate-bounce" />
                <span className="text-2xs font-semibold text-white">
                  Click or drag {background.type === 'video' ? 'MP4 / WebM video' : 'JPG / PNG / WebP image'}
                </span>
                <span className="text-3xs text-d2-textSubtle mt-1">
                  Supports up to 4K resolution
                </span>
              </div>
            )}
          </div>
        )}

        {/* Gradient Presets & Customizer */}
        {background.type === 'gradient' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-d2-text uppercase tracking-wider">
                Preset Palettes
              </span>
              <div className="flex items-center gap-1">
                {(['linear', 'radial'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateBackground({ gradientType: t })}
                    className={`px-2 py-0.5 rounded text-3xs font-mono capitalize transition-colors ${
                      background.gradientType === t
                        ? 'bg-d2-accent text-white font-bold'
                        : 'text-d2-textSubtle hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((gp) => {
                const isSelected =
                  background.color1 === gp.c1 && background.color2 === gp.c2
                return (
                  <div
                    key={gp.id}
                    onClick={() =>
                      updateBackground({
                        color1: gp.c1,
                        color2: gp.c2,
                        color3: gp.c3,
                        gradientAngle: gp.angle || 135,
                      })
                    }
                    className={`h-12 rounded border p-2 flex items-end justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-d2-accent ring-1 ring-d2-accent shadow-sm'
                        : 'border-d2-borderSubtle hover:border-d2-border'
                    }`}
                    style={{
                      background: `linear-gradient(${gp.angle || 135}deg, ${gp.c1}, ${gp.c2})`,
                    }}
                  >
                    <span className="text-2xs font-semibold text-white/90 drop-shadow">
                      {gp.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                )
              })}
            </div>

            {background.gradientType === 'linear' && (
              <Slider
                label="Gradient Angle"
                value={background.gradientAngle}
                min={0}
                max={360}
                step={5}
                unit="°"
                defaultValue={135}
                onChange={(v) => updateBackground({ gradientAngle: v })}
                onReset={() => updateBackground({ gradientAngle: 135 })}
              />
            )}

            <div className="pt-2 space-y-1">
              <ColorPicker
                label="Color Stop 1"
                value={background.color1}
                onChange={(c) => updateBackground({ color1: c })}
              />
              <ColorPicker
                label="Color Stop 2"
                value={background.color2}
                onChange={(c) => updateBackground({ color2: c })}
              />
              {background.color3 && (
                <ColorPicker
                  label="Color Stop 3 (Mid)"
                  value={background.color3}
                  onChange={(c) => updateBackground({ color3: c })}
                />
              )}
            </div>
          </div>
        )}

        {/* Single Solid Color */}
        {background.type === 'color' && (
          <div className="space-y-2">
            <ColorPicker
              label="Solid Background"
              value={background.color1}
              onChange={(c) => updateBackground({ color1: c })}
            />
          </div>
        )}

        {/* Atmospheric Adjustments */}
        <div className="pt-3 border-t border-d2-border space-y-2">
          <div className="flex items-center gap-1.5 text-2xs font-semibold text-white uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-d2-accent" />
            <span>Atmospheric Lighting & Filters</span>
          </div>

          <Slider
            label="Background Blur"
            value={background.blur}
            min={0}
            max={30}
            step={1}
            unit="px"
            defaultValue={0}
            onChange={(v) => updateBackground({ blur: v })}
            onReset={() => updateBackground({ blur: 0 })}
          />

          <Slider
            label="Brightness"
            value={Math.round(background.brightness * 100)}
            min={20}
            max={180}
            step={5}
            unit="%"
            defaultValue={100}
            onChange={(v) => updateBackground({ brightness: v / 100 })}
            onReset={() => updateBackground({ brightness: 1 })}
          />

          <Slider
            label="Contrast"
            value={Math.round(background.contrast * 100)}
            min={50}
            max={200}
            step={5}
            unit="%"
            defaultValue={100}
            onChange={(v) => updateBackground({ contrast: v / 100 })}
            onReset={() => updateBackground({ contrast: 1 })}
          />

          <Slider
            label="Saturation"
            value={Math.round(background.saturation * 100)}
            min={0}
            max={200}
            step={5}
            unit="%"
            defaultValue={100}
            onChange={(v) => updateBackground({ saturation: v / 100 })}
            onReset={() => updateBackground({ saturation: 1 })}
          />

          <Slider
            label="Layer Opacity"
            value={Math.round(background.opacity * 100)}
            min={10}
            max={100}
            step={5}
            unit="%"
            defaultValue={100}
            onChange={(v) => updateBackground({ opacity: v / 100 })}
            onReset={() => updateBackground({ opacity: 1 })}
          />
        </div>
      </div>
    </div>
  )
}
