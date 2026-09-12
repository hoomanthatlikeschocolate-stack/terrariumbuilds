'use strict';
(() => {
  const DEFAULT_INFO={version:'v1.2',eyebrow:'About TerrariumBuilds',title:'Small worlds, built with care.',intro:'TerrariumBuilds is here to make naturalistic habitats easier to understand, plan, and build.',story:'We focus on practical habitat guides, natural materials, and simple steps that help each enclosure feel intentional from the ground up.',values:'Animal-first care\nNatural-looking materials\nClear, beginner-friendly guidance\nThoughtful builds over clutter',contact:'',image_url:'',image_alt:'A thoughtfully built naturalistic terrarium',image_credit:'',image_credit_url:'',announcement:'',show_announcement:false};
  state.info={...DEFAULT_INFO};
  const normalizeInfo=x=>({...DEFAULT_INFO,...(x||{}),version:String(x?.version||DEFAULT_INFO.version).slice(0,24),show_announcement:x?.show_announcement===true});
  const lines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const versionBadge=()=>document.querySelector('#site-version-badge');
  function applySiteInfo(){
    const i=state.info||DEFAULT_INFO;
    const badge=versionBadge();if(badge)badge.textContent=i.version||DEFAULT_INFO.version;
    document.querySelectorAll('.version').forEach(x=>x.textContent=i.version||DEFAULT_INFO.version);
    const top=document.querySelector('.topline');
    if(top){top.textContent=i.show_announcement&&i.announcement?i.announcement:'SMALL WORLDS. WELL BUILT.';top.classList.toggle('announcement-live',!!(i.show_announcement&&i.announcement));}
  }
  function infoPage(){
    const i=state.info||DEFAULT_INFO,img=safeUrl(i.image_url),values=lines(i.values);
    $('#main').innerHTML=`<section class="info-hero"><div class="info-copy"><p class="eyebrow">${esc(i.eyebrow)}</p><h1>${esc(i.title)}</h1><p class="lead">${esc(i.intro)}</p></div>${img?`<div class="info-photo"><img src="${esc(img)}" alt="${esc(i.image_alt)}">${imageCredit(i.image_credit,i.image_credit_url)}</div>`:''}</section><section class="info-grid"><article class="info-card"><p class="eyebrow">Our approach</p><h2>Build with purpose.</h2><p>${esc(i.story)}</p></article><article class="info-card"><p class="eyebrow">What matters here</p><h2>The basics first.</h2>${values.length?`<ul class="info-values">${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<p>Thoughtful habitats, clear guidance, and natural materials.</p>'}</article></section>${i.contact?`<section class="info-contact"><div><p class="eyebrow">Questions?</p><h2>Get in touch.</h2><p>${esc(i.contact)}</p></div><a class="btn" href="#tutorials">Explore tutorials ↗</a></section>`:''}`;
  }
  const baseRoute=route;
  route=async function(){
    const path=location.hash.slice(1)||'shop';
    if(path==='info'){
      clearInterval(chatTimer);state.route++;
      document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav==='info'));
      infoPage();applySiteInfo();return;
    }
    await baseRoute();applySiteInfo();
  };
  const baseRefreshCatalog=refreshCatalog;
  refreshCatalog=async function(){const d=await api('catalog');state.products=d.products;state.tutorials=d.tutorials;state.assets=normalizeAssets(d.assets);state.ownerAssets=state.assets;state.info=normalizeInfo(d.info);header();applySiteInfo();return d;};

  function dashboard(){
    const products=state.ownerProducts||[],tutorials=state.ownerTutorials||[];
    const drafts=products.filter(x=>!x.published).length+tutorials.filter(x=>!x.published).length;
    const low=products.filter(x=>x.published&&x.stock<=3).length;
    const published=products.filter(x=>x.published).length+tutorials.filter(x=>x.published).length;
    $('#owner-content').innerHTML=`<div class="owner-dashboard"><div class="owner-welcome"><div><p class="eyebrow">Workspace overview</p><h2>Everything in one place.</h2><p>Jump straight to what you want to change. Updates save globally for visitors.</p></div><a class="btn outline" href="#shop">Open live site ↗</a></div><div class="dashboard-cards"><button class="dash-card" data-owner-tab="listings"><span>${products.length}</span><strong>Listings</strong><small>${products.filter(x=>x.published).length} published</small></button><button class="dash-card" data-owner-tab="tutorials"><span>${tutorials.length}</span><strong>Tutorials</strong><small>${tutorials.filter(x=>x.published).length} published</small></button><button class="dash-card" data-owner-tab="info"><span>${state.info?.version||'v1.2'}</span><strong>Website info</strong><small>Edit Info + version</small></button><div class="dash-card static"><span>${low}</span><strong>Low stock</strong><small>${drafts} drafts waiting</small></div></div><div class="quick-panel"><div><p class="eyebrow">Quick actions</p><h3>What do you want to do?</h3></div><div class="quick-actions"><button class="btn" data-new-product>+ Add listing</button><button class="btn outline" data-new-tutorial>+ Add tutorial</button><button class="btn outline" data-owner-tab="images">Change site images</button><button class="btn outline" data-owner-tab="orders">Check orders</button></div></div><div class="owner-health"><strong>Site status</strong><span class="status-dot"></span><span>${published} published items/guides</span><span>•</span><span>${drafts} drafts</span><span>•</span><span>Version ${esc(state.info?.version||'v1.2')}</span></div></div>`;
  }
  function infoEditor(){
    const i=state.info||DEFAULT_INFO;
    $('#owner-content').innerHTML=`<div class="section-head owner-section-title" style="margin-top:0"><div><p class="eyebrow">Public website</p><h2>Info & site details</h2><p class="small-note">Everything here saves globally. The Info tab updates immediately after saving.</p></div><a class="btn small outline" href="#info">Preview Info ↗</a></div><form id="site-info-form" class="owner-editor"><div class="editor-section"><div class="editor-section-head"><span>01</span><div><h3>Info page</h3><p>Tell visitors what TerrariumBuilds is about.</p></div></div><div class="form-grid"><label>Small heading<input name="eyebrow" maxlength="80" value="${esc(i.eyebrow)}"></label><label class="full">Main heading<input name="title" maxlength="160" value="${esc(i.title)}"></label><label class="full">Intro<textarea name="intro" maxlength="1000">${esc(i.intro)}</textarea></label><label class="full">Our approach<textarea name="story" maxlength="5000">${esc(i.story)}</textarea></label><label class="full">Values <span class="small-note">— one per line</span><textarea name="values" maxlength="3000">${esc(i.values)}</textarea></label><label class="full">Contact / extra note <span class="small-note">(optional)</span><textarea name="contact" maxlength="300">${esc(i.contact)}</textarea></label></div></div><div class="editor-section"><div class="editor-section-head"><span>02</span><div><h3>Info image</h3><p>Optional image and credit shown on the public Info page.</p></div></div><div class="form-grid"><label class="full">Image URL<input name="image_url" type="url" value="${esc(i.image_url)}" placeholder="https://…"></label><label class="full">Or upload an image<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="full">Accessibility description<input name="image_alt" maxlength="180" value="${esc(i.image_alt)}"></label><label>Image credit<input name="image_credit" maxlength="180" value="${esc(i.image_credit)}" placeholder="Photographer / source"></label><label>Credit link<input name="image_credit_url" type="url" value="${esc(i.image_credit_url)}" placeholder="https://…"></label></div></div><div class="editor-section"><div class="editor-section-head"><span>03</span><div><h3>Site details</h3><p>Small controls that make updates easier to communicate.</p></div></div><div class="form-grid"><label>Site version<input name="version" maxlength="24" value="${esc(i.version)}" placeholder="v1.2"></label><label class="full">Top announcement<input name="announcement" maxlength="220" value="${esc(i.announcement)}" placeholder="Optional short announcement"></label><label class="full check-row"><input name="show_announcement" type="checkbox" ${i.show_announcement?'checked':''}>Show announcement in the top bar</label></div></div><div class="sticky-save"><span class="save-hint">Changes are not live until you save.</span><div class="form-error" role="alert"></div><button class="btn" type="submit">Save website changes</button></div></form>`;
  }
  function enhanceOwnerShell(){
    const tabs=document.querySelector('.owner-tabs');if(!tabs)return;
    if(!tabs.querySelector('[data-owner-tab="overview"]'))tabs.insertAdjacentHTML('afterbegin','<button class="btn small outline" data-owner-tab="overview">Overview</button>');
    if(!tabs.querySelector('[data-owner-tab="info"]'))tabs.querySelector('[data-owner-tab="images"]')?.insertAdjacentHTML('beforebegin','<button class="btn small outline" data-owner-tab="info">Info & site</button>');
    tabs.querySelectorAll('[data-owner-tab]').forEach(x=>x.classList.toggle('outline',x.dataset.ownerTab!==state.ownerTab));
    const head=document.querySelector('.owner-head');if(head&&!head.querySelector('.owner-version-pill'))head.querySelector('div')?.insertAdjacentHTML('beforeend',`<span class="owner-version-pill">Live ${esc(state.info?.version||'v1.2')}</span>`);
  }
  function enhanceLists(){
    if(!['listings','tutorials'].includes(state.ownerTab))return;
    const content=$('#owner-content'),list=content?.querySelector('.owner-list');if(!content||!list||content.querySelector('.owner-search'))return;
    const label=state.ownerTab==='listings'?'Search listings…':'Search tutorials…';
    list.insertAdjacentHTML('beforebegin',`<div class="owner-tools"><label class="owner-search"><span>Search</span><input type="search" data-owner-search placeholder="${label}"></label><span class="small-note">Tip: drafts stay private until you publish them.</span></div>`);
  }
  const baseOwnerSection=ownerSection;
  ownerSection=async function(){
    clearInterval(chatTimer);
    if(state.ownerTab==='overview'){dashboard();enhanceOwnerShell();return;}
    if(state.ownerTab==='info'){infoEditor();enhanceOwnerShell();return;}
    await baseOwnerSection();enhanceOwnerShell();enhanceLists();
  };
  const baseOwner=owner;
  owner=async function(n){
    const d=await api('owner-data');state.info=normalizeInfo(d.info);applySiteInfo();
    await baseOwner(n);enhanceOwnerShell();
  };

  document.addEventListener('input',e=>{
    if(!e.target.matches('[data-owner-search]'))return;
    const q=e.target.value.trim().toLowerCase();
    document.querySelectorAll('#owner-content .owner-list .owner-row').forEach(row=>row.hidden=q&&!row.textContent.toLowerCase().includes(q));
  });
  document.addEventListener('submit',async e=>{
    const f=e.target;if(f.id!=='site-info-form')return;e.preventDefault();
    const submit=f.querySelector('button[type=submit]'),error=f.querySelector('.form-error');const fd=new FormData(f);error.textContent='';submit.disabled=true;const old=submit.textContent;submit.textContent='Saving…';
    try{const uploaded=await upload(fd.get('image'));const d=await api('site-info-save',{version:fd.get('version'),eyebrow:fd.get('eyebrow'),title:fd.get('title'),intro:fd.get('intro'),story:fd.get('story'),values:fd.get('values'),contact:fd.get('contact'),image_url:uploaded||fd.get('image_url'),image_alt:fd.get('image_alt'),image_credit:fd.get('image_credit'),image_credit_url:fd.get('image_credit_url'),announcement:fd.get('announcement'),show_announcement:fd.get('show_announcement')==='on'});state.info=normalizeInfo(d.info);applySiteInfo();toast('Website info saved globally.');await ownerSection();}catch(err){error.textContent=err.message;}finally{submit.disabled=false;submit.textContent=old;}
  });

  async function bootEnhancements(){
    try{const d=await api('catalog');state.info=normalizeInfo(d.info);applySiteInfo();}catch{}
    const path=location.hash.slice(1)||'shop';if(path==='info')await route();
  }
  bootEnhancements();
})();