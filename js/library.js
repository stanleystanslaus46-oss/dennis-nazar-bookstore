(async function(){
  const $=s=>document.querySelector(s), sb=getSupabase();
  if(window.lucide)lucide.createIcons();
  const authCard=$("#authCard"),libraryView=$("#libraryView"),logout=$("#logoutBtn"),form=$("#magicForm"),emailInput=$("#libraryEmail"),authMessage=$("#authMessage"),libraryMessage=$("#libraryMessage"),grid=$("#bookGrid"),empty=$("#emptyLibrary"),emailLabel=$("#libraryEmailLabel"),refresh=$("#refreshLibrary");
  let loading=false;
  const lastEmail=localStorage.getItem('dnLastPurchaseEmail');if(lastEmail&&emailInput)emailInput.value=lastEmail;
  function message(el,text,kind=''){if(!el)return;el.hidden=false;el.className=`library-message ${kind}`;el.textContent=text}
  function icons(){if(window.lucide)lucide.createIcons()}
  function showSignedOut(text=''){authCard.hidden=false;libraryView.hidden=true;logout.hidden=true;if(text)message(authMessage,text,'error');if(grid)grid.innerHTML='';if(empty)empty.hidden=true;icons()}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  async function getUser(){if(!sb)return null;const {data,error}=await sb.auth.getUser();if(error)throw error;return data.user}
  async function loadLibrary(){
    if(loading)return;loading=true;
    try{
      const user=await getUser();
      if(!user){showSignedOut();return}
      authCard.hidden=true;libraryView.hidden=false;logout.hidden=false;emailLabel.textContent=user.email||'';grid.innerHTML='<div class="library-message">Loading your library…</div>';empty.hidden=true;
      const {data,error}=await sb.functions.invoke('ensure-access',{body:{}});if(error)throw error;if(data?.error)throw new Error(data.error);
      const books=data?.books||[];
      if(!books.length){grid.innerHTML='';empty.hidden=false;icons();return}
      const ids=books.map(x=>x.book_id);let progressMap={};
      const {data:progress,error:progressError}=await sb.from('reading_progress').select('book_id,current_page,progress_percent').in('book_id',ids);
      if(!progressError)(progress||[]).forEach(p=>progressMap[p.book_id]=p);
      grid.innerHTML=books.filter(x=>x.book).map(x=>{const b=x.book,p=progressMap[x.book_id],pct=Math.max(0,Math.min(100,Number(p?.progress_percent||0))),page=Number(p?.current_page||1);return `<article class="owned-book-card"><div class="owned-cover"><img src="${escapeHtml(b.image_path||'')}" alt="${escapeHtml(b.title)}" loading="lazy"><span class="owned-lock"><i data-lucide="lock-keyhole"></i> PRIVATE</span></div><div class="owned-body"><small>YOUR PURCHASE · ${escapeHtml(x.granted_at?new Date(x.granted_at).toLocaleDateString('en-GB'):'')}</small><h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(b.subtitle||'Digital edition available in your private library.')}</p><div class="progress-bar"><span style="width:${pct}%"></span></div><div class="progress-row"><span>${pct?`${Math.round(pct)}% complete`:'Not started'}</span><span>Page ${page}</span></div><a class="read-book-btn" href="reader.html?book=${encodeURIComponent(b.id)}"><i data-lucide="book-open"></i>${pct?'Continue Reading':'Start Reading'}</a></div></article>`}).join('');icons();
    }catch(e){if(/auth|session|token|not authenticated|invalid/i.test(String(e?.message||''))){showSignedOut('Your secure session has expired. Request a new login link to continue.')}else{grid.innerHTML='';empty.hidden=true;message(libraryMessage,'Unable to load your Library right now. Please refresh and try again.','error')}}finally{loading=false}}
  form?.addEventListener('submit',async e=>{e.preventDefault();if(!sb){message(authMessage,'Supabase haija-configurewa.','error');return}const email=emailInput.value.trim().toLowerCase();if(!email)return;localStorage.setItem('dnLastPurchaseEmail',email);const button=form.querySelector('button');if(button){button.disabled=true;button.dataset.originalText=button.innerHTML;button.innerHTML='Sending…'}message(authMessage,'Inatuma secure login link…');try{const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}${location.pathname}`}});if(error)throw error;message(authMessage,'Secure login link imetumwa kwenye email yako. Fungua email hiyo kwenye kifaa hiki, kisha urudi hapa.','success')}catch(e){message(authMessage,'Imeshindikana kutuma login link. Hakikisha email yako ni sahihi kisha ujaribu tena.','error')}finally{if(button){button.disabled=false;button.innerHTML=button.dataset.originalText||'Send Secure Login Link';icons()}}});
  refresh?.addEventListener('click',loadLibrary);
  logout?.addEventListener('click',async()=>{if(logout)logout.disabled=true;const {error}=await sb?.auth.signOut()||{};if(error)message(libraryMessage,'Could not sign out. Please try again.','error');else showSignedOut('You have been signed out.');if(logout)logout.disabled=false});
  sb?.auth.onAuthStateChange((event)=>{if(['SIGNED_IN','TOKEN_REFRESHED','INITIAL_SESSION','USER_UPDATED'].includes(event))setTimeout(loadLibrary,0);if(event==='SIGNED_OUT')setTimeout(()=>showSignedOut('You have been signed out.'),0)});
  if(!sb){showSignedOut('Supabase is not configured.');return}try{await loadLibrary()}catch(e){showSignedOut('Unable to initialize the secure Library session.')}
})();
