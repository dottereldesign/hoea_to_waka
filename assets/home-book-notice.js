(()=>{
 const notice=document.querySelector('[data-book-notice]');if(!notice)return;
 const notify=()=>{
  if(!document.querySelector('[data-header-bound]'))document.body.style.setProperty('--book-notice-offset',Math.max(0,notice.getBoundingClientRect().bottom)+'px');
  document.dispatchEvent(new CustomEvent('hoea:notice-change'));
 };
 notify();new ResizeObserver(notify).observe(notice);
 notice.querySelector('button').addEventListener('click',()=>{notice.hidden=true;notify();document.querySelector('.site-header a')?.focus({preventScroll:true});});
})();
