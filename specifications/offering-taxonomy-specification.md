# Offering Taxonomy Specification

Authoritative reference for Lumaya's three-pillar offering taxonomy: **Events**, **Retreats**, **Trainings**. This document mirrors `categories.json` and is the human-readable contract for category structure, naming, and counts.

Companion document: [filter-specification.md](./filter-specification.md) — covers filter facets (audience, price, format, etc.) which are *not* part of the taxonomy.

---

## 1. Source of truth

- **Data file:** `categories.json` at the project root
- **Loaded by:** `taxonomy.js` (exposes `window.Taxonomy.EVENT_TAXONOMY`, `RETREAT_TAXONOMY`, `TRAINING_TAXONOMY`)
- **Consumers:** search pill (`search-pill.js`), category model (`category-model.js`), category chips (`category-chips.js`), pillar pages, mobile search modal, search-results pages
- **Async contract:** all consumers must `await window.Taxonomy.ready` before reading the data
- **In production:** this shape is served by `GET /api/categories`

---

## 2. Structure

Two-level hierarchy:

```
Pillar (events | retreats | trainings)
└── Sub-pillar (e.g. "Workshops", "Yoga", "Plant Medicine")
    └── Sub-category (e.g. "Yoga", "Ecstatic Dance", "Ayahuasca")
```

Each sub-pillar object:
```
{ slug, name, icon, count, sensitive?, subs[] }
```

Each sub-category object:
```
{ slug, name, count, trending?, sensitive? }
```

**Flags:**
- `trending` — surfaced first in chip rows and "Popular" surfaces
- `sensitive` — flagged for review; rendered with a subdued style; gated by content policy

---

## 3. Naming and slug rules

- **Slugs:** lowercase, hyphenated, ASCII-only. No leading/trailing hyphens. (`yoga-teacher-training`, not `yoga_teacher_training`.)
- **Display names:** Title Case. Use ampersands sparingly (`Healing & Recovery`, `Equinox / Solstice`).
- **Slug uniqueness:** unique within a pillar. **Slugs MAY repeat across pillars** (e.g. `yoga` exists in events, retreats, and trainings) — the pillar slug provides the namespace.
- **Stability:** slugs are URL contracts. Renaming a slug requires a migration; renaming a display name does not.

---

## 4. Pillar definitions

### 4.1 Events — single-day or short-format gatherings

User intent: *"What's on tonight / this weekend?"* — discrete, near-term, locally-attended sessions.

| # | Sub-pillar | Slug | Icon | Subs | Count |
|---|---|---|---|---:|---:|
| 1 | Workshops | `workshops` | hand | 73 | 11,458 |
| 2 | Ceremonies | `ceremonies` | bell | 33 | 3,103 |
| 3 | Dance | `dance` | figure | 30 | 1,651 |
| 4 | Music | `music` | wave | 14 | 1,685 |
| 5 | Talks & Performances | `talks-performances` | people | 4 | 288 |

#### 4.1.1 Workshops (`workshops`)
Yoga · Meditation · Breathwork · Personal Development · Bodywork · Energy Work · Connection · Healing · Consciousness Development · Relaxation · Mindfulness · Health · Massage · Body Awareness · Embodiment · Trauma Release · Kundalini Activation · Qi Gong · Tai Chi · Acro Yoga · Ice Bath ⚡ · Shamanism ⚠️ · Reiki · Kundalini · Channeling · Human Design · Satsang · Taoism · Multidimensionality · Card Readings · Regression · Tantra · Conscious Sexuality ⚠️ · Authentic Relating · Nonviolent Communication · Cuddle Workshop · Shibari ⚠️ · Women's Circle · Women's Workshop · Men's Circle · Men's Workshop · Mixed Circle · Nature · Forest Bathing · Herbs · Hiking · Self-Sufficient Living · Creativity · Self-Expression · Intuitive Painting · Writing · Drum Making · Inner Child · Shadow Work · Self-Love · Intuition · Sensuality · Grief & Loss · Family Constellations · Systemic Work · Family System · Pregnancy · Parent-Child · Children's Workshop · Children's Yoga · Playfulness · Queer · HSP · Shiatsu · Ayurveda · Yoga Nidra · Kundalini Yoga · Personal Leadership

Trending: Yoga, Meditation, Ice Bath. Sensitive (gated): Shamanism, Conscious Sexuality, Shibari.

#### 4.1.2 Ceremonies (`ceremonies`)
Plant Medicine ⚠️ · Truffle Ceremony ⚠️ · Kambo ⚠️ · Blue Lotus ⚠️ · Rapeh ⚠️ · Inner Journey · Trance Journey · Sound Journey ⚡ · Soundbath ⚡ · Vision Quest · Cacao Ceremony ⚡ · Tea Ceremony · Breath Circle · Ritual · Sweatlodge · Fire Ceremony · Initiations · Rites of Passage · Despacho Ceremony · Firewalk · Glasswalk · Medicine Wheel · Medicine Walk · Water Ceremony · Soul Retrieval · Full Moon · New Moon · Equinox / Solstice · Celtic Year Festivals · Womb Healing · Rite of the Womb · Detox · Light Language

