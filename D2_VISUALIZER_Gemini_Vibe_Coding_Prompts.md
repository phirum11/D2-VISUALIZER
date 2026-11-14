# D2 VISUALIZER --- Gemini Vibe Coding Master Prompt

> Project type: Professional desktop music visualizer and lightweight
> video editor\
> IDE: Google Antigravity\
> Coding agent: Gemini\
> Primary platform: Windows 10/11\
> Product name: **D2 VISUALIZER**

------------------------------------------------------------------------

## 1. Product vision

Build **D2 VISUALIZER**, a polished desktop application for creating
music-reactive videos. Users should be able to import a song, add a
background image or video, select a visualizer style, customize
typography and effects, preview the result in real time, and export a
finished video.

The application is intended for music creators publishing: - YouTube
Official Audio / Visualizer videos - YouTube Shorts - TikTok and
Facebook Reels - Landscape music videos and social-media promos

The result must be a real working desktop application, not just a static
UI mockup.

## 2. Recommended technology stack

Use the following stack unless a documented technical reason requires a
change:

  -----------------------------------------------------------------------
  Area                    Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Desktop shell           Electron                Windows desktop
                                                  application

  UI                      React + TypeScript      Component-based
                                                  interface

  Build tooling           Vite                    Fast development and
                                                  packaging

  Styling                 Tailwind CSS            Consistent styling
                                                  system

  UI primitives           shadcn/ui + Radix UI    Accessible, reusable
                                                  controls

  Icons                   Lucide React            Consistent iconography

  State                   Zustand                 Project and editor
                                                  state

  Audio analysis          Web Audio API           FFT frequency analysis
                                                  and audio playback

  2D rendering            Canvas 2D               Waveforms, bars,
                                                  particles and overlays

  3D rendering            Three.js                Optional 3D visualizer
                                                  scenes

  Video export            FFmpeg / FFprobe        Encoding, muxing and
                                                  media inspection

  Timeline                Custom React timeline   Audio, background and
                                                  overlay tracks

  Validation              Zod                     Validate project
                                                  settings and data

  Testing                 Vitest + Playwright     Unit and end-to-end
                                                  tests
  -----------------------------------------------------------------------

### Architecture rules

-   Use Electron main, preload and renderer processes correctly.
-   Enable `contextIsolation: true` and `nodeIntegration: false`.
-   Expose only narrowly scoped, typed APIs through the preload bridge.
-   Never expose raw Node.js or filesystem access to the renderer.
-   Keep media processing and FFmpeg execution outside the renderer
    process.
-   Use a maintained FFmpeg distribution or a clearly documented
    user-configurable FFmpeg path. Respect FFmpeg licensing and
    distribution requirements.
-   Do not download executables silently.
-   Do not block the UI while rendering or processing audio.
-   Use TypeScript strict mode.
-   Keep components small, reusable and documented.
-   Store project files in a versioned JSON format.
-   Make file paths safe and handle Windows paths correctly.

## 3. UI / UX design direction

Create a premium, clean, modern creative-software interface. Take
inspiration from professional desktop editing applications, but do not
copy any application's branding or exact layout.

### Visual style

-   Dark charcoal workspace with subtle surface contrast.
-   Clean typography and clear hierarchy.
-   Neutral gray surfaces with one restrained accent color.
-   Thin borders, subtle shadows and consistent corner radii.
-   Comfortable spacing; never cram controls together.
-   No overlapping panels, clipped labels or unnecessary decoration.
-   Use tooltips for icon-only controls.
-   Use clear empty states, loading states, progress indicators and
    error messages.
-   Support resizable panels and sensible minimum window dimensions.
-   Use a consistent spacing, typography, color and component token
    system.

### Main application layout

1.  **Top title bar / menu**
    -   Application logo and name
    -   Project name
    -   New, Open, Save and Save As
    -   Undo and Redo
    -   Settings
    -   Window controls
2.  **Left sidebar**
    -   Media
    -   Visualizers
    -   Backgrounds
    -   Text
    -   Effects
    -   Templates
    -   Export
3.  **Center preview**
    -   Large video preview canvas
    -   Correct aspect-ratio display
    -   Fit / Fill controls
    -   Playback controls
    -   Safe-area guides
    -   Preview quality selector
4.  **Right properties inspector**
    -   Context-sensitive controls for the selected item
    -   Position, scale, rotation and opacity
    -   Color, typography and effects
    -   Visualizer-specific settings
5.  **Bottom timeline**
    -   Audio track
    -   Background image/video track
    -   Text and overlay tracks
    -   Playhead and time ruler
    -   Zoom controls
    -   Track visibility and lock controls
    -   Timeline scrolling

