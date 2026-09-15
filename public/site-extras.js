'use strict';
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  async function call(action){const r=await fetch('/api/terrarium?action='+encodeURIComponent(action),{credentials:'same-origin'});if(!r.ok)throw new Error('request failed');return r.json();}

  // CHECKOUT — turns the existing order-request flow into a clear checkout while keeping payment details out of this site.
  function enhanceCheckout(){
    document.querySelectorAll('[data-checkout]').forEach(b=>b.textContent='Checkout');
    const f=document.querySelector('#checkout-form');
    if(!f||f.dataset.fulfillmentReady)return;
    f.dataset.fulfillmentReady='1';
    const title=document.querySelector('#modal-title');if(title)title.textContent='Checkout';
    const intro=title?.nextElementSibling;if(intro?.tagName==='P')intro.textContent='Review how you want to receive the order and send it to the owners for confirmation. No card details are collected here.';
    const submit=f.querySelector('button[type="submit"]');if(submit)submit.textContent='Place order request';
    const note=f.querySelector('textarea[name="note"]')?.closest('label');
    const section=document.createElement('fieldset');section.className='fulfillment-choice';
    section.innerHTML='<legend>Delivery</legend><label class="fulfillment-option"><input type="radio" name="fulfillment" value="pickup" required> <span><b>Pickup</b><small>Pick it up after the owners confirm it is ready.</small></span></label><label class="fulfillment-option"><input type="radio" name="fulfillment" value="shipping" required> <span><b>Shipping</b><small>Shipping cost and availability are confirmed before payment.</small></span></label><div id="shipping-fields" hidden><label>Shipping address<textarea name="shipping_address" maxlength="500" placeholder="Street address, city, state, ZIP"></textarea></label></div>';
    (note||f.querySelector('.form-error'))?.before(section);
    section.addEventListener('change',()=>{const ship=f.elements.fulfillment?.value==='shipping';const wrap=section.querySelector('#shipping-fields');wrap.hidden=!ship;const a=f.elements.shipping_address;if(a)a.required=ship;});
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-checkout]'))queueMicrotask(enhanceCheckout)},true);
  document.addEventListener('submit',e=>{const f=e.target;if(f.id!=='checkout-form'||f.dataset.fulfillmentPacked)return;const choice=f.elements.fulfillment?.value;if(!choice)return;const address=String(f.elements.shipping_address?.value||'').trim();const note=f.elements.note;if(note){const original=String(note.value||'').trim();const info=choice==='shipping'?`Fulfillment: SHIPPING\nShipping address: ${address}`:'Fulfillment: PICKUP';note.value=info+(original?'\n\nCustomer note:\n'+original:'');}f.dataset.fulfillmentPacked='1';},true);

  let currentUser=null,owner=false,baseline=false,busy=false;
  async function identify(){try{const d=await call('session');currentUser=d?.user?.username||null;owner=d?.user?.role==='owner';}catch{}}
  const messageKey=m=>String(m?.id||m?.message_id||`${m?.username||''}|${m?.created_at||''}|${m?.message||''}|${m?.image_url||''}`);
  function notify(m){const text=(m.message||'Sent an image').slice(0,180);if(typeof toast==='function')toast(`${m.username}: ${text}`);if('Notification'in window&&Notification.permission==='granted'&&document.hidden){try{new Notification(`Terrariums & Aquariums · ${m.username}`,{body:text,tag:'tb-owner-chat',icon:document.querySelector('.brand-logo,.brand-logo-fixed')?.src||undefined})}catch{}}}
  async function poll(){if(!owner||busy)return;busy=true;try{const rows=await call('chat-list');if(!Array.isArray(rows)||!rows.length){baseline=true;return;}const other=[...rows].reverse().find(m=>m.username!==currentUser);if(!other){baseline=true;return;}const key=messageKey(other),storage='tb-owner-chat-last-'+currentUser;const last=localStorage.getItem(storage);if(!baseline&&!last){localStorage.setItem(storage,key);baseline=true;return;}if(last!==key){localStorage.setItem(storage,key);if(baseline||last)notify(other)}baseline=true;}catch{}finally{busy=false}}
  function addNotifyButton(){if(!owner)return;const chat=document.querySelector('.chatbox');if(!chat||chat.querySelector('[data-chat-notify]'))return;const head=chat.querySelector('.owner-row');if(!head)return;const b=document.createElement('button');b.type='button';b.className='quiet';b.dataset.chatNotify='1';b.textContent=!('Notification'in window)?'Browser alerts unavailable':Notification.permission==='granted'?'Notifications on':'Enable notifications';b.disabled=!('Notification'in window)||Notification.permission==='denied';b.onclick=async()=>{if(!('Notification'in window))return;const p=await Notification.requestPermission();b.textContent=p==='granted'?'Notifications on':p==='denied'?'Notifications blocked':'Enable notifications';b.disabled=p==='denied';};head.appendChild(b);}
  const mo=new MutationObserver(()=>{enhanceCheckout();addNotifyButton()});mo.observe(document.body,{childList:true,subtree:true});
  identify().then(()=>{addNotifyButton();poll();setInterval(()=>{poll();addNotifyButton()},8000)});
  const style=document.createElement('style');style.textContent='.fulfillment-choice{border:1px solid var(--line,#d9e0d7);border-radius:16px;padding:13px;margin:14px 0}.fulfillment-choice legend{font-weight:800;padding:0 5px}.fulfillment-option{display:flex!important;align-items:flex-start;gap:8px;padding:9px 5px}.fulfillment-option input{width:auto!important;margin-top:3px}.fulfillment-option span{display:flex;flex-direction:column;gap:2px}.fulfillment-option small{color:#9eb5a7}.fulfillment-choice textarea{margin-top:7px}';document.head.appendChild(style);
})();