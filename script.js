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

const venueMapUrl="https://www.google.com/maps/search/?api=1&query=Hotel+Grand+Elite+-+Luxury+Banquets";
const mapCard=document.getElementById("mapCard");
function openVenueMap(){window.open(venueMapUrl,"_blank","noopener,noreferrer");}
if(mapCard){
  mapCard.addEventListener("click",openVenueMap);
  mapCard.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openVenueMap();}});
}

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
  masterGain.gain.value=.27;
  masterGain.connect(audioCtx.destination);

  // Soft filtered noise = gentle underwater ambience.
  const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.5;
  noiseNode=audioCtx.createBufferSource();
  noiseNode.buffer=buffer; noiseNode.loop=true;
  const filter=audioCtx.createBiquadFilter();
  filter.type="lowpass"; filter.frequency.value=1100;
  const noiseGain=audioCtx.createGain(); noiseGain.gain.value=.51;
  noiseNode.connect(filter).connect(noiseGain).connect(masterGain);
  noiseNode.start();

  // Dreamy repeating chimes/chords.
  const notes=[261.63,329.63,392.00,523.25,392.00,329.63];
  let n=0;
  const playNote=()=>{
    if(!audioCtx)return;
    const osc=audioCtx.createOscillator(), g=audioCtx.createGain();
    osc.type="triangle"; osc.frequency.value=notes[n++%notes.length];
    g.gain.setValueAtTime(0,audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(.27,audioCtx.currentTime+.06);
    g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+2.2);
    osc.connect(g).connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime+2.4);
  };
  playNote(); musicTimer=setInterval(playNote,750);
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

const bubbleLayer=document.createElement("div");
bubbleLayer.className="bubble-layer";
document.body.appendChild(bubbleLayer);

function createPointerBubble(x,y){
  const bubble=document.createElement("span");
  const size=8+Math.random()*18;
  bubble.className="cursor-bubble";
  bubble.style.left=`${x}px`;
  bubble.style.top=`${y}px`;
  bubble.style.width=`${size}px`;
  bubble.style.height=`${size}px`;
  bubble.style.setProperty("--dx",`${(Math.random()*60-30).toFixed(2)}px`);
  bubble.style.setProperty("--dy",`${(-20-Math.random()*80).toFixed(2)}px`);
  bubbleLayer.appendChild(bubble);
  setTimeout(()=>bubble.remove(),1400);
}

document.addEventListener("pointermove",event=>{
  if(document.getElementById("splashScreen") && event.target.closest("#splashScreen")) return;
  if(Math.random() < 0.22) createPointerBubble(event.clientX, event.clientY);
});

document.addEventListener("pointerdown",event=>{
  for(let i=0;i<3;i++){
    const offsetX=(Math.random()-0.5)*24;
    const offsetY=(Math.random()-0.5)*24;
    setTimeout(()=>createPointerBubble(event.clientX+offsetX, event.clientY+offsetY), i*60);
  }
});

const splash=document.getElementById("splashScreen");
document.getElementById("enterBtn").addEventListener("click",()=>{
  startOceanVibe();
  splash.classList.add("hide");
  setTimeout(()=>splash.remove(),1000);
  setTimeout(launchConfetti,700);
});
