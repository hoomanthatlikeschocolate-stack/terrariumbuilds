const SOURCES=[
  'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js',
  'https://unpkg.com/three@0.160.1/build/three.module.js',
  'https://raw.githubusercontent.com/mrdoob/three.js/r160/build/three.module.js'
];
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','text/javascript; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  let last='unknown';
  for(const source of SOURCES){
    try{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),8000);
      const r=await fetch(source,{signal:controller.signal});
      clearTimeout(timer);
      if(!r.ok){last=`${source} -> HTTP ${r.status}`;continue;}
      const code=await r.text();
      if(!code.includes('WebGLRenderer')||!code.includes('Scene')){last=`${source} -> invalid module`;continue;}
      return res.status(200).send(code);
    }catch(err){last=`${source} -> ${err?.message||'fetch failed'}`;}
  }
  return res.status(502).send(`throw new Error(${JSON.stringify('Three.js proxy failed: '+last)})`);
};
