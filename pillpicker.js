/* ============================================================
 * PillPicker — shared dropdown popover for filter pills
 *
 * Use (flat):
 *   PillPicker.open(triggerEl, items, currentValue, onSelect);
 *   items: [{ value: 'bali', label: 'Bali', count: 12 }, ...]
 *
 * Use (tree — pillars + sub-categories):
 *   Items may have a `children` array. Parents are clickable (select
 *   the pillar slug); children are indented and clickable (select the
 *   child's value, e.g. "yoga/vinyasa-yoga"). A `sensitive: true`
 *   flag adds a small "review" badge.
 *
 *   items: [
 *     { value: '', label: 'Any practice' },
 *     { value: 'yoga', label: 'Yoga', count: 1116, children: [
 *       { value: 'yoga/vinyasa-yoga', label: 'Vinyasa Yoga', count: 19 }
 *     ]},
 *     ...
 *   ]
 *
 *   onSelect: (newValue) => { ... }
 *
 * Closes on outside click, Escape, scroll, resize. Repositions if the
 * popover would render off-screen. Toggles closed if open() is called
 * with the same trigger.
 * ============================================================ */
(function () {
  'use strict';

  let activePopover = null;
  let activeTrigger = null;

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function close() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger = null;
    }
  }

  function open(triggerEl, items, currentValue, onSelect) {
    if (activeTrigger === triggerEl) { close(); return; }
    close();

    const pop = document.createElement('div');
    pop.className = 'pill-popover';
    pop.setAttribute('role', 'listbox');

    const hasTree = items.some(it => Array.isArray(it.children) && it.children.length);
    if (hasTree) pop.classList.add('pill-popover--tree');

    function renderItem(it, isChild) {
      const sel = (it.value || '') === (currentValue || '');
      const cls = [
        'pill-popover-item',
        isChild ? 'pill-popover-item--child' : '',
        it.children && it.children.length ? 'pill-popover-item--parent' : '',
        sel ? 'is-selected' : '',
        it.sensitive ? 'is-sensitive' : ''
      ].filter(Boolean).join(' ');
      const badge = it.sensitive ? '<span class="pill-popover-badge">review</span>' : '';
      return `<button class="${cls}" type="button" role="option" aria-selected="${sel}" data-value="${escape(it.value || '')}">
        <span class="pill-popover-label">${escape(it.label)}${badge}</span>
        ${it.count != null ? `<span class="pill-popover-count">${escape(it.count)}</span>` : ''}
      </button>`;
    }

    pop.innerHTML = items.map(it => {
      let html = renderItem(it, false);
      if (Array.isArray(it.children) && it.children.length) {
        html += '<div class="pill-popover-children">' +
          it.children.map(child => renderItem(child, true)).join('') +
          '</div>';
      }
      return html;
    }).join('');

    pop.addEventListener('click', e => {
      const btn = e.target.closest('[data-value]');
      if (!btn) return;
      const value = btn.getAttribute('data-value');
      close();
      onSelect(value);
    });

    document.body.appendChild(pop);

    const r = triggerEl.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.top = (r.bottom + 6) + 'px';
    pop.style.left = r.left + 'px';
    pop.style.minWidth = Math.max(r.width, hasTree ? 320 : 220) + 'px';
    pop.style.maxWidth = hasTree ? '420px' : '';
    pop.style.zIndex = '1000';

    // Reflow then adjust if off-screen
    const pr = pop.getBoundingClientRect();
    if (pr.right > window.innerWidth - 12) {
      pop.style.left = '';
      pop.style.right = '12px';
    }
    if (pr.bottom > window.innerHeight - 12) {
      pop.style.top = Math.max(12, r.top - pr.height - 6) + 'px';
    }

    activePopover = pop;
    activeTrigger = triggerEl;
    triggerEl.setAttribute('aria-expanded', 'true');
  }

  document.addEventListener('click', e => {
    if (!activePopover) return;
    if (activePopover.contains(e.target)) return;
    if (activeTrigger && activeTrigger.contains(e.target)) return;
    close();
  }, true);

  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  /* ── Inject CSS once ── */
  const css = `
    .pill-popover {
      background: var(--surface, #fff);
      border: 1px solid var(--border, #C2C8C3);
      border-radius: var(--radius-md, 14px);
      box-shadow: var(--shadow-lg, 0 20px 60px rgba(29,29,33,0.10));
      padding: 6px;
      max-height: 360px;
      overflow-y: auto;
      animation: pillPopIn 0.16s cubic-bezier(.2,.7,.2,1);
    }
    @keyframes pillPopIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .pill-popover-item {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; gap: 16px;
      padding: 9px 14px;
      border: 0; background: transparent;
      border-radius: var(--radius-sm, 8px);
      text-align: left;
      font: 500 13.5px/1.4 'Inter', system-ui, sans-serif;
      color: var(--text, #1C1C19);
      cursor: pointer;
      transition: background 0.12s;
    }
    .pill-popover-item:hover { background: var(--bg-2, #F6F3EE); }
    .pill-popover-item.is-selected {
      background: var(--primary, #182c24); color: #fff;
    }
    .pill-popover-item.is-selected .pill-popover-count {
      color: rgba(255,255,255,0.7);
    }
    .pill-popover-count {
      font: 500 12px/1 'Inter', sans-serif;
      color: var(--text-subtle, #8A8A8A);
      flex-shrink: 0;
    }

    /* Tree mode (pillars + sub-categories) */
    .pill-popover--tree { padding: 8px 6px; max-height: 440px; }
    .pill-popover--tree .pill-popover-item--parent {
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-top: 2px;
    }
    .pill-popover--tree .pill-popover-item--parent:not(.is-selected):hover {
      background: var(--bg-2, #F6F3EE);
    }
    .pill-popover-children {
      display: flex; flex-direction: column;
      padding: 0 0 6px 0;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      margin-bottom: 4px;
    }
    .pill-popover-item--child {
      font-weight: 500;
      font-size: 13px;
      padding: 7px 14px 7px 30px;
      color: var(--text-muted, #5b5b56);
    }
    .pill-popover-item--child .pill-popover-count {
      font-size: 11.5px;
    }
    .pill-popover-badge {
      display: inline-block;
      margin-left: 6px;
      padding: 1px 5px;
      font: 700 9.5px/1.4 'Inter', sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--orange-700, #b25411);
      background: var(--orange-50, #fef3e7);
      border: 1px solid var(--orange-100, #fadcb6);
      border-radius: 4px;
      vertical-align: 1px;
    }
    .pill-popover-item.is-selected .pill-popover-badge {
      color: rgba(255,255,255,0.95);
      background: rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.18);
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  window.PillPicker = { open, close };
})();