Use a responsive desktop layout. Panels must not overlap. If the window
is too small, allow panel collapse or scrolling instead of squeezing
everything.

## 4. Core features

### A. Project management

-   Create, open, save and save-as projects.
-   Autosave recovery and unsaved-change warning.
-   Versioned project JSON.
-   Store media references and project settings.
-   Detect missing media and allow relinking.
-   Recent projects list.

### B. Media import

-   Import MP3, WAV, FLAC and other formats supported by the chosen
    decoding pipeline.
-   Import JPG, PNG, WebP and supported video formats.
-   Drag and drop files into the media panel.
-   Show file name, duration, resolution and basic metadata.
-   Generate thumbnails and audio waveform previews.
-   Handle unsupported and corrupted files gracefully.

### C. Audio engine and analysis

-   Play, pause, seek and stop audio.
-   Display playback time and total duration.
-   Analyze audio using Web Audio API and FFT.
-   Provide frequency bands: sub-bass, bass, low-mid, mid, high-mid and
    treble.
-   Smooth noisy frequency data with configurable smoothing.
-   Normalize sensitivity and add gain controls.
-   Make the visualizer respond to the actual audio signal.
-   Avoid fake random animation when real audio is available.
-   Handle playback cleanup and audio-context lifecycle correctly.

### D. Visualizer library

Create reusable visualizer presets:

1.  Spectrum Bars
2.  Circular Spectrum
3.  Radial Waveform
4.  Classic Waveform
5.  Mirrored Spectrum
6.  Center Line Waveform
7.  Dual Circular Rings
8.  Particle Audio Visualizer
9.  Equalizer Grid
10. 3D Audio Sphere
11. Neon Tunnel
12. Minimal Audio Pulse

Each visualizer should have configurable: - Color and gradient -
Sensitivity - Smoothing - Bar count / point count - Thickness and
spacing - Radius and scale - Glow and blur - Rotation and position -
Opacity - Frequency range - Animation intensity

Use a common visualizer interface so new visualizer types can be added
without rewriting the audio engine.

### E. Background system

-   Solid color
-   Gradient background
-   Image background
-   Video background
-   Blur and brightness controls
-   Overlay tint and opacity
-   Scale, crop and position
-   Optional vignette and subtle motion effects

### F. Text and branding

-   Add title, artist name and subtitle.
-   Customize font, size, weight, spacing and color.
-   Text alignment, position, shadow and outline.
-   Add logo or image overlay.
-   Opacity, scale and rotation.
-   Preset layouts for artist/title/record-label credits.
-   Keep text inside configurable safe margins.

### G. Effects

-   Glow
-   Bloom
-   Blur
-   Vignette
-   Grain
-   Particles
-   Color grading
-   Chromatic aberration (optional)
-   Beat pulse
-   Camera shake (optional and disabled by default)

Effects must be adjustable and should not make the preview unusably
slow.

### H. Timeline and editing

-   Multi-track timeline.
-   Add, remove, move and trim clips.
-   Adjust clip start time and duration.
-   Move and resize text and overlay items.
-   Snap to playhead and clip boundaries.
-   Zoom in/out and horizontal scrolling.
-   Select, duplicate and delete items.
-   Undo/redo for editing actions.
-   Display a clear playhead and time ruler.

Do not claim advanced editing features are complete until they work
correctly.

### I. Export

-   Export MP4 using H.264 video and AAC audio where supported.
-   Optional WebM export if supported by the configured pipeline.
-   Presets:
    -   1920×1080 --- 16:9
    -   1080×1920 --- 9:16
    -   1080×1080 --- 1:1
    -   2560×1440 --- 16:9
    -   3840×2160 --- 16:9 (4K)
-   Frame rates: 24, 25, 30, 50 and 60 FPS.
-   Quality / bitrate controls.
-   Output folder and filename selection.
-   Export progress, elapsed time, cancel action and error reporting.
-   Verify the final file with FFprobe.
-   Ensure the exported video contains synchronized audio and visuals
    for the full duration.

**Important rendering requirement:** Build a deterministic offline
rendering pipeline. Do not export by recording the preview window.
Render frames at exact timestamps, feed frames and audio to FFmpeg, and
mux them into the final file. The preview and export should use the same
visualizer and scene logic wherever practical.

For audio-reactive export, analyze the audio at the export timeline
timestamps or use a precomputed analysis cache. Do not depend on
real-time playback speed to determine exported frames.

## 5. Performance requirements

