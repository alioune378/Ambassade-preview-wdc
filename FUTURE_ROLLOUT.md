# From demonstration to service: a possible path

This is a proposal only. Every step depends on a decision by the Embassy and the Ministry of Foreign Affairs. Nothing here implies that any agreement exists.

## Phase 0 — Presentation (now)
- Private, password-protected preview, shown to the Ambassador and the teams he chooses.
- Collect feedback on the design, the structure and the priority services.

## Phase 1 — Content validation (if the Embassy wishes to continue)
- The Embassy names a content owner for each area: consular, visas, communication, economic.
- Go through `UNVERIFIED_INFORMATION.md` item by item. Every `source-reported` and `unverified` fact becomes `verified`, with a name and date, or is removed.
- Obtain photo rights. Agree the Ambassador's message and biography.
- Commission the Wolof translation from qualified translators. Legal and consular instructions in Wolof are reviewed before publication.

## Phase 2 — Technical foundations
- Hosting and domain decided by the Government. The official domain stays under government control.
- Replace the browser-only content-management demo with a real CMS that has roles: editor, reviewer, publisher. The draft → review → published workflow shown in the demo is the model.
- Security review, accessibility audit (WCAG 2.2 AA, with an external auditor and screen-reader testing) and a privacy impact assessment.
- Analytics only if approved, privacy-respecting and without third-party trackers.

## Phase 3 — Public launch of the information site
- Information only: no forms that collect personal data.
- Redirects from old URLs, and a feedback channel.

## Phase 4 — Online services (each one a separate decision)
- **Appointments, assistance requests and tracking:** only on government-approved systems, with authentication, data protection and staff training. The simulations in this prototype are design references, not code to put in production.
- **Payments:** only through channels approved by the Treasury.
- **The operations console:** to be designed with the consular staff who would use it.

## Reuse across the network
The platform separates code (`src/platform`) from mission data (`src/missions/<id>`). The New York consulate, or any other post, could be added as one config and one content file. The two fictional missions show this. Each mission keeps its own content owners and its own validation.
