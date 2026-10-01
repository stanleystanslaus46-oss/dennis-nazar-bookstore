(() => {
"use strict";

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const icon=()=>window.dnCreateIcons?.();

let CONFIG=getStoreConfig();
let BOOKS=getBooks();
let activeBook=null;

function applyConfig(){
  const c=CONFIG.content||{}, colors=CONFIG.colors||{}, media=CONFIG.media||{};
  Object.entries(colors).forEach(([k,v])=>document.documentElement.style.setProperty("--"+k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase()),v));
  const set=(sel,val,html=false)=>{const e=$(sel);if(e&&val!=null){if(html)e.innerHTML=String(val);else e.textContent=String(val)}};
  set(".hero h1",c.heroTitle,true);
  set(".hero-lead",c.heroLead,true);
  set(".why-heading h2",c.whyTitle,true);
  set(".why-heading>p:last-child",c.whyLead);
  set(".about-copy h2",c.aboutTitle,true);
  set(".footer-brand-col p",c.footerTagline);
  set(".footer-email",CONFIG.email);
  const email=$(".footer-email"); if(email) email.href="mailto:"+CONFIG.email;
  if(media.hero){document.documentElement.style.setProperty("--hero-image",'url("'+String(media.hero).replace(/"/g,'\"')+'")')}
  if(media.author)$$(".about-author-image img").forEach(img=>img.src=media.author);
}

function renderBooks(){
  const available=Object.entries(BOOKS).filter(([,b])=>b?.available&&b?.status!=="inactive").sort((a,b)=>Number(a[1].sort_order??999)-Number(b[1].sort_order??999));
  const coming=Object.entries(BOOKS).filter(([,b])=>!b?.available&&b?.status!=="inactive").sort((a,b)=>Number(a[1].sort_order??999)-Number(b[1].sort_order??999)).slice(0,2);
  const grid=$(".book-grid");
  if(grid) grid.innerHTML=available.map(([id,b],i)=>`<article class="book-card reveal"><div class="book-image"><img src="${esc(b.image||"")}" alt="${esc(b.title||"Book")}" loading="lazy"><span class="book-badge"><i data-lucide="check"></i> Available</span></div><div class="book-body"><div class="book-meta">${String(i+1).padStart(2,"0")} · CURRENT RELEASE</div><h3>${esc(b.title)}</h3><p>${esc(b.subtitle||b.description||"")}</p><div class="book-format"><i data-lucide="library"></i><span>Digital edition · Private Library access</span></div><button class="book-details-link" data-book-details="${esc(id)}">View Book Details <i data-lucide="arrow-up-right"></i></button><div class="book-footer"><strong>${Number(b.price||0).toLocaleString("en-US")} <small>${esc(b.currency||CONFIG.currency||"TZS")}</small></strong><button class="buy-btn" data-book="${esc(id)}">Buy Softcopy <i data-lucide="arrow-right"></i></button><div class="cart-action"><button class="add-cart-btn" data-add-cart="${esc(id)}"><i data-lucide="shopping-cart"></i><span>Add to cart</span></button></div></div></div></article>`).join("")||'<div class="admin-empty"><strong>No books are currently available.</strong></div>';
  const cg=$(".coming-grid");
  if(cg) cg.innerHTML=coming.map(([id,b],i)=>`<article class="coming-card reveal"><div class="coming-cover"><img src="${esc(b.image||"assets/coming-soon-cover.webp")}" alt="${esc(b.title||"Coming soon")}" loading="lazy"><div class="coming-overlay"><span>COMING SOON</span><strong>BOOK ${String(i+1+available.length).padStart(2,"0")}</strong></div></div><div class="coming-body"><div><small>NEW RELEASE</small><h3>${esc(b.title||"New book coming soon")}</h3><p class="coming-description">${esc(b.description||b.subtitle||"")}</p></div><button class="outline-btn" data-notify="${esc(id)}">Explore Books <i data-lucide="arrow-up-right"></i></button></div></article>`).join("");
  const trust=$$(".hero-trust strong"); if(trust[0])trust[0].textContent=String(available.length).padStart(2,"0"); if(trust[1])trust[1].textContent=String(Object.keys(BOOKS).length-available.length).padStart(2,"0");
  icon();
  $$(".reveal").forEach(e=>e.classList.add("visible"));
}

function cart(){return getCart().filter(x=>BOOKS[x.id]?.available).map(x=>({id:String(x.id)}))}
function syncCart(){saveCart(cart());const e=$("#cartCount");if(e)e.textContent=String(cart().length)}
function addCart(id){if(!BOOKS[id]?.available)return;const c=cart();if(!c.some(x=>x.id===id))c.push({id});saveCart(c);syncCart();toast("Kitabu kimeongezwa kwenye cart.")}
function buy(id){if(!BOOKS[id]?.available)return;saveCart([{id}]);location.href="checkout.html?book="+encodeURIComponent(id)}
function openCart(){renderCart();$("#cart")?.classList.add("open");$("#cart")?.setAttribute("aria-hidden","false");document.body.classList.add("locked")}
function closeCart(){$("#cart")?.classList.remove("open");$("#cart")?.setAttribute("aria-hidden","true");document.body.classList.remove("locked")}
function renderCart(){const items=$("#cartItems");if(!items)return;const c=cart();items.innerHTML=c.map(x=>{const b=BOOKS[x.id];return `<div class="cart-item"><img src="${esc(b.image||"")}"><div><h3>${esc(b.title)}</h3><small>Digital Softcopy</small><br><button class="cart-remove" data-remove="${esc(x.id)}">Remove</button></div><strong>${Number(b.price||0).toLocaleString("en-US")} ${esc(b.currency||CONFIG.currency||"TZS")}</strong></div>`}).join("");$("#cartEmpty")?.toggleAttribute("hidden",c.length>0);$("#cartFoot")?.toggleAttribute("hidden",c.length===0);const total=c.reduce((n,x)=>n+Number(BOOKS[x.id].price||0),0);if($("#cartTotal"))$("#cartTotal").textContent=total.toLocaleString("en-US")+" "+(CONFIG.currency||"TZS");icon()}
function openDetails(id){const b=BOOKS[id];const m=$("#bookModal");if(!b||!m)return;activeBook=id;const im=$("#bookModalImage");if(im){im.src=b.image||"";im.alt=b.title||""}if($("#bookModalTitle"))$("#bookModalTitle").textContent=b.title||"";if($("#bookModalSubtitle"))$("#bookModalSubtitle").textContent=b.description||b.subtitle||"";if($("#bookModalPrice"))$("#bookModalPrice").textContent=Number(b.price||0).toLocaleString("en-US");m.classList.add("open");m.setAttribute("aria-hidden","false");document.body.classList.add("locked");icon()}
function closeDetails(){$("#bookModal")?.classList.remove("open");$("#bookModal")?.setAttribute("aria-hidden","true");document.body.classList.remove("locked");activeBook=null}
function toast(msg){const t=$("#toast");if(!t)return;const s=t.querySelector("span");if(s)s.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}

function bind(){
  document.addEventListener("click",e=>{
    const el=e.target.closest?.("[data-add-cart]"); if(el){e.preventDefault();e.stopPropagation();addCart(el.dataset.addCart);return}
    const buyBtn=e.target.closest?.(".buy-btn"); if(buyBtn){e.preventDefault();e.stopPropagation();buy(buyBtn.dataset.book);return}
    const details=e.target.closest?.("[data-book-details]"); if(details){e.preventDefault();e.stopPropagation();openDetails(details.dataset.bookDetails);return}
    const remove=e.target.closest?.("[data-remove]"); if(remove){e.preventDefault();e.stopPropagation();const id=String(remove.dataset.remove||"");saveCart(cart().filter(x=>x.id!==id));syncCart();renderCart();toast("Kitabu kimeondolewa kwenye cart.");return}\n    const notify=e.target.closest?.("[data-notify]"); if(notify){e.preventDefault();e.stopPropagation();document.querySelector("#books")?.scrollIntoView({behavior:"smooth"});return}
  },true);
  $("#cartTrigger")?.addEventListener("click",e=>{e.preventDefault();openCart()});
  $("#cartClose")?.addEventListener("click",closeCart);
  $("#cart")?.addEventListener("click",e=>{if(e.target===$("#cart"))closeCart()});
  $("#cartBrowse")?.addEventListener("click",closeCart);
  $("#cartCheckout")?.addEventListener("click",()=>{if(cart().length)location.href="checkout.html"});
  $("#bookModalClose")?.addEventListener("click",closeDetails);
  $("#bookModal")?.addEventListener("click",e=>{if(e.target===$("#bookModal"))closeDetails()});
  $("#bookModalBuy")?.addEventListener("click",()=>{if(activeBook)buy(activeBook)});
  $("#bookModalCart")?.addEventListener("click",()=>{if(activeBook){addCart(activeBook);closeDetails();openCart()}});
  $("#menuToggle")?.addEventListener("click",()=>{$("#mobileMenu")?.classList.add("open");$("#mobileMenu")?.setAttribute("aria-hidden","false");document.body.classList.add("locked")});
  $("#menuClose")?.addEventListener("click",()=>{$("#mobileMenu")?.classList.remove("open");$("#mobileMenu")?.setAttribute("aria-hidden","true");document.body.classList.remove("locked")});
  $$(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>{$("#mobileMenu")?.classList.remove("open");document.body.classList.remove("locked")}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeDetails();$("#mobileMenu")?.classList.remove("open");document.body.classList.remove("locked")}});
  syncCart();
}

async function boot(){
  try{applyConfig();renderBooks();bind()}catch(_){}
  try{
    const r=await loadBackendStore();
    if(r?.config)CONFIG=r.config;
    if(r?.books)BOOKS=r.books;
    applyConfig();renderBooks();syncCart();
  }catch(_){}
  icon();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();