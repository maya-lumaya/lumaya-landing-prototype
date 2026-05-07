# Lumaya New Stack — Vercel/Next.js

## Core Frontend + API

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (kommt mit Radix UI)
- **Motion** (Animationen)
- **TanStack Query** (Server-State / Cache)
- **react-hook-form** + **zod** (Forms + Validierung)
- **Zustand** (nur wo Client-State wirklich nötig)

## Datenbank

- **PostgreSQL + PostGIS** (Neon — bleibt)
- **Drizzle ORM** (type-safe, SQL-nah, jOOQ-like)
- **drizzle-kit** (Migrations) — **Source of Truth fürs Schema**
- Java-Backend liest dieselbe DB nur lesend, keine eigenen Migrations

## Datum/Zeit

- **Temporal** (`@js-temporal/polyfill` für Coverage-Lücken)
- `rrule` mit TZID aus dem Event
- `Intl.DateTimeFormat` mit `timeZone: event.rrule.tzid` für Anzeige
- **Regel: Event-Zeiten werden immer in der Event-Timezone angezeigt** (nie User-Browser-Zone) → kein Hydration-Mismatch, gleiche Anzeige für alle User
- Mentales Modell:
  - Events sind `ZonedDateTime`, nicht `Instant`
  - DB speichert UTC-Timestamp + IANA-Zone
  - RRULE immer mit TZID
  - Form-Inputs mit expliziter Zone (nie aus Browser inferieren)

## Auth

- **Firebase Auth** (bleibt) — Firebase JS SDK direkt
- Lazy-loaded Pattern auf Browser bleibt sinnvoll

## Internationalisierung

- **next-intl** (App-Router-aware, SSR-aware)
- Aktuell unterstützte Sprachen im Code: **en, de, es, hi** (4)
- → siehe `open-questions.md`: Soll FR + IT für die Migration aktiviert werden?
- Hybrid Routing: EN unprefixed, andere prefixed (`/de/*`, `/es/*`, `/hi/*`)
- → SEO-Details in `seo.md`

## Bilder & Media

- **Google Cloud Storage** (Origin, Originale)
- **ImageKit** (CDN + Transformationen, gepullt aus GCS via External Storage)
- `next/image` mit ImageKit Custom Loader (Read-Pfade)
- `@imagekit/react` `IKUpload` (Write/Forms)
- Hero-Image Critical Preload (siehe Cross-Cutting)

## Content/Markdown

- **Contentful SDK** (bleibt) + `@contentful/rich-text-react-renderer`
- **react-markdown** für reguläres Markdown (ersetzt `marked`)
- ggf. **MDX** falls Blog interaktive Elemente bekommt
- Custom-Link-Renderer behält `rel="nofollow ugc noopener"` für External-Links

## Search/Ranking

- **Postgres Full-Text Search** (Filter, server-side via Drizzle)
- **Fuse.js** bleibt (client-side Result-Ranking nach Priority, **nicht** Filter)

## Geo

- **`geolib`** (bleibt — framework-agnostic)
- **PostGIS** für DB-seitige Geo-Queries via Drizzle `customType`
- Vercel Edge Geo-Headers ersetzen Cloudflare `cf.*` Geo-Injection

## Observability

- **`@sentry/nextjs`** (auto-instrumentiert API Routes + Server Components)
- Session Replay 10% / 100% on Error (wie bisher)
- Body Sanitization für Passwords/Tokens/Emails

## Hosting

- **Vercel** (Next.js, Edge/Serverless)
- Migration weg von Cloudflare Workers
- → Worker-Logic muss aufgeteilt werden auf Middleware, next.config.js, Route Handlers

## Übrig vom Java-Backend (eigener Service, Cloud Run o.ä.)

- **MCP Server** (Spring AI / LangChain4j)
- **Recurring Automations / Scheduled Jobs** (ShedLock)
- Liest dieselbe Postgres-DB (Schema von Drizzle gemanaged)

## Drittanbieter (bleiben)

- **Brevo** (Transactional Email, Backend)
- **Google Maps**, **Search Console**, **GA4**
- **Meta Marketing API**
- **Hotjar** (User-Recording)
- **Silktide** (Cookie-Consent)

## Rauswerfen ohne Ersatz

- **`zone.js`** — React braucht keine Change Detection
- **`rxjs`** — TanStack Query + async/await ersetzen alles
- **`luxon` / `date-fns-tz`** — Temporal ersetzt sie
- **`primeng`** — shadcn/ui
- **`@angular/cdk`** — Radix UI (via shadcn) + React Aria
- **`@angular/fire`** — Firebase JS SDK direkt
- **`@ngx-translate/core`** — next-intl
- **`@angular/localize`** — next-intl

## Caching-Strategie

| Layer | Tool | Use-Case |
|---|---|---|
| 1. Public Event Data | Vercel/CDN Cache (s-maxage) | Minuten–Stunden |
| 2. SSR per Request | Next.js fetch() Cache (Request Memoization) | Single Request |
| 3. Client Navigation | TanStack Query (staleTime ~60s) | Cross-Page |
| 4. User-spezifisch | TanStack Query, no CDN cache | Auth-Required |

CDN-Patterns (aus Angular übernommen):
- HTML: `max-age=0, s-maxage=3600` (Trending), `s-maxage=43200` (Static), Vary: Accept-Language
- Hashed Chunks: `max-age=259200, immutable` (3d)
- Fonts: `max-age=31536000, immutable` (1y)

## AI-Development-Setup

**MCP Server**
- `next-devtools-mcp` (Next.js Inspector)
- `@playwright/mcp` (E2E Tests)
- `@upstash/context7-mcp` (Up-to-date Docs)
- `shadcn/ui MCP` (Component Registry)
- `@anthropic-ai/chrome-devtools-mcp` (Browser DevTools)

**Claude Plugins**
- `anthropic/frontend-design`
- `anthropic/typescript-lsp`

**Setup**
```bash
# Core – immer aktiv
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
claude mcp add next-devtools -- npx -y next-devtools-mcp@latest

# Testing – bei Bedarf
claude mcp add playwright -s user -- npx @playwright/mcp@latest

# UI – bei Component-Arbeit
claude mcp add shadcn

# Plugins
claude plugin add anthropic/frontend-design
claude plugin add anthropic/typescript-lsp
```

> **⚠️ Token-Management:** MCP-Server fressen Tokens beim Session-Start. Maximal 3-5 aktiv halten. Mitigieren mit `/mcp disable <name>` wenn nicht in Gebrauch, Tool Search (Lazy Loading, spart bis zu 95%), und Skills bevorzugen wo möglich – Skills laden nur ~100 Tokens beim Session-Start.
