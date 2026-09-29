/* ================= EH//LAB ================= */
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- sound engine (WebAudio, off by default) ---------- */
const Sound=(()=>{
  let ctx=null,on=false;
  const ac=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
  function blip(f=660,d=.06,type='square',g=.05){ if(!on)return; try{
    const a=ac(),o=a.createOscillator(),v=a.createGain();
    o.type=type;o.frequency.value=f;v.gain.setValueAtTime(g,a.currentTime);
    v.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);
    o.connect(v).connect(a.destination);o.start();o.stop(a.currentTime+d);
  }catch(e){} }
  function sweep(f0=300,f1=900,d=.35){ if(!on)return; try{
    const a=ac(),o=a.createOscillator(),v=a.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(f0,a.currentTime);
    o.frequency.linearRampToValueAtTime(f1,a.currentTime+d);
    v.gain.setValueAtTime(.035,a.currentTime);v.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);
    o.connect(v).connect(a.destination);o.start();o.stop(a.currentTime+d);
  }catch(e){} }
  return{
    toggle(){on=!on;document.body.dataset.sound=on?'on':'off';if(on)blip(880,.08);return on;},
    click:()=>blip(720,.05), flip:()=>blip(520,.07,'triangle'), ok:()=>blip(980,.09,'sine'),
    bad:()=>blip(180,.12,'sawtooth'), probe:()=>blip(1200+Math.random()*600,.03,'square',.02),
    open:()=>blip(1046,.06,'sine',.04), sweep
  };
})();
$('#soundToggle').addEventListener('click',()=>Sound.toggle());

/* ---------- hero particle network ---------- */
(function(){
  const cv=$('#netCanvas');if(!cv)return;const cx=cv.getContext('2d');
  let W,H,pts=[],mouse={x:-999,y:-999};
  const N=()=>Math.min(90,Math.floor(W*H/16000));
  function size(){W=cv.width=cv.offsetWidth*devicePixelRatio;H=cv.height=cv.offsetHeight*devicePixelRatio;
    pts=Array.from({length:N()},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35*devicePixelRatio,vy:(Math.random()-.5)*.35*devicePixelRatio,r:(Math.random()*1.6+.8)*devicePixelRatio}));}
  size();addEventListener('resize',size);
  cv.parentElement.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.x=(e.clientX-r.left)*devicePixelRatio;mouse.y=(e.clientY-r.top)*devicePixelRatio;});
  cv.parentElement.addEventListener('pointerleave',()=>{mouse.x=-999;mouse.y=-999;});
  const LINK=140*devicePixelRatio;
  function frame(){
    cx.clearRect(0,0,W,H);
    for(const p of pts){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
      const dx=p.x-mouse.x,dy=p.y-mouse.y,d2=dx*dx+dy*dy,rad=170*devicePixelRatio;
      if(d2<rad*rad){const d=Math.sqrt(d2)||1;p.x+=dx/d*.6;p.y+=dy/d*.6;}
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fillStyle='rgba(61,255,158,.55)';cx.fill();
    }
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
      if(d<LINK){cx.globalAlpha=(1-d/LINK)*.28;cx.strokeStyle='#3dff9e';cx.lineWidth=devicePixelRatio*.7;
        cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();}
    }
    cx.globalAlpha=1;
    if(!reduceMotion)requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- terminal typing ---------- */
(function(){
  const el=$('#termBody');if(!el)return;
  const LINES=[
    ['t-dim','$ whoami'],
    ['t-ink','arnab :: future ethical hacker'],
    ['t-dim','$ nmap -sS --top-ports 4 exam.local'],
    ['','<span class="t-cyn">22/tcp</span>  open   ssh'],
    ['','<span class="t-cyn">80/tcp</span>  open   http'],
    ['','<span class="t-amb">443/tcp</span> open   https'],
    ['','<span class="t-cyn">quiz</span>    open   63 questions'],
    ['t-dim','$ ./start-lab --interactive'],
    ['t-amb','[ ok ] 4 chapters loaded. scroll to begin _'],
  ];
  if(reduceMotion){el.innerHTML=LINES.map(l=>l[1]?`<span class="${l[0]}">${l[1]}</span>`:'').join('\n');return;}
  let li=0;
  function typeLine(){
    if(li>=LINES.length){el.insertAdjacentHTML('beforeend','<span class="term-cursor"></span>');return;}
    const [cls,html]=LINES[li];
    const plain=html.replace(/<[^>]+>/g,'');
    const span=document.createElement('span');if(cls)span.className=cls;
    el.appendChild(span);
    let ci=0;
    (function tick(){
      span.textContent=plain.slice(0,++ci);
      if(ci<plain.length)setTimeout(tick,li<2?26:13);
      else{
        if(html!==plain){span.innerHTML=html;}
        el.appendChild(document.createTextNode('\n'));
        li++;setTimeout(typeLine,li===1?350:120);
      }
    })();
  }
  setTimeout(typeLine,600);
})();

/* ---------- ticker ---------- */
(function(){
  const t=$('#tickerTrack');if(!t)return;
  const items=['RECONNAISSANCE','SCANNING','GAINING ACCESS','MAINTAINING ACCESS','CLEARING TRACKS','REPORTING','REMEDIATION','SYN','SYN-ACK','ACK','<b>nmap -sS</b>','<b>nmap -O</b>','WHITE HAT','BLACK HAT','GRAY HAT','CIA TRIAD','ZERO-DAY','<b>nikto -h</b>','DMITRY','METASPLOIT','PORT 22','PORT 443','IT ACT 2000'];
  t.innerHTML=items.concat(items).map(i=>`<span>${i}</span><span style="color:var(--grn)">//</span>`).join('');
})();

/* ---------- quiz state ---------- */
const QStore=(()=>{
  const KEY='ehlab-quiz-v2';let s={};
  try{s=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
  return{
    get:id=>s[id],
    set(id,v){ if(v)s[id]=v;else delete s[id];
      try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}
      document.dispatchEvent(new CustomEvent('qstate',{detail:{id,v}}));},
    all:()=>s
  };
})();

