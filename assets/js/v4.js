/* GH0ST://PROTOCOL v4 — cinematic engine */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const hasGsap = typeof gsap!=="undefined" && typeof ScrollTrigger!=="undefined";
if(!hasGsap){ document.body.classList.add("noanim"); const st=document.createElement("style");
  st.textContent=".noanim .cia-col,.noanim .domino,.noanim .slam,.noanim .chip,.noanim .state-card,.noanim .hack-node,.noanim .stamp{opacity:1!important;transform:none!important}.noanim .def-line .w{opacity:1!important;transform:none!important}.noanim .bld-band,.noanim .bld-total{opacity:1!important}.noanim .report-lines span{width:100%!important}.noanim .ethics-ticker span{opacity:1!important}.noanim .st5{opacity:1!important;transform:none!important}.noanim .era-node{opacity:1!important;transform:none!important}";
  document.head.appendChild(st);
} else { gsap.registerPlugin(ScrollTrigger); }

/* ================= SOUND ================= */
const Sound=(()=>{
  let ctx=null,master=null,on=false,humOsc=null;
  function ensure(){ if(ctx) return; ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain(); master.gain.value=0.0; master.connect(ctx.destination); }
  function blip(f,dur,type,vol){ if(!on) return; ensure();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||"square"; o.frequency.value=f||440;
    g.gain.setValueAtTime(0.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol||0.08,ctx.currentTime+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+(dur||0.12));
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime+(dur||0.12)+0.05); }
  function sweep(f1,f2,dur){ if(!on) return; ensure();
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type="sawtooth";
    o.frequency.setValueAtTime(f1,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2,ctx.currentTime+dur);
    g.gain.setValueAtTime(0.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05,ctx.currentTime+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime+dur+0.05); }
  function hum(start){ ensure(); if(start&&on&&!humOsc){
      humOsc=ctx.createOscillator(); const g=ctx.createGain();
      humOsc.type="sine"; humOsc.frequency.value=55; g.gain.value=0.035;
      humOsc.connect(g); g.connect(master); humOsc.start(); humOsc._g=g;
    } else if(humOsc){ humOsc._g.gain.linearRampToValueAtTime(0.0001,ctx.currentTime+0.4);
      const o=humOsc; setTimeout(()=>{try{o.stop()}catch(e){}},600); humOsc=null; } }
  function toggle(){ on=!on; ensure(); if(on){ ctx.resume(); master.gain.value=1; hum(true); blip(660,0.1); }
    else { hum(false); master.gain.value=0; }
    $("#sound-state").textContent=on?"ON":"OFF";
    try{localStorage.setItem("gh0st-sound",on?"1":"0")}catch(e){} }
  try{ if(localStorage.getItem("gh0st-sound")==="1"){ /* stay off until gesture */ } }catch(e){}
  return {blip,sweep,toggle,get on(){return on}};
})();
$("#btn-sound").addEventListener("click",()=>Sound.toggle());

/* ================= BOOT ================= */
const bootLines=[
"GH0ST://PROTOCOL v4.0 — cinematic study build",
"mounting /lectures ........... OK   [ 4 files ]",
"decrypting exam intel ........ OK   [ 63 questions ]",
"arming motion engine ......... OK",
"loading cram deck ............ OK   [ 32 lines ]",
"",
"ACCESS GRANTED — WELCOME, OPERATOR"
];
function runBoot(done){
  const log=$("#boot-log"),fill=$("#boot-fill"); let li=0,ci=0,skipped=false;
  const total=bootLines.join("\n").length+40;
  function finish(){ if(skipped) return; skipped=true;
    $("#boot").classList.add("done"); setTimeout(()=>{$("#boot").style.display="none";done();},650); }
  $("#boot-skip").addEventListener("click",finish);
  $("#boot").addEventListener("click",finish);
  (function type(){
    if(skipped) return;
    if(li>=bootLines.length){ fill.style.width="100%"; setTimeout(finish,700); return; }
    const line=bootLines[li];
    if(ci<=line.length){ log.textContent=bootLines.slice(0,li).join("\n")+(li?"\n":"")+line.slice(0,ci);
      fill.style.width=Math.min(100,((log.textContent.length)/total)*100)+"%";
      ci++; setTimeout(type,ci===1?260:7); }
    else { li++; ci=0; Sound.blip(300+li*90,0.06,"square",0.05); setTimeout(type,110); }
  })();
  setTimeout(finish,9000); // hard cap
}

