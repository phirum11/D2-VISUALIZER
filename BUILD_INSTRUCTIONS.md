# D2 VISUALIZER — BUILD & REPRODUCTION INSTRUCTIONS

This document outlines the step-by-step instructions to set up the development environment, compile the application, run automated verification tests, and generate the production Windows NSIS installer.

---

## 1. Prerequisites

- **Operating System:** Windows 10 / Windows 11 (64-bit)
- **Node.js:** v20.x or higher (Tested on Node v25.5.0 and v20.19.1)
- **Package Manager:** npm v10.x or higher
- **C/C++ Build Tools:** Windows SDK / Visual Studio C++ Build Tools (for native module compilation if required)
- **FFmpeg Binaries:** Standalone binaries are bundled directly within `resources/bin/win/` (`ffmpeg.exe` and `ffprobe.exe`).

---

## 2. Environment Setup

Clone the repository and install all required runtime and development dependencies:

```bash
# Navigate to the workspace directory
cd "d:\Dom Make Tool\D2 VISUALIZER"

# Install dependencies cleanly
npm install
```

---

## 3. Running in Development Mode

To start the Vite development server and launch Electron with hot module reloading (HMR):

```bash
npm run dev
```

*Note: The launcher script (`scripts/dev.js`) automatically strips `ELECTRON_RUN_AS_NODE` to ensure Electron boots in full GUI desktop mode.*

---

## 4. Running the Phase 10 Automated Verification Suite

To run the automated production test suite which verifies bundled FFmpeg paths, Three.js WebGL resource disposal, dynamic preview scaling, disk space safety checks, 10s video export, 9:16 portrait export, and cancellation lifecycle:

```bash
node scripts/test_phase10.js
```

Expected output:
```
========================================================
       PHASE 10 PRODUCTION RELEASE VERIFICATION         
========================================================
All 7 verification tests pass with exit code 0.
```

---

## 5. Building the Production Windows Installer

To build the standalone Windows x64 NSIS installer:

```bash
# Step 1: Compile TypeScript and bundle frontend and Electron main/preload
npm run build

# Step 2: Package the Windows NSIS installer using Electron Builder
npm run dist:win
```

Or run electron-builder directly:
```bash
npx electron-builder --win --x64 --config electron-builder.json5
```

### Build Artifacts
Upon successful compilation, the output will be placed in the `release/` directory:
- **`release/D2_VISUALIZER_Setup_x64.exe`**: Complete Windows 64-bit NSIS installer (~186.8 MB) containing the self-contained Electron runtime, packed application ASAR, and bundled standalone FFmpeg/FFprobe binaries.
- **`release/win-unpacked/`**: Portable unpacked application directory containing `D2 VISUALIZER.exe`.

---

## 6. Project Architecture Overview

```
D2 VISUALIZER/
├── electron/                   # Electron Main Process & Native IPC
│   ├── export/                 # FFmpeg exporter, FFmpegPath locator
│   ├── ipc/                    # IPC handlers (media, export, window, project)
│   ├── main.ts                 # Application lifecycle, protocols, test suites
│   └── preload.ts              # Secure contextBridge API bindings
├── src/                        # React 19 Frontend
│   ├── components/             # UI Components
│   │   ├── layout/             # Header, Sidebar, Inspector, SettingsModal
│   │   ├── preview/            # PreviewCanvas, PreviewHeader
│   │   ├── timeline/           # Multi-track timeline, tracks, playhead
│   │   ├── visualizers/        # Visualizer style selector & controls
│   │   └── export/             # Export panel, progress modal, format presets
│   ├── engine/                 # Core DSP & Rendering Engines
│   │   ├── audio/              # AudioEngine, Web Audio API, FrequencyExtractor
│   │   ├── background/         # BackgroundManager (image, video, gradient)
│   │   ├── effects/            # AmbientParticles, CinematicEffects
│   │   ├── layers/             # LayerCompositor master canvas pipeline
│   │   ├── overlay/            # OverlayRenderer, AnimationEngine
│   │   ├── project/            # ProjectManager, PresetManager, templates
│   │   ├── render/             # OfflineRenderEngine, AudioAnalysisCache
│   │   ├── timeline/           # TimelineEngine, KeyframeEngine
│   │   └── visualizers/        # 10 Visualizer plugin styles (2D & Three.js 3D)
│   └── stores/                 # Zustand global reactive state stores
├── resources/                  # Static assets & bundled binaries
│   ├── bin/win/                # Bundled ffmpeg.exe & ffprobe.exe
│   ├── icon.ico                # Application Windows icon
│   └── icon.png                # High-resolution PNG logo
├── electron-builder.json5      # Windows NSIS packaging configuration
└── package.json                # Project dependencies and npm scripts
```
