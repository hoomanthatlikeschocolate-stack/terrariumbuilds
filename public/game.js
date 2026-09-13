import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xb9d6ff);
scene.fog=new THREE.FogExp2(0xb9d6ff,.0036);
const camera=new THREE.PerspectiveCamera(62,1,.1,650);

function noiseTexture(base, fleck, density=1500, size=256, scale=1){
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
  g.fillStyle=base;g.fillRect(0,0,size,size);
  for(let i=0;i<density;i++){const a=Math.random()*.24+.04;g.globalAlpha=a;g.fillStyle=fleck;const s=(Math.random()*2.3+.5)*scale;g.fillRect(Math.random()*size,Math.random()*size,s,s)}
  g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}
function woodTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#74513a';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=9){g.strokeStyle=`rgba(46,25,14,${.08+Math.random()*.1})`;g.beginPath();g.moveTo(0,y+Math.random()*3);g.bezierCurveTo(80,y-5,170,y+8,256,y+Math.random()*4);g.stroke()}for(let i=0;i<24;i++){g.strokeStyle='rgba(35,18,8,.1)';g.beginPath();g.ellipse(Math.random()*256,Math.random()*256,5+Math.random()*12,2+Math.random()*4,0,0,Math.PI*2);g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
function brickTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#b57261';g.fillRect(0,0,256,256);g.strokeStyle='rgba(245,231,217,.7)';g.lineWidth=4;for(let y=0,row=0;y<256;y+=32,row++){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(row%2?32:0);x<256;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke()}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}

const TEX={grass:noiseTexture('#789e67','#4e7448',2100,256,1.5),asphalt:noiseTexture('#626663','#b8bbb5',2200,256,1),sidewalk:noiseTexture('#c9c7be','#98968f',1000),soil:noiseTexture('#5f452f','#a67a50',1900),plaster:noiseTexture('#ded7ca','#b5aa99',1100),wood:woodTexture(),brick:brickTexture(),water:noiseTexture('#5c9fb8','#b8dce5',550)};
for(const t of Object.values(TEX))t.repeat.set(8,8);
const MAT={
  grass:new THREE.MeshStandardMaterial({map:TEX.grass,roughness:1,color:0xffffff}),
  road:new THREE.MeshStandardMaterial({map:TEX.asphalt,roughness:.95,color:0xffffff}),
  sidewalk:new THREE.MeshStandardMaterial({map:TEX.sidewalk,roughness:1,color:0xffffff}),
  soil:new THREE.MeshStandardMaterial({map:TEX.soil,roughness:1}),
  wood:new THREE.MeshStandardMaterial({map:TEX.wood,roughness:.9}),
  glass:new THREE.MeshPhysicalMaterial({color:0xaed3df,roughness:.16,metalness:0,transparent:true,opacity:.56,transmission:.1}),
  metal:new THREE.MeshStandardMaterial({color:0x59615e,roughness:.45,metalness:.48}),
};

