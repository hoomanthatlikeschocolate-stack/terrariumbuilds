'use strict';
(() => {
  const animalNav=()=>document.querySelector('[data-nav="info"]');
  const setAnimalLabel=()=>{const n=animalNav();if(n)n.textContent='Animals';};
  setAnimalLabel();

  function infoDefaults(i){
    const title=String(i?.title||'').trim();
    const intro=String(i?.intro||'').trim();
    const story=String(i?.story||'').trim();
    const values=String(i?.values||'').trim();
    return {
      eyebrow: String(i?.eyebrow||'').trim() && i.eyebrow!=='About TerrariumBuilds' ? i.eyebrow : 'Animal care library',
      title: title && title!=='Small worlds, built with care.' ? title : 'Know the animal before you build the habitat.',
      intro: intro && !intro.startsWith('TerrariumBuilds is here') ? intro : 'Browse the animals covered by our care guides, compare their needs, and start with the right environment before choosing decorations.',
      story: story && !story.startsWith('We focus on practical habitat guides') ? story : 'Every species has different requirements for enclosure size, heat, UVB, humidity, ventilation, substrate, feeding, and enrichment. Use each animal guide as a starting point and check current veterinary-quality care information before bringing an animal home.',
      values: values && !values.includes('Animal-first care\nNatural-looking materials') ? values : 'Research the species first\nBuild around the animal, not the decoration\nUse safe temperatures, humidity, lighting, and ventilation\nKeep checking care information as recommendations improve'
    };
  }

  function renderAnimalInfo(){
    const i=state.info||{};
    const text=infoDefaults(i);
    const tutorials=(state.tutorials||[]).filter(t=>t&&t.published!==false);
    const seen=new Set();
    const animals=tutorials.filter(t=>{const k=String(t.animal||'').trim().toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true;});
    const image=safeUrl(i.image_url)||safeUrl(animals.find(a=>safeUrl(a.image_url))?.image_url||'');
    const values=text.values.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const animalCards=animals.map(t=>`<article class="animal-card"><div class="animal-card-media">${safeUrl(t.image_url)?`<img src="${esc(safeUrl(t.image_url))}" alt="${esc(t.animal)}" loading="lazy">`:'<span class="animal-monogram">'+esc(String(t.animal||'?').slice(0,1).toUpperCase())+'</span>'}</div><div class="animal-card-body"><p class="eyebrow">${esc(t.difficulty||'Care guide')}</p><h2>${esc(t.animal)}</h2><p>${esc(t.summary||'Explore habitat and care information for this animal.')}</p><a class="btn small outline" href="#tutorial/${esc(t.id)}">Open care guide ↗</a></div></article>`).join('');
    $('#main').innerHTML=`<section class="animal-info-hero"><div><p class="eyebrow">${esc(text.eyebrow)}</p><h1>${esc(text.title)}</h1><p class="lead">${esc(text.intro)}</p><div class="animal-hero-actions"><a class="btn" href="#tutorials">Browse all guides</a><a class="btn outline" href="#shop">Shop habitat supplies</a></div></div>${image?`<div class="animal-hero-image"><img src="${esc(image)}" alt="${esc(i.image_alt||'Animal habitat care')}" loading="eager">${imageCredit(i.image_credit,i.image_credit_url)}</div>`:''}</section><section class="animal-principles"><div class="section-head"><div><p class="eyebrow">Care first</p><h2>Start with the animal's needs.</h2></div></div><div class="animal-principle-grid"><article><h3>Research before building</h3><p>${esc(text.story)}</p></article><article><h3>Core care checks</h3><ul>${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></article></div></section><section class="animal-library"><div class="section-head"><div><p class="eyebrow">Animal library</p><h2>Choose an animal.</h2><p>Each card opens the habitat guide for that species.</p></div><span class="count">${animals.length} animal${animals.length===1?'':'s'}</span></div><div class="animal-card-grid">${animalCards||'<div class="empty">Animal guides will appear here as soon as they are published.</div>'}</div></section>${i.contact?`<section class="animal-note"><div><p class="eyebrow">Extra care note</p><h2>Before you bring an animal home.</h2><p>${esc(i.contact)}</p></div></section>`:''}`;
  }

  const previousRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    setAnimalLabel();
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      renderAnimalInfo();
      return;
    }
    await previousRoute();
    setAnimalLabel();
  };

  const previousShop=shop;
  shop=function(){
    previousShop();
    const filters=document.querySelector('.filters');
    if(filters&&!document.querySelector('.shop-jumpbar')){
      filters.insertAdjacentHTML('beforebegin','<div class="shop-jumpbar"><a href="#tutorials"><span>Habitat guides</span><strong>Build it right ↗</strong></a><a href="#info"><span>Animal care</span><strong>Know the species ↗</strong></a><a href="#shop"><span>Supply shelf</span><strong>Browse materials ↓</strong></a></div>');
    }
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
      if(head){const eyebrow=head.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Animal care + website';const h=head.querySelector('h2');if(h)h.textContent='Animals & site settings';const p=head.querySelector('.small-note');if(p)p.textContent='Edit the public Animals page, image, site version, and announcement from one place.';}
      const sections=form.querySelectorAll('.editor-section');
      if(sections[0]){const h=sections[0].querySelector('h3');if(h)h.textContent='Animals page';const p=sections[0].querySelector('.editor-section-head p');if(p)p.textContent='Write useful animal-care information visitors see in the Animals tab.';}
      setLabelText(form.elements.eyebrow,'Small animal-care heading');
      setLabelText(form.elements.title,'Main Animals page heading');
      setLabelText(form.elements.intro,'Animals page introduction');
      setLabelText(form.elements.story,'General care guidance');
      setLabelText(form.elements.values,'Care principles — one per line');
      setLabelText(form.elements.contact,'Extra animal-care note (optional)');
      [...form.querySelectorAll('input[maxlength],textarea[maxlength]')].forEach(addCounter);
    }
    const versionInput=form?.elements?.version;
    if(versionInput)updateVersionPill(versionInput.value);
  }

  function polishOwner(){
    updateVersionPill();
    polishEditor();
    const chat=document.querySelector('.chatbox');
    if(chat&&!chat.querySelector('.chat-help')){
      const form=chat.querySelector('#chat-form');
      form?.insertAdjacentHTML('afterbegin','<div class="chat-help"><strong>Owner chat</strong><span>Enter sends · Shift+Enter makes a new line</span></div>');
    }
  }

  const previousOwnerSection=ownerSection;
  ownerSection=async function(){await previousOwnerSection();polishOwner();};
  const previousOwner=owner;
  owner=async function(n){await previousOwner(n);polishOwner();};

  // Replace the chat refresh behavior so image loading never drags someone away from where they are reading.
  loadChat=async function(forceBottom=false){
    try{
      const rows=await api('chat-list');
      const el=document.querySelector('#messages');if(!el)return;
      const signature=JSON.stringify(rows);
      if(signature===el.dataset.chatSignature&&el.dataset.loaded)return;
      const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
      const oldTop=el.scrollTop;
      el.innerHTML=rows.map(m=>`<div class="message ${m.username===state.user.username?'mine':''}"><strong>${esc(m.username)}</strong><p>${esc(m.message)}</p>${safeUrl(m.image_url)?`<a href="${esc(safeUrl(m.image_url))}" target="_blank" rel="noopener noreferrer"><img src="${esc(safeUrl(m.image_url))}" alt="Owner chat attachment" loading="lazy"></a>`:''}<small>${esc(new Date(m.created_at).toLocaleString())}</small></div>`).join('')||'<div class="empty">No messages yet. Leave the first note.</div>';
      el.dataset.chatSignature=signature;el.dataset.loaded='true';
      const settle=()=>{el.scrollTop=(forceBottom||atBottom)?el.scrollHeight:oldTop;};
      settle();requestAnimationFrame(settle);
      el.querySelectorAll('img').forEach(img=>{if(!img.complete){img.addEventListener('load',settle,{once:true});img.addEventListener('error',settle,{once:true});}});
    }catch(e){if(forceBottom&&document.querySelector('#messages'))document.querySelector('#messages').innerHTML=`<p class="form-error">${esc(e.message)}</p>`;}
  };

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='chat-text'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();
      const form=e.target.form;if(form&&!form.querySelector('button[type=submit]')?.disabled&&e.target.value.trim())form.requestSubmit();
    }
  });

  document.addEventListener('input',e=>{
    if(e.target?.name==='version'&&e.target.closest('#site-info-form'))updateVersionPill(e.target.value);
    if(e.target.matches?.('input[maxlength],textarea[maxlength]'))addCounter(e.target);
  });

  document.addEventListener('submit',e=>{
    if(e.target?.id==='site-info-form')setTimeout(()=>updateVersionPill(e.target.elements.version?.value),700);
  });

  const observer=new MutationObserver(()=>{setAnimalLabel();polishOwner();});
  observer.observe(document.body,{childList:true,subtree:true});
})();