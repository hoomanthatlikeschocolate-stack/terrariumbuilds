(()=>{
  const start=document.getElementById('start-game'),welcome=document.getElementById('welcome'),p=welcome?.querySelector('p');
  const fail=msg=>{console.error('Terrariums 0.3 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error'}if(p)p.textContent=String(msg?.message||msg||'Terrariums 0.3 could not start.')};
  async function boot(){try{
    if(start){start.disabled=true;start.textContent='Loading Terrariums 0.3…'}if(p)p.textContent='Loading the high-realism performance build…';
    const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});if(!oldRes.ok)throw new Error('Could not load stable game bootstrap: HTTP '+oldRes.status);let source=await oldRes.text();
    const needle="const code=patchGame(await r.text());let fn;";if(!source.includes(needle))throw new Error('Stable bootstrap changed and update hook could not be installed.');
    source=source.replace(needle,`let code=patchGame(await r.text());
    const polishRes=await fetch('/game-v020-addon.js?build=30',{cache:'no-store'});if(!polishRes.ok)throw new Error('0.2 systems addon HTTP '+polishRes.status);const polishAddon=await polishRes.text();
    const perfRes=await fetch('/game-v021-performance.js?build=30',{cache:'no-store'});if(!perfRes.ok)throw new Error('performance addon HTTP '+perfRes.status);const perfAddon=await perfRes.text();
    const realRes=await fetch('/game-v030-realism.js?build=30',{cache:'no-store'});if(!realRes.ok)throw new Error('0.3 realism addon HTTP '+realRes.status);const realAddon=await realRes.text();if(!realAddon.includes('0.3 High Realism + Performance'))throw new Error('0.3 realism integrity check failed');
    code=code.replace('start.disabled=false;',polishAddon+'\\n'+perfAddon+'\\n'+realAddon+'\\nstart.disabled=false;');let fn;`);
    source=source.replaceAll('Realism R3','Terrariums 0.3').replaceAll('0.0.7 R3','0.3 TEST').replaceAll('terrariumbuilds-update-007-r3.js','terrariums-update-030.js');
    new Function(source+'\n//# sourceURL=terrariums-030-bootstrap.js')();
  }catch(err){fail(err)}}boot();
})();