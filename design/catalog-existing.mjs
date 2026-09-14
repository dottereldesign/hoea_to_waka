// The catalogue describes what each composition does, independently of colour
// and type. Numeric IDs are persisted in customer selections; never renumber them.
export const categories = [
  ['navbar','Navbars','Help people find pages, services and ways to get in touch.'],
  ['footer','Footers','Close the page with useful navigation and contact information.'],
  ['hero','Hero Sections','Introduce the organisation on the homepage and offer a clear first step.'],
  ['header','Header Sections','Orient a subpage with its own title, introduction and page context.'],
  ['services','Service Sections','Compare workshops, individual coaching and professional training.'],
  ['features','Feature Sections','Explain the approach, benefits and practical points that matter.'],
  ['statement','Brand Statements','Give a short principle or belief its own space.'],
  ['cta','CTA Sections','Invite the next conversation with a clear action.'],
  ['faq','FAQ Sections','Make common questions and their answers easy to find.'],
  ['contact','Contact Sections','Pair the enquiry form with useful contact details.'],
  ['testimonials','Testimonial Sections','Share existing participant feedback with its attribution.'],
  ['story','Story & About Sections','Present longer explanations, background and people behind the work.'],
  ['process','Process Sections','Explain a sequence of practical steps.'],
  ['uses','Application Sections','Show where the approach fits people’s work and everyday lives.'],
  ['resources','Book & Resource Sections','Present the existing books and ways to enquire about them.'],
  ['videos','Video Sections','Introduce the existing videos and their external viewing links.'],
  ['gallery','Gallery Sections','Browse the site’s illustration collection.'],
  ['utility','Quick Contact','Keep the floating contact and appearance tools within reach.','utility'],
  ['error','Missing Page','Help someone find a useful route from an unavailable page.','utility'],
].map(([id,label,description,kind='section'])=>({id,type:id,label,description,kind}));

const categoryIndex = new Map(categories.map(category=>[category.type,category]));
export const categoryFor = type => categoryIndex.get(type);

