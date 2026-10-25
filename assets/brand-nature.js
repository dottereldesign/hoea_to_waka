(() => {
  const section = document.querySelector('#brand-nature-studies');
  if (!section) return;
  const stage = section.querySelector('.brand-nature__stage');
  const choices = [...section.querySelectorAll('[data-nature-study]')];
  const pause = section.querySelector('[data-nature-pause]');
  const replay = section.querySelector('[data-nature-replay]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0,Math.min(1,n));
  const smooth = n => {n=clamp(n);return n*n*(3-2*n);};
  const grow = (t,start=0,duration=1) => 1-(1-clamp((t-start)/duration))**3;
  const f = n => Number(n.toFixed(3));
  const line = (d,extra='') => `<path d="${d}" fill="none" ${extra.includes('stroke=')?'':'stroke="currentColor"'} ${extra.includes('stroke-width=')?'':'stroke-width="1.5"'} stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const path = (d,fill='#edf1ed',extra='') => `<path d="${d}" fill="${fill}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const frame = (title,desc,art,defs='') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="640" height="640" role="img" aria-labelledby="nature-art-title nature-art-desc"><title id="nature-art-title">${title}</title><desc id="nature-art-desc">${desc}</desc><defs>${defs}</defs><rect width="640" height="640" fill="#fff"/><g data-nature-art>${art}</g></svg>`;
  const mount = (title,desc,art,defs) => {stage.innerHTML=frame(title,desc,art,defs);return stage.querySelector('svg');};
  const strokes = svg => [...svg.querySelectorAll('[data-stroke]')].map(node => {node.setAttribute('pathLength','1');node.style.strokeDasharray='1';return node;});
  const reveal = (nodes,t,duration=2) => nodes.forEach((node,i)=>node.style.strokeDashoffset=1-grow(t,i*.035,duration));
  const water = (y,time,amplitude=5,start=140,end=500) => {
    const pts=[];
    for(let x=start;x<=end;x+=8)pts.push(`${x},${f(y+amplitude*Math.sin((x-start)/43-time*.75)+amplitude*.3*Math.sin(x/21+time*.4))}`);
    return 'M'+pts.join('L');
  };
  const studies = [
    {id:'fern',name:'Fern unfurl',description:'A fine frond opens leaf by leaf, then settles into a little breeze.',build(){
      const point=t=>{const q=1-t;return [q**3*282+3*q*q*t*274+3*q*t*t*392+t**3*407,q**3*514+3*q*q*t*398+3*q*t*t*278+t**3*161];};
      let leaves='';const poses=[];
      for(let i=0;i<15;i++)for(const side of [-1,1]){
        const t=.1+i*.057,[x,y]=point(t),[nx,ny]=point(t+.001),angle=Math.atan2(ny-y,nx-x)*180/Math.PI+side*64;
        const length=(82-49*t)*(side===1?.94:1),index=poses.length;poses.push({x,y,angle,length});
        let veins='';for(let v=.23;v<.9;v+=.16)veins+=line(`M${length*v} 0l${length*.12} -3.5M${length*v} 0l${length*.1} 4`,'opacity=".32" stroke-width=".7"');
        leaves+=`<g data-leaf="${index}">${path(`M0 0Q${length*.4} -10 ${length} 0Q${length*.56} 13 0 0Z`,i%3===0?'#e2eae0':'#f1f4ee')}${line(`M1 0Q${length*.5} 1 ${length-3} 0`,'stroke-width=".8" opacity=".5"')}${veins}</g>`;
      }
      const svg=mount('Fern unfurl','A slender botanical fern opens paired leaflets into white space.',`<g data-frond>${line('M278 532Q282 521 282 514C274 398 392 278 407 161','data-stroke')}${leaves}</g>${line('M251 534Q279 532 307 534','opacity=".3"')}`);
      const stem=strokes(svg),nodes=[...svg.querySelectorAll('[data-leaf]')],frond=svg.querySelector('[data-frond]');
      return(t,still)=>{reveal(stem,t,2.5);frond.setAttribute('transform',`rotate(${still?0:f(Math.sin(t*.8)*1.3)} 282 514)`);nodes.forEach((node,i)=>{const p=poses[i],g=grow(t,.25+i*.065,1.15);node.setAttribute('transform',`translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.angle+(1-g)*18)}) scale(${f(Math.max(.001,g))})`);});};
    }},
    {id:'tide',name:'Tide window',description:'An oval opens onto a slow tide. A small horizon, with room around it.',build(){
      const outline='M320 151C251 151 228 224 228 312V446Q320 473 412 446V312C412 224 389 151 320 151Z';
      const svg=mount('Tide window','A narrow oval window holds moving sea water and a small sun.',`<g clip-path="url(#nature-tide-clip)"><rect x="205" y="130" width="230" height="350" fill="#f3f6f5"/><circle cx="358" cy="246" r="23" fill="#e9e6dc"/><path data-tide-fill fill="#d5e5e1"/>${line('M228 292H412','opacity=".35"')}<path data-tide-wave fill="none" stroke="#73958f" stroke-width="1.2"/><path data-tide-foam fill="none" stroke="#fff" stroke-width="2"/></g>${line(outline,'data-stroke')}${line('M271 493Q320 496 369 493','opacity=".3"')}`,`<clipPath id="nature-tide-clip"><path d="${outline}"/></clipPath>`);
      const lines=strokes(svg),fill=svg.querySelector('[data-tide-fill]'),wave=svg.querySelector('[data-tide-wave]'),foam=svg.querySelector('[data-tide-foam]');
      return(t,still)=>{reveal(lines,t,1.7);const time=still?2:t,y=385-60*grow(t,.35,2)+10*Math.sin(time*.6);fill.setAttribute('d',water(y,time,5,205,437)+'L437 485H205Z');wave.setAttribute('d',water(y+27,time+.8,2.5,205,437));foam.setAttribute('d',water(y+2,time,5,205,437));};
    }},
    {id:'arch',name:'Sea arch',description:'A small opening in a sea-worn rock frames the water moving beyond it.',build(){
      const hole='M286 441V317C286 277 355 264 361 319V441Z';
      const rock='M207 455L220 363 236 282Q243 250 270 241L294 193 328 188 345 212 372 229 394 296 412 359 431 455Z';
      const svg=mount('Sea arch','A spare coastal rock arch frames blue-green wave lines.',`<g clip-path="url(#nature-arch-hole)"><rect x="279" y="270" width="90" height="180" fill="#e9f0ed"/><path data-arch-wave fill="#cbded8"/></g><path d="${rock}${hole}" fill="#f4f2ec" fill-rule="evenodd" stroke="currentColor" stroke-width="1.5"/>${line('M286 441V317C286 277 355 264 361 319V441','data-stroke')}${line('M249 286l14-19 5-21M383 322l-13-23M228 421l15-51','opacity=".3"')}${line('M164 456Q214 453 267 456M372 456Q420 453 477 456','data-stroke opacity=".5"')}`,`<clipPath id="nature-arch-hole"><path d="${hole}"/></clipPath>`);
      const lines=strokes(svg),wave=svg.querySelector('[data-arch-wave]');
      return(t,still)=>{reveal(lines,t,2);wave.setAttribute('d',water(364+(still?0:7*Math.sin(t*.6)),still?2:t,4,275,371)+'L371 451H275Z');};
    }},
    {id:'rain',name:'Rain rings',description:'One drop, a quiet surface, and rings that take their time to disappear.',build(){
      const svg=mount('Rain rings','A single water drop falls into an almost invisible pool, making spreading elliptical rings.',`${line('M171 423Q320 421 469 423','opacity=".2"')}<g data-drop>${path('M320 212C320 212 308 231 308 239A12 12 0 0 0 332 239C332 231 320 212 320 212Z','#dde9e6')}</g><g data-rain-rings>${[0,1,2].map(()=>'<ellipse cx="320" cy="423" fill="none" stroke="#698a84" stroke-width="1.2"/>').join('')}</g><g data-splash>${line('M310 416l-5-10M330 416l5-10','stroke-width="1.2"')}</g>`);
      const drop=svg.querySelector('[data-drop]'),rings=[...svg.querySelectorAll('ellipse')],splash=svg.querySelector('[data-splash]');
      return(t,still)=>{const c=still?1.8:t%3.3,fall=clamp(c/.9);drop.setAttribute('transform',`translate(320 ${f(235+174*fall*fall)}) scale(1 ${f(1+.13*fall)}) translate(-320 -235)`);drop.setAttribute('opacity',c<.9?1:0);rings.forEach((ring,i)=>{const g=clamp((c-.88-i*.19)/1.9);ring.setAttribute('rx',f(9+g*119));ring.setAttribute('ry',f(2+g*21));ring.setAttribute('opacity',c>.88+i*.19?f((1-g)*.75):0);});splash.setAttribute('opacity',still?0:f(Math.max(0,1-Math.abs(c-.98)/.19)*.6));};
    }},
    {id:'bloom',name:'Coastal bloom',description:'Fine red filaments fan out from a branch, followed by a few drifting specks.',build(){
      let filaments='';for(let i=0;i<38;i++){const a=(-166+i*4.75)*Math.PI/180,len=76+18*Math.sin(i*2.1),x=322+Math.cos(a)*len,y=330+Math.sin(a)*len;filaments+=`<g data-filament="${i}">${line(`M322 330Q${f(322+(x-322)*.3)} ${f(330+(y-330)*.68)} ${f(x)} ${f(y)}`,'stroke="#9e4147" stroke-width="1"')}<circle cx="${f(x)}" cy="${f(y)}" r="1.5" fill="#9e4147"/></g>`;}
      const svg=mount('Coastal bloom','A small red coastal blossom unfolds fine stamens above a spare leafy branch.',`${line('M253 480Q305 406 322 330','data-stroke')}${path('M280 438Q229 430 221 382Q260 377 280 438Z','#edf1e9')}${path('M300 398Q351 396 370 353Q329 345 300 398Z','#edf1e9')}<g data-flower>${filaments}<circle cx="322" cy="330" r="5" fill="#725349"/></g><g data-pollen><circle cx="379" cy="230" r="1.2" fill="#ab7373"/><circle cx="395" cy="253" r=".9" fill="#ab7373"/></g>`);
      const stem=strokes(svg),nodes=[...svg.querySelectorAll('[data-filament]')],flower=svg.querySelector('[data-flower]'),pollen=svg.querySelector('[data-pollen]');
      return(t,still)=>{reveal(stem,t,2);flower.setAttribute('transform',`rotate(${still?0:f(Math.sin(t*.8)*1.1)} 322 330)`);nodes.forEach((node,i)=>{const g=Math.max(.001,grow(t,.35+i*.026,1.65));node.setAttribute('transform',`translate(322 330) scale(${f(g)}) translate(-322 -330)`);});pollen.setAttribute('transform',`translate(${still?0:f(Math.sin(t*.4)*8)} ${still?0:f(-8*Math.sin(t*.4))})`);};
    }},
    {id:'alpine',name:'Alpine reflection',description:'Two quiet peaks meet a thin lake. Their reflection moves more than they do.',build(){
      const peaks='M185 344L282 207 321 269 358 232 446 344';
      const svg=mount('Alpine reflection','Two finely drawn alpine peaks and a soft lake reflection sit in generous white space.',`${path(peaks+'Z','#f1f2ee','data-stroke')}${line('M261 238l21-31 22 35-15-5-9 8-8-7Z','opacity=".6"')}${line('M345 249l13-17 20 27-16-7-8 5','opacity=".6"')}${line('M161 349H479','data-stroke opacity=".5"')}<g clip-path="url(#nature-lake-clip)"><path d="${peaks}" fill="#dbe7e2" stroke="#8ba69f" stroke-width="1" transform="translate(0 697) scale(1 -1)"/><path data-lake-wave fill="none" stroke="#fff" stroke-width="4"/><path data-lake-wave fill="none" stroke="#fff" stroke-width="5"/><path data-lake-wave fill="none" stroke="#fff" stroke-width="5"/></g>`, '<clipPath id="nature-lake-clip"><path d="M185 355H446L401 423Q320 452 235 423Z"/></clipPath>');
      const lines=strokes(svg),waves=[...svg.querySelectorAll('[data-lake-wave]')];
      return(t,still)=>{reveal(lines,t,2.3);waves.forEach((node,i)=>node.setAttribute('d',water(372+i*22,still?0:t*.55+i,2,175,455)));};
    }},
    {id:'grass',name:'Coastal grass',description:'A few coastal blades lean into the wind while a pale sun stays still.',build(){
      let grass='';const poses=[];for(let i=0;i<7;i++){const x=269+i*17,height=164+48*Math.sin(i*1.6),tip=x-35+55*Math.sin(i*1.1);poses.push({x,tip,height});grass+=`<g data-grass="${i}">${path(`M${x} 462Q${x-8} ${462-height*.6} ${tip} ${462-height}Q${x+15} ${462-height*.5} ${x+3} 462Z`,i%2?'#edf2e9':'#dde7dc')}${line(`M${x+1} 462Q${x+3} ${462-height*.5} ${tip} ${462-height}`,'stroke-width=".7" opacity=".4"')}</g>`;}
      const svg=mount('Coastal grass','A handful of thin coastal grasses sway beneath a pale circular sun.',`<circle cx="376" cy="281" r="55" fill="#f1eee5"/>${grass}${line('M205 464Q314 459 425 464','data-stroke opacity=".5"')}`);
      const lines=strokes(svg),nodes=[...svg.querySelectorAll('[data-grass]')];
      return(t,still)=>{reveal(lines,t,1.8);nodes.forEach((node,i)=>{const g=grow(t,i*.12,1.8);node.setAttribute('transform',`translate(${poses[i].x} 462) rotate(${still?0:f(Math.sin(t*.85+i*.25)*2.1)}) scale(1 ${f(Math.max(.001,g))}) translate(${-poses[i].x} -462)`);});};
    }},
    {id:'shell',name:'Shell fan',description:'A fan shell draws itself rib by rib, leaving pale water between the lines.',build(){
      const outline='M301 451Q287 433 268 444L207 320Q201 306 221 300Q220 276 243 275Q252 254 274 264Q289 244 307 259Q327 244 344 260Q365 252 380 274Q407 271 410 296Q435 304 426 324L366 444Q346 433 337 451Z';
      let ribs='';for(let i=0;i<11;i++){const x=224+i*18.6,y=290-28*Math.sin(i/10*Math.PI);ribs+=line(`M320 439Q${f(320+(x-320)*.58)} 351 ${f(x)} ${f(y)}`,'data-stroke opacity=".65"');}
      const svg=mount('Shell fan','A delicate fan shell reveals fine radial ribs and a pale blue-green interior.',`${path(outline,'#f5f4ed','data-stroke')}<g clip-path="url(#nature-shell-clip)"><path data-shell-water fill="#dfebe6"/>${ribs}</g>${line('M292 467Q320 471 348 467','opacity=".25"')}`,`<clipPath id="nature-shell-clip"><path d="${outline}"/></clipPath>`);
      const lines=strokes(svg),sea=svg.querySelector('[data-shell-water]');
      return(t,still)=>{reveal(lines,t,1.8);sea.setAttribute('d',water(376-20*grow(t,.6,2),still?0:t,4,197,437)+'L437 461H197Z');};
    }},
    {id:'cove',name:'Quiet cove',description:'One seabird crosses a spare headland, with two almost-whispered waves below.',build(){
      const svg=mount('Quiet cove','A seabird glides over a simple coastal headland and two fine wave lines.',`${path('M171 442L207 391 236 375 259 340 279 347 302 327 332 350 350 409 373 441Z','#f0f1e9','data-stroke')}${line('M207 391l29-16 13 4M329 352l-10 41 13 22','opacity=".3"')}<path data-cove-water fill="none" stroke="#88a39b" stroke-width="1.2"/><path data-cove-water fill="none" stroke="#b4c5bd" stroke-width="1"/><g data-bird>${line('M-29 0Q-11 -11 0 0Q12 -11 29 0','data-wing')}</g>`);
      const lines=strokes(svg),bird=svg.querySelector('[data-bird]'),wing=svg.querySelector('[data-wing]'),waves=[...svg.querySelectorAll('[data-cove-water]')];
      return(t,still)=>{reveal(lines,t,2);const time=still?3:t;bird.setAttribute('transform',`translate(${f(342+42*Math.sin(time*.34))} ${f(259+4*Math.sin(time*.6))})`);const lift=still?-10:-10-3*Math.sin(t*1.2);wing.setAttribute('d',`M-29 ${f(lift*.25)}Q-11 ${f(lift)} 0 0Q12 ${f(lift)} 29 ${f(lift*.25)}`);waves.forEach((node,i)=>node.setAttribute('d',water(445+i*19,time+i,2.5,347,485)));};
    }},
    {id:'forest',name:'Forest light',description:'Leaf shadows make a small clearing. A few flecks of light drift through it.',build(){
      let leaves='';for(let i=0;i<8;i++){const x=221+i*20,y=239+i*12,side=i%2?-1:1;leaves+=`<g data-forest-leaf="${i}">${path(`M${x} ${y}Q${x+side*48} ${y-45} ${x+side*55} ${y-7}Q${x+side*35} ${y+15} ${x} ${y}Z`,'#e4ece3')}${line(`M${x} ${y}l${side*42} -8`,'stroke-width=".8" opacity=".4"')}</g>`;}
      const svg=mount('Forest light','A fine leafy branch borders a quiet circular clearing with drifting light.',`<circle cx="328" cy="335" r="109" fill="#f4f4eb"/><g clip-path="url(#nature-forest-clip)"><path d="M228 210 354 450M277 197 402 449" stroke="#fff" stroke-width="14" opacity=".6"/><g data-motes>${[0,1,2,3,4].map((_,i)=>`<circle cx="${285+i*19}" cy="${317+(i%3)*29}" r="${i%2?1.4:2}" fill="#9cb0a0" opacity=".55"/>`).join('')}</g></g><g data-branch>${line('M204 220Q284 263 375 330','data-stroke')}${leaves}</g>`, '<clipPath id="nature-forest-clip"><circle cx="328" cy="335" r="109"/></clipPath>');
      const lines=strokes(svg),branch=svg.querySelector('[data-branch]'),nodes=[...svg.querySelectorAll('[data-forest-leaf]')],motes=svg.querySelector('[data-motes]');
      return(t,still)=>{reveal(lines,t,2.3);branch.setAttribute('transform',`rotate(${still?0:f(Math.sin(t*.6)*.8)} 204 220)`);nodes.forEach((node,i)=>node.setAttribute('opacity',grow(t,.3+i*.12,1.2)));motes.setAttribute('transform',`translate(${still?0:f(Math.sin(t*.4)*5)} ${still?0:f(-6*Math.sin(t*.4))})`);};
    }}
  ];
  let selected=studies[0],update,art,frameID,lastTime,elapsed=0,paused=false,inView=false,menuBlocked=false;
  const cancel = () => {cancelAnimationFrame(frameID);frameID=undefined;lastTime=undefined;};
  const render = () => {
    const still=preference.matches,t=still?3.7:elapsed%8000/1000;
    update(t,still);
    art.setAttribute('opacity',still?1:f(smooth(t/.55)*smooth((8-t)/.7)));
    stage.dataset.phase=f(t);stage.dataset.study=selected.id;
  };
  const tick = time => {if(lastTime!==undefined)elapsed+=Math.min(time-lastTime,100);lastTime=time;render();frameID=requestAnimationFrame(tick);};
  const sync = () => {cancel();pause.hidden=preference.matches;replay.hidden=preference.matches;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));render();if(inView&&!paused&&!preference.matches&&!document.hidden&&!menuBlocked)frameID=requestAnimationFrame(tick);};
  const choose = study => {
    cancel();selected=study;elapsed=paused?3700:0;update=study.build();art=stage.querySelector('[data-nature-art]');
    section.querySelector('[data-nature-title]').textContent=study.name;
    section.querySelector('[data-nature-description]').textContent=study.description;
    choices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.natureStudy===study.id)));
    sync();
  };
  choices.forEach(button=>button.addEventListener('click',()=>choose(studies.find(study=>study.id===button.dataset.natureStudy))));
  pause.addEventListener('click',()=>{paused=!paused;sync();});
  replay.addEventListener('click',()=>{elapsed=0;paused=false;sync();});
  choose(selected);section.querySelector('.brand-nature__enhancement').hidden=false;
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.08}).observe(stage);
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  document.addEventListener('hoea:site-menu',event=>{menuBlocked=event.detail.open;sync();});
  addEventListener('pagehide',cancel);addEventListener('pageshow',sync);
})();
