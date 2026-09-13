import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xb9d6ff);
scene.fog=new THREE.Fog(0xb9d6ff,85,265);
const camera=new THREE.PerspectiveCamera(62,1,.1,500);
const hemi=new THREE.HemisphereLight(0xffffff,0x4e6947,2.25);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,2.25);sun.position.set(55,70,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;scene.add(sun);

const MAT={grass:0x83ad70,road:0x777a76,sidewalk:0xc9c8bc,forest:0x477743,water:0x67aecd,soil:0x76533b,wood:0x6b4d35};
function meshBox(x,z,w,h,d,color,y=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function plane(x,z,w,d,color,y=.01){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m}
function sphere(x,y,z,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
function textSign(text,x,y,z,ry=0,w=8){const c=document.createElement('canvas');c.width=768;c.height=192;const g=c.getContext('2d');g.fillStyle='#f5f7f2';g.fillRect(0,0,c.width,c.height);g.fillStyle='#173b29';g.font='800 60px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(text,384,96);const t=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m}
function building(label,x,z,w,d,color,roof,doorSide='south'){
  meshBox(x,z,w,6.3,d,color);meshBox(x,z,w+1,1.2,d+1,roof,6.3);
  const dz=doorSide==='south'?d/2+.03:-d/2-.03, ry=doorSide==='south'?0:Math.PI;
  textSign(label,x,4.9,z+dz,ry,Math.min(w*.8,12));
  return {x,z,w,d};
}

plane(0,0,420,420,MAT.grass,0);
plane(0,0,260,15,MAT.road,.025);plane(0,0,15,260,MAT.road,.026);
plane(0,-88,250,11,MAT.road,.024);plane(88,0,11,250,MAT.road,.024);plane(-88,0,11,250,MAT.road,.024);
for(const z of [-8,8,-81,-95])plane(0,z,260,3,MAT.sidewalk,.03);
for(const x of [-8,8,81,95])plane(x,0,3,260,MAT.sidewalk,.03);

const places={
  home:{x:-52,z:-54,label:'Your house'},
  petshop:{x:48,z:-55,label:'Pet & Habitat Shop'},
  hardware:{x:106,z:-55,label:'Hardware & Garden'},
  diner:{x:47,z:49,label:'Diner'},
  grocery:{x:105,z:49,label:'Town Market'},
  vet:{x:48,z:108,label:'Exotic Vet'},
  forest:{x:-118,z:78,label:'Pinewood Forest'},
  pond:{x:-68,z:92,label:'Willow Pond'},
  park:{x:-38,z:48,label:'Town Park'}
};
building('YOUR HOUSE',places.home.x,places.home.z,24,20,0xe7decf,0x634832);
building('PET + HABITAT',places.petshop.x,places.petshop.z,28,20,0xc7d8ba,0x45643e);
building('HARDWARE + GARDEN',places.hardware.x,places.hardware.z,28,20,0xd5c8ad,0x6f604d);
building('DINER',places.diner.x,places.diner.z,25,18,0xf0d0ad,0x994f44,'north');
building('TOWN MARKET',places.grocery.x,places.grocery.z,27,18,0xd3ddd8,0x4f6b63,'north');
building('EXOTIC VET',places.vet.x,places.vet.z,28,19,0xe8eeee,0x66858a,'north');

for(let i=0;i<12;i++){
  const side=i<6?-1:1, row=i%6; const x=side*(28+row*18),z=-122;
  meshBox(x,z,13,4.7,12,[0xd7c6b4,0xc8d2b8,0xd6bcbc][i%3]);meshBox(x,z,14,1,13,0x6d5545,4.7);
}
for(let i=0;i<18;i++){const x=-150+i*18;plane(x,142,8,16,0x8aaa6f,.012)}

const pond=new THREE.Mesh(new THREE.CircleGeometry(24,40),new THREE.MeshStandardMaterial({color:MAT.water,roughness:.25,metalness:.05}));pond.rotation.x=-Math.PI/2;pond.position.set(places.pond.x,.04,places.pond.z);scene.add(pond);
for(let i=0;i<95;i++){
  let x=-185+Math.random()*115,z=20+Math.random()*165;
  if(Math.hypot(x-places.pond.x,z-places.pond.z)<30) continue;
  meshBox(x,z,.7,3.6,.7,0x60472f);sphere(x,5.2,z,2.3+Math.random()*1.1,0x477b43);
}
for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=29+Math.random()*4;meshBox(places.pond.x+Math.cos(a)*r,places.pond.z+Math.sin(a)*r,.5,2.6,.5,0x6a5035);sphere(places.pond.x+Math.cos(a)*r,3.7,places.pond.z+Math.sin(a)*r,1.7,0x55834a)}
plane(places.park.x,places.park.z,48,38,0x91bb7b,.02);for(let i=0;i<6;i++)meshBox(-55+i*7,places.park.z+8,4,.45,1.2,0x8b6544,.3);

const player=new THREE.Group();
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.05,5,8),new THREE.MeshStandardMaterial({color:0x2f5c43,roughness:.75}));torso.position.y=1.1;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.4,12,10),new THREE.MeshStandardMaterial({color:0xe8b88c,roughness:.8}));head.position.y=2.22;head.castShadow=true;player.add(head);
const bag=new THREE.Mesh(new THREE.BoxGeometry(.7,.85,.28),new THREE.MeshStandardMaterial({color:0x7a583d}));bag.position.set(0,1.25,.48);player.add(bag);scene.add(player);player.position.set(-25,0,-25);

