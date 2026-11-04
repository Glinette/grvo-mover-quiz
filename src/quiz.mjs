export const types = ['planner', 'lastminute', 'sentimental', 'chill'];
export const questions = [
  { title: "Your move is next week. What's your current situation?", note: 'The countdown is on. Be honest.', answers: ['Everything is labeled, scheduled, and ready.', 'Wait, NEXT WEEK?!', "I'm deciding which things I'm emotionally attached to.", "I'm just going with the flow."] },
  { title: 'How do you pack your belongings?', note: 'There is a method to the madness. Probably.', answers: ['Color-coded boxes and detailed labels.', 'Throw everything into boxes and hope for the best.', 'Carefully wrap every item, including that random mug.', 'Pack the essentials and keep it simple.'] },
  { title: "What's your biggest moving-day fear?", note: 'Apart from the sofa not fitting through the door.', answers: ['Something going wrong with my carefully planned schedule.', 'Realizing I forgot to book a mover.', 'Losing something with sentimental value.', 'Having to deal with unnecessary stress.'] },
  { title: 'How do you choose a moving company?', note: 'Time to call in the professionals.', answers: ['Research, compare quotes, and check the details.', 'Find whoever is available before moving day.', 'Look for someone who will handle my belongings carefully.', 'Find a convenient option that fits my needs.'] },
  { title: "You've finally finished moving. What's the first thing you do?", note: 'The boxes are in. The shoes are off.', answers: ['Unpack and organize everything.', 'Collapse on the couch and promise to unpack tomorrow.', 'Check that all my favorite belongings made it safely.', 'Order food, relax, and celebrate!'] }
];
export const personalities = {
  planner: { title: 'The Super Planner', emoji: '📋', short: 'A plan for the plan.', badge: 'Chief of checklists', color: '#dfeaca', line: 'Your moving boxes probably have their own spreadsheets.', description: "You love schedules, lists, and knowing exactly what's happening. You're the friend everyone wants organizing their move.", connection: 'Keep your planning momentum going. Explore moving companies and compare quotes with GRVO.' },
  lastminute: { title: 'The Last-Minute Mover', emoji: '😅', short: 'Powered by a deadline.', badge: 'Thrives under pressure', color: '#f5dfc7', line: 'Your moving strategy is 10% planning and 90% panic.', description: 'Deadlines give you superpowers. You might pack at the last second, but somehow you always make it work.', connection: 'Still looking for movers? GRVO can help you explore your options and request quotes.' },
  sentimental: { title: 'The Sentimental Packer', emoji: '📦', short: 'Every box has a story.', badge: 'Keeper of the memories', color: '#eddfec', line: 'Yes, you absolutely need to keep that receipt from 2019.', description: 'Every object has a story. You want your belongings handled with care, and you take your time deciding what stays.', connection: 'Explore moving companies and compare your options before choosing a mover.' },
  chill: { title: 'The Chill Mover', emoji: '😎', short: 'Good vibes. Fewer boxes.', badge: 'Unbothered & unpacking', color: '#d6e8e6', line: 'You have one rule: less drama, more moving.', description: "You like things straightforward and don't want moving to take over your life.", connection: 'Spend less time searching. Explore moving companies and request quotes with GRVO.' }
};
export function scoreQuiz(answers) {
  if (answers.length !== 5 || answers.some(a => !types.includes(a))) throw new Error('Answer all five questions first.');
  const scores = Object.fromEntries(types.map(t => [t, answers.filter(a => a === t).length]));
  const max = Math.max(...Object.values(scores));
  return { type: [...answers].reverse().find(t => scores[t] === max), scores };
}
export function campaignParams(search) {
  const input = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = input.get(key);
    if (value) out.set(key, value.slice(0, 200));
  }
  return out;
}
export function grvoURL(search) {
  const url = new URL('https://grvo.app/');
  const params = campaignParams(search);
  if (!params.has('utm_source')) params.set('utm_source', 'grvo_mover_quiz');
  if (!params.has('utm_medium')) params.set('utm_medium', 'quiz');
  if (!params.has('utm_campaign')) params.set('utm_campaign', 'moving_personality');
  url.search = params.toString();
  return url.href;
}
export const facebookCopy = 'I just found out what type of mover I am! 😂📦 Are you the Super Planner, Last-Minute Mover, Sentimental Packer, or Chill Mover? Take the free GRVO moving personality quiz and find out!';
export function resultCaption(type) {
  const p = personalities[type];
  return `I'm ${p.title} ${p.emoji} ${p.line} ${facebookCopy}`;
}
export function shareURL(base, type, search = '') {
  const url = new URL(`/results/${type}/`, base);
  url.search = campaignParams(search).toString();
  return url.href;
}
export function isPublicURL(value) {
  const url = new URL(value);
  return url.protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && !url.hostname.endsWith('.example');
}
