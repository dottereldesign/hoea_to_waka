import { esc, icon, url, link, contactLinks } from './renderers';

/* Each entry is a composition for one content purpose. IDs are permanent and
   deliberately independent of the legacy art-direction IDs. */
const groups = {
  hero: [
    ['Open invitation','A balanced introduction beside a landscape image.','Split introductions'],
    ['The proposition','A confident centred opening with two clear next steps.','Type-led openings'],
    ['Wide perspective','An opening statement followed by a panoramic image.','Image-led openings'],
    ['People first','A portrait-shaped image paired with a personal introduction.','Split introductions'],
    ['Three ways forward','A homepage introduction with direct paths to the three services.','Service-led openings'],
    ['Editorial cover','A large headline, narrow introduction and image in an editorial grid.','Editorial openings'],
    ['The welcome card','An inset introduction card beside an open visual field.','Split introductions'],
    ['A clear beginning','A restrained, left-aligned opening with a strong lower rule.','Type-led openings'],
    ['Window on the work','A wide image above a compact split introduction.','Image-led openings'],
    ['The directory','An opening message beside a practical service index.','Service-led openings'],
    ['Shared horizon','A title above two images and a short invitation.','Image-led openings'],
    ['The long view','A tall picture balanced by a lower, spacious introduction.','Split introductions'],
    ['An open frame','A typographic opening contained by a generous border.','Type-led openings'],
    ['One useful step','An opening message with a prominent separate action column.','Type-led openings'],
    ['The field journal','A margin label, introduction and captioned image.','Editorial openings'],
    ['People and place','A central introduction between two small image windows.','Image-led openings'],
    ['Work together','A split introduction above an equal-width service navigation.','Service-led openings'],
    ['A simple choice','A concise introduction followed by two large destination links.','Service-led openings'],
    ['The welcome spread','A full-width headline above an image-and-copy spread.','Editorial openings'],
    ['Room to begin','A quiet offset opening with a small square image.','Split introductions'],
    ['Opening notes','A typographic opening with a lower three-column service ledger.','Editorial openings'],
    ['The front door','A large framed introduction with actions along the base.','Type-led openings'],
    ['Choose a starting point','An introduction next to expandable service pathways.','Service-led openings'],
    ['A wider world','A panoramic placeholder flanked by a title and action rail.','Image-led openings'],
    ['First conversation','An intimate letter-like introduction with a portrait and contact link.','Editorial openings'],
  ],
  header: [
    ['Essential title','Breadcrumb, page title and lead in a compact left-aligned header.','Compact headers'],
    ['Centred introduction','A centred page title and short supporting introduction.','Compact headers'],
    ['Underlined title','A concise page heading finished with a strong horizontal rule.','Compact headers'],
    ['Accent margin','A narrow colour marker beside the page title and introduction.','Compact headers'],
    ['Outline header','A compact page introduction contained within a fine frame.','Compact headers'],
    ['Title and summary','Page title left and supporting lead right, on one clear row.','Split headers'],
    ['Reverse introduction','A narrow context column beside a larger page title.','Split headers'],
    ['Facts alongside','Page introduction with the existing page facts in a side column.','Split headers'],
    ['Breadcrumb margin','A separate breadcrumb column beside the title and lead.','Split headers'],
    ['Two registers','A page title band above a divided lead-and-facts row.','Split headers'],
    ['Image thumbnail','A compact header with a small landscape image at the right.','Image headers'],
    ['Panoramic strip','Page title and lead above a shallow landscape image strip.','Image headers'],
    ['Inset photograph','A title and lead beside a neatly framed image placeholder.','Image headers'],
    ['Picture ribbon','A shallow image ribbon above the page breadcrumb and title.','Image headers'],
    ['Portrait note','A page introduction with a small portrait-shaped image.','Image headers'],
    ['Page folio','An editorial page title with context in a small upper margin.','Editorial headers'],
    ['Title then lead','A wide page title with its supporting paragraph along the base.','Editorial headers'],
    ['Section spine','A compact section label along a separate vertical spine.','Editorial headers'],
    ['Divided caption','A page title and caption separated by a fine editorial rule.','Editorial headers'],
    ['Title card','A rounded page-title panel with breadcrumb outside the frame.','Editorial headers'],
    ['Return and title','A visible home link with page title and lead below.','Navigation headers'],
    ['Breadcrumb rail','A full-width breadcrumb rail above the page introduction.','Navigation headers'],
    ['Title with directory','Page introduction with a compact site-navigation line.','Navigation headers'],
    ['Context ribbon','A section label ribbon above a clean two-column page introduction.','Navigation headers'],
    ['Page summary','A compact title, introductory paragraph and existing facts at the base.','Navigation headers'],
  ],
  features: [
    ['Equal cards','An introduction above a balanced grid of feature cards.','Card grids'],
    ['Side introduction','A narrow introductory column beside a feature grid.','Card grids'],
    ['Lead feature','A larger first feature beside the remaining cards.','Card grids'],
    ['Staggered notes','Feature cards step down across an editorial grid.','Card grids'],
    ['Linked panels','A connected feature grid with shared dividing lines.','Card grids'],
    ['Numbered rows','Features in clear numbered rows with generous reading space.','Lists and indexes'],
    ['Feature index','An index-style layout with titles and descriptions in separate columns.','Lists and indexes'],
    ['Alternating bands','Full-width feature bands alternate their reading emphasis.','Lists and indexes'],
    ['Indented ledger','A feature introduction with an indented numbered ledger.','Lists and indexes'],
    ['Two-column list','A compact list of features divided into two columns.','Lists and indexes'],
    ['Picture cards','Every feature has a labelled landscape image placeholder.','Image and feature layouts'],
    ['Shared picture','A single supporting image sits beside all the features.','Image and feature layouts'],
    ['Alternating pictures','Feature copy alternates with simple image placeholders.','Image and feature layouts'],
    ['Picture ribbon','A panoramic placeholder introduces a row of features.','Image and feature layouts'],
    ['Feature gallery','Portrait-shaped placeholders with feature copy underneath.','Image and feature layouts'],
    ['Open questions','Expandable feature details in a full-width stack.','Progressive disclosure'],
    ['Side accordion','A fixed introduction beside expandable feature descriptions.','Progressive disclosure'],
    ['Disclosure cards','Feature descriptions open inside a two-column card grid.','Progressive disclosure'],
    ['Disclosure ledger','A numbered editorial index with expandable descriptions.','Progressive disclosure'],
    ['Picture and accordion','A supporting picture beside expandable feature details.','Progressive disclosure'],
    ['Editorial columns','Open text columns with restrained icons and fine rules.','Editorial features'],
    ['Margin notes','A large introductory title beside narrow feature notes.','Editorial features'],
    ['Feature mosaic','A varied two-column composition gives every feature room.','Editorial features'],
    ['The feature dossier','An outlined feature sheet with a split introductory header.','Editorial features'],
    ['Reading sequence','A continuous vertical reading path through every feature.','Editorial features'],
  ],
  contact: [
    ['Conversation split','Direct contact information beside the enquiry form.','Split contact layouts'],
    ['Form first','The enquiry form at the left with direct-contact details beside it.','Split contact layouts'],
    ['Contact card','An inset contact-information card next to an open form.','Split contact layouts'],
    ['Form card','A clean framed form beside the invitation and contact links.','Split contact layouts'],
    ['Three-quarter form','A generous form column with a narrow contact rail.','Split contact layouts'],
    ['Centred enquiry','A centred invitation above a single-column form.','Centred contact layouts'],
    ['Letter to Anna','A letter-like contact sheet with the form below the introduction.','Centred contact layouts'],
    ['An open channel','A restrained title, contact strip and form in one column.','Centred contact layouts'],
    ['The enquiry frame','A bordered contact sheet with a full-width introduction.','Centred contact layouts'],
    ['Contact capsule','A rounded contact panel with centred introduction and form.','Centred contact layouts'],
    ['People behind the work','A portrait placeholder with contact details beside the form.','Image contact layouts'],
    ['A place to begin','A landscape placeholder above the contact-information column.','Image contact layouts'],
    ['Wide contact view','A shallow panoramic image introduces the contact layout.','Image contact layouts'],
    ['The picture note','A compact portrait and invitation above a wide form.','Image contact layouts'],
    ['Window and form','A tall image window beside a form with contacts below.','Image contact layouts'],
    ['Contact directory','A large introductory title above contact columns and form.','Directory contact layouts'],
    ['Choose your channel','Prominent direct-contact panels above the enquiry form.','Directory contact layouts'],
    ['The contact rail','A horizontal contact rail divides the invitation from the form.','Directory contact layouts'],
    ['Address book','A directory-like contact column separated by a strong rule.','Directory contact layouts'],
    ['Contact footer strip','A full-width enquiry form followed by the direct-contact strip.','Directory contact layouts'],
    ['Open correspondence','An editorial margin and spacious form on one sheet.','Editorial contact layouts'],
    ['The contact spread','A large introduction above an asymmetric information/form spread.','Editorial contact layouts'],
    ['A short note','A quiet, narrow invitation with the form offset to one side.','Editorial contact layouts'],
    ['Contact ledger','Title, contacts and form sit in clearly ruled sections.','Editorial contact layouts'],
    ['Conversation window','An inset form panel sits across a divided contact backdrop.','Editorial contact layouts'],
  ],
};

