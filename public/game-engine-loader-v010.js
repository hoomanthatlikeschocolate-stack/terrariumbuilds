(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const p=welcome?.querySelector('p');
  const fail=(msg)=>{console.error('Terrariums 0.2.1 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error';}if(p)p.textContent=String(msg?.message||msg||'Terrariums 0.2.1 could not start.');};
  async function boot(){
    try{
      if(start){start.disabled=true;start.textContent='Loading Terrariums 0.2.1…';}
      if(p)p.textContent='Loading the performance-optimized Terrariums build…';
      const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});
      if(!oldRes.ok)throw new Error('Could not load the stable game bootstrap: HTTP '+oldRes.status);
      let source=await oldRes.text();
      const needle="const code=patchGame(await r.text());let fn;";
      if(!source.includes(needle))throw new Error('Stable bootstrap changed and the performance hook could not be installed.');
      source=source.replace(needle,`let code=patchGame(await r.text());
    const polishRes=await fetch('/game-v020-addon.js?build=22',{cache:'no-store'});
    if(!polishRes.ok)throw new Error('0.2 alpha polish addon returned HTTP '+polishRes.status);
    const polishAddon=await polishRes.text();
    if(!polishAddon.includes('Update 0.2 Alpha Polish + Bug Fix'))throw new Error('0.2 alpha polish addon failed integrity check');
    const perfRes=await fetch('/game-v021-performance.js?build=23',{cache:'no-store'});
    if(!perfRes.ok)throw new Error('0.2.1 performance addon returned HTTP '+perfRes.status);
    const perfAddon=await perfRes.text();
    if(!perfAddon.includes('0.2.1 Performance Hotfix'))throw new Error('0.2.1 performance addon failed integrity check');
    code=code.replace('start.disabled=false;',polishAddon+'\\n'+perfAddon+'\\nstart.disabled=false;');
    let fn;`);
      source=source.replaceAll('Realism R3','Terrariums 0.2.1');
      source=source.replaceAll('0.0.7 R3','0.2.1 TEST');
      source=source.replaceAll('terrariumbuilds-update-007-r3.js','terrariums-update-021.js');
      source=source.replace('drivable car, larger map, taller buildings, better roof/camera behavior, persistent inventory, and a town map.','Terrariums 0.2.1: performance-first rendering, polished movement, better collisions, stable driving, frog-care actions, clearer objectives and reliable saves.');
      new Function(source+'\n//# sourceURL=terrariums-021-bootstrap.js')();
    }catch(err){fail(err);}
  }
  boot();
})();