/* ---------- shared question card ---------- */
function qCard(q,ctx){
  const el=document.createElement('article');
  el.className='qcard reveal';el.dataset.qid=q.id;
  const mark=QStore.get(q.id);
  if(mark)el.classList.add(mark==='got'?'mk-got':'mk-missed');
  el.innerHTML=`
    <div class="q-top"><span class="q-id cat-${q.id.replace(/\d+$/,'')}">${q.id}</span>
    <span class="q-mark">${mark==='got'?'GOT IT':mark==='missed'?'REVISIT':''}</span></div>
    <div class="q-question"></div>
    <div class="q-answer"><div class="q-answer-inner"></div></div>
    <div class="q-actions">
      <button class="q-btn reveal-btn">reveal answer</button>
      <button class="q-btn got${mark==='got'?' on':''}">got it</button>
      <button class="q-btn missed${mark==='missed'?' on':''}">missed it</button>
    </div>`;
  $('.q-question',el).textContent=q.question;
  $('.q-answer-inner',el).textContent=q.answer;
  const ans=$('.q-answer',el),rb=$('.reveal-btn',el);
  rb.addEventListener('click',()=>{
    const open=ans.style.maxHeight&&ans.style.maxHeight!=='0px';
    ans.style.maxHeight=open?'0px':ans.scrollHeight+'px';
    rb.textContent=open?'reveal answer':'hide answer';
    Sound.flip();
  });
  const gb=$('.got',el),mb=$('.missed',el);
  function paint(){
    const m=QStore.get(q.id);
    el.classList.toggle('mk-got',m==='got');el.classList.toggle('mk-missed',m==='missed');
    gb.classList.toggle('on',m==='got');mb.classList.toggle('on',m==='missed');
    $('.q-mark',el).textContent=m==='got'?'GOT IT':m==='missed'?'REVISIT':'';
  }
  gb.addEventListener('click',()=>{QStore.set(q.id,QStore.get(q.id)==='got'?null:'got');Sound.ok();});
  mb.addEventListener('click',()=>{QStore.set(q.id,QStore.get(q.id)==='missed'?null:'missed');Sound.bad();});
  document.addEventListener('qstate',e=>{if(e.detail.id===q.id)paint();});
  return el;
}