const terrarium=new THREE.Group();
const tub=new THREE.Mesh(new THREE.BoxGeometry(4.2,1.45,3),new THREE.MeshStandardMaterial({color:0xbfe2e8,transparent:true,opacity:.43,roughness:.3}));tub.position.y=.8;terrarium.add(tub);
const soil=new THREE.Mesh(new THREE.BoxGeometry(3.9,.24,2.7),new THREE.MeshStandardMaterial({color:MAT.soil}));soil.position.y=.18;soil.visible=false;terrarium.add(soil);
const leavesGroup=new THREE.Group();for(let i=0;i<15;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.34,.035,.2),new THREE.MeshStandardMaterial({color:0x9b6a35}));l.position.set((Math.random()-.5)*3.2,.33,(Math.random()-.5)*2);l.rotation.y=Math.random()*Math.PI;leavesGroup.add(l)}leavesGroup.visible=false;terrarium.add(leavesGroup);
const mossMesh=new THREE.Mesh(new THREE.SphereGeometry(.55,10,6),new THREE.MeshStandardMaterial({color:0x5f8f4e}));mossMesh.scale.set(1.5,.32,1);mossMesh.position.set(-1.1,.38,.55);mossMesh.visible=false;terrarium.add(mossMesh);
const grassMesh=new THREE.Mesh(new THREE.ConeGeometry(.65,1,7),new THREE.MeshStandardMaterial({color:0x5c944d}));grassMesh.position.set(1.15,.65,.75);grassMesh.visible=false;terrarium.add(grassMesh);
const hideMesh=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,1.5,12,1,false,0,Math.PI),new THREE.MeshStandardMaterial({color:0x7d5738}));hideMesh.rotation.z=Math.PI/2;hideMesh.position.set(.75,.55,-.4);hideMesh.visible=false;terrarium.add(hideMesh);
const dishMesh=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.13,20),new THREE.MeshStandardMaterial({color:0x72b4d2}));dishMesh.position.set(-1,.25,-.7);dishMesh.visible=false;terrarium.add(dishMesh);
const branchMesh=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,2.4,8),new THREE.MeshStandardMaterial({color:0x73543a}));branchMesh.rotation.z=1.08;branchMesh.position.set(.25,.85,.6);branchMesh.visible=false;terrarium.add(branchMesh);
const thermoMesh=new THREE.Mesh(new THREE.BoxGeometry(.2,.85,.12),new THREE.MeshStandardMaterial({color:0xf3f0e5}));thermoMesh.position.set(1.75,.95,-1.2);thermoMesh.visible=false;terrarium.add(thermoMesh);
const petMesh=new THREE.Mesh(new THREE.SphereGeometry(.32,12,8),new THREE.MeshStandardMaterial({color:0x6a7c4c}));petMesh.scale.set(1.18,.68,1);petMesh.position.set(.1,.46,-.2);terrarium.add(petMesh);terrarium.position.set(places.home.x+1,.75,places.home.z+1);scene.add(terrarium);

