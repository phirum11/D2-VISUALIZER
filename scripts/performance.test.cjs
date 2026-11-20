const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function loadModule(relativePath, globals = {}, imports = {}) {
  const filename = path.join(__dirname, '..', relativePath)
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  vm.runInNewContext(source, {
    exports, console, ...globals,
    require: name => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
      return imports[name]
    },
  }, { filename })
  return exports
}

function scheduler() {
  let sequence = 0
  const pending = new Map()
  const listeners = new Map()
  const observers = []
  const document = {
    hidden: false,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => { if (listeners.get(name) === listener) listeners.delete(name) },
  }
  const api = loadModule('src/engine/render/FrameScheduler.ts', {
    document,
    requestAnimationFrame: callback => { pending.set(++sequence, callback); return sequence },
    cancelAnimationFrame: id => pending.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this) }
      observe(canvas) { this.canvas = canvas }
      disconnect() { this.disconnected = true }
    },
  })
  return {
    ...api, pending, listeners, observers,
    frame(timestamp) {
      const callbacks = [...pending.values()]
      pending.clear()
      callbacks.forEach(callback => callback(timestamp))
    },
    visibility(hidden) { document.hidden = hidden; listeners.get('visibilitychange')?.() },
  }
}

test('all consumers share one RAF and cancellation releases the listener', () => {
  const frames = scheduler()
  const timestamps = []
  const stopMain = frames.subscribeFrames(time => timestamps.push(time), 60)
  const stopThumb = frames.subscribeFrames(time => timestamps.push(time), 12)
  assert.equal(frames.pending.size, 1)
  frames.frame(0)
  assert.deepEqual(timestamps, [0, 0])
  assert.equal(frames.pending.size, 1)
  stopMain()
  stopThumb()
  stopThumb()
  assert.equal(frames.pending.size, 0)
  assert.equal(frames.listeners.size, 0)
})

for (const refreshRate of [60, 144]) {
  for (const fps of [12, 15, 24, 30, 60]) {
    test(`${fps} FPS budget stays accurate on a ${refreshRate} Hz display`, () => {
      const frames = scheduler()
      let count = 0
      const stop = frames.subscribeFrames(() => count++, fps)
      for (let index = 0; index < refreshRate * 5; index++) frames.frame(index * 1000 / refreshRate)
      assert.ok(Math.abs(count - fps * 5) <= 1, `Expected ${fps * 5} frames, got ${count}`)
      stop()
    })
  }
}

test('hidden windows stop scheduling and resume without catch-up bursts', () => {
  const frames = scheduler()
  let count = 0
  const stop = frames.subscribeFrames(() => count++, 30)
  frames.frame(0)
  frames.visibility(true)
  assert.equal(frames.pending.size, 0)
  frames.frame(1000)
  assert.equal(count, 1)
  frames.visibility(false)
  frames.frame(2000)
  assert.equal(count, 2)
  assert.equal(frames.pending.size, 1)
  stop()
})

test('offscreen thumbnails allocate no RAF and clean up on unmount', () => {
  const frames = scheduler()
  let count = 0
  const stop = frames.observeCanvasFrames({}, () => count++, 12)
  const observer = frames.observers[0]
  assert.equal(frames.pending.size, 0)
  observer.callback([{ isIntersecting: true }])
  observer.callback([{ isIntersecting: true }])
  assert.equal(frames.pending.size, 1)
  frames.frame(0)
  assert.equal(count, 1)
  observer.callback([{ isIntersecting: false }])
  assert.equal(frames.pending.size, 0)
  observer.callback([{ isIntersecting: true }])
  stop()
  assert.equal(observer.disconnected, true)
  assert.equal(frames.pending.size, 0)
  assert.equal(frames.listeners.size, 0)
})

test('invalid FPS is rejected', () => {
  const frames = scheduler()
  for (const fps of [0, -1, NaN, Infinity]) {
    assert.throws(() => frames.subscribeFrames(() => {}, fps), /FPS must be positive/)
  }
})

