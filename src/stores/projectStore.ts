import { create } from 'zustand'
import {
  RecentProjectItem,
  RecoverySession,
  D2ProjectAssetReference,
} from '@/types/project'
import { ProjectManager } from '@/engine/project/ProjectManager'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface ProjectState {
  // Active Project Identity
  projectId: string
  projectName: string
  currentFilePath: string | null
  createdAt: string
  modifiedAt: string
  author?: string
  description?: string

  // State flags
  isDirty: boolean
  saveStatus: SaveStatus
  lastSavedAt: string | null

  // Auto-Save Configuration
  autoSaveEnabled: boolean
  autoSaveIntervalSeconds: number
  setAutoSaveSettings: (enabled: boolean, intervalSeconds: number) => void

  // Recents & Recovery
  recentProjects: RecentProjectItem[]
  recoverySession: RecoverySession | null
  missingAssets: D2ProjectAssetReference[]

  // Modals Visibility
  isProjectBrowserOpen: boolean
  isTemplateBrowserOpen: boolean
  isPresetManagerOpen: boolean
  isMissingMediaModalOpen: boolean

  // Actions
  initNewProject: (name?: string) => void
  setProjectName: (name: string) => void
  markDirty: () => void
  setSaveStatus: (status: SaveStatus) => void
  onProjectLoaded: (meta: {
    projectId: string
    projectName: string
    filePath: string | null
    createdAt: string
    author?: string
    description?: string
  }) => void

  // Persistence Operations
  saveProject: () => Promise<boolean>
  saveProjectAs: () => Promise<boolean>
  openProjectViaDialog: () => Promise<boolean>
  loadProjectFromPath: (filePath: string) => Promise<boolean>
  autoSaveSnapshot: () => Promise<void>
  checkRecoverySession: () => Promise<void>
  restoreRecoverySession: () => Promise<boolean>
  discardRecoverySession: () => Promise<void>
  refreshRecentProjects: () => Promise<void>
  removeRecentProject: (filePath: string) => Promise<void>
  deleteProjectFile: (filePath: string) => Promise<boolean>
  collectAndBundleAssets: () => Promise<boolean>

  // Modals Toggles
  setProjectBrowserOpen: (open: boolean) => void
  setTemplateBrowserOpen: (open: boolean) => void
  setPresetManagerOpen: (open: boolean) => void
  setMissingMediaModalOpen: (open: boolean) => void
}

let autoSaveTimer: NodeJS.Timeout | null = null

