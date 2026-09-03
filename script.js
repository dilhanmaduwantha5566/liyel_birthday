window.addEventListener("load",()=>{
  const splash=document.getElementById("splashScreen");
  setTimeout(()=>splash.classList.add("ready"),500);
});

const target = new Date("2026-09-16T18:00:00+05:30").getTime();
function updateCountdown(){
  const diff=Math.max(0,target-Date.now());
  const d=Math.floor(diff/86400000), h=Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60, s=Math.floor(diff/1000)%60;
  ["days","hours","minutes","seconds"].forEach((id,i)=>{
    const vals=[d,h,m,s]; document.getElementById(id).textContent=String(vals[i]).padStart(2,"0");
  });
}
updateCountdown(); setInterval(updateCountdown,1000);

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const modal=document.getElementById("modal");
function openModal(){modal.classList.add("open");modal.setAttribute("aria-hidden","false");launchConfetti()}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
document.getElementById("rsvpBtn").addEventListener("click",openModal);
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("backBtn").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});

const canvas=document.getElementById("confetti"),ctx=canvas.getContext("2d");
function launchConfetti(){
  canvas.width=innerWidth;canvas.height=innerHeight;
  const pieces=Array.from({length:110},()=>({x:innerWidth/2,y:innerHeight*.5,vx:(Math.random()-.5)*13,vy:(Math.random()-1)*12,g:.25,r:3+Math.random()*5,a:1,spin:Math.random()*.2}));
  let frame=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.a-=.008;p.r+=p.spin;ctx.save();ctx.globalAlpha=Math.max(p.a,0);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=["#9cf5fa","#ffb6a2","#fff","#ffd76b"][Math.floor(Math.random()*4)];ctx.fillRect(-3,-6,6,12);ctx.restore()});
    if(frame++<150)requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  } draw();
}

let audioCtx=null, musicTimer=null, masterGain=null, noiseNode=null;
const musicBtn=document.getElementById("musicBtn");
const musicLabel=musicBtn.querySelector(".music-label");

function startOceanVibe(){
  if(audioCtx) return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain();
  masterGain.gain.value=.055;
  masterGain.connect(audioCtx.destination);

  // Soft filtered noise = gentle underwater ambience.
  const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.35;
  noiseNode=audioCtx.createBufferSource();
  noiseNode.buffer=buffer; noiseNode.loop=true;
  const filter=audioCtx.createBiquadFilter();
  filter.type="lowpass"; filter.frequency.value=900;
  const noiseGain=audioCtx.createGain(); noiseGain.gain.value=.22;
  noiseNode.connect(filter).connect(noiseGain).connect(masterGain);
  noiseNode.start();

  // Dreamy repeating chimes/chords.
  const notes=[261.63,329.63,392.00,523.25,392.00,329.63];
  let n=0;
  const playNote=()=>{
    if(!audioCtx)return;
    const osc=audioCtx.createOscillator(), g=audioCtx.createGain();
    osc.type="sine"; osc.frequency.value=notes[n++%notes.length];
    g.gain.setValueAtTime(0,audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(.13,audioCtx.currentTime+.04);
    g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+1.8);
    osc.connect(g).connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime+1.9);
  };
  playNote(); musicTimer=setInterval(playNote,900);
  musicBtn.classList.add("playing"); musicLabel.textContent="Music on";
}

function stopOceanVibe(){
  if(!audioCtx)return;
  clearInterval(musicTimer); musicTimer=null;
  if(noiseNode)try{noiseNode.stop()}catch(e){}
  audioCtx.close(); audioCtx=null; noiseNode=null; masterGain=null;
  musicBtn.classList.remove("playing"); musicLabel.textContent="Music off";
}

musicBtn.addEventListener("click",()=>audioCtx?stopOceanVibe():startOceanVibe());

const splash=document.getElementById("splashScreen");
document.getElementById("enterBtn").addEventListener("click",()=>{
  startOceanVibe();
  splash.classList.add("hide");
  setTimeout(()=>splash.remove(),1000);
  setTimeout(launchConfetti,700);
});
