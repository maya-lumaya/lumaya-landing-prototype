/**
 * auth-overlay.js — shared auth bottom-sheet for Viluma prototype.
 *
 * Injects one overlay into the page, intercepts all auth.html links,
 * and exposes window.openAuthOverlay(opts) for custom triggers.
 *
 * opts: {
 *   eyebrow    — small-caps label above the title (e.g. "Event details")
 *   ctxTitle   — large italic serif text in the blurred backdrop
 *   ctxSub     — small line below ctxTitle
 *   heading    — sheet heading  (default: "Welcome to Viluma")
 *   subheading — sheet sub-line (default: "Sign in or create a free account.")
 * }
 */
(function () {
  'use strict';

  /* ── CSS ──────────────────────────────────────────────────── */
  const CSS = `
.ao {
  position: fixed; inset: 0; z-index: 400;
  display: flex; flex-direction: column;
  animation: aoFadeIn .18s ease;
}
.ao[hidden] { display: none; }
@keyframes aoFadeIn { from { opacity: 0; } to { opacity: 1; } }

.ao-bg {
  position: absolute; inset: 0;
  background: rgba(28,28,25,.56);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.ao-close {
  position: absolute; top: 18px; right: 18px; z-index: 2;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,.15); color: #fff;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font: 400 20px/1 system-ui, sans-serif;
  transition: background .15s;
}
.ao-close:hover { background: rgba(255,255,255,.26); }

.ao-context {
  position: relative; z-index: 1;
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 72px 36px 20px;
  gap: 8px; pointer-events: none;
}
.ao-ctx-eyebrow {
  font: 600 10px/1 'Inter', system-ui, sans-serif;
  letter-spacing: .12em; text-transform: uppercase;
  color: rgba(255,255,255,.6); margin: 0;
}
.ao-ctx-title {
  font-family: 'Lora', Georgia, serif;
  font-style: italic; font-size: 22px; font-weight: 400;
  color: #fff; line-height: 1.3; margin: 0;
}
.ao-ctx-sub {
  font: 400 13px/1.4 'Inter', system-ui, sans-serif;
  color: rgba(255,255,255,.7); margin: 0;
}

.ao-sheet {
  position: relative; z-index: 1;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 28px rgba(0,0,0,.18);
  width: 100%; max-height: 85svh;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  animation: aoSlideUp .26s cubic-bezier(.2,.7,.2,1);
}
@keyframes aoSlideUp {
  from { transform: translateY(44px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.ao-grabber {
  width: 36px; height: 4px; border-radius: 2px;
  background: #C2C8C3; margin: 12px auto 0;
}
.ao-body { padding: 20px 24px 44px; box-sizing: border-box; }
.ao-head { margin-bottom: 22px; }
.ao-head h2 {
  font-family: 'Lora', Georgia, serif;
  font-style: normal; font-size: 20px; font-weight: 500;
  line-height: 1.25; margin: 0 0 6px; color: #1C1C19;
}
.ao-head p { font-size: 13px; color: #5C5C5C; line-height: 1.5; margin: 0; }

.ao-social {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 11px 14px;
  background: #fff; border: 1.5px solid #C2C8C3;
  border-radius: 10px; cursor: pointer;
  font: 500 13.5px/1 'Inter', system-ui, sans-serif; color: #1C1C19;
  margin-bottom: 8px; box-sizing: border-box;
  transition: border-color .15s;
}
.ao-social:hover { border-color: #182C24; }
.ao-social-icon { width: 18px; height: 18px; flex-shrink: 0; }

.ao-divider {
  display: flex; align-items: center; gap: 10px; margin: 16px 0;
  font: 400 11px/1 'Inter', system-ui, sans-serif; color: #8A8A8A;
}
.ao-divider::before, .ao-divider::after {
  content: ''; flex: 1; height: 1px; background: #C2C8C3;
}

.ao-email {
  display: block; width: 100%; padding: 11px 13px;
  border: 1.5px solid #C2C8C3; border-radius: 10px;
  font: 400 14px/1 'Inter', system-ui, sans-serif; color: #1C1C19;
  background: #FCF9F4; outline: none; box-sizing: border-box;
  -webkit-appearance: none; transition: border-color .15s;
  margin-bottom: 10px;
}
.ao-email:focus { border-color: #182C24; background: #fff; }
.ao-email::placeholder { color: #8A8A8A; }

.ao-btn {
  display: block; width: 100%; padding: 13px;
  background: #182C24; color: #fff; box-sizing: border-box;
  border: none; border-radius: 10px; cursor: pointer;
  font: 600 14px/1 'Inter', system-ui, sans-serif;
  transition: opacity .15s;
}
.ao-btn:hover { opacity: .88; }
.ao-micro {
  font-size: 11.5px; color: #8A8A8A;
  text-align: center; line-height: 1.5; margin-top: 14px;
}

@media (min-width: 641px) {
  .ao { align-items: center; justify-content: center; gap: 16px; }
  .ao-context {
    flex: 0 0 auto; padding: 0 20px;
    max-width: 420px; width: 100%;
  }
  .ao-ctx-title { font-size: 26px; }
  .ao-sheet {
    border-radius: 20px; max-width: 420px; width: 100%; max-height: 80vh;
    animation: aoFadeInCard .22s cubic-bezier(.2,.7,.2,1);
  }
  @keyframes aoFadeInCard {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: none; opacity: 1; }
  }
  .ao-grabber { display: none; }
  .ao-body { padding: 28px 28px 36px; }
}
`;

  /* ── HTML ─────────────────────────────────────────────────── */
  const GOOGLE_SVG = `<svg class="ao-social-icon" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"/></svg>`;
  const APPLE_SVG  = `<svg class="ao-social-icon" viewBox="0 0 18 18"><path d="M15.769 6.304c-.118.087-2.19 1.257-2.19 3.85 0 3.001 2.634 4.063 2.714 4.091-.012.075-.418 1.443-1.38 2.836-.858 1.233-1.756 2.464-3.115 2.464s-1.703-.79-3.264-.79c-1.518 0-2.06.817-3.303.817-1.243 0-2.118-1.148-3.122-2.556C.994 15.4.25 13.27.25 11.248c0-3.344 2.178-5.115 4.323-5.115 1.14 0 2.09.75 2.806.75.678 0 1.737-.795 3.06-.795.493 0 2.266.042 3.428 1.216Zm-4.048-2.23c.536-.636.916-1.52.916-2.404 0-.123-.01-.248-.032-.35-.875.033-1.916.583-2.545 1.311-.49.555-.948 1.44-.948 2.336 0 .136.022.272.032.316.054.01.141.022.23.022.785 0 1.774-.523 2.347-1.231Z" fill="currentColor"/></svg>`;

  const HTML = `
<div id="authOverlay" class="ao" hidden>
  <div class="ao-bg" id="aoBg"></div>
  <button class="ao-close" id="aoClose" aria-label="Close">&#x2715;</button>
  <div class="ao-context">
    <p class="ao-ctx-eyebrow" id="aoEyebrow"></p>
    <p class="ao-ctx-title"   id="aoCtxTitle">Find your next experience</p>
    <p class="ao-ctx-sub"     id="aoCtxSub">Retreats &middot; Yoga &middot; Conscious Travel</p>
  </div>
  <div class="ao-sheet">
    <div class="ao-grabber"></div>
    <div class="ao-body">
      <div class="ao-head">
        <h2 id="aoHeading">Welcome to Viluma</h2>
        <p  id="aoSubheading">Sign in or create a free account.</p>
      </div>
      <button class="ao-social" id="aoGoogle">${GOOGLE_SVG} Continue with Google</button>
      <button class="ao-social" id="aoApple">${APPLE_SVG} Continue with Apple</button>
      <div class="ao-divider">or use email</div>
      <input class="ao-email" id="aoEmail" type="email"
             placeholder="your@email.com" autocomplete="email" autocapitalize="off">
      <button class="ao-btn" id="aoContinue">Continue &#x2192;</button>
      <p class="ao-micro">Free &middot; No spam &middot; Cancel anytime</p>
    </div>
  </div>
</div>`;

  /* ── Bootstrap ────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('beforeend', HTML);

    const overlay = document.getElementById('authOverlay');

    /* Public: open */
    window.openAuthOverlay = function (opts) {
      var o = opts || {};
      document.getElementById('aoEyebrow').textContent    = o.eyebrow     || '';
      document.getElementById('aoCtxTitle').textContent   = o.ctxTitle    || 'Find your next experience';
      document.getElementById('aoCtxSub').textContent     = o.ctxSub      || 'Retreats · Yoga · Conscious Travel';
      document.getElementById('aoHeading').textContent    = o.heading     || 'Welcome to Viluma';
      document.getElementById('aoSubheading').textContent = o.subheading  || 'Sign in or create a free account.';
      overlay.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    };

    /* Public: close */
    window.closeAuthOverlay = function () {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    };

    /* Internal close triggers */
    document.getElementById('aoClose').addEventListener('click', window.closeAuthOverlay);
    document.getElementById('aoBg').addEventListener('click', window.closeAuthOverlay);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) window.closeAuthOverlay();
    });

    /* Social / email → go to full auth page (prototype) */
    ['aoGoogle', 'aoApple', 'aoContinue'].forEach(function (id) {
      document.getElementById(id).addEventListener('click', function () {
        window.closeAuthOverlay();
        location.href = 'auth.html';
      });
    });

    /* Auto-intercept every auth.html link on the page */
    document.querySelectorAll('a[href="auth.html"], a[href^="auth.html?"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        _closeMenus();
        var isSignup = link.href.indexOf('signup') !== -1;
        window.openAuthOverlay({
          heading:    isSignup ? 'Create your account'           : 'Welcome to Viluma',
          subheading: isSignup ? 'Free · Join thousands of mindful explorers.' : 'Sign in or create a free account.'
        });
      });
    });
  });

  /* Close desktop dropdown + index.html mobile account menu */
  function _closeMenus() {
    var dd = document.querySelector('.user-dropdown.open');
    if (dd) {
      dd.classList.remove('open');
      var btn = document.getElementById('userMenuBtn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    var mMenu = document.getElementById('mAccountMenu');
    if (mMenu) mMenu.classList.remove('open');
  }
})();
