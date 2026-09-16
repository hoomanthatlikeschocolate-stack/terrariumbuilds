(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const p=welcome?.querySelector('p');
  const fail=(msg)=>{console.error('Terrariums 0.3.1 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error';}if(p)p.textContent=String(msg?.message||msg||'Terrariums could not start.');};
  async function boot(){
    try{
      if(start){start.disabled=true;start.textContent='Loading Terrariums 0.3.1…';}
      if(p)p.textContent='Loading the stabilized performance build…';
      const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});
      if(!oldRes.ok)throw new Error('Could not load stable game bootstrap: HTTP '+oldRes.status);
      let source=await oldRes.text();
      const needle="const code=patchGame(await r.text());let fn;";
      if(!source.includes(needle))throw new Error('Stable bootstrap changed and update hook could not be installed.');
      source=source.replace(needle,`let code=patchGame(await r.text());
    const polishRes=await fetch('/game-v020-addon.js?build=31',{cache:'no-store'});if(!polishRes.ok)throw new Error('systems addon HTTP '+polishRes.status);const polishAddon=await polishRes.text();
    const perfRes=await fetch('/game-v021-performance.js?build=31',{cache:'no-store'});if(!perfRes.ok)throw new Error('performance addon HTTP '+perfRes.status);const perfAddon=await perfRes.text();
    code=code.replace('start.disabled=false;',polishAddon+'\\n'+perfAddon+'\\nstart.disabled=false;');let fn;`);
      source=source.replaceAll('Realism R3','Terrariums 0.3.1').replaceAll('0.0.7 R3','0.3.1 TEST').replaceAll('terrariumbuilds-update-007-r3.js','terrariums-update-031.js');
      new Function(source+'\n//# sourceURL=terrariums-031-bootstrap.js')();
      setTimeout(()=>{const b=document.querySelector('.revamp-badge');if(b)b.textContent='0.3.1 STABILITY';const l=document.querySelector('.logo-title');if(l)l.textContent='Terrariums · 0.3.1';const w=document.querySelector('#welcome p');if(w)w.textContent='Stability rebuild: the glitchy experimental building layer has been removed while movement, driving, animal care, saves and performance fixes stay active.';if(start)start.textContent='Start Terrariums 0.3.1';document.title='Terrariums — 0.3.1 Stability';},0);
    }catch(err){fail(err);}
  }
  boot();
})();