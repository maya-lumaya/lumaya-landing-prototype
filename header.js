/* ============================================================
 * Viluma — Shared site header (desktop + mobile)
 * Self-mounting partial. Drop this into a page:
 *
 *   <div data-component="header"
 *        data-mode="hero|search"
 *        data-active="events|retreats|trainings|"
 *        data-context="landing|search"
 *        data-auth="in|out"></div>
 *   <script src="header.js" defer></script>
 *
 * Modes:
 *   hero   — shows the three hub nav-links (Events / Retreats / Trainings).
 *            Used on landing and on search-results pages where the centre
 *            should be navigational, not a collapsed search pill.
 *   search — shows the Airbnb-style collapsed search pill in the centre.
 *            Used on detail / hub / host pages.
 *
 * Context (only meaningful when mode = hero):
 *   landing (default) — nav links go to hub pages (events.html etc.).
 *   search            — nav links go to the corresponding *-search-results.html.
 *                       Lets the header act as a pillar switcher inside search.
 *
 * Auth:
 *   out (default) — "Log in"  +  "Sign up" buttons in nav-actions.
 *   in            — Avatar with initials → opens account dropdown.
 * ============================================================ */
(function () {
  'use strict';

  // --------------------------------------------------------
  // CSS — injected once
  // --------------------------------------------------------
  const CSS = `
  header.site {
    position: sticky; top: 0; z-index: 60;
    background: rgba(252, 249, 244, 0.92);
    backdrop-filter: saturate(120%) blur(14px);
    -webkit-backdrop-filter: saturate(120%) blur(14px);
    border-bottom: 1px solid rgba(194,200,195,0.22);
  }
  header.site .container.nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: 16px;
    height: 72px;
  }
  header.site .logo {
    font-family: 'Noto Serif', serif;
    font-style: italic; font-weight: 400;
    font-size: 24px; letter-spacing: -0.025em;
    color: #182c24; flex-shrink: 0;
  }

  /* Centre region — either nav-links OR search-pill */
  header.site .nav-links {
    flex: 1; display: flex; gap: 32px; justify-content: center; align-items: center;
  }
  header.site .nav-links a {
    font-size: 15px; color: var(--text); padding: 10px 4px;
    position: relative; transition: color .2s var(--ease);
  }
  header.site .nav-links a::after {
    content: ""; position: absolute; left: 4px; right: 4px; bottom: 4px;
    height: 1px; background: var(--orange-600);
    transform: scaleX(0); transform-origin: left;
    transition: transform .25s var(--ease);
  }
  header.site .nav-links a:hover,
  header.site .nav-links a.is-active { color: var(--orange-600); }
  header.site .nav-links a:hover::after,
  header.site .nav-links a.is-active::after { transform: scaleX(1); }

  header.site .header-search {
    flex: 1; max-width: 460px; margin: 0 auto;
    display: flex; align-items: center; gap: 0;
    background: var(--surface);
    border: 1px solid rgba(194,200,195,0.4);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-sm);
    height: 44px; padding: 0 6px 0 0;
    transition: box-shadow .2s, border-color .2s;
    cursor: pointer;
  }
  header.site .header-search:hover {
    box-shadow: 0 4px 16px rgba(28,28,25,0.08);
    border-color: rgba(194,200,195,0.65);
  }
  header.site .header-search .hs-segment {
    padding: 0 16px; font-size: 13px; font-weight: 500;
    color: var(--text); white-space: nowrap;
  }
  header.site .header-search .hs-segment + .hs-segment {
    border-left: 1px solid rgba(194,200,195,0.35);
  }
  header.site .header-search .hs-segment.muted {
    color: var(--text-muted); font-weight: 400;
  }
  header.site .header-search .hs-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--orange-500); color: #fff;
    display: flex; align-items: center; justify-content: center;
    margin-left: auto; flex-shrink: 0;
    transition: opacity .15s;
  }
  header.site .header-search .hs-btn:hover { opacity: .88; }
  header.site .header-search .hs-btn .material-symbols-outlined { font-size: 16px; }

  /* Right side */
  header.site .nav-actions {
    display: flex; gap: 8px; align-items: center;
    justify-self: end; align-self: center;
  }
  header.site .btn-ghost {
    height: 40px; padding: 0 14px; border-radius: var(--radius-pill);
    font-size: 14px; font-weight: 500; color: var(--text);
    transition: background .2s var(--ease); white-space: nowrap;
    background: transparent; border: none; cursor: pointer;
    display: inline-flex; align-items: center;
  }
  header.site .btn-ghost:hover { background: var(--bg-2); }
  header.site .btn-primary {
    height: 40px; padding: 0 16px; border-radius: var(--radius-pill);
    font-size: 14px; font-weight: 600;
    background: var(--text); color: #fff;
    border: none; cursor: pointer; white-space: nowrap;
    transition: opacity .15s;
    display: inline-flex; align-items: center;
  }
  header.site .btn-primary:hover { opacity: .88; }

  header.site .icon-btn {
    width: 40px; height: 40px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--text-muted); background: transparent; border: none;
    cursor: pointer; flex-shrink: 0;
    transition: background .15s, color .15s;
  }
  header.site .icon-btn:hover { background: var(--bg-3); color: var(--orange-600); }
  header.site .icon-btn .material-symbols-outlined { font-size: 20px; }

  header.site .user-menu-wrap { position: relative; }
  header.site .avatar-btn {
    width: 40px; height: 40px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--olive-500); color: #fff;
    font: 600 13px/1 'Inter', sans-serif;
    border: none; cursor: pointer; flex-shrink: 0;
    transition: box-shadow .15s, transform .15s;
  }
  header.site .avatar-btn:hover { box-shadow: 0 4px 14px rgba(0,0,0,.14); }
  header.site .user-dropdown {
    display: none;
    position: absolute; top: calc(100% + 8px); right: 0;
    min-width: 220px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 14px;
    box-shadow: 0 8px 28px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
    z-index: 300; padding: 6px 0; overflow: hidden;
  }
  header.site .user-dropdown.open { display: block; }
  header.site .user-dd-head {
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--border); margin-bottom: 4px;
  }
  header.site .user-dd-head .name { font: 600 14px/1.3 'Inter', sans-serif; color: var(--text); }
  header.site .user-dd-head .email { font: 400 12px/1.3 'Inter', sans-serif; color: var(--text-muted); margin-top: 2px; }
  header.site .user-dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    font: 500 14px/1 'Inter', system-ui, sans-serif; color: var(--text);
    text-decoration: none; background: none; border: none;
    width: 100%; text-align: left; cursor: pointer;
    transition: background .12s;
  }
  header.site .user-dd-item:hover { background: var(--bg-2); }
  header.site .user-dd-item .material-symbols-outlined { font-size: 18px; color: var(--text-muted); }
  header.site .user-dd-sep { height: 1px; background: var(--border); margin: 4px 0; }

  /* ── Mobile (≤760) ───────────────────────────────────── */
  @media (max-width: 760px) {
    header.site {
      /* Fully transparent on mobile — the .m-tab-bar behind it provides
         the unified gradient + backdrop-filter (like .m-search on landing page) */
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-bottom: none;
    }
    header.site .container.nav {
      display: flex; align-items: center; height: 60px; gap: 8px;
    }
    header.site .nav-actions { justify-self: unset; margin-left: auto; }
    header.site .nav-links { display: none; }
    header.site .header-search .hs-segment:nth-child(2),
    header.site .header-search .hs-segment:nth-child(3) { display: none; }
    header.site .header-search { flex: 1; max-width: none; }
    header.site .btn-ghost.for-hosts { display: none; }
    header.site .btn-primary.signup-btn { font-size: 13px; height: 36px; padding: 0 12px; }
  }
  `;

  function injectCSS() {
    if (document.getElementById('viluma-header-css')) return;
    const tag = document.createElement('style');
    tag.id = 'viluma-header-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  // --------------------------------------------------------
  // Templates
  // --------------------------------------------------------
  const NAV_HREFS = {
    landing: {
      events:    'events.html',
      retreats:  'retreats.html',
      trainings: 'trainings.html',
    },
    search: {
      events:    'events-search-results.html',
      retreats:  'retreats-search-results.html',
      trainings: 'trainings-search-results.html',
    },
  };

  function navLinks(active, context) {
    const hrefs = NAV_HREFS[context] || NAV_HREFS.landing;
    const items = [
      { key: 'events',    label: 'Events',    href: hrefs.events },
      { key: 'retreats',  label: 'Retreats',  href: hrefs.retreats },
      { key: 'trainings', label: 'Trainings', href: hrefs.trainings },
    ];
    return `
      <nav class="nav-links" aria-label="Primary">
        ${items.map(i => `<a href="${i.href}"${i.key === active ? ' class="is-active"' : ''}>${i.label}</a>`).join('')}
      </nav>`;
  }

  function searchPill() {
    return `
      <a class="header-search" href="index.html" aria-label="Open search">
        <span class="hs-segment">Anywhere</span>
        <span class="hs-segment muted">Any week</span>
        <span class="hs-segment muted">Add practice</span>
        <span class="hs-btn" aria-hidden="true">
          <span class="material-symbols-outlined">search</span>
        </span>
      </a>`;
  }

  function actionsLoggedOut() {
    return `
      <a href="for-hosts.html" class="btn-ghost for-hosts">For hosts ↗</a>
      <a href="auth.html" class="btn-primary signup-btn">Log in</a>
    `;
  }

  function actionsLoggedIn(user) {
    const initials = (user.initials || 'YF').slice(0, 2).toUpperCase();
    return `
      <a href="for-hosts.html" class="btn-ghost for-hosts">For hosts ↗</a>
      <button class="icon-btn" aria-label="Saved">
        <span class="material-symbols-outlined">favorite</span>
      </button>
      <div class="user-menu-wrap">
        <button class="avatar-btn" id="userMenuBtn" aria-label="Account" aria-expanded="false">${initials}</button>
        <div class="user-dropdown" id="userDropdown" role="menu">
          <div class="user-dd-head">
            <div class="name">${user.name || 'Florian Frey'}</div>
            <div class="email">${user.email || 'florian@viluma.co'}</div>
          </div>
          <a href="#" class="user-dd-item" role="menuitem">
            <span class="material-symbols-outlined">favorite</span> Saved events
          </a>
          <a href="#" class="user-dd-item" role="menuitem">
            <span class="material-symbols-outlined">confirmation_number</span> My bookings
          </a>
          <a href="for-hosts.html" class="user-dd-item" role="menuitem">
            <span class="material-symbols-outlined">home_work</span> Host an event
          </a>
          <div class="user-dd-sep"></div>
          <a href="#" class="user-dd-item" role="menuitem">
            <span class="material-symbols-outlined">settings</span> Settings
          </a>
          <a href="#" class="user-dd-item" role="menuitem">
            <span class="material-symbols-outlined">logout</span> Log out
          </a>
        </div>
      </div>
    `;
  }

  function template(opts) {
    const mode    = opts.mode    || 'search';   // 'hero' | 'search'
    const active  = opts.active  || '';
    const auth    = opts.auth    || 'out';      // 'in' | 'out'
    const user    = opts.user    || {};
    const context = opts.context || 'landing';  // 'landing' | 'search'

    const centre = mode === 'hero' ? navLinks(active, context) : searchPill();
    const actions = auth === 'in' ? actionsLoggedIn(user) : actionsLoggedOut();

    return `
      <header class="site">
        <div class="container nav">
          <a href="index.html" class="logo" aria-label="Viluma home">Viluma</a>
          ${centre}
          <div class="nav-actions">${actions}</div>
        </div>
      </header>`;
  }

  // --------------------------------------------------------
  // Wiring
  // --------------------------------------------------------
  function wire(headerEl) {
    const btn = headerEl.querySelector('#userMenuBtn');
    const dd  = headerEl.querySelector('#userDropdown');
    if (!btn || !dd) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!headerEl.contains(e.target)) {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --------------------------------------------------------
  // Public API
  // --------------------------------------------------------
  function mount(slot) {
    const opts = {
      mode:    slot.dataset.mode,
      active:  slot.dataset.active,
      auth:    slot.dataset.auth,
      context: slot.dataset.context,
      user: {
        name:     slot.dataset.userName,
        email:    slot.dataset.userEmail,
        initials: slot.dataset.userInitials,
      },
    };
    const wrap = document.createElement('div');
    wrap.innerHTML = template(opts).trim();
    const headerEl = wrap.firstElementChild;
    slot.replaceWith(headerEl);
    wire(headerEl);
    return headerEl;
  }

  function mountAll() {
    injectCSS();
    document.querySelectorAll('[data-component="header"]').forEach(mount);
  }

  window.VilumaHeader = { mount, mountAll, template };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
