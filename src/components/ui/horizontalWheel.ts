export function horizontalWheelDelta(event: { deltaX: number; deltaY: number; deltaMode: number; ctrlKey: boolean }, viewportWidth: number): number {
  if (event.ctrlKey) return 0
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  if (!Number.isFinite(delta)) return 0
  return delta * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? viewportWidth : 1)
}

export function canScrollHorizontally(left: number, max: number, delta: number): boolean {
  return delta < 0 ? left > 0 : delta > 0 && left < max - 1
}
