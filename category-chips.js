/* ============================================================
 * category-chips.js — Shared chip-row of popular sub-categories
 *
 * Single source of truth for the "popular sub-categories" chip
 * shortcut row that sits below the filterbar on all three search
 * results pages (events / retreats / trainings).
 *
 * Behavior:
 *   - No pillar selected → "All [anyLabel]" + cross-pillar shortcuts
 *     (taxonomy nodes flagged `trending: true`, padded with the
 *     highest-count subs across all pillars).
 *   - Pillar selected → "All [Pillar]" + that pillar's top-N subs
 *     (sorted by `count`, capped to `maxSubs`).
 *
 *   Selecting a chip sets {pillar, sub} via onChange.
 *   Re-clicking the active chip toggles back to the parent scope.
 *
 * Selection shape (canonical, same as CategoryModel):
 *   { pillar: '<slug>', sub: '<slug>' }   (either may be '')
 *
 * Usage:
 *   CategoryChips.mount({
 *     rowEl: document.getElementById('chipRow'),
 *     taxonomy: T.EVENT_TAXONOMY,
 *     anyLabel: 'practices',          // appears as "All practices"
 *     getValue: () => ({ pillar: state.pillar, sub: state.sub }),
 *     onChange: ({ pillar, sub }) => { state.pillar = pillar; state.sub = sub; render(); },
 *     popular:  ['cacao-ceremony','soundbath',...],   // optional override
 *     maxSubs:  14,                                    // optional, default 14
 *     maxPopular: 12,                                  // optional, default 12
 *     counts:   new Map([['vinyasa-yoga', 19], ...])  // optional override (sub-slug → count)
 *   });
 *
 * Then call `CategoryChips.render(rowEl)` whenever state changes.
 * ============================================================ */
(function () {
  'use strict';

  // Per-row config (rowEl → opts) so render() can be re-invoked
  // without callers passing the full opts each time.
  const configs = new WeakMap();

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Find a sub-slug across all pillars; returns { pillar, sub } or null.
  function findSub(taxonomy, slug) {
    if (!slug) return null;
    for (const p of taxonomy) {
      const s = p.subs.find(x => x.slug === slug);
      if (s) return { pillar: p, sub: s };
    }
    return null;
  }

  // Build the chip data for the current selection. Returns:
  //   { items: [{ pillar, sub, label, count?, active }], scope: 'all' | 'pillar' }
  function buildChips(opts, value) {
    const { taxonomy, anyLabel, popular, maxSubs = 14, maxPopular = 12, counts } = opts;
    const v = value || { pillar: '', sub: '' };

    // ── Pillar selected → that pillar's top subs ─────────────
    if (v.pillar) {
      const pillar = taxonomy.find(p => p.slug === v.pillar);
      const subs = (pillar?.subs || []).slice()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, maxSubs);
      const items = [{
        pillar: v.pillar,
        sub: '',
        label: `All ${pillar ? pillar.name : (anyLabel || 'practices')}`,
        active: !!v.pillar && !v.sub
      }].concat(subs.map(s => ({
        pillar: v.pillar,
        sub: s.slug,
        label: s.name,
        count: counts ? counts.get(s.slug) : null,
        active: v.pillar === pillar?.slug && v.sub === s.slug
      })));
      return { items, scope: 'pillar' };
    }

    // ── No pillar → cross-pillar shortcuts ───────────────────
    let shortcutSubs = [];
    if (Array.isArray(popular) && popular.length) {
      shortcutSubs = popular
        .map(slug => {
          const found = findSub(taxonomy, slug);
          return found ? { pillarSlug: found.pillar.slug, sub: found.sub } : null;
        })
        .filter(Boolean);
    } else {
      // Default: trending-flagged subs, padded with highest-count subs
      // across all pillars.
      const trending = [];
      const all = [];
      taxonomy.forEach(p => {
        p.subs.forEach(s => {
          all.push({ pillarSlug: p.slug, sub: s });
          if (s.trending) trending.push({ pillarSlug: p.slug, sub: s });
        });
      });
      const seen = new Set(trending.map(x => x.sub.slug));
      const padding = all
        .filter(x => !seen.has(x.sub.slug))
        .sort((a, b) => (b.sub.count || 0) - (a.sub.count || 0));
      shortcutSubs = trending.concat(padding).slice(0, maxPopular);
    }

    const items = [{
      pillar: '', sub: '',
      label: `All ${anyLabel || 'practices'}`,
      active: !v.pillar && !v.sub
    }].concat(shortcutSubs.slice(0, maxPopular).map(x => ({
      pillar: x.pillarSlug,
      sub: x.sub.slug,
      label: x.sub.name,
      count: counts ? counts.get(x.sub.slug) : null,
      active: v.pillar === x.pillarSlug && v.sub === x.sub.slug
    })));
    return { items, scope: 'all' };
  }

  function renderInto(rowEl) {
    const opts = configs.get(rowEl);
    if (!opts) return;
    const value = opts.getValue() || { pillar: '', sub: '' };
    const { items } = buildChips(opts, value);
    rowEl.innerHTML = items.map(it => {
      const path = it.pillar ? (it.sub ? `${it.pillar}/${it.sub}` : it.pillar) : '';
      const cls = 'chip' + (it.active ? ' is-active' : '');
      const cnt = (it.count != null && it.count !== '')
        ? `<span class="chip-count">· ${escape(it.count)}</span>` : '';
      return `<button class="${cls}" type="button" data-cat-path="${escape(path)}">${escape(it.label)}${cnt ? ' ' + cnt : ''}</button>`;
    }).join('');
  }

  function decodePath(path) {
    if (!path) return { pillar: '', sub: '' };
    const [pillar, sub = ''] = String(path).split('/');
    return { pillar, sub };
  }

  function mount(opts) {
    const { rowEl } = opts;
    if (!rowEl) throw new Error('CategoryChips.mount: rowEl required');
    configs.set(rowEl, opts);
    rowEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-cat-path]');
      if (!btn) return;
      const o = configs.get(rowEl);
      if (!o) return;
      const next = decodePath(btn.dataset.catPath || '');
      const cur  = o.getValue() || { pillar: '', sub: '' };
      // Toggle behavior:
      //   - Re-click "All X" while already active → no-op
      //   - Re-click an active sub chip → demote to its pillar (clears sub)
      let result;
      if (next.pillar === cur.pillar && next.sub === cur.sub) {
        if (next.sub) result = { pillar: next.pillar, sub: '' };
        else if (!next.pillar) result = { pillar: '', sub: '' };
        else result = next;
      } else {
        result = next;
      }
      o.onChange(result);
    });
    renderInto(rowEl);
  }

  function render(rowEl) {
    renderInto(rowEl);
  }

  window.CategoryChips = { mount, render, buildChips };
})();