Trending: Sound Journey, Soundbath, Cacao Ceremony.

#### 4.1.3 Dance (`dance`)
Ecstatic Dance ⚡ · Conscious Dance · Free Dance · Ecstatic Rave · Conscious Clubbing ⚡ · Outdoor Dance · 5 Rhythms · Open Floor · Biodanza · Movement Medicine · Contact Improvisation · NIA · Somatic Dance · Embodiment Dance · Authentic Movement · Dance Meditation · Dance Improvisation · Dancing in Connection · Contact Beyond Contact · Tantric Dance · Sensual Dance · Shamanic Dance · Sacred Dance · Sufi Dance · Trance Dance · Ritual Dance · Intuitive Dance · Dance Workshop · Yin Dance · Children's Dance

Trending: Ecstatic Dance, Conscious Clubbing.

#### 4.1.4 Music (`music`)
Singing Bowls · Sound Journey · Sound Bath ⚡ · Music Therapy · Mantra Singing · Singing Circle · Voice Liberation · Voice Expression · Kirtan · Sanskrit Mantra Recitation · Live Music · Lying Concert · Handpan ⚡ · Drum Circle

Trending: Sound Bath, Handpan.

#### 4.1.5 Talks & Performances (`talks-performances`)
Lecture · Experiential Lectures · Storytelling · Presentation

---

### 4.2 Retreats — multi-day, destination-based immersions

User intent: *"Where can I go this season for a deep reset?"* — multi-day, often abroad, requiring travel and time off.

| # | Sub-pillar | Slug | Icon | Subs | Count |
|---|---|---|---|---:|---:|
| 1 | Yoga | `yoga` | figure | 17 | 1,116 |
| 2 | Meditation | `meditation` | circle | 8 | 453 |
| 3 | Plant Medicine ⚠️ | `plant-medicine` | leaf | 21 | 2,661 |
| 4 | Healing & Recovery | `healing` | heart | 11 | 3,872 |
| 5 | Health & Wellness | `wellness` | wave | 22 | 1,407 |
| 6 | Groups & Lifestyle 🚮 | `groups` | people | 14 | 1,382 |

🚮 **Groups & Lifestyle is scheduled for dissolution** — see §6.1.

#### 4.2.1 Yoga (`yoga`)
Yoga & Meditation · Yoga Teacher Training · Yoga (general) · Yoga for Beginners · Tantra Yoga · Hatha Yoga · Kundalini Yoga · Yoga for Kids · Yin & Restorative Yoga · Sivananda Yoga · Vinyasa Yoga · Yoga Nidra · Aerial & Acro Yoga · Ashtanga Yoga · Yoga for Seniors · Iyengar Yoga · Prenatal Yoga

#### 4.2.2 Meditation (`meditation`)
Dark · Meditation (general) · Silent · Mindfulness · Buddhist · IFS (Internal Family Systems) · Zen · Vipassana

#### 4.2.3 Plant Medicine (`plant-medicine`) — pillar marked sensitive
Ayahuasca ⚠️ · Psilocybin ⚠️ · Mushroom ⚠️ · Cacao · Dieta ⚠️ · Truffle ⚠️ · Microdosing ⚠️ · Iboga ⚠️ · Ibogaine ⚠️ · San Pedro Huachuma ⚠️ · Bufo ⚠️ · Shamanic ⚠️ · Kambo ⚠️ · Preparation & Integration · Peyote ⚠️ · Cannabis ⚠️ · MDMA ⚠️ · 5-MEO-DMT ⚠️ · LSD ⚠️ · Ketamine ⚠️ · DMT ⚠️

#### 4.2.4 Healing & Recovery (`healing`)
Emotional Healing · Trauma Healing · Stress Management · Somatic Therapy · Anxiety Relief · Depression Recovery · Addiction Recovery · PTSD Recovery · Burnout Recovery · Grief & Bereavement · Chronic Pain

#### 4.2.5 Health & Wellness (`wellness`) — ⚠️ has known data bug, see §6.2
Nature · Health · Holistic · Breathwork · Detox · Art · Music · Massage · Wellness · Dance · Movement & Fitness · Fasting · Mental Health · Ayurveda · Writing · Pilates · Qigong · Surf · Nutrition & Food · Weight Loss · Spa · Death & Grieving

#### 4.2.6 Groups & Lifestyle (`groups`) — 🚮 to dissolve
Luxury · Online · Spiritual · Affordable · Marriage & Couples · Women's · Christian · Leadership Training · Men's · Social Change · Gay Men · Tantric Sex · LGBTQ+ · Trans

This pillar conflates audience, format, price, and a few real categories. Dissolution plan in §6.1.

---

### 4.3 Trainings — certifying, multi-week / multi-month courses

User intent: *"Which cohort can I commit to next year?"* — formal qualifications, financial commitment, planned around life.