/* ---------- reveal observer (shared) ---------- */
const revealIO=new IntersectionObserver(es=>{
  for(const e of es)if(e.isIntersecting){e.target.classList.add('in');revealIO.unobserve(e.target);}
},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
function watchReveals(root=document){$$('.reveal:not(.in)',root).forEach(el=>revealIO.observe(el));}

/* ================= CHAPTER RENDERER ================= */
const CH_META=[
  {tag:'Chapter 01 · Foundations',title:'Introduction to Ethical Hacking'},
  {tag:'Chapter 02 · The Method',title:'The Basic Steps of Ethical Hacking'},
  {tag:'Chapter 03 · The Contract',title:'Penetration Testing'},
  {tag:'Chapter 04 · The Instrument',title:'Nmap: Seeing the Network'},
];
const CHECKPOINTS={0:['QA2','QB2','QH2'],1:['QB4','QC4','QH3'],2:['QB3','QC2','QC1'],3:['QC3','QE1','QE2']};
let CONTENT=null;

function headingOf(t){const m=t.match(/^(\d+\.\d+(?:\.\d+)?)\s{1,3}(.+)$/);return m?{num:m[1],text:m[2]}:null;}
function calloutOf(t){
  if(t.startsWith('MEMORY HOOK.'))return{cls:'',tag:'MEMORY HOOK',body:t.slice(12).trim()};
  if(t.startsWith('TRUE STORY.'))return{cls:'story',tag:'TRUE STORY',body:t.slice(11).trim()};
  return null;
}

function renderChapter(sec,idx){
  const meta=CH_META[idx];
  const ch=document.createElement('section');
  ch.className='chapter';ch.id='ch-'+sec.slug;
  ch.innerHTML=`<div class="chapter-head">
    <span class="sec-index">0${idx+1}</span>
    <p class="chapter-tag reveal">${meta.tag}</p>
    <h2 class="sec-title reveal reveal-d1">${meta.title}</h2>
  </div>`;
  const prose=document.createElement('div');prose.className='prose';
  ch.appendChild(prose);
  let pCount=0;
  sec.blocks.forEach((b,i)=>{
    if(b.type==='p'){
      const h=headingOf(b.text);
      if(h){
        const hb=document.createElement('div');hb.className='h-block reveal';
        hb.innerHTML=`<span class="h-num">${h.num}</span><h3 class="h-text"></h3>`;
        $('.h-text',hb).textContent=h.text;prose.appendChild(hb);
      }else{
        const co=calloutOf(b.text);
        if(co){
          const cd=document.createElement('div');cd.className='callout reveal '+co.cls;
          cd.innerHTML=`<span class="callout-tag">${co.tag}</span><p></p>`;
          $('p',cd).textContent=co.body;prose.appendChild(cd);
        }else{
          const p=document.createElement('p');p.className='reveal';p.textContent=b.text;prose.appendChild(p);
        }
      }
    }else if(b.type==='figure'){
      const f=document.createElement('figure');f.className='fig reveal';
      f.innerHTML=`<img loading="lazy" src="assets/figures/${b.image}" alt="Lecture figure ${b.image}">
        <figcaption class="fig-cap"><span>${b.image}</span><span class="zoom-hint">tap to zoom</span></figcaption>`;
      f.addEventListener('click',()=>openLightbox('assets/figures/'+b.image));
      prose.appendChild(f);
    }else if(b.type==='table'){
      const w=document.createElement('div');w.className='tbl-wrap reveal';
      const rows=b.rows.map((r,ri)=>ri===0
        ?'<thead><tr>'+r.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr></thead>'
        :'<tr>'+r.map(c=>`<td>${esc(c)}</td>`).join('')+'</tr>').join('');
      w.innerHTML=`<table class="tbl">${rows}</table>`;
      prose.appendChild(w);
    }
    injectModules(ch,prose,idx,i);
  });
  // checkpoint at chapter end
  const cp=buildCheckpoint(idx);
  ch.appendChild(cp);
  return ch;
}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

/* ---------- module injector ---------- */
function injectModules(ch,prose,secIdx,blockIdx){
  const add=el=>{prose.appendChild(el);};
  if(secIdx===0&&blockIdx===16)add(buildSpectrum());
  if(secIdx===0&&blockIdx===51)add(buildFlashcards());
  if(secIdx===1&&blockIdx===5)add(buildLifecycle());
  if(secIdx===2&&blockIdx===17)add(buildPentestStepper());
  if(secIdx===2&&blockIdx===26)add(buildBoxes());
  if(secIdx===3&&blockIdx===16)add(buildHandshake());
  if(secIdx===3&&blockIdx===22)add(buildPortStates());
  if(secIdx===3&&blockIdx===67)add(buildScanner());
}

/* ================= MODULE: hacker spectrum ================= */
const HACKER_TYPES=[
 {id:'white',lbl:'WH',name:'White-hat hackers',x:86,y:84,c:'#3dff9e',tag:'permission: yes · intent: help',
  body:'The same skills as the attacker, run with written permission, to find and fix weaknesses before the black hats find them. Hired as security consultants and penetration testers - the career this course trains you for.'},
 {id:'black',lbl:'BL',name:'Black-hat hackers',x:12,y:14,c:'#ff5d6c',tag:'permission: no · intent: harm',
  body:'Break in without permission, for gain, revenge or harm. They run the cybercrime economy: identity theft, financial fraud, ransomware, denial-of-service. The textbook case: breaching a company database to steal customer credit cards.'},
 {id:'gray',lbl:'GR',name:'Gray-hat hackers',x:30,y:74,c:'#ffc857',tag:'permission: no · intent: help',
  body:'No permission, but no malice either. A gray hat finds a hole, tells the owner, sometimes asks for a fee. The intention is decent and the act is still illegal in most jurisdictions - including India - because the access itself was unauthorized. Ethics gray, law black and white.'},
 {id:'skid',lbl:'SK',name:'Script kiddies',x:20,y:38,c:'#39d5ff',tag:'permission: no · intent: noise',
  body:'Beginners who run ready-made tools and scripts written by others, without understanding what the tools do. Individually unsophisticated, but in numbers they still do real damage - a teenager firing a downloaded attack tool at a game server is the standard example.'},
 {id:'hack',lbl:'HK',name:'Hacktivists',x:26,y:58,c:'#b78cff',tag:'permission: no · intent: protest',
  body:'Hacking as protest. Website defacements, data leaks and service disruptions in the name of a political or social cause. Supporters call it civil disobedience; the law calls it crime.'},
 {id:'state',lbl:'ST',name:'State-sponsored hackers',x:38,y:8,c:'#ff9d5c',tag:'permission: contested · intent: espionage',
  body:'Government operatives or contractors doing espionage, sabotage and cyber warfare against other states. Legal in the eyes of their own government, hostile acts in the eyes of the target. The most resourced attackers on earth - Stuxnet is the canonical case.'},
 {id:'crime',lbl:'CC',name:'Cybercriminals',x:8,y:26,c:'#ff5d6c',tag:'permission: no · intent: money',
  body:'Black hats with a business plan: financially motivated, often organized, running fraud, ransomware and data-theft operations with customer support desks and profit sharing. Crime as an industry.'},
];
function buildSpectrum(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · The Hacker Map</span>
    <h3 class="mod-title">Seven kinds of hacker, two questions</h3>
    <p class="mod-sub">Do not memorize the list. Every type is a point on two axes: <b>were they allowed?</b> and <b>what did they want?</b> Tap a node.</p>
    <div class="spectrum" id="spectrumPlot">
      <span class="axis-lbl ax-x">permission &rarr;</span>
      <span class="axis-lbl ax-y">intent &rarr;</span>
      <span class="ax-corner" style="top:8px;left:12px">HELP / NO PERMISSION</span>
      <span class="ax-corner" style="top:8px;right:12px">HELP / PERMISSION</span>
      <span class="ax-corner" style="bottom:8px;left:12px">HARM / NO PERMISSION</span>
      <span class="ax-corner" style="bottom:8px;right:12px">HARM / PERMISSION</span>
    </div>
    <div class="spec-detail" id="specDetail"><p class="spec-hint">// select a node on the map</p></div>`;
  const plot=$('#spectrumPlot',m),detail=$('#specDetail',m);
  HACKER_TYPES.forEach(h=>{
    const b=document.createElement('button');b.className='spec-dot';
    b.style.left=h.x+'%';b.style.top=(100-h.y)+'%';
    b.style.setProperty('--dot-c',h.c);b.style.setProperty('--dot-glow',h.c+'55');
    b.innerHTML=`<span class="sd-core">${h.lbl}</span><span class="sd-lbl">${h.name.replace(' hackers','')}</span>`;
    b.setAttribute('aria-label',h.name);
    b.addEventListener('click',()=>{
      $$('.spec-dot',plot).forEach(d=>d.classList.remove('sel'));b.classList.add('sel');
      detail.style.borderColor=h.c+'66';
      detail.innerHTML=`<span class="sd-tag" style="color:${h.c}">${h.tag}</span><h4>${h.name}</h4><p></p>`;
      $('p',detail).textContent=h.body;
      Sound.flip();
    });
    plot.appendChild(b);
  });
  return m;
}

/* ================= MODULE: flashcards ================= */
const VOCAB=[
 {term:'Vulnerability',def:'A weakness in a system - a bug, a misconfiguration, a missing patch, a guessable password.',analogy:'the unlocked window'},
 {term:'Threat',def:'Whatever could exploit that weakness - an attacker, malware, a flood, a careless employee.',analogy:'the burglar walking the street'},
 {term:'Exploit',def:'The actual technique or code that uses a vulnerability to break in.',analogy:'the brick through the window'},
 {term:'Risk',def:'The chance the threat meets the vulnerability, times the damage if it does. Why a flaw on a test server matters less than the same flaw on a bank.',analogy:'likelihood x damage'},
 {term:'Attack surface',def:'The total of all the places an attacker could try - every open port, page, API and employee. Shrinking it is half of defense.',analogy:'every door and window combined'},
 {term:'CIA triad',def:'The three things every attack tries to break: Confidentiality (secrets stay secret), Integrity (data stays correct), Availability (systems stay up). Ransomware hits all three in one move.',analogy:'steal = C · change = I · block = A'},
];
function buildFlashcards(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · Vocabulary Deck</span>
    <h3 class="mod-title">Six terms every answer needs</h3>
    <p class="mod-sub">They are one family - each is an answer to "what exactly can go wrong?" Tap a card to flip it.</p>
    <div class="cards-grid"></div>`;
  const grid=$('.cards-grid',m);
  VOCAB.forEach(v=>{
    const c=document.createElement('button');c.className='fcard';
    c.innerHTML=`<div class="fcard-inner">
      <div class="fc-face fc-front"><span class="fc-glyph">&lt;/&gt;</span><span class="fc-term">${v.term}</span><span class="fc-flip-hint">TAP TO FLIP</span></div>
      <div class="fc-face fc-back"><span class="fc-def">${v.def}</span><span class="fc-analogy">${v.analogy}</span></div>
    </div>`;
    c.addEventListener('click',()=>{c.classList.toggle('flipped');Sound.flip();});
    grid.appendChild(c);
  });
  return m;
}

/* ================= MODULE: 7-phase lifecycle ================= */
const PHASES=[
 {n:1,name:'Reconnaissance',obj:'Know the target before you touch it',
  body:'Collect as much information about the target system, network or organization as possible. Passive recon never touches the target - WHOIS, Google Dorking, Shodan, company sites. Active recon interacts directly: pings and port scans. More signal, more noise - packets can end up in a log.',
  tags:['WHOIS','Shodan','Google Dorking','Nmap','Dmitry']},
 {n:2,name:'Scanning',obj:'From "what exists" to "what is weak"',
  body:'Identify open ports, running services and known vulnerabilities. Port scanning finds the doors that answer; vulnerability scanning checks services against databases of published flaws; network mapping draws the territory you cannot defend without picturing.',
  tags:['Nmap','Nessus','OpenVAS','Nikto']},
 {n:3,name:'Gaining Access',obj:'The break-in',
  body:'A vulnerability found during scanning is exploited to enter the system - a software bug, a misconfiguration, a weak password. Then privilege escalation: climbing from a limited account to root or administrator, because root can read anything.',
  tags:['Metasploit','privilege escalation','root']},
 {n:4,name:'Maintaining Access',obj:'Staying for the sequel',
  body:'Getting in was hard; doing it again next week should not be. Attackers plant backdoors that survive password changes and reboots: a planted account, a remote access tool, a rootkit. For an ethical hacker this is controlled, documented, and every mechanism is removed and disclosed at the end.',
  tags:['backdoors','rootkits','Meterpreter','Netcat']},
 {n:5,name:'Clearing Tracks',obj:'The phase your lecture calls unethical',
  body:'Deletion of logs and every other trace of the intrusion - log clearing, removing tools, editing audit trails. You study it because you cannot detect what you do not understand: centralized logging, write-once storage and SIEM exist to defeat exactly this.',
  tags:['log clearing','SIEM','audit trails']},
 {n:6,name:'Reporting',obj:'The phase that pays',
  body:'Document and communicate the findings to the system owner - the entire difference between a white hat and a black hat, written as a job task. A pentest that ends without a report is just a break-in with good intentions.',
  tags:['vulnerabilities','impact','recommendations']},
 {n:7,name:'Remediation & Retesting',obj:'Close the loop',
  body:'Patch the software, reconfigure, add the missing controls - then retest. The same attack runs again against the fixed system to prove the fix holds. A fix without retest is a hope. Then the lifecycle loops: security is a cycle, not a project.',
  tags:['patch','retest','the loop restarts']},
];
function buildLifecycle(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · The Attack Lifecycle</span>
    <h3 class="mod-title">Seven phases, scroll-driven</h3>
    <p class="mod-sub">Mnemonic: <b>R</b>eal <b>S</b>pies <b>G</b>ather <b>M</b>aps <b>C</b>arefully, <b>R</b>ecord <b>R</b>epairs. Scroll - the ring tracks the operation. Tap any phase to jump.</p>
    <div class="lifecycle">
      <div class="lc-sticky">
        <div class="lc-ring-wrap">
          <svg class="lc-ring" viewBox="0 0 200 200">
            <circle class="ring-bg" cx="100" cy="100" r="88"></circle>
            ${PHASES.map((p,i)=>`<circle class="ring-seg" data-seg="${i}" cx="100" cy="100" r="88" stroke="${i<5?'var(--grn)':'var(--cyn)'}" stroke-dasharray="0 999" transform="rotate(${i*(360/7)-90/7} 100 100)"></circle>`).join('')}
          </svg>
          <div class="lc-phase-num"><span class="lpn-big" id="lcBig">01</span><span class="lpn-of">OF 07</span></div>
        </div>
        <div>
          <div class="lc-name" id="lcName">Reconnaissance</div>
          <div class="lc-obj" id="lcObj">Know the target before you touch it</div>
        </div>
      </div>
      <div class="lc-track" id="lcTrack"></div>
    </div>`;
  const track=$('#lcTrack',m);
  const C=2*Math.PI*88, SEG=(360/7)/360*C*0.92, GAP=(C/7)*0.08;
  const segs=$$('.ring-seg',m);
  function setPhase(i){
    $('#lcBig',m).textContent=String(i+1).padStart(2,'0');
    $('#lcName',m).textContent=PHASES[i].name;
    $('#lcObj',m).textContent=PHASES[i].obj;
    segs.forEach((s,j)=>{s.style.strokeDasharray=j<=i?`${SEG} ${C}`:`0 ${C}`;});
    $$('.lc-card',track).forEach((c,j)=>c.classList.toggle('active',j===i));
  }
  PHASES.forEach((p,i)=>{
    const c=document.createElement('div');c.className='lc-card';
    c.innerHTML=`<div class="lc-top"><span class="lc-step-chip">PHASE ${p.n}</span><h4>${p.name}</h4></div>
      <p></p><div class="lc-tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>`;
    $('p',c).textContent=p.body;
    c.addEventListener('click',()=>{setPhase(i);Sound.click();c.scrollIntoView({behavior:'smooth',block:'center'});});
    track.appendChild(c);
  });
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){const i=[...track.children].indexOf(e.target);if(i>-1)setPhase(i);}});
  },{rootMargin:'-42% 0px -42% 0px'});
  $$('.lc-card',track).forEach(c=>io.observe(c));
  setTimeout(()=>setPhase(0),100);
  return m;
}

