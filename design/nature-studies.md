# Nature in motion

Ten original SVG/JavaScript animation studies follow the door study on the brand
guidelines page. They use botanical and coastal subjects, fine outlines, muted
colour and white negative space. No cultural motifs or ornament are included.

1. Fern unfurl: fifteen pairs of leaflets grow sequentially along a curved stem;
   leaflet veins move with their leaf, and the whole frond sways around its base.
2. Tide window: waves and a changing water level remain clipped to a tall oval.
3. Sea arch: an even-odd rock silhouette frames water in its opening.
4. Rain rings: a falling drop lands at the pool; three delayed ellipses expand
   and fade, with a short, restrained splash.
5. Coastal bloom: thirty-eight fine red filaments open in order, then sway.
6. Alpine reflection: stationary peaks sit above a clipped reflection with
   moving gaps that suggest water.
7. Coastal grass: seven blades grow and sway individually from fixed roots.
8. Shell fan: a shell outline and eleven ribs draw over a pale water wash.
9. Quiet cove: a bird glides and adjusts its wings above a spare headland.
10. Forest light: a leafy branch frames a small clearing with drifting light.

Only the selected study is mounted. One requestAnimationFrame loop updates that
study; selecting another cancels the previous loop and removes its artwork.
An eight-second cycle fades through white at the ends to conceal pose resets.
All geometry is local code; no photos, video, animation libraries or remote
assets are needed. SVG IDs are scoped to this gallery.

Pause freezes the current pose. Selecting a different study while paused shows
a complete stationary preview. Replay resets and starts playback. Reduced motion
shows a complete static composition and hides playback controls. Offscreen and
hidden-tab playback stops without accumulating elapsed time. The enhancement
reserves its initial layout; no-JavaScript visitors see a static botanical fern.

`scripts/brand-nature.cjs` checks every composition, layout, keyboard selection,
playback, finite geometry, viewport bounds, accessibility and delayed-script
stability. The studies are excluded from copied brand context.
