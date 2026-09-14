// Chromatic families: anchor, counterpoint, highlight, atmosphere, neutral.
export const palettes = [
  {id:'tidal-bloom',name:'Tidal Bloom',note:'Deep teal · apricot · lavender · shell',story:'A calm coastal foundation, warmed by apricot and lifted by a lavender counterpoint.',colours:['#175d62','#b65d3e','#8b73b2','#82b6a4','#d9d4c8']},
  {id:'aubergine-garden',name:'Aubergine Garden',note:'Aubergine · pistachio · rose · chalk',story:'Rich aubergine gives pistachio and dusty rose room to breathe on warm rose chalk.',colours:['#613c59','#7b8f4b','#bb7189','#c49c4e','#dcd1d1']},
  {id:'cobalt-atelier',name:'Cobalt Atelier',note:'Cobalt · vermilion · butter · porcelain',story:'Gallery-like porcelain and confident cobalt, with a warm vermilion accent and soft butter highlights.',colours:['#284cb4','#be503c','#d1b858','#8daaba','#d2d5dc']},
  {id:'terracotta-sky',name:'Terracotta Sky',note:'Clay · denim · sage · limestone',story:'Tactile clay meets cool denim. Sage and peach soften the architectural limestone base.',colours:['#9b503b','#416b8b','#7f9477','#d5a17c','#dbd1c2']},
  {id:'moss-mulberry',name:'Moss & Mulberry',note:'Moss · mulberry · marigold · oat',story:'Quiet moss and oat carry the reading experience; mulberry and marigold bring depth and energy.',colours:['#53694a','#864966','#c49938','#87b9b2','#d8d2be']},
  {id:'midnight-citrus',name:'Midnight Citrus',note:'Indigo · citron · orchid · moonstone',story:'An inky foundation with luminous citron, a soft orchid counterpoint and glacial blue atmosphere.',colours:['#3e4788','#999e38','#ad76a5','#84acbf','#d1d2dc']},
  {id:'rosewood-lagoon',name:'Rosewood Lagoon',note:'Rosewood · lagoon · melon · blush',story:'Warm rosewood and melon are balanced by lagoon blue and a quiet lilac undertone.',colours:['#83494f','#247c80','#cf9167','#a18cba','#dfd0c9']},
  {id:'ochre-archive',name:'Ochre Archive',note:'Ink · ochre · eucalyptus · parchment',story:'Scholarly ink and parchment with ochre annotations, eucalyptus surfaces and muted coral detail.',colours:['#364b56','#ac7a2f','#729987','#bd7e6b','#ddd2b9']},
  {id:'arctic-poppy',name:'Arctic Poppy',note:'Petrol · poppy · periwinkle · ice',story:'Cool, clear petrol and ice give warm poppy accents a purposeful focal role.',colours:['#235e75','#bd514c','#888ec5','#90bba7','#d0dce0']},
  {id:'plum-sorbet',name:'Plum Sorbet',note:'Plum · persimmon · turquoise · vanilla',story:'Expressive plum, rounded out by persimmon warmth, fresh turquoise and soft lemon.',colours:['#704a7a','#bd6740','#4c9b9a','#c8b960','#ded4c4']},
];
export const fonts = [
  ['manrope','Manrope','sans-serif','Clean, open geometric sans'],
  ['dm-sans','DM Sans','sans-serif','Warm, balanced reading sans'],
  ['plus-jakarta-sans','Plus Jakarta Sans','sans-serif','Confident contemporary geometry'],
  ['space-grotesk','Space Grotesk','sans-serif','Characterful technical sans'],
  ['sora','Sora','sans-serif','Crisp, substantial digital type'],
  ['outfit','Outfit','sans-serif','Soft, friendly geometric forms'],
  ['fraunces','Fraunces','serif','Expressive, soft editorial serif'],
  ['newsreader','Newsreader','serif','Literary detail and reading rhythm'],
  ['source-serif-4','Source Serif 4','serif','Sturdy, considered text serif'],
  ['ibm-plex-mono','IBM Plex Mono','monospace','Precise labels and annotation'],
  ['archivo','Archivo','sans-serif','Compact editorial sans with a confident rhythm'],
  ['bricolage-grotesque','Bricolage Grotesque','sans-serif','Expressive headlines with lively, human details'],
  ['figtree','Figtree','sans-serif','Friendly reading sans with generous clarity'],
  ['geist','Geist','sans-serif','Restrained contemporary interface typography'],
  ['public-sans','Public Sans','sans-serif','Straightforward, sturdy humanist sans'],
  ['lora','Lora','serif','Warm calligraphic detail for considered reading'],
  ['literata','Literata','serif','Bookish, open forms for longer text'],
  ['cormorant-garamond','Cormorant Garamond','serif','Delicate, high-contrast editorial headings'],
  ['bodoni-moda','Bodoni Moda','serif','Dramatic contrast and refined display proportions'],
  ['dm-serif-display','DM Serif Display','serif','Bold, compact serif statements'],
].map(([id,name,fallback,note])=>({id,name,fallback,note,stack:`"${name}", ${fallback}`}));
export const roles = [
  ['display','Display headings','Large page titles and hero statements'],
  ['heading','Section & card headings','Section titles, cards and accordions'],
  ['body','Paragraphs','Reading text, lists and form entries'],
  ['eyebrow','Eyebrows','Overlines, numbered labels and kickers'],
  ['ui','Buttons & navigation','Actions, navigation and field labels'],
  ['small','Captions & small print','Captions, metadata and footer details'],
].map(([id,name,note])=>({id,name,note}));
export const pairings = [
  ['coastal-editorial','Coastal editorial','Warm, expressive titles with clean, open reading text.','fraunces','manrope','manrope'],
  ['quiet-journal','Quiet journal','Literary headlines with an unhurried, human reading rhythm.','newsreader','dm-sans','dm-sans'],
  ['modern-humanist','Modern humanist','Confident geometry softened by a friendly paragraph face.','plus-jakarta-sans','dm-sans','plus-jakarta-sans'],
  ['field-atlas','Field atlas','Technical headings and annotated details, grounded by calm body text.','space-grotesk','manrope','ibm-plex-mono'],
  ['soft-geometry','Soft geometry','Friendly rounded shapes for an approachable, cohesive voice.','outfit','dm-sans','outfit'],
  ['digital-craft','Digital craft','Distinct digital headlines with restrained interface text.','sora','manrope','space-grotesk'],
  ['literary-studio','Literary studio','A sturdy editorial serif with crisp sans-serif navigation.','source-serif-4','source-serif-4','manrope'],
  ['expressive-archive','Expressive archive','Characterful display serif, reading serif and precise annotations.','fraunces','newsreader','ibm-plex-mono'],
  ['clear-current','Clear current','One versatile family creates a clear, consistent hierarchy.','manrope','manrope','manrope'],
  ['civic-notes','Civic notes','Practical serif headings, readable sans paragraphs and mono details.','source-serif-4','dm-sans','ibm-plex-mono'],
  ['warm-dialogue','Warm dialogue','Characterful headings with a friendly reading voice.','bricolage-grotesque','figtree','figtree'],
  ['contemporary-book','Contemporary book','Warm literary titles above a sturdy humanist body.','lora','public-sans','public-sans'],
  ['clear-editorial','Clear editorial','Compact headline shapes and a restrained interface.','archivo','geist','geist'],
  ['considered-essay','Considered essay','Bookish reading rhythm with clean supporting details.','literata','literata','public-sans'],
  ['graceful-space','Graceful space','Fine editorial headings balanced with open, readable text.','cormorant-garamond','figtree','figtree'],
  ['bold-journal','Bold journal','Weighty serif statements and understated reading text.','dm-serif-display','dm-sans','public-sans'],
  ['modern-colophon','Modern colophon','Crisp fashion-editorial contrast with a quiet digital body.','bodoni-moda','geist','geist'],
  ['public-conversation','Public conversation','An accessible-feeling, direct sans system for practical information.','public-sans','public-sans','ibm-plex-mono'],
  ['friendly-notes','Friendly notes','An inviting all-sans family with restrained labels.','figtree','figtree','archivo'],
  ['craft-and-clarity','Craft and clarity','Expressive sans titles, warm serif reading and precise annotations.','bricolage-grotesque','lora','geist'],
].map(([id,name,note,heading,body,detail])=>({id,name,note,roles:{display:heading,heading,body,eyebrow:detail,ui:fonts.find(f=>f.id===body)?.fallback==='serif'?'manrope':body,small:detail}}));

