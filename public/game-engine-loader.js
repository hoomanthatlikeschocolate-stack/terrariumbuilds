(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const paragraph=welcome?.querySelector('p');
  const status=text=>{if(start)start.textContent=text};
  const explain=(title,detail)=>{if(start){start.disabled=true;start.textContent=title;}if(paragraph)paragraph.textContent=detail;};

  function detectWebGL(){
    const test=document.createElement('canvas');let gl2=null,gl1=null;
    try{gl2=test.getContext('webgl2',{failIfMajorPerformanceCaveat:false});}catch{}
    if(!gl2){try{gl1=test.getContext('webgl',{failIfMajorPerformanceCaveat:false})||test.getContext('experimental-webgl');}catch{}}
    return {gl2:!!gl2,gl1:!!gl1};
  }

  async function importWithTimeout(url,ms=12000){let timer;try{return await Promise.race([import(url),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Timed out loading '+url)),ms);})]);}finally{clearTimeout(timer);}}

  async function loadThree(){
    const attempts=[['/api/three.js?v=0.0.10','TerrariumBuilds engine'],['https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js','jsDelivr backup'],['https://unpkg.com/three@0.160.1/build/three.module.js','unpkg backup']];
    const errors=[];
    for(let i=0;i<attempts.length;i++){
      const [url,label]=attempts[i];
      try{status(i===0?'Loading 3D engine…':`Trying backup ${i}…`);const mod=await importWithTimeout(url);if(!mod?.WebGLRenderer||!mod?.Scene)throw new Error('module loaded but required Three.js exports were missing');return mod;}
      catch(err){const msg=err?.message||String(err);errors.push(label+': '+msg);console.warn('TerrariumBuilds engine attempt failed',label,url,err);}
    }
    throw new Error(errors.join(' | '));
  }

  async function runGame(THREE){
    status('Checking game code…');
    const r=await fetch('/game-v006.js?v=0.0.10',{cache:'no-store'});
    if(!r.ok)throw new Error('game file returned HTTP '+r.status);
    let code=await r.text();
    const before=code;
    code=code.replace(/^\s*import\s+\*\s+as\s+THREE\s+from\s+['"][^'"]+['"];?\s*/,'');
    if(code===before)throw new Error('game loader could not remove the old Three.js import line');

    // v0.0.10 syntax repair: minification accidentally collapsed ternaries whose
    // true branch began with a decimal into optional-chaining-looking tokens.
    // `sprint ? .65 : .45` became `sprint?.65:.45`, and the same happened to
    // the frog-water decay expression. Chrome correctly rejected both at parse time.
    code=code.replaceAll('sprint?.65:.45','sprint ? .65 : .45');
    code=code.replaceAll('state.built.water?.006:.015','state.built.water ? .006 : .015');

    // Parse-check before execution so syntax failures are reported separately.
    let fn;
    try{fn=new Function('THREE',code+'\n//# sourceURL=terrariumbuilds-game-v010.js');}
    catch(err){throw new Error('game syntax check failed: '+(err?.message||String(err)));}

    status('Building neighborhood…');
    let ready=false;const onReady=()=>{ready=true;};window.addEventListener('tb3d-ready',onReady,{once:true});
    try{fn(THREE);}catch(err){throw new Error('game runtime crashed: '+(err?.message||String(err)));}
    await new Promise((resolve,reject)=>{if(ready)return resolve();const began=performance.now();const timer=setInterval(()=>{if(ready){clearInterval(timer);resolve();}else if(performance.now()-began>5000){clearInterval(timer);reject(new Error('game code ran but never reached its ready signal'));}},50);});
  }

  async function boot(){
    const caps=detectWebGL();
    if(!caps.gl2&&!caps.gl1){explain('WebGL is disabled','Your browser did not provide WebGL at all, so the 3D game cannot render.');return;}
    if(paragraph)paragraph.textContent=caps.gl2?'WebGL 2 detected. Loading the game engine…':'WebGL 1 detected. Loading the compatibility engine…';
    try{const THREE=await loadThree();status('Engine loaded · starting game…');await runGame(THREE);if(start){start.disabled=false;start.textContent='Start Chapter 1';}if(paragraph)paragraph.textContent='3D engine and game code loaded successfully. Start Chapter 1 when you are ready.';}
    catch(err){console.error('TerrariumBuilds startup failed',err);explain('Startup error',err?.message||'Unknown startup error');}
  }

  window.addEventListener('error',e=>console.error('TerrariumBuilds window error',e.error||e.message));
  window.addEventListener('unhandledrejection',e=>console.error('TerrariumBuilds rejection',e.reason));
  boot();
})();
