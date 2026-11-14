# D2 VISUALIZER

> Professional desktop music visualizer and lightweight video editor for Windows 10/11.

---

## 1. Product Overview

**D2 VISUALIZER** is a modern desktop creative application designed for music artists, producers, beatmakers, and content creators. It enables users to import audio tracks, apply dynamic, audio-reactive visualizers, overlay typography and logos, customize backgrounds (color, gradient, image, video), and render frame-accurate, synchronized MP4 videos ready for YouTube, YouTube Shorts, TikTok, and Instagram Reels.

---

## 2. Technology Stack

- **Desktop Shell:** [Electron](https://www.electronjs.org/) (Windows x64, Frameless Window, `contextIsolation: true`)
- **Frontend Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Build System & Bundler:** [Vite 6](https://vitejs.dev/) with `vite-plugin-electron`
- **Styling & Design Tokens:** [Tailwind CSS](https://tailwindcss.com/) + Custom Dark Studio Tokens
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Audio DSP:** Web Audio API (`AudioContext`, `AnalyserNode`, 6-band Logarithmic FFT)
- **2D / 3D Graphics Engine:** HTML5 Canvas 2D + [Three.js](https://threejs.org/)
- **Offline Video Export:** [FFmpeg](https://ffmpeg.org/) & [FFprobe](https://ffmpeg.org/ffprobe.html) (Deterministic frame-by-frame stream rendering)

---

## 3. Architecture & Security Model

The application strictly implements Electron security best practices:
- **Main Process (`electron/main.ts`):** Manages native window lifecycle, file system dialogs, secure media protocol, and background FFmpeg execution.
- **Preload Bridge (`electron/preload.ts`):** Exposes a typed, strictly limited `window.electronAPI` bridge via `contextBridge.exposeInMainWorld`.
- **Renderer Process (`src/`):** React UI application with `nodeIntegration: false` and `contextIsolation: true`. Zero unrestricted Node.js or filesystem access is exposed to the renderer.

---

## 4. Prerequisites

- **OS:** Windows 10 / Windows 11 (64-bit)
- **Node.js:** `v22.0.0` or later (tested on `v25.5.0`)
- **Package Manager:** `npm` (v10+ or v11+)
- **FFmpeg:** Installed on system `PATH` (for offline video export in Phase 7)

---

## 5. Development & Build Commands

### Install Dependencies
```bash
npm install
```

### Start Development Mode (Hot Reload)
```bash
npm run dev
```
*Starts the Vite dev server and launches the Electron application with instant Hot Module Replacement (HMR).*

### Type-Check & Production Build
```bash
npm run build
```
*Compiles TypeScript and creates optimized bundles in `dist/` (Renderer) and `dist-electron/` (Main & Preload).*

---

## 6. Project Roadmap

- [x] **Phase 1: Project Foundation** — Electron + React + TypeScript + Vite + Secure Preload Bridge + Dark Design Tokens.
- [ ] **Phase 2: Professional UI** — Workstation layout, multi-panel split, aspect-ratio preview, inspector, timeline shell.
- [ ] **Phase 3: Media Import & Audio Engine** — Drag & drop media, Web Audio API, 6-band FFT analysis, audio playback.
- [ ] **Phase 4: Visualizer Engine** — 10 modular 2D and 3D visualizers reacting to real audio signals.
- [ ] **Phase 5: Background, Text & Effects** — Gradients, images, videos, typography overlays, glow, bloom, and vignettes.
- [ ] **Phase 6: Multi-Track Timeline** — Audio, visualizer, background, and text tracks with trimming and scrubbing.
- [ ] **Phase 7: Offline Video Export** — Deterministic frame piping to FFmpeg, 1080p, 4K, 9:16 vertical, and 1:1 presets.
- [ ] **Phase 8: Project Management & Autosave** — Save, open, JSON schema validation, autosave, and missing media relinking.
- [ ] **Phase 9: Quality Audit & Optimization** — Performance tuning, memory leak checks, WebGL fallbacks, and Vitest suite.
- [ ] **Phase 10: Windows Installer & Distribution** — Production installer packaging via `electron-builder`.

---

## 7. License

Private & Proprietary — Developed for D2 VISUALIZER.
