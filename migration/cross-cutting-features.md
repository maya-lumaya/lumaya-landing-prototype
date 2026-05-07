# Cross-Cutting Features

Komplette Inventur der Cross-Cutting Concerns aus der aktuellen Angular-App. Pro Feature: Was es macht. SEO/i18n-Themen sind separat in `seo.md`.

---

## Auth & Authorization

- **Firebase Auth (Lazy)** — Geladen on-interaction, nicht in SSR. Email/Password + Google OAuth
- **Auth-Guard** — Schützt Routes, redirected zu `/login?returnUrl=`
- **Has-No-Profile-Guard** — Zwingt zu Profile-Setup nach Signup
- **Role-Based UI** — `hasAnyRole`-Pipe, `*ifLoggedIn` / `*ifLoggedOut` Direktiven
- **Auth-Token-Service** — Token-Lifecycle, Refresh-Logic
- **Storage-Preload-Guard** — Firebase Storage init vor Event-Creation
- **Firebase Storage (Lazy)** — Browser-only, file uploads/downloads

→ Next.js: Firebase JS SDK direkt, Middleware für Auth-Guards, Server Actions für protected Mutations.

---

## Performance & Caching

- **CDN Cache Config** — Pattern-basierte `s-maxage`-Werte (Trending 1h, Static 12h, Hashed Chunks 3d, Fonts 1y)
- **Vary by Accept-Language** — Pro Sprache eigener Cache-Eintrag
- **Edge Cache (Cloudflare Workers Cache API)** — SSR-Responses gecached, `X-Cache: HIT|MISS` Header
- **SSR Timeout Fallback** — Nach 10s SSR-Hang → CSR Shell ausgeliefert
- **Transfer Cache Slimming** — HTTP-Responses entschlackt vor Serialization in HTML (650KB → 400KB)
- **Hero-Image-Preload-Injection** — Frühes `<link rel="preload">` ganz oben im `<head>` via HTMLRewriter (spart 800ms LCP)
- **PrimeNG-Style-Stripping** — Non-critical Component-Styles entfernt aus SSR-HTML (~73KB), re-inject auf Client
- **Service Worker** — Hashed JS/CSS gecached, übersteht Deploys
- **Lazy Loading** — Route-Level (`loadComponent`), Library-Level (Firebase/Analytics on interaction), Template-Level (`@defer`)
- **Hash-basierte Asset-Namen** — Immutable Long-TTL Cache, automatisches Bust bei Deploy
- **Translation-File-Versioning** — i18n JSON mit `?v={hash}` Cache-Bust

→ Next.js: Vercel Cache + ISR + `next/image` priority + Component-Streaming. Hero-Preload via `priority` Prop.

---

## Bilder & Media

- **ImageKit Custom Loader** — `?tr=f-auto,q-80,w-{width}` Transformationen
- **NgOptimizedImage** — Responsive srcset, lazy loading
- **Hero-Image Critical Preload** — Top-of-head Injection
- **Image Slider/Gallery** — Swipeable Event-Bilder mit Keyboard-Nav
- **Resumable Firebase Storage Upload** — `uploadBytesResumable` mit Progress-Events, Network-Recovery

→ Next.js: `next/image` + ImageKit Custom Loader, `@imagekit/react` `IKUpload`.

---

## Forms & Validierung

- **Custom Validators** — WhatsApp, Instagram, Telegram-Handles, Email
- **Form-Error-Service** — i18n-aware Error-Messages, Field-spezifische Fallbacks
- **Reactive Forms** überall

→ Next.js: react-hook-form + zod, Custom-Validators als Zod-Refinements.

---

## Recurrence & Calendar

- **RRULE-Serialization** — `rrule-options-serialize.util.ts`, iCalendar-Format
- **Recurrence-Utils** — Parse, Validate, Format
- **Timezone-aware Date/Time-Pipes** — `timezone-date.pipe.ts`, `timezone-time.pipe.ts`

→ Next.js: `rrule` Library + Temporal für Time-Handling. Wrapper-Functions ersetzen Pipes.

---

## Error Tracking & Logging

