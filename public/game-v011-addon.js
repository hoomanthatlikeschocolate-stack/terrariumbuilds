/* Terrariums & Aquariums — Update 0.1.1 Realism + Bug Fix Expansion */
(function(){
  const BRAND='Terrariums & Aquariums';
  document.title=BRAND+' — Update 0.1.1';
  const mapTitle=document.querySelector('#town-map b');if(mapTitle)mapTitle.textContent=BRAND+' Town Map';

  // Better render quality without blowing up slower Chromebooks.
  renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;scene.fog.near=175;scene.fog.far=575;

  // Add an aquatics district so the new name is part of the actual world, not just branding.
  const AQX=332,AQZ=92;
  const aq=new THREE.Group();aq.position.set(AQX,0,AQZ);scene.add(aq);
  box(0,0,0,38,8.2,27,0xb9ccd0,aq);box(0,8.2,0,39,.75,28,0x40515a,aq);
  box(0,0,13.6,4.2,3.7,.2,0x3f554f,aq);box(-10,1.4,13.7,7.2,3.3,.08,mats.glass,aq);box(10,1.4,13.7,7.2,3.3,.08,mats.glass,aq);
  textSign('AQUATICS + TANKS',AQX,6.0,AQZ+13.85,13);
  for(let i=-2;i<=2;i++){
    const tx=i*6.2;box(tx,.35,8.8,5.2,2.7,2.0,mats.glass,aq);box(tx,.42,8.8,4.8,1.8,1.7,mats.water,aq);
    for(let f=0;f<3;f++){const fish=new THREE.Group();fish.position.set(tx-1.2+f*1.1,1.35,8.8);aq.add(fish);sphere(0,0,0,.18,f%2?0xd29b46:0x617fa6,fish);box(.21,-.08,0,.25,.16,.05,f%2?0xd29b46:0x617fa6,fish);}
  }
  plane(AQX,.025,AQZ+19,28,10,mats.walk);

  // Real street furniture and signals.
  function trafficLight(x,z,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot||0;scene.add(g);cyl(0,2.7,0,.09,5.4,mats.black,g);box(.65,4.85,0,1.05,2.5,.75,0x25292b,g);const r=sphere(.66,6.65,-.39,.18,0x6f1111,g);const y=sphere(.66,5.9,-.39,.18,0x806918,g);const gr=sphere(.66,5.15,-.39,.18,0x145b24,g);r.material.emissive=new THREE.Color(0x5e0000);y.material.emissive=new THREE.Color(0x4b3e00);gr.material.emissive=new THREE.Color(0x004e12);return{r,y,gr};}
  const signals=[trafficLight(15,15,0),trafficLight(-15,-15,Math.PI),trafficLight(103,15,0),trafficLight(-103,-15,Math.PI),trafficLight(205,15,0),trafficLight(-205,-15,Math.PI)];
  function streetSign(text,x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cyl(0,1.65,0,.07,3.3,mats.metal,g);const c=document.createElement('canvas');c.width=300;c.height=80;const q=c.getContext('2d');q.fillStyle='#315b42';q.fillRect(0,0,300,80);q.fillStyle='white';q.font='700 30px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,150,40);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1),new THREE.MeshBasicMaterial({map:t}));s.position.set(0,3.15,0);g.add(s);}
  streetSign('Oak Ave',18,18);streetSign('Pond Rd',-108,18);streetSign('Aquatics Way',305,88);

  // More parking, curbs and fences around destinations.
  for(const z of [-74,70])for(let x=-145;x<=145;x+=9){box(x,.028,z,5.5,.02,.12,0xf1eee2);}
  function fence(x,z,w,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot||0;scene.add(g);for(let px=-w/2;px<=w/2;px+=2.5)box(px,.05,0,.11,1.15,.11,0xc9c2b3,g);box(0,.85,0,w,.11,.11,0xc9c2b3,g);box(0,.18,0,w,.11,.11,0xc9c2b3,g);}fence(-56,-75,36,0);fence(AQX,AQZ-15,38,0);

  // Headlights, speedometer and less slippery driving.
  const speedHud=document.createElement('div');speedHud.id='speed-hud';speedHud.style.cssText='position:absolute;right:16px;bottom:72px;z-index:12;padding:9px 12px;border-radius:14px;background:rgba(20,28,24,.78);color:#fff;font:800 12px system-ui;display:none;pointer-events:none';speedHud.textContent='0 mph';document.querySelector('#game-shell').appendChild(speedHud);
  const carLightL=new THREE.PointLight(0xffe8b0,0,18,2),carLightR=new THREE.PointLight(0xffe8b0,0,18,2);carLightL.position.set(-1.5,.9,1.05);carLightR.position.set(1.5,.9,1.05);ownedCar.g.add(carLightL,carLightR);
  const previousMove=move;
  function carHitsStructure(x,z){if(Math.abs(x-HX)<HW/2+1.2&&Math.abs(z-HZ)<HD/2+1.2)return true;if(Math.abs(x-AQX)<20&&Math.abs(z-AQZ)<15)return true;for(const p of houseSpots){if(Math.abs(x-p[0])<14&&Math.abs(z-p[1])<11)return true;}return false;}
  move=function(dt){const before=state.inCar?ownedCar.g.position.clone():null;previousMove(dt);if(state.inCar&&before&&carHitsStructure(ownedCar.g.position.x,ownedCar.g.position.z)){ownedCar.g.position.copy(before);ownedCar.speed*=-.16;}if(state.inCar){speedHud.style.display='block';speedHud.textContent=Math.round(Math.abs(ownedCar.speed)*2.4)+' mph';}else speedHud.style.display='none';};

  // Stop a common bug where Shift Lock remained visually active while driving or in menus.
  const oldOpenDialog=openDialog;openDialog=function(id){if(typeof setShiftLock==='function'&&shiftLock)setShiftLock(false);return oldOpenDialog(id);};
  const oldEnterStore=enterStore;enterStore=function(zone){if(state.inCar)return;return oldEnterStore(zone);};

  // More believable weather and lighting, including rain particles and night street lights.
  const rainGeom=new THREE.BufferGeometry();const rainCount=420;const rainPos=new Float32Array(rainCount*3);for(let i=0;i<rainCount;i++){rainPos[i*3]=(Math.random()-.5)*90;rainPos[i*3+1]=4+Math.random()*35;rainPos[i*3+2]=(Math.random()-.5)*90;}rainGeom.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rain=new THREE.Points(rainGeom,new THREE.PointsMaterial({color:0xc8dce8,size:.08,transparent:true,opacity:.7}));rain.visible=false;scene.add(rain);
  const streetLights=[];for(const p of [[0,-18],[0,18],[88,-18],[88,18],[-88,-18],[-88,18],[190,-18],[-190,18],[300,18],[-300,-18]]){const l=new THREE.PointLight(0xffd890,0,26,2);l.position.set(p[0],5.2,p[1]);scene.add(l);streetLights.push(l);}
  const previousLighting=lighting;
  lighting=function(){previousLighting();const mins=state.time%1440;const night=mins<360||mins>1170;const wet=state.day%5===3;const overcast=state.day%5===2;const weather=wet?'Light rain':overcast?'Overcast':'Clear';const w=document.querySelector('#weather-chip');if(w)w.textContent=weather;rain.visible=wet;if(wet){const a=rain.geometry.attributes.position.array;rain.position.set(player.position.x,0,player.position.z);for(let i=0;i<rainCount;i++){a[i*3+1]-=.38;if(a[i*3+1]<1)a[i*3+1]=34+Math.random()*8;}rain.geometry.attributes.position.needsUpdate=true;scene.fog.far=430;hemi.intensity*=.78;sun.intensity*=.72;}else if(overcast){scene.fog.far=500;hemi.intensity*=.88;sun.intensity*=.83;}else scene.fog.far=575;for(const l of streetLights)l.intensity=night?1.55:0;carLightL.intensity=state.inCar&&night?1.25:0;carLightR.intensity=state.inCar&&night?1.25:0;const phase=Math.floor(performance.now()/7000)%3;signals.forEach((s,i)=>{const p=(phase+i)%3;s.r.material.emissiveIntensity=p===0?2.2:.25;s.y.material.emissiveIntensity=p===1?1.8:.2;s.gr.material.emissiveIntensity=p===2?2.0:.2;});};

  // Fix map coverage and add the aquatics destination.
  if(typeof drawMap==='function'){
    const originalDrawMap=drawMap;drawMap=function(){originalDrawMap();if(mapPanel.hidden)return;const c=mapCtx,p=mapXY(AQX,AQZ);c.fillStyle='#dff1f4';c.fillRect(p.x-38,p.y-18,76,36);c.fillStyle='#173a40';c.font='bold 13px system-ui';c.textAlign='center';c.fillText('Aquatics',p.x,p.y+4);};
  }

  // Make the current objective easier to follow with a world-space beacon for outside objectives.
  const beacon=new THREE.Group();scene.add(beacon);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.08,8,28),new THREE.MeshBasicMaterial({color:0xffef85,transparent:true,opacity:.82}));ring.rotation.x=Math.PI/2;beacon.add(ring);const beam=box(0,.05,0,.08,6,.08,0xffef85,beacon);beam.material.transparent=true;beam.material.opacity=.28;
  function objectivePoint(){const t=cur()[2];if(t==='frog')return[-43,-31];if(t==='gather'||t==='bugs'||t==='release')return[-128,98];if(t==='maya'||t==='maya2')return[B.petshop.x,B.petshop.z+12];if(t==='sam')return[B.hardware.x,B.hardware.z+12];if(t==='eli')return[B.diner.x,B.diner.z+12];if(t==='drlee')return[B.vet.x,B.vet.z+12];if(t==='house'||t==='cabinet'||t==='tub'||t==='table'||t==='build'||t==='sleep'||t==='habitat'||t==='mailbox')return[HX,HZ+HD/2+3];return null;}
  const previousHud=hud;hud=function(){previousHud();const p=objectivePoint();beacon.visible=!!p&&state.zone==='outside';if(p){beacon.position.set(p[0],.12,p[1]);beacon.rotation.y+=.02;}const o=document.querySelector('#objective-text');if(o&&!o.textContent.includes('Yellow beacon')&&beacon.visible)o.textContent+=' Follow the yellow beacon if you get lost.';};

  // Rename visible game-created strings left over from the old name.
  document.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent&&el.textContent.includes('TerrariumBuilds'))el.textContent=el.textContent.replaceAll('TerrariumBuilds',BRAND);});
  console.log('Terrariums & Aquariums Update 0.1.1 realism + bug fixes active');
})();