const starts = { hero: 101, header: 126, features: 151, contact: 176 };
export const purposeLayouts = Object.entries(groups).flatMap(([type, entries]) => entries.map(([name, description, group], i) => ({ id: starts[type] + i, type, name, description, group })));

const p = text => text ? `<p class="ds-lead">${esc(text)}</p>` : '';
const kicker = text => `<p class="ds-kicker">${esc(text || 'Hoea tō Waka')}</p>`;
const title = (d, level = 2) => `<h${level} class="ds-title">${esc(d.title || (level === 1 ? 'A clearer way forward.' : 'A simple first step.'))}</h${level}>`;
const intro = (d, level = 2) => `<header class="pp-intro">${kicker(d.eyebrow)}${title(d, level)}${p(d.lead)}</header>`;
const image = (shape = 'landscape', subject = 'People and place') => `<figure class="pp-placeholder pp-placeholder-${shape}"><div aria-hidden="true">${icon('Layers', 32)}<span>${shape === 'portrait' ? '3 : 4' : shape === 'square' ? '1 : 1' : shape === 'panorama' ? '4 : 1' : '4 : 3'}</span></div><figcaption>Photo placeholder · ${esc(subject)}</figcaption></figure>`;
const actions = () => `<div class="ds-actions">${link('Explore services', 'services/')}${link('Talk with Anna', 'contact/', 'ds-button-quiet')}</div>`;
const servicePaths = () => `<nav class="pp-paths" aria-label="Ways to work together">${[
  ['In-house workshops', 'services/in-house-workshops/'],
  ['Individual coaching', 'services/resilience-one-on-one/'],
  ['Training for support professionals', 'services/workshops-for-support-professionals/'],
].map(([name, path], i) => `<a href="${esc(url(path))}"><span class="ds-number">0${i + 1}</span><span>${name}</span>${icon('ArrowUpRight', 18)}</a>`).join('')}</nav>`;
const serviceDetails = () => `<div class="pp-service-details">${[
  ['For your organisation', 'Explore in-house workshops', 'services/in-house-workshops/'],
  ['For yourself', 'Explore individual coaching', 'services/resilience-one-on-one/'],
  ['For your professional practice', 'Explore support professional training', 'services/workshops-for-support-professionals/'],
].map(([name, label, path], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(name)}${icon('Plus', 18)}</summary>${link(label, path)}</details>`).join('')}</div>`;
const note = text => `<p class="pp-note">${esc(text)}</p>`;
const facts = d => d.facts?.length ? `<dl class="pp-facts">${d.facts.map(([label, text]) => `<div><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>` : '';
const breadcrumb = d => `<nav class="pp-breadcrumb" aria-label="Breadcrumb"><a href="${esc(url(''))}">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(d.eyebrow || d.title || 'This page')}</span></nav>`;
const directory = () => `<nav class="pp-directory" aria-label="Explore the site"><a href="${esc(url('about/'))}">About</a><a href="${esc(url('services/'))}">Services</a><a href="${esc(url('resources/'))}">Resources</a><a href="${esc(url('contact/'))}">Contact</a></nav>`;
const contacts = () => `<div class="pp-contacts">${contactLinks()}</div>`;
const form = () => '<div class="pp-form" data-form-slot></div>';
const featureCard = (c, i, style = 'icon') => `<article class="pp-feature" data-card-unit>${style === 'image' || style === 'portrait' ? image(style === 'portrait' ? 'portrait' : 'landscape', c.title) : `<span class="pp-feature-marker" aria-hidden="true">${style === 'number' ? String(i + 1).padStart(2, '0') : icon(['Compass', 'Users', 'Leaf', 'Heart', 'Waves'][i % 5], 26)}</span>`}<div class="pp-feature-copy"><h3>${esc(c.title)}</h3>${p(c.text)}${c.href ? link(c.cta || 'Explore this option', c.href) : ''}</div></article>`;
const cards = (d, style = 'icon') => `<div class="pp-features">${(d.items || []).map((c, i) => featureCard(c, i, style)).join('')}</div>`;
const disclosures = (d, numbered = false) => `<div class="pp-disclosures">${(d.items || []).map((c, i) => `<details class="pp-disclosure" data-card-unit ${i === 0 ? 'open' : ''}><summary>${numbered ? `<span class="ds-number">${String(i + 1).padStart(2, '0')}</span>` : ''}<span>${esc(c.title)}</span>${icon('Plus', 20)}</summary><div class="pp-answer">${p(c.text)}${c.href ? link(c.cta || 'Explore this option', c.href) : ''}</div></details>`).join('')}</div>`;

const hero = [
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div>${image()}`,
  d => `${intro(d, 1)}${actions()}${note('Practical resilience. Aotearoa.')}`,
  d => `<div class="pp-top">${intro(d, 1)}${actions()}</div>${image('panorama', 'An open landscape')}`,
  d => `${image('portrait', 'A genuine human moment')}<div class="pp-copy">${intro(d, 1)}${actions()}</div>`,
  d => `${intro(d, 1)}${actions()}${servicePaths()}`,
  d => `${kicker('Hoea tō Waka · Practical resilience')}${title(d, 1)}<div class="pp-bottom">${image()}<div>${p(d.lead)}${actions()}</div></div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div>${image('square')}`,
  d => `${intro(d, 1)}${actions()}<div class="pp-rule"></div>${note('For organisations, teams, and the people who support others.')}`,
  d => `${image('panorama', 'A shared perspective')}<div class="pp-bottom">${intro(d, 1)}${actions()}</div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div><aside>${kicker('Find your starting point')}${servicePaths()}</aside>`,
  d => `${intro(d, 1)}<div class="pp-bottom">${image('landscape', 'People together')}${image('landscape', 'A little perspective')}<div>${actions()}${note('Find your starting point.')}</div></div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div>${image('portrait', 'A wider perspective')}`,
  d => `<div class="pp-framed">${intro(d, 1)}${actions()}</div>`,
  d => `${intro(d, 1)}<aside>${kicker('Where would you like to begin?')}${actions()}</aside>`,
  d => `<aside class="pp-margin">${kicker('Opening notes')}${note('People. Context. Possibility.')}</aside><div class="pp-copy">${intro(d, 1)}${actions()}</div>${image('portrait')}`,
  d => `${image('portrait', 'People')}<div class="pp-copy">${intro(d, 1)}${actions()}</div>${image('portrait', 'Place')}`,
  d => `<div class="pp-top">${intro(d, 1)}${image('landscape')}</div>${servicePaths()}`,
  d => `${intro(d, 1)}<div class="pp-large-actions">${link('Find support for your team', 'services/')}${link('Start a conversation', 'contact/')}</div>`,
  d => `${kicker(d.eyebrow)}${title(d, 1)}<div class="pp-bottom">${image('landscape')}<div>${p(d.lead)}${actions()}${note('Grounded in everyday life.')}</div></div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div><aside>${image('square', 'A quiet moment')}${note('A little space to see things differently.')}</aside>`,
  d => `${intro(d, 1)}${actions()}<div class="pp-ledger">${servicePaths()}</div>`,
  d => `<div class="pp-framed">${intro(d, 1)}<div class="pp-bottom">${note('Practical resilience for the life you live.')}${actions()}</div></div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${link('Meet the approach', 'about/')}</div>${serviceDetails()}`,
  d => `${intro(d, 1)}${image('panorama', 'Aotearoa from a different perspective')}<div class="pp-bottom">${note('People. Context. Possibility.')}${actions()}</div>`,
  d => `<div class="pp-copy">${intro(d, 1)}${actions()}</div><aside>${image('portrait', 'Anna and the work')}${link('Meet Anna', 'about/', 'ds-button-quiet')}</aside>`,
];

const header = [
  d => `${breadcrumb(d)}${intro(d, 1)}`,
  d => `${breadcrumb(d)}${intro(d, 1)}`,
  d => `${breadcrumb(d)}${intro(d, 1)}<div class="pp-rule"></div>`,
  d => `${breadcrumb(d)}<div class="pp-marked">${intro(d, 1)}</div>`,
  d => `<div class="pp-framed">${breadcrumb(d)}${intro(d, 1)}</div>`,
  d => `${breadcrumb(d)}<div class="pp-split-title"><div>${kicker(d.eyebrow)}${title(d, 1)}</div>${p(d.lead)}</div>`,
  d => `${breadcrumb(d)}<div class="pp-split-title"><div>${kicker(d.eyebrow)}${p(d.lead)}</div>${title(d, 1)}</div>`,
  d => `${breadcrumb(d)}<div class="pp-split-title">${intro(d, 1)}${facts(d)}</div>`,
  d => `<aside>${breadcrumb(d)}</aside>${intro(d, 1)}`,
  d => `${breadcrumb(d)}${kicker(d.eyebrow)}${title(d, 1)}<div class="pp-bottom">${p(d.lead)}${facts(d)}</div>`,
  d => `<div class="pp-copy">${breadcrumb(d)}${intro(d, 1)}</div>${image('landscape', 'Page image')}`,
  d => `${breadcrumb(d)}${intro(d, 1)}${image('panorama', 'Page landscape')}`,
  d => `${breadcrumb(d)}<div class="pp-split-title">${intro(d, 1)}${image('landscape', 'Page image')}</div>`,
  d => `${image('panorama', 'Page image')}<div class="pp-copy">${breadcrumb(d)}${intro(d, 1)}</div>`,
  d => `${image('portrait', 'Page portrait')}<div class="pp-copy">${breadcrumb(d)}${intro(d, 1)}</div>`,
  d => `<div class="pp-top">${breadcrumb(d)}${kicker(d.eyebrow)}</div>${title(d, 1)}${p(d.lead)}`,
  d => `${breadcrumb(d)}${kicker(d.eyebrow)}${title(d, 1)}<div class="pp-bottom">${p(d.lead)}</div>`,
  d => `<aside>${kicker(d.eyebrow)}${breadcrumb(d)}</aside><div>${title(d, 1)}${p(d.lead)}</div>`,
  d => `${breadcrumb(d)}<div class="pp-split-title">${title(d, 1)}<div>${kicker(d.eyebrow)}${p(d.lead)}</div></div>`,
  d => `${breadcrumb(d)}<div class="pp-framed">${intro(d, 1)}</div>`,
  d => `<a class="pp-back" href="${esc(url(''))}">${icon('ChevronLeft', 17)} Back to home</a>${intro(d, 1)}`,
  d => `<div class="pp-crumb-rail">${breadcrumb(d)}</div>${intro(d, 1)}`,
  d => `${breadcrumb(d)}<div class="pp-split-title">${intro(d, 1)}${directory()}</div>`,
  d => `<div class="pp-context-ribbon">${kicker(d.eyebrow)}${breadcrumb(d)}</div><div class="pp-split-title">${title(d, 1)}${p(d.lead)}</div>`,
  d => `${breadcrumb(d)}${intro(d, 1)}${facts(d)}`,
];

const features = [
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d, 'number')}`,
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d, 'number')}`,
  d => `${intro(d)}${cards(d, 'number')}`,
  d => `${intro(d)}${cards(d, 'number')}`,
  d => `${intro(d)}<div class="pp-indent">${cards(d, 'number')}</div>`,
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d, 'image')}`,
  d => `${intro(d)}<div class="pp-bottom">${image('portrait', 'The approach in practice')}${cards(d)}</div>`,
  d => `${intro(d)}${cards(d, 'image')}`,
  d => `${intro(d)}${image('panorama', 'A broader perspective')}${cards(d)}`,
  d => `${intro(d)}${cards(d, 'portrait')}`,
  d => `${intro(d)}${disclosures(d)}`,
  d => `${intro(d)}${disclosures(d)}`,
  d => `${intro(d)}${disclosures(d)}`,
  d => `${intro(d)}${disclosures(d, true)}`,
  d => `${intro(d)}<div class="pp-bottom">${image('landscape', 'The approach in practice')}${disclosures(d)}</div>`,
  d => `${intro(d)}${cards(d)}`,
  d => `${intro(d)}${cards(d, 'number')}`,
  d => `${intro(d)}${cards(d)}`,
  d => `<div class="pp-framed">${intro(d)}${cards(d, 'number')}</div>`,
  d => `${intro(d)}${cards(d, 'number')}`,
];