- **Sentry** — DSN, ErrorHandler-Override, TraceService, Release-ID = Build-Timestamp
- **Sentry Session Replay** — 10% normal, 100% bei Error
- **Body Sanitization** — Passwords/Tokens/Emails/Adressen redacted vor Sentry
- **Performance-Interceptor** — API-Calls >500ms warn, >1.5s error, mit UUID-Tracking
- **Sentry Sourcemap Upload** — Post-Build automatisch
- **Global Error Dialog** — User-friendly Messages auf HTTP-Errors

→ Next.js: `@sentry/nextjs` (auto-instrumentiert), Server Components + API Routes covered.

---

## Analytics & Tracking

- **Firebase Analytics (GA4)** — Lazy-loaded on-interaction
- **Hotjar** — Lazy-loaded on-interaction
- **Route-Change-Events** — Auto-tracked auf NavigationEnd
- **Param-Sanitization** — Max 100 Char/Value, 1000 Char Object-Cap
- **User-Interaction-Detection** — Erstes Scroll/Touch/Mouse/Key triggert Script-Loads (Cookie-Consent-aware)

→ Next.js: `next/script` mit `strategy="lazyOnload"`, Hook für Route-Change-Events via `usePathname`.

---

## Compliance & Consent

- **Silktide Cookie-Consent-Manager** — extern geladen on browser-init, gated Analytics/Tracking-Loading

→ Bleibt 1:1: Silktide-Script im Root-Layout, Analytics/Hotjar erst nach Consent laden.

---

## Storage & State-Persistierung

- **Storage-Service** — localStorage/sessionStorage-Abstraktion mit Quota-Handling, Private-Mode-Fallback (in-memory Maps)
- **Draft-Service** — Event/Profile Drafts in localStorage, Image-Strip bei Quota-Exceeded
- **City-Selection** — In localStorage persistiert, Root-Redirect auf gespeicherte City
- **Language-Preference** — localStorage (`userLang`) + sessionStorage (`lang`)
- **Navigation-History** — Für Back-Button-Logik

→ Next.js: Zustand mit `persist` Middleware, oder simpel `localStorage` direkt (im `useEffect`).

---

## Geolocation & Location

- **Cloudflare-Geo-Injection** — `cf.latitude/longitude/city/country` als `window.__CF_GEO__` in SSR-HTML (kein Client-API-Call)
- **Browser-Geolocation-Fallback** — 10s Timeout, low accuracy
- **City-Guard** — Validiert City gegen `constants.json` Locations
- **Reset-Location-Guard** — Resettet City auf Default beim Verlassen von Event-Pages
- **Location-Service** — Current-City Signal, von SeoService konsumiert

→ Next.js: Vercel Edge Geo-Headers (`x-vercel-ip-country`, etc.) ersetzen `cf.*`. Middleware für City-Validation.

---

## Routing & URL-Management (Lang-Prefix-Themen → seo.md)

- **City-Guard** — Validiert `:city` Parameter
- **Reset-Location-Guard** — Resettet bei Page-Wechsel
- **Route-Resolvers** — SSR Pre-Fetching für Event/Profile/Blog
- **Lazy-Loaded Routes** — `loadComponent` Pattern

→ Next.js: Server Components mit `params` Validation, `notFound()` für invalid Cities.

---

## Security Headers (→ seo.md)

- HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options
- External-Link-Marking auf User-Content (`rel="nofollow ugc noopener"`)
- DomSanitizer-Bypass nur via expliziter Safe-Pipe

---

## SSR & Edge-Logic (alles in `worker.ts`)

Aktuell auf Cloudflare Workers — bei Migration auf Vercel:

| Worker-Feature | Vercel-Pendant |
|---|---|
| Angular SSR Rendering | Next.js App Router (Server Components) |
| Geo-Injection | Vercel Edge Geo-Headers in Middleware |
| Hero-Preload-Injection | `next/image` `priority` Prop |
| Style-Stripping | Streaming + automatic CSS-Splitting |
| Security-Headers | `next.config.js` `headers()` |
| URL-Normalisierung | `next.config.js` `redirects()` + Middleware |
| Booking-URL-Proxy | Route Handler `app/go/events/[slug]/route.ts` |
| Short-Link-Proxy | Route Handler `app/l/[code]/route.ts` |
| Sitemap-Generation | `app/sitemap.ts` (Built-in) |
| Cache-Lookup/Write | Vercel CDN + `revalidate` + `revalidateTag` |
| SSR Timeout Fallback | Vercel hat keinen direkten Equivalent — andere Lösung nötig |

---

## UX-Features