const hemi=new THREE.HemisphereLight(0xdff2ff,0x405038,1.35);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff5df,3.1);sun.position.set(65,90,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-135;sun.shadow.camera.right=135;sun.shadow.camera.top=135;sun.shadow.camera.bottom=-135;sun.shadow.bias=-.0003;scene.add(sun);
const ambient=new THREE.AmbientLight(0xffffff,.32);scene.add(ambient);

function std(color,rough=.9,metal=0,map=null){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,map})}
function meshBox(x,z,w,h,d,material,y=0,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material instanceof THREE.Material?material:std(material));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function plane(x,z,w,d,material,y=.01,parent=scene){const geo=new THREE.PlaneGeometry(w,d);const mat=material instanceof THREE.Material?material:std(material);const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m}
function sphere(x,y,z,r,material,parent=scene,segments=16){const m=new THREE.Mesh(new THREE.SphereGeometry(r,segments,Math.max(8,segments/2)),material instanceof THREE.Material?material:std(material));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cyl(x,y,z,rt,rb,h,material,parent=scene,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material instanceof THREE.Material?material:std(material));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function textSign(text,x,y,z,ry=0,w=8){const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle='#f2efe8';g.fillRect(0,0,c.width,c.height);g.fillStyle='#153627';g.font='800 72px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,128);g.strokeStyle='rgba(21,54,39,.18)';g.lineWidth=8;g.strokeRect(6,6,1012,244);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshStandardMaterial({map:t,roughness:.6,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m}

plane(0,0,500,500,MAT.grass,0);
for(const [x,z,w,d] of [[0,0,300,15],[0,0,15,300],[0,-96,290,11],[96,0,11,290],[-96,0,11,290]])plane(x,z,w,d,MAT.road,.025);
for(const [x,z,w,d] of [[0,-8,300,3],[0,8,300,3],[0,-89,290,3],[0,-103,290,3],[-8,0,3,300],[8,0,3,300],[89,0,3,290],[103,0,3,290]])plane(x,z,w,d,MAT.sidewalk,.032);
for(let x=-135;x<=135;x+=18){plane(x,-.02,8,.28,0xe8dca8,.04)}
for(let z=-135;z<=135;z+=18){plane(.02,z,.28,8,0xe8dca8,.04)}

function lamp(x,z){const p=cyl(x,2.1,z,.08,.11,4.2,MAT.metal);const arm=cyl(x,4.12,z,.05,.05,.85,MAT.metal);arm.rotation.z=Math.PI/2;arm.position.x+=.35;const bulb=sphere(x+.68,4.06,z,.14,std(0xffefbd,.2),scene,12);bulb.material.emissive=new THREE.Color(0xffd77a);bulb.material.emissiveIntensity=.5;return {p,bulb}}
for(let i=-6;i<=6;i++){lamp(i*22,-11);lamp(i*22,11)}
for(let i=-5;i<=5;i++){lamp(-11,i*22);lamp(11,i*22)}

function makeWindow(parent,x,y,z,ry=0,w=2.1,h=1.8){const frame=meshBox(0,0,w+.22,h+.22,.12,0xe9e5dc,0,parent);frame.position.set(x,y,z);frame.rotation.y=ry;const pane=meshBox(0,0,w,h,.08,MAT.glass,0,parent);pane.position.set(x,y,z+(ry===0?.07:0));pane.rotation.y=ry;const mullV=meshBox(0,0,.06,h,.13,0xf4f0e7,0,parent);mullV.position.set(x,y,z-.01);mullV.rotation.y=ry;const mullH=meshBox(0,0,w,.06,.13,0xf4f0e7,0,parent);mullH.position.set(x,y,z-.01);mullH.rotation.y=ry;}
function makeDoor(parent,x,y,z,ry=0,color=0x4d5f50){const d=meshBox(0,0,1.5,2.6,.18,color,0,parent);d.position.set(x,y,z);d.rotation.y=ry;const knob=sphere(x+(ry===0?.5:0),y,z+(ry!==0?.5:0),.07,std(0xc9ad63,.3,.4),parent,10);return d}
function gableRoof(parent,w,d,y,color){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,3.1);shape.lineTo(w/2,0);shape.lineTo(-w/2,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);const roof=new THREE.Mesh(geo,std(color,.88));roof.rotation.y=Math.PI/2;roof.position.y=y;roof.castShadow=true;roof.receiveShadow=true;parent.add(roof);return roof}
function building(label,x,z,w,d,wallColor,roofColor,doorSide='south',style='shop'){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const wallMat=style==='brick'?new THREE.MeshStandardMaterial({map:TEX.brick,roughness:1,color:wallColor}):new THREE.MeshStandardMaterial({map:TEX.plaster,roughness:.95,color:wallColor});
  TEX.plaster.repeat.set(Math.max(2,w/3),Math.max(2,d/3));
  meshBox(0,0,w,6.5,d,wallMat,0,g);
  if(style==='house')gableRoof(g,d+1,w+1,6.5,roofColor);else meshBox(0,0,w+1.2,1.15,d+1.2,std(roofColor,.9),6.5,g);
  const south=doorSide==='south',frontZ=south?d/2+.11:-d/2-.11,ry=south?0:Math.PI;
  makeDoor(g,-w*.22,1.3,frontZ,ry,style==='house'?0x51614f:0x40584c);
  makeWindow(g,w*.13,2.25,frontZ,ry,2.2,1.65);makeWindow(g,w*.35,2.25,frontZ,ry,2.0,1.65);
  if(w>23)makeWindow(g,-w*.42,2.25,frontZ,ry,1.8,1.65);
  const sideMat=std(0x3f4f49,.8);meshBox(0,0,w*.72,.18,1.4,sideMat,3.8,g);
  textSign(label,x,5.15,z+frontZ,ry,Math.min(w*.78,13));
  if(style!=='house'){
    const aw=meshBox(0,0,w*.48,.22,1.5,std(roofColor,.85),3.55,g);aw.position.z=frontZ+(south?.72:-.72);
    for(const sx of [-w*.22,w*.22]){const post=cyl(sx,1.75,frontZ+(south?.72:-.72),.05,.07,3.5,MAT.metal,g,10);post.castShadow=true}
  }
  return g;
}

const places={home:{x:-58,z:-62,label:'Your house'},petshop:{x:52,z:-62,label:'Pet & Habitat Shop'},hardware:{x:116,z:-62,label:'Hardware & Garden'},diner:{x:50,z:55,label:'Willow Diner'},grocery:{x:114,z:55,label:'Town Market'},vet:{x:52,z:118,label:'Exotic Vet'},forest:{x:-136,z:90,label:'Pinewood Forest'},pond:{x:-78,z:104,label:'Willow Pond'},park:{x:-42,z:54,label:'Town Park'}};
building('YOUR HOUSE',places.home.x,places.home.z,25,21,0xeee7db,0x5b4031,'south','house');
building('PET + HABITAT',places.petshop.x,places.petshop.z,30,21,0xc8d8bf,0x3f5c3c,'south','shop');
building('HARDWARE + GARDEN',places.hardware.x,places.hardware.z,30,21,0xd4c6aa,0x6f5943,'south','shop');
building('DINER',places.diner.x,places.diner.z,27,19,0xd8b09a,0x8f413b,'north','brick');
building('TOWN MARKET',places.grocery.x,places.grocery.z,29,19,0xd8dedb,0x49625b,'north','shop');
building('EXOTIC VET',places.vet.x,places.vet.z,29,20,0xe8eeee,0x5f7d80,'north','shop');

for(let i=0;i<14;i++){
  const side=i<7?-1:1,row=i%7,x=side*(30+row*18),z=-137;
  const g=building('',x,z,13.5,12,[0xd7c6b4,0xc8d2b8,0xd6bcbc,0xd8d3c9][i%4],0x5d493a,'south','house');
  const fenceMat=std(0xe7dfcd,1);for(let k=-6;k<=6;k+=1.5){meshBox(k,7.1,.08,1.1,.08,fenceMat,0,g)}
}

const pond=new THREE.Mesh(new THREE.CircleGeometry(26,64),new THREE.MeshPhysicalMaterial({map:TEX.water,color:0x8fc6d8,roughness:.16,metalness:.05,transparent:true,opacity:.9}));pond.rotation.x=-Math.PI/2;pond.position.set(places.pond.x,.05,places.pond.z);scene.add(pond);
for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=28+Math.random()*5;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1+Math.random()*.7,0),std(0x77766c,1));rock.scale.set(1.5,.7,1.1);rock.position.set(places.pond.x+Math.cos(a)*r,.55,places.pond.z+Math.sin(a)*r);rock.castShadow=true;scene.add(rock)}

