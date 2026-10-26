import fs from 'node:fs';
const before=JSON.parse(fs.readFileSync('tmp/performance/before/lighthouse/summary.json'));
const after=JSON.parse(fs.readFileSync('tmp/performance/after/lighthouse/summary.json'));
const paired=JSON.parse(fs.readFileSync('tmp/performance/paired/summary.json')).map(({clickMs,...value})=>({...value,...(typeof clickMs==='number'?{clickMs}:{})}));
const links=JSON.parse(fs.readFileSync('tmp/performance/links.json'));
const rows=after.map(value=>({file:value.file,mode:value.mode,before:before.find(x=>x.file===value.file),after:value}));
const number=(value,digits=0)=>Number(value).toFixed(digits);
const seconds=value=>number(value/1000,2)+' s';
const label=value=>new URL(value.requested).pathname.replace('/hoea_to_waka','')||'/';
const modes=route=>Object.fromEntries(rows.filter(row=>label(row.after)===route).map(row=>[row.mode,row]));
const routes=['/','/about/','/model/','/services/','/services/in-house-workshops/','/services/resilience-one-on-one/','/services/workshops-for-support-professionals/','/resources/','/contact/','/illustrations/','/404.html','/about/brand-guidelines/','/about/jamies-workspace/','/prompts/','/brand/brand-system.html','/pages/home.html'];
let text=`# Performance audit — 26 October 2026

This audit compares the pre-change site (Git revision 61dc963) with the performance update. The visual brief was to preserve the header entrance, glass pill, expanding menu and spring motion.

## Method and limits

- Lighthouse 13.4.1, installed Chrome, Node 24.19.0. All 16 HTML entry points were audited in both mobile and desktop modes before and after the changes: 64 complete Lighthouse reports, plus pilot runs.
- These are local laboratory scores from the unchanged \`scripts/preview.cjs\` server. Its responses are uncompressed and do not simulate GitHub Pages cache headers. They are useful for before/after comparisons, not a claim about production PageSpeed or real-user Core Web Vitals.
- Lighthouse's normal mobile/desktop profiles and all four categories were used. Animations were enabled; audits were not skipped. One complete run per page/profile is recorded, so timing and score variation should be expected.
- Motion was also measured separately at 4× CPU slowdown, alternating three baseline/current samples per viewport. The baseline was served read-only from Git; the checkout was never rolled back. That comparison omits expensive tracing, which itself affected the earlier diagnostic recordings.
- Frame intervals are requestAnimationFrame samples on this machine, not a promise of GPU frame rate on every device. Layout counts/durations are Chrome performance metrics. Browser workloads ran sequentially for final measurements.

## What changed

- The header commits its final geometry once, then moves its visible components with transforms. It keeps the 520 ms easing and both settled designs. Reversal samples the current position rather than snapping to an endpoint.
- The entrance measures all targets before creating any animations. Its first-frame safety timer still fails open if the animation script is unavailable.
- The menu keeps its original surface rendering, 620 ms circle-to-panel clip, stagger, reverse and backdrop blur. Background isolation, animation pausing and opening geometry are batched to avoid repeated document passes. Position tracking runs while the header moves instead of reading geometry on every frame of a stationary menu. An experimental surface layer was discarded after mixed benchmark results.
- About 93 KB of minified guideline-only CSS no longer loads on public pages. The shared interaction bundle shrank from about 75 KB to 7 KB; the spring engine loads only on pages that use it.
- Pencil-card animation objects are prepared near their section instead of at initial load. The homepage door scene is prepared ahead of viewport entry. Their authored timing and reversible behaviour remain intact.
- Responsive WebP copies preserve the original image masters, download files and clipboard artwork. Phones can request smaller images; intrinsic dimensions reserve space.
- Duplicate initial theme writes were removed and the reduced-motion layout is established early. Small contrast, heading hierarchy and accessible-name issues were corrected. Redirect entry points now declare their favicon.
- The AI arrow checks publication-animation completion when it approaches view, preserving the drawing sequence without forcing a full-guide style pass during startup. The About timeline avoids an unnecessary initial horizontal-scroll reset after its SVG updates.

## Lighthouse performance

Scores are out of 100. The arrows show before → after. CLS columns are the after-run values.

| Page | Mobile performance | Desktop performance | Mobile LCP | Mobile blocking time | CLS mobile / desktop |
|---|---:|---:|---:|---:|---:|
`;
for(const route of routes){const {mobile:m,desktop:d}=modes(route),b=m.before,a=m.after;text+=`| ${route} | ${b.scores.performance} → ${a.scores.performance} | ${d.before.scores.performance} → ${d.after.scores.performance} | ${seconds(b.metrics['largest-contentful-paint'])} → ${seconds(a.metrics['largest-contentful-paint'])} | ${number(b.metrics['total-blocking-time'])} → ${number(a.metrics['total-blocking-time'])} ms | ${number(a.metrics['cumulative-layout-shift'],4)} / ${number(d.after.metrics['cumulative-layout-shift'],4)} |\n`;}
text+=`
## Other Lighthouse categories

These are after-run scores (mobile / desktop).

| Page | Accessibility | Best practices | SEO |
|---|---:|---:|---:|
`;
for(const route of routes){const {mobile:m,desktop:d}=modes(route);text+=`| ${route} | ${m.after.scores.accessibility} / ${d.after.scores.accessibility} | ${m.after.scores['best-practices']} / ${d.after.scores['best-practices']} | ${m.after.scores.seo} / ${d.after.scores.seo} |\n`;}
text+=`
The guide, workspace, prompt library, redirect stubs and 404 intentionally restrict indexing or are not normal landing pages. Their SEO scores must be interpreted in that context. Noindex was retained rather than removed to increase a score.

## Paired motion measurements

Each cell is the median of three samples. Desktop width was 1440 px; mobile width was 390 px. Each interaction was observed for one second at 4× CPU slowdown. Layout figures include any other work occurring during that observation window.

| Page / viewport | Interaction | Layout passes before → after | Layout time before → after | Frame interval p95 before → after |
|---|---|---:|---:|---:|
`;
for(const a of paired.filter(x=>x.version==='after')){const b=paired.find(x=>x.name===a.name&&x.phase===a.phase&&x.version==='before');text+=`| ${a.name} | ${a.phase} | ${number(b.layoutCount)} → ${number(a.layoutCount)} | ${number(b.layoutMs,1)} → ${number(a.layoutMs,1)} ms | ${number(b.p95,1)} → ${number(a.p95,1)} ms |\n`;}
text+=`\nSynthetic menu-click handler duration is reported separately below. This measures synchronous handler work, not real-user INP or the full animation duration. Results that increase are retained; this is not a claim that every interaction became faster on every device.\n\n| Page / viewport | Handler duration before → after |\n|---|---:|\n`;
for(const a of paired.filter(x=>x.version==='after'&&x.phase==='menu-open')){const b=paired.find(x=>x.name===a.name&&x.phase===a.phase&&x.version==='before');text+=`| ${a.name} | ${number(b.clickMs,1)} → ${number(a.clickMs,1)} ms |\n`;}
text+=`
## Verification

- All 16 routes: desktop/mobile smoke checks, images, header navigation, published layouts, main-page overflow and contact controls.
- Delayed-JavaScript and refresh checks: public-page headings/layout; guide landing and AI headings. The guide's lower interactive previews intentionally initialise their own layouts and are not covered by a whole-document no-change assertion. Lighthouse records initial visible layout shift separately.
- Header: 320–1920 px, all ten entrance presets, real scrolled reloads, late scripts, slow image loads, rapid switching, reduced motion and no-JavaScript fallback.
- Menu: opening/closing origin, intermediate clip geometry, staged content, interrupted reversal, resizing, Escape, backdrop dismissal, focus trap, background isolation and clean animation resumption.
- Statement spring, Moon arch entry/re-entry, Anna timeline variations, pencil drawing, book layout and click-to-load resource videos.
- Axe accessibility checks at desktop/mobile sizes and menu checks. Automatic checks do not replace a human accessibility review.
- Link audit: ${links.pages} pages, ${links.localDestinations} local links/assets/anchors/responsive candidates, ${links.failures.length} missing destinations. Both external homepage destinations responded successfully to HEAD requests. Email/phone links were checked as markup; no messages or calls were sent.
- Settled pill/menu screenshots were compared with the pre-change screenshots. Runtime tests verify that intermediate movement and reversal remain present.

## Remaining limits

The guide is an unusually large interactive demonstration page. It still carries substantial CSS, SVG and preview content, so its throttled mobile score should not be described as excellent merely because individual costs were reduced. Broad CSS removal or hiding animations to improve a score would change the brief. A future structural improvement would split its demonstration tools into separately loaded chapters while retaining the same visual design.

GitHub Pages controls response compression, cache policy and transport. This repository cannot set arbitrary production response headers. External destinations and third-party embeds can also change independently. YouTube remains click-to-load.

## Repeating the checks

Use Node 24 (Lighthouse 13 does not support the repository machine's older Node 20 executable).

\`\`\`text
node scripts/lighthouse-audit.mjs --phase=after --form=all --force
node scripts/motion-comparison.cjs 61dc963
node scripts/site-link-audit.cjs
node scripts/performance-report.mjs
\`\`\`

Lighthouse HTML/JSON reports are kept locally under \`tmp/performance/{before,after}/lighthouse/\`; motion samples and screenshots are under \`tmp/performance/\`. Those bulky diagnostic files are Git-ignored. The compact audit data alongside this document is committed for review.
`;
fs.writeFileSync('design/performance-audit-2026-10-26.md',text);
fs.writeFileSync('design/performance-audit-2026-10-26.json',JSON.stringify({date:'2026-10-26',baseline:'61dc963',environment:'Local preview; Lighthouse 13.4.1; Node 24; default simulated profiles',pages:rows.map(({file,mode,before:b,after:a})=>({file,mode,page:label(a),before:{scores:b.scores,metrics:b.metrics},after:{scores:a.scores,metrics:a.metrics}})),motion:paired,links},null,2));
console.log('Wrote audit report and compact measurements');
