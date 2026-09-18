(async function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sb=getSupabase(),loginCard=$("#loginCard"),dashboard=$("#dashboard"),logout=$("#logout"),loginError=$("#loginError");
if(window.lucide)lucide.createIcons();
const MAX_COVER_BYTES=10*1024*1024,MAX_PDF_BYTES=50*1024*1024;
let allOrders=[];
if(!sb){loginError.hidden=false;loginError.textContent='Supabase haija-configurewa. Weka URL na publishable key kwenye js/supabase-config.js.'}
function err(e){const message=String(e?.message||e||'Unknown error');if(/row-level security|permission denied|not authorized|jwt|authentication|admin access/i.test(message))return 'Your admin session is not authorized or has expired. Please sign in again.';if(/duplicate key|unique constraint/i.test(message))return 'That value is already in use. Check the book ID or slug.';return message}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function setLoginError(message){loginError.hidden=false;loginError.textContent=message}
async function ensureAdmin(){const session=await getAdminSession();if(!session)return false;const {data,error}=await sb.from('admin_users').select('user_id,email,role').eq('user_id',session.user.id).maybeSingle();if(error||!data||data.role!=='admin'){await sb.auth.signOut();return false}return true}
async function openDash(){loginCard.hidden=true;dashboard.hidden=false;logout.hidden=false;await Promise.all([populate(),renderOrders()]);if(window.lucide)lucide.createIcons()}
if(sb&&await ensureAdmin())await openDash();
sb?.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){dashboard.hidden=true;logout.hidden=true;loginCard.hidden=false}});
$("#loginBtn")?.addEventListener('click',async()=>{loginError.hidden=true;const button=$("#loginBtn"),email=$("#loginEmail").value.trim(),password=$("#loginPassword").value;if(!email||!password){setLoginError('Enter your email and password.');return}button.disabled=true;const old=button.innerHTML;button.textContent='Signing in…';try{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;if(!(await ensureAdmin())){setLoginError('Akaunti hii haina admin role kwenye public.admin_users.');return}await openDash()}catch(e){setLoginError(err(e))}finally{button.disabled=false;button.innerHTML=old;if(window.lucide)lucide.createIcons()}});
logout?.addEventListener('click',async()=>{logout.disabled=true;await sb?.auth.signOut();location.reload()});
$$('.tab').forEach(t=>t.onclick=async()=>{$$('.tab').forEach(x=>x.classList.remove('active'));$$('.admin-tab').forEach(x=>x.hidden=true);t.classList.add('active');$("#tab-"+t.dataset.tab).hidden=false;if(t.dataset.tab==='orders')await renderOrders();if(t.dataset.tab==='access')window.dispatchEvent(new CustomEvent('dn:refresh-access'));if(t.dataset.tab==='reader')window.dispatchEvent(new CustomEvent('dn:refresh-reader'));if(window.lucide)lucide.createIcons()});
async function populate(){try{const loaded=await loadBackendStore(),c=loaded.config,b=loaded.books;$$('[data-cfg]').forEach(el=>el.value=c[el.dataset.cfg]??'');$$('[data-color]').forEach(el=>el.value=c.colors?.[el.dataset.color]||'#000000');const plainContent=(value)=>String(value??'').replace(/<br[^>]*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&amp;/gi,'&').replace(/&quot;/gi,'\"').replace(/&#39;/gi,"'");$$('[data-content]').forEach(el=>el.value=plainContent(c.content?.[el.dataset.content]));renderBookEditor(b)}catch(e){setLoginError(err(e))}}
function bookStatus(x){return x.status|| (x.available?'available':'coming_soon')}
function renderBookEditor(b){const editor=$("#bookEditor");const rows=Object.entries(b).sort((a,b)=>Number(a[1]?.sort_order??999)-Number(b[1]?.sort_order??999));editor.innerHTML=rows.map(([id,x],idx)=>{const safeId=esc(id),status=bookStatus(x);return `<article class="book-admin" data-book-card="${safeId}">
<div class="book-admin-head"><div><p class="section-kicker">CATALOG ITEM ${String(idx+1).padStart(2,'0')}</p><h3>${safeId}</h3></div><span class="book-admin-status ${status==='available'?'is-live':''}">${esc(status.replace('_',' ').toUpperCase())}</span></div>
<img src="${esc(x.image||'')}" alt="${esc(x.title||'Book cover')}">
<label>Book ID<input data-book="${safeId}" data-field="id" value="${safeId}" readonly></label>
<label>Title<input data-book="${safeId}" data-field="title" value="${esc(x.title)}"></label>
<label>Slug<input data-book="${safeId}" data-field="slug" value="${esc(x.slug||safeId)}"></label>
<label>Author<input data-book="${safeId}" data-field="author" value="${esc(x.author||'Dennis Nazar')}"></label>
<label>Description<textarea data-book="${safeId}" data-field="description">${esc(x.description||x.subtitle||'')}</textarea></label>
<label>Subtitle<input data-book="${safeId}" data-field="subtitle" value="${esc(x.subtitle||'')}"></label>
<label>Price (TZS)<input data-book="${safeId}" data-field="price" type="number" min="0" value="${Number(x.price||0)}"></label>
<label>Sort order<input data-book="${safeId}" data-field="sort_order" type="number" min="0" value="${Number(x.sort_order??idx+1)}"></label>
<label>Cover image path<input data-book="${safeId}" data-field="image" value="${esc(x.image||'')}"></label>
<label>Upload cover<input data-cover-file="${safeId}" type="file" accept="image/jpeg,image/png,image/webp"></label>
<label>Upload private PDF<input data-pdf-file="${safeId}" type="file" accept="application/pdf"></label>
<label>Availability<select data-book="${safeId}" data-field="available"><option value="true" ${x.available?'selected':''}>Yes — sell now</option><option value="false" ${!x.available?'selected':''}>No — not for sale</option></select></label>
<label>Status<select data-book="${safeId}" data-field="status"><option value="available" ${status==='available'?'selected':''}>Available</option><option value="coming_soon" ${status==='coming_soon'?'selected':''}>Coming Soon</option><option value="inactive" ${status==='inactive'?'selected':''}>Inactive</option></select></label>
<div class="book-admin-note">PDF files stay in the private book-pdfs bucket. The storefront never receives the PDF path.</div>
${status!=='available'?'<button type="button" class="admin-secondary deactivate-book" data-deactivate-book="'+safeId+'"><i data-lucide="archive"></i> Deactivate Book</button>':''}
</article>`}).join('')||'<div class="admin-empty"><strong>No books found</strong><span>Add your first catalog item below.</span></div>';window.lucide?.createIcons?.();$$('.deactivate-book',editor).forEach(button=>button.addEventListener('click',()=>deactivateBook(button.dataset.deactivateBook)))}
async function deactivateBook(id){if(!id)return;if(!confirm('Deactivate this book? It will remain in the database and stop appearing as an active sale.'))return;try{const {error}=await sb.from('books').update({available:false,status:'inactive',updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;await populate();alert('Book deactivated.')}catch(e){alert(err(e))}}
function nextBookId(books){const used=new Set(Object.keys(books||{}));let n=1;while(used.has(`book${n}`))n++;return `book${n}`}
async function addBook(){try{const loaded=await loadBackendStore(),books=loaded.books||{},id=nextBookId(books),sort=Object.values(books).reduce((m,b)=>Math.max(m,Number(b.sort_order||0)),0)+1;const slug=`kitabu-${sort}`;const payload={id,title:`Kitabu kipya ${String(sort).padStart(2,'0')}`,slug,description:'',author:'Dennis Nazar',subtitle:'NEW RELEASE',price:2500,currency:'TZS',status:'coming_soon',image_path:'assets/coming-soon-cover.jpg',pdf_path:'',available:false,sort_order:sort,updated_at:new Date().toISOString()};const {error}=await sb.from('books').insert(payload);if(error)throw error;await populate();const card=$(`[data-book-card="${id}"]`);card?.scrollIntoView({behavior:'smooth',block:'center'});alert(`Book ${id} added. Edit the book details and save the catalog.`)}catch(e){alert(err(e))}}
async function saveSettings(){const {data:row,error:getErr}=await sb.from('store_settings').select('data').eq('id',1).single();if(getErr)throw getErr;const c=deepMerge(getStoreConfig(),row.data||{});$$('[data-cfg]').forEach(el=>c[el.dataset.cfg]=el.value.trim());c.colors={...(c.colors||{})};$$('[data-color]').forEach(el=>c.colors[el.dataset.color]=el.value);const {error}=await sb.from('store_settings').update({data:c,updated_at:new Date().toISOString()}).eq('id',1);if(error)throw error;saveStoreConfig(c);alert('Settings saved live.')}
$$('.save-general,.save-colors').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await saveSettings()}catch(e){alert(err(e))}finally{b.disabled=false}});
$(".save-content")?.addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;try{const {data:row,error:se}=await sb.from('store_settings').select('data').eq('id',1).single();if(se)throw se;const c=deepMerge(getStoreConfig(),row.data||{});c.content={...(c.content||{})};$$('[data-content]').forEach(el=>c.content[el.dataset.content]=el.value);const {error}=await sb.from('store_settings').update({data:c,updated_at:new Date().toISOString()}).eq('id',1);if(error)throw error;saveStoreConfig(c);alert('Website content saved live.')}catch(e){alert(err(e))}finally{b.disabled=false}});
$(".add-book")?.addEventListener('click',addBook);
$(".save-books")?.addEventListener('click',async e=>{
  const button=e.currentTarget,old=button.innerHTML;
  button.disabled=true;button.innerHTML='Saving catalog…';
  try{
    const cards=$$('[data-book-card]');
    for(const card of cards){
      const id=card.dataset.bookCard;
      const field=n=>card.querySelector(`[data-book="${id}"][data-field="${n}"]`)?.value;
      let image=field('image')||'';
      const cover=card.querySelector(`[data-cover-file="${id}"]`)?.files?.[0];
      const pdf=card.querySelector(`[data-pdf-file="${id}"]`)?.files?.[0];
      if(cover){
        if(!/^image\/(jpeg|png|webp)$/i.test(cover.type)||cover.size>MAX_COVER_BYTES)throw new Error(`${id}: cover must be JPG, PNG or WebP under 10 MB.`);
        const path=`${id}/${crypto.randomUUID()}-${cover.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const upload=await sb.storage.from('book-covers').upload(path,cover,{upsert:false,contentType:cover.type});
        if(upload.error)throw upload.error;
        image=sb.storage.from('book-covers').getPublicUrl(path).data.publicUrl;
      }
      let pdfPath='';
      if(pdf){
        if(pdf.type!=='application/pdf'||pdf.size>MAX_PDF_BYTES)throw new Error(`${id}: PDF must be under 50 MB.`);
        const path=`${id}/${crypto.randomUUID()}-${pdf.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const upload=await sb.storage.from('book-pdfs').upload(path,pdf,{upsert:false,contentType:'application/pdf'});
        if(upload.error)throw upload.error;
        pdfPath=path;
      }
      const selectedStatus=field('status');
      const available=field('available')==='true';
      const status=available?'available':(selectedStatus==='inactive'?'inactive':'coming_soon');
      const payload={
        title:field('title')?.trim(),
        slug:field('slug')?.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,''),
        author:field('author')?.trim()||'Dennis Nazar',
        description:field('description')||'',subtitle:field('subtitle')||'',price:Number(field('price')||0),currency:'TZS',
        image_path:image,available,status,sort_order:Number(field('sort_order')||0),updated_at:new Date().toISOString()
      };
      if(pdfPath)payload.pdf_path=pdfPath;
      if(!payload.title||!payload.slug)throw new Error(`${id}: title and slug are required.`);
      const result=await sb.from('books').update(payload).eq('id',id);
      if(result.error)throw result.error;
    }
    await populate();
    alert('Book catalog saved live. Covers and private PDFs are synced safely to Supabase.');
  }catch(e){alert(err(e))}
  finally{button.disabled=false;button.innerHTML=old;if(window.lucide)lucide.createIcons()}
});
async function proofUrl(path){if(!path)return null;const {data,error}=await sb.storage.from('payment-proofs').createSignedUrl(path,900);if(error)throw error;return data.signedUrl}
	function renderOrderStats(orders){const counts={ALL:orders.length,PENDING_VERIFICATION:0,CONFIRMED:0,DELIVERED:0,REJECTED:0};orders.forEach(o=>counts[o.status]=(counts[o.status]||0)+1);const el=$("#orderStats");if(!el)return;el.innerHTML=[["ALL","All Orders","list"],["PENDING_VERIFICATION","Pending","clock-3"],["CONFIRMED","Confirmed","shield-check"],["DELIVERED","Active Access","library"],["REJECTED","Rejected","x-circle"]].map(([k,l,icon])=>`<button type="button" class="stat-card ${$("#orderFilter")?.value===k?'active':''}" data-stat-filter="${k}"><i data-lucide="${icon}"></i><span>${l}</span><strong>${counts[k]||0}</strong></button>`).join('');$$('.stat-card',el).forEach(b=>b.onclick=()=>{$("#orderFilter").value=b.dataset.statFilter;applyOrderFilters()});window.lucide?.createIcons?.()}
