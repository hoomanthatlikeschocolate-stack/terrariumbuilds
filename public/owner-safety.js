'use strict';
(() => {
  const modalEl=document.querySelector('#modal');
  const activeEditor=()=>document.querySelector('#tutorial-form,#product-form');
  const keyFor=f=>f?.id==='tutorial-form'?'tb-owner-tutorial-draft':f?.id==='product-form'?'tb-owner-product-draft':'';
  let draftTimer;

  function normalizeLink(value){
    let v=String(value||'').trim();
    if(!v)return '';
    if(/^www\./i.test(v))v='https://'+v;
    else if(!/^https?:\/\//i.test(v)&&/^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(v))v='https://'+v;
    return v;
  }

  function saveDraft(f){
    const key=keyFor(f);if(!key)return;
    const fields={};
    for(const el of f.elements){
      if(!el.name||el.type==='file'||el.type==='submit')continue;
      fields[el.name]=el.type==='checkbox'?el.checked:el.value;
    }
    try{localStorage.setItem(key,JSON.stringify({id:f.dataset.id||'',fields,savedAt:Date.now()}));}catch{}
  }

  function restoreDraft(f){
    const key=keyFor(f);if(!key)return;
    let draft;try{draft=JSON.parse(localStorage.getItem(key)||'null');}catch{}
    if(!draft||String(draft.id||'')!==String(f.dataset.id||''))return;
    const hasContent=Object.entries(draft.fields||{}).some(([name,v])=>name!=='published'&&String(v??'').trim());
    if(!hasContent)return;
    for(const [name,val] of Object.entries(draft.fields||{})){
      const el=f.elements[name];if(!el)continue;
      if(el.type==='checkbox')el.checked=!!val;else el.value=val;
    }
    const error=f.querySelector('.form-error');
    if(error)error.textContent='Recovered your unsaved draft from this browser.';
    toast('Recovered your unsaved draft.');
  }

  function prepareEditor(){
    const f=activeEditor();if(!f)return;
    f.setAttribute('novalidate','');
    restoreDraft(f);
  }

  const oldTutorial=editTutorial;
  editTutorial=function(id){oldTutorial(id);prepareEditor();};
  const oldProduct=editProduct;
  editProduct=function(id){oldProduct(id);prepareEditor();};

  // Owner listing/tutorial editors can only be closed with their X (or after a successful save).
  document.addEventListener('click',e=>{
    if(activeEditor()&&e.target===modalEl){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
  },true);
  modalEl?.addEventListener('cancel',e=>{if(activeEditor())e.preventDefault();});

  document.addEventListener('input',e=>{
    const f=e.target.closest?.('#tutorial-form,#product-form');if(!f)return;
    clearTimeout(draftTimer);draftTimer=setTimeout(()=>saveDraft(f),120);
  });
  document.addEventListener('change',e=>{const f=e.target.closest?.('#tutorial-form,#product-form');if(f)saveDraft(f);});

  document.addEventListener('focusout',e=>{
    const el=e.target;if(!el.matches?.('#tutorial-form input[type=url],#product-form input[type=url]'))return;
    const fixed=normalizeLink(el.value);if(fixed!==el.value){el.value=fixed;saveDraft(el.form);}
  });

  // Be forgiving with links and point to the exact source line when one really is invalid.
  document.addEventListener('submit',e=>{
    const f=e.target;if(!['tutorial-form','product-form'].includes(f.id))return;
    saveDraft(f);
    for(const el of f.querySelectorAll('input[type=url]'))el.value=normalizeLink(el.value);
    if(f.id==='tutorial-form'){
      const src=f.elements.sources;
      const rows=String(src?.value||'').split(/\r?\n/);
      for(let i=0;i<rows.length;i++){
        const row=rows[i].trim();if(!row)continue;
        const parts=row.split('|');
        const raw=(parts.length>1?parts.slice(1).join('|'):row).trim();
        const fixed=normalizeLink(raw);
        if(!safeUrl(fixed)){
          e.preventDefault();e.stopImmediatePropagation();
          const error=f.querySelector('.form-error');
          if(error)error.textContent=`Source line ${i+1} has a bad link. Use a normal website link, or delete that optional source line. Your draft is safe.`;
          src?.focus();return;
        }
        rows[i]=parts.length>1?parts[0].trim()+' | '+fixed:fixed;
      }
      if(src)src.value=rows.join('\n');
    }
    for(const el of f.querySelectorAll('input[type=url]')){
      if(el.value&&!safeUrl(el.value)){
        e.preventDefault();e.stopImmediatePropagation();
        const error=f.querySelector('.form-error');
        if(error)error.textContent='One of the optional link fields is not a valid website link. Fix it or leave it blank. Your draft is safe.';
        el.focus();return;
      }
    }
  },true);

  const oldToast=toast;
  toast=function(message){
    if(message==='Tutorial saved.')try{localStorage.removeItem('tb-owner-tutorial-draft');}catch{}
    if(message==='Listing saved.')try{localStorage.removeItem('tb-owner-product-draft');}catch{}
    return oldToast(message);
  };
})();