/* ================= MODULE: pentest stepper ================= */
const PT_PHASES=[
 {k:'Phase 01 · Map it',name:'Planning & Reconnaissance',
  body:'Define scope and goals, then gather intelligence: network topology, system configurations, software versions. The better the map, the better the test.'},
 {k:'Phase 02 · Sweep it',name:'Scanning',
  body:'Automated tools sweep the target for known vulnerabilities: misconfigured servers, outdated software, weak passwords. This is where Nikto, Nessus and Nmap earn their keep.'},
 {k:'Phase 03 · Prove it',name:'Exploitation',
  body:'Attempt to break in through the identified weaknesses: password cracking, SQL injection, social engineering. Success here answers the only question the client really has: "can someone actually get in?"'},
 {k:'Phase 04 · Stay in',name:'Maintaining Access',
  body:'Stay inside, the way a real attacker would: plant a backdoor, escalate privileges, show how far the damage could reach - data exfiltration included, simulated and documented.'},
 {k:'Phase 05 · Write it down',name:'Analysis & Reporting',
  body:'What was exploited, how, what was reached, and what to fix - in language both engineers and management can act on. The Part 2 lifecycle, wearing a suit.'},
];
function buildPentestStepper(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · The Five Phases of a Pentest</span>
    <h3 class="mod-title">The lifecycle, under contract</h3>
    <p class="mod-sub">Step through the five components your lecture breaks a pentest into.</p>
    <div class="stepper">
      <div class="stepper-stage" id="ptStage"></div>
      <div class="stepper-nav">
        <button class="step-btn" id="ptPrev">&larr; prev</button>
        <button class="step-btn" id="ptNext">next &rarr;</button>
        <button class="step-autoplay" id="ptAuto">&#9654; autoplay</button>
        <div class="step-dots" id="ptDots"></div>
      </div>
    </div>`;
  const stage=$('#ptStage',m),dots=$('#ptDots',m);let cur=0,timer=null;
  PT_PHASES.forEach((p,i)=>{
    const pane=document.createElement('div');pane.className='step-pane';
    pane.innerHTML=`<span class="step-ghost">0${i+1}</span><div class="step-kicker">${p.k}</div><h4>${p.name}</h4><p></p>`;
    $('p',pane).textContent=p.body;stage.appendChild(pane);
    const d=document.createElement('button');d.setAttribute('aria-label','phase '+(i+1));
    d.addEventListener('click',()=>{go(i);Sound.click();});dots.appendChild(d);
  });
  const panes=$$('.step-pane',stage),db=$$('button',dots);
  function go(i,dir=1){
    panes[cur].classList.remove('cur');panes[cur].classList.toggle('out-l',dir>0);
    cur=(i+PT_PHASES.length)%PT_PHASES.length;
    panes[cur].classList.remove('out-l');panes[cur].classList.add('cur');
    db.forEach((d,j)=>d.classList.toggle('cur',j===cur));
  }
  $('#ptPrev',m).addEventListener('click',()=>{go(cur-1,-1);Sound.click();});
  $('#ptNext',m).addEventListener('click',()=>{go(cur+1,1);Sound.click();});
  const autoBtn=$('#ptAuto',m);
  autoBtn.addEventListener('click',()=>{
    if(timer){clearInterval(timer);timer=null;autoBtn.innerHTML='&#9654; autoplay';}
    else{timer=setInterval(()=>go(cur+1),2800);autoBtn.innerHTML='&#9646;&#9646; pause';Sound.sweep();}
  });
  go(0);
  return m;
}

/* ================= MODULE: box spectrum ================= */
const BOXES=[
 {id:'black',pct:0,name:'Black box',sub:'the stranger',
  body:'The tester knows nothing about the internals - just a company name or a public IP. Simulates an external attacker: the most realistic rehearsal of an internet-borne attack, but limited time means limited depth.',
  focus:'Focus: external vulnerabilities, brute force, what is visible from the street.'},
 {id:'gray',pct:50,name:'Gray box',sub:'the insider / stolen login',
  body:'Partial knowledge - typically a normal user account. Models the two most common real cases: a malicious insider, and an external attacker who phished one password.',
  focus:'Focus: what an ordinary account can be turned into.'},
 {id:'white',pct:100,name:'White box',sub:'the auditor with blueprints',
  body:'The tester gets everything: source code, configurations, network layouts. Slow and thorough, it finds the deep flaws - logic errors, bad crypto, insecure defaults - that an outsider would take years to stumble on.',
  focus:'Focus: code review, configuration audits, internal logic.'},
];
function buildBoxes(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · Types by Knowledge</span>
    <h3 class="mod-title">Black, gray, white - how much is the tester told?</h3>
    <p class="mod-sub">It is a spectrum, and where you sit changes what the test proves. Drag the knowledge dial, or tap a card. Testing a bank vault: black = walk in off the street, gray = open a savings account first, white = the manager hands you the blueprints.</p>
    <div class="know-meter-lbl">tester knowledge: <b id="knowPct">0%</b> <span id="knowName" style="color:var(--red)">black box</span></div>
    <div class="know-slider"><input type="range" id="knowRange" min="0" max="100" value="0" step="1" aria-label="Tester knowledge">
      <div class="know-labels"><span>knows nothing</span><span>user account</span><span>knows everything</span></div>
    </div>
    <div class="boxes" id="boxRow"></div>`;
  const row=$('#boxRow',m),range=$('#knowRange',m),pct=$('#knowPct',m),nm=$('#knowName',m);
  function select(id,snap=true){
    const b=BOXES.find(x=>x.id===id);
    if(snap){range.value=b.pct;}
    pct.textContent=range.value+'%';
    nm.textContent=b.name;nm.style.color=b.id==='black'?'var(--red)':b.id==='gray'?'var(--amb)':'var(--grn)';
    $$('.box-card',row).forEach(c=>{const on=c.dataset.box===id;c.classList.toggle('sel',on);if(on)c.classList.add('open');});
  }
  BOXES.forEach(b=>{
    const c=document.createElement('div');c.className='box-card';c.dataset.box=b.id;
    c.innerHTML=`<div class="bc-fill"></div><h4>${b.name}</h4><span class="bc-pct">${b.pct}% knowledge · ${b.sub}</span>
      <div class="bc-body"><p></p><span class="bc-focus">${b.focus}</span></div>`;
    $('p',c).textContent=b.body;
    c.addEventListener('click',()=>{const wasOpen=c.classList.contains('open');$$('.box-card',row).forEach(x=>x.classList.remove('open'));if(!wasOpen)c.classList.add('open');select(b.id);Sound.flip();});
    row.appendChild(c);
  });
  let snapT=null;
  range.addEventListener('input',()=>{
    pct.textContent=range.value+'%';
    clearTimeout(snapT);
    snapT=setTimeout(()=>{
      const v=+range.value;
      const nearest=BOXES.reduce((a,b)=>Math.abs(b.pct-v)<Math.abs(a.pct-v)?b:a);
      select(nearest.id);Sound.click();
    },180);
  });
  select('black');$('.box-card[data-box="black"]',row).classList.add('open');
  return m;
}

