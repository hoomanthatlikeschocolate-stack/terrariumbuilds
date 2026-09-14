import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'), start=$('#start-game'), welcome=$('#welcome'), banner=$('#chapter-banner');

let paused=true, near=null, yaw=.15, pitch=.2, camDist=8, vy=0, onGround=true, last=performance.now(), walk=0;
const keys={};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));

let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
}catch(err){
  start.disabled=true;
  start.textContent='3D unavailable';
  const p=welcome.querySelector('p');
  if(p)p.textContent='This browser could not start WebGL. Try reloading the page or enabling hardware acceleration.';
  throw err;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbad7f0);
scene.fog=new THREE.FogExp2(0xbad7f0,.004);
const camera=new THREE.PerspectiveCamera(62,1,.1,600);
scene.add(new THREE.HemisphereLight(0xeaf6ff,0x41513c,1.5));
const sun=new THREE.DirectionalLight(0xfff0d8,2.6);sun.position.set(45,70,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const mat=(c,r=.9)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const glass=new THREE.MeshPhysicalMaterial({color:0xbde0e8,transparent:true,opacity:.38,roughness:.2});
function box(x,y,z,w,h,d,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m instanceof THREE.Material?m:mat(m));o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function plane(x,y,z,w,d,m,parent=scene){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m instanceof THREE.Material?m:mat(m));o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o}
function sph(x,y,z,r,m,parent=scene){const o=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m instanceof THREE.Material?m:mat(m));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function cyl(x,y,z,r,h,m,parent=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),m instanceof THREE.Material?m:mat(m));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}

// Lightweight neighborhood first: render quickly, then decorate after the first frame.
plane(0,0,0,360,360,0x749a66);
plane(0,.015,0,260,14,0x666a67);plane(0,.016,-88,260,12,0x666a67);plane(88,.017,0,12,260,0x666a67);
const places={home:{x:-58,z:-56,label:'Home'},petshop:{x:52,z:-56,label:'Pet & Habitat Shop'},diner:{x:48,z:50,label:'Willow Diner'},market:{x:108,z:50,label:'Town Market'},hardware:{x:112,z:-56,label:'Hardware & Garden'}};
function building(name,x,z,w,d,color){box(x,0,z,w,6,d,color);box(x,6,z,w+1,.8,d+1,0x4b4b43);box(x-w*.25,0,z+d/2+.05,1.5,2.6,.18,0x48584d);for(const dx of [.05,.28]){box(x+w*dx,1.3,z+d/2+.08,2.1,1.7,.12,0xe6e1d7);box(x+w*dx,1.38,z+d/2+.13,1.8,1.4,.04,glass)}}
building('Home',-58,-56,24,20,0xece4d8);building('Pet Shop',52,-56,30,20,0xc8d9c0);building('Hardware',112,-56,30,20,0xd3c4a8);building('Diner',48,50,27,20,0xd4aa94);building('Market',108,50,29,20,0xd9ddda);

const zones={outside:new THREE.Vector3(-50,0,-36),home:new THREE.Vector3(0,0,410),petshop:new THREE.Vector3(90,0,410),diner:new THREE.Vector3(180,0,410),market:new THREE.Vector3(270,0,410),hardware:new THREE.Vector3(360,0,410)};
function room(cx,floor=0xb99f7d){plane(cx,.02,425,38,29,floor);box(cx-19,0,425,.3,4.5,29,0xe8e3d9);box(cx+19,0,425,.3,4.5,29,0xe8e3d9);box(cx,0,410.5,38,4.5,.3,0xe8e3d9);box(cx,0,439.5,38,4.5,.3,0xe8e3d9)}
room(0,0xa78669);room(90,0xd5d2ca);room(180,0xd5d2ca);room(270,0xd5d2ca);room(360,0xd5d2ca);

// House interior.
box(-10,.1,419,7,.8,3,0x7c6956);box(-10,.9,420.2,7,1.4,.3,0x6d5d4e);box(-5,.1,419,2.4,.55,1.3,0x76553d);
for(let i=0;i<4;i++)box(5+i*2.7,.1,414,2.4,2.4,2.1,0xd8d5ce);box(10,.1,418,4.2,.9,2.3,0xb49b7b);box(5,.1,421,2.7,3.5,2.5,0xd3d5d2);
box(-4,.1,434,6,.8,3.5,0xd5c1a7);box(9,.1,434,5.5,1,2.6,0x76553d);box(13,.1,424,2.2,2.5,1.1,0xd7d9d8);
const tubProp=new THREE.Group();scene.add(tubProp);tubProp.position.set(1.8,1.3,415.4);box(0,0,0,1.7,.55,1.1,glass,tubProp);box(0,.58,0,1.82,.12,1.2,0xb6d6de,tubProp);

