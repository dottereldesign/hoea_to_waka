// Permanent waka 10: warm brown hull, orange rim and light timber seats.
const hull='M0 -41 C3.52 -31 11 -20 11 0 C11 21 4.4 32 0 41 C-4.4 32 -11 21 -11 0 C-11 -20 -3.52 -31 0 -41 Z';
const artwork=()=>`<g class="river-canoe" data-study="10" stroke="none">
<defs><linearGradient id="waka-wood-floor" x1="0" x2="1"><stop stop-color="#FDC88E"/><stop offset="1" stop-color="#FDC88E" stop-opacity=".72"/></linearGradient></defs>
<path d="${hull}" fill="#804E50"/><path d="${hull}" transform="scale(.9 .96)" fill="#D65A25"/>
<path d="${hull}" transform="scale(.76 .88)" fill="#281A2C"/>
<path d="${hull}" transform="translate(1 2) scale(.55 .72)" fill="url(#waka-wood-floor)"/>
${[-22,0,22].map(y=>{const w=7.7*(1-Math.abs(y)/95);return `<rect x="${-w}" y="${y-1.9}" width="${w*2}" height="4.8" rx=".8" fill="#281A2C" opacity=".4"/><rect x="${-w}" y="${y-2.8}" width="${w*2}" height="4.8" rx=".8" fill="#FDB069"/>`}).join('')}
<path d="M0-29V29" stroke="#FDD8B0" stroke-width=".35" opacity=".5"/></g>`;
export function paddlePose(blades,splashes,phase,activity){
 blades.forEach((blade,i)=>{
  const side=i?1:-1,t=((phase/(Math.PI*2)+i*.5)%1+1)%1,pull=t<.58;
  const u=pull?t/.58:(t-.58)/.42,e=u*u*(3-2*u);
  const swing=pull?32-64*e:-32+64*e;
  const lift=pull?0:Math.sin(Math.PI*u)**2;
  const rotation=18+(swing-18)*activity,reach=1-.18*lift*activity;
  blade.setAttribute('transform',`translate(${side*11} ${-1.6*lift*activity}) scale(${side} 1) rotate(${rotation}) scale(${reach} 1) translate(-11 0)`);
  blade.querySelector('[data-paddle-face]')?.setAttribute('transform',`scale(1 ${1-.8*lift*activity})`);
  const tipX=side*(11+22*reach*Math.cos(rotation*Math.PI/180)),tipY=22*reach*Math.sin(rotation*Math.PI/180);
  const splash=splashes[i];if(splash){splash.setAttribute('d',`M${tipX-side*2} ${tipY-3}q${side*3} 3 0 6`);splash.setAttribute('opacity',String(pull?Math.sin(Math.PI*u)*activity*.55:0));}
  blade.dataset.stroke=pull?'pull':'return';
 });
}

export function mountWakaStudies(root,svg,select){
 svg.querySelector('.river-canoe').outerHTML=artwork();
 svg.dataset.wakaDesign='10';
 select();
}