/* ================= MODULE: TCP handshake ================= */
const HS_MODES={
 full:{label:'Full handshake (connect scan)',steps:[
   {from:'c',to:'s',lbl:'SYN',txt:'SYN - the client says "let us talk" and proposes a starting sequence number.'},
   {from:'s',to:'c',lbl:'SYN-ACK',txt:'SYN-ACK - the server answers "agreed" and proposes its own sequence number.'},
   {from:'c',to:'s',lbl:'ACK',txt:'ACK - the client confirms. The channel is open; applications on both sides can now see and log the connection.'}]},
 syn:{label:'SYN scan · nmap -sS',steps:[
   {from:'c',to:'s',lbl:'SYN',txt:'SYN - the scanner probes the port, exactly like a normal connection would begin.'},
   {from:'s',to:'c',lbl:'SYN-ACK',txt:'SYN-ACK - the port answers. That single packet tells the scanner the port is OPEN.'},
   {from:'c',to:'s',lbl:'RST',txt:'RST - the scanner walks away before any connection exists. Half-open: nothing for the application to log. Quieter, and the default privileged scan.'}]}
};
function buildHandshake(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · The Three-Way Handshake</span>
    <h3 class="mod-title">The handshake every scanner exploits</h3>
    <p class="mod-sub">Step the packets yourself. Then flip to the SYN scan and watch the scanner learn "open" from the SYN-ACK, then vanish with an RST.</p>
    <div class="hs-mode" id="hsMode">
      <button data-mode="full" class="cur">full handshake</button>
      <button data-mode="syn">SYN scan (-sS)</button>
    </div>
    <div class="hs-wrap">
      <svg class="hs-svg" viewBox="0 0 700 300" id="hsSvg">
        <text class="hs-node-lbl" x="80" y="30" text-anchor="middle">CLIENT</text>
        <text class="hs-node-lbl" x="620" y="30" text-anchor="middle">SERVER</text>
        <rect x="52" y="42" width="56" height="34" rx="7" fill="rgba(61,255,158,.1)" stroke="rgba(61,255,158,.5)"/>
        <rect x="592" y="42" width="56" height="34" rx="7" fill="rgba(57,213,255,.08)" stroke="rgba(57,213,255,.5)"/>
        <line class="hs-wire" x1="80" y1="82" x2="80" y2="286"/>
        <line class="hs-wire" x1="620" y1="82" x2="620" y2="286"/>
        ${[0,1,2].map(i=>`<line class="hs-tick" x1="74" y1="${116+i*62}" x2="86" y2="${116+i*62}"/><line class="hs-tick" x1="614" y1="${116+i*62}" x2="626" y2="${116+i*62}"/>`).join('')}
        <g id="hsPackets"></g>
      </svg>
      <div class="hs-controls">
        <button class="step-btn" id="hsPrev">&larr; back</button>
        <button class="step-btn" id="hsStep">step packet &rarr;</button>
        <button class="step-btn" id="hsPlay">&#9654; play</button>
        <button class="step-btn" id="hsReset">reset</button>
      </div>
      <div class="hs-status" id="hsStatus">// press "step packet" or "play" to run the exchange</div>
    </div>`;
  const svg=$('#hsSvg',m),layer=$('#hsPackets',m),status=$('#hsStatus',m);
  let mode='full',step=0,playing=null,animating=false;
  const YS=[116,178,240];
  function reset(){
    layer.innerHTML='';step=0;animating=false;
    if(playing){clearInterval(playing);playing=null;$('#hsPlay',m).innerHTML='&#9654; play';}
    status.textContent='// press "step packet" or "play" to run the exchange';
  }
  function firePacket(){
    const st=HS_MODES[mode].steps[step];
    if(!st||animating)return;
    animating=true;
    const y=YS[step];
    const x1=st.from==='c'?80:620, x2=st.to==='c'?80:620;
    const col=st.lbl==='RST'?'#ff5d6c':st.lbl==='SYN-ACK'?'#39d5ff':'#3dff9e';
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1);line.setAttribute('y1',y);line.setAttribute('x2',x2);line.setAttribute('y2',y);
    line.setAttribute('stroke',col);line.setAttribute('stroke-width','1.5');line.setAttribute('stroke-dasharray','5 6');line.setAttribute('opacity','.55');
    layer.appendChild(line);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('r','7');dot.setAttribute('fill',col);dot.setAttribute('class','hs-packet');
    const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('class','hs-packet-lbl');lbl.setAttribute('fill',col);lbl.setAttribute('text-anchor','middle');
    lbl.setAttribute('y',y-14);lbl.textContent=st.lbl;
    g.appendChild(dot);g.appendChild(lbl);layer.appendChild(g);
    status.textContent=st.txt;Sound.probe();
    const dur=reduceMotion?10:850,t0=performance.now();
    (function anim(t){
      const p=Math.min(1,(t-t0)/dur), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      const x=x1+(x2-x1)*e;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);lbl.setAttribute('x',x);
      if(p<1)requestAnimationFrame(anim);
      else{animating=false;step++;}
    })(t0);
  }
  $('#hsStep',m).addEventListener('click',()=>{if(step>=HS_MODES[mode].steps.length){reset();}firePacket();});
  $('#hsPrev',m).addEventListener('click',()=>{if(step>0){step--;layer.lastChild&&layer.removeChild(layer.lastChild);layer.lastChild&&layer.removeChild(layer.lastChild);status.textContent='// stepped back';Sound.click();}});
  $('#hsReset',m).addEventListener('click',()=>{reset();Sound.click();});
  $('#hsPlay',m).addEventListener('click',()=>{
    if(playing){clearInterval(playing);playing=null;$('#hsPlay',m).innerHTML='&#9654; play';return;}
    if(step>=HS_MODES[mode].steps.length)reset();
    $('#hsPlay',m).innerHTML='&#9646;&#9646; stop';Sound.sweep();
    firePacket();
    playing=setInterval(()=>{
      if(animating)return;
      if(step>=HS_MODES[mode].steps.length){clearInterval(playing);playing=null;$('#hsPlay',m).innerHTML='&#9654; play';return;}
      firePacket();
    },1250);
  });
  $$('#hsMode button',m).forEach(b=>b.addEventListener('click',()=>{
    $$('#hsMode button',m).forEach(x=>x.classList.remove('cur'));b.classList.add('cur');
    mode=b.dataset.mode;reset();Sound.flip();
  }));
  return m;
}

/* ================= MODULE: port states ================= */
const PORT_STATES=[
 {id:'open',name:'Open',sub:'a service is listening',c:'var(--grn)',
  icon:'<svg width="52" height="52" viewBox="0 0 52 52"><rect x="8" y="8" width="36" height="36" rx="6" fill="none" stroke="#3dff9e" stroke-width="2"/><path d="M18 26h16M30 20l6 6-6 6" stroke="#3dff9e" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  body:'This is the finding: every open port is a possible way in, and every one should have a reason to exist.',
  pk:'<span class="pk-ok">SYN &rarr; &larr; SYN-ACK</span> &nbsp;the door opens'},
 {id:'closed',name:'Closed',sub:'alive, nothing listening',c:'var(--red)',
  icon:'<svg width="52" height="52" viewBox="0 0 52 52"><rect x="8" y="8" width="36" height="36" rx="6" fill="none" stroke="#ff5d6c" stroke-width="2"/><path d="M19 19l14 14M33 19L19 33" stroke="#ff5d6c" stroke-width="2.5" stroke-linecap="round"/></svg>',
  body:'The machine answers but nothing is listening; the OS replies with a refusal (a RST packet). Not exploitable right now, but the machine itself is alive and reachable - useful intelligence.',
  pk:'<span class="pk-no">SYN &rarr; &larr; RST</span> &nbsp;"nobody lives here", said from inside'},
 {id:'filtered',name:'Filtered',sub:'a firewall is in the way',c:'var(--amb)',
  icon:'<svg width="52" height="52" viewBox="0 0 52 52"><rect x="8" y="8" width="36" height="36" rx="6" fill="none" stroke="#ffc857" stroke-width="2"/><path d="M14 20h24M18 27h16M23 34h6" stroke="#ffc857" stroke-width="2.5" stroke-linecap="round"/></svg>',
  body:'The firewall silently drops the probe (or sends a polite rejection), so Nmap cannot tell whether the port behind it is open or closed. Filtered ports are why scans slow down: Nmap must retry before giving up.',
  pk:'<span class="pk-warn">SYN &rarr; &hellip; silence</span> &nbsp;a guard who pretends you do not exist'},
];
function buildPortStates(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Interactive · The Doorman Model</span>
    <h3 class="mod-title">Three answers a port can give</h3>
    <p class="mod-sub">Attackers love the first, note the second, and curse the third. Tap each.</p>
    <div class="pstates" id="psRow"></div>`;
  const row=$('#psRow',m);
  PORT_STATES.forEach(s=>{
    const c=document.createElement('div');c.className='pstate';
    c.innerHTML=`<div class="ps-icon">${s.icon}</div><h4 style="color:${s.c}">${s.name}</h4><div class="ps-sub">${s.sub}</div>
      <div class="ps-body"><p></p><div class="ps-packets">${s.pk}</div></div>`;
    $('p',c).textContent=s.body;
    c.addEventListener('click',()=>{
      const was=c.classList.contains('open');
      $$('.pstate',row).forEach(x=>x.classList.remove('open'));
      if(!was){c.classList.add('open');Sound.flip();}
    });
    row.appendChild(c);
  });
  return m;
}

