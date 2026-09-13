'use strict';
(() => {
  const nav=()=>document.querySelector('[data-nav="info"]');
  const labelInfo=()=>{const n=nav();if(n)n.textContent='Info';};

  const animalFacts=[
    {title:'Chameleons',tag:'Arboreal reptiles',facts:['Most chameleons are built for climbing, so usable vertical space and lots of branches matter.','They need species-appropriate UVB and a temperature gradient so they can regulate body temperature.','Many chameleons drink droplets from leaves more readily than standing water, so hydration and ventilation have to be planned together.','Constantly wet, stagnant enclosures can create problems; airflow matters just as much as humidity.']},
    {title:'Toads',tag:'Terrestrial amphibians',facts:['Toads absorb water and chemicals through their skin, so clean dechlorinated water and non-toxic materials are important.','Most pet toads benefit from a moisture-retaining substrate with places to burrow and hide, while still having areas that are not waterlogged.','A shallow water dish should be easy to enter and exit and cleaned often.','Temperature and humidity requirements vary by species, so care should be based on the exact toad you keep.']},
    {title:'Reptiles in general',tag:'Ectothermic animals',facts:['Reptiles rely on their environment to regulate body temperature, which is why enclosures need a controlled warm-to-cool gradient.','UVB requirements vary by species, but when UVB is needed, bulb type, distance, screen blockage, and replacement schedule all matter.','Digital thermometers and hygrometers are more reliable than judging heat or humidity by feel.','A natural-looking enclosure only works if it also provides correct temperatures, lighting, hides, movement space, and safe surfaces.']},
    {title:'Amphibians in general',tag:'Sensitive skin',facts:['Amphibian skin is permeable, which makes water quality and chemical exposure especially important.','Avoid soaps, cleaners, pesticides, fertilizers, and unsafe residues anywhere the animal can contact them.','Many amphibians need high humidity, but humidity without ventilation can encourage unhealthy conditions.','Handling should generally be minimized because oils, salts, and residues on human hands can irritate amphibian skin.']}
  ];

  function infoPage(){
    const i=state.info||{};
    const tutorials=(state.tutorials||[]).filter(t=>t&&t.published!==false);
    const facts=animalFacts.map(a=>`<article class="animal-fact-card"><p class="eyebrow">${esc(a.tag)}</p><h2>${esc(a.title)}</h2><ul>${a.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></article>`).join('');
    const cards=tutorials.map(t=>`<article class="animal-card"><div class="animal-card-media">${safeUrl(t.image_url)?`<img src="${esc(safeUrl(t.image_url))}" alt="${esc(t.animal)} habitat" loading="lazy">`:`<span class="animal-monogram">${esc(String(t.animal||'?').slice(0,1).toUpperCase())}</span>`}</div><div class="animal-card-body"><p class="eyebrow">${esc(t.animal||'Animal guide')}</p><h2>${esc(t.title)}</h2><p>${esc(t.summary||'Open the guide for habitat setup and care notes.')}</p><a class="btn small outline" href="#tutorial/${esc(t.id)}">Read guide ↗</a></div></article>`).join('');
    const customIntro=String(i.intro||'').trim()&&!String(i.intro||'').startsWith('TerrariumBuilds is here')?String(i.intro).trim():'Good habitat design starts with biology. Different animals need different temperature ranges, humidity, lighting, ventilation, substrates, water access, and enclosure shapes.';
    const customStory=String(i.story||'').trim()&&!String(i.story||'').startsWith('We focus on practical habitat guides')?String(i.story).trim():'Use this page as a starting point, then read the full species guide and current veterinary-quality husbandry sources before bringing an animal home.';
    $('#main').innerHTML=`<section class="animal-info-hero"><div><p class="eyebrow">Animal care & habitat information</p><h1>Learn the animal before you build the enclosure.</h1><p class="lead">${esc(customIntro)}</p><div class="animal-hero-actions"><a class="btn" href="#tutorials">Browse habitat guides</a><a class="btn outline" href="#shop">Shop supplies</a></div></div></section><section class="animal-principles"><div class="section-head"><div><p class="eyebrow">The basics</p><h2>Build around the animal's biology.</h2></div></div><div class="animal-principle-grid"><article><h3>Why species matters</h3><p>${esc(customStory)}</p></article><article><h3>Core care checks</h3><ul><li>Research the exact species first</li><li>Measure heat, humidity, and lighting instead of guessing</li><li>Choose safe water, substrate, plants, and materials</li><li>Give the animal the right space to climb, hide, burrow, or bask</li><li>Keep checking care information as recommendations improve</li></ul></article></div></section><section class="animal-facts"><div class="section-head"><div><p class="eyebrow">Animal information</p><h2>Useful facts before you build.</h2><p>These are broad care principles. Exact numbers and equipment depend on the species.</p></div></div><div class="animal-fact-grid">${facts}</div></section><section class="animal-library"><div class="section-head"><div><p class="eyebrow">TerrariumBuilds guides</p><h2>Go deeper by animal.</h2><p>Published tutorials from this site appear here.</p></div><span class="count">${tutorials.length} guide${tutorials.length===1?'':'s'}</span></div><div class="animal-card-grid">${cards||'<div class="empty">Animal guides will appear here as soon as they are published.</div>'}</div></section>`;
  }

  const baseRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    labelInfo();
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      infoPage();return;
    }
    await baseRoute();labelInfo();
  };

  function syncVersion(v){
    const value=String(v||state.info?.version||'v1.3').trim()||'v1.3';
    document.querySelectorAll('.owner-version-pill').forEach(x=>x.textContent='Live '+value);
    const badge=document.querySelector('#site-version-badge');if(badge)badge.textContent=value;
    document.querySelectorAll('.version').forEach(x=>x.textContent=value);
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
  }

  const baseOwnerSection=ownerSection;
  ownerSection=async function(){await baseOwnerSection();polishOwner();};
  const baseOwner=owner;
  owner=async function(n){await baseOwner(n);polishOwner();};

  function msgKey(m,index){return String(m.id||m.message_id||`${m.username||''}|${m.created_at||''}|${m.message||''}|${m.image_url||''}|${index}`);}
  function makeMessage(m,key){
    const node=document.createElement('div');node.className='message '+(m.username===state.user?.username?'mine':'');node.dataset.chatKey=key;
    const img=safeUrl(m.image_url);
    node.innerHTML=`<strong>${esc(m.username)}</strong><p>${esc(m.message)}</p>${img?`<a class="message-attachment" href="${esc(img)}" target="_blank" rel="noopener noreferrer"><img src="${esc(img)}" alt="Owner chat attachment" loading="lazy" decoding="async"></a>`:''}<small>${esc(new Date(m.created_at).toLocaleString())}</small>`;
    return node;
  }

  // Keep existing message/image DOM nodes alive between polls instead of rebuilding them.
  // That prevents attachments from reloading and prevents the browser from jumping to them.
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

  labelInfo();
})();