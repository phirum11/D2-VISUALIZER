type FrameCallback = (timestamp: number) => void

interface FrameSubscription {
  callback: FrameCallback
  interval: number
  lastFrame: number
}

const subscriptions = new Set<FrameSubscription>()
let animationId: number | null = null

function schedule(): void {
  if (animationId === null && subscriptions.size > 0 && !document.hidden) {
    animationId = requestAnimationFrame(tick)
  }
}

function tick(timestamp: number): void {
  animationId = null
  for (const subscription of subscriptions) {
    const elapsed = timestamp - subscription.lastFrame
    if (elapsed + 0.5 < subscription.interval) continue
    subscription.lastFrame = Number.isFinite(subscription.lastFrame)
      ? subscription.lastFrame + Math.max(1, Math.floor((elapsed + 0.5) / subscription.interval)) * subscription.interval
      : timestamp
    try {
      subscription.callback(timestamp)
    } catch (error) {
      console.error('[FRAME SCHEDULER]', error)
    }
  }
  schedule()
}

function onVisibilityChange(): void {
  if (document.hidden) {
    if (animationId !== null) cancelAnimationFrame(animationId)
    animationId = null
  } else {
    for (const subscription of subscriptions) subscription.lastFrame = -Infinity
    schedule()
  }
}

export function subscribeFrames(callback: FrameCallback, fps: number): () => void {
  if (!Number.isFinite(fps) || fps <= 0) throw new RangeError('FPS must be positive')
  const subscription = { callback, interval: 1000 / fps, lastFrame: -Infinity }
  if (subscriptions.size === 0) {
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
  subscriptions.add(subscription)
  schedule()
  return () => {
    subscriptions.delete(subscription)
    if (subscriptions.size === 0) {
      if (animationId !== null) cancelAnimationFrame(animationId)
      animationId = null
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }
}

export function observeCanvasFrames(
  canvas: HTMLCanvasElement,
  callback: FrameCallback,
  fps: number
): () => void {
  let unsubscribe: (() => void) | null = null
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.some(entry => entry.isIntersecting)
    if (visible && !unsubscribe) unsubscribe = subscribeFrames(callback, fps)
    if (!visible && unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }, { threshold: 0.05 })
  observer.observe(canvas)
  return () => {
    observer.disconnect()
    unsubscribe?.()
    unsubscribe = null
  }
}
