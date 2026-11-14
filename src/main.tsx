import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'
import { useAudioStore } from './stores/audioStore'
import { useCompositionStore } from './stores/compositionStore'
import { usePreviewStore } from './stores/previewStore'
import { VisualizerRegistry } from './engine/visualizers/VisualizerRegistry'

if (typeof window !== 'undefined') {
  ;(window as unknown as { __D2_AUDIO_STORE__: unknown }).__D2_AUDIO_STORE__ = useAudioStore
  ;(window as unknown as { __D2_COMPOSITION_STORE__: unknown }).__D2_COMPOSITION_STORE__ = useCompositionStore
  ;(window as unknown as { __D2_PREVIEW_STORE__: unknown }).__D2_PREVIEW_STORE__ = usePreviewStore
  ;(window as unknown as { __D2_REGISTRY__: unknown }).__D2_REGISTRY__ = VisualizerRegistry.getInstance()
}

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
