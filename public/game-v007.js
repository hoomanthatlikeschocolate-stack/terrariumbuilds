/* TerrariumBuilds 3D – Update 0.0.7 Storyline + Realism Revamp */
(function(THREE){
'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const canvas = $('#game');
const startButton = $('#start-game');
const welcome = $('#welcome');
const chapterBanner = $('#chapter-banner');
const chapterBannerLabel = $('#chapter-banner-label');
const chapterBannerTitle = $('#chapter-banner-title');
const objectiveTitle = $('#objective-title');
const objectiveText = $('#objective-text');
const storyChapter = $('#story-chapter');
const storyProgress = $('#story-progress');
const promptEl = $('#prompt');
const locationEl = $('#location');
const profileEl = $('#profile-chip');
const saveEl = $('#save-state');
const petCard = $('#pet-card');
const coinCell = $('#coin-cell');
const coinsEl = $('#coins');
const weatherEl = $('#weather-chip');
const dayEl = $('#day-chip');
const inventoryGrid = $('#inventory-grid');
const buildScore = $('#build-score');

if(!canvas || !startButton || !welcome){
  throw new Error('Required game UI is missing from game.html');
}

let renderer;
try{
  renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, powerPreference:'high-performance'});
}catch(err){
  startButton.disabled = true;
  startButton.textContent = '3D unavailable';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fc7df);
scene.fog = new THREE.Fog(0xa8c9dc, 95, 280);
const camera = new THREE.PerspectiveCamera(64, 1, 0.08, 520);

