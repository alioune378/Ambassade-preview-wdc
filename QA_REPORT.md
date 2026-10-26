# QA report — Washington build

**Run on:** 26 October 2026 (re-run after adding the content from the official service pages), in the build environment (Linux, Node 22, Playwright Chromium, local static server on the production `dist/` build).
**Rule followed:** only checks that were actually executed are reported as passed. Anything that could not run is listed as such.

## Summary

| Suite | Command | Result |
|---|---|---|
| End-to-end, Chromium | `npm test` | **29 / 29 passed** (raw output in `tests/results.json`) |
| Preview password gate, unit tests | `npm run test:auth` | **9 / 9 passed** |
| TypeScript strict, app code | `tsc --noEmit` against local React type stubs (see below) | **0 errors** |
| TypeScript strict, edge functions | `tsc --strict` on `netlify/edge-functions/*.ts` | **0 errors** |
| Production build, all three missions | `npm run build`, `build:alpha`, `build:beta` | **Succeeded** |

## End-to-end checks

The checks ran on 23 representative routes. The link crawl reached 38 distinct pages.

| # | Check | Result | Detail |
|---|---|---|---|
| 1 | Internal links: crawl every page reachable from home | ✅ Pass | 38 pages crawled, 0 broken |
| 2 | Unknown route shows not-found page | ✅ Pass | — |
| 3 | Every page has a unique, descriptive title | ✅ Pass | 23 unique titles |
| 4 | Search console: suggestions, keyboard, results page | ✅ Pass | 5 suggestions for "passeport"; Enter opens the active one |
| 5 | Header search: Ctrl+K overlay, focus trap, Escape | ✅ Pass | — |
| 6 | Service directory: search, theme filters, shareable URL | ✅ Pass | 15 services; passeport → 3; état civil → 4 |
| 7 | Service template: 13 sections, page index with status dots, help block | ✅ Pass | 13 sections |
| 8 | Checklist: tick, print, PDF and text downloads | ✅ Pass | PDF 1715 bytes (checklist-passeport-premiere-demande-et-renouvellement.pdf) |
| 9 | Service finder: two-step guided path | ✅ Pass | — |
| 10 | FAQ: search, keyboard accordion, deep link | ✅ Pass | 1 result(s) for "métro" |
| 11 | Language: EN translates, WO notice, choice persists, same page kept | ✅ Pass | — |
| 12 | Institution pages: jurisdiction, biography, former ambassadors | ✅ Pass | 13 countries + 2 institutions; 13 former ambassadors |
| 13 | News: filters, archive, article page, related items | ✅ Pass | 5 items; diplomatie → 2 |
| 14 | Today panel: open/closed from Washington time (frozen clock) | ✅ Pass | Wed 11:00 open · Sat closed · Wed 17:00 closed · consular days unconfirmed |
| 15 | Contact form: validation, sensitive-data guard, simulated send | ✅ Pass | — |
| 16 | Assistance: validation, DEMO-WDC reference, five-stage tracker | ✅ Pass | ref DEMO-WDC-2026-0001; 5 stages; unknown ref → error |
| 17 | Operations console: filters, search, detail, actions | ✅ Pass | 13 requests; high → 2; open → 9 |
| 18 | Content-management demo: draft → review → published, logged | ✅ Pass | — |
| 19 | Platform reuse: fictional mission via ?mission= | ✅ Pass | fictional banner, own name and own theme |
| 20 | Demo disclaimer and noindex on every page | ✅ Pass | 23 pages |
| 21 | External links: HTTPS and rel="noopener noreferrer" | ✅ Pass | 7 external links |
| 22 | Accessibility rules on every page | ✅ Pass | 23 pages, 0 issues |
| 23 | Contrast measured on rendered text (WCAG AA) | ✅ Pass | 2032 text elements on 23 pages, all ≥ AA |
| 24 | Keyboard: skip link first, focus moves to main | ✅ Pass | — |
| 25 | No horizontal overflow at 375 / 390 / 768 / 1024 / 1440 px | ✅ Pass | 23 pages × 5 widths |
| 26 | Mobile menu (390 px): open, language inside, navigate, Escape | ✅ Pass | — |
| 27 | Performance budget: weight, LCP, CLS on home (desktop + mobile) | ✅ Pass | 1440px: 700 kB, LCP 228 ms, CLS 0 · 390px: 744 kB, LCP 216 ms, CLS 0 |
| 28 | Screenshots captured | ✅ Pass | 18 screenshots |
| 29 | No JavaScript errors in console | ✅ Pass | — |

