import { app } from 'electron'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { FFmpegPath } from '../export/FFmpegPath'
import { HardwareProfile, isHardwareProfile, recommendPreviewMode } from '../../src/engine/performance/HardwareRecommendation'

interface GpuInfo {
  gpuDevice?: { active?: boolean; vendorId?: number; deviceString?: string }[]
  auxAttributes?: { glRenderer?: string }
}

// Reading this file never enumerates hardware or launches FFmpeg.
export class HardwareProfileService {
  private static cached: HardwareProfile | null | undefined
  private static loading: Promise<HardwareProfile | null> | null = null
  private static checking: Promise<HardwareProfile> | null = null

  private static get cachePath(): string {
    return path.join(app.getPath('userData'), 'hardware-profile.json')
  }

  public static getSaved(): Promise<HardwareProfile | null> {
    if (this.cached !== undefined) return Promise.resolve(this.cached)
    if (this.loading) return this.loading
    this.loading = (async () => {
      try {
        const stat = await fs.stat(this.cachePath)
        if (stat.size > 64 * 1024) throw new Error('Saved hardware profile is too large')
        const data: unknown = JSON.parse(await fs.readFile(this.cachePath, 'utf8'))
        if (!isHardwareProfile(data)) throw new Error('Saved hardware profile is invalid')
        this.cached = data
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        this.cached = null
      }
      return this.cached
    })().finally(() => { this.loading = null })
    return this.loading
  }

  public static checkOnce(): Promise<HardwareProfile> {
    if (this.checking) return this.checking
    this.checking = (async () => {
      const saved = await this.getSaved()
      if (saved) return saved
      const cpus = os.cpus()
      const gpuInfo = await app.getGPUInfo('basic').catch(() => ({})) as GpuInfo
      const gpu = gpuInfo.gpuDevice?.find(device => device.active) ?? gpuInfo.gpuDevice?.[0]
      const gpuName = gpu?.deviceString || gpuInfo.auxAttributes?.glRenderer
        || (gpu?.vendorId === 0x10de ? 'NVIDIA GPU' : gpu?.vendorId === 0x8086 ? 'Intel GPU' : gpu?.vendorId === 0x1002 ? 'AMD GPU' : 'GPU details unavailable')
      const featureStatus = app.getGPUFeatureStatus()
      const gpuAccelerated = featureStatus.webgl === 'enabled' && !/swiftshader|llvmpipe|software|microsoft basic/i.test(gpuName)
      const dedicatedGpu = gpuAccelerated && (gpu?.vendorId === 0x10de || /geforce|quadro|rtx|gtx|radeon rx|radeon pro/i.test(gpuName))
      const specs = {
        cpuName: cpus[0]?.model.trim() || 'CPU details unavailable',
        logicalCores: Math.max(1, cpus.length),
        memoryGB: Math.round(os.totalmem() / 1024 ** 3 * 10) / 10,
        gpuName, dedicatedGpu, gpuAccelerated,
      }
      const recommendation = recommendPreviewMode(specs)
      const profile: HardwareProfile = {
        version: 1, checkedAt: new Date().toISOString(), ...specs,
        nvencSupported: await this.probeNvenc(),
        recommendedMode: recommendation.mode, reason: recommendation.reason,
      }
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true })
      const temporary = `${this.cachePath}.${process.pid}.tmp`
      try {
        await fs.writeFile(temporary, JSON.stringify(profile, null, 2), 'utf8')
        await fs.rename(temporary, this.cachePath)
      } finally {
        await fs.unlink(temporary).catch(() => {})
      }
      this.cached = profile
      return profile
    })().finally(() => { this.checking = null })
    return this.checking
  }

  private static probeNvenc(): Promise<boolean> {
    return new Promise(resolve => {
      // Listing encoders only proves FFmpeg support; one tiny frame verifies the GPU/driver.
      const probe = spawn(FFmpegPath.getFFmpegPath(), [
        '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=64x64:r=1',
        '-frames:v', '1', '-an', '-c:v', 'h264_nvenc', '-f', 'null', '-',
      ], { windowsHide: true, stdio: 'ignore' })
      let settled = false
      const finish = (supported: boolean) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        resolve(supported)
      }
      const timeout = setTimeout(() => { probe.kill(); finish(false) }, 8000)
      probe.once('error', () => finish(false))
      probe.once('close', code => finish(code === 0))
    })
  }
}