test('FFT data and smoothing are computed once per shared timestamp', () => {
  const { AudioEngine } = loadModule('src/engine/audio/AudioEngine.ts', {}, {
    './AudioDecoder': {}, './FrequencyExtractor': {}, './WaveformGenerator': {},
  })
  const engine = Object.create(AudioEngine.prototype)
  let reads = 0
  engine.extractor = { getFrameData: () => ({ sample: ++reads }) }
  const first = engine.getLiveFrameData(100)
  assert.equal(engine.getLiveFrameData(100), first)
  assert.equal(reads, 1)
  assert.notEqual(engine.getLiveFrameData(116), first)
  engine.getLiveFrameData()
  engine.getLiveFrameData()
  assert.equal(reads, 4)
})

test('preview sizing is viewport-aware and preserves all composition aspect ratios', () => {
  const { getPreviewSize } = loadModule('src/engine/render/PreviewSizing.ts')
  for (const [nativeWidth, nativeHeight] of [[1920, 1080], [1080, 1920], [1080, 1080], [1080, 1350], [2560, 1080]]) {
    const options = { nativeWidth, nativeHeight, viewportWidth: 640, viewportHeight: 360,
      zoom: 0, fullscreen: false, fill: false, quality: 'balanced', dpr: 1 }
    const size = getPreviewSize(options)
    assert.ok(size.displayWidth <= 640 && size.displayHeight <= 360)
    assert.ok(Math.abs(size.displayWidth / size.displayHeight - nativeWidth / nativeHeight) < 0.0001)
    assert.ok(Math.abs(size.bufferWidth - size.displayWidth) <= 1)
    assert.ok(Math.abs(size.bufferHeight - size.displayHeight) <= 1)
    const full = getPreviewSize({ ...options, quality: 'quality' })
    assert.equal(full.bufferWidth, nativeWidth)
    assert.equal(full.bufferHeight, nativeHeight)
    assert.equal(full.displayWidth, size.displayWidth)
    const tiny = getPreviewSize({ ...options, viewportWidth: 0, viewportHeight: 0 })
    assert.ok(tiny.bufferWidth > 0 && tiny.bufferHeight > 0)
  }
})

test('zoom, fullscreen and DPR adjust preview size without changing native export dimensions', () => {
  const { getPreviewSize } = loadModule('src/engine/render/PreviewSizing.ts')
  const options = { nativeWidth: 1920, nativeHeight: 1080, viewportWidth: 800, viewportHeight: 600,
    zoom: 1, fullscreen: false, fill: false, quality: 'performance', dpr: 2 }
  assert.equal(getPreviewSize(options).displayWidth, 1920)
  assert.equal(getPreviewSize(options).bufferWidth, 1152)
  const fullscreen = getPreviewSize({ ...options, fullscreen: true })
  assert.equal(fullscreen.displayWidth, 800)
  assert.equal(fullscreen.displayHeight, 450)
  assert.equal(getPreviewSize({ ...options, quality: 'quality' }).bufferWidth, 1920)
})

test('3D contexts allocate lazily, match preview scale, and retain full-resolution export', () => {
  let allocations = 0
  class Scene { constructor() { this.children = [] } traverse() {} remove() {} }
  class Camera { constructor() { this.position = {} } updateProjectionMatrix() {} }
  class Renderer {
    constructor() { allocations++; this.domElement = {} }
    setClearColor() {} setPixelRatio() {} render() {} dispose() {} forceContextLoss() {}
    setSize(width, height) { this.domElement.width = width; this.domElement.height = height }
  }
  const { Base3DVisualizer } = loadModule('src/engine/visualizers/base/Base3DVisualizer.ts', {}, {
    three: { Scene, PerspectiveCamera: Camera, WebGLRenderer: Renderer },
  })
  class Visualizer extends Base3DVisualizer { setupScene() {} update3D() {} }
  const visualizer = new Visualizer()
  assert.equal(allocations, 0)
  visualizer.render({ canvas: {}, width: 1920, height: 1080, renderScale: 0.3 })
  assert.equal(allocations, 1)
  assert.equal(visualizer.renderer.domElement.width, 576)
  assert.equal(visualizer.renderer.domElement.height, 324)
  visualizer.render({ canvas: {}, width: 1920, height: 1080 })
  assert.equal(visualizer.renderer.domElement.width, 1920)
  assert.equal(visualizer.renderer.domElement.height, 1080)
  visualizer.dispose()
  assert.equal(visualizer.renderer, null)
  visualizer.render({ canvas: {}, width: 640, height: 360 })
  assert.equal(allocations, 2)
})

