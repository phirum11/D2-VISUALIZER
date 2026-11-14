export interface AudioMetadata {
  id: string
  name: string
  filePath?: string
  duration: number // in seconds
  fileSize: number // in bytes
  sampleRate: number // e.g. 44100, 48000
  channels: number // 1 (mono), 2 (stereo)
  bitrate?: number // in kbps
  format: string // 'WAV', 'MP3', 'FLAC', etc.
}

export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function detectAudioFormat(fileName: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'AUDIO'
  return ext
}

export const SUPPORTED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.flac',
  '.ogg',
  '.m4a',
  '.aac',
]

export function isAudioFileSupported(fileName: string): boolean {
  const lower = fileName.toLowerCase()
  return SUPPORTED_AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}
