/* ============================================================
 * Viluma — Shared scroll animations
 * Self-initializing. Just include on any page:
 *
 *   <script src="scroll-animations.js" defer></script>
 *
 * Features:
 *   1. Search-bar / tab-bar collapse (--shrink CSS var 0..1)
 *      Targets: .m-search (landing) or .m-tab-bar (hub pages)
 *   2. Bottom-nav direction-aware auto-hide
 *      Targets: .vb-bottom-nav
 * ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
   * 1. Sticky bar shrink (Airbnb-style icon collapse on scroll)
   *    Drives --shrink from 0→1 over RANGE px of scrollY.
   * ========================================================== */
  function wireShrinkAnimation() {
    // Prefer .m-search (landing page) but fall back to .m-tab-bar (hub pages)
    const target = document.querySelector('.m-search') || document.querySelector('.m-tab-bar');
    if (!target || target._shrinkWired) return;
    target._shrinkWired = true;

    const RANGE = 110; // px of scroll over which we collapse
    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      const s = Math.max(0, Math.min(1, y / RANGE));
      target.style.setProperty('--shrink', s.toFixed(3));
    };

    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    }, { passive: true });

    apply();
  }

  /* ==========================================================
   * 2. Bottom-nav direction-aware auto-hide
   *    Hide when scrolled past 1.5 viewports (going down).
   *    Reappear after 0.5 viewport of accumulated upward scroll.
   * ========================================================== */
  function wireBottomNavAutoHide() {
    const nav = document.querySelector('.vb-bottom-nav');
    if (!nav || nav._autoHideWired) return;
    nav._autoHideWired = true;

    let lastY = window.scrollY || 0;
    let upAccum = 0;
    let hidden = false;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      const dy = y - lastY;

      if (dy > 0) {
        upAccum = 0;
        if (!hidden && y > vh * 1.5) {
          hidden = true;
          nav.classList.add('is-hidden');
        }
      } else if (dy < 0) {
        upAccum += -dy;
        if (hidden && upAccum > vh * 0.5) {
          hidden = false;
          nav.classList.remove('is-hidden');
        }
      }

      if (y < vh * 1.5 && hidden) {
        hidden = false;
        nav.classList.remove('is-hidden');
      }

      lastY = y;
    };

    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ==========================================================
   * Boot — wait for DOM + other components to mount.
   * Other partials (mobile-tabs.js, bottom-nav.js) may mount
   * asynchronously, so we retry after a tick to ensure targets exist.
   * ========================================================== */
  function init() {
    // Try immediately (covers .m-search on landing page)
    wireShrinkAnimation();
    wireBottomNavAutoHide();

    // Retry after a tick for async-mounted components (.m-tab-bar, .vb-bottom-nav)
    setTimeout(() => {
      wireShrinkAnimation();
      wireBottomNavAutoHide();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Already loaded (script has defer) — run after current microtask queue
    setTimeout(init, 0);
  }
})();
