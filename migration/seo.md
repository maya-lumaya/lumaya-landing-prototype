# SEO & Internationalization

Alle SEO- und Sprach-spezifischen Konzepte. Diese Liste ist kritisch — viele Lumaya-spezifische Optimierungen sind nicht offensichtlich, müssen aber 1:1 in Next.js übernommen werden.

---

## Route-Level i18n

### Hybrid Routing (Pflicht 1:1 zu übernehmen)

- **Englisch unprefixed** → `/about`, `/events/slug`
- **Andere Sprachen prefixed** → `/de/about`, `/es/events/slug`, `/hi/about`
- **`/en/*` → `/*`** als 301 Redirect (Legacy, vermutlich indexierte URLs)

### Aktuell unterstützte Sprachen

Im Code: **`en`, `de`, `es`, `hi`** (4)
CLAUDE.md erwähnt 6 (en, de, es, fr, hi, it) — aber `langGuard` lehnt `fr` und `it` als invalid ab.
→ siehe `open-questions.md`

### Routing-Behavior nach URL-Pattern

| Input URL | Behavior |
|---|---|
| `/foo` | `englishLangGuard` aktiviert EN, allow |
| `/de/foo` | `langGuard` aktiviert DE, allow |
| `/es/foo` | `langGuard` aktiviert ES, allow |
| `/hi/foo` | `langGuard` aktiviert HI, allow |
| `/en/foo` | **301 → `/foo`** |
| `/en` | **301 → `/`** |
| `/fr/foo` | Invalid, fällt durch (404) |
| `/foo/` (trailing slash) | **301 → `/foo`** |

### Untranslated Content Patterns (KRITISCH)

Diese Routes sind **NICHT übersetzt** — User-Content / CMS:

- `/blog`, `/blog/*` (Contentful)
- `/events/{slug}` (User-Generated)
- `/profiles/{slug}` (User-Generated)

**Verhalten auf diesen Routes:**
- ❌ **Keine hreflang-Tags** (würden Translated-Variants suggerieren, die nicht existieren)
- ✅ Canonical zeigt **immer auf unprefixed URL** (Lang-Prefix wird gestrippt) — z.B. `/de/events/foo` → canonical `https://lumaya.co/events/foo`
- Hintergrund: Crawler indexiert Content nur einmal, kein Duplicate

### Translated Content Patterns

Diese Routes sind **vollständig übersetzt** — UI-Content:

- `/`, `/about`, `/faq`, `/imprint`, `/privacy-policy`, `/terms-of-use`, `/terms-and-conditions`
- `/login`, `/signup`, `/landing`, `/media-kit`, `/support`, `/partner/*`
- `/events/search`, `/my-events`, `/blog` (Index-Seiten)
- **City-Routes**: `/{city}/events/trending`, `/{city}/events/category/{cat}` — City ist Location-Context, nicht Content-Variant

**Verhalten:**
- ✅ Volle hreflang-Matrix (alle 4 Sprachen + `x-default`)
- ✅ Canonical = aktuelle URL inkl. Prefix
- ✅ `Vary: Accept-Language` Header

### Worker-Bypass-Routes (komplett ohne Lang-Logik)

- `/sitemap.xml` (dynamisch generiert)
- `/robots.txt`
- `/go/events/{slug}` (Booking-URL-Cloak, siehe unten)
- `/l/*` (Short-Link-Proxy)

### MissingTranslationHandler

- Returnt **den Key** statt Warning (z.B. `EVENTS.TITLE` wenn unübersetzt)
- **Kein** Fallback auf EN — bewusst, damit fehlende Keys sichtbar sind

---

## Sprach-aware Sitemap (Thin-Content-Prävention)

Jedes User-Content-Item wird **nur in seiner echten Sprache** gelistet — verhindert Thin-Content-Strafen durch leere Variants.

### Per Entity Type

| Entity | Sitemap-Strategy | Aktuelle Detection-Source |
|---|---|---|
| **Events** | 1 Eintrag pro Event in detected language, kein hreflang | Frontend: `tinyld/light` über `seoDescription` (300 chars) |
| **Profile** | 1 Eintrag pro Profile, **immer EN** ⚠️ | Detection fehlt komplett |
| **Blog** | 1 Eintrag pro Post, **immer EN** | Contentful, keine Lang-Tags |
| **Static Pages** | Volle Matrix (4 Einträge × hreflang) | i18n-Files |

### Bekannte Issues (siehe open-questions.md)

1. **Backend hat `Event.language` Feld**, aber `EventSitemapProjection` enthält es nicht → Frontend re-detectet
2. **Profile haben kein `language` Feld** in der DB → Sitemap nur EN
3. **Blog**: Contentful Lang-Tagging fehlt

→ Migration-Chance: Beide Backend-Felder ergänzen, Frontend-Detection entfernen.

---

## Hreflang-Strategie

### Generation

```
Für jede Sprache in [en, de, es, hi]:
  EN:    <link rel="alternate" hreflang="en" href="https://lumaya.co{path}">
  Other: <link rel="alternate" hreflang="{lang}" href="https://lumaya.co/{lang}{path}">
x-default: immer auf EN-URL
```

### Suppression

Auf untranslated Patterns (siehe oben): **alle hreflang-Tags entfernt**.

---

## Canonical URLs

### Auf translated Pages
- Canonical = aktuelle URL inkl. Lang-Prefix
- Beispiel: `/de/faq` → canonical `https://lumaya.co/de/faq`

### Auf untranslated Pages (Events, Profiles, Blog)
- Canonical = URL ohne Lang-Prefix
- Beispiel: `/de/events/foo` → canonical `https://lumaya.co/events/foo`
- Begründung: Content ist gleich über alle Sprachen → eine kanonische URL

### Browser-Side
- Aktuell: Browser-Side-Updates fehlen, Canonical wird nur SSR-seitig gesetzt
- → Migration: Bei Client-Navigation Canonical aktualisieren

---

## HTML `<html lang>` Attribute

⚠️ **Aktueller Bug**: Wird auf **UI-Sprache** gesetzt, nicht auf Content-Sprache.
Auf Event-Details mit DE-Content + EN-UI: `<html lang="en">` — falsches SEO-Signal.

**In Migration fixen:**
- Event-Details / Profile: `<html lang="{event.language}">`
- Translated Pages: `<html lang="{ui-lang}">`

---

## JSON-LD Structured Data

Strategy-Pattern pro Page-Type, generiert server-side:

| Page-Type | Schema |
|---|---|
| Home | `Organization`, `Website` |
| Blog Index | `Blog`, `ItemList` |
| Blog Entry | `BlogPosting`, `Breadcrumb` |
| Event Detail | `Event`, `Breadcrumb` |
| Event List | `ItemList`, `CollectionPage` |
| Profile | `Person` / `Organization`, `Breadcrumb` |
| Profile Page | `ProfilePage` |

→ In Next.js per `generateMetadata()` und/oder Inline `<script type="application/ld+json">` in Server Components.

---

## Meta Tags

- **Title** (übersetzt mit `{{city}}` / `{{custom}}` Interpolation)
- **Description** (übersetzt, city-aware)
- **OG-Tags**: type, image, image:width, image:height, site_name
- **Twitter Cards**: card, title, description, image
- **Robots**: index/noindex pro Page

→ In Next.js: `generateMetadata()` + `viewport` API.

---

## Booking-URL-Cloaking (`/go/events/{slug}`)

**Zweck**: Externe Booking-URLs (Affiliate-Partner) sollen nicht von Google indiziert werden.

**Flow:**
1. User klickt "Book Now" → Link zeigt auf `/go/events/{slug}`
2. Worker fetcht `{apiRoot}/api/v3/events/{slug}/booking-url`
3. **302 Redirect** zur externen Booking-Seite
4. CDN-Cache: 5 Minuten (`s-maxage=300`)
5. Fallback bei API-Fehler: Redirect auf `/events/{slug}`

→ In Next.js: Route Handler `app/go/events/[slug]/route.ts` mit `redirect()`.

---

## Short-Link-Proxy (`/l/*`)

**Zweck**: Kurze, gebrandete URLs für WhatsApp/Email-Sharing.

**Flow:**
- `/l/abc123` → Worker proxied an `{apiRoot}/api/v1/short-link/abc123`
- Backend liefert 301/302 mit Ziel-URL

→ In Next.js: Route Handler oder Middleware.

---

## URL-Migration-Redirects (Worker-Level)

Worker-Logic in `src/worker.ts`, in dieser Reihenfolge:

1. **Trailing Slash strippen** (`/foo/` → `/foo`, 301)
2. **`/en/*` → `/*`** (301)
3. **Appointments collapsen**: `/{city}/events/{slug}/appointments/*` → `/events/{slug}` (301)
4. **City aus Event-URL strippen**: `/{city}/events/{slug}` → `/events/{slug}` (301), behält Lang-Prefix
5. **Legacy Path-Renames**: `/create-event-v1` → `/create-event`, etc.

Alle 301s preservieren den Lang-Prefix wenn vorhanden.

→ In Next.js: `next.config.js` `redirects()` für statische Patterns, `middleware.ts` für dynamische.

---

## Security Headers

Auf allen HTML-Responses:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (1y)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`

Auf User-Generated-Content (Markdown, Linkify-Pipe):
- External-Links bekommen `rel="nofollow ugc noopener"`

→ In Next.js: `next.config.js` `headers()`.

---

## Sitemap-Generation

- **Dynamisch** bei Request (24h CDN-Cache)
- Sources: Backend-API für Events/Profile, Contentful für Blog, Static-Config für Pages
- Workers-kompatibel (kein Node.js Filesystem)

→ In Next.js: `app/sitemap.ts` (Built-in API).

---

## Hero-Image-Preload (Performance + SEO/LCP)

Worker injected `<link rel="preload" as="image" fetchpriority="high">` ganz oben in `<head>` via HTMLRewriter — spart 800ms LCP gegenüber Angular-generierter Variante.

In Next.js:
- `next/image` mit `priority` Prop für Above-Fold-Bilder
- `<link rel="preload">` automatisch generiert
- Custom-Loader mit ImageKit-Transformationen

---

## SEO-Migration-Checkliste

- [ ] Hybrid Routing (EN unprefixed, others prefixed) via next-intl konfigurieren
- [ ] `/en/*` → `/*` Permanent Redirect in `next.config.js`
- [ ] Untranslated-Path-Logik in `generateMetadata()` (hreflang suppression + canonical strip)
- [ ] Sitemap mit per-Language-Strategie (Events nur in detected lang)
- [ ] **Backend**: `Event.language` zu `EventSitemapProjection` hinzufügen
- [ ] **Backend**: `Profile.language` Spalte ergänzen + Detection-Logic
- [ ] **Bug fixen**: `<html lang>` auf Content-Sprache bei Event/Profile Details
- [ ] Booking-URL-Cloak Route Handler
- [ ] Short-Link-Proxy Route Handler
- [ ] Legacy URL Redirects portieren
- [ ] JSON-LD pro Page-Type
- [ ] Hero-Image Critical Preload via `priority` Prop
- [ ] Hreflang-x-default auf EN
- [ ] MissingTranslationHandler-Pattern (Key returnen)
- [ ] Browser-side Canonical-Updates auf Client-Navigation
