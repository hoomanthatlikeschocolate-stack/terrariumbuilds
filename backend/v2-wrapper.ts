const U=Deno.env.get('SUPABASE_URL')!;
const K=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BASE=`${U}/functions/v1/terrariumbuilds-api`;
const H={apikey:K,authorization:`Bearer ${K}`,'content-type':'application/json',prefer:'return=representation'};
const clean=(v:unknown,max=1000)=>String(v??'').trim().slice(0,max);
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const safeUrl=(v:unknown)=>{const s=clean(v,2000);if(!s)return '';try{const u=new URL(s);if(u.protocol==='https:'&&!u.username&&!u.password)return u.href;}catch{}throw new Error('Use a valid https:// link.');};
const DEFAULT_INFO={version:'v1.2',eyebrow:'About TerrariumBuilds',title:'Small worlds, built with care.',intro:'TerrariumBuilds is here to make naturalistic habitats easier to understand, plan, and build.',story:'We focus on practical habitat guides, natural materials, and simple steps that help each enclosure feel intentional from the ground up.',values:'Animal-first care\nNatural-looking materials\nClear, beginner-friendly guidance\nThoughtful builds over clutter',contact:'',image_url:'',image_alt:'A thoughtfully built naturalistic terrarium',image_credit:'',image_credit_url:'',announcement:'',show_announcement:false};
async function db(table:string,query='',method='GET',body?:unknown){const r=await fetch(`${U}/rest/v1/${table}${query?'?'+query:''}`,{method,headers:H,body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error('Could not save or load site settings.');return d;}
async function getInfo(){const rows=await db('tb_settings','name=eq.site_info&select=value&limit=1');return {...DEFAULT_INFO,...(rows[0]?.value||{})};}
async function owner(req:Request){const r=await fetch(`${BASE}?action=session`,{method:'GET',headers:{authorization:req.headers.get('authorization')||'', 'x-gate':req.headers.get('x-gate')||'', 'x-client-ip':req.headers.get('x-client-ip')||''}});if(!r.ok)return false;const d=await r.json().catch(()=>({}));return d?.user?.role==='owner';}
async function proxy(req:Request,action:string){const headers:Record<string,string>={'content-type':'application/json',authorization:req.headers.get('authorization')||'', 'x-gate':req.headers.get('x-gate')||'', 'x-client-ip':req.headers.get('x-client-ip')||''};const r=await fetch(`${BASE}?action=${encodeURIComponent(action)}`,{method:req.method,headers,body:req.method==='POST'?await req.text():undefined});const text=await r.text();let data:any;try{data=JSON.parse(text);}catch{return new Response(text,{status:r.status,headers:{'content-type':r.headers.get('content-type')||'text/plain','cache-control':'no-store'}});}if(r.ok&&(action==='catalog'||action==='owner-data'))data.info=await getInfo();return json(data,r.status);}
Deno.serve(async(req:Request)=>{
  if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed'},405);
  const action=new URL(req.url).searchParams.get('action')||'catalog';
  try{
    if(action==='site-info-save'){
      if(req.method!=='POST')return json({error:'Method not allowed'},405);
      if(!await owner(req))return json({error:'Owner login required.'},403);
      const b=await req.json();
      const info={version:clean(b.version,24)||DEFAULT_INFO.version,eyebrow:clean(b.eyebrow,80)||DEFAULT_INFO.eyebrow,title:clean(b.title,160)||DEFAULT_INFO.title,intro:clean(b.intro,1000)||DEFAULT_INFO.intro,story:clean(b.story,5000),values:clean(b.values,3000),contact:clean(b.contact,300),image_url:safeUrl(b.image_url),image_alt:clean(b.image_alt,180)||DEFAULT_INFO.image_alt,image_credit:clean(b.image_credit,180),image_credit_url:b.image_credit_url?safeUrl(b.image_credit_url):'',announcement:clean(b.announcement,220),show_announcement:b.show_announcement===true};
      const existing=await db('tb_settings','name=eq.site_info&select=name&limit=1');
      if(existing[0])await db('tb_settings','name=eq.site_info','PATCH',{value:info});else await db('tb_settings','','POST',{name:'site_info',value:info});
      return json({ok:true,info:{...DEFAULT_INFO,...info}});
    }
    return await proxy(req,action);
  }catch(e){return json({error:e instanceof Error?e.message:'Something went wrong. Please try again.'},400);}
});