/* ============================================================
 * taxonomy.js — Canonical taxonomy + filter dimensions
 *
 * Single source of truth for category and filter data across:
 *   - search-pill.js (hero search, mobile modal)
 *   - retreats-search-results.html
 *   - trainings-search-results.html
 *   - events-search-results.html
 *
 * Exposes window.Taxonomy. Must load BEFORE search-pill.js.
 * ============================================================ */
(function () {
  'use strict';

  /* ── Icons (for pillar cards) ── */
  const FIGURE_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="2"/><path d="M8 11c1-1.5 2.5-2 4-2s3 .5 4 2l-2 3v6M10 14l-2 6M14 14l1 3"/></svg>';
  const CIRCLE_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>';
  const LEAF_ICON   = '<svg viewBox="0 0 24 24"><path d="M20 4S13 4 9 8s-4 10 0 12c4-4 4-8 0-12"/><path d="M20 4c0 4-2 12-11 16"/></svg>';
  const HEART_ICON  = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 3.5c0 5.9-7 10.5-7 10.5z"/></svg>';
  const WAVE_ICON   = '<svg viewBox="0 0 24 24"><path d="M3 14c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M3 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/></svg>';
  const PEOPLE_ICON = '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 20a5 5 0 0 1 7 0"/></svg>';
  const BELL_ICON   = '<svg viewBox="0 0 24 24"><path d="M6 18h12l-2-3V9a4 4 0 0 0-8 0v6l-2 3z"/><path d="M10 21h4"/></svg>';

  /* ── Event categories (flat list) ─────────────────────── */
  const EVENT_CATEGORIES = [
    { slug: 'yoga',                 label: 'Yoga',                 trending: true },
    { slug: 'meditation',           label: 'Meditation',           trending: true },
    { slug: 'breathwork',           label: 'Breathwork' },
    { slug: 'sound_healing',        label: 'Sound healing' },
    { slug: 'tantra',               label: 'Tantra' },
    { slug: 'cacao_ceremony',       label: 'Cacao ceremony' },
    { slug: 'conscious_dance',      label: 'Conscious dance' },
    { slug: 'embodiment',           label: 'Embodiment' },
    { slug: 'kirtan',               label: 'Kirtan' },
    { slug: 'temple_night',         label: 'Temple night' },
    { slug: 'festival',             label: 'Festival' },
    { slug: 'retreat',              label: 'Retreat (one-off)' },
    { slug: 'circle',               label: 'Circle',              trending: true },
    { slug: 'ceremony',             label: 'Ceremony' },
    { slug: 'conscious_party',      label: 'Conscious party',     trending: true },
    { slug: 'ice_bath',             label: 'Ice bath' },
    { slug: 'energy_healing',       label: 'Energy healing' },
    { slug: 'conscious_touch',      label: 'Conscious touch' },
    { slug: 'mystical_arts',        label: 'Mystical arts' },
    { slug: 'family_constellation', label: 'Family constellation' }
  ];

  /* ── Retreat taxonomy (pillars + sub-categories) ──────── */
  const RETREAT_TAXONOMY = [
    {
      slug: 'yoga', name: 'Yoga', icon: FIGURE_ICON, count: 1116,
      subs: [
        { slug: 'yoga-meditation',        name: 'Yoga & Meditation',        count: 262 },
        { slug: 'yoga-teacher-training',  name: 'Yoga Teacher Training',    count: 244 },
        { slug: 'yoga-general',           name: 'Yoga (general)',           count: 180 },
        { slug: 'yoga-for-beginners',     name: 'Yoga for Beginners',       count: 106 },
        { slug: 'tantra-yoga',            name: 'Tantra Yoga',              count: 47  },
        { slug: 'hatha-yoga',             name: 'Hatha Yoga',               count: 42  },
        { slug: 'kundalini-yoga',         name: 'Kundalini Yoga',           count: 41  },
        { slug: 'yoga-for-kids',          name: 'Yoga for Kids',            count: 31  },
        { slug: 'yin-restorative',        name: 'Yin & Restorative Yoga',   count: 23  },
        { slug: 'sivananda-yoga',         name: 'Sivananda Yoga',           count: 21  },
        { slug: 'vinyasa-yoga',           name: 'Vinyasa Yoga',             count: 19  },
        { slug: 'yoga-nidra',             name: 'Yoga Nidra',               count: 11  },
        { slug: 'aerial-acro-yoga',       name: 'Aerial & Acro Yoga',       count: 5   },
        { slug: 'ashtanga-yoga',          name: 'Ashtanga Yoga',            count: 5   },
        { slug: 'yoga-for-seniors',       name: 'Yoga for Seniors',         count: 5   },
        { slug: 'iyengar-yoga',           name: 'Iyengar Yoga',             count: 2   },
        { slug: 'prenatal-yoga',          name: 'Prenatal Yoga',            count: 2   }
      ]
    },
    {
      slug: 'meditation', name: 'Meditation', icon: CIRCLE_ICON, count: 453,
      subs: [
        { slug: 'dark',              name: 'Dark',                          count: 165 },
        { slug: 'meditation-general',name: 'Meditation (general)',          count: 120 },
        { slug: 'silent',            name: 'Silent',                        count: 95  },
        { slug: 'mindfulness',       name: 'Mindfulness',                   count: 81  },
        { slug: 'buddhist',          name: 'Buddhist',                      count: 61  },
        { slug: 'ifs',               name: 'IFS (Internal Family Systems)', count: 50  },
        { slug: 'zen',               name: 'Zen',                           count: 17  },
        { slug: 'vipassana',         name: 'Vipassana',                     count: 11  }
      ]
    },
    {
      slug: 'plant-medicine', name: 'Plant Medicine', icon: LEAF_ICON, count: 2661, sensitive: true,
      subs: [
        { slug: 'ayahuasca',              name: 'Ayahuasca',              count: 1076, sensitive: true },
        { slug: 'psilocybin',             name: 'Psilocybin',             count: 895,  sensitive: true },
        { slug: 'mushroom',               name: 'Mushroom',               count: 551,  sensitive: true },
        { slug: 'cacao',                  name: 'Cacao',                  count: 524 },
        { slug: 'dieta',                  name: 'Dieta',                  count: 249,  sensitive: true },
        { slug: 'truffle',                name: 'Truffle',                count: 174,  sensitive: true },
        { slug: 'microdosing',            name: 'Microdosing',            count: 170,  sensitive: true },
        { slug: 'iboga',                  name: 'Iboga',                  count: 147,  sensitive: true },
        { slug: 'ibogaine',               name: 'Ibogaine',               count: 127,  sensitive: true },
        { slug: 'san-pedro-huachuma',     name: 'San Pedro Huachuma',     count: 112,  sensitive: true },
        { slug: 'bufo',                   name: 'Bufo',                   count: 81,   sensitive: true },
        { slug: 'shamanic',               name: 'Shamanic',               count: 70,   sensitive: true },
        { slug: 'kambo',                  name: 'Kambo',                  count: 45,   sensitive: true },
        { slug: 'preparation-integration',name: 'Preparation & Integration',count: 32 },
        { slug: 'peyote',                 name: 'Peyote',                 count: 21,   sensitive: true },
        { slug: 'cannabis',               name: 'Cannabis',               count: 21,   sensitive: true },
        { slug: 'mdma',                   name: 'MDMA',                   count: 18,   sensitive: true },
        { slug: '5-meo-dmt',              name: '5-MEO-DMT',              count: 16,   sensitive: true },
        { slug: 'lsd',                    name: 'LSD',                    count: 10,   sensitive: true },
        { slug: 'ketamine',               name: 'Ketamine',               count: 9,    sensitive: true },
        { slug: 'dmt',                    name: 'DMT',                    count: 8,    sensitive: true }
      ]
    },
    {
      slug: 'healing', name: 'Healing & Recovery', icon: HEART_ICON, count: 3872,
      subs: [
        { slug: 'emotional-healing',  name: 'Emotional Healing',    count: 1434 },
        { slug: 'trauma-healing',     name: 'Trauma Healing',       count: 1069 },
        { slug: 'stress-management',  name: 'Stress Management',    count: 911  },
        { slug: 'somatic-therapy',    name: 'Somatic Therapy',      count: 850  },
        { slug: 'anxiety-relief',     name: 'Anxiety Relief',       count: 684  },
        { slug: 'depression-recovery',name: 'Depression Recovery',  count: 546  },
        { slug: 'addiction-recovery', name: 'Addiction Recovery',   count: 527  },
        { slug: 'ptsd-recovery',      name: 'PTSD Recovery',        count: 195  },
        { slug: 'burnout-recovery',   name: 'Burnout Recovery',     count: 167  },
        { slug: 'grief',              name: 'Grief & Bereavement',  count: 118  },
        { slug: 'chronic-pain',       name: 'Chronic Pain',         count: 60   }
      ]
    },
    {
      slug: 'wellness', name: 'Health & Wellness', icon: WAVE_ICON, count: 1407,
      subs: [
        { slug: 'nature',           name: 'Nature',             count: 2995 },
        { slug: 'health',           name: 'Health',             count: 2627 },
        { slug: 'holistic',         name: 'Holistic',           count: 1382 },
        { slug: 'breathwork',       name: 'Breathwork',         count: 1295 },
        { slug: 'detox',            name: 'Detox',              count: 807  },
        { slug: 'art',              name: 'Art',                count: 687  },
        { slug: 'music',            name: 'Music',              count: 678  },
        { slug: 'massage',          name: 'Massage',            count: 670  },
        { slug: 'wellness',         name: 'Wellness',           count: 451  },
        { slug: 'dance',            name: 'Dance',              count: 387  },
        { slug: 'movement-fitness', name: 'Movement & Fitness', count: 167  },
        { slug: 'fasting',          name: 'Fasting',            count: 166  },
        { slug: 'mental-health',    name: 'Mental Health',      count: 156  },
        { slug: 'ayurveda',         name: 'Ayurveda',           count: 147  },
        { slug: 'writing',          name: 'Writing',            count: 129  },
        { slug: 'pilates',          name: 'Pilates',            count: 122  },
        { slug: 'qigong',           name: 'Qigong',             count: 105  },
        { slug: 'surf',             name: 'Surf',               count: 74   },
        { slug: 'nutrition',        name: 'Nutrition & Food',   count: 70   },
        { slug: 'weight-loss',      name: 'Weight Loss',        count: 39   },
        { slug: 'spa',              name: 'Spa',                count: 18   },
        { slug: 'death-grieving',   name: 'Death & Grieving',   count: 8    }
      ]
    },
    {
      slug: 'groups', name: 'Groups & Lifestyle', icon: PEOPLE_ICON, count: 1382,
      subs: [
        { slug: 'luxury',       name: 'Luxury',               count: 648 },
        { slug: 'online',       name: 'Online',               count: 577 },
        { slug: 'spiritual',    name: 'Spiritual',            count: 176 },
        { slug: 'affordable',   name: 'Affordable',           count: 93  },
        { slug: 'couples',      name: 'Marriage & Couples',   count: 79  },
        { slug: 'womens',       name: "Women's",              count: 79  },
        { slug: 'christian',    name: 'Christian',            count: 47  },
        { slug: 'leadership',   name: 'Leadership Training',  count: 24  },
        { slug: 'mens',         name: "Men's",                count: 19  },
        { slug: 'social-change',name: 'Social Change',        count: 19  },
        { slug: 'gay-men',      name: 'Gay Men',              count: 17  },
        { slug: 'tantric-sex',  name: 'Tantric Sex',          count: 14  },
        { slug: 'lgbtq',        name: 'LGBTQ+',               count: 10  },
        { slug: 'trans',        name: 'Trans',                count: 4   }
      ]
    }
  ];

  /* ── Training taxonomy (pillars + sub-categories) ─────── */
  const TRAINING_TAXONOMY = [
    {
      slug: 'yoga', name: 'Yoga', icon: FIGURE_ICON, count: 244,
      subs: [
        { slug: 'ytt-general',   name: 'Yoga Teacher Training (general)', count: 244 },
        { slug: '200-hour-ytt',  name: '200 Hour YTT',                    count: 138 },
        { slug: '300-hour-ytt',  name: '300 Hour YTT',                    count: 56  },
        { slug: '500-hour-ytt',  name: '500 Hour YTT',                    count: 28  },
        { slug: 'hatha-ytt',     name: 'Hatha YTT',                       count: 42  },
        { slug: 'vinyasa-ytt',   name: 'Vinyasa YTT',                     count: 19  },
        { slug: 'yin-ytt',       name: 'Yin & Restorative YTT',           count: 23  },
        { slug: 'kundalini-ytt', name: 'Kundalini YTT',                   count: 41  },
        { slug: 'ashtanga-ytt',  name: 'Ashtanga YTT',                    count: 5   },
        { slug: 'sivananda-ytt', name: 'Sivananda YTT',                   count: 21  },
        { slug: 'prenatal-ytt',  name: 'Prenatal Yoga TT',                count: 2   },
        { slug: 'kids-ytt',      name: 'Yoga for Kids TT',                count: 8   },
        { slug: 'yoga-nidra-tt', name: 'Yoga Nidra Training',             count: 11  }
      ]
    },
    {
      slug: 'meditation', name: 'Meditation', icon: CIRCLE_ICON, count: 58,
      subs: [
        { slug: 'meditation-tt', name: 'Meditation Teacher Training', count: 58 },
        { slug: 'mindfulness-tt',name: 'Mindfulness Teacher Training',count: 34 },
        { slug: 'mbsr',          name: 'MBSR Certification',          count: 12 },
        { slug: 'vipassana-tt',  name: 'Vipassana Training',          count: 9  },
        { slug: 'zen-tt',        name: 'Zen Teacher Training',        count: 5  },
        { slug: 'buddhist-tt',   name: 'Buddhist Teacher Training',   count: 11 },
        { slug: 'ifs-training',  name: 'IFS Training',                count: 9  }
      ]
    },
    {
      slug: 'healing', name: 'Healing & Somatic', icon: HEART_ICON, count: 67,
      subs: [
        { slug: 'somatic-experiencing', name: 'Somatic Experiencing',       count: 27 },
        { slug: 'trauma-informed',      name: 'Trauma-Informed Training',   count: 18 },
        { slug: 'hypnotherapy',         name: 'Hypnotherapy Training',      count: 14 },
        { slug: 'craniosacral',         name: 'Craniosacral Training',      count: 7  },
        { slug: 'reiki',                name: 'Reiki Training',             count: 22 }
      ]
    },
    {
      slug: 'bodywork', name: 'Bodywork & Wellness', icon: WAVE_ICON, count: 124,
      subs: [
        { slug: 'massage-therapy',  name: 'Massage Therapy Training',     count: 32 },
        { slug: 'thai-massage',     name: 'Thai Massage Training',        count: 18 },
        { slug: 'ayurveda',         name: 'Ayurveda Training',            count: 17 },
        { slug: 'aromatherapy',     name: 'Aromatherapy Certification',   count: 11 },
        { slug: 'herbalism',        name: 'Herbalism Course',             count: 9  },
        { slug: 'nutrition-coach',  name: 'Nutrition Coach Cert.',        count: 8  },
        { slug: 'pilates-tt',       name: 'Pilates Teacher Training',     count: 14 },
        { slug: 'qigong-training',  name: 'Qigong Training',              count: 6  }
      ]
    },
    {
      slug: 'ceremony', name: 'Ceremony & Facilitation', icon: BELL_ICON, count: 52,
      subs: [
        { slug: 'breathwork-facilitator', name: 'Breathwork Facilitator',       count: 19 },
        { slug: 'sound-healing-cert',     name: 'Sound Healing Certification',  count: 15 },
        { slug: 'tantra-tt',              name: 'Tantra Teacher Training',      count: 8  },
        { slug: 'cacao-facilitator',      name: 'Cacao Ceremony Facilitator',   count: 5  },
        { slug: 'shamanic-training',      name: 'Shamanic Training',            count: 7, sensitive: true }
      ]
    },
    {
      slug: 'coaching', name: 'Coaching & Leadership', icon: PEOPLE_ICON, count: 130,
      subs: [
        { slug: 'life-coach',     name: 'Life Coach Certification',       count: 34 },
        { slug: 'coaching-cert',  name: 'Coaching Certification',         count: 22 },
        { slug: 'holistic-coach', name: 'Holistic Coach Certification',   count: 12 },
        { slug: 'nlp-cert',       name: 'NLP Certification',              count: 9  },
        { slug: 'leadership',     name: 'Leadership Training',            count: 24 },
        { slug: 'doula',          name: 'Doula Training',                 count: 18 },
        { slug: 'facilitator',    name: 'Facilitator Training',           count: 11 }
      ]
    }
  ];

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
    const found = EVENT_CATEGORIES.find(c => c.slug === slug);
    return found ? found.label : slug.replace(/_/g, ' ');
  }
  function findByValue(arr, val, fields) {
    if (!arr) return null;
    const keys = fields || ['slug'];
    return arr.find(it => keys.some(k => it[k] === val)) || null;
  }

  /* ── Public API ──────────────────────────────────────── */
  window.Taxonomy = {
    EVENT_CATEGORIES,
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
    eventCategoryLabel
  };
})();
