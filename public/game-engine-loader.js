(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const status=(text)=>{if(start)start.textContent=text};
  const fail=(detail)=>{
    if(start){start.disabled=true;start.textContent='3D engine failed to load';}
    const p=welcome?.querySelector('p');
    if(p)p.textContent='The 3D engine still could not start. '+detail+' This is now a real engine/WebGL failure, not a CDN-loading hang.';
  };
  const sources=[
    '/api/three.js?v=0.0.8',
    'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js',
    'https://unpkg.com/three@0.181.1/build/three.module.js?module'
  ];
  async function importWithTimeout(url,ms=8000){
    return Promise.race([
      import(url),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('engine source timed out: '+url)),ms))
    ]);
  }
  async function loadThree(){
    let last;
    for(let i=0;i<sources.length;i++){
      try{
        status(i===0?'Loading local 3D engine…':`Trying 3D backup ${i}…`);
        const mod=await importWithTimeout(sources[i]);
        if(mod?.WebGLRenderer&&mod?.Scene)return mod;
        throw new Error('engine module missing required exports');
      }catch(err){last=err;console.warn('TerrariumBuilds engine source failed',sources[i],err)}
    }
    throw last||new Error('No engine source worked');
  }
  async function boot(){
    try{
      const THREE=await loadThree();
      globalThis.THREE=THREE;
      status('Preparing neighborhood…');
      const r=await fetch('/game-v006.js?v=0.0.8',{cache:'no-store'});
      if(!r.ok)throw new Error('game code HTTP '+r.status);
      let code=await r.text();
      code=code.replace(/^\s*import\s+\*\s+as\s+THREE\s+from\s+['"][^'"]+['"];?\s*/,'');
      code='const THREE=globalThis.THREE;\n'+code+'\n//# sourceURL=terrariumbuilds-game-v008.js';
      const blob=new Blob([code],{type:'text/javascript'});
      const url=URL.createObjectURL(blob);
      try{await import(url)}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}
    }catch(err){console.error('TerrariumBuilds boot failed',err);fail(err?.message||'Unknown startup error.')}
  }
  boot();
})();
