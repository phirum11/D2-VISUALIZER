import * as THREE from 'three'
import {
  IVisualizerPlugin,
  VisualizerCategory,
  VisualizerRenderType,
  VisualizerRenderContext,
} from '../types'

export abstract class Base3DVisualizer implements IVisualizerPlugin {
  public abstract readonly id: string
  public abstract readonly name: string
  public abstract readonly category: VisualizerCategory
  public readonly renderType: VisualizerRenderType = '3d'
  public abstract readonly description: string

  protected scene: THREE.Scene
  protected camera: THREE.PerspectiveCamera
  protected renderer: THREE.WebGLRenderer | null = null
  protected internalWidth: number = 1920
  protected internalHeight: number = 1080
  protected initialized: boolean = false

  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000)
    this.camera.position.z = 25

  }

  public init(_container: HTMLElement | HTMLCanvasElement): void {
    if (this.initialized) return
    // Allocate a GPU context only when the style is actually rendered.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0) // transparent background
    this.renderer.setPixelRatio(1)
    this.setupScene()
    this.initialized = true
    this.renderer.setSize(this.internalWidth, this.internalHeight, false)
  }

  /**
   * Subclasses set up geometries, lights, materials, and meshes
   */
  protected abstract setupScene(): void

  /**
   * Subclasses update 3D objects according to audio and config
   */
  protected abstract update3D(context: VisualizerRenderContext): void

  public render(context: VisualizerRenderContext): void {
    const renderScale = context.renderScale ?? 1
    this.resize(Math.max(1, Math.round(context.width * renderScale)), Math.max(1, Math.round(context.height * renderScale)))
    if (!this.initialized) {
      this.init(context.canvas)
    }

    // Update 3D geometry / animation
    this.update3D(context)

    // Render WebGL frame
    this.renderer!.render(this.scene, this.camera)

    // Composite WebGL output onto 2D master canvas
    if (context.ctx2d) {
      const { ctx2d, width, height, config, effects, audioFrame } = context
      ctx2d.save()

      const centerX = width / 2 + (config.positionX / 100) * width
      const centerY = height / 2 + (config.positionY / 100) * height
      const { subBass, bass } = audioFrame.bands
      const beatScale =
        effects.beatPulse > 0
          ? 1 + (subBass * 0.45 + bass * 0.25) * (effects.beatPulse / 100)
          : 1

      ctx2d.translate(centerX, centerY)
      ctx2d.scale(config.scale * beatScale, config.scale * beatScale)
      ctx2d.rotate((config.rotation * Math.PI) / 180)
      ctx2d.globalAlpha = config.opacity

      // Draw WebGL canvas centered at origin
      ctx2d.drawImage(
        this.renderer!.domElement,
        -width / 2,
        -height / 2,
        width,
        height
      )

      ctx2d.restore()
    }
  }

  public resize(width: number, height: number): void {
    if (this.internalWidth !== width || this.internalHeight !== height) {
      this.internalWidth = width
      this.internalHeight = height
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer?.setSize(width, height, false)
    }
  }

  public dispose(): void {
    // Traverse scene and recursively dispose geometries, materials, textures
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        if (obj.geometry) {
          obj.geometry.dispose()
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      }
    })

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0])
    }

    this.renderer?.dispose()
    this.renderer?.forceContextLoss()
    this.renderer = null
    this.initialized = false
  }
}
