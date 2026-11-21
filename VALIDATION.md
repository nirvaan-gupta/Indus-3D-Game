# Validation

## Current verification — 21 November 2026

- All 17 tests pass, including three-gate clearance and Secondary/Primary placement.
- Production build passes; bundle is approximately 167 kB gzipped. Vite reports a non-blocking chunk-size advisory.
- Latest GLB: 3,721,596 bytes.
- Final visual quality, haptics and GPU frame rate still require device testing.

The notes below are historical results from earlier revisions.

18 November 2026.

- `npm test`: 7/7 passed: screenshot reference anchors, all entrances and landmarks, rotated wall and pool collisions, exterior-to-corridor and all 30 classroom doorway reachability, finite geometry / cutaway roof groups, jump physics at multiple frame rates and all four character rigs.
- `npm run model`: generated 763,432-byte binary glTF. Loaded back through Three.js GLTFLoader with 8,648 instances recovered.
- `npm run build`: passed with Vite 6.4.6. Main bundle is approximately 142 kB gzipped, above Vite's 500 kB uncompressed advisory threshold.
- Native Chrome preview: loaded the revised campus, inspected overhead layout and ground-level character/material rendering. Browser host connector was unavailable; native Chrome control was used instead. A complete manual classroom walkthrough and all input combinations were not verified because Chrome focus changed during testing. No benchmark frame rate is claimed.
- Runtime photographic textures are separate from the geometry-only GLB export.
- `npm audit`: four high findings in the development dependency chain, all stemming from picomatch's extglob ReDoS advisory GHSA-fc5q-39xc-vjpf. The registry's latest picomatch was 4.0.7 and no compatible patched version was available. Vite itself was upgraded from 6.4.1 to 6.4.6. `npm audit fix` could not resolve the remaining advisory. These dependencies are not shipped as executable modules in the static game. Local dev scripts bind to 127.0.0.1. No untrusted glob input is accepted by this project.

This validation does not establish geometric accuracy. See SOURCES.md and README.md.

## Gate / terrain revision verification

- 10/10 tests pass, including clear gate entry and orientation, terrain continuity, nonzero elevation range, level building pads and step support. Existing collision, room reachability, jump and character checks pass.
- Production build passes; exported GLB is 2,671,976 bytes and loads back through GLTFLoader.
- Latest gate / terrain visual QA could not be completed because the active Chrome context was changing. Earlier ground and overhead rendering were visually inspected before this revision. New lighting, gate appearance and slope rendering remain visually unverified.

## Video / simplified walkthrough / escort revision

- 11/11 tests pass, including a continuous clear gate-to-administration route, direction alignment, terrain continuity, level floor pads, classroom doorway access, jump physics, four character rigs, and the four-bodyguard escort with gun props, following, ground support, collisions and cleanup.
- `npm run build` passes. Final bundle is about 153 kB gzip (the uncompressed size remains over Vite's advisory threshold).
- Standalone GLB regenerated: 2,898,948 bytes, generated from final source and loaded back through GLTFLoader with 14,209 instances. No source footage is packaged.
- Native Chrome accessibility state confirmed a running Main gate view with First person, 3D top view and Reset, plus the character selector. A final screenshot request timed out, so appearance / performance of final ambient occlusion, leaf geometry, classroom revision and escort are not claimed fully visually verified.
- Classroom plan correctness remains unresolved: tests establish traversability, not correspondence to the actual school.

## Expanded exterior pass

- All 11 tests pass after the exterior additions: gate-to-admin alignment / clearance, building access, pool collision, finite instance geometry, terrain continuity / flat floor pads, jumping and escorts.
- Production build and GLB export pass. The exported model is loaded through GLTFLoader after generation.
- The 12 new photographic JPG maps were checked for JPEG signatures, and the daylight HDR was checked for the Radiance header.
- Added screenshot-visible service buildings, revised facade and roof details, field / court / pool detail, formal gardens and terrain-following curb edges.
- Final exterior visual QA remains incomplete: the native computer-use Node runtime failed to start after the workspace directory was moved. No final frame rate or photorealism claim is made. The exterior pass still contains interpreted geometry.

## Blank first-person rendering fix

The post-processing chain previously began with SSAOPass, which multiplies an existing image but does not draw the campus color image. Added RenderPass before SSAO and OutputPass. Camera projection now updates before resizing post-processing buffers. A regression test executes the real pass chain with a recording renderer and verifies that the campus color buffer is populated before output, and that resize updates the AO projection. All 12 tests and the production build pass.

## Recent-tour and stability revision

- 16 tests pass, adding actual perspective toggling, camera wall clearance, top-view return behavior, movement / jumping at 20/60/144 fps and climbing all modeled entrance staircases onto raised floors without jumping. Existing route, collision and model tests pass.
- Production build passes. Regenerated GLB reloads through GLTFLoader: 3,660,172 bytes, 18,762 instances.
- Simplified render chain retains the scene-color pass and output conversion; expensive full-scene AO was removed. Roads use non-writing overlay depth layers to avoid overlapping-route z-fighting.
- Native browser-control tools are unavailable in this session. These are code / scene-data / simulation checks, not a final visual or GPU frame-rate verification.


Entrance revision (21 November 2026): user-confirmed three gates (small exit on the left, two large entries); central gate faces administration. Secondary sits to the left and Primary to the right, forward of admin. Angled coach parking and flags behind the coaches replace the previous row/avenue arrangement. Gate dimensions, bus count and exact parking angles remain estimated. Reference: https://www.youtube.com/watch?v=nkLQRUDwv7s (saved tour frames reviewed).

Walking is now 3.2 m/s, running 6 m/s. V toggles first/third person; M preserves that choice through top view. World-space jumping, collision-aware chase camera, raised floors and three-step entrances are tested. Terrain is graded but not surveyed. Quiet synthetic footsteps and landing vibration added; vibration depends on device/browser support and is disabled for reduced-motion preferences. No Mac trackpad haptics. Scene rendering uses RenderPass plus OutputPass, and roofs remain visible to prevent popping. Final browser visuals and performance have not been verified in this session; the procedural model is not GTA-quality or a measured digital twin.
