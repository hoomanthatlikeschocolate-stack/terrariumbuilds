(()=>{
  const OLD='TerrariumBuilds',NEW='Terrariums & Aquariums';
  function replaceText(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){if(n.nodeValue&&n.nodeValue.includes(OLD))n.nodeValue=n.nodeValue.replaceAll(OLD,NEW);}
    root.querySelectorAll?.('[aria-label],[alt],[title]').forEach(el=>{
      for(const a of ['aria-label','alt','title']){const v=el.getAttribute(a);if(v&&v.includes(OLD))el.setAttribute(a,v.replaceAll(OLD,NEW));}
    });
  }
  replaceText();
  let queued=false;
  const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;replaceText();});});
  obs.observe(document.body,{subtree:true,childList:true,characterData:true});
})();