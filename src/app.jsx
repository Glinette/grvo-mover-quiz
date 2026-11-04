import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { types, questions, personalities, scoreQuiz, grvoURL, shareURL, resultCaption, isPublicURL } from './quiz.mjs';
import { track } from './analytics.mjs';
import { copyText, nativeShare } from './share.mjs';
import './styles.css';

function Arrow({ back = false }) { return <span aria-hidden="true">{back ? '←' : '↗'}</span>; }
function Character({ type, className = '' }) { return <img className={className} src={`/assets/${type}.svg`} width="260" height="280" alt="" />; }
function App() {
  const routeType = location.pathname.match(/^\/results\/([a-z]+)\/?$/)?.[1];
  const sharedType = types.includes(routeType) ? routeType : null;
  const [screen, setScreen] = useState(sharedType ? 'result' : 'landing');
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(sharedType);
  const [isShared, setIsShared] = useState(!!sharedType);
  const [notice, setNotice] = useState('');
  const [manualCopy, setManualCopy] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [sharing, setSharing] = useState(false);
  const heading = useRef(null);
  const initialRender = useRef(true);
  const campaign = useRef(location.search);
  const base = document.querySelector('link[rel="canonical"]').href;
  const cta = grvoURL(campaign.current);
  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    heading.current?.focus();
    window.scrollTo({top:0, behavior:'instant'});
  }, [screen, step]);
  useEffect(() => { if (!celebrate) return; const timer = setTimeout(() => setCelebrate(false), 2200); return () => clearTimeout(timer); }, [celebrate]);
  function start() {
    setAnswers(Array(5).fill(null)); setStep(0); setResult(null); setIsShared(false);
    setNotice(''); setManualCopy(''); setScreen('quiz');
    if (sharedType) history.replaceState(null, '', `/${campaign.current}`);
    track('quiz_start');
  }
  function choose(type) {
    setAnswers(previous => previous.map((answer, index) => index === step ? type : answer));
    track('question_answer', {question:step + 1, answer:type});
  }
  function next() {
    if (!answers[step]) return;
    if (step < 4) { setStep(step + 1); return; }
    const scored = scoreQuiz(answers);
    setResult(scored.type); setScreen('result'); setCelebrate(true);
    track('quiz_complete', {result:scored.type});
  }
  async function share(method) {
    if (sharing) return;
    setNotice(''); setManualCopy('');
    const url = shareURL(base, result, campaign.current);
    if (!isPublicURL(url)) { setNotice('Sharing will be ready on the public quiz site. This local preview stays on your device.'); return; }
    const caption = resultCaption(result);
    if (method === 'facebook') {
      const target = new URL('https://www.facebook.com/sharer/sharer.php');
      target.searchParams.set('u', url);
      window.open(target.href, '_blank', 'noopener,noreferrer');
      track('result_share', {result, method:'facebook', status:'opened'});
      setNotice('Facebook share opened. If your browser blocked it, use Copy Result.'); return;
    }
    setSharing(true);
    try {
      if (method === 'native') {
        const status = await nativeShare({title:`${personalities[result].title} | GRVO`, text:caption, url});
        if (status === 'cancelled') return;
        if (status === 'shared') { track('result_share', {result, method:'native', status:'shared'}); setNotice('Your moving personality is out in the world!'); return; }
      }
      const text = `${caption}\n${url}`;
      if (await copyText(text)) { setNotice('Copied! Paste your result into a post or send it to a friend.'); track('result_share', {result, method:'copy', status:'copied'}); }
      else { setManualCopy(text); setNotice('Your browser couldn’t copy automatically. Select and copy your result below.'); }
    } finally { setSharing(false); }
  }
  const p = result && personalities[result];
  return <>
    <header className="header"><a className="logo" href={cta} aria-label="Visit the GRVO website" onClick={() => track('grvo_cta_click', {placement:'header_logo'})}><img src="/assets/grvo-logo.png" alt="GRVO" width="62" height="54" /></a><span className="header-label">THE MOVING PERSONALITY QUIZ</span><a className="header-link" href={cta} onClick={() => track('grvo_cta_click', {placement:'header'})}>Meet GRVO <Arrow /></a></header>
    <main id="main">
    {screen === 'landing' && <div className="landing screen">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy">
        <div className="eyebrow"><span className="tiny-star" aria-hidden="true">✳</span> NEW HOME. SAME YOU?</div>
        <h1 id="hero-title" ref={heading} tabIndex="-1">What type of<br/><span className="mover-word">mover</span> are you<span className="question-mark">?</span></h1>
        <p className="hero-sub">Are you the organized planner, the last-minute packer, or the one who still hasn't unpacked from 2022?</p>
        <p className="hero-prompt">Answer 5 quick questions to discover your moving personality!</p>
        <button className="button primary start-button" onClick={start}>Find My Moving Personality <Arrow /></button>
        <p className="fine-print"><span aria-hidden="true">◷</span> Free · Takes about 60 seconds · No signup required</p>
      </div><div className="hero-art" aria-label="Four cheerful moving box characters: a planner, a last-minute mover, a sentimental packer, and a chill mover" role="img">
        <div className="art-orbit"/><span className="art-star star-one">✳</span><span className="art-star star-two">✧</span>
        <div className="scene-character scene-planner"><Character type="planner"/><span className="art-label">Label maker? Packed. ✓</span></div>
        <div className="scene-character scene-chill"><Character type="chill"/><span className="art-label">Vibes are essential.</span></div>
        <div className="scene-character scene-sentimental"><Character type="sentimental"/><span className="art-label">But it has memories!</span></div>
        <div className="scene-character scene-lastminute"><Character type="lastminute"/><span className="art-label">We’re moving WHEN?</span></div>
        <span className="round-stamp">HANDLE WITH<br/><strong>personality</strong><span>↗</span></span>
      </div></section>
      <section className="lineup" aria-labelledby="lineup-heading"><div className="section-heading"><h2 id="lineup-heading">Four personalities. One moving day.</h2><span>Which box do you fit in? <span aria-hidden="true">↓</span></span></div>
        <div className="personality-grid">{types.map((type, index) => <div className={`personality-teaser ${type}`} key={type}><Character type={type}/><div><span className="teaser-number">0{index+1}</span><h3>{personalities[type].title.replace('The ', '')}</h3><p>{personalities[type].short}</p></div></div>)}</div>
      </section>
      <div className="landing-note"><span aria-hidden="true">↳</span><p>Moving is a whole thing.<br/><strong>Finding your personality should be the fun part.</strong></p><span className="note-tag">A little self-discovery.<br/>A lot of boxes.</span></div>
    </div>}
    {screen === 'quiz' && <section className="quiz screen" aria-labelledby="question-title">
      <div className="quiz-top"><span className="eyebrow">LET’S UNPACK YOUR PERSONALITY</span><span className="step-count">0{step+1} <span>/ 05</span></span></div>
      <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow={step} aria-valuetext={`Question ${step+1} of 5`}><span style={{width:`${step / 5 * 100}%`}}/></div>
      <div key={step} className="question-content"><div className="question-illustration"><Character type={types[step % 4]}/></div><span className="question-kicker">QUESTION {step+1} OF 5</span><h1 id="question-title" ref={heading} tabIndex="-1">{questions[step].title}</h1><p className="question-note">{questions[step].note}</p>
      <fieldset className="answers"><legend className="sr-only">{questions[step].title}</legend>{questions[step].answers.map((answer,i) => <label className={`answer ${answers[step] === types[i] ? 'selected' : ''}`} key={answer}><input type="radio" name={`question-${step}`} value={types[i]} checked={answers[step] === types[i]} onChange={() => choose(types[i])}/><span className="answer-letter" aria-hidden="true">{'ABCD'[i]}</span><span>{answer}</span><span className="answer-check" aria-hidden="true">{answers[step] === types[i] ? '✓' : ''}</span></label>)}</fieldset></div>
      <div className="quiz-controls"><button className="text-button" onClick={() => step === 0 ? setScreen('landing') : setStep(step-1)}><Arrow back/> Back</button><button className="button primary next-button" disabled={!answers[step]} onClick={next}>{step === 4 ? 'Meet My Moving Personality' : 'Next Question'} <Arrow/></button></div>
      <p className="quiz-reassurance">No right answers. Just very revealing packing habits.</p>
    </section>}
    {screen === 'result' && <section className="result screen" aria-labelledby="result-title">
      {celebrate && <div className="confetti" aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{'--i':i, left:`${(i*17)%100}%`, background:['#b8ea75','#173f35','#eab482','#d9bdd9'][i%4]}}/>)}</div>}
      <div className="result-intro"><span className="eyebrow">{isShared ? 'A MOVING PERSONALITY, UNPACKED' : 'CONSIDER YOUR PERSONALITY UNPACKED'}</span><h1 id="result-title" ref={heading} tabIndex="-1">{isShared ? 'Meet' : 'You’re'} <span>{p.title}.</span></h1></div>
      <div className="result-layout"><div className={`result-portrait ${result}`}><span className="portrait-number">GRVO PERSONALITY NO. 0{types.indexOf(result)+1}</span><Character type={result}/><span className="portrait-badge">{p.badge} <span aria-hidden="true">✳</span></span><span className="portrait-bottom">HANDLE WITH PERSONALITY ↗</span></div>
      <div className="result-copy"><p className="funny-line">“{p.line}”</p><p className="result-description">{p.description}</p>
        <div className="conversion"><div className="eyebrow">YOUR NEXT MOVE</div><p>{p.connection}</p><a className="button primary" href={cta} onClick={() => track('grvo_cta_click', {placement:'result', result})}>Explore Movers with GRVO <Arrow/></a><span className="conversion-note">Your move. Your choice. A little help from GRVO.</span></div>
        <div className="share-actions"><button className="button secondary" onClick={() => share('native')} disabled={sharing}>Share My Result <span aria-hidden="true">↑</span></button><button className="text-button replay" onClick={start}>{isShared ? 'Find My Personality' : 'Play Again'} <span aria-hidden="true">↻</span></button></div>
        <div className="social-buttons"><button onClick={() => share('facebook')}><span className="facebook-icon" aria-hidden="true">f</span> Share on Facebook</button><span aria-hidden="true">·</span><button onClick={() => share('copy')} disabled={sharing}>Copy Result <span aria-hidden="true">⧉</span></button></div>
        <p className="share-status" role="status">{notice}</p>{manualCopy && <label className="manual-copy">Your result caption<textarea readOnly value={manualCopy} onFocus={e => e.target.select()}/></label>}
      </div></div><p className="just-fun">A little moving-day fun, not a scientific personality test. You contain multitudes. And probably bubble wrap.</p>
    </section>}
    </main>
    <footer className="footer"><span>A little fun, brought to you by <strong>GRVO<span aria-hidden="true">↗</span></strong></span><span>No signup. No personal details. Just you and your boxes.</span><span>Made for your next move.</span></footer>
  </>;
}

class ErrorBoundary extends React.Component {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? <main className="no-script"><h1>One box came loose.</h1><p>Something went wrong loading the quiz. Refresh to try again.</p><a className="button primary" href="/">Restart the quiz</a></main> : this.props.children; }
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
