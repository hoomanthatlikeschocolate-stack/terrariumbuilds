/* Terrariums — 0.2.1 Performance Hotfix */
(function(){
  const dpr=Math.min(window.devicePixelRatio||1,.85);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled=false;
  scene.fog.near=135;
  scene.fog.far=340;
  camera.far=520;
  camera.updateProjectionMatrix();

  // Shadows were by far the most expensive part of the current procedural town.
  scene.traverse(o=>{
    if(o&&o.isMesh){o.castShadow=false;o.receiveShadow=false;}
    if(o&&o.isPointLight){o.castShadow=false;}
  });

  // Keep only a small amount of interior fill lighting.
  if(typeof homeLights!=='undefined'&&homeLights){homeLights.forEach((l,i)=>{l.intensity=i===0?.32:.18;l.distance=11;});}

  // Lower-frequency HUD updates: gameplay still updates every frame, DOM does not.
  let lastPerfHud=0;
  const oldHudPerf=hud;
  hud=function(){
    const now=performance.now();
    if(now-lastPerfHud<320)return;
    lastPerfHud=now;
    oldHudPerf();
  };

  // Reduce optional moving town residents when the browser is struggling.
  if(typeof walkers!=='undefined'&&walkers&&walkers.length>3){for(let i=3;i<walkers.length;i++)walkers[i].obj.visible=false;}

  // Simple graphics control. Performance mode is the default.
  const grid=document.querySelector('#settings-dialog .settings-grid');
  if(grid){
    const row=document.createElement('div');row.className='settings-row';
    row.innerHTML='<div><b>Graphics</b><small>Performance mode lowers internal render resolution and disables expensive dynamic shadows.</small></div><button id="graphics-toggle" class="primary" style="width:auto">Performance</button>';
    grid.appendChild(row);
    let quality=false;const btn=row.querySelector('#graphics-toggle');
    btn.onclick=()=>{quality=!quality;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality?1.15:.85));renderer.shadowMap.enabled=quality;scene.traverse(o=>{if(o&&o.isMesh){o.castShadow=quality;o.receiveShadow=quality;}});btn.textContent=quality?'Quality':'Performance';};
  }

  const badge=document.querySelector('.revamp-badge');if(badge)badge.textContent='0.2.1 PERFORMANCE HOTFIX';
  const welcomeText=document.querySelector('#welcome p');if(welcomeText)welcomeText.textContent='Performance hotfix: heavy realism layers were removed from startup, shadows are off by default, render resolution is reduced, and HUD updates are throttled for much smoother gameplay.';
  if(start)start.textContent='Start Terrariums 0.2.1';
  console.log('Terrariums 0.2.1 performance hotfix active');
})();