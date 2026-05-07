/* ============================================================
 * category-model.js — Shared category selection model
 *
 * Single source of truth for category selection across:
 *   - search-pill.js (hero search bar — desktop dropdown)
 *   - index.html mobile modal (mobile search bar)
 *   - events-search-results.html  filterbar pill
 *   - retreats-search-results.html filterbar pill
 *   - trainings-search-results.html filterbar pill
 *
 * Selection shape (canonical, used everywhere):
 *   { pillar: '<slug>', sub: '<slug>' }   (either may be '')
 *
 * Encoded form (URL params, PillPicker tree values, chip data attrs):
 *   ''                empty
 *   'pillar'          pillar only
 *   'pillar/sub'      pillar + sub
 *
 * This module is pure (no side effects) except for `wireCategoryPill`,
 * which is a thin DOM helper composing PillPicker. In a React/Next.js
 * port, the pure functions become utilities and `wireCategoryPill`
 * becomes a `<CategoryPillPopover>` component.
 *
 * Depends on: window.PillPicker (loaded lazily — only used inside the
 * click handler set up by `wireCategoryPill`).
 * ============================================================ */
(function () {
  'use strict';

  /* ── Path codec ────────────────────────────────────────── */
  function encodePath(value) {
    if (!value || !value.pillar) return '';
    return value.sub ? `${value.pillar}/${value.sub}` : value.pillar;
  }

  function decodePath(path) {
    if (!path) return { pillar: '', sub: '' };
    const [pillar, sub = ''] = String(path).split('/');
    return { pillar, sub };
  }

  /* ── Lookup ────────────────────────────────────────────── */
  // Returns { pillar: pillarObj|null, sub: subObj|null }.
  // Accepts either a {pillar, sub} value object or an encoded path.
  function findNode(taxonomy, value) {
    const v = typeof value === 'string' ? decodePath(value) : (value || {});
    const pillar = v.pillar ? (taxonomy.find(p => p.slug === v.pillar) || null) : null;
    const sub    = (pillar && v.sub) ? (pillar.subs.find(s => s.slug === v.sub) || null) : null;
    return { pillar, sub };
  }

  /* ── Display ───────────────────────────────────────────── */
  // "Yoga · Vinyasa Yoga" / "Yoga" / anyLabel
  function formatLabel(taxonomy, value, anyLabel, joiner) {
    const j = joiner || ' · ';
    const { pillar, sub } = findNode(taxonomy, value);
    if (!pillar) return anyLabel || '';
    if (sub) return `${pillar.name}${j}${sub.name}`;
    return pillar.name;
  }

  /* ── PillPicker tree builder ───────────────────────────── */
  // Output shape feeds pillpicker.js tree mode.
  function buildPickerTree(taxonomy, anyLabel) {
    return [{ value: '', label: anyLabel }].concat(
      taxonomy.map(p => ({
        value: p.slug,
        label: p.name,
        count: p.count,
        sensitive: !!p.sensitive,
        children: p.subs.map(s => ({
          value: `${p.slug}/${s.slug}`,
          label: s.name,
          count: s.count,
          sensitive: !!s.sensitive
        }))
      }))
    );
  }

  /* ── DOM helper: wire a filterbar category pill ───────────
   *
   * pillEl     — the <button> element. May contain a child with
   *              [data-clear="<anyKey>"] to act as the X-clear.
   * taxonomy   — taxonomy array (EVENT/RETREAT/TRAINING_TAXONOMY).
   * anyLabel   — "Any practice" / "Any discipline".
   * getValue   — () => { pillar, sub } current selection.
   * onChange   — ({ pillar, sub }) => void called on select / clear.
   * ──────────────────────────────────────────────────────── */
  function wireCategoryPill(opts) {
    const { pillEl, taxonomy, anyLabel, getValue, onChange } = opts;
    pillEl.addEventListener('click', e => {
      // Clear button — any descendant with [data-clear].
      if (e.target.closest('[data-clear]')) {
        onChange({ pillar: '', sub: '' });
        return;
      }
      // Tree is built lazily so this helper can be called before
      // taxonomy data has loaded from categories.json.
      const tree = buildPickerTree(taxonomy, anyLabel);
      const current = encodePath(getValue());
      window.PillPicker.open(pillEl, tree, current, (val) => {
        onChange(decodePath(val));
      });
    });
  }

  /* ── Public API ────────────────────────────────────────── */
  window.CategoryModel = {
    encodePath,
    decodePath,
    findNode,
    formatLabel,
    buildPickerTree,
    wireCategoryPill
  };
})();
