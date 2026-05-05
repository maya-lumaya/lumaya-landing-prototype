/* ============================================================
 * search-pill.js — Viluma unified search pill
 *
 * Usage (pillar pages — mode locked):
 *   SearchPill.init({ mode: 'retreats', formEl: '#searchPill' });
 *
 * Usage (landing — all tabs):
 *   const pill = SearchPill.init({
 *     mode: 'all', formEl: '#searchPill',
 *     tabsEl: '#tabs', chipsEl: '#chips', urlPreviewEl: '#urlPreview'
 *   });
 *   const state = pill.state; // share with mobile modal
 * ============================================================ */
(function () {
  'use strict';

  /* ── Icons ── */
  const PIN_ICON    = '<svg viewBox="0 0 24 24"><path d="M12 22s-7-7.1-7-12a7 7 0 1 1 14 0c0 4.9-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  const CAL_ICON    = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  const STAR_ICON   = '<svg viewBox="0 0 24 24"><path d="M12 4l2.6 5.3 5.9.9-4.3 4.2 1 5.8-5.2-2.8L6.8 20l1-5.8L3.5 10.2l5.9-.9L12 4z"/></svg>';
  const SPROUT_ICON = '<svg viewBox="0 0 24 24"><path d="M12 22V9"/><path d="M12 9c0-4 3-6 7-6-1 4-3 6-7 6z"/><path d="M12 13c0-3-2-5-5-5 .5 3 2 5 5 5z"/></svg>';
  const TICKET_ICON = '<svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/><path d="M9 6v12"/></svg>';
  const SUN_ICON    = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';
  const CAP_ICON    = '<svg viewBox="0 0 24 24"><path d="M12 4l10 4.5L12 13 2 8.5 12 4z"/><path d="M6 11v5s2.5 2.5 6 2.5 6-2.5 6-2.5v-5"/></svg>';
  const CHEV_ICON   = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  const FIGURE_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="2"/><path d="M8 11c1-1.5 2.5-2 4-2s3 .5 4 2l-2 3v6M10 14l-2 6M14 14l1 3"/></svg>';
  const CIRCLE_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>';
  const LEAF_ICON   = '<svg viewBox="0 0 24 24"><path d="M20 4S13 4 9 8s-4 10 0 12c4-4 4-8 0-12"/><path d="M20 4c0 4-2 12-11 16"/></svg>';
  const HEART_ICON  = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 3.5c0 5.9-7 10.5-7 10.5z"/></svg>';
  const WAVE_ICON   = '<svg viewBox="0 0 24 24"><path d="M3 14c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M3 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/></svg>';
  const PEOPLE_ICON = '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 20a5 5 0 0 1 7 0"/></svg>';
  const HAND_ICON   = '<svg viewBox="0 0 24 24"><path d="M9 3v8l-2-1-2 2 4 7c1.5 2 4 3 7 3 4 0 6-3 6-7V7l-1-1h-1l-1 1v4m0-5V3l-1-1h-1l-1 1v8m0-6V2l-1-1h-1l-1 1v10"/></svg>';
  const BELL_ICON   = '<svg viewBox="0 0 24 24"><path d="M6 18h12l-2-3V9a4 4 0 0 0-8 0v6l-2 3z"/><path d="M10 21h4"/></svg>';

  /* ── Data — sourced from window.Taxonomy (taxonomy.js) ─── */
  if (!window.Taxonomy) {
    console.error("search-pill.js requires taxonomy.js to be loaded first.");
    return;
  }
  const T = window.Taxonomy;

  // SearchPill consumers (mobile modal in index.html, taxonomy dropdown
  // renderer below) expect { name }; Taxonomy event categories use { label }.
  const EVENT_CATEGORIES = {
    launch: T.EVENT_CATEGORIES.map(c => ({
      slug: c.slug.replace(/_/g, "-"),
      name: c.label,
      trending: c.trending || false
    }))
  };

  const RETREAT_TAXONOMY  = T.RETREAT_TAXONOMY;
  const TRAINING_TAXONOMY = T.TRAINING_TAXONOMY;

  const ALL_CATEGORIES = T.ALL_CATEGORIES.map(c => ({
    slug: c.slug, name: c.label, trending: c.trending || false
  }));


  const TAB_CONFIG = {
    all: {
      chipsLabel: "Popular",
      chips: [
        { label: "This weekend", date: "weekend" },
        { label: "Yoga",         cat: "yoga" },
        { label: "Meditation",   cat: "meditation" },
        { label: "Bali",         place: "bali" }
      ],
      fields: [
        { key: "where", label: "Where", placeholder: "Any destination or city", type: "place" },
        { key: "when",  label: "When",  placeholder: "Any dates",               type: "date" },
        { key: "cat",   label: "What",  placeholder: "Any category",            type: "category", catMode: "flat" }
      ]
    },
    events: {
      chipsLabel: "Popular",
      chips: [
        { label: "Tonight",      date: "tonight" },
        { label: "This weekend", date: "weekend" },
        { label: "Yoga",         cat: "yoga" },
        { label: "Sound healing",cat: "sound-healing" }
      ],
      fields: [
        { key: "where", label: "Where",    placeholder: "Berlin",       defaultValue: "Berlin",       type: "place",    defaultSlug: "berlin" },
        { key: "when",  label: "When",     placeholder: "Next 7 days",  defaultValue: "Next 7 days",  type: "date" },
        { key: "cat",   label: "Category", placeholder: "Any practice",                               type: "category", catMode: "flat" },
        { key: "time",  label: "Time",     placeholder: "Any time",                                   type: "time" }
      ]
    },
    retreats: {
      chipsLabel: "Trending",
      chips: [
        { label: "Yoga",          cat: "yoga/yoga-teacher-training" },
        { label: "Silent",        cat: "meditation/silent" },
        { label: "Women's",       cat: "groups/womens" },
        { label: "Ayurveda",      cat: "wellness/ayurveda" },
        { label: "I'm flexible",  date: "flexible" }
      ],
      fields: [
        { key: "cat",   label: "Practice",    placeholder: "Yoga, meditation, Ayurveda…", type: "category", catMode: "taxonomy", taxSource: "retreats" },
        { key: "where", label: "Destination", placeholder: "Anywhere",                    type: "place" },
        { key: "when",  label: "Dates",       placeholder: "Flexible", defaultValue: "Flexible", type: "date" },
        { key: "theme", label: "Length",      placeholder: "Any length",                 type: "length" }
      ]
    },
    trainings: {
      chipsLabel: "Filters",
      chips: [
        { label: "200 hour", cert: "200-hour" },
        { label: "300 hour", cert: "300-hour" },
        { label: "Yoga TTC", cat: "yoga/ytt-general" },
        { label: "Somatic",  cat: "healing/somatic-experiencing" }
      ],
      fields: [
        { key: "cat",   label: "Training", placeholder: "Choose a discipline",  type: "category", catMode: "taxonomy", taxSource: "trainings" },
        { key: "cert",  label: "Hours",    placeholder: "200 / 300 / 500 hr",   type: "cert" },
        { key: "where", label: "Where",    placeholder: "Anywhere",             type: "place" },
        { key: "when",  label: "Starts",   placeholder: "Next 6 months", defaultValue: "Next 6 months", type: "date" }
      ]
    }
  };

  const PLACE_SUGGESTIONS  = T.PLACE_SUGGESTIONS;
  const DATE_QUICK         = T.DATE_QUICK;
  const CERT_SUGGESTIONS   = T.CERT_SUGGESTIONS;
  const LENGTH_SUGGESTIONS = T.LENGTH_SUGGESTIONS;
  const TIME_SUGGESTIONS   = T.TIME_SUGGESTIONS;

  const ICONS_MAP = {
    place: PIN_ICON, date: CAL_ICON, category: SPROUT_ICON,
    cert: STAR_ICON, length: SUN_ICON, time: CAL_ICON
  };

  /* ── Address constants ── */
  const ADDR_HISTORY_KEY  = "lumaya-v3-where-history";
  const ADDR_HISTORY_MAX  = 3;
  const ADDR_AUTOCOMPLETE_URL = "https://api.lumaya.co/api/v1/places/autocomplete";

  /* ── Helpers ── */
  function slugify(s) {
    return (s || "")
      .toLowerCase().trim()
      .replace(/ö/g, "oe").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function domEl(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function fmt(n) { return n.toLocaleString("en-US"); }

  /* ── Address history ── */
  function addrHistoryRead() {
    try { return JSON.parse(localStorage.getItem(ADDR_HISTORY_KEY) || "[]"); }
    catch { return []; }
  }
  function addrHistoryWrite(arr) {
    try { localStorage.setItem(ADDR_HISTORY_KEY, JSON.stringify(arr.slice(0, ADDR_HISTORY_MAX))); }
    catch {}
  }
  function addrHistoryPrepend(item) {
    const cur = addrHistoryRead().filter(x => x.id !== item.id);
    addrHistoryWrite([item, ...cur]);
  }
  function addrHistoryRemove(id) {
    addrHistoryWrite(addrHistoryRead().filter(x => x.id !== id));
  }

  /* ── Address autocomplete ── */
  let addrSessionToken = null;
  function freshAddrSession() {
    addrSessionToken = "v3-" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
  async function fetchAddressSuggestions(query) {
    if (!query || query.trim().length < 2) return [];
    if (!addrSessionToken) freshAddrSession();
    try {
      const res = await fetch(ADDR_AUTOCOMPLETE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ searchString: query, sessionToken: addrSessionToken })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const arr = Array.isArray(data) ? data
                : (data.predictions || data.results || data.suggestions || data.items || []);
      return arr.map((p, i) => {
        const fullName = p.name || p.description || "";
        const parts = fullName.split(",");
        return {
          id:   p.placesId || p.placeId || p.place_id || p.id || ("ac-" + i + "-" + Date.now()),
          name: p.mainText || p.main_text
                || (p.structured_formatting && p.structured_formatting.main_text)
                || parts[0].trim() || fullName || "Unknown",
          sub:  p.secondaryText || p.secondary_text
                || (p.structured_formatting && p.structured_formatting.secondary_text)
                || parts.slice(1).join(",").trim() || ""
        };
      });
    } catch {
      const cap = query.charAt(0).toUpperCase() + query.slice(1);
      return [
        { id: "mock-" + query + "-1", name: cap + "er Allee 32", sub: "Berlin, Germany" },
        { id: "mock-" + query + "-2", name: cap + "straße 12",   sub: "Hamburg, Germany" },
        { id: "mock-" + query + "-3", name: cap + " Platz",      sub: "München, Germany" }
      ];
    }
  }

  /* ── URL routing ── */
  function searchResultsUrlFor(tab) {
    if (tab === "retreats")  return "retreats-search-results.html";
    if (tab === "trainings") return "trainings-search-results.html";
    return "events-search-results.html";
  }

  /* ── Resolve element from string selector or DOM ref ── */
  function resolveEl(ref) {
    if (!ref) return null;
    if (typeof ref === "string") return document.querySelector(ref);
    return ref;
  }

  /* ============================================================
   * init() — create a pill instance
   * ============================================================ */
  function init(opts) {
    const mode       = opts.mode || "all";
    const pillEl     = resolveEl(opts.formEl);
    const chipsEl    = resolveEl(opts.chipsEl)    || null;
    const urlPreEl   = resolveEl(opts.urlPreviewEl) || null;
    const tabsEl     = resolveEl(opts.tabsEl)     || null;

    if (!pillEl) { console.warn("SearchPill.init: formEl not found"); return null; }

    const state = {
      tab:          mode !== "all" ? mode : "all",
      where:        "", whereSlug: "",
      whereRadiusKm: 10,
      when:         "",
      cat:          "", catSlug: "", catPath: "",
      cert:         "", certSlug: "",
      theme:        "",
      time:         ""
    };

    let activeField    = null;
    let addrFetchTimer = null;
    let addrFetchSeq   = 0;

    /* ── Render ── */
    function renderFields() {
      const cfg = TAB_CONFIG[state.tab];
      pillEl.innerHTML = "";

      cfg.fields.forEach(f => {
        const wrap = document.createElement("div");
        wrap.className = "field";
        wrap.dataset.key = f.key;
        wrap.innerHTML = `
          <label>${f.label}</label>
          <div class="value placeholder">${f.placeholder}</div>
          <div class="dropdown" role="listbox"></div>
        `;
        wrap.addEventListener("click", (e) => openField(wrap, f, e));
        pillEl.appendChild(wrap);

        const stateVal = state[f.key];
        if (stateVal) {
          setFieldValue(wrap, stateVal);
        } else if (f.defaultValue) {
          setFieldValue(wrap, f.defaultValue);
          state[f.key] = f.defaultValue;
          if (f.key === "where" && f.defaultSlug) state.whereSlug = f.defaultSlug;
        }
      });

      const submitWrap = document.createElement("div");
      submitWrap.className = "submit-wrap";
      submitWrap.innerHTML = `
        <button class="submit" type="submit" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
          <span class="submit-label">Search</span>
        </button>
      `;
      pillEl.appendChild(submitWrap);

      if (chipsEl) renderChips();
      updateUrlPreview();
    }

    function renderChips() {
      if (!chipsEl) return;
      const cfg = TAB_CONFIG[state.tab];
      chipsEl.innerHTML = "";
      const lbl = document.createElement("span");
      lbl.className = "chips-label";
      lbl.textContent = cfg.chipsLabel;
      chipsEl.appendChild(lbl);
      cfg.chips.forEach(c => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.textContent = c.label;
        b.addEventListener("click", () => applyChip(c, b));
        chipsEl.appendChild(b);
      });
    }

    function setFieldValue(fieldEl, value) {
      const v = fieldEl.querySelector(".value");
      v.textContent = value;
      v.classList.remove("placeholder");
    }

    /* ── Dropdowns ── */
    document.addEventListener("click", (e) => {
      if (activeField && !activeField.contains(e.target) && !pillEl.contains(e.target)) {
        activeField.classList.remove("active");
        activeField = null;
      }
    });

    function openField(fieldEl, f, e) {
      e.stopPropagation();
      if (activeField === fieldEl) return;
      if (activeField) activeField.classList.remove("active");
      activeField = fieldEl;
      fieldEl.classList.add("active");

      const dd = fieldEl.querySelector(".dropdown");
      dd.innerHTML = "";
      dd.classList.remove("wide", "taxonomy");

      if      (f.type === "place")    renderPlaceDropdown(dd, fieldEl, f);
      else if (f.type === "date")     renderListDropdown(dd, fieldEl, f, DATE_QUICK[state.tab] || DATE_QUICK.all, "Pick a time window");
      else if (f.type === "category") {
        if (f.catMode === "taxonomy") renderTaxonomyDropdown(dd, fieldEl, f);
        else                          renderFlatCategoryDropdown(dd, fieldEl, f);
      }
      else if (f.type === "cert")     renderListDropdown(dd, fieldEl, f, CERT_SUGGESTIONS, "Training hours");
      else if (f.type === "length")   renderListDropdown(dd, fieldEl, f, LENGTH_SUGGESTIONS, "Retreat length");
      else if (f.type === "time")     renderListDropdown(dd, fieldEl, f, TIME_SUGGESTIONS, "Time of day");
    }

    function closeActive() {
      if (activeField) activeField.classList.remove("active");
      activeField = null;
    }

    /* ── Place dropdown ── */
    function renderPlaceDropdown(dd, fieldEl, f) {
      if (state.tab === "events") {
        const inputWrap = domEl(`
          <div class="dd-addr-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input class="dd-addr-input" type="text" placeholder="Search city or address…" autocomplete="off" />
          </div>
        `);
        dd.appendChild(inputWrap);

        const nearMe = domEl(`
          <div class="dd-item" role="option">
            <div class="name">
              <span class="marker" style="background:#FEF1E2;color:#D97706;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg></span>
              <span>Near me <span class="kind"> · use my location</span></span>
            </div>
          </div>
        `);
        nearMe.addEventListener("click", (ev) => {
          ev.stopPropagation();
          state.where = "Near me"; state.whereSlug = "near-me";
          setFieldValue(fieldEl, "Near me");
          closeActive(); updateUrlPreview();
        });
        dd.appendChild(nearMe);

        const history = addrHistoryRead();
        let historySection = null;
        if (history.length) {
          historySection = document.createElement("div");
          historySection.appendChild(domEl(`<div class="dd-title">Recent addresses</div>`));
          history.forEach(item => {
            const row = domEl(`
              <div class="dd-item" role="option">
                <div class="name">
                  <span class="marker" style="background:#F1EAD9;color:#7A6027;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg></span>
                  <span>${item.name}<span class="kind">${item.sub ? ' · ' + item.sub.split(',')[0] : ''}${item.radiusKm ? ' · ' + item.radiusKm + ' km' : ''}</span></span>
                </div>
                <button class="dd-remove" type="button" aria-label="Remove from history">
                  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18 18 6"/></svg>
                </button>
              </div>
            `);
            row.addEventListener("click", (ev) => {
              ev.stopPropagation();
              const label = item.name + (item.sub ? ", " + item.sub.split(",")[0] : "");
              state.where = label; state.whereSlug = slugify(item.name);
              setFieldValue(fieldEl, label);
              closeActive(); updateUrlPreview();
            });
            row.querySelector(".dd-remove").addEventListener("click", (e) => {
              e.stopPropagation();
              addrHistoryRemove(item.id);
              row.remove();
              if (!historySection.querySelector(".dd-item")) historySection.remove();
            });
            historySection.appendChild(row);
          });
          dd.appendChild(historySection);
        }

        const suggestTitle = domEl(`<div class="dd-title">Suggested places</div>`);
        dd.appendChild(suggestTitle);

        const citySuggestions = document.createElement("div");
        PLACE_SUGGESTIONS.forEach(p => {
          const item = domEl(`
            <div class="dd-item" role="option">
              <div class="name">
                <span class="marker">${PIN_ICON}</span>
                <span>${p.name}<span class="kind"> · ${p.kind}</span></span>
              </div>
              <span class="meta">${p.counts}</span>
            </div>
          `);
          item.addEventListener("click", (ev) => {
            ev.stopPropagation();
            state.where = p.name; state.whereSlug = p.slug;
            setFieldValue(fieldEl, p.name);
            closeActive(); updateUrlPreview();
          });
          citySuggestions.appendChild(item);
        });
        dd.appendChild(citySuggestions);

        const addrResults = document.createElement("div");
        dd.appendChild(addrResults);

        const input = inputWrap.querySelector(".dd-addr-input");
        input.addEventListener("input", () => {
          const query = input.value.trim();
          if (!query) {
            addrResults.innerHTML = "";
            suggestTitle.textContent = "Suggested places";
            citySuggestions.style.display = "";
            if (historySection) historySection.style.display = "";
            return;
          }
          suggestTitle.textContent = "Address results";
          citySuggestions.style.display = "none";
          if (historySection) historySection.style.display = "none";
          clearTimeout(addrFetchTimer);
          addrFetchTimer = setTimeout(async () => {
            const seq = ++addrFetchSeq;
            addrResults.innerHTML = `<div class="dd-title" style="color:var(--text-subtle)">Searching…</div>`;
            const results = await fetchAddressSuggestions(query);
            if (seq !== addrFetchSeq) return;
            addrResults.innerHTML = "";
            if (!results.length) {
              addrResults.appendChild(domEl(`<div class="dd-item" style="color:var(--text-subtle);">No results found</div>`));
              return;
            }
            results.forEach(r => {
              const item = domEl(`
                <div class="dd-item" role="option">
                  <div class="name">
                    <span class="marker">${PIN_ICON}</span>
                    <span>${r.name}<span class="kind"> · ${r.sub}</span></span>
                  </div>
                </div>
              `);
              item.addEventListener("click", (ev) => {
                ev.stopPropagation();
                const label = r.name + (r.sub ? ", " + r.sub.split(",")[0] : "");
                state.where = label; state.whereSlug = slugify(r.name);
                setFieldValue(fieldEl, label);
                closeActive(); updateUrlPreview();
                addrHistoryPrepend(r);
              });
              addrResults.appendChild(item);
            });
          }, 280);
        });
        input.addEventListener("click", ev => ev.stopPropagation());
        setTimeout(() => input.focus(), 20);
        return;
      }

      // Non-events: destination suggestions
      dd.appendChild(domEl(`<div class="dd-title">Suggested places · with availability</div>`));
      PLACE_SUGGESTIONS.forEach(p => {
        const item = domEl(`
          <div class="dd-item" role="option">
            <div class="name">
              <span class="marker">${PIN_ICON}</span>
              <span>${p.name}<span class="kind"> · ${p.kind}</span></span>
            </div>
            <span class="meta">${p.counts}</span>
          </div>
        `);
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          state.where = p.name; state.whereSlug = p.slug;
          setFieldValue(fieldEl, p.name);
          closeActive(); updateUrlPreview();
        });
        dd.appendChild(item);
      });
    }

    /* ── Flat category dropdown ── */
    function renderFlatCategoryDropdown(dd, fieldEl, f) {
      dd.classList.add("wide");
      const source = state.tab === "events" ? EVENT_CATEGORIES.launch : ALL_CATEGORIES;
      const title  = state.tab === "events" ? "Event categories" : "Categories across the marketplace";
      dd.appendChild(domEl(`<div class="dd-title">${title}</div>`));
      const grid = domEl(`<div class="dd-grid"></div>`);
      dd.appendChild(grid);
      source.forEach(c => {
        const item = domEl(`
          <div class="dd-item" role="option">
            <div class="name">
              <span class="marker">${SPROUT_ICON}</span>
              <span>${c.name}</span>
            </div>
            ${c.trending ? '<span class="trending">Trending</span>' : ''}
          </div>
        `);
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          state.cat = c.name; state.catSlug = c.slug; state.catPath = c.slug;
          setFieldValue(fieldEl, c.name);
          closeActive(); updateUrlPreview();
        });
        grid.appendChild(item);
      });
    }

    /* ── Taxonomy dropdown (two-panel) ── */
    function renderTaxonomyDropdown(dd, fieldEl, f) {
      dd.classList.add("taxonomy");
      const taxonomy = f.taxSource === "retreats" ? RETREAT_TAXONOMY : TRAINING_TAXONOMY;
      const kind     = f.taxSource === "retreats" ? "retreats" : "trainings";

      const pillars = domEl(`<div class="tax-pillars" role="tablist"></div>`);
      const panel   = domEl(`<div class="tax-panel"></div>`);
      dd.appendChild(pillars);
      dd.appendChild(panel);

      function showPanel(pillar) {
        panel.innerHTML = `
          <div class="tax-panel-head">
            <h4>${pillar.name}${pillar.sensitive ? '<span class="sensitive-note">pending review</span>' : ''}</h4>
            <span class="tax-panel-hint">${fmt(pillar.count)} ${kind} · ${pillar.subs.length} subcategories</span>
          </div>
          <div class="tax-subs-grid">
            ${pillar.subs.map(s => `
              <div class="tax-sub ${s.sensitive ? 'sensitive' : ''}" data-pillar="${pillar.slug}" data-slug="${s.slug}" role="option">
                <span class="sub-name">${s.name}</span>
                <span class="sub-count">${fmt(s.count)}</span>
              </div>
            `).join("")}
          </div>
        `;
        panel.querySelectorAll(".tax-sub").forEach(n => {
          n.addEventListener("click", (ev) => selectSub(ev, pillar, n.dataset.slug));
        });
      }

      function selectSub(ev, pillar, subSlug) {
        ev.stopPropagation();
        const sub = pillar.subs.find(s => s.slug === subSlug);
        if (!sub) return;
        const display = `${pillar.name} · ${sub.name}`;
        const path    = `${pillar.slug}/${sub.slug}`;
        state.cat = display; state.catSlug = sub.slug; state.catPath = path;
        setFieldValue(fieldEl, display);
        closeActive(); updateUrlPreview();
      }

      taxonomy.forEach((pillar, idx) => {
        const item = domEl(`
          <div class="tax-item ${idx === 0 ? 'active' : ''}" data-slug="${pillar.slug}">
            <button type="button" class="tax-head" role="tab" aria-selected="${idx === 0}">
              <span class="tax-icon">${pillar.icon}</span>
              <span class="tax-meta">
                <span class="tax-name">${pillar.name}${pillar.sensitive ? ' <span style="font-size:10px;color:var(--orange-700);letter-spacing:0.08em;text-transform:uppercase;font-weight:700;background:var(--orange-50);border:1px solid var(--orange-100);padding:1px 5px;border-radius:4px;margin-left:4px;">review</span>' : ''}</span>
                <span class="tax-count">${fmt(pillar.count)} ${kind} · ${pillar.subs.length} types</span>
              </span>
              <span class="tax-chev">${CHEV_ICON}</span>
            </button>
            <div class="tax-subs-inline">
              ${pillar.subs.map(s => `
                <div class="tax-sub ${s.sensitive ? 'sensitive' : ''}" data-pillar="${pillar.slug}" data-slug="${s.slug}">
                  <span class="sub-name">${s.name}</span>
                  <span class="sub-count">${fmt(s.count)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `);

        const head = item.querySelector(".tax-head");
        head.addEventListener("mouseenter", () => {
          if (window.matchMedia("(min-width: 861px)").matches) {
            pillars.querySelectorAll(".tax-item").forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            showPanel(pillar);
          }
        });
        head.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const isMobile = !window.matchMedia("(min-width: 861px)").matches;
          if (isMobile) {
            const wasOpen = item.classList.contains("open");
            pillars.querySelectorAll(".tax-item").forEach(n => n.classList.remove("open", "active"));
            if (!wasOpen) item.classList.add("open", "active");
          } else {
            pillars.querySelectorAll(".tax-item").forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            showPanel(pillar);
          }
        });

        item.querySelectorAll(".tax-subs-inline .tax-sub").forEach(n => {
          n.addEventListener("click", (ev) => selectSub(ev, pillar, n.dataset.slug));
        });

        pillars.appendChild(item);
      });

      showPanel(taxonomy[0]);
    }

    /* ── List dropdown ── */
    function renderListDropdown(dd, fieldEl, f, items, titleText) {
      dd.appendChild(domEl(`<div class="dd-title">${titleText}</div>`));
      items.forEach(label => {
        const item = domEl(`
          <div class="dd-item" role="option">
            <div class="name">
              <span class="marker">${ICONS_MAP[f.type] || STAR_ICON}</span>
              <span>${label}</span>
            </div>
          </div>
        `);
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          state[f.key] = label;
          if (f.key === "cert") state.certSlug = slugify(label);
          setFieldValue(fieldEl, label);
          closeActive(); updateUrlPreview();
        });
        dd.appendChild(item);
      });
    }

    /* ── Chips ── */
    function applyChip(c, btn) {
      if (chipsEl) chipsEl.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");

      if (c.date) {
        state.when = c.label;
        const whenField = pillEl.querySelector('[data-key="when"]');
        if (whenField) setFieldValue(whenField, c.label);
      }
      if (c.cat) {
        if (c.cat.includes("/")) {
          const [pillarSlug, subSlug] = c.cat.split("/");
          const taxonomy = state.tab === "retreats" ? RETREAT_TAXONOMY
                         : state.tab === "trainings" ? TRAINING_TAXONOMY
                         : RETREAT_TAXONOMY;
          const pillar = taxonomy.find(p => p.slug === pillarSlug);
          const sub    = pillar?.subs.find(s => s.slug === subSlug);
          if (pillar && sub) {
            state.cat = `${pillar.name} · ${sub.name}`;
            state.catSlug = sub.slug;
            state.catPath = c.cat;
          }
        } else {
          state.cat = c.label; state.catSlug = c.cat; state.catPath = c.cat;
        }
        const catField = pillEl.querySelector('[data-key="cat"]');
        if (catField) setFieldValue(catField, state.cat);
      }
      if (c.place) {
        const found = PLACE_SUGGESTIONS.find(p => p.slug === c.place);
        if (found) {
          state.where = found.name; state.whereSlug = found.slug;
          const whereField = pillEl.querySelector('[data-key="where"]');
          if (whereField) setFieldValue(whereField, found.name);
        }
      }
      if (c.cert) {
        state.cert = c.label; state.certSlug = c.cert;
        const certField = pillEl.querySelector('[data-key="cert"]');
        if (certField) setFieldValue(certField, c.label);
      }
      updateUrlPreview();
    }

    /* ── URL builder ── */
    function buildUrl() {
      const parts   = [];
      const where   = state.whereSlug;
      const catPath = state.catPath;
      const cert    = state.certSlug || (state.cert ? slugify(state.cert) : "");

      if (state.tab === "all") {
        if (where) parts.push(where);
        else if (catPath) parts.push(catPath);
      } else if (state.tab === "events") {
        if (where) parts.push(where);
        parts.push("events");
        if (catPath) parts.push(catPath);
      } else if (state.tab === "retreats") {
        if (where) parts.push(where);
        parts.push("retreats");
        if (catPath) parts.push(catPath);
      } else if (state.tab === "trainings") {
        if (where) parts.push(where);
        parts.push("trainings");
        if (catPath) parts.push(catPath);
        if (cert) parts.push(cert);
      }
      return "/" + parts.filter(Boolean).join("/") + (parts.length ? "/" : "");
    }

    function updateUrlPreview() {
      if (urlPreEl) urlPreEl.textContent = buildUrl();
    }

    /* ── Wire ── */
    pillEl.addEventListener("submit", (e) => {
      e.preventDefault();
      if (window.Haptics) window.Haptics.fire("success");
      const p = new URLSearchParams();
      if (state.whereSlug && state.whereSlug !== "near-me") p.set("areaId", state.whereSlug);
      if (state.catSlug) p.set("categoryId", state.catSlug.replace(/-/g, "_"));
      location.href = searchResultsUrlFor(state.tab) + (p.toString() ? "?" + p.toString() : "");
    });

    if (tabsEl) {
      tabsEl.addEventListener("click", (e) => {
        const tab = e.target.closest("[data-tab]");
        if (!tab) return;
        const newTab = tab.dataset.tab;
        if (newTab === state.tab) return;
        tabsEl.querySelectorAll("[data-tab]").forEach(t => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        state.tab = newTab;
        if (newTab !== "trainings") { state.cert = ""; state.certSlug = ""; }
        if (newTab !== "events")    { state.time = ""; }
        if (newTab !== "retreats")  { state.theme = ""; }
        state.when = "";
        state.cat = ""; state.catSlug = ""; state.catPath = "";
        renderFields();
      });
    }

    renderFields();

    return { state, renderFields, updateUrlPreview };
  }

  /* ── Public API ── */
  window.SearchPill = {
    init,
    slugify,
    domEl,
    fmt,
    searchResultsUrlFor,
    addrHistoryRead,
    addrHistoryPrepend,
    addrHistoryRemove,
    fetchAddressSuggestions,
    /* Data — used by index.html's mobile modal and renderCatsPillars */
    EVENT_CATEGORIES,
    RETREAT_TAXONOMY,
    TRAINING_TAXONOMY,
    ALL_CATEGORIES,
    TAB_CONFIG,
    PLACE_SUGGESTIONS,
    DATE_QUICK,
    CERT_SUGGESTIONS,
    LENGTH_SUGGESTIONS,
    TIME_SUGGESTIONS,
    /* Icons — used by renderCatsPillars in index.html */
    TICKET_ICON, SUN_ICON, CAP_ICON, FIGURE_ICON, CIRCLE_ICON,
    LEAF_ICON, HEART_ICON, WAVE_ICON, PEOPLE_ICON, HAND_ICON, BELL_ICON,
    CHEV_ICON, PIN_ICON, SPROUT_ICON, CAL_ICON, STAR_ICON,
  };
})();
