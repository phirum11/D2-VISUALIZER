export const IPC_CHANNELS = {
  // Window Controls
  WINDOW_MINIMIZE: 'd2:window:minimize',
  WINDOW_MAXIMIZE: 'd2:window:maximize',
  WINDOW_CLOSE: 'd2:window:close',
  WINDOW_IS_MAXIMIZED: 'd2:window:isMaximized',
  WINDOW_ON_MAXIMIZE_CHANGE: 'd2:window:onMaximizeChange',

  // App & System Information
  APP_GET_VERSION: 'd2:app:getVersion',
  APP_GET_PLATFORM: 'd2:app:getPlatform',

  // Dialogs
  DIALOG_OPEN_AUDIO: 'd2:dialog:openAudio',
  DIALOG_OPEN_BACKGROUND: 'd2:dialog:openBackground',
  DIALOG_OPEN_IMAGE: 'd2:dialog:openImage',
  DIALOG_SELECT_OUTPUT_FOLDER: 'd2:dialog:selectOutputFolder',

  // Media File Handling
  MEDIA_READ_BUFFER: 'd2:media:readBuffer',
  MEDIA_GET_STATS: 'd2:media:getStats',
  MEDIA_GET_DEMO_TRACK: 'd2:media:getDemoTrack',

  // FFmpeg Offline Video Rendering & Export
  EXPORT_START: 'd2:export:start',
  EXPORT_WRITE_FRAME: 'd2:export:writeFrame',
  EXPORT_FINISH: 'd2:export:finish',
  EXPORT_CANCEL: 'd2:export:cancel',
  EXPORT_GET_ENCODERS: 'd2:export:getEncoders',
  EXPORT_SHOW_IN_FOLDER: 'd2:export:showInFolder',

  // Project Persistence (.d2proj) & Templates
  PROJECT_SAVE: 'd2:project:save',
  PROJECT_OPEN_DIALOG: 'd2:project:openDialog',
  PROJECT_SAVE_DIALOG: 'd2:project:saveDialog',
  PROJECT_LOAD: 'd2:project:load',
  PROJECT_AUTOSAVE: 'd2:project:autoSave',
  PROJECT_GET_RECOVERY: 'd2:project:getRecovery',
  PROJECT_DISCARD_RECOVERY: 'd2:project:discardRecovery',
  PROJECT_GET_RECENTS: 'd2:project:getRecents',
  PROJECT_REMOVE_RECENT: 'd2:project:removeRecent',
  PROJECT_DELETE_FILE: 'd2:project:deleteFile',
  PROJECT_BUNDLE_ASSETS: 'd2:project:bundleAssets',
  PROJECT_REVEAL_IN_EXPLORER: 'd2:project:revealInExplorer',

  // Preset Library
  PRESETS_GET_USER: 'd2:presets:getUser',
  PRESETS_SAVE_USER: 'd2:presets:saveUser',
  PRESETS_DELETE_USER: 'd2:presets:deleteUser',
  PRESETS_EXPORT_FILE: 'd2:presets:exportFile',
  PRESETS_IMPORT_FILE: 'd2:presets:importFile',

  // Diagnostics
  PING: 'd2:ping',
} as const
