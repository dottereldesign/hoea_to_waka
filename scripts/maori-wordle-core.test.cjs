const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('../assets/maori-wordle-core.js');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('assets/maori-wordle-words.js','utf8'),sandbox);const W=JSON.parse(JSON.stringify(sandbox.window.MaoriWordleWords));
assert.equal(W.answers.length,100);assert.equal(new Set(W.answers).size,100);assert(W.allowed.length>100);assert(W.allowed.every(w=>Array.from(w).length===5&&w===w.normalize('NFC')));assert(W.answers.every(w=>W.allowed.includes(w)));
assert.deepEqual(C.score('mamae','mātua'),['correct','present','absent','absent','absent']);assert.deepEqual(C.score('mātau','mātua'),['correct','correct','correct','present','present']);assert.equal(C.normalise('A\u0304ROHA'),'āroha');
let state=null;const seen=new Set();for(let i=0;i<100;i++){state=C.next(state,W.answers);assert(!seen.has(state.answer));seen.add(state.answer);assert(C.valid(state,W.answers,W.allowed));}const last=state.answer;state=C.next(state,W.answers);assert.notEqual(state.answer,last);assert.equal(state.index,1);assert(!C.valid({...state,deck:Array(100).fill('aroha')},W.answers,W.allowed));assert(!C.valid({...state,guesses:['zzzzz']},W.answers,W.allowed));
console.log('PASS: 100 answers, Unicode lengths, repeated-letter scoring, macrons, full-cycle shuffle and corrupt-state rejection');

// Every answer/allowed-guess pair must conserve the available count of each letter.
for(const answer of W.answers)for(const guess of W.allowed){
 const scores=C.score(guess,answer),a=Array.from(answer),g=Array.from(guess);
 assert.equal(scores.length,5);
 for(let i=0;i<5;i++)assert.equal(scores[i]==='correct',g[i]===a[i]);
 for(const letter of new Set(g)){
  const matched=g.filter((l,i)=>l===letter&&scores[i]!=='absent').length;
  assert.equal(matched,Math.min(g.filter(l=>l===letter).length,a.filter(l=>l===letter).length));
 }
}
assert(!C.valid({...state,guesses:[state.answer,'aroha']},W.answers,W.allowed));
assert(!C.valid({...state,index:0},W.answers,W.allowed));
console.log('PASS exhaustive letter-count conservation for all answer/guess pairs, exact-match priority and finished-state rejection');
