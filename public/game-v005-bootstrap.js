(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const banner=document.getElementById('chapter-banner');
  const canvas=document.getElementById('game');
  if(!start||!welcome||!canvas)return;

  // The game asks the site API for the signed-in username before it starts its
  // render loop. If that request stalls, the old loader could sit forever on
  // “Loading the neighborhood…”. Keep account lookup from ever blocking play.
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.includes('/api/terrarium?action=session'))return nativeFetch(input,init);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),1800);
    return nativeFetch(input,{...init,signal:init.signal||controller.signal})
      .catch(err=>{
        if(err?.name==='AbortError')return new Response('{"user":null}',{status:200,headers:{'Content-Type':'application/json'}});
        throw err;
      })
      .finally(()=>clearTimeout(timer));
  };

  let requested=false;
  let moduleReady=false;
  let gameRendered=false;
  let replaying=false;
  let waitTimer=null;
  let startupTimer=null;

  const resetTimers=()=>{clearInterval(waitTimer);clearTimeout(startupTimer);};
  const showError=(message)=>{
    resetTimers();
    welcome.hidden=false;
    start.disabled=false;
    start.textContent='Retry Chapter 1';
    const p=welcome.querySelector('p');
    if(p)p.textContent=message||'The 3D world did not finish starting. Press Retry Chapter 1.';
  };

  const showChapter=()=>{
    resetTimers();
    welcome.hidden=true;
    if(banner){
      banner.hidden=false;
      setTimeout(()=>{banner.hidden=true;},3300);
    }
  };

  const handOffToGame=()=>{
    if(!requested||!moduleReady||!gameRendered||replaying)return;
    showChapter();
    replaying=true;
    start.disabled=false;
    start.click();
    replaying=false;
  };

  const watchForFirstFrame=()=>{
    clearInterval(waitTimer);
    const began=performance.now();
    waitTimer=setInterval(()=>{
      // The game resize loop changes the canvas drawing buffer on the first
      // successful frame. This is more reliable than hiding the loader early.
      if(canvas.width!==300||canvas.height!==150){
        gameRendered=true;
        clearInterval(waitTimer);
        handOffToGame();
      }else if(performance.now()-began>9000){
        showError('The neighborhood did not finish rendering. Press Retry Chapter 1.');
      }
    },50);
  };

  start.addEventListener('click',()=>{
    if(replaying)return;
    requested=true;
    start.disabled=true;
    start.textContent='Loading the neighborhood…';
    clearTimeout(startupTimer);
    startupTimer=setTimeout(()=>{
      if(!gameRendered)showError('Startup took too long instead of getting stuck forever. Press Retry Chapter 1.');
    },12000);
    if(moduleReady){
      if(gameRendered)handOffToGame();
      else watchForFirstFrame();
    }
  },true);

  addEventListener('error',()=>{
    if(requested&&!gameRendered)showError('A game script error stopped the neighborhood from starting. Press Retry Chapter 1.');
  });
  addEventListener('unhandledrejection',e=>{
    console.error('TerrariumBuilds 3D startup rejection',e.reason);
    if(requested&&!gameRendered)showError('A startup request failed. Press Retry Chapter 1.');
  });

  import('/game-v005.js?v=0.0.5.3').then(()=>{
    moduleReady=true;
    watchForFirstFrame();
    if(!requested){
      start.disabled=false;
      start.textContent='Start Chapter 1';
    }
  }).catch(err=>{
    console.error('TerrariumBuilds 3D failed to load',err);
    showError('The 3D game file did not load correctly. Press Retry Chapter 1.');
  });
})();
