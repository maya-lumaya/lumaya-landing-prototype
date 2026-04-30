/* ============================================================
 * Viluma — Mobile sticky bottom nav + fullscreen account sheet
 *
 *   <div data-component="bottom-nav"
 *        data-active="home|search|saved|you"
 *        data-auth="in|out"></div>
 *   <script src="bottom-nav.js" defer></script>
 *
 * Hides itself when <body data-bottom-nav="hidden"> is set
 * (use this on event detail to give the book-bar the bottom).
 * Adds bottom padding to <main>/<footer> so content isn't
 * obscured by the fixed bar.
 * ============================================================ */
(function () {
  'use strict';

  const CSS = `
  .vb-bottom-nav { display: none; }

  @media (max-width: 760px) {
    body[data-bottom-nav="hidden"] .vb-bottom-nav { display: none !important; }
    .vb-bottom-nav {
      display: flex;
      position: fixed; left: 0; right: 0; bottom: 0;
      z-index: 70;
      background: rgba(252, 249, 244, 0.96);
      backdrop-filter: saturate(120%) blur(14px);
      -webkit-backdrop-filter: saturate(120%) blur(14px);
      border-top: 1px solid rgba(194,200,195,0.4);
      padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
      transition: transform 320ms cubic-bezier(.4,0,.2,1), opacity 240ms ease;
    }
    .vb-bottom-nav.is-hidden {
      transform: translateY(110%); opacity: 0; pointer-events: none;
    }
    /* Reserve space so fixed bar doesn't obscure the page bottom */
    body:not([data-bottom-nav="hidden"]) {
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    }
  }

  .vb-bn-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    gap: 3px; background: transparent; border: 0;
    padding: 8px 4px; cursor: pointer;
    color: var(--text-muted, #5C5C5C);
    font: 500 11px/1 'Inter', system-ui, sans-serif;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: color .15s, transform .12s cubic-bezier(0,0,.2,1);
  }
  .vb-bn-btn[aria-current="page"] { color: var(--orange-700, #A36B24); }
  .vb-bn-btn:active { transform: scale(.97); }
  .vb-bn-btn .material-symbols-outlined {
    font-size: 24px;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .vb-bn-btn[aria-current="page"] .material-symbols-outlined {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }

  /* ─── Fullscreen account sheet ─── */
  .vb-account-menu {
    position: fixed; inset: 0; z-index: 210;
    background: var(--bg-2, #F6F3EE);
    display: none; flex-direction: column;
  }
  .vb-account-menu.open { display: flex; }
  .vb-acc-head {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--line, #CDD1BE);
  }
  .vb-acc-close {
    width: 40px; height: 40px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: none; cursor: pointer;
    color: var(--text);
  }
  .vb-acc-close:active { background: rgba(0,0,0,.05); }
  .vb-acc-title {
    margin: 0; font: 500 16px/1.2 'Inter', system-ui, sans-serif;
    color: var(--text);
  }
  .vb-acc-body {
    flex: 1; overflow-y: auto;
    padding: 16px;
    display: flex; flex-direction: column; gap: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .vb-acc-profile {
    display: flex; align-items: center; gap: 14px;
    padding: 18px;
    border-radius: 14px;
    background: var(--bg, #FCF9F4);
    border: 1px solid var(--line, #CDD1BE);
    margin-bottom: 4px;
  }
  .vb-acc-profile .vb-acc-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--olive-500, #41452F); color: #fff;
    display: inline-flex; align-items: center; justify-content: center;
    font: 600 16px/1 'Inter', sans-serif;
  }
  .vb-acc-profile .vb-acc-meta { flex: 1; }
  .vb-acc-profile .vb-acc-name { font: 600 15px/1.3 'Inter', sans-serif; color: var(--text); }
  .vb-acc-profile .vb-acc-email { font: 400 13px/1.3 'Inter', sans-serif; color: var(--text-muted); margin-top: 2px; }

  .vb-acc-cta {
    display: flex; flex-direction: column; gap: 10px;
    padding: 18px;
    border-radius: 14px;
    background: var(--olive-500, #41452F); color: #fff;
    margin-bottom: 4px;
  }
  .vb-acc-cta-title { font: 600 16px/1.3 'Inter', sans-serif; margin-bottom: 4px; }
  .vb-acc-cta-btn {
    display: block; width: 100%;
    padding: 14px 20px; border-radius: var(--radius-pill, 999px);
    text-align: center; font: 600 15px/1 'Inter', sans-serif;
    text-decoration: none;
    background: var(--orange-500, #D69543); color: #fff;
  }
  .vb-acc-cta-btn:active { opacity: .88; }

  .vb-acc-item {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px;
    border-radius: 14px;
    background: var(--bg, #FCF9F4);
    border: 1px solid var(--line, #CDD1BE);
    color: var(--text); text-decoration: none;
    font: 500 15px/1.2 'Inter', system-ui, sans-serif;
    cursor: pointer; text-align: left; width: 100%;
    transition: background .15s;
  }
  .vb-acc-item:active { background: #FBF8F0; }
  .vb-acc-item .material-symbols-outlined { font-size: 22px; color: var(--text-muted); }
  .vb-acc-item .chev { margin-left: auto; color: var(--text-subtle); }
  .vb-acc-section-title {
    font: 600 11px/1 'Inter', sans-serif;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-subtle); margin: 14px 4px 4px;
  }
  `;

  function injectCSS() {
    if (document.getElementById('viluma-bottom-nav-css')) return;
    const tag = document.createElement('style');
    tag.id = 'viluma-bottom-nav-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  // ----------------------------------------------------------
  // Templates
  // ----------------------------------------------------------
  function bottomNavHTML(active) {
    const items = [
      { key: 'home',   label: 'Home',   icon: 'home',           href: 'index.html' },
      { key: 'search', label: 'Search', icon: 'search',         href: 'search-results.html' },
      { key: 'saved',  label: 'Saved',  icon: 'favorite',       href: '#' },
      { key: 'you',    label: 'You',    icon: 'person',         href: '#', sheet: true },
    ];
    return `
      <nav class="vb-bottom-nav" aria-label="Primary mobile">
        ${items.map(i => `
          <${i.sheet ? 'button type="button"' : `a href="${i.href}"`} class="vb-bn-btn"${i.key === active ? ' aria-current="page"' : ''} ${i.sheet ? 'data-vb-open-acc' : ''} aria-label="${i.label}">
            <span class="material-symbols-outlined">${i.icon}</span>
            ${i.label}
          </${i.sheet ? 'button' : 'a'}>
        `).join('')}
      </nav>`;
  }

  function accountSheetHTML(auth, user) {
    const initials = (user.initials || 'YF').slice(0, 2).toUpperCase();
    const profile = auth === 'in' ? `
      <div class="vb-acc-profile">
        <div class="vb-acc-avatar">${initials}</div>
        <div class="vb-acc-meta">
          <div class="vb-acc-name">${user.name || 'Florian Frey'}</div>
          <div class="vb-acc-email">${user.email || 'florian@viluma.co'}</div>
        </div>
      </div>` : `
      <div class="vb-acc-cta">
        <div class="vb-acc-cta-title">Save events. Book in seconds.</div>
        <a href="auth.html" class="vb-acc-cta-btn">Log in</a>
      </div>`;

    const loggedInItems = `
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">favorite</span>
        Saved events
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">confirmation_number</span>
        My bookings
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <a href="host.html" class="vb-acc-item">
        <span class="material-symbols-outlined">home_work</span>
        Host an event
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <div class="vb-acc-section-title">Settings</div>
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">settings</span>
        Preferences
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">help</span>
        Help &amp; contact
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">logout</span>
        Log out
      </a>`;

    const loggedOutItems = `
      <a href="host.html" class="vb-acc-item">
        <span class="material-symbols-outlined">home_work</span>
        Host an event
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>
      <a href="#" class="vb-acc-item">
        <span class="material-symbols-outlined">help</span>
        Help &amp; contact
        <span class="material-symbols-outlined chev">chevron_right</span>
      </a>`;

    return `
      <div class="vb-account-menu" id="vbAccountMenu" role="dialog" aria-modal="true" aria-label="Account menu">
        <div class="vb-acc-head">
          <button class="vb-acc-close" id="vbAccountClose" aria-label="Close menu">
            <span class="material-symbols-outlined">close</span>
          </button>
          <h2 class="vb-acc-title">Account</h2>
        </div>
        <div class="vb-acc-body">
          ${profile}
          ${auth === 'in' ? loggedInItems : loggedOutItems}
        </div>
      </div>`;
  }

  // ----------------------------------------------------------
  // Wiring
  // ----------------------------------------------------------
  function wire(navEl, sheetEl) {
    const openBtn  = navEl.querySelector('[data-vb-open-acc]');
    const closeBtn = sheetEl.querySelector('#vbAccountClose');

    function open() {
      sheetEl.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      sheetEl.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function mountAll() {
    injectCSS();
    document.querySelectorAll('[data-component="bottom-nav"]').forEach(slot => {
      const active = slot.dataset.active || '';
      const auth   = slot.dataset.auth   || 'out';
      const user = {
        name:     slot.dataset.userName,
        email:    slot.dataset.userEmail,
        initials: slot.dataset.userInitials,
      };

      const wrap = document.createElement('div');
      wrap.innerHTML = bottomNavHTML(active).trim();
      const navEl = wrap.firstElementChild;

      const sheetWrap = document.createElement('div');
      sheetWrap.innerHTML = accountSheetHTML(auth, user).trim();
      const sheetEl = sheetWrap.firstElementChild;

      slot.replaceWith(navEl);
      document.body.appendChild(sheetEl);
      wire(navEl, sheetEl);
    });
  }

  window.VilumaBottomNav = { mountAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