test('hardware recommendation uses CPU, RAM and graphics capacity conservatively', () => {
  const { recommendPreviewMode } = loadModule('src/engine/performance/HardwareRecommendation.ts')
  const specs = { cpuName: 'Test CPU', logicalCores: 16, memoryGB: 32, gpuName: 'NVIDIA GPU', dedicatedGpu: true, gpuAccelerated: true }
  assert.equal(recommendPreviewMode(specs).mode, 'quality')
  assert.equal(recommendPreviewMode({ ...specs, dedicatedGpu: false }).mode, 'balanced')
  assert.equal(recommendPreviewMode({ ...specs, gpuAccelerated: false }).mode, 'performance')
  assert.equal(recommendPreviewMode({ ...specs, memoryGB: 4 }).mode, 'performance')
  assert.equal(recommendPreviewMode({ ...specs, logicalCores: 2 }).mode, 'performance')
  assert.equal(recommendPreviewMode({ ...specs, memoryGB: NaN }).mode, 'performance')
})

test('saved hardware profiles reject corrupted or unsupported data', () => {
  const { isHardwareProfile } = loadModule('src/engine/performance/HardwareRecommendation.ts')
  const profile = { version: 1, checkedAt: new Date().toISOString(), cpuName: 'Test', logicalCores: 8,
    memoryGB: 16, gpuName: 'Intel GPU', dedicatedGpu: false, gpuAccelerated: true,
    nvencSupported: false, recommendedMode: 'balanced', reason: 'Test' }
  assert.ok(isHardwareProfile(profile))
  for (const invalid of [null, {}, { ...profile, version: 2 }, { ...profile, memoryGB: Infinity },
    { ...profile, checkedAt: 'invalid' }, { ...profile, recommendedMode: 'unknown' }]) assert.equal(isHardwareProfile(invalid), false)
})

test('hardware checks run once, deduplicate requests, and reuse disk cache after restart', async () => {
  const { EventEmitter } = require('node:events')
  const files = new Map()
  let gpuQueries = 0
  let encoderProbes = 0
  const absent = () => Object.assign(new Error('Not found'), { code: 'ENOENT' })
  const imports = {
    electron: { app: { getPath: () => '/profile', getGPUFeatureStatus: () => ({ webgl: 'enabled' }),
      getGPUInfo: async () => { gpuQueries++; return { gpuDevice: [{ active: true, vendorId: 0x10de, deviceString: 'NVIDIA Test GPU' }] } } } },
    'node:os': { default: { cpus: () => Array.from({ length: 16 }, () => ({ model: 'Test CPU' })), totalmem: () => 32 * 1024 ** 3 } },
    'node:path': { default: path.posix },
    'node:fs/promises': { default: {
      stat: async filename => { if (!files.has(filename)) throw absent(); return { size: files.get(filename).length } },
      readFile: async filename => { if (!files.has(filename)) throw absent(); return files.get(filename) },
      mkdir: async () => {}, writeFile: async (filename, data) => files.set(filename, data),
      rename: async (from, to) => { files.set(to, files.get(from)); files.delete(from) },
      unlink: async filename => { if (!files.delete(filename)) throw absent() },
    } },
    'node:child_process': { spawn: () => {
      encoderProbes++
      const process = new EventEmitter()
      process.kill = () => process.emit('close', 1)
      queueMicrotask(() => process.emit('close', 0))
      return process
    } },
    '../export/FFmpegPath': { FFmpegPath: { getFFmpegPath: () => 'ffmpeg' } },
    '../../src/engine/performance/HardwareRecommendation': loadModule('src/engine/performance/HardwareRecommendation.ts'),
  }
  const service = () => loadModule('electron/hardware/HardwareProfileService.ts', { process: { pid: 1 }, setTimeout, clearTimeout }, imports).HardwareProfileService
  const firstLaunch = service()
  assert.equal(await firstLaunch.getSaved(), null)
  assert.equal(gpuQueries, 0)
  assert.equal(encoderProbes, 0)
  const profiles = await Promise.all([firstLaunch.checkOnce(), firstLaunch.checkOnce(), firstLaunch.checkOnce()])
  assert.equal(gpuQueries, 1)
  assert.equal(encoderProbes, 1)
  assert.equal(profiles[0].checkedAt, profiles[2].checkedAt)
  assert.equal(profiles[0].recommendedMode, 'quality')
  assert.ok(files.has('/profile/hardware-profile.json'))
  const restarted = service()
  assert.equal((await restarted.getSaved()).checkedAt, profiles[0].checkedAt)
  assert.equal((await restarted.checkOnce()).checkedAt, profiles[0].checkedAt)
  assert.equal(gpuQueries, 1)
  assert.equal(encoderProbes, 1)
})

