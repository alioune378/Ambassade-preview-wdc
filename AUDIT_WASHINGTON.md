# Audit — ambasenegal-us.org (Ambassade du Sénégal à Washington)

**Date:** 26 October 2026.
**Method:** review of screenshots supplied by Dalal Technologies, then a check of the live pages on 26 October 2026:

- the homepage;
- Juridiction, Biographie de l'Ambassadeur and Anciens ambassadeurs;
- Passeport, Demande de visa, État civil, Cartes consulaires and Inscription.

Every fact used in the prototype is marked **"Publié par la représentation — à reconfirmer"**, with a link to the page it came from, until the Embassy confirms it.

## ⚠️ Critical: the current site carries injected spam links

On 26 October 2026 the live homepage and the inner pages contained links to unrelated commercial sites:

- Turkish escort-service sites;
- sites selling abortion drugs.

These links are not part of the Embassy's content. This is a typical sign that the site (WordPress, "Shark News" theme, footer dated 2022) has been compromised, or that an outdated plugin or theme has been abused to inject search-engine spam.

**Effects:**

- reputational risk for the Embassy;
- search engines may down-rank or flag the official site;
- the attacker may have wider access to the server.

**Recommended immediate steps** (for the Embassy's webmaster, independent of any redesign):

1. Take a backup.
2. Update WordPress core, the theme and the plugins.
3. Remove the injected code (often in the theme's `footer.php`, `functions.php` or the database options).
4. Change every administrator password.
5. Check user accounts.
6. Scan the server.
7. Ask Google Search Console to review the site.

The prototype has no technical connection to this site.

## What the current site does well

- **Breadth.** It covers an embassy, not just a consulate: diplomacy, bilateral cooperation, investment (APIX, ASEPEX, Chamber of Commerce of Dakar), tourism, the jurisdiction over 13 countries, and accreditation to the IMF and World Bank.
- **Active news.** The homepage carries recent, photographed news: the President at the UN General Assembly, the Tripoli meeting on Security Council reform, the IMF and Boeing/MCC meetings in Washington, and a meeting between MASAE (the agriculture ministry) and the USDA.
- **Institutional memory.** A list of former ambassadors and a biography of the current Ambassador.
- **Contact details on the homepage.** Address, phone, fax, email and opening hours are easy to find.

## Main problems

| # | Problem | Effect on users | Response in the prototype |
|---|---|---|---|
| 1 | Procedure pages are short and uneven: the visa page is detailed, but passport, consular card and civil status give documents and fees with no delays, no appointment method and no forms in HTML | Users phone or travel to ask; the switchboard gets overloaded | A 14-point service template. Every missing item says "Informations à confirmer auprès de l'Ambassade." rather than guessing |
| 2 | No search | Users can't find a procedure by name | A search console as the homepage's main feature, a Ctrl/⌘+K overlay and a results page |
| 3 | Mixed audiences (citizens, visa applicants, investors, diplomats) share one flat menu | Citizens struggle to find their service | A guided finder, a services index ordered by demand, and a separate "Sénégal–États-Unis" section |
| 4a | Pages "Anciens ambassadeurs" and the biography carry photos with no captions or alt text (names and years exist only inside the images) | Not accessible, not searchable | Names and years as text |
| 4 | Some news items are just an image with no text (for example the MASAE–USDA meeting) | Not accessible to screen readers or searchable | Flagged as "image only" with a written summary to be supplied |
| 5 | Out-of-date notices stay on the homepage (for example World Cup 2026 tickets) | Users act on old information | Notices carry an expiry date and move to an archive |
| 6 | The French/English split is unclear, and there is no Wolof | Part of the diaspora is underserved | A full FR/EN interface, with Wolof set up in the structure and waiting for qualified translators |
| 7 | Hours are given for the embassy and the consular section, but consular days are not stated (only the visa page gives a window: Mon–Fri, drop-off 10:30–13:30, collection 14:30–16:00) | Wasted trips | A "today" panel shows open or closed in Washington time, and consular days are marked "to confirm" |
| 8 | Weak mobile layout (per the screenshots: small text, dense menus) | Most diaspora traffic is on phones | Mobile-first layout, tested at 375 and 390 px |
| 9 | No visible privacy or accessibility statement | Trust and compliance risk | Privacy and accessibility pages (drafts for the Embassy to adopt) |
| 10 | The New York consulate is mentioned, but the split of states between the two posts isn't explained | Users contact the wrong post | An FAQ entry plus a "to confirm" note |

## Facts taken from the official site

| Fact | Value | Status |
|---|---|---|
| Address | 2215 M Street NW, Washington, DC 20037 | source-reported |
| Phone / fax | +1 202 234 0540 / +1 202 629 2961 | source-reported |
| Email | Contact@ambasenegal-us.org | source-reported |
| Embassy hours | Monday–Friday, 9:30–16:30 | source-reported |
| Consular public hours | 10:00–15:00, days not stated | source-reported (days to confirm) |
| Metro | Dupont Circle (Red Line) | source-reported |
| Ambassador | M. Abdoul Wahab Haïdara | source-reported |
| Jurisdiction | United States + 12 countries; IMF and World Bank | source-reported |
| Former ambassadors | 13 names (live page: images only; years read from the screenshots, the 2019–2025 entry needs checking) | source-reported |
| Passport | ECOWAS ID card required; $45 money order; in person | source-reported (page Passeport) |
| Consular card | Form, copy of a Senegalese ID document, 3 photos, $5 stamp | source-reported (page Cartes consulaires) |
| Civil status | Birth transcription free and possible by mail; marriage ceremony and transcription; death transcription and body-transfer authorization | source-reported (page État civil) |
| Visa | US nationals exempt; visa free; 6 documents; 2–3 working days; in person or by registered mail | source-reported (page Demande de visa) |
| News dates | Tripoli article published 15 Oct 2026; Paris Agreement (UN General Assembly) article dated 25 Sept 2025 | from article URLs |

## Not audited

The following were not reviewed and should be audited live:

- performance;
- full accessibility;
- broken links;
- the secondary sites;
- the downloadable PDF forms.

No online appointment portal was found on the pages checked.
