const journalHeading = document.querySelector('#home-articles-title');
const journalIntro = journalHeading.nextElementSibling;
const wordingPicker = document.querySelector('.journal-wording');
const introductions = [
  [journalHeading.textContent, journalIntro.textContent],
  ["News and articles", "Find news from Hoea tō Waka alongside articles by Anna Brown."],
  ["From Anna Brown", "Read what Anna’s been writing, with her most recent article first."],
  ["The journal", "A collection of writing by Anna Brown for Hoea tō Waka."],
  ["Articles from Hoea tō Waka", "You’ll find everything published here in one place, starting with the newest."],
  ["Latest from Anna", "Catch up on Anna’s recent writing or choose an earlier piece to read."],
  ["Articles and updates", "Read Anna Brown’s articles and follow updates from Hoea tō Waka."],
  ["The article archive", "Browse Anna’s writing by title and see when each piece was published."],
  ["Anna’s writing", "Explore the full collection of Anna Brown’s articles for Hoea tō Waka."],
  ["Recent posts", "Start with Anna’s newest post or scroll down to see what else she’s shared."]
];
let introductionIndex = 0;
function changeIntroduction(step) {
  introductionIndex = (introductionIndex + step + introductions.length) % introductions.length;
  const [heading, intro] = introductions[introductionIndex];
  journalHeading.textContent = heading;
  journalIntro.textContent = intro;
  wordingPicker.querySelector('output').textContent = String(introductionIndex + 1).padStart(2, '0') + ' / ' + introductions.length;
}
const [previousIntro, nextIntro] = wordingPicker.querySelectorAll('button');
previousIntro.addEventListener('click', () => changeIntroduction(-1));
nextIntro.addEventListener('click', () => changeIntroduction(1));
wordingPicker.hidden = false;
