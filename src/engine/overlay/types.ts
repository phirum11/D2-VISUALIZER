export type OverlayType = 'text' | 'artwork' | 'logo' | 'credits'

export type TextRole =
  | 'title'
  | 'artist'
  | 'album'
  | 'subtitle'
  | 'genre'
  | 'credits'
  | 'custom'

export type TextAnimationPreset =
  | 'none'
  | 'fade-in'
  | 'fade-out'
  | 'fade-in-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'typewriter'
  | 'letter-reveal'
  | 'tracking-reveal'
  | 'blur-in'
  | 'glitch-reveal'
  | 'cinematic-title'

export type WatermarkPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'custom'

export type ArtworkShape = 'square' | 'circle' | 'rounded'

export interface AnimationConfig {
  preset: TextAnimationPreset
  startTime: number // seconds
  duration: number // seconds
  delay: number // seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  intensity: number // multiplier (0.5 to 2.0)
}

export interface BaseOverlay {
  id: string
  name: string
  type: OverlayType
  visible: boolean
  locked: boolean
  opacity: number
  startTime: number
  endTime: number
  animation: AnimationConfig
}

export interface TextOverlay extends BaseOverlay {
  type: 'text'
  role: TextRole
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: string // '300' | '400' | '500' | '600' | '700' | '800' | '900'
  fontStyle: 'normal' | 'italic'
  color: string
  alignment: 'left' | 'center' | 'right'
  letterSpacing: number // px
  lineHeight: number // multiplier, e.g. 1.2
  positionX: number // % -50 to +50
  positionY: number // % -50 to +50
  scale: number
  rotation: number
  // Visual Effects
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  outlineColor: string
  outlineWidth: number
  glowColor: string
  glowBlur: number
  bgBox: boolean
  bgBoxColor: string
  bgBoxPadding: number
  bgBoxRadius: number
  bgBoxOpacity: number
  gradientFill?: {
    enabled: boolean
    color1: string
    color2: string
    angle: number
  }
}

export interface ArtworkOverlay extends BaseOverlay {
  type: 'artwork'
  src: string | null
  mediaName: string | null
  shape: ArtworkShape
  width: number // px or %
  height: number
  positionX: number
  positionY: number
  scale: number
  rotation: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  shadowColor: string
  shadowBlur: number
  glowColor: string
  glowBlur: number
}

export interface LogoOverlay extends BaseOverlay {
  type: 'logo'
  src: string | null
  mediaName: string | null
  placement: WatermarkPlacement
  positionX: number
  positionY: number
  scale: number
  rotation: number
  shadowColor: string
  shadowBlur: number
  glowColor: string
  glowBlur: number
}

export interface MusicCreditsData {
  artist: string
  producer: string
  composer: string
  arranger: string
  mixing: string
  mastering: string
  recordLabel: string
  copyright: string
  releaseYear: string
}

export interface CreditsOverlay extends BaseOverlay {
  type: 'credits'
  title: string
  credits: MusicCreditsData
  layout: 'column' | 'grid' | 'card'
  fontFamily: string
  fontSize: number
  textColor: string
  labelColor: string
  positionX: number
  positionY: number
  bgBox: boolean
  bgBoxColor: string
  bgBoxOpacity: number
}

export type OverlayElement =
  | TextOverlay
  | ArtworkOverlay
  | LogoOverlay
  | CreditsOverlay

export interface TypographyPreset {
  id: string
  name: string
  description: string
  category: string
  apply: () => Partial<OverlayElement>[]
}