/* ================= CANVASES ================= */
function fitCanvas(cv){ const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);
  cv.width=r.width*d; cv.height=r.height*d; const c=cv.getContext("2d"); c.setTransform(d,0,0,d,0,0); return c; }

function heroCanvas(){
  const cv=$("#cv-hero"); if(!cv) return; const ctx=fitCanvas(cv);
  let W=cv.getBoundingClientRect().width,H=cv.getBoundingClientRect().height;
  const N=Math.min(90,Math.floor(W*H/14000)); const pts=[];
  for(let i=0;i<N;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});
  let mx=-999,my=-999,visible=true;
  addEventListener("pointermove",e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
  new IntersectionObserver(en=>visible=en[0].isIntersecting).observe(cv);
  addEventListener("resize",()=>{fitCanvas(cv);W=cv.getBoundingClientRect().width;H=cv.getBoundingClientRect().height;});
  (function loop(){ requestAnimationFrame(loop); if(!visible) return;
    ctx.clearRect(0,0,W,H);
    for(const p of pts){ p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
      const dx=mx-p.x,dy=my-p.y,d=Math.hypot(dx,dy);
      if(d<130){p.x+=dx/d*0.9;p.y+=dy/d*0.9;} }
    ctx.strokeStyle="rgba(61,255,160,0.10)";
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<120){ctx.globalAlpha=1-d/120;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
    ctx.globalAlpha=1; ctx.fillStyle="rgba(61,255,160,0.8)";
    for(const p of pts){ctx.beginPath();ctx.arc(p.x,p.y,1.4,0,7);ctx.fill();}
  })();
}

/* worm infection canvas — driven by scroll progress */
let wormSet=null;
function wormDraw(p){
  const cv=$("#cv-worm"); if(!cv) return;
  if(!wormSet){ const ctx=fitCanvas(cv); const r=cv.getBoundingClientRect();
    const N=70,nodes=[];
    for(let i=0;i<N;i++)nodes.push({x:40+Math.random()*(r.width-80),y:60+Math.random()*(r.height-120),on:false});
    const edges=[]; for(let i=0;i<N;i++){const dists=nodes.map((n,j)=>({j,d:Math.hypot(n.x-nodes[i].x,n.y-nodes[i].y)}))
      .filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,2); dists.forEach(o=>edges.push([i,o.j]));}
    wormSet={ctx,nodes,edges,W:r.width,H:r.height};
    addEventListener("resize",()=>{wormSet=null;});
  }
  const {ctx,nodes,edges,W,H}=wormSet;
  const infectedCount=Math.floor(p*nodes.length);
  nodes.forEach((n,i)=>n.on=i<infectedCount);
  ctx.clearRect(0,0,W,H);
  for(const [a,b] of edges){ const A=nodes[a],B=nodes[b];
    ctx.strokeStyle=(A.on&&B.on)?"rgba(255,59,92,0.5)":"rgba(61,255,160,0.12)";
    ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke(); }
  for(const n of nodes){ ctx.fillStyle=n.on?"#ff3b5c":"rgba(61,255,160,0.5)";
    ctx.beginPath();ctx.arc(n.x,n.y,n.on?4:2.4,0,7);ctx.fill();
    if(n.on){ctx.strokeStyle="rgba(255,59,92,0.3)";ctx.beginPath();ctx.arc(n.x,n.y,9+3*Math.sin(Date.now()/300+n.x),0,7);ctx.stroke();} }
}

