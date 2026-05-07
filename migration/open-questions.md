# Open Questions

Entscheidungen, die vor / während der Migration getroffen werden müssen. Geordnet nach Impact.

---

## Hoher Impact — vor Start klären

### 1. Sprach-Set: 4 oder 6?

**Status quo:** Code unterstützt **`en`, `de`, `es`, `hi`** (4). CLAUDE.md sagt 6 (zusätzlich `fr`, `it`).

**Frage:** Sollen FR + IT bei der Migration **aktiviert** oder **gestrichen** werden?

**Implikationen:**
- 4 Sprachen → schmalere Sitemap, weniger Übersetzungs-Aufwand
- 6 Sprachen → größere Reichweite, aber mehr Wartung
- Hindi (`hi`) wird im Code aktiv geguarded — zeigt commitment zu Indien-Markt

---

### 2. Backend `Event.language` ins Sitemap-Projection ziehen?

**Status quo:**
- Backend hat `EVENT.LANGUAGE` Spalte
- `EventSitemapProjection` enthält das Feld **NICHT**
- Frontend re-detectet via `tinyld/light` aus `seoDescription` (300 Chars)

**Frage:** Backend-Field nutzen (deterministisch) oder beim Frontend-Detection bleiben?

**Empfehlung:** Backend-Field — eliminiert Inkonsistenz zwischen Sitemap-Detection und Detail-Page-Detection. Migration-Chance.

---

### 3. Profile-Language-Tracking nachrüsten?

**Status quo:** Profile haben **kein** `language` Feld in der DB. Sitemap listet alle Profile nur in EN.

**Frage:**
- Soll `Profile.language` Spalte ergänzt werden (Backend)?
- Wann detecten — Bei Save (sync) oder async batch?
- Was tun mit existierenden Profilen ohne Language?

**Empfehlung:** Ja, ergänzen. Auto-Detection bei Save aus Description (gleicher `tinyld`/Backend-AI-Pattern wie Event). Existing Profile als Migration-Job batch-detecten.

---

### 4. `<html lang>` auf Content-Language fixen?

**Status quo:** Wird auf UI-Sprache gesetzt — auch bei DE-Event mit EN-UI: `<html lang="en">`. Falsches SEO-Signal.

**Frage:** Bei Migration fixen?

**Empfehlung:** Ja — auf Event-Detail / Profile-Pages `<html lang={event.language}>`, sonst UI-Lang.

---

### 5. Welche Cross-Cutting Features fehlen wirklich?

Siehe `cross-cutting-features.md` "Bestätigt NICHT vorhanden". Vor Migration entscheiden welche Lumaya **wirklich** braucht:

| Feature | Brauchen? | Aufwand |
|---|---|---|
| **WebShare API** für `navigator.share` (Mobile-Share-Sheet) | ? | klein |
| **Skeleton-Loaders** statt nackter Spinner | ? | mittel |
| **Confirmation-Dialogs** (Delete-Event, etc.) | ? | klein |
| **File-Size-Validation** clientside (Bilder bis X MB) | ? | klein |
| **Currency/Number-Formatting** (`Intl.NumberFormat`) für Preise | ? | klein |
| **Pagination** statt nur Carousels | ? | mittel |
| **App-Version-Check / Update-Prompt** | ? | klein |
| **Push-Notifications** (FCM) für Event-Reminders | ? | groß |
| **Session-Timeout/Token-Refresh** auf 401 | ? | mittel |
| **Newsletter-Signup** (Brevo) | ? | klein |
| **OG-Image Dynamic Generation** für Event-Sharing | ? | mittel |

---

## Mittlerer Impact — während Migration entscheiden

### 6. Migration-Strategie: Big-Bang oder Inkrementell?

**Optionen:**
- **A) Inkrementell**: Einzelne Routes von Angular zu Next.js portieren via Reverse-Proxy
- **B) Parallel-Run**: Neue Routes auf neuer Domain (`v2.lumaya.co`), schrittweise canary
- **C) Big-Bang**: Komplette Neuversion, Cutover an einem Tag

**Tradeoffs:**
- A: Geringes Risiko, aber lange Migration, doppelte Wartung
- B: Klarer Cut, aber zwei Codebases parallel
- C: Schnell durch, aber Risiko

---

### 7. SSR-Timeout-Fallback — wie ohne Workers?

