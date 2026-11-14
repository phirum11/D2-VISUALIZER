import React from 'react'
import {
  Sliders,
  Move,
  Palette,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Activity,
  Image as ImageIcon,
  Type,
  Layers,
} from 'lucide-react'
import { useUIStore, LayerId } from '@/stores/uiStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { Tooltip } from '@/components/ui/Tooltip'

export const InspectorPanel: React.FC = () => {
  const {
    isInspectorCollapsed,
    toggleInspector,
    inspectorWidth,
    selectedLayer,
    setSelectedLayer,
  } = useUIStore()

  const {
    visualizer,
    updateVisualizer,
    text,
    updateText,
    resetVisualizerSection,
    resetTransform,
  } = useCompositionStore()

  const layerTabs: { id: LayerId; label: string; icon: React.ElementType }[] = [
    { id: 'visualizer', label: 'Visualizer', icon: Activity },
    { id: 'background', label: 'Background', icon: ImageIcon },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'overlay', label: 'Overlays', icon: Layers },
  ]

  if (isInspectorCollapsed) {
    return (
      <aside className="w-10 h-full bg-d2-surface border-l border-d2-border flex flex-col items-center py-2 select-none z-20 shrink-0">
        <Tooltip content="Expand Properties Inspector" side="left">
          <button
            onClick={toggleInspector}
            className="w-8 h-8 rounded flex items-center justify-center text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated transition-colors"
          >
            <PanelRightOpen className="w-4 h-4 text-d2-accent" />
          </button>
        </Tooltip>
        <div className="mt-8 [writing-mode:vertical-rl] text-2xs font-semibold tracking-wider text-d2-textSubtle uppercase">
          Inspector
        </div>
      </aside>
    )
  }

  return (
    <aside
      style={{ width: `${inspectorWidth}px` }}
      className="h-full bg-d2-surface border-l border-d2-border flex flex-col select-none z-20 shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="h-10 px-3 border-b border-d2-border flex items-center justify-between bg-d2-surfaceElevated/30">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-d2-accent" />
          <h2 className="text-2xs font-bold uppercase tracking-wider text-white">
            Properties Inspector
          </h2>
        </div>

        <Tooltip content="Collapse Inspector" side="left">
          <button
            onClick={toggleInspector}
            className="p-1 rounded text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated transition-colors"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Layer Target Selector */}
      <div className="p-2 border-b border-d2-borderSubtle bg-d2-canvas/40">
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded bg-d2-surfaceElevated border border-d2-border">
          {layerTabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = selectedLayer === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedLayer(tab.id)}
                className={`py-1 rounded flex flex-col items-center gap-0.5 text-2xs transition-colors ${
                  isSelected
                    ? 'bg-d2-accent text-white shadow-sm font-semibold'
                    : 'text-d2-textSubtle hover:text-white'
                }`}
                title={tab.label}
              >
                <Icon className="w-3 h-3" />
                <span className="text-3xs truncate max-w-full">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-d2-borderSubtle">
        {/* Transform Section */}
        <CollapsibleSection title="Transform" onReset={resetTransform}>
          <div className="flex items-center gap-2 text-2xs text-d2-textSubtle mb-1">
            <Move className="w-3 h-3 text-d2-accent" />
            <span>Position, Scale & Orientation</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Slider
              label="Position X"
              value={visualizer.positionX}
              min={-50}
              max={50}
              step={1}
              unit="%"
              defaultValue={0}
              onChange={(v) => updateVisualizer({ positionX: v })}
              onReset={() => updateVisualizer({ positionX: 0 })}
            />
            <Slider
              label="Position Y"
              value={visualizer.positionY}
              min={-50}
              max={50}
              step={1}
              unit="%"
              defaultValue={0}
              onChange={(v) => updateVisualizer({ positionY: v })}
              onReset={() => updateVisualizer({ positionY: 0 })}
            />
          </div>

          <Slider
            label="Scale"
            value={visualizer.scale}
            min={0.2}
            max={3.0}
            step={0.05}
            unit="x"
            defaultValue={1}
            onChange={(v) => updateVisualizer({ scale: v })}
            onReset={() => updateVisualizer({ scale: 1 })}
          />

          <div className="grid grid-cols-2 gap-2">
            <Slider
              label="Rotation"
              value={visualizer.rotation}
              min={-180}
              max={180}
              step={5}
              unit="°"
              defaultValue={0}
              onChange={(v) => updateVisualizer({ rotation: v })}
              onReset={() => updateVisualizer({ rotation: 0 })}
            />

            <Slider
              label="Opacity"
              value={Math.round(visualizer.opacity * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              defaultValue={100}
              onChange={(v) => updateVisualizer({ opacity: v / 100 })}
              onReset={() => updateVisualizer({ opacity: 1 })}
            />
          </div>
        </CollapsibleSection>

        {/* Visualizer DSP & Geometry Section */}
        {selectedLayer === 'visualizer' && (
          <CollapsibleSection
            title="Visualizer Geometry & DSP"
            onReset={resetVisualizerSection}
          >
            <div className="space-y-1">
              <Slider
                label="Bar Count"
                value={visualizer.barCount}
                min={16}
                max={96}
                step={4}
                defaultValue={48}
                onChange={(v) => updateVisualizer({ barCount: v })}
                onReset={() => updateVisualizer({ barCount: 48 })}
              />

              <div className="grid grid-cols-2 gap-2">
                <Slider
                  label="Thickness"
                  value={visualizer.thickness}
                  min={2}
                  max={24}
                  step={1}
                  unit="px"
                  defaultValue={8}
                  onChange={(v) => updateVisualizer({ thickness: v })}
                  onReset={() => updateVisualizer({ thickness: 8 })}
                />
                <Slider
                  label="Spacing"
                  value={visualizer.spacing}
                  min={0}
                  max={16}
                  step={1}
                  unit="px"
                  defaultValue={4}
                  onChange={(v) => updateVisualizer({ spacing: v })}
                  onReset={() => updateVisualizer({ spacing: 4 })}
                />
              </div>

              <Slider
                label="Audio Sensitivity"
                value={visualizer.sensitivity}
                min={0.2}
                max={3.0}
                step={0.1}
                unit="x"
                defaultValue={1.2}
                onChange={(v) => updateVisualizer({ sensitivity: v })}
                onReset={() => updateVisualizer({ sensitivity: 1.2 })}
              />

              <Slider
                label="Frequency Smoothing"
                value={Math.round(visualizer.smoothing * 100)}
                min={20}
                max={95}
                step={5}
                unit="%"
                defaultValue={80}
                onChange={(v) => updateVisualizer({ smoothing: v / 100 })}
                onReset={() => updateVisualizer({ smoothing: 0.8 })}
              />
            </div>
          </CollapsibleSection>
        )}

        {/* Appearance & Color Section */}
        <CollapsibleSection title="Appearance & Shading">
          <div className="flex items-center gap-2 text-2xs text-d2-textSubtle mb-1">
            <Palette className="w-3 h-3 text-d2-accent" />
            <span>Color Harmonies & Glow</span>
          </div>

          <ColorPicker
            label="Primary Color"
            value={visualizer.primaryColor}
            onChange={(c) => updateVisualizer({ primaryColor: c })}
          />

          <ColorPicker
            label="Accent / Gradient"
            value={visualizer.accentColor}
            onChange={(c) => updateVisualizer({ accentColor: c })}
          />

          <Slider
            label="Bloom / Glow"
            value={visualizer.glow}
            min={0}
            max={40}
            step={2}
            unit="px"
            defaultValue={15}
            onChange={(v) => updateVisualizer({ glow: v })}
            onReset={() => updateVisualizer({ glow: 15 })}
          />
        </CollapsibleSection>

        {/* Text Layer Settings if selected */}
        {selectedLayer === 'text' && (
          <CollapsibleSection title="Typography Bounds">
            <Slider
              label="Vertical Offset"
              value={text.positionY}
              min={-50}
              max={50}
              step={1}
              unit="%"
              defaultValue={-20}
              onChange={(v) => updateText({ positionY: v })}
              onReset={() => updateText({ positionY: -20 })}
            />
            <Slider
              label="Text Opacity"
              value={Math.round(text.opacity * 100)}
              min={10}
              max={100}
              step={5}
              unit="%"
              defaultValue={100}
              onChange={(v) => updateText({ opacity: v / 100 })}
              onReset={() => updateText({ opacity: 1 })}
            />
          </CollapsibleSection>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-d2-border bg-d2-surfaceElevated/20 text-3xs text-d2-textSubtle flex items-center justify-between font-mono">
        <span>Target: {selectedLayer.toUpperCase()}</span>
        <span className="flex items-center gap-1 text-d2-accent">
          <Sparkles className="w-2.5 h-2.5" />
          Live Synced
        </span>
      </div>
    </aside>
  )
}
