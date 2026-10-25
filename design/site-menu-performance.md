# Header menu performance

The original menu used `dialog.showModal()` and `body.menu-open` to lock scrolling.
On the long guide, tracing recorded a 344 ms style update touching 7,533 elements
inside a 409 ms click dispatch. Disabling backdrop blur or promoting the panel
did not remove that synchronous work.

The menu now uses two manual top-layer popovers: a full-viewport scrim and the
existing dialog. Browsers without the Popover API retain the native modal fallback.
The dialog is moved out of the header once, before use. Scroll locking changes the
body's overflow property directly, preserving its previous value and priority.

Modal interaction is explicit: a pointer-blocking scrim, `aria-modal`, hidden
background siblings, suspended background tab stops and a focus trap. Existing
ARIA/tabindex values are restored exactly. Escape, outside click and focus return
remain supported. Menu links, the reverse morph and interrupted-close behavior
use the existing implementation.

Only background animations that were running are paused; pre-existing paused
animations stay paused. The door and nature loops suspend while covered and resume
without adding the time spent in the menu. Idle header-entrance interactions no
longer rewrite the preview's status or re-run its cleanup.

The circle-to-panel clip remains 620 ms with the same easing and staggered text.
The scrim retains the original 5 px blur, 35% black and 400 ms fade. A local
before/after comparison of the settled 441 × 960 panel found zero pixel difference.
Median synchronous click work in that comparison fell from 422 ms to 62 ms.
Measurements are local diagnostics, not a promise of identical timings on every
device. Trace and screenshot artifacts are under `tmp/menu-perf/`.

`scripts/site-menu-morph.cjs` checks shape samples, reversal, anchoring, sizing,
focus and accessibility. `scripts/site-menu-performance.cjs` checks click budget,
pointer/focus isolation, scroll-lock and attribute restoration, animation state,
and suspension/resumption of the procedural artwork.