const hemi = new THREE.HemisphereLight(0xeef7ff, 0x5d694d, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffefd2, 2.7);
sun.position.set(55, 80, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(1536,1536);
sun.shadow.camera.left = -130;
sun.shadow.camera.right = 130;
sun.shadow.camera.top = 130;
sun.shadow.camera.bottom = -130;
scene.add(sun);

const mats = {
  grass:new THREE.MeshStandardMaterial({color:0x708f5d,roughness:1}),
  grass2:new THREE.MeshStandardMaterial({color:0x638451,roughness:1}),
  road:new THREE.MeshStandardMaterial({color:0x4e5354,roughness:.95}),
  sidewalk:new THREE.MeshStandardMaterial({color:0xc7c9c4,roughness:1}),
  curb:new THREE.MeshStandardMaterial({color:0xaeb2ad,roughness:1}),
  soil:new THREE.MeshStandardMaterial({color:0x5a402e,roughness:1}),
  wood:new THREE.MeshStandardMaterial({color:0x7a5a3b,roughness:.9}),
  darkWood:new THREE.MeshStandardMaterial({color:0x503d2c,roughness:.92}),
  white:new THREE.MeshStandardMaterial({color:0xe9ebe6,roughness:.9}),
  wall:new THREE.MeshStandardMaterial({color:0xe8e0d2,roughness:.95}),
  metal:new THREE.MeshStandardMaterial({color:0x777d7f,roughness:.55,metalness:.35}),
  black:new THREE.MeshStandardMaterial({color:0x202527,roughness:.65}),
  glass:new THREE.MeshPhysicalMaterial({color:0xbfdde7,transparent:true,opacity:.34,roughness:.12,metalness:0}),
  water:new THREE.MeshPhysicalMaterial({color:0x6caec2,transparent:true,opacity:.72,roughness:.18}),
  leaf:new THREE.MeshStandardMaterial({color:0x526f43,roughness:1}),
  leaf2:new THREE.MeshStandardMaterial({color:0x435f3b,roughness:1}),
  red:new THREE.MeshStandardMaterial({color:0x9e5a4a,roughness:.88}),
  blue:new THREE.MeshStandardMaterial({color:0x4e7181,roughness:.86}),
  cream:new THREE.MeshStandardMaterial({color:0xd8cdb6,roughness:.92})
};

function mat(value){
  if(value && value.isMaterial) return value;
  return new THREE.MeshStandardMaterial({color:value || 0xffffff, roughness:.9});
}
function box(x,y,z,w,h,d,material,parent){
  const obj = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(material));
  obj.position.set(x,y+h/2,z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  (parent || scene).add(obj);
  return obj;
}
function plane(x,y,z,w,d,material,parent){
  const obj = new THREE.Mesh(new THREE.PlaneGeometry(w,d), mat(material));
  obj.rotation.x = -Math.PI/2;
  obj.position.set(x,y,z);
  obj.receiveShadow = true;
  (parent || scene).add(obj);
  return obj;
}
function sphere(x,y,z,r,material,parent,segments){
  const obj = new THREE.Mesh(new THREE.SphereGeometry(r,segments || 12,10), mat(material));
  obj.position.set(x,y,z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  (parent || scene).add(obj);
  return obj;
}
function cyl(x,y,z,r,h,material,parent,segments){
  const obj = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments || 10), mat(material));
  obj.position.set(x,y,z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  (parent || scene).add(obj);
  return obj;
}
function sign(text,x,y,z,scale){
  const c=document.createElement('canvas');c.width=512;c.height=160;
  const ctx=c.getContext('2d');ctx.fillStyle='#f6f2e7';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#1f3d2c';ctx.font='700 44px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,82);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry((scale||8), (scale||8)*.3125),new THREE.MeshBasicMaterial({map:tex}));
  mesh.position.set(x,y,z);mesh.castShadow=false;scene.add(mesh);return mesh;
}
function windowPane(x,y,z,w,h,rotY,parent){
  const m=box(x,y,z,w,h,.08,mats.glass,parent);m.rotation.y=rotY||0;return m;
}

// ---------- World geometry ----------
plane(0,0,0,420,420,mats.grass);
plane(0,.01,0,270,15,mats.road);
plane(0,.012,-86,270,13,mats.road);
plane(86,.013,0,13,270,mats.road);
plane(-86,.013,0,13,270,mats.road);
plane(0,.015,86,270,13,mats.road);
for(const z of [-10,10,-76,-96,76,96]) plane(0,.025,z,270,4,mats.sidewalk);
for(const x of [-10,10,76,96,-76,-96]) plane(x,.026,0,4,270,mats.sidewalk);
for(let i=-6;i<=6;i++){
  box(i*18,.03,0,7,.03,.22,0xd7d2b5);
  box(0,.03,i*18,.22,.03,7,0xd7d2b5);
}

function tree(x,z,s){
  const scale=s||1;
  cyl(x,2*scale,z,.28*scale,4*scale,0x6c5136,scene,9);
  sphere(x,4.8*scale,z,1.7*scale,mats.leaf,scene,10);
  sphere(x-.9*scale,4.2*scale,z+.3*scale,1.15*scale,mats.leaf2,scene,9);
  sphere(x+.85*scale,4.35*scale,z-.2*scale,1.1*scale,mats.leaf,scene,9);
}
function lamp(x,z){
  cyl(x,2.2,z,.08,4.4,mats.black);box(x,4.42,z,.45,.18,.45,0xe8dca8);
}
function bench(x,z,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot||0;scene.add(g);
  box(0,.45,0,3,.18,.7,mats.wood,g);box(0,1,.25,3,.18,.6,mats.wood,g);
  box(-1.15,.05,0,.18,.55,.18,mats.metal,g);box(1.15,.05,0,.18,.55,.18,mats.metal,g);
}
for(const p of [[-130,-125,1.1],[-120,-40,1.2],[-128,50,1.1],[-120,128,1.2],[130,-125,1.15],[132,-30,1.1],[126,105,1.2],[-45,128,1.1],[35,130,1.15]]) tree(p[0],p[1],p[2]);
for(let i=-5;i<=5;i++){lamp(i*22,-14);lamp(i*22,14);}
bench(-36,18,0);bench(38,-18,Math.PI);bench(104,14,Math.PI/2);

// Pond / natural gathering area.
plane(-128,.025,98,44,30,mats.soil);
const pond=plane(-128,.04,98,27,17,mats.water);pond.material.side=THREE.DoubleSide;
for(let i=0;i<14;i++) tree(-150+Math.random()*43,78+Math.random()*43,.65+Math.random()*.35);
for(let i=0;i<28;i++){
  const a=Math.random()*Math.PI*2,r=10+Math.random()*9;
  box(-128+Math.cos(a)*r,.05,98+Math.sin(a)*r,.32,.06,.18,Math.random()>.5?0x6c7d4e:0x765b3b);
}

const obstacles=[];
function addObstacle(x,z,w,d){obstacles.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}

const BUILDINGS={
  home:{x:-56,z:-55,w:26,d:21,label:'Your House',zone:'home'},
  petshop:{x:48,z:-55,w:31,d:21,label:'Pet + Habitat',zone:'petshop'},
  hardware:{x:111,z:-55,w:31,d:21,label:'Hardware + Garden',zone:'hardware'},
  diner:{x:47,z:52,w:28,d:21,label:'Willow Diner',zone:'diner'},
  market:{x:109,z:52,w:30,d:21,label:'Town Market',zone:'market'},
  vet:{x:-49,z:53,w:27,d:21,label:'Exotic Vet',zone:'vet'}
};
function building(cfg,color,roofColor){
  const g=new THREE.Group();g.position.set(cfg.x,0,cfg.z);scene.add(g);
  box(0,0,0,cfg.w,5.8,cfg.d,color,g);box(0,5.8,0,cfg.w+1,.65,cfg.d+1,roofColor,g);
  box(0,0,cfg.d/2+.06,2.2,2.9,.18,0x4c5b51,g);
  windowPane(-cfg.w*.27,1.55,cfg.d/2+.11,3.5,2.2,0,g);windowPane(cfg.w*.27,1.55,cfg.d/2+.11,3.5,2.2,0,g);
  box(0,2.95,cfg.d/2+.65,5.6,.18,1.2,roofColor,g);
  addObstacle(cfg.x,cfg.z,cfg.w,cfg.d);
  sign(cfg.label,cfg.x,4.45,cfg.z+cfg.d/2+.2,Math.min(11,cfg.w*.42));
  return g;
}
building(BUILDINGS.home,0xe5d9c7,0x514a42);
building(BUILDINGS.petshop,0xb8c9af,0x415941);
building(BUILDINGS.hardware,0xc3b491,0x5b5445);
building(BUILDINGS.diner,0xc88d78,0x704838);
building(BUILDINGS.market,0xcfd4cf,0x48555a);
building(BUILDINGS.vet,0xc3ccd8,0x4a596c);

for(let i=0;i<9;i++) box(-69+i*3.1,.1,-43,.12,1.25,.12,0xd9d2c0);
box(-72,.1,-42.8,28,.12,.12,0xd9d2c0);
box(-42,.1,-42.8,28,.12,.12,0xd9d2c0);
box(-43,.1,-39,3.2,.14,5.7,mats.sidewalk);
box(-67,.2,-39.5,1.1,1.2,.65,0x595d61);
box(-67,.2,-38.8,.14,1.8,.14,mats.metal);

function car(x,z,c,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot||0;scene.add(g);
  box(0,.25,0,4.5,1.05,2.05,c,g);box(.1,1.25,0,2.6,.75,1.8,c,g);
  for(const sx of [-1.5,1.5])for(const sz of [-1.0,1.0]){const w=cyl(sx,.42,sz,.38,.22,mats.black,g,12);w.rotation.z=Math.PI/2;}
  windowPane(-.4,1.35,-.91,.9,.5,Math.PI/2,g);windowPane(.7,1.35,-.91,.9,.5,Math.PI/2,g);
}
car(-72,-68,0x596d7f,.05);car(29,68,0x8f5548,Math.PI);car(113,-76,0x7a7c68,.1);

// ---------- Interior zones ----------
const zones={outside:new THREE.Vector3(-49,0,-36),home:new THREE.Vector3(0,0,430),petshop:new THREE.Vector3(92,0,430),hardware:new THREE.Vector3(184,0,430),diner:new THREE.Vector3(276,0,430),market:new THREE.Vector3(368,0,430),vet:new THREE.Vector3(460,0,430)};
const interiorCenters={home:0,petshop:92,hardware:184,diner:276,market:368,vet:460};
function room(cx,w,d,floorMat,wallMat){
  plane(cx,.02,445,w,d,floorMat);
  box(cx-w/2,0,445,.28,4.8,d,wallMat);box(cx+w/2,0,445,.28,4.8,d,wallMat);
  box(cx,0,445-d/2,w,4.8,.28,wallMat);box(cx,0,445+d/2,w,4.8,.28,wallMat);
  box(cx,4.7,445-d/2,w,.16,.35,0xd9d6cf);box(cx,4.7,445+d/2,w,.16,.35,0xd9d6cf);
}
room(0,42,34,0xa9886d,mats.wall);
room(92,42,34,0xd6d4ca,0xe3e3dd);
room(184,42,34,0xc2b79d,0xdfd8c8);
room(276,42,34,0xcab29a,0xe6d7cb);
room(368,42,34,0xd2d0c7,0xe6e5df);
room(460,42,34,0xc8d3d7,0xe5edf0);

box(-11,.15,438,8,.8,3.2,0x79685c);box(-11,.92,439.15,8,1.25,.32,0x68584e);
box(-6,.15,438,2.5,.5,1.3,0x70563d);
box(-15,.15,450,5.7,.65,1.5,mats.darkWood);box(-15,1,450,4.4,2.35,.18,mats.black);
for(let i=0;i<5;i++) box(5+i*2.6,.1,434.8,2.35,2.55,2.1,0xd6d3cb);
box(7,.1,439,5.5,.95,2.1,0xb6a384);box(12.5,.1,439,3.2,.95,2.1,0xb6a384);
box(8,1.12,439,1.7,.14,1.15,mats.metal);
box(15,.1,435,2.75,3.55,2.6,0xd6d9d8);
box(6,.12,453,6.4,.95,3.1,mats.darkWood);
for(const p of [[3,452],[9,452],[3,455],[9,455]]) box(p[0],.1,p[1],1.3,.8,1.3,0x76583f);
box(-10,.15,456,7.5,.65,4.4,0x7e6650);box(-10,.82,457.6,7.5,1.2,.35,0x6c5847);
box(-17,.1,433,2.6,2.5,1.5,0xe2e3df);
box(17,.1,455,3.2,.55,1.7,0xe7e5df);
box(18.2,.72,457,1.5,1.6,1.5,0xf1f0eb);
const tubProp=new THREE.Group();scene.add(tubProp);tubProp.position.set(3,1.2,436.3);box(0,0,0,1.8,.55,1.18,mats.glass,tubProp);box(0,.58,0,1.92,.11,1.3,0xb7d7df,tubProp);

function shelf(cx,z,color){
  const g=new THREE.Group();g.position.set(cx,0,z);scene.add(g);
  box(0,.15,0,6.2,2.9,.75,mats.darkWood,g);
  for(let y=.65;y<2.8;y+=.72) box(0,y,0,6.2,.12,1.05,0x8e765e,g);
  for(let ix=-2.3;ix<=2.3;ix+=1.15) for(let iy=.8;iy<=2.25;iy+=.72) box(ix,iy,-.58,.55,.45,.45,color,g);
}
for(const z of [438,446,454]) shelf(92,z,0x77966f);
for(const z of [438,446,454]) shelf(184,z,0xb58a54);
for(const z of [438,446,454]) shelf(368,z,0x82919a);
function counter(cx){box(cx,.1,457,8,1.05,2,mats.darkWood);box(cx,1.2,456.7,1.25,.65,.75,mats.black);}
counter(92);counter(184);counter(276);counter(368);counter(460);
for(const x of [266,274,282]){box(x,.1,439,2.7,.75,1.1,0x8f574b);box(x,.1,446,2.7,.75,1.1,0x8f574b);box(x,.55,442.5,2.1,.18,2.2,mats.cream);}
box(276,.1,452,18,1.2,1.5,0xc4b69b);
box(455,.6,444,6,.22,3.2,mats.metal);for(let i=0;i<4;i++)box(449+i*3.1,.1,435,2.7,2.2,1.7,0xd9e0e2);

function npc(x,z,name,shirtColor){
  const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);
  box(0,1.05,0,.9,1.08,.5,shirtColor,g);sphere(0,2.35,0,.36,0xd1a17c,g,12);
  cyl(-.25,.58,0,.13,.9,shirtColor,g,8);cyl(.25,.58,0,.13,.9,shirtColor,g,8);
  cyl(-.22,.28,0,.14,.9,0x38434b,g,8);cyl(.22,.28,0,.14,.9,0x38434b,g,8);
  return {obj:g,name:name};
}
const npcs={
  maya:npc(92,454.3,'Maya',0x567d60),
  sam:npc(184,454.3,'Sam',0x846b4d),
  eli:npc(276,454.3,'Eli',0x9c5e50),
  nora:npc(368,454.3,'Nora',0x6b7a70),
  drlee:npc(460,454.3,'Dr. Lee',0x647a8c)
};