/* radar canvas — continuous sweep while visible */
function radarCanvas(){
  const cv=$("#cv-radar"); if(!cv) return; const ctx=fitCanvas(cv);
  const r=cv.getBoundingClientRect(); let W=r.width,H=r.height;
  const blips=[]; for(let i=0;i<14;i++) blips.push({a:Math.random()*Math.PI*2,d:0.15+Math.random()*0.8,glow:0});
  let ang=0,visible=true;
  new IntersectionObserver(en=>visible=en[0].isIntersecting).observe(cv);
  addEventListener("resize",()=>{fitCanvas(cv);const rr=cv.getBoundingClientRect();W=rr.width;H=rr.height;});
  (function loop(){ requestAnimationFrame(loop); if(!visible) return;
    ctx.clearRect(0,0,W,H); const cx=W/2,cy=H/2,R=Math.min(W,H)*0.42;
    ctx.strokeStyle="rgba(61,255,160,0.14)";
    for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,R*i/4,0,7);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
    const grd=ctx.createConicGradient?ctx.createConicGradient(ang,cx,cy):null;
    if(grd){grd.addColorStop(0,"rgba(61,255,160,0.30)");grd.addColorStop(0.12,"rgba(61,255,160,0)");grd.addColorStop(1,"rgba(61,255,160,0)");
      ctx.fillStyle=grd;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,0,7);ctx.fill();}
    ctx.strokeStyle="rgba(61,255,160,0.8)";ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);ctx.stroke();
    for(const b of blips){ const da=((ang-b.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      if(da<0.08)b.glow=1; b.glow*=0.985;
      const x=cx+Math.cos(b.a)*R*b.d,y=cy+Math.sin(b.a)*R*b.d;
      ctx.fillStyle=`rgba(255,200,87,${0.15+b.glow*0.85})`;
      ctx.beginPath();ctx.arc(x,y,3+b.glow*3,0,7);ctx.fill(); }
    ang+=0.012;
  })();
}

/* finale ember drift */
function finaleCanvas(){
  const cv=$("#cv-finale"); if(!cv) return; const ctx=fitCanvas(cv);
  const r=cv.getBoundingClientRect(); let W=r.width,H=r.height;
  const ps=[]; for(let i=0;i<50;i++)ps.push({x:Math.random()*W,y:Math.random()*H,s:0.3+Math.random()*1.1,o:Math.random()});
  let visible=true; new IntersectionObserver(en=>visible=en[0].isIntersecting).observe(cv);
  (function loop(){ requestAnimationFrame(loop); if(!visible) return;
    ctx.clearRect(0,0,W,H);
    for(const p of ps){ p.y-=p.s; if(p.y<-4){p.y=H+4;p.x=Math.random()*W;}
      ctx.fillStyle=`rgba(61,255,160,${0.12+p.o*0.3})`;ctx.fillRect(p.x,p.y,2,2); }
  })();
}

