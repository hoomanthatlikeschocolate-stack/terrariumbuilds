(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const banner=document.getElementById('chapter-banner');
  if(!start||!welcome)return;

  let requested=false;
  let moduleReady=false;
  let replaying=false;

  const visualStart=()=>{
    requested=true;
    start.disabled=true;
    start.textContent='Starting Chapter 1…';
    welcome.hidden=true;
    if(banner){banner.hidden=false;setTimeout(()=>{banner.hidden=true;},3300);}
  };

  start.addEventListener('click',()=>{
    if(replaying)return;
    visualStart();
    if(moduleReady){
      replaying=true;
      start.disabled=false;
      start.click();
      replaying=false;
    }
  },true);

  import('/game-v005.js?v=0.0.5.1').then(()=>{
    moduleReady=true;
    if(!requested){
      start.disabled=false;
      start.textContent='Start Chapter 1';
      return;
    }
    replaying=true;
    start.disabled=false;
    start.click();
    replaying=false;
  }).catch(err=>{
    console.error('TerrariumBuilds 3D failed to load',err);
    welcome.hidden=false;
    start.disabled=false;
    start.textContent='Try loading Chapter 1 again';
    const p=welcome.querySelector('p');
    if(p)p.textContent='The 3D game did not finish loading. Try again. If this keeps happening, refresh the page and I will keep fixing it.';
  });
})();