function tree(x,z,scale=1,type='oak'){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const trunk=cyl(0,2.4*scale,0,.24*scale,.38*scale,4.8*scale,new THREE.MeshStandardMaterial({map:TEX.wood,roughness:1}),g,10);
  if(type==='pine'){
    for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry((2.4-i*.38)*scale,3.8*scale,10),std(i===0?0x355f39:0x3e6d42,1));crown.position.y=(4.6+i*1.3)*scale;crown.castShadow=true;g.add(crown)}
  }else{
    for(const [dx,dy,dz,r,c] of [[0,5.1,0,2.5,0x49784b],[1.35,5.0,.2,1.7,0x527f4e],[-1.2,5.2,.6,1.8,0x416f43],[.3,6.1,-.7,1.6,0x4c7d49]])sphere(dx*scale,dy*scale,dz*scale,r*scale,std(c,1),g,14);
  }
  return g;
}
for(let i=0;i<120;i++){let x=-195+Math.random()*105,z=25+Math.random()*180;if(Math.hypot(x-places.pond.x,z-places.pond.z)<33)continue;tree(x,z,.78+Math.random()*.6,Math.random()<.65?'pine':'oak')}
for(let i=0;i<34;i++){let x=-70+Math.random()*130,z=18+Math.random()*70;tree(x,z,.55+Math.random()*.35,'oak')}