### What some checks measure

- **Accessibility rules** (in-house, run on every page):
  - exactly one `h1` and no skipped heading levels;
  - every form control labelled; every button and link has an accessible name;
  - every image has `alt`; decorative SVGs are hidden;
  - `main`, `nav`, `header` and `footer` landmarks are present;
  - no duplicate ids; `aria-controls` targets exist.
- **Contrast**: the colour of each rendered text node is compared with its actual background colour, then checked against the WCAG AA thresholds (4.5 : 1 for normal text, 3 : 1 for large text).
- **Today panel**: the browser clock is frozen at three moments in Washington time, so the open/closed status is tested deterministically.
- **Performance budget**: transferred bytes, Largest Contentful Paint and Cumulative Layout Shift, measured with `PerformanceObserver` on a local server. Budget: ≤ 900 kB, LCP ≤ 2.5 s, CLS ≤ 0.1. A local server has no network latency, so these numbers are not field values.

## Defects found and fixed during this run

1. **Mobile drawer:** while closed, its links were still focusable and still exposed to assistive technology, because a CSS `display` rule overrode `hidden`. Fixed.
2. **Passport page:** duplicate id `rendez-vous` (the section anchor clashed with an embedded FAQ answer). The anchor was renamed to `prise-de-rendez-vous`.
3. **Content-management demo:** the preview title skipped a heading level (h1 → h3). It is now a styled paragraph.
4. **Operations console:** the filters were misaligned and wrapped badly at 1440 px. The labels were shortened and the layout rebuilt.
5. **Diplomacy page:** the highlight photos were rendered very tall, in portrait. They are now 4 : 3.
6. **Images:** the UN photo was recompressed from 292 kB to 131 kB.
7. **Earlier in the build** (before this suite):
   - mobile header overflow;
   - demo-strip link overflow at 375 px;
   - lazy-loaded lead image not rendering;
   - a duplicated photo on the homepage;
   - low-contrast console arrow.

## Not run, and why

| Check | Status |
|---|---|
| **Lighthouse** | Not run. It is not installed and could not be downloaded (the package registry is blocked). The performance budget, contrast and accessibility checks above cover part of the same ground. Run `npx lighthouse <url>` after deploying. |
| **axe-core** | Not run, for the same reason. Run the axe browser extension on the deployed preview. |
| **Firefox and Safari (WebKit)** | Not run; only Chromium is available. The code uses standard features (CSS grid, `color-mix()`, `Intl`), but test on real devices, especially iOS Safari. |
| **Screen readers** (NVDA, VoiceOver) | Not run. ARIA patterns follow WAI-ARIA 1.2 (combobox, accordion, tabs), but a manual pass is needed. |
| **Live external links** | Not checked automatically. The external URLs were checked for HTTPS and `rel` only. The official pages they point to were read on 26 Oct 2026 while gathering content. |
| **Netlify edge function on Netlify** | Not deployed from here. Logic tested by unit tests; see `DEPLOYMENT.md` for post-deploy checks. |
| **Full `@types/react` type check** | The official React types could not be installed. The app was strict-checked against minimal local stubs: our own code is fully checked, but React's own APIs are checked only loosely. Run `npm install && npm run typecheck` once the registry is reachable. |

## Screenshots

`docs/screenshots/` contains 18 images from the run:

- the homepage at desktop, tablet and mobile widths;
- the services directory, service pages, finder, embassy, jurisdiction and diplomacy pages;
- an article, contact, assistance, the operations console (desktop and mobile) and the content-management demo;
- open search suggestions.