-   Keep the UI responsive during playback and export.
-   Use workers or separate processes for expensive analysis and
    rendering tasks.
-   Avoid unnecessary React re-renders during animation.
-   Use `requestAnimationFrame` for preview animation.
-   Dispose of Canvas, WebGL and Three.js resources correctly.
-   Cache thumbnails and reusable analysis data.
-   Show preview quality options such as Draft, Balanced and High.
-   Detect unavailable GPU/WebGL features and provide a fallback.
-   Provide useful errors for low memory, missing codecs and
    insufficient disk space.

Target a Windows laptop with a mid-range NVIDIA GPU and 24 GB RAM. The
application should still offer a lower-quality preview and reasonable
export settings on weaker hardware.

## 6. Suggested project structure

``` text
D2-VISUALIZER/
├── build/
├── resources/
│   ├── icons/
│   ├── fonts/
│   └── presets/
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   └── services/
│       ├── ffmpeg/
│       ├── media/
│       ├── project/
│       └── export/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── preview/
│   │   ├── timeline/
│   │   └── inspector/
│   ├── features/
│   │   ├── media/
│   │   ├── audio/
│   │   ├── visualizers/
│   │   ├── backgrounds/
│   │   ├── text/
│   │   ├── effects/
│   │   └── export/
│   ├── engine/
│   │   ├── audio/
│   │   ├── rendering/
│   │   └── visualizers/
│   ├── stores/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Adapt this structure when needed, but preserve separation between UI,
audio analysis, rendering, media services and Electron APIs.

------------------------------------------------------------------------

# 7. Gemini Agent --- Master Prompt

Copy the following prompt into Gemini in Antigravity:

``` text
You are a senior Electron desktop application architect, React and
TypeScript engineer, UI/UX designer, audio DSP engineer, and FFmpeg
video-rendering specialist.

Your task is to build a professional desktop application named
D2 VISUALIZER.

PRODUCT:
D2 VISUALIZER is a music visualizer and lightweight video-editing
desktop application. Users import audio, add image/video backgrounds,
choose audio-reactive visualizers, add text and logos, preview the
composition, edit the timeline, and export synchronized MP4 videos.

TECHNOLOGY:
Electron + React + TypeScript + Vite + Tailwind CSS + shadcn/ui +
Zustand + Web Audio API + Canvas 2D + Three.js + FFmpeg/FFprobe.

OPERATING SYSTEM:
Windows 10/11.

DESIGN:
Create a premium, clean, modern dark desktop editing interface.
Use consistent spacing, typography, borders, colors and reusable
components. The preview must be the main focus. Use a left tool
sidebar, center preview, right properties inspector and bottom
timeline. Avoid clutter, overlapping controls, cramped panels,
unnecessary decoration and inconsistent component styles.

ENGINEERING RULES:
1. Inspect the existing repository before changing anything.
2. If the repository is empty, initialize the project safely.
3. Preserve working code and existing user files.
4. Use TypeScript strict mode.
5. Keep Electron main, preload and renderer responsibilities separate.
6. Enable contextIsolation and disable nodeIntegration.
7. Expose only validated, typed IPC APIs.
8. Never expose arbitrary filesystem or shell execution to the renderer.
9. Do not block the UI during export or media processing.
10. Implement real features; do not use fake buttons or placeholder
    functionality presented as complete.
11. Use real audio frequency analysis for audio-reactive animation.
12. Use a deterministic FFmpeg export pipeline, not screen recording.
13. Add error handling, loading states and progress reporting.
14. Test each major feature before moving to the next phase.
15. Keep documentation and setup instructions updated.

WORKFLOW:
First inspect the repository and report:
- Existing files and architecture
- Current dependencies
- Risks and missing pieces
- Recommended implementation plan

Then implement the project in small, verifiable phases.
Do not attempt to build the entire application in one enormous code
change. After each phase, run the relevant checks and fix errors.

For every phase:
- Explain the goal briefly.
- List files to create or modify.
- Implement the feature.
- Run type checking, linting and tests where available.
- Report what works and what remains.
- Do not claim success without verification.

Begin with repository inspection and Phase 1 planning.
Wait for my approval before making large architectural changes.
```

------------------------------------------------------------------------

# 8. Phase-by-phase prompts

Run these prompts one at a time. Do not ask Gemini to implement every
phase simultaneously.

## Phase 1 --- Project foundation

``` text
Implement Phase 1 of D2 VISUALIZER.

Inspect the repository first. Set up Electron + React + TypeScript +
Vite with a secure Electron main/preload/renderer architecture.

