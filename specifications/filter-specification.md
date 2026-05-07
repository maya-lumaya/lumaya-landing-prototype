# Filter Specification

Authoritative spec for filters across the three search pillars (events, retreats, trainings) on the Lumaya prototype.

This document covers:
- The conceptual split: **category tree** vs **filter facets**
- Per-pillar time/duration semantics (deliberately different)
- Existing filters in `search-pill.js` and the search-results pages
- New filters to introduce, with priority
- Mapping for the dissolved "Groups & Lifestyle" pillar
- Implementation notes

---

## 1. Conceptual model

Two orthogonal axes drive search:

| Axis | Purpose | Lives in | Examples |
|---|---|---|---|
| **Category tree** | "What is it about?" — the practice/topic | `categories.json` (pillar → sub) | Yoga, Plant Medicine, Ecstatic Dance |
| **Filter facets** | "Who / when / where / how?" | `taxonomy.js` constants + filter UI | Audience, Format, Price, Language, Date |

Anything that describes a property of the listing rather than its topic belongs in **filters**, not in the category tree. This is the same split BookRetreats / retreat.guru / Tripaneer use.

---

## 2. Per-pillar time model (do not unify)

Time semantics differ across pillars and **must stay differentiated**. The current `taxonomy.js` already encodes this correctly — keep it.

| Pillar | Mental model | Date control values | Duration control |
|---|---|---|---|
| **events** | Near-term, calendar-anchored | Tonight · Tomorrow · This weekend · This week · Pick dates | + Time-of-day (morning · midday · afternoon · evening) |
| **retreats** | Season-anchored, flexibility-tolerant | Flexible · Spring · Summer · Autumn · Winter · Pick dates | Length: Weekend (2–3) · Short (4–7) · Week+ (8–14) · Deep (2+ wks) |
| **trainings** | Forward-planning, multi-month | Next 3 months · Next 6 months · Autumn 2026 · 2027 · Pick start month | Cert hours (50/100/200/300/500+) + Format (intensive/modular/online) |

### 2.1 Why the time controls differ — search behaviour

The three pillars represent **three fundamentally different user intents**. Date semantics must mirror those intents or the controls feel wrong.

**Events — "What's on tonight near me?"**
- *Search behaviour*: impulsive, near-term, location-anchored. Closest analogue: searching for a concert, restaurant, or gym class.
- *Decision horizon*: hours to ~2 weeks. Beyond that, the user usually doesn't care yet.
- *Date precision*: high. The user often knows exactly which evening or weekend they're free.
- *Time-of-day matters*: a morning yoga class and an evening sound bath are different products to the same user. This is the only pillar where time-of-day is a primary filter.
- *Duration*: usually 1–4 hours; rarely the deciding factor. Users filter by "evening" not by "3 hours."
- *Implication*: control = calendar-style presets (Tonight / Tomorrow / Weekend) + a time-of-day chip group. No season picker.

**Retreats — "Where can I disappear to this summer?"**
- *Search behaviour*: aspirational, destination-driven, often started before dates are fixed. Closest analogue: searching for a vacation on Booking.com or Airbnb.
- *Decision horizon*: 1–9 months out. Most retreats are booked weeks-to-months ahead because they require flights, accommodation, and time off.
- *Date precision*: low at the start of the search. The user typically knows the *season* and roughly how long, not exact dates. "I want a yoga retreat in Bali this autumn" precedes "I'm free Oct 12–19."
- *Length matters more than start date*: annual-leave allowance is the hard constraint. A user with 1 week off filters out 14-day deep retreats regardless of when they start.
- *Time-of-day is meaningless*: retreats are full-immersion, multi-day.
- *Implication*: control = season presets + flexibility option ("I'm flexible") + length buckets. Calendar precision is opt-in, not default.

**Trainings — "When can I commit to a 4-month certification?"**
- *Search behaviour*: planned, committed, financially significant. Closest analogue: enrolling in a part-time course or bootcamp.
- *Decision horizon*: 3–18 months out. Cohorts often run quarterly or annually, so users plan around the *next viable cohort*, not a specific date.
- *Date precision*: anchored to **start month**, not exact dates. The relevant question is "which cohort am I joining?", not "which day does it begin?".
- *Total duration is a major filter*: 200-hour vs 500-hour, modular vs intensive — these change life logistics. Cert hours is the dominant constraint, more than calendar.
- *Format matters*: intensive (block release), modular (weekends over months), online — fundamentally changes whether the training fits the user's life.
- *Time-of-day is meaningless*: by definition trainings span days/weeks.
- *Implication*: control = forward-month windows (Next 3 / Next 6 / specific season-year) + format + cert hours. The "when" question is really "which cohort window?"

### 2.2 Why a single unified date picker would fail

A naive "Date" filter shared across all three pillars would force a single mental model where there are three. Concrete failure modes:

| Picker style | Works for | Breaks for |
|---|---|---|
| Single calendar with day-precision | events | retreats (most users don't have exact dates yet); trainings (cohorts span weeks) |
| Date-range picker | retreats with fixed dates | events (overkill — picking a single Friday evening doesn't need a range); trainings (range maps awkwardly to cohort start) |
| Month picker | trainings | events (too coarse — "March" is meaningless when looking for "tonight"); retreats (collapses the season concept) |

The pillar-specific controls each pick the *correct precision* for the matching intent. Keeping them separate is not duplication — it's modelling three real workflows.

---

## 3. Filter inventory per pillar

Status legend: ✅ implemented in search pill · 🟡 defined in `taxonomy.js` but not exposed · 🆕 new

### 3.1 Events

| Filter | Status | Values | Source key |
|---|---|---|---|
| Where | ✅ | City + radius (incl. "Near me") | `state.where` / `state.whereSlug` |
| When | ✅ | `EVENT_DATE_PRESETS` + custom range | `state.when` |
| Time of day | ✅ | `TIME_OF_DAY` (morning · midday · afternoon · evening) | `state.time` |
| Category | ✅ | `EVENT_TAXONOMY` (pillar/sub) | `state.cat`/`catSlug`/`catPath` |
| Format | 🆕 | In-person · Online (live) · Hybrid | new |
| Audience | 🆕 | Women's · Men's · Mixed · Couples · LGBTQ+ · Beginners-welcome | new |
| Language | 🆕 | EN · DE · NL · FR · ES (multi-select) | new |
| Price | 🆕 | Free · Donation · €€ · €€€ | new |
| Duration | 🆕 | < 2h · Half-day · Full-day · Multi-day | new |

### 3.2 Retreats

| Filter | Status | Values | Source key |
|---|---|---|---|
| Practice (category) | ✅ | `RETREAT_TAXONOMY` (pillar/sub) | `state.cat` |
| Destination | ✅ | Country/region + city | `state.where` |
| When | ✅ | `RETREAT_SEASONS` + custom range | `state.when` |
| Length | ✅ | `RETREAT_LENGTHS` | `state.theme` |
| Format | 🟡 | In-person · Online · Hybrid (currently trainings-only) | promote constant |
| Audience | 🆕 | Women's · Men's · Couples · Solo · LGBTQ+ · Christian · Beginners | new |
| Language | 🆕 | EN · DE · NL · FR · ES (multi-select) | new |
| Price | 🆕 | Range slider + tier (Affordable · Mid · Luxury) | new |
| Skill level | 🆕 | Beginner · Intermediate · Advanced · All levels | new |
| Setting | 🆕 | Nature · Mountain · Forest · Beach · Jungle · Lake · Urban | new |
| Accommodation | 🆕 | Private · Shared · Camping · Off-site | new |
| Diet | 🆕 | Vegetarian · Vegan · Raw · Organic · Gluten-free · Alcohol-free | new |
| Features | 🆕 | Meals included · Free cancellation · Airport pickup | new |

### 3.3 Trainings

| Filter | Status | Values | Source key |
|---|---|---|---|
| Discipline (category) | ✅ | `TRAINING_TAXONOMY` (pillar/sub) | `state.cat` |
| Cert hours | ✅ | `TRAINING_HOURS` (50 · 100 · 200 · 300 · 500+) | `state.cert` |
| Where | ✅ | Country/region | `state.where` |
| Starts | ✅ | `TRAINING_STARTS` | `state.when` |
| Format | 🟡 | `TRAINING_FORMATS` (intensive · modular · online) | already defined, expose as filter |
| Total length | 🆕 | < 1 wk · 1–2 wks · 1 month · Multi-month | new |
| Language | 🆕 | EN · DE · NL · FR · ES | new |
| Price | 🆕 | Range slider + tier | new |
| Audience | 🆕 | Women's · Men's · LGBTQ+ | new |
| Certifying body | 🆕 | Yoga Alliance · IAYT · self-issued · … | new |
| Accommodation included | 🆕 | Yes · No | new |
| Features | 🆕 | Certification awarded · Meals included · Free cancellation | new |

---

## 4. Cross-pillar shared facets

These four are introduced as universal filters with consistent UI across all three pillars:

1. **Format** — In-person · Online · Hybrid
2. **Audience** — multi-select identity/group filter
3. **Language** — multi-select instruction language
4. **Price** — tier shortcuts + numeric range slider

Implementation: define each as a constant in `taxonomy.js` (e.g., `FORMAT_OPTIONS`, `AUDIENCE_OPTIONS`, `LANGUAGE_OPTIONS`, `PRICE_TIERS`), with per-pillar override allowed via the existing `TAB_CONFIG` shape.

---

## 5. Mapping for the dissolved "Groups & Lifestyle" pillar

The Retreats → Groups & Lifestyle pillar conflated audience, format, price, and a few real categories. Resolved as follows:

| Old sub-category | Destination |
|---|---|
| `luxury`, `affordable` | **Price** filter |
| `online` | **Format** filter |
| `womens`, `mens`, `couples`, `gay-men`, `lgbtq`, `trans`, `christian` | **Audience** filter |
| `spiritual` | drop (every Lumaya retreat is spiritual — no signal) |
| `leadership` | already exists in **Trainings → Coaching & Leadership** |
| `social-change` | move to **Retreats → Healing & Recovery** or drop |
| `tantric-sex` | move to existing tantra/sexuality categories under Plant Medicine / Workshops, or drop |

After this migration, the Retreats pillar tree contains 5 clean topical pillars: **Yoga · Meditation · Plant Medicine · Healing & Recovery · Health & Wellness**.

---

## 6. Priority and rollout

**Phase 1 — Cleanup (no UI work):**
- Delete `Groups & Lifestyle` from `categories.json` per §5
- Investigate and fix the Health & Wellness count duplication bug (sub-category counts exceed parent)

**Phase 2 — High-signal universal filters:**
1. Format
2. Audience
3. Language
4. Price

**Phase 3 — Retreat-specific filters:**
5. Setting
6. Accommodation
7. Diet
8. Skill level

**Phase 4 — Long tail (only if user demand):**
- Age group
- Features (meals included, airport pickup, free cancellation)
- Certifying body (trainings)

---

## 7. UI implementation notes

- The current `pillpicker.js` is built for category trees (flat / tree / accordion). It does **not** handle range sliders or multi-select chip groups.
- Build a separate component — proposed `filter-panel.js` — that mounts on the search-results pages and reads filter state from a shared store.
- Existing filterbar in `events-search-results.html`, `retreats-search-results.html`, `trainings-search-results.html` uses pill-style chips for already-defined filters; extend that pattern for the new ones rather than introducing a sidebar.
- URL contract: each filter facet should map to a query param (e.g., `?audience=womens,couples&format=online&priceTier=mid`). Multi-select uses comma-joined slugs.
- Mobile: filters open in the same modal pattern as the mobile search pill, with a "Show N results" sticky CTA.

---

## 8. Out of scope for this spec

- Sort options (relevance, date, price, popularity)
- Saved searches / alerts
- Map view filters
- Operator-side filter analytics
