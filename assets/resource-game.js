(()=>{
 const root=document.querySelector('#resource-play');if(!root)return;
 const C=window.MaoriWordleCore,W=window.MaoriWordleWords,start=root.querySelector('[data-game-start]');
 if(!C||!W){start.querySelector('span').textContent='Reload to play';return;}
 const $=s=>root.querySelector(s),storageKey='hoea-maori-wordle-v1',intro=$('[data-wordle-intro]'),game=$('[data-wordle-game]'),input=$('#mw-guess'),board=$('[data-wordle-board]'),keyboard=$('[data-wordle-keyboard]'),form=$('[data-wordle-form]'),message=$('[data-wordle-message]'),result=$('[data-wordle-result]');
 const help=$('.mw-help');
 $('[data-wordle-info]').addEventListener('click',()=>help.showModal());
 $('[data-wordle-help-close]').addEventListener('click',()=>help.close());
 help.addEventListener('click',e=>{if(e.target===help){const r=help.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)help.close();}});
 const symbols={correct:'✓',present:'↔',absent:'–'},names={correct:'right place',present:'elsewhere in word',absent:'not in word'},priority={absent:1,present:2,correct:3};
 let state=null;try{const saved=JSON.parse(localStorage.getItem(storageKey));if(C.valid(saved,W.answers,W.allowed))state=saved;}catch{}
 state=state||C.next(null,W.answers);
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}};
 const finished=()=>state&&(state.guesses.includes(state.answer)||state.guesses.length===6);
 const say=text=>{message.textContent=text;};
 function render(){
  board.replaceChildren();const keys={};
  for(let r=0;r<6;r++){
   const row=document.createElement('div');row.className='mw-row';row.setAttribute('role','group');row.setAttribute('aria-label',`Guess ${r+1}`);
   const guess=state.guesses[r],letters=Array.from(guess||(r===state.guesses.length&&!finished()?C.normalise(input.value):'')),scores=guess?C.score(guess,state.answer):[];
   for(let col=0;col<5;col++){
    const tile=document.createElement('span');tile.className='mw-tile';tile.setAttribute('role','img');const letter=letters[col]||'';tile.textContent=letter.toUpperCase();
    if(scores[col]){const status=scores[col];tile.dataset.state=status;const mark=document.createElement('small');mark.textContent=symbols[status];mark.setAttribute('aria-hidden','true');tile.append(mark);tile.setAttribute('aria-label',`${letter.toUpperCase()}: ${names[status]}`);if(!keys[letter]||priority[status]>priority[keys[letter]])keys[letter]=status;}
    else tile.setAttribute('aria-label',letter?`${letter.toUpperCase()}, not submitted`:`Empty tile ${col+1}`);
    row.append(tile);
   }board.append(row);
  }
  keyboard.querySelectorAll('[data-letter]').forEach(b=>{const s=keys[b.dataset.letter];if(s)b.dataset.state=s;else delete b.dataset.state;b.setAttribute('aria-label',b.textContent+(s?`, ${names[s]}`:''));b.disabled=finished();});
  $('[data-wordle-progress]').textContent=`${state.guesses.length} of 6 guesses`;
  form.hidden=finished();keyboard.hidden=finished();result.hidden=!finished();
  if(finished()){
   const won=state.guesses.includes(state.answer);$('[data-wordle-result-text]').textContent=(won?'You found it: ':'The word was ')+state.answer.toUpperCase()+'.';
  }
 }
 function cleanInput(){if(!state||finished())return;const clean=v=>Array.from(C.normalise(v).replace(/[^aeghikmnoprtuwāēīōū]/gu,'')).slice(0,5).join('').toUpperCase();const caret=clean(input.value.slice(0,input.selectionStart??input.value.length)).length;input.value=clean(input.value);input.setSelectionRange(caret,caret);render();}
 function editGuess(letter='') {
  if(finished())return;
  let a=input.selectionStart??input.value.length,b=input.selectionEnd??a;
  if(!letter&&a===b)a=Math.max(0,a-1);
  input.setRangeText(letter,a,b,'end');
  cleanInput();
  input.focus({preventScroll:true});
 }

 const layouts=[
  {name:'Grouped',note:'Vowels, macrons and balanced consonant rows.',rows:['aeiou','āēīōū','hkmnp','rtwg']},
  {name:'QWERTY-style',note:'Familiar keyboard ordering, with Māori characters only.',rows:['wertuiop','ahk','ngm','āēīōū']},
  {name:'Vowel pairs',note:'Each vowel sits directly above its macron partner.',rows:['aeiou','āēīōū','hkmnp','rtwg']},
  {name:'Alphabet grid',note:'An even grid, with vowel variants beside each other.',rows:['aāeēg','hiīk m'.replaceAll(' ',''),'noōpr','tuūw']},
  {name:'Type + macrons',note:'Type using your device keyboard. These shortcuts add macrons.',rows:['āēīōū']}
 ];
 const erase=document.createElement('button');erase.type='button';erase.className='mw-backspace';erase.setAttribute('aria-label','Delete');erase.title='Backspace';erase.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h12v14H9l-7-7zM12 9l6 6m0-6-6 6"/></svg>';erase.addEventListener('click',()=>editGuess());input.after(erase);
 const options=document.createElement('div');options.className='mw-keyboard-options';options.setAttribute('role','group');options.setAttribute('aria-label','Compare keyboard layouts');
 const caption=document.createElement('p');caption.className='mw-layout-caption';caption.setAttribute('aria-live','polite');
 keyboard.after(options,caption);
 function setLayout(index){
  const layout=layouts[index];root.dataset.keyboardLayout=String(index+1);keyboard.replaceChildren();
  layout.rows.forEach(letters=>{const row=document.createElement('div');row.className='mw-key-row';for(const letter of letters){const button=document.createElement('button');button.type='button';button.dataset.letter=letter;button.textContent=letter.toUpperCase();button.addEventListener('click',()=>editGuess(letter));row.append(button);}keyboard.append(row);});
  erase.hidden=index===4;
  options.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  caption.textContent=layout.name+' — '+layout.note;
  render();
 }
 layouts.forEach((layout,index)=>{const button=document.createElement('button');button.type='button';button.textContent=String(index+1).padStart(2,'0');button.setAttribute('aria-label',String(index+1)+': '+layout.name);button.title=layout.name;button.addEventListener('click',()=>setLayout(index));options.append(button);});
 setLayout(0);
 input.addEventListener('input',e=>{if(!e.isComposing)cleanInput();});input.addEventListener('compositionend',cleanInput);
 form.addEventListener('submit',e=>{
  e.preventDefault();if(finished())return;const guess=C.normalise(input.value);
  if(Array.from(guess).length!==5){say('Enter five letters before guessing.');input.focus({preventScroll:true});return;}
  if(!W.allowed.includes(guess)){say('That word isn’t in this game’s list. Try another; no guess was used.');input.focus({preventScroll:true});return;}
  if(state.guesses.includes(guess)){say('You’ve already tried that word. Try a different one.');return;}
  state.guesses.push(guess);input.value='';save();render();
  const feedback=Array.from(guess).map((l,i)=>`${l.toUpperCase()} ${names[C.score(guess,state.answer)[i]]}`).join('; ');
  if(finished()){say((guess===state.answer?`You found ${state.answer.toUpperCase()} in ${state.guesses.length} guesses!`:`The word was ${state.answer.toUpperCase()}.`));$('[data-wordle-next]').focus({preventScroll:true});}
  else {say(`Guess ${state.guesses.length}: ${feedback}.`);input.focus({preventScroll:true});}
 });
 render();
 start.addEventListener('click',()=>{save();intro.hidden=true;game.hidden=false;root.classList.add('is-playing');render();say('');if(finished())$('[data-wordle-next]').focus({preventScroll:true});else input.focus({preventScroll:true});});
 $('[data-wordle-next]').addEventListener('click',()=>{state=C.next(state,W.answers);input.value='';save();render();say('A new word is ready.');input.focus({preventScroll:true});});
 $('[data-wordle-close]').addEventListener('click',()=>{game.hidden=true;intro.hidden=false;root.classList.remove('is-playing');start.querySelector('span').textContent='Start Game';start.focus({preventScroll:true});});
})();