Requirements:
- Windows-compatible development setup.
- Secure IPC bridge.
- contextIsolation enabled.
- nodeIntegration disabled.
- TypeScript strict mode.
- Tailwind CSS and shadcn/ui.
- Zustand.
- Lucide icons.
- Development and production scripts.
- App icon and application metadata placeholders.
- A working application window.

Create a README with installation and development instructions.

Run npm install, type checking and the development build.
Fix all errors. Do not implement the full editor yet.
```

## Phase 2 --- Professional UI

``` text
Implement the D2 VISUALIZER main editor UI.

Create:
- Top application bar.
- Left navigation and media panel.
- Large central preview workspace.
- Right properties inspector.
- Bottom timeline panel.
- Empty project state.
- Media import area.
- Playback controls.
- Settings dialog.

Design requirements:
- Professional dark creative-software appearance.
- Clear spacing and visual hierarchy.
- Consistent component dimensions.
- No overlapping panels or text.
- Resizable or collapsible side panels where practical.
- Tooltips for icon-only controls.
- Responsive behavior for smaller desktop windows.

Use reusable components and design tokens.
Focus on visual quality and layout correctness.
Do not create fake working functionality for controls that are
not implemented yet.
```

## Phase 3 --- Media import and audio engine

``` text
Implement media importing and the audio engine.

Features:
- Import audio and image/video files.
- Drag and drop.
- Display media metadata.
- Audio playback, pause, seek and stop.
- Waveform preview.
- Playback time and duration.
- Web Audio API AudioContext.
- AnalyserNode FFT frequency analysis.
- Frequency bands from bass to treble.
- Sensitivity, gain and smoothing controls.

Use safe IPC for file access.
Handle unsupported files and errors.
Clean up audio resources correctly.
Test playback and verify that analysis data changes with the
actual audio signal.
```

## Phase 4 --- Visualizer engine

``` text
Implement a modular audio-reactive visualizer engine.

Build these visualizers:
1. Spectrum Bars
2. Circular Spectrum
3. Radial Waveform
4. Classic Waveform
5. Mirrored Spectrum
6. Center Line Waveform
7. Dual Circular Rings
8. Particle Visualizer
9. Equalizer Grid
10. 3D Audio Sphere

Each visualizer must react to real audio analysis data.

Provide controls for:
- Color and gradient
- Sensitivity
- Smoothing
- Bar count
- Thickness and spacing
- Radius and scale
- Glow
- Position and opacity
- Frequency range

Use a common interface and reusable rendering architecture.
Optimize animation to avoid unnecessary React rendering.
```

## Phase 5 --- Background, text and effects

``` text
Implement background, text, branding and effects features.

Background:
- Solid color
- Gradient
- Image
- Video
- Blur, brightness, tint and opacity
- Scale and position

Text:
- Song title
- Artist name
- Subtitle
- Font, size, weight and color
- Alignment, position, shadow and outline

Branding:
- Import logo
- Resize and reposition logo
- Opacity and rotation
- Safe-area guides

Effects:
- Glow
- Vignette
- Grain
- Particles
- Color grading
- Beat pulse

All properties must update the preview.
```

## Phase 6 --- Timeline editor

``` text
Implement the editing timeline.

Create separate tracks for:
- Audio
- Background
- Visualizer
- Text
- Logo and overlays

Support:
- Add and remove items
- Move and trim clips
- Change clip duration
- Timeline zoom
- Horizontal scrolling
- Playhead
- Time ruler
- Snapping
- Selection and duplication
- Delete
- Undo and redo

Keep the timeline synchronized with preview playback.
Persist timeline data in the project file.
```

## Phase 7 --- Real video rendering and export

``` text
Implement the production-quality offline video export engine.

Use FFmpeg and FFprobe.

Export:
- MP4 H.264 video
- AAC audio
- 1920x1080 landscape
- 1080x1920 portrait
- 1080x1080 square
- 2560x1440
- Optional 3840x2160
- 24, 25, 30, 50 and 60 FPS

Critical:
- Do not record the application window.
- Render frames deterministically at exact timestamps.
- Use the same scene and visualizer logic as the preview.
- Analyze audio at the correct export timestamps.
- Keep audio and visuals synchronized.
- Render the full project duration.
- Mux the audio and video correctly.
- Verify the output using FFprobe.

Add:
- Export settings dialog.
- Filename and destination.
- Progress percentage.
- Cancel button.
- Error messages.
- Completion notification.

Test with a short real audio file and verify the output duration,
resolution, frame rate, codecs and audio synchronization.
```

## Phase 8 --- Project management and reliability

``` text
Implement project management and application reliability.