test('preview mode persists only on explicit selection, not playback updates', () => {
  const writes = []
  let initial
  const load = saved => loadModule('src/stores/previewStore.ts', {
    localStorage: { getItem: () => saved, setItem: (key, value) => writes.push([key, value]) },
  }, { zustand: { create: setup => { initial = setup(() => {}); return initial } } })
  load('quality')
  assert.equal(initial.previewQuality, 'quality')
  initial.setCurrentTime(10)
  initial.setIsPlaying(true)
  assert.equal(writes.length, 0)
  initial.setPreviewQuality('performance')
  assert.deepEqual(writes, [['d2-preview-quality', 'performance']])
  load('invalid')
  assert.equal(initial.previewQuality, 'balanced')
})

function bassFixture(hz = 110, amplitude = 180, sampleRate = 48000) {
  const raw = new Uint8Array(1024)
  raw[Math.round(hz / (sampleRate / 2048))] = amplitude
  return { sampleRate, rawFrequencies: raw, normalizedFrequencies: new Float32Array(1024),
    timeDomainData: new Uint8Array(1024), normalizedTimeDomain: new Float32Array(1024),
    bands: { subBass: 0.2, bass: 0.3, lowMid: 0.5, mid: 0.6, highMid: 0.7, treble: 0.8 },
    bassEnergy: 0.3, midEnergy: 0.6, trebleEnergy: 0.8, overallEnergy: 0.4, rms: 0.2 }
}

test('bass follower gates silence, isolates the selected Hz band, and preserves FFT data', () => {
  const { BassEnvelopeFollower, normalizeBassConfig } = loadModule('src/engine/audio/BassReactivity.ts')
  const config = normalizeBassConfig({ enabled: true, lowHz: 70, highHz: 160, gain: 2, threshold: 0.1, mix: 1, sidechain: 0.8 })
  const follower = new BassEnvelopeFollower()
  const frame = bassFixture()
  const bytes = [...frame.rawFrequencies]
  const processed = follower.apply(frame, config, 0)
  assert.ok(processed.bassEnergy > 0.1)
  assert.ok(processed.midEnergy < frame.midEnergy)
  assert.equal(processed.rawFrequencies, frame.rawFrequencies)
  assert.deepEqual([...frame.rawFrequencies], bytes)
  assert.equal(frame.bassEnergy, 0.3)
  const highTone = new BassEnvelopeFollower().process(bassFixture(2000), config, 0)
  assert.equal(highTone.envelope, 0)
  const silent = new BassEnvelopeFollower().process(bassFixture(110, 0), config, 0)
  assert.equal(silent.envelope, 0)
  assert.equal(silent.kick, 0)
  assert.equal(new BassEnvelopeFollower().apply(frame, undefined, 0), frame)
})

test('bass attack/release are time-based, peak hold releases, duplicate samples and seeks reset correctly', () => {
  const { BassEnvelopeFollower, normalizeBassConfig } = loadModule('src/engine/audio/BassReactivity.ts')
  const config = normalizeBassConfig({ enabled: true, lowHz: 70, highHz: 160, gain: 2, threshold: 0, attackMs: 100, releaseMs: 200, kickEmphasis: 0, holdMs: 0 })
  const loud = bassFixture()
  const silent = bassFixture(110, 0)
  const measure = fps => {
    const follower = new BassEnvelopeFollower()
    for (let index = 0; index <= fps; index++) follower.process(loud, config, index / fps)
    const attack = follower.getResponse().envelope
    for (let index = 1; index <= fps; index++) follower.process(silent, config, 1 + index / fps)
    return [attack, follower.getResponse().envelope]
  }
  const thirty = measure(30), sixty = measure(60)
  for (let index = 0; index < 2; index++) assert.ok(Math.abs(thirty[index] - sixty[index]) < 1e-6)
  assert.ok(thirty[0] > thirty[1] * 100)
  const heldConfig = { ...config, attackMs: 1, holdMs: 100 }
  const held = new BassEnvelopeFollower()
  const first = held.process(loud, heldConfig, 0)
  assert.equal(held.process(silent, heldConfig, 0), first)
  assert.ok(held.process(silent, heldConfig, 0.05).envelope >= first.envelope * 0.99)
  assert.ok(held.process(silent, heldConfig, 0.5).envelope < first.envelope * 0.2)
  assert.equal(held.process(silent, heldConfig, 0).envelope, 0)
  assert.equal(held.process(silent, heldConfig, 5).envelope, 0)
})

