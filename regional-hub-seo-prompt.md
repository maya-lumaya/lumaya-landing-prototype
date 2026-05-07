# Regional Hub SEO Section — Generation Prompt

This is the spec for generating the deep SEO section that sits **below "Meet the Hosts" and above the footer** on each regional hub page (e.g. `berlin.html`, future `munich.html`, `lisbon.html`, etc.).

The section's job:
1. **Prevent thin content** — every regional page needs substance unique to that city, or Google will treat them as duplicates of one boilerplate template.
2. **Win navigational searches** for `{practice} {city}` combinations (meditation Berlin, sound healing Munich, ecstatic dance Lisbon …).
3. **Capture commercial intent** for retreats, festivals, and weekend immersions.

The reference implementation is in `berlin.html` — read its `.seo-deep` block for structural and tonal precedent before generating a new city.

---

## The prompt (copy/paste into a fresh conversation)

```
You are writing the deep SEO section for the {CITY} regional hub page on Lumaya — a curated platform for conscious events.

================================================================
CONTEXT
================================================================
- This section sits below "Meet the Hosts of {CITY}" and above the footer.
- Many city hub pages share the same template — your job is to make THIS city's section impossible to mistake for any other.
- The page already has a short SEO blurb above the events grid; the deep section is the SEO heavy lift.
- Reference implementation: read the existing `.seo-deep` block in `berlin.html` for structure and voice.

================================================================
INPUTS — READ THESE FIRST
================================================================
1. Keyword research: ../stack/frontend/docs/seo-research/{city-slug}-*.json
   Each file: { city, category, keywords[], en: { headline, body }, de, es }.
   Read all categories — yoga, meditation, breathwork, sound_healing,
   cacao_ceremony, conscious_dance, kirtan, tantra, temple_night,
   embodiment, retreat, festival, circle, ceremony, conscious_party,
   ice_bath, energy_healing, conscious_touch, mystical_arts,
   family_constellation, other.
2. Existing page: lumaya-landing-prototype/{city-slug}.html
   Match the structure of berlin.html exactly.
3. If a Berlin equivalent exists already, READ IT — your job is to
   produce something parallel, not identical.

================================================================
INTENT ORDER (CRITICAL)
================================================================
1. NAVIGATIONAL FIRST — capture "{practice} {city}" searches by giving
   each major practice category a substantive mention with the city
   name attached.
2. COMMERCIAL SECOND — close with retreat / festival / workshop
   language and a direct CTA + internal link.

================================================================
HTML STRUCTURE (output exactly this skeleton, filled in)
================================================================
<!-- ── SEO deep ── -->
<section class="seo-deep">
  <div class="seo-deep-inner">
    <h2>Conscious Events in {CITY} — Meditation, Dance, Sound and More</h2>
    <p>
      {LEAD PARAGRAPH — 90–120 words. Orientation: what makes
       {CITY}'s scene specific (cultural anchor, history, character),
       which neighborhoods it lives in, language mix.}
    </p>

    <h3>Practices and Lineages You'll Find in {CITY}</h3>
    <p>
      {130–170 words. Walk through each major practice with
       (a) the city name attached and (b) at least one named
       lineage / modality / tradition for the practice. Cover:
       meditation, breathwork, sound healing, ecstatic / conscious
       dance, tantra, cacao ceremony, kirtan, embodiment,
       temple nights, circles, ceremonies, conscious parties,
       ice baths, energy healing, conscious touch, mystical arts,
       family constellations. Bold the strongest navigational
       keyword in each segment.}
    </p>

    <h3>Neighborhoods, Venues, and the Wider Region</h3>
    <p>
      {100–140 words. Name 4+ specific districts of the city plus
       the broader region (lakes, forests, coast, mountains)
       within ~90 minutes. Avoid named venues that may close;
       use venue archetypes (warehouses, studios, lofts, halls).}
    </p>

    <h3>{CITY} Retreats and Conscious Festivals</h3>
    <p>
      {110–140 words. Commercial intent. Cover urban day retreats,
       weekend retreats near {CITY} (name the regions/landscapes),
       and conscious festivals (warehouse, lakeside, outdoor —
       whatever fits the city's geography). End with a tactile
       detail that signals scale ("small enough that you'll meet
       the host on arrival" or similar).}
    </p>

    <p>
      {35–55 word closing CTA. Reference the events calendar above and
       Lumaya's curation of hosts. Do NOT add any external link — the
       prototype IS Lumaya, so a link to lumaya.co would be self-
       referential. Keep the closing text-only.}
    </p>
  </div>
</section>

================================================================
CITY-SPECIFICITY CHECKLIST (every box must be true)
================================================================
[ ] Names ≥ 4 specific neighborhoods or districts of the city.
[ ] References ≥ 1 cultural / historical anchor unique to the city
    (e.g. Berlin's post-Wall counter-culture, Lisbon's Atlantic-
    facing alternative scene, Munich's Bavarian-alpine spirituality,
    London's diaspora plurality). Generic "vibrant" or "rich" copy
    fails this check.
[ ] Names ≥ 2 natural features within the wider region used for
    retreats (specific lakes, forests, coast, mountain ranges).
[ ] Names ≥ 3 specific lineages or modalities (e.g. Vipassana,
    5Rhythms, Soul Motion, neo-tantra, MBSR, holotropic, Continuum).
[ ] Mentions the city's language mix, expat scene, or international
    vs. local character if relevant (be honest — don't invent).
[ ] SWAP TEST: paste the section, replace the city name with another
    plausible city, re-read. If 2+ paragraphs still make sense,
    you've failed. Rewrite until only the H2 still works.

================================================================
KEYWORD COVERAGE (pull from the JSON files)
================================================================
For each practice category in docs/seo-research/{city}-*.json,
the JSON includes a `keywords[]` array — these are the actual
terms with search volume. Aim to cover the top keyword from each:
  - {city} meditation
  - {city} breathwork
  - {city} sound healing / sound bath
  - {city} ecstatic dance / conscious dance
  - {city} cacao ceremony
  - {city} kirtan
  - {city} tantra (if scene exists)
  - {city} temple night (if scene exists)
  - {city} women's circle / men's circle / sharing circle
  - {city} moon ceremony / fire ceremony
  - {city} conscious party / sober rave / morning rave
  - {city} ice bath / cold plunge / Wim Hof
  - {city} energy healing / reiki / kundalini activation
  - {city} contact improv / cuddle party / conscious touch
  - {city} human design / astrology / tarot
  - {city} family constellation / systemic constellation
  - {city} retreat / wellness retreat / yoga retreat near {city}
  - conscious festival {city}
Bold 3–5 of these per major paragraph. NEVER bold every keyword —
that signals stuffing. Bold only the strongest navigational anchor
in each clause.

================================================================
VOICE
================================================================
- Editorial, calm, knowledgeable. Lonely-Planet-meets-the-best-yoga-
  studio-newsletter you've ever read.
- No marketing fluff: ban "amazing", "incredible", "best", "premier",
  "your journey awaits".
- No AI-list smell: ban "immerse yourself in", "embark on a journey",
  "rich tapestry", "vibrant community", "diverse offerings".
- The reader should learn something about the city's scene they
  didn't already know. Every sentence earns its place.
- Confident curation, plain language, real practice. Match the
  voice in berlin.html's .seo-deep block.

================================================================
WHAT TO AVOID
================================================================
- Generic phrases that work for any city.
- Made-up or named-too-specifically venues — only use district
  names, neighborhood names, and well-known geographic features
  (rivers, lakes, mountain ranges, coastlines).
- Made-up specific teachers, schools, or named festivals.
- Date-stamped language that goes stale ("this spring", "next
  summer", "currently", "right now").
- Keyword stuffing — if a keyword doesn't fit naturally, drop it.
- Copy-pasting structure from another city's section without
  rethinking what's actually true here.

================================================================
OUTPUT
================================================================
Output ONLY the <section class="seo-deep">…</section> HTML block,
ready to paste between the </section> of "Meet the Hosts" and the
<!-- ── Footer ── --> comment. No commentary, no explanation, no
preamble. The receiving developer will paste it in directly.
```

---

## QA checklist for the human reviewer

After the agent generates the section, run this before merging:

1. **Swap test** — replace the city name globally; does any paragraph still hold? If yes, rewrite that paragraph.
2. **Word count** — total 480–620 words. Below 480 = thin; above 620 = bloated.
3. **Keyword density** — bolded `<strong>` count between 12 and 22 across the section. Outside that range = either under-targeted or stuffed.
4. **No outbound brand links** — the prototype IS Lumaya, so the section must not link out to `lumaya.co` or any other Lumaya-owned domain. The only acceptable links are `<a>` tags pointing at on-page anchors, and even those should be rare.
5. **Heading structure** — H2 once, H3 three times. No H4+.
6. **Mobile sanity** — the existing `.seo-deep` responsive rules already handle mobile; no inline styles needed.
7. **Lineage check** — every modality mentioned (Vipassana, 5Rhythms, MBSR, etc.) actually has a presence in that city. If unsure, drop it rather than invent.
8. **Date-free** — search the section for "this", "next", "currently", "now"; remove anything that pegs to a moment in time.

---

## Where the keyword research lives

Keyword research JSON files for every supported city + practice combination live at:

```
../stack/frontend/docs/seo-research/{city-slug}-{category}.json
```

Categories: `breathwork`, `cacao_ceremony`, `ceremony`, `circle`, `conscious_dance`, `conscious_party`, `conscious_touch`, `embodiment`, `energy_healing`, `family_constellation`, `festival`, `ice_bath`, `kirtan`, `meditation`, `mystical_arts`, `other`, `retreat`, `sound_healing`, `tantra`, `temple_night`, `yoga`.

Schema:

```json
{
  "city": "Berlin",
  "category": "meditation",
  "keywords": ["meditation Berlin", "meditation classes Berlin", ...],
  "en": { "headline": "...", "body": "..." },
  "de": { "headline": "...", "body": "..." },
  "es": { "headline": "...", "body": "..." }
}
```

The English `body` paragraphs are short (1 paragraph each, ~50 words) — they're the seed material for the deep SEO section. The keyword arrays give you the navigational terms to weave in.