const player=new THREE.Group();scene.add(player);const body=new THREE.Group();player.add(body);
const skin=mat(0xd2a07b),shirt=mat(0x315f49),pants=mat(0x3d4852),shoe=mat(0x2a2d2e);
box(0,1.02,0,.88,.45,.5,pants,body);box(0,1.38,0,1.02,1.08,.52,shirt,body);sphere(0,2.48,0,.38,skin,body,12);sphere(0,2.65,.03,.39,0x2b221e,body,12);
const limbs={la:new THREE.Group(),ra:new THREE.Group(),ll:new THREE.Group(),rl:new THREE.Group()};
limbs.la.position.set(-.62,1.88,0);limbs.ra.position.set(.62,1.88,0);limbs.ll.position.set(-.24,1.05,0);limbs.rl.position.set(.24,1.05,0);
body.add(limbs.la,limbs.ra,limbs.ll,limbs.rl);
for(const g of [limbs.la,limbs.ra]) cyl(0,-.44,0,.15,.88,shirt,g,8);
for(const g of [limbs.ll,limbs.rl]){cyl(0,-.56,0,.17,1.08,pants,g,8);box(0,-1.1,-.08,.34,.2,.55,shoe,g);}

const frog=new THREE.Group();scene.add(frog);frog.position.set(-43,.12,-31);
sphere(0,.24,0,.4,0x63804b,frog,12);sphere(-.23,.44,-.18,.14,0x708d56,frog,10);sphere(.23,.44,-.18,.14,0x708d56,frog,10);
sphere(-.23,.47,-.27,.045,mats.black,frog,8);sphere(.23,.47,-.27,.045,mats.black,frog,8);