test('bass settings are bounded and survive serialization with legacy bypass defaults', () => {
  const { normalizeBassConfig } = loadModule('src/engine/audio/BassReactivity.ts')
  const config = normalizeBassConfig({ enabled: true, lowHz: 600, highHz: 20, gain: Infinity, attackMs: -1, releaseMs: 5000, mix: 3 })
  assert.equal(config.lowHz, 490)
  assert.equal(config.highHz, 500)
  assert.equal(config.gain, 1.5)
  assert.equal(config.attackMs, 1)
  assert.equal(config.releaseMs, 1000)
  assert.equal(config.mix, 1)
  assert.equal(normalizeBassConfig(undefined).enabled, false)
  assert.equal(JSON.stringify(normalizeBassConfig(JSON.parse(JSON.stringify(config)))), JSON.stringify(config))
})

test('bass pack adds exactly 200 unique, registered presets with non-color variation', () => {
  const bass = loadModule('src/engine/audio/BassReactivity.ts')
  const pack = loadModule('src/engine/visualizers/BassPresetPack.ts', {}, { '../audio/BassReactivity': bass })
  const catalog = loadModule('src/engine/visualizers/VisualizerPresetCatalog.ts', {}, { './BassPresetPack': pack })
  assert.equal(pack.BASS_VISUALIZER_PRESETS.length, 200)
  assert.equal(catalog.VISUALIZER_PRESETS.length, catalog.LEGACY_VISUALIZER_PRESETS.length + 200)
  assert.equal(new Set(catalog.VISUALIZER_PRESETS.map(preset => preset.id)).size, catalog.VISUALIZER_PRESETS.length)
  assert.equal(new Set(pack.BASS_VISUALIZER_PRESETS.map(preset => preset.name)).size, 200)
  const plugins = fs.readdirSync(path.join(__dirname, '../src/engine/visualizers/styles')).map(filename =>
    fs.readFileSync(path.join(__dirname, '../src/engine/visualizers/styles', filename), 'utf8')).join('\n')
  for (const preset of pack.BASS_VISUALIZER_PRESETS) {
    assert.ok(plugins.includes(`readonly id = '${preset.engineType}'`), `Unknown renderer ${preset.engineType}`)
    assert.equal(preset.config.bassReactivity.enabled, true)
    assert.equal(preset.config.presetId, preset.id)
    assert.ok(preset.config.barCount >= 16 && preset.config.barCount <= 96)
  }
  const responseSignatures = pack.BASS_VISUALIZER_PRESETS.map(preset => {
    const { primaryColor, accentColor, presetId, ...config } = preset.config
    return JSON.stringify(config)
  })
  assert.equal(new Set(responseSignatures).size, 200)
})

test('category wheel scrolling handles mice, trackpads, units, boundaries, and zoom gestures', () => {
  const { horizontalWheelDelta, canScrollHorizontally } = loadModule('src/components/ui/horizontalWheel.ts')
  const event = { deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: false }
  assert.equal(horizontalWheelDelta(event, 240), 100)
  assert.equal(horizontalWheelDelta({ ...event, deltaX: -120, deltaY: 5 }, 240), -120)
  assert.equal(horizontalWheelDelta({ ...event, deltaY: 3, deltaMode: 1 }, 240), 72)
  assert.equal(horizontalWheelDelta({ ...event, deltaY: 1, deltaMode: 2 }, 240), 240)
  assert.equal(horizontalWheelDelta({ ...event, ctrlKey: true }, 240), 0)
  assert.equal(horizontalWheelDelta({ ...event, deltaY: NaN }, 240), 0)
  assert.equal(canScrollHorizontally(0, 500, -100), false)
  assert.equal(canScrollHorizontally(500, 500, 100), false)
  assert.equal(canScrollHorizontally(250, 500, 100), true)
  assert.equal(canScrollHorizontally(250, 500, -100), true)
  assert.equal(canScrollHorizontally(0, 0, 100), false)
})