const state={coins:25,health:100,hunger:92,energy:100,time:8*60,day:1,petHealth:100,petHunger:82,petWater:88,petStress:18,inv:{leaves:0,grass:0,moss:0,sticks:0,soil:1,petFood:1,snacks:1,water:1,hide:0,dish:0,thermometer:0},built:{substrate:false,leaves:false,moss:false,grass:false,hide:false,water:false,branch:false,thermometer:false},firstNight:false,waypoint:null};
try{const saved=JSON.parse(localStorage.getItem('tb3d-save')||'null');if(saved&&saved.version===2){Object.assign(state,saved.state);Object.assign(state.inv,saved.state.inv||{});Object.assign(state.built,saved.state.built||{})}}catch{}

const ui={coins:$('#coins'),health:$('#health'),hunger:$('#hunger'),energy:$('#energy'),petHealth:$('#pet-health'),clock:$('#clock'),prompt:$('#prompt'),location:$('#location-chip'),objectiveTitle:$('#objective-title'),objectiveText:$('#objective-text'),build:$('#build-panel'),shop:$('#shop-panel'),inventory:$('#inventory-panel'),map:$('#map-panel'),sleep:$('#sleep-panel'),toast:$('#toast'),buildStatus:$('#build-status'),buildInv:$('#build-inventory'),petHunger:$('#pet-hunger'),petWater:$('#pet-water'),petStress:$('#pet-stress'),petHungerBar:$('#pet-hunger-bar'),petWaterBar:$('#pet-water-bar'),petStressBar:$('#pet-stress-bar')};
const keys={};let yaw=.2,pitch=.2,cameraDistance=8.5,last=performance.now(),near=null,paused=false,verticalVel=0,onGround=true;
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function toast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),1900)}
function openPanel(el){$$('.modal-card').forEach(x=>x.hidden=true);el.hidden=false;paused=true;document.exitPointerLock?.()}
function closePanel(el){el.hidden=true;paused=false}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanel(document.getElementById(b.dataset.close))));
$('#collapse-help').addEventListener('click',()=>{$('#help').classList.toggle('collapsed');$('#collapse-help').textContent=$('#help').classList.contains('collapsed')?'+':'−'});

const collectables=[];
function collectable(kind,x,z,color,shape='rock'){
  const geo=shape==='plant'?new THREE.ConeGeometry(.45,1,7):new THREE.IcosahedronGeometry(.4,0);
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,shape==='plant'?.5:.35,z);m.castShadow=true;scene.add(m);collectables.push({kind,mesh:m,active:true});
}
for(let i=0;i<34;i++)collectable('leaves',-155+Math.random()*65,35+Math.random()*125,0xa36d35);
for(let i=0;i<24;i++)collectable('sticks',-160+Math.random()*75,25+Math.random()*150,0x715038);
for(let i=0;i<24;i++)collectable('moss',-110+Math.random()*65,55+Math.random()*100,0x4f8b48,'plant');
for(let i=0;i<18;i++)collectable('grass',-65+Math.random()*85,20+Math.random()*55,0x5f974e,'plant');

const shops={petshop:{title:'Pet & Habitat Shop',eyebrow:'Animal care',description:'Food, hides, bowls, and basic habitat equipment.',items:[['petFood','🪱','Pet food',4],['hide','🪵','Cork hide',8],['dish','💧','Water dish',6],['thermometer','🌡️','Thermometer',12]]},hardware:{title:'Hardware & Garden',eyebrow:'Build supplies',description:'Substrate, natural materials, and habitat building supplies.',items:[['soil','🟫','Organic soil',3],['moss','🌱','Live moss',4],['sticks','🪵','Natural wood',3],['grass','🌿','Grass clump',2]]},grocery:{title:'Town Market',eyebrow:'Groceries',description:'Keep yourself fed and hydrated too.',items:[['snacks','🥪','Packed meal',5],['water','🥤','Water bottle',2],['snacks','🍎','Fruit snack',3]]},diner:{title:'Willow Diner',eyebrow:'Hot food',description:'A proper meal restores hunger and some energy.',items:[['meal','🍔','Diner meal',7],['drink','🥤','Cold drink',3]]}};
function openShop(kind){const data=shops[kind];$('#shop-title').textContent=data.title;$('#shop-eyebrow').textContent=data.eyebrow;$('#shop-description').textContent=data.description;$('#shop-grid').innerHTML=data.items.map(([key,icon,name,cost])=>`<button type="button" data-buy="${key}" data-cost="${cost}"><span>${icon}</span><b>${name}</b><small>${cost} coins</small></button>`).join('');$$('[data-buy]').forEach(b=>b.addEventListener('click',()=>buy(b.dataset.buy,+b.dataset.cost,b.querySelector('b').textContent)));openPanel(ui.shop)}
function buy(key,cost,name){if(state.coins<cost)return toast(`You need ${cost} coins.`);state.coins-=cost;if(key==='meal'){state.hunger=clamp(state.hunger+55);state.energy=clamp(state.energy+12)}else if(key==='drink'){state.energy=clamp(state.energy+5)}else state.inv[key]=(state.inv[key]||0)+1;toast(`${name} purchased.`);updateAll()}

