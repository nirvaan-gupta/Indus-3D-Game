# Indus 3D Game

An independent browser-based 3D walkthrough of Indus International School Bangalore, built with Three.js and Vite. Explore a campus reconstruction informed by an overhead reference image, school-tour videos and local layout feedback.

**Work in progress:** building dimensions, terrain elevations and hidden details are estimated. This is not an exact digital twin or photorealistic scan. Exterior reconstruction is the current focus; interior floor plans remain unverified.

## Features

- Start at the middle of three gates, facing the circular administration block. The smaller left gate is the exit; Secondary is on the left and Primary on the right, forward of administration.
- Angled bus parking, flags behind the buses, landscaped paths, academic blocks, sports hall, courts and swimming pool.
- Graded terrain, level building foundations and walkable entrance steps.
- First-person, collision-aware third-person and 3D top views.
- Walking, running, jumping, wall collisions and four selectable characters.
- Student, Teacher, General Ray and Staff roles. General Ray has four fictional followers carrying nonfunctional gun props; there is no combat system.
- Photographic surface textures, environment lighting, instanced foliage and animated water.
- Quiet footstep audio and landing vibration on supported browsers/devices. Vibration respects reduced-motion preferences; Mac trackpad haptics are not supported.
- Exported campus geometry in GLB format.

## Run locally

Install Node.js 20.19+ or 22.12+, then:

```sh
git clone https://github.com/nirvaan-gupta/Indus-3D-Game.git
cd Indus-3D-Game
npm ci
npm run dev
```

Open the URL printed by Vite. The local server must keep running while you play. If mouse capture is unavailable, drag on the scene to look around.

## Controls

| Input | Action |
| --- | --- |
| WASD or arrow keys | Move |
| Mouse | Look around |
| Space | Jump |
| Shift | Run |
| V or perspective button | Toggle first/third person |
| M or 3D top view button | Toggle aerial view |
| R or Reset | Return to the main gate |
| 1 / 2 / 3 / 4 | Student / Teacher / General Ray / Staff |
| Escape | Release the mouse |

First person is the default. Walking speed is 3.2 m/s and running speed is 6 m/s. Returning from top view preserves the chosen walking camera.

## Build and verify

```sh
npm test
npm run model
npm run build
npm run preview
```

- `npm test` runs 17 automated checks covering navigation, gate access, terrain, steps, jumping, camera modes, rendering setup and escorts.
- `npm run model` regenerates `public/models/indus-campus.glb`.
- `npm run build` creates the static site in `dist/`; serve it over HTTP, not `file://`.
- `npm run preview` serves the production build locally.

Dependencies and generated builds are excluded from Git. Source files, lockfile, tests, textures and the exported model are included. No GitHub Pages deployment is configured.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/layout.js` | Building positions and gate alignment |
| `src/campus.js` | Campus geometry, architecture and collision boundaries |
| `src/terrain.js` | Estimated grades, floor levels and step support |
| `src/player-controller.js` | Movement, gravity, jumping and collisions |
| `src/camera-controller.js` | First/third-person camera and view state |
| `src/main.js` | Scene, controls and animation loop |
| `src/characters.js`, `src/escort.js` | Characters and fictional escort |
| `src/materials.js`, `src/render-pipeline.js` | Materials and rendering |
| `src/feedback.js` | Footsteps and supported-device vibration |
| `public/` | Bundled textures and exported campus model |
| `scripts/export-model.mjs` | GLB exporter |
| `tests/` | Automated regression tests |

The GLB uses `EXT_mesh_gpu_instancing`; use a compatible viewer. Runtime characters, text signs and photographic surface maps are separate from the geometry export.

## Accuracy and limitations

The campus layout is reconstructed from a supplied satellite screenshot at an estimated scale. Gate dimensions, parking angles, bus count, landscaping, hidden façades and elevation are interpretations. Ground-floor rooms can be entered, but corridor layouts and classroom dimensions are placeholders; upper floors remain inaccessible shells. Characters are procedural role representations.

Automated checks and production builds pass. Final browser appearance and frame rate have not been independently verified across devices. GTA-level visual fidelity is not currently achieved.

## References and licensing

Tour references: [recent campus tour](https://www.youtube.com/watch?v=nkLQRUDwv7s) and [earlier school tour](https://www.youtube.com/watch?v=Zm4pLU8Yo60). See [SOURCES.md](SOURCES.md), [THIRD-PARTY.md](THIRD-PARTY.md), [VALIDATION.md](VALIDATION.md) and [REFERENCE-GUIDE.md](REFERENCE-GUIDE.md) for source notes, asset credits and reconstruction guidance.

Original code and geometry are [MIT licensed](LICENSE). Bundled photographic maps/environment assets are CC0; dependency licenses apply separately. No Google mesh, satellite screenshot, school-tour footage or real student photographs are distributed. This project is not affiliated with or endorsed by the school.
