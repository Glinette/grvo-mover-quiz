import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreQuiz, types, grvoURL, shareURL, resultCaption, campaignParams, isPublicURL } from '../src/quiz.mjs';

test('all 1,024 answer combinations pick a highest-scoring type with the latest tied answer', () => {
  for (let code=0; code<1024; code++) {
    const answers = Array.from({length:5}, (_, i) => types[Math.floor(code / 4**i) % 4]);
    const result = scoreQuiz(answers);
    const counts = types.map(type => answers.filter(a => a === type).length);
    const winners = types.filter((_,i) => counts[i] === Math.max(...counts));
    assert.equal(result.type, answers.findLast(a => winners.includes(a)), JSON.stringify(answers));
    assert.equal(Object.values(result.scores).reduce((a,b)=>a+b,0), 5);
  }
});
test('all four unanimous outcomes', () => { for (const type of types) assert.equal(scoreQuiz(Array(5).fill(type)).type, type); });
test('Q5 breaks a 2–2 tie; Q4 breaks it when Q5 is not tied', () => {
  assert.equal(scoreQuiz(['planner','chill','planner','sentimental','chill']).type,'chill');
  assert.equal(scoreQuiz(['planner','chill','planner','chill','sentimental']).type,'chill');
});
test('partial and invalid answers cannot produce results', () => {
  for (const answers of [[], ['planner'], ['planner','chill',null,'planner','chill'], Array(5).fill('unknown')]) assert.throws(() => scoreQuiz(answers));
});
test('CTA preserves allowed campaign parameters and drops unrelated personal details', () => {
  const url = new URL(grvoURL('?utm_source=facebook&utm_medium=social&utm_campaign=Moving%20Day&utm_content=post1&utm_term=boxes&email=private@example.com&fbclid=123'));
  assert.equal(url.origin,'https://grvo.app');
  assert.equal(url.searchParams.get('utm_campaign'),'Moving Day');
  assert.equal(url.searchParams.get('utm_source'),'facebook');
  assert.equal(url.searchParams.size,5);
  assert.equal(new URL(grvoURL('')).searchParams.get('utm_source'),'grvo_mover_quiz');
  assert.equal(campaignParams('?utm_term='+ 'a'.repeat(300)).get('utm_term').length,200);
});
test('shared links target correct static result pages and keep only campaign fields', () => {
  for (const type of types) {
    const url = new URL(shareURL('https://quiz.example.org/results/planner/',type,'?utm_source=reddit&token=secret'));
    assert.equal(url.pathname,`/results/${type}/`);
    assert.equal(url.searchParams.get('utm_source'),'reddit');
    assert.equal(url.searchParams.has('token'),false);
    assert.match(resultCaption(type),/Take the free GRVO/);
  }
  assert.equal(isPublicURL('http://localhost:4174'),false);
  assert.equal(isPublicURL('https://quiz.example'),false);
  assert.equal(isPublicURL('https://quiz.example.org'),true);
});
