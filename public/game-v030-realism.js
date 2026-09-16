/* Terrariums — 0.3 High Realism + Performance */
(function(){
 const V='0.3';
 const mat=(c,r=.72,m=.05)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const concrete=mat(0x777b78,.92),trim=mat(0x202522,.55,.18),glass=new THREE.MeshStandardMaterial({color:0x82a7b2,roughness:.18,metalness:.18,transparent:true,opacity:.48}),warm=mat(0xffd38a,.65),roof=mat(0x292c2a,.88),wood=mat(0x6f5037,.9);
 function box(x,y,z,sx,sy,sz,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;parent.add(o);return o}
 function facade(cx,cz,w=30,d=20){
   box(cx,5.1,cz-d/2-.08,w,10,.32,concrete);box(cx,10.25,cz,w+.8,.55,d+.8,roof);
   box(cx-w*.32,3.2,cz-d/2-.28,w*.18,4.2,.18,glass);box(cx,3.2,cz-d/2-.28,w*.18,4.2,.18,glass);box(cx+w*.32,3.2,cz-d/2-.28,w*.18,4.2,.18,glass);
   box(cx,1.8,cz-d/2-.38,3.1,3.7,.22,glass);box(cx,4.05,cz-d/2-.42,3.8,.24,.24,trim);
   box(cx,8.1,cz-d/2-.45,w*.55,1.15,.28,trim);box(cx,7.25,cz-d/2-.48,w*.5,.14,.3,warm);
   for(let i=-2;i<=2;i++)box(cx+i*5.2,.16,cz-d/2-4.2,4.1,.18,6.2,concrete);
 }
 try{for(const b of Object.values(B))facade(b.x,b.z,30,21);}catch(e){console.warn('facades',e)}
 // Detailed home shell: foundation, believable window frames, porch, gutters, chimney and roof trim.
 try{
   box(HX,.18,HZ,HW+2,.36,HD+2,concrete);box(HX,HZ===undefined?0:6.25,HZ-HD/2-.24,HW+.5,.3,.34,trim);
   for(const x of [HX-10,HX+10]){box(x,3.3,HZ+HD/2+.2,5.6,3.9,.2,glass);box(x,3.3,HZ+HD/2+.34,.16,4.2,.18,trim);box(x,3.3,HZ+HD/2+.34,5.9,.16,.18,trim)}
   box(HX,0.18,HZ+HD/2+3.2,9,.34,5.5,concrete);for(const x of [HX-4,HX+4])box(x,2.2,HZ+HD/2+5.4,.34,4.4,.34,wood);
   box(HX+HW*.32,8.2,HZ-2,2.1,5.8,2.1,mat(0x6b4435,.95));
 }catch(e){console.warn('home realism',e)}
 // Instanced street trees: one draw call for trunks and one for crowns.
 try{
   const pts=[];for(let x=-300;x<=300;x+=42){pts.push([x,-78],[x,78]);}for(let z=-250;z<=250;z+=45){pts.push([-88,z],[88,z]);}
   const tg=new THREE.BoxGeometry(.65,5,.65),cg=new THREE.IcosahedronGeometry(2.8,1),tm=mat(0x5b4632,.95),cm=mat(0x315f35,.95);const trunks=new THREE.InstancedMesh(tg,tm,pts.length),crowns=new THREE.InstancedMesh(cg,cm,pts.length),dummy=new THREE.Object3D();
   pts.forEach((p,i)=>{dummy.position.set(p[0],2.5,p[1]);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.set(p[0],6.2,p[1]);dummy.scale.set(1,1.18,1);dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);dummy.scale.set(1,1,1)});scene.add(trunks,crowns);
 }catch(e){console.warn('trees',e)}
 // Performance: preserve detail but keep expensive effects bounded.
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.0));renderer.shadowMap.enabled=false;scene.fog.near=170;scene.fog.far=470;camera.far=520;camera.updateProjectionMatrix();
 let lastHud=0;const h0=hud;hud=function(){const n=performance.now();if(n-lastHud<140)return;lastHud=n;h0();};
 const badge=document.querySelector('.revamp-badge');if(badge)badge.textContent='0.3 HIGH REALISM';const logo=document.querySelector('.logo-title');if(logo)logo.textContent='Terrariums · Update 0.3';const wt=document.querySelector('#welcome p');if(wt)wt.textContent='Terrariums 0.3 rebuilds the town with detailed storefronts, glass, trim, sidewalks, realistic home details and denser vegetation while keeping shadows and draw calls optimized.';if(start)start.textContent='Start Terrariums 0.3';document.title='Terrariums — 0.3 High Realism';
 console.log('Terrariums 0.3 high-realism performance update active');
})();