/* ================= MODULE: port scanner ================= */
const SCAN_PORTS=[
 {p:21,s:'ftp'},{p:22,s:'ssh'},{p:23,s:'telnet'},{p:25,s:'smtp'},{p:53,s:'dns'},{p:80,s:'http'},
 {p:110,s:'pop3'},{p:143,s:'imap'},{p:443,s:'https'},{p:445,s:'smb'},{p:1723,s:'pptp'},{p:3306,s:'mysql'},
 {p:3389,s:'rdp'},{p:5900,s:'vnc'},{p:8080,s:'http-proxy'},{p:8443,s:'https-alt'},
];
const SCAN_TARGETS={
 'scanme.nmap.org':{22:'open',80:'open',443:'open',23:'filtered',25:'filtered',3306:'filtered',8080:'filtered',_default:'closed'},
 '10.0.0.15 (lab)':{22:'open',23:'open',80:'open',445:'open',3306:'open',443:'filtered',3389:'filtered',_default:'closed'},
 '192.168.1.10 (lab)':{80:'open',443:'open',8080:'open',22:'filtered',21:'closed',_default:'closed'},
};
const SCAN_TYPES=[
 {id:'default',lbl:'nmap (1000 ports)',speed:150},
 {id:'-F',lbl:'nmap -F (fast 100)',speed:80},
 {id:'-sS',lbl:'nmap -sS (stealth SYN)',speed:220},
 {id:'-sV',lbl:'nmap -sV (versions)',speed:260},
];
function buildScanner(){
  const m=document.createElement('div');m.className='mod reveal';
  m.innerHTML=`<span class="mod-tag">Simulator · Live Port Scanner</span>
    <h3 class="mod-title">Run the scan yourself</h3>
    <p class="mod-sub">Pick a target and a scan type, then watch the probes land. <span class="mono">scanme.nmap.org</span> is the real, legal practice target from your lecture; the lab hosts are simulated.</p>
    <div class="scanner">
      <div class="scan-controls">
        <span class="sc-lbl">target</span>
        <select class="sc-select" id="scanTarget">${Object.keys(SCAN_TARGETS).map(t=>`<option>${t}</option>`).join('')}</select>
        <span class="sc-lbl">scan</span>
        <span id="scanTypes">${SCAN_TYPES.map((t,i)=>`<button class="sc-type${i===0?' cur':''}" data-t="${t.id}">${t.lbl}</button>`).join('')}</span>
        <button class="sc-run" id="scanRun">RUN SCAN &#9654;</button>
      </div>
      <div class="scan-body">
        <div class="port-grid" id="portGrid"></div>
        <div class="scan-term" id="scanTerm"><span class="st-dim">// terminal idle - run a scan</span></div>
      </div>
    </div>`;
  const grid=$('#portGrid',m),term=$('#scanTerm',m),runBtn=$('#scanRun',m),targetSel=$('#scanTarget',m);
  let type='default',running=false;
  SCAN_PORTS.forEach(pt=>{
    const c=document.createElement('div');c.className='port-cell';c.dataset.port=pt.p;
    c.innerHTML=`<div class="pc-num">${pt.p}</div><div class="pc-svc">${pt.s}</div>`;
    grid.appendChild(c);
  });
  $$('.sc-type',m).forEach(b=>b.addEventListener('click',()=>{
    if(running)return;
    $$('.sc-type',m).forEach(x=>x.classList.remove('cur'));b.classList.add('cur');type=b.dataset.t;Sound.click();
  }));
  function tline(html){const d=document.createElement('div');d.innerHTML=html;term.appendChild(d);term.scrollTop=term.scrollHeight;}
  function resetGrid(){$$('.port-cell',grid).forEach(c=>c.className='port-cell');}
  runBtn.addEventListener('click',async()=>{
    if(running)return;running=true;runBtn.disabled=true;runBtn.textContent='SCANNING…';
    resetGrid();term.innerHTML='';
    const target=SCAN_TARGETS[targetSel.value];
    const st=SCAN_TYPES.find(t=>t.id===type);
    tline(`<span class="st-cmd">$ nmap ${type==='default'?'':type+' '}${targetSel.value}</span>`);
    tline(`<span class="st-dim">Starting Nmap scan at ${new Date().toLocaleTimeString()}</span>`);
    await wait(500);
    tline(`<span class="st-dim">Initiating ${st.lbl.includes('SYN')?'SYN Stealth Scan':'Connect Scan'}</span>`);
    Sound.sweep();
    await wait(400);
    let open=0,closed=0,filtered=0;
    for(const pt of SCAN_PORTS){
      const cell=$(`.port-cell[data-port="${pt.p}"]`,grid);
      cell.classList.add('probing');Sound.probe();
      await wait(st.speed);
      cell.classList.remove('probing');
      const state=target[pt.p]||target._default;
      cell.classList.add('st-'+state);
      if(state==='open'){open++;Sound.open();
        const ver=type==='-sV'?` <span class="st-cyn">${verOf(pt.s)}</span>`:'';
        tline(`<span class="st-open">${pt.p}/tcp&nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;${pt.s}${ver}</span>`);}
      else if(state==='closed'){closed++;tline(`<span class="st-closed">${pt.p}/tcp&nbsp;&nbsp;closed&nbsp;&nbsp;${pt.s}</span>`);}
      else{filtered++;tline(`<span class="st-filtered">${pt.p}/tcp&nbsp;&nbsp;filtered&nbsp;${pt.s}</span>`);}
    }
    await wait(350);
    tline(`<span class="st-dim">Nmap done: 1 host up, ${SCAN_PORTS.length} ports scanned in ${(SCAN_PORTS.length*st.speed/1000+0.7).toFixed(2)}s - ${open} open, ${closed} closed, ${filtered} filtered</span>`);
    if(open>0)tline(`<span class="st-open">// every open port is a possible way in - each should have a reason to exist</span>`);
    Sound.ok();
    running=false;runBtn.disabled=false;runBtn.innerHTML='RUN SCAN &#9654;';
  });
  return m;
}
function verOf(s){return{ftp:'vsftpd 3.0.3',ssh:'OpenSSH 8.9p1',telnet:'Linux telnetd',smtp:'Postfix smtpd',dns:'ISC BIND 9.18',http:'Apache httpd 2.4.54',pop3:'Dovecot pop3d',imap:'Dovecot imapd',https:'nginx 1.24.0',smb:'Samba smbd 4.X',pptp:'pptpd',mysql:'MySQL 8.0.33',rdp:'Microsoft Terminal Services',vnc:'VNC (protocol 3.8)','http-proxy':'Squid http-proxy 5.7','https-alt':'nginx 1.24.0'}[s]||'';}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}