/* ================= SCROLL CHOREOGRAPHY ================= */
function scenes(){
  if(!hasGsap) return;
  const pin=(trigger,end)=>ScrollTrigger.create({trigger,start:"top top",end:end||"+=100%",pin:true,anticipatePin:1});
  const tl=(trigger,end)=>gsap.timeline({scrollTrigger:{trigger,start:"top top",end:end||"+=100%",pin:true,scrub:0.6,anticipatePin:1}});

  // progress + act label
  ScrollTrigger.create({start:0,end:"max",onUpdate:self=>{ $("#hud-progress-fill").style.width=(self.progress*100)+"%"; }});
  $$(".scene").forEach(s=>ScrollTrigger.create({trigger:s,start:"top 55%",end:"bottom 55%",
    onToggle:self=>{ if(self.isActive){ $("#hud-act").textContent=s.dataset.act||""; Sound.blip(520,0.05,"square",0.03);} }}));

  // hero parallax
  gsap.to(".hero-core",{yPercent:-30,opacity:0,ease:"none",
    scrollTrigger:{trigger:"#s-hero",start:"top top",end:"bottom top",scrub:true}});

  // dividers
  $$(".scene-divider").forEach(d=>{
    gsap.from(d.querySelector(".divider-word"),{xPercent:-18,opacity:0,ease:"power2.out",
      scrollTrigger:{trigger:d,start:"top 70%",end:"top 20%",scrub:true}});
    gsap.from(d.querySelector(".divider-num"),{opacity:0,scrollTrigger:{trigger:d,start:"top 70%",end:"top 30%",scrub:true}});
  });

  // S1 era
  { const t=tl("#s-compliment","+=180%");
    t.to("#era-word",{color:"#3dffa0",duration:.5},0);
    $$("#s-compliment .era-node").forEach((n,i)=>t.to(n,{opacity:1,y:0,duration:.6,onStart:()=>Sound.blip(400+i*120,0.07)},i*0.8+0.3));
    t.to("#era-word",{color:"#ff3b5c",textShadow:"0 0 46px rgba(255,59,92,.5)",duration:1},3.4);
    t.to("#era-cap-a",{opacity:0,duration:.3,onComplete:()=>{$("#era-cap-a").style.display="none";$("#era-cap-b").style.display="";gsap.fromTo("#era-cap-b",{opacity:0},{opacity:1,duration:.4});}},3.5);
  }

  // S2 worm
  { const cnt={v:0}; const t=tl("#s-worm","+=160%");
    t.to(cnt,{v:6000,duration:4,ease:"power1.in",onUpdate:()=>{ $("#worm-count").textContent=Math.round(cnt.v).toLocaleString(); wormDraw(cnt.v/6000); }},0.3);
  }

  // S3 definition
  { const t=tl("#s-define","+=120%");
    t.to("#def-line .w",{opacity:1,y:0,stagger:0.22,duration:.5},0.2); }

  // S4 axes
  { const nodes=$$("#axes-svg .hack-node"); const t=tl("#s-axes","+=220%");
    const readout=$("#axes-readout");
    nodes.forEach((n,i)=>{ t.fromTo(n,{opacity:0,scale:0,transformOrigin:"center"},{opacity:1,scale:1,duration:.5,ease:"back.out(2)",
      onStart:()=>{readout.textContent=n.dataset.name+" — "+n.dataset.line;Sound.blip(360+i*80,0.08);}},i*0.55+0.3); });
    nodes.forEach(n=>{ n.addEventListener("pointerenter",()=>{$("#axes-readout").textContent=n.dataset.name+" — "+n.dataset.line;Sound.blip(700,0.05,"square",0.04);});
      n.addEventListener("click",()=>{$("#axes-readout").textContent=n.dataset.name+" — "+n.dataset.line;}); });
  }

  // S5 paradox
  { const t=tl("#s-paradox","+=90%");
    t.from("#p-auth",{x:-160,opacity:0,duration:1},0.2)
     .from("#p-unauth",{x:160,opacity:0,duration:1},0.2)
     .to("#s-paradox .stage",{x:6,duration:.06,repeat:5,yoyo:true},1.3)
     .from("#s-paradox .cap-mid",{opacity:0,y:24,duration:.8},1.6);
  }

  // S6 CIA
  { const t=tl("#s-cia","+=90%");
    t.to(".cia-col",{opacity:1,y:0,stagger:0.5,duration:.9,ease:"power3.out",
      onStart:()=>Sound.blip(440,0.1)},0.2);
  }

  // S7 dominoes
  { const t=tl("#s-domino","+=160%");
    $$(".domino").forEach((d,i)=>{
      t.fromTo(d,{opacity:0,rotation:0,y:-10},{opacity:1,y:0,duration:.35},i*0.55+0.2);
      if(i>0) t.to($$(".domino")[i-1],{rotation:-14,duration:.3},i*0.55+0.5);
      t.call(()=>Sound.blip(200+i*60,0.06,"square",0.05),null,i*0.55+0.5);
    });
  }

  // S8 ethics
  { const t=tl("#s-ethics","+=140%");
    $$("#ethics-ticker span").forEach((s,i)=>t.to(s,{opacity:1,borderColor:"#3dffa0",duration:.3,
      onStart:()=>Sound.blip(500+i*70,0.05)},i*0.32+0.2));
    t.to("#stamp-india",{opacity:1,scale:1,rotation:-6,duration:.5,ease:"power4.in"},3.2)
     .to("#s-ethics .stage",{x:8,duration:.05,repeat:5,yoyo:true},3.7);
  }

  // recon
  { const t=tl("#s-recon","+=90%");
    t.from("#s-recon .duo-card",{y:40,opacity:0,stagger:.4,duration:.8},0.3); }

  // scanning grid
  { const grid=$("#portgrid");
    for(let i=0;i<100;i++){const c=document.createElement("div");c.className="portcell";grid.appendChild(c);}
    const cells=$$(".portcell"); const states=cells.map(()=>{const r=Math.random();return r<0.08?"open":r<0.2?"filtered":"closed";});
    const t=tl("#s-scanning","+=140%");
    cells.forEach((c,i)=>t.call(((cell,st)=>()=>{cell.classList.add(st); if(st==="open")Sound.blip(880,0.05,"square",0.04);})(c,states[i]),null,0.2+i*0.035));
  }

  // gaining
  { const t=tl("#s-gaining","+=100%");
    t.to("#door",{duration:.1,onStart:()=>{$("#door").classList.add("open");Sound.sweep(120,600,0.5);}},0.5)
     .from("#esc-arrow",{opacity:0,y:26,duration:.8},1.4);
  }

  // maintaining
  { const t=tl("#s-maintaining","+=90%");
    t.to("#backdoor",{duration:.1,onStart:()=>{$("#backdoor").classList.add("open");Sound.sweep(600,120,0.6);}},0.8); }

  // clearing
  { const pre=$("#loglines"); const lines=pre.textContent.split("\n");
    pre.innerHTML=lines.map(l=>`<span class="logline">${l}</span>`).join("\n");
    const t=tl("#s-clearing","+=140%");
    $$("#loglines .logline").forEach((l,i)=>t.to(l,{opacity:.35,color:"#2a3d33",textDecoration:"line-through",duration:.3,
      onStart:()=>Sound.blip(180,0.07,"sawtooth",0.05)},i*0.5+0.3));
    t.to("#loglines",{opacity:.25,duration:.5},3.4);
  }

  // reporting
  { const t=tl("#s-reporting","+=110%");
    $$("#report-doc .report-lines span").forEach((s,i)=>t.to(s,{width:"100%",duration:.5,
      onStart:()=>Sound.blip(620,0.04)},i*0.45+0.4));
  }

  // remediation loop
  { const path=$("#loop-path"); const len=path.getTotalLength();
    gsap.set(path,{strokeDasharray:len,strokeDashoffset:len});
    const t=tl("#s-remediation","+=90%");
    t.to(path,{strokeDashoffset:0,duration:2,ease:"power1.inOut"},0.3)
     .from(".loop-note",{opacity:0,duration:.6},2.0);
  }

  // FCA slam
  { const t=tl("#s-fca","+=110%");
    $$(".slam").forEach((s,i)=>{ t.to(s,{opacity:1,scale:1,duration:.5,ease:"power4.in",
      onStart:()=>Sound.sweep(900,160,0.35)},i*0.7+0.3);
      t.to("#s-fca .stage",{x:5,duration:.04,repeat:3,yoyo:true},i*0.7+0.78); });
  }

  // zero-day
  { const z=$("#zero-num"); const seq=["3","2","1","0"]; const t=tl("#s-zeroday","+=80%");
    t.call(()=>{z.textContent="?";},null,0.1);
    seq.forEach((n,i)=>t.call(()=>{z.textContent=n;Sound.blip(300-i*50,0.12,"sawtooth",0.08);
      gsap.fromTo(z,{scale:1.25},{scale:1,duration:.35});},null,0.4+i*0.5));
  }

  // box spectrum
  { const t=tl("#s-box","+=160%");
    const items=$$(".box-item");
    t.to("#cube-fill",{height:"0%",duration:.01},0);
    t.call(()=>{items.forEach(i=>i.classList.remove("lit"));items[0].classList.add("lit");$("#cube-fill").style.height="8%";},null,0.2);
    t.to("#cube-fill",{height:"50%",duration:1,onStart:()=>{items.forEach(i=>i.classList.remove("lit"));items[1].classList.add("lit");Sound.blip(520,0.08);}},1.2);
    t.to("#cube-fill",{height:"100%",duration:1,onStart:()=>{items.forEach(i=>i.classList.remove("lit"));items[2].classList.add("lit");Sound.blip(760,0.08);}},2.6);
  }

  // pentest 5
  { const t=tl("#s-pentest5","+=130%");
    $$(".st5").forEach((s,i)=>t.to(s,{opacity:1,y:0,duration:.4,onStart:()=>Sound.blip(420+i*90,0.06)},i*0.5+0.3));
  }

  // trinity typewriter
  { const t=tl("#s-trinity","+=90%");
    const cmd="nmap 10.2.2.2  →  22/tcp  OPEN  ssh";
    t.call(()=>{ const el=$("#tt-cmd"); el.textContent=""; let i=0;
      const iv=setInterval(()=>{ el.textContent=cmd.slice(0,++i); Sound.blip(900+Math.random()*300,0.02,"square",0.02);
        if(i>=cmd.length)clearInterval(iv); },45); },null,0.4);
    t.from("#s-trinity .cap-big",{opacity:0,y:30,duration:.8},1.0);
  }

  // building
  { const t=tl("#s-building","+=170%");
    $$("#bld-svg .bld-door").forEach((d,i)=>t.to(d,{duration:.1,onStart:()=>{d.classList.add("lit");Sound.blip(500+i*140,0.07);}},i*0.5+0.3));
    $$("#bld-svg .bld-band").forEach((b,i)=>t.to(b,{opacity:1,duration:.4},1.9+i*0.4));
    t.to(".bld-total",{opacity:1,duration:.5},3.3);
  }

  // states
  { const t=tl("#s-states","+=90%");
    t.to(".state-card",{opacity:1,y:0,stagger:.5,duration:.8,onStart:()=>Sound.blip(480,0.08)},0.3); }

  // flags assembly
  { const typed=$("#flag-typed"); const t=tl("#s-flags","+=200%");
    let acc="";
    $$("#flag-chips .chip").forEach((c,i)=>{
      t.to(c,{opacity:1,y:0,rotation:0,duration:.45,ease:"back.out(1.6)",
        onStart:()=>{acc+=(acc?" ":"")+c.dataset.f; typed.textContent=acc; Sound.blip(600+i*60,0.07);}},i*0.55+0.3);
    });
  }

  // report highlight
  { const t=tl("#s-report","+=90%");
    t.from("#nmap-report",{opacity:0,y:36,duration:.8},0.2)
     .fromTo("#nmap-report .hl-open",{backgroundColor:"rgba(61,255,160,.35)"},{backgroundColor:"rgba(61,255,160,0)",duration:1.4,stagger:.4},1.0);
  }

  // law stamp
  { const t=tl("#s-law","+=70%");
    t.to("#stamp-law",{opacity:1,scale:1,rotation:-6,duration:.5,ease:"power4.in",
      onStart:()=>Sound.sweep(700,90,0.5)},0.6)
     .to("#s-law .stage",{x:7,duration:.05,repeat:5,yoyo:true},1.1);
  }

  // finale
  gsap.from(".finale-title",{opacity:0,y:50,scrollTrigger:{trigger:"#s-finale",start:"top 60%",end:"top 20%",scrub:true}});
}

