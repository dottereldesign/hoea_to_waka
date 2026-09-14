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
  [
    "instrument-serif",
    "Instrument Serif",
    "serif",
    "Narrow, expressive editorial titles",
    "400",
    true,
    400
  ],
  [
    "playfair-display",
    "Playfair Display",
    "serif",
    "Crisp contrast and confident magazine headings",
    "400..800",
    true,
    600
  ],
  [
    "eb-garamond",
    "EB Garamond",
    "serif",
    "Elegant, restrained old-style typography",
    "400..800",
    true,
    500
  ],
  [
    "libre-baskerville",
    "Libre Baskerville",
    "serif",
    "Broad, assured forms with literary warmth",
    "400;700",
    false,
    400
  ],
  [
    "spectral",
    "Spectral",
    "serif",
    "Clean editorial detail with a calm rhythm",
    "400;500;600;700;800",
    true,
    500
  ],
  [
    "alegreya",
    "Alegreya",
    "serif",
    "Lively calligraphic shapes and human warmth",
    "400..800",
    true,
    500
  ],
  [
    "crimson-pro",
    "Crimson Pro",
    "serif",
    "Refined book typography with generous clarity",
    "400..800",
    true,
    500
  ],
  [
    "vollkorn",
    "Vollkorn",
    "serif",
    "Grounded, substantial forms for warm headings",
    "400..800",
    true,
    600
  ],
  [
    "cardo",
    "Cardo",
    "serif",
    "Quiet, classical shapes with open proportions",
    "400;700",
    false,
    400
  ],
  [
    "merriweather",
    "Merriweather",
    "serif",
    "Sturdy, compact serif with strong screen presence",
    "400..800",
    true,
    600
  ],
  [
    "young-serif",
    "Young Serif",
    "serif",
    "Rounded, chunky display serif with personality",
    "400",
    false,
    400
  ],
  [
    "eczar",
    "Eczar",
    "serif",
    "Expressive, sculptural shapes and striking details",
    "400..800",
    false,
    500
  ],
  [
    "instrument-sans",
    "Instrument Sans",
    "sans-serif",
    "Precise contemporary sans with a warm edge",
    "400..700",
    true,
    500
  ],
  [
    "inter",
    "Inter",
    "sans-serif",
    "Neutral, exceptionally clear interface rhythm",
    "400..800",
    true,
    500
  ],
  [
    "source-sans-3",
    "Source Sans 3",
    "sans-serif",
    "Open humanist shapes for comfortable reading",
    "400..800",
    true,
    500
  ],
  [
    "work-sans",
    "Work Sans",
    "sans-serif",
    "Practical, slightly characterful reading sans",
    "400..800",
    true,
    500
  ],
  [
    "karla",
    "Karla",
    "sans-serif",
    "Friendly grotesque with distinctive proportions",
    "400..800",
    true,
    500
  ],
  [
    "noto-sans",
    "Noto Sans",
    "sans-serif",
    "Warm, familiar humanist text with soft curves",
    "400..800",
    true,
    700
  ],
  [
    "nunito-sans",
    "Nunito Sans",
    "sans-serif",
    "Soft, open forms for approachable reading",
    "400..800",
    true,
    500
  ],
  [
    "hanken-grotesk",
    "Hanken Grotesk",
    "sans-serif",
    "Clear, balanced sans for a quiet body voice",
    "400..800",
    true,
    500
  ]
].map(([id,name,fallback,note,weights,italics,headingWeight])=>({id,name,fallback,note,weights,italics,headingWeight,stack:`"${name}", ${fallback}`}));
export const roles = [
  ['display','Display headings','Large page titles and hero statements'],
  ['heading','Section & card headings','Section titles, cards and accordions'],
  ['body','Paragraphs','Reading text, lists and form entries'],
  ['eyebrow','Eyebrows','Overlines, numbered labels and kickers'],
  ['ui','Buttons & navigation','Actions, navigation and field labels'],
  ['small','Captions & small print','Captions, metadata and footer details'],
].map(([id,name,note])=>({id,name,note}));
export const pairings = [
  [
    "editorial-clarity",
    "Editorial clarity",
    "instrument-serif",
    "instrument-sans"
  ],
  [
    "modern-magazine",
    "Modern magazine",
    "playfair-display",
    "inter"
  ],
  [
    "quiet-literary",
    "Quiet literary",
    "eb-garamond",
    "source-sans-3"
  ],
  [
    "assured-warmth",
    "Assured warmth",
    "libre-baskerville",
    "noto-sans"
  ],
  [
    "clear-perspective",
    "Clear perspective",
    "spectral",
    "hanken-grotesk"
  ],
  [
    "human-story",
    "Human story",
    "alegreya",
    "work-sans"
  ],
  [
    "thoughtful-journal",
    "Thoughtful journal",
    "crimson-pro",
    "source-sans-3"
  ],
  [
    "grounded-voice",
    "Grounded voice",
    "vollkorn",
    "nunito-sans"
  ],
  [
    "classic-conversation",
    "Classic conversation",
    "cardo",
    "karla"
  ],
  [
    "practical-editorial",
    "Practical editorial",
    "merriweather",
    "inter"
  ],
  [
    "friendly-statement",
    "Friendly statement",
    "young-serif",
    "instrument-sans"
  ],
  [
    "expressive-print",
    "Expressive print",
    "eczar",
    "work-sans"
  ],
  [
    "light-and-open",
    "Light and open",
    "instrument-serif",
    "hanken-grotesk"
  ],
  [
    "polished-humanist",
    "Polished humanist",
    "playfair-display",
    "noto-sans"
  ],
  [
    "book-and-screen",
    "Book and screen",
    "eb-garamond",
    "inter"
  ],
  [
    "warm-and-direct",
    "Warm and direct",
    "libre-baskerville",
    "source-sans-3"
  ],
  [
    "gentle-rhythm",
    "Gentle rhythm",
    "spectral",
    "nunito-sans"
  ],
  [
    "character-and-clarity",
    "Character and clarity",
    "alegreya",
    "instrument-sans"
  ],
  [
    "quiet-craft",
    "Quiet craft",
    "crimson-pro",
    "karla"
  ],
  [
    "substantial-and-soft",
    "Substantial and soft",
    "vollkorn",
    "hanken-grotesk"
  ]
].map(([id,name,heading,body])=>({id,name,note:`${fonts.find(f=>f.id===heading).note}. Paired with ${fonts.find(f=>f.id===body).name} for paragraphs and navigation.`,roles:{display:heading,heading,body,eyebrow:body,ui:body,small:body}}));
export const fontsForRole=role=>fonts.filter(f=>f.fallback===(["display","heading"].includes(role)?"serif":"sans-serif"));

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