function updateBuildVisuals(){soil.visible=state.built.substrate;leavesGroup.visible=state.built.leaves;mossMesh.visible=state.built.moss;grassMesh.visible=state.built.grass;hideMesh.visible=state.built.hide;dishMesh.visible=state.built.water;branchMesh.visible=state.built.branch;thermoMesh.visible=state.built.thermometer}
function readiness(){let s=0;s+=state.built.substrate?2:0;s+=state.built.leaves?1:0;s+=state.built.moss?1:0;s+=state.built.grass?1:0;s+=state.built.hide?2:0;s+=state.built.water?2:0;s+=state.built.branch?1:0;s+=state.built.thermometer?1:0;return s}
function updateBuildUI(){const score=readiness();ui.buildStatus.innerHTML=`<strong>Habitat readiness: ${score}/11</strong><br>${score<5?'Too bare for a safe night. Focus on substrate, water, and a hide.':score<8?'Usable, but still missing important comfort or monitoring.':score<11?'Good starter setup. You can still improve it.':'Excellent starter setup for this beta.'}`;ui.buildInv.textContent=`Backpack: ${state.inv.leaves} leaves · ${state.inv.grass} grass · ${state.inv.moss} moss · ${state.inv.sticks} sticks · ${state.inv.soil} soil`;$$('[data-build]').forEach(b=>b.classList.toggle('done',!!state.built[b.dataset.build]));updateBuildVisuals()}
function spendItem(key,n){if((state.inv[key]||0)<n)return false;state.inv[key]-=n;return true}
$$('[data-build]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.build;if(state.built[k])return toast('Already installed.');let ok=true;if(k==='substrate')ok=spendItem('leaves',2)&&spendItem('soil',1);if(k==='leaves')ok=spendItem('leaves',2);if(k==='moss')ok=spendItem('moss',2);if(k==='grass')ok=spendItem('grass',2);if(k==='branch')ok=spendItem('sticks',2);if(k==='hide'){if(state.inv.hide>0)state.inv.hide--;else if(state.coins>=8)state.coins-=8;else ok=false}if(k==='water'){if(state.inv.dish>0)state.inv.dish--;else if(state.coins>=6)state.coins-=6;else ok=false}if(k==='thermometer'){if(state.inv.thermometer>0)state.inv.thermometer--;else if(state.coins>=12)state.coins-=12;else ok=false}if(!ok)return toast('You do not have the materials for that yet.');state.built[k]=true;toast(`${btn.querySelector('b').textContent} added.`);updateAll()}));

function fmtTime(){let m=((Math.floor(state.time)%1440)+1440)%1440,h=Math.floor(m/60),mins=m%60,pm=h>=12,hh=((h+11)%12)+1;return `${hh}:${String(mins).padStart(2,'0')} ${pm?'PM':'AM'}`}
function updateObjective(){if(!state.firstNight){ui.objectiveTitle.textContent='First night challenge';const s=readiness();ui.objectiveText.textContent=`Prepare Moss before midnight. Habitat ${s}/11 · pet hunger ${Math.round(state.petHunger)}% · hydration ${Math.round(state.petWater)}%.`}else if(state.petHealth<70){ui.objectiveTitle.textContent='Moss needs attention';ui.objectiveText.textContent='Improve the habitat, feed Moss, and keep hydration up. The exotic vet is north of town.'}else{ui.objectiveTitle.textContent=`Day ${state.day}: build a better life`;ui.objectiveText.textContent='Explore, gather supplies, care for Moss, eat, rest, and keep upgrading the habitat.'}}
function renderInventory(){const names={leaves:['🍂','Leaf litter'],grass:['🌿','Grass'],moss:['🌱','Moss'],sticks:['🪵','Sticks'],soil:['🟫','Soil'],petFood:['🪱','Pet food'],snacks:['🥪','Food'],water:['🥤','Water'],hide:['🪵','Cork hides'],dish:['💧','Water dishes'],thermometer:['🌡️','Thermometers']};$('#inventory-grid').innerHTML=Object.entries(names).map(([k,[i,n]])=>`<div><span>${i}</span><b>${n}</b><small>${state.inv[k]||0} owned</small></div>`).join('')}
function updateHUD(){ui.coins.textContent=Math.floor(state.coins);ui.health.textContent=Math.round(state.health)+'%';ui.hunger.textContent=Math.round(state.hunger)+'%';ui.energy.textContent=Math.round(state.energy)+'%';ui.petHealth.textContent=Math.round(state.petHealth)+'%';ui.clock.textContent=`Day ${state.day} · ${fmtTime()}`;ui.petHunger.textContent=Math.round(state.petHunger)+'%';ui.petWater.textContent=Math.round(state.petWater)+'%';ui.petStress.textContent=Math.round(state.petStress)+'%';ui.petHungerBar.style.width=clamp(state.petHunger)+'%';ui.petWaterBar.style.width=clamp(state.petWater)+'%';ui.petStressBar.style.width=clamp(100-state.petStress)+'%';updateObjective()}
function updateAll(){updateHUD();updateBuildUI();renderInventory()}
updateAll();

$('#eat-snack').onclick=()=>{if(!state.inv.snacks)return toast('No food in your backpack.');state.inv.snacks--;state.hunger=clamp(state.hunger+40);state.energy=clamp(state.energy+5);toast('You ate a snack.');updateAll()};
$('#drink-water').onclick=()=>{if(!state.inv.water)return toast('No water bottle.');state.inv.water--;state.energy=clamp(state.energy+6);toast('You drank some water.');updateAll()};
$('#save-game').onclick=saveGame;
function saveGame(){try{localStorage.setItem('tb3d-save',JSON.stringify({version:2,state}));toast('Game saved on this browser.')}catch{toast('Could not save right now.')}}

function dist(x,z){return Math.hypot(player.position.x-x,player.position.z-z)}
function closestPlace(){let best=null,d=Infinity;for(const [k,p] of Object.entries(places)){const q=dist(p.x,p.z);if(q<d){d=q;best=[k,p]}}return {key:best[0],place:best[1],distance:d}}
function detectNear(){near=null;for(const c of collectables){if(c.active&&dist(c.mesh.position.x,c.mesh.position.z)<1.8){near={type:'collect',obj:c,label:`E · collect ${c.kind}`};break}}if(!near&&dist(terrarium.position.x,terrarium.position.z)<5)near={type:'terrarium',label:'E · check Moss   B · build habitat   F · feed'};if(!near&&dist(places.home.x-5,places.home.z)<8)near={type:'bed',label:'E · go inside / sleep'};if(!near&&dist(places.petshop.x,places.petshop.z+10)<9)near={type:'shop',shop:'petshop',label:'E · enter Pet & Habitat Shop'};if(!near&&dist(places.hardware.x,places.hardware.z+10)<9)near={type:'shop',shop:'hardware',label:'E · enter Hardware & Garden'};if(!near&&dist(places.diner.x,places.diner.z-9)<9)near={type:'shop',shop:'diner',label:'E · enter Willow Diner'};if(!near&&dist(places.grocery.x,places.grocery.z-9)<9)near={type:'shop',shop:'grocery',label:'E · enter Town Market'};if(!near&&dist(places.vet.x,places.vet.z-10)<9)near={type:'vet',label:'E · visit exotic vet (15 coins)'};if(near){ui.prompt.hidden=false;ui.prompt.textContent=near.label}else ui.prompt.hidden=true;const c=closestPlace();ui.location.textContent=c.distance<24?c.place.label:(player.position.x<-75&&player.position.z>15?'Pinewood Forest':player.position.z>78?'North side':player.position.x>75?'East shops':'TerrariumBuilds Valley')}
function collect(c){c.active=false;c.mesh.visible=false;state.inv[c.kind]=(state.inv[c.kind]||0)+1;toast(`${c.kind[0].toUpperCase()+c.kind.slice(1)} collected.`);updateAll()}
function feedPet(){if(dist(terrarium.position.x,terrarium.position.z)>7)return toast('You need to be near Moss to feed him.');if(!state.inv.petFood)return toast('You need pet food.');state.inv.petFood--;state.petHunger=clamp(state.petHunger+42);state.petStress=clamp(state.petStress-5);toast('Moss ate.');updateAll()}
function interact(){if(paused||!near)return;if(near.type==='collect')collect(near.obj);else if(near.type==='terrarium')openPanel(ui.build);else if(near.type==='shop')openShop(near.shop);else if(near.type==='bed')openPanel(ui.sleep);else if(near.type==='vet'){if(state.coins<15)return toast('Vet visit costs 15 coins.');state.coins-=15;state.petHealth=100;state.petStress=clamp(state.petStress-25);toast('Moss was checked by the vet and is doing better.');updateAll()}}

function resolveNight(){const s=readiness();let reward=0,damage=0;if(s>=9&&state.petHunger>35&&state.petWater>35){reward=25;state.petStress=clamp(state.petStress-15);toast('Great night! Moss did well. +25 coins')}else if(s>=6){reward=10;damage=8;toast('You made it through the night. +10 coins')}else{damage=30;toast('The habitat was too weak overnight. Moss needs better care.')}state.coins+=reward;state.petHealth=clamp(state.petHealth-damage);state.firstNight=true}
function sleep(){if(state.day===1&&!state.firstNight)resolveNight();else{const s=readiness();if(s<5)state.petHealth=clamp(state.petHealth-8);if(state.petHunger<25)state.petHealth=clamp(state.petHealth-6);if(state.petWater<25)state.petHealth=clamp(state.petHealth-8)}state.day++;state.time=7*60;state.energy=100;state.hunger=clamp(state.hunger-8);state.petHunger=clamp(state.petHunger-11);state.petWater=clamp(state.petWater-(state.built.water?5:13));closePanel(ui.sleep);setDaylight();saveGame();updateAll()}
$('#sleep-now').onclick=sleep;

$$('[data-map]').forEach(b=>b.addEventListener('click',()=>{const p=places[b.dataset.map];state.waypoint={x:p.x,z:p.z,label:p.label};toast(`Waypoint set: ${p.label}`);closePanel(ui.map)}));
function updateMapMarker(){const x=clamp((player.position.x+210)/420*100,3,97),y=clamp((player.position.z+210)/420*100,3,97);$('#map-you').style.left=x+'%';$('#map-you').style.top=y+'%'}

addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyF')feedPet();if(e.code==='KeyB'&&!paused&&dist(terrarium.position.x,terrarium.position.z)<8)openPanel(ui.build);if(e.code==='KeyI'){if(ui.inventory.hidden){renderInventory();openPanel(ui.inventory)}else closePanel(ui.inventory)}if(e.code==='KeyM'){if(ui.map.hidden){updateMapMarker();openPanel(ui.map)}else closePanel(ui.map)}if(e.code==='Space'&&!paused&&onGround){verticalVel=5.4;onGround=false}if(e.code==='Escape'){$$('.modal-card').forEach(x=>x.hidden=true);paused=false}});
addEventListener('keyup',e=>keys[e.code]=false);
canvas.addEventListener('click',()=>{if(!paused)canvas.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0017,-.15,.65)});
addEventListener('wheel',e=>{if(paused)return;cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.8,4.5,14)},{passive:true});

