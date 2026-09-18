(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const sb=getSupabase();
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const fmt=n=>Number(n||0).toLocaleString('en-US');
  async function loadReaderBooks(){
    const box=$("#readerBookList"); if(!box||!sb)return;
    box.innerHTML='<div class="admin-loading">Loading reader content…</div>';
    try{
      const [{data:books,error:be},{data:pages,error:pe}]=await Promise.all([
        sb.from('books').select('id,title,available,sort_order').order('sort_order'),
        sb.from('book_pages').select('book_id,page_number').order('page_number')
      ]);
      if(be)throw be;if(pe)throw pe;
      const counts={};(pages||[]).forEach(p=>counts[p.book_id]=(counts[p.book_id]||0)+1);
      box.innerHTML=(books||[]).map(b=>`<article class="reader-admin-card" data-reader-book="${esc(b.id)}">
        <div class="reader-admin-top"><div><p class="section-kicker">${b.available?'LIVE BOOK':'COMING SOON'}</p><h3>${esc(b.title)}</h3><span>${esc(b.id)} · ${fmt(counts[b.id])} page${counts[b.id]===1?'':'s'} uploaded</span></div><span class="book-admin-status ${b.available?'is-live':''}">${b.available?'PUBLISHED':'DRAFT'}</span></div>
        <div class="reader-admin-controls"><label>Start page<input class="reader-start" type="number" min="1" value="${counts[b.id]?Math.max(1,Math.max(...(pages||[]).filter(x=>x.book_id===b.id).map(x=>x.page_number))+1):1}"></label><label class="reader-file-label">Page images<input class="reader-files" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><button type="button" class="admin-primary upload-reader-pages"><i data-lucide="upload"></i> Upload Pages</button></div>
        <p class="reader-admin-note">Name your files in reading order (for example 001.webp, 002.webp, 003.webp). The selected start page determines where numbering begins. Existing page numbers are replaced safely.</p>
      </article>`).join('')||'<div class="admin-empty"><strong>No books found.</strong><span>Add a book in Catalog Management first.</span></div>';
      if(window.lucide)lucide.createIcons();
      $$('.upload-reader-pages',box).forEach(btn=>btn.onclick=()=>uploadPages(btn.closest('[data-reader-book]')));
    }catch(e){box.innerHTML=`<p class="admin-error">${esc(e?.message||e)}</p>`}
  }
  async function uploadPages(card){
    const bookId=card?.dataset.readerBook;if(!bookId)return;
    const files=[...card.querySelector('.reader-files')?.files||[]];if(!files.length){alert('Select page images first.');return}
    let start=Math.max(1,Number(card.querySelector('.reader-start')?.value||1));
    const allowed=/^image\/(jpeg|png|webp)$/i;if(files.some(f=>!allowed.test(f.type))){alert('Only JPG, PNG or WebP page images are supported.');return}
    files.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
    const btn=card.querySelector('.upload-reader-pages');btn.disabled=true;const old=btn.innerHTML;btn.innerHTML='Uploading…';
    try{
      for(let i=0;i<files.length;i++){
        const page=start+i,file=files[i],ext=(file.name.split('.').pop()||'webp').toLowerCase().replace('jpeg','jpg');
        const path=`${bookId}/${String(page).padStart(5,'0')}.${ext}`;
        const {error:up}=await sb.storage.from('book-pages').upload(path,file,{upsert:true,contentType:file.type});if(up)throw up;
        const {error:db}=await sb.from('book_pages').upsert({book_id:bookId,page_number:page,image_path:path},{onConflict:'book_id,page_number'});if(db)throw db;
      }
      alert(`${files.length} page(s) uploaded for ${bookId}.`);await loadReaderBooks();
    }catch(e){alert(e?.message||String(e))}finally{btn.disabled=false;btn.innerHTML=old}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('#refreshReaderBooks')?.addEventListener('click',loadReaderBooks);
    $$('.tab').forEach(t=>t.addEventListener('click',()=>{if(t.dataset.tab==='reader')loadReaderBooks()}));
    window.addEventListener('dn:refresh-reader',loadReaderBooks);
  });
})();
