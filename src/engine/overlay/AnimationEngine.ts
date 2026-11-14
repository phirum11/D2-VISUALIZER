import { AnimationConfig, TextAnimationPreset } from './types'

export interface ComputedAnimationState {
  opacity: number
  scale: number
  offsetX: number
  offsetY: number
  letterSpacingBonus: number
  visibleText: string
  blur: number
  glitchOffset: number
  isVisible: boolean
}

export class AnimationEngine {
  private static ease(t: number, easing: AnimationConfig['easing']): number {
    const clamped = Math.max(0, Math.min(1, t))
    switch (easing) {
      case 'ease-in':
        return clamped * clamped
      case 'ease-out':
        return clamped * (2 - clamped)
      case 'ease-in-out':
        return clamped < 0.5
          ? 2 * clamped * clamped
          : -1 + (4 - 2 * clamped) * clamped
      case 'linear':
      default:
        return clamped
    }
  }

  /**
   * Computes the deterministic transform state of an overlay at the exact timestamp
   */
  public static compute(
    timestamp: number,
    startTime: number,
    endTime: number,
    baseOpacity: number,
    fullText: string,
    config: AnimationConfig
  ): ComputedAnimationState {
    // 1. Time boundary check
    if (timestamp < startTime || (endTime > startTime && timestamp > endTime)) {
      return {
        opacity: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        letterSpacingBonus: 0,
        visibleText: fullText,
        blur: 0,
        glitchOffset: 0,
        isVisible: false,
      }
    }

    const animStart = startTime + (config.delay || 0)
    const duration = Math.max(0.1, config.duration || 1.0)
    const intensity = config.intensity ?? 1.0

    // Normalized progress 0 -> 1 during entrance animation
    const rawProgress = (timestamp - animStart) / duration
    const progress = this.ease(rawProgress, config.easing)

    // Check for exit fade near endTime
    let exitFactor = 1.0
    if (endTime > startTime && endTime - timestamp < duration) {
      const exitProgress = (endTime - timestamp) / duration
      exitFactor = this.ease(exitProgress, 'ease-out')
    }

    let opacity = baseOpacity * exitFactor
    let scale = 1.0
    let offsetX = 0
    let offsetY = 0
    let letterSpacingBonus = 0
    let visibleText = fullText
    let blur = 0
    let glitchOffset = 0

    const preset: TextAnimationPreset = config.preset || 'none'

    switch (preset) {
      case 'fade-in':
        opacity = baseOpacity * progress * exitFactor
        break

      case 'fade-out':
        // Fades out continuously from startTime to endTime or duration
        opacity = baseOpacity * (1 - progress)
        break

      case 'fade-in-out':
        opacity = baseOpacity * progress * exitFactor
        break

      case 'slide-up':
        opacity = baseOpacity * progress * exitFactor
        offsetY = (1 - progress) * 50 * intensity
        break

      case 'slide-down':
        opacity = baseOpacity * progress * exitFactor
        offsetY = -(1 - progress) * 50 * intensity
        break

      case 'slide-left':
        opacity = baseOpacity * progress * exitFactor
        offsetX = (1 - progress) * 60 * intensity
        break

      case 'slide-right':
        opacity = baseOpacity * progress * exitFactor
        offsetX = -(1 - progress) * 60 * intensity
        break

      case 'zoom-in':
        opacity = baseOpacity * progress * exitFactor
        scale = 0.5 + 0.5 * progress
        break

      case 'zoom-out':
        opacity = baseOpacity * progress * exitFactor
        scale = 1.4 - 0.4 * progress
        break

      case 'typewriter': {
        opacity = baseOpacity * exitFactor
        const charCount = Math.floor(fullText.length * progress)
        visibleText = fullText.slice(0, Math.max(0, charCount))
        break
      }

      case 'letter-reveal': {
        opacity = baseOpacity * progress * exitFactor
        letterSpacingBonus = (1 - progress) * 12 * intensity
        break
      }

      case 'tracking-reveal': {
        opacity = baseOpacity * progress * exitFactor
        letterSpacingBonus = (1 - progress) * 18 * intensity
        scale = 0.95 + 0.05 * progress
        break
      }

      case 'blur-in': {
        opacity = baseOpacity * progress * exitFactor
        blur = Math.max(0, (1 - progress) * 16 * intensity)
        break
      }

      case 'glitch-reveal': {
        opacity = baseOpacity * progress * exitFactor
        if (progress < 0.75) {
          // Deterministic pseudo-random glitch offset
          const glitchPhase = Math.sin(timestamp * 80 + progress * 20)
          glitchOffset = Math.sin(glitchPhase) * 8 * intensity * (1 - progress)
        }
        break
      }

      case 'cinematic-title': {
        // Dramatic slow tracking + subtle scale drift + smooth fade
        opacity = baseOpacity * progress * exitFactor
        letterSpacingBonus = (1 - progress) * 14 * intensity
        scale = 1.0 + ((timestamp - startTime) * 0.008) * intensity
        break
      }

      case 'none':
      default:
        // No animation, solid presentation
        break
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      scale,
      offsetX,
      offsetY,
      letterSpacingBonus,
      visibleText,
      blur,
      glitchOffset,
      isVisible: opacity > 0.005,
    }
  }
}
