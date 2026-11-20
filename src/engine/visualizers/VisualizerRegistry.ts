import { IVisualizerPlugin } from './types'
import { SpectrumBarsVisualizer } from './styles/SpectrumBarsVisualizer'
import { CircularSpectrumVisualizer } from './styles/CircularSpectrumVisualizer'
import { RadialWaveformVisualizer } from './styles/RadialWaveformVisualizer'
import { ClassicWaveformVisualizer } from './styles/ClassicWaveformVisualizer'
import { MirroredSpectrumVisualizer } from './styles/MirroredSpectrumVisualizer'
import { DualRingsVisualizer } from './styles/DualRingsVisualizer'
import { ThreeAudioSphereVisualizer } from './styles/ThreeAudioSphereVisualizer'
import { ThreeFrequencyLandscapeVisualizer } from './styles/ThreeFrequencyLandscapeVisualizer'
import { AudioRadarVisualizer } from './styles/AudioRadarVisualizer'
import { ParticleVisualizer } from './styles/ParticleVisualizer'

// 20 New Professional Audio-Reactive Visualizers (v0.2.0)
import { PremiumSpectrumBarsVisualizer } from './styles/PremiumSpectrumBarsVisualizer'
import { GradientSpectrumVisualizer } from './styles/GradientSpectrumVisualizer'
import { FloatingSpectrumVisualizer } from './styles/FloatingSpectrumVisualizer'
import { MirroredFrequencyVisualizer } from './styles/MirroredFrequencyVisualizer'
import { EqualizerColumnsVisualizer } from './styles/EqualizerColumnsVisualizer'
import { NeonWaveformVisualizer } from './styles/NeonWaveformVisualizer'
import { DualAudioWaveformVisualizer } from './styles/DualAudioWaveformVisualizer'
import { SmoothOscilloscopeVisualizer } from './styles/SmoothOscilloscopeVisualizer'
import { EnergyWaveformVisualizer } from './styles/EnergyWaveformVisualizer'
import { MinimalLineWaveformVisualizer } from './styles/MinimalLineWaveformVisualizer'
import { DualRingSpectrumVisualizer } from './styles/DualRingSpectrumVisualizer'
import { RadialEnergyPulseVisualizer } from './styles/RadialEnergyPulseVisualizer'
import { CircularFrequencyBarsVisualizer } from './styles/CircularFrequencyBarsVisualizer'
import { OrbitSpectrumVisualizer } from './styles/OrbitSpectrumVisualizer'
import { RotatingAudioRingVisualizer } from './styles/RotatingAudioRingVisualizer'
import { ParticleAudioFieldVisualizer } from './styles/ParticleAudioFieldVisualizer'
import { CosmicFrequencyVisualizer } from './styles/CosmicFrequencyVisualizer'
import { LaserAudioLinesVisualizer } from './styles/LaserAudioLinesVisualizer'
import { DigitalGridSpectrumVisualizer } from './styles/DigitalGridSpectrumVisualizer'
import { LiquidEnergyVisualizer } from './styles/LiquidEnergyVisualizer'
import { AuroraWaveVisualizer } from './styles/AuroraWaveVisualizer'
import { HyperTunnelVisualizer } from './styles/HyperTunnelVisualizer'
import { NeonPulseRingsVisualizer } from './styles/NeonPulseRingsVisualizer'

export interface VisualizerInfo {
  id: string
  name: string
  category: string
  renderType: '2d' | '3d'
  description: string
}

export class VisualizerRegistry {
  private static instance: VisualizerRegistry | null = null

  private plugins = new Map<string, IVisualizerPlugin>()
  private activePluginId: string = 'spectrum-bars'

  private constructor() {
    this.registerDefaultPlugins()
  }

  public static getInstance(): VisualizerRegistry {
    if (!VisualizerRegistry.instance) {
      VisualizerRegistry.instance = new VisualizerRegistry()
    }
    return VisualizerRegistry.instance
  }

