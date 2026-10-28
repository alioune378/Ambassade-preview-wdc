> **Current setting (26 Oct 2026): no password.** At Dalal Technologies's request the password gate is switched off. The demo is open to anyone with the link and stays out of search engines (`noindex` header, `robots.txt`). The gate's code is kept in `netlify/lib/` and can be switched back on by moving `preview-auth.ts` into `netlify/edge-functions/` (fix its import to `../lib/auth-core.ts`) and adding an `[[edge_functions]]` block for `/*` in `netlify.toml`.

# Private preview deployment (Netlify)

The preview must be visible only to Dalal Technologies and the officials it is shown to. A hidden URL is not enough, and `robots.txt` / `noindex` are not security. Access control here is an HTTP Basic Auth check that runs on Netlify's edge **before** any file is served.

## Steps

1. Push this folder to a **private** GitHub repository.
2. In Netlify: *Add new site → Import an existing project →* pick the repo. Netlify reads `netlify.toml` (build command, publish folder, edge function, headers).
3. Before the first deploy, go to *Site configuration → Environment variables* and add:
   - `PREVIEW_USER` — e.g. `dalal-demo`
   - `PREVIEW_PASSWORD` — a long random password (20+ characters)
4. Deploy. Opening the site now asks for the username and password.
5. Share the URL and the password **through different channels** (e.g. URL by email, password by phone or WhatsApp). Change the password after each presentation round.

If the two variables are missing, the edge function refuses every request with a 503 ("credentials not configured"), so a misconfigured site is closed rather than open.

## Optional extra layers

- **Netlify Pro / Business:** you can also turn on *Site protection → Password protection* in the dashboard (team-level). It complements the edge function.
- **Per-person access:** put the site behind Cloudflare Access or Netlify Identity with an allow-list of email addresses, if you need to know who viewed it.
- **Deploy previews:** under *Site configuration → Build & deploy → Deploy contexts*, turn off deploy previews for pull requests, or they will create extra public URLs (the edge function also runs on them, but fewer URLs is better).
- Use a neutral site name (e.g. `dalal-preview-7f3k.netlify.app`) — never one that contains "gouv", "consulat", "ambassade", "embassy" or "senegal", so the URL itself cannot be mistaken for an official service.

## What the config already does

| Control | Where |
|---|---|
| Password gate on every path | `netlify/edge-functions/preview-auth.ts` |
| `X-Robots-Tag: noindex, nofollow, noarchive` on every response | `netlify.toml` + edge function |
| `<meta name="robots" content="noindex">` | `src/index.html`, per page in `useSeo` |
| `Disallow: /` | `public/robots.txt` |
| Strict Content-Security-Policy, no framing, HSTS, `Cache-Control: private, no-store` | `netlify.toml` |

## Building another mission

Set the Netlify environment variable `MISSION` (`washington`, `demo-alpha` or `demo-beta`) or edit `[build.environment]` in `netlify.toml`. With `PREVIEW = "true"` the demo banner, the `?mission=` switcher and the demo pages are enabled. Keep it on for every demonstration build.

## Keeping Paris separate

The Paris prototype is a separate project and a separate Netlify site. Deploy each under its own neutral site name and its own password.

## Not done from here

The prototype was built in an environment without Netlify access, so **no deployment was made and the edge function has not run on Netlify**. Its logic (`auth-core.ts`) is covered by 9 unit tests (`npm run test:auth`, passing), and both edge-function files pass a strict TypeScript check. After your first deploy, check: the site prompts for credentials; a wrong password gets 401; `curl -I` on the URL shows the `X-Robots-Tag` header.
