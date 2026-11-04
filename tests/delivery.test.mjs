import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {types,personalities} from '../src/quiz.mjs';

test('all entry pages contain crawler-readable absolute metadata and working local assets',async()=>{
  for(const path of ['/', ...types.map(type=>`/results/${type}/`)]) {
    const html=await readFile(`dist${path}index.html`,'utf8');
    assert.doesNotMatch(html,/__(TITLE|DESCRIPTION|CANONICAL|IMAGE)__/);
    const doc=new JSDOM(html).window.document;
    const canonical=new URL(doc.querySelector('link[rel=canonical]').href);
    assert.equal(canonical.pathname,path);
    assert.equal(doc.querySelector('meta[property="og:url"]').content,canonical.href);
    assert.equal(new URL(doc.querySelector('meta[property="og:image"]').content).pathname,'/assets/social-preview.png');
    const type=path.split('/')[2];
    if(type) assert.ok(doc.title.includes(personalities[type].title));
    for(const element of doc.querySelectorAll('script[src],link[rel=stylesheet],link[rel=icon]')) {
      const url=element.getAttribute('src') || element.getAttribute('href');
      assert.ok((await stat(`dist${url}`)).size>0);
    }
  }
  for(const type of types) assert.ok((await stat(`dist/assets/${type}.svg`)).size>500);
  assert.ok((await stat('dist/assets/quiz-sans.woff2')).size>1000);
  assert.ok((await stat('dist/404.html')).size>100);
});
test('social preview is a 1200 × 630 PNG',async()=>{
  const png=await readFile('dist/assets/social-preview.png');
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),1200);
  assert.equal(png.readUInt32BE(20),630);
});
test('body, muted, and CTA foregrounds meet WCAG AA text contrast',()=>{
  function luminance(hex){ const channels=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4); return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722; }
  for(const [a,b] of [['173f35','f8f8f0'],['5b6c60','f8f8f0'],['173f35','c7f582'],['4b6051','e7eedb']]) {
    const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);
    assert.ok((values[0]+.05)/(values[1]+.05)>=4.5,`${a} on ${b}`);
  }
});
