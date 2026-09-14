(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const p=welcome?.querySelector('p');
  const fail=(msg)=>{console.error('TerrariumBuilds 0.1 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error';}if(p)p.textContent=String(msg?.message||msg||'Update 0.1 could not start.');};
  async function boot(){
    try{
      if(start){start.disabled=true;start.textContent='Loading Update 0.1…';}
      if(p)p.textContent='Loading the gigantic realism update and Roblox-style control system…';
      const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});
      if(!oldRes.ok)throw new Error('Could not load the stable R3 bootstrap: HTTP '+oldRes.status);
      let source=await oldRes.text();
      const needle="const code=patchGame(await r.text());let fn;";
      if(!source.includes(needle))throw new Error('Stable bootstrap changed and the 0.1 upgrade hook could not be installed.');
      source=source.replace(needle,`let code=patchGame(await r.text());
    const addRes=await fetch('/game-v010-addon.js?build=20',{cache:'no-store'});
    if(!addRes.ok)throw new Error('0.1 realism addon returned HTTP '+addRes.status);
    const addon=await addRes.text();
    if(!addon.includes('Update 0.1 Realism Expansion'))throw new Error('0.1 realism addon failed integrity check');
    code=code.replace('start.disabled=false;',addon+'\\nstart.disabled=false;');
    let fn;`);
      source=source.replaceAll('Realism R3','Update 0.1 Realism');
      source=source.replaceAll('0.0.7 R3','0.1 TEST');
      source=source.replaceAll('terrariumbuilds-update-007-r3.js','terrariumbuilds-update-010.js');
      source=source.replace("drivable car, larger map, taller buildings, better roof/camera behavior, persistent inventory, and a town map.","gigantic realistic town, Roblox-style controls, Shift Lock, denser neighborhoods, improved streets, a drivable car, enclosed interiors, persistent inventory, and the town map.");
      new Function(source+'\n//# sourceURL=terrariumbuilds-010-bootstrap.js')();
    }catch(err){fail(err);}
  }
  boot();
})();