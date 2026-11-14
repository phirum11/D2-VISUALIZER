import {
  D2ProjectData,
  D2_PROJECT_FORMAT_MAGIC,
  D2_PROJECT_SCHEMA_VERSION,
  D2ProjectAssetReference,
} from '@/types/project'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  migrated: boolean
  project?: D2ProjectData
  missingAssets: D2ProjectAssetReference[]
}

export class ProjectValidator {
  /**
   * Validates and sanitizes imported project data with migration support
   */
  public static validate(raw: unknown): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let migrated = false

    if (!raw || typeof raw !== 'object') {
      return {
        valid: false,
        errors: ['Invalid project file: expected a JSON object.'],
        warnings: [],
        migrated: false,
        missingAssets: [],
      }
    }

    const data = raw as Record<string, unknown>

    // 1. Magic format check
    if (data.d2Format !== D2_PROJECT_FORMAT_MAGIC) {
      // Legacy or non-d2proj check
      if (data.name && data.visualizer) {
        warnings.push('Legacy unversioned project detected. Migrating to schema v1.0.0.')
        migrated = true
      } else {
        return {
          valid: false,
          errors: ['Unrecognized project format. Expected a .d2proj file.'],
          warnings: [],
          migrated: false,
          missingAssets: [],
        }
      }
    }

    // 2. Schema version check & migration
    const version = typeof data.schemaVersion === 'string' ? data.schemaVersion : '0.0.0'
    if (version !== D2_PROJECT_SCHEMA_VERSION) {
      warnings.push(`Project schema version '${version}' differs from current '${D2_PROJECT_SCHEMA_VERSION}'. Running migrations.`)
      migrated = true
    }

    // 3. Metadata validation
    const metadata = (data.metadata || {}) as Record<string, unknown>
    const sanitizedMetadata = {
      id: typeof metadata.id === 'string' ? metadata.id : 'proj-' + Date.now(),
      name: typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : 'Untitled Project',
      version: D2_PROJECT_SCHEMA_VERSION,
      d2AppVersion: typeof metadata.d2AppVersion === 'string' ? metadata.d2AppVersion : '0.1.0',
      createdAt: typeof metadata.createdAt === 'string' ? metadata.createdAt : new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      author: typeof metadata.author === 'string' ? metadata.author : undefined,
      description: typeof metadata.description === 'string' ? metadata.description : undefined,
      tags: Array.isArray(metadata.tags) ? (metadata.tags as string[]) : [],
    }

    // 4. Canvas validation
    const canvas = (data.canvas || {}) as Record<string, unknown>
    const sanitizedCanvas = {
      width: typeof canvas.width === 'number' && canvas.width > 0 ? canvas.width : 1920,
      height: typeof canvas.height === 'number' && canvas.height > 0 ? canvas.height : 1080,
      aspectRatio: (['16:9', '9:16', '1:1'].includes(canvas.aspectRatio as string)
        ? canvas.aspectRatio
        : '16:9') as '16:9' | '9:16' | '1:1',
      fps: typeof canvas.fps === 'number' && [24, 30, 50, 60].includes(canvas.fps) ? canvas.fps : 30,
      duration: typeof canvas.duration === 'number' && canvas.duration > 0 ? canvas.duration : 198.0,
    }

    // 5. Composition validation
    if (!data.composition || typeof data.composition !== 'object') {
      errors.push('Missing composition block in project file.')
    }
    const comp = (data.composition || {}) as Record<string, unknown>

    // 6. Timeline validation
    if (!data.timeline || typeof data.timeline !== 'object') {
      errors.push('Missing timeline block in project file.')
    }
    const tl = (data.timeline || {}) as Record<string, unknown>
    if (!Array.isArray(tl.tracks)) {
      warnings.push('Timeline tracks array missing or invalid; default tracks will be initialized.')
    }

    // 7. Audio validation
    const audio = (data.audio || {}) as Record<string, unknown>
    const sanitizedAudio = {
      currentTrack: audio.currentTrack ? (audio.currentTrack as any) : null,
      filePath: typeof audio.filePath === 'string' ? audio.filePath : null,
      fileName: typeof audio.fileName === 'string' ? audio.fileName : null,
      volume: typeof audio.volume === 'number' ? Math.max(0, Math.min(1, audio.volume)) : 0.85,
      isMuted: !!audio.isMuted,
      isLooping: audio.isLooping !== undefined ? !!audio.isLooping : true,
    }

    // 8. Export settings validation
    const exp = (data.export || {}) as Record<string, unknown>
    const sanitizedExport = {
      selectedPresetId: (['1080p', '1440p', '4k', 'shorts', 'square'].includes(exp.selectedPresetId as string)
        ? exp.selectedPresetId
        : '1080p') as any,
      width: typeof exp.width === 'number' ? exp.width : sanitizedCanvas.width,
      height: typeof exp.height === 'number' ? exp.height : sanitizedCanvas.height,
      aspectRatio: sanitizedCanvas.aspectRatio,
      fps: typeof exp.fps === 'number' ? exp.fps : sanitizedCanvas.fps,
      videoCodec: (['auto', 'h264_nvenc', 'libx264'].includes(exp.videoCodec as string)
        ? exp.videoCodec
        : 'auto') as any,
      quality: (['draft', 'balanced', 'high', 'pro'].includes(exp.quality as string)
        ? exp.quality
        : 'high') as any,
      bitrate: typeof exp.bitrate === 'string' ? exp.bitrate : '16M',
      audioBitrate: typeof exp.audioBitrate === 'string' ? exp.audioBitrate : '192k',
      fileName: typeof exp.fileName === 'string' ? exp.fileName : sanitizedMetadata.name.replace(/[\\/:*?"<>|]/g, '_') + '.mp4',
      outputFolder: typeof exp.outputFolder === 'string' ? exp.outputFolder : undefined,
    }

    // 9. Assets list
    const assets: D2ProjectAssetReference[] = Array.isArray(data.assets) ? (data.assets as any[]) : []
    const missingAssets: D2ProjectAssetReference[] = []

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        migrated: false,
        missingAssets: [],
      }
    }

    const sanitizedProject: D2ProjectData = {
      d2Format: D2_PROJECT_FORMAT_MAGIC,
      schemaVersion: D2_PROJECT_SCHEMA_VERSION,
      metadata: sanitizedMetadata,
      canvas: sanitizedCanvas,
      composition: comp as any,
      timeline: {
        tracks: Array.isArray(tl.tracks) ? (tl.tracks as any) : [],
        markers: Array.isArray(tl.markers) ? (tl.markers as any) : [],
        fps: typeof tl.fps === 'number' ? tl.fps : sanitizedCanvas.fps,
        snapEnabled: tl.snapEnabled !== undefined ? !!tl.snapEnabled : true,
      },
      audio: sanitizedAudio,
      export: sanitizedExport,
      assets,
      thumbnailDataUrl: typeof data.thumbnailDataUrl === 'string' ? data.thumbnailDataUrl : undefined,
    }

    return {
      valid: true,
      errors: [],
      warnings,
      migrated,
      project: sanitizedProject,
      missingAssets,
    }
  }
}