const contact = [
  d => `<div class="pp-copy">${intro(d)}${contacts()}</div>${form()}`,
  d => `${form()}<div class="pp-copy">${intro(d)}${contacts()}</div>`,
  d => `<aside class="pp-contact-card">${intro(d)}${contacts()}</aside>${form()}`,
  d => `<div class="pp-copy">${intro(d)}${contacts()}</div><div class="pp-form-card">${form()}</div>`,
  d => `<aside>${intro(d)}${contacts()}</aside>${form()}`,
  d => `${intro(d)}${form()}${contacts()}`,
  d => `<div class="pp-letter">${kicker('To Anna')}${intro(d)}${form()}${contacts()}</div>`,
  d => `${intro(d)}${contacts()}${form()}`,
  d => `<div class="pp-framed">${intro(d)}<div class="pp-bottom">${contacts()}${form()}</div></div>`,
  d => `<div class="pp-framed">${intro(d)}${form()}${contacts()}</div>`,
  d => `<aside>${image('portrait', 'Anna and the work')}${contacts()}</aside><div class="pp-copy">${intro(d)}${form()}</div>`,
  d => `<aside>${image('landscape', 'A little perspective')}${intro(d)}${contacts()}</aside>${form()}`,
  d => `${intro(d)}${image('panorama', 'People and place')}<div class="pp-bottom">${contacts()}${form()}</div>`,
  d => `<div class="pp-top">${image('portrait', 'Anna and the work')}<div>${intro(d)}${contacts()}</div></div>${form()}`,
  d => `${image('portrait', 'A quiet place to begin')}<div class="pp-copy">${intro(d)}${form()}${contacts()}</div>`,
  d => `${intro(d)}<div class="pp-bottom">${contacts()}${form()}</div>`,
  d => `${intro(d)}${contacts()}<div class="pp-form-card">${form()}</div>`,
  d => `${intro(d)}${contacts()}${form()}`,
  d => `<aside>${intro(d)}${contacts()}</aside>${form()}`,
  d => `${intro(d)}${form()}${contacts()}`,
  d => `<aside class="pp-margin">${kicker('An open invitation')}${contacts()}</aside><div class="pp-copy">${intro(d)}${form()}</div>`,
  d => `${intro(d)}<div class="pp-bottom"><aside>${kicker('Direct contact')}${contacts()}</aside>${form()}</div>`,
  d => `<div class="pp-copy">${intro(d)}${contacts()}</div>${form()}`,
  d => `${intro(d)}<div class="pp-bottom">${contacts()}${form()}</div>`,
  d => `<div class="pp-copy">${intro(d)}${contacts()}</div><div class="pp-form-card">${form()}</div>`,
];

const renderers = { hero, header, features, contact };
export function renderPurpose(data, id) {
  const layout = purposeLayouts.find(entry => entry.id === Number(id));
  if (!layout || data.type !== layout.type) return '';
  return `<div class="pp-shell pp-${layout.type}-${layout.id - starts[layout.type] + 1}">${renderers[layout.type][layout.id - starts[layout.type]](data)}</div>`;
}
