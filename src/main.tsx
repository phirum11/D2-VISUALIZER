import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'
import { useAudioStore } from './stores/audioStore'
import { useCompositionStore } from './stores/compositionStore'
import { usePreviewStore } from './stores/previewStore'
import { useUIStore } from './stores/uiStore'
import { VisualizerRegistry } from './engine/visualizers/VisualizerRegistry'
import { BackgroundManager } from './engine/background/BackgroundManager'
import { LayerCompositor } from './engine/layers/LayerCompositor'
import { OverlayRenderer } from './engine/overlay/OverlayRenderer'

if (typeof window !== 'undefined') {
  ;(window as unknown as { __D2_AUDIO_STORE__: unknown }).__D2_AUDIO_STORE__ = useAudioStore
  ;(window as unknown as { __D2_COMPOSITION_STORE__: unknown }).__D2_COMPOSITION_STORE__ = useCompositionStore
  ;(window as unknown as { __D2_PREVIEW_STORE__: unknown }).__D2_PREVIEW_STORE__ = usePreviewStore
  ;(window as unknown as { __D2_UI_STORE__: unknown }).__D2_UI_STORE__ = useUIStore
  ;(window as unknown as { __D2_REGISTRY__: unknown }).__D2_REGISTRY__ = VisualizerRegistry.getInstance()
  ;(window as unknown as { __D2_BG_MANAGER__: unknown }).__D2_BG_MANAGER__ = BackgroundManager.getInstance()
  ;(window as unknown as { __D2_COMPOSITOR__: unknown }).__D2_COMPOSITOR__ = LayerCompositor.getInstance()
  ;(window as unknown as { __D2_OVERLAY_RENDERER__: unknown }).__D2_OVERLAY_RENDERER__ = OverlayRenderer.getInstance()
}

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
