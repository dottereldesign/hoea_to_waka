import {readFile, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import svgpath from 'svgpath';
import {hatch} from './pencil-paths.mjs';

// Work in the approved artwork's coordinates. Never rewrite its path data.
const source = await readFile('assets/logo-black.svg', 'utf8');
const paths = [...source.matchAll(/<path[^>]* d="([^"]+)"/g)].map(m => m[1]);
const curves = paths.map(d => {
  let point;
  return svgpath(d).abs().unshort().segments.map(s => {
    const start = point;
    if (s[0] === 'C') point = {x:s[5], y:s[6]};
    else if (s[0] === 'M' || s[0] === 'L') point = {x:s[1], y:s[2]};
    return {s, start};
  });
});
const round = n => Number(n.toFixed(3));
const at = ({s,start:p}, t) => {
  const u = 1-t;
  return {x:u**3*p.x+3*u*u*t*s[1]+3*u*t*t*s[3]+t**3*s[5], y:u**3*p.y+3*u*u*t*s[2]+3*u*t*t*s[4]+t**3*s[6]};
};
function fit(pi, si, name) {
  const curve = curves[pi][si], a = at(curve,0), b = at(curve,.5), c = at(curve,1);
  const d = 2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));
  const aa=a.x*a.x+a.y*a.y, bb=b.x*b.x+b.y*b.y, cc=c.x*c.x+c.y*c.y;
  const x=(aa*(b.y-c.y)+bb*(c.y-a.y)+cc*(a.y-b.y))/d;
  const y=(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d;
  const r=Math.hypot(x-a.x,y-a.y);
  const error=Math.max(...Array.from({length:101},(_,i)=>{const p=at(curve,i/100);return Math.abs(Math.hypot(p.x-x,p.y-y)-r);}));
  assert(error < .85, `${name}: circle no longer follows the approved curve`);
  return {x,y,r,b,curve,pi,si,error,name};
}
const fitted = [fit(5,2,'Crown'), fit(1,12,'Wahine'), fit(3,6,'Outer current'), fit(6,8,'Inner current'), fit(2,9,'Paddle')];
const circle = (c,cls,extra='') => `<circle class="${cls}" cx="${round(c.x)}" cy="${round(c.y)}" r="${round(c.r)}" pathLength="1" ${extra}/>`;
const line = (x1,y1,x2,y2,cls) => `<path class="${cls}" pathLength="1" d="M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}"/>`;
const cross = (x,y) => `<path class="lc-center" d="M${round(x-3)} ${round(y)}h6m-3-3v6"/>`;
const configs = [
  ['01','compass','Compass sketch','A line, a circle, a beginning.','The original outline draws in graphite as a compass traces circles fitted to its curves. The mark stays unfilled.','Graphite / contour drawing'],
  ['02','atlas','Curve atlas','Follow the current.','Five complete circles reveal the sweep of the wahine, waves and paddle. Each matched curve is traced before the ink settles.','Ink / sequential curve tracing'],
  ['03','ratio','Golden rhythm','A study in proportion.','A family of circles in the golden ratio unfolds from a shared tangent. A proportional lens around the original mark.','Sandstone / expanding proportions'],
  ['04','blueprint','The drafting room','Structure, brought to light.','A drafting sweep reveals the mark against measured bounds, curve circles and a quiet coordinate grid.','Ocean / vertical drafting sweep'],
  ['05','bezier','Vector anatomy','The detail behind the flow.','Bézier handles extend from the original path anchors. Curvature circles appear, then the silhouette resolves in ink.','Lavender / anchors to artwork'],
  ['06','atlas-grid','Curve atlas · grid','The current, on paper.','The Curve Atlas silhouette and fitted circles, set on white with the fine Compass Sketch grid.','White / sequential curve tracing'],
  ['07','atlas-outline','Curve atlas · outline','The current, in outline.','The same circles and white grid as study 06, with the original logo traced in ink black and left unfilled.','Ink / outline only'],
  ['00','original','Original reference','From the brand guidelines.','A copy of the original pencil-to-ink sequence and its original circle arrangement, here for comparison.','Reference / pencil to ink']
];
function svg(config) {
  const [number,kind,name] = config, id=`lc-${kind}`;
  const title = `${name} — Hoea tō Waka logo`;
  const grid = `<defs><pattern id="${id}-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" stroke-width=".35"/></pattern><clipPath id="${id}-scan"><rect class="lc-reveal" x="-110" y="-90" width="610" height="570"/></clipPath></defs><rect class="lc-grid" x="-70" y="-65" width="520" height="500" fill="url(#${id}-grid)"/>`;
  let geometry='';
  const selected = kind==='compass' ? fitted.filter((_,i)=>i!==3) : kind==='bezier' ? fitted.filter((_,i)=>[0,2,4].includes(i)) : fitted;
  if(kind==='original') {
    // Original percentage layout translated once into the mark's shared coordinate space.
    const original=[[8,8,84],[48,14,52],[25,18,34],[42,41,21],[18,43,34],[11,63,21]];
    geometry=original.map(([left,top,size],i)=>circle({x:(left+size/2-11.5)*5,y:(top+size/2-11.5)*5,r:size*2.445},'lc-circle lc-draw',`data-order="${i}"`)).join('');
    geometry+=line(192,-40,192,430,'lc-axis lc-draw')+line(-40,192,430,192,'lc-axis lc-draw');
  } else if(kind==='ratio') {
    const phi=(1+Math.sqrt(5))/2;
    // The outer circle is tangent to the actual outer-current curve at its midpoint.
    // The smaller phi circles share that tangent; they are a proportion study,
    // deliberately not described as the original mark's construction history.
    const c=fitted[2], vx=(c.x-c.b.x)/c.r, vy=(c.y-c.b.y)/c.r;
    geometry=Array.from({length:4},(_,i)=>{
      const r=c.r/phi**i, ring={x:c.b.x+vx*r,y:c.b.y+vy*r,r};
      return `<g class="lc-ratio-ring" data-order="${i}" style="transform-origin:${round(c.b.x)}px ${round(c.b.y)}px">${circle(ring,'lc-circle')}${cross(ring.x,ring.y)}</g>`;
    }).join('')+circle(fitted[0],'lc-circle lc-draw')+circle(fitted[4],'lc-circle lc-draw');
    geometry+=line(c.b.x,c.b.y,c.x-vx*c.r,c.y-vy*c.r,'lc-radius lc-draw');
    geometry+=`<g class="lc-labels lc-detail"><text x="-58" y="-38">φ = 1.618</text><text x="-58" y="-18">1 : φ : φ² : φ³</text><text x="-58" y="425">PROPORTION STUDY</text></g>`;
  } else {
    geometry=selected.map((c,i)=>{
      const angle=Math.atan2(c.b.y-c.y,c.b.x-c.x)*180/Math.PI;
      const arc=`M${c.curve.start.x} ${c.curve.start.y} ${c.curve.s.join(' ')}`;
      return `<g class="lc-circle-set" data-order="${i}">${circle(c,'lc-circle-base')}${circle(c,'lc-circle lc-draw',`transform="rotate(${round(angle)} ${round(c.x)} ${round(c.y)})" data-order="${i}"`)}${cross(c.x,c.y)}${line(c.x,c.y,c.b.x,c.b.y,'lc-radius lc-detail')}<circle class="lc-contact lc-detail" cx="${round(c.b.x)}" cy="${round(c.b.y)}" r="2.3"/><path class="lc-fit lc-draw" data-order="${i}" pathLength="1" d="${arc}"/>${kind==='compass'?`<g class="lc-compass" data-order="${i}" data-angle="${round(angle)}" style="transform-origin:${round(c.x)}px ${round(c.y)}px">${line(c.x,c.y,c.x+c.r,c.y,'lc-compass-arm')}<circle cx="${round(c.x+c.r)}" cy="${round(c.y)}" r="2.2"/></g>`:''}</g>`;
    }).join('');
    if(kind==='bezier') geometry+=selected.map((c,i)=>{
      const {s,start:p}=c.curve;
      return `<g class="lc-handles" data-order="${i}">${line(p.x,p.y,s[1],s[2],'lc-handle-line')}${line(s[5],s[6],s[3],s[4],'lc-handle-line')}<circle cx="${s[1]}" cy="${s[2]}" r="2.5"/><circle cx="${s[3]}" cy="${s[4]}" r="2.5"/><rect x="${p.x-2.5}" y="${p.y-2.5}" width="5" height="5"/><rect x="${s[5]-2.5}" y="${s[6]-2.5}" width="5" height="5"/></g>`;
    }).join('');
    if(kind==='blueprint') geometry+=`<g class="lc-dimensions lc-detail">${line(4,-46,379,-46,'lc-dimension')}${line(4,-53,4,-39,'lc-dimension')}${line(379,-53,379,-39,'lc-dimension')}${line(423,8,423,376,'lc-dimension')}${line(416,8,430,8,'lc-dimension')}${line(416,376,430,376,'lc-dimension')}<text x="192" y="-55" text-anchor="middle">375 units</text><text x="437" y="192" transform="rotate(90 437 192)" text-anchor="middle">368 units</text>${line(4,-35,4,400,'lc-axis')}${line(379,-35,379,400,'lc-axis')}${line(-25,8,409,8,'lc-axis')}${line(-25,376,409,376,'lc-axis')}</g>`;
  }
  const mark=paths.map((d,i)=>`<path class="lc-outline lc-draw" data-order="${i}" pathLength="1" d="${d}"/>`).join('');
  const fill=(kind==='compass'||kind==='atlas-outline')?'':`<g class="lc-ink" ${kind==='blueprint'?`clip-path="url(#${id}-scan)"`:''}>${paths.map(d=>`<path d="${d}"/>`).join('')}</g>`;
  const shade=kind!=='original'?'':paths.map((d,i)=>`<defs><clipPath id="${id}-hatch-${i}"><path d="${d}"/></clipPath></defs><path class="lc-hatch lc-draw" pathLength="1" data-order="${i}" clip-path="url(#${id}-hatch-${i})" d="${hatch(d,i)}"/>`).join('');
  return `<svg class="lc-art" viewBox="-110 -90 610 570" width="610" height="570" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${config[4]}</desc>${grid}<g class="lc-mark">${mark}${shade}${fill}</g><g class="lc-guides">${geometry}</g>${kind==='blueprint'?'<path class="lc-scanline" d="M-70 -90H450"/>':''}</svg>`;
}
const buttons=configs.map(([num,key,name,,,method],i)=>`<button type="button" class="lc-choice" data-lc-choice="${key}" aria-pressed="${i===0}" aria-controls="lc-panel-${key}"><span class="lc-choice__number">${num}</span><span><strong>${name}</strong><small>${method.split(' / ')[0]}${key==='compass'?' · Outline only':''}</small></span><span class="lc-choice__arrow" aria-hidden="true">↗</span></button>`).join('');
const panels=configs.map((c,i)=>`<article class="lc-panel" id="lc-panel-${c[1]}" data-lc-panel="${c[1]}" aria-labelledby="lc-heading-${c[1]}" ${i?'hidden':''}><div class="lc-sheet"><div class="lc-sheet__meta" aria-hidden="true"><span>HTW / ${c[0]}</span><span>${c[1]==='original'?'Archive':'Construction study'}</span></div>${svg(c)}<div class="lc-sheet__foot" aria-hidden="true"><span>Hoea tō Waka</span><span>${(c[1]==='compass'||c[1]==='atlas-outline')?'Contour / no fill':c[1]==='ratio'?'φ / proportional lens':'Original silhouette'}</span></div></div><div class="lc-caption"><div><p class="lc-caption__eyebrow">${c[5]}</p><h2 id="lc-heading-${c[1]}">${c[3]}</h2></div><p>${c[4]}</p></div></article>`).join('');
const section=`<!-- logo-construction:start -->
<section class="logo-construction" id="logo-construction" aria-labelledby="lc-title">
  <header class="lc-header"><div><p class="lc-eyebrow">Illustrations / Motion studies</p><h1 id="lc-title">One mark. Seven perspectives.</h1></div><p>Exploring the geometry of Hoea tō Waka.<br>The same silhouette, seen in a new light.</p></header>
  <div class="lc-layout"><aside class="lc-sidebar"><label class="lc-guide-toggle lc-motion-toggle" data-lc-motion-control hidden><input type="checkbox" data-lc-motion checked>Animate</label><div class="lc-choices" role="group" aria-label="Choose a logo animation" hidden>${buttons}</div><div class="lc-sidebar__note"><span class="lc-note-rule"></span><p>Circles follow the existing curves. The original logo stays at the heart of every study.</p><a href="../about/brand-guidelines/#cover">View the brand guidelines <span aria-hidden="true">↗</span></a></div></aside><div class="lc-workspace">${panels}<div class="lc-toolbar" hidden><div class="lc-playback"><button type="button" data-lc-replay><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a6 6 0 1 1 0 6M4 3v4h4"/></svg>Replay</button><button type="button" data-lc-pause>Pause</button><span class="lc-status" role="status" aria-live="polite">Ready</span></div><label class="lc-guide-toggle"><input type="checkbox" data-lc-guides checked>Construction lines</label></div></div></div>
  <p class="lc-method-note">Construction studies made around the original artwork. Curve circles are fitted locally; the golden-ratio study explores proportion.</p>
</section>
<!-- logo-construction:end -->`;
let html=await readFile('illustrations/index.html','utf8');
if(html.includes('<!-- logo-construction:start -->'))html=html.replace(/<!-- logo-construction:start -->[\s\S]*?<!-- logo-construction:end -->/,section);
else {
  // Keep one page title; the existing illustration collection is the next section.
  html=html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/,'<h2$1>$2</h2>');
  html=html.replace(/(<main[^>]*id="main-content"[^>]*>)/,`$1\n${section}`);
  html=html.replace('</head>','<link rel="stylesheet" href="../assets/logo-construction.css?v=5">\n<script src="../assets/logo-construction.js?v=5" defer></script>\n</head>');
}
await writeFile('illustrations/index.html',html);
console.log('Logo construction: seven studies + original, unchanged approved paths.');
console.table(fitted.map(c=>({curve:c.name,radius:round(c.r),maxDeviation:round(c.error)})));
