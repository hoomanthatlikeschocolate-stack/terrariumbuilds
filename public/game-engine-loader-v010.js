(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const p=welcome?.querySelector('p');
  const fail=(msg)=>{console.error('Terrariums 0.2 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error';}if(p)p.textContent=String(msg?.message||msg||'Terrariums 0.2 could not start.');};
  async function boot(){
    try{
      if(start){start.disabled=true;start.textContent='Loading Terrariums 0.2…';}
      if(p)p.textContent='Loading Terrariums 0.2 Alpha polish, animal care, collisions and bug fixes…';
      const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});
      if(!oldRes.ok)throw new Error('Could not load the stable game bootstrap: HTTP '+oldRes.status);
      let source=await oldRes.text();
      const needle="const code=patchGame(await r.text());let fn;";
      if(!source.includes(needle))throw new Error('Stable bootstrap changed and the 0.2 upgrade hook could not be installed.');
      source=source.replace(needle,`let code=patchGame(await r.text());
    const addRes=await fetch('/game-v010-addon.js?build=20',{cache:'no-store'});
    if(!addRes.ok)throw new Error('0.1 realism addon returned HTTP '+addRes.status);
    const addon=await addRes.text();
    if(!addon.includes('Update 0.1 Realism Expansion'))throw new Error('0.1 realism addon failed integrity check');
    const fixRes=await fetch('/game-v011-addon.js?build=21',{cache:'no-store'});
    if(!fixRes.ok)throw new Error('0.1.1 realism/bug-fix addon returned HTTP '+fixRes.status);
    const fixAddon=await fixRes.text();
    if(!fixAddon.includes('Update 0.1.1 Realism + Bug Fix Expansion'))throw new Error('0.1.1 realism/bug-fix addon failed integrity check');
    const polishRes=await fetch('/game-v020-addon.js?build=22',{cache:'no-store'});
    if(!polishRes.ok)throw new Error('0.2 alpha polish addon returned HTTP '+polishRes.status);
    const polishAddon=await polishRes.text();
    if(!polishAddon.includes('Update 0.2 Alpha Polish + Bug Fix'))throw new Error('0.2 alpha polish addon failed integrity check');
    code=code.replace('start.disabled=false;',addon+'\\n'+fixAddon+'\\n'+polishAddon+'\\nstart.disabled=false;');
    let fn;`);
      source=source.replaceAll('Realism R3','Terrariums 0.2 Alpha');
      source=source.replaceAll('0.0.7 R3','0.2 TEST');
      source=source.replaceAll('terrariumbuilds-update-007-r3.js','terrariums-update-020.js');
      source=source.replace('drivable car, larger map, taller buildings, better roof/camera behavior, persistent inventory, and a town map.','Terrariums 0.2 Alpha: polished movement, better collisions, stable driving, real frog-care actions, clearer objectives, reliable saves, town life and the complete opening storyline.');
      new Function(source+'\n//# sourceURL=terrariums-020-bootstrap.js')();
    }catch(err){fail(err);}
  }
  boot();
})();