/* ================= checkpoint ================= */
function buildCheckpoint(secIdx){
  const cp=document.createElement('div');cp.className='checkpoint reveal';
  cp.innerHTML=`<span class="mod-tag">Checkpoint · Chapter 0${secIdx+1}</span>
    <h3 class="mod-title">Prove it before you move on</h3>
    <p class="mod-sub">Three exam questions from this chapter. Marks here sync with the big drill below.</p>
    <div class="cp-list"></div>`;
  const list=$('.cp-list',cp);
  CHECKPOINTS[secIdx].forEach(id=>{
    const q=CONTENT.questions.find(q=>q.id===id);
    if(q)list.appendChild(qCard(q));
  });
  return cp;
}

/* ================= quiz ================= */
const QCATS=[
 {id:'all',lbl:'All 63'},{id:'QH',lbl:'Big picture'},{id:'QA',lbl:'Definitions'},
 {id:'QB',lbl:'Why'},{id:'QC',lbl:'Deeper why'},{id:'QD',lbl:'Long answers'},{id:'QE',lbl:'Nmap lab'},
];
function buildQuiz(){
  const root=$('#quizRoot');if(!root||!CONTENT)return;
  const panel=document.createElement('div');panel.className='quiz-panel';
  panel.innerHTML=`
    <div class="quiz-stats">
      <div class="qstat"><div class="qs-num" id="qsTotal">63</div><div class="qs-lbl">questions</div></div>
      <div class="qstat c-grn"><div class="qs-num" id="qsGot">0</div><div class="qs-lbl">got it</div></div>
      <div class="qstat c-red"><div class="qs-num" id="qsMissed">0</div><div class="qs-lbl">to revisit</div></div>
      <div class="qstat c-cyn"><div class="qs-num" id="qsLeft">63</div><div class="qs-lbl">untouched</div></div>
    </div>
    <div class="quiz-bar"><div class="qb-got" id="qbGot" style="width:0%"></div><div class="qb-missed" id="qbMissed" style="width:0%"></div></div>
    <div class="quiz-controls" id="quizChips"></div>
    <div class="quiz-list" id="quizList"></div>`;
  root.appendChild(panel);
  const chips=$('#quizChips',panel),list=$('#quizList',panel);
  let cat='all',missedOnly=false,search='';
  QCATS.forEach(c=>{
    const b=document.createElement('button');b.className='qchip'+(c.id==='all'?' cur':'');b.textContent=c.lbl;
    b.addEventListener('click',()=>{cat=c.id;$$('.qchip',chips).forEach(x=>x.classList.remove('cur'));b.classList.add('cur');mo.classList.remove('cur');renderList();Sound.click();});
    chips.appendChild(b);
  });
  const mo=document.createElement('button');mo.className='qchip missed-only';mo.textContent='missed only';
  mo.addEventListener('click',()=>{missedOnly=!missedOnly;mo.classList.toggle('cur',missedOnly);renderList();Sound.click();});
  chips.appendChild(mo);
  const si=document.createElement('input');si.className='quiz-search';si.placeholder='grep questions…';si.setAttribute('aria-label','Search questions');
  si.addEventListener('input',()=>{search=si.value.toLowerCase();renderList();});
  chips.appendChild(si);
  function stats(){
    const st=QStore.all();
    const got=CONTENT.questions.filter(q=>st[q.id]==='got').length;
    const mis=CONTENT.questions.filter(q=>st[q.id]==='missed').length;
    $('#qsGot',panel).textContent=got;$('#qsMissed',panel).textContent=mis;
    $('#qsLeft',panel).textContent=CONTENT.questions.length-got-mis;
    $('#qbGot',panel).style.width=(got/CONTENT.questions.length*100)+'%';
    $('#qbMissed',panel).style.width=(mis/CONTENT.questions.length*100)+'%';
  }
  function renderList(){
    list.innerHTML='';
    const st=QStore.all();
    const qs=CONTENT.questions.filter(q=>{
      if(cat!=='all'&&!q.id.startsWith(cat))return false;
      if(missedOnly&&st[q.id]!=='missed')return false;
      if(search&&!(q.question+' '+q.answer).toLowerCase().includes(search))return false;
      return true;
    });
    if(!qs.length){list.innerHTML='<div class="quiz-empty">// no questions match - clear a filter</div>';return;}
    qs.forEach(q=>{const c=qCard(q);c.classList.add('in');list.appendChild(c);});
  }
  document.addEventListener('qstate',stats);
  stats();renderList();
}

