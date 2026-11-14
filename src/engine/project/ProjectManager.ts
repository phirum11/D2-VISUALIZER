import {
  D2ProjectData,
  D2_PROJECT_FORMAT_MAGIC,
  D2_PROJECT_SCHEMA_VERSION,
  D2ProjectAssetReference,
} from '@/types/project'
import { ProjectValidator, ValidationResult } from './ProjectValidator'
import { useCompositionStore } from '@/stores/compositionStore'
import { useTimelineStore } from '@/stores/timelineStore'
import { useAudioStore } from '@/stores/audioStore'
import { useExportStore } from '@/stores/exportStore'
import { usePreviewStore } from '@/stores/previewStore'
import { useProjectStore } from '@/stores/projectStore'
import { ProjectTemplate } from '@/engine/templates/types'
import { TrackManager } from '@/engine/timeline/TrackManager'
import { BackgroundManager } from '@/engine/background/BackgroundManager'
import { OverlayRenderer } from '@/engine/overlay/OverlayRenderer'

export class ProjectManager {
  /**
   * Serializes current workstation state across all stores into a D2ProjectData structure
   */
  public static exportCurrentProjectData(thumbnailDataUrl?: string): D2ProjectData {
    const comp = useCompositionStore.getState()
    const tl = useTimelineStore.getState()
    const audio = useAudioStore.getState()
    const exp = useExportStore.getState()
    const prev = usePreviewStore.getState()
    const proj = useProjectStore.getState()

    const now = new Date().toISOString()

    // Collect asset references
    const assets: D2ProjectAssetReference[] = []

    // 1. Audio track
    if (audio.currentTrack?.filePath) {
      assets.push({
        id: 'asset-audio-' + Date.now(),
        type: 'audio',
        originalPath: audio.currentTrack.filePath,
        fileName: audio.currentTrack.name || 'audio_track',
        fileSize: audio.currentTrack.fileSize,
      })
    }

    // 2. Background media
    if (comp.background.mediaPath && comp.background.mediaType) {
      let rawPath = comp.background.mediaPath
      if (rawPath.startsWith('d2-media://')) {
        const u = new URL(rawPath)
        rawPath = decodeURIComponent(u.searchParams.get('path') || rawPath)
      }
      assets.push({
        id: 'asset-bg-' + Date.now(),
        type: comp.background.mediaType,
        originalPath: rawPath,
        fileName: comp.background.mediaName || 'background_media',
      })
    }

    // 3. Overlays (logos / album artwork)
    for (const ov of comp.overlays) {
      if ((ov.type === 'logo' || ov.type === 'artwork') && ov.src) {
        let rawSrc = ov.src
        if (rawSrc.startsWith('d2-media://')) {
          const u = new URL(rawSrc)
          rawSrc = decodeURIComponent(u.searchParams.get('path') || rawSrc)
        }
        assets.push({
          id: 'asset-ov-' + ov.id,
          type: ov.type === 'logo' ? 'logo' : 'image',
          originalPath: rawSrc,
          fileName: ov.mediaName || ov.name || 'overlay_image',
        })
      }
    }

    return {
      d2Format: D2_PROJECT_FORMAT_MAGIC,
      schemaVersion: D2_PROJECT_SCHEMA_VERSION,
      metadata: {
        id: proj.projectId || 'proj-' + Date.now(),
        name: proj.projectName || 'Untitled Project',
        version: D2_PROJECT_SCHEMA_VERSION,
        d2AppVersion: '0.1.0',
        createdAt: proj.createdAt || now,
        modifiedAt: now,
        author: proj.author,
        description: proj.description,
      },
      canvas: {
        width: exp.width || 1920,
        height: exp.height || 1080,
        aspectRatio: prev.aspectRatio || '16:9',
        fps: tl.fps || exp.fps || 30,
        duration: prev.duration || 198.0,
      },
      composition: {
        visualizer: { ...comp.visualizer },
        background: { ...comp.background },
        text: { ...comp.text },
        effects: { ...comp.effects },
        ambientParticles: { ...comp.ambientParticles },
        cinematicMotion: { ...comp.cinematicMotion },
        layers: [...comp.layers],
        overlays: [...comp.overlays],
      },
      timeline: {
        tracks: [...tl.tracks],
        markers: [...tl.markers],
        fps: tl.fps || 30,
        snapEnabled: tl.snapEnabled,
      },
      audio: {
        currentTrack: audio.currentTrack,
        filePath: audio.currentTrack?.filePath || null,
        fileName: audio.currentTrack?.name || null,
        volume: audio.volume,
        isMuted: audio.isMuted,
        isLooping: audio.isLooping,
      },
      export: {
        selectedPresetId: exp.selectedPresetId,
        width: exp.width,
        height: exp.height,
        aspectRatio: exp.aspectRatio,
        fps: exp.fps,
        videoCodec: exp.videoCodec,
        quality: exp.quality,
        bitrate: exp.bitrate,
        audioBitrate: exp.audioBitrate,
        fileName: exp.fileName,
        outputFolder: exp.outputFolder,
      },
      assets,
      thumbnailDataUrl,
    }
  }