/* ================= HANDSHAKE (interactive) ================= */
function handshake(){
  const p1=$("#hs-p1"),p2=$("#hs-p2"),p3=$("#hs-p3");
  const t1=$("#hs-t1"),t2=$("#hs-t2"),t3=$("#hs-t3"),verdict=$("#hs-verdict");
  if(!hasGsap){verdict.textContent="SYN → SYN-ACK → ACK";return;}
  [p1,p2,p3].forEach(p=>{const len=460; gsap.set(p,{strokeDasharray:len,strokeDashoffset:len});});
  gsap.set([t1,t2,t3,verdict],{opacity:0});
  let run=null;
  function play(mode){
    if(run)run.kill();
    [p1,p2,p3].forEach(p=>gsap.set(p,{strokeDashoffset:460}));
    p3.classList.toggle("rst",mode==="syn");
    gsap.set([t1,t2,t3,verdict],{opacity:0});
    verdict.textContent="";
    run=gsap.timeline();
    run.to(p1,{strokeDashoffset:0,duration:.8,ease:"power1.inOut",onStart:()=>Sound.blip(500,0.1)})
       .to(t1,{opacity:1,duration:.2},"-=0.3")
       .to(p2,{strokeDashoffset:0,duration:.8,ease:"power1.inOut",onStart:()=>Sound.blip(620,0.1)},"+=0.25")
       .to(t2,{opacity:1,duration:.2},"-=0.3");
    if(mode==="syn"){
      t3.textContent="RST — walk away";
      run.to(p3,{strokeDashoffset:0,duration:.8,ease:"power1.inOut",onStart:()=>Sound.sweep(500,140,0.4)},"+=0.25")
         .to(t3,{opacity:1,duration:.2},"-=0.3")
         .call(()=>{verdict.textContent="PORT OPEN — NO CONNECTION EVER EXISTED";})
         .to(verdict,{opacity:1,duration:.4});
    } else {
      t3.textContent="ACK — channel open";
      run.to(p3,{strokeDashoffset:0,duration:.8,ease:"power1.inOut",onStart:()=>Sound.blip(760,0.1)},"+=0.25")
         .to(t3,{opacity:1,duration:.2},"-=0.3")
         .call(()=>{verdict.textContent="CONNECTION ESTABLISHED — AND LOGGED";})
         .to(verdict,{opacity:1,duration:.4});
    }
  }
  $("#hs-normal").addEventListener("click",()=>play("full"));
  $("#hs-synscan").addEventListener("click",()=>play("syn"));
  ScrollTrigger.create({trigger:"#s-handshake",start:"top 40%",once:true,onEnter:()=>play("full")});
}

