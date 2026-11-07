(()=>{
 const notice=document.querySelector('[data-book-notice]');if(!notice)return;
 const notify=()=>{
  if(!document.querySelector('[data-header-bound]'))document.body.style.setProperty('--book-notice-offset',Math.max(0,notice.getBoundingClientRect().bottom)+'px');
  document.dispatchEvent(new CustomEvent('hoea:notice-change'));
 };
 const close=notice.querySelector('button');
 const options=document.createElement('div');options.className='notice-style-options';options.setAttribute('role','group');options.setAttribute('aria-label','Compare announcement styles');
 const names=['Lavender · inline','Paper · outlined','Ink · spotlight','Blue · contrast','Blush · capsule'];
 options.innerHTML='<span>Alert styles</span>'+names.map((name,i)=>'<button type="button" data-notice-style="'+(i+1)+'" aria-label="Style '+(i+1)+': '+name+'" title="'+name+'">0'+(i+1)+'</button>').join('');
 document.body.append(options);
 const select=value=>{notice.dataset.noticeStyle=value;options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.noticeStyle===value)));try{sessionStorage.setItem('hoea-notice-style',value);}catch{}};
 let initial='1';try{const saved=sessionStorage.getItem('hoea-notice-style');if(/^[1-5]$/.test(saved))initial=saved;}catch{}
 select(initial);options.addEventListener('click',event=>{const button=event.target.closest('[data-notice-style]');if(button)select(button.dataset.noticeStyle);});
 notify();new ResizeObserver(notify).observe(notice);
 close.addEventListener('click',()=>{notice.hidden=true;options.remove();notify();document.querySelector('.site-header a')?.focus({preventScroll:true});});
})();
