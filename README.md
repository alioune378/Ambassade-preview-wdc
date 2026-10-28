# Sénégal Consulaire Digital — Washington (démonstration)

> **Maquette de démonstration non officielle — Projet proposé par Dalal Technologies. Aucun service administratif réel n'est fourni sur cette plateforme.**

This is a private, unofficial demonstration of a redesigned website for the Embassy of Senegal in Washington, D.C., built by Dalal Technologies. It is not an authorized government service, and nothing here implies a contract, partnership, endorsement or authorization from the Embassy or the Government of Senegal.

It is the second mission on the same platform as the Paris prototype. The Paris build is kept separate and unchanged.

## Design direction

The design is the approved A + C + B hybrid, built as one design system:

| Share | Concept | What it brings |
|---|---|---|
| ~65 % | **A, Diplomatic Modernism** | Midnight navy, ivory paper, Lora serif headings with Inter text, an editorial rhythm, and diplomatic storytelling |
| ~25 % | **C, Intelligent services** | A search console as the homepage's main feature, a live "today" panel (open/closed in Washington time), the guided service finder and verification chips on every fact |
| ~10 % | **B, Senegalese references** | A thin tricolour line under the header, arch outlines and arch-framed photography, all kept small |

Photos are the Embassy's own published event photos, approved for use in this demonstration and shown with credit lines. There are no portraits of officials: the Ambassador section uses a neutral arch placeholder.

## Quick start

Requires Node 22 or later.

```bash
npm install
npm run build          # Washington mission → dist/
npm run serve          # http://localhost:4173
npm test               # 29 end-to-end checks (Playwright, Chromium)
npm run test:auth      # 9 unit tests for the preview password gate
npm run typecheck
MISSION=demo-alpha npm run build   # fictional mission, same code
```

In preview builds, `/?mission=demo-alpha` or `/?mission=demo-beta` switches to a fictional mission for the session.

## Pages

| Area | Routes |
|---|---|
| Home | `/` — search console, today panel, announcements, services index, diplomacy band, jurisdiction, Ambassador, news, practical information |
| Consular services | `/services-consulaires` (15 services, search and theme filters), `/services-consulaires/:slug` (13-section template with page index, checklist, print, PDF and .txt), `/trouver-ma-demarche` (guided finder), `/rendez-vous` (guidance only, no booking engine) |
| Embassy | `/l-ambassade`, `/l-ambassade/ambassadeur`, `/l-ambassade/juridiction`, `/l-ambassade/anciens-ambassadeurs` |
| Diplomacy | `/senegal-etats-unis` — six bilateral themes, highlights |
| News | `/actualites` (category filters, archive), `/actualites/:id` |
| Help | `/contact` (simulated form), `/questions-frequentes`, `/recherche?q=` |
| Simulations | `/assistance` and `/assistance/suivi` (5-stage tracker), `/demo/tableau-de-bord` (operations console), `/demo/contenus` (content-management workflow) |
| Legal and demo | `/accessibilite`, `/confidentialite`, `/a-propos-de-la-demo` |

The site is in French and English. Wolof is set up in the structure, but no Wolof text has been written yet. Choosing WO shows a notice and keeps French; machine-generated Wolof is never presented as authoritative.

## What works, what is simulated, what needs authorization

| Status | Items |
|---|---|
| **Works (client-side)** | Search across services, pages, FAQ and news (accent-insensitive, keyboard, Ctrl/⌘+K); directory filters with shareable URLs; service finder; checklists with print, PDF and .txt; FAQ search and deep links; FR/EN switch kept across visits; open/closed status computed in Washington time; news filters and archive; responsive layout from 375 px |
| **Simulated (stored in the browser only, nothing sent)** | Contact form; assistance request with `DEMO-WDC-2026-0001` references and a 5-stage tracker; staff operations console (12 synthetic requests); content-management workflow (draft → review → published). Forms refuse text that looks like passport, SSN or ID numbers, or dates of birth. |
| **Needs Embassy authorization or input** | Confirmation of the content taken from its pages, and the missing pieces (processing times, consular days, appointment method, seven undocumented services); any real booking, payment, identity or messaging integration; photo rights for a public launch; the Ambassador's message and biography wording; a Wolof translation by qualified translators; the domain and hosting decision |
| **Incomplete or not verified here** | Facts come from ambasenegal-us.org (screenshots, then live pages checked on 26 Oct 2026) and stay marked "à reconfirmer". See `UNVERIFIED_INFORMATION.md`. The audit found injected spam links on the current official site (see `AUDIT_WASHINGTON.md`). Lighthouse, axe-core, Firefox and Safari could not be run (see `QA_REPORT.md`). |

## Documentation

- `AUDIT_WASHINGTON.md` — audit of the current site
- `CONTENT_SOURCES.md` — where each fact comes from
- `UNVERIFIED_INFORMATION.md` — everything the Embassy must confirm
- `DEPLOYMENT.md` — private Netlify preview with real access control
- `QA_REPORT.md` — what was tested, with results
- `FUTURE_ROLLOUT.md` — the path from demonstration to an authorized service
- `docs/screenshots/` — 18 screenshots produced by the test run

## Technical notes

- React 19 and TypeScript, bundled with esbuild into one JS file (~383 kB, ~110 kB gzipped) and one CSS file (~44 kB). Hand-written CSS uses design tokens and has no framework. Vite and Tailwind could not be used because the package registry was not reachable in the build environment.
- Fonts are Inter and Lora (SIL OFL), self-hosted and subset. No third-party requests are made at runtime.
- Platform code is in `src/platform`, mission data in `src/missions/<id>` (config and content). Each fact is a `Verified<T>` with a status (`verified`, `source-reported`, `unverified` or `fictional`), a source and a check date, and the interface shows that status.