  /**
   * Loads and restores a D2ProjectData structure into the application stores
   */
  public static async loadProjectData(
    raw: unknown,
    filePath?: string
  ): Promise<{ success: boolean; errors: string[]; missingAssets: D2ProjectAssetReference[] }> {
    const valResult: ValidationResult = ProjectValidator.validate(raw)
    if (!valResult.valid || !valResult.project) {
      return {
        success: false,
        errors: valResult.errors,
        missingAssets: [],
      }
    }

    const proj = valResult.project
    const missingAssets: D2ProjectAssetReference[] = []

    // 1. Restore Composition Store
    useCompositionStore.setState({
      visualizer: { ...proj.composition.visualizer },
      background: { ...proj.composition.background },
      text: { ...proj.composition.text },
      effects: { ...proj.composition.effects },
      ambientParticles: { ...proj.composition.ambientParticles },
      cinematicMotion: { ...proj.composition.cinematicMotion },
      layers: [...proj.composition.layers],
      overlays: [...proj.composition.overlays],
      past: [],
      future: [],
    })

    // 2. Restore Timeline Store
    useTimelineStore.setState({
      tracks: [...proj.timeline.tracks],
      markers: [...proj.timeline.markers],
      fps: proj.timeline.fps || proj.canvas.fps || 30,
      snapEnabled: proj.timeline.snapEnabled,
    })

    // 3. Restore Preview Store
    usePreviewStore.setState({
      aspectRatio: proj.canvas.aspectRatio,
      duration: proj.canvas.duration,
    })

    // 4. Restore Export Store
    useExportStore.setState({
      selectedPresetId: proj.export.selectedPresetId,
      width: proj.canvas.width,
      height: proj.canvas.height,
      aspectRatio: proj.canvas.aspectRatio,
      fps: proj.canvas.fps,
      videoCodec: proj.export.videoCodec,
      quality: proj.export.quality,
      bitrate: proj.export.bitrate,
      audioBitrate: proj.export.audioBitrate,
      fileName: proj.export.fileName,
      outputFolder: proj.export.outputFolder || useExportStore.getState().outputFolder,
    })

    // 5. Restore Audio Store (if audio file referenced)
    if (proj.audio.filePath && typeof window !== 'undefined' && window.electronAPI) {
      try {
        const stats = await window.electronAPI.getFileStats(proj.audio.filePath)
        if (stats && stats.size > 0) {
          await useAudioStore.getState().importFromPath(proj.audio.filePath, proj.audio.fileName || undefined)
        } else {
          missingAssets.push({
            id: 'audio-missing',
            type: 'audio',
            originalPath: proj.audio.filePath,
            fileName: proj.audio.fileName || 'Audio Track',
            exists: false,
          })
        }
      } catch {
        missingAssets.push({
          id: 'audio-missing',
          type: 'audio',
          originalPath: proj.audio.filePath,
          fileName: proj.audio.fileName || 'Audio Track',
          exists: false,
        })
      }
    }

    // 6. Preload background media if present
    const bg = proj.composition.background
    if (bg.mediaPath && typeof window !== 'undefined' && window.electronAPI) {
      try {
        const bgMgr = BackgroundManager.getInstance()
        let cleanPath = bg.mediaPath
        if (cleanPath.startsWith('d2-media://')) {
          const u = new URL(cleanPath)
          cleanPath = decodeURIComponent(u.searchParams.get('path') || cleanPath)
        }
        const stats = await window.electronAPI.getFileStats(cleanPath)
        if (stats && stats.size > 0) {
          if (bg.mediaType === 'image') {
            await bgMgr.loadImage(bg.mediaPath)
          } else if (bg.mediaType === 'video') {
            await bgMgr.loadVideo(bg.mediaPath)
          }
        } else {
          missingAssets.push({
            id: 'bg-missing',
            type: bg.mediaType || 'image',
            originalPath: cleanPath,
            fileName: bg.mediaName || 'Background Media',
            exists: false,
          })
        }
      } catch {
        // ignore background preload error
      }
    }

    // 7. Preload overlay images
    const ovRenderer = OverlayRenderer.getInstance()
    for (const ov of proj.composition.overlays) {
      if ((ov.type === 'logo' || ov.type === 'artwork') && ov.src) {
        try {
          await ovRenderer.preloadImage(ov.src)
        } catch {
          // ignore
        }
      }
    }

    // 8. Update Project Store
    useProjectStore.getState().onProjectLoaded({
      projectId: proj.metadata.id,
      projectName: proj.metadata.name,
      filePath: filePath || null,
      createdAt: proj.metadata.createdAt,
      author: proj.metadata.author,
      description: proj.metadata.description,
    })

    return {
      success: true,
      errors: [],
      missingAssets,
    }
  }