Add:
- New project
- Open project
- Save
- Save As
- Autosave
- Recovery after unexpected closure
- Recent projects
- Missing-media detection
- Relink media
- Unsaved changes warning
- Versioned project JSON
- Validation and migration

Test opening and saving projects repeatedly.
Do not lose media references or timeline settings.
```

## Phase 9 --- Testing and optimization

``` text
Perform a complete quality audit of D2 VISUALIZER.

Check:
- TypeScript errors
- Lint errors
- Broken imports
- Runtime errors
- UI overflow and overlap
- Audio playback
- FFT analysis
- Visualizer responsiveness
- Timeline behavior
- Save and reopen
- Export and synchronization
- Missing files
- Resource cleanup
- Memory usage
- GPU/WebGL fallback

Fix critical and high-priority issues.
Do not hide errors with empty catch blocks.
Create a test report showing passed, failed and not-yet-tested items.
```

## Phase 10 --- Windows installer and release

``` text
Prepare D2 VISUALIZER for Windows distribution.

Configure a suitable Electron packaging solution such as electron-builder.

Requirements:
- Windows x64 installer.
- Application name and icon.
- Version number.
- Install and uninstall support.
- Production build.
- FFmpeg packaging or documented configuration.
- No development server dependency.
- No missing runtime assets.
- Test the packaged application on Windows.

Document how to build and distribute future versions.
Do not claim the installer works until it has been built and tested.
```

------------------------------------------------------------------------

# 9. Additional UI refinement prompt

Use this prompt whenever Gemini creates a UI that looks cramped,
inconsistent or unfinished.

``` text
Act as a senior product designer reviewing D2 VISUALIZER.

Audit the entire current UI.

Find:
- Overlapping components
- Cramped spacing
- Inconsistent padding
- Misaligned controls
- Poor typography hierarchy
- Inconsistent button sizes
- Unnecessary borders
- Excessive visual decoration
- Poor contrast
- Broken responsive behavior
- Confusing navigation
- Unclear empty and loading states

Improve the UI without removing existing working functionality.

Create a consistent design system with:
- Color tokens
- Typography scale
- Spacing scale
- Border radius
- Component sizes
- Button variants
- Input styles
- Panel styles

Make the interface feel like a polished professional music
production and video editing desktop application.

Inspect the actual running application after changes.
Do not judge the UI only from source code.
```

# 10. Additional feature prompt --- Visualizer templates

``` text
Create a professional visualizer template library for D2 VISUALIZER.

Include templates for:
- Minimal black background
- Neon purple spectrum
- Blue futuristic circular spectrum
- Warm sunset gradient
- Cinematic artist cover
- Dark luxury music visualizer
- Particle universe
- Clean white waveform
- Afro House / Deep House visualizer
- Bass boosted EDM visualizer

Each template should define:
- Background
- Visualizer type
- Color palette
- Position and scale
- Glow and effects
- Typography layout
- Default safe margins

Allow users to preview, apply, customize and save their own templates.
```

# 11. Acceptance checklist

Before calling the application a working MVP, verify:

-   [ ] Application launches on Windows.
-   [ ] UI has no major overlap or clipping.
-   [ ] User can create and save a project.
-   [ ] User can import and play real audio.
-   [ ] Frequency analysis reacts to the audio.
-   [ ] At least three visualizers work correctly.
-   [ ] User can add a background image.
-   [ ] User can add and edit title and artist text.
-   [ ] Preview updates when properties change.
-   [ ] User can export a real MP4 file.
-   [ ] Exported video has synchronized audio.
-   [ ] Export duration and resolution are correct.
-   [ ] Errors are shown clearly.
-   [ ] Packaged application launches without the development server.

------------------------------------------------------------------------

# 12. Important instructions for working with Gemini in Antigravity

1.  Start by opening the D2 VISUALIZER project folder in Antigravity.
2.  Give Gemini the Master Prompt first.
3.  Let Gemini inspect the repository and propose a plan.
4.  Review the plan before approving major changes.
5.  Run one phase at a time.
6.  After each phase, launch the application and test it.
7.  If Gemini breaks existing functionality, ask it to investigate and
    fix the regression before continuing.
8.  Ask Gemini to explain which files it changed and which commands it
    ran.
9.  Keep Git commits at stable milestones.
10. Never accept a claim that a feature works without a real test.

## Final product goal

D2 VISUALIZER should become a reliable, professional desktop music
visualizer tool with a beautiful editing interface, real audio-reactive
graphics, a usable timeline, customizable templates and high-quality
video export.

**Build a working product, not just a beautiful prototype.**
