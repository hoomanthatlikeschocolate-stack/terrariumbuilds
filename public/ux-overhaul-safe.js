'use strict';
(() => {
  const nav=()=>document.querySelector('[data-nav="info"]');
  const labelAnimals=()=>{const n=nav();if(n)n.textContent='Animals';};

  function animalPage(){
    const i=state.info||{};
    const tutorials=(state.tutorials||[]).filter(t=>t&&t.published!==false);
    const seen=new Set();
    const animals=tutorials.filter(t=>{const k=String(t.animal||'').trim().toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true;});
    const cards=animals.map(t=>`<article class="animal-card"><div class="animal-card-media">${safeUrl(t.image_url)?`<img src="${esc(safeUrl(t.image_url))}" alt="${esc(t.animal)}" loading="lazy">`:`<span class="animal-monogram">${esc(String(t.animal||'?').slice(0,1).toUpperCase())}</span>`}</div><div class="animal-card-body"><p class="eyebrow">${esc(t.difficulty||'Care guide')}</p><h2>${esc(t.animal)}</h2><p>${esc(t.summary||'Explore habitat and care information for this animal.')}</p><a class="btn small outline" href="#tutorial/${esc(t.id)}">Open care guide ↗</a></div></article>`).join('');
    $('#main').innerHTML=`<section class="animal-info-hero"><div><p class="eyebrow">Animal care library</p><h1>Know the animal before you build the habitat.</h1><p class="lead">Browse the animals covered by our care guides, compare their needs, and start with the right environment before choosing decorations.</p><div class="animal-hero-actions"><a class="btn" href="#tutorials">Browse all guides</a><a class="btn outline" href="#shop">Shop habitat supplies</a></div></div></section><section class="animal-principles"><div class="section-head"><div><p class="eyebrow">Care first</p><h2>Start with the animal's needs.</h2></div></div><div class="animal-principle-grid"><article><h3>Research before building</h3><p>Every species has different needs for enclosure size, heat, UVB, humidity, ventilation, substrate, feeding, and enrichment. Build around those needs first.</p></article><article><h3>Core care checks</h3><ul><li>Research the species first</li><li>Build around the animal, not the decoration</li><li>Use safe temperatures, humidity, lighting, and ventilation</li><li>Keep checking care information as recommendations improve</li></ul></article></div></section><section class="animal-library"><div class="section-head"><div><p class="eyebrow">Animal library</p><h2>Choose an animal.</h2><p>Each card opens the habitat guide for that species.</p></div><span class="count">${animals.length} animal${animals.length===1?'':'s'}</span></div><div class="animal-card-grid">${cards||'<div class="empty">Animal guides will appear here as soon as they are published.</div>'}</div></section>`;
  }

  const baseRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    labelAnimals();
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      animalPage();return;
    }
    await baseRoute();labelAnimals();
  };

  function syncVersion(v){
    const value=String(v||state.info?.version||'v1.3').trim()||'v1.3';
    document.querySelectorAll('.owner-version-pill').forEach(x=>x.textContent='Live '+value);
    const badge=document.querySelector('#site-version-badge');if(badge)badge.textContent=value;
    document.querySelectorAll('.version').forEach(x=>x.textContent=value);
  }

  function polishOwner(){
    labelAnimals();syncVersion();
    const f=document.querySelector('#site-info-form');
    if(f&&!f.dataset.polished){
      f.dataset.polished='1';
      const head=document.querySelector('.owner-section-title');
      if(head){const h=head.querySelector('h2');if(h)h.textContent='Animals & site settings';const p=head.querySelector('.small-note');if(p)p.textContent='Edit the public Animals page and website settings here.';}
      const s=f.querySelector('.editor-section h3');if(s)s.textContent='Animals page';
    }
    const chat=document.querySelector('.chatbox');
    if(chat&&!chat.querySelector('.chat-help')){
      const form=chat.querySelector('#chat-form');
      form?.insertAdjacentHTML('afterbegin','<div class="chat-help"><strong>Owner chat</strong><span>Enter sends · Shift+Enter makes a new line</span></div>');
    }
  }

  const baseOwnerSection=ownerSection;
  ownerSection=async function(){await baseOwnerSection();polishOwner();};
  const baseOwner=owner;
  owner=async function(n){await baseOwner(n);polishOwner();};

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='chat-text'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();const f=e.target.form;if(f&&e.target.value.trim())f.requestSubmit();
    }
  });
  document.addEventListener('input',e=>{if(e.target?.name==='version'&&e.target.closest('#site-info-form'))syncVersion(e.target.value);});
  document.addEventListener('submit',e=>{if(e.target?.id==='site-info-form')setTimeout(()=>syncVersion(e.target.elements.version?.value),800);});

  labelAnimals();
})();