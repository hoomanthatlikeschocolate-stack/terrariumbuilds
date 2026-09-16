(()=>{
 const start=document.getElementById('start-game'),welcome=document.getElementById('welcome'),p=welcome?.querySelector('p');
 const fail=msg=>{console.error('Terrariums 0.4 bootstrap',msg);if(start){start.disabled=true;start.textContent='Startup error'}if(p)p.textContent=String(msg?.message||msg||'Terrariums could not start.')};
 async function boot(){try{
  if(start){start.disabled=true;start.textContent='Loading Terrariums 0.4…'}if(p)p.textContent='Loading Adventure World…';
  const oldRes=await fetch('/game-engine-loader.js?build=15',{cache:'no-store'});if(!oldRes.ok)throw new Error('Could not load stable game bootstrap: HTTP '+oldRes.status);let source=await oldRes.text();
  const needle="const code=patchGame(await r.text());let fn;";if(!source.includes(needle))throw new Error('Stable bootstrap changed and update hook could not be installed.');
  source=source.replace(needle,`let code=patchGame(await r.text());
    const polishRes=await fetch('/game-v020-addon.js?build=40',{cache:'no-store'});if(!polishRes.ok)throw new Error('systems addon HTTP '+polishRes.status);const polishAddon=await polishRes.text();
    const perfRes=await fetch('/game-v021-performance.js?build=40',{cache:'no-store'});if(!perfRes.ok)throw new Error('performance addon HTTP '+perfRes.status);const perfAddon=await perfRes.text();
    const advRes=await fetch('/game-v040-adventure.js?build=40',{cache:'no-store'});if(!advRes.ok)throw new Error('adventure addon HTTP '+advRes.status);const advAddon=await advRes.text();if(!advAddon.includes('0.4 Adventure World'))throw new Error('0.4 integrity check failed');
    code=code.replace('start.disabled=false;',polishAddon+'\\n'+perfAddon+'\\n'+advAddon+'\\nstart.disabled=false;');let fn;`);
  source=source.replaceAll('Realism R3','Terrariums 0.4').replaceAll('0.0.7 R3','0.4 TEST').replaceAll('terrariumbuilds-update-007-r3.js','terrariums-update-040.js');
  new Function(source+'\n//# sourceURL=terrariums-040-bootstrap.js')();
 }catch(err){fail(err)}}boot();
})();