/* ================= DRILL + CRAM ================= */
let DATA=null;
async function loadData(){ if(DATA) return DATA;
  const res=await fetch("assets/data/content.json"); DATA=await res.json(); return DATA; }

const store={ get(){try{return JSON.parse(localStorage.getItem("gh0st-drill")||"{}")}catch(e){return{}}},
  set(s){try{localStorage.setItem("gh0st-drill",JSON.stringify(s))}catch(e){}} };

const Drill=(()=>{
  let list=[],idx=0,filter="all",marks=store.get();
  function apply(){ const qs=DATA.questions;
    list=qs.filter(q=> filter==="all"?true : filter==="missed"? marks[q.id]==="m" : q.id.startsWith(filter));
    idx=0; render(); }
  function render(){ const q=list[idx];
    $("#drill-count").textContent=`· ${list.length} SHOWN · ${Object.values(marks).filter(v=>v==="g").length}/${DATA.questions.length} KNOWN`;
    if(!q){ $("#drill-qid").textContent="—"; $("#drill-q").textContent=filter==="missed"?"Nothing missed. Clean record.":"No questions here.";
      $("#drill-a").hidden=true; $("#drill-a").textContent=""; $("#drill-hint").style.display="none"; return; }
    $("#drill-qid").textContent=`${q.id} · CARD ${idx+1} / ${list.length}`+(marks[q.id]==="g"?" · GOT IT":marks[q.id]==="m"?" · MISSED":"");
    $("#drill-q").textContent=q.question;
    $("#drill-a").hidden=true; $("#drill-a").textContent=q.answer;
    $("#drill-hint").style.display="";
    $("#drill-fill").style.width=((idx+1)/list.length*100)+"%";
  }
  function reveal(){ const a=$("#drill-a"); a.hidden=!a.hidden; $("#drill-hint").style.display=a.hidden?"":"none"; Sound.blip(a.hidden?400:760,0.07); }
  function mark(v){ const q=list[idx]; if(!q)return; marks[q.id]=v; store.set(marks);
    Sound.blip(v==="g"?880:220,0.12, v==="g"?"square":"sawtooth"); next(); }
  function next(){ if(idx<list.length-1){idx++;render();} else {idx=0;render();} }
  function prev(){ if(idx>0){idx--;render();} }
  async function open(){ await loadData(); apply();
    $("#drill").hidden=false; document.body.style.overflow="hidden"; Sound.sweep(200,700,0.4); }
  function close(){ $("#drill").hidden=true; document.body.style.overflow=""; }
  $("#drill-card").addEventListener("click",e=>{ if(e.target.closest(".drill-actions"))return; reveal(); });
  $("#drill-next").addEventListener("click",next);
  $("#drill-prev").addEventListener("click",prev);
  $("#drill-got").addEventListener("click",()=>mark("g"));
  $("#drill-missed").addEventListener("click",()=>mark("m"));
  $("#drill-close").addEventListener("click",close);
  $$("#drill-filters .fchip").forEach(c=>c.addEventListener("click",()=>{
    $$("#drill-filters .fchip").forEach(x=>x.classList.remove("on")); c.classList.add("on"); filter=c.dataset.f; apply(); }));
  document.addEventListener("keydown",e=>{ if($("#drill").hidden)return;
    if(e.key==="ArrowRight")next(); if(e.key==="ArrowLeft")prev();
    if(e.key===" "){e.preventDefault();reveal();} if(e.key==="Escape")close(); });
  return {open,close};
})();

