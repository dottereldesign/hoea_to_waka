// Stable IDs: never reorder. Existing browser choices 0–5 remain unchanged.
const collections = {
  Botanical: {bg:'#edf0e5',ink:'#263a28',muted:'#52614e',surface:'#fafbf4',accent:'#d0dfa4',line:'#b5c1aa',image:'forest',font:'serif'},
  Coastal: {bg:'#e9f2f1',ink:'#123c44',muted:'#466970',surface:'#f8fcfa',accent:'#b2d6d0',line:'#aec8c9',image:'tide',font:'sans'},
  Sculptural: {bg:'#f1e8dc',ink:'#49382e',muted:'#746053',surface:'#fff8ef',accent:'#e1b39a',line:'#cbbbaf',image:'sculpture',font:'serif'},
  Editorial: {bg:'#f8f5ef',ink:'#302c31',muted:'#68616a',surface:'#fffdfa',accent:'#e5ced2',line:'#cfc8cc',image:'ocean',font:'serif'},
  Graphic: {bg:'#f2edcb',ink:'#252c48',muted:'#565a70',surface:'#fffbed',accent:'#d8dd8e',line:'#bdbda8',image:'sculpture',font:'sans'},
  Quiet: {bg:'#f6f5f1',ink:'#3b4546',muted:'#626f70',surface:'#fffefa',accent:'#dce5df',line:'#c5ceca',image:'forest',font:'serif'},
  Nocturnal: {bg:'#111d28',ink:'#edf4ed',muted:'#b4c6cd',surface:'#20303e',accent:'#243f50',line:'#50616d',image:'tide',font:'sans'},
  Playful: {bg:'#f6e7dc',ink:'#4a3138',muted:'#76565c',surface:'#fff5eb',accent:'#eac0b1',line:'#ceaca9',image:'sculpture',font:'sans'},
  Architectural: {bg:'#e6e9e3',ink:'#283931',muted:'#53665a',surface:'#f7f8f1',accent:'#c6d0b6',line:'#acbbae',image:'forest',font:'sans'},
};
// Each entry owns its composition, content arrangement, type scale, and motion.
const entries = [
  ['Canopy','Botanical','canopy','A leafy overhead frame with a grounded two-column story.','Leaf unfurl',1],
  ['Fernhouse','Botanical','fernhouse','A tall botanical window beside a narrow reading column.','Frond sweep',2],
  ['Glasshouse','Botanical','glasshouse','A transparent architectural frame and a broad picture shelf.','Glass resolve',3],
  ['Understory','Botanical','understory','Deep landscape above a sheltered inset reading panel.','Forest rise',4],
  ['Seedling','Botanical','seedling','Compact central statement branching into a three-part base.','Seed spring',5],
  ['Tidal','Coastal','tidal','An expansive tide with a lower-left information ledge.','Tide roll',2],
  ['Estuary','Coastal','estuary','A bifurcated composition with a slender connecting channel.','Channel drift',3],
  ['Shoreline','Coastal','shoreline','A horizontal panorama between an open title and text shore.','Foam reveal',4],
  ['Harbour','Coastal','harbour','A harbour-window composition with an anchored side directory.','Anchor settle',5],
  ['Sea Glass','Coastal','sea-glass','Soft circular imagery and translucent offset content panes.','Glass float',1],
  ['Monolith','Sculptural','monolith','A monumental title column facing a tall sculptural plinth.','Stone lift',3],
  ['Clay Studio','Sculptural','clay-studio','Rounded blocks with a handmade, staggered gallery rhythm.','Clay press',4],
  ['Archway','Sculptural','archway','An arched central portal between two balanced text wings.','Portal open',5],
  ['Still Life','Sculptural','still-life','A framed object study with an asymmetric catalogue caption.','Object focus',1],
  ['Balance','Sculptural','balance','Two suspended panels balanced across an oversized fine rule.','Balance ease',2],
  ['Folio','Editorial','folio','An oversized opening line with a split magazine spread below.','Page glide',4],
  ['Dispatch','Editorial','dispatch','A newsprint masthead, leading visual and compact side column.','Dispatch slide',5],
  ['Margin','Editorial','margin','A narrow annotated margin beside a generously spaced essay.','Margin trace',1],
  ['Anthology','Editorial','anthology','A book-cover introduction and a chapter-by-chapter collection.','Chapter turn',2],
  ['Colophon','Editorial','colophon','A typographic closing plate and a quiet bottom image strip.','Ink emerge',3],
  ['Signal','Graphic','signal','An oversized sign panel with sharply contrasted information blocks.','Signal snap',5],
  ['Cutout','Graphic','cutout','An angular image cutout and offset, tightly framed typography.','Cutout slide',1],
  ['Assembly','Graphic','assembly','A modular grid with a full-width headline and numbered units.','Grid assemble',2],
  ['Wayfinder','Graphic','wayfinder','A directional spine linking an image, headline and content bays.','Route draw',3],
  ['Playbill','Graphic','playbill','A centred poster with ruled sidebars and a dramatic type hierarchy.','Poster drop',4],
  ['Stillwater','Quiet','stillwater','A small opening note with generous silence around a long horizon.','Water breathe',1],
  ['Linen','Quiet','linen','Soft inset panels, restrained type and a restful reading rhythm.','Linen settle',2],
  ['Pause','Quiet','pause','A deliberately narrow central column framed by open space.','Quiet fade',3],
  ['Breathing Room','Quiet','breathing-room','A wide asymmetric image with a distant, low-density text column.','Air expand',4],
  ['Soft Focus','Quiet','soft-focus','A circular vignette above a calm, centred information panel.','Focus clear',5],
  ['Afterglow','Nocturnal','afterglow','A luminous horizon behind a grounded night-time reading card.','Horizon glow',2],
  ['Observatory','Nocturnal','observatory','A circular viewing aperture with a precise side instrument panel.','Aperture widen',3],
  ['North Star','Nocturnal','north-star','A compass-like cross grid around a strong central statement.','Star align',4],
  ['Deep Current','Nocturnal','deep-current','A vertical current of imagery running beside layered content.','Current climb',5],
  ['Moonrise','Nocturnal','moonrise','A low circular horizon, centred title and balanced lower panels.','Moon ascent',1],
  ['Paper Garden','Playful','paper-garden','Cut-paper image panels with friendly, stepped content notes.','Paper flutter',3],
  ['Pebble','Playful','pebble','Organic pebble-shaped imagery with rounded, offset content islands.','Pebble bounce',4],
  ['Ribbon','Playful','ribbon','A coloured ribbon links the opening title and a long content stage.','Ribbon unwind',5],
  ['Mosaic','Playful','mosaic','An interlocking tile composition with a large headline tile.','Tile arrival',1],
  ['Postmark','Playful','postmark','A postcard face, perforated edge and a handwritten-style aside.','Postcard land',2],
  ['Atrium','Architectural','atrium','A tall central lightwell between two ordered content volumes.','Lightwell open',4],
  ['Terrace','Architectural','terrace','Stepped horizontal levels with an image on the upper terrace.','Terrace build',5],
  ['Pavilion','Architectural','pavilion','A roof-like title band sheltering two broad content spaces.','Roof extend',1],
  ['Contour','Architectural','contour','An inset landscape with fine contour rules and an offset text field.','Contour trace',2],
  ['Threshold','Architectural','threshold','A framed entrance, bold vertical divide and welcoming content wall.','Threshold pass',3],
];
export const directions = entries.map(([name,collection,slug,description,motion,mode],i)=>({id:i+6,name,collection,slug,description,motion,mode,...collections[collection]}));
export const MAX_VARIANT = 50;
export const direction = id => directions[id-6];
export const colourStyle = d => `--ds-bg:${d.bg};--ds-ink:${d.ink};--ds-muted:${d.muted};--ds-surface:${d.surface};--ds-accent:${d.accent};--ds-line:${d.line};--ex-font:${d.font==='serif'?"'Crimson Text',Georgia,serif":"Manrope,Arial,sans-serif"}`;
export function entryMotion(id) {
  const d=direction(id); if(!d)return null;
  // Each direction has its own vector, duration and stagger, rather than one repeated entrance.
  const amplitude=12+(id-6)*.65;
  const from=[{opacity:0,y:amplitude},{opacity:0,x:-amplitude},{opacity:0,scale:.88+(id%4)*.02},{opacity:0,rotate:(id%2?1:-1)*(1+id*.025),y:amplitude/2},{opacity:0,filter:`blur(${3+id%6}px)`,y:-amplitude/3}][d.mode-1];
  return {from,to:{opacity:1,x:0,y:0,scale:1,rotate:0,filter:'blur(0px)'},duration:.43+(id-6)*.009,stagger:.018+(id%7)*.006};
}
