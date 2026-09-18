(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const sb=getSupabase();
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function renderAccess(){
    const box=$("#accessList"); if(!box||!sb) return;
    box.innerHTML='<div class="admin-loading">Loading library access…</div>';
    sb.from('book_access').select('id,user_id,book_id,order_id,status,granted_at,revoked_at').order('granted_at',{ascending:false}).then(({data,error})=>{
      if(error) throw error;
      const rows=data||[], q=$("#accessSearch")?.value.trim().toLowerCase()||'', status=$("#accessStatus")?.value||'active';
      const books=getBooks();
      const filtered=rows.filter(a=>{
        if(status!=='ALL'&&a.status!==status)return false;
        const b=books[a.book_id]||{};
        return !q||[a.book_id,b.title,a.order_id,a.user_id].join(' ').toLowerCase().includes(q);
      });
      if(!filtered.length){box.innerHTML='<div class="admin-empty"><i data-lucide="library"></i><strong>No access records</strong><span>There are no records matching the current filter.</span></div>';window.lucide?.createIcons?.();return;}
      box.innerHTML=filtered.map(a=>{
        const b=books[a.book_id]||{}, active=a.status==='active';
        return `<article class="access-card ${active?'':'access-revoked'}"><div class="access-top"><div><span class="order-number">${esc(a.book_id)}</span><h3>${esc(b.title||'Book')}</h3><p>User ID: ${esc(a.user_id)}</p></div><span class="status-pill ${active?'status-confirmed':'status-rejected'}">${active?'ACTIVE':'REVOKED'}</span></div><div class="access-meta"><div><strong>Granted</strong><span>${new Date(a.granted_at).toLocaleString()}</span></div><div><strong>Order ID</strong><span>${esc(a.order_id||'—')}</span></div><div><strong>Revoked</strong><span>${a.revoked_at?new Date(a.revoked_at).toLocaleString():'—'}</span></div></div><div class="access-actions">${active?`<button class="admin-secondary revoke-access" data-access="${esc(a.id)}"><i data-lucide="ban"></i> Revoke Access</button>`:`<button class="admin-primary restore-access" data-access="${esc(a.id)}"><i data-lucide="rotate-ccw"></i> Restore Access</button>`}</div></article>`;
      }).join('');
      window.lucide?.createIcons?.();
      $$('.revoke-access',box).forEach(b=>b.onclick=()=>changeAccess(b.dataset.access,'revoke'));
      $$('.restore-access',box).forEach(b=>b.onclick=()=>changeAccess(b.dataset.access,'restore'));
    }).catch(e=>{box.innerHTML=`<p class="admin-error">${esc(e?.message||e)}</p>`});
  }
  async function changeAccess(accessId,action){
    const label=action==='revoke'?'Revoke this customer’s library access?':'Restore this customer’s library access?';
    if(!confirm(label))return;
    try{
      const {data,error}=await sb.functions.invoke('revoke-access',{body:{accessId,action}});
      if(error)throw error;if(data?.error)throw new Error(data.error);await renderAccess();
    }catch(e){alert(e?.message||String(e))}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $("#refreshAccess")?.addEventListener('click',renderAccess);
    $("#accessSearch")?.addEventListener('input',renderAccess);
    $("#accessStatus")?.addEventListener('change',renderAccess);
    $$('.tab').forEach(t=>t.addEventListener('click',()=>{if(t.dataset.tab==='access')renderAccess()}));
    window.addEventListener('dn:refresh-access',renderAccess);
  });
})();
