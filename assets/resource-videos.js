(() => {
  const players=[...document.querySelectorAll('[data-resource-video]')].map(frame=>({frame,cover:frame.querySelector('.resource-song-cover')}));
  players.forEach(({frame,cover})=>{
    if(!cover||!/^[-\w]{11}$/.test(frame.dataset.resourceVideo))return;
    cover.setAttribute('role','button');
    cover.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();cover.click();}});
    cover.addEventListener('click',event=>{
      if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      // Unload the previous player so two songs cannot play over each other.
      players.forEach(other=>{if(other.frame!==frame&&other.frame.querySelector('iframe')){other.frame.replaceChildren(other.cover);delete other.frame.dataset.videoState;}});
      const player=document.createElement('iframe');
      const source=new URL(`https://www.youtube-nocookie.com/embed/${frame.dataset.resourceVideo}`);
      source.search=new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0'});
      player.src=source.href;player.title=frame.dataset.videoTitle;
      player.width='560';player.height='315';player.referrerPolicy='strict-origin-when-cross-origin';
      player.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      player.allowFullscreen=true;
      frame.replaceChildren(player);frame.dataset.videoState='player';player.focus();
    });
  });
})();
