'use strict';
(() => {
  const nav=()=>document.querySelector('[data-nav="info"]');
  const labelInfo=()=>{const n=nav();if(n)n.textContent='Info';};

  const animalFacts=[
    {title:'Chameleons',tag:'Arboreal reptiles',facts:['Most chameleons are built for climbing, so usable vertical space, branches, and foliage are important.','They need a species-appropriate temperature gradient and many commonly kept species require correctly positioned UVB lighting.','Hydration is often provided through misting or droplets on leaves rather than relying only on a standing water bowl.','Humidity should be balanced with good airflow; constantly wet, stagnant air is not the goal.','Frequent handling can be stressful for many chameleons, so enclosure design should provide cover and visual security.']},
    {title:'Toads',tag:'Terrestrial amphibians',facts:['Toads have permeable skin, so clean dechlorinated water and non-toxic enclosure materials matter.','Many species benefit from a moisture-retaining substrate deep enough to dig or burrow in.','A shallow water dish should be easy to enter and exit and should be cleaned frequently.','Hides and shaded areas help reduce stress and give the animal choices within the enclosure.','Exact temperature and humidity targets depend on the species and its natural range.']},
    {title:'Reptiles in general',tag:'Ectothermic animals',facts:['Reptiles depend on their surroundings to regulate body temperature, which is why controlled warm and cool zones are important.','Heating equipment should be regulated and temperatures should be measured with reliable digital tools rather than guessed by touch.','Lighting needs vary: some species have strong UVB requirements while others have different exposure patterns.','Hides, climbing space, digging opportunities, basking sites, or water access should match the natural behavior of the species.','Natural-looking decor is useful only when it also supports correct husbandry and safe movement.']},
    {title:'Amphibians in general',tag:'Sensitive skin',facts:['Amphibian skin is highly permeable, making water quality and chemical exposure especially important.','Avoid residues from soaps, cleaners, pesticides, fertilizers, fragrances, and unsafe metals.','High humidity does not mean zero ventilation; fresh airflow still matters.','Handling should usually be minimized because oils, salts, and residues on hands can irritate amphibian skin.','Substrate and water conditions should be chosen around the exact species rather than one generic amphibian setup.']}
  ];

  const careTopics=[
    {label:'Environment',title:'Temperature & lighting',text:'Create the temperature range the species needs, provide the correct day/night cycle, and use UVB when appropriate. Measure actual enclosure conditions instead of relying on room temperature or guesswork.'},
    {label:'Water',title:'Humidity & hydration',text:'Humidity, misting, drainage, airflow, and drinking water all work together. Too dry can be dangerous, but permanently wet and stagnant conditions can be harmful too.'},
    {label:'Home',title:'Space & enclosure shape',text:'A climbing animal needs usable height. A burrower needs floor space and substrate depth. An aquatic or semi-aquatic species needs safe water access. Build around behavior, not just appearance.'},
    {label:'Food',title:'Feeding & nutrition',text:'Diet varies enormously by species. Insect-eaters may need appropriately sized feeders and supplementation, while herbivores or omnivores need completely different nutrition plans.'},
    {label:'Behavior',title:'Hides, enrichment & stress',text:'Give animals choices: hiding places, branches, cover, burrowing areas, basking sites, and visual barriers where appropriate. A beautiful enclosure should also help the animal feel secure.'},
    {label:'Health',title:'Cleaning & monitoring',text:'Remove waste, refresh water, monitor temperature and humidity, watch appetite and behavior, and keep enclosure equipment working correctly. Sudden behavior changes can be a sign that something is wrong.'}
  ];

  function infoPage(){
    const i=state.info||{};
    const tutorials=(state.tutorials||[]).filter(t=>t&&t.published!==false);
    const facts=animalFacts.map(a=>`<article class="animal-fact-card"><p class="eyebrow">${esc(a.tag)}</p><h2>${esc(a.title)}</h2><ul>${a.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></article>`).join('');
    const care=careTopics.map(c=>`<article class="info-care-card"><span class="mini-label">${esc(c.label)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('');
    const cards=tutorials.map(t=>`<article class="animal-card"><div class="animal-card-media">${safeUrl(t.image_url)?`<img src="${esc(safeUrl(t.image_url))}" alt="${esc(t.animal)} habitat" loading="lazy">`:`<span class="animal-monogram">${esc(String(t.animal||'?').slice(0,1).toUpperCase())}</span>`}</div><div class="animal-card-body"><p class="eyebrow">${esc(t.animal||'Animal guide')}</p><h2>${esc(t.title)}</h2><p>${esc(t.summary||'Open the guide for habitat setup and care notes.')}</p><a class="btn small outline" href="#tutorial/${esc(t.id)}">Read guide ↗</a></div></article>`).join('');
    const customIntro=String(i.intro||'').trim()&&!String(i.intro||'').startsWith('TerrariumBuilds is here')?String(i.intro).trim():'Good habitat design starts with biology. Different animals need different temperature ranges, humidity, lighting, ventilation, substrates, water access, diets, and enclosure shapes.';
    const customStory=String(i.story||'').trim()&&!String(i.story||'').startsWith('We focus on practical habitat guides')?String(i.story).trim():'Use this page as a starting point, then read the full species guide and current veterinary-quality husbandry sources before bringing an animal home.';
    $('#main').innerHTML=`<section class="animal-info-hero"><div><p class="eyebrow">Animal care & habitat information</p><h1>Learn the animal before you build the enclosure.</h1><p class="lead">${esc(customIntro)}</p><div class="animal-hero-actions"><a class="btn" href="#tutorials">Browse habitat guides</a><a class="btn outline" href="#shop">Shop supplies</a></div></div></section><section class="animal-principles"><div class="section-head"><div><p class="eyebrow">The basics</p><h2>Build around the animal's biology.</h2></div></div><div class="animal-principle-grid"><article><h3>Why species matters</h3><p>${esc(customStory)}</p></article><article><h3>Core care checks</h3><ul><li>Research the exact species first</li><li>Measure heat, humidity, and lighting instead of guessing</li><li>Choose safe water, substrate, plants, and materials</li><li>Give the animal the right space to climb, hide, burrow, or bask</li><li>Keep checking care information as recommendations improve</li></ul></article></div></section><section><div class="section-head"><div><p class="eyebrow">Habitat checklist</p><h2>Six things every build should answer.</h2><p>These categories help you check whether a setup works for the animal, not just whether it looks good.</p></div></div><div class="info-care-grid">${care}</div><div class="info-tip"><span>🌿</span><div><strong>Naturalistic does not automatically mean safe.</strong><div>Wood, rocks, plants, moss, substrate, and decor still need to be appropriate for the species, securely placed, clean, and free of harmful chemicals or sharp hazards.</div></div></div></section><section class="animal-facts"><div class="section-head"><div><p class="eyebrow">Animal information</p><h2>Useful facts before you build.</h2><p>These are broad care principles. Exact numbers and equipment depend on the species.</p></div></div><div class="animal-fact-grid">${facts}</div></section><section class="animal-library"><div class="section-head"><div><p class="eyebrow">TerrariumBuilds guides</p><h2>Go deeper by animal.</h2><p>Published tutorials from this site appear here.</p></div><span class="count">${tutorials.length} guide${tutorials.length===1?'':'s'}</span></div><div class="animal-card-grid">${cards||'<div class="empty">Animal guides will appear here as soon as they are published.</div>'}</div></section>`;
  }

  let revealObserver;
  function smoothPage(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(!revealObserver)revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tb-visible');revealObserver.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -30px'});
    document.querySelectorAll('#main section,#main .product,#main .guide,#main .animal-card,#main .animal-fact-card,#main .info-care-card').forEach((el,i)=>{if(el.dataset.revealReady)return;el.dataset.revealReady='1';el.classList.add('tb-reveal');el.style.transitionDelay=Math.min(i%6,5)*35+'ms';revealObserver.observe(el);});
  }

  const baseRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    labelInfo();
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      infoPage();smoothPage();return;
    }
    await baseRoute();labelInfo();smoothPage();
  };

  function syncVersion(v){
    const value=String(v||state.info?.version||'v1.3').trim()||'v1.3';
    document.querySelectorAll('.owner-version-pill').forEach(x=>x.textContent='Live '+value);
    const badge=document.querySelector('#site-version-badge');if(badge)badge.textContent=value;
    document.querySelectorAll('.version').forEach(x=>x.textContent=value);
  }

  function addOwnerTools(){
    const content=document.querySelector('#owner-content');if(!content||content.querySelector('.owner-power-tools'))return;
    const products=state.ownerProducts||[],tutorials=state.ownerTutorials||[];
    const liveProducts=products.filter(x=>x.published).length,liveTutorials=tutorials.filter(x=>x.published).length,drafts=products.filter(x=>!x.published).length+tutorials.filter(x=>!x.published).length;
    const tools=document.createElement('div');tools.className='owner-power-tools';
    tools.innerHTML=`<section class="owner-tool-card"><h3>Quick site tools</h3><p>Preview the public site, refresh owner data, copy the live link, or clear old local editor drafts.</p><div class="owner-tool-actions"><a class="btn small outline" href="#shop">Preview shop</a><a class="btn small outline" href="#tutorials">Preview tutorials</a><a class="btn small outline" href="#info">Preview info</a><button class="btn small outline" type="button" data-owner-tool="copy">Copy live link</button><button class="btn small outline" type="button" data-owner-tool="refresh">Refresh data</button><button class="btn small outline" type="button" data-owner-tool="drafts">Clear saved drafts</button></div></section><section class="owner-tool-card"><h3>Site snapshot</h3><p>A quick count of what is currently in the owner workspace.</p><div class="owner-snapshot"><div><strong>${liveProducts}</strong><span>live items</span></div><div><strong>${liveTutorials}</strong><span>live guides</span></div><div><strong>${drafts}</strong><span>drafts</span></div></div></section>`;
    const head=document.querySelector('.owner-head');if(head)head.insertAdjacentElement('afterend',tools);else content.prepend(tools);
  }

  function polishOwner(){
    labelInfo();syncVersion();
    const f=document.querySelector('#site-info-form');
    if(f&&!f.dataset.polished){
      f.dataset.polished='1';
      const head=document.querySelector('.owner-section-title');
      if(head){const h=head.querySelector('h2');if(h)h.textContent='Info & site settings';const p=head.querySelector('.small-note');if(p)p.textContent='Edit the public Info page and website settings here.';}
      const s=f.querySelector('.editor-section h3');if(s)s.textContent='Info page';
    }
    const chat=document.querySelector('.chatbox');
    if(chat&&!chat.querySelector('.chat-help'))chat.querySelector('#chat-form')?.insertAdjacentHTML('afterbegin','<div class="chat-help"><strong>Owner chat</strong><span>Enter sends · Shift+Enter makes a new line</span></div>');
    addOwnerTools();
  }

  const baseOwnerSection=ownerSection;
  ownerSection=async function(){await baseOwnerSection();polishOwner();};
  const baseOwner=owner;
  owner=async function(n){await baseOwner(n);polishOwner();};

  function msgKey(m,index){return String(m.id||m.message_id||`${m.username||''}|${m.created_at||''}|${m.message||''}|${m.image_url||''}|${index}`);}
  function makeMessage(m,key){
    const node=document.createElement('div');node.className='message '+(m.username===state.user?.username?'mine':'');node.dataset.chatKey=key;
    const img=safeUrl(m.image_url);
    node.innerHTML=`<strong>${esc(m.username)}</strong><p>${esc(m.message)}</p>${img?`<a class="message-attachment" href="${esc(img)}" target="_blank" rel="noopener noreferrer"><img src="${esc(img)}" alt="Owner chat attachment" loading="lazy" decoding="async" width="640" height="420"></a>`:''}<small>${esc(new Date(m.created_at).toLocaleString())}</small>`;
    return node;
  }

  loadChat=async function(forceBottom=false){
    try{
      const rows=await api('chat-list');
      const el=document.querySelector('#messages');if(!el)return;
      const first=el.dataset.chatLoaded!=='1';
      const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
      const oldTop=el.scrollTop;
      const existing=new Map([...el.querySelectorAll('.message[data-chat-key]')].map(n=>[n.dataset.chatKey,n]));
      const keep=new Set();
      const frag=document.createDocumentFragment();
      rows.forEach((m,index)=>{const key=msgKey(m,index);keep.add(key);frag.appendChild(existing.get(key)||makeMessage(m,key));});
      existing.forEach((node,key)=>{if(!keep.has(key))node.remove();});
      el.querySelector('.empty')?.remove();
      if(rows.length)el.appendChild(frag);else if(!el.querySelector('.empty'))el.innerHTML='<div class="empty">No messages yet. Leave the first note.</div>';
      el.dataset.chatLoaded='1';
      requestAnimationFrame(()=>{el.scrollTop=(forceBottom||first||atBottom)?el.scrollHeight:oldTop;});
    }catch(e){if(forceBottom&&document.querySelector('#messages'))document.querySelector('#messages').innerHTML=`<p class="form-error">${esc(e.message)}</p>`;}
  };

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='chat-text'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();const f=e.target.form;if(f&&e.target.value.trim())f.requestSubmit();
    }
  });
  document.addEventListener('input',e=>{if(e.target?.name==='version'&&e.target.closest('#site-info-form'))syncVersion(e.target.value);});
  document.addEventListener('submit',e=>{if(e.target?.id==='site-info-form')setTimeout(()=>syncVersion(e.target.elements.version?.value),800);});
  document.addEventListener('click',async e=>{
    const tool=e.target.closest?.('[data-owner-tool]');if(tool){
      if(tool.dataset.ownerTool==='copy'){try{await navigator.clipboard.writeText(location.origin+'/');toast('Live site link copied.');}catch{toast('Could not copy the link.');}}
      if(tool.dataset.ownerTool==='refresh'){tool.disabled=true;try{await ownerSection();toast('Owner data refreshed.');}finally{tool.disabled=false;}}
      if(tool.dataset.ownerTool==='drafts'){if(confirm('Clear locally saved listing and tutorial drafts from this browser?')){try{localStorage.removeItem('tb-owner-tutorial-draft');localStorage.removeItem('tb-owner-product-draft');toast('Saved editor drafts cleared.');}catch{}}}
      return;
    }
    if(matchMedia('(pointer: coarse)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(e.target.closest('button,a,input,textarea,select,label,dialog,.chatbox'))return;
    const now=Date.now(),last=Number(sessionStorage.getItem('tb-critter-last')||0);if(now-last<7000)return;sessionStorage.setItem('tb-critter-last',String(now));
    const critter=document.createElement('div');critter.className='tb-chameleon';critter.textContent='🦎';document.body.appendChild(critter);
    let x=e.clientX,y=e.clientY;const move=ev=>{x=ev.clientX;y=ev.clientY;critter.style.left=(x+16)+'px';critter.style.top=(y+10)+'px';critter.classList.toggle('hug',true);};
    critter.style.left=(x+16)+'px';critter.style.top=(y+10)+'px';document.addEventListener('pointermove',move);
    setTimeout(()=>critter.classList.add('hug'),150);setTimeout(()=>{critter.style.opacity='0';document.removeEventListener('pointermove',move);setTimeout(()=>critter.remove(),220);},2600);
  });

  labelInfo();smoothPage();
})();