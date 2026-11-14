import React, { useState } from 'react'
import {
  UploadCloud,
  Music,
  Trash2,
  CheckCircle2,
  Activity,
  Search,
  Sparkles,
  Info,
} from 'lucide-react'
import { useAudioStore } from '@/stores/audioStore'
import { formatTimecode, formatFileSize } from '@/engine/audio/AudioMetadata'

export const MediaPanel: React.FC = () => {
  const {
    importedFiles,
    currentTrack,
    importAudioViaDialog,
    importAudioFile,
    setAudioMonitorOpen,
    removeTrack,
  } = useAudioStore()

  const [isDragging, setIsDragging] = useState(false)
  const [search, setSearch] = useState('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      await importAudioFile(file)
    }
  }

  const filtered = importedFiles.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
            Media Library
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            {importedFiles.length} Imported Tracks
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAudioMonitorOpen(true)}
            className="p-1 rounded bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-cyan-400 hover:text-white transition-colors"
            title="Open Live FFT Audio Monitor"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => importAudioViaDialog()}
            className="px-2.5 py-1 rounded bg-d2-accent hover:bg-d2-accentHover text-white text-2xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3 h-3" />
            Import Audio
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="p-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => importAudioViaDialog()}
          className={`border border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer group ${
            isDragging
              ? 'border-d2-accent bg-d2-accent/10'
              : 'border-d2-border hover:border-d2-accent bg-d2-canvas/30 hover:bg-d2-surfaceElevated/40'
          }`}
        >
          <UploadCloud
            className={`w-6 h-6 mx-auto transition-colors mb-1 ${
              isDragging ? 'text-d2-accent' : 'text-d2-textSubtle group-hover:text-d2-accent'
            }`}
          />
          <p className="text-2xs font-medium text-d2-text">
            Drag audio file here or click to browse
          </p>
          <p className="text-2xs text-d2-textSubtle mt-0.5">
            MP3, WAV, FLAC, OGG, AAC
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search audio assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-d2-text placeholder-d2-textSubtle focus:outline-none focus:border-d2-accent pl-7"
          />
          <Search className="w-3.5 h-3.5 text-d2-textSubtle absolute left-2 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-4 rounded-lg bg-d2-surfaceElevated/30 border border-d2-borderSubtle text-center space-y-2">
            <Info className="w-5 h-5 text-d2-textSubtle mx-auto" />
            <p className="text-2xs text-d2-textSubtle">
              No audio imported yet. Import an MP3, WAV or FLAC file, or click below to test with the built-in signal generator.
            </p>
            <button
              onClick={() => {
                useAudioStore.getState().play()
              }}
              className="px-3 py-1 rounded bg-d2-surfaceElevated hover:bg-d2-surfaceActive border border-d2-border text-2xs text-cyan-400 font-medium inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Play Test Synthesizer Demo
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isActive = currentTrack?.id === item.id

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-d2-surfaceElevated border-d2-accent/80 shadow-md shadow-d2-accent/10'
                    : 'bg-d2-surfaceElevated/40 border-d2-borderSubtle hover:border-d2-border hover:bg-d2-surfaceElevated/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded flex items-center justify-center bg-indigo-500/20 text-indigo-400 shrink-0">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xs font-semibold text-white truncate max-w-[150px]">
                        {item.name}
                      </div>
                      <div className="text-3xs text-d2-textSubtle font-mono flex items-center gap-2">
                        <span>{formatTimecode(item.duration)}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>•</span>
                        <span>{item.format}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isActive ? (
                      <span className="flex items-center gap-1 text-3xs font-semibold px-1.5 py-0.5 rounded bg-d2-accent/20 text-d2-accent border border-d2-accent/40">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (item.filePath) {
                            useAudioStore.getState().importFromPath(item.filePath, item.name)
                          }
                        }}
                        className="text-3xs px-2 py-0.5 rounded bg-d2-surface border border-d2-border text-d2-textSubtle hover:text-white"
                      >
                        Set Active
                      </button>
                    )}

                    <button
                      onClick={() => removeTrack(item.id)}
                      className="p-1 rounded text-d2-textSubtle hover:text-d2-danger hover:bg-d2-canvas transition-colors ml-1"
                      title="Remove audio"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-1.5 text-3xs text-d2-textSubtle font-mono pt-1 border-t border-d2-borderSubtle">
                  <span className="px-1 py-0.2 rounded bg-d2-canvas border border-d2-borderSubtle">
                    {item.sampleRate} Hz
                  </span>
                  <span className="px-1 py-0.2 rounded bg-d2-canvas border border-d2-borderSubtle">
                    {item.channels === 1 ? 'Mono' : 'Stereo'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