const habitat=new THREE.Group();scene.add(habitat);habitat.position.set(5.8,1.05,453);habitat.visible=false;
box(0,0,0,4.2,1.5,2.8,mats.glass,habitat);
const hSoil=box(0,.05,0,3.85,.28,2.45,mats.soil,habitat);hSoil.visible=false;
const hDish=cyl(-1.1,.23,-.55,.42,.12,mats.water,habitat,14);hDish.visible=false;
const hHide=cyl(.75,.45,.1,.45,1.35,mats.wood,habitat,12);hHide.rotation.z=Math.PI/2;hHide.visible=false;
const hLeaves=new THREE.Group();habitat.add(hLeaves);hLeaves.visible=false;for(let i=0;i<11;i++)box(-1.25+Math.random()*2.5,.3,-.8+Math.random()*1.6,.45,.05,.2,Math.random()>.5?0x806a3d:0x6f4f2e,hLeaves);

const gatherables=[];
function gatherProp(type,x,z,label,color){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  if(type==='leafLitter'){
    for(let i=0;i<7;i++){const p=box((Math.random()-.5)*1.5,.04,(Math.random()-.5)*1.2,.45,.04,.2,color,g);p.rotation.y=Math.random()*Math.PI;}
  }else if(type==='grass'){
    for(let i=0;i<8;i++){const b=box((Math.random()-.5)*1.2,.05,(Math.random()-.5)*1.0,.06,.65,.06,color,g);b.rotation.z=(Math.random()-.5)*.3;}
  }else if(type==='sticks'){
    for(let i=0;i<4;i++){const s=box((Math.random()-.5)*1.2,.06,(Math.random()-.5)*.7,1.0,.06,.1,color,g);s.rotation.y=Math.random()*Math.PI;}
  }else if(type==='bugs'){
    sphere(0,.08,0,.12,color,g,8);sphere(.16,.07,.03,.07,color,g,8);
  }
  gatherables.push({type:type,obj:g,label:label,collected:false});
}
gatherProp('leafLitter',-116,88,'collect dry leaf litter',0x7d633b);
gatherProp('leafLitter',-136,110,'collect dry leaf litter',0x755632);
gatherProp('grass',-105,108,'collect clean grass clippings',0x50793d);
gatherProp('sticks',-145,86,'collect small sticks',0x6c4f35);
gatherProp('bugs',-121,115,'collect safe feeder insects',0x3a352b);

const BASE={
  version:7,username:'Guest',story:0,chapter:1,zone:'outside',day:1,time:9*60,
  health:100,hunger:92,energy:96,coins:0,coinsUnlocked:false,weather:'Clear',
  frogCaught:false,hasTub:false,habitatPlaced:false,firstNight:false,frogReleased:false,
  ateToday:false,shopAdvice:false,vetVisit:false,jobDone:false,
  petHealth:100,petHunger:90,petWater:86,petStress:18,
  inv:{leafLitter:0,grass:0,sticks:0,bugs:0,food:0,waterBottle:0},
  built:{soil:false,leaves:false,water:false,hide:false},
  visited:{petshop:false,hardware:false,diner:false,market:false,vet:false}
};
let state=JSON.parse(JSON.stringify(BASE));
let saveKey='tb3d-v7-guest';
let paused=true,near=null,yaw=.15,pitch=.18,camDist=8.5,vy=0,onGround=true,last=performance.now(),walk=0;
const keys={};
const clamp=(v,a,b)=>Math.max(a==null?0:a,Math.min(b==null?100:b,v));

function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(saveKey)||'null');
    if(saved && saved.version===7){
      state=Object.assign(JSON.parse(JSON.stringify(BASE)),saved);
      state.inv=Object.assign({},BASE.inv,saved.inv||{});
      state.built=Object.assign({},BASE.built,saved.built||{});
      state.visited=Object.assign({},BASE.visited,saved.visited||{});
    }
  }catch(err){console.warn('save load failed',err);}
}
function save(){
  try{
    localStorage.setItem(saveKey,JSON.stringify(state));
    if(saveEl){saveEl.textContent='Saved';setTimeout(()=>{if(saveEl)saveEl.textContent='Autosave on';},900);}
  }catch(err){console.warn('save failed',err);}
}
async function resolveUser(){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),1800);
  try{
    const r=await fetch('/api/terrarium?action=session',{credentials:'same-origin',signal:ctrl.signal});
    const d=await r.json();return d && d.user && d.user.username ? d.user.username : 'Guest';
  }catch(err){return 'Guest';}finally{clearTimeout(timer);}
}

