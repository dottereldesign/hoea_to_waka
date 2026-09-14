import { createElement, ArrowUpRight, ArrowRight, ArrowDown, Menu, X, Sun, Moon, Waves, Compass, MoveUpRight, BookOpen, Users, Heart, Leaf, Layers, SlidersHorizontal, Check, Play, Mail, Phone, MapPin, Plus, Minus, RotateCcw, Sparkles, Pause, Copy, Download, ChevronLeft, ChevronRight } from 'lucide';

const icons = { ArrowUpRight, ArrowRight, ArrowDown, Menu, X, Sun, Moon, Waves, Compass, MoveUpRight, BookOpen, Users, Heart, Leaf, Layers, SlidersHorizontal, Check, Play, Mail, Phone, MapPin, Plus, Minus, RotateCcw, Sparkles, Pause, Copy, Download, ChevronLeft, ChevronRight };
export const icon = (name, size = 20) => createElement(icons[name] || ArrowUpRight, { width: size, height: size, 'aria-hidden': 'true', 'stroke-width': 1.6 }).outerHTML;
export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const base = new URL('../', [...document.scripts].find(s => /assets\/design-studio\.js/.test(s.src)).src);
export const url = path => new URL(path, base).href;
const img = (path, alt = '', cls = '') => `<img class="${cls}" src="${esc(url(path))}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const label = t => `<p class="ds-kicker">${esc(t)}</p>`;
const heading = (t, level = 2) => `<h${level} class="ds-title" data-text-motion>${esc(t)}</h${level}>`;
const para = t => t ? `<p class="ds-lead">${esc(t)}</p>` : '';
export const link = (t, href = 'contact/', cls = '') => `<a class="ds-button ${cls}" href="${esc(url(href))}"><span>${esc(t)}</span>${icon('ArrowUpRight')}</a>`;
const photo = () => img('assets/placeholders/landscape.svg', 'Landscape image placeholder', 'ds-landscape');
const mark = () => img('assets/logo-black.svg', '', 'ds-mark');
const number = i => String(i + 1).padStart(2, '0');
const intro = d => `<header class="ds-section-heading">${label(d.eyebrow || d.type)}${heading(d.title,d.type==='gallery'?1:2)}${para(d.lead)}</header>`;
const body = d => `<div class="ds-prose">${d.prose}</div>`;
const actions = () => `<div class="ds-actions">${link('Find your starting point','services/')}${link('Talk with Anna','contact/','ds-button-quiet')}</div>`;
const orbit = () => `<div class="ds-orbit" aria-hidden="true"><i></i><i></i><i></i><span>${mark()}</span><b>VALUES</b><b>DIRECTION</b><b>CONNECTION</b></div>`;
const arrows = () => `<div class="ds-controls"><button data-prev aria-label="Previous">${icon('ChevronLeft')}</button><button data-next aria-label="Next">${icon('ChevronRight')}</button></div>`;
const card = (item, i, kind = '') => `<article class="ds-card ${kind}" data-card-unit>${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.alt)}" loading="lazy">` : `<span class="ds-card-icon">${icon(['Compass','Users','Waves','Leaf'][i%4],32)}</span>`}<div class="ds-card-copy"><span class="ds-number">${number(i)} / ${esc(item.tag || 'Hoea tō Waka')}</span><h3>${esc(item.title)}</h3>${para(item.text)}${item.href ? link(item.cta || 'Explore this option',item.href) : ''}</div></article>`;
const items = d => d.items.map((c,i)=>card(c,i)).join('');
const facts = d => `<dl class="ds-facts">${d.facts.map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>`;
const navlinks = () => ['Home','About','Services','Resources','Contact'].map((n,i)=>`<a href="${url(['','about/','services/','resources/','contact/'][i])}" ${new URL(location.href).pathname.replace(/index.html$/,'') === new URL(url(['','about/','services/','resources/','contact/'][i])).pathname ? 'aria-current="page"' : ''}>${n}</a>`).join('');
const brand = () => `<a class="ds-brand" href="${url('')}">${mark()}<span>Hoea tō Waka<small>STRENGTH IN AOTEAROA</small></span></a>`;
const navtools = () => `<div class="ds-nav-tools"><button data-ds-theme aria-label="Switch colour theme">${icon('Sun')}</button><button class="ds-mobile-toggle" aria-label="Open navigation" aria-expanded="false" data-ds-menu>${icon('Menu')}</button></div>`;
const nav = () => `<nav class="ds-nav-links" aria-label="Primary navigation">${navlinks().replace(/(<a[^>]+>Services<\/a>)/,`<div class="ds-nav-service">$1<details><summary aria-label="Show service pages">${icon('Plus',14)}</summary><div class="ds-services-menu"><a href="${url('services/in-house-workshops/')}">In-house workshops</a><a href="${url('services/resilience-one-on-one/')}">Individual coaching</a><a href="${url('services/workshops-for-support-professionals/')}">Support professional training</a></div></details></div>`)}</nav>`;
const contactLinks = () => `<div class="ds-contact-links"><a href="mailto:anna@hoeatowaka.co.nz">${icon('Mail')}anna@hoeatowaka.co.nz</a><a href="tel:+64272059520">${icon('Phone')}027 205 9520</a><span>${icon('MapPin')}Ōtautahi Christchurch</span></div>`;
const footerlinks = () => `<div class="ds-footer-links"><div>${label('Explore')}${navlinks()}</div><div>${label('Work together')}<a href="${url('services/in-house-workshops/')}">In-house workshops</a><a href="${url('services/resilience-one-on-one/')}">Individual coaching</a><a href="${url('services/workshops-for-support-professionals/')}">Professional training</a><a href="${url('about/brand-guidelines/')}">Brand guidelines</a><a href="${url('illustrations/')}">Illustrations</a></div></div>`;
const fineprint = () => `<div class="ds-fineprint"><span>© ${new Date().getFullYear()} Hoea tō Waka Training Ltd.</span><a href="https://dottereldesign.github.io/portfolio/" target="_blank" rel="noopener">Created by Jamie Wilson ${icon('ArrowUpRight',14)}</a><span data-shielded-slot></span></div>`;
export { brand, nav, navtools, contactLinks, footerlinks, fineprint };

