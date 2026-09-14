const SOURCE='https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','text/javascript; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  try{
    const r=await fetch(SOURCE,{signal:AbortSignal.timeout(10000)});
    if(!r.ok)return res.status(502).send(`throw new Error('Three.js proxy failed: ${r.status}')`);
    let code=await r.text();
    code=code.replace("from './three.core.js'","from '/api/three.core.js'");
    return res.status(200).send(code);
  }catch(err){
    return res.status(502).send(`throw new Error(${JSON.stringify('Three.js proxy error: '+(err?.message||'unknown'))})`);
  }
};