const Cram=(()=>{
  let lines=[],idx=0;
  function render(){ $("#cram-count").textContent=`· ${idx+1} / ${lines.length}`;
    $("#cram-num").textContent=String(idx+1).padStart(2,"0");
    $("#cram-text").textContent=lines[idx]; }
  async function open(){ await loadData();
    const night=DATA.sections.find(s=>s.slug==="night");
    lines=night.blocks.map(b=>b.text||"").filter(t=>/^\d+\./.test(t)).map(t=>t.replace(/^\d+\.\s*/,""));
    idx=0; render(); $("#cram").hidden=false; document.body.style.overflow="hidden"; Sound.sweep(200,700,0.4); }
  function close(){ $("#cram").hidden=true; document.body.style.overflow=""; }
  function next(){ idx=(idx+1)%lines.length; render(); Sound.blip(660,0.06); }
  function prev(){ idx=(idx-1+lines.length)%lines.length; render(); Sound.blip(440,0.06); }
  $("#cram-next").addEventListener("click",next);
  $("#cram-prev").addEventListener("click",prev);
  $("#cram-close").addEventListener("click",close);
  $("#cram-card").addEventListener("click",next);
  document.addEventListener("keydown",e=>{ if($("#cram").hidden)return;
    if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();next();}
    if(e.key==="ArrowLeft")prev(); if(e.key==="Escape")close(); });
  return {open,close};
})();

$("#btn-drill").addEventListener("click",Drill.open);
$("#btn-drill2").addEventListener("click",Drill.open);
$("#btn-cram").addEventListener("click",Cram.open);
$("#btn-cram2").addEventListener("click",Cram.open);

/* ================= IGNITION ================= */
heroCanvas(); radarCanvas(); finaleCanvas(); handshake(); wormDraw(0);
runBoot(()=>{ scenes(); if(hasGsap)ScrollTrigger.refresh(); Sound.sweep(120,880,0.8); });
if(!hasGsap){ scenes(); }
})();
