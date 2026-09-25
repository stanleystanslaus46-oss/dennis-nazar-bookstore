(function () {
  "use strict";
  const KEY = "dn_cookie_consent_v1";
  if (localStorage.getItem(KEY)) return;

  const style = document.createElement("style");
  style.textContent = `
    .dn-cookie-banner{position:fixed;left:20px;right:20px;bottom:20px;z-index:99999;max-width:760px;margin:0 auto;padding:20px 22px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(24,21,58,.96);box-shadow:0 20px 60px rgba(0,0,0,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#fff;font-family:inherit}
    .dn-cookie-inner{display:flex;gap:20px;align-items:center;justify-content:space-between}
    .dn-cookie-copy{min-width:0}.dn-cookie-title{margin:0 0 6px;font-size:15px;font-weight:700;letter-spacing:.01em}.dn-cookie-text{margin:0;color:rgba(255,255,255,.72);font-size:13px;line-height:1.6}.dn-cookie-text a{color:#fff;text-decoration:underline;text-underline-offset:3px}
    .dn-cookie-actions{display:flex;gap:9px;flex-shrink:0}.dn-cookie-btn{border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:10px 15px;background:transparent;color:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.dn-cookie-btn.primary{background:#fff;color:#211D5A;border-color:#fff}.dn-cookie-btn:hover{transform:translateY(-1px)}
    @media(max-width:640px){.dn-cookie-banner{left:12px;right:12px;bottom:12px;padding:18px;border-radius:16px}.dn-cookie-inner{display:block}.dn-cookie-actions{margin-top:15px}.dn-cookie-btn{flex:1}.dn-cookie-text{font-size:12.5px}}
  `;
  document.head.appendChild(style);

  const banner = document.createElement("aside");
  banner.className = "dn-cookie-banner";
  banner.setAttribute("aria-label", "Cookie preferences");
  banner.innerHTML = `
    <div class="dn-cookie-inner">
      <div class="dn-cookie-copy">
        <h2 class="dn-cookie-title">Cookies on Dennis Nazar</h2>
        <p class="dn-cookie-text">Tunatumia cookies muhimu kusaidia tovuti kufanya kazi, kuhifadhi session na kuboresha matumizi ya msingi. Hatumii advertising cookies kwa sasa. <a href="/privacy.html">Privacy Policy</a></p>
      </div>
      <div class="dn-cookie-actions">
        <button type="button" class="dn-cookie-btn" data-dn-cookie="essential">Only Essential</button>
        <button type="button" class="dn-cookie-btn primary" data-dn-cookie="accept">Accept</button>
      </div>
    </div>`;
  document.body.appendChild(banner);

  function save(value){
    localStorage.setItem(KEY, JSON.stringify({choice:value,at:new Date().toISOString()}));
    banner.remove();
  }
  banner.addEventListener("click", function(e){
    const btn=e.target.closest("[data-dn-cookie]");
    if(!btn) return;
    save(btn.dataset.dnCookie);
  });
})();