**Status quo:** Worker hat 10s SSR-Timeout, fällt auf CSR-Shell zurück.

**Frage:** Vercel hat keinen direkten Equivalent — was tun?
- Vercel Function-Timeout-Limit (60s default) — anders als Workers
- Streaming Server Components mit Suspense-Boundaries
- Loading-UI als Fallback statt Full-CSR-Shell

**Empfehlung:** Suspense + Streaming. Wenn ein Slot >n Sekunden braucht, zeigt Loading-UI; restliche Page rendert.

---

### 8. Edge-Geo-Daten via Vercel statt Cloudflare?

**Status quo:** `cf.latitude/longitude/city/country` als `window.__CF_GEO__` in HTML injected.

**Frage:** Vercel hat `x-vercel-ip-*` Header — direkt in Server Components verwenden?

**Empfehlung:** Ja, in Middleware lesen, via Cookie oder Request-Header an Server Components weitergeben.

---

### 9. Cache-Strategie für Authenticated Pages?

**Status quo:** Admin-Routes haben CDN-Cache disabled.

**Frage:**
- Per-User-Caching mit `Cache-Control: private`?
- Komplett dynamisch ohne Cache?
- Kombination: Public-Shell statisch, User-Slots dynamisch?

**Empfehlung:** Public-Shell statisch (mit `revalidate`), User-spezifische Daten via TanStack Query (Client) oder dynamic Server Components ohne Cache.

---

### 10. Backend-API: Bleibt v3 oder REST-Refactor?

**Status quo:** Java-Backend hat `/api/v3/events`, `/api/v1/profiles`, etc.

**Frage:** Bei Migration als Gelegenheit für API-Refactor nutzen oder 1:1 lassen?

**Empfehlung:** 1:1 lassen. Migration ist groß genug, API-Refactor separat.

---

## Niedriger Impact — kann später

### 11. `tinyld/light` durch andere Lib ersetzen?

Nur relevant falls Backend-Field-Lösung NICHT umgesetzt wird. Falls doch → Lib komplett raus.

### 12. Easter-Egg behalten?

Existiert. Ja oder Nein?

### 13. Hotjar weiter nutzen?

Aktuell `https://t.contentsquare.net/uxa/...` — Lazy on Interaction. Kosten/Nutzen prüfen.

### 14. Service Worker / PWA-Setup?

**Status quo:** Hashed-Asset-Cache via SW. Keine echte PWA (kein Manifest, kein Add-to-Home).

**Frage:** Bei Migration echtes PWA bauen oder weglassen?

### 15. ESLint-Config / Code-Style aus Angular übernehmen?

Wahrscheinlich nicht — Next.js hat eigene Defaults (Biome oder ESLint + Prettier).

---

## Bekannte Bugs zu fixen während Migration

1. **`<html lang>` Bug** — UI-Lang statt Content-Lang (siehe #4)
2. **Sitemap-Detection** — Frontend re-detectet, Backend-Field ignoriert (siehe #2)
3. **Profile fehlt Language** komplett (siehe #3)
4. **Browser-side Canonical** wird nicht aktualisiert auf Client-Navigation
5. **Translation-MissingHandler** returnt Key statt EN-Fallback — bewusst, aber bei IT/FR-Aktivierung evtl. anders entscheiden

---

## Vorzeitig getroffene Entscheidungen (zur Bestätigung)

| Decision | Begründung |
|---|---|
| **Drizzle ORM** statt Prisma | jOOQ-näher, bessere Serverless-Performance, PostGIS-friendly |
| **Drizzle Source-of-Truth** für Schema | Vermeidet Konflikte mit Liquibase |
| **Temporal** statt Luxon | Stable in 2026, eliminiert Date-Bugs by design |
| **Event-Timezone für Anzeige** (nie User-Browser-Zone) | Vermeidet Hydration-Mismatch + Bugs |
| **Google Cloud Storage** statt Vercel Blob | Existing Assets, Firebase Storage = GCS, günstiger |
| **next-intl** statt react-i18next | App-Router-aware, SSR-aware |
| **shadcn/ui** statt PrimeNG-Replacement | Modern, tweakable, Radix-A11y |
| **Java-Backend behalten** für MCP + Scheduled Jobs | Spring AI / LangChain4j / ShedLock — zu viel zum Reschreiben |

→ Falls eines davon doch nicht passt, hier widersprechen.