function register(x){box(x,.1,434,4.8,1,2,0x705c49);box(x,1.12,433.8,1.1,.6,.7,0x303534)}
for(const x of [102,192,282,372])register(x);
function npc(x,c){const g=new THREE.Group();scene.add(g);g.position.set(x,0,431);box(0,1,0,.9,1.05,.48,c,g);sph(0,2.25,0,.35,0xd3a079,g);for(const sx of [-.22,.22])box(sx,.15,0,.2,.8,.24,0x3d4550,g)}
npc(102,0x567c61);npc(192,0x9a594b);npc(282,0x6d7d72);npc(372,0x7b6a50);

// Player.
const player=new THREE.Group();scene.add(player);const body=new THREE.Group();player.add(body);const skin=mat(0xd6a276),shirt=mat(0x2f5c43),pants=mat(0x354150);
box(0,1.02,0,.88,.45,.48,pants,body);box(0,1.38,0,1.03,1.08,.5,shirt,body);sph(0,2.48,0,.38,skin,body);sph(0,2.65,.04,.38,0x30251f,body);
const la=new THREE.Group(),ra=new THREE.Group(),ll=new THREE.Group(),rl=new THREE.Group();la.position.set(-.64,1.87,0);ra.position.set(.64,1.87,0);ll.position.set(-.24,1.1,0);rl.position.set(.24,1.1,0);body.add(la,ra,ll,rl);for(const g of [la,ra])cyl(0,-.45,0,.15,.9,shirt,g);for(const g of [ll,rl])cyl(0,-.62,0,.17,1.2,pants,g);

// Frog and temporary habitat.
const frog=new THREE.Group();scene.add(frog);frog.position.set(-43,.12,-31);sph(0,.22,0,.38,0x648248,frog);sph(-.22,.42,-.18,.13,0x6f8c52,frog);sph(.22,.42,-.18,.13,0x6f8c52,frog);
const habitat=new THREE.Group();scene.add(habitat);habitat.position.set(-4,1,434);habitat.visible=false;box(0,0,0,3.8,1.45,2.6,glass,habitat);const hsoil=box(0,.05,0,3.45,.25,2.25,0x5e4430,habitat);hsoil.visible=false;const hdish=cyl(-1,.2,-.55,.4,.12,0x79b6ca,habitat);hdish.visible=false;const hhide=cyl(.65,.45,.15,.45,1.2,0x76553d,habitat);hhide.rotation.z=Math.PI/2;hhide.visible=false;

const BASE={version:6,username:'Guest',story:0,zone:'outside',day:1,time:540,health:100,hunger:96,energy:100,frogCaught:false,hasTub:false,habitatPlaced:false,petHunger:88,petWater:82,petStress:20,built:{soil:false,leaves:false,water:false,hide:false}};
let state=structuredClone(BASE), saveKey='tb3d-v6-guest';
function load(){try{const s=JSON.parse(localStorage.getItem(saveKey)||'null');if(s?.version===6)state={...structuredClone(BASE),...s,built:{...BASE.built,...s.built}}}catch{}}
function save(){try{localStorage.setItem(saveKey,JSON.stringify(state));$('#save-state').textContent='Saved';setTimeout(()=>$('#save-state').textContent='Autosave on',900)}catch{}}
async function resolveUser(){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),1500);try{const r=await fetch('/api/terrarium?action=session',{credentials:'same-origin',signal:ctrl.signal});const d=await r.json();return d?.user?.username||'Guest'}catch{return 'Guest'}finally{clearTimeout(timer)}}

