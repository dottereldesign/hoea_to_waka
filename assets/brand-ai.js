(() => {
  const section = document.querySelector('[data-brand-context]');
  if (!section) return;
  const scriptURL = document.currentScript.src;
  const url = file => new URL('../about/brand-guidelines/' + file, scriptURL).href;
  const providers = {
    generic: {name: 'your AI', file: 'brand-context.md'},
    chatgpt: {name: 'ChatGPT', href: 'https://chatgpt.com/', file: 'brand-context.md'},
    claude: {name: 'Claude', href: 'https://claude.ai/new', file: 'brand-context.md'},
    gemini: {name: 'Gemini', href: 'https://gemini.google.com/app', file: 'brand-context.md'},
    deepseek: {name: 'DeepSeek', href: 'https://chat.deepseek.com/', file: 'brand-context.md'},
    figma: {name: 'Figma Make', href: 'https://www.figma.com/make/', file: 'figma-context.md'}
  };
  const cache = new Map();
  const getContext = file => {
    if (!cache.has(file)) {
      const pending = fetch(url(file)).then(response => {
        if (!response.ok) throw Error('Brand context could not be loaded');
        return response.text();
      }).catch(error => {cache.delete(file);throw error;});
      cache.set(file, pending);
    }
    return cache.get(file);
  };
  const feedback = section.querySelector('.brand-ai__feedback');
  const status = section.querySelector('.brand-ai__status');
  const opener = section.querySelector('.brand-ai__open');
  const manual = section.querySelector('.brand-ai__manual');
  const textarea = manual.querySelector('textarea');
  const dismiss = section.querySelector('.brand-ai__dismiss');
  const buttons = [...section.querySelectorAll('[data-ai-provider]')];
  const actions = section.querySelector('.brand-ai__actions');
  const placeFeedback = () => {
    if (feedback.hidden) return;
    const bounds = actions.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) {close();return;}
    const height = feedback.offsetHeight;
    const below = bounds.bottom + 18;
    const preferred = below + height <= innerHeight - 16 ? below : bounds.top - height - 14;
    const top = Math.max(16, Math.min(preferred, innerHeight - height - 16));
    feedback.style.top = `${top - bounds.top}px`;
  };
  addEventListener('resize', placeFeedback, {passive:true});
  addEventListener('scroll', placeFeedback, {passive:true});
  const files = section.querySelector('details');
  let activeButton;
  let busy = false;
  const close = (restore = false) => {
    feedback.hidden = true;
    buttons.forEach(button => button.removeAttribute('aria-pressed'));
    if (restore) activeButton?.focus({preventScroll: true});
  };
  const message = (heading, body) => {
    const title = document.createElement('strong');
    title.textContent = heading;
    status.replaceChildren(title, document.createTextNode(body));
  };
  const copyText = async text => {
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const previous = document.activeElement;
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('aria-label', 'Brand context');
      fallback.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
      section.append(fallback);
      fallback.select();
      let copied = false;
      try {copied = document.execCommand('copy');} catch {}
      fallback.remove();
      previous?.focus({preventScroll: true});
      return copied;
    }
  };
  buttons.forEach(button => {
    button.addEventListener('pointerenter', () => getContext(providers[button.dataset.aiProvider].file).catch(() => {}), {once:true});
    button.addEventListener('focus', () => getContext(providers[button.dataset.aiProvider].file).catch(() => {}));
    button.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      activeButton = button;
      const provider = providers[button.dataset.aiProvider];
      button.setAttribute('aria-busy', 'true');
      feedback.hidden = false;
      manual.hidden = true;
      opener.hidden = true;
      message('Preparing your brand context…', 'Collecting the published guide and design tokens.');
      placeFeedback();
      try {
        const context = await getContext(provider.file);
        const copied = await copyText(context);
        close();
        files.open = false;
        feedback.hidden = false;
        button.setAttribute('aria-pressed', 'true');
        manual.hidden = copied;
        opener.hidden = !provider.href;
        if (provider.href) {opener.href = provider.href;opener.textContent = `Open ${provider.name} ↗`;}
        if (copied) {
          message(`Copied${provider.href ? ' for ' + provider.name : ' — full brand context'}.`, provider.href ? `Open ${provider.name}, paste into a new ${provider.name === 'Figma Make' ? 'prompt' : 'chat'}, then describe what you want to create.` : 'Paste into your AI or design brief, then describe what you want to create.');
        } else {
          message('Copy the context below.', `Automatic copying is unavailable. Select and copy this text, then paste it into ${provider.name}.`);
          textarea.value = context;
          placeFeedback();
          textarea.focus({preventScroll: true});
          textarea.select();
        }
      } catch {
        feedback.hidden = false;
        manual.hidden = true;
        opener.hidden = true;
        message('The context could not be loaded.', 'Try again, or open Files & details to download the brand context.');
      } finally {
        placeFeedback();
        busy = false;
        button.removeAttribute('aria-busy');
      }
    });
  });
  dismiss.addEventListener('click', () => close(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (!feedback.hidden || files.open)) {
      event.preventDefault();
      if (!feedback.hidden) close(true);
      if (files.open) {files.open = false;files.querySelector('summary').focus({preventScroll: true});}
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!section.contains(event.target)) {close();files.open = false;}
  });
  files.addEventListener('toggle', () => {if (files.open) close();});
  section.querySelector('.brand-ai__copy').hidden = false;
  section.querySelector('.brand-ai__providers').hidden = false;
  section.querySelector('.brand-ai__hint').hidden = false;
})();
