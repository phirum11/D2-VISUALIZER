import React, { useState } from 'react'
import {
  UploadCloud,
  Music,
  Image as ImageIcon,
  Film,
  Search,
  CheckCircle2,
} from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  type: 'audio' | 'image' | 'video'
  duration?: string
  size: string
  active?: boolean
}

const sampleMedia: MediaItem[] = [
  {
    id: '1',
    name: 'Starlight_Echoes_Master_48k.wav',
    type: 'audio',
    duration: '03:18',
    size: '34.2 MB',
    active: true,
  },
  {
    id: '2',
    name: 'Deep_Bass_Drop_140bpm.mp3',
    type: 'audio',
    duration: '02:45',
    size: '6.4 MB',
  },
  {
    id: '3',
    name: 'Cosmic_Nebula_Background.png',
    type: 'image',
    size: '3.8 MB',
    active: true,
  },
  {
    id: '4',
    name: 'Cyberpunk_City_Loop.mp4',
    type: 'video',
    duration: '00:15',
    size: '18.4 MB',
  },
  {
    id: '5',
    name: 'Artist_Official_Logo_White.png',
    type: 'image',
    size: '512 KB',
    active: true,
  },
]

export const MediaPanel: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'audio' | 'image' | 'video'>('all')
  const [search, setSearch] = useState('')

  const filteredMedia = sampleMedia.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-d2-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white uppercase tracking-wider text-2xs">
            Media Library
          </h2>
          <span className="text-2xs text-d2-textSubtle">
            {sampleMedia.length} Project Assets
          </span>
        </div>

        <button className="px-2.5 py-1 rounded bg-d2-accent hover:bg-d2-accentHover text-white text-2xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
          <UploadCloud className="w-3 h-3" />
          Import
        </button>
      </div>

      {/* Dropzone */}
      <div className="p-3">
        <div className="border border-dashed border-d2-border hover:border-d2-accent rounded-lg p-3 text-center bg-d2-canvas/30 hover:bg-d2-surfaceElevated/40 transition-colors cursor-pointer group">
          <UploadCloud className="w-6 h-6 mx-auto text-d2-textSubtle group-hover:text-d2-accent transition-colors mb-1" />
          <p className="text-2xs font-medium text-d2-text">
            Drag audio, images, or video here
          </p>
          <p className="text-2xs text-d2-textSubtle mt-0.5">
            WAV, MP3, FLAC, PNG, JPG, MP4
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-3 pb-2 space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search project media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-d2-canvas border border-d2-border rounded px-2.5 py-1 text-2xs text-d2-text placeholder-d2-textSubtle focus:outline-none focus:border-d2-accent pl-7"
          />
          <Search className="w-3.5 h-3.5 text-d2-textSubtle absolute left-2 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'audio', 'image', 'video'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 py-1 rounded text-2xs font-medium capitalize transition-colors ${
                filter === t
                  ? 'bg-d2-surfaceElevated text-white border border-d2-border'
                  : 'text-d2-textSubtle hover:text-white hover:bg-d2-surfaceElevated/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {filteredMedia.map((item) => {
          const Icon =
            item.type === 'audio'
              ? Music
              : item.type === 'video'
              ? Film
              : ImageIcon

          return (
            <div
              key={item.id}
              className={`p-2 rounded border transition-colors flex items-center justify-between cursor-pointer group ${
                item.active
                  ? 'bg-d2-surfaceElevated/80 border-d2-accent/60'
                  : 'bg-d2-surfaceElevated/30 border-d2-borderSubtle hover:border-d2-border hover:bg-d2-surfaceElevated/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                    item.type === 'audio'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : item.type === 'video'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs font-medium text-white truncate max-w-[150px]">
                    {item.name}
                  </div>
                  <div className="text-2xs text-d2-textSubtle flex items-center gap-2">
                    {item.duration && <span>{item.duration}</span>}
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>

              {item.active && (
                <CheckCircle2 className="w-3.5 h-3.5 text-d2-accent shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
