/* TerrariumBuilds 3D – Update 0.0.7 Realism Revamp R2 */
(function(THREE){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const canvas=$('#game'),start=$('#start-game'),welcome=$('#welcome'),banner=$('#chapter-banner');
if(!canvas||!start||!welcome)throw new Error('TerrariumBuilds game UI missing');
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){start.disabled=true;start.textContent='3D unavailable';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xaecddd);scene.fog=new THREE.Fog(0xaecddd,110,310);
const camera=new THREE.PerspectiveCamera(64,1,.08,600);
const hemi=new THREE.HemisphereLight(0xf4f9ff,0x5b654d,1.35);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffefd2,2.45);sun.position.set(60,80,30);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-120;sun.shadow.camera.right=120;sun.shadow.camera.top=120;sun.shadow.camera.bottom=-120;scene.add(sun);

function texture(base,spots,lines){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<(spots||120);i++){const v=30+Math.random()*35;x.fillStyle=`rgba(${v},${v},${v},${.025+Math.random()*.04})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*4,1+Math.random()*4);}if(lines){x.strokeStyle='rgba(40,30,20,.12)';x.lineWidth=2;for(let i=0;i<12;i++){x.beginPath();x.moveTo(0,i*22+Math.random()*4);x.lineTo(256,i*22+Math.random()*4);x.stroke();}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);t.colorSpace=THREE.SRGBColorSpace;return t;}
const mats={
 grass:new THREE.MeshStandardMaterial({map:texture('#718f5f',200,false),roughness:1}),road:new THREE.MeshStandardMaterial({map:texture('#525657',240,false),roughness:.98}),walk:new THREE.MeshStandardMaterial({map:texture('#c9cbc6',80,false),roughness:1}),
 wall:new THREE.MeshStandardMaterial({map:texture('#e9e0d2',55,false),roughness:.96}),wood:new THREE.MeshStandardMaterial({map:texture('#8a694a',80,true),roughness:.9}),darkWood:new THREE.MeshStandardMaterial({color:0x5a4432,roughness:.9}),cabinet:new THREE.MeshStandardMaterial({map:texture('#d8d0bf',45,false),roughness:.88}),tile:new THREE.MeshStandardMaterial({map:texture('#d7d4cb',45,true),roughness:.95}),metal:new THREE.MeshStandardMaterial({color:0x7e8485,metalness:.35,roughness:.55}),black:new THREE.MeshStandardMaterial({color:0x202426,roughness:.6}),glass:new THREE.MeshPhysicalMaterial({color:0xbfdde8,transparent:true,opacity:.34,roughness:.12}),leaf:new THREE.MeshStandardMaterial({color:0x4d7042,roughness:1}),soil:new THREE.MeshStandardMaterial({color:0x5a402e,roughness:1}),water:new THREE.MeshPhysicalMaterial({color:0x6eaec4,transparent:true,opacity:.72,roughness:.18})};
const material=v=>v&&v.isMaterial?v:new THREE.MeshStandardMaterial({color:v,roughness:.9});
function box(x,y,z,w,h,d,m,p=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(m));o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function plane(x,y,z,w,d,m,p=scene){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material(m));o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;p.add(o);return o;}
function sphere(x,y,z,r,m,p=scene){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),material(m));o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;}
function cyl(x,y,z,r,h,m,p=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),material(m));o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;}
function textSign(text,x,y,z,w=8){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#f4f1e8';q.fillRect(0,0,512,128);q.fillStyle='#183a29';q.font='700 38px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.25),new THREE.MeshBasicMaterial({map:t}));o.position.set(x,y,z);scene.add(o);return o;}

// World
plane(0,0,0,430,430,mats.grass);plane(0,.01,0,285,15,mats.road);plane(0,.011,-88,285,13,mats.road);plane(88,.012,0,13,285,mats.road);plane(-88,.012,0,13,285,mats.road);plane(0,.012,88,285,13,mats.road);
for(const z of [-11,11,-78,-98,78,98])plane(0,.022,z,285,4,mats.walk);for(const x of [-11,11,78,98,-78,-98])plane(x,.023,0,4,285,mats.walk);
function tree(x,z,s=1){cyl(x,2*s,z,.27*s,4*s,0x6a4e35);sphere(x,4.7*s,z,1.7*s,mats.leaf);sphere(x-.8*s,4.15*s,z+.35*s,1.05*s,0x45633b);sphere(x+.8*s,4.25*s,z-.3*s,1.05*s,0x55784a);}for(const p of [[-130,-125],[130,-120],[-130,120],[128,110],[-125,45],[130,30],[42,128],[-35,130]])tree(p[0],p[1],1.1);
for(let i=-5;i<=5;i++){cyl(i*22,2.2,-15,.08,4.4,mats.black);box(i*22,4.42,-15,.42,.16,.42,0xf2dda4);cyl(i*22,2.2,15,.08,4.4,mats.black);box(i*22,4.42,15,.42,.16,.42,0xf2dda4);}

// Moving traffic
function makeCar(color){const g=new THREE.Group();scene.add(g);box(0,.28,0,4.4,1.0,2,color,g);box(.1,1.22,0,2.55,.72,1.75,color,g);box(-.38,1.33,-.9,.8,.5,.05,mats.glass,g);box(.68,1.33,-.9,.8,.5,.05,mats.glass,g);const wheels=[];for(const sx of [-1.45,1.45])for(const sz of [-1.02,1.02]){const w=cyl(sx,.42,sz,.37,.24,mats.black,g);w.rotation.z=Math.PI/2;wheels.push(w);}box(-2.22,.6,-.62,.08,.25,.35,0xfff0b5,g);box(-2.22,.6,.62,.08,.25,.35,0xfff0b5,g);return {g,wheels};}
const routes=[[[ -120,-4],[120,-4],[120,84],[-120,84]],[[120,4],[-120,4],[-120,-84],[120,-84]],[[84,-120],[84,120],[-84,120],[-84,-120]]];
const traffic=[{...makeCar(0x5e7385),route:0,u:.05,s:9.5},{...makeCar(0x9b594b),route:1,u:.42,s:8.2},{...makeCar(0x7a7d68),route:2,u:.69,s:10.2}];
function routePoint(route,u){const pts=routes[route],n=pts.length;const f=(u%1)*n,i=Math.floor(f),t=f-i,a=pts[i],b=pts[(i+1)%n];return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,ang:Math.atan2(b[0]-a[0],b[1]-a[1])};}
function updateCars(dt){for(const c of traffic){c.u=(c.u+dt*c.s/900)%1;const p=routePoint(c.route,c.u);c.g.position.set(p.x,0,p.z);c.g.rotation.y=p.ang;for(const w of c.wheels)w.rotation.x-=dt*c.s*2.2;}}

// Detailed walk-in house at -56,-55
const HX=-56,HZ=-55,HW=29,HD=25;plane(HX,.035,HZ,HW,HD,mats.wood);
// walls, leaving front doorway gap
box(HX-HW/2,0,HZ,.28,5.2,HD,mats.wall);box(HX+HW/2,0,HZ,.28,5.2,HD,mats.wall);box(HX,0,HZ-HD/2,HW,5.2,.28,mats.wall);
box(HX-8.0,0,HZ+HD/2,HW/2-2.1,5.2,.28,mats.wall);box(HX+8.0,0,HZ+HD/2,HW/2-2.1,5.2,.28,mats.wall);box(HX,3.1,HZ+HD/2,4.0,2.1,.28,mats.wall);
// roof trim + windows
box(HX,5.15,HZ,HW+.7,.55,HD+.7,0x524b43);box(HX-8.5,1.4,HZ+HD/2+.08,4.0,2.2,.06,mats.glass);box(HX+8.5,1.4,HZ+HD/2+.08,4.0,2.2,.06,mats.glass);textSign('YOUR HOUSE',HX,4.35,HZ+HD/2+.18,7.5);
// hinged front door
const frontDoorPivot=new THREE.Group();frontDoorPivot.position.set(HX-1.9,0,HZ+HD/2+.05);scene.add(frontDoorPivot);const frontDoor=box(1.9,0,0,3.8,3.1,.18,0x4d5f51,frontDoorPivot);let doorOpen=0;
// interior partitions / rooms
box(HX-2,0,HZ-2,13,.16,.18,0xe9e4d9);box(HX+5.8,0,HZ-2,.18,3.9,11,mats.wall);box(HX+5.8,0,HZ+6,.18,3.9,5,mats.wall);
// living room
box(HX-8.5,.12,HZ+4.0,6.8,.72,3.0,0x76675e);box(HX-8.5,.84,HZ+5.05,6.8,1.1,.35,0x695a52);box(HX-4.7,.12,HZ+4.0,2.4,.45,1.3,mats.darkWood);box(HX-11,.2,HZ-2.8,5.3,.65,1.4,mats.darkWood);box(HX-11,1.0,HZ-2.85,4.4,2.2,.16,mats.black);
// dining
box(HX-2,.12,HZ-5.0,6.1,.9,3.1,mats.darkWood);for(const p of [[HX-4.2,HZ-5],[HX+.2,HZ-5],[HX-2,HZ-7],[HX-2,HZ-3]])box(p[0],.1,p[1],1.2,.8,1.2,0x765a43);
// kitchen cabinets and counters along back wall
for(let i=0;i<5;i++)box(HX+8+i*1.05,.08,HZ-10.4,1.0,2.15,2.0,mats.cabinet);box(HX+8,.08,HZ-8.8,7.0,.95,2.0,0xb8a688);box(HX+8,1.08,HZ-8.9,7.0,.12,2.0,0xd7d0c4);box(HX+11.5,.08,HZ-4.5,2.7,3.3,2.6,0xd9dcda);box(HX+6.2,1.2,HZ-8.8,1.6,.14,1.1,mats.metal);
// actual Tupperware inside lower cabinet with animated cabinet door
const CABX=HX+7.0,CABZ=HZ-9.6;const cabinetPivot=new THREE.Group();cabinetPivot.position.set(CABX-.6,.15,CABZ+1.05);scene.add(cabinetPivot);const cabinetDoor=box(.6,0,0,1.2,1.5,.10,mats.cabinet,cabinetPivot);let cabinetOpen=0;
const tubProp=new THREE.Group();tubProp.position.set(CABX,.45,CABZ+.15);scene.add(tubProp);box(0,0,0,1.55,.48,1.0,mats.glass,tubProp);box(0,.5,0,1.67,.11,1.1,0xb8d6de,tubProp);
// bedroom + bathroom
box(HX+8.4,.12,HZ+6.7,6.5,.58,4.1,0x7c6853);box(HX+8.4,.7,HZ+8.05,6.5,1.05,.35,0x6b5847);box(HX+11.8,.1,HZ+2.2,2.2,.5,1.5,mats.darkWood);box(HX+8.6,.05,HZ+1.8,3.4,.12,2.2,0xd8d1c6);box(HX+11.5,.1,HZ+1.1,1.7,1.2,1.4,0xf0efeb);cyl(HX+11.5,1.35,HZ+1.1,.8,.12,mats.metal);
// interior lamps
for(const p of [[HX-8,HZ+2],[HX-2,HZ-5],[HX+8,HZ-6],[HX+8,HZ+6]]){cyl(p[0],3.7,p[1],.04,.7,mats.black);sphere(p[0],3.3,p[1],.28,0xffe8a9);}

// Other buildings still use interiors/teleport
const B={petshop:{x:48,z:-55,label:'Pet + Habitat'},hardware:{x:111,z:-55,label:'Hardware + Garden'},diner:{x:47,z:52,label:'Willow Diner'},market:{x:109,z:52,label:'Town Market'},vet:{x:-49,z:53,label:'Exotic Vet'}};
function simpleBuilding(k,c,r){const b=B[k];box(b.x,0,b.z,30,5.7,21,c);box(b.x,5.7,b.z,31,.6,22,r);box(b.x,0,b.z+10.6,2.2,2.9,.18,0x4c5b51);box(b.x-8,1.5,b.z+10.7,4,2.2,.06,mats.glass);box(b.x+8,1.5,b.z+10.7,4,2.2,.06,mats.glass);textSign(b.label,b.x,4.4,b.z+10.8,9);}simpleBuilding('petshop',0xb8c9af,0x415941);simpleBuilding('hardware',0xc3b491,0x5b5445);simpleBuilding('diner',0xc88d78,0x704838);simpleBuilding('market',0xcfd4cf,0x48555a);simpleBuilding('vet',0xc3ccd8,0x4a596c);
const zonePos={petshop:new THREE.Vector3(92,0,430),hardware:new THREE.Vector3(184,0,430),diner:new THREE.Vector3(276,0,430),market:new THREE.Vector3(368,0,430),vet:new THREE.Vector3(460,0,430)};
const centers={petshop:92,hardware:184,diner:276,market:368,vet:460};
function room(cx,floor=0xd1cec4){plane(cx,.03,445,42,34,floor);box(cx-21,0,445,.28,4.8,34,mats.wall);box(cx+21,0,445,.28,4.8,34,mats.wall);box(cx,0,428,42,4.8,.28,mats.wall);box(cx,0,462,42,4.8,.28,mats.wall);}for(const c of Object.values(centers))room(c);
function shelf(cx,z,col){box(cx,.1,z,6.3,3,.85,mats.darkWood);for(let y=.7;y<2.8;y+=.7)box(cx,y,z,6.3,.10,1.05,0x92775d);for(let x=-2.2;x<=2.2;x+=1.1)for(let y=.85;y<2.5;y+=.7)box(cx+x,y,z-.55,.5,.4,.38,col);}for(const z of [438,446,454]){shelf(92,z,0x77966f);shelf(184,z,0xb58a54);shelf(368,z,0x82919a);}for(const cx of [92,184,276,368,460]){box(cx,.1,458,8,1.0,2,mats.darkWood);box(cx,1.15,457.7,1.2,.6,.7,mats.black);}
function npc(x,z,name,c){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(0,1.0,0,.9,1.1,.5,c,g);sphere(0,2.32,0,.35,0xd1a17c,g);cyl(-.25,.56,0,.13,.88,c,g);cyl(.25,.56,0,.13,.88,c,g);return{name,obj:g};}const npcs={maya:npc(92,455,'Maya',0x567d60),sam:npc(184,455,'Sam',0x846b4d),eli:npc(276,455,'Eli',0x9c5e50),nora:npc(368,455,'Nora',0x6b7a70),drlee:npc(460,455,'Dr. Lee',0x647a8c)};

// Pond and gatherables
plane(-128,.025,98,44,30,mats.soil);plane(-128,.04,98,27,17,mats.water);for(let i=0;i<12;i++)tree(-149+Math.random()*42,78+Math.random()*42,.7+Math.random()*.3);
const gather=[];function gatherProp(type,x,z,label,col){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);if(type==='bugs'){sphere(0,.1,0,.13,col,g);sphere(.17,.08,.02,.07,col,g);}else for(let i=0;i<6;i++){const p=box((Math.random()-.5)*1.4,.04,(Math.random()-.5)*1.1,type==='sticks'?1:.45,.05,.18,col,g);p.rotation.y=Math.random()*Math.PI;}gather.push({type,obj:g,label,collected:false});}gatherProp('leafLitter',-116,88,'collect leaf litter',0x7c603a);gatherProp('sticks',-140,108,'collect a safe stick',0x6b4e34);gatherProp('bugs',-122,115,'collect feeder insects',0x343029);

// Player
const player=new THREE.Group();scene.add(player);const skin=material(0xd2a07b),shirt=material(0x315f49),pants=material(0x3d4852);box(0,1.0,0,.88,.45,.5,pants,player);box(0,1.38,0,1.02,1.08,.52,shirt,player);sphere(0,2.46,0,.38,skin,player);sphere(0,2.64,.03,.39,0x2b221e,player);const limbs={la:new THREE.Group(),ra:new THREE.Group(),ll:new THREE.Group(),rl:new THREE.Group()};limbs.la.position.set(-.62,1.88,0);limbs.ra.position.set(.62,1.88,0);limbs.ll.position.set(-.24,1.05,0);limbs.rl.position.set(.24,1.05,0);player.add(limbs.la,limbs.ra,limbs.ll,limbs.rl);for(const g of [limbs.la,limbs.ra])cyl(0,-.44,0,.15,.88,shirt,g);for(const g of [limbs.ll,limbs.rl])cyl(0,-.56,0,.17,1.08,pants,g);
const frog=new THREE.Group();frog.position.set(-43,.12,-31);scene.add(frog);sphere(0,.24,0,.4,0x63804b,frog);sphere(-.23,.44,-.18,.14,0x708d56,frog);sphere(.23,.44,-.18,.14,0x708d56,frog);
const habitat=new THREE.Group();habitat.position.set(HX-2,1.0,HZ-5);scene.add(habitat);habitat.visible=false;box(0,0,0,4.0,1.45,2.7,mats.glass,habitat);const hsoil=box(0,.05,0,3.65,.27,2.35,mats.soil,habitat);hsoil.visible=false;const hdish=cyl(-1,.2,-.5,.4,.12,mats.water,habitat);hdish.visible=false;const hhide=cyl(.7,.42,.1,.42,1.25,mats.wood,habitat);hhide.rotation.z=Math.PI/2;hhide.visible=false;const hleaves=new THREE.Group();habitat.add(hleaves);hleaves.visible=false;for(let i=0;i<9;i++)box(-1.1+Math.random()*2.2,.28,-.7+Math.random()*1.4,.4,.04,.18,0x765632,hleaves);

const BASE={version:72,username:'Guest',story:0,chapter:1,zone:'outside',day:1,time:540,health:100,hunger:92,energy:96,coins:0,coinsUnlocked:false,frogCaught:false,frogReleased:false,hasTub:false,cabinetOpened:false,habitatPlaced:false,firstNight:false,jobDone:false,vetVisit:false,petHealth:100,petHunger:90,petWater:86,petStress:18,inv:{leafLitter:0,sticks:0,bugs:0,food:0},built:{soil:false,leaves:false,water:false,hide:false}};
let state=JSON.parse(JSON.stringify(BASE)),saveKey='tb3d-v7r2-guest',paused=true,near=null,yaw=.18,pitch=.18,camDist=8.3,vy=0,onGround=true,last=performance.now(),walk=0;const keys={};
function load(){try{const s=JSON.parse(localStorage.getItem(saveKey)||'null');if(s&&s.version===72){state=Object.assign(JSON.parse(JSON.stringify(BASE)),s);state.inv=Object.assign({},BASE.inv,s.inv||{});state.built=Object.assign({},BASE.built,s.built||{});}}catch{}}
function save(){try{localStorage.setItem(saveKey,JSON.stringify(state));$('#save-state').textContent='Saved';setTimeout(()=>$('#save-state').textContent='Autosave on',800);}catch{}}
async function user(){const c=new AbortController(),t=setTimeout(()=>c.abort(),1600);try{const r=await fetch('/api/terrarium?action=session',{credentials:'same-origin',signal:c.signal}),d=await r.json();return d&&d.user&&d.user.username?d.user.username:'Guest';}catch{return'Guest';}finally{clearTimeout(t);}}

const STORY=[
['Something in the yard','Walk out across the front lawn toward the frog. Look for the green frog just left of the walkway, then press E when the prompt appears.','frog',1],
['A careful catch','Stand beside the frog and press E. Move slowly; you only need to get within a few steps.','frog',1],
['Go inside the house','Turn toward YOUR HOUSE. Walk straight up the front path. The front door opens automatically when you approach—walk through it instead of teleporting.','house',1],
['Find the Tupperware','Inside the house, go right into the kitchen. Walk to the LOWER CABINET by the back counter and press E to open it.','cabinet',1],
['Take the container','The cabinet is open. Look inside and press E again to take the clean Tupperware.','tub',1],
['Set up at the dining table','Walk left from the kitchen to the dining table. Press E beside the table to place the Tupperware.','table',1],
['Gather natural materials','Go back through the front door, then follow the streets toward the pond in the far-left/north area. Collect leaf litter and a safe stick with E.','gather',1],
['Build the temporary habitat','Return home, stand beside the Tupperware on the dining table, then press E or B. Add at least three habitat essentials.','build',1],
['Find food','Return to the pond and collect feeder insects. Bring them back for the frog.','bugs',1],
['First night','Go to the bedroom on the right side of the house. Stand by the bed and press E once the habitat is ready.','sleep',1],
['Morning care check','Go back to the dining table and inspect the habitat with E before leaving the house.','habitat',2],
['Get experienced advice','Go outside and visit PET + HABITAT across town. Walk to Maya at the register and press E.','maya',2],
['Earn your first coins','Return to your house and check the mailbox beside the front path. Press E to complete the cleanup job.','mailbox',2],
['Buy proper basics','Visit HARDWARE + GARDEN. Talk to Sam at the register to buy safer substrate and a hide.','sam',2],
['Take care of yourself','Visit WILLOW DINER. Walk to Eli at the register and order a meal.','eli',3],
['Get a health check','Visit EXOTIC VET and talk to Dr. Lee about the frog.','drlee',3],
['Return to the pond','Bring the frog back to the pond area. If it is healthy, press E near the water to release it.','release',3],
['Plan a permanent terrarium','Go back to PET + HABITAT and talk to Maya about a permanent animal and proper enclosure planning.','maya2',4],
['Town life begins','Explore the town, keep your own hunger and energy up, and prepare for the permanent-pet storyline.','free',4]
];
const cur=()=>STORY[Math.min(state.story,STORY.length-1)];function advance(n){state.story=typeof n==='number'?Math.max(state.story,n):Math.min(state.story+1,STORY.length-1);state.chapter=cur()[3];save();hud();showChapter();}
let shown=0;function showChapter(){if(shown===state.chapter)return;shown=state.chapter;$('#chapter-banner-label').textContent='Chapter '+state.chapter;$('#chapter-banner-title').textContent=['','The frog in the yard','Learning the responsibility','Life beyond the terrarium','A permanent future'][state.chapter];banner.hidden=false;setTimeout(()=>banner.hidden=true,2800);}
function formatTime(v){let m=Math.floor(v)%1440,h=Math.floor(m/60),mm=m%60,ap=h>=12?'PM':'AM';h%=12;if(!h)h=12;return h+':'+String(mm).padStart(2,'0')+' '+ap;}
function objectiveDistance(){const t=cur()[2];let p=null;if(t==='frog')p={x:-43,z:-31};if(t==='house'||t==='cabinet'||t==='tub'||t==='table'||t==='build'||t==='sleep'||t==='habitat'||t==='mailbox')p={x:HX,z:HZ+HD/2};if(t==='gather'||t==='bugs'||t==='release')p={x:-128,z:98};if(t==='maya'||t==='maya2')p={x:48,z:-44};if(t==='sam')p={x:111,z:-44};if(t==='eli')p={x:47,z:63};if(t==='drlee')p={x:-49,z:64};return p&&state.zone==='outside'?Math.round(Math.hypot(player.position.x-p.x,player.position.z-p.z)):null;}
function hud(){const s=cur();$('#story-chapter').textContent='Story · Chapter '+s[3];$('#objective-title').textContent=s[0];const d=objectiveDistance();$('#objective-text').textContent=s[1]+(d!=null?' · About '+d+'m away.':'');$('#story-progress').innerHTML=STORY.map((_,i)=>'<i class="'+(i<=state.story?'done':'')+'"></i>').join('');$('#profile-chip').textContent=state.username;$('#settings-user').textContent=state.username;$('#health').textContent=Math.round(state.health)+'%';$('#hunger').textContent=Math.round(state.hunger)+'%';$('#energy').textContent=Math.round(state.energy)+'%';$('#clock').textContent='Day '+state.day+' · '+formatTime(state.time);$('#day-chip').textContent='Day '+state.day;$('#weather-chip').textContent='Clear';$('#coin-cell').hidden=!state.coinsUnlocked;$('#coins').textContent=Math.floor(state.coins);$('#pet-card').hidden=!state.frogCaught||state.frogReleased;$('#ph').textContent=Math.round(state.petHunger)+'%';$('#pw').textContent=Math.round(state.petWater)+'%';$('#ps').textContent=Math.round(state.petStress)+'%';$('#ph-bar').style.width=state.petHunger+'%';$('#pw-bar').style.width=state.petWater+'%';$('#ps-bar').style.width=(100-state.petStress)+'%';frog.visible=!state.frogCaught&&!state.frogReleased;tubProp.visible=!state.hasTub&&cabinetOpen>.65;habitat.visible=state.habitatPlaced&&!state.frogReleased;hsoil.visible=state.built.soil;hleaves.visible=state.built.leaves;hdish.visible=state.built.water;hhide.visible=state.built.hide;renderInventory();renderBuild();}
function renderInventory(){const e=[['🐸','Frog',state.frogCaught&&!state.frogReleased?'In your care':state.frogReleased?'Released':'Outside'],['🥣','Tupperware',state.hasTub?'Owned':'Kitchen cabinet'],['🍂','Leaf litter',state.inv.leafLitter+''],['🪵','Sticks',state.inv.sticks+''],['🪲','Feeder insects',state.inv.bugs+''],['🪙','Coins',Math.floor(state.coins)+'']];$('#inventory-grid').innerHTML=e.map(x=>'<div><span>'+x[0]+'</span><b>'+x[1]+'</b><small>'+x[2]+'</small></div>').join('');}
function renderBuild(){const n=Object.values(state.built).filter(Boolean).length;$('#build-score').textContent='Habitat readiness: '+n+'/4';$$('[data-build]').forEach(b=>b.classList.toggle('done',!!state.built[b.dataset.build]));}
function dialog(title,body,ey='Story'){$('#dialog-eyebrow').textContent=ey;$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;openDialog('#story-dialog');}
function openDialog(id){$$('.dialog').forEach(x=>x.hidden=true);$(id).hidden=false;paused=true;document.exitPointerLock&&document.exitPointerLock();}function closeDialogs(){$$('.dialog').forEach(x=>x.hidden=true);if(welcome.hidden)paused=false;}
function insideHouse(){return player.position.x>HX-HW/2+.7&&player.position.x<HX+HW/2-.7&&player.position.z>HZ-HD/2+.7&&player.position.z<HZ+HD/2-.25;}
function dist(x,z){return Math.hypot(player.position.x-x,player.position.z-z);}
function enterStore(zone){state.zone=zone;player.position.copy(zonePos[zone]);$('#location').textContent={petshop:'Pet + Habitat',hardware:'Hardware + Garden',diner:'Willow Diner',market:'Town Market',vet:'Exotic Vet'}[zone];save();}
function exitStore(){state.zone='outside';player.position.set(B[state.prevStore||'petshop'].x,0,B[state.prevStore||'petshop'].z+13.2);$('#location').textContent='Home neighborhood';save();}
function detect(){near=null;const nowInside=insideHouse();if(state.zone==='outside'&&nowInside){state.zone='home';$('#location').textContent='Inside your house';save();}else if(state.zone==='home'&&!nowInside){state.zone='outside';$('#location').textContent='Home neighborhood';save();}
 if(state.zone==='outside'||state.zone==='home'){
  if(state.zone==='outside'&&!state.frogCaught&&!state.frogReleased&&dist(-43,-31)<2.7)near={type:'frog',label:'E · carefully inspect / catch frog'};
  if(state.zone==='home'){
   if(!state.cabinetOpened&&dist(CABX,CABZ+1.2)<2.4)near={type:'cabinet',label:'E · open lower kitchen cabinet'};
   else if(state.cabinetOpened&&!state.hasTub&&dist(CABX,CABZ+.2)<2.4)near={type:'tub',label:'E · take clean Tupperware from cabinet'};
   if(state.hasTub&&!state.habitatPlaced&&dist(HX-2,HZ-5)<3.5)near={type:'place',label:'E · place Tupperware on dining table'};
   if(state.habitatPlaced&&dist(HX-2,HZ-5)<4)near={type:'habitat',label:'E · inspect habitat · B build'};
   if(dist(HX+8.4,HZ+6.7)<3.2)near={type:'sleep',label:'E · sleep / end day'};
  }
  if(state.zone==='outside'){
   for(const [k,b] of Object.entries(B)){if(dist(b.x,b.z+12.0)<4.2)near={type:'store',zone:k,label:'E · enter '+b.label};}
   for(const g of gather)if(!g.collected&&g.obj.visible&&dist(g.obj.position.x,g.obj.position.z)<2.8)near={type:'gather',item:g,label:'E · '+g.label};
   if(dist(HX-11,HZ+16)<2.8)near={type:'mailbox',label:'E · check mailbox / neighborhood task'};
   if(state.frogCaught&&!state.frogReleased&&dist(-128,98)<8)near={type:'release',label:'E · release frog near pond'};
  }
 }else{
  const cx=centers[state.zone];if(dist(cx,430)<3.2)near={type:'exit',label:'E · leave building'};const reg={petshop:[92,455,'maya'],hardware:[184,455,'sam'],diner:[276,455,'eli'],market:[368,455,'nora'],vet:[460,455,'drlee']}[state.zone];if(reg&&dist(reg[0],reg[1])<3.7)near={type:'npc',kind:reg[2],label:'E · talk to '+npcs[reg[2]].name};
 }
 $('#prompt').hidden=!near;if(near)$('#prompt').textContent=near.label;
}
function catchFrog(){state.frogCaught=true;state.petStress=30;advance(2);dialog('You carefully secure the frog','Now walk toward YOUR HOUSE. The front door will swing open when you get close. Keep walking through the doorway—there is no teleport into the house.');hud();}
function gatherItem(g){g.collected=true;g.obj.visible=false;state.inv[g.type]=(state.inv[g.type]||0)+1;if(cur()[2]==='gather'&&state.inv.leafLitter>0&&state.inv.sticks>0)advance(7);if(cur()[2]==='bugs'&&state.inv.bugs>0){state.petHunger=clamp(state.petHunger+18);advance(9);}dialog('Collected',g.type==='bugs'?'You found a small amount of feeder insects. Return home when ready.':'You collected only what you need.','Field note');hud();}
function interact(){if(paused||!near)return;const n=near;
 if(n.type==='frog'){if(state.story===0){advance(1);dialog('A frog in the grass','The frog looks alert. Move slowly and avoid grabbing a leg.<button class="primary" data-action="catch">Carefully catch it</button>');}else catchFrog();}
 else if(n.type==='cabinet'){state.cabinetOpened=true;if(state.story<4)advance(4);dialog('Cabinet opened','The Tupperware is actually inside the lower cabinet now. Look down into the cabinet and press E again to take it.');hud();}
 else if(n.type==='tub'){state.hasTub=true;if(state.story<5)advance(5);dialog('Clean temporary container','You take the clean Tupperware from the cabinet. Next: walk to the dining table and place it there.');hud();}
 else if(n.type==='place'){state.habitatPlaced=true;if(state.story<6)advance(6);dialog('Temporary setup started','The container is on the dining table. Go gather leaf litter and a safe stick near the pond before building.');hud();}
 else if(n.type==='habitat'){if(state.story===10){advance(11);dialog('Morning care check','The frog is alert and hydrated. Now get advice from Maya at Pet + Habitat.');}else openDialog('#build-dialog');}
 else if(n.type==='sleep'){const r=Object.values(state.built).filter(Boolean).length;if(state.story<9||r<3)return dialog('Not ready yet','Finish at least three habitat essentials and collect feeder insects before sleeping.');state.day++;state.time=420;state.energy=100;state.hunger=78;state.firstNight=true;state.petStress=clamp(state.petStress-12);advance(10);dialog('Morning','Morning light fills the house. Go back to the dining table and inspect the frog first.');}
 else if(n.type==='store'){state.prevStore=n.zone;enterStore(n.zone);}
 else if(n.type==='exit')exitStore();
 else if(n.type==='gather')gatherItem(n.item);
 else if(n.type==='mailbox'){if(state.story<12)return dialog('Mailbox','A neighbor left a note asking for help clearing leaves and sticks. Finish the advice step first.');if(!state.jobDone){state.jobDone=true;state.coinsUnlocked=true;state.coins+=28;advance(13);dialog('Neighborhood job complete','You earn 28 coins. Next, go to Hardware + Garden for better enclosure basics.');}else dialog('Mailbox','No new task right now.');hud();}
 else if(n.type==='npc')talk(n.kind);
 else if(n.type==='release'){if(state.story<16)return dialog('Not yet','Complete the vet check first.');state.frogReleased=true;state.frogCaught=false;advance(17);dialog('Back where it belongs','You release the healthy wild frog near the pond. Now you can plan a permanent terrarium responsibly.');hud();}
}
function talk(k){if(k==='maya'){if(state.story===11){advance(12);dialog('Maya · Pet + Habitat','A temporary tub is only an emergency setup. Maya tells you to earn a little money, improve the enclosure basics, and get a health check before deciding what happens next.');}else if(state.story>=17){advance(18);dialog('Maya · Permanent terrarium planning','Maya walks you through enclosure size, ventilation, humidity, temperature, diet, hides, maintenance, and why you should build the habitat before bringing home an animal.');}else dialog('Maya','Build around the animal’s needs, not around what looks cool on a shelf.');}
 if(k==='sam'){if(state.story===13){if(state.coins<18)return dialog('Sam','You need 18 coins.');state.coins-=18;state.built.soil=true;state.built.hide=true;advance(14);dialog('Supplies purchased','You buy clean substrate and a secure hide.');}else dialog('Sam','Think about safety, moisture, cleaning, and sharp edges.');}
 if(k==='eli'){if(state.story===14){if(state.coins<7)return dialog('Eli','A meal costs 7 coins.');state.coins-=7;state.hunger=clamp(state.hunger+48);advance(15);dialog('Meal ordered','You order at the register, pay, and eat. Your own needs matter too.');}else dialog('Eli','Counter service: order, pay, grab a seat.');}
 if(k==='drlee'){if(state.story===15){state.vetVisit=true;state.petHealth=100;state.petStress=clamp(state.petStress-8);advance(16);dialog('Dr. Lee · Exotic Vet','The frog appears healthy. Because it is wild, the responsible outcome is release near where it was found.');}else dialog('Dr. Lee','Wild animals are not automatically pets.');}
 if(k==='nora')dialog('Nora · Town Market','The market will become part of groceries, cooking, and household-life chapters.');hud();}

$$('[data-build]').forEach(b=>b.onclick=()=>{const k=b.dataset.build;if(state.built[k])return;if(k==='leaves'&&state.inv.leafLitter<1)return dialog('Need leaf litter','Collect leaf litter near the pond first.');if(k==='hide'&&state.inv.sticks<1&&state.story<13)return dialog('Need a hide material','Collect a safe stick near the pond first.');state.built[k]=true;if(k==='leaves')state.inv.leafLitter--;if(k==='hide'&&state.inv.sticks>0)state.inv.sticks--;if(k==='water')state.petWater=clamp(state.petWater+12);state.petStress=clamp(state.petStress-4);if(cur()[2]==='build'&&Object.values(state.built).filter(Boolean).length>=3)advance(8);save();hud();});
$$('[data-close-dialog]').forEach(b=>b.onclick=closeDialogs);$('#settings-btn').onclick=()=>openDialog('#settings-dialog');$('#restart-game').onclick=()=>{if(confirm('Restart Update 0.0.7 revamp?')){localStorage.removeItem(saveKey);location.reload();}};document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(a&&a.dataset.action==='catch'){closeDialogs();catchFrog();}});
addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyB'&&state.zone==='home'&&state.habitatPlaced&&dist(HX-2,HZ-5)<5)openDialog('#build-dialog');if(e.code==='KeyI')openDialog('#inventory-dialog');if(e.code==='Escape')closeDialogs();if(e.code==='Space'&&!paused&&onGround){vy=5.2;onGround=false;}});addEventListener('keyup',e=>keys[e.code]=false);canvas.addEventListener('click',()=>{if(!paused&&canvas.requestPointerLock)canvas.requestPointerLock();});addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0016,-.18,.72);});addEventListener('wheel',e=>{camDist=clamp(camDist+Math.sign(e.deltaY)*.7,4.7,14);},{passive:true});

function canMove(nx,nz){if(state.zone!=='outside'&&state.zone!=='home'){const cx=centers[state.zone];return nx>cx-19.5&&nx<cx+19.5&&nz>429&&nz<461;}if(nx<-200||nx>200||nz<-200||nz>200)return false;return true;}
function move(dt){if(paused)return;let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z--;if(keys.KeyS||keys.ArrowDown)z++;if(keys.KeyA||keys.ArrowLeft)x--;if(keys.KeyD||keys.ArrowRight)x++;const moving=x||z,sprint=!!((keys.ShiftLeft||keys.ShiftRight)&&state.energy>2);if(moving){const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=sprint?11.8:5.5,nx=player.position.x+v.x*dt*speed,nz=player.position.z+v.z*dt*speed;if(canMove(nx,player.position.z))player.position.x=nx;if(canMove(player.position.x,nz))player.position.z=nz;player.rotation.y=Math.atan2(v.x,v.z);walk+=dt*(sprint?12:7);const sw=Math.sin(walk)*(sprint?.78:.45);limbs.la.rotation.x=sw;limbs.ra.rotation.x=-sw;limbs.ll.rotation.x=-sw*.75;limbs.rl.rotation.x=sw*.75;if(sprint)state.energy=clamp(state.energy-dt*1.35);}else{for(const g of Object.values(limbs))g.rotation.x*=.82;}vy-=13.5*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true;}}
function updateDoors(dt){const nearFront=dist(HX,HZ+HD/2+1)<5.0&&(state.zone==='outside'||state.zone==='home');const target=nearFront?1:0;doorOpen+=(target-doorOpen)*Math.min(1,dt*5.5);frontDoorPivot.rotation.y=-doorOpen*Math.PI*.52;const ct=state.cabinetOpened?1:0;cabinetOpen+=(ct-cabinetOpen)*Math.min(1,dt*6.5);cabinetPivot.rotation.y=-cabinetOpen*Math.PI*.52;}
function needs(dt){if(paused)return;state.time+=dt*2.2;if(state.time>=1440){state.time-=1440;state.day++;}state.hunger=clamp(state.hunger-dt*.035);state.energy=clamp(state.energy+dt*.02);if(state.frogCaught&&!state.frogReleased){state.petHunger=clamp(state.petHunger-dt*.012);state.petWater=clamp(state.petWater-dt*(state.built.water?.005:.013));state.petStress=clamp(state.petStress+dt*(state.habitatPlaced?-.004:.012));}}
function lighting(){const t=(state.time%1440)/1440,d=Math.max(.14,Math.sin((t-.25)*Math.PI*2)*.5+.5);sun.intensity=.4+2.35*d;hemi.intensity=.35+1.0*d;scene.background.setHSL(.56,.35,.16+.5*d);scene.fog.color.copy(scene.background);}
function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),pr=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*pr)||canvas.height!==Math.floor(h*pr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}
function cam(){const t=player.position.clone().add(new THREE.Vector3(0,1.5,0)),o=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*camDist,2.1+Math.sin(pitch)*camDist,Math.cos(yaw)*Math.cos(pitch)*camDist);camera.position.lerp(t.clone().add(o),.16);camera.lookAt(t);}
let ht=0;function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;resize();move(dt);updateDoors(dt);updateCars(dt);needs(dt);lighting();detect();cam();renderer.render(scene,camera);ht+=dt;if(ht>.18){ht=0;hud();}requestAnimationFrame(loop);}

start.disabled=false;start.textContent='Start Update 0.0.7';start.onclick=()=>{paused=false;welcome.hidden=true;showChapter();hud();save();setTimeout(()=>canvas.requestPointerLock&&canvas.requestPointerLock(),120);};
player.position.set(-49,0,-36);hud();requestAnimationFrame(loop);window.dispatchEvent(new Event('tb3d-ready'));user().then(name=>{state.username=name;saveKey='tb3d-v7r2-'+name.toLowerCase();load();state.username=name;if(state.zone==='home')player.position.set(HX,0,HZ+5);else if(zonePos[state.zone])player.position.copy(zonePos[state.zone]);$('#welcome-name').textContent='Welcome, '+name+'.';hud();});setInterval(()=>{if(!paused)save();},30000);
})(THREE);