// These five early renderers really are authored per content type. Keep their
// names literal: a carousel is only labelled a carousel when it has controls.
const originalEntries = {
  navbar: [
    ['Single-row navigation','Single row','Brand, page links and appearance controls in one horizontal line.'],
    ['Floating navigation island','Single row','A contained navigation bar with space around its edges.'],
    ['Two-tier navigation','Two tiers','Brand and controls above a separate row of page links.'],
    ['Journal masthead','Two tiers','A brand masthead beside a small introductory line and navigation.'],
    ['Navigation dock','Single row','A compact enclosed navigation bar with a small status accent.'],
  ],
  hero: [
    ['Split image and introduction','Split introductions','A homepage statement beside a landscape, with two useful starting links.'],
    ['Full-image homepage opening','Image-led openings','A large background image carries the introduction and primary actions.'],
    ['Typography and model diagram','Graphic introductions','An oversized opening title above supporting copy and a model diagram.'],
    ['Layered photo introduction','Image-led openings','A reading column beside overlapping photographs and short captions.'],
    ['Interactive model introduction','Graphic introductions','Homepage copy beside a diagram with Notice, Connect and Choose controls.'],
  ],
  header: [
    ['Title and context row','Title first','The page title leads; its introduction and existing facts sit below.'],
    ['Image-backed page title','With an image','A page title and short introduction over a landscape, followed by existing facts.'],
    ['Split page introduction','Title first','A graphic index, page title and description form an ordered introductory grid.'],
    ['Page introduction and note','With page context','The page title and introduction sit beside a compact facts panel.'],
    ['Page title and model diagram','With page context','A page introduction pairs with the existing model diagram.'],
  ],
  statement: [
    ['Statement with next link','Text first','A large principle, a fine rule and one link to the approach.'],
    ['Centred principle','Text first','A centred statement with a small wave icon and a supporting line.'],
    ['Purpose poster','Graphic statements','An oversized purpose heading with supporting text and a discovery link.'],
    ['Signed belief','Text first','A short belief presented like a signed note.'],
    ['Principle and model','Graphic statements','A statement beside the model diagram and a link to explore the approach.'],
  ],
  services: [
    ['Service card grid','Cards & grids','Image cards compare the existing service routes side by side.'],
    ['Image-led service panels','Cards & grids','Large image panels introduce each service and its next link.'],
    ['Service directory rows','Rows & directories','Numbered rows align each service name, summary, link and image.'],
    ['Service field cards','Cards & grids','A set of editorial cards gives each service room for its own summary.'],
    ['Tabbed service explorer','Tabs & panels','Accessible tabs show one service at a time with its description and action.'],
  ],
  features: [
    ['Feature columns','Cards & grids','A shared introduction followed by comparable feature columns.'],
    ['Feature bento','Cards & grids','An asymmetric card grid combines the existing features and model diagram.'],
    ['Numbered feature list','Lists & pathways','A strong heading beside an ordered list of practical points.'],
    ['Feature notes','Cards & grids','Individual note-like cards present each feature.'],
    ['Connected feature pathway','Lists & pathways','A visual path connects the existing feature descriptions and icons.'],
  ],
  uses: [
    ['Application index','Lists & matrices','Numbered rows identify each existing application before the explanation.'],
    ['Application islands','Tags & clusters','Separate labelled islands show the different places the approach can fit.'],
    ['Application matrix','Lists & matrices','An orderly grid pairs each application with an icon and index.'],
    ['Application checklist','Lists & matrices','A simple checklist leads into the supporting explanation.'],
    ['Application cluster','Tags & clusters','Application labels form a loose cluster around the introduction.'],
  ],
  cta: [
    ['Invitation and action row','Text invitations','A direct invitation with supporting copy and a conversation link.'],
    ['Image-backed invitation','Image invitations','A landscape frames the invitation and its primary action.'],
    ['Directional action band','Graphic invitations','A large directional arrow connects the message with the conversation link.'],
    ['Postcard invitation','Text invitations','A personal note format invites a message to Anna.'],
    ['Centred conversation beacon','Graphic invitations','A centred invitation and primary link with a small visual focal point.'],
  ],
  testimonials: [
    ['Participant quote grid','Quote grids','Existing participant feedback appears in a consistent set of attributed quotes.'],
    ['Large quote carousel','Quote carousels','Previous and next controls move through existing feedback one quote at a time.'],
    ['Indexed voices','Quote grids','A clear grid presents each participant voice with its attribution.'],
    ['Participant letters','Quote grids','Existing quotes are presented as individual signed notes.'],
    ['Centred quote carousel','Quote carousels','A centred quote display has previous and next controls and a position count.'],
  ],
  story: [
    ['Story and adjacent image','Split stories','A section heading leads into reading copy beside an image.'],
    ['Image and reading panel','Split stories','A large image sits alongside the existing explanation.'],
    ['Annotated reading column','Reading layouts','A narrow perspective rail supports a focused reading column.'],
    ['Journal story spread','Reading layouts','A margin, long-form copy and captioned photograph form a reading spread.'],
    ['Model and explanation','Reading layouts','The existing model diagram sits beside the section’s longer explanation.'],
  ],
  process: [
    ['Horizontal step sequence','Step grids','The existing steps are laid out in order across a single grid.'],
    ['Vertical step journey','Step lists','A vertical list connects each practical step with its supporting description.'],
    ['Numbered step cards','Step grids','Large step numbers give each stage a distinct card.'],
    ['Step-by-step notes','Step lists','The sequence is presented as a set of concise numbered notes.'],
    ['Expandable process steps','Expandable steps','Each step expands to reveal its description, with the first step initially open.'],
  ],
  faq: [
    ['Split question accordion','Accordions','An introductory column sits beside numbered expandable questions.'],
    ['Question card accordion','Accordions','Each answer opens inside its own clearly separated question card.'],
    ['Numbered question index','Accordions','An indexed list makes the existing questions easy to scan and expand.'],
    ['All answers visible','Open answers','Every existing question and answer is visible in a reading layout.'],
    ['Focused question accordion','Accordions','One answer opens at a time, followed by an invitation to ask another question.'],
  ],
  contact: [
    ['Enquiry form and contact column','Split enquiry','Contact details and a short introduction sit beside the live enquiry form.'],
    ['Image-led enquiry form','Image-led enquiry','An image and contact details accompany the preserved enquiry form.'],
    ['Contact directory and form','Split enquiry','A section introduction sits above a structured contact and form grid.'],
    ['Personal letter enquiry','Split enquiry','A personal introduction to Anna sits beside the live enquiry form.'],
    ['Model and enquiry form','Image-led enquiry','A model diagram and contact details sit beside the preserved form.'],
  ],
  resources: [
    ['Book card grid','Book grids','Each existing book keeps its cover, description and enquiry link.'],
    ['Book display shelf','Book grids','A shared shelf presentation gives book covers a visual stage.'],
    ['Book catalogue rows','Book lists','Numbered catalogue rows pair covers with descriptions and enquiry links.'],
    ['Book feature stories','Book lists','Large covers and reading columns give each title its own introduction.'],
    ['Book exhibition cards','Book grids','A gallery-like card arrangement displays the existing books.'],
  ],
  videos: [
    ['Video card grid','Video grids','Video thumbnails, summaries and external viewing links form a simple grid.'],
    ['Video feature panels','Video grids','Larger panels introduce the existing videos and viewing links.'],
    ['Video viewing list','Video lists','A compact list pairs each video with its description and external link.'],
    ['Video journal cards','Video grids','An editorial card group presents each video with its context.'],
    ['Video collection cards','Video grids','The existing videos sit in a visually framed card collection.'],
  ],
  gallery: [
    ['Illustration grid','Image grids','The existing images and captions align in a regular grid.'],
    ['Illustration masonry','Image grids','Images form a staggered visual wall with their original captions.'],
    ['Illustration index','Image lists','An indexed presentation makes the collection easy to browse.'],
    ['Illustration journal','Image grids','A shared heading introduces the captioned image collection.'],
    ['Horizontal illustration reel','Image reels','A keyboard-focusable horizontal reel lets visitors scroll the collection.'],
  ],
  footer: [
    ['Conversation and link columns','Link directories','A closing invitation precedes the brand, navigation and contact directory.'],
    ['Image-backed closing','Image closings','A landscape accompanies the closing message, links and contact details.'],
    ['Large wordmark directory','Link directories','A brand and action row leads into useful links and an oversized wordmark.'],
    ['Two-column closing note','Link directories','A short closing note sits beside the navigation and contact directory.'],
    ['Model and contact closing','Graphic closings','The model diagram pairs with a final invitation, links and contact details.'],
  ],
  utility: [
    ['Compact contact button','Quick contact','A small plus button opens the existing contact and appearance tools.'],
    ['Labelled connect button','Quick contact','A labelled trigger opens the contact panel.'],
    ['Directional contact button','Quick contact','An arrow trigger opens the existing contact details.'],
    ['Message contact button','Quick contact','An envelope trigger opens a short contact note.'],
    ['Compass contact button','Quick contact','A compass trigger opens the contact panel.'],
  ],
  error: [
    ['Missing page with useful links','Return routes','The missing-page message offers home and service destinations.'],
    ['Image-backed missing page','Return routes','A landscape accompanies the missing-page explanation and home link.'],
    ['Large 404 marker','Return routes','A clear 404 marker and short explanation point back home.'],
    ['Missing-page note','Return routes','A short editorial note explains the missing page and offers a home link.'],
    ['Missing page and compass','Return routes','A model diagram accompanies the explanation and a route home.'],
  ],
};