- **PrimeNG Toast (MessageService)** — global Success/Error/Info Notifications
- **NPS-Survey** — Trigger nach >5 Events, 1x pro User, Scroll-aware
- **Support-Chat** — Backend-API mit Route-Context (Event-Slug, Profile-URL)
- **Mobile-Detection (UA-based)** — Responsive UI-Variants
- **Markdown-Rendering** — `marked` mit Custom-Link-Renderer (External-Link-Marking)
- **Linkify-Pipe** — URLs in Text → klickbare Links mit Security-Attributen
- **Language-Suggestion-Banner** — Browser-Locale-Vorschlag mit Dismiss
- **Maintenance-Notice Page** — Dedizierte Seite für Wartungsmodus
- **Easter-Egg Service** — Versteckter Trigger via Keyboard-Sequenz
- **Event Review FAB** — Floating Action Button für Reviews

→ Next.js: shadcn/ui Toast (Sonner), Custom Components für NPS/Support/Maintenance.

---

## Accessibility

- **Skip-Link** in `index.html` — Skip-to-Content für Keyboard
- **ARIA-Live-Regions** — Dynamic Menu-Loading-Announcements
- **Keyboard-Navigation** auf Carousels/Sliders (`@HostListener('keydown')`)

→ Next.js: Radix UI (via shadcn) bringt vieles mit. React Aria für Custom-A11y.

---

## Admin-Only

- **Instagram Content Package Export** — ZIP-Generator für Carousel-Posts
- **Admin Events Table** mit OverlayPanel/Popover (Image Preview)
- **No CDN Cache** auf Admin-Routes

→ Next.js: Server Actions für ZIP-Generation, shadcn/ui Popover.

---

## Utility-Funktionen (cross-cutting genutzt)

- **Copy-to-Clipboard** — Booking-URL teilen
- **Social-Media-Links Generator** — Plattform-spezifische URLs aus Username/Number
- **Google-Maps-Links Generator** — Maps-URL + Embed-URL aus PlaceID (keine full Maps-Library!)
- **External-Link Detection** — für Markdown-Renderer + Linkify

→ Next.js: Plain TS-Utility-Functions im `lib/` Folder.

---

## Build & Deploy

- **Angular CLI** mit SSR-Entry, Production-Optimizations
- **Sentry-Sourcemap-Upload** (Post-Build)
- **Build-Timestamp + Translation-Hash Generation** (Pre-Build)
- **Workers-Compat-Patching** (Post-Build, Node.js compat)
- **Wrangler Workers-Deploy** (compatibility_date, nodejs_compat)

→ Next.js: `next build`, Vercel Auto-Deploy. Sentry-Plugin im `next.config.js`. Build-Timestamp via `process.env.NEXT_PUBLIC_BUILD_ID`.

---

## Bestätigt NICHT in der aktuellen App

Bei Migration entscheiden ob neu bauen:

- ❌ FCM Push Notifications
- ❌ WebShare API (`navigator.share`) — nur direkte WhatsApp/Email-Links
- ❌ Online/Offline Detection
- ❌ Session-Timeout / Token-Refresh-Interceptor (401-Retry-Logik)
- ❌ Skeleton-Loaders (nur einfache Placeholder-CSS)
- ❌ App-Version-Check / Update-Prompt
- ❌ Backend-Health-Check Polling
- ❌ WebSocket / SSE / Real-Time-Updates
- ❌ Stripe / Payments / Subscriptions
- ❌ Brevo Newsletter-Signup (Frontend)
- ❌ A/B Testing / Feature Flags
- ❌ Onboarding-Tour / Coachmarks
- ❌ File-Size-Validation (frontend-side)
- ❌ RTL-Support
- ❌ Print-Stylesheets
- ❌ OG-Image Runtime-Generation
- ❌ Browser-Fingerprinting
- ❌ Confirmation-Dialogs (PrimeNG ConfirmationService)
- ❌ Voice-Input / Speech-API
- ❌ DM/Chat between Users (nur Support-Chat)
- ❌ Currency/Number Formatting (`Intl.NumberFormat`)
- ❌ Locale-spezifische Date-Pipes (nur Timezone)
- ❌ Pagination (Infinite-Scroll, Cursor) — nur Carousel-Client-Pagination

→ Welche davon Lumaya wirklich braucht, siehe `open-questions.md`.