function bench(x,z,ry=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);meshBox(0,0,4,.25,1.2,MAT.wood,1,g);meshBox(0,0,4,.25,.25,MAT.wood,2.05,g);for(const sx of [-1.5,1.5]){meshBox(sx,0,.16,1.1,.16,MAT.metal,.1,g);meshBox(sx,0,.16,1.1,.16,MAT.metal,.1,g).position.z=.8}}
plane(places.park.x,places.park.z,54,42,std(0x84ad74,1),.03);bench(-55,52,.2);bench(-30,55,-.25);bench(-42,43,Math.PI);
for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const flower=sphere(-42+Math.cos(a)*15,.3,54+Math.sin(a)*10,.18,std([0xd8aa4f,0xd87070,0xb678d6][i%3],.8),scene,8);flower.scale.y=.7}

const player=new THREE.Group();scene.add(player);player.position.set(-28,0,-28);
const character=new THREE.Group();player.add(character);
const skin=std(0xd6a276,.72), hair=std(0x30251f,.95), shirt=std(0x2f5c43,.8), pants=std(0x354150,.92), shoe=std(0x202526,.72), bagMat=std(0x6f5038,.82);
const pelvis=meshBox(0,0,.88,.45,.48,pants,1.03,character);
const torso=meshBox(0,0,1.03,1.08,.5,shirt,1.37,character);
const neck=cyl(0,2.05,0,.15,.16,.28,skin,character,12);
const head=sphere(0,2.46,0,.38,skin,character,18);head.scale.set(.88,1.1,.92);
const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.39,18,10,0,Math.PI*2,0,Math.PI*.56),hair);hairCap.position.set(0,2.62,0);hairCap.scale.set(.9,1,.95);hairCap.castShadow=true;character.add(hairCap);
for(const sx of [-1,1]){sphere(sx*.37,2.47,0,.075,skin,character,10)}
for(const sx of [-1,1]){const eye=sphere(sx*.13,2.5,-.335,.035,std(0x2a211d,.35),character,10);eye.scale.z=.5}
const mouth=meshBox(0,0,.14,.025,.025,0x7f4d47,2.32,character);mouth.position.z=-.35;
const nose=sphere(0,2.42,-.355,.045,skin,character,10);nose.scale.set(.7,1,.7);
const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.64,1.85,0);rightArm.position.set(.64,1.85,0);character.add(leftArm,rightArm);
function limb(group,side){cyl(0,-.34,0,.15,.17,.72,shirt,group,10);cyl(0,-.87,0,.12,.13,.58,skin,group,10);sphere(0,-1.19,0,.14,skin,group,10);group.rotation.z=side*.06}
limb(leftArm,-1);limb(rightArm,1);
const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.24,1.1,0);rightLeg.position.set(.24,1.1,0);character.add(leftLeg,rightLeg);
function leg(group){cyl(0,-.45,0,.17,.18,.9,pants,group,10);cyl(0,-1.12,0,.15,.16,.55,pants,group,10);const s=meshBox(0,-.3,.38,.22,.72,shoe,-1.49,group);s.position.z=-.12}
leg(leftLeg);leg(rightLeg);
const backpack=meshBox(0,0,.82,.92,.32,bagMat,1.42,character);backpack.position.z=.39;cyl(-.35,1.82,.19,.035,.035,.9,bagMat,character,8);cyl(.35,1.82,.19,.035,.035,.9,bagMat,character,8);