const STORY=[
  {chapter:1,title:'Something in the yard',text:'Walk to the frog near the edge of your yard and inspect it.',target:'frog'},
  {chapter:1,title:'A careful catch',text:'Approach the frog and press E to secure it gently.',target:'frog'},
  {chapter:1,title:'Use what you already own',text:'Go inside your house and find a clean Tupperware container in the kitchen.',target:'tub'},
  {chapter:1,title:'Temporary shelter',text:'Put the Tupperware on the dining table so you can build a safe overnight setup.',target:'table'},
  {chapter:1,title:'Gather before buying',text:'Collect leaf litter and sticks from the natural area by the pond. No coins needed.',target:'gather'},
  {chapter:1,title:'Build the temporary habitat',text:'Add at least three essentials: moist substrate, leaf litter, shallow water, and a hide.',target:'build'},
  {chapter:1,title:'Food matters too',text:'Collect feeder insects near the pond, then return home.',target:'bugs'},
  {chapter:1,title:'First night',text:'Check the habitat, then use your bed to end the day.',target:'sleep'},
  {chapter:2,title:'Morning check',text:'Inspect the frog after the first night. Hydration, stress, and hunger now matter over time.',target:'habitat'},
  {chapter:2,title:'Ask someone who knows',text:'Visit Pet + Habitat and talk to Maya at the register.',target:'maya'},
  {chapter:2,title:'A proper enclosure',text:'Maya recommends improving the habitat before keeping any animal long-term. Earn your first coins with a simple neighborhood task.',target:'job'},
  {chapter:2,title:'Your first earnings',text:'Check the mailbox at your house and complete the yard cleanup job.',target:'mailbox'},
  {chapter:2,title:'Buy the missing basics',text:'Visit Hardware + Garden. Talk to Sam to buy proper substrate and a hide.',target:'sam'},
  {chapter:3,title:'Real life keeps going',text:'You are hungry too. Visit Willow Diner and order a meal from Eli.',target:'eli'},
  {chapter:3,title:'Care before convenience',text:'Return home and decide whether the frog is stable enough to leave safely while you go out.',target:'home'},
  {chapter:3,title:'Health check',text:'Visit the Exotic Vet and talk to Dr. Lee about the frog.',target:'drlee'},
  {chapter:3,title:'Release or continue rehab',text:'Return to the pond area. If the frog is healthy and calm, release it back where you found it.',target:'release'},
  {chapter:4,title:'A bigger responsibility',text:'With the frog safely released, you can now plan for a permanent terrarium animal. Visit Pet + Habitat.',target:'maya2'},
  {chapter:4,title:'Learn before you buy',text:'Talk to Maya about enclosure size, heating, humidity, food, and daily care before choosing an animal.',target:'maya2'},
  {chapter:4,title:'The town opens up',text:'Explore the market, hardware store, diner, vet, and your home. Future chapters will add permanent pets, jobs, deeper survival, and full town life.',target:'free'}
];

function currentStory(){return STORY[Math.min(state.story,STORY.length-1)];}
function advance(to){
  if(typeof to==='number') state.story=Math.max(state.story,to); else state.story=Math.min(state.story+1,STORY.length-1);
  state.chapter=currentStory().chapter;save();hud();showChapterIfChanged();
}
let shownChapter=0;
function showChapterIfChanged(){
  const ch=currentStory().chapter;if(ch===shownChapter)return;shownChapter=ch;
  if(chapterBannerLabel) chapterBannerLabel.textContent='Chapter '+ch;
  if(chapterBannerTitle) chapterBannerTitle.textContent=ch===1?'The frog in the yard':ch===2?'Learning the responsibility':ch===3?'Life outside the terrarium':'A permanent future';
  if(chapterBanner){chapterBanner.hidden=false;setTimeout(()=>{chapterBanner.hidden=true;},3000);}
}

function formatTime(total){
  let mins=Math.floor(total)%1440;let h=Math.floor(mins/60),m=mins%60;const ap=h>=12?'PM':'AM';let hr=h%12;if(hr===0)hr=12;return hr+':'+String(m).padStart(2,'0')+' '+ap;
}
function hud(){
  const st=currentStory();
  if(storyChapter) storyChapter.textContent='Story · Chapter '+st.chapter;
  if(objectiveTitle) objectiveTitle.textContent=st.title;
  if(objectiveText) objectiveText.textContent=st.text;
  if(storyProgress) storyProgress.innerHTML=STORY.map((s,i)=>'<i class="'+(i<=state.story?'done':'')+'"></i>').join('');
  if(profileEl) profileEl.textContent=state.username;
  const settingsUser=$('#settings-user');if(settingsUser)settingsUser.textContent=state.username;
  $('#health').textContent=Math.round(state.health)+'%';$('#hunger').textContent=Math.round(state.hunger)+'%';$('#energy').textContent=Math.round(state.energy)+'%';
  $('#clock').textContent='Day '+state.day+' · '+formatTime(state.time);
  if(dayEl) dayEl.textContent='Day '+state.day;
  if(weatherEl) weatherEl.textContent=state.weather;
  coinCell.hidden=!state.coinsUnlocked;coinsEl.textContent=String(Math.floor(state.coins));
  petCard.hidden=!state.frogCaught || state.frogReleased;
  $('#ph').textContent=Math.round(state.petHunger)+'%';$('#pw').textContent=Math.round(state.petWater)+'%';$('#ps').textContent=Math.round(state.petStress)+'%';
  $('#ph-bar').style.width=clamp(state.petHunger)+'%';$('#pw-bar').style.width=clamp(state.petWater)+'%';$('#ps-bar').style.width=(100-clamp(state.petStress))+'%';
  frog.visible=!state.frogCaught && !state.frogReleased;
  tubProp.visible=!state.hasTub;
  habitat.visible=state.habitatPlaced && !state.frogReleased;
  hSoil.visible=state.built.soil;hLeaves.visible=state.built.leaves;hDish.visible=state.built.water;hHide.visible=state.built.hide;
  renderInventory();renderBuild();
}
function renderInventory(){
  if(!inventoryGrid)return;
  const entries=[
    ['🐸','Frog',state.frogCaught&&!state.frogReleased?'With you / in habitat':state.frogReleased?'Released safely':'Not caught'],
    ['🥣','Tupperware',state.hasTub?'Owned':'In your kitchen'],
    ['🍂','Leaf litter',state.inv.leafLitter+' collected'],
    ['🌿','Grass',state.inv.grass+' collected'],
    ['🪵','Sticks',state.inv.sticks+' collected'],
    ['🪲','Feeder insects',state.inv.bugs+' collected'],
    ['🍱','Food',state.inv.food+' meal(s)'],
    ['🪙','Coins',String(Math.floor(state.coins))]
  ];
  inventoryGrid.innerHTML=entries.map(e=>'<div><span>'+e[0]+'</span><b>'+e[1]+'</b><small>'+e[2]+'</small></div>').join('');
}
function renderBuild(){
  if(!buildScore)return;
  const count=Object.keys(state.built).filter(k=>state.built[k]).length;
  buildScore.textContent='Habitat readiness: '+count+'/4 · pet stress '+Math.round(state.petStress)+'%';
  $$('[data-build]').forEach(btn=>{btn.classList.toggle('done',!!state.built[btn.dataset.build]);});
}

