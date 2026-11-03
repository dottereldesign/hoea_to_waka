/* In-place whole-site language selection. The English source remains the default. */
(() => {
  if(document.querySelector('.language-launch'))return;
  const i18n=window.hoeaI18n;
  if(!i18n)return;
  const languages=[['en','English','English'],['mi','Te reo Māori','Māori'],['sm','Gagana Sāmoa','Samoan'],['zh-CN','普通话','Mandarin Chinese'],['hi','हिन्दी','Hindi'],['tl','Tagalog','Filipino'],['yue','廣東話','Cantonese'],['fr','Français','French'],['pa','ਪੰਜਾਬੀ','Punjabi'],['af','Afrikaans','Afrikaans']];
  const flagCountries={en:'nz',mi:'nz',sm:'ws','zh-CN':'cn',hi:'in',tl:'ph',yue:'hk',fr:'fr',pa:'in',af:'za'};
  const flagBase=new URL('language-flags/',document.currentScript.src);
  const flag=document.createElement('img');flag.className='language-launch__flag';flag.width=28;flag.height=21;flag.alt='';flag.setAttribute('aria-hidden','true');flag.src=new URL('nz.svg',flagBase).href;
  const launch=document.createElement('button');launch.className='language-launch';launch.type='button';launch.title='English · Choose a language';launch.setAttribute('translate','no');launch.append(flag);launch.setAttribute('aria-label','Language: English. Choose a language');launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','language-panel');
  const panel=document.createElement('section');panel.id='language-panel';panel.className='language-panel';panel.setAttribute('popover','manual');panel.setAttribute('aria-labelledby','language-title');
  panel.classList.add('notranslate');panel.setAttribute('translate','no');
  panel.innerHTML='<div class="language-content"><h2 id="language-title"></h2><p data-language-intro></p><nav aria-label="Language">'+languages.map(([code,native,name])=>{
    const url=new URL(location.href);if(code==='en')url.searchParams.delete('lang');else url.searchParams.set('lang',code);
    return `<a href="${url.href}" ${code==='en'?'aria-current="true"':''} data-language="${code}"><span lang="${code}">${native}</span><small>${name}</small></a>`;
  }).join('')+'</nav><p class="language-note"></p></div><button type="button" class="language-close"></button>';
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
  const status=document.createElement('div');status.className='language-status notranslate';status.setAttribute('translate','no');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;document.body.append(status);
  function updateLanguage({locale,requested,state}){
    const labels=i18n.copy[state==='loading'?requested:locale]||i18n.copy.en;
    panel.querySelector('nav').setAttribute('aria-label',labels[0]);panel.querySelector('h2').textContent=labels[0];panel.querySelector('[data-language-intro]').textContent=labels[1];panel.querySelector('.language-note').textContent=labels[2];close.setAttribute('aria-label',labels[4]);
    const current=languages.find(row=>row[0]===locale)||languages[0];launch.setAttribute('aria-label',`${labels[0]}: ${current[1]}`);launch.title=`${current[1]} · ${labels[0]}`;
    const country=flagCountries[locale]||'nz';if(launch.dataset.flag!==country){launch.dataset.flag=country;flag.src=new URL(country+'.svg',flagBase).href;}
    launch.setAttribute('aria-busy',String(state==='loading'));
    panel.querySelectorAll('[data-language]').forEach(link=>{
      const code=link.dataset.language,row=languages.find(row=>row[0]===code);link.toggleAttribute('aria-current',code===locale);if(code===locale)link.setAttribute('aria-current','true');
      link.querySelector('small').textContent=(code==='en'?labels[3]:row[2])+(code===locale?' · ✓':'');
    });
    status.classList.toggle('is-loading',state==='loading');
    if(state==='loading'){status.hidden=false;status.textContent=labels[5];}
    else if(state==='error'){status.hidden=false;status.textContent=(i18n.copy[requested]||labels)[6];}
    else{status.hidden=true;status.textContent='';}
  }
  i18n.subscribe(updateLanguage);updateLanguage({locale:i18n.locale,requested:i18n.requested,state:'ready'});
  launch.addEventListener('click',show);close.addEventListener('click',()=>hide(true));
  panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();hide(true);i18n.setLocale(a.dataset.language);}));
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