// The original 45 shared compositions keep their stable IDs. Their old mood
// names are retained as metadata, but the picker uses actual spatial structure.
const compositions = [
  [6,'Canopy','arched split','split','An arched image beside the introduction, with content across the lower row.'],
  [7,'Fernhouse','tall image and list','list','A tall image column accompanies a narrow single-column content list.'],
  [8,'Glasshouse','framed heading and grid','grid','A framed heading and image sit above the main content grid.'],
  [9,'Understory','inset content panel','grid','A broad image sits behind an inset title and full-width content panel.'],
  [10,'Seedling','centred introduction and list','list','A centred title leads to a narrow content list with a small side image.'],
  [11,'Tidal','image horizon and ledge','image','An expansive image supports an overlapping heading and lower content ledge.'],
  [12,'Estuary','divided reading columns','list','A dividing channel separates the reading column from the image column.'],
  [13,'Shoreline','panorama and content grid','grid','A broad panorama separates the section introduction from the main content grid.'],
  [14,'Harbour','framed image and side panel','split','An introduction and image frame sit beside an anchored information panel.'],
  [15,'Sea Glass','circular image and inset panel','image','A circular image and offset introduction lead into a lower content shelf.'],
  [16,'Monolith','reading list and image plinth','list','A narrow reading list sits beside a tall image on a visual plinth.'],
  [17,'Clay Studio','staggered content grid','grid','An ordered introduction leads into a staggered content and image arrangement.'],
  [18,'Archway','arched image between columns','split','An arched image separates the title and context, above a full-width content row.'],
  [19,'Still Life','image frame and catalogue grid','grid','A framed image leads to an asymmetric caption and open content grid.'],
  [20,'Balance','balanced image and content','split','A split heading and image lead into a balanced context and content row.'],
  [21,'Folio','heading and reading spread','list','An oversized opening line sits over a split image and single-column reading spread.'],
  [22,'Dispatch','masthead and directory list','list','A ruled masthead sits above an image and compact single-column directory.'],
  [23,'Margin','annotated reading column','reading','A narrow context margin accompanies a generous essay column and finishing image.'],
  [24,'Anthology','cover and chapter list','list','A book-cover introduction faces a chapter-like list of existing content.'],
  [25,'Colophon','centred text and image strip','reading','A typographic central panel ends with a low image strip.'],
  [26,'Signal','title panel and modular grid','grid','A bold title panel leads into a modular information and image grid.'],
  [27,'Cutout','angular image and offset content','image','An angular image pairs with an offset title and lower content row.'],
  [28,'Assembly','framed title and content grid','grid','A framed title sits above an image row and full-width content grid.'],
  [29,'Wayfinder','directional spine and list','list','A directional title row connects the image, content list and side context.'],
  [30,'Playbill','centred title and reading columns','list','A bordered centred title introduces a set of narrow reading columns.'],
  [31,'Stillwater','quiet introduction and horizon','image','A restrained opening note gives way to a broad image and content beneath it.'],
  [32,'Linen','inset reading panel','list','A soft reading panel sits alongside an offset image column.'],
  [33,'Pause','narrow centred column','reading','The title, image, content and context follow a single centred reading column.'],
  [34,'Breathing Room','wide image and reading list','list','A wide image and generously separated single-column content list share the section.'],
  [35,'Soft Focus','circular image and centred panel','image','A circular vignette sits above a calm centred content panel.'],
  [36,'Afterglow','horizon and reading card','image','A broad horizon sits behind a raised title and reading card.'],
  [37,'Observatory','circular image and directory','list','A circular image faces an ordered side column of content.'],
  [38,'North Star','cross-grid introduction','grid','A strong introduction anchors image and context cells above the main content.'],
  [39,'Deep Current','vertical image and layered list','list','A tall image strip accompanies a layered single-column reading list.'],
  [40,'Moonrise','centred title and lower panels','grid','A centred introduction and circular horizon lead to balanced content panels.'],
  [41,'Paper Garden','stepped image and notes','split','An image and title share the opening, with stepped content notes beneath.'],
  [42,'Pebble','rounded image and content islands','image','A rounded image and title sit above separate content islands.'],
  [43,'Ribbon','title band and reading list','list','A distinct title band links to a long image and reading stage.'],
  [44,'Mosaic','interlocking introduction tiles','grid','An interlocking introduction grid sits above a full-width content collection.'],
  [45,'Postmark','postcard image and message','split','A framed image and title lead into a postcard-like message area.'],
  [46,'Atrium','central image and lower court','split','A tall image separates the introduction and context above the main content.'],
  [47,'Terrace','stepped image and content levels','grid','The image, context and main content occupy successive horizontal levels.'],
  [48,'Pavilion','title band and reading rooms','list','A roof-like title band shelters an image and a separate reading column.'],
  [49,'Contour','framed image and reading list','list','A framed image sits beside an offset, single-column content list.'],
  [50,'Threshold','framed entrance and content wall','split','A title and image share a framed entrance above a distinct content wall.'],
].map(([id,designName,structure,layout,description])=>({id,designName,structure,layout,description}));
const compositionIndex = new Map(compositions.map(entry=>[entry.id,entry]));

