// Native details remain usable without JavaScript; enhance only the homepage FAQ.
export function setupHomeFaq(section) {
  if (!section) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finishers = [];
  section.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.ds-answer');
    let expanded = details.open;
    let heightAnimation, opacityAnimation;
    const finish = () => {
      heightAnimation?.cancel();opacityAnimation?.cancel();
      heightAnimation = opacityAnimation = null;
      details.open = expanded;
      details.style.removeProperty('overflow');
      details.classList.remove('is-closing');
    };
    finishers.push(finish);
    summary.addEventListener('click', event => {
      event.preventDefault();
      const fromHeight = details.getBoundingClientRect().height;
      const fromOpacity = details.open ? Number(getComputedStyle(answer).opacity) : 0;
      expanded = !expanded;
      heightAnimation?.cancel();opacityAnimation?.cancel();
      if (preference.matches || !details.animate) { finish();return; }
      details.open = true;
      details.classList.toggle('is-closing', !expanded);
      const border = parseFloat(getComputedStyle(details).borderBottomWidth) + parseFloat(getComputedStyle(details).borderTopWidth);
      const targetHeight = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
      details.style.overflow = 'hidden';
      const timing = {duration: expanded ? 420 : 340, easing: expanded ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.2,1)', fill:'both'};
      heightAnimation = details.animate({height:[fromHeight+'px',targetHeight+'px']},timing);
      opacityAnimation = answer.animate({opacity:[fromOpacity,expanded?1:0]},timing);
      heightAnimation.onfinish = finish;
    });
  });
  // Natural height is restored if text reflows or the visitor disables motion.
  window.addEventListener('resize', () => finishers.forEach(finish=>finish()), {passive:true});
  preference.addEventListener('change', () => {if(preference.matches)finishers.forEach(finish=>finish());});
}
