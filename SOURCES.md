# Reference ledger

Accessed 18 November 2026.

| Reference | Used for | Limits |
| --- | --- | --- |
| [Official campus page](https://bangalore.indusschool.com/about-us/indus-campus/) | School identity, published campus facilities | Does not establish measurements or facility placements |
| [Official aerial photo](https://bangalore.indusschool.com/wp-content/uploads/2023/03/the-school-1.jpg.webp) | Visually inspected primary architecture, gardens and frontage | Single oblique view; date and metric scale unverified. Reference only, not bundled |
| [Official contact page](https://bangalore.indusschool.com/contact-us/) | Address and linked Google Maps pin | Pin is a location reference, not a survey |
| [School-linked Google Maps location](https://www.google.com/maps/place/Indus+International+School,+Bangalore/@12.8350171,77.7764049,17z/data=!3m1!4b1!4m5!3m4!1s0x3bae725a1911e0c9:0xaeb9556a9e275a34!8m2!3d12.8350171!4d77.7785936) | 12.8350171 N, 77.7785936 E | Interactive satellite and 3D browser inspection unavailable; no mesh extracted |
| [Official August 2025 newsletter](https://bangalore.indusschool.com/wp-content/uploads/2025/09/August-2025-Newsletter.pdf) | Public report of an observatory, domed form | Placement and dimensions not established |

## Confidence

- **Verified:** school identity, address, official map pin, public exterior appearance of primary buildings, presence of facilities listed on the campus page.
- **Interpreted:** massing, facade proportions, domes, window rhythms, landscape style.
- **Approximate:** all metric dimensions, hidden sides, secondary facility positions, vegetation placement, boundary, paths and model orientation.
- **Not modeled:** verified interiors, actual classroom arrangements, surveyed terrain, real persons, security systems.

## Satellite-guided revision

The owner supplied `Screenshot 2026-11-18 at 6.15.50 PM.png` (1946 × 1020), showing the campus from above. Building centres and route control points were manually interpreted from that image. The working transform is x=(pixelX−900)×0.22, z=(pixelY−415)×0.22. Scale is estimated; screenshot labels obscure some footprints and trees obscure others. The reference supports relative placement, not an exact outline or interior plan. No raw screenshot is included in the package.

Photographic ground maps: [Grass Path 2 by Rob Tuytel / Poly Haven](https://polyhaven.com/a/grass_path_2), distributed under [CC0](https://polyhaven.com/license). See THIRD-PARTY.md. Interior layout and furniture are original invented geometry.

## Entrance and elevation revision

No gate close-up or measured height data was supplied. Gate architecture, guard pavilion, fences, decorative fittings and all elevations are invented interpretations. Grade and terraced building pads are procedural, not Google elevation data.

## Supplied school tour revision

[Indus International School Bangalore — official school channel](https://www.youtube.com/watch?v=Zm4pLU8Yo60&t=48s) was retrieved as a temporary reference and selected frames were inspected. Temporary video and frame files are not distributed.

Observed references include dark metal entrance gate leaves with gold ornament (~5s), tree-lined paving and white curbs (~24s), grouped classroom tables, pale surfaces, black seating and blue curtains (~234–236s and ~389–390s). The school tour also contains other institutions and activities, so those shots are not treated as proof of this campus's floor plan. The video does not establish exact room dimensions, door placement, current site elevations or a complete corridor layout.

The user clarified that the round administration building must be directly ahead from the main gate. The model's gate/start/drive axis and rotunda entrance were aligned accordingly. The coordinate and architectural details of the gate remain interpreted. The user's correction that classroom plans were wrong is recorded as unresolved pending a sketch or corridor walkthrough.

## Exterior-first detail pass

The school tour's administration frontage (~25s), main aerial (~85s) and entrance drive (~110s) were inspected at 720p. They informed fluted white columns, grid windows, ribbed domes, roof balustrades, crescent beds, flowering frontage trees, white curbs, flag-lined approach and low tree railings. The user's overhead screenshot remains the basis for facility locations and orientation. Upper facade details, rear faces, height values and obscured structures are interpreted rather than measured.

Generic photographic surface maps and daylight reflection environment were added under Poly Haven's CC0 license; see THIRD-PARTY.md. No video frames are shipped as school textures. Interiors are deferred while exterior work has priority.

## Newer supplied tour

[Inside Indus International School, Bengaluru | Full Campus & Facilities Tour](https://www.youtube.com/watch?v=nkLQRUDwv7s) was retrieved as a temporary reference and sampled at 720p. Frames show the administration's opaque white columned bays and window patterns, planted forecourt, yellow school buses and pool enclosure / splash pool / lane flags. These informed exterior details. Footage does not provide measured terrain elevation, exact dimensions or a complete current floor plan. No footage or student images are bundled.


Entrance revision (21 November 2026): user-confirmed three gates (small exit on the left, two large entries); central gate faces administration. Secondary sits to the left and Primary to the right, forward of admin. Angled coach parking and flags behind the coaches replace the previous row/avenue arrangement. Gate dimensions, bus count and exact parking angles remain estimated. Reference: https://www.youtube.com/watch?v=nkLQRUDwv7s (saved tour frames reviewed).

Walking is now 3.2 m/s, running 6 m/s. V toggles first/third person; M preserves that choice through top view. World-space jumping, collision-aware chase camera, raised floors and three-step entrances are tested. Terrain is graded but not surveyed. Quiet synthetic footsteps and landing vibration added; vibration depends on device/browser support and is disabled for reduced-motion preferences. No Mac trackpad haptics. Scene rendering uses RenderPass plus OutputPass, and roofs remain visible to prevent popping. Final browser visuals and performance have not been verified in this session; the procedural model is not GTA-quality or a measured digital twin.
