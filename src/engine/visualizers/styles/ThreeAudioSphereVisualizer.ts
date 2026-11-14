import * as THREE from 'three'
import { Base3DVisualizer } from '../base/Base3DVisualizer'
import { VisualizerRenderContext } from '../types'

export class ThreeAudioSphereVisualizer extends Base3DVisualizer {
  public readonly id = '3d-sphere'
  public readonly name = '3D Audio Sphere'
  public readonly category = '3D / WebGL'
  public readonly description = 'Three.js wireframe sphere deforming vertices to audio frequencies'

  private sphereMesh!: THREE.Mesh
  private originalPositions!: Float32Array
  private particleSystem!: THREE.Points
  private pointCount: number = 300

  protected setupScene(): void {
    // 1. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100)
    pointLight.position.set(15, 15, 20)
    this.scene.add(pointLight)

    // 2. Icosahedron Sphere with subdivision
    const geometry = new THREE.IcosahedronGeometry(6.5, 4)
    const posAttr = geometry.getAttribute('position')
    this.originalPositions = new Float32Array(posAttr.array)

    const material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })

    this.sphereMesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.sphereMesh)

    // 3. Orbital Treble Particle Field
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(this.pointCount * 3)

    for (let i = 0; i < this.pointCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 9.5 + Math.random() * 4.0

      const sinPhi = Math.sin(phi)
      particlePositions[i * 3] = r * sinPhi * Math.cos(theta)
      particlePositions[i * 3 + 1] = r * sinPhi * Math.sin(theta)
      particlePositions[i * 3 + 2] = r * Math.cos(phi)
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    )

    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.25,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })

    this.particleSystem = new THREE.Points(particleGeo, particleMat)
    this.scene.add(this.particleSystem)
  }

  protected update3D(context: VisualizerRenderContext): void {
    const { audioFrame, config } = context
    const { subBass, bass, lowMid, mid } = audioFrame.bands
    const { trebleEnergy } = audioFrame

    const bassFactor = subBass * 0.6 + bass * 0.4
    const midFactor = (lowMid + mid) * 0.5 * config.sensitivity

    // 1. Color synchronization
    if (this.sphereMesh.material instanceof THREE.MeshBasicMaterial) {
      this.sphereMesh.material.color.setStyle(config.primaryColor)
      this.sphereMesh.material.opacity = config.opacity
    }

    if (this.particleSystem.material instanceof THREE.PointsMaterial) {
      this.particleSystem.material.color.setStyle(config.accentColor)
      this.particleSystem.material.size = 0.2 + trebleEnergy * 0.4
    }

    // 2. Scale pulse driven by Sub-Bass
    const targetScale = 1.0 + bassFactor * 0.35 * config.sensitivity
    this.sphereMesh.scale.set(targetScale, targetScale, targetScale)

    // 3. Deform vertices along normals using Mid & Treble frequencies
    const geometry = this.sphereMesh.geometry as THREE.IcosahedronGeometry
    const posAttr = geometry.getAttribute('position')
    const posArray = posAttr.array as Float32Array
    const count = posAttr.count
    const freqs = audioFrame.normalizedFrequencies

    for (let i = 0; i < count; i++) {
      const origX = this.originalPositions[i * 3]
      const origY = this.originalPositions[i * 3 + 1]
      const origZ = this.originalPositions[i * 3 + 2]

      // Normal vector of vertex on sphere
      const len = Math.sqrt(origX * origX + origY * origY + origZ * origZ) || 1
      const nx = origX / len
      const ny = origY / len
      const nz = origZ / len

      // Sample frequency bin mapped to vertex index
      const binIdx = Math.floor((i / count) * 128)
      const freqMag = (freqs[binIdx] || 0) * config.sensitivity
      const displacement = freqMag * 1.8 * (0.5 + midFactor)

      posArray[i * 3] = origX + nx * displacement
      posArray[i * 3 + 1] = origY + ny * displacement
      posArray[i * 3 + 2] = origZ + nz * displacement
    }
    posAttr.needsUpdate = true

    // 4. Rotation animation with audio velocity kick
    const rotSpeed = 0.006 + bassFactor * 0.015
    this.sphereMesh.rotation.y += rotSpeed
    this.sphereMesh.rotation.x += rotSpeed * 0.6

    this.particleSystem.rotation.y -= rotSpeed * 0.8
    this.particleSystem.rotation.z += rotSpeed * 0.5
  }
}
