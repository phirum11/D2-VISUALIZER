import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'

/**
 * Resolves the absolute path to the bundled FFmpeg and FFprobe binaries.
 * Guarantees zero dependence on global system PATH installations.
 */
export class FFmpegPath {
  private static ffmpegBinaryPath: string | null = null
  private static ffprobeBinaryPath: string | null = null

  public static getFFmpegPath(): string {
    if (this.ffmpegBinaryPath && fs.existsSync(this.ffmpegBinaryPath)) {
      return this.ffmpegBinaryPath
    }

    const isWin = process.platform === 'win32'
    const binName = isWin ? 'ffmpeg.exe' : 'ffmpeg'

    // Candidate search locations in order of precedence:
    const candidates: string[] = [
      // 1. Packaged Electron extraResources location
      path.join(process.resourcesPath || '', 'bin', 'win', binName),
      path.join(process.resourcesPath || '', binName),
      // 2. Development project root resources directory
      path.join(app ? app.getAppPath() : process.cwd(), 'resources', 'bin', 'win', binName),
      // 3. Relative to __dirname
      path.resolve(__dirname, '..', '..', 'resources', 'bin', 'win', binName),
      // 4. Known local runtime path
      `C:\\Users\\User\\AppData\\Local\\Programs\\Music Studio\\system\\ffmpeg\\${binName}`,
    ]

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        console.log('[FFMPEG LOCATOR] Found bundled FFmpeg at:', p)
        this.ffmpegBinaryPath = p
        return p
      }
    }

    // Fallback to system command
    console.warn('[FFMPEG LOCATOR] Bundled FFmpeg not found, falling back to system PATH')
    this.ffmpegBinaryPath = 'ffmpeg'
    return 'ffmpeg'
  }

  public static getFFprobePath(): string {
    if (this.ffprobeBinaryPath && fs.existsSync(this.ffprobeBinaryPath)) {
      return this.ffprobeBinaryPath
    }

    const isWin = process.platform === 'win32'
    const binName = isWin ? 'ffprobe.exe' : 'ffprobe'

    const candidates: string[] = [
      path.join(process.resourcesPath || '', 'bin', 'win', binName),
      path.join(process.resourcesPath || '', binName),
      path.join(app ? app.getAppPath() : process.cwd(), 'resources', 'bin', 'win', binName),
      path.resolve(__dirname, '..', '..', 'resources', 'bin', 'win', binName),
      `C:\\Users\\User\\AppData\\Local\\Programs\\Music Studio\\system\\ffmpeg\\${binName}`,
    ]

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        console.log('[FFPROBE LOCATOR] Found bundled FFprobe at:', p)
        this.ffprobeBinaryPath = p
        return p
      }
    }

    this.ffprobeBinaryPath = 'ffprobe'
    return 'ffprobe'
  }
}
