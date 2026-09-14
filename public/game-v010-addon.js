/* TerrariumBuilds 3D — Update 0.1 Realism Expansion */
(function(){
  // ----- World scale + atmosphere -----
  scene.fog.near=150;scene.fog.far=520;camera.far=900;camera.updateProjectionMatrix();

  // Extra road markings and crosswalks for the expanded town.
  const roadLines=[-300,-190,-88,0,88,190,300];
  for(const z of roadLines){
    for(let x=-390;x<=390;x+=22)box(x,.034,z,8,.025,.16,0xe8e1bc);
  }
  for(const x of roadLines){
    for(let z=-390;z<=390;z+=22)box(x,.035,z,.16,.025,8,0xe8e1bc);
  }
  function crosswalk(cx,cz,vertical){for(let i=-3;i<=3;i++){if(vertical)box(cx+i*1.25,.045,cz,0.72,.025,5.2,0xf2f0e8);else box(cx,.045,cz+i*1.25,5.2,.025,.72,0xf2f0e8);}}
  for(const p of [[0,0],[88,0],[-88,0],[0,88],[0,-88],[190,0],[-190,0]]){crosswalk(p[0],p[1]+7,false);crosswalk(p[0]+7,p[1],true);}

  // Residential neighborhoods: larger, taller homes with yards, driveways, porches and mailboxes.
  function suburbHouse(x,z,rot,bodyCol,roofCol){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot||0;scene.add(g);
    plane(0,.025,0,34,30,0x789266,g);
    plane(7,.035,15,7,15,mats.walk,g);
    box(0,0,0,24,7.2,18,bodyCol,g);box(0,7.2,0,26,1.25,20,roofCol,g);
    box(0,0,9.08,2.7,3.35,.2,0x4b5b50,g);
    box(-6.2,1.5,9.12,4.2,2.45,.08,mats.glass,g);box(6.2,1.5,9.12,4.2,2.45,.08,mats.glass,g);
    box(0,.08,11.2,8,.5,4,mats.walk,g);
    box(10.5,.1,13.6,1.1,1.3,.7,0x4f5355,g);cyl(10.5,1.55,13.6,.09,1.2,mats.metal,g);
    // garage
    box(-7.5,.05,-9.4,8,3.5,.18,0xc8c9c3,g);
    // shrubs
    for(const sx of [-9,-6,6,9])sphere(sx,.65,8.1,.72,0x537447,g);
  }
  const houseSpots=[[-260,-245,0],[-215,-245,0],[-145,-245,0],[-45,-245,0],[45,-245,0],[145,-245,0],[225,-245,0],[275,-245,0],[-260,245,Math.PI],[-205,245,Math.PI],[-135,245,Math.PI],[-45,245,Math.PI],[45,245,Math.PI],[135,245,Math.PI],[210,245,Math.PI],[270,245,Math.PI],[-245,-145,Math.PI/2],[-245,-45,Math.PI/2],[-245,55,Math.PI/2],[-245,145,Math.PI/2],[245,-145,-Math.PI/2],[245,-45,-Math.PI/2],[245,55,-Math.PI/2],[245,145,-Math.PI/2]];
  const houseColors=[0xd9c9b4,0xc6d2c0,0xd4c2bc,0xc5cad5,0xd8d1bd];
  houseSpots.forEach((p,i)=>suburbHouse(p[0],p[1],p[2],houseColors[i%houseColors.length],i%2?0x524b43:0x454f55));

  // More environmental detail.
  function hydrant(x,z){cyl(x,.45,z,.24,.9,0x9d3d31);cyl(x,.93,z,.32,.12,0x9d3d31);cyl(x,.48,z,.36,.1,0x9d3d31);}
  for(const p of [[25,15],[-30,-15],[103,15],[-103,15],[205,-15],[-205,-15]])hydrant(p[0],p[1]);
  function trashBin(x,z){box(x,.05,z,.8,1.25,.75,0x3e5144);box(x,1.28,z,.88,.12,.82,0x26372e);}
  for(const p of [[-78,-120],[72,120],[-205,92],[205,-92]])trashBin(p[0],p[1]);
  for(let i=0;i<40;i++){const x=-390+Math.random()*780,z=-390+Math.random()*780;if(Math.abs(x)<22||Math.abs(z)<22)continue;tree(x,z,.55+Math.random()*.35);}

  // Soft procedural clouds.
  const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.72,roughness:1});
  const clouds=[];
  for(let c=0;c<9;c++){const g=new THREE.Group();g.position.set(-320+Math.random()*640,45+Math.random()*28,-320+Math.random()*640);scene.add(g);for(let i=0;i<5;i++)sphere((i-2)*2.1+Math.random(),Math.random(),Math.random()*2,2.6+Math.random()*1.7,cloudMat,g);clouds.push(g);}

  // Make the player's house feel enclosed: opaque ceiling and thicker upper shell.
  const houseCeiling=box(HX,6.15,HZ,HW-.7,.38,HD-.7,0xd8d1c5);houseCeiling.castShadow=false;houseCeiling.receiveShadow=true;
  box(HX-HW/2+.35,5.15,HZ,.65,1.4,HD-.8,0xe2d9cc);box(HX+HW/2-.35,5.15,HZ,.65,1.4,HD-.8,0xe2d9cc);

  // ----- Roblox-style controls -----
  let shiftLock=false;
  let rightMouse=false;
  let shiftLockIndicator=document.createElement('div');
  shiftLockIndicator.id='shift-lock-indicator';
  shiftLockIndicator.textContent='SHIFT LOCK';
  shiftLockIndicator.style.cssText='position:absolute;left:50%;top:calc(50% + 24px);transform:translateX(-50%);z-index:12;padding:5px 9px;border-radius:999px;background:rgba(20,30,24,.68);color:#fff;font:800 10px system-ui;letter-spacing:.08em;display:none;pointer-events:none';
  document.querySelector('#game-shell').appendChild(shiftLockIndicator);

  const controlHelp=document.createElement('div');
  controlHelp.style.cssText='position:absolute;left:50%;top:15px;transform:translateX(-50%);z-index:11;padding:7px 11px;border-radius:999px;background:rgba(245,248,243,.9);color:#183a29;font:800 10px system-ui;box-shadow:0 5px 18px rgba(0,0,0,.12);pointer-events:none';
  controlHelp.textContent='Roblox controls · WASD move · Space jump · Shift shift-lock · Ctrl sprint · hold RMB camera · scroll zoom';
  document.querySelector('#game-shell').appendChild(controlHelp);
  setTimeout(()=>controlHelp.style.opacity='.35',7000);

  function setShiftLock(on){
    shiftLock=!!on;shiftLockIndicator.style.display=shiftLock?'block':'none';
    if(shiftLock){canvas.requestPointerLock&&canvas.requestPointerLock();}
    else if(document.pointerLockElement===canvas){document.exitPointerLock&&document.exitPointerLock();}
  }
  addEventListener('keydown',e=>{
    if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat&&!state.inCar){e.preventDefault();setShiftLock(!shiftLock);}
  },true);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('mousedown',e=>{if(e.button===2&&!state.inCar){rightMouse=true;if(!shiftLock)canvas.requestPointerLock&&canvas.requestPointerLock();}},true);
  addEventListener('mouseup',e=>{if(e.button===2){rightMouse=false;if(!shiftLock&&document.pointerLockElement===canvas)document.exitPointerLock&&document.exitPointerLock();}},true);
  canvas.addEventListener('click',e=>{if(!shiftLock&&!rightMouse){e.stopImmediatePropagation();if(document.pointerLockElement===canvas)document.exitPointerLock&&document.exitPointerLock();}},true);

  // Replace movement: Roblox camera-relative movement, Ctrl sprint, Shift Lock faces camera direction.
  move=function(dt){
    if(paused)return;
    if(state.inCar){
      const gas=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
      const steer=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);
      ownedCar.speed+=gas*dt*14;ownedCar.speed*=Math.pow(.986,dt*60);if(keys.Space)ownedCar.speed*=Math.pow(.78,dt*60);ownedCar.speed=clamp(ownedCar.speed,-8,24);
      if(Math.abs(ownedCar.speed)>.2)ownedCar.g.rotation.y+=steer*dt*1.55*Math.sign(ownedCar.speed)*(0.34+Math.min(1,Math.abs(ownedCar.speed)/9));
      const f=new THREE.Vector3(Math.sin(ownedCar.g.rotation.y),0,Math.cos(ownedCar.g.rotation.y));ownedCar.g.position.addScaledVector(f,ownedCar.speed*dt);
      ownedCar.g.position.x=clamp(ownedCar.g.position.x,-430,430);ownedCar.g.position.z=clamp(ownedCar.g.position.z,-430,430);
      for(const w of ownedCar.wheels)w.rotation.x-=dt*ownedCar.speed*2.2;
      return;
    }
    let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z--;if(keys.KeyS||keys.ArrowDown)z++;if(keys.KeyA||keys.ArrowLeft)x--;if(keys.KeyD||keys.ArrowRight)x++;
    const moving=x!==0||z!==0;
    const sprint=!!((keys.ControlLeft||keys.ControlRight)&&state.energy>2);
    if(moving){
      const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
      const speed=sprint?12.8:5.9;
      const nx=player.position.x+v.x*dt*speed,nz=player.position.z+v.z*dt*speed;
      if(canMove(nx,player.position.z))player.position.x=nx;if(canMove(player.position.x,nz))player.position.z=nz;
      player.rotation.y=shiftLock?yaw+Math.PI:Math.atan2(v.x,v.z);
      walk+=dt*(sprint?13:7.5);const sw=Math.sin(walk)*(sprint?.78:.46);limbs.la.rotation.x=sw;limbs.ra.rotation.x=-sw;limbs.ll.rotation.x=-sw*.75;limbs.rl.rotation.x=sw*.75;
      if(sprint)state.energy=clamp(state.energy-dt*1.45);
    }else{for(const g of Object.values(limbs))g.rotation.x*=.82;if(shiftLock)player.rotation.y=yaw+Math.PI;}
    vy-=13.5*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true;}
  };

  // Expanded world bounds and basic residential collision guard.
  const oldCanMove=canMove;
  canMove=function(nx,nz){
    if(state.zone!=='outside'&&state.zone!=='home')return oldCanMove(nx,nz);
    if(nx<-440||nx>440||nz<-440||nz>440)return false;
    for(const p of houseSpots){const dx=nx-p[0],dz=nz-p[1];if(Math.abs(dx)<13&&Math.abs(dz)<10)return false;}
    return true;
  };

  // Shoulder camera in shift-lock, free orbit otherwise, roof-safe indoors.
  cam=function(){
    const base=state.inCar?ownedCar.g.position:player.position;
    const target=base.clone().add(new THREE.Vector3(0,state.inCar?1.3:1.55,0));
    let d=state.inCar?13:(state.zone==='home'?Math.min(camDist,5.1):camDist);
    const side=shiftLock&&!state.inCar?1.65:0;
    const forward=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),0,Math.cos(yaw)*Math.cos(pitch));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const desired=target.clone().addScaledVector(forward,d).addScaledVector(right,side);desired.y+=2.1+Math.sin(pitch)*d;
    if(state.zone==='home'&&!state.inCar)desired.y=Math.min(desired.y,5.65);
    camera.position.lerp(desired,.2);camera.lookAt(target.clone().addScaledVector(right,shiftLock?.45:0));
  };

  // Better NPC traffic orientation and smoother wheels.
  updateCars=function(dt){for(const c of traffic){c.u=(c.u+dt*c.s/900)%1;const p=routePoint(c.route,c.u);c.g.position.set(p.x,0,p.z);c.g.rotation.y=p.ang+Math.PI/2;for(const w of c.wheels)w.rotation.x-=dt*c.s*2.2;}};

  // Animate clouds and subtle house visibility behavior.
  const oldLighting=lighting;
  lighting=function(){oldLighting();const night=((state.time%1440)<360||(state.time%1440)>1200);for(const g of clouds)g.position.x+=.002;controlHelp.style.opacity=controlHelp.style.opacity||'1';};

  // Improve instructions after control change.
  const oldHud=hud;
  hud=function(){oldHud();const o=$('#objective-text');if(o&&!o.dataset.robloxHint){o.dataset.robloxHint='1';} };

  // Shift-lock setting button.
  const settingsGrid=$('#settings-dialog .settings-grid');
  if(settingsGrid){const row=document.createElement('div');row.className='settings-row';row.innerHTML='<div><b>Roblox-style camera</b><small>Shift toggles Shift Lock. Hold right mouse to rotate the camera. Ctrl sprints.</small></div><button id="shift-lock-setting" class="primary" style="width:auto">Shift Lock: OFF</button>';settingsGrid.appendChild(row);const sb=$('#shift-lock-setting');sb.onclick=()=>{setShiftLock(!shiftLock);sb.textContent='Shift Lock: '+(shiftLock?'ON':'OFF');};}

  // Update driving/map bounds used by map marker if present.
  if(typeof mapXY==='function'){mapXY=(x,z)=>({x:(x+450)/900*mapCanvas.width,y:(z+450)/900*mapCanvas.height});}

  console.log('TerrariumBuilds Update 0.1 Realism Expansion active');
})();