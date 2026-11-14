import {
  OverlayElement,
  TextOverlay,
  ArtworkOverlay,
  LogoOverlay,
  CreditsOverlay,
} from './types'
import { AnimationEngine } from './AnimationEngine'
import { AudioFrameData } from '@/engine/audio/FrequencyExtractor'

export class OverlayRenderer {
  private static instance: OverlayRenderer | null = null

  // Image cache for artwork and logos
  private imageCache = new Map<string, HTMLImageElement>()

  private constructor() {}

  public static getInstance(): OverlayRenderer {
    if (!OverlayRenderer.instance) {
      OverlayRenderer.instance = new OverlayRenderer()
    }
    return OverlayRenderer.instance
  }

  /**
   * Preloads an image into the cache
   */
  public async preloadImage(src: string): Promise<HTMLImageElement | null> {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!
    }

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this.imageCache.set(src, img)
        resolve(img)
      }
      img.onerror = () => {
        console.warn('[OVERLAY RENDERER] Failed to load image:', src)
        resolve(null)
      }
      img.src = src
    })
  }

  /**
   * Main render dispatch for all active overlays
   */
  public renderOverlays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlays: OverlayElement[],
    timestamp: number,
    audioFrame: AudioFrameData
  ): void {
    if (!overlays || overlays.length === 0) return

    for (const overlay of overlays) {
      if (!overlay.visible) continue

      switch (overlay.type) {
        case 'text':
          this.renderText(ctx, width, height, overlay, timestamp)
          break
        case 'artwork':
          this.renderArtwork(ctx, width, height, overlay, timestamp, audioFrame)
          break
        case 'logo':
          this.renderLogo(ctx, width, height, overlay, timestamp)
          break
        case 'credits':
          this.renderCredits(ctx, width, height, overlay, timestamp)
          break
      }
    }
  }

  /**
   * Renders a Typography / Text overlay element
   */
  private renderText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlay: TextOverlay,
    timestamp: number
  ): void {
    const anim = AnimationEngine.compute(
      timestamp,
      overlay.startTime,
      overlay.endTime,
      overlay.opacity,
      overlay.text,
      overlay.animation
    )

    if (!anim.isVisible) return

    ctx.save()

    // 1. Position & Transform
    const cx = width / 2 + (overlay.positionX / 100) * width + anim.offsetX
    const cy = height / 2 + (overlay.positionY / 100) * height + anim.offsetY

    ctx.translate(cx, cy)
    ctx.scale(overlay.scale * anim.scale, overlay.scale * anim.scale)
    ctx.rotate((overlay.rotation * Math.PI) / 180)
    ctx.globalAlpha = anim.opacity

    if (anim.blur > 0) {
      ctx.filter = `blur(${anim.blur}px)`
    }

    // 2. Font & Text Metrics
    const fontStyle = overlay.fontStyle || 'normal'
    const fontWeight = overlay.fontWeight || '600'
    const fontSize = overlay.fontSize || 32
    const fontFamily = overlay.fontFamily || 'Inter'
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`
    ctx.textAlign = overlay.alignment || 'center'
    ctx.textBaseline = 'middle'

    const lines = (anim.visibleText || '').split('\n')
    const lineHeightPx = fontSize * (overlay.lineHeight || 1.25)
    const totalBlockHeight = lines.length * lineHeightPx

    // 3. Optional Background Box
    if (overlay.bgBox && overlay.bgBoxOpacity > 0) {
      ctx.save()
      let maxLineWidth = 0
      for (const line of lines) {
        const m = ctx.measureText(line).width
        if (m > maxLineWidth) maxLineWidth = m
      }
      const pad = overlay.bgBoxPadding || 12
      const boxW = maxLineWidth + pad * 2
      const boxH = totalBlockHeight + pad * 2
      const boxX =
        overlay.alignment === 'center'
          ? -boxW / 2
          : overlay.alignment === 'left'
          ? -pad
          : -boxW + pad
      const boxY = -boxH / 2

      ctx.fillStyle = overlay.bgBoxColor || '#000000'
      ctx.globalAlpha = anim.opacity * (overlay.bgBoxOpacity || 0.7)
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxW, boxH, overlay.bgBoxRadius || 8)
      ctx.fill()
      ctx.restore()
    }

    // 4. Glow & Shadows
    if (overlay.glowBlur > 0) {
      ctx.shadowColor = overlay.glowColor || overlay.color
      ctx.shadowBlur = overlay.glowBlur
    } else if (overlay.shadowBlur > 0) {
      ctx.shadowColor = overlay.shadowColor || 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = overlay.shadowBlur
      ctx.shadowOffsetX = overlay.shadowOffsetX || 0
      ctx.shadowOffsetY = overlay.shadowOffsetY || 4
    } else {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }

    // 5. Draw Lines
    const startY = -(totalBlockHeight / 2) + lineHeightPx / 2
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const y = startY + i * lineHeightPx

      // Support manual letter spacing for deterministic rendering across all platforms
      const totalLetterSpacing = overlay.letterSpacing + anim.letterSpacingBonus
      if (totalLetterSpacing > 0 && typeof ctx.letterSpacing !== 'string') {
        this.drawTextWithSpacing(ctx, line, 0, y, totalLetterSpacing, overlay)
      } else {
        if (totalLetterSpacing > 0 && typeof ctx.letterSpacing === 'string') {
          ctx.letterSpacing = `${totalLetterSpacing}px`
        }

        // Outline
        if (overlay.outlineWidth > 0 && overlay.outlineColor) {
          ctx.strokeStyle = overlay.outlineColor
          ctx.lineWidth = overlay.outlineWidth * 2
          ctx.strokeText(line, anim.glitchOffset, y)
        }

        // Fill
        ctx.fillStyle = overlay.color
        ctx.fillText(line, anim.glitchOffset, y)
      }
    }

    ctx.restore()
  }

  /**
   * Helper to render text with manual letter spacing
   */
  private drawTextWithSpacing(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    spacing: number,
    overlay: TextOverlay
  ): void {
    const chars = Array.from(text)
    let totalW = 0
    const charWidths: number[] = []

    for (const ch of chars) {
      const w = ctx.measureText(ch).width
      charWidths.push(w)
      totalW += w + spacing
    }
    totalW -= spacing // remove trailing spacing

    let curX =
      overlay.alignment === 'center'
        ? x - totalW / 2
        : overlay.alignment === 'right'
        ? x - totalW
        : x

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]
      if (overlay.outlineWidth > 0 && overlay.outlineColor) {
        ctx.strokeStyle = overlay.outlineColor
        ctx.lineWidth = overlay.outlineWidth * 2
        ctx.strokeText(ch, curX, y)
      }
      ctx.fillStyle = overlay.color
      ctx.fillText(ch, curX, y)
      curX += charWidths[i] + spacing
    }
  }

  /**
   * Renders an Album Artwork overlay
   */
  private renderArtwork(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlay: ArtworkOverlay,
    timestamp: number,
    audioFrame: AudioFrameData
  ): void {
    const anim = AnimationEngine.compute(
      timestamp,
      overlay.startTime,
      overlay.endTime,
      overlay.opacity,
      '',
      overlay.animation
    )

    if (!anim.isVisible) return

    ctx.save()

    const cx = width / 2 + (overlay.positionX / 100) * width + anim.offsetX
    const cy = height / 2 + (overlay.positionY / 100) * height + anim.offsetY

    // Subtle beat scale pulse on album art
    const { subBass } = audioFrame.bands
    const beatPulse = 1 + subBass * 0.05

    ctx.translate(cx, cy)
    ctx.scale(overlay.scale * anim.scale * beatPulse, overlay.scale * anim.scale * beatPulse)
    ctx.rotate((overlay.rotation * Math.PI) / 180)
    ctx.globalAlpha = anim.opacity

    const artSize = overlay.width || 280
    const halfSize = artSize / 2

    // Glow or Shadow
    if (overlay.glowBlur > 0) {
      ctx.shadowColor = overlay.glowColor || 'rgba(99, 102, 241, 0.8)'
      ctx.shadowBlur = overlay.glowBlur * (1 + subBass * 0.5)
    } else if (overlay.shadowBlur > 0) {
      ctx.shadowColor = overlay.shadowColor || 'rgba(0,0,0,0.85)'
      ctx.shadowBlur = overlay.shadowBlur
    }

    const img = overlay.src ? this.imageCache.get(overlay.src) : null

    // Shape clipping (circle or rounded)
    ctx.beginPath()
    if (overlay.shape === 'circle') {
      ctx.arc(0, 0, halfSize, 0, Math.PI * 2)
    } else if (overlay.shape === 'rounded') {
      ctx.roundRect(-halfSize, -halfSize, artSize, artSize, overlay.borderRadius || 16)
    } else {
      ctx.rect(-halfSize, -halfSize, artSize, artSize)
    }

    ctx.save()
    ctx.clip()

    if (img && img.complete) {
      ctx.drawImage(img, -halfSize, -halfSize, artSize, artSize)
    } else {
      // Fallback stylized CD / artwork placeholder
      const grad = ctx.createLinearGradient(-halfSize, -halfSize, halfSize, halfSize)
      grad.addColorStop(0, '#312e81')
      grad.addColorStop(0.5, '#4338ca')
      grad.addColorStop(1, '#06b6d4')
      ctx.fillStyle = grad
      ctx.fillRect(-halfSize, -halfSize, artSize, artSize)

      // Center disc ring
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, halfSize * 0.35, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()

    // Border
    if (overlay.borderWidth > 0 && overlay.borderColor) {
      ctx.strokeStyle = overlay.borderColor
      ctx.lineWidth = overlay.borderWidth
      ctx.beginPath()
      if (overlay.shape === 'circle') {
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2)
      } else if (overlay.shape === 'rounded') {
        ctx.roundRect(-halfSize, -halfSize, artSize, artSize, overlay.borderRadius || 16)
      } else {
        ctx.rect(-halfSize, -halfSize, artSize, artSize)
      }
      ctx.stroke()
    }

    ctx.restore()
  }

  /**
   * Renders a Logo / Watermark overlay
   */
  private renderLogo(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlay: LogoOverlay,
    timestamp: number
  ): void {
    const anim = AnimationEngine.compute(
      timestamp,
      overlay.startTime,
      overlay.endTime,
      overlay.opacity,
      '',
      overlay.animation
    )

    if (!anim.isVisible) return

    ctx.save()

    // Compute coordinate based on watermark placement preset
    const pad = 40
    let baseX = width / 2
    let baseY = height / 2

    switch (overlay.placement) {
      case 'top-left':
        baseX = pad
        baseY = pad
        break
      case 'top-right':
        baseX = width - pad
        baseY = pad
        break
      case 'bottom-left':
        baseX = pad
        baseY = height - pad
        break
      case 'bottom-right':
        baseX = width - pad
        baseY = height - pad
        break
      case 'center':
        baseX = width / 2
        baseY = height / 2
        break
      case 'custom':
      default:
        baseX = width / 2 + (overlay.positionX / 100) * width
        baseY = height / 2 + (overlay.positionY / 100) * height
        break
    }

    const cx = baseX + anim.offsetX
    const cy = baseY + anim.offsetY

    ctx.translate(cx, cy)
    ctx.scale(overlay.scale * anim.scale, overlay.scale * anim.scale)
    ctx.rotate((overlay.rotation * Math.PI) / 180)
    ctx.globalAlpha = anim.opacity

    if (overlay.glowBlur > 0) {
      ctx.shadowColor = overlay.glowColor || 'rgba(6, 182, 212, 0.8)'
      ctx.shadowBlur = overlay.glowBlur
    }

    const img = overlay.src ? this.imageCache.get(overlay.src) : null
    if (img && img.complete) {
      const logoW = img.naturalWidth || 120
      const logoH = img.naturalHeight || 40
      ctx.drawImage(img, -logoW / 2, -logoH / 2, logoW, logoH)
    } else {
      // Clean vector watermark fallback
      ctx.font = '700 13px Inter, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(overlay.mediaName || 'D2 VISUALIZER', 0, 0)
    }

    ctx.restore()
  }

  /**
   * Renders the Music Credits Block overlay
   */
  private renderCredits(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlay: CreditsOverlay,
    timestamp: number
  ): void {
    const anim = AnimationEngine.compute(
      timestamp,
      overlay.startTime,
      overlay.endTime,
      overlay.opacity,
      overlay.title,
      overlay.animation
    )

    if (!anim.isVisible) return

    ctx.save()

    const cx = width / 2 + (overlay.positionX / 100) * width + anim.offsetX
    const cy = height / 2 + (overlay.positionY / 100) * height + anim.offsetY

    ctx.translate(cx, cy)
    ctx.scale(anim.scale, anim.scale)
    ctx.globalAlpha = anim.opacity

    const items: { label: string; value: string }[] = []
    const c = overlay.credits
    if (c.artist) items.push({ label: 'ARTIST', value: c.artist })
    if (c.producer) items.push({ label: 'PRODUCED BY', value: c.producer })
    if (c.composer) items.push({ label: 'COMPOSED BY', value: c.composer })
    if (c.arranger) items.push({ label: 'ARRANGED BY', value: c.arranger })
    if (c.mixing) items.push({ label: 'MIXING', value: c.mixing })
    if (c.mastering) items.push({ label: 'MASTERING', value: c.mastering })
    if (c.recordLabel) items.push({ label: 'LABEL', value: c.recordLabel })
    if (c.copyright) items.push({ label: 'COPYRIGHT', value: c.copyright })

    if (items.length === 0) {
      ctx.restore()
      return
    }

    const fontSize = overlay.fontSize || 13
    const rowHeight = fontSize * 1.8
    const totalH = (items.length + 1) * rowHeight + 24
    const totalW = 380

    // Optional translucent card backdrop
    if (overlay.bgBox) {
      ctx.fillStyle = overlay.bgBoxColor || 'rgba(0, 0, 0, 0.65)'
      ctx.globalAlpha = anim.opacity * (overlay.bgBoxOpacity || 0.65)
      ctx.beginPath()
      ctx.roundRect(-totalW / 2, -totalH / 2, totalW, totalH, 8)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.globalAlpha = anim.opacity
    }

    // Credits Title Header
    ctx.font = `bold ${Math.round(fontSize * 1.15)}px "${overlay.fontFamily || 'Inter'}", sans-serif`
    ctx.fillStyle = overlay.textColor || '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(overlay.title || 'OFFICIAL MUSIC CREDITS', 0, -totalH / 2 + 12)

    // Divider line
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-totalW / 2 + 30, -totalH / 2 + 12 + rowHeight * 0.8)
    ctx.lineTo(totalW / 2 - 30, -totalH / 2 + 12 + rowHeight * 0.8)
    ctx.stroke()

    // 2-Column Key/Value Rows
    const startY = -totalH / 2 + 16 + rowHeight
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const y = startY + i * rowHeight

      // Label (right aligned on left side)
      ctx.font = `600 ${Math.round(fontSize * 0.85)}px "${overlay.fontFamily || 'Inter'}", sans-serif`
      ctx.fillStyle = overlay.labelColor || 'rgba(6, 182, 212, 0.9)'
      ctx.textAlign = 'right'
      ctx.fillText(item.label, -15, y)

      // Value (left aligned on right side)
      ctx.font = `500 ${fontSize}px "${overlay.fontFamily || 'Inter'}", sans-serif`
      ctx.fillStyle = overlay.textColor || '#ffffff'
      ctx.textAlign = 'left'
      ctx.fillText(item.value, 15, y)
    }

    ctx.restore()
  }

  public clearCache(): void {
    this.imageCache.clear()
  }
}

