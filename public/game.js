import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

const canvas=document.querySelector('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xb9d6ff);
scene.fog=new THREE.Fog(0xb9d6ff,42,115);
const camera=new THREE.PerspectiveCamera(60,1,.1,220);

const hemi=new THREE.HemisphereLight(0xffffff,0x55704b,2.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(28,38,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x8fb975,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const road=new THREE.Mesh(new THREE.PlaneGeometry(100,12),new THREE.MeshStandardMaterial({color:0x8b8a84,roughness:1}));road.rotation.x=-Math.PI/2;road.position.y=.015;scene.add(road);
const road2=road.clone();road2.rotation.z=Math.PI/2;scene.add(road2);

function box(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function sign(text,x,z,color=0x183a29){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f6f8f3';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#183a29';ctx.font='700 54px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(c);const s=new THREE.Mesh(new THREE.PlaneGeometry(7,1.75),new THREE.MeshBasicMaterial({map:tex,transparent:false,side:THREE.DoubleSide}));s.position.set(x,4.5,z);s.rotation.y=color;s.castShadow=false;scene.add(s);return s}

const home=box(-18,0,-18,14,5.5,12,0xe7decf);box(-18,5.5,-18,15.4,1.5,13.2,0x6c4c34);sign('YOUR HOUSE',-18,-11.92,0);
const shop=box(20,0,-18,16,6,12,0xc9d9bd);box(20,6,-18,17,1.4,13,0x46653f);sign('PET + HABITAT SHOP',20,-11.92,0);
const diner=box(20,0,19,16,5.4,11,0xf0d6bb);box(20,5.4,19,17,1.2,12,0x9c5548);const ds=sign('DINER',20,13.42,Math.PI);ds.rotation.y=Math.PI;
const park=box(-22,0,20,1,.2,1,0x4f7f45);

for(let i=0;i<34;i++){const trunk=box((Math.random()-.5)*150,0,(Math.random()-.5)*150,.5,2.4,.5,0x6e5237);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7+Math.random()*.7,9,8),new THREE.MeshStandardMaterial({color:0x4c8449,roughness:1}));crown.position.set(trunk.position.x,3.1,trunk.position.z);crown.castShadow=true;scene.add(crown)}

const player=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.1,5,8),new THREE.MeshStandardMaterial({color:0x315a43,roughness:.75}));body.position.y=1.05;body.castShadow=true;player.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),new THREE.MeshStandardMaterial({color:0xe8b88c,roughness:.8}));head.position.y=2.15;head.castShadow=true;player.add(head);scene.add(player);player.position.set(-4,0,-2);

const terrarium=new THREE.Group();const tub=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.1,2.2),new THREE.MeshStandardMaterial({color:0xc6e1e6,transparent:true,opacity:.48,roughness:.35}));tub.position.y=.6;terrarium.add(tub);const soil=new THREE.Mesh(new THREE.BoxGeometry(2.95,.18,1.95),new THREE.MeshStandardMaterial({color:0x725038}));soil.position.y=.13;soil.visible=false;terrarium.add(soil);const leafMat=new THREE.MeshStandardMaterial({color:0x9d6c37});const leafMeshes=[];for(let i=0;i<7;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.35,.04,.18),leafMat);l.position.set((Math.random()-.5)*2.3,.27,(Math.random()-.5)*1.4);l.rotation.y=Math.random()*Math.PI;terrarium.add(l);leafMeshes.push(l);l.visible=false}const grassMesh=new THREE.Mesh(new THREE.ConeGeometry(.55,.8,7),new THREE.MeshStandardMaterial({color:0x5d8c4c}));grassMesh.position.set(-.85,.55,.45);grassMesh.visible=false;terrarium.add(grassMesh);const hideMesh=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,1.3,12,1,false,0,Math.PI),new THREE.MeshStandardMaterial({color:0x7b5637}));hideMesh.rotation.z=Math.PI/2;hideMesh.position.set(.7,.45,.2);hideMesh.visible=false;terrarium.add(hideMesh);const waterMesh=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,18),new THREE.MeshStandardMaterial({color:0x73b5d4}));waterMesh.position.set(-.6,.18,-.55);waterMesh.visible=false;terrarium.add(waterMesh);const petMesh=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),new THREE.MeshStandardMaterial({color:0x6d7f4d}));petMesh.scale.set(1.15,.7,1);petMesh.position.set(.2,.42,-.15);terrarium.add(petMesh);terrarium.position.set(-18,.8,-17.2);scene.add(terrarium);

