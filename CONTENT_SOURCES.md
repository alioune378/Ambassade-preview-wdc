# Content sources

Every fact in `src/missions/washington/*.ts` is wrapped in `Verified<T>`, which carries a `status`, a `source` and a `checkedOn` date. The interface turns these into badges:

| Status | Badge | Meaning |
|---|---|---|
| `verified` | Vérifié | Confirmed with the Embassy (**none yet**) |
| `source-reported` | Publié par la représentation — à reconfirmer | Published on ambasenegal-us.org (screenshots, then live pages checked on 26 Oct 2026); each item links to its page |
| `unverified` | Non vérifié | Written by Dalal Studio as a structure or placeholder; must be supplied by the Embassy |
| `fictional` | Fictif | Fictional demo missions only |

## Sources used

| Source | Used for | Notes |
|---|---|---|
| Screenshots of https://www.ambasenegal-us.org/ supplied by Dalal Studio (26 Oct 2026) | First draft of all facts; years of the former ambassadors (only in images on the live page) | |
| Live pages, checked 26 Oct 2026: home, `/juridiction/`, `/biographie-de-lambassadeur/`, `/anciens-ambassadeurs/` | Contact details, hours, Metro, jurisdiction, biography, names of former ambassadors, news dates | Confirmed the screenshot facts |
| `/passeport/`, `/cartes-consulaires/`, `/etat-civil/`, `/demande-de-visa/`, `/inscription/` | Eligibility, documents, fees, processing, how to apply, forms for: passport, consular card, consular registration, birth, marriage, death, visa, entry requirements | Paraphrased; amounts copied exactly |
| Article text supplied by Dalal Studio (the President's UN General Assembly speech on the Paris Agreement) | News summary | Paraphrased; no long quotations |
| Event photos supplied by Dalal Studio (UNGA podium, Tripoli group photo, IMF meeting) | News and diplomacy band | Published by the Embassy. **Use approved for this demonstration** (confirmed by Dalal Studio, 26 Oct 2026); credited on screen |
| https://diplomatie.gouv.sn/ | Footer link to the Ministry | Link only |

## Written by Dalal Studio (status `unverified`)

These texts are clearly labelled on screen:

- service descriptions for the seven services whose official page is missing or gives no detail;
- the six bilateral theme texts;
- the visit-preparation checklist, which is generic and contains no procedure-specific requirements;
- the Ambassador's message, a paraphrased summary marked "Résumé rédigé par Dalal Studio";
- the privacy and accessibility pages (drafts);
- FAQ wording, based only on the facts listed above.

## Synthetic data

- the 12 assistance requests (`DEMO-WDC-2026-01xx`);
- the agents named "Agent A–D";
- the timelines and the median response time;
- the two fictional missions (Lumeria and Port-Océane).

All of these are labelled as synthetic or fictional wherever they appear.

## Not invented

The prototype contains no fees, processing times, required-document lists, legal conditions, consular opening days, appointment systems, government integrations or images of officials that are not in the sources above. Every fee shown ($45 passport, $5 consular card, free visa, free birth transcription) is taken from the Embassy's own page.