const terrarium=new THREE.Group();terrarium.position.set(places.home.x+3,.72,places.home.z+4);scene.add(terrarium);
meshBox(0,0,5.4,.75,3.8,new THREE.MeshStandardMaterial({map:TEX.wood,roughness:.9}),0,terrarium);
const tub=new THREE.Mesh(new THREE.BoxGeometry(4.6,1.7,3.25),new THREE.MeshPhysicalMaterial({color:0xcce7ea,transparent:true,opacity:.34,roughness:.18,metalness:0,transmission:.18}));tub.position.y=1.65;tub.castShadow=true;terrarium.add(tub);
const soil=new THREE.Mesh(new THREE.BoxGeometry(4.25,.34,2.9),MAT.soil);soil.position.y=.98;soil.visible=false;terrarium.add(soil);
const leavesGroup=new THREE.Group();for(let i=0;i<24;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.08,.16,.42,6),std(i%3===0?0xb1753e:0x87572f,1));l.scale.y=.08;l.rotation.z=Math.PI/2;l.position.set((Math.random()-.5)*3.6,1.18,(Math.random()-.5)*2.3);l.rotation.y=Math.random()*Math.PI;leavesGroup.add(l)}leavesGroup.visible=false;terrarium.add(leavesGroup);
const mossMesh=sphere(-1.25,1.17,.58,.65,std(0x4d8249,1),terrarium,16);mossMesh.scale.set(1.55,.28,1);mossMesh.visible=false;
const grassMesh=new THREE.Group();for(let i=0;i<13;i++){const blade=meshBox((Math.random()-.5)*.6,0,.035,.65+Math.random()*.35,.05,0x4e8a49,1.15,grassMesh);blade.rotation.z=(Math.random()-.5)*.3}grassMesh.position.set(1.2,0,.72);grassMesh.visible=false;terrarium.add(grassMesh);
const hideMesh=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,1.7,18,1,false,0,Math.PI),new THREE.MeshStandardMaterial({map:TEX.wood,roughness:1}));hideMesh.rotation.z=Math.PI/2;hideMesh.position.set(.78,1.44,-.42);hideMesh.visible=false;terrarium.add(hideMesh);
const dishMesh=new THREE.Mesh(new THREE.CylinderGeometry(.55,.65,.16,28),new THREE.MeshPhysicalMaterial({color:0x8fbfd0,roughness:.24}));dishMesh.position.set(-1.1,1.15,-.77);dishMesh.visible=false;terrarium.add(dishMesh);
const branchMesh=cyl(.2,1.65,.58,.11,.15,2.7,new THREE.MeshStandardMaterial({map:TEX.wood,roughness:1}),terrarium,10);branchMesh.rotation.z=1.08;branchMesh.visible=false;
const thermoMesh=meshBox(1.82,0,.22,.95,.12,0xe8e7dd,1.65,terrarium);thermoMesh.position.z=-1.33;thermoMesh.visible=false;
const pet=new THREE.Group();terrarium.add(pet);pet.position.set(.1,1.22,-.15);const petBody=sphere(0,0,0,.34,std(0x6e7d4e,1),pet,16);petBody.scale.set(1.15,.72,1);sphere(-.2,.14,-.23,.12,std(0x758656,1),pet,12);sphere(.2,.14,-.23,.12,std(0x758656,1),pet,12);for(const sx of [-1,1])sphere(sx*.19,.18,-.32,.035,std(0x171a11,.3),pet,10);

const state={coins:25,health:100,hunger:92,energy:100,time:8*60,day:1,petHealth:100,petHunger:82,petWater:88,petStress:18,inv:{leaves:0,grass:0,moss:0,sticks:0,soil:1,petFood:1,snacks:1,water:1,hide:0,dish:0,thermometer:0},built:{substrate:false,leaves:false,moss:false,grass:false,hide:false,water:false,branch:false,thermometer:false},firstNight:false,waypoint:null};
try{const saved=JSON.parse(localStorage.getItem('tb3d-save')||'null');if(saved&&saved.version>=2){Object.assign(state,saved.state);Object.assign(state.inv,saved.state.inv||{});Object.assign(state.built,saved.state.built||{})}}catch{}