function dialog(title,body,eyebrow){
  $('#dialog-eyebrow').textContent=eyebrow||'Story';$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;openDialog('#story-dialog');
}
function openDialog(id){$$('.dialog').forEach(x=>x.hidden=true);$(id).hidden=false;paused=true;if(document.exitPointerLock)document.exitPointerLock();}
function closeDialogs(){
  $$('.dialog').forEach(x=>x.hidden=true);
  if(welcome.hidden) paused=false;
}

function distXZ(x,z){return Math.hypot(player.position.x-x,player.position.z-z);}
function canMoveTo(nx,nz){
  if(state.zone!=='outside'){
    const cx=interiorCenters[state.zone]||0;
    return nx>cx-19.4&&nx<cx+19.4&&nz>429&&nz<461;
  }
  if(nx<-194||nx>194||nz<-194||nz>194) return false;
  for(const o of obstacles){
    const pad=.55;
    if(nx>o.minX-pad&&nx<o.maxX+pad&&nz>o.minZ-pad&&nz<o.maxZ+pad){
      const cfg=Object.values(BUILDINGS).find(b=>Math.abs(b.x-(o.minX+o.maxX)/2)<.1&&Math.abs(b.z-(o.minZ+o.maxZ)/2)<.1);
      if(cfg && Math.abs(nx-cfg.x)<2.5 && nz>cfg.z+cfg.d/2-.6) continue;
      return false;
    }
  }
  return true;
}
function enter(zone){
  state.zone=zone;state.visited[zone]=true;player.position.copy(zones[zone]);
  const labels={outside:'Home neighborhood',home:'Inside your house',petshop:'Pet + Habitat',hardware:'Hardware + Garden',diner:'Willow Diner',market:'Town Market',vet:'Exotic Vet'};
  if(locationEl)locationEl.textContent=labels[zone]||zone;save();
}
function detect(){
  near=null;
  if(state.zone==='outside'){
    if(!state.frogCaught&&!state.frogReleased&&distXZ(-43,-31)<2.6) near={type:'frog',label:'E · carefully inspect / catch frog'};
    for(const key of Object.keys(BUILDINGS)){
      const b=BUILDINGS[key];const doorZ=b.z+b.d/2+1.4;
      if(distXZ(b.x,doorZ)<4.8) near={type:'enter',zone:b.zone,label:'E · enter '+b.label};
    }
    for(const g of gatherables){
      if(!g.collected&&g.obj.visible&&distXZ(g.obj.position.x,g.obj.position.z)<2.8) near={type:'gather',item:g,label:'E · '+g.label};
    }
    if(distXZ(-67,-39)<2.5) near={type:'mailbox',label:'E · check mailbox / neighborhood task'};
    if(state.frogCaught&&!state.frogReleased&&distXZ(-128,98)<8) near={type:'release',label:'E · consider releasing frog here'};
  }else{
    const cx=interiorCenters[state.zone]||0;
    if(distXZ(cx,431)<3.3) near={type:'exit',label:'E · go outside'};
    if(state.zone==='home'){
      if(!state.hasTub&&distXZ(3,436.3)<2.7) near={type:'tub',label:'E · take clean Tupperware'};
      if(state.hasTub&&!state.habitatPlaced&&distXZ(6,453)<3.4) near={type:'place',label:'E · place Tupperware on dining table'};
      if(state.habitatPlaced&&distXZ(5.8,453)<4.1) near={type:'habitat',label:'E · inspect habitat · B build'};
      if(distXZ(-10,456)<3.2) near={type:'sleep',label:'E · sleep / end day'};
      if(distXZ(15,435)<2.8) near={type:'fridge',label:'E · check fridge'};
    }
    const regs={petshop:[92,454.3,'maya'],hardware:[184,454.3,'sam'],diner:[276,454.3,'eli'],market:[368,454.3,'nora'],vet:[460,454.3,'drlee']};
    if(regs[state.zone]){
      const r=regs[state.zone];if(distXZ(r[0],r[1])<3.8) near={type:'npc',kind:r[2],label:'E · talk to '+npcs[r[2]].name};
    }
  }
  promptEl.hidden=!near;if(near)promptEl.textContent=near.label;
}
function gather(item){
  item.collected=true;item.obj.visible=false;state.inv[item.type]=(state.inv[item.type]||0)+1;
  dialog('Collected',item.type==='bugs'?'<p>You found a small amount of appropriate feeder insects in the natural area. In a more advanced build, prey type will depend on the animal species.</p>':'<p>You collected a small amount without stripping the area bare.</p>','Field note');
  if(currentStory().target==='gather' && (state.inv.leafLitter>0||state.inv.sticks>0)) advance(5);
  if(currentStory().target==='bugs' && state.inv.bugs>0){state.petHunger=clamp(state.petHunger+18);advance(7);}
  save();hud();
}
function interact(){
  if(paused||!near)return;
  const n=near;
  if(n.type==='frog'){
    if(state.story===0){advance(1);dialog('A frog in the grass','<p>The frog is sitting low in the grass near the yard. It looks alert, not injured. You decide to move slowly and avoid squeezing or grabbing a leg.</p><button class="primary" data-story-action="catch">Carefully catch it</button>');}
    else{catchFrog();}
  }else if(n.type==='enter') enter(n.zone);
  else if(n.type==='exit') enter('outside');
  else if(n.type==='gather') gather(n.item);
  else if(n.type==='tub'){
    state.hasTub=true;advance(3);dialog('A clean temporary container','<p>You find a clean Tupperware container. It is only temporary, but it gives you a safer place to work while you make a better setup.</p>');save();hud();
  }else if(n.type==='place'){
    state.habitatPlaced=true;advance(4);dialog('Temporary setup started','<p>The container is on the dining table. Now gather natural materials and add moisture, cover, and a shallow water source.</p>');save();hud();
  }else if(n.type==='habitat'){
    if(state.story===8){advance(9);dialog('Morning check','<p>The frog made it through the night. It is hydrated, but temporary containers are not a long-term solution. Your next step is getting experienced advice.</p>');}
    else openDialog('#build-dialog');
  }else if(n.type==='sleep'){
    const readiness=Object.keys(state.built).filter(k=>state.built[k]).length;
    if(state.story<7) return dialog('Not ready for the night','<p>Finish the temporary habitat and find feeder insects before sleeping.</p>');
    if(readiness<3) return dialog('Habitat needs more work','<p>Add at least three essential habitat components before ending the day.</p>');
    state.day+=1;state.time=7*60;state.energy=100;state.hunger=78;state.firstNight=true;state.petStress=clamp(state.petStress-12);state.petWater=clamp(state.petWater+10);advance(8);dialog('Morning','<p>Morning light fills the house. The frog is still active and responsive. Do a care check before anything else.</p>');save();hud();
  }else if(n.type==='mailbox'){
    if(state.story<11) return dialog('Mailbox','<p>Mostly normal mail. A neighbor has a note asking for help clearing fallen sticks and leaves from a small walkway.</p>','Neighborhood');
    if(!state.jobDone){state.jobDone=true;state.coinsUnlocked=true;state.coins+=28;advance(12);dialog('Job complete','<p>You help clean the walkway and earn 28 coins. Coins are now part of the game, but animal care still comes before buying random stuff.</p>','Neighborhood job');save();hud();}
    else dialog('Mailbox','<p>No new paid task right now.</p>');
  }else if(n.type==='fridge'){
    if(state.inv.food>0){state.inv.food--;state.hunger=clamp(state.hunger+30);dialog('Quick meal','<p>You eat at home and recover some hunger.</p>');save();hud();}else dialog('Fridge','<p>You have basic food, but not a full prepared meal. The diner and market become more useful as town life expands.</p>');
  }else if(n.type==='npc') talkNPC(n.kind);
  else if(n.type==='release') releaseFrog();
}
function catchFrog(){
  state.frogCaught=true;state.petStress=32;advance(2);dialog('You have the frog','<p>You secure it gently with both hands and head inside. The immediate goal is a temporary, humid, low-stress enclosure for one night.</p><button class="primary" data-story-action="home">Go inside</button>');save();hud();
}
function talkNPC(kind){
  if(kind==='maya'){
    if(state.story===9){state.shopAdvice=true;advance(10);dialog('Maya · Pet + Habitat','<p>Maya explains that a temporary tub is only an emergency setup. She tells you to think about species needs, enclosure size, moisture, hiding places, food, and whether the animal should simply be released.</p><p>Before buying anything, she suggests earning a little money and getting a proper health check if you plan to keep caring for the frog.</p>','Conversation');}
    else if(state.story>=17){advance(18);dialog('Maya · Planning a permanent terrarium','<p>Maya refuses to sell you an animal immediately. First she walks you through enclosure size, ventilation, temperature, humidity, diet, hiding places, and daily maintenance. Future chapters will turn this into the permanent-pet selection system.</p>','Care planning');}
    else dialog('Maya','<p>“Build around the animal’s needs, not around what looks cool on a shelf.”</p>','Pet + Habitat');
  }else if(kind==='sam'){
    if(state.story===12){
      if(state.coins<18) return dialog('Sam · Hardware + Garden','<p>You need 18 coins for the basic substrate and hide bundle.</p>');
      state.coins-=18;state.built.soil=true;state.built.hide=true;advance(13);dialog('Supplies purchased','<p>Sam helps you choose clean, simple materials: proper substrate and a secure hide. No decorative junk that would make cleaning harder.</p>','Hardware + Garden');save();hud();
    }else dialog('Sam','<p>“If it touches the animal or enclosure, think about safety, moisture, cleaning, and sharp edges.”</p>');
  }else if(kind==='eli'){
    if(state.story===13){
      if(!state.coinsUnlocked){return dialog('Eli · Willow Diner','<p>You need money before ordering food.</p>');}
      const cost=7;if(state.coins<cost)return dialog('Eli · Willow Diner','<p>A simple meal costs 7 coins.</p>');
      state.coins-=cost;state.hunger=clamp(state.hunger+48);state.ateToday=true;advance(14);dialog('Meal ordered','<p>You walk up to the register, order a simple meal, pay 7 coins, and eat. Your own needs matter too.</p>','Willow Diner');save();hud();
    }else dialog('Eli','<p>“Counter service here. Order, pay, grab a seat, and don’t forget to actually eat.”</p>');
  }else if(kind==='nora'){
    dialog('Nora · Town Market','<p>The market sells groceries and household basics. Full grocery shopping, cooking, and recurring household costs are planned for later storyline chapters.</p>','Town Market');
  }else if(kind==='drlee'){
    if(state.story===15){state.vetVisit=true;state.petHealth=100;state.petStress=clamp(state.petStress-8);advance(16);dialog('Dr. Lee · Exotic Vet','<p>Dr. Lee checks the frog’s condition and finds no obvious injury. Because it is a healthy wild frog, the best outcome is releasing it near the safe area where it was found rather than turning it into a permanent pet.</p>','Health check');save();hud();}
    else dialog('Dr. Lee','<p>“Wild animals are not automatically pets. Sometimes the most responsible care decision is release.”</p>','Exotic Vet');
  }
}
function releaseFrog(){
  if(state.story<16) return dialog('Not yet','<p>Before release, complete the health-check part of the storyline.</p>');
  if(state.petHealth<65||state.petWater<45) return dialog('Not stable enough','<p>The frog should be stable, hydrated, and healthy before release.</p>');
  state.frogReleased=true;state.frogCaught=false;state.petStress=0;advance(17);dialog('Back where it belongs','<p>You release the frog near the pond and watch it disappear into cover. You learned more from one night of responsible care than you would have from rushing into buying a pet.</p><p>Now you can start planning a permanent terrarium the right way.</p>','Chapter complete');save();hud();
}

