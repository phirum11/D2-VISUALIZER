import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export interface ExportStartOptions {
  width: number
  height: number
  fps: number
  duration: number
  startTime: number
  outputPath: string
  audioFilePath?: string
  bitrate: string
  audioBitrate: string
  videoCodec: 'libx264' | 'h264_nvenc' | 'auto'
  preset: string
  crf?: number
}

export class FFmpegExporter {
  private static instance: FFmpegExporter | null = null

  private process: ChildProcessWithoutNullStreams | null = null
  private currentOutputPath: string = ''
  private stderrLogs: string[] = []
  private isNvencAvailable: boolean | null = null

  private constructor() {}

  public static getInstance(): FFmpegExporter {
    if (!FFmpegExporter.instance) {
      FFmpegExporter.instance = new FFmpegExporter()
    }
    return FFmpegExporter.instance
  }

  /**
   * Checks if NVENC hardware acceleration is available on the system
   */
  public async checkNvencSupport(): Promise<boolean> {
    if (this.isNvencAvailable !== null) return this.isNvencAvailable

    return new Promise<boolean>((resolve) => {
      const probe = spawn('ffmpeg', ['-encoders'])
      let output = ''

      probe.stdout.on('data', (d) => {
        output += d.toString()
      })
      probe.stderr.on('data', (d) => {
        output += d.toString()
      })

      probe.on('close', (code) => {
        if (code === 0 && output.includes('h264_nvenc')) {
          this.isNvencAvailable = true
          resolve(true)
        } else {
          this.isNvencAvailable = false
          resolve(false)
        }
      })

      probe.on('error', () => {
        this.isNvencAvailable = false
        resolve(false)
      })
    })
  }

  /**
   * Starts FFmpeg encoding process with rawvideo pipe input
   */
  public async start(options: ExportStartOptions): Promise<{ success: boolean; error?: string }> {
    if (this.process) {
      return { success: false, error: 'An export process is already in progress' }
    }

    const {
      width,
      height,
      fps,
      duration,
      startTime = 0,
      outputPath,
      audioFilePath,
      bitrate = '16M',
      audioBitrate = '192k',
      videoCodec = 'auto',
      preset = 'medium',
      crf = 18,
    } = options

    // Ensure output directory exists
    const outDir = path.dirname(outputPath)
    if (!fs.existsSync(outDir)) {
      try {
        fs.mkdirSync(outDir, { recursive: true })
      } catch (err) {
        return { success: false, error: `Failed to create output directory: ${err}` }
      }
    }

    this.currentOutputPath = outputPath
    this.stderrLogs = []

    // Determine video codec
    const hasNvenc = await this.checkNvencSupport()
    const useNvenc = videoCodec === 'h264_nvenc' || (videoCodec === 'auto' && hasNvenc)
    const chosenCodec = useNvenc ? 'h264_nvenc' : 'libx264'

    const args: string[] = [
      '-y', // Overwrite output file
      // Input 0: Raw video frames via stdin pipe
      '-f', 'rawvideo',
      '-vcodec', 'rawvideo',
      '-s', `${width}x${height}`,
      '-pix_fmt', 'rgba',
      '-r', `${fps}`,
      '-i', 'pipe:0',
    ]

    // Input 1: Audio file (or silent generator if none)
    const hasAudio = audioFilePath && fs.existsSync(audioFilePath)
    if (hasAudio) {
      args.push(
        '-stream_loop', '-1', // Loop audio seamlessly if video duration exceeds audio file
        '-ss', `${startTime}`,
        '-t', `${duration}`,
        '-i', audioFilePath
      )
    } else {
      // Synthesize blank stereo audio for muxing
      args.push(
        '-f', 'lavfi',
        '-t', `${duration}`,
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'
      )
    }

    // Video encoding settings
    args.push('-c:v', chosenCodec)

    if (useNvenc) {
      args.push(
        '-preset', preset && preset.startsWith('p') ? preset : 'p4',
        '-b:v', bitrate,
        '-cq', `${crf || 20}`
      )
    } else {
      args.push(
        '-preset', preset || 'medium',
        '-crf', `${crf || 18}`,
        '-b:v', bitrate
      )
    }

    // Standard pixel format for universal player compatibility (QuickTime, Chrome, Windows Media Player)
    args.push('-pix_fmt', 'yuv420p')

    // Audio encoding settings & output duration
    args.push(
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-t', `${duration}`,
      outputPath
    )

    console.log('[FFMPEG EXPORT] Spawning FFmpeg with args:', args.join(' '))

    try {
      this.process = spawn('ffmpeg', args)

      this.process.stderr.on('data', (data) => {
        const text = data.toString()
        this.stderrLogs.push(text)
        if (this.stderrLogs.length > 50) {
          this.stderrLogs.shift()
        }
      })

      this.process.on('error', (err) => {
        console.error('[FFMPEG EXPORT] Process error:', err)
      })

      return { success: true }
    } catch (err) {
      this.process = null
      return { success: false, error: `Failed to spawn FFmpeg: ${err}` }
    }
  }