function applyOrderFilters(){const q=( $("#orderSearch")?.value||'').trim().toLowerCase(),filter=$("#orderFilter")?.value||'ALL';const filtered=allOrders.filter(o=>{const matchStatus=filter==='ALL'||o.status===filter,hay=[o.order_number,o.customer_name,o.customer_email,o.whatsapp_number,o.transaction_id].join(' ').toLowerCase();return matchStatus&&(!q||hay.includes(q))});renderOrderCards(filtered);renderOrderStats(allOrders)}
	function renderOrderCards(orders){const el=$("#ordersList");if(!el)return;if(!orders.length){el.innerHTML='<div class="admin-empty"><i data-lucide="search-x"></i><strong>No matching orders</strong><span>Badilisha search au status filter.</span></div>';window.lucide?.createIcons?.();return}const grouped=window.__dnOrderItems||{};el.innerHTML=orders.map(o=>{const list=(grouped[o.id]||[]).map(i=>`<li>${esc(i.title_snapshot)} — ${Number(i.price).toLocaleString()} TZS</li>`).join(''),safeStatus=String(o.status).toLowerCase(),actions=o.status==='PENDING_VERIFICATION'?`<div class="order-actions"><button class="admin-primary confirm-order" data-order="${o.id}"><i data-lucide="check-circle"></i> Confirm Payment</button><button class="admin-secondary reject-order" data-order="${o.id}"><i data-lucide="x-circle"></i> Reject Payment</button></div>`:(o.status==='CONFIRMED'||o.status==='DELIVERED')?`<div class="order-actions"><button class="admin-secondary resend-delivery" data-order="${o.id}"><i data-lucide="send"></i> Resend Library Access</button></div>`:'';return `<article class="order-admin-card"><div class="order-admin-top"><div><span class="order-number">${esc(o.order_number)}</span><h3>${esc(o.customer_name)}</h3><p>${esc(o.customer_email)} · ${esc(o.whatsapp_number)}</p></div><span class="status-pill status-${safeStatus}">${esc(o.status.replaceAll('_',' '))}</span></div><div class="order-admin-grid"><div><strong>Books</strong><ul>${list||'<li>No items</li>'}</ul></div><div><strong>Amount</strong><p>${Number(o.amount).toLocaleString()} ${esc(o.currency)}</p><strong>Transaction ID</strong><p>${esc(o.transaction_id||'Not provided')}</p><strong>Created</strong><p>${new Date(o.created_at).toLocaleString()}</p><strong>Approved</strong><p>${o.approved_at?new Date(o.approved_at).toLocaleString():'—'}</p><strong>Delivered</strong><p>${o.status==='DELIVERED'?'Yes':'—'}</p></div></div><div class="proof-box">${o.payment_screenshot_path?`<button class="admin-secondary proof-btn" data-proof="${esc(o.payment_screenshot_path)}"><i data-lucide="image"></i> View payment screenshot</button>`:'<span class="proof-missing">No screenshot uploaded</span>'}</div>${o.rejection_reason?`<p class="reject-note">Rejected: ${esc(o.rejection_reason)}</p>`:''}${actions}</article>`}).join('');$$('.proof-btn',el).forEach(b=>b.onclick=async()=>{b.disabled=true;const old=b.innerHTML;b.innerHTML='Opening secure proof…';try{const url=await proofUrl(b.dataset.proof);if(!url)throw new Error('Payment proof is unavailable.');window.open(url,'_blank','noopener')}catch(e){alert(err(e))}finally{b.disabled=false;b.innerHTML=old}});$$('.confirm-order',el).forEach(b=>b.onclick=async()=>{if(!confirm('Confirm this payment? The customer will receive Library access after signing in.'))return;b.disabled=true;const old=b.innerHTML;b.innerHTML='Confirming…';try{const {data,error}=await sb.functions.invoke('confirm-payment',{body:{orderId:b.dataset.order}});if(error)throw error;if(data?.error)throw new Error(data.error);alert(`Order ${data.orderNumber||'updated'} confirmed. Library access is provisioned when the customer signs in. Notification: email ${data.email?.ok?'sent':'not sent'} · WhatsApp ${data.whatsapp?.ok?'sent':'not sent'}`);await renderOrders()}catch(e){alert(err(e));b.disabled=false;b.innerHTML=old}});$$('.reject-order',el).forEach(b=>b.onclick=async()=>{const reason=prompt('Reason for rejection:','Payment could not be verified.');if(reason===null)return;b.disabled=true;const old=b.innerHTML;b.innerHTML='Rejecting…';try{const {data,error}=await sb.functions.invoke('reject-order',{body:{orderId:b.dataset.order,reason}});if(error)throw error;if(data?.error)throw new Error(data.error);await renderOrders()}catch(e){alert(err(e));b.disabled=false;b.innerHTML=old}});$$('.resend-delivery',el).forEach(b=>b.onclick=async()=>{b.disabled=true;const old=b.innerHTML;b.innerHTML='Sending…';try{const {data,error}=await sb.functions.invoke('resend-library-access',{body:{orderId:b.dataset.order}});if(error)throw error;if(data?.error)throw new Error(data.error);alert('Library access notification retry complete.')}catch(e){alert(err(e))}finally{b.disabled=false;b.innerHTML=old}});window.lucide?.createIcons?.()}
async function renderOrders(){const el=$("#ordersList");if(!el)return;el.innerHTML='<div class="admin-loading">Loading orders…</div>';try{const {data:orders,error}=await sb.from('orders').select('id,order_number,customer_name,customer_email,whatsapp_number,status,amount,currency,transaction_id,payment_screenshot_path,rejection_reason,created_at,approved_at,approved_by,rejected_at,updated_at').order('created_at',{ascending:false}).limit(100);if(error)throw error;allOrders=orders||[];const ids=allOrders.map(o=>o.id);window.__dnOrderItems={};if(ids.length){const {data:items,error:itemError}=await sb.from('order_items').select('order_id,title_snapshot,price').in('order_id',ids);if(itemError)throw itemError;(items||[]).forEach(i=>(window.__dnOrderItems[i.order_id]??=[]).push(i))}renderOrderStats(allOrders);applyOrderFilters()}catch(e){el.innerHTML=`<p class="admin-error">${esc(err(e))}</p>`}}
$("#orderSearch")?.addEventListener('input',applyOrderFilters);$("#orderFilter")?.addEventListener('change',applyOrderFilters);$("#refreshOrders")?.addEventListener('click',renderOrders);
})();