export function rgb(hex){return hex.replace('#','').match(/../g).slice(0,3).map(v=>parseInt(v,16));}
export function hex(channels){return '#'+channels.map(c=>Math.round(Math.max(0,Math.min(255,c))).toString(16).padStart(2,'0')).join('');}
export function luminance(colour){return rgb(colour).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);}
export function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function mix(a,b,t){const x=rgb(a),y=rgb(b);return hex(x.map((c,i)=>c+(y[i]-c)*t));}
// Retain tonal hierarchy while replacing hue; binary search also protects legacy contrast.
export function tone(seed,target){let low=0,high=1;const end=target>luminance(seed)?'#ffffff':'#000000';for(let i=0;i<18;i++){const t=(low+high)/2,c=mix(seed,end,t);if((luminance(c)<target)===(end==='#ffffff'))low=t;else high=t;}return mix(seed,end,(low+high)/2);}
export function foreground(bg){const choice=contrast('#172126',bg)>contrast('#fffdf8',bg)?'#172126':'#fffdf8';return contrast(choice,bg)>=4.6?choice:contrast('#000000',bg)>contrast('#ffffff',bg)?'#000000':'#ffffff';}
export function normaliseColour(value){
  if(value[0]==='#'){let h=value.slice(1).toLowerCase();if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');return {colour:'#'+h.slice(0,6),alpha:h.length===8?parseInt(h.slice(6),16)/255:1};}
  if(value==='white')return {colour:'#ffffff',alpha:1};if(value==='black')return {colour:'#000000',alpha:1};
  const n=value.match(/[\d.]+/g)?.map(Number);return n?.length>=3?{colour:hex(n.slice(0,3)),alpha:n[3]??1}:null;
}
export const colourVariable = value => `--paint-${normaliseColour(value).colour.slice(1)}`;
export function colourReference(value){const c=normaliseColour(value);const base=`var(--paint-${c.colour.slice(1)}, ${c.colour})`;return c.alpha===1?base:`color-mix(in srgb, ${base} ${+(c.alpha*100).toFixed(3)}%, transparent)`;}
export function legacyColour(original,palette){
  const channels=rgb(original),max=Math.max(...channels),min=Math.min(...channels),delta=max-min;
  let family=4;
  if(delta>18){let hue=delta===0?0:max===channels[0]?((channels[1]-channels[2])/delta)%6:max===channels[1]?(channels[2]-channels[0])/delta+2:(channels[0]-channels[1])/delta+4;hue=(hue*60+360)%360;family=hue<45||hue>=335?1:hue<85?2:hue<170?3:hue<265?0:2;}
  // Neutral darks lean into the anchor; neutral lights use the palette's paper tone.
  const seed=family===4&&luminance(original)<.2?mix(palette.colours[0],palette.colours[4],.2):palette.colours[family];
  return tone(seed,Math.min(.975,Math.max(.004,luminance(original))));
}
export function semanticTokens(palette,dark=false){
  const [anchor,counter,highlight,atmosphere,neutral]=palette.colours;
  const bg=tone(dark?anchor:neutral,dark?.009:.93),surface=tone(dark?anchor:neutral,dark?.018:.975),raised=tone(dark?anchor:neutral,dark?.035:.87);
  const ink=tone(dark?neutral:anchor,dark?.91:.012),muted=tone(dark?neutral:anchor,dark?.55:.09),action=tone(anchor,dark?.55:.09);
  return {bg,surface,raised,ink,muted,action,'on-action':foreground(action),line:tone(dark?neutral:anchor,dark?.24:.38),soft:tone(atmosphere,dark?.05:.78),accent:tone(counter,dark?.24:.67),'on-accent':foreground(tone(counter,dark?.24:.67)),highlight:tone(highlight,dark?.32:.81),'on-highlight':foreground(tone(highlight,dark?.32:.81)),'component-accent':tone(highlight,dark?.065:.81),'component-counter':tone(counter,dark?.06:.67),inverse:tone(anchor,.014),'on-inverse':tone(neutral,.94),'inverse-muted':tone(neutral,.65),focus:tone(counter,dark?.65:.08),success:dark?'#9bd7b3':'#245d3b',error:dark?'#ffb8b0':'#9f292b'};
}
