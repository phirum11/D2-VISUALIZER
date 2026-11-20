export type RecommendedPreviewMode = 'performance' | 'balanced' | 'quality'

export interface HardwareSpecs {
  cpuName: string
  logicalCores: number
  memoryGB: number
  gpuName: string
  dedicatedGpu: boolean
  gpuAccelerated: boolean
}

export interface HardwareProfile extends HardwareSpecs {
  version: 1
  checkedAt: string
  nvencSupported: boolean
  recommendedMode: RecommendedPreviewMode
  reason: string
}

export function recommendPreviewMode(specs: HardwareSpecs): { mode: RecommendedPreviewMode; reason: string } {
  if (!specs.gpuAccelerated) {
    return { mode: 'performance', reason: 'Hardware-accelerated WebGL is unavailable. A smaller preview and 30 FPS budget reduce CPU rendering load.' }
  }
  if (!Number.isFinite(specs.memoryGB) || !Number.isFinite(specs.logicalCores) || specs.memoryGB < 8 || specs.logicalCores < 4) {
    return { mode: 'performance', reason: 'Limited memory or CPU capacity. Viewport-sized rendering and a 30 FPS budget leave more room for audio and editing.' }
  }
  if (specs.dedicatedGpu && specs.memoryGB >= 16 && specs.logicalCores >= 12) {
    return { mode: 'quality', reason: 'Dedicated graphics, at least 16 GB RAM and 12 CPU threads provide headroom for native-resolution preview.' }
  }
  return { mode: 'balanced', reason: 'Accelerated graphics and sufficient CPU/RAM suit a viewport-sized preview with a 60 FPS playback budget.' }
}

export function isHardwareProfile(value: unknown): value is HardwareProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<HardwareProfile>
  return profile.version === 1 && typeof profile.checkedAt === 'string' && Number.isFinite(Date.parse(profile.checkedAt))
    && typeof profile.cpuName === 'string' && typeof profile.gpuName === 'string'
    && typeof profile.logicalCores === 'number' && Number.isFinite(profile.logicalCores) && profile.logicalCores > 0 && profile.logicalCores <= 4096
    && typeof profile.memoryGB === 'number' && Number.isFinite(profile.memoryGB) && profile.memoryGB > 0 && profile.memoryGB <= 65536
    && typeof profile.dedicatedGpu === 'boolean' && typeof profile.gpuAccelerated === 'boolean'
    && typeof profile.nvencSupported === 'boolean' && typeof profile.reason === 'string'
    && ['performance', 'balanced', 'quality'].includes(profile.recommendedMode ?? '')
}
