(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const banner=document.getElementById('chapter-banner');
  const canvas=document.getElementById('game');
  if(!start||!welcome||!canvas)return;

  let requested=false;
  let moduleReady=false;
  let gameRendered=false;
  let replaying=false;
  let failed=false;
  let waitTimer=null;

  const showError=(message)=>{
    failed=true;
    clearInterval(waitTimer);
    welcome.hidden=false;
    start.disabled=false;
    start.textContent='Retry Chapter 1';
    const p=welcome.querySelector('p');
    if(p)p.textContent=message||'The 3D world did not finish starting. Press Retry Chapter 1.';
  };

  const showChapter=()=>{
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
      // A fresh canvas is 300x150. The game's resize/render loop changes it
      // to the real viewport dimensions on its first successful frame.
      if(canvas.width!==300||canvas.height!==150){
        gameRendered=true;
        clearInterval(waitTimer);
        handOffToGame();
      }else if(performance.now()-began>10000){
        showError('The 3D world loaded but never rendered its first frame. Press Retry Chapter 1. If it happens again, refresh once.');
      }
    },50);
  };

  start.addEventListener('click',()=>{
    if(replaying)return;
    requested=true;
    failed=false;
    start.disabled=true;
    start.textContent='Loading the neighborhood…';
    // Keep the welcome screen up until the WebGL world has ACTUALLY drawn.
    // This prevents the old blank/green-screen state.
    if(moduleReady&&gameRendered)handOffToGame();
  },true);

  addEventListener('error',e=>{
    if(requested&&!gameRendered)showError('Something stopped the 3D world from starting. Press Retry Chapter 1.');
  });
  addEventListener('unhandledrejection',e=>{
    console.error('TerrariumBuilds 3D startup rejection',e.reason);
    if(requested&&!gameRendered)showError('The 3D world hit a startup error. Press Retry Chapter 1.');
  });

  import('/game-v005.js?v=0.0.5.2').then(()=>{
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
