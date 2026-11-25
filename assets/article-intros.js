const journalIntro = document.querySelector('#home-articles-title + p');
const wordingPicker = document.querySelector('.journal-wording');
const introductions = [
  journalIntro.textContent,
  "A closer look at Hoea tō Waka through the eyes of the person who developed it.",
  "Writing from Anna Brown in Ōtautahi Christchurch, home of Hoea tō Waka.",
  "What’s on Anna’s mind? In her own words, here’s what she’d like to share.",
  "There’s more to Hoea tō Waka than a workshop. Get to know Anna and her work through her writing.",
  "News, stories and the occasional change of perspective from Anna Brown.",
  "A space for the longer story, told by Anna Brown of Hoea tō Waka.",
  "Whether you’ve met Anna at a workshop or you’re finding her work for the first time, you’re welcome here.",
  "From Anna’s desk in Aotearoa to wherever you’re reading.",
  "Here, Anna has room to follow a question, share a discovery or tell a story in full."
];
let introductionIndex = 0;
function changeIntroduction(step) {
  introductionIndex = (introductionIndex + step + introductions.length) % introductions.length;
  journalIntro.textContent = introductions[introductionIndex];
  wordingPicker.querySelector('output').textContent = String(introductionIndex + 1).padStart(2, '0') + ' / ' + introductions.length;
}
const [previousIntro, nextIntro] = wordingPicker.querySelectorAll('button');
previousIntro.addEventListener('click', () => changeIntroduction(-1));
nextIntro.addEventListener('click', () => changeIntroduction(1));
wordingPicker.hidden = false;
