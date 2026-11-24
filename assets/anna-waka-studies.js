// Permanent waka 10: warm brown hull, orange rim and light timber seats.
const hull='M0 -41 C3.52 -31 11 -20 11 0 C11 21 4.4 32 0 41 C-4.4 32 -11 21 -11 0 C-11 -20 -3.52 -31 0 -41 Z';
const artwork=()=>`<g class="river-canoe" data-study="10" stroke="none">
<defs><linearGradient id="waka-wood-floor" x1="0" x2="1"><stop stop-color="#FDC88E"/><stop offset="1" stop-color="#FDC88E" stop-opacity=".72"/></linearGradient></defs>
<path d="${hull}" fill="#804E50"/><path d="${hull}" transform="scale(.9 .96)" fill="#D65A25"/>
<path d="${hull}" transform="scale(.76 .88)" fill="#281A2C"/>
<path d="${hull}" transform="translate(1 2) scale(.55 .72)" fill="url(#waka-wood-floor)"/>
${[-22,0,22].map(y=>{const w=7.7*(1-Math.abs(y)/95);return `<rect x="${-w}" y="${y-1.9}" width="${w*2}" height="4.8" rx=".8" fill="#281A2C" opacity=".4"/><rect x="${-w}" y="${y-2.8}" width="${w*2}" height="4.8" rx=".8" fill="#FDB069"/>`}).join('')}
<path d="M0-29V29" stroke="#FDD8B0" stroke-width=".35" opacity=".5"/></g>`;
// Angles are measured from the beam. Positive travel points towards the bow.
export const strokes = [
  {name:'Steady tandem', seconds:1.65, catch:40, exit:32, drive:.52, offset:0, slide:5},
  {name:'Long reach', seconds:2.25, catch:58, exit:38, drive:.64, offset:0, slide:8},
  {name:'Alternating glide', seconds:1.95, catch:46, exit:34, drive:.48, offset:.5, slide:6},
  {name:'Quick catch', seconds:1.15, catch:33, exit:24, drive:.44, offset:0, slide:3},
  {name:'Feathered return', seconds:2.15, catch:41, exit:31, drive:.42, offset:0, slide:6, feather:.92},
  {name:'Follow the leader', seconds:1.8, catch:48, exit:36, drive:.55, offset:.16, slide:6},
  {name:'Deep pull', seconds:2.35, catch:53, exit:49, drive:.7, offset:0, slide:9},
  {name:'Rest and drift', seconds:2.65, catch:43, exit:30, drive:.38, offset:0, slide:5, rest:.28},
  {name:'Short alternating', seconds:1.3, catch:30, exit:23, drive:.48, offset:.5, slide:3},
  {name:'Wide sweep', seconds:2.4, catch:66, exit:54, drive:.6, offset:.08, slide:3, feather:.85},
];

export function paddlePose(blades,splashes,phase,activity,stroke,direction) {
  blades.forEach((blade,i) => {
    const side = i ? 1 : -1;
    const cycle = (phase + i * stroke.offset) % 1;
    const pulling = cycle < stroke.drive;
    const progress = pulling ? cycle / stroke.drive :
      Math.min(1,(cycle - stroke.drive) / (1 - stroke.drive - (stroke.rest || 0)));
    const eased = progress * progress * (3 - 2 * progress);
    const position = pulling ? eased : 1 - eased;
    const lift = pulling ? 0 : Math.sin(progress * Math.PI) ** 2;
    const angle = direction * (stroke.catch - (stroke.catch + stroke.exit) * position) * activity;
    const pivotY = direction * stroke.slide * (1 - 2 * position) * activity;
    const reach = 1 - .17 * lift * activity;
    // The grip slides fore and aft inside the gunwale. Only the raised blade feathers.
    blade.setAttribute('transform',`translate(${side * 7} ${pivotY}) scale(${side} 1) rotate(${angle}) scale(${reach} 1) translate(-11 0)`);
    blade.querySelector('[data-paddle-face]').setAttribute('transform',`scale(1 ${1 - (stroke.feather ?? .66) * lift * activity})`);
    const radians = angle * Math.PI / 180;
    const tipX = side * (7 + 22 * reach * Math.cos(radians));
    const tipY = pivotY + 22 * reach * Math.sin(radians);
    splashes[i].setAttribute('d',`M${tipX} ${tipY}q${side * 4} ${-direction * 2} ${side * 3} ${-direction * 7}`);
    splashes[i].setAttribute('opacity',pulling ? Math.sin(progress * Math.PI) * activity * .6 : 0);
    blade.dataset.stroke = pulling ? 'pull' : 'return';
  });
}

export function mountWakaStudies(root,svg,select){
 svg.querySelector('.river-canoe').outerHTML=artwork();
 svg.dataset.wakaDesign='10';
 select();
}
