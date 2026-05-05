/* ============================================================
 * Viluma — Mobile pillar tabs (Events / Retreats / Trainings)
 * Self-mounting partial. Drop this into a page:
 *
 *   Embedded inside the landing page's sticky search wrap:
 *     <div data-component="mobile-tabs" data-active=""></div>
 *
 *   Standalone sticky bar on hub / search-results pages:
 *     <div data-component="mobile-tabs"
 *          data-active="events|retreats|trainings|"
 *          data-bar="true"></div>
 *
 *   <script src="mobile-tabs.js" defer></script>
 *
 * Tabs are anchor links to the hub landing pages. The active
 * pillar (if any) is underlined via aria-current="page".
 *
 * Scroll-shrink animation (the icon row collapsing as the user
 * scrolls) is preserved — it is driven by a parent --shrink CSS
 * custom property, so any ancestor (e.g. .m-search on the
 * landing page) may override the default of 0.
 * ============================================================ */
(function () {
  'use strict';

  const HREFS = {
    events:    'events.html',
    retreats:  'retreats.html',
    trainings: 'trainings.html',
  };

  const ICONS = {
    events:    '<svg viewBox="0 0 28 28"><rect x="4" y="6" width="20" height="18" rx="2.5"/><path d="M4 11h20M10 3v5M18 3v5"/><circle cx="14" cy="17" r="1.2" fill="currentColor"/></svg>',
    retreats:  '<svg viewBox="0 0 28 28"><circle cx="20" cy="9" r="3"/><path d="M3 21l7-9 5 6 3-3 7 8"/><path d="M3 24h22"/></svg>',
    trainings: '<svg viewBox="0 0 28 28"><path d="M14 5l11 5-11 5L3 10l11-5z"/><path d="M7 13v5s2.5 3 7 3 7-3 7-3v-5"/><path d="M23 11v7"/></svg>',
  };

  const LABELS = {
    events:    'Events',
    retreats:  'Retreats',
    trainings: 'Trainings',
  };

  const BADGES = {
    retreats:  'NEW',
    trainings: 'NEW',
  };

  const ORDER = ['events', 'retreats', 'trainings'];

  const CSS = `
  /* Hidden on desktop — primary nav lives in header.site .nav-links there */
  .m-tab-row { display: none; }
  .m-tab-bar { display: none; }

  @media (max-width: 760px) {
    .m-tab-row {
      display: flex; gap: 0;
      justify-content: space-around; align-items: stretch;
      /* Gap between pill and tab text shrinks from 14px → 0 as user scrolls.
       * Default is 0; .m-search sets --shrink dynamically on the landing page. */
      margin-top: calc(14px - 14px * var(--shrink, 0));
      padding: 0;
    }
    .m-tab-btn {
      flex: 1 1 0; max-width: none;
      background: transparent; border: 0;
      padding: calc(10px - 4px * var(--shrink, 0)) 6px calc(10px - 2px * var(--shrink, 0));
      display: flex; flex-direction: column; align-items: center;
      gap: calc(6px - 6px * var(--shrink, 0));
      color: var(--muted, #5C5C5C);
      cursor: pointer; position: relative;
      border-bottom: 2px solid transparent;
      font: 500 13px/1.2 "Inter", system-ui, sans-serif;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      transition: color .2s var(--ease, cubic-bezier(.2,.7,.2,1)),
                  transform .12s cubic-bezier(0,0,.2,1);
    }
    .m-tab-btn:active { transform: scale(.97); }
    .m-tab-btn .m-tab-icon {
      width: 32px;
      height: calc(32px - 32px * var(--shrink, 0));
      display: grid; place-items: center;
      color: var(--text, #1C1C19);
      opacity: clamp(0, calc(1.1 - var(--shrink, 0) * 1.3), 1);
    }
    .m-tab-btn .m-tab-icon svg {
      width: calc(28px - 28px * var(--shrink, 0));
      height: calc(28px - 28px * var(--shrink, 0));
      stroke: currentColor; fill: none; stroke-width: 1.4;
      stroke-linecap: round; stroke-linejoin: round;
    }
    .m-tab-btn .m-tab-badge {
      position: absolute; top: 4px; right: 2px;
      background: #2D5BFF; color: #fff;
      font: 700 9px/1 "Inter", system-ui, sans-serif;
      letter-spacing: 0.06em;
      padding: 3px 5px 3px;
      border-radius: 6px;
      opacity: clamp(0, calc(1 - var(--shrink, 0) * 1.6), 1);
      pointer-events: none;
    }
    .m-tab-btn[aria-current="page"] {
      color: var(--text, #1C1C19);
      border-bottom-color: var(--text, #1C1C19);
    }

    /* Selection flash hook (used elsewhere by Haptics) */
    .m-tab-btn.is-tap-flash .m-tab-icon { animation: hapticSettle .2s cubic-bezier(0,0,.2,1); }

    /* Standalone sticky bar — used on hub / search-results pages */
    .m-tab-bar {
      display: block;
      position: sticky; top: 60px; z-index: 55;
      /* Continue the header gradient: header ends at 0.80, tab-bar fades to fully transparent.
         This creates one seamless gradient zone matching the landing page aesthetic. */
      background: linear-gradient(to bottom,
        rgba(249, 246, 239, 0.80) 0%,
        rgba(249, 246, 239, 0.0) 100%);
      backdrop-filter: saturate(120%) blur(14px);
      -webkit-backdrop-filter: saturate(120%) blur(14px);
    }
    .m-tab-bar::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: 0;
      height: 1px; background: var(--border, rgba(194,200,195,0.22));
      opacity: var(--shrink, 0);
      pointer-events: none;
    }
    .m-tab-bar .m-tab-row { margin-top: 0; }

    /* Pull hero up so its image extends behind the transparent header + tab-bar zone.
       Increased from -40px to -80px to bleed behind the header gradient too. */
    .m-tab-bar + .hero,
    .m-tab-bar + section.hero {
      margin-top: -80px;
      padding-top: calc(80px + 44px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .m-tab-btn { transition: none !important; }
    .m-tab-btn.is-tap-flash .m-tab-icon { animation: none !important; }
  }
  `;

  function injectCSS() {
    if (document.getElementById('viluma-mobile-tabs-css')) return;
    const tag = document.createElement('style');
    tag.id = 'viluma-mobile-tabs-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  function tabHTML(key, isActive) {
    const badge = BADGES[key]
      ? `<span class="m-tab-badge">${BADGES[key]}</span>`
      : '';
    return `
      <a href="${HREFS[key]}" class="m-tab-btn" data-mtab="${key}"${isActive ? ' aria-current="page"' : ''}>
        <span class="m-tab-icon">${ICONS[key]}</span>
        <span>${LABELS[key]}</span>
        ${badge}
      </a>`;
  }

  function navHTML(active) {
    return `
      <nav class="m-tab-row" aria-label="Categories">
        ${ORDER.map(key => tabHTML(key, key === active)).join('')}
      </nav>`;
  }

  function mount(slot) {
    const active = slot.dataset.active || '';
    const asBar  = slot.dataset.bar === 'true';

    const wrap = document.createElement('div');
    if (asBar) {
      wrap.innerHTML = `
        <div class="m-tab-bar">
          <div class="container">
            ${navHTML(active)}
          </div>
        </div>`.trim();
    } else {
      wrap.innerHTML = navHTML(active).trim();
    }
    slot.replaceWith(wrap.firstElementChild);
  }

  function mountAll() {
    injectCSS();
    document.querySelectorAll('[data-component="mobile-tabs"]').forEach(mount);
  }

  window.VilumaMobileTabs = { mountAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