function setDaylight(){const h=(state.time/60)%24;if(h>=20||h<6){scene.background.set(0x1d304b);scene.fog.color.set(0x1d304b);sun.intensity=.25;hemi.intensity=.7}else if(h>=18){scene.background.set(0xe5ad7c);scene.fog.color.set(0xe5ad7c);sun.intensity=1.1;hemi.intensity=1.35}else{scene.background.set(0xb9d6ff);scene.fog.color.set(0xb9d6ff);sun.intensity=2.25;hemi.intensity=2.25}}
function updateWorld(dt){if(paused)return;state.time+=dt*3.1;state.hunger=clamp(state.hunger-dt*.12);state.energy=clamp(state.energy-dt*((keys.ShiftLeft||keys.ShiftRight)?.3:.08));state.petHunger=clamp(state.petHunger-dt*.045);state.petWater=clamp(state.petWater-dt*(state.built.water?.018:.04));state.petStress=clamp(state.petStress+dt*(readiness()<5?.018:-.008));if(state.hunger<=2)state.health=clamp(state.health-dt*.2);if(state.petHunger<18||state.petWater<18)state.petHealth=clamp(state.petHealth-dt*.12);if(state.time>=24*60){if(state.day===1&&!state.firstNight)resolveNight();state.time-=1440;state.day++;}setDaylight();updateHUD()}
function movePlayer(dt){if(paused)return;let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z-=1;if(keys.KeyS||keys.ArrowDown)z+=1;if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;if(x||z){const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const sprint=(keys.ShiftLeft||keys.ShiftRight)&&state.energy>4;const speed=sprint?9.5:5.8;player.position.addScaledVector(v,dt*speed);player.rotation.y=Math.atan2(v.x,v.z);if(sprint)state.energy=clamp(state.energy-dt*1.2)}verticalVel-=14*dt;player.position.y+=verticalVel*dt;if(player.position.y<=0){player.position.y=0;verticalVel=0;onGround=true}player.position.x=clamp(player.position.x,-205,205);player.position.z=clamp(player.position.z,-205,205)}
function cameraFollow(){const target=player.position.clone().add(new THREE.Vector3(0,1.55,0));const offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*cameraDistance,2+Math.sin(pitch)*cameraDistance,Math.cos(yaw)*Math.cos(pitch)*cameraDistance);camera.position.lerp(target.clone().add(offset),.14);camera.lookAt(target)}
function updateWaypoint(){if(!state.waypoint)return;const d=Math.hypot(player.position.x-state.waypoint.x,player.position.z-state.waypoint.z);if(d<10){toast(`Reached ${state.waypoint.label}.`);state.waypoint=null}else if(!near){ui.prompt.hidden=false;ui.prompt.textContent=`Waypoint · ${state.waypoint.label} · ${Math.round(d)}m`}}
function animatePet(t){petMesh.position.x=.1+Math.sin(t*.0012)*.55;petMesh.rotation.y=Math.sin(t*.0009)*.4}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight,pr=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*pr)||canvas.height!==Math.floor(h*pr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;resize();movePlayer(dt);updateWorld(dt);detectNear();updateWaypoint();cameraFollow();animatePet(now);renderer.render(scene,camera);requestAnimationFrame(loop)}
setDaylight();requestAnimationFrame(loop);
setInterval(()=>{if(!paused)saveGame()},45000);