  private registerDefaultPlugins(): void {
    // Original styles
    this.registerPlugin(new SpectrumBarsVisualizer())
    this.registerPlugin(new CircularSpectrumVisualizer())
    this.registerPlugin(new RadialWaveformVisualizer())
    this.registerPlugin(new ClassicWaveformVisualizer())
    this.registerPlugin(new MirroredSpectrumVisualizer())
    this.registerPlugin(new DualRingsVisualizer())
    this.registerPlugin(new ThreeAudioSphereVisualizer())
    this.registerPlugin(new ThreeFrequencyLandscapeVisualizer())
    this.registerPlugin(new AudioRadarVisualizer())
    this.registerPlugin(new ParticleVisualizer())

    // 20 New v0.2.0 Styles
    this.registerPlugin(new PremiumSpectrumBarsVisualizer())
    this.registerPlugin(new GradientSpectrumVisualizer())
    this.registerPlugin(new FloatingSpectrumVisualizer())
    this.registerPlugin(new MirroredFrequencyVisualizer())
    this.registerPlugin(new EqualizerColumnsVisualizer())
    this.registerPlugin(new NeonWaveformVisualizer())
    this.registerPlugin(new DualAudioWaveformVisualizer())
    this.registerPlugin(new SmoothOscilloscopeVisualizer())
    this.registerPlugin(new EnergyWaveformVisualizer())
    this.registerPlugin(new MinimalLineWaveformVisualizer())
    this.registerPlugin(new DualRingSpectrumVisualizer())
    this.registerPlugin(new RadialEnergyPulseVisualizer())
    this.registerPlugin(new CircularFrequencyBarsVisualizer())
    this.registerPlugin(new OrbitSpectrumVisualizer())
    this.registerPlugin(new RotatingAudioRingVisualizer())
    this.registerPlugin(new ParticleAudioFieldVisualizer())
    this.registerPlugin(new CosmicFrequencyVisualizer())
    this.registerPlugin(new LaserAudioLinesVisualizer())
    this.registerPlugin(new DigitalGridSpectrumVisualizer())
    this.registerPlugin(new LiquidEnergyVisualizer())
    this.registerPlugin(new AuroraWaveVisualizer())
    this.registerPlugin(new HyperTunnelVisualizer())
    this.registerPlugin(new NeonPulseRingsVisualizer())
  }

  /**
   * Registers a visualizer plugin. Allows adding modular styles dynamically.
   */
  public registerPlugin(plugin: IVisualizerPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[VisualizerRegistry] Overwriting plugin with id: ${plugin.id}`)
    }
    this.plugins.set(plugin.id, plugin)
  }

  /**
   * Returns a list of all registered visualizer metadata
   */
  public getAllVisualizers(): VisualizerInfo[] {
    return Array.from(this.plugins.values()).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      renderType: p.renderType,
      description: p.description,
    }))
  }

  /**
   * Gets a visualizer plugin instance by ID
   */
  public getVisualizer(id: string): IVisualizerPlugin | undefined {
    return this.plugins.get(id)
  }

  public createVisualizer(id: string): IVisualizerPlugin | undefined {
    const plugin = this.plugins.get(id)
    if (!plugin) return undefined
    const Plugin = plugin.constructor as new () => IVisualizerPlugin
    return new Plugin()
  }

  /**
   * Sets the active visualizer, safely disposing previous 3D contexts if switching
   */
  public setActiveVisualizer(id: string): IVisualizerPlugin {
    if (this.plugins.has(id)) {
      this.activePluginId = id
      return this.plugins.get(id)!
    }
    console.warn(`[VisualizerRegistry] Unknown visualizer ID "${id}", falling back to spectrum-bars`)
    this.activePluginId = 'spectrum-bars'
    return this.plugins.get('spectrum-bars')!
  }

  public getActiveVisualizer(): IVisualizerPlugin {
    return this.plugins.get(this.activePluginId) || this.plugins.get('spectrum-bars')!
  }

  public disposeAll(): void {
    for (const plugin of this.plugins.values()) {
      plugin.dispose()
    }
  }
}