const nouns={navbar:'Navigation',footer:'Closing directory',hero:'Homepage opening',header:'Page introduction',statement:'Statement',services:'Service collection',features:'Feature collection',uses:'Application collection',cta:'Invitation',testimonials:'Participant quotes',story:'Story',process:'Step sequence',faq:'Question accordion',contact:'Enquiry form',resources:'Book collection',videos:'Video collection',gallery:'Image collection',utility:'Quick contact',error:'Missing page'};
const listGroups={services:'Rows & directories',features:'Lists & pathways',uses:'Lists & matrices',testimonials:'Quote lists',process:'Step lists',resources:'Book lists',videos:'Video lists',gallery:'Image lists'};
const gridGroups={services:'Cards & grids',features:'Cards & grids',uses:'Tags & clusters',testimonials:'Quote grids',process:'Step grids',resources:'Book grids',videos:'Video grids',gallery:'Image grids'};
const listContent={services:'The original services remain a linked collection.',features:'The existing feature descriptions remain together.',uses:'The existing application labels and explanation remain intact.',testimonials:'Only the original attributed participant feedback is used.',process:'The existing steps keep their original order.',resources:'Existing covers, descriptions and enquiry links remain together.',videos:'Existing videos keep their external viewing links.',gallery:'Existing illustrations keep their captions.'};