  /**
   * Initializes a brand-new real editable project structure from a starter template
   */
  public static createProjectFromTemplate(template: ProjectTemplate): void {
    const defaultTracks = TrackManager.createDefaultTracks(template.canvas.duration)

    // Update composition store with rich template presets
    useCompositionStore.getState().updateVisualizer({
      ...template.composition.visualizer,
    })

    useCompositionStore.getState().updateBackground({
      ...template.composition.background,
    })

    useCompositionStore.getState().updateEffects({
      ...template.composition.effects,
    })

    useCompositionStore.getState().updateAmbientParticles({
      ...template.composition.ambientParticles,
    })

    useCompositionStore.getState().updateCinematicMotion({
      ...template.composition.cinematicMotion,
    })

    // Reset and apply overlays
    useCompositionStore.getState().resetOverlays()
    if (template.composition.overlays && template.composition.overlays.length > 0) {
      for (const ov of template.composition.overlays) {
        const fullOverlay = {
          role: 'title',
          fontStyle: 'normal',
          lineHeight: 1.2,
          scale: 1,
          rotation: 0,
          shadowColor: 'rgba(0,0,0,0.8)',
          shadowBlur: 8,
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          outlineColor: '',
          outlineWidth: 0,
          glowColor: '',
          glowBlur: 0,
          bgBox: false,
          bgBoxColor: 'rgba(0,0,0,0.5)',
          bgBoxPadding: 8,
          bgBoxRadius: 4,
          bgBoxOpacity: 1,
          animation: { preset: 'none', startTime: 0, duration: 1, delay: 0, easing: 'ease-out', intensity: 1 },
          visible: true,
          locked: false,
          ...ov,
        }
        useCompositionStore.getState().addOverlay(fullOverlay as any)
      }
    }

    // Update Timeline
    useTimelineStore.setState({
      tracks: defaultTracks,
      fps: template.canvas.fps,
      zoom: template.aspectRatio === '9:16' ? 14 : 12,
    })

    // Update Preview Store
    usePreviewStore.setState({
      aspectRatio: template.aspectRatio,
      duration: template.canvas.duration,
    })

    // Update Export Store
    useExportStore.setState({
      selectedPresetId: template.export.selectedPresetId,
      width: template.canvas.width,
      height: template.canvas.height,
      aspectRatio: template.aspectRatio,
      fps: template.canvas.fps,
      bitrate: template.export.bitrate,
      quality: template.export.quality,
      fileName: template.name.replace(/[\\/:*?"<>|]/g, '_') + '.mp4',
    })

    // Update Project Store
    useProjectStore.getState().initNewProject(template.name)
  }
}
