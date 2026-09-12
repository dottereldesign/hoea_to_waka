import { esc, url, icon, link, brand, nav, navtools, contactLinks, footerlinks, fineprint } from './renderers';
import { direction } from './directions';

const n=i=>String(i+1).padStart(2,'0');
const headlines=[
  'Grow a little stronger, together.','Room to grow. A way to begin.','Let a little possibility in.','Find strength beneath the surface.','Small steps. Deep roots.',
  'Find your rhythm in changing water.','Where different paths come together.','A clearer view of what comes next.','A place to find your bearings.','A fresh perspective changes things.',
  'Build strength that carries forward.','Make something useful of what’s next.','There is a way through.','Make space for a different perspective.','Steady yourself. Move with purpose.',
  'A new chapter in everyday resilience.','Good people. A shared direction.','The space to see things differently.','Every journey has a next chapter.','What matters is where we go from here.',
  'Find your direction. Make your move.','A different angle on resilience.','Stronger, one connection at a time.','Turn uncertainty into a useful next step.','More clarity. More connection. More possibility.',
  'A calmer place to begin.','Practical care for the life you live.','Pause. Notice. Choose your next step.','Make room for what matters most.','A little clarity can change your day.',
  'There is possibility on the horizon.','See further. Start where you are.','Find what guides you forward.','Steady direction, even in deep water.','Tomorrow begins with one useful step.',
  'Good things grow from connection.','Small things can shift the whole journey.','Follow the thread of what matters.','Bring the pieces together.','A little encouragement for the road ahead.',
  'Open up a stronger way forward.','Build your next step on what matters.','A shared space for stronger people.','Find a path that fits your world.','Step into a new possibility.',
];
const imageSources={forest:['assets/forest-concept.webp','AI-generated concept of a misty forest stream'],tide:['assets/tide-concept.webp','AI-generated concept of turquoise surf on volcanic sand'],sculpture:['assets/sculpture-concept.webp','AI-generated concept of sculptural stone arches'],ocean:['assets/ocean-concept.webp','AI-generated coastal inlet concept']};
const para=t=>t?`<p>${esc(t)}</p>`:'';
const heading=(d,v)=>`<header class="ex-heading"><p class="ds-kicker">${esc(d.eyebrow||'Hoea tō Waka · Practical resilience')}</p><h${['hero','header','gallery','error'].includes(d.type)?1:2} class="ds-title" data-text-motion>${esc(d.type==='hero'?headlines[v.id-6]:d.title||'A useful way forward.')}</h${['hero','header','gallery','error'].includes(d.type)?1:2}>${d.lead?`<p class="ds-lead">${esc(d.lead)}</p>`:''}</header>`;
function visual(d,v){
  const [src,alt]=d.type==='story'&&d.image?[d.image,d.alt]:imageSources[v.image];
  return `<figure class="ex-visual"><img src="${esc(url(src))}" alt="${esc(alt||'')}" loading="lazy" decoding="async"><figcaption>${icon('Compass',14)}<span>${d.type==='story'&&d.image?'People. Context. Possibility.':'A visual exploration of possibility.'}</span></figcaption></figure>`;
}
const rail=()=>`<div class="ex-rail"><span>HOEA TŌ WAKA</span><span>${icon('Waves',18)} PRACTICAL RESILIENCE / AOTEAROA</span></div>`;
const side=(d)=>`<aside class="ex-aside">${d.facts.length?`<dl class="ds-facts">${d.facts.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`:`${icon('Compass',30)}<p>People. Context.<br>Possibility.</p><a href="${url('about/')}">Meet the approach ${icon('ArrowUpRight',16)}</a>`}</aside>`;
function item(c,i,d){
  const media=c.image?`<img src="${esc(c.image)}" alt="${esc(c.alt||c.title)}" loading="lazy" decoding="async">`:`<div class="ex-item-symbol" aria-hidden="true">${icon(['Compass','Heart','Waves','Leaf','Users'][i%5],40)}</div>`;
  if(d.type==='gallery')return `<figure class="ex-item" data-card-unit>${media}<figcaption><span class="ds-number">${n(i)}</span><h3>${esc(c.title)}</h3></figcaption></figure>`;
  if(d.type==='videos')return `<article class="ex-item" data-card-unit>${media}<div class="ex-item-copy"><span class="ds-number">WATCH / ${n(i)}</span><h3>${esc(c.title)}</h3>${para(c.text)}<a class="ds-button" href="${esc(c.href)}" target="_blank" rel="noopener"><span>Watch on YouTube</span>${icon('Play')}</a></div></article>`;
  return `<article class="ex-item" data-card-unit>${media}<div class="ex-item-copy"><span class="ds-number">${d.type==='process'?'STEP ':''}${n(i)}</span><h3>${esc(c.title)}</h3>${para(c.text)}${c.href?link(c.cta||'Explore this option',c.href):''}</div></article>`;
}
function content(d,v){
  if(d.type==='contact')return `<div class="ex-content ex-contact-content"><div class="ex-contact-directory">${contactLinks()}</div><div class="ex-form-panel" data-form-slot></div></div>`;
  if(d.type==='footer')return `<div class="ex-content">${footerlinks()}${contactLinks()}</div>`;
  if(d.type==='faq')return `<div class="ex-content ex-deck ex-faq">${d.items.map((c,i)=>`<details class="ex-item" data-card-unit><summary><span class="ds-number">${n(i)}</span><span>${esc(c.title)}</span>${icon('Plus',18)}</summary><div class="ds-answer">${para(c.text)}</div></details>`).join('')}</div>`;
  if(d.type==='testimonials')return `<div class="ex-content ex-deck ex-quotes">${d.quotes.map((q,i)=>`<figure class="ex-item" data-card-unit><span class="ds-number">PERSPECTIVE / ${n(i)}</span><blockquote>“${esc(q.text)}”</blockquote><figcaption>${esc(q.by)}<small>${esc(q.role)}</small></figcaption></figure>`).join('')}</div>`;
  if(d.items.length)return `<div class="ex-content ex-deck ex-items-${d.type}">${d.items.map((c,i)=>item(c,i,d)).join('')}</div>`;
  if(d.type==='uses')return `<div class="ex-content"><ul class="ex-tags">${d.tags.map((t,i)=>`<li data-card-unit><span class="ds-number">${n(i)}</span>${esc(t)}</li>`).join('')}</ul><div class="ds-prose">${d.prose}</div></div>`;
  if(['hero','cta','statement','error'].includes(d.type))return `<div class="ex-content"><div class="ds-actions">${d.type==='error'?link('Find your way home',''):link(d.type==='hero'?'Explore the possibilities':'Start a conversation',d.type==='hero'?'services/':'contact/')}${link(d.type==='hero'?'Talk with Anna':'Meet the approach',d.type==='hero'?'contact/':'about/','ds-button-quiet')}</div>${d.type==='hero'?'<p class="ex-footnote">For organisations, teams, and the people who support others.</p>':''}</div>`;
  if(d.type==='header'&&!d.prose)return `<div class="ex-content"><div class="ds-actions">${link('Explore services','services/')}${link('About our approach','about/','ds-button-quiet')}</div></div>`;
  return `<div class="ex-content"><div class="ds-prose">${d.prose||''}</div></div>`;
}
// Forty-five authored compositions. Each places the same semantic content once;
// no duplicated headings, fabricated testimonials, or discarded form state.
const compositions={
  canopy:({T,M,C,A,R})=>`${R}<div class="ex-canopy-crown">${T}${M}</div><div class="ex-canopy-floor">${C}${A}</div>`,
  fernhouse:({T,M,C,A,R})=>`${R}<div class="ex-fernhouse-window">${M}${A}</div><div class="ex-fernhouse-reading">${T}${C}</div>`,
  glasshouse:({T,M,C,A,R})=>`${R}<div class="ex-glasshouse-frame">${T}${A}${M}</div>${C}`,
  understory:({T,M,C,A,R})=>`${M}<div class="ex-understory-shelter">${R}${T}${C}${A}</div>`,
  seedling:({T,M,C,A,R})=>`${T}<div class="ex-seedling-stem" aria-hidden="true"></div><div class="ex-seedling-base">${M}${C}${A}</div>${R}`,
  tidal:({T,M,C,A,R})=>`<div class="ex-tidal-horizon">${M}${T}</div><div class="ex-tidal-ledge">${C}${A}</div>${R}`,
  estuary:({T,M,C,A,R})=>`<div class="ex-estuary-bank">${R}${T}${C}</div><div class="ex-estuary-channel" aria-hidden="true"></div><div class="ex-estuary-bank">${M}${A}</div>`,
  shoreline:({T,M,C,A,R})=>`<div class="ex-shoreline-head">${T}${A}</div>${M}<div class="ex-shoreline-beach">${R}${C}</div>`,
  harbour:({T,M,C,A,R})=>`<div class="ex-harbour-frame">${R}${T}${M}</div><div class="ex-harbour-quay">${A}${C}</div>`,
  'sea-glass':({T,M,C,A,R})=>`${R}<div class="ex-glass-stage">${M}<div class="ex-glass-pane">${T}${A}</div></div><div class="ex-glass-shelf">${C}</div>`,
  monolith:({T,M,C,A,R})=>`<div class="ex-monolith-text">${R}${T}${C}</div><div class="ex-monolith-plinth">${M}${A}</div>`,
  'clay-studio':({T,M,C,A,R})=>`${R}<div class="ex-clay-head">${T}${A}</div><div class="ex-clay-workbench">${C}${M}</div>`,
  archway:({T,M,C,A,R})=>`${R}<div class="ex-arch-wings">${T}${M}${A}</div><div class="ex-arch-base">${C}</div>`,
  'still-life':({T,M,C,A,R})=>`<div class="ex-still-frame">${M}${R}</div><div class="ex-still-caption">${T}${A}</div>${C}`,
  balance:({T,M,C,A,R})=>`${R}<div class="ex-balance-beam">${T}${M}</div><div class="ex-balance-base">${A}${C}</div>`,
  folio:({T,M,C,A,R})=>`${R}${T}<div class="ex-folio-spread">${M}<div>${A}${C}</div></div>`,
  dispatch:({T,M,C,A,R})=>`${R}<div class="ex-dispatch-head">${T}${A}</div><div class="ex-dispatch-columns">${M}${C}</div>`,
  margin:({T,M,C,A,R})=>`<div class="ex-margin-annotations">${R}${A}</div><div class="ex-margin-essay">${T}${C}${M}</div>`,
  anthology:({T,M,C,A,R})=>`<div class="ex-anthology-cover">${R}${T}${M}</div><div class="ex-anthology-chapters">${A}${C}</div>`,
  colophon:({T,M,C,A,R})=>`${R}<div class="ex-colophon-plate">${T}${C}${A}</div>${M}`,
  signal:({T,M,C,A,R})=>`<div class="ex-signal-sign">${R}${T}</div><div class="ex-signal-info">${C}${M}${A}</div>`,
  cutout:({T,M,C,A,R})=>`${R}<div class="ex-cutout-stage">${M}${T}</div><div class="ex-cutout-base">${A}${C}</div>`,
  assembly:({T,M,C,A,R})=>`${R}${T}<div class="ex-assembly-units">${M}${A}${C}</div>`,
  wayfinder:({T,M,C,A,R})=>`${R}<div class="ex-wayfinder-spine">${T}<span aria-hidden="true">↘</span></div><div class="ex-wayfinder-bays">${M}${C}${A}</div>`,
  playbill:({T,M,C,A,R})=>`<div class="ex-playbill-poster">${R}${T}<div class="ex-playbill-columns">${A}${M}${C}</div></div>`,
  stillwater:({T,M,C,A,R})=>`${R}<div class="ex-stillwater-note">${T}${A}</div>${M}${C}`,
  linen:({T,M,C,A,R})=>`${R}<div class="ex-linen-sheet">${T}${C}</div><div class="ex-linen-fold">${M}${A}</div>`,
  pause:({T,M,C,A,R})=>`${R}<div class="ex-pause-column">${T}${M}${C}${A}</div>`,
  'breathing-room':({T,M,C,A,R})=>`${R}<div class="ex-breathing-view">${M}${A}</div><div class="ex-breathing-copy">${T}${C}</div>`,
  'soft-focus':({T,M,C,A,R})=>`${R}<div class="ex-focus-vignette">${M}</div><div class="ex-focus-panel">${T}${A}${C}</div>`,
  afterglow:({T,M,C,A,R})=>`<div class="ex-afterglow-sky">${M}${R}</div><div class="ex-afterglow-card">${T}${C}${A}</div>`,
  observatory:({T,M,C,A,R})=>`${R}<div class="ex-observatory-aperture">${M}${A}</div><div class="ex-observatory-instrument">${T}${C}</div>`,
  'north-star':({T,M,C,A,R})=>`${R}<div class="ex-star-cross">${A}${T}${M}</div><div class="ex-star-base">${C}</div>`,
  'deep-current':({T,M,C,A,R})=>`<div class="ex-deep-stream">${M}${R}</div><div class="ex-deep-layers">${T}<div>${C}${A}</div></div>`,
  moonrise:({T,M,C,A,R})=>`${R}${T}<div class="ex-moon-horizon">${M}</div><div class="ex-moon-panels">${C}${A}</div>`,
  'paper-garden':({T,M,C,A,R})=>`${R}<div class="ex-paper-flower">${T}${M}</div><div class="ex-paper-notes">${A}${C}</div>`,
  pebble:({T,M,C,A,R})=>`${R}<div class="ex-pebble-pool">${M}${T}</div><div class="ex-pebble-islands">${C}${A}</div>`,
  ribbon:({T,M,C,A,R})=>`<div class="ex-ribbon-title">${T}${R}</div><div class="ex-ribbon-stage">${A}${M}${C}</div>`,
  mosaic:({T,M,C,A,R})=>`<div class="ex-mosaic-tiles">${T}${M}${A}${R}</div>${C}`,
  postmark:({T,M,C,A,R})=>`<div class="ex-postmark-card">${R}<div class="ex-postmark-face">${M}${T}</div><div class="ex-postmark-message">${C}${A}</div></div>`,
  atrium:({T,M,C,A,R})=>`${R}<div class="ex-atrium-volumes">${T}${M}${A}</div><div class="ex-atrium-court">${C}</div>`,
  terrace:({T,M,C,A,R})=>`${R}<div class="ex-terrace-upper">${M}${T}</div><div class="ex-terrace-middle">${A}</div><div class="ex-terrace-lower">${C}</div>`,
  pavilion:({T,M,C,A,R})=>`<div class="ex-pavilion-roof">${R}${T}</div><div class="ex-pavilion-rooms">${M}<div>${C}${A}</div></div>`,
  contour:({T,M,C,A,R})=>`${R}<div class="ex-contour-map">${M}${A}</div><div class="ex-contour-field">${T}${C}</div>`,
  threshold:({T,M,C,A,R})=>`${R}<div class="ex-threshold-entry">${T}${M}</div><div class="ex-threshold-wall">${C}${A}</div>`,
};
const navCompositions={
  Botanical:(B,N,U,R)=>`${R}<div class="ex-nav-garden">${B}${N}${U}</div>`,
  Coastal:(B,N,U,R)=>`<div class="ex-nav-coast">${B}<div>${N}${U}</div></div>${R}`,
  Sculptural:(B,N,U,R)=>`<div class="ex-nav-stone">${B}${U}${N}</div>`,
  Editorial:(B,N,U,R)=>`${R}<div class="ex-nav-folio">${B}${U}</div>${N}`,
  Graphic:(B,N,U,R)=>`<div class="ex-nav-sign">${B}<div>${R}${N}</div>${U}</div>`,
  Quiet:(B,N,U,R)=>`<div class="ex-nav-quiet">${B}${N}${U}</div>`,
  Nocturnal:(B,N,U,R)=>`<div class="ex-nav-night">${B}${N}${U}</div>${R}`,
  Playful:(B,N,U,R)=>`<div class="ex-nav-play">${B}<div>${N}${U}</div></div>`,
  Architectural:(B,N,U,R)=>`<div class="ex-nav-structure">${B}${N}${U}</div>${R}`,
};
export function renderExtended(data,id){
  const v=direction(id),d={...data};
  if(d.type==='navbar')return `<div class="ex-navigation ex-nav-${v.mode}">${navCompositions[v.collection](brand(),nav(),navtools(),rail())}</div>`;
  if(d.type==='utility')return `<button class="ds-quick-trigger ex-quick-${v.mode}" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon(['Leaf','Waves','Compass','Mail','Heart'][v.mode-1])}<span>${['Let’s talk','Connect','Find a way','Say hello','Start here'][v.mode-1]}</span></button><div class="ds-quick-panel" hidden><p class="ds-kicker">A simple first step</p>${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`;
  if(d.type==='footer'){d.title='Let’s find a way forward.';d.lead='Practical resilience. Shared direction. Grounded in Aotearoa.';}
  const T=heading(d,v),M=d.type==='footer'?`<div class="ex-visual ex-footer-brand">${brand()}<span aria-hidden="true">↗</span></div>`:visual(d,v),C=content(d,v),A=side(d),R=rail();
  return `<div class="ex-composition ex-${v.slug} ex-mode-${v.mode}">${compositions[v.slug]({T,M,C,A,R})}</div>${d.type==='footer'?fineprint():''}`;
}