export const useProjectStore = create<ProjectState>((set, get) => {
  // Start background auto-save loop
  const startAutoSaveLoop = () => {
    if (typeof window === 'undefined') return
    if (autoSaveTimer) clearInterval(autoSaveTimer)

    autoSaveTimer = setInterval(() => {
      const state = get()
      if (state.autoSaveEnabled && state.isDirty && state.saveStatus !== 'saving') {
        get().autoSaveSnapshot()
      }
    }, 30000) // Every 30 seconds
  }

  // Initialize auto save loop
  startAutoSaveLoop()

  return {
    projectId: 'proj-' + Date.now(),
    projectName: 'Untitled Project',
    currentFilePath: null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    isDirty: false,
    saveStatus: 'saved',
    lastSavedAt: null,
    autoSaveEnabled: true,
    autoSaveIntervalSeconds: 30,

    setAutoSaveSettings: (enabled: boolean, intervalSeconds: number) => {
      set({ autoSaveEnabled: enabled, autoSaveIntervalSeconds: intervalSeconds })
      if (autoSaveTimer) clearInterval(autoSaveTimer)
      if (enabled && intervalSeconds > 0) {
        autoSaveTimer = setInterval(() => {
          const state = get()
          if (state.autoSaveEnabled && state.isDirty && state.saveStatus !== 'saving') {
            get().autoSaveSnapshot()
          }
        }, intervalSeconds * 1000)
      }
    },
    recentProjects: [],
    recoverySession: null,
    missingAssets: [],
    isProjectBrowserOpen: false,
    isTemplateBrowserOpen: false,
    isPresetManagerOpen: false,
    isMissingMediaModalOpen: false,

    initNewProject: (name?: string) => {
      const now = new Date().toISOString()
      set({
        projectId: 'proj-' + Date.now(),
        projectName: name || 'Untitled Project',
        currentFilePath: null,
        createdAt: now,
        modifiedAt: now,
        isDirty: false,
        saveStatus: 'saved',
        lastSavedAt: null,
        missingAssets: [],
      })
    },

    setProjectName: (name: string) => {
      set({ projectName: name, isDirty: true, saveStatus: 'unsaved' })
    },

    markDirty: () => {
      if (!get().isDirty) {
        set({ isDirty: true, saveStatus: 'unsaved' })
      }
    },

    setSaveStatus: (status: SaveStatus) => {
      set({ saveStatus: status })
    },

    onProjectLoaded: (meta) => {
      set({
        projectId: meta.projectId,
        projectName: meta.projectName,
        currentFilePath: meta.filePath,
        createdAt: meta.createdAt,
        modifiedAt: new Date().toISOString(),
        author: meta.author,
        description: meta.description,
        isDirty: false,
        saveStatus: 'saved',
        lastSavedAt: new Date().toLocaleTimeString(),
      })
    },

    saveProject: async () => {
      const { currentFilePath } = get()
      if (!currentFilePath) {
        return await get().saveProjectAs()
      }

      if (typeof window === 'undefined' || !window.electronAPI) {
        console.warn('Native project save requires Electron runtime')
        return false
      }

      set({ saveStatus: 'saving' })
      try {
        const projectData = ProjectManager.exportCurrentProjectData()
        const res = await window.electronAPI.projectSave(currentFilePath, projectData)

        if (res.success) {
          set({
            isDirty: false,
            saveStatus: 'saved',
            lastSavedAt: new Date().toLocaleTimeString(),
          })
          await get().refreshRecentProjects()
          return true
        } else {
          console.error('[PROJECT SAVE] Error:', res.error)
          set({ saveStatus: 'unsaved' })
          return false
        }
      } catch (err) {
        console.error('[PROJECT SAVE] Exception:', err)
        set({ saveStatus: 'unsaved' })
        return false
      }
    },

    saveProjectAs: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return false

      try {
        const { projectName } = get()
        const defaultName = projectName.replace(/[\\/:*?"<>|]/g, '_')
        const dialogRes = await window.electronAPI.projectSaveDialog(defaultName)

        if (dialogRes.canceled || !dialogRes.filePath) {
          return false
        }

        const targetPath = dialogRes.filePath
        set({ saveStatus: 'saving' })

        const projectData = ProjectManager.exportCurrentProjectData()
        const res = await window.electronAPI.projectSave(targetPath, projectData)

        if (res.success) {
          set({
            currentFilePath: targetPath,
            isDirty: false,
            saveStatus: 'saved',
            lastSavedAt: new Date().toLocaleTimeString(),
          })
          await get().refreshRecentProjects()
          return true
        } else {
          set({ saveStatus: 'unsaved' })
          return false
        }
      } catch (err) {
        console.error('[PROJECT SAVE AS] Exception:', err)
        set({ saveStatus: 'unsaved' })
        return false
      }
    },

    openProjectViaDialog: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return false

      try {
        const res = await window.electronAPI.projectOpenDialog()
        if (res.canceled || !res.filePath || !res.data) {
          return false
        }

        const loadRes = await ProjectManager.loadProjectData(res.data, res.filePath)
        if (loadRes.success) {
          if (loadRes.missingAssets.length > 0) {
            set({ missingAssets: loadRes.missingAssets, isMissingMediaModalOpen: true })
          }
          await get().refreshRecentProjects()
          return true
        } else {
          console.error('[PROJECT OPEN] Failed to load:', loadRes.errors)
          return false
        }
      } catch (err) {
        console.error('[PROJECT OPEN] Exception:', err)
        return false
      }
    },

    loadProjectFromPath: async (filePath: string) => {
      if (typeof window === 'undefined' || !window.electronAPI) return false

      try {
        const res = await window.electronAPI.projectLoad(filePath)
        if (!res.success || !res.data) {
          console.error('[LOAD FROM PATH] Failed:', res.error)
          return false
        }

        const loadRes = await ProjectManager.loadProjectData(res.data, filePath)
        if (loadRes.success) {
          if (loadRes.missingAssets.length > 0) {
            set({ missingAssets: loadRes.missingAssets, isMissingMediaModalOpen: true })
          }
          await get().refreshRecentProjects()
          return true
        }
        return false
      } catch (err) {
        console.error('[LOAD FROM PATH] Exception:', err)
        return false
      }
    },

    autoSaveSnapshot: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return
      const { isDirty, currentFilePath } = get()
      if (!isDirty) return

      try {
        const projectData = ProjectManager.exportCurrentProjectData()
        await window.electronAPI.projectAutoSave(projectData, currentFilePath || undefined)
        console.log('[AUTO-SAVE] Recovery snapshot written successfully.')
      } catch (err) {
        console.error('[AUTO-SAVE] Error writing snapshot:', err)
      }
    },

    checkRecoverySession: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return
      try {
        const session = await window.electronAPI.projectGetRecovery()
        if (session && session.hasRecovery && session.data) {
          set({
            recoverySession: {
              hasRecovery: true,
              timestamp: session.timestamp,
              project: session.data,
              originalPath: session.originalPath,
            },
          })
        }
      } catch (err) {
        console.error('[CHECK RECOVERY] Error:', err)
      }
    },

    restoreRecoverySession: async () => {
      const { recoverySession } = get()
      if (!recoverySession || !recoverySession.project) return false

      try {
        const loadRes = await ProjectManager.loadProjectData(
          recoverySession.project,
          recoverySession.originalPath || undefined
        )
        if (loadRes.success) {
          await get().discardRecoverySession()
          set({ isDirty: true, saveStatus: 'unsaved' })
          return true
        }
        return false
      } catch (err) {
        console.error('[RESTORE RECOVERY] Error:', err)
        return false
      }
    },

    discardRecoverySession: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return
      try {
        await window.electronAPI.projectDiscardRecovery()
        set({ recoverySession: null })
      } catch (err) {
        console.error('[DISCARD RECOVERY] Error:', err)
      }
    },

    refreshRecentProjects: async () => {
      if (typeof window === 'undefined' || !window.electronAPI) return
      try {
        const recents = await window.electronAPI.projectGetRecents()
        if (Array.isArray(recents)) {
          set({ recentProjects: recents })
        }
      } catch (err) {
        console.error('[RECENTS] Error:', err)
      }
    },

    removeRecentProject: async (filePath: string) => {
      if (typeof window === 'undefined' || !window.electronAPI) return
      try {
        await window.electronAPI.projectRemoveRecent(filePath)
        await get().refreshRecentProjects()
      } catch (err) {
        console.error('[REMOVE RECENT] Error:', err)
      }
    },

    deleteProjectFile: async (filePath: string) => {
      if (typeof window === 'undefined' || !window.electronAPI) return false
      try {
        const res = await window.electronAPI.projectDeleteFile(filePath)
        await get().refreshRecentProjects()
        return res.success
      } catch (err) {
        console.error('[DELETE FILE] Error:', err)
        return false
      }
    },

    collectAndBundleAssets: async () => {
      const { currentFilePath } = get()
      if (!currentFilePath || typeof window === 'undefined' || !window.electronAPI) {
        return false
      }

      const projectData = ProjectManager.exportCurrentProjectData()
      if (!projectData.assets || projectData.assets.length === 0) {
        return true
      }

      try {
        const res = await window.electronAPI.projectBundleAssets(currentFilePath, projectData.assets)
        if (res.success && res.bundledAssets) {
          projectData.assets = res.bundledAssets
          await window.electronAPI.projectSave(currentFilePath, projectData)
          return true
        }
        return false
      } catch (err) {
        console.error('[BUNDLE ASSETS] Error:', err)
        return false
      }
    },

    setProjectBrowserOpen: (open: boolean) => set({ isProjectBrowserOpen: open }),
    setTemplateBrowserOpen: (open: boolean) => set({ isTemplateBrowserOpen: open }),
    setPresetManagerOpen: (open: boolean) => set({ isPresetManagerOpen: open }),
    setMissingMediaModalOpen: (open: boolean) => set({ isMissingMediaModalOpen: open }),
  }
})
