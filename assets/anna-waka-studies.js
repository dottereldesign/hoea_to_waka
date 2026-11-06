// Editable canoe studies; simple original geometry, without decorative cultural motifs.
const colours={coral:'#d96773',pink:'#FDAEB5',apricot:'#FDB069',cream:'#FDD8B0',plum:'#281A2C',berry:'#82394f',blue:'#03394D',teal:'#267C86',sage:'#B4BF8B'};
const designs=[
  {name:'Coral classic',note:'A generous curved hull, three seats and a double coral rim.',w:12, rim:'coral',edge:'pink',floor:'cream',seat:'apricot',well:'berry',seats:[-22,0,22]},
  {name:'Lagoon dart',note:'A slender, pointed hull with a deep teal interior and two light seats.',w:9,rim:'teal',edge:'sage',floor:'blue',seat:'cream',well:'plum',seats:[-15,16],pointed:true},
  {name:'Apricot tender',note:'Softer rounded ends and a warm, open interior.',w:13,rim:'apricot',edge:'cream',floor:'pink',seat:'coral',well:'berry',seats:[-17,17],round:true},
  {name:'Plum fold',note:'Crisp folded edges, a pale floor and three contrasting seats.',w:12,rim:'plum',edge:'berry',floor:'cream',seat:'apricot',well:'berry',seats:[-22,0,22],angular:true},
  {name:'Sage gathering',note:'A wider hull with four seats, softened in sage and cream.',w:15,rim:'sage',edge:'cream',floor:'cream',seat:'teal',well:'teal',seats:[-24,-8,8,24],round:true},
  {name:'Blush ribbon',note:'A flowing coral silhouette with a pale ribbon around the rim.',w:12,rim:'pink',edge:'cream',floor:'coral',seat:'cream',well:'berry',seats:[-18,18],ribbon:true},
  {name:'Twin journey',note:'Two narrow hulls joined by apricot bridges for a different silhouette.',w:8,rim:'teal',edge:'sage',floor:'cream',seat:'apricot',well:'blue',seats:[-16,16],twin:true},
  {name:'Quiet outrigger',note:'A slim coral canoe with a small balancing float alongside it.',w:9,rim:'coral',edge:'pink',floor:'cream',seat:'apricot',well:'plum',seats:[-18,18],outrigger:true},
  {name:'Petal bow',note:'A broad centre tapering to long, delicate points.',w:15,rim:'coral',edge:'apricot',floor:'pink',seat:'cream',well:'berry',seats:[-17,0,17],petal:true},
  {name:'Midnight reflection',note:'Deep blue, a teal rim and fine apricot details inside.',w:11,rim:'blue',edge:'teal',floor:'teal',seat:'apricot',well:'plum',seats:[-22,0,22],pointed:true,keel:true}
];
const hull=d=>d.angular?`M0 -40 L${d.w*.65} -26 L${d.w} -9 V15 L${d.w*.55} 31 L0 40 L${-d.w*.55} 31 L${-d.w} 15 V-9 L${-d.w*.65} -26 Z`:d.round?`M0 -39 C${d.w*.7} -39 ${d.w} -26 ${d.w} -8 V10 C${d.w} 29 ${d.w*.6} 39 0 40 C${-d.w*.6} 39 ${-d.w} 29 ${-d.w} 10 V-8 C${-d.w} -26 ${-d.w*.7} -39 0 -39 Z`:d.petal?`M0 -41 C2 -28 ${d.w} -19 ${d.w} 0 S2 31 0 41 C-2 31 ${-d.w} 19 ${-d.w} 0 S-2 -28 0 -41 Z`:`M0 -41 C${d.w*.32} -31 ${d.w} -20 ${d.w} 0 C${d.w} 21 ${d.w*.4} 32 0 41 C${-d.w*.4} 32 ${-d.w} 21 ${-d.w} 0 C${-d.w} -20 ${-d.w*.32} -31 0 -41 Z`;