const collectables=[];
function makeCollectable(kind,x,z){const mesh=new THREE.Mesh(kind==='leaves'?new THREE.IcosahedronGeometry(.35,0):new THREE.ConeGeometry(.38,.9,6),new THREE.MeshStandardMaterial({color:kind==='leaves'?0xb07638:0x5f954f}));mesh.position.set(x,kind==='leaves'?.35:.45,z);mesh.castShadow=true;scene.add(mesh);collectables.push({kind,mesh,active:true});}
for(let i=0;i<14;i++)makeCollectable('leaves',-35+Math.random()*22,9+Math.random()*35);
for(let i=0;i<12;i++)makeCollectable('grass',-9+Math.random()*27,30+Math.random()*28);

const state={coins:25,hunger:100,petHealth:100,petFood:0,leaves:0,grass:0,carrying:false,time:8*60,day:1,built:{substrate:false,leaves:false,grass:false,hide:false,water:false},nightResolved:false};
const keys={};let yaw=0,pitch=.16,last=performance.now(),near=null,paused=false;
const ui={coins:document.querySelector('#coins'),hunger:document.querySelector('#hunger'),petHealth:document.querySelector('#pet-health'),clock:document.querySelector('#clock'),prompt:document.querySelector('#prompt'),objectiveTitle:document.querySelector('#objective-title'),objectiveText:document.querySelector('#objective-text'),build:document.querySelector('#build-panel'),shop:document.querySelector('#shop-panel'),leaves:document.querySelector('#inv-leaves'),grass:document.querySelector('#inv-grass'),status:document.querySelector('#build-status'),toast:document.querySelector('#toast')};
function toast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),1700)}
function openPanel(el){el.hidden=false;paused=true;document.exitPointerLock?.()}function closePanel(el){el.hidden=true;paused=false}
document.querySelector('#close-build').onclick=()=>closePanel(ui.build);document.querySelector('#close-shop').onclick=()=>closePanel(ui.shop);

function updateBuildUI(){ui.leaves.textContent=state.leaves;ui.grass.textContent=state.grass;const score=Object.values(state.built).filter(Boolean).length;ui.status.textContent=`Habitat readiness: ${score}/5 · ${score<3?'Too bare for a safe night.':score<5?'Getting there.':'Starter habitat ready.'}`;document.querySelectorAll('[data-build]').forEach(b=>b.classList.toggle('done',state.built[b.dataset.build]));soil.visible=state.built.substrate;leafMeshes.forEach(x=>x.visible=state.built.leaves);grassMesh.visible=state.built.grass;hideMesh.visible=state.built.hide;waterMesh.visible=state.built.water}
updateBuildUI();