$$('[data-build]').forEach(btn=>{btn.onclick=()=>{
  const k=btn.dataset.build;if(state.built[k])return;
  if(k==='leaves'&&state.inv.leafLitter<1)return dialog('Need leaf litter','<p>Collect some dry leaf litter from the natural area first.</p>');
  if(k==='hide'&&state.inv.sticks<1&&state.story<12)return dialog('Need a hide material','<p>Collect a small stick or use a safe household item before buying anything.</p>');
  state.built[k]=true;
  if(k==='leaves')state.inv.leafLitter=Math.max(0,state.inv.leafLitter-1);
  if(k==='hide'&&state.inv.sticks>0)state.inv.sticks--;
  if(k==='water')state.petWater=clamp(state.petWater+12);
  state.petStress=clamp(state.petStress-4);
  const count=Object.keys(state.built).filter(x=>state.built[x]).length;
  if(currentStory().target==='build'&&count>=3)advance(6);
  save();hud();
};});
$$('[data-close-dialog]').forEach(b=>b.onclick=closeDialogs);
$('#settings-btn').onclick=()=>openDialog('#settings-dialog');
$('#restart-game').onclick=()=>{if(confirm('Restart the Update 0.0.7 storyline for this account?')){localStorage.removeItem(saveKey);location.reload();}};
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-story-action]');if(!a)return;
  if(a.dataset.storyAction==='catch'){closeDialogs();catchFrog();}
  if(a.dataset.storyAction==='home'){closeDialogs();enter('home');}
});