const ui={title:$('#objective-title'),text:$('#objective-text'),prompt:$('#prompt'),location:$('#location'),profile:$('#profile-chip'),pet:$('#pet-card'),health:$('#health'),hunger:$('#hunger'),energy:$('#energy'),clock:$('#clock'),ph:$('#ph'),pw:$('#pw'),ps:$('#ps'),phb:$('#ph-bar'),pwb:$('#pw-bar'),psb:$('#ps-bar')};
function objective(){const steps=[['A frog in the yard','Walk toward the frog near your yard and press E.'],['Catch the frog','Approach the frog and press E.'],['Find a container','Go into your house and find the Tupperware in the kitchen.'],['Make a temporary home','Place the Tupperware on the dining table.'],['Build without buying','Add soil, water and cover using things you already have.'],['First night','Finish the temporary habitat, then sleep.'],['A new responsibility','The frog made it through the first night.']];const s=Math.min(state.story,6);ui.title.textContent=steps[s][0];ui.text.textContent=steps[s][1];$('#story-progress').innerHTML=steps.map((_,i)=>`<i class="${i<=s?'done':''}"></i>`).join('')}
function hud(){ui.profile.textContent=state.username;$('#settings-user').textContent=state.username;ui.health.textContent=Math.round(state.health)+'%';ui.hunger.textContent=Math.round(state.hunger)+'%';ui.energy.textContent=Math.round(state.energy)+'%';ui.clock.textContent=`Day ${state.day} · ${Math.floor(state.time/60)}:${String(Math.floor(state.time)%60).padStart(2,'0')}`;ui.pet.hidden=!state.frogCaught;ui.ph.textContent=Math.round(state.petHunger)+'%';ui.pw.textContent=Math.round(state.petWater)+'%';ui.ps.textContent=Math.round(state.petStress)+'%';ui.phb.style.width=state.petHunger+'%';ui.pwb.style.width=state.petWater+'%';ui.psb.style.width=(100-state.petStress)+'%';objective();frog.visible=!state.frogCaught;tubProp.visible=!state.hasTub;habitat.visible=state.habitatPlaced;hsoil.visible=state.built.soil;hdish.visible=state.built.water;hhide.visible=state.built.hide}
function dist(x,z){return Math.hypot(player.position.x-x,player.position.z-z)}
function enter(zone){state.zone=zone;player.position.copy(zones[zone]);ui.location.textContent=zone==='outside'?'Home neighborhood':zone==='home'?'Inside your house':({petshop:'Pet & Habitat Shop',diner:'Willow Diner',market:'Town Market',hardware:'Hardware & Garden'})[zone];save()}
function open(id){$$('.dialog').forEach(x=>x.hidden=true);$(id).hidden=false;paused=true;document.exitPointerLock?.()}
function closeAll(){$$('.dialog').forEach(x=>x.hidden=true);paused=false}
function story(title,body){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;open('#story-dialog')}
function detect(){near=null;if(state.zone==='outside'){if(!state.frogCaught&&dist(-43,-31)<2.5)near={t:'frog',label:'E · carefully catch the frog'};if(dist(-58,-45)<7)near={t:'enter',zone:'home',label:'E · enter your house'};for(const [k,p] of Object.entries(places)){if(k==='home')continue;if(dist(p.x,p.z)<10)near={t:'enter',zone:k,label:`E · enter ${p.label}`}}}else{const exits={home:[0,410],petshop:[90,410],diner:[180,410],market:[270,410],hardware:[360,410]};const ex=exits[state.zone];if(ex&&dist(ex[0],ex[1])<3)near={t:'exit',label:'E · go outside'};if(state.zone==='home'){if(!state.hasTub&&dist(1.8,415.4)<2.8)near={t:'tub',label:'E · take the clean Tupperware'};if(state.hasTub&&!state.habitatPlaced&&dist(-4,434)<3.5)near={t:'place',label:'E · place Tupperware on dining table'};if(state.habitatPlaced&&dist(-4,434)<4)near={t:'build',label:'E · inspect habitat · B build'};if(dist(10,434)<2.8)near={t:'sleep',label:'E · sleep / end day'}}else{const reg={petshop:[102,434],diner:[192,434],market:[282,434],hardware:[372,434]}[state.zone];if(reg&&dist(reg[0],reg[1])<3.8)near={t:'npc',kind:state.zone,label:'E · talk to cashier'}}ui.prompt.hidden=!near;if(near)ui.prompt.textContent=near.label}
function interact(){if(paused||!near)return;const n=near;if(n.t==='frog'){state.frogCaught=true;state.story=Math.max(state.story,2);story('You caught the frog','<p>You gently secure the frog. Now you need a temporary enclosure.</p><button class="primary" data-action="home">Go inside</button>');hud();save()}else if(n.t==='enter')enter(n.zone);else if(n.t==='exit')enter('outside');else if(n.t==='tub'){state.hasTub=true;state.story=Math.max(state.story,3);story('A clean container','<p>You find a clean Tupperware container in the kitchen. No coins are needed because it is already in your house.</p>');hud();save()}else if(n.t==='place'){state.habitatPlaced=true;state.story=Math.max(state.story,4);hud();save()}else if(n.t==='build')open('#build-dialog');else if(n.t==='sleep'){const score=Object.values(state.built).filter(Boolean).length;if(score<3)return story('Not ready yet','<p>Add at least three habitat essentials before sleeping.</p>');state.story=6;state.day++;state.time=420;save();story('Morning','<p>The frog made it through the first night. The larger town progression begins from here.</p>');hud()}else if(n.t==='npc'){const names={petshop:'Maya',diner:'Eli',market:'Nora',hardware:'Sam'};story(names[n.kind],`<p>You are talking to the cashier at the register. Full ordering and store systems come next, but the physical interior and NPC interaction are active now.</p>`)} }

$$('[data-build]').forEach(b=>b.onclick=()=>{const k=b.dataset.build;if(state.built[k])return;state.built[k]=true;b.classList.add('done');if(Object.values(state.built).filter(Boolean).length>=3)state.story=Math.max(state.story,5);$('#build-score').textContent=`Readiness: ${Object.values(state.built).filter(Boolean).length}/4`;hud();save()});
$$('[data-close-dialog]').forEach(b=>b.onclick=closeAll);$('#settings-btn').onclick=()=>open('#settings-dialog');$('#restart-game').onclick=()=>{if(confirm('Restart this account’s story?')){localStorage.removeItem(saveKey);location.reload()}};document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(a?.dataset.action==='home'){closeAll();enter('home')}});

