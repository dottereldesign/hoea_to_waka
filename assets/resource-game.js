(()=>{
 const root=document.querySelector('#resource-play');if(!root)return;
 const C=window.MaoriWordleCore,W=window.MaoriWordleWords,start=root.querySelector('[data-game-start]');
 if(!C||!W){start.querySelector('span').textContent='Reload to play';return;}
 const $=s=>root.querySelector(s),storageKey='hoea-maori-wordle-v1',intro=$('[data-wordle-intro]'),game=$('[data-wordle-game]'),input=$('#mw-guess'),board=$('[data-wordle-board]'),keyboard=$('[data-wordle-keyboard]'),form=$('[data-wordle-form]'),message=$('[data-wordle-message]'),result=$('[data-wordle-result]');
 const symbols={correct:'✓',present:'↔',absent:'–'},names={correct:'right place',present:'elsewhere in word',absent:'not in word'},priority={absent:1,present:2,correct:3};
 let state=null;try{const saved=JSON.parse(localStorage.getItem(storageKey));if(C.valid(saved,W.answers,W.allowed))state=saved;}catch{}
 if(state)start.querySelector('span').textContent='Continue game';
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
  $('[data-wordle-progress]').textContent=`Word ${state.index} of 100 · ${state.guesses.length} of 6 guesses`;
  form.hidden=finished();keyboard.hidden=finished();result.hidden=!finished();
  if(finished()){
   const won=state.guesses.includes(state.answer);$('[data-wordle-result-text]').textContent=(won?'You found it: ':'The word was ')+state.answer.toUpperCase()+'.';const a=$('[data-wordle-dictionary]');a.href='https://www.dictionary.maori.nz/'+encodeURIComponent(state.answer);a.setAttribute('aria-label',`Explore ${state.answer} in the dictionary (opens in a new tab)`);
  }
 }
 function cleanInput(){if(!state||finished())return;input.value=Array.from(C.normalise(input.value).replace(/[^aeghikmnoprtuwāēīōū]/gu,'')).slice(0,5).join('').toUpperCase();render();}
 const rows=['aeiou','āēīōū','hkmnprt','wg'];
 rows.forEach((letters,i)=>{const row=document.createElement('div');row.className='mw-key-row';for(const letter of letters){const b=document.createElement('button');b.type='button';b.dataset.letter=letter;b.textContent=letter.toUpperCase();b.addEventListener('click',()=>{if(finished())return;input.value+=letter;cleanInput();});row.append(b);}if(i===3){const del=document.createElement('button');del.type='button';del.textContent='Delete';del.addEventListener('click',()=>{input.value=Array.from(input.value).slice(0,-1).join('');render();});row.append(del);const enter=document.createElement('button');enter.type='button';enter.textContent='Guess';enter.addEventListener('click',()=>form.requestSubmit());row.append(enter);}keyboard.append(row);});
 input.addEventListener('input',e=>{if(!e.isComposing)cleanInput();});input.addEventListener('compositionend',cleanInput);
 form.addEventListener('submit',e=>{
  e.preventDefault();if(finished())return;const guess=C.normalise(input.value);
  if(Array.from(guess).length!==5){say('Enter five letters before guessing.');input.focus({preventScroll:true});return;}
  if(!W.allowed.includes(guess)){say('That word isn’t in this game’s list. Try another; no guess was used.');input.focus({preventScroll:true});return;}
  if(state.guesses.includes(guess)){say('You’ve already tried that word. Try a different one.');return;}
  state.guesses.push(guess);input.value='';save();render();
  const feedback=Array.from(guess).map((l,i)=>`${l.toUpperCase()} ${names[C.score(guess,state.answer)[i]]}`).join('; ');
  if(finished()){say((guess===state.answer?`You found ${state.answer.toUpperCase()} in ${state.guesses.length} guesses!`:`The word was ${state.answer.toUpperCase()}.`));$('[data-wordle-next]').focus({preventScroll:true});}
  else say(`Guess ${state.guesses.length}: ${feedback}.`);
 });
 start.addEventListener('click',()=>{if(!state){state=C.next(null,W.answers);save();}intro.hidden=true;game.hidden=false;root.classList.add('is-playing');render();say('');if(finished())$('[data-wordle-next]').focus({preventScroll:true});else input.focus({preventScroll:true});});
 $('[data-wordle-next]').addEventListener('click',()=>{state=C.next(state,W.answers);input.value='';save();render();say('A new word is ready.');input.focus({preventScroll:true});});
 $('[data-wordle-close]').addEventListener('click',()=>{game.hidden=true;intro.hidden=false;root.classList.remove('is-playing');start.querySelector('span').textContent='Continue game';start.focus({preventScroll:true});});
})();