addEventListener('keydown',e=>{
  keys[e.code]=true;if(e.repeat)return;
  if(e.code==='KeyE')interact();
  if(e.code==='KeyB'&&state.zone==='home'&&state.habitatPlaced&&distXZ(5.8,453)<5)openDialog('#build-dialog');
  if(e.code==='KeyI')openDialog('#inventory-dialog');
  if(e.code==='Escape')closeDialogs();
  if(e.code==='Space'&&!paused&&onGround){vy=5.1;onGround=false;}
});
addEventListener('keyup',e=>{keys[e.code]=false;});
canvas.addEventListener('click',()=>{if(!paused&&canvas.requestPointerLock)canvas.requestPointerLock();});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.00215;pitch=clamp(pitch-e.movementY*.00155,-.18,.72);});
addEventListener('wheel',e=>{camDist=clamp(camDist+Math.sign(e.deltaY)*.7,4.8,14);},{passive:true});

function move(dt){
  if(paused)return;
  let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z--;if(keys.KeyS||keys.ArrowDown)z++;if(keys.KeyA||keys.ArrowLeft)x--;if(keys.KeyD||keys.ArrowRight)x++;
  const moving=x!==0||z!==0;const sprint=!!((keys.ShiftLeft||keys.ShiftRight)&&state.energy>3);
  if(moving){
    const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    const nx=player.position.x+v.x*dt*(sprint?8.2:5.2),nz=player.position.z+v.z*dt*(sprint?8.2:5.2);
    if(canMoveTo(nx,player.position.z))player.position.x=nx;
    if(canMoveTo(player.position.x,nz))player.position.z=nz;
    player.rotation.y=Math.atan2(v.x,v.z);walk+=dt*(sprint?10:7);
    const sw=Math.sin(walk)*(sprint ? .64 : .44);limbs.la.rotation.x=sw;limbs.ra.rotation.x=-sw;limbs.ll.rotation.x=-sw*.72;limbs.rl.rotation.x=sw*.72;
    if(sprint)state.energy=clamp(state.energy-dt*1.1);
  }else{
    limbs.la.rotation.x*=.82;limbs.ra.rotation.x*=.82;limbs.ll.rotation.x*=.82;limbs.rl.rotation.x*=.82;
  }
  vy-=13.5*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true;}
}
function updateNeeds(dt){
  if(paused)return;
  state.time+=dt*2.2;
  if(state.time>=1440){state.time-=1440;state.day++;state.ateToday=false;}
  state.hunger=clamp(state.hunger-dt*.035);state.energy=clamp(state.energy+dt*.018);
  if(state.frogCaught&&!state.frogReleased){
    state.petHunger=clamp(state.petHunger-dt*.012);
    state.petWater=clamp(state.petWater-dt*(state.built.water ? .005 : .013));
    state.petStress=clamp(state.petStress+dt*(state.habitatPlaced ? -.004 : .012));
    if(state.petWater<25||state.petHunger<18)state.petHealth=clamp(state.petHealth-dt*.025);
  }
  if(state.hunger<15)state.health=clamp(state.health-dt*.01);
}
function updateLighting(){
  const t=(state.time%1440)/1440;
  const daylight=Math.max(.12,Math.sin((t-.25)*Math.PI*2)*.5+.5);
  sun.intensity=.45+2.4*daylight;hemi.intensity=.35+1.0*daylight;
  scene.background.setHSL(.56,.35,.16+.5*daylight);scene.fog.color.copy(scene.background);
  sun.position.x=Math.cos(t*Math.PI*2)*70;sun.position.y=22+daylight*70;
}
function resize(){
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),pr=renderer.getPixelRatio();
  if(canvas.width!==Math.floor(w*pr)||canvas.height!==Math.floor(h*pr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
}
function updateCamera(){
  const target=player.position.clone().add(new THREE.Vector3(0,1.5,0));
  const off=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*camDist,2.1+Math.sin(pitch)*camDist,Math.cos(yaw)*Math.cos(pitch)*camDist);
  camera.position.lerp(target.clone().add(off),.16);camera.lookAt(target);
}
let hudTimer=0;
function loop(t){
  const dt=Math.min(.05,(t-last)/1000);last=t;resize();move(dt);updateNeeds(dt);updateLighting();detect();updateCamera();renderer.render(scene,camera);
  hudTimer+=dt;if(hudTimer>.2){hudTimer=0;hud();}
  requestAnimationFrame(loop);
}

startButton.disabled=false;startButton.textContent='Start Update 0.0.7';
startButton.onclick=()=>{
  paused=false;welcome.hidden=true;showChapterIfChanged();if(state.story===0)hud();save();setTimeout(()=>{if(canvas.requestPointerLock)canvas.requestPointerLock();},120);
};

player.position.copy(zones.outside);hud();requestAnimationFrame(loop);window.dispatchEvent(new Event('tb3d-ready'));
resolveUser().then(name=>{
  state.username=name;saveKey='tb3d-v7-'+name.toLowerCase();load();state.username=name;player.position.copy(zones[state.zone]||zones.outside);
  $('#welcome-name').textContent='Welcome, '+name+'.';hud();
});
setInterval(()=>{if(!paused)save();},30000);

})(THREE);
