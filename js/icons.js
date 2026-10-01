(() => {
  "use strict";
  const ICONS = {
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "shopping-bag": '<path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    "shopping-cart": '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6"/>',
    "book-open": '<path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v19H4.5A2.5 2.5 0 0 1 2 18.5v-14Z"/><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v19h6.5a2.5 2.5 0 0 0 2.5-2.5v-14Z"/>',
    "library": '<path d="M4 19V5"/><path d="M8 19V5"/><path d="M12 19V5"/><path d="M16 19V5"/><path d="M20 19V5"/><path d="M2 19h20"/>',
    "check": '<path d="m5 12 4 4L19 6"/>',
    "sparkles": '<path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z"/><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z"/>',
    "circle": '<circle cx="12" cy="12" r="3"/>',
    "x": '<path d="m6 6 12 12M18 6 6 18"/>',
    "play-circle": '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
    "search-check": '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/><path d="m8.5 11 1.7 1.7 3.3-3.4"/>',
    "lock-keyhole": '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/>',
    "eye": '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    "eye-off": '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3.1 4.1"/><path d="M6.2 6.2C3.6 8 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 3.1-.5"/>'
  };
  function createIcons(root=document) {
    root.querySelectorAll?.("[data-lucide]").forEach(el => {
      const name = el.getAttribute("data-lucide");
      if (!ICONS[name]) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("viewBox","0 0 24 24");
      svg.setAttribute("fill","none");
      svg.setAttribute("stroke","currentColor");
      svg.setAttribute("stroke-width","1.8");
      svg.setAttribute("stroke-linecap","round");
      svg.setAttribute("stroke-linejoin","round");
      svg.setAttribute("aria-hidden","true");
      svg.setAttribute("focusable","false");
      for (const markup of ICONS[name].match(/<[^>]+>/g)||[]) {
        const t=document.createElementNS("http://www.w3.org/2000/svg",markup.match(/^<([\w-]+)/)[1]);
        for (const m of markup.matchAll(/([\w-]+)="([^"]*)"/g)) t.setAttribute(m[1],m[2]);
        svg.appendChild(t);
      }
      for (const attr of ["class","style"]) if(el.hasAttribute(attr)) svg.setAttribute(attr,el.getAttribute(attr));
      el.replaceWith(svg);
    });
  }
  window.dnCreateIcons=createIcons;
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>createIcons(),{once:true});
  else createIcons();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)createIcons(n)}))).observe(document.documentElement,{childList:true,subtree:true});
})();