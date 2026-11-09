(() => {
  const root=document.querySelector('.concepts-main');if(!root)return;
  const cards=[...root.querySelectorAll('.concept-card')],search=root.querySelector('#concept-search'),status=root.querySelector('#concept-copy-status');
  let chapter='all',kind='all',timer;
  const update=()=>{
    const term=search.value.trim().toLowerCase();let total=0;
    cards.forEach(card=>{const match=(chapter==='all'||card.dataset.chapter===chapter)&&(kind==='all'||card.dataset.kind===kind)&&card.textContent.toLowerCase().includes(term);card.hidden=!match;if(match)total++;});
    root.querySelector('#concept-count').textContent=`${total} ${total===1?'idea':'ideas'}`;root.querySelector('#concept-empty').hidden=total>0;
    root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===chapter)));
    root.querySelectorAll('[data-kind-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kindFilter===kind)));
  };
  root.querySelector('.concept-tools').hidden=false;
  root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{chapter=b.dataset.filter;update();}));
  root.querySelectorAll('[data-kind-filter]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kindFilter;update();}));
  search.addEventListener('input',update);
  const reset=()=>{chapter='all';kind='all';search.value='';update();};
  root.querySelector('#concept-reset').addEventListener('click',reset);
  const revealHash=()=>{const card=cards.find(c=>'#'+c.id===location.hash);if(card){reset();card.scrollIntoView({block:'start'});}};
  window.addEventListener('hashchange',revealHash);
  root.querySelectorAll('[data-show-concept]').forEach(a=>a.addEventListener('click',reset));
  root.querySelectorAll('[data-copy]').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',async()=>{
      const field=document.getElementById(button.dataset.copy);button.disabled=true;
      try{await navigator.clipboard.writeText(field.value);status.textContent='Prompt copied. Ready to paste into your image generator.';}
      catch{field.closest('details').open=true;field.focus();field.select();status.textContent='Clipboard access is unavailable. The prompt is selected—press Ctrl+C or Command+C to copy.';}
      finally{button.disabled=false;status.classList.add('is-visible');clearTimeout(timer);timer=setTimeout(()=>status.classList.remove('is-visible'),5000);}
    });
  });
  revealHash();
})();
