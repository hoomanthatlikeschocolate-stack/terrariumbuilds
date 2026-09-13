'use strict';
(() => {
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=()=>matchMedia('(pointer: coarse)').matches;
  let hugBusy=false;

  function burstLeaves(x,y,count=9){
    if(reduced())return;
    const glyphs=['🍃','🌿','☘️'];
    for(let i=0;i<count;i++){
      const leaf=document.createElement('span');
      leaf.className='tb-leaf-burst';
      leaf.textContent=glyphs[i%glyphs.length];
      leaf.style.left=x+'px';leaf.style.top=y+'px';
      leaf.style.setProperty('--dx',((Math.random()-.5)*150).toFixed(0)+'px');
      leaf.style.setProperty('--dy',(-35-Math.random()*95).toFixed(0)+'px');
      leaf.style.setProperty('--rot',((Math.random()-.5)*300).toFixed(0)+'deg');
      leaf.style.animationDelay=(i*22)+'ms';
      document.body.appendChild(leaf);
      setTimeout(()=>leaf.remove(),1100);
    }
  }

  function startChameleonHug(x,y){
    if(hugBusy||reduced()||coarse())return;
    hugBusy=true;

    const fake=document.createElement('div');
    fake.className='tb-frozen-cursor';
    fake.style.left=x+'px';
    fake.style.top=y+'px';

    const cham=document.createElement('div');
    cham.className='tb-hug-chameleon';
    cham.style.left=x+'px';
    cham.style.top=y+'px';
    cham.innerHTML='<span class="tb-cham-body">🦎</span><span class="tb-hug-arm tb-hug-arm-top"></span><span class="tb-hug-arm tb-hug-arm-bottom"></span><span class="tb-hug-heart">♥</span>';

    document.body.append(fake,cham);
    document.documentElement.classList.add('tb-cursor-held');

    requestAnimationFrame(()=>cham.classList.add('is-arriving'));
    setTimeout(()=>cham.classList.add('is-wrapping'),360);
    setTimeout(()=>cham.classList.add('is-hugging'),650);
    setTimeout(()=>cham.classList.add('is-releasing'),1420);
    setTimeout(()=>cham.classList.add('is-leaving'),1690);
    setTimeout(()=>{
      document.documentElement.classList.remove('tb-cursor-held');
      fake.remove();
      cham.remove();
      hugBusy=false;
    },2080);
  }

  // The chameleon easter egg ONLY runs when the dark-green top strip is clicked.
  document.addEventListener('click',e=>{
    const bar=e.target.closest?.('.topline');
    if(!bar||reduced()||coarse())return;
    const now=Date.now(),last=Number(sessionStorage.getItem('tb-hug-last')||0);
    if(now-last<4200||hugBusy)return;
    sessionStorage.setItem('tb-hug-last',String(now));
    startChameleonHug(e.clientX,e.clientY);
  });

  document.addEventListener('click',e=>{
    const add=e.target.closest?.('[data-add]');if(!add||add.disabled)return;
    const r=add.getBoundingClientRect();burstLeaves(r.left+r.width/2,r.top+r.height/2,8);
  });

  let logoClicks=[];
  document.addEventListener('click',e=>{
    const logo=e.target.closest?.('.brand-logo');if(!logo||reduced())return;
    const now=Date.now();logoClicks=logoClicks.filter(t=>now-t<1800);logoClicks.push(now);
    if(logoClicks.length<3)return;
    logoClicks=[];
    const header=document.querySelector('header');if(!header)return;
    header.classList.remove('tb-moss-bloom');void header.offsetWidth;header.classList.add('tb-moss-bloom');
    burstLeaves(innerWidth/2,Math.min(115,header.getBoundingClientRect().bottom),14);
    setTimeout(()=>header.classList.remove('tb-moss-bloom'),4200);
  });

  function frogPeek(){
    if(reduced()||coarse()||document.querySelector('.tb-frog-peek')||document.visibilityState!=='visible')return;
    const frog=document.createElement('button');frog.type='button';frog.className='tb-frog-peek';frog.setAttribute('aria-label','A tiny frog is peeking at the page');
    frog.innerHTML='<span class="tb-frog-face">🐸</span><span class="tb-frog-note">psst… nice terrarium</span>';
    document.body.appendChild(frog);
    requestAnimationFrame(()=>frog.classList.add('show'));
    frog.addEventListener('click',()=>{frog.classList.add('boop');frog.querySelector('.tb-frog-note').textContent='ribbit ✓';setTimeout(()=>frog.classList.remove('show'),900);setTimeout(()=>frog.remove(),1500);});
    setTimeout(()=>frog.classList.remove('show'),8500);setTimeout(()=>frog.remove(),9300);
  }
  setTimeout(frogPeek,22000);

  const vine=document.createElement('div');vine.className='tb-vine-progress';vine.innerHTML='<span></span>';document.body.appendChild(vine);
  let ticking=false;
  const updateVine=()=>{
    ticking=false;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    vine.style.setProperty('--progress',Math.min(1,Math.max(0,scrollY/max)));
  };
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateVine);}},{passive:true});updateVine();

  document.addEventListener('pointermove',e=>{
    if(reduced()||coarse())return;
    const card=e.target.closest?.('.product,.guide,.animal-card,.animal-fact-card,.info-care-card');if(!card)return;
    const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.style.setProperty('--tilt-x',(-py*2.1).toFixed(2)+'deg');card.style.setProperty('--tilt-y',(px*2.1).toFixed(2)+'deg');card.classList.add('tb-tilt');
  });
  document.addEventListener('pointerout',e=>{
    const card=e.target.closest?.('.product,.guide,.animal-card,.animal-fact-card,.info-care-card');
    if(card&&!card.contains(e.relatedTarget)){card.classList.remove('tb-tilt');card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');}
  });
})();