| # | Sub-pillar | Slug | Icon | Subs | Count |
|---|---|---|---|---:|---:|
| 1 | Yoga | `yoga` | figure | 13 | 244 |
| 2 | Meditation | `meditation` | circle | 7 | 58 |
| 3 | Healing & Somatic | `healing` | heart | 5 | 67 |
| 4 | Bodywork & Wellness | `bodywork` | wave | 8 | 124 |
| 5 | Ceremony & Facilitation | `ceremony` | bell | 5 | 52 |
| 6 | Coaching & Leadership | `coaching` | people | 7 | 130 |

#### 4.3.1 Yoga (`yoga`)
Yoga Teacher Training (general) · 200 Hour YTT · 300 Hour YTT · 500 Hour YTT · Hatha YTT · Vinyasa YTT · Yin & Restorative YTT · Kundalini YTT · Ashtanga YTT · Sivananda YTT · Prenatal Yoga TT · Yoga for Kids TT · Yoga Nidra Training

#### 4.3.2 Meditation (`meditation`)
Meditation Teacher Training · Mindfulness Teacher Training · MBSR Certification · Vipassana Training · Zen Teacher Training · Buddhist Teacher Training · IFS Training

#### 4.3.3 Healing & Somatic (`healing`)
Somatic Experiencing · Trauma-Informed Training · Hypnotherapy Training · Craniosacral Training · Reiki Training

#### 4.3.4 Bodywork & Wellness (`bodywork`)
Massage Therapy Training · Thai Massage Training · Ayurveda Training · Aromatherapy Certification · Herbalism Course · Nutrition Coach Cert. · Pilates Teacher Training · Qigong Training

#### 4.3.5 Ceremony & Facilitation (`ceremony`)
Breathwork Facilitator · Sound Healing Certification · Tantra Teacher Training · Cacao Ceremony Facilitator · Shamanic Training ⚠️

#### 4.3.6 Coaching & Leadership (`coaching`)
Life Coach Certification · Coaching Certification · Holistic Coach Certification · NLP Certification · Leadership Training · Doula Training · Facilitator Training

---

## 5. Cross-pillar overlaps (intentional)

The same slug can carry different meaning across pillars. This is by design — pillar context disambiguates.

| Slug | Events | Retreats | Trainings |
|---|---|---|---|
| `yoga` | Workshops sub-category (single-class) | Multi-day yoga retreat | Certifying YTT |
| `meditation` | Single-session workshop | Multi-day meditation retreat | Meditation TT |
| `healing` | not used | Healing & Recovery pillar | Healing & Somatic pillar |
| `breathwork` | Workshop sub-category | Wellness sub-category | (sub of "Ceremony & Facilitation" via `breathwork-facilitator`) |
| `ayurveda` | Workshop sub-category | Wellness sub-category | Bodywork sub-category |

**URL contract:** the pillar slug is always present, so collisions never produce ambiguous routes (`/events/yoga` vs `/retreats/yoga` vs `/trainings/yoga`).

---

## 6. Known issues and pending changes

### 6.1 Dissolve Retreats → Groups & Lifestyle

This pillar mixes audience, format, price, and a few real categories. Migration plan:

| Old sub | Goes to |
|---|---|
| `luxury`, `affordable` | **Price** filter (see filter-specification.md) |
| `online` | **Format** filter |
| `womens`, `mens`, `couples`, `gay-men`, `lgbtq`, `trans`, `christian` | **Audience** filter |
| `spiritual` | drop — every Lumaya retreat is spiritual; no signal |
| `leadership` | already exists at Trainings → Coaching & Leadership; drop here |
| `social-change` | move to Healing & Recovery, or drop (only 19 listings) |
| `tantric-sex` | move under existing tantra/sexuality categories, or drop |

After migration, Retreats has 5 clean topical pillars: Yoga · Meditation · Plant Medicine · Healing & Recovery · Health & Wellness.

### 6.2 Health & Wellness count bug

Sub-category counts in `wellness` exceed the parent pillar count and overlap with top-level pillars:
- Pillar count: 1,407
- Subs include `nature` (2,995), `health` (2,627), `holistic` (1,382), `breathwork` (1,295), `dance` (387), `music` (678), `art` (687)

These subs are either generic facets (Nature, Holistic, Health) or duplicates of other top-level concepts (Music, Dance, Breathwork). Likely root cause: counts derived from a different denominator (overall corpus rather than retreats only). To investigate before any UI work.

---

## 7. Editorial principles

When proposing new sub-categories, ask:

1. **Conscious frame** — does this fit "conscious events / growth / inner work"? If a category is generic recreation or commerce, it doesn't belong.
2. **Practice vs property** — is this a *what is it about* or a *who/when/where/how*? Properties go to filters.
3. **Distinct enough** — does it materially split listings? A sub with under ~10 listings probably belongs as a tag, not a sub-category.
4. **Search demand** — does anyone actually search for this term? Long-tail novelties without search volume create noise.
5. **Sensitive / legal** — does it require gating? Mark `sensitive: true` and confirm with the content policy.

---

## 8. Symbol legend

- ⚡ trending — surfaced in "Popular" / "Trending" rows
- ⚠️ sensitive — flagged for review, rendered with subdued style, may be gated
- 🚮 deprecated / scheduled for removal
