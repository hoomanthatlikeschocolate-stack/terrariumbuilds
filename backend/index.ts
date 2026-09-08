const U=Deno.env.get('SUPABASE_URL')!;
const K=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H={apikey:K,authorization:`Bearer ${K}`,'content-type':'application/json',prefer:'return=representation'};
const enc=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const sha=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function password(p:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:210000},key,256));}
function equal(a:string,b:string){let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0;}
const clean=(v:unknown,max=1000)=>String(v??'').trim().slice(0,max);
const url=(v:unknown)=>{const s=clean(v,2000);if(!s)return '';try{const u=new URL(s);if(u.protocol==='https:'&&!u.username&&!u.password)return u.href;}catch{}throw new Error('Use a valid https:// link.');};
const id=(v:unknown)=>{const s=clean(v,40);if(!/^[0-9a-f-]{36}$/.test(s))throw new Error('Invalid record.');return s;};
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const DEFAULT_ASSETS={logo_url:'https://raw.githubusercontent.com/hoomanthatlikeschocolate-stack/terrariumbuilds/main/public/terrarium-logo.jpg',hero_url:'https://images.unsplash.com/photo-1767131543136-4af77f4d419b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1600',hero_alt:'A lush planted glass terrarium with moss, ferns, wood, stones, and layered soil',hero_caption:'A little world, built by hand.'};
async function db(table:string,query='',method='GET',body?:unknown){const r=await fetch(`${U}/rest/v1/${table}${query?'?'+query:''}`,{method,headers:H,body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json().catch(()=>null);if(!r.ok){console.error('Database failure',table,r.status,d?.code);throw new Error('Could not save or load data. Please try again.');}return d;}
async function rate(key:string,max=12){const k=await sha(key);const since=new Date(Date.now()-15*60*1000).toISOString();const rows=await db('tb_attempts',`key=eq.${k}&created_at=gt.${encodeURIComponent(since)}&select=id&limit=${max}`);if(rows.length>=max)throw new Error('Too many attempts. Try again in 15 minutes.');await db('tb_attempts','','POST',{key:k});}
async function issue(username:string|null,kind:string,seconds:number){const token=crypto.randomUUID()+crypto.randomUUID();await db('tb_sessions','','POST',{token_hash:await sha(token),username,kind,expires_at:new Date(Date.now()+seconds*1000).toISOString()});return token;}
async function getSession(token:string,kind?:string){if(!token||token.length>200)return null;const rows=await db('tb_sessions',`token_hash=eq.${await sha(token)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=*&limit=1`);const s=rows[0];return s&&(!kind||s.kind===kind)?s:null;}
async function userFrom(req:Request){const s=await getSession((req.headers.get('authorization')||'').replace(/^Bearer /,''));if(!s||s.kind==='gateway')return null;const users=await db('tb_users',`username=eq.${encodeURIComponent(s.username)}&select=username,role&limit=1`);return users[0]||null;}
async function listCatalog(all=false){const q=all?'':'&published=eq.true';const [products,tutorials,settings]=await Promise.all([db('tb_products',`select=*&order=created_at.asc${q}`),db('tb_tutorials',`select=*&order=created_at.asc${q}`),db('tb_settings','name=eq.site_assets&select=value&limit=1')]);return {products,tutorials,assets:{...DEFAULT_ASSETS,...(settings[0]?.value||{})}};}
function product(b:any){const name=clean(b.name,100);if(!name)throw new Error('Add a product name.');const price=b.price_cents===null||b.price_cents===''?null:Number(b.price_cents),stock=Number(b.stock);if(price!==null&&(!Number.isInteger(price)||price<0||price>10000000))throw new Error('Enter a valid price.');if(!Number.isInteger(stock)||stock<0||stock>100000)throw new Error('Enter valid stock.');return{name,description:clean(b.description,4000),category:clean(b.category,60)||'Supplies',price_cents:price,stock,published:b.published===true,image_url:url(b.image_url),checkout_url:url(b.checkout_url),updated_at:new Date().toISOString()};}
function tutorial(b:any){const title=clean(b.title,150),animal=clean(b.animal,70);const steps=Array.isArray(b.steps)?b.steps.slice(0,30).map((s:any)=>({title:clean(s.title,150),body:clean(s.body,5000)})).filter((s:any)=>s.title&&s.body):[];if(!title||!animal||!steps.length)throw new Error('Add a title, animal, and at least one complete step.');return{title,animal,summary:clean(b.summary,1000),difficulty:clean(b.difficulty,40)||'Beginner',materials:clean(b.materials,5000),steps,note:clean(b.note,3000),sources:Array.isArray(b.sources)?b.sources.slice(0,10).map((s:any)=>({label:clean(s.label,150),url:url(s.url)})).filter((s:any)=>s.url):[],image_url:url(b.image_url),published:b.published===true,updated_at:new Date().toISOString()};}
Deno.serve(async(req:Request)=>{
  if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed'},405);
  const a=new URL(req.url).searchParams.get('action')||'catalog';
  const post=new Set(['gateway','login','register','owner-login','logout','product-save','product-delete','tutorial-save','tutorial-delete','site-assets-save','chat-send','upload','order-create','order-status']);
  if(post.has(a)&&req.method!=='POST')return json({error:'Method not allowed'},405);
  try{
    if(Number(req.headers.get('content-length')||0)>4800000)return json({error:'File too large'},413);
    const b=req.method==='POST'?await req.json():{};
    if(a==='catalog')return json(await listCatalog());
    if(a==='gateway'){
      await rate('gateway:'+clean(req.headers.get('x-client-ip'),100),8);
      const [g]=await db('tb_settings','name=eq.gateway&select=value');
      if(!g||!equal(await password(clean(b.code,100),g.value.salt),g.value.hash))return json({error:'That access code is incorrect.'},401);
      return json({ok:true,gatewayToken:await issue(null,'gateway',300)});
    }
    if(['register','login','owner-login'].includes(a)){
      const username=clean(b.username,30).toLowerCase();
      if(!/^[a-z0-9_]{3,30}$/.test(username))return json({error:'Username must be 3–30 letters, numbers, or underscores.'},400);
      const p=String(b.password||'');if(p.length<8||p.length>128)return json({error:'Use a password with 8–128 characters.'},400);
      await rate('auth:'+username,10);
      await rate('auth-ip:'+clean(req.headers.get('x-client-ip'),100),35);
      const [existing]=await db('tb_users',`username=eq.${username}&select=*&limit=1`);
      if(a==='register'){
        if(existing)return json({error:'That username is unavailable.'},409);
        const salt=crypto.randomUUID();await db('tb_users','','POST',{username,role:'member',salt,password_hash:await password(p,salt)});
      }else{
        if(a==='owner-login'&&!await getSession(req.headers.get('x-gate')||'','gateway'))return json({error:'Open owner access and enter the access code again.'},401);
        const salt=existing?.salt||'invalid-user-dummy-salt';
        const valid=equal(await password(p,salt),existing?.password_hash||'0'.repeat(64));
        if(!existing||!valid||(a==='owner-login'&&existing.role!=='owner')||(a==='login'&&existing.role==='owner'))return json({error:'Incorrect username or password. Owners use Owner access.'},401);
      }
      const role=a==='register'?'member':existing.role;
      if(a==='owner-login')await db('tb_sessions',`token_hash=eq.${await sha(req.headers.get('x-gate')||'')}`,'DELETE');
      const maxAge=role==='owner'?43200:604800;
      return json({user:{username,role},sessionToken:await issue(username,role,maxAge),maxAge});
    }
    const user=await userFrom(req);
    if(a==='session')return json({user});
    if(a==='logout'){const t=(req.headers.get('authorization')||'').replace(/^Bearer /,'');if(t)await db('tb_sessions',`token_hash=eq.${await sha(t)}`,'DELETE');return json({ok:true});}
    if(a==='order-create'){
      await rate('orders:'+clean(req.headers.get('x-client-ip'),100),8);
      const email=clean(b.email,254),name=clean(b.name,100);
      if(!name||!/^\S+@\S+\.\S+$/.test(email))return json({error:'Add your name and a valid contact email.'},400);
      if(!Array.isArray(b.items)||!b.items.length||b.items.length>30)return json({error:'Your bag is empty or too large.'},400);
      const items=[];const seen=new Set();let total=0;
      for(const item of b.items){const pid=id(item.id),qty=Number(item.quantity);if(seen.has(pid)||!Number.isInteger(qty)||qty<1||qty>100)throw new Error('Invalid quantity.');seen.add(pid);const [p]=await db('tb_products',`id=eq.${pid}&published=eq.true&select=*&limit=1`);if(!p||p.price_cents===null||p.stock<qty)throw new Error('An item is no longer available in that quantity. Refresh your bag.');items.push({id:pid,name:p.name,quantity:qty,price_cents:p.price_cents});total+=p.price_cents*qty;}
      const [order]=await db('tb_orders','','POST',{username:user?.username||null,name,email,items,total_cents:total,note:clean(b.note,2000),status:'requested'});
      return json({ok:true,id:order.id,total_cents:total});
    }
    if(a==='my-orders'){
      if(!user)return json({error:'Log in to see your orders.'},401);
      return json(await db('tb_orders',`username=eq.${encodeURIComponent(user.username)}&select=id,items,total_cents,status,created_at&order=created_at.desc&limit=100`));
    }
    if(!user||user.role!=='owner')return json({error:'Owner login required.'},403);
    if(a==='owner-data')return json(await listCatalog(true));
    if(a==='site-assets-save'){
      const assets={logo_url:url(b.logo_url),hero_url:url(b.hero_url),hero_alt:clean(b.hero_alt,180)||DEFAULT_ASSETS.hero_alt,hero_caption:clean(b.hero_caption,180)||DEFAULT_ASSETS.hero_caption};
      const existing=await db('tb_settings','name=eq.site_assets&select=name&limit=1');
      if(existing[0])await db('tb_settings','name=eq.site_assets','PATCH',{value:assets});
      else await db('tb_settings','','POST',{name:'site_assets',value:assets});
      return json({ok:true,assets:{...DEFAULT_ASSETS,...assets}});
    }
    if(a==='product-save'||a==='tutorial-save'){
      const table=a==='product-save'?'tb_products':'tb_tutorials';const row=a==='product-save'?product(b):tutorial(b);
      const d=await db(table,b.id?`id=eq.${id(b.id)}`:'',b.id?'PATCH':'POST',row);
      if(!d?.[0])return json({error:'This record no longer exists.'},404);return json({ok:true,item:d[0]});
    }
    if(a==='product-delete'||a==='tutorial-delete'){await db(a==='product-delete'?'tb_products':'tb_tutorials',`id=eq.${id(b.id)}`,'DELETE');return json({ok:true});}
    if(a==='chat-list'){
      const rows=(await db('tb_chat','select=*&order=created_at.desc&limit=150')).reverse();
      for(const row of rows){if(row.image_url){const r=await fetch(`${U}/storage/v1/object/sign/terrariumbuilds-chat/${row.image_url}`,{method:'POST',headers:H,body:JSON.stringify({expiresIn:900})});const d=await r.json();row.image_url=r.ok&&d.signedURL?`${U}/storage/v1${d.signedURL}`:'';}}
      return json(rows);
    }
    if(a==='chat-send'){
      await rate('chat:'+user.username,120);
      const message=clean(b.message,3000),image_url=clean(b.image_url,100);
      if(!message&&!image_url)throw new Error('Write a message or attach an image.');
      if(image_url&&!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(image_url))throw new Error('Invalid attachment.');
      return json({ok:true,item:(await db('tb_chat','','POST',{username:user.username,message,image_url}))[0]});
    }
    if(a==='upload'){
      const mime=clean(b.mime,100),base64=String(b.base64||'');if(!['image/jpeg','image/png','image/webp'].includes(mime)||base64.length>4200000)throw new Error('Choose a JPG, PNG, or WebP under 3 MB.');
      const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
      const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216:mime==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
      if(!valid)throw new Error('Image contents do not match its file type.');
      const path=`${crypto.randomUUID()}.${mime==='image/jpeg'?'jpg':mime.split('/')[1]}`;
      const bucket=b.chat===true?'terrariumbuilds-chat':'terrariumbuilds';
      const r=await fetch(`${U}/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{apikey:K,authorization:`Bearer ${K}`,'content-type':mime},body:bytes});
      if(!r.ok)throw new Error('Image upload failed.');return json(b.chat===true?{ok:true,path}:{ok:true,url:`${U}/storage/v1/object/public/terrariumbuilds/${path}`});
    }
    if(a==='orders')return json(await db('tb_orders','select=*&order=created_at.desc&limit=200'));
    if(a==='order-status'){
      if(!['requested','contacted','paid','fulfilled','cancelled'].includes(b.status))throw new Error('Invalid order status.');
      await db('tb_orders',`id=eq.${id(b.id)}`,'PATCH',{status:b.status});return json({ok:true});
    }
    return json({error:'Not found'},404);
  }catch(e){return json({error:e instanceof Error?e.message:'Something went wrong. Please try again.'},400);}
});
