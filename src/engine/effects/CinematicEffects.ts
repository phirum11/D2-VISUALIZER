import {
  EffectsConfig,
  CinematicMotionConfig,
  CameraEasingType,
} from '@/stores/compositionStore'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'

export class CinematicEffects {
  private static instance: CinematicEffects | null = null

  // Pre-rendered noise canvas pattern for 60fps film grain without per-frame CPU noise computation
  private grainCanvas: HTMLCanvasElement | null = null
  private grainPattern: CanvasPattern | null = null
  private grainPatternWidth: number = 256
  private grainPatternHeight: number = 256

  private constructor() {
    this.createGrainPattern()
  }

  public static getInstance(): CinematicEffects {
    if (!CinematicEffects.instance) {
      CinematicEffects.instance = new CinematicEffects()
    }
    return CinematicEffects.instance
  }

  private createGrainPattern(): void {
    if (typeof document === 'undefined') return

    this.grainCanvas = document.createElement('canvas')
    this.grainCanvas.width = this.grainPatternWidth
    this.grainCanvas.height = this.grainPatternHeight
    const ctx = this.grainCanvas.getContext('2d')
    if (!ctx) return

    const imgData = ctx.createImageData(this.grainPatternWidth, this.grainPatternHeight)
    const data = imgData.data

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255)
      data[i] = val // R
      data[i + 1] = val // G
      data[i + 2] = val // B
      data[i + 3] = 40 // base alpha
    }

    ctx.putImageData(imgData, 0, 0)
    this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat')
  }

  /**
   * Evaluates standard motion easing curves (0.0 to 1.0)
   */
  public evaluateEasing(t: number, easing: CameraEasingType = 'ease-in-out'): number {
    const clamped = Math.max(0, Math.min(1, t))
    switch (easing) {
      case 'linear':
        return clamped

      case 'smooth-step':
        return clamped * clamped * (3 - 2 * clamped)

      case 'sine':
        return (1 - Math.cos(Math.PI * clamped)) / 2

      case 'cubic':
        return clamped < 0.5
          ? 4 * clamped * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 3) / 2

      case 'exponential':
        if (clamped === 0) return 0
        if (clamped === 1) return 1
        return clamped < 0.5
          ? Math.pow(2, 20 * clamped - 10) / 2
          : (2 - Math.pow(2, -20 * clamped + 10)) / 2

      case 'ease-in-out':
      default:
        return clamped < 0.5
          ? 2 * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 2) / 2
    }
  }

  /**
   * Computes ping-pong progress (0 -> 1 -> 0) over cycle period with easing
   */
  public evaluatePingPong(
    time: number,
    period: number,
    easing: CameraEasingType = 'ease-in-out'
  ): number {
    const cycle = (time % period) / period
    const linearProgress = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2
    return this.evaluateEasing(linearProgress, easing)
  }

  /**
   * Computes camera motion transform matrix (scale, offsetX, offsetY, rotation) deterministically from timestamp
   */
  public getCameraMotion(
    motion: CinematicMotionConfig,
    audioFrame: AudioFrameData,
    timestamp: number,
    _width: number = 1920,
    _height: number = 1080
  ): { scale: number; translateX: number; translateY: number; rotation: number } {
    let scale = 1.0
    let translateX = 0
    let translateY = 0
    let rotation = 0

    const intensity = motion.intensity ?? 1.0
    const rawSpeed = motion.speed ?? 1.0
    const easing = motion.easingType ?? 'ease-in-out'

    // Beat-Sync timing integration
    let timeScale = rawSpeed
    if (motion.beatSync) {
      // Synchronize time phase with standard 120BPM / division
      const divMultiplier =
        motion.beatSyncDivision === '1/4'
          ? 4.0
          : motion.beatSyncDivision === '1/2'
          ? 2.0
          : motion.beatSyncDivision === '2'
          ? 0.5
          : motion.beatSyncDivision === '4'
          ? 0.25
          : 1.0
      timeScale = rawSpeed * divMultiplier * 1.2
    }

    const t = timestamp * timeScale
    const panDist = (motion.panDistance ?? 35) * intensity
    const zoomFactor = ((motion.zoomStrength ?? 40) / 100) * 0.16 * intensity
    const rotAmount = (motion.rotationAmount ?? 2.0) * intensity
    const smoothness = (motion.smoothness ?? 80) / 100

    const { subBass, bass } = audioFrame.bands
    const bassImpact = subBass * 0.65 + bass * 0.35

    // Safe border overscan margin to prevent black edges during camera pan & tilt
    const isMotionActive = motion.preset !== 'none' && motion.preset !== 'static'
    const safeOverscan = isMotionActive
      ? 1.08 + (panDist / 500) * 0.04 + (rotAmount / 15) * 0.03
      : 1.0
    scale = safeOverscan

    // Base cycle durations (seconds)
    const zoomPeriod = Math.max(2.5, 9.0 / (rawSpeed || 1.0))
    const panPeriod = Math.max(3.0, 11.0 / (rawSpeed || 1.0))

    switch (motion.preset) {
      // ========================================================
      // 1. BASIC CINEMATIC
      // ========================================================
      case 'static':
      case 'none':
        scale = 1.0
        translateX = 0
        translateY = 0
        rotation = 0
        break

      case 'slow-zoom-in': {
        const progress = this.evaluatePingPong(t, zoomPeriod, easing)
        scale += progress * zoomFactor
        break
      }

      case 'slow-zoom-out': {
        const progress = this.evaluatePingPong(t, zoomPeriod, easing)
        scale += (1 - progress) * zoomFactor
        break
      }

      case 'push-in':
      case 'slow-push-in': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.75, easing)
        scale += progress * zoomFactor * 1.2
        break
      }

      case 'pull-out': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.75, easing)
        scale += (1 - progress) * zoomFactor * 1.2
        break
      }

      case 'pan-left': {
        const progress = this.evaluatePingPong(t, panPeriod, easing)
        translateX = (progress * 2 - 1) * panDist
        break
      }

      case 'pan-right': {
        const progress = this.evaluatePingPong(t, panPeriod, easing)
        translateX = -(progress * 2 - 1) * panDist
        break
      }

      case 'pan-up':
      case 'vertical-pan-up':
      case 'vertical-pan': {
        const progress = this.evaluatePingPong(t, panPeriod * 0.9, easing)
        translateY = (progress * 2 - 1) * (panDist * 0.75)
        break
      }

      case 'pan-down':
      case 'vertical-pan-down': {
        const progress = this.evaluatePingPong(t, panPeriod * 0.9, easing)
        translateY = -(progress * 2 - 1) * (panDist * 0.75)
        break
      }

      // ========================================================
      // 2. CINEMATIC
      // ========================================================
      case 'smooth-ken-burns':
      case 'ken-burns': {
        // Classic documentary pan & continuous push
        const panProg = this.evaluatePingPong(t, panPeriod * 1.2, easing)
        const zoomProg = this.evaluatePingPong(t, zoomPeriod * 1.4, easing)
        translateX = (panProg * 2 - 1) * panDist
        translateY = (1 - panProg * 2) * (panDist * 0.65)
        scale += zoomProg * zoomFactor * 1.3
        rotation = Math.sin(t * 0.15) * (rotAmount * 0.4)
        break
      }

      case 'cinematic-drift':
      case 'smooth-drift':
      case 'subtle-motion': {
        // Compound multi-axis compound drift
        translateX = Math.sin(t * 0.3) * (panDist * 0.65)
        translateY = Math.cos(t * 0.22) * (panDist * 0.5)
        scale += (Math.sin(t * 0.18) * 0.5 + 0.5) * (zoomFactor * 0.45)
        rotation = Math.sin(t * 0.16) * (rotAmount * 0.75)
        break
      }

      case 'floating-camera': {
        // Zero-gravity weightless camera rig
        translateX = Math.sin(t * 0.35) * (panDist * 0.45) + Math.cos(t * 0.7) * 4
        translateY = Math.cos(t * 0.45) * (panDist * 0.6) + Math.sin(t * 0.8) * 4
        scale += (Math.sin(t * 0.25) * 0.5 + 0.5) * (zoomFactor * 0.35)
        rotation = Math.sin(t * 0.2) * (rotAmount * 0.5)
        break
      }

      case 'subtle-handheld':
      case 'handheld': {
        // Multi-frequency organic handheld micro-camera sway
        const d1 = Math.sin(t * 1.1) * 6 + Math.sin(t * 2.5) * 2.5 + Math.cos(t * 0.35) * 7
        const d2 = Math.cos(t * 0.85) * 5 + Math.sin(t * 1.9) * 2.0 + Math.sin(t * 0.28) * 5
        translateX = d1 * intensity * (1.1 - smoothness * 0.3)
        translateY = d2 * intensity * (1.1 - smoothness * 0.3)
        rotation = Math.sin(t * 0.65) * (rotAmount * 0.6)
        scale += Math.sin(t * 0.4) * (zoomFactor * 0.2)
        break
      }

      case 'parallax-movement':
      case 'parallax': {
        // Lissajous figure-8 optical trajectory
        translateX = Math.sin(t * 0.3) * panDist
        translateY = Math.sin(t * 0.6) * (panDist * 0.5)
        rotation = Math.cos(t * 0.3) * (rotAmount * 0.85)
        scale += (Math.cos(t * 0.3) * 0.5 + 0.5) * zoomFactor * 0.9
        break
      }

      // ========================================================
      // 3. ADVANCED CINEMATIC
      // ========================================================
      case 'dolly-in': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.9, 'cubic')
        scale += progress * zoomFactor * 1.5
        translateX = Math.sin(t * 0.2) * (panDist * 0.2)
        break
      }

      case 'dolly-out': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.9, 'cubic')
        scale += (1 - progress) * zoomFactor * 1.5
        translateX = Math.sin(t * 0.2) * (panDist * 0.2)
        break
      }

      case 'crane-up': {
        const progress = this.evaluatePingPong(t, panPeriod, easing)
        translateY = (progress * 2 - 1) * panDist * 0.85
        scale += progress * zoomFactor * 0.4
        rotation = (progress * 2 - 1) * (rotAmount * 0.5)
        break
      }

      case 'crane-down': {
        const progress = this.evaluatePingPong(t, panPeriod, easing)
        translateY = -(progress * 2 - 1) * panDist * 0.85
        scale += progress * zoomFactor * 0.4
        rotation = -(progress * 2 - 1) * (rotAmount * 0.5)
        break
      }

      case 'orbit-left': {
        translateX = Math.cos(t * 0.35) * (panDist * 0.85)
        translateY = Math.sin(t * 0.35) * (panDist * 0.5)
        rotation = -Math.sin(t * 0.35) * rotAmount * 1.2
        scale += (Math.sin(t * 0.7) * 0.5 + 0.5) * (zoomFactor * 0.35)
        break
      }

      case 'orbit-right': {
        translateX = -Math.cos(t * 0.35) * (panDist * 0.85)
        translateY = Math.sin(t * 0.35) * (panDist * 0.5)
        rotation = Math.sin(t * 0.35) * rotAmount * 1.2
        scale += (Math.sin(t * 0.7) * 0.5 + 0.5) * (zoomFactor * 0.35)
        break
      }

      // ========================================================
      // 4. DYNAMIC MOTION
      // ========================================================
      case 'dynamic-zoom':
      case 'zoom-pulse': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.55, 'sine')
        scale += progress * zoomFactor * 1.3
        break
      }

      case 'camera-rotation-drift':
      case 'rotation-drift': {
        const rotProg = this.evaluatePingPong(t, panPeriod * 0.8, 'smooth-step')
        rotation = (rotProg * 2 - 1) * rotAmount * 1.6
        translateX = Math.sin(t * 0.25) * (panDist * 0.35)
        break
      }

      case 'truck-left': {
        const progress = this.evaluatePingPong(t, panPeriod, 'ease-in-out')
        translateX = (progress * 2 - 1) * panDist * 1.1
        break
      }

      case 'truck-right': {
        const progress = this.evaluatePingPong(t, panPeriod, 'ease-in-out')
        translateX = -(progress * 2 - 1) * panDist * 1.1
        break
      }

      // ========================================================
      // 5. AUDIO REACTIVE PRESETS
      // ========================================================
      case 'beat-zoom': {
        scale += bassImpact * (zoomFactor * 1.6)
        rotation = Math.sin(t * 0.5) * (rotAmount * 0.4)
        break
      }

      case 'bass-pulse':
      case 'beat-sync-zoom':
      case 'beat-pulse': {
        scale += (subBass * 0.7 + bass * 0.3) * (zoomFactor * 1.85)
        translateY = subBass * 8 * intensity
        break
      }

      case 'kick-pulse-cam': {
        const isKick = audioFrame.bassEnergy > 0.65 || subBass > 0.7
        if (isKick) {
          scale += 0.08 * intensity
          translateX += (Math.random() - 0.5) * 6 * intensity
          translateY += (Math.random() - 0.5) * 6 * intensity
        }
        break
      }

      case 'energy-drift-cam': {
        const energy = audioFrame.overallEnergy
        translateX = Math.sin(t * 0.4 + energy) * (panDist * 0.8)
        translateY = Math.cos(t * 0.35 + energy) * (panDist * 0.6)
        rotation = Math.sin(t * 0.3) * (rotAmount * 1.2) * (0.8 + energy * 0.4)
        scale += energy * (zoomFactor * 0.8)
        break
      }

      // ========================================================
      // 6. EPIC EXTENDED CINEMATIC PRESETS
      // ========================================================
      case 'warp-speed-push': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 0.6, 'exponential')
        scale += Math.pow(progress, 2.2) * zoomFactor * 2.2
        rotation = Math.sin(t * 0.8) * (rotAmount * 0.4)
        break
      }

      case 'earthquake-shaker': {
        const isHeavy = subBass > 0.4 || audioFrame.bassEnergy > 0.55
        const amp = isHeavy ? 1.0 : 0.25
        translateX = (Math.sin(t * 32) * 5 + Math.sin(t * 54) * 2.5) * intensity * amp
        translateY = (Math.cos(t * 28) * 5 + Math.cos(t * 48) * 2.5) * intensity * amp
        rotation = Math.sin(t * 24) * 1.5 * intensity * amp
        scale += (Math.sin(t * 16) * 0.04 + bassImpact * 0.06) * intensity
        break
      }

      case 'spiral-dolly': {
        const progress = this.evaluatePingPong(t, zoomPeriod * 1.1, 'cubic')
        scale += progress * zoomFactor * 1.6
        translateX = Math.sin(t * 0.55) * (panDist * 0.45)
        translateY = Math.cos(t * 0.55) * (panDist * 0.45)
        rotation = Math.sin(t * 0.55) * (rotAmount * 2.2)
        break
      }

      case 'vortex-roll': {
        rotation = Math.sin(t * 0.35) * (rotAmount * 3.5)
        scale += (Math.sin(t * 0.7) * 0.5 + 0.5) * (zoomFactor * 0.4)
        translateX = Math.sin(t * 0.35) * (panDist * 0.4)
        translateY = Math.cos(t * 0.35) * (panDist * 0.3)
        break
      }

      case 'drone-chase': {
        translateX = Math.sin(t * 0.45) * (panDist * 1.2)
        translateY = Math.sin(t * 0.9) * (panDist * 0.55)
        rotation = Math.cos(t * 0.45) * (rotAmount * 2.8)
        scale += (Math.sin(t * 0.45) * 0.5 + 0.5) * (zoomFactor * 0.75)
        break
      }

      case 'hyper-zoom-pulse': {
        const pulse = Math.pow(Math.abs(Math.sin(t * 2.2)), 3.5)
        scale += (pulse * 0.6 + bassImpact * 0.8) * zoomFactor * 1.8
        rotation = Math.sin(t * 1.1) * (rotAmount * 0.5)
        break
      }

      default:
        break
    }

    // ========================================================
    // CUSTOM START & END FRAMING INTERPOLATION
    // ========================================================
    if (
      motion.startZoom !== undefined &&
      motion.endZoom !== undefined &&
      (motion.startZoom !== 1.0 || motion.endZoom !== 1.15)
    ) {
      const cycle = this.evaluatePingPong(t, zoomPeriod * 1.2, easing)
      const customZoomDelta = (motion.endZoom - motion.startZoom) * cycle
      scale += customZoomDelta
    }

    if (motion.startPanX !== undefined && motion.endPanX !== undefined && motion.startPanX !== motion.endPanX) {
      const cycle = this.evaluatePingPong(t, panPeriod, easing)
      translateX += motion.startPanX + (motion.endPanX - motion.startPanX) * cycle
    }

    if (motion.startPanY !== undefined && motion.endPanY !== undefined && motion.startPanY !== motion.endPanY) {
      const cycle = this.evaluatePingPong(t, panPeriod, easing)
      translateY += motion.startPanY + (motion.endPanY - motion.startPanY) * cycle
    }

    if (
      motion.startRotation !== undefined &&
      motion.endRotation !== undefined &&
      motion.startRotation !== motion.endRotation
    ) {
      const cycle = this.evaluatePingPong(t, panPeriod, easing)
      rotation += motion.startRotation + (motion.endRotation - motion.startRotation) * cycle
    }

    // ========================================================
    // INDEPENDENT AUDIO-REACTIVE CAMERA ADJUSTMENTS
    // ========================================================
    if (motion.beatZoom && motion.beatZoom > 0) {
      scale += (motion.beatZoom / 100) * (bassImpact * 0.1)
    }

    if (motion.bassImpactZoom && motion.bassImpactZoom > 0) {
      if (subBass > 0.45) {
        scale += (motion.bassImpactZoom / 100) * (subBass * 0.09)
      }
    }

    if (motion.kickPulse && motion.kickPulse > 0) {
      if (audioFrame.bassEnergy > 0.65 || subBass > 0.7) {
        scale += (motion.kickPulse / 100) * 0.065
      }
    }

    if (motion.energyMovement && motion.energyMovement > 0) {
      const energyOffset = (motion.energyMovement / 100) * (audioFrame.overallEnergy * 22)
      translateX += Math.sin(t * 1.6) * energyOffset
      translateY += Math.cos(t * 1.3) * energyOffset
    }

    return { scale, translateX, translateY, rotation }
  }

  /**
   * Applies post-processing visual effects onto master canvas
   */
  public applyPostEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    effects: EffectsConfig,
    _audioFrame: AudioFrameData,
    timestamp: number
  ): void {
    ctx.save()

    // 1. Color Tint Overlay
    if (effects.colorTintOpacity > 0 && effects.colorTint) {
      ctx.fillStyle = effects.colorTint
      ctx.globalAlpha = effects.colorTintOpacity / 100
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1
    }

    // 2. Film Grain (Procedural Pattern)
    if (effects.grain > 0 && this.grainPattern) {
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = (effects.grain / 100) * 0.35
      // Micro-jitter pattern origin to simulate natural 24/30fps film flicker
      const jitterX = Math.floor(Math.sin(timestamp * 47) * 64)
      const jitterY = Math.floor(Math.cos(timestamp * 31) * 64)
      ctx.translate(jitterX, jitterY)
      ctx.fillStyle = this.grainPattern
      ctx.fillRect(-jitterX, -jitterY, width, height)
      ctx.restore()
    }

    // 3. Vignette
    if (effects.vignette > 0) {
      const radius = Math.max(width, height) * 0.7
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        radius * 0.35,
        width / 2,
        height / 2,
        radius
      )
      const vignetteAlpha = (effects.vignette / 100) * 0.85
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
      grad.addColorStop(1, `rgba(0, 0, 0, ${vignetteAlpha})`)

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }

    // 4. Soft Lens Glow (Radial Atmosphere Bloom)
    if (effects.softLensGlow > 0) {
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.55
      )
      const glowAlpha = (effects.softLensGlow / 100) * 0.28
      glowGrad.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`)
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }

    // 5. Light Leaks Overlay (Cinematic Lens Flare)
    if (effects.lightLeaks > 0) {
      const leakGrad = ctx.createRadialGradient(
        width * 0.15 + Math.sin(timestamp * 0.5) * 50,
        height * 0.15 + Math.cos(timestamp * 0.4) * 30,
        0,
        width * 0.2,
        height * 0.2,
        width * 0.6
      )
      const leakAlpha = (effects.lightLeaks / 100) * 0.4
      leakGrad.addColorStop(0, `rgba(251, 146, 60, ${leakAlpha})`)
      leakGrad.addColorStop(0.5, `rgba(244, 63, 94, ${leakAlpha * 0.5})`)
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = leakGrad
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }

    // 6. Chromatic Aberration / RGB Split
    if (effects.chromaticAberration > 0) {
      const offset = (effects.chromaticAberration / 100) * 12
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.22
      ctx.drawImage(ctx.canvas, -offset, 0, width, height)
      ctx.drawImage(ctx.canvas, offset, 0, width, height)
      ctx.restore()
    }

    ctx.restore()
  }
}
