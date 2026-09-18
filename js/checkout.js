(async function(){
  const loaded=await loadBackendStore(),cfg=loaded.config,books=loaded.books||{};
  const $=s=>document.querySelector(s);
  if(window.lucide)lucide.createIcons();
  const form=$("#checkoutPageForm"),state=$("#paymentState"),itemsEl=$("#orderItems"),totalEl=$("#orderTotal"),payAmount=$("#payAmount"),submitAmount=$("#submitAmount"),payNumber=$("#paymentNumber"),payNumberInline=$("#paymentNumberInline"),payNumberSide=$("#paymentNumberSide");
  const submit=form?.querySelector('button[type="submit"]');
  function friendlyError(error){const raw=String(error?.message||error||'');if(/unavailable/i.test(raw))return 'One of the selected books is no longer available. Please return to the store and choose another book.';if(/transaction/i.test(raw))return 'Please check the Transaction ID and try again.';if(/screenshot|payment proof|8MB|JPG|PNG|WEBP/i.test(raw))return 'Please provide a valid payment proof image or Transaction ID.';if(/backend|network|fetch/i.test(raw))return 'The store is temporarily unavailable. Please try again shortly.';return 'We could not create your order. Please check your details and try again.'}
  function setState(kind,title,text,action=''){state.hidden=false;state.className=`payment-state ${kind}`;state.innerHTML=`<div class="state-icon"><i data-lucide="${kind==='success'?'check-circle':kind==='error'?'circle-alert':'loader-circle'}"></i></div><div><h3>${title}</h3><p>${text}</p>${action}</div>`;if(window.lucide)lucide.createIcons()}
  const params=new URLSearchParams(location.search),requested=params.get('book');
  if(requested&&books[requested]?.available&&books[requested]?.status!=='inactive'&&!getCart().some(x=>x.id===requested)){saveCart([{id:requested}]);location.reload()}
	  const activeCart=getCart().map(item=>({id:String(item.id),book:books[String(item.id)]})).filter(x=>x.book?.available&&x.book.status!=='inactive');
	  saveCart(activeCart.map(x=>({id:x.id})));
  function total(){return activeCart.reduce((sum,item)=>sum+Number(item.book.price||0),0)}
  if(!loaded.backend&&loaded.error){setState('error','Store unavailable','We could not load the live catalog. Please return to the store and try again.');if(submit)submit.disabled=true}
  if(!activeCart.length){itemsEl.innerHTML='<div class="empty-checkout"><i data-lucide="shopping-bag"></i><p>Your cart is empty or the selected book is no longer available.</p><a href="index.html#books">Explore Books</a></div>';if(submit)submit.disabled=true}
  function render(){itemsEl.innerHTML=activeCart.map(({book:b})=>`<div class="order-line"><img src="${String(b.image||'').replace(/"/g,'&quot;')}" alt="${String(b.title||'Book').replace(/"/g,'&quot;')}"><div><strong>${String(b.title||'Book').replace(/[&<>]/g,'')}</strong><small>Digital Softcopy</small></div><b>${formatPrice(b.price)}</b></div>`).join('');totalEl.textContent=formatPrice(total());payAmount.textContent=formatPrice(total());submitAmount.textContent=formatPrice(total());const p=cfg.paymentPhone;payNumber.textContent=p;payNumberInline.textContent=p;payNumberSide.textContent=p;if(window.lucide)lucide.createIcons()}
  render();
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!activeCart.length||!loaded.backend){setState('error','Order unavailable','Your cart could not be verified against the live catalog. Please return to the store.');return}
    const name=$("#customerName").value.trim(),email=$("#customerEmail").value.trim().toLowerCase(),phone=$("#customerPhone").value.trim(),transactionId=$("#transactionId").value.trim(),file=$("#paymentScreenshot").files?.[0];
    if(!name||!email||!phone){setState('error','Details required','Please complete your name, email and WhatsApp number.');return}
    if(transactionId&&(transactionId.length<3||transactionId.length>120)){setState('error','Invalid Transaction ID','Transaction ID must be between 3 and 120 characters.');return}
    if(!transactionId&&!file){setState('error','Payment proof required','Weka Transaction ID au upload screenshot ya malipo.');return}
    if(file&&(!/^image\/(jpeg|png|webp)$/i.test(file.type)||file.size>8*1024*1024)){setState('error','Invalid screenshot','Use JPG, PNG or WEBP under 8MB.');return}
    if(!getSupabase()){setState('error','Backend unavailable','The secure order service is not connected. Please try again later.');return}
    const button=e.currentTarget.querySelector('button[type="submit"]');
    if(button?.disabled)return;
    if(button){button.disabled=true;button.dataset.originalText=button.innerHTML;button.innerHTML='Submitting…'}
    const fd=new FormData();fd.set('customer_name',name);fd.set('customer_email',email);fd.set('whatsapp_number',phone);fd.set('transaction_id',transactionId);fd.set('items',JSON.stringify(activeCart.map(x=>({id:x.id}))));if(file)fd.set('payment_screenshot',file,file.name);
    form.hidden=true;setState('pending','Submitting payment proof…','Tafadhali subiri wakati order yako inawekwa kwenye mfumo wa verification.');
    try{
      const {data,error}=await getSupabase().functions.invoke('create-order',{body:fd});
      if(error)throw error;if(data?.error)throw new Error(data.error);if(!data?.order?.orderNumber)throw new Error('Order creation did not return an order number.');
      clearCart();localStorage.setItem('dnLastPurchaseEmail',email);
      setState('success','ORDER RECEIVED',`Payment is pending verification. Admin atathibitisha malipo yako kabla ya Library access kutolewa.`, `<div class="state-order"><b>${formatPrice(data.order.amount)}</b><span>${email}</span><span>${phone}</span><span>Order: ${data.order.orderNumber}</span><span>Status: PENDING VERIFICATION</span></div><div class="checkout-success-actions"><a class="library-delivery-link" href="track.html?order=${encodeURIComponent(data.order.orderNumber)}"><i data-lucide="search-check"></i> Track Order</a><a class="library-delivery-link" href="library.html"><i data-lucide="library"></i> Open My Library</a></div><a class="whatsapp-delivery" href="https://wa.me/${phone.replace(/\D/g,'')}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> WhatsApp Support</a>`);
    }catch(error){form.hidden=false;setState('error','Order submission failed',friendlyError(error))}
    finally{if(button){button.disabled=false;button.innerHTML=button.dataset.originalText||'Submit Payment Proof';if(window.lucide)lucide.createIcons()}}
  });
})();
