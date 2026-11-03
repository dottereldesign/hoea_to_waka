/* English is the source. Translation runs in-place, only after a visitor chooses it. */
(() => {
  const supported=['en','mi','sm','zh-CN','hi','tl','yue','fr','pa','af'];
  const storageKey='hoea-language';
  const copy={
    en:['Choose a language','Read in the language you prefer.','Automatic translations. English is the original.','Original','Close language menu','Translating…','Translation unavailable. Your original English page is still available.'],
    mi:['Kōwhiria he reo','Pānuihia ki te reo e pai ana ki a koe.','He whakamāoritanga aunoa. Ko te reo Ingarihi te taketake.','Taketake','Katia te tahua reo','E whakamāoritia ana…','Kāore i taea te whakamāori. Kei te wātea tonu te whārangi Ingarihi.'],
    sm:['Filifili se gagana','Faitau i le gagana e te fiafia i ai.','Faaliliuga otometi. O le gagana Peretania o le uluaʻi gagana.','Uluaʻi gagana','Tapuni le lisi o gagana','O loo faaliliu…','E lē o maua le faaliliuga. O loo avanoa pea le itulau Peretania.'],
    'zh-CN':['选择语言','使用您偏好的语言阅读。','自动翻译。原文为英语。','原文','关闭语言菜单','正在翻译…','暂时无法翻译。您仍可阅读英语原文。'],
    hi:['भाषा चुनें','अपनी पसंद की भाषा में पढ़ें।','स्वचालित अनुवाद। मूल भाषा अंग्रेज़ी है।','मूल','भाषा मेनू बंद करें','अनुवाद हो रहा है…','अनुवाद उपलब्ध नहीं है। मूल अंग्रेज़ी पृष्ठ अभी भी उपलब्ध है।'],
    tl:['Pumili ng wika','Magbasa sa wikang gusto mo.','Awtomatikong salin. Ingles ang orihinal.','Orihinal','Isara ang menu ng wika','Isinasalin…','Hindi available ang salin. Maaari mo pa ring basahin ang orihinal na pahinang Ingles.'],
    yue:['揀語言','用你鍾意嘅語言閱讀。','自動翻譯。原文係英文。','原文','關閉語言選單','翻譯緊…','暫時翻譯唔到。你仍然可以閱讀英文原文。'],
    fr:['Choisir une langue','Lisez dans la langue de votre choix.','Traduction automatique. Le texte original est en anglais.','Original','Fermer le menu des langues','Traduction en cours…','Traduction indisponible. La page originale en anglais reste accessible.'],
    pa:['ਭਾਸ਼ਾ ਚੁਣੋ','ਆਪਣੀ ਪਸੰਦ ਦੀ ਭਾਸ਼ਾ ਵਿੱਚ ਪੜ੍ਹੋ।','ਆਟੋਮੈਟਿਕ ਅਨੁਵਾਦ। ਮੂਲ ਭਾਸ਼ਾ ਅੰਗਰੇਜ਼ੀ ਹੈ।','ਮੂਲ','ਭਾਸ਼ਾ ਮੀਨੂ ਬੰਦ ਕਰੋ','ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ…','ਅਨੁਵਾਦ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਮੂਲ ਅੰਗਰੇਜ਼ੀ ਪੰਨਾ ਅਜੇ ਵੀ ਉਪਲਬਧ ਹੈ।'],
    af:["Kies ’n taal",'Lees in die taal wat jy verkies.','Outomatiese vertalings. Engels is die oorspronklike taal.','Oorspronklik','Sluit taalkieslys','Besig om te vertaal…','Vertaling is nie beskikbaar nie. Die oorspronklike Engelse bladsy is steeds beskikbaar.']
  };
  // Keep the scroll-driven heading in native locale copy even when its source is offscreen.
  const animatedHeading=document.querySelector('#anna-story-title'),originalHeading=animatedHeading?.textContent;
  const headingCopy={en:originalHeading,mi:'Tūtaki ki a Anna Brown',sm:'Feiloaʻi iā Anna Brown','zh-CN':'认识 Anna Brown',hi:'Anna Brown से मिलें',tl:'Kilalanin si Anna Brown',yue:'認識 Anna Brown',fr:'Rencontrez Anna Brown',pa:'Anna Brown ਨੂੰ ਮਿਲੋ',af:'Ontmoet Anna Brown'};
  if(animatedHeading){animatedHeading.classList.add('notranslate');animatedHeading.setAttribute('translate','no');}
  const updateFixedCopy=language=>{if(animatedHeading)animatedHeading.textContent=headingCopy[language]||originalHeading;};
  let locale='en',requested='en',loader=null,generation=0,brandObserver=null;
  const listeners=new Set();
  const announce=(state,language=locale)=>{
    if(state!=='loading')updateFixedCopy(locale);
    const detail={locale,requested:language,state};
    document.documentElement.dataset.languageState=state;
    listeners.forEach(listener=>listener(detail));
    dispatchEvent(new CustomEvent('hoea:languagechange',{detail}));
  };
  function restoreEnglish(){try{if(window.__GT?.translator?.libReady)window.__GT.translator.revert();}catch{}}
  function remember(language){
    try{localStorage.setItem(storageKey,language);}catch{}
    const url=new URL(location.href);if(language==='en')url.searchParams.delete('lang');else url.searchParams.set('lang',language);
    history.replaceState(history.state,'',url);
  }
  // Preserve the brand, names, artwork and exact code/token examples in every language.
  const names=/\s*(?:Hoea t[ōo] Waka|My Brother Hemi|Maia Makes Waves)\s*/gi;
  function protectNames(node=document.body){
    if(!node)return;
    if(node.nodeType===1){
      if(node.matches('script,style,code,pre,svg,.notranslate,[translate="no"]'))return;
      if(node.matches('.site-brand,.brand-name-text,.anna-sticky-title')){node.classList.add('notranslate');node.setAttribute('translate','no');
        if(node.matches('.brand-name-text')){
          const before=node.previousSibling,after=node.nextSibling;
          const leading=before?.nodeType===3?before.textContent.match(/\s+$/)?.[0]:'';
          const trailing=after?.nodeType===3?after.textContent.match(/^\s+/)?.[0]:'';
          if(leading){before.textContent=before.textContent.slice(0,-leading.length);node.prepend(document.createTextNode(leading));}
          if(trailing){after.textContent=after.textContent.slice(trailing.length);node.append(document.createTextNode(trailing));}
        }
        return;}
      for(const child of [...node.childNodes])protectNames(child);
    }else if(node.nodeType===3&&node.parentElement&&!node.parentElement.closest('script,style,code,pre,svg,.notranslate,[translate="no"]')){
      const text=node.textContent;names.lastIndex=0;if(!names.test(text))return;names.lastIndex=0;
      const fragment=document.createDocumentFragment();let start=0;
      for(const match of text.matchAll(names)){
        fragment.append(document.createTextNode(text.slice(start,match.index)));
        const span=document.createElement('span');span.className='notranslate';span.setAttribute('translate','no');span.textContent=match[0];fragment.append(span);start=match.index+match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(start)));node.replaceWith(fragment);
    }
  }
  function prepare(){
    protectNames();
    document.querySelectorAll('code,pre,.site-brand,.brand-name-text,.anna-sticky-title').forEach(el=>{el.classList.add('notranslate');el.setAttribute('translate','no');});
    if(!brandObserver){brandObserver=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)protectNames(node);});brandObserver.observe(document.body,{childList:true,subtree:true});}
  }
  function loadEngine(){
    if(window.__GT?.translator?.libReady)return Promise.resolve(window.__GT.translator);
    if(loader)return loader;
    loader=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://cdn.gtranslate.net/widgets/latest/lib.min.js';script.async=true;script.dataset.hoeaTranslationEngine='';
      const timer=setTimeout(()=>reject(new Error('Translation engine timeout')),20000);
      script.onerror=()=>{clearTimeout(timer);script.remove();loader=null;reject(new Error('Translation engine unavailable'));};
      script.onload=()=>{
        const translator=window.__GT?.translator;
        if(!translator){clearTimeout(timer);loader=null;reject(new Error('Translation engine unavailable'));return;}
        const ready=()=>{clearTimeout(timer);resolve(translator);};
        if(translator.libReady)ready();else translator.readyCallback=ready;
      };
      try{localStorage.removeItem('__GT_TRANSLATE_LANGS');}catch{}
      document.head.append(script);
    });
    loader=loader.catch(error=>{loader=null;throw error;});
    return loader;
  }
  async function setLocale(language){
    if(!supported.includes(language))return false;
    if(language===locale&&document.documentElement.dataset.languageState==='ready'){remember(locale);return true;}
    const id=++generation;requested=language;
    if(language==='en'){
      restoreEnglish();
      try{localStorage.removeItem('__GT_TRANSLATE_LANGS');}catch{}
      locale='en';document.documentElement.lang='en-NZ';remember(locale);announce('ready');return true;
    }
    prepare();announce('loading',language);
    try{
      const translator=await loadEngine();if(id!==generation)return false;
      translator.revert();
      await new Promise((resolve,reject)=>{
        if(!translator.translate('en',language)){reject(new Error('Translation unavailable'));return;}
        const deadline=Date.now()+45000;
        const poll=setInterval(()=>{
          if(id!==generation){clearInterval(poll);resolve();}
          else if(translator.error){clearInterval(poll);reject(new Error('Translation unavailable'));}
          else if(translator.finished){clearInterval(poll);resolve();}
          else if(Date.now()>deadline){clearInterval(poll);reject(new Error('Translation timeout'));}
        },100);
      });
      if(id!==generation)return false;
      locale=language;document.documentElement.lang=language;remember(locale);announce('ready');return true;
    }catch(error){
      if(id!==generation)return false;
      restoreEnglish();locale='en';document.documentElement.lang='en-NZ';remember(locale);announce('error',language);return false;
    }
  }
  window.hoeaI18n={supported,copy,setLocale,get locale(){return locale;},get requested(){return requested;},subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}};
  let initial='en';const query=new URL(location.href).searchParams.get('lang');
  try{initial=query||localStorage.getItem(storageKey)||'en';}catch{initial=query||'en';}
  if(!supported.includes(initial))initial='en';
  if(initial==='en'){document.documentElement.dataset.languageState='ready';try{localStorage.removeItem('__GT_TRANSLATE_LANGS');if(query==='en')localStorage.setItem(storageKey,'en');}catch{}}
  // Defer until other page controllers have bound their original English markup.
  if(initial!=='en'){
    const start=()=>{if(generation===0)setLocale(initial);};
    if(document.readyState==='complete')queueMicrotask(start);else addEventListener('load',start,{once:true});
  }
})();
