(async function(){
let {config:SITE_CONFIG,books:BOOKS}=await loadBackendStore();
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
	function applySiteConfig(){
	  const c=SITE_CONFIG.content||{},colors=SITE_CONFIG.colors||{};
	  Object.entries(colors).forEach(([k,v])=>document.documentElement.style.setProperty(`--${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,v));
  const safeContent=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').split('&lt;br&gt;').join('<br>').split('&lt;span&gt;').join('<span>').split('&lt;/span&gt;').join('</span>');
	  const set=(sel,val,html=false)=>{const el=$(sel);if(el&&val!==undefined){const rendered=safeContent(val);if(html)el.innerHTML=rendered;else el.textContent=String(val)}};
		  set('.hero h1',c.heroTitle,true);set('.hero-lead',c.heroLead,true);set('.why-heading h2',c.whyTitle,true);set('.why-heading>p:last-child',c.whyLead);set('.about-copy h2',c.aboutTitle,true);set('.footer-brand-col p',c.footerTagline);
	  const about=$('.about-copy');
  if(about&&c.aboutBody){const aboutBody=String(c.aboutBody).replace(/\\+n/g,String.fromCharCode(10));const paragraphs=aboutBody.split(String.fromCharCode(10)+String.fromCharCode(10));about.querySelectorAll('.about-text').forEach((p,i)=>p.textContent=(paragraphs[i]||'').trim())}
	  const username=(SITE_CONFIG.socialUsername||'@dennisnazar_').replace(/^@/,'');
	  $$('.footer-socials a').forEach(a=>{const kind=a.classList.contains('instagram')?'instagram':a.classList.contains('tiktok')?'tiktok':a.classList.contains('threads')?'threads':'facebook';a.href=kind==='instagram'?`https://instagram.com/${username}`:kind==='tiktok'?`https://www.tiktok.com/@${username}`:kind==='threads'?`https://www.threads.net/@${username}`:`https://facebook.com/${username}`});
	  const em=$('.footer-email');if(em){em.textContent=SITE_CONFIG.email;em.href=`mailto:${SITE_CONFIG.email}`}
	  const ph=$('.footer-phone');if(ph){ph.textContent=SITE_CONFIG.paymentPhone;ph.href=`tel:${SITE_CONFIG.paymentPhone.replace(/\\s/g,'')}`}
	  const mp=$('.footer-map');if(mp){mp.textContent=SITE_CONFIG.mapLocation;mp.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.mapLocation)}`}
	  const wa=$('.whatsapp-float');if(wa)wa.href=`https://wa.me/${String(SITE_CONFIG.whatsapp).replace(/\\D/g,'')}`;
	}
	function applyBooks(){
		  const available=Object.entries(BOOKS).filter(([,b])=>b?.available&&b?.status!=='inactive').sort((a,b)=>Number(a[1].sort_order??999)-Number(b[1].sort_order??999));
		  const coming=Object.entries(BOOKS).filter(([,b])=>!b?.available&&b?.status!=='inactive').sort((a,b)=>Number(a[1].sort_order??999)-Number(b[1].sort_order??999)).slice(0,2);
		 const featured=available[0];
		 if(featured){
		   const [featuredId,featuredBook]=featured,featuredImage=$('#featuredImage'),featuredTitle=$('#featuredTitle'),featuredDescription=$('#featuredDescription'),featuredPrice=$('#featuredPrice'),featuredDetails=$('#featuredDetails');
		   if(featuredImage){featuredImage.src=featuredBook.image||'';featuredImage.alt=featuredBook.title||'Featured Dennis Nazar book'}
		   if(featuredTitle)featuredTitle.textContent=featuredBook.title||'';
		   if(featuredDescription)featuredDescription.textContent=featuredBook.description||featuredBook.subtitle||'';
		   if(featuredPrice)featuredPrice.innerHTML=`${Number(featuredBook.price||0).toLocaleString('en-US')} <small>${escapeHtml(featuredBook.currency||SITE_CONFIG.currency||'TZS')}</small>`;
		   if(featuredDetails)featuredDetails.dataset.bookDetails=featuredId;
		 }
		 const trustValues=$$('.hero-trust strong');
	 if(trustValues[0])trustValues[0].textContent=String(available.length).padStart(2,'0');
	 if(trustValues[1])trustValues[1].textContent=String(Object.entries(BOOKS).filter(([,b])=>!b?.available&&b?.status!=='inactive').length).padStart(2,'0');
	  const grid=$('.book-grid');
  if(grid){
	    grid.innerHTML=available.length?available.map(([id,b],i)=>`<article class="book-card reveal ${i%3===1?'reveal-delay':i%3===2?'reveal-delay-2':''}" data-book-card="${escapeHtml(id)}">
	      <div class="book-image"><img src="${escapeHtml(b.image||'')}" alt="${escapeHtml(b.title||'Book')}" loading="lazy" onerror="this.onerror=null;this.src='assets/coming-soon-cover.jpg';this.classList.add('asset-fallback')"><span class="book-badge"><i data-lucide="check"></i> Available</span></div>
      <div class="book-body"><div class="book-meta">${String(i+1).padStart(2,'0')} · CURRENT RELEASE</div><h3>${escapeHtml(b.title||'Untitled book')}</h3><p>${escapeHtml(b.subtitle||'')}</p><div class="book-format"><i data-lucide="library"></i><span>Digital edition · Private Library access</span></div><button class="book-details-link" data-book-details="${escapeHtml(id)}">View Book Details <i data-lucide="arrow-up-right"></i></button><div class="book-footer"><strong>${Number(b.price||0).toLocaleString('en-US')} <small>${escapeHtml(SITE_CONFIG.currency||'TZS')}</small></strong><button class="buy-btn" data-book="${escapeHtml(id)}">Buy Softcopy <i data-lucide="arrow-right"></i></button><div class="cart-action"><button class="add-cart-btn" data-add-cart="${escapeHtml(id)}" aria-label="Add ${escapeHtml(b.title||'book')} to cart"><i data-lucide="shopping-cart"></i><span>Add to cart</span></button></div></div></div>
    </article>`).join(''):`<div class="admin-empty"><strong>No books are currently available.</strong><span>New releases will appear here.</span></div>`;
  }
  const comingGrid=$('.coming-grid');
  if(comingGrid){
	    comingGrid.innerHTML=coming.length?coming.map(([id,b],i)=>`<article class="coming-card reveal ${i%2?'reveal-delay':''}"><div class="coming-cover"><img src="${escapeHtml(b.image||'assets/coming-soon-cover.jpg')}" alt="${escapeHtml(b.title||'Dennis Nazar book coming soon')}" loading="lazy" onerror="this.onerror=null;this.src='assets/coming-soon-cover.jpg'"><div class="coming-overlay"><span>COMING SOON</span><strong>BOOK ${String(i+1+available.length).padStart(2,'0')}</strong></div></div><div class="coming-body"><div><small>NEW RELEASE</small><h3>${escapeHtml(b.title||'New book coming soon')}</h3></div><button class="outline-btn" data-notify>Notify Me <i data-lucide="bell"></i></button></div></article>`).join(''):`<div class="admin-empty"><strong>No upcoming books.</strong><span>New titles can be added from the Admin Dashboard.</span></div>`;
  }
  $$('.reveal').forEach(e=>{if('IntersectionObserver'in window)e.classList.remove('visible');});
  if(window.lucide)lucide.createIcons();
}
function escapeHtml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
applySiteConfig();applyBooks();if(window.lucide)lucide.createIcons();

const bookDetails={
 book1:{kicker:"DIGITAL EDITION · 01",description:"Mwongozo wa kujitambua na kufanya maamuzi ya busara unapochagua mwenzi wa maisha, ukiangalia tabia, mawasiliano, maadili na mwelekeo wa baadaye.",features:["Misingi ya kuchagua mwenzi kwa hekima","Maswali ya kujitafakari kabla ya kufanya maamuzi","Mtazamo wa mahusiano unaolenga maisha ya muda mrefu"]},
 book2:{kicker:"DIGITAL EDITION · 02",description:"Kitabu kinachomsaidia mwanamke kutafakari thamani yake, nafasi yake na nguvu alizonazo, huku kikigusa kujiamini, mahusiano na safari ya ukuaji binafsi.",features:["Kutafakari thamani na nafasi ya mwanamke","Mawazo ya kujenga mtazamo chanya wa maisha","Maudhui ya reflection na personal growth"]},
 book3:{kicker:"DIGITAL EDITION · 03",description:"Mwongozo wa kutafakari alama unazoacha katika maisha ya wengine, maamuzi unayofanya leo na namna ya kujenga historia yenye maana, kusudi na matokeo mema.",features:["Reflection kuhusu maisha na legacy","Maswali yanayochochea fikra","Hatua za kuishi maisha yenye kusudi"]}
};
const bookModal=$("#bookModal");let activeDetailsBook=null;
	function openBookDetails(id){const b=BOOKS[id];if(!b||!bookModal)return;const base=bookDetails[id]||{kicker:`DIGITAL EDITION · ${String(b?.sort_order||1).padStart(2,"0")}`,description:"Dennis Nazar digital edition.",features:["Thought-provoking ideas","Practical reflection and personal growth","Private Library access"]},d={...base,description:b.description||b.subtitle||base.description};activeDetailsBook=id;$("#bookModalImage").src=b.image;$("#bookModalImage").alt=b.title;$("#bookModalKicker").textContent=d.kicker;$("#bookModalTitle").textContent=b.title;$("#bookModalSubtitle").textContent=d.description;$("#bookModalPrice").textContent=Number(b.price).toLocaleString("en-US");const currency=bookModal.querySelector(".book-modal-price span");if(currency)currency.textContent=b.currency||SITE_CONFIG.currency||"TZS";bookModal.querySelector(".book-modal-feature-list").innerHTML=d.features.map((f,i)=>`<div><i data-lucide="${["book-open","lightbulb","target"][i]}"></i><span>${f}</span></div>`).join("")+`<div><i data-lucide="library"></i><span>Private Library access baada ya payment verification</span></div>`;bookModal.classList.add("open");bookModal.setAttribute("aria-hidden","false");document.body.classList.add("locked");if(window.lucide)lucide.createIcons()}
function closeBookDetails(){bookModal?.classList.remove("open");bookModal?.setAttribute("aria-hidden","true");document.body.classList.remove("locked");activeDetailsBook=null}
document.addEventListener("click",e=>{const details=e.target.closest?.("[data-book-details]");if(details){e.preventDefault();openBookDetails(details.dataset.bookDetails)}});
$("#bookModalClose")?.addEventListener("click",closeBookDetails);bookModal?.addEventListener("click",e=>{if(e.target===bookModal)closeBookDetails()});
$("#bookModalBuy")?.addEventListener("click",()=>{if(activeDetailsBook){const id=activeDetailsBook;closeBookDetails();buyNow(id)}});$("#bookModalCart")?.addEventListener("click",()=>{if(activeDetailsBook){addToCart(activeDetailsBook);closeBookDetails();openCart()}});

const mobileMenu=$("#mobileMenu"),menuToggle=$("#menuToggle"),menuClose=$("#menuClose");function setMenu(open){mobileMenu?.classList.toggle('open',open);mobileMenu?.setAttribute('aria-hidden',String(!open));menuToggle?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('locked',open)}menuToggle?.addEventListener('click',()=>setMenu(true));menuClose?.addEventListener('click',()=>setMenu(false));$$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(e=>io.observe(e))}else $$('.reveal').forEach(e=>e.classList.add('visible'));
	function updateCartCount(){const e=$("#cartCount");if(e)e.textContent=getCart().length}function addToCart(id){const b=BOOKS[id];if(!b?.available||b.status==='inactive')return;const cart=getCart().map(x=>({id:String(x.id)})).filter(x=>BOOKS[x.id]?.available&&BOOKS[x.id]?.status!=='inactive');if(!cart.some(x=>x.id===id))cart.push({id});saveCart(cart);updateCartCount();showToast(`${b.title} imeongezwa kwenye cart.`)}function buyNow(id){const b=BOOKS[id];if(!b?.available||b.status==='inactive')return;saveCart([{id}]);location.href=`checkout.html?book=${encodeURIComponent(id)}`}$$( '[data-add-cart]').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.addCart)));$$('.buy-btn').forEach(b=>b.addEventListener('click',()=>buyNow(b.dataset.book)));updateCartCount();
	const cartEl=$("#cart"),cartItems=$("#cartItems"),cartEmpty=$("#cartEmpty"),cartFoot=$("#cartFoot"),cartTotal=$("#cartTotal");function renderCart(){const cart=getCart().map(i=>({id:i.id,b:BOOKS[i.id]})).filter(x=>x.b?.available&&x.b.status!=='inactive');saveCart(cart.map(x=>({id:x.id})));if(!cartItems)return;cartItems.innerHTML=cart.map(({id:bId,b})=>`<div class="cart-item"><img src="${escapeHtml(b.image||'')}" alt="${escapeHtml(b.title||'Book')}"><div><h3>${escapeHtml(b.title||'Book')}</h3><small>Digital Softcopy</small><br><button class="cart-remove" data-remove="${escapeHtml(bId)}">Remove</button></div><strong class="cart-item-price">${formatPrice(b.price)}</strong></div>`).join('');$$('[data-remove]',cartItems).forEach(b=>b.onclick=()=>{saveCart(getCart().filter(i=>i.id!==b.dataset.remove).map(i=>({id:i.id})));renderCart();updateCartCount()});const empty=!cart.length;if(cartEmpty)cartEmpty.hidden=!empty;if(cartFoot)cartFoot.hidden=empty;if(cartTotal)cartTotal.textContent=formatPrice(cart.reduce((a,x)=>a+Number(x.b.price||0),0));if(window.lucide)lucide.createIcons()}function openCart(){renderCart();cartEl?.classList.add('open');cartEl?.setAttribute('aria-hidden','false');document.body.classList.add('locked')}function closeCart(){cartEl?.classList.remove('open');cartEl?.setAttribute('aria-hidden','true');document.body.classList.remove('locked')}$("#cartTrigger")?.addEventListener('click',openCart);$("#cartClose")?.addEventListener('click',closeCart);cartEl?.addEventListener('click',e=>{if(e.target===cartEl)closeCart()});$("#cartCheckout")?.addEventListener('click',()=>{if(getCart().length)location.href='checkout.html'});$("#cartBrowse")?.addEventListener('click',closeCart);