document.querySelectorAll('[data-build]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.build;if(state.built[k])return toast('Already added.');if(k==='substrate'){if(state.leaves<2)return toast('Collect 2 leaf litter first.');state.leaves-=2}else if(k==='leaves'){if(state.leaves<1)return toast('Collect 1 leaf litter first.');state.leaves--}else if(k==='grass'){if(state.grass<2)return toast('Collect 2 grass first.');state.grass-=2}else if(k==='hide'){if(state.coins<8)return toast('Need 8 coins.');state.coins-=8}else if(k==='water'){if(state.coins<6)return toast('Need 6 coins.');state.coins-=6}state.built[k]=true;toast(`${btn.querySelector('b').textContent} added.`);updateBuildUI();updateHUD()}));

document.querySelectorAll('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.buy;const cost={hide:8,water:6,food:4,meal:5}[k];if(state.coins<cost)return toast('Not enough coins.');state.coins-=cost;if(k==='hide')state.built.hide=true;if(k==='water')state.built.water=true;if(k==='food')state.petFood++;if(k==='meal')state.hunger=Math.min(100,state.hunger+45);toast('Purchased.');updateBuildUI();updateHUD()}));

function fmtTime(){let m=Math.floor(state.time)%1440;const h=Math.floor(m/60),mins=m%60,pm=h>=12,hh=((h+11)%12)+1;return `${hh}:${String(mins).padStart(2,'0')} ${pm?'PM':'AM'}`}
function updateHUD(){ui.coins.textContent=Math.floor(state.coins);ui.hunger.textContent=Math.max(0,Math.floor(state.hunger))+'%';ui.petHealth.textContent=Math.max(0,Math.floor(state.petHealth))+'%';ui.clock.textContent=fmtTime();if(!state.nightResolved){ui.objectiveTitle.textContent='First night challenge';ui.objectiveText.textContent='Collect materials, build the starter tub, feed yourself, and make it through tonight.'}else{ui.objectiveTitle.textContent='Day 2 unlocked';ui.objectiveText.textContent='Explore town, earn coins, improve the habitat, and decide when to bring your animal with you.'}}
updateHUD();

function distanceXZ(a,bx,bz){const dx=a.position.x-bx,dz=a.position.z-bz;return Math.hypot(dx,dz)}
function detectNear(){near=null;for(const c of collectables){if(c.active&&distanceXZ(player,c.mesh.position.x,c.mesh.position.z)<1.7){near={type:'collect',obj:c,label:`Press E to collect ${c.kind==='leaves'?'leaf litter':'grass'}`};break}}
if(!near&&distanceXZ(player,-18,-17)<4.8)near={type:'terrarium',label:'Press E to check your starter terrarium · B to build'};
if(!near&&distanceXZ(player,20,-15)<5.5)near={type:'shop',label:'Press E to enter the pet & habitat shop'};
if(!near&&distanceXZ(player,20,16)<5.5)near={type:'diner',label:'Press E to buy a meal for 5 coins'};
if(near){ui.prompt.hidden=false;ui.prompt.textContent=near.label}else ui.prompt.hidden=true}

function interact(){if(paused||!near)return;if(near.type==='collect'){const c=near.obj;c.active=false;c.mesh.visible=false;state[c.kind]++;toast(c.kind==='leaves'?'Leaf litter collected.':'Grass collected.');updateBuildUI()}else if(near.type==='terrarium'){if(state.petFood>0){state.petFood--;state.petHealth=Math.min(100,state.petHealth+15);toast('You fed your animal.')}else openPanel(ui.build)}else if(near.type==='shop')openPanel(ui.shop);else if(near.type==='diner'){if(state.coins<5)return toast('You need 5 coins.');state.coins-=5;state.hunger=Math.min(100,state.hunger+50);toast('You ate at the diner.')}updateHUD()}

addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')interact();if(e.code==='KeyB'&&!paused&&distanceXZ(player,-18,-17)<7)openPanel(ui.build);if(e.code==='Escape'){if(!ui.build.hidden)closePanel(ui.build);if(!ui.shop.hidden)closePanel(ui.shop)}});addEventListener('keyup',e=>keys[e.code]=false);
canvas.addEventListener('click',()=>{if(!paused)canvas.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.0022;pitch=Math.max(-.1,Math.min(.7,pitch-e.movementY*.0016))});

function resolveNight(){if(state.nightResolved)return;state.nightResolved=true;const score=Object.values(state.built).filter(Boolean).length;const fed=state.petFood>0;let reward=0;if(score>=4){state.petHealth=Math.min(100,state.petHealth+(fed?2:-4));reward=20;toast('You made it through the first night! +20 coins')}else if(score===3){state.petHealth-=18;reward=8;toast('Rough night, but your pet made it. +8 coins')}else{state.petHealth-=45;toast('The setup was too bare. Your pet is struggling. Improve it today.')}state.coins+=reward;updateHUD()}

function updateWorld(dt){state.time+=dt*4.5;state.hunger-=dt*.12;if(state.hunger<=0){state.hunger=0;state.petHealth=Math.max(0,state.petHealth-dt*.05)}if(state.time>=20*60&&state.day===1){scene.background.set(0x20334f);scene.fog.color.set(0x20334f);sun.intensity=.35;hemi.intensity=.8}if(state.time>=24*60&&state.day===1){state.time-=1440;state.day=2;scene.background.set(0xb9d6ff);scene.fog.color.set(0xb9d6ff);sun.intensity=2.2;hemi.intensity=2.1;resolveNight()}updateHUD()}

function movePlayer(dt){if(paused)return;let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z-=1;if(keys.KeyS||keys.ArrowDown)z+=1;if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;if(x||z){const v=new THREE.Vector3(x,0,z).normalize();v.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);player.position.addScaledVector(v,dt*6);player.rotation.y=Math.atan2(v.x,v.z);player.position.x=Math.max(-80,Math.min(80,player.position.x));player.position.z=Math.max(-80,Math.min(80,player.position.z))}}

function cameraFollow(){const dist=7.5;const target=player.position.clone().add(new THREE.Vector3(0,1.6,0));const offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*dist,2.1+Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);camera.position.lerp(target.clone().add(offset),.12);camera.lookAt(target)}

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}

function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;resize();movePlayer(dt);if(!paused)updateWorld(dt);detectNear();cameraFollow();renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
