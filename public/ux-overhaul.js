'use strict';
(() => {
  const infoNav=()=>document.querySelector('[data-nav="info"]');
  const setInfoLabel=()=>{const n=infoNav();if(n)n.textContent='Info';};
  setInfoLabel();

  function infoDefaults(i){
    const title=String(i?.title||'').trim();
    const intro=String(i?.intro||'').trim();
    const story=String(i?.story||'').trim();
    const values=String(i?.values||'').trim();
    return {
      eyebrow:String(i?.eyebrow||'').trim()&&i.eyebrow!=='About TerrariumBuilds'?i.eyebrow:'Animal care & habitat information',
      title:title&&title!=='Small worlds, built with care.'?title:'Learn the animal before you build the enclosure.',
      intro:intro&&!intro.startsWith('TerrariumBuilds is here')?intro:'Good habitat design starts with biology. Different animals need different temperature ranges, humidity, lighting, ventilation, substrates, water access, and enclosure shapes.',
      story:story&&!story.startsWith('We focus on practical habitat guides')?story:'Use the information here as a starting point, then read the full species guide and current veterinary-quality husbandry sources before bringing an animal home.',
      values:values&&!values.includes('Animal-first care\nNatural-looking materials')?values:'Research the exact species first\nMatch the enclosure to the animal, not the decoration\nMeasure heat, humidity, and lighting instead of guessing\nUse safe water, substrates, plants, and materials\nKeep updating care as better information becomes available'
    };
  }

  const animalFacts=[
    {title:'Chameleons',tag:'Arboreal reptiles',facts:['Most chameleons are built for climbing, so usable vertical space and lots of branches matter.','They need species-appropriate UVB and a temperature gradient so they can regulate body temperature.','Many chameleons drink droplets from leaves more readily than standing water, so hydration and ventilation have to be planned together.','Constantly wet, stagnant enclosures can create problems; airflow matters just as much as humidity.']},
    {title:'Toads',tag:'Terrestrial amphibians',facts:['Toads absorb water and chemicals through their skin, so clean dechlorinated water and non-toxic materials are important.','Most pet toads benefit from a moisture-retaining substrate with places to burrow and hide, while still having areas that are not waterlogged.','A shallow water dish should be easy to enter and exit and cleaned often.','Temperature and humidity requirements vary by species, so care should be based on the exact toad you keep.']},
    {title:'Reptiles in general',tag:'Ectothermic animals',facts:['Reptiles rely on their environment to regulate body temperature, which is why enclosures need a controlled warm-to-cool gradient.','UVB requirements vary widely by species, but when UVB is required, bulb type, distance, screen blockage, and replacement schedule all matter.','Digital thermometers and hygrometers are more reliable than judging heat or humidity by feel.','A natural-looking enclosure is only useful if it also gives the animal correct temperatures, lighting, hides, movement space, and safe surfaces.']},
    {title:'Amphibians in general',tag:'Sensitive skin',facts:['Amphibian skin is permeable, which makes water quality and chemical exposure especially important.','Avoid soaps, cleaners, pesticides, fertilizers, and unsafe residues anywhere the animal can contact them.','Many amphibians need high humidity, but humidity without ventilation can encourage unhealthy conditions.','Handling should generally be minimized because oils, salts, and residues on human hands can irritate amphibian skin.']}
  ];

  function renderInfo(){
    const i=state.info||{},text=infoDefaults(i);
    const tutorials=(state.tutorials||[]).filter(t=>t&&t.published!==false);
    const image=safeUrl(i.image_url)||safeUrl(tutorials.find(t=>safeUrl(t.image_url))?.image_url||'');
    const values=text.values.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const factCards=animalFacts.map(a=>`<article class="animal-fact-card"><p class="eyebrow">${esc(a.tag)}</p><h2>${esc(a.title)}</h2><ul>${a.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></article>`).join('');
    const guideCards=tutorials.map(t=>`<article class="animal-card"><div class="animal-card-media">${safeUrl(t.image_url)?`<img src="${esc(safeUrl(t.image_url))}" alt="${esc(t.animal)} habitat" loading="lazy">`:`<span class="animal-monogram">${esc(String(t.animal||'?').slice(0,1).toUpperCase())}</span>`}</div><div class="animal-card-body"><p class="eyebrow">${esc(t.animal||'Animal guide')}</p><h2>${esc(t.title)}</h2><p>${esc(t.summary||'Open the guide for habitat setup and care notes.')}</p><a class="btn small outline" href="#tutorial/${esc(t.id)}">Read guide ↗</a></div></article>`).join('');
    $('#main').innerHTML=`<section class="animal-info-hero"><div><p class="eyebrow">${esc(text.eyebrow)}</p><h1>${esc(text.title)}</h1><p class="lead">${esc(text.intro)}</p><div class="animal-hero-actions"><a class="btn" href="#tutorials">Browse habitat guides</a><a class="btn outline" href="#shop">Shop supplies</a></div></div>${image?`<div class="animal-hero-image"><img src="${esc(image)}" alt="${esc(i.image_alt||'Naturalistic animal habitat')}" loading="eager">${imageCredit(i.image_credit,i.image_credit_url)}</div>`:''}</section><section class="animal-principles"><div class="section-head"><div><p class="eyebrow">The basics</p><h2>Build around the animal's biology.</h2></div></div><div class="animal-principle-grid"><article><h3>Why species matters</h3><p>${esc(text.story)}</p></article><article><h3>Care checklist</h3><ul>${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></article></div></section><section class="animal-facts"><div class="section-head"><div><p class="eyebrow">Animal information</p><h2>Useful facts before you build.</h2><p>These are broad care principles. Exact numbers and equipment depend on the species.</p></div></div><div class="animal-fact-grid">${factCards}</div></section><section class="animal-library"><div class="section-head"><div><p class="eyebrow">TerrariumBuilds guides</p><h2>Go deeper by animal.</h2><p>Published tutorials from this site appear here.</p></div><span class="count">${tutorials.length} guide${tutorials.length===1?'':'s'}</span></div><div class="animal-card-grid">${guideCards||'<div class="empty">Animal guides will appear here as soon as they are published.</div>'}</div></section>${i.contact?`<section class="animal-note"><div><p class="eyebrow">Extra care note</p><h2>One more thing.</h2><p>${esc(i.contact)}</p></div></section>`:''}`;
  }

  const previousRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    setInfoLabel();
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      renderInfo();
      return;
    }
    await previousRoute();
    setInfoLabel();
  };

  const previousShop=shop;
  shop=function(){
    previousShop();
    const filters=document.querySelector('.filters');
    if(filters&&!document.querySelector('.shop-jumpbar'))filters.insertAdjacentHTML('beforebegin','<div class="shop-jumpbar"><a href="#tutorials"><span>Habitat guides</span><strong>Build it right ↗</strong></a><a href="#info"><span>Animal info</span><strong>Know the species ↗</strong></a><a href="#shop"><span>Supply shelf</span><strong>Browse materials ↓</strong></a></div>');
  };

  function updateVersionPill(value){
    const v=String(value||state.info?.version||'v1.3').trim()||'v1.3';
    document.querySelectorAll('.owner-version-pill').forEach(x=>x.textContent='Live '+v);
    const badge=document.querySelector('#site-version-badge');if(badge)badge.textContent=v;
    document.querySelectorAll('.version').forEach(x=>x.textContent=v);
  }

  function setLabelText(field,text){
    const label=field?.closest('label');if(!label)return;
    const node=[...label.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    if(node)node.textContent=text+' ';
  }

  function addCounter(field){
    if(!field?.maxLength||field.maxLength<1||field.dataset.counterReady)return;
    field.dataset.counterReady='1';
    const counter=document.createElement('span');counter.className='field-counter';
    const refresh=()=>counter.textContent=`${field.value.length}/${field.maxLength}`;
    field.insertAdjacentElement('afterend',counter);field.addEventListener('input',refresh);refresh();
  }

  function polishEditor(){
    const form=document.querySelector('#site-info-form');
    if(form&&!form.dataset.animalEditor){
      form.dataset.animalEditor='1';
      const head=document.querySelector('.owner-section-title');
      if(head){const eyebrow=head.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Animal information + website';const h=head.querySelector('h2');if(h)h.textContent='Info & site settings';const p=head.querySelector('.small-note');if(p)p.textContent='Edit the public Info page, its animal-care introduction, site version, announcement, and image.';}
      const sections=form.querySelectorAll('.editor-section');
      if(sections[0]){const h=sections[0].querySelector('h3');if(h)h.textContent='Info page';const p=sections[0].querySelector('.editor-section-head p');if(p)p.textContent='Customize the introduction and general care guidance shown above the animal information.';}
      setLabelText(form.elements.eyebrow,'Small heading');
      setLabelText(form.elements.title,'Main Info page heading');
      setLabelText(form.elements.intro,'Animal-care introduction');
      setLabelText(form.elements.story,'General care guidance');
      setLabelText(form.elements.values,'Care checklist — one per line');
      setLabelText(form.elements.contact,'Extra animal-care note (optional)');
      [...form.querySelectorAll('input[maxlength],textarea[maxlength]')].forEach(addCounter);
    }
    const versionInput=form?.elements?.version;if(versionInput)updateVersionPill(versionInput.value);
  }

  function polishOwner(){
    updateVersionPill();polishEditor();
    const chat=document.querySelector('.chatbox');
    if(chat&&!chat.querySelector('.chat-help'))chat.querySelector('#chat-form')?.insertAdjacentHTML('afterbegin','<div class="chat-help"><strong>Owner chat</strong><span>Enter sends · Shift+Enter makes a new line</span></div>');
  }

  const previousOwnerSection=ownerSection;
  ownerSection=async function(){await previousOwnerSection();polishOwner();};
  const previousOwner=owner;
  owner=async function(n){await previousOwner(n);polishOwner();};

  function messageKey(m,index){return String(m.id||m.message_id||`${m.username||''}|${m.created_at||''}|${m.message||''}|${m.image_url||''}|${index}`);}
  function createMessage(m,key){
    const node=document.createElement('div');node.className='message '+(m.username===state.user?.username?'mine':'');node.dataset.chatKey=key;
    const img=safeUrl(m.image_url);
    node.innerHTML=`<strong>${esc(m.username)}</strong><p>${esc(m.message)}</p>${img?`<a class="message-attachment" href="${esc(img)}" target="_blank" rel="noopener noreferrer"><img src="${esc(img)}" alt="Owner chat attachment" loading="lazy" decoding="async"></a>`:''}<small>${esc(new Date(m.created_at).toLocaleString())}</small>`;
    return node;
  }

  // Reconcile messages instead of replacing the whole chat. Existing image nodes stay alive,
  // so polling no longer reloads images or yanks the scroll position around.
  loadChat=async function(forceBottom=false){
    try{
      const rows=await api('chat-list');
      const el=document.querySelector('#messages');if(!el)return;
      const firstLoad=el.dataset.chatLoaded!=='1';
      const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
      const oldTop=el.scrollTop;
      const existing=new Map([...el.querySelectorAll('.message[data-chat-key]')].map(n=>[n.dataset.chatKey,n]));
      const keep=new Set();
      const fragment=document.createDocumentFragment();
      rows.forEach((m,index)=>{
        const key=messageKey(m,index);keep.add(key);
        const node=existing.get(key)||createMessage(m,key);
        fragment.appendChild(node);
      });
      existing.forEach((node,key)=>{if(!keep.has(key))node.remove();});
      if(rows.length){el.querySelector('.empty')?.remove();el.appendChild(fragment);}else if(!el.querySelector('.empty'))el.innerHTML='<div class="empty">No messages yet. Leave the first note.</div>';
      el.dataset.chatLoaded='1';
      requestAnimationFrame(()=>{el.scrollTop=(forceBottom||firstLoad||atBottom)?el.scrollHeight:oldTop;});
    }catch(e){if(forceBottom&&document.querySelector('#messages'))document.querySelector('#messages').innerHTML=`<p class="form-error">${esc(e.message)}</p>`;}
  };

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='chat-text'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();const form=e.target.form;
      if(form&&!form.querySelector('button[type=submit]')?.disabled&&e.target.value.trim())form.requestSubmit();
    }
  });

  document.addEventListener('input',e=>{
    if(e.target?.name==='version'&&e.target.closest('#site-info-form'))updateVersionPill(e.target.value);
    if(e.target.matches?.('input[maxlength],textarea[maxlength]'))addCounter(e.target);
  });
  document.addEventListener('submit',e=>{if(e.target?.id==='site-info-form')setTimeout(()=>updateVersionPill(e.target.elements.version?.value),700);});
})();