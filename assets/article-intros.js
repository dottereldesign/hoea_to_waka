const journalHeading = document.querySelector('#home-articles-title');
const journalIntro = journalHeading.nextElementSibling;
const wordingPicker = document.querySelector('.journal-wording');
const introductions = [
  [journalHeading.textContent, journalIntro.textContent],
  ["How to support someone under pressure", "When a colleague says they’re fine but seems overwhelmed, what do you say next? Anna offers questions that give them room to answer."],
  ["Practical guides to workplace wellbeing", "Find a check-in for your next team meeting, a way to talk about workload and ideas for winding down after a difficult shift."],
  ["Understanding your response to stress", "Learn to recognise what pressure looks like for you, from snapping at someone to replaying a conversation long after it ends."],
  ["How the Hoea tō Waka model works", "Anna uses the example of steering a waka to explain a familiar problem: what can you do when the biggest source of pressure is beyond your control?"],
  ["For people who look after others", "If you support clients, colleagues or whānau, read about setting limits, asking for backup and recognising when you need a break yourself."],
  ["Better conversations at work", "Find ways to ask about a missed deadline, hear a colleague out or make it easier for someone to tell you they need help."],
  ["When work follows you home", "Anna looks at why a hard shift can stay with you and how to give yourself a little space before the rest of your evening begins."],
  ["Resilience advice from Anna Brown", "Drawing on her background in youth work and counselling, Anna writes about managing stress, making decisions and supporting the people around you."],
  ["What to do when everything feels urgent", "Read about sorting competing demands, deciding what can wait and asking someone to share the load."]
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
