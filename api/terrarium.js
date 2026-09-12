const ENDPOINT='https://yhqyijxivqxnwdbbgsno.supabase.co/functions/v1/terrariumbuilds-api-v2';
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
  if(req.method==='POST'&&req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Origin not allowed'});}catch{return res.status(403).json({error:'Invalid origin'});}}
  const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split(/=(.*)/s).slice(0,2)));
  const action=String(req.query.action||'catalog');
  const headers={'content-type':'application/json','authorization':`Bearer ${cookies.tb_session||''}`,'x-gate':cookies.tb_gate||'','x-client-ip':String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0]};
  try{
    const r=await fetch(`${ENDPOINT}?action=${encodeURIComponent(action)}`,{method:req.method,headers,body:req.method==='POST'?JSON.stringify(req.body||{}):undefined,signal:AbortSignal.timeout(20000)});
    const d=await r.json();const set=[];
    const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
    if(d.sessionToken){set.push(cookie('tb_session',d.sessionToken,d.maxAge||43200));delete d.sessionToken;delete d.maxAge;set.push(cookie('tb_gate','',0));}
    if(d.gatewayToken){set.push(cookie('tb_gate',d.gatewayToken,300));delete d.gatewayToken;}
    if(action==='logout'&&r.ok){set.push(cookie('tb_session','',0),cookie('tb_gate','',0));}
    if(set.length)res.setHeader('Set-Cookie',set);
    return res.status(r.status).json(d);
  }catch{return res.status(502).json({error:'The server could not be reached. Please try again.'});}
};