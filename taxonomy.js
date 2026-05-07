/* ============================================================
 * taxonomy.js — Canonical taxonomy + filter dimensions
 *
 * Category data (EVENT_TAXONOMY / RETREAT_TAXONOMY / TRAINING_TAXONOMY)
 * is loaded asynchronously from /categories.json — the SINGLE SOURCE
 * OF TRUTH for all category slugs, names, counts, and flags. Adding a
 * pillar or sub-category there propagates to every UI surface (hero
 * search dropdowns, mobile modal, filterbar pills, chip rows, pillar
 * landing pages). In production this fetch swaps to GET /api/categories.
 *
 * Filter dimensions (places, dates, lengths, hours …) remain inline —
 * they are UI-only enumerations, not catalog data.
 *
 * Consumers MUST await `Taxonomy.ready` before reading EVENT/RETREAT/
 * TRAINING_TAXONOMY:
 *
 *   await window.Taxonomy.ready;
 *   render(window.Taxonomy.EVENT_TAXONOMY);
 *
 * The arrays are populated in-place after fetch, so references
 * captured before ready remain valid once it resolves.
 *
 * Exposes window.Taxonomy. Must load BEFORE search-pill.js.
 * ============================================================ */
(function () {
  'use strict';

  /* ── Icons (resolved by name from categories.json `icon` field) ── */
  const ICONS = {
    figure: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="2"/><path d="M8 11c1-1.5 2.5-2 4-2s3 .5 4 2l-2 3v6M10 14l-2 6M14 14l1 3"/></svg>',
    circle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>',
    leaf:   '<svg viewBox="0 0 24 24"><path d="M20 4S13 4 9 8s-4 10 0 12c4-4 4-8 0-12"/><path d="M20 4c0 4-2 12-11 16"/></svg>',
    heart:  '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 3.5c0 5.9-7 10.5-7 10.5z"/></svg>',
    wave:   '<svg viewBox="0 0 24 24"><path d="M3 14c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M3 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/></svg>',
    people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 20a5 5 0 0 1 7 0"/></svg>',
    bell:   '<svg viewBox="0 0 24 24"><path d="M6 18h12l-2-3V9a4 4 0 0 0-8 0v6l-2 3z"/><path d="M10 21h4"/></svg>',
    hand:   '<svg viewBox="0 0 24 24"><path d="M9 11V5a1.5 1.5 0 0 1 3 0v6"/><path d="M12 11V4a1.5 1.5 0 0 1 3 0v7"/><path d="M15 11V6a1.5 1.5 0 0 1 3 0v9c0 4-2.5 6-6 6s-5-1.5-7-5l-3-5a1.5 1.5 0 0 1 2.5-1.7L7 12V7a1.5 1.5 0 0 1 3 0v4"/></svg>',
    spark:  '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>'
  };

  /* ── Category arrays (populated in-place after fetch) ──────
     Consumers may capture these references at module load time;
     they will reflect the loaded data once Taxonomy.ready resolves. */
  const EVENT_TAXONOMY    = [];
  const RETREAT_TAXONOMY  = [];
  const TRAINING_TAXONOMY = [];

  /* ── Cross-marketplace flat categories (used by 'all' tab on landing) ── */
  const ALL_CATEGORIES = [
    { slug: 'yoga',          label: 'Yoga',              trending: true },
    { slug: 'meditation',    label: 'Meditation',        trending: true },
    { slug: 'breathwork',    label: 'Breathwork' },
    { slug: 'sound-healing', label: 'Sound healing' },
    { slug: 'wellness',      label: 'Wellness' },
    { slug: 'tantra',        label: 'Tantra' },
    { slug: 'ayurveda',      label: 'Ayurveda' },
    { slug: 'silent',        label: 'Silent & Vipassana' },
    { slug: 'cacao',         label: 'Cacao' },
    { slug: 'massage',       label: 'Massage' }
  ];

  /* ── Place suggestions (search bar autocomplete) ─────── */
  const PLACE_SUGGESTIONS = [
    { name: 'Bali',       kind: 'destination', slug: 'bali',       counts: '12 retreats · 3 trainings' },
    { name: 'Berlin',     kind: 'city',        slug: 'berlin',     counts: '47 events · 2 retreats · 1 training' },
    { name: 'Mallorca',   kind: 'destination', slug: 'mallorca',   counts: '9 retreats · 1 training' },
    { name: 'Rishikesh',  kind: 'destination', slug: 'rishikesh',  counts: '5 retreats · 7 trainings' },
    { name: 'Lisbon',     kind: 'city',        slug: 'lisbon',     counts: '14 events · 3 retreats · 2 trainings' },
    { name: 'Costa Rica', kind: 'country',     slug: 'costa-rica', counts: '8 retreats' },
    { name: 'Portugal',   kind: 'country',     slug: 'portugal',   counts: '11 retreats · 2 trainings · 16 events' }
  ];

  /* ── Retreat destinations (filter pill on retreats search results) ─── */
  const RETREAT_DESTINATIONS = [
    { slug: '',          label: 'Anywhere' },
    { slug: 'bali',      label: 'Bali',           match: ['Bali'] },
    { slug: 'rishikesh', label: 'Rishikesh',      match: ['Rishikesh'] },
    { slug: 'portugal',  label: 'Portugal',       match: ['Portugal', 'Azores'] },
    { slug: 'spain',     label: 'Spain (Mallorca)', match: ['Mallorca', 'Spain'] },
    { slug: 'greece',    label: 'Greece',         match: ['Greece', 'Santorini', 'Crete'] },
    { slug: 'italy',     label: 'Italy',          match: ['Italy'] },
    { slug: 'india',     label: 'India',          match: ['India', 'Kerala', 'Rishikesh'] },
    { slug: 'thailand',  label: 'Thailand',       match: ['Thailand', 'Koh Phangan'] },
    { slug: 'costa-rica',label: 'Costa Rica',     match: ['Costa Rica'] },
    { slug: 'morocco',   label: 'Morocco',        match: ['Morocco'] },
    { slug: 'sweden',    label: 'Sweden',         match: ['Sweden'] }
  ];

  /* ── Training places (filter pill on trainings search results) ─────── */
  const TRAINING_PLACES = [
    { slug: '',          label: 'Anywhere',       country: null,        online: false },
    { slug: 'online',    label: 'Online',         country: null,        online: true  },
    { slug: 'india',     label: 'India',          country: 'IN' },
    { slug: 'indonesia', label: 'Indonesia (Bali)', country: 'ID' },
    { slug: 'germany',   label: 'Germany',        country: 'DE' },
    { slug: 'portugal',  label: 'Portugal',       country: 'PT' },
    { slug: 'spain',     label: 'Spain',          country: 'ES' },
    { slug: 'thailand',  label: 'Thailand',       country: 'TH' },
    { slug: 'austria',   label: 'Austria',        country: 'AT' },
    { slug: 'uk',        label: 'United Kingdom', country: 'GB' },
    { slug: 'netherlands', label: 'Netherlands',  country: 'NL' },
    { slug: 'peru',      label: 'Peru',           country: 'PE' }
  ];

  /* ── Event areas (regional hubs on events search results) ────────── */
  const EVENT_AREAS = [
    { slug: 'rishikesh',   label: 'Rishikesh' },
    { slug: 'berlin',      label: 'Berlin' },
    { slug: 'freiburg',    label: 'Freiburg' },
    { slug: 'munich',      label: 'München' },
    { slug: 'leipzig',     label: 'Leipzig' },
    { slug: 'stuttgart',   label: 'Stuttgart' },
    { slug: 'london',      label: 'London' },
    { slug: 'pisac',       label: 'Písac' },
    { slug: 'koh_phangan', label: 'Koh Phangan' },
    { slug: 'ubud',        label: 'Ubud' },
    { slug: 'online',      label: 'Online (Live)' }
  ];

  /* ── Date quick-picks per tab (search bar) ───────────── */
  const DATE_QUICK = {
    events:    ['Tonight', 'Tomorrow', 'This weekend', 'This week', 'Pick dates…'],
    retreats:  ["I'm flexible", 'Spring 2026', 'Summer 2026', 'Autumn 2026', 'Pick dates…'],
    trainings: ['Next 3 months', 'Next 6 months', 'Autumn 2026', 'Pick a start month…'],
    all:       ['Any time', 'This weekend', 'This month', 'Pick dates…']
  };

  /* ── Date presets for events search results ──────────── */
  const EVENT_DATE_PRESETS = [
    { slug: 'any',        label: 'Any time' },
    { slug: 'this_week',  label: 'This week' },
    { slug: 'this_month', label: 'This month' },
    { slug: 'next_3m',    label: 'Next 3 months' },
    { slug: 'weekend',    label: 'Coming weekend' }
  ];

  /* ── Retreat seasons ─────────────────────────────────── */
  const RETREAT_SEASONS = [
    { slug: '',       label: 'Flexible' },
    { slug: 'spring', label: 'Spring 2026' },
    { slug: 'summer', label: 'Summer 2026' },
    { slug: 'autumn', label: 'Autumn 2026' },
    { slug: 'winter', label: 'Winter 2026/27' }
  ];

  /* ── Retreat lengths (nights buckets) ────────────────── */
  const RETREAT_LENGTHS = [
    { slug: '',         label: 'Any length',         min: 0,  max: 999 },
    { slug: 'weekend',  label: 'Weekend (2–3 nts)',  min: 2,  max: 3 },
    { slug: 'short',    label: 'Short (4–7 nts)',    min: 4,  max: 7 },
    { slug: 'week-plus',label: 'Week+ (8–14 nts)',   min: 8,  max: 14 },
    { slug: 'deep',     label: 'Deep (2+ weeks)',    min: 15, max: 999 }
  ];

  /* ── Training start windows ──────────────────────────── */
  const TRAINING_STARTS = [
    { slug: '',         label: 'Any time',        monthsAhead: null },
    { slug: '3m',       label: 'Next 3 months',   monthsAhead: 3 },
    { slug: '6m',       label: 'Next 6 months',   monthsAhead: 6 },
    { slug: 'autumn26', label: 'Autumn 2026',     range: ['2026-09-01', '2026-12-01'] },
    { slug: '2027',     label: '2027',            range: ['2027-01-01', '2028-01-01'] }
  ];

  /* ── Training cert hours buckets ─────────────────────── */
  const TRAINING_HOURS = [
    { slug: '',     label: 'Any hours',  min: 0,   max: 9999 },
    { slug: '50',   label: '50 hour',    min: 1,   max: 99 },
    { slug: '100',  label: '100 hour',   min: 100, max: 199 },
    { slug: '200',  label: '200 hour',   min: 200, max: 299 },
    { slug: '300',  label: '300 hour',   min: 300, max: 499 },
    { slug: '500',  label: '500 hour +', min: 500, max: 9999 }
  ];

  /* ── Training formats ────────────────────────────────── */
  const TRAINING_FORMATS = [
    { slug: '',          label: 'Any format' },
    { slug: 'intensive', label: 'Intensive' },
    { slug: 'modular',   label: 'Modular' },
    { slug: 'online',    label: 'Online' }
  ];

  /* ── Time-of-day (events) ────────────────────────────── */
  const TIME_OF_DAY = [
    { slug: 'morning',   label: 'Morning (before 11)' },
    { slug: 'midday',    label: 'Midday (11–14)' },
    { slug: 'afternoon', label: 'Afternoon (14–18)' },
    { slug: 'evening',   label: 'Evening (after 18)' }
  ];

  /* ── Hours suggestions (search bar — labels only) ─────── */
  const CERT_SUGGESTIONS   = ['200 hour', '300 hour', '500 hour'];
  const LENGTH_SUGGESTIONS = ['Weekend (2–3 days)', 'Short (4–7 days)', 'Week+ (8–14 days)', 'Deep (2+ weeks)'];
  const TIME_SUGGESTIONS   = TIME_OF_DAY.map(t => t.label);

  /* ── Helpers ─────────────────────────────────────────── */
  function findPillar(taxonomy, slug) {
    return taxonomy.find(p => p.slug === slug) || null;
  }
  function findSub(taxonomy, pillarSlug, subSlug) {
    const p = findPillar(taxonomy, pillarSlug);
    if (!p) return null;
    return p.subs.find(s => s.slug === subSlug) || null;
  }
  function eventCategoryLabel(slug) {
    if (!slug) return '';
    const norm = String(slug).replace(/_/g, '-');
    for (const pillar of EVENT_TAXONOMY) {
      if (pillar.slug === norm) return pillar.name;
      const sub = pillar.subs.find(s => s.slug === norm);
      if (sub) return sub.name;
    }
    return slug.replace(/[-_]/g, ' ');
  }
  // Returns { pillar, sub } for a slug or "pillar/sub" path; either may be null.
  function findEventNode(input) {
    if (!input) return { pillar: null, sub: null };
    const raw = String(input).replace(/_/g, '-');
    if (raw.includes('/')) {
      const [pSlug, sSlug] = raw.split('/');
      const pillar = EVENT_TAXONOMY.find(p => p.slug === pSlug) || null;
      const sub = pillar ? (pillar.subs.find(s => s.slug === sSlug) || null) : null;
      return { pillar, sub };
    }
    const asPillar = EVENT_TAXONOMY.find(p => p.slug === raw);
    if (asPillar) return { pillar: asPillar, sub: null };
    for (const pillar of EVENT_TAXONOMY) {
      const sub = pillar.subs.find(s => s.slug === raw);
      if (sub) return { pillar, sub };
    }
    return { pillar: null, sub: null };
  }
  function findByValue(arr, val, fields) {
    if (!arr) return null;
    const keys = fields || ['slug'];
    return arr.find(it => keys.some(k => it[k] === val)) || null;
  }

  /* ── Hydrate pillar arrays from JSON ────────────────────
     Resolves `icon: "<name>"` → SVG string from ICONS. */
  function hydratePillars(rawPillars) {
    return rawPillars.map(p => Object.assign({}, p, {
      icon: ICONS[p.icon] || '',
      subs: p.subs.slice()
    }));
  }

  /* ── Async load ─────────────────────────────────────── */
  const ready = fetch('categories.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('categories.json HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      EVENT_TAXONOMY.push(   ...hydratePillars(data.events    || []));
      RETREAT_TAXONOMY.push( ...hydratePillars(data.retreats  || []));
      TRAINING_TAXONOMY.push(...hydratePillars(data.trainings || []));
    })
    .catch(err => {
      console.error('taxonomy.js: failed to load categories.json —', err);
      throw err;
    });

  /* ── Public API ──────────────────────────────────────── */
  window.Taxonomy = {
    ready,
    EVENT_TAXONOMY,
    RETREAT_TAXONOMY,
    TRAINING_TAXONOMY,
    ALL_CATEGORIES,
    PLACE_SUGGESTIONS,
    RETREAT_DESTINATIONS,
    TRAINING_PLACES,
    EVENT_AREAS,
    DATE_QUICK,
    EVENT_DATE_PRESETS,
    RETREAT_SEASONS,
    RETREAT_LENGTHS,
    TRAINING_STARTS,
    TRAINING_HOURS,
    TRAINING_FORMATS,
    TIME_OF_DAY,
    CERT_SUGGESTIONS,
    LENGTH_SUGGESTIONS,
    TIME_SUGGESTIONS,
    findPillar,
    findSub,
    findByValue,
    eventCategoryLabel,
    findEventNode
  };
})();