function extendedGroup(type,composition){
  if(type==='navbar')return ['Sculptural','Editorial'].includes(composition.collection)?'Two tiers':'Single row';
  if(type==='faq')return 'Accordions';
  if(type==='contact')return ['split','list'].includes(composition.layout)?'Split enquiry':'Image-led enquiry';
  if(type==='story')return ['list','reading'].includes(composition.layout)?'Reading layouts':'Split stories';
  if(type==='header')return 'Earlier image introductions';
  if(type==='footer')return composition.layout==='image'?'Image closings':'Link directories';
  if(type==='hero')return composition.layout==='image'?'Image-led openings':composition.layout==='grid'?'Graphic introductions':'Split introductions';
  if(type==='cta')return composition.layout==='image'?'Image invitations':'Graphic invitations';
  if(type==='statement')return composition.layout==='reading'?'Text first':'Graphic statements';
  return ['list','reading'].includes(composition.layout)?listGroups[type]||'Reading layouts':gridGroups[type]||'Cards & grids';
}

const navCollections = [
  ['garden navigation','Brand and links align in one row below a small information rail.','Single row'],
  ['coastal navigation','Brand faces the links and controls, above a small information rail.','Single row'],
  ['stacked navigation','Brand and controls sit above a centred row of navigation links.','Two tiers'],
  ['editorial navigation','A masthead and controls sit above a ruled row of page links.','Two tiers'],
  ['graphic navigation','A brand column faces a small information rail and links.','Single row'],
  ['quiet navigation','Brand, page links and controls share a restrained single row.','Single row'],
  ['framed navigation','A framed brand and links row sits above a small information rail.','Single row'],
  ['rounded navigation','A rounded panel contains the brand, links and controls.','Single row'],
  ['ruled navigation','A strong side rule anchors the brand, links and controls.','Single row'],
];
const navModes={1:'open links',2:'pill links',3:'underlined links',4:'divided links',5:'contained links'};
const navModeByCollection=[[1,2,3,4,5],[2,3,4,5,1],[3,4,5,1,2],[4,5,1,2,3],[5,1,2,3,4],[1,2,3,4,5],[2,3,4,5,1],[3,4,5,1,2],[4,5,1,2,3]];