start.disabled=false;start.textContent='Start Chapter 1';
start.onclick=()=>{paused=false;welcome.hidden=true;banner.hidden=false;setTimeout(()=>banner.hidden=true,2500);if(state.story===0)state.story=1;hud();save();setTimeout(()=>canvas.requestPointerLock?.(),100)};

addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyB'&&state.zone==='home'&&state.habitatPlaced&&dist(-4,434)<5)open('#build-dialog');if(e.code==='KeyI')open('#inventory-dialog');if(e.code==='Escape')closeAll();if(e.code==='Space'&&!paused&&onGround){vy=5;onGround=false}});addEventListener('keyup',e=>keys[e.code]=false);canvas.addEventListener('click',()=>{if(!paused)canvas.requestPointerLock?.()});addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0016,-.15,.7)});addEventListener('wheel',e=>camDist=clamp(camDist+Math.sign(e.deltaY)*.7,4.5,14),{passive:true});
function move(dt){if(paused)return;let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z--;if(keys.KeyS||keys.ArrowDown)z++;if(keys.KeyA||keys.ArrowLeft)x--;if(keys.KeyD||keys.ArrowRight)x++;const moving=x||z,sprint=(keys.ShiftLeft||keys.ShiftRight)&&state.energy>3;if(moving){const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);player.position.addScaledVector(v,dt*(sprint?9:5.7));player.rotation.y=Math.atan2(v.x,v.z);walk+=dt*(sprint?10:7);const sw=Math.sin(walk)*(sprint?.65:.45);la.rotation.x=sw;ra.rotation.x=-sw;ll.rotation.x=-sw*.7;rl.rotation.x=sw*.7;if(sprint)state.energy=clamp(state.energy-dt)}else{la.rotation.x*=.82;ra.rotation.x*=.82;ll.rotation.x*=.82;rl.rotation.x*=.82}vy-=14*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true}}
function update(dt){if(!paused){state.time+=dt*2.5;state.hunger=clamp(state.hunger-dt*.04);state.energy=clamp(state.energy+dt*.025);if(state.frogCaught){state.petHunger=clamp(state.petHunger-dt*.015);state.petWater=clamp(state.petWater-dt*(state.built.water?.006:.015));state.petStress=clamp(state.petStress+dt*(state.habitatPlaced?-.008:.015))}hud()}}
function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),pr=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*pr)||canvas.height!==Math.floor(h*pr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
function cameraUpdate(){const target=player.position.clone().add(new THREE.Vector3(0,1.5,0));const off=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*camDist,2+Math.sin(pitch)*camDist,Math.cos(yaw)*Math.cos(pitch)*camDist);camera.position.lerp(target.clone().add(off),.15);camera.lookAt(target)}
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;resize();move(dt);update(dt);detect();cameraUpdate();renderer.render(scene,camera);requestAnimationFrame(loop)}

// Start rendering immediately. Account lookup happens afterward and can never block the game.
player.position.copy(zones.outside);hud();requestAnimationFrame(loop);window.dispatchEvent(new Event('tb3d-ready'));
setTimeout(()=>{
  for(let i=0;i<45;i++){const x=-145+Math.random()*65,z=20+Math.random()*125;cyl(x,1.8,z,.22,3.6,0x76553d);sph(x,4,z,1.5+Math.random()*.7,0x456f43)}
},0);
resolveUser().then(name=>{state.username=name;saveKey='tb3d-v6-'+name.toLowerCase();load();state.username=name;player.position.copy(zones[state.zone]||zones.outside);$('#welcome-name').textContent=`Welcome, ${name}.`;hud();});
setInterval(()=>{if(!paused)save()},30000);