const ui={coins:$('#coins'),health:$('#health'),hunger:$('#hunger'),energy:$('#energy'),petHealth:$('#pet-health'),clock:$('#clock'),prompt:$('#prompt'),location:$('#location-chip'),objectiveTitle:$('#objective-title'),objectiveText:$('#objective-text'),build:$('#build-panel'),shop:$('#shop-panel'),inventory:$('#inventory-panel'),map:$('#map-panel'),sleep:$('#sleep-panel'),toast:$('#toast'),buildStatus:$('#build-status'),buildInv:$('#build-inventory'),petHunger:$('#pet-hunger'),petWater:$('#pet-water'),petStress:$('#pet-stress'),petHungerBar:$('#pet-hunger-bar'),petWaterBar:$('#pet-water-bar'),petStressBar:$('#pet-stress-bar')};
const keys={};let yaw=.2,pitch=.18,cameraDistance=8.4,last=performance.now(),near=null,paused=false,verticalVel=0,onGround=true,walkPhase=0;
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function toast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),1900)}
function openPanel(el){$$('.modal-card').forEach(x=>x.hidden=true);el.hidden=false;paused=true;document.exitPointerLock?.()}
function closePanel(el){el.hidden=true;paused=false}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanel(document.getElementById(b.dataset.close))));
$('#collapse-help').addEventListener('click',()=>{$('#help').classList.toggle('collapsed');$('#collapse-help').textContent=$('#help').classList.contains('collapsed')?'+':'−'});

const collectables=[];
function collectable(kind,x,z,color,shape='rock'){
  let geo;if(shape==='plant')geo=new THREE.ConeGeometry(.42,.92,8);else if(kind==='sticks')geo=new THREE.CylinderGeometry(.07,.1,1.2,7);else geo=new THREE.DodecahedronGeometry(.38,0);
  const m=new THREE.Mesh(geo,std(color,1));m.position.set(x,shape==='plant'?.46:.3,z);if(kind==='sticks')m.rotation.z=Math.PI/2;m.castShadow=true;scene.add(m);collectables.push({kind,mesh:m,active:true});
}
for(let i=0;i<42;i++)collectable('leaves',-175+Math.random()*78,40+Math.random()*145,0x956232);
for(let i=0;i<32;i++)collectable('sticks',-178+Math.random()*85,28+Math.random()*158,0x6f4e35);
for(let i=0;i<28;i++)collectable('moss',-126+Math.random()*68,58+Math.random()*112,0x4e8248,'plant');
for(let i=0;i<24;i++)collectable('grass',-72+Math.random()*92,20+Math.random()*70,0x5f914e,'plant');

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
function saveGame(){try{localStorage.setItem('tb3d-save',JSON.stringify({version:3,state}));toast('Game saved on this browser.')}catch{toast('Could not save right now.')}}

function dist(x,z){return Math.hypot(player.position.x-x,player.position.z-z)}
function closestPlace(){let best=null,d=Infinity;for(const [k,p] of Object.entries(places)){const q=dist(p.x,p.z);if(q<d){d=q;best=[k,p]}}return {key:best[0],place:best[1],distance:d}}
function detectNear(){near=null;for(const c of collectables){if(c.active&&dist(c.mesh.position.x,c.mesh.position.z)<1.8){near={type:'collect',obj:c,label:`E · collect ${c.kind}`};break}}if(!near&&dist(terrarium.position.x,terrarium.position.z)<5.5)near={type:'terrarium',label:'E · check Moss   B · build habitat   F · feed'};if(!near&&dist(places.home.x-5,places.home.z)<8)near={type:'bed',label:'E · go inside / sleep'};if(!near&&dist(places.petshop.x,places.petshop.z+10)<9)near={type:'shop',shop:'petshop',label:'E · enter Pet & Habitat Shop'};if(!near&&dist(places.hardware.x,places.hardware.z+10)<9)near={type:'shop',shop:'hardware',label:'E · enter Hardware & Garden'};if(!near&&dist(places.diner.x,places.diner.z-9)<9)near={type:'shop',shop:'diner',label:'E · enter Willow Diner'};if(!near&&dist(places.grocery.x,places.grocery.z-9)<9)near={type:'shop',shop:'grocery',label:'E · enter Town Market'};if(!near&&dist(places.vet.x,places.vet.z-10)<9)near={type:'vet',label:'E · visit exotic vet (15 coins)'};if(near){ui.prompt.hidden=false;ui.prompt.textContent=near.label}else ui.prompt.hidden=true;const c=closestPlace();ui.location.textContent=c.distance<25?c.place.label:(player.position.x<-82&&player.position.z>15?'Pinewood Forest':player.position.z>84?'North side':player.position.x>82?'East shops':'TerrariumBuilds Valley')}
function collect(c){c.active=false;c.mesh.visible=false;state.inv[c.kind]=(state.inv[c.kind]||0)+1;toast(`${c.kind[0].toUpperCase()+c.kind.slice(1)} collected.`);updateAll()}
function feedPet(){if(dist(terrarium.position.x,terrarium.position.z)>7)return toast('You need to be near Moss to feed him.');if(!state.inv.petFood)return toast('You need pet food.');state.inv.petFood--;state.petHunger=clamp(state.petHunger+42);state.petStress=clamp(state.petStress-5);toast('Moss ate.');updateAll()}
function interact(){if(paused||!near)return;if(near.type==='collect')collect(near.obj);else if(near.type==='terrarium')openPanel(ui.build);else if(near.type==='shop')openShop(near.shop);else if(near.type==='bed')openPanel(ui.sleep);else if(near.type==='vet'){if(state.coins<15)return toast('Vet visit costs 15 coins.');state.coins-=15;state.petHealth=100;state.petStress=clamp(state.petStress-25);toast('Moss was checked by the vet and is doing better.');updateAll()}}

