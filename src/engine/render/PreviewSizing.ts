export interface PreviewSizeOptions {
  nativeWidth: number
  nativeHeight: number
  viewportWidth: number
  viewportHeight: number
  zoom: number
  fullscreen: boolean
  fill: boolean
  quality: 'performance' | 'balanced' | 'quality'
  dpr: number
}

export function getPreviewSize(options: PreviewSizeOptions) {
  const { nativeWidth, nativeHeight, zoom, fullscreen, fill, quality } = options
  const inset = fullscreen ? 1 : 0.94
  const horizontal = Math.max(1, options.viewportWidth) * inset / nativeWidth
  const vertical = Math.max(1, options.viewportHeight) * inset / nativeHeight
  const displayScale = !fullscreen && zoom > 0 ? zoom
    : fill ? Math.max(horizontal, vertical) : Math.min(horizontal, vertical)
  const limit = quality === 'performance' ? 0.6 : 0.85
  const renderScale = quality === 'quality' ? 1
    : Math.max(1 / Math.min(nativeWidth, nativeHeight), Math.min(limit, displayScale * options.dpr))
  return {
    displayWidth: nativeWidth * displayScale,
    displayHeight: nativeHeight * displayScale,
    bufferWidth: Math.max(1, Math.round(nativeWidth * renderScale)),
    bufferHeight: Math.max(1, Math.round(nativeHeight * renderScale)),
    renderScale,
  }
}
