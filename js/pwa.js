(() => {
  "use strict";

  const BRAND = "Dennis Nazar";
  const DISMISS_KEY = "dn-pwa-install-dismissed";
  const DISMISS_DAYS = 7;
  let deferredPrompt = null;
  let installModal = null;

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isAndroid = /android/i.test(navigator.userAgent);

  function injectStyles() {
    if (document.getElementById("dn-pwa-styles")) return;
    const style = document.createElement("style");
    style.id = "dn-pwa-styles";
    style.textContent = `
      #dn-pwa-splash{
        position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;
        background:#211D5A;opacity:1;visibility:visible;transition:opacity .35s ease,visibility .35s ease;
      }
      #dn-pwa-splash.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
      #dn-pwa-splash img{width:min(72vw,360px);height:auto;display:block;object-fit:contain}
      #dn-pwa-install{
        position:fixed;inset:0;z-index:2147483645;display:flex;align-items:flex-end;justify-content:center;
        padding:18px;background:rgba(12,10,28,.54);backdrop-filter:blur(8px);
      }
      #dn-pwa-install[hidden]{display:none}
      .dn-pwa-card{
        width:min(100%,430px);background:#fff;color:#101014;border-radius:24px;padding:24px;
        box-shadow:0 24px 80px rgba(0,0,0,.28);border:1px solid rgba(0,0,0,.08);
        margin-bottom:max(0px,env(safe-area-inset-bottom));
      }
      .dn-pwa-brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
      .dn-pwa-brand img{width:58px;height:42px;object-fit:contain;object-position:left center;background:#211D5A;border-radius:10px;padding:5px}
      .dn-pwa-kicker{font:700 10px/1.2 Manrope,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#73737d}
      .dn-pwa-title{font:700 25px/1.15 Manrope,Arial,sans-serif;margin:0 0 8px}
      .dn-pwa-copy{font:400 14px/1.6 Manrope,Arial,sans-serif;color:#5f6069;margin:0 0 18px}
      .dn-pwa-actions{display:flex;gap:10px}
      .dn-pwa-primary,.dn-pwa-secondary{
        min-height:48px;border-radius:12px;padding:0 18px;border:1px solid transparent;
        font:700 13px Manrope,Arial,sans-serif;cursor:pointer;flex:1
      }
      .dn-pwa-primary{background:#211D5A;color:#fff}
      .dn-pwa-secondary{background:#f2f2f5;color:#211D5A;border-color:#dedee5}
      .dn-pwa-steps{display:grid;gap:10px;margin:0 0 18px;padding:0;list-style:none}
      .dn-pwa-steps li{display:flex;gap:10px;align-items:flex-start;font:500 13px/1.45 Manrope,Arial,sans-serif;color:#45464e}
      .dn-pwa-step{
        width:24px;height:24px;flex:0 0 24px;border-radius:50%;display:grid;place-items:center;
        background:#211D5A;color:#fff;font:700 11px Manrope,Arial,sans-serif
      }
      .dn-pwa-note{font:500 11px/1.45 Manrope,Arial,sans-serif;color:#858690;margin:12px 0 0}
      @media(min-width:700px){
        #dn-pwa-install{align-items:center}
        .dn-pwa-card{margin-bottom:0}
      }
    `;
    document.head.appendChild(style);
  }

  function showSplash() {
    if (!isStandalone) return;
    const splash = document.createElement("div");
    splash.id = "dn-pwa-splash";
    splash.setAttribute("aria-hidden", "true");
    splash.innerHTML = '<img src="/assets/dn-logo-white.png" alt="" decoding="async">';
    document.body.appendChild(splash);
    const hide = () => {
      splash.classList.add("is-hidden");
      setTimeout(() => splash.remove(), 500);
    };
    window.addEventListener("load", () => setTimeout(hide, 250), { once: true });
    setTimeout(hide, 1800);
  }

  function recentlyDismissed() {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
      return until > Date.now();
    } catch (_) {
      return false;
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
    } catch (_) {}
    if (installModal) installModal.hidden = true;
  }

  function createModal() {
    if (installModal || isStandalone) return;
    installModal = document.createElement("div");
    installModal.id = "dn-pwa-install";
    installModal.hidden = true;
    installModal.setAttribute("role", "dialog");
    installModal.setAttribute("aria-modal", "true");
    installModal.setAttribute("aria-labelledby", "dn-pwa-title");
    installModal.innerHTML = `
      <div class="dn-pwa-card">
        <div class="dn-pwa-brand">
          <img src="/assets/dn-logo-white.png" alt="Dennis Nazar">
          <div class="dn-pwa-kicker">Dennis Nazar</div>
        </div>
        <h2 class="dn-pwa-title" id="dn-pwa-title">Install the bookstore</h2>
        <p class="dn-pwa-copy">Keep Dennis Nazar on your home screen for faster access to books, your Library and orders.</p>
        <div id="dn-pwa-content"></div>
        <div class="dn-pwa-actions">
          <button type="button" class="dn-pwa-secondary" id="dn-pwa-later">Not now</button>
          <button type="button" class="dn-pwa-primary" id="dn-pwa-action">Install app</button>
        </div>
      </div>
    `;
    document.body.appendChild(installModal);
    installModal.addEventListener("click", event => {
      if (event.target === installModal) dismiss();
    });
    document.getElementById("dn-pwa-later")?.addEventListener("click", dismiss);
    document.getElementById("dn-pwa-action")?.addEventListener("click", handleInstall);
  }

  function renderInstructions() {
    const content = document.getElementById("dn-pwa-content");
    const action = document.getElementById("dn-pwa-action");
    if (!content || !action) return;

    if (isIOS) {
      action.textContent = "Show steps";
      content.innerHTML = `
        <ol class="dn-pwa-steps">
          <li><span class="dn-pwa-step">1</span><span>Open the browser Share menu.</span></li>
          <li><span class="dn-pwa-step">2</span><span>Select <strong>Add to Home Screen</strong>.</span></li>
          <li><span class="dn-pwa-step">3</span><span>Confirm the name, then tap <strong>Add</strong>.</span></li>
        </ol>
        <p class="dn-pwa-note">On current iPhone and iPad versions, the option is available from the Share menu.</p>
      `;
      return;
    }

    if (isAndroid) {
      action.textContent = "Install app";
      content.innerHTML = `
        <p class="dn-pwa-copy" style="margin-bottom:16px">On Android, the Install App button can open the browser's native install dialog.</p>
      `;
      return;
    }

    action.textContent = "Install app";
    content.innerHTML = `
      <p class="dn-pwa-copy" style="margin-bottom:16px">If your browser supports PWA installation, this button will open its install dialog.</p>
    `;
  }

  async function handleInstall() {
    if (isIOS) {
      dismiss();
      return;
    }
    if (!deferredPrompt) {
      renderInstructions();
      const content = document.getElementById("dn-pwa-content");
      const action = document.getElementById("dn-pwa-action");
      if (content && isAndroid) {
        content.innerHTML = `
          <ol class="dn-pwa-steps">
            <li><span class="dn-pwa-step">1</span><span>Open the browser menu.</span></li>
            <li><span class="dn-pwa-step">2</span><span>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span></li>
          </ol>
        `;
      }
      if (action) action.textContent = "Got it";
      return;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (result?.outcome === "accepted") dismiss();
    else if (installModal) installModal.hidden = true;
  }

  function showInstallModal() {
    if (isStandalone || recentlyDismissed()) return;
    createModal();
    renderInstructions();
    if (installModal) installModal.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone && !recentlyDismissed()) {
      setTimeout(showInstallModal, 900);
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installModal) installModal.hidden = true;
    try { localStorage.removeItem(DISMISS_KEY); } catch (_) {}
  });

  function init() {
    injectStyles();
    showSplash();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    if (!isStandalone && (isIOS || isAndroid)) {
      setTimeout(showInstallModal, 2200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();