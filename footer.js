/* ============================================================
 * Viluma — Shared site footer
 *
 *   <div data-component="footer"></div>
 *   <script src="footer.js" defer></script>
 * ============================================================ */
(function () {
  'use strict';

  const CSS = `
  footer.site {
    width: 100%;
    padding: 64px 32px;
    background: #f0ede8;
    border-top: 1px solid rgba(194,200,195,0.1);
  }
  footer.site .footer-inner {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 48px;
    max-width: 1280px;
    margin: 0 auto;
  }
  footer.site .footer-brand-col { display: flex; flex-direction: column; gap: 24px; }
  footer.site .footer-brand-name {
    font-family: 'Noto Serif', serif;
    font-size: 22px; font-style: italic; font-weight: 400;
    color: #182c24; margin: 0;
  }
  footer.site .footer-brand-tagline {
    font-family: 'Manrope', sans-serif;
    font-size: 14px; letter-spacing: 0.025em;
    color: rgba(24,44,36,.7); line-height: 1.625; margin: 0;
    max-width: 320px;
  }
  footer.site .footer-link-col { display: flex; flex-direction: column; gap: 16px; }
  footer.site .footer-col-heading {
    font-family: 'Manrope', sans-serif;
    font-weight: 700; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: rgba(24,44,36,.4); margin: 0;
  }
  footer.site .footer-link-col ul {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 12px;
  }
  footer.site .footer-link-col a {
    font-family: 'Manrope', sans-serif;
    font-size: 14px; letter-spacing: 0.025em;
    color: rgba(24,44,36,.7); transition: color .2s ease;
  }
  footer.site .footer-link-col a:hover { color: #182c24; }
  footer.site .footer-connect-icons { display: flex; gap: 12px; }
  footer.site .footer-icon-btn {
    width: 40px; height: 40px; border-radius: 50%;
    border: 1px solid rgba(194,200,195,.3);
    display: flex; align-items: center; justify-content: center;
    color: rgba(24,44,36,.7); transition: background .2s ease;
  }
  footer.site .footer-icon-btn:hover { background: rgba(24,44,36,.05); }
  footer.site .footer-icon-btn .material-symbols-outlined { font-size: 18px; }
  footer.site .footer-bottom {
    max-width: 1280px; margin: 64px auto 0;
    padding-top: 32px;
    border-top: 1px solid rgba(194,200,195,.2);
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
  }
  footer.site .footer-copyright {
    font-family: 'Manrope', sans-serif;
    font-size: 12px; letter-spacing: 0.025em;
    color: rgba(24,44,36,.5); margin: 0;
  }
  footer.site .footer-legal-links { display: flex; gap: 32px; }
  footer.site .footer-legal-links a {
    font-family: 'Manrope', sans-serif;
    font-size: 12px; letter-spacing: 0.025em;
    color: rgba(24,44,36,.5); transition: color .2s ease;
  }
  footer.site .footer-legal-links a:hover { color: #182c24; }

  @media (max-width: 768px) {
    footer.site { padding: 48px 24px 96px; }  /* extra bottom padding for mobile bottom-nav */
    footer.site .footer-inner { grid-template-columns: 1fr; gap: 32px; }
    footer.site .footer-bottom {
      flex-direction: column; align-items: flex-start;
      margin-top: 40px;
    }
  }
  `;

  const HTML = `
    <footer class="site">
      <div class="footer-inner">
        <div class="footer-brand-col">
          <h2 class="footer-brand-name">Viluma</h2>
          <p class="footer-brand-tagline">Elevating the human experience through intentional spaces and curated presence.</p>
          <div class="footer-connect-icons">
            <a href="#" class="footer-icon-btn" aria-label="Instagram"><span class="material-symbols-outlined">photo_camera</span></a>
            <a href="#" class="footer-icon-btn" aria-label="Email"><span class="material-symbols-outlined">mail</span></a>
            <a href="#" class="footer-icon-btn" aria-label="Website"><span class="material-symbols-outlined">public</span></a>
          </div>
        </div>
        <div class="footer-link-col">
          <h4 class="footer-col-heading">Explore</h4>
          <ul>
            <li><a href="events.html">Events</a></li>
            <li><a href="retreats.html">Retreats</a></li>
            <li><a href="trainings.html">Trainings</a></li>
            <li><a href="events-hub.html">Berlin</a></li>
          </ul>
        </div>
        <div class="footer-link-col">
          <h4 class="footer-col-heading">Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Journal</a></li>
            <li><a href="for-hosts.html">For hosts</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div class="footer-link-col">
          <h4 class="footer-col-heading">Account</h4>
          <ul>
            <li><a href="auth.html">Log in</a></li>
            <li><a href="auth.html?mode=signup">Sign up</a></li>
            <li><a href="#">Saved events</a></li>
            <li><a href="#">My bookings</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">© 2026 Viluma. All rights reserved.</p>
        <div class="footer-legal-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>`;

  function injectCSS() {
    if (document.getElementById('viluma-footer-css')) return;
    const tag = document.createElement('style');
    tag.id = 'viluma-footer-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  function mountAll() {
    injectCSS();
    document.querySelectorAll('[data-component="footer"]').forEach(slot => {
      const wrap = document.createElement('div');
      wrap.innerHTML = HTML.trim();
      slot.replaceWith(wrap.firstElementChild);
    });
  }

  window.VilumaFooter = { mountAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