function resolveNight(){const s=readiness();let reward=0,damage=0;if(s>=9&&state.petHunger>35&&state.petWater>35){reward=25;state.petStress=clamp(state.petStress-15);toast('Great night! Moss did well. +25 coins')}else if(s>=6){reward=10;damage=8;toast('You made it through the night. +10 coins')}else{damage=30;toast('The habitat was too weak overnight. Moss needs better care.')}state.coins+=reward;state.petHealth=clamp(state.petHealth-damage);state.firstNight=true}
function sleep(){if(state.day===1&&!state.firstNight)resolveNight();else{const s=readiness();if(s<5)state.petHealth=clamp(state.petHealth-8);if(state.petHunger<25)state.petHealth=clamp(state.petHealth-6);if(state.petWater<25)state.petHealth=clamp(state.petHealth-8)}state.day++;state.time=7*60;state.energy=100;state.hunger=clamp(state.hunger-8);state.petHunger=clamp(state.petHunger-11);state.petWater=clamp(state.petWater-(state.built.water?5:13));closePanel(ui.sleep);setDaylight();saveGame();updateAll()}
$('#sleep-now').onclick=sleep;
$$('[data-map]').forEach(b=>b.addEventListener('click',()=>{const p=places[b.dataset.map];state.waypoint={x:p.x,z:p.z,label:p.label};toast(`Waypoint set: ${p.label}`);closePanel(ui.map)}));
function updateMapMarker(){const x=clamp((player.position.x+235)/470*100,3,97),y=clamp((player.position.z+235)/470*100,3,97);$('#map-you').style.left=x+'%';$('#map-you').style.top=y+'%'}

addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyF')feedPet();if(e.code==='KeyB'&&!paused&&dist(terrarium.position.x,terrarium.position.z)<8)openPanel(ui.build);if(e.code==='KeyI'){if(ui.inventory.hidden){renderInventory();openPanel(ui.inventory)}else closePanel(ui.inventory)}if(e.code==='KeyM'){if(ui.map.hidden){updateMapMarker();openPanel(ui.map)}else closePanel(ui.map)}if(e.code==='Space'&&!paused&&onGround){verticalVel=5.4;onGround=false}if(e.code==='Escape'){$$('.modal-card').forEach(x=>x.hidden=true);paused=false}});
addEventListener('keyup',e=>keys[e.code]=false);
canvas.addEventListener('click',()=>{if(!paused)canvas.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||paused)return;yaw-=e.movementX*.00215;pitch=clamp(pitch-e.movementY*.0016,-.18,.7)});
addEventListener('wheel',e=>{if(paused)return;cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.8,4.5,14)},{passive:true});

