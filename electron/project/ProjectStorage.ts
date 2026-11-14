import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export interface RecentProjectStorageEntry {
  id: string
  name: string
  filePath: string
  createdAt: string
  modifiedAt: string
  canvas: {
    width: number
    height: number
    aspectRatio: string
    fps: number
    duration: number
  }
  fileSize?: number
  thumbnailDataUrl?: string
}

export class ProjectStorage {
  private static instance: ProjectStorage | null = null

  private constructor() {}

  public static getInstance(): ProjectStorage {
    if (!ProjectStorage.instance) {
      ProjectStorage.instance = new ProjectStorage()
    }
    return ProjectStorage.instance
  }

  private getUserDataDir(): string {
    return app.getPath('userData')
  }

  private getAutoSaveDir(): string {
    const dir = path.join(this.getUserDataDir(), 'autosave')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  private getPresetsDir(): string {
    const dir = path.join(this.getUserDataDir(), 'presets')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  private getRecentsFilePath(): string {
    return path.join(this.getUserDataDir(), 'recent_projects.json')
  }

  /**
   * Atomic file write to avoid corrupted / half-written files
   */
  public async saveProjectFile(filePath: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const tempPath = filePath + '.tmp.' + Date.now()
      const jsonContent = JSON.stringify(data, null, 2)

      // Write to temp file
      fs.writeFileSync(tempPath, jsonContent, 'utf-8')

      // Atomic rename
      fs.renameSync(tempPath, filePath)

      // Update recents
      this.addRecentProject({
        id: data.metadata?.id || 'proj-' + Date.now(),
        name: data.metadata?.name || path.basename(filePath, '.d2proj'),
        filePath,
        createdAt: data.metadata?.createdAt || new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        canvas: data.canvas || { width: 1920, height: 1080, aspectRatio: '16:9', fps: 30, duration: 180 },
        fileSize: Buffer.byteLength(jsonContent, 'utf-8'),
        thumbnailDataUrl: data.thumbnailDataUrl,
      })

      return { success: true }
    } catch (err: any) {
      console.error('[PROJECT STORAGE] Failed to save project:', err)
      return { success: false, error: err.message || String(err) }
    }
  }

  /**
   * Loads and parses a .d2proj file
   */
  public async loadProjectFile(filePath: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` }
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)

      return { success: true, data: parsed }
    } catch (err: any) {
      console.error('[PROJECT STORAGE] Failed to load project:', err)
      return { success: false, error: err.message || String(err) }
    }
  }

  /**
   * Writes auto-save recovery snapshot
   */
  public async writeAutoSave(data: any, originalPath?: string): Promise<{ success: boolean }> {
    try {
      const dir = this.getAutoSaveDir()
      const recoveryFile = path.join(dir, 'recovery.d2proj')
      const manifestFile = path.join(dir, 'recovery_manifest.json')
      const tempPath = recoveryFile + '.tmp.' + Date.now()

      const jsonContent = JSON.stringify(data, null, 2)
      fs.writeFileSync(tempPath, jsonContent, 'utf-8')
      fs.renameSync(tempPath, recoveryFile)

      const manifest = {
        timestamp: new Date().toISOString(),
        originalPath: originalPath || null,
        projectName: data.metadata?.name || 'Untitled Project',
      }
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf-8')

      return { success: true }
    } catch (err) {
      console.error('[PROJECT STORAGE] Auto-save error:', err)
      return { success: false }
    }
  }

  /**
   * Checks if recovery snapshot exists
   */
  public getRecoverySession(): { hasRecovery: boolean; timestamp?: string; originalPath?: string | null; data?: any } {
    try {
      const dir = this.getAutoSaveDir()
      const recoveryFile = path.join(dir, 'recovery.d2proj')
      const manifestFile = path.join(dir, 'recovery_manifest.json')

      if (!fs.existsSync(recoveryFile)) {
        return { hasRecovery: false }
      }

      let timestamp = new Date().toISOString()
      let originalPath: string | null = null

      if (fs.existsSync(manifestFile)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'))
          timestamp = manifest.timestamp || timestamp
          originalPath = manifest.originalPath || null
        } catch {
          // ignore
        }
      }

      const content = fs.readFileSync(recoveryFile, 'utf-8')
      const data = JSON.parse(content)

      return {
        hasRecovery: true,
        timestamp,
        originalPath,
        data,
      }
    } catch (err) {
      console.error('[PROJECT STORAGE] Error reading recovery session:', err)
      return { hasRecovery: false }
    }
  }

  /**
   * Discards recovery snapshot
   */
  public discardRecovery(): boolean {
    try {
      const dir = this.getAutoSaveDir()
      const recoveryFile = path.join(dir, 'recovery.d2proj')
      const manifestFile = path.join(dir, 'recovery_manifest.json')

      if (fs.existsSync(recoveryFile)) fs.unlinkSync(recoveryFile)
      if (fs.existsSync(manifestFile)) fs.unlinkSync(manifestFile)
      return true
    } catch {
      return false
    }
  }

  /**
   * Recent Projects
   */
  public getRecentProjects(): RecentProjectStorageEntry[] {
    try {
      const recentsFile = this.getRecentsFilePath()
      if (!fs.existsSync(recentsFile)) return []

      const content = fs.readFileSync(recentsFile, 'utf-8')
      const recents: RecentProjectStorageEntry[] = JSON.parse(content)

      // Annotate exists flag
      return recents.map((item) => ({
        ...item,
        exists: fs.existsSync(item.filePath),
      }))
    } catch {
      return []
    }
  }

  public addRecentProject(entry: RecentProjectStorageEntry): void {
    try {
      const recents = this.getRecentProjects().filter((r) => r.filePath !== entry.filePath)
      recents.unshift(entry)
      const limited = recents.slice(0, 20)

      fs.writeFileSync(this.getRecentsFilePath(), JSON.stringify(limited, null, 2), 'utf-8')
    } catch (err) {
      console.error('[PROJECT STORAGE] Failed to write recents:', err)
    }
  }

  public removeRecentProject(filePath: string): boolean {
    try {
      const recents = this.getRecentProjects().filter((r) => r.filePath !== filePath)
      fs.writeFileSync(this.getRecentsFilePath(), JSON.stringify(recents, null, 2), 'utf-8')
      return true
    } catch {
      return false
    }
  }

  public deleteProjectFile(filePath: string): { success: boolean; error?: string } {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      this.removeRecentProject(filePath)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || String(err) }
    }
  }

  /**
   * Bundles external assets into a project folder (asset collection)
   */
  public async collectAndBundleAssets(
    projectFilePath: string,
    assetPaths: Array<{ id: string; type: string; originalPath: string; fileName: string }>
  ): Promise<{ success: boolean; bundledAssets: any[]; error?: string }> {
    try {
      const projectDir = path.dirname(projectFilePath)
      const assetsDir = path.join(projectDir, 'assets')

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true })
      }

      const bundledAssets = []

      for (const asset of assetPaths) {
        if (!asset.originalPath || !fs.existsSync(asset.originalPath)) {
          bundledAssets.push({
            ...asset,
            isBundled: false,
            exists: false,
          })
          continue
        }

        const targetFileName = `${asset.id}_${path.basename(asset.originalPath)}`
        const targetPath = path.join(assetsDir, targetFileName)

        // Copy file
        fs.copyFileSync(asset.originalPath, targetPath)

        bundledAssets.push({
          ...asset,
          originalPath: targetPath,
          relativePath: `assets/${targetFileName}`,
          isBundled: true,
          exists: true,
          fileSize: fs.statSync(targetPath).size,
        })
      }

      return { success: true, bundledAssets }
    } catch (err: any) {
      return { success: false, bundledAssets: [], error: err.message || String(err) }
    }
  }

  /**
   * User Presets Storage
   */
  public getUserPresets(): any[] {
    try {
      const baseDir = this.getPresetsDir()
      const allPresets: any[] = []

      const categories = fs.readdirSync(baseDir)
      for (const cat of categories) {
        const catDir = path.join(baseDir, cat)
        if (fs.statSync(catDir).isDirectory()) {
          const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.json'))
          for (const file of files) {
            try {
              const content = fs.readFileSync(path.join(catDir, file), 'utf-8')
              allPresets.push(JSON.parse(content))
            } catch {
              // ignore corrupted preset
            }
          }
        }
      }
      return allPresets
    } catch {
      return []
    }
  }

  public saveUserPreset(preset: any): { success: boolean; error?: string } {
    try {
      const baseDir = this.getPresetsDir()
      const catDir = path.join(baseDir, preset.category || 'misc')
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true })
      }

      const filePath = path.join(catDir, `${preset.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(preset, null, 2), 'utf-8')
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || String(err) }
    }
  }

  public deleteUserPreset(category: string, id: string): boolean {
    try {
      const filePath = path.join(this.getPresetsDir(), category, `${id}.json`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch {
      return false
    }
  }
}