export function existingEntry(type,id){
  if(id===0)return {id:0,type,category:type,name:'Original layout',group:'Original',description:'The original page layout, with your current colour and typography settings.'};
  const base=originalEntries[type]?.[id-1];
  if(id>=1&&id<=5&&base)return {id,type,category:type,name:base[0],group:base[1],description:base[2],legacy:false};
  const composition=compositionIndex.get(id);
  if(!composition||!categoryFor(type))return null;
  if(type==='navbar'){
    const collection=Math.floor((id-6)/5),offset=(id-6)%5,[name,description,group]=navCollections[collection];
    const mode=navModes[navModeByCollection[collection][offset]];
    return {id,type,category:type,name:`${name[0].toUpperCase()+name.slice(1)} · ${mode}`,group,description:`${description} This version uses ${mode}.`,designName:composition.designName,legacy:true};
  }
  return {id,type,category:type,name:`${nouns[type]} · ${composition.structure}`,group:extendedGroup(type,composition),description:`${composition.description}${listContent[type]?' '+listContent[type]:type==='contact'?' The live enquiry form and contact details are preserved.':type==='faq'?' The original questions expand to reveal their answers.':''}`,designName:composition.designName,legacy:true};
}

// Twenty shared compositions supplement the five purpose-specific originals.
// Header sections deliberately do not recommend full-page image compositions:
// those remain available as earlier explorations, not as default page headers.
const curated = {
  navbar:[6,7,8,11,12,16,17,21,22,26,27,31,32,36,37,41,42,46,47,48],
  footer:[6,8,13,17,19,20,21,22,23,25,26,28,31,32,34,38,40,44,48,50],
  hero:[6,7,9,11,12,13,15,16,18,20,21,26,27,31,34,36,37,40,42,46],
  header:[],
  services:[6,7,8,9,12,13,17,19,21,22,24,28,29,32,34,37,40,44,48,49],
  features:[6,8,9,10,13,17,19,20,21,23,26,28,29,32,34,38,40,44,47,50],
  statement:[6,10,13,18,20,21,23,25,26,28,30,31,32,33,35,38,40,43,45,50],
  cta:[6,8,10,11,13,15,18,20,25,26,28,30,31,32,33,35,36,40,45,50],
  faq:[6,8,10,12,13,16,19,21,22,23,24,25,29,30,32,33,34,39,48,49],
  contact:[6,7,8,12,14,16,18,20,21,22,23,24,28,32,34,37,39,46,48,49],
  testimonials:[6,8,9,10,13,17,19,20,21,23,25,28,31,32,33,34,35,40,45,50],
  story:[6,7,12,13,14,16,18,19,20,21,22,23,24,25,31,32,33,34,48,49],
  process:[6,8,10,12,13,19,21,22,23,24,26,28,29,30,32,33,38,39,43,47],
  uses:[6,8,10,12,13,17,19,20,21,23,26,28,29,32,33,38,40,44,47,50],
  resources:[6,7,8,12,13,16,17,19,21,22,24,28,31,32,34,37,40,44,48,49],
  videos:[6,8,9,12,13,17,19,20,21,22,24,28,31,32,34,37,40,44,47,48],
  gallery:[6,8,9,13,15,17,19,20,21,24,27,28,31,35,37,40,41,42,44,47],
  utility:[],
  error:[],
};

export const existingRecommendations = Object.fromEntries(categories.map(({type})=>[type,[1,2,3,4,5,...curated[type]].map(id=>existingEntry(type,id))]));
export const recommendedIds = type => (existingRecommendations[type]||[]).map(entry=>entry.id);
