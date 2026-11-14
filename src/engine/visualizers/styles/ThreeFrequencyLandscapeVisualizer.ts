import * as THREE from 'three'
import { Base3DVisualizer } from '../base/Base3DVisualizer'
import { VisualizerRenderContext } from '../types'

export class ThreeFrequencyLandscapeVisualizer extends Base3DVisualizer {
  public readonly id = '3d-landscape'
  public readonly name = '3D Frequency Landscape'
  public readonly category = '3D / WebGL'
  public readonly description = '3D perspective wireframe terrain ripple powered by frequency waterfall'

  private planeMesh!: THREE.Mesh
  private gridCols: number = 48
  private gridRows: number = 28
  private heightHistory: Float32Array[] = []

  protected setupScene(): void {
    // Camera angled from above looking forward down the grid
    this.camera.position.set(0, 7, 18)
    this.camera.lookAt(0, -1, -5)

    const geom = new THREE.PlaneGeometry(
      36,
      28,
      this.gridCols - 1,
      this.gridRows - 1
    )
    geom.rotateX(-Math.PI / 2)

    const mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })

    this.planeMesh = new THREE.Mesh(geom, mat)
    this.planeMesh.position.set(0, -3, -5)
    this.scene.add(this.planeMesh)

    // Initialize history buffer for waterfall rows
    this.heightHistory = []
    for (let r = 0; r < this.gridRows; r++) {
      this.heightHistory.push(new Float32Array(this.gridCols))
    }
  }

  protected update3D(context: VisualizerRenderContext): void {
    const { audioFrame, config } = context
    const { bassEnergy } = audioFrame
    const freqs = audioFrame.normalizedFrequencies

    // 1. Update colors
    if (this.planeMesh.material instanceof THREE.MeshBasicMaterial) {
      this.planeMesh.material.color.setStyle(config.primaryColor)
      this.planeMesh.material.opacity = config.opacity
    }

    // 2. Compute new front-row frequency values (mirrored bass in center, higher on edges)
    const newRow = new Float32Array(this.gridCols)
    const halfCols = Math.floor(this.gridCols / 2)

    for (let c = 0; c < halfCols; c++) {
      const binIdx = Math.min(freqs.length - 1, Math.floor(c * 2.5))
      const mag = (freqs[binIdx] || 0) * config.sensitivity * 5.0
      // Center column has bass
      newRow[halfCols - 1 - c] = mag
      newRow[halfCols + c] = mag
    }

    // 3. Shift history backwards (waterfall ripple)
    this.heightHistory.pop()
    this.heightHistory.unshift(newRow)

    // 4. Update vertex Y positions from history
    const geom = this.planeMesh.geometry as THREE.PlaneGeometry
    const posAttr = geom.getAttribute('position')
    const posArray = posAttr.array as Float32Array

    for (let r = 0; r < this.gridRows; r++) {
      const rowData = this.heightHistory[r]
      // Attenuate height as it recedes into the distance
      const distanceFade = Math.pow(1.0 - r / this.gridRows, 0.7)

      for (let c = 0; c < this.gridCols; c++) {
        const vertexIndex = r * this.gridCols + c
        // In PlaneGeometry rotated around X, Y is up
        posArray[vertexIndex * 3 + 1] = (rowData[c] || 0) * distanceFade
      }
    }
    posAttr.needsUpdate = true

    // 5. Subtle camera audio breathing
    this.camera.position.y = 7 + bassEnergy * 0.8
  }
}
