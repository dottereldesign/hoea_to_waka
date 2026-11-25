const journalHeading = document.querySelector('#home-articles-title');
const journalIntro = journalHeading.nextElementSibling;
const wordingPicker = document.querySelector('.journal-wording');
const introductions = [
  [journalHeading.textContent, journalIntro.textContent],
  ['Between workshops', 'Keep practising Hoea tō Waka with a question to take to your team or a reflection to try on your own.'],
  ['What can you steer today?', 'Anna writes about finding your next move when the things weighing on you are outside your control.'],
  ['In good company', 'Explore what helps people listen to each other, ask for support and find their feet together.'],
  ['Small things worth trying', 'A pause before answering. A different question at the team meeting. Start with something small enough to try today.'],
  ['The waka in everyday life', 'See how the waka metaphor can help you make sense of a hard day, a change of plan or a conversation that matters.'],
  ['A question to carry', 'Take a question into your week and see what it brings up at work, at home or with your whānau.'],
  ['When work feels heavy', 'Read about recognising pressure, setting boundaries and making room for the people who support others.'],
  ['What matters to you?', 'Explore how the things you value can guide an ordinary decision, from where you put your energy to when you ask for help.'],
  ['Notes from Aotearoa', 'Anna reflects on how people, place and whānau shape the way we understand resilience.']
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
