/* Lightweight language links. No translation scripts or requests until a visitor chooses. */
(() => {
  if(document.querySelector('.language-launch'))return;
  const languages=[['en','English','English'],['mi','Te reo Māori','Māori'],['sm','Gagana Sāmoa','Samoan'],['zh-CN','普通话','Mandarin Chinese'],['hi','हिन्दी','Hindi'],['tl','Tagalog','Filipino'],['yue','廣東話','Cantonese'],['fr','Français','French'],['pa','ਪੰਜਾਬੀ','Punjabi'],['af','Afrikaans','Afrikaans']];
  const globe='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></svg>';
  const launch=document.createElement('button');launch.className='language-launch';launch.type='button';launch.title='Choose a language';launch.innerHTML=globe;launch.setAttribute('aria-label','Language: English. Choose a language');launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','language-panel');
  const panel=document.createElement('section');panel.id='language-panel';panel.className='language-panel';panel.setAttribute('popover','manual');panel.setAttribute('aria-labelledby','language-title');
  let path=location.pathname.replace(/^\/hoea_to_waka(?=\/|$)/,'');
  const publicURL='https://dottereldesign.github.io/hoea_to_waka'+(path.startsWith('/')?path:'/'+path)+location.hash;
  panel.innerHTML='<div class="language-content"><h2 id="language-title">Choose a language</h2><p>Read in the language you prefer.</p><nav aria-label="Page language">'+languages.map(([code,native,name])=>{
    const href=code==='en'?location.href:'https://translate.google.com/translate?sl=en&tl='+encodeURIComponent(code)+'&u='+encodeURIComponent(publicURL);
    return `<a href="${href}" ${code==='en'?'aria-current="true"':'target="_blank" rel="noopener noreferrer"'} data-language="${code}"><span lang="${code}">${native}</span><small>${code==='en'?'Original · ✓':name+' ↗'}</small></a>`;
  }).join('')+'</nav><p class="language-note">Other languages open in Google Translate.<br>Automatic translations may contain errors.</p></div><button type="button" class="language-close" aria-label="Close language menu">'+globe+'</button>';
  document.body.append(launch,panel);
  const content=panel.querySelector('.language-content'),close=panel.querySelector('.language-close'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  close.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  let opened=false,morph=null,sequence=0;
  function hide(restore=false){
    if(!opened)return;opened=false;const id=++sequence;launch.setAttribute('aria-expanded','false');content.classList.remove('is-revealed');
    const finish=()=>{if(id!==sequence||opened)return;panel.hidePopover();launch.style.visibility='';if(restore)launch.focus({preventScroll:true});};
    if(reduce.matches||!morph){finish();return;}
    morph.reverse();morph.finished.then(finish).catch(()=>{});
  }
  function show(){
    if(opened)return;opened=true;sequence++;launch.setAttribute('aria-expanded','true');launch.style.visibility='hidden';
    if(!panel.matches(':popover-open')){
      panel.showPopover();const r=panel.getBoundingClientRect();
      const circle=`inset(${r.height-48}px ${r.width-48}px 0px 0px round 24px)`;
      morph=panel.animate([{clipPath:circle},{clipPath:'inset(0px 0px 0px 0px round 24px)'}],{duration:reduce.matches?1:540,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    }else if(morph){morph.playbackRate=1;morph.play();}
    requestAnimationFrame(()=>{if(opened)content.classList.add('is-revealed');});panel.querySelector('a').focus({preventScroll:true});
  }
  launch.addEventListener('click',show);close.addEventListener('click',()=>hide(true));
  panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{if(a.dataset.language==='en')e.preventDefault();hide(true);}));
  document.addEventListener('pointerdown',e=>{if(opened&&!panel.contains(e.target)&&!launch.contains(e.target))hide();});
  document.addEventListener('keydown',e=>{
    if(!opened)return;
    if(e.key==='Escape'){e.preventDefault();hide(true);return;}
    const links=[...panel.querySelectorAll('a')],index=links.indexOf(document.activeElement);
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&panel.contains(document.activeElement)){
      e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?links.length-1:e.key==='ArrowDown'?(index+1)%links.length:(index-1+links.length)%links.length;links[next].focus();
    }
  });
  document.addEventListener('focusin',e=>{if(opened&&!panel.contains(e.target)&&e.target!==launch)hide();});
  addEventListener('resize',()=>hide());
})();
