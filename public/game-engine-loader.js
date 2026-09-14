(()=>{
  const start=document.getElementById('start-game');
  const welcome=document.getElementById('welcome');
  const paragraph=welcome?.querySelector('p');
  const status=text=>{if(start)start.textContent=text};
  const explain=(title,detail)=>{if(start){start.disabled=true;start.textContent=title;}if(paragraph)paragraph.textContent=detail;};
  const params=new URLSearchParams(location.search);
  let testing=params.get('testing')==='1';
  let sessionUser=null;

  function detectWebGL(){
    const test=document.createElement('canvas');let gl2=null,gl1=null;
    try{gl2=test.getContext('webgl2',{failIfMajorPerformanceCaveat:false});}catch{}
    if(!gl2){try{gl1=test.getContext('webgl',{failIfMajorPerformanceCaveat:false})||test.getContext('experimental-webgl');}catch{}}
    return {gl2:!!gl2,gl1:!!gl1};
  }
  async function importWithTimeout(url,ms=12000){let timer;try{return await Promise.race([import(url),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Timed out loading '+url)),ms);})]);}finally{clearTimeout(timer);}}
  async function getSession(){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),2200);const r=await fetch('/api/terrarium?action=session',{credentials:'same-origin',signal:c.signal});clearTimeout(t);const d=await r.json();return d?.user||null;}catch{return null;}}
  function isTester(u){if(!u)return false;const name=String(u.username||'').toLowerCase();return !!(u.owner===true||u.isOwner===true||u.is_owner===true||String(u.role||'').toLowerCase()==='owner'||name==='aiden'||name==='greyson');}
  function installTestingButton(){if(!isTester(sessionUser))return;const b=document.createElement('button');b.id='testing-mode-btn';b.textContent=testing?'🧪 Exit Testing Mode':'🧪 Start Fresh Test';b.style.cssText='position:fixed;left:16px;top:16px;z-index:99;border:0;border-radius:999px;padding:10px 14px;font-weight:900;cursor:pointer;background:#f3f6ef;color:#183a29;box-shadow:0 8px 24px rgba(0,0,0,.2)';b.onclick=()=>{const u=new URL(location.href);if(testing)u.searchParams.delete('testing');else u.searchParams.set('testing','1');location.href=u.toString();};document.body.appendChild(b);}

  async function loadThree(){
    const attempts=[['/api/three.js?build=15','TerrariumBuilds engine'],['https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js','jsDelivr backup'],['https://unpkg.com/three@0.160.1/build/three.module.js','unpkg backup']];
    const errors=[];
    for(let i=0;i<attempts.length;i++){
      const [url,label]=attempts[i];
      try{status(i===0?'Loading 3D engine…':`Trying backup ${i}…`);const mod=await importWithTimeout(url);if(!mod?.WebGLRenderer||!mod?.Scene)throw new Error('module loaded but required Three.js exports were missing');return mod;}
      catch(err){errors.push(label+': '+(err?.message||String(err)));console.warn('TerrariumBuilds engine attempt failed',label,url,err);}
    }
    throw new Error(errors.join(' | '));
  }

  function patchGame(code){
    code=code.replaceAll('sprint?.78:.45','sprint ? .78 : .45');
    code=code.replaceAll('state.built.water?.005:.013','state.built.water ? .005 : .013');
    code=code.replaceAll('state.habitatPlaced?-.004:.012','state.habitatPlaced ? -.004 : .012');

    code=code.replace('plane(0,0,0,430,430,mats.grass);plane(0,.01,0,285,15,mats.road);plane(0,.011,-88,285,13,mats.road);plane(88,.012,0,13,285,mats.road);plane(-88,.012,0,13,285,mats.road);plane(0,.012,88,285,13,mats.road);',
      "plane(0,0,0,650,650,mats.grass);plane(0,.01,0,520,15,mats.road);plane(0,.011,-88,520,13,mats.road);plane(88,.012,0,13,520,mats.road);plane(-88,.012,0,13,520,mats.road);plane(0,.012,88,520,13,mats.road);plane(0,.013,190,520,13,mats.road);plane(0,.013,-190,520,13,mats.road);plane(190,.013,0,13,520,mats.road);plane(-190,.013,0,13,520,mats.road);");
    code=code.replace("if(nx<-200||nx>200||nz<-200||nz>200)return false;","if(nx<-310||nx>310||nz<-310||nz>310)return false;");
    code=code.replace('c.g.rotation.y=p.ang;','c.g.rotation.y=p.ang+Math.PI/2;');

    code=code.replace('const HX=-56,HZ=-55,HW=29,HD=25;','const HX=-56,HZ=-55,HW=38,HD=32;');
    code=code.replaceAll('box(HX-HW/2,0,HZ,.28,5.2,HD','box(HX-HW/2,0,HZ,.28,6.6,HD');
    code=code.replaceAll('box(HX+HW/2,0,HZ,.28,5.2,HD','box(HX+HW/2,0,HZ,.28,6.6,HD');
    code=code.replaceAll('box(HX,0,HZ-HD/2,HW,5.2,.28','box(HX,0,HZ-HD/2,HW,6.6,.28');
    code=code.replace('box(HX-8.0,0,HZ+HD/2,HW/2-2.1,5.2,.28,mats.wall);box(HX+8.0,0,HZ+HD/2,HW/2-2.1,5.2,.28,mats.wall);',
      'box(HX-10.6,0,HZ+HD/2,HW/2-2.1,6.6,.28,mats.wall);box(HX+10.6,0,HZ+HD/2,HW/2-2.1,6.6,.28,mats.wall);');
    code=code.replace('box(HX,5.15,HZ,HW+.7,.55,HD+.7,0x524b43);','box(HX,6.55,HZ,HW+.9,.65,HD+.9,0x403b38);');
    code=code.replace("function simpleBuilding(k,c,r){const b=B[k];box(b.x,0,b.z,30,5.7,21,c);box(b.x,5.7,b.z,31,.6,22,r);","function simpleBuilding(k,c,r){const b=B[k];box(b.x,0,b.z,34,7.4,25,c);box(b.x,7.4,b.z,35,.7,26,r);");

    code=code.replace("const traffic=[{...makeCar(0x5e7385),route:0,u:.05,s:9.5},{...makeCar(0x9b594b),route:1,u:.42,s:8.2},{...makeCar(0x7a7d68),route:2,u:.69,s:10.2}];",
      "const traffic=[{...makeCar(0x5e7385),route:0,u:.05,s:9.5},{...makeCar(0x9b594b),route:1,u:.42,s:8.2},{...makeCar(0x7a7d68),route:2,u:.69,s:10.2}];const ownedCar=makeCar(0x365e78);ownedCar.g.position.set(-43,0,-30);ownedCar.g.rotation.y=0;ownedCar.speed=0;");
    code=code.replace("const BASE={version:72,username:'Guest'","const BASE={version:72,inCar:false,username:'Guest'");

    code=code.replace("else if(n.type==='habitat'){if(state.story===10){advance(11);dialog('Morning care check'",
      "else if(n.type==='habitat'){if(cur()[2]==='bugs'&&state.inv.bugs>0){state.inv.bugs--;state.petHunger=clamp(state.petHunger+20);advance(9);dialog('Fed from inventory','You use the feeder insects you collected earlier. Nothing is wasted just because you collected it before the objective asked for it.');}else if(state.story===10){advance(11);dialog('Morning care check'");

    code=code.replace("if(state.zone==='outside'){\n   for(const [k,b] of Object.entries(B))",
      "if(state.zone==='outside'){\n   if(!state.inCar&&dist(ownedCar.g.position.x,ownedCar.g.position.z)<4)near={type:'car',label:'E · get in your car'};\n   if(state.inCar)near={type:'carExit',label:'E · exit car'};\n   if(!state.inCar)for(const [k,b] of Object.entries(B))");
    code=code.replace("else if(n.type==='store'){state.prevStore=n.zone;enterStore(n.zone);}",
      "else if(n.type==='car'){state.inCar=true;player.visible=false;ownedCar.speed=0;$('#location').textContent='Driving';}\n else if(n.type==='carExit'){if(Math.abs(ownedCar.speed)>1.1)return dialog('Slow down first','Brake until the car is almost stopped.');state.inCar=false;player.visible=true;player.position.set(ownedCar.g.position.x+2.5,0,ownedCar.g.position.z);yaw=ownedCar.g.rotation.y;}\n else if(n.type==='store'){state.prevStore=n.zone;enterStore(n.zone);}");

    code=code.replace(/function move\(dt\)\{[\s\S]*?\}\nfunction updateDoors/,`function move(dt){
      if(paused)return;
      if(state.inCar){
        const gas=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
        const steer=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);
        ownedCar.speed+=gas*dt*13;ownedCar.speed*=Math.pow(.985,dt*60);if(keys.Space)ownedCar.speed*=Math.pow(.82,dt*60);ownedCar.speed=clamp(ownedCar.speed,-7,22);
        if(Math.abs(ownedCar.speed)>.25)ownedCar.g.rotation.y+=steer*dt*1.6*Math.sign(ownedCar.speed)*(0.35+Math.min(1,Math.abs(ownedCar.speed)/8));
        const f=new THREE.Vector3(Math.sin(ownedCar.g.rotation.y),0,Math.cos(ownedCar.g.rotation.y));ownedCar.g.position.addScaledVector(f,ownedCar.speed*dt);ownedCar.g.position.x=clamp(ownedCar.g.position.x,-305,305);ownedCar.g.position.z=clamp(ownedCar.g.position.z,-305,305);for(const w of ownedCar.wheels)w.rotation.x-=dt*ownedCar.speed*2.2;return;
      }
      let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z--;if(keys.KeyS||keys.ArrowDown)z++;if(keys.KeyA||keys.ArrowLeft)x--;if(keys.KeyD||keys.ArrowRight)x++;const moving=x||z,sprint=!!((keys.ShiftLeft||keys.ShiftRight)&&state.energy>2);
      if(moving){const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=sprint?11.8:5.5,nx=player.position.x+v.x*dt*speed,nz=player.position.z+v.z*dt*speed;if(canMove(nx,player.position.z))player.position.x=nx;if(canMove(player.position.x,nz))player.position.z=nz;player.rotation.y=Math.atan2(v.x,v.z);walk+=dt*(sprint?12:7);const sw=Math.sin(walk)*(sprint ? .78 : .45);limbs.la.rotation.x=sw;limbs.ra.rotation.x=-sw;limbs.ll.rotation.x=-sw*.75;limbs.rl.rotation.x=sw*.75;if(sprint)state.energy=clamp(state.energy-dt*1.35);}else{for(const g of Object.values(limbs))g.rotation.x*=.82;}vy-=13.5*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true;}}
function updateDoors`);

    code=code.replace(/function cam\(\)\{[\s\S]*?\}\nlet ht=/,`function cam(){const base=state.inCar?ownedCar.g.position:player.position;const target=base.clone().add(new THREE.Vector3(0,state.inCar?1.25:1.5,0));const d=state.inCar?12:(state.zone==='home'?Math.min(camDist,5.5):camDist);const off=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*d,2.1+Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d);const desired=target.clone().add(off);if(state.zone==='home'&&!state.inCar)desired.y=Math.min(desired.y,5.7);camera.position.lerp(desired,.16);camera.lookAt(target);}
let ht=`);

    const mapPatch=`\nconst mapStyle=document.createElement('style');mapStyle.textContent='#map-btn{position:absolute;right:14px;top:98px;z-index:9;border:1px solid rgba(24,58,41,.18);border-radius:999px;padding:8px 12px;background:rgba(248,250,246,.94);font-weight:900;color:#183a29;cursor:pointer}#town-map{position:absolute;inset:7%;z-index:45;background:rgba(245,247,242,.98);border-radius:24px;padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.35)}#town-map[hidden]{display:none}#town-map canvas{width:100%;height:calc(100% - 54px);border-radius:16px;background:#dfe9d7}';document.head.appendChild(mapStyle);const mapBtn=document.createElement('button');mapBtn.id='map-btn';mapBtn.textContent='🗺 Map (M)';document.querySelector('#game-shell').appendChild(mapBtn);const mapPanel=document.createElement('div');mapPanel.id='town-map';mapPanel.hidden=true;mapPanel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><b>TerrariumBuilds Town Map</b><button id="map-close">Close · M</button></div><canvas id="map-canvas" width="900" height="650"></canvas>';document.querySelector('#game-shell').appendChild(mapPanel);const mapCanvas=$('#map-canvas'),mapCtx=mapCanvas.getContext('2d');function mapXY(x,z){return{x:(x+325)/650*mapCanvas.width,y:(z+325)/650*mapCanvas.height};}function drawMap(){if(mapPanel.hidden)return;const c=mapCtx;c.clearRect(0,0,mapCanvas.width,mapCanvas.height);c.fillStyle='#8daf78';c.fillRect(0,0,mapCanvas.width,mapCanvas.height);c.strokeStyle='#555a5b';c.lineWidth=16;for(const v of [-190,-88,0,88,190]){let a=mapXY(v,-325),b=mapXY(v,325);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();a=mapXY(-325,v);b=mapXY(325,v);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}const pts=[['Home',HX,HZ],['Pet',B.petshop.x,B.petshop.z],['Hardware',B.hardware.x,B.hardware.z],['Diner',B.diner.x,B.diner.z],['Market',B.market.x,B.market.z],['Vet',B.vet.x,B.vet.z],['Pond',-128,98]];c.font='bold 14px system-ui';c.textAlign='center';for(const q of pts){const p=mapXY(q[1],q[2]);c.fillStyle='#f7f4ea';c.fillRect(p.x-25,p.y-16,50,32);c.fillStyle='#183a29';c.fillText(q[0],p.x,p.y+4);}const p=mapXY(state.inCar?ownedCar.g.position.x:player.position.x,state.inCar?ownedCar.g.position.z:player.position.z);c.fillStyle='#2f62c9';c.beginPath();c.arc(p.x,p.y,9,0,Math.PI*2);c.fill();}function toggleMap(){mapPanel.hidden=!mapPanel.hidden;if(!mapPanel.hidden){paused=true;document.exitPointerLock&&document.exitPointerLock();drawMap();}else if(welcome.hidden)paused=false;}mapBtn.onclick=toggleMap;$('#map-close').onclick=toggleMap;addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat)toggleMap();});\n`;
    code=code.replace('start.disabled=false;',mapPatch+'start.disabled=false;');

    if(testing){
      code=code.replace(/function load\(\)\{[\s\S]*?\}\nfunction save\(\)\{[\s\S]*?\}\nasync function user/,"function load(){state=JSON.parse(JSON.stringify(BASE));}\nfunction save(){if($('#save-state'))$('#save-state').textContent='TEST MODE · not saved';}\nasync function user");
      code=code.replace("start.disabled=false;start.textContent='Start Update 0.0.7';","start.disabled=false;start.textContent='Start Fresh Test · 0.0.7 R3';");
    }
    return code;
  }

  async function runGame(THREE){
    status('Checking Realism R3…');
    const r=await fetch('/game-v007-r2.js?build=15',{cache:'no-store'});if(!r.ok)throw new Error('game file returned HTTP '+r.status);
    const code=patchGame(await r.text());let fn;
    try{fn=new Function('THREE',code+'\n//# sourceURL=terrariumbuilds-update-007-r3.js');}catch(err){throw new Error('game syntax check failed: '+(err?.message||String(err)));}
    status('Building larger town, cars and house…');let ready=false;window.addEventListener('tb3d-ready',()=>{ready=true;},{once:true});
    try{fn(THREE);}catch(err){throw new Error('game runtime crashed: '+(err?.message||String(err)));}
    await new Promise((resolve,reject)=>{if(ready)return resolve();const began=performance.now();const timer=setInterval(()=>{if(ready){clearInterval(timer);resolve();}else if(performance.now()-began>10000){clearInterval(timer);reject(new Error('game code ran but never reached its ready signal'));}},50);});
  }

  async function boot(){
    sessionUser=await getSession();if(testing&&!isTester(sessionUser)){testing=false;const u=new URL(location.href);u.searchParams.delete('testing');history.replaceState({},'',u);}installTestingButton();
    const caps=detectWebGL();if(!caps.gl2&&!caps.gl1){explain('WebGL is disabled','Your browser did not provide WebGL at all, so the 3D game cannot render.');return;}
    if(paragraph)paragraph.textContent=testing?'Testing Mode: fresh unsaved game. Loading Realism R3…':(caps.gl2?'WebGL 2 detected. Loading Realism R3…':'WebGL 1 detected. Loading compatibility mode…');
    try{const THREE=await loadThree();status('Engine loaded · starting revamp…');await runGame(THREE);if(paragraph)paragraph.textContent=testing?'Testing Mode is active. This run starts fresh and does not touch your normal save.':'Realism R3 loaded: drivable car, larger map, taller buildings, better roof/camera behavior, persistent inventory, and a town map.';}
    catch(err){console.error('TerrariumBuilds startup failed',err);explain('Startup error',err?.message||'Unknown startup error');}
  }
  window.addEventListener('error',e=>console.error('TerrariumBuilds window error',e.error||e.message));window.addEventListener('unhandledrejection',e=>console.error('TerrariumBuilds rejection',e.reason));boot();
})();