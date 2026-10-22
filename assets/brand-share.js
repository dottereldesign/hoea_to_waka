(() => {
  const trigger = document.querySelector('#brand-share-trigger');
  const panel = document.querySelector('#brand-share-panel');
  if (!trigger || !panel || !panel.showPopover) return;
  const url = panel.querySelector('#brand-share-url').value;
  const data = {title:'Hoea tō Waka — Brand guidelines',text:'Explore the Hoea tō Waka brand guidelines.',url};
  const closeButton = panel.querySelector('.brand-share__close');
  const copyButton = panel.querySelector('.brand-share__copy');
  const input = panel.querySelector('input');
  const status = panel.querySelector('.brand-share__status');
  const native = panel.querySelector('[data-share-native]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let open = false, hiding, opening, positioning;
  panel.querySelector('[data-share-email]').href = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent('Here are the brand guidelines for Hoea tō Waka:\n\n'+url)}`;
  panel.querySelector('[data-share-whatsapp]').href = `https://wa.me/?text=${encodeURIComponent(data.title+'\n'+url)}`;
  panel.querySelector('[data-share-linkedin]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  trigger.setAttribute('role','button');
  trigger.setAttribute('aria-label','Share brand guidelines');
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-controls',panel.id);
  trigger.setAttribute('aria-expanded','false');
  const place = () => {
    if (!panel.matches(':popover-open')) return;
    const bounds = trigger.getBoundingClientRect();
    const width = Math.min(360,document.documentElement.clientWidth-32);
    panel.style.width = `${width}px`;
    const height = panel.offsetHeight;
    const left = Math.max(16,Math.min(bounds.left,document.documentElement.clientWidth-width-16));
    const top = Math.max(16,Math.min(bounds.top,innerHeight-height-16));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    const values = {left:bounds.left-left,top:bounds.top-top,right:width-bounds.width-(bounds.left-left),bottom:height-bounds.height-(bounds.top-top),width:bounds.width,height:bounds.height};
    for (const [key,value] of Object.entries(values)) panel.style.setProperty(`--share-${key}`,`${Math.max(0,value)}px`);
  };
  const announce = text => {status.textContent=text;place();};
  const hide = () => {if (!open && panel.matches(':popover-open')) panel.hidePopover();};
  const close = (restore=false) => {
    if (!open) return;
    open = false;
    cancelAnimationFrame(opening);
    panel.dataset.open = 'false';
    trigger.setAttribute('aria-expanded','false');
    panel.inert = true;
    clearTimeout(hiding);
    if (reduced.matches) hide();else hiding = setTimeout(hide,660);
    if (restore) trigger.focus({preventScroll:true});
  };
  const show = () => {
    clearTimeout(hiding);
    open = true;
    panel.inert = false;
    if (!panel.matches(':popover-open')) {
      panel.dataset.open = 'false';
      panel.querySelector('.brand-share__content').scrollTop=0;
      copyButton.querySelector('span').textContent='Copy';
      status.textContent='';
      input.scrollLeft=0;
      panel.showPopover();
      place();
      getComputedStyle(panel).clipPath;
      opening = requestAnimationFrame(() => {if (open) panel.dataset.open = 'true';});
    } else {panel.dataset.open = 'true';place();}
    trigger.setAttribute('aria-expanded','true');
    closeButton.focus({preventScroll:true});
  };
  trigger.addEventListener('click',event => {event.preventDefault();open?close(true):show();});
  trigger.addEventListener('keydown',event => {if(event.key===' '){event.preventDefault();trigger.click();}});
  closeButton.addEventListener('click',()=>close(true));
  panel.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||!open)return;
    const controls=[...panel.querySelectorAll('button:not([disabled]),a[href],input')].filter(element=>element.getClientRects().length&&!element.hidden);
    if((event.shiftKey&&document.activeElement===controls[0])||(!event.shiftKey&&document.activeElement===controls.at(-1))){
      event.preventDefault();close(true);
    }
  });
  panel.addEventListener('transitionend',event=>{if(event.target===panel&&event.propertyName==='clip-path')hide();});
  document.addEventListener('pointerdown',event=>{if(open&&!panel.contains(event.target)&&!trigger.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open){event.preventDefault();close(true);}});
  panel.addEventListener('focusout',event=>{if(open&&event.relatedTarget&&!panel.contains(event.relatedTarget)&&event.relatedTarget!==trigger)close();});
  const onViewport = () => {
    if (!open || positioning) return;
    positioning = requestAnimationFrame(()=>{
      positioning = 0;
      const bounds=trigger.getBoundingClientRect();
      if(bounds.bottom<0||bounds.top>innerHeight)close();else place();
    });
  };
  addEventListener('resize',onViewport,{passive:true});
  addEventListener('scroll',onViewport,{passive:true});
  copyButton.addEventListener('click',async()=>{
    let copied=false;
    try{await navigator.clipboard.writeText(url);copied=true;}
    catch{input.focus({preventScroll:true});input.select();try{copied=document.execCommand('copy');}catch{}}
    copyButton.querySelector('span').textContent=copied?'Copied':'Copy';
    announce(copied?'Link copied. Paste it into a message.':'Select and copy the link above.');
  });
  if(typeof navigator.share==='function'){
    native.hidden=false;
    panel.style.setProperty('--share-option-count','4');
    native.addEventListener('click',async()=>{
      try{await navigator.share(data);announce('You can also copy the link or scan the code.');}
      catch(error){announce(error.name==='AbortError'?'Share cancelled. You can try another option.':'Device sharing is unavailable. Copy the link or choose another option.');}
    });
  }
})();
