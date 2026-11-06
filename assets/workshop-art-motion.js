(() => {
 const section=document.querySelector('#workshop-support');if(!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[...section.querySelectorAll('[data-art]')].map(host=>{
  const svg=host.querySelector('svg'),kind=host.dataset.art,part=name=>svg.querySelector(`[data-part="${name}"]`);
  const scene={host,svg,kind,part,visible:false,option:kind==='bloom'?5:4,animations:[],timer:0,played:false};
  if(kind==='bloom'){
   const flowers=part('cream-flowers'),centres=flowers.nextElementSibling;
   // Keep the gold centres attached while the cream petals bloom and sway.
   if(centres?.tagName.toLowerCase()==='g'&&!centres.dataset.part)flowers.append(centres);
  }
  // Wrap each person with their piece and hands so the grip never separates.
  if(kind==='puzzle'){
   scene.clusters=[['upper-left-person','coral-piece','upper-left-hand'],['upper-right-person','sage-piece','upper-right-hand'],['lower-left-person','plum-piece','lower-left-hand'],['lower-right-rear-arm','peach-piece','lower-right-person']].map((parts,i)=>{
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.dataset.cluster=String(i);const nodes=parts.map(part);nodes[0].before(g);nodes.forEach(n=>g.append(n));return g;
   });
  }
  host.dataset.animation=kind==='bloom'?'05':'04';
  return scene;
 });
 function stop(s){clearTimeout(s.timer);s.animations.forEach(a=>a.cancel());s.animations=[];}
 function active(s){return s.host.closest('.workshop-slide').classList.contains('is-active');}
 function animate(s,el,frames,duration=2400,delay=0,origin='724px 543px'){
  if(!el)return;el.style.transformBox='view-box';el.style.transformOrigin=origin;
  const a=el.animate(frames,{duration,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});s.animations.push(a);
 }
 const T=(transform,opacity=1)=>({transform,opacity});
 function run(s,delay=0){
  stop(s);if(reduced.matches||document.hidden||!s.visible||!active(s))return;
  s.timer=setTimeout(()=>{
   if(!active(s)||!s.visible||document.hidden||reduced.matches)return;
   s.played=true;s.host.dataset.motionRun=String(Number(s.host.dataset.motionRun||0)+1);
   if(s.kind==='bloom')bloom(s);else puzzle(s);
  },delay);
 }
 function bloom(s){
  const p=s.part,leaves=[...p('leaves').children],stems=[...p('stems').children],petals=[...p('falling-petals').children];
  const bells=[p('left-bell'),p('right-bell'),p('cream-flowers')];
  switch(s.option){
   case 1: // Draw the stems, open the leaves, then let the flowers bloom.
    stems.forEach((stem,i)=>{const length=stem.getTotalLength();animate(s,stem,[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],1500,i*100);});
    leaves.forEach((leaf,i)=>animate(s,leaf,[T('scale(.05,.1)',0),T('scale(1.035,1.02)'),T('scale(1)')],1900,180+Math.floor(i/2)*130,'724px 452px'));
    bells.forEach((bell,i)=>animate(s,bell,[T('scale(.15)',0),T('scale(1.09)'),T('scale(1)')],1700,700+i*170,['445px 235px','1005px 390px','724px 350px'][i]));
    break;
   case 2: // A breeze travels across all the foliage.
    [p('stems'),p('leaves'),...bells].forEach((el,i)=>animate(s,el,[T('rotate(0deg)'),T('rotate(-2.4deg)'),T('rotate(2.1deg)'),T('rotate(-.8deg)'),T('rotate(0deg)')],3600,i*90,'724px 455px'));
    petals.forEach((el,i)=>animate(s,el,[T('translate(0,0) rotate(0deg)'),T(`translate(${18+i%3*9}px,-18px) rotate(9deg)`),T('translate(-10px,8px) rotate(-5deg)'),T('translate(0,0) rotate(0deg)')],3300,i*60));
    break;
   case 3: // Floating petals trace individual loops, then return home.
    petals.forEach((el,i)=>{const b=el.getBBox(),o=`${b.x+b.width/2}px ${b.y+b.height/2}px`,dir=i%2?1:-1;animate(s,el,[T('translate(0,0) rotate(0deg)'),T(`translate(${dir*45}px,-55px) rotate(${dir*45}deg)`),T(`translate(${-dir*22}px,-20px) rotate(${-dir*25}deg)`),T('translate(0,0) rotate(0deg)')],3000+i%3*220,i*80,o);});
    bells.forEach((el,i)=>animate(s,el,[T('scale(1)'),T('scale(1.045)'),T('scale(1)')],2800,i*180));break;
   case 4: // Soft pulses flow from roots to leaves to flowers.
    [p('profile-shapes'),p('stems'),p('leaves'),...bells,p('falling-petals')].forEach((el,i)=>animate(s,el,[T('scale(1)'),T('scale(1.035)'),T('scale(.99)'),T('scale(1)')],1850,i*210,i===0?'724px 900px':'724px 455px'));break;
   case 5: // Layered assembly: profile rises, greenery fans out, petals arrive.
    animate(s,p('profile-shapes'),[T('translateY(65px)',0),T('translateY(0)')],1500);
    animate(s,p('stems'),[T('scaleY(.1)',0),T('scaleY(1)')],1700,200,'724px 459px');
    animate(s,p('leaves'),[T('scale(.2) rotate(-14deg)',0),T('scale(1) rotate(0deg)')],1900,350,'724px 459px');
    bells.forEach((el,i)=>animate(s,el,[T(`translate(${i===0?-80:80}px,-40px) scale(.65)`,0),T('translate(0,0) scale(1)')],1800,600+i*120));
    petals.forEach((el,i)=>animate(s,el,[T(`translate(${i%2?60:-60}px,55px)`,0),T('translate(0,0)')],1600,850+i*70));break;
  }
 }
 function puzzle(s){
  const origins=['350px 330px','1110px 330px','340px 800px','1110px 800px'];
  s.clusters.forEach((g,i)=>{
   const x=i%2?1:-1,y=i<2?-1:1,o=origins[i];
   switch(s.option){
    case 1:animate(s,g,[T(`translate(${x*135}px,${y*100}px)`,0),T(`translate(${-x*8}px,${-y*6}px)`),T('translate(0,0)')],2300,i*130,o);break;
    case 2:animate(s,g,[T('translateY(0) rotate(0deg)'),T(`translateY(-25px) rotate(${x*2}deg)`),T('translateY(0) rotate(0deg)')],1700,[0,350,1050,700][i],o);break;
    case 3:animate(s,g,[T('scale(1)'),T('scale(1.035)'),T('scale(1)'),T('scale(1.02)'),T('scale(1)')],3400,0,o);break;
    case 4:animate(s,g,[T(`translate(${x*35}px,${y*25}px) rotate(${x*7}deg) scale(.91)`,.3),T(`rotate(${-x}deg) scale(1.01)`),T('translate(0,0) rotate(0deg) scale(1)')],2400,i*220,o);break;
    case 5:animate(s,g,[{filter:'saturate(.25)',opacity:.55},{filter:'saturate(1.2)',opacity:1},{filter:'saturate(1)',opacity:1}],2000,[0,400,1200,800][i],o);break;
   }
  });
 }
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=scenes.find(s=>s.host===e.target);const was=s.visible;s.visible=e.isIntersecting&&e.intersectionRatio>=.12;if(s.visible&&!was)run(s);else if(!s.visible){stop(s);s.played=false;}}},{threshold:[0,.12]});
 scenes.forEach(s=>observer.observe(s.host));
 section.addEventListener('workshop:slidechange',e=>scenes.forEach(s=>{if(active(s))run(s,e.detail.changed?720:0);else{stop(s);s.played=false;}}));
 document.addEventListener('visibilitychange',()=>scenes.forEach(s=>{if(document.hidden)stop(s);else run(s);}));
 reduced.addEventListener('change',()=>scenes.forEach(s=>{if(reduced.matches)stop(s);else run(s);}));
})();
