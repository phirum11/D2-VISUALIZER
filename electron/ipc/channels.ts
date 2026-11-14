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

  // Media File Handling
  MEDIA_READ_BUFFER: 'd2:media:readBuffer',
  MEDIA_GET_STATS: 'd2:media:getStats',

  // Diagnostics
  PING: 'd2:ping',
} as const