  /**
   * Writes a raw RGBA frame buffer to FFmpeg stdin pipe with backpressure handling
   */
  public async writeFrame(buffer: Uint8Array): Promise<{ success: boolean; error?: string }> {
    if (!this.process || !this.process.stdin || this.process.stdin.destroyed || !this.process.stdin.writable) {
      return { success: false, error: 'FFmpeg process is not running or stdin closed' }
    }

    const nodeBuffer = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    this.process.stdin.write(nodeBuffer)

    // Backpressure handling: Only pause if more than 32MB is buffered in memory waiting for FFmpeg
    if (this.process.stdin.writableLength > 32 * 1024 * 1024 && !this.process.stdin.destroyed && this.process.stdin.writable) {
      await new Promise<void>((resolve) => {
        let done = false
        const finish = () => {
          if (!done) {
            done = true
            this.process?.stdin?.removeListener('drain', finish)
            this.process?.stdin?.removeListener('close', finish)
            this.process?.stdin?.removeListener('error', finish)
            resolve()
          }
        }
        this.process!.stdin.once('drain', finish)
        this.process!.stdin.once('close', finish)
        this.process!.stdin.once('error', finish)
        setTimeout(finish, 1000)
      })
    }

    return { success: true }
  }

  /**
   * Finalizes the export, closes the stdin stream, and awaits clean exit
   */
  public async finish(): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    if (!this.process || !this.process.stdin) {
      return { success: false, error: 'FFmpeg process is not active' }
    }

    return new Promise((resolve) => {
      const proc = this.process!
      let resolved = false

      proc.on('close', (code) => {
        if (resolved) return
        resolved = true
        this.process = null

        if (code === 0 && fs.existsSync(this.currentOutputPath)) {
          const stats = fs.statSync(this.currentOutputPath)
          console.log(`[FFMPEG EXPORT] Successfully created ${this.currentOutputPath} (${stats.size} bytes)`)
          resolve({ success: true, outputPath: this.currentOutputPath })
        } else {
          const errorOutput = this.stderrLogs.slice(-10).join('\n')
          console.error(`[FFMPEG EXPORT] FFmpeg failed with exit code ${code}:\n${errorOutput}`)
          resolve({ success: false, error: `FFmpeg failed with exit code ${code}` })
        }
      })

      // Close the pipe to signal end of stream to FFmpeg
      try {
        proc.stdin.end()
      } catch (err) {
        console.error('[FFMPEG EXPORT] Error closing stdin:', err)
      }
    })
  }

  /**
   * Cancels the active export and deletes the partial file
   */
  public async cancel(): Promise<void> {
    if (this.process) {
      try {
        this.process.kill('SIGKILL')
      } catch {
        // ignore
      }
      this.process = null
    }

    if (this.currentOutputPath && fs.existsSync(this.currentOutputPath)) {
      try {
        fs.unlinkSync(this.currentOutputPath)
        console.log('[FFMPEG EXPORT] Deleted partial output file:', this.currentOutputPath)
      } catch {
        // ignore
      }
    }
  }

  public isBusy(): boolean {
    return this.process !== null
  }
}