function artwork(d,index){
 const c=k=>colours[d[k]],outline=hull(d),id='waka-study-'+index;
 const shell=`<path d="${outline}" fill="${c('rim')}"/><path d="${outline}" transform="scale(.9 .96)" fill="${c('edge')}"/><path d="${outline}" transform="scale(.76 .88)" fill="${c('well')}"/><path d="${outline}" transform="translate(1 2) scale(.55 .72)" fill="url(#${id})"/>${d.seats.map(y=>{const w=d.w*(d.round?.76:.7)*(1-Math.abs(y)/95);return `<rect x="${-w}" y="${y-1.9}" width="${w*2}" height="4.8" rx=".8" fill="${c('well')}" opacity=".4"/><rect x="${-w}" y="${y-2.8}" width="${w*2}" height="4.8" rx=".8" fill="${c('seat')}"/>`;}).join('')}${d.keel?'<path d="M0-29V29" stroke="#FDD8B0" stroke-width=".35" opacity=".5"/>':''}${d.ribbon?`<path d="M-1-36C-11-20-12 17-1 36" fill="none" stroke="#FDD8B0" stroke-width=".7"/>`:''}`;
 return `<g class="river-canoe" data-study="${index}" stroke="none"><defs><linearGradient id="${id}" x1="0" x2="1"><stop stop-color="${c('floor')}"/><stop offset="1" stop-color="${c('floor')}" stop-opacity=".72"/></linearGradient></defs>${d.twin?`<g transform="translate(-10 0) scale(.85 .94)">${shell}</g><g transform="translate(10 0) scale(.85 .94)">${shell}</g><path d="M-12-16H12M-12 16H12" stroke="#FDB069" stroke-width="3"/>`:shell}${d.outrigger?'<path d="M-6-17H-20M-6 17H-20" fill="none" stroke="#FDB069" stroke-width="1.8"/><path d="M-20-32C-26-17-25 21-20 32C-16 20-16-17-20-32Z" fill="#03394D"/><path d="M-20-27V27" stroke="#B4BF8B" stroke-width=".7"/>':''}</g>`;
}
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
 const original=svg.querySelector('.river-canoe').outerHTML;
 const options=[{name:'Reference canoe',note:'Your traced coral canoe.',art:original},...designs.map((d,i)=>({...d,art:artwork(d,i+1)}))];
 const panel=document.createElement('section');panel.className='waka-studies';panel.setAttribute('aria-label','Waka design variations');
 panel.innerHTML='<div class="waka-studies__preview"><svg viewBox="-48 -48 96 96" role="img" aria-label="Selected waka design"><g data-waka-preview></g></svg></div><div class="waka-studies__body"><p class="waka-studies__label">Waka studies</p><output aria-live="polite"></output><p data-waka-note></p><div class="waka-studies__choices" role="group" aria-label="Choose a waka design">'+options.map((o,i)=>`<button type="button" data-waka-choice="${i}" aria-label="${i===0?'Original':String(i).padStart(2,'0')}: ${o.name}" aria-pressed="false">${i===0?'Original':String(i).padStart(2,'0')}</button>`).join('')+'</div><button type="button" class="waka-studies__replay">Replay paddles <span aria-hidden="true">↻</span></button></div>';
 root.querySelector('.anna-story__heading').append(panel);
 const preview=panel.querySelector('[data-waka-preview]'),quiet=matchMedia('(prefers-reduced-motion: reduce)');let raf=0;
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 const play=()=>{stop();const blades=[...preview.querySelectorAll('[data-paddle-blade]')];if(quiet.matches){paddlePose(blades,[],0,0);return;}let start;const tick=now=>{start??=now;const t=(now-start)/1000;const activity=Math.min(1,t/.3,(5-t)/.6);paddlePose(blades,[],t*3.1,Math.max(0,activity));if(t<5&&!document.hidden)raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);};
 const choose=index=>{stop();const o=options[index];svg.querySelector('.river-canoe').outerHTML=o.art;svg.dataset.wakaDesign=String(index);select();preview.innerHTML=(o.art+svg.querySelector('.river-paddle').outerHTML).replaceAll('id="','id="preview-').replaceAll('url(#','url(#preview-');panel.querySelector('output').textContent=(index?String(index).padStart(2,'0')+' · ':'')+o.name;panel.querySelector('[data-waka-note]').textContent=o.note;panel.querySelectorAll('[data-waka-choice]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.wakaChoice)===index)));play();};
 panel.querySelectorAll('[data-waka-choice]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.wakaChoice))));panel.querySelector('.waka-studies__replay').addEventListener('click',play);
 quiet.addEventListener('change',()=>{if(quiet.matches){stop();paddlePose([...preview.querySelectorAll('[data-paddle-blade]')],[],0,0);}});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(panel);addEventListener('pagehide',stop);choose(0);
}