export const renderers = {
  utility: [
    () => `<button class="ds-quick-trigger" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon('Plus')}</button><div class="ds-quick-panel" hidden>${label('Here when you need us')}${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`,
    () => `<button class="ds-quick-trigger" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon('Waves')}<span>Connect</span></button><div class="ds-quick-panel" hidden>${heading('A simple first step.')}${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`,
    () => `<button class="ds-quick-trigger" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon('ArrowUpRight')}</button><div class="ds-quick-panel" hidden>${label('CONTACT / AOTEAROA')}${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`,
    () => `<button class="ds-quick-trigger" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon('Mail')}</button><div class="ds-quick-panel" hidden><span class="ds-signature">A note to Anna</span>${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`,
    () => `<button class="ds-quick-trigger" data-quick-toggle aria-expanded="false" aria-label="Open quick contact">${icon('Compass')}</button><div class="ds-quick-panel" hidden>${label('Find your bearings')}${contactLinks()}<button data-ds-theme>${icon('Sun')} Change appearance</button></div>`
  ],
  navbar: [
    () => `<div class="ds-nav-editorial">${brand()}${nav()}${navtools()}</div>`,
    () => `<div class="ds-nav-floating">${brand()}${nav()}${navtools()}</div>`,
    () => `<div class="ds-nav-architect"><div>${brand()}${navtools()}</div><div>${label('Practical resilience. Aotearoa.')} ${nav()}</div></div>`,
    () => `<div class="ds-nav-journal">${brand()}<div class="ds-nav-journal-right">${label('Good people. Shared direction.')}${nav()}</div>${navtools()}</div>`,
    () => `<div class="ds-nav-dock">${brand()}${nav()}${navtools()}<span class="ds-status-dot" aria-hidden="true"></span></div>`
  ],
  hero: [
    d => `<div class="ds-hero-editorial"><div class="ds-hero-copy">${label('A little clarity. A stronger direction.')}${heading('You can’t still the water. You can find your way.',1)}${para(d.lead)}${actions()}<div class="ds-hero-note">${icon('Compass')}Grounded in Aotearoa. Made for everyday life.</div></div><figure>${photo()}<figcaption><span>01 / A shared direction</span>${icon('Waves',24)}</figcaption><div class="ds-image-seal">People<br>before<br>everything.</div></figure><div class="ds-hero-bottom"><span>Resilience is something we practise.</span><a href="#services">Explore what’s possible ${icon('ArrowDown')}</a></div></div>`,
    d => `<div class="ds-hero-cinema">${photo()}<div class="ds-cinema-copy">${label('Hoea tō Waka · Strength in Aotearoa')}${heading('Find your direction.<br>Move together.'.replace('<br>',' '),1)}${para(d.lead)}${actions()}</div><div class="ds-cinema-bottom"><span>For people. For teams. For the work that matters.</span><button class="ds-film-button" data-media-brief>${icon('Play')}The film we imagine</button></div></div>`,
    d => `<div class="ds-hero-blueprint"><div class="ds-blueprint-title">${label('Hoea tō Waka / Resilience in practice')}${heading('Stronger people. Clearer direction.',1)}</div><div class="ds-blueprint-bottom"><div>${para(d.lead)}${actions()}</div><div class="ds-blueprint-art">${orbit()}<span class="ds-coordinate">43.5321° S / 172.6362° E<br>ŌTAUTAHI, AOTEAROA</span></div></div></div>`,
    d => `<div class="ds-hero-journal"><div class="ds-journal-margin">FIELD NOTES<br>ON RESILIENCE<br><span>VOL. 01</span></div><div class="ds-journal-copy">${label('We all have currents to navigate.')}${heading('Make room for what matters.',1)}${para(d.lead)}${actions()}</div><div class="ds-photo-stack"><figure>${img('assets/service-individual-1200.webp','A conversation about finding direction')}<figcaption>Start with a conversation.</figcaption></figure><figure>${photo()}<figcaption>Find a little perspective.</figcaption></figure><span class="ds-hand-note">Your next chapter<br>starts here ↗</span></div></div>`,
    d => `<div class="ds-hero-constellation"><div class="ds-star-field" aria-hidden="true"></div><div>${label('A practical model. A world of possibility.')}${heading('Your next step changes the journey.',1)}${para(d.lead)}${actions()}</div><div class="ds-interactive-map">${orbit()}<div class="ds-map-options"><button data-map-word="Notice" aria-pressed="true">01 Notice</button><button data-map-word="Connect" aria-pressed="false">02 Connect</button><button data-map-word="Choose" aria-pressed="false">03 Choose</button></div><p data-map-caption>Notice the currents around you.</p></div></div>`
  ],
  header: [
    d => `<div class="ds-page-editorial">${label(d.eyebrow)}${heading(d.title,1)}<div class="ds-page-bottom">${para(d.lead)}${facts(d)}</div></div>`,
    d => `<div class="ds-page-photo">${photo()}<div>${label(d.eyebrow)}${heading(d.title,1)}${para(d.lead)}</div>${facts(d)}</div>`,
    d => `<div class="ds-page-grid"><span class="ds-big-index">↗</span><div>${label(d.eyebrow)}${heading(d.title,1)}${para(d.lead)}</div>${facts(d)}</div>`,
    d => `<div class="ds-page-note"><div>${label('A note from Hoea tō Waka')}${heading(d.title,1)}${para(d.lead)}</div><aside>${mark()}${facts(d)}</aside></div>`,
    d => `<div class="ds-page-orbit"><div>${label(d.eyebrow)}${heading(d.title,1)}${para(d.lead)}${facts(d)}</div>${orbit()}</div>`
  ],
  statement: [
    d => `<div class="ds-statement-editorial">${label('A model for the life you’re actually living')}${heading(d.title)}<span class="ds-statement-rule"></span>${link('Meet the model','about/')}</div>`,
    d => `<div class="ds-statement-water">${icon('Waves',64)}${heading(d.title)}${label('Notice the current. Choose your direction.')}</div>`,
    d => `<div class="ds-statement-poster">${label('OUR PURPOSE')}${heading('Resilience, made practical.')}<div>${para(d.title)}${link('Discover how','about/')}</div></div>`,
    d => `<div class="ds-statement-letter">${label('A belief we come back to')}${heading(d.title)}<div class="ds-signature">Hoea tō Waka</div></div>`,
    d => `<div class="ds-statement-map">${orbit()}<div>${label('Find your bearings')}${heading(d.title)}${link('Explore the approach','about/')}</div></div>`
  ],
  services: [
    d => `${intro(d)}<div class="ds-service-editorial">${items(d)}</div>`,
    d => `${intro(d)}<div class="ds-service-panels">${items(d)}</div>`,
    d => `${intro(d)}<div class="ds-service-rows">${d.items.map((c,i)=>`<article data-card-unit><span class="ds-number">${number(i)}</span><h3>${esc(c.title)}</h3>${para(c.text)}${link('Explore',c.href)}<img src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy"></article>`).join('')}</div>`,
    d => `<div class="ds-service-journal">${intro(d)}<div class="ds-journal-cards">${items(d)}</div></div>`,
    d => `${intro(d)}<div class="ds-service-tabs" data-tabs><div class="ds-tab-bar" role="tablist" aria-label="Ways to work together">${d.items.map((c,i)=>`<button role="tab" id="service-tab-${i}" aria-controls="service-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-tab="${i}">${number(i)} ${esc(c.title)}</button>`).join('')}</div>${d.items.map((c,i)=>`<div role="tabpanel" aria-labelledby="service-tab-${i}" id="service-panel-${i}" ${i?'hidden':''}>${card(c,i)}${orbit()}</div>`).join('')}</div>`
  ],
  features: [
    d => `<div class="ds-feature-editorial">${intro(d)}<div class="ds-feature-columns">${items(d)}</div></div>`,
    d => `${intro(d)}<div class="ds-feature-bento">${items(d)}<div class="ds-feature-art">${orbit()}</div></div>`,
    d => `<div class="ds-feature-manifesto">${intro(d)}<div>${d.items.map((c,i)=>`<article data-card-unit><span>${number(i)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')}</div></div>`,
    d => `${intro(d)}<div class="ds-feature-notes">${items(d)}</div>`,
    d => `<div class="ds-feature-path">${intro(d)}<div class="ds-path-line">${d.items.map((c,i)=>`<article data-card-unit><i>${icon(['Compass','Heart','Waves'][i%3],28)}</i><span class="ds-number">${number(i)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')}</div></div>`
  ],
  uses: [
    d => `<div class="ds-uses-editorial">${intro(d)}<div class="ds-use-index">${d.tags.map((t,i)=>`<div><span>${number(i)}</span>${esc(t)}</div>`).join('')}</div>${body(d)}`,
    d => `<div class="ds-uses-islands">${intro(d)}<div class="ds-floating-tags">${d.tags.map((t,i)=>`<span style="--i:${i}">${icon(['Heart','Compass','Leaf','Users'][i%4])}${esc(t)}</span>`).join('')}</div>${body(d)}`,
    d => `${intro(d)}<div class="ds-use-matrix">${d.tags.map((t,i)=>`<div>${icon(['Heart','Compass','Leaf','Users'][i%4],32)}<span>${esc(t)}</span><small>${number(i)}</small></div>`).join('')}</div>${body(d)}`,
    d => `<div class="ds-uses-journal">${intro(d)}<ul>${d.tags.map(t=>`<li>${icon('Check')}${esc(t)}</li>`).join('')}</ul>${body(d)}</div>`,
    d => `<div class="ds-uses-cloud">${intro(d)}<div class="ds-tag-orbit">${d.tags.map((t,i)=>`<span style="--i:${i}">${esc(t)}</span>`).join('')}</div>${body(d)}</div>`
  ],
  cta: [
    d => `<div class="ds-cta-editorial">${label('Let’s find a useful next step')}${heading(d.title)}<div>${para(d.lead)}${link('Talk with Anna')}</div></div>`,
    d => `<div class="ds-cta-cinema">${photo()}<div>${label('Start where you are')}${heading(d.title)}${para(d.lead)}${link('Start a conversation')}</div></div>`,
    d => `<div class="ds-cta-blueprint">${icon('MoveUpRight',100)}<div>${heading(d.title)}${para(d.lead)}</div>${link('Let’s talk')}</div>`,
    d => `<div class="ds-cta-postcard"><span class="ds-stamp">FROM<br>AOTEAROA<br>${icon('Waves',30)}</span>${label('An open invitation')}${heading(d.title)}${para(d.lead)}${link('Write to Anna')}<span class="ds-signature">Let’s talk.</span></div>`,
    d => `<div class="ds-cta-beacon"><div class="ds-beacon" aria-hidden="true"></div>${label('Your next chapter')}${heading(d.title)}${para(d.lead)}${link('Find your direction')}</div>`
  ],
  testimonials: [
    d => `${intro(d)}<div class="ds-quote-editorial">${d.quotes.map((q,i)=>`<figure data-card-unit><span class="ds-quote-mark">“</span><blockquote>${esc(q.text)}</blockquote><figcaption>${esc(q.by)}<small>${esc(q.role)}</small></figcaption></figure>`).join('')}</div>`,
    d => `<div class="ds-quote-cinema">${intro(d)}<div class="ds-quote-slides" data-carousel>${d.quotes.map((q,i)=>`<figure ${i?'hidden':''}><blockquote>“${esc(q.text)}”</blockquote><figcaption>${esc(q.by)} / ${esc(q.role)}</figcaption></figure>`).join('')}${arrows()}<p class="ds-carousel-status" aria-live="polite">1 / ${d.quotes.length}</p></div></div>`,
    d => `<div class="ds-quote-grid">${intro(d)}${d.quotes.map((q,i)=>`<figure data-card-unit><span class="ds-number">VOICE ${number(i)}</span><blockquote>${esc(q.text)}</blockquote><figcaption>${esc(q.by)}<small>${esc(q.role)}</small></figcaption></figure>`).join('')}</div>`,
    d => `${intro(d)}<div class="ds-quote-letters">${d.quotes.map(q=>`<figure data-card-unit>${label('What stayed with me')}<blockquote>${esc(q.text)}</blockquote><figcaption class="ds-signature">${esc(q.by)}</figcaption><p>${esc(q.role)}</p></figure>`).join('')}</div>`,
    d => `<div class="ds-quote-orbit">${intro(d)}<div class="ds-quote-slides" data-carousel>${d.quotes.map((q,i)=>`<figure ${i?'hidden':''}><span class="ds-quote-mark">“</span><blockquote>${esc(q.text)}</blockquote><figcaption>${esc(q.by)}<small>${esc(q.role)}</small></figcaption></figure>`).join('')}${arrows()}<p class="ds-carousel-status" aria-live="polite">1 / ${d.quotes.length}</p></div></div>`
  ],
  story: [
    d => `<div class="ds-story-editorial">${intro(d)}<div>${body(d)}${d.image ? `<figure><img src="${esc(d.image)}" alt="${esc(d.alt)}" loading="lazy"></figure>` : photo()}</div></div>`,
    d => `<div class="ds-story-cinema"><div class="ds-story-visual">${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.alt)}" loading="lazy">` : photo()}</div><div>${intro(d)}${body(d)}</div></div>`,
    d => `<div class="ds-story-blueprint"><aside>${label('The perspective')}${icon('Compass',80)}</aside><div>${intro(d)}${body(d)}</div></div>`,
    d => `<div class="ds-story-journal"><div class="ds-journal-margin">NOTES<br>FROM<br>AOTEAROA</div><div>${intro(d)}${body(d)}</div><figure>${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.alt)}" loading="lazy">` : photo()}<figcaption>People. Context. Possibility.</figcaption></figure></div>`,
    d => `<div class="ds-story-constellation">${orbit()}<div>${intro(d)}${body(d)}</div></div>`
  ],
  process: [
    d => `${intro(d)}<ol class="ds-process-horizontal">${d.items.map((c,i)=>`<li data-card-unit><span>${number(i)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></li>`).join('')}</ol>`,
    d => `<div class="ds-process-river">${intro(d)}<ol>${d.items.map((c,i)=>`<li data-card-unit><span>${icon('Waves',28)}</span><div>${label('Step '+number(i))}<h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div></li>`).join('')}</ol></div>`,
    d => `${intro(d)}<div class="ds-process-steps">${d.items.map((c,i)=>`<article data-card-unit style="--i:${i}"><strong>${number(i)}</strong><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')}</div>`,
    d => `<div class="ds-process-journal">${intro(d)}<div>${d.items.map((c,i)=>`<article data-card-unit><span class="ds-signature">${number(i)}.</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')}</div></div>`,
    d => `${intro(d)}<div class="ds-process-accordion">${d.items.map((c,i)=>`<details data-card-unit ${i===0?'open':''}><summary><span>${number(i)}</span>${esc(c.title)}${icon('Plus')}</summary><p>${esc(c.text)}</p></details>`).join('')}</div>`
  ],
  faq: [
    d => `<div class="ds-faq-editorial">${intro(d)}<div>${faq(d,'number')}</div></div>`,
    d => `${intro(d)}<div class="ds-faq-cards">${faq(d,'icon')}</div>`,
    d => `<div class="ds-faq-index">${intro(d)}<div>${faq(d,'number')}</div></div>`,
    d => `<div class="ds-faq-journal">${intro(d)}<div>${d.items.map((q,i)=>`<article data-card-unit><span class="ds-signature">Q${i+1}.</span><h3>${esc(q.title)}</h3><p>${esc(q.text)}</p></article>`).join('')}</div></div>`,
    d => `<div class="ds-faq-focus">${intro(d)}<div>${faq(d,'icon',true)}</div>${link('Something else on your mind?')}</div>`
  ],
  contact: [
    d => `<div class="ds-contact-editorial"><aside>${intro(d)}${contactLinks()}${label('You don’t need a finished brief.')}</aside><div class="ds-form-shell" data-form-slot></div></div>`,
    d => `<div class="ds-contact-cinema"><aside>${photo()}<div>${heading('Start with a conversation.')}${contactLinks()}</div></aside><div class="ds-form-shell">${label('Tell us a little about your world')}<div data-form-slot></div></div></div>`,
    d => `<div class="ds-contact-blueprint">${intro(d)}<div class="ds-contact-grid">${contactLinks()}<div data-form-slot></div></div></div>`,
    d => `<div class="ds-contact-letter"><aside>${label('To Anna,')}${heading('A note about what’s next.')}${contactLinks()}<span class="ds-signature">From your world<br>to ours.</span></aside><div class="ds-form-shell" data-form-slot></div></div>`,
    d => `<div class="ds-contact-focus">${intro(d)}<div class="ds-contact-focus-layout"><div>${orbit()}${contactLinks()}</div><div class="ds-form-shell" data-form-slot></div></div></div>`
  ],
  resources: [
    d => `${intro(d)}<div class="ds-book-editorial">${items(d)}</div>`,
    d => `<div class="ds-book-shelf">${intro(d)}<div>${items(d)}</div></div>`,
    d => `${intro(d)}<div class="ds-book-catalogue">${d.items.map((c,i)=>`<article data-card-unit><span>${number(i)}</span><img src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy"><div><h3>${esc(c.title)}</h3>${para(c.text)}${link('Ask about this book',c.href)}</div></article>`).join('')}</div>`,
    d => `<div class="ds-book-journal">${intro(d)}${d.items.map((c,i)=>`<article data-card-unit><figure><img src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy"><figcaption>A story to carry with you.</figcaption></figure><div>${label('From the bookshelf / '+number(i))}<h3>${esc(c.title)}</h3>${para(c.text)}${link('Enquire about this title',c.href)}</div></article>`).join('')}</div>`,
    d => `${intro(d)}<div class="ds-book-exhibition">${items(d)}</div>`
  ],
  videos: [
    d => `${intro(d)}<div class="ds-video-editorial">${videoCards(d)}</div>`,
    d => `<div class="ds-video-cinema">${intro(d)}${videoCards(d)}</div>`,
    d => `${intro(d)}<div class="ds-video-list">${videoCards(d)}</div>`,
    d => `<div class="ds-video-journal">${intro(d)}<div>${videoCards(d)}</div></div>`,
    d => `<div class="ds-video-orbit">${intro(d)}<div>${videoCards(d)}</div></div>`
  ],
  gallery: [
    d => `${intro(d)}<div class="ds-gallery-grid">${gallery(d)}</div>`,
    d => `${intro(d)}<div class="ds-gallery-masonry">${gallery(d)}</div>`,
    d => `${intro(d)}<div class="ds-gallery-index">${gallery(d)}</div>`,
    d => `<div class="ds-gallery-journal">${intro(d)}<div>${gallery(d)}</div></div>`,
    d => `${intro(d)}<div class="ds-gallery-reel" tabindex="0" aria-label="Illustration reel; scroll horizontally">${gallery(d)}</div>`
  ],
  footer: [
    () => `<div class="ds-footer-editorial"><div>${label('Good things begin with a conversation.')}${heading('Let’s find a way forward.')}${link('Talk with Anna')}</div><div class="ds-footer-main">${brand()}${footerlinks()}${contactLinks()}</div>${fineprint()}</div>`,
    () => `<div class="ds-footer-horizon">${photo()}<div>${heading('See you on the journey.')}${contactLinks()}${footerlinks()}${brand()}${fineprint()}</div></div>`,
    () => `<div class="ds-footer-blueprint"><div class="ds-footer-top">${brand()}${link('Start a conversation')}</div><div class="ds-footer-main">${footerlinks()}${contactLinks()}</div><div class="ds-footer-wordmark" aria-hidden="true">Hoea tō Waka↗</div>${fineprint()}</div>`,
    () => `<div class="ds-footer-journal"><aside>${label('Until next time')}${heading('Take care of your direction.')}${brand()}</aside><div>${footerlinks()}${contactLinks()}</div>${fineprint()}</div>`,
    () => `<div class="ds-footer-compass">${orbit()}<div>${heading('A little clarity goes a long way.')}${link('Let’s talk')}${footerlinks()}${contactLinks()}</div>${fineprint()}</div>`
  ],
  error: [
    d => `<div class="ds-error-editorial">${label('404 / A different direction')}${heading(d.title,1)}${para(d.lead)}${link('Return home','')}${link('Explore services','services/','ds-button-quiet')}</div>`,
    d => `<div class="ds-error-cinema">${photo()}<div>${label('404')}${heading('A little off course.',1)}${para(d.lead)}${link('Find your way home','')}</div></div>`,
    d => `<div class="ds-error-blueprint"><span>404</span>${heading(d.title,1)}${para(d.lead)}${link('Re-route home','')}</div>`,
    d => `<div class="ds-error-journal">${label('A missing page in the story')}${heading(d.title,1)}${para(d.lead)}${link('Back to the beginning','')}<span class="ds-signature">There’s always another way.</span></div>`,
    d => `<div class="ds-error-orbit">${orbit()}<div>${label('404 / Recalibrating')}${heading(d.title,1)}${para(d.lead)}${link('Set a new course','')}</div></div>`
  ]
};
function faq(d, mode, exclusive = false) { return d.items.map((q,i)=>`<details ${exclusive?'name="ds-faq"':''} data-card-unit><summary><span>${mode==='number'?number(i):icon('Compass')}</span>${esc(q.title)}${icon('Plus')}</summary><div class="ds-answer"><p>${esc(q.text)}</p></div></details>`).join(''); }
function videoCards(d) { return d.items.map((c,i)=>`<a class="ds-video-card" href="${esc(c.href)}" target="_blank" rel="noopener" data-card-unit><div>${c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy">` : photo()}<span class="ds-play">${icon('Play',30)}</span></div><span class="ds-number">WATCH / ${number(i)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span>Watch on YouTube ${icon('ArrowUpRight')}</span></a>`).join(''); }
function gallery(d) { return d.items.map((c,i)=>`<figure data-card-unit><img src="${esc(c.image)}" alt="${esc(c.alt || c.title)}" loading="lazy"><figcaption><span>${number(i)}</span><h3>${esc(c.title)}</h3></figcaption></figure>`).join(''); }

export function extract(el, type) {
  const text = (selector, from=el) => {const n=from.querySelector(selector)?.cloneNode(true);n?.querySelectorAll('span').forEach(s=>s.after(document.createTextNode(' ')));return (n?.textContent||'').replace(/\s+/g,' ').trim();};
  const primary = el.querySelector('h1,h2');
  const d = {type, title: primary?.getAttribute('aria-label') || primary?.textContent.replace(/\s+/g,' ').trim() || '', eyebrow: text('.eyebrow'), lead: text('.lead,.home-intro,.section-head p:not(.eyebrow),.cta-band-inner p'), items:[], facts:[], tags:[], quotes:[]};
  d.facts = [...el.querySelectorAll('.hero-fact')].map(f=>[f.children[0]?.textContent.trim(),f.children[1]?.textContent.trim()]);
  const selectors = {services:'.service-card',features:'.info-card',process:'.steps li,.step-list li',faq:'.faq-list details',resources:'.resource-feature',videos:'.video-card',gallery:'.illustration-card'};
  if (type==='process') selectors.process='ol li';
  if (selectors[type]) d.items = [...el.querySelectorAll(selectors[type])].map(c=>{const im=c.querySelector('img');const a=c.matches('a')?c:c.querySelector('a[href]');return {title:text('h2,h3,summary',c),text:[...c.querySelectorAll('p')].map(p=>p.textContent.trim()).join(' '),tag:text('.service-index,.info-card-number',c),image:im?.src,alt:im?.alt,href:a?.href,cta:type==='resources'?'Ask about this book':null};});
  d.tags = [...el.querySelectorAll('.tag-list li')].map(t=>t.textContent.trim());
  d.quotes = [...el.querySelectorAll('.testimonial-card')].filter(c=>!text('blockquote',c).includes('Lorem ipsum')).map(c=>({text:text('blockquote',c),by:text('strong',c).includes('placeholder')?'Workshop participant':text('strong',c),role:text('small',c)}));
  const im = el.querySelector('img'); d.image=im?.src;d.alt=im?.alt;
  const clean = el.cloneNode(true);
  clean.querySelector('h1,h2')?.remove();
  clean.querySelectorAll('.eyebrow,.breadcrumbs,.hero-fact-card,.faq-versions,.card-grid,.tag-list,img,picture,svg,.section-head,script').forEach(e=>e.remove());
  if(d.lead)clean.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()===d.lead)p.remove();});
  d.prose = [...clean.querySelectorAll('h2,h3,p,ul,ol,a.button')].filter(e=>!e.parentElement.closest('p,ul,ol')).map(e=>e.outerHTML.replace(/ data-reveal(?:="[^"]*")?/g,'').replace(/ class="[^"]*"/g,'')).join('');
  if(type==='hero') d.lead='Practical resilience training for organisations, teams, and the people who support others. Grounded in the cultural context of Aotearoa.';
  if(type==='services')d.items.forEach((c,i)=>{if(!c.image){c.image=url(['assets/service-in-house-1200.webp','assets/service-individual-1200.webp','assets/service-support-1200.webp'][i]);c.alt=['A contemporary workplace','An individual coaching conversation','Resources for support professionals'][i];}});
  if(type==='resources') {d.title='Stories that travel with you.';d.eyebrow='The bookshelf';d.items.forEach(c=>{c.href=url('contact/?interest=Resources%20or%20book%20order');});}
  if(type==='gallery') {d.title='A different way of seeing.';d.eyebrow='The illustration collection';}
  if(type==='error') d.lead=text('.error-card > p:last-of-type');
  return d;
}

export function classify(el) {
  if(el.matches('.site-utility-menu')) return 'utility';
  if(el.matches('.site-header')) return 'navbar';
  if(el.matches('.site-footer')) return 'footer';
  if(el.matches('.home-hero')) return 'hero';
  if(el.matches('.page-hero')) return 'header';
  if(el.matches('.error-card')) return 'error';
  if(el.matches('.home-statement')) return 'statement';
  if(el.querySelector('.service-grid')) return 'services';
  if(el.querySelector('.faq-list')) return 'faq';
  if(el.querySelector('[data-contact-form]')) return 'contact';
  if(el.querySelector('.testimonial-card')) return 'testimonials';
  if(el.querySelector('.resource-feature')) return 'resources';
  if(el.querySelector('.video-card')) return 'videos';
  if(el.matches('.illustration-library')) return 'gallery';
  if(el.matches('.cta-band')) return 'cta';
  if(el.querySelector('ol.step-list,ol.steps,ol.process')) return 'process';
  if(el.querySelector('.info-card')) return 'features';
  if(el.querySelector('.tag-list')) return 'uses';
  return 'story';
}