const toast=$("#toast");function showToast(m){if(!toast)return;toast.querySelector("span").textContent=m;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3500)}
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-notify]");if(!b)return;$("#email")?.focus();$("#contact")?.scrollIntoView({behavior:"smooth"});showToast("Weka email yako ili upate taarifa za releases mpya.")});
$("#newsletterForm")?.addEventListener("submit",async e=>{e.preventDefault();const input=$("#email"),email=input?.value.trim();if(!email)return;const btn=e.currentTarget.querySelector("button");if(btn)btn.disabled=true;try{const sb=getSupabase();if(sb){const {error}=await sb.from("newsletter_subscribers").insert({email});if(error && error.code!=="23505")throw error}else{const list=JSON.parse(localStorage.getItem("dnNewsletter")||"[]");if(!list.includes(email))list.push(email);localStorage.setItem("dnNewsletter",JSON.stringify(list))}e.currentTarget.reset();showToast("Umefanikiwa kujiunga na updates za Dennis Nazar.")}catch(err){showToast("Imeshindikana kuhifadhi email. Jaribu tena.")}finally{if(btn)btn.disabled=false}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();setMenu(false);closeBookDetails()}});})();


/* Smooth back-to-top control */
(() => {
  const button = document.getElementById('backToTop');
  if (!button) return;
  const toggle = () => button.classList.toggle('is-visible', window.scrollY > Math.max(180, window.innerHeight * 0.78));
  window.addEventListener('scroll', toggle, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  if (window.lucide) window.lucide.createIcons();
  toggle();
})();