function setDaylight(){const h=(state.time/60)%24;if(h>=20||h<6){scene.background.set(0x17243b);scene.fog.color.set(0x17243b);sun.intensity=.18;hemi.intensity=.5;ambient.intensity=.18}else if(h>=18){scene.background.set(0xe1a77d);scene.fog.color.set(0xd9a57f);sun.intensity=1.25;hemi.intensity=.95;ambient.intensity=.26}else if(h<8){scene.background.set(0xaac8d7);scene.fog.color.set(0xaac8d7);sun.intensity=1.7;hemi.intensity=1.1;ambient.intensity=.3}else{scene.background.set(0xb9d6ff);scene.fog.color.set(0xb9d6ff);sun.intensity=3.1;hemi.intensity=1.35;ambient.intensity=.32}}
function updateWorld(dt){if(paused)return;state.time+=dt*3.1;state.hunger=clamp(state.hunger-dt*.12);state.energy=clamp(state.energy-dt*((keys.ShiftLeft||keys.ShiftRight)?.3:.08));state.petHunger=clamp(state.petHunger-dt*.045);state.petWater=clamp(state.petWater-dt*(state.built.water?.018:.04));state.petStress=clamp(state.petStress+dt*(readiness()<5?.018:-.008));if(state.hunger<=2)state.health=clamp(state.health-dt*.2);if(state.petHunger<18||state.petWater<18)state.petHealth=clamp(state.petHealth-dt*.12);if(state.time>=24*60){if(state.day===1&&!state.firstNight)resolveNight();state.time-=1440;state.day++;}setDaylight();updateHUD()}
function animateCharacter(dt,moving,sprint){if(moving){walkPhase+=dt*(sprint?11:7.5);const swing=Math.sin(walkPhase)*(sprint?.7:.5);leftArm.rotation.x=swing;rightArm.rotation.x=-swing;leftLeg.rotation.x=-swing*.75;rightLeg.rotation.x=swing*.75;character.position.y=Math.abs(Math.sin(walkPhase*2))*.035}else{leftArm.rotation.x*=.82;rightArm.rotation.x*=.82;leftLeg.rotation.x*=.82;rightLeg.rotation.x*=.82;character.position.y*=.8}}
function movePlayer(dt){if(paused){animateCharacter(dt,false,false);return}let x=0,z=0;if(keys.KeyW||keys.ArrowUp)z-=1;if(keys.KeyS||keys.ArrowDown)z+=1;if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;let moving=!!(x||z),sprint=false;if(moving){const v=new THREE.Vector3(x,0,z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);sprint=(keys.ShiftLeft||keys.ShiftRight)&&state.energy>4;const speed=sprint?9.7:5.9;player.position.addScaledVector(v,dt*speed);player.rotation.y=Math.atan2(v.x,v.z);if(sprint)state.energy=clamp(state.energy-dt*1.2)}animateCharacter(dt,moving,sprint);verticalVel-=14*dt;player.position.y+=verticalVel*dt;if(player.position.y<=0){player.position.y=0;verticalVel=0;onGround=true}player.position.x=clamp(player.position.x,-232,232);player.position.z=clamp(player.position.z,-232,232)}
function cameraFollow(){const target=player.position.clone().add(new THREE.Vector3(0,1.58,0));const offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*cameraDistance,2+Math.sin(pitch)*cameraDistance,Math.cos(yaw)*Math.cos(pitch)*cameraDistance);camera.position.lerp(target.clone().add(offset),.11);camera.lookAt(target)}
function updateWaypoint(){if(!state.waypoint)return;const d=Math.hypot(player.position.x-state.waypoint.x,player.position.z-state.waypoint.z);if(d<10){toast(`Reached ${state.waypoint.label}.`);state.waypoint=null}else if(!near){ui.prompt.hidden=false;ui.prompt.textContent=`Waypoint · ${state.waypoint.label} · ${Math.round(d)}m`}}
function animatePet(t){pet.position.x=.1+Math.sin(t*.0012)*.55;pet.rotation.y=Math.sin(t*.0009)*.4;pet.position.y=1.22+Math.sin(t*.002)*.015}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight,pr=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*pr)||canvas.height!==Math.floor(h*pr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;resize();movePlayer(dt);updateWorld(dt);detectNear();updateWaypoint();cameraFollow();animatePet(now);renderer.render(scene,camera);requestAnimationFrame(loop)}
setDaylight();requestAnimationFrame(loop);
setInterval(()=>{if(!paused)saveGame()},45000);
