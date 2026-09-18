(async function(){
const $=(s,r=document)=>r.querySelector(s);
const loaded=await loadBackendStore(),cfg=loaded.config,books=loaded.books;
	const params=new URLSearchParams(location.search),requested=params.get("book")||params.get("slug")||"book1",id=books[requested]?requested:(Object.entries(books).find(([,b])=>b.slug===requested)?.[0]||requested),book=books[id];
	const details={
 book1:{kicker:"DIGITAL EDITION · 01",features:["Misingi ya kuchagua mwenzi kwa hekima","Maswali ya kujitafakari kabla ya kufanya maamuzi","Mtazamo wa mahusiano unaolenga maisha ya muda mrefu","Private Library access baada ya payment verification"]},
 book2:{kicker:"DIGITAL EDITION · 02",features:["Kutafakari thamani na nafasi ya mwanamke","Mawazo ya kujenga mtazamo chanya wa maisha","Maudhui ya reflection na personal growth","Private Library access baada ya payment verification"]},
 book3:{kicker:"DIGITAL EDITION · 03",features:["Reflection kuhusu maisha na legacy","Maswali yanayochochea fikra","Hatua za kuishi maisha yenye kusudi","Private Library access baada ya payment verification"]}
	};
	if(!book||!book.available||book.status==='inactive'){location.replace("index.html#books");return}
	const d=details[id]||details.book1;
	document.title=`${book.title} — Dennis Nazar`;
	$("#bookImage").src=book.image||'assets/coming-soon-cover.jpg';$("#bookImage").alt=book.title;$("#bookImage").onerror=()=>{$("#bookImage").onerror=null;$("#bookImage").src='assets/coming-soon-cover.jpg'};
	$("#bookKicker").textContent=d.kicker;$("#bookTitle").textContent=book.title;$("#bookSubtitle").textContent=book.subtitle;
	$("#bookPrice").textContent=Number(book.price).toLocaleString("en-US");
	const priceCurrency=$(".book-price-row span");if(priceCurrency)priceCurrency.textContent=book.currency||cfg.currency||'TZS';
	$("#bookFeatures").innerHTML=d.features.map((x,i)=>`<li><i data-lucide="${["book-open","lightbulb","target","library"][i]}"></i><span>${x}</span></li>`).join("");
	function buy(){saveCart([{id}]);location.href=`checkout.html?book=${encodeURIComponent(id)}`}
	function add(){const cart=getCart().map(x=>({id:String(x.id)})).filter(x=>books[x.id]?.available&&books[x.id]?.status!=='inactive');if(!cart.some(x=>x.id===id))cart.push({id});saveCart(cart);toast("Kitabu kimeongezwa kwenye cart.")}
	$("#buyBook").onclick=buy;$("#addBook").onclick=add;
	const related=Object.entries(books).filter(([k,b])=>k!==id&&b.available&&b.status!=='inactive').sort((a,b)=>Number(a[1].sort_order??999)-Number(b[1].sort_order??999)).slice(0,2);
	$("#relatedBooks").innerHTML=related.map(([k,b])=>`<a class="related-card" href="book.html?book=${encodeURIComponent(k)}"><img src="${String(b.image||'assets/coming-soon-cover.jpg').replace(/"/g,'&quot;')}" alt="${String(b.title||'Book').replace(/[&<>]/g,'')}" onerror="this.onerror=null;this.src='assets/coming-soon-cover.jpg'"><div><small>AVAILABLE NOW</small><h3>${String(b.title||'Book').replace(/[&<>]/g,'')}</h3><strong>${Number(b.price).toLocaleString("en-US")} ${b.currency||cfg.currency||'TZS'}</strong></div><i data-lucide="arrow-up-right"></i></a>`).join("");
function toast(m){const t=$("#bookToast");t.querySelector("span").textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}
if(window.lucide)lucide.createIcons();
})();
