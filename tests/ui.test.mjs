import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM, VirtualConsole} from 'jsdom';
import {types, personalities, questions} from '../src/quiz.mjs';
const bundle = await readFile('dist/app.js','utf8');
const html = (await readFile('dist/index.html','utf8')).replace(/<script[^>]*><\/script>/,'').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="https://quiz.example.org/">');
const tick = () => new Promise(resolve => setTimeout(resolve,15));
async function mount(path='/',setup=()=>{}) {
  const errors=[];
  const vc = new VirtualConsole(); vc.on('jsdomError',e=>errors.push(e.message));
  const dom = new JSDOM(html,{url:`https://quiz.example.org${path}`,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  dom.window.scrollTo=()=>{};
  setup(dom.window);
  dom.window.eval(bundle); await tick();
  const doc=dom.window.document;
  return {dom,doc,errors, async click(label){const button=[...doc.querySelectorAll('button')].find(el=>el.textContent.includes(label)); assert.ok(button,`Button exists: ${label}`); button.click(); await tick();},async answer(i){doc.querySelectorAll('input[type=radio]')[i].click();await tick();}};
}
test('five questions, disabled next, Back retains selection, changed answers score correctly, replay clears',async()=>{
  const ui=await mount();
  try {
    await ui.click('Reveal My Moving Type!');
    assert.equal(ui.doc.activeElement.id,'question-title');
    assert.equal(ui.doc.querySelector('.next-button').disabled,true);
    await ui.answer(0); await ui.click('Next Question'); await ui.click('Back');
    assert.equal(ui.doc.querySelector('input:checked').value,'planner');
    await ui.answer(1);
    for(let step=0;step<5;step++) {
      assert.equal(ui.doc.querySelector('h1').textContent,questions[step].title);
      assert.equal(ui.doc.querySelectorAll('input[type=radio]').length,4);
      await ui.answer(1); await ui.click(step===4 ? 'Meet My Moving' : 'Next Question');
    }
    assert.match(ui.doc.querySelector('h1').textContent,/Last-Minute Mover/);
    assert.equal(ui.doc.activeElement.id,'result-title');
    await ui.click('Play Again');
    assert.equal(ui.doc.querySelector('input:checked'),null);
    assert.equal(ui.doc.querySelector('.next-button').disabled,true);
    await ui.click('Back'); assert.ok(ui.doc.querySelector('#hero-title'));
    assert.deepEqual(ui.errors,[]);
  } finally {ui.dom.window.close();}
});
test('every personality is reachable through the UI',async()=>{
  for(let i=0;i<4;i++) {
    const ui=await mount();
    try {await ui.click('Reveal My Moving Type!'); for(let step=0;step<5;step++){await ui.answer(i);await ui.click(step===4?'Meet My Moving':'Next Question');} assert.ok(ui.doc.querySelector('h1').textContent.includes(personalities[types[i]].title));}
    finally{ui.dom.window.close();}
  }
});
test('static shared results do not pretend the visitor took the quiz and can restart',async()=>{
  const events=[]; const ui=await mount('/results/sentimental/?utm_source=reddit',w=>w.addEventListener('grvo:analytics',e=>events.push(e.detail)));
  try {
    assert.match(ui.doc.querySelector('h1').textContent,/Meet The Sentimental Packer/);
    assert.equal(events.length,0);
    assert.equal(new URL(ui.doc.querySelector('.conversion a').href).searchParams.get('utm_source'),'reddit');
    await ui.click('Find My Personality'); assert.equal(ui.dom.window.location.pathname,'/'); assert.equal(ui.doc.querySelector('#question-title').textContent,questions[0].title);
    assert.equal(events[0].name,'quiz_start');
  } finally{ui.dom.window.close();}
});
test('copy success, native cancellation, native fallback, manual copy, and Facebook use correct result',async()=>{
  let copied='', opened=''; const events=[];
  const ui=await mount('/results/chill/',w=>{
    Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>{copied=text}},configurable:true});
    w.open=url=>{opened=url}; w.addEventListener('grvo:analytics',e=>events.push(e.detail));
  });
  try {
    await ui.click('Copy Result'); assert.match(copied,/The Chill Mover/); assert.match(copied,/https:\/\/quiz.example.org\/results\/chill\//); assert.match(ui.doc.querySelector('[role=status]').textContent,/Copied/);
    ui.dom.window.navigator.share=async()=>{throw new ui.dom.window.DOMException('cancelled','AbortError');};
    const count=events.length; await ui.click('Share My Result'); assert.equal(events.length,count);
    ui.dom.window.navigator.share=async()=>{throw new Error('Unavailable');}; await ui.click('Share My Result'); assert.equal(events.at(-1).method,'copy');
    ui.dom.window.navigator.clipboard.writeText=async()=>{throw new Error('Denied');}; await ui.click('Copy Result'); assert.match(ui.doc.querySelector('textarea').value,/The Chill Mover/);
    await ui.click('Share on Facebook'); assert.equal(new URL(opened).origin,'https://www.facebook.com'); assert.equal(new URL(opened).searchParams.get('u'),'https://quiz.example.org/results/chill/');
    ui.dom.window.navigator.share=async()=>{}; await ui.click('Share My Result'); assert.equal(events.at(-1).status,'shared');
  }finally{ui.dom.window.close();}
});
test('analytics stays local until configured consent; failed adapter cannot stop the quiz',async()=>{
  const sent=[]; const ui=await mount('/',w=>{w.GRVO_ANALYTICS={consent:false,send:e=>sent.push(e)}});
  try {
    await ui.click('Reveal My Moving Type!'); assert.equal(sent.length,0);
    ui.dom.window.GRVO_ANALYTICS.consent=true; await ui.answer(0); assert.equal(sent[0].name,'question_answer');
    ui.dom.window.GRVO_ANALYTICS.send=()=>{throw new Error('offline')}; await ui.click('Next Question'); await ui.answer(1); assert.equal(ui.doc.querySelector('#question-title').textContent,questions[1].title);
    assert.equal(ui.doc.cookie,''); assert.equal(ui.dom.window.localStorage.length,0);
  }finally{ui.dom.window.close();}
});