/* ================= night before ================= */
function buildNight(){
  const root=$('#nightRoot');if(!root||!CONTENT)return;
  const sec=CONTENT.sections[4];
  const panel=document.createElement('div');panel.className='night-panel reveal';
  const intro=sec.blocks[0].text, items=sec.blocks.slice(1,-1).map(b=>b.text), signoff=sec.blocks[sec.blocks.length-1].text;
  panel.innerHTML=`<p class="night-intro"></p><div class="night-grid"></div><p class="night-signoff"></p><a class="night-cta" href="#quiz">DRILL THE 63 QUESTIONS &rarr;</a>`;
  $('.night-intro',panel).textContent=intro;
  $('.night-signoff',panel).textContent=signoff;
  const grid=$('.night-grid',panel);
  items.forEach(t=>{
    const d=document.createElement('div');d.className='night-item';
    const p=document.createElement('p');p.textContent=t;d.appendChild(p);grid.appendChild(d);
  });
  root.appendChild(panel);
}

/* ================= nav / scroll / progress / lightbox ================= */
function openLightbox(src){
  const lb=$('#lightbox');$('#lightboxImg').src=src;lb.classList.add('on');document.body.style.overflow='hidden';Sound.flip();
}
$('#lightboxClose').addEventListener('click',closeLightbox);
$('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox();});
function closeLightbox(){$('#lightbox').classList.remove('on');document.body.style.overflow='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});

function initScrollFX(){
  const nav=$('#topnav'),bar=$('#progressBar');
  const secs=['ch-lecture-1','ch-lecture-2','ch-lecture-3','ch-lecture-4','quiz','night'];
  const rail=$('#rail');
  [['01','ch-lecture-1'],['02','ch-lecture-2'],['03','ch-lecture-3'],['04','ch-lecture-4'],['Q','quiz'],['NB','night']].forEach(([l,id])=>{
    const a=document.createElement('a');a.href='#'+id;a.dataset.sec=id;
    a.innerHTML=`<span class="rdot"></span><span class="rlbl">${l}</span>`;rail.appendChild(a);
  });
  function onScroll(){
    const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    bar.style.width=(h>0?y/h*100:0)+'%';
    nav.classList.toggle('show',y>innerHeight*0.55);
    let cur=null;
    for(const id of secs){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*0.45)cur=id;}
    $$('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
    $$('#rail a').forEach(a=>a.classList.toggle('active',a.dataset.sec===cur));
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
}

/* ================= boot ================= */
(async function(){
  try{
    const res=await fetch('assets/data/content.json');
    CONTENT=await res.json();
  }catch(e){
    $('#chapters').innerHTML='<p style="text-align:center;padding:80px 20px;color:var(--red);font-family:var(--mono)">failed to load content.json</p>';
    return;
  }
  const main=$('#chapters');
  CONTENT.sections.slice(0,4).forEach((sec,i)=>main.appendChild(renderChapter(sec,i)));
  buildQuiz();
  buildNight();
  initScrollFX();
  watchReveals();
})();
