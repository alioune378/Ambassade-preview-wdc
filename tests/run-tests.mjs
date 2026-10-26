// End-to-end tests (Playwright, Chromium) for the Washington build.
// Run `npm run build` first. Writes tests/results.json and docs/screenshots/.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4521;
const BASE = `http://localhost:${PORT}`;
const shots = `${root}docs/screenshots`;
mkdirSync(shots, { recursive: true });
const server = spawn('node', ['scripts/serve.mjs', String(PORT)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const results = [];
let failures = 0;
async function check(name, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    results.push({ name, status: 'pass', detail: detail ?? '', ms: Date.now() - t0 });
    console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (e) {
    failures++;
    const msg = String(e?.message ?? e).split('\n')[0];
    results.push({ name, status: 'fail', detail: msg, ms: Date.now() - t0 });
    console.log(`FAIL  ${name} — ${msg}`);
  }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
const go = async (path) => { await page.goto(BASE + path); await page.waitForSelector('main h1'); };

const ROUTES = ['/', '/services-consulaires', '/services-consulaires/passeport', '/services-consulaires/visa', '/trouver-ma-demarche', '/rendez-vous', '/l-ambassade', '/l-ambassade/ambassadeur', '/l-ambassade/juridiction', '/l-ambassade/anciens-ambassadeurs', '/senegal-etats-unis', '/actualites', '/actualites/ag-onu-accord-de-paris', '/contact', '/questions-frequentes', '/recherche?q=passeport', '/assistance', '/assistance/suivi?ref=X', '/demo/tableau-de-bord', '/demo/contenus', '/accessibilite', '/confidentialite', '/a-propos-de-la-demo'];

// ── Navigation ───────────────────────────────────────────────────────
await check('Internal links: crawl every page reachable from home', async () => {
  const seen = new Set(); const queue = ['/']; const broken = [];
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    await go(path);
    if (/introuvable/i.test(await page.textContent('main h1'))) broken.push(path);
    for (const h of await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')))) {
      const clean = h.split('#')[0].split('?')[0] || '/';
      if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
    }
  }
  assert(!broken.length, `broken: ${broken.join(', ')}`);
  return `${seen.size} pages crawled, 0 broken`;
});
await check('Unknown route shows not-found page', async () => { await go('/nexiste-pas'); assert(/introuvable/i.test(await page.textContent('main h1')), 'no 404'); });
await check('Every page has a unique, descriptive title', async () => {
  const titles = new Map();
  for (const r of ROUTES) { await go(r); titles.set(r, await page.title()); }
  const vals = [...titles.values()];
  const dup = vals.filter((v, i) => vals.indexOf(v) !== i);
  assert(!dup.length, `duplicate titles: ${[...new Set(dup)].join(' | ')}`);
  return `${titles.size} unique titles`;
});

// ── Flagship search ──────────────────────────────────────────────────
await check('Search console: suggestions, keyboard, results page', async () => {
  await go('/');
  await page.fill('#home-input', 'passeport');
  await page.waitForSelector('[role=listbox] [role=option]');
  const n = await page.locator('[role=listbox] [role=option]').count();
  assert(n >= 2, `only ${n} suggestions`);
  assert((await page.getAttribute('#home-input', 'aria-expanded')) === 'true', 'aria-expanded not true');
  await page.press('#home-input', 'ArrowDown');
  assert((await page.locator('[role=option][aria-selected=true]').count()) === 1, 'no active option');
  const target = await page.locator('[role=option][aria-selected=true] b').textContent();
  await page.press('#home-input', 'Enter');
  await page.waitForURL(/services-consulaires\//);
  const h1 = await page.textContent('main h1');
  assert(h1.trim() === target.trim(), `opened "${h1}" instead of "${target}"`);
  await go('/');
  await page.fill('#home-input', 'etat civil');
  assert((await page.locator('[role=option]').count()) >= 1, 'accent-free search failed');
  await page.fill('#home-input', 'juridiction');
  assert(await page.locator('[role=option]:has-text("Juridiction")').count(), 'page results missing');
  await page.fill('#home-input', 'zzzqqq');
  assert(await page.isVisible('text=Aucun résultat'), 'empty state missing');
  await page.press('#home-input', 'Escape');
  assert((await page.inputValue('#home-input')) === '', 'Escape did not clear');
  await page.fill('#home-input', 'visa');
  await page.click('.console__go');
  await page.waitForURL(/services-consulaires\/visa|recherche/);
  await go('/recherche?q=carte');
  assert((await page.locator('[data-testid=search-results] .story').count()) >= 2, 'results page empty');
  return `${n} suggestions for "passeport"; Enter opens the active one`;
});
await check('Header search: Ctrl+K overlay, focus trap, Escape', async () => {
  await go('/contact');
  await page.keyboard.press('Control+k');
  await page.waitForSelector('[role=dialog]');
  assert((await page.evaluate(() => document.activeElement?.id)) === 'ov-input', 'overlay input not focused');
  await page.keyboard.type('carte consulaire');
  await page.waitForSelector('[role=dialog] [role=option]');
  await page.keyboard.press('Escape'); // clears text
  await page.keyboard.press('Escape'); // closes
  assert(!(await page.isVisible('[role=dialog]')), 'overlay did not close');
});

// ── Services ─────────────────────────────────────────────────────────
await check('Service directory: search, theme filters, shareable URL', async () => {
  await go('/services-consulaires');
  const count = async () => Number((await page.textContent('[data-testid=results-count]')).match(/\d+/)[0]);
  const all = await count();
  await page.fill('#dir-q', 'passeport');
  const pass = await count();
  assert(pass > 0 && pass < all, 'search did nothing');
  await page.fill('#dir-q', '');
  await page.click('.seg button:has-text("État civil")');
  const civil = await count();
  assert(civil > 0 && civil < all && page.url().includes('cat=etat-civil'), 'filter failed');
  return `${all} services; passeport → ${pass}; état civil → ${civil}`;
});
await check('Service template: 13 sections, page index with status dots, help block', async () => {
  await go('/services-consulaires/passeport');
  const blocks = await page.locator('section.block').count();
  assert(blocks === 13, `${blocks} sections`);
  assert((await page.locator('.toc a').count()) === 13, 'toc incomplete');
  assert((await page.locator('.toc .d--ok').count()) >= 3, 'no verified dots');
  assert(await page.isVisible('text=Informations à confirmer auprès de l’Ambassade.'), 'to-confirm notice missing');
  assert(await page.isVisible('.help-card'), 'help block missing');
  await page.click('.toc a:has-text("Frais")');
  await page.waitForTimeout(200);
  assert(page.url().endsWith('#frais'), 'toc link did not jump');
  return `${blocks} sections`;
});
await check('Checklist: tick, print, PDF and text downloads', async () => {
  await go('/services-consulaires/passeport');
  const list = page.locator('#liste [data-testid=checklist]');
  await list.locator('label.check').first().click();
  assert((await list.locator('.checklist__count').textContent()).startsWith('1 sur'), 'tick count wrong');
  const [pdf] = await Promise.all([page.waitForEvent('download'), list.locator('button:has-text("PDF")').click()]);
  const bytes = readFileSync(await pdf.path());
  assert(bytes.subarray(0, 5).toString() === '%PDF-' && bytes.subarray(-6).toString().includes('%%EOF'), 'invalid PDF');
  const [txt] = await Promise.all([page.waitForEvent('download'), list.locator('button:has-text(".txt")').click()]);
  assert(readFileSync(await txt.path(), 'utf8').includes('[x]'), 'txt does not record the tick');
  assert(await list.locator('button:has-text("Imprimer")').isVisible(), 'print missing');
  return `PDF ${bytes.length} bytes (${pdf.suggestedFilename()})`;
});
await check('Service finder: two-step guided path', async () => {
  await go('/trouver-ma-demarche');
  await page.click('.finder__opt:has-text("passeport")');
  await page.waitForSelector('text=Quelle est votre situation ?');
  assert((await page.evaluate(() => document.activeElement?.id)) === 'fq', 'focus not moved to new question');
  await page.click('button:has-text("Question précédente")');
  await page.click('.finder__opt:has-text("passeport")');
  await page.click('.finder__opt:has-text("perdu")');
  await page.waitForURL(/passeport-perdu-deteriore/);
  await go('/trouver-ma-demarche');
  await page.click('.finder__opt:has-text("carte consulaire")');
  await page.click('.finder__opt:has-text("Non")');
  await page.waitForURL(/inscription-consulaire/);
});

// ── FAQ, language ────────────────────────────────────────────────────
await check('FAQ: search, keyboard accordion, deep link', async () => {
  await go('/questions-frequentes');
  await page.fill('#faq-q', 'métro');
  const n = await page.locator('[data-testid=faq] .acc').count();
  assert(n >= 1, 'no result');
  const btn = page.locator('.acc__btn').first();
  await btn.focus(); await page.keyboard.press('Enter');
  assert((await btn.getAttribute('aria-expanded')) === 'true', 'keyboard did not open');
  await page.fill('#faq-q', 'qwertyuiop');
  assert(await page.isVisible('text=Aucune question ne correspond'), 'empty state missing');
  await go('/');
  await page.goto(`${BASE}/questions-frequentes#new-york`);
  await page.waitForTimeout(300);
  assert((await page.locator('#new-york .acc__btn').getAttribute('aria-expanded')) === 'true', 'deep link did not open the answer');
  return `${n} result(s) for "métro"`;
});
await check('Language: EN translates, WO notice, choice persists, same page kept', async () => {
  await go('/l-ambassade/juridiction');
  await page.click('.header-tools .lang button:has-text("EN")');
  assert((await page.textContent('main h1')).includes('thirteen'), 'English title missing');
  assert(page.url().endsWith('/l-ambassade/juridiction'), 'language switch changed page');
  assert((await page.getAttribute('html', 'lang')) === 'en', 'lang not en');
  await page.click('.header-tools .lang button:has-text("WO")');
  assert(await page.isVisible('text=La version wolof est en préparation'), 'Wolof notice missing');
  assert((await page.getAttribute('html', 'lang')) === 'fr', 'Wolof fallback must declare fr');
  await page.click('.header-tools .lang button:has-text("FR")');
  await page.reload(); await page.waitForSelector('main h1');
  assert((await page.textContent('main h1')).includes('treize'), 'French not restored');
});

// ── Institution & news ───────────────────────────────────────────────
await check('Institution pages: jurisdiction, biography, former ambassadors', async () => {
  await go('/l-ambassade/juridiction');
  const c = await page.locator('.countries li').count();
  assert(c === 15, `expected 13 countries + IMF + World Bank, got ${c}`);
  await go('/l-ambassade/anciens-ambassadeurs');
  const h = await page.locator('.heads li').count();
  assert(h === 13, `expected 13 former ambassadors, got ${h}`);
  await go('/l-ambassade/ambassadeur');
  assert(await page.isVisible('text=Maldives'), 'biography missing');
  assert(await page.isVisible('text=Résumé rédigé par Dalal Studio'), 'summary note missing');
  return `13 countries + 2 institutions; ${h} former ambassadors`;
});
await check('News: filters, archive, article page, related items', async () => {
  await go('/actualites');
  const count = async () => Number((await page.textContent('[data-testid=news-count]')).match(/\d+/)[0]);
  const all = await count();
  await page.click('.seg button:has-text("Diplomatie")');
  const dip = await count();
  assert(dip > 0 && dip < all, 'category filter did nothing');
  await page.click('.seg button:has-text("Toutes")');
  assert(await page.isVisible('text=Avis passés, conservés pour mémoire'), 'archive missing');
  await go('/actualites/ag-onu-accord-de-paris');
  assert(await page.isVisible('.article-hero img'), 'article photo missing');
  assert(await page.isVisible('text=usage autorisé pour cette démonstration'), 'photo credit missing');
  assert((await page.locator('#rel-h').count()) === 1, 'related items missing');
  await go('/actualites/billets-coupe-du-monde-2026');
  assert(await page.isVisible('text=Cet avis est passé'), 'expired notice not flagged');
  return `${all} items; diplomatie → ${dip}`;
});
await check('Today panel: open/closed from Washington time (frozen clock)', async () => {
  const p2 = await ctx.newPage();
  await p2.clock.setFixedTime(new Date('2026-10-28T15:00:00Z')); // Wed 11:00 EDT
  await p2.goto(BASE + '/'); await p2.waitForSelector('[data-testid=status-embassy]');
  const open = await p2.textContent('[data-testid=status-embassy]');
  await p2.clock.setFixedTime(new Date('2026-10-31T15:00:00Z')); // Sat 11:00 EDT
  await p2.reload(); await p2.waitForSelector('[data-testid=status-embassy]');
  const sat = await p2.textContent('[data-testid=status-embassy]');
  await p2.clock.setFixedTime(new Date('2026-10-28T21:00:00Z')); // Wed 17:00 EDT
  await p2.reload(); await p2.waitForSelector('[data-testid=status-embassy]');
  const late = await p2.textContent('[data-testid=status-embassy]');
  const consular = await p2.textContent('[data-testid=status-consular]');
  await p2.close();
  assert(open === 'Ouvert' && sat === 'Fermé' && late === 'Fermé', `got ${open}/${sat}/${late}`);
  assert(consular === 'Jours à confirmer', 'consular days should stay unconfirmed');
  return 'Wed 11:00 open · Sat closed · Wed 17:00 closed · consular days unconfirmed';
});

// ── Simulations ──────────────────────────────────────────────────────
await check('Contact form: validation, sensitive-data guard, simulated send', async () => {
  await go('/contact');
  await page.click('[data-testid=contact-form] button[type=submit]');
  assert((await page.locator('[data-testid=contact-form] .field__error').count()) === 3, 'expected 3 errors');
  await page.selectOption('#cf-cat', 'visa');
  await page.fill('#cf-subject', 'Question fictive');
  await page.fill('#cf-msg', 'Mon numéro de sécurité sociale est 123-45-6789, est-ce utile ?');
  await page.click('[data-testid=contact-form] button[type=submit]');
  assert(await page.isVisible('text=semble contenir un numéro'), 'SSN-like text not blocked');
  await page.fill('#cf-msg', 'Question fictive sur la durée de séjour touristique au Sénégal.');
  await page.click('[data-testid=contact-form] button[type=submit]');
  await page.waitForSelector('[data-testid=contact-ack]');
  assert(await page.isVisible('a[href="tel:+12022340540"]'), 'click-to-call missing');
});
let ref = '';
await check('Assistance: validation, DEMO-WDC reference, five-stage tracker', async () => {
  await go('/assistance');
  await page.click('button:has-text("Envoyer la demande simulée")');
  assert((await page.locator('.field__error').count()) >= 4, 'validation errors missing');
  await page.locator('label.option:has-text("Visa")').click();
  await page.fill('#as-name', 'Awa Démo');
  await page.fill('#as-email', 'awa@demo.test');
  await page.fill('#as-msg', 'Passeport A12345678, que faire pour le renouveler ?');
  await page.locator('label.check--plain').click();
  await page.click('button:has-text("Envoyer la demande simulée")');
  assert(await page.isVisible('text=semble contenir un numéro'), 'passport number not blocked');
  await page.fill('#as-msg', 'Question fictive : combien de temps à l’avance demander un visa ?');
  await page.click('button:has-text("Envoyer la demande simulée")');
  assert(await page.isVisible('text=Envoi simulé'), 'loading state missing');
  await page.waitForSelector('[data-testid=ack]');
  ref = (await page.textContent('[data-testid=ref]')).trim();
  assert(/^DEMO-WDC-\d{4}-\d{4}$/.test(ref), `bad ref ${ref}`);
  await page.click('button:has-text("Suivre cette demande")');
  await page.waitForSelector('.stages');
  for (let i = 0; i < 4; i++) await page.click('[data-testid=advance]');
  assert((await page.locator('.stages__item--done').count()) === 5, 'did not reach stage 5');
  assert(await page.isVisible('text=Ceci n’est pas un suivi officiel'), 'not-official notice missing');
  await go('/assistance/suivi?ref=DEMO-WDC-2026-9999');
  await page.waitForSelector('.error-box');
  return `ref ${ref}; 5 stages; unknown ref → error`;
});
await check('Operations console: filters, search, detail, actions', async () => {
  await go('/demo/tableau-de-bord');
  const count = async () => Number(await page.textContent('[data-testid=dash-count]'));
  await page.click('.ops-seg button:has-text("Toutes")');
  const all = await count();
  assert(all >= 13, `expected 12 samples + simulated request, got ${all}`);
  assert(await page.isVisible(`text=${ref}`), 'simulated request missing');
  await page.selectOption('[data-testid=ops-prio]', 'high');
  const high = await count();
  assert(high > 0 && high < all, 'priority filter did nothing');
  await page.selectOption('[data-testid=ops-prio]', 'all');
  await page.fill('#ops-q', 'rapatriement');
  assert((await count()) === 1, 'search did not narrow to 1');
  await page.fill('#ops-q', '');
  await page.click('.ops-seg button:has-text("Ouvertes")');
  const open = await count();
  await page.locator('.queue button.row').first().click();
  const before = await page.locator('[data-testid=ops-detail] .timeline li').count();
  await page.click('[data-testid=ops-advance]');
  assert((await page.locator('[data-testid=ops-detail] .timeline li').count()) === before + 1, 'advance did not log');
  return `${all} requests; high → ${high}; open → ${open}`;
});
await check('Content-management demo: draft → review → published, logged', async () => {
  await go('/demo/contenus');
  await page.click('button:has-text("Soumettre pour validation")');
  assert(await page.isVisible('[role=alert]'), 'validation missing');
  await page.fill('#cms-title', 'Fermeture exceptionnelle (exemple)');
  await page.fill('#cms-body', 'Texte fictif pour démontrer le circuit de validation.');
  await page.click('button:has-text("Soumettre pour validation")');
  assert((await page.textContent('[data-testid=cms-state]')).includes('attente'), 'not in review');
  await page.click('button:has-text("Valider et publier")');
  assert((await page.textContent('[data-testid=cms-state]')).includes('Publié'), 'not published');
  assert((await page.locator('[data-testid=cms-log] li').count()) >= 2, 'log missing');
  await page.click('[role=tab]:has-text("horaires")');
  assert(await page.isVisible('#cms-hours'), 'tab did not switch');
});
await check('Platform reuse: fictional mission via ?mission=', async () => {
  const c2 = await browser.newContext();
  const p2 = await c2.newPage();
  await p2.goto(BASE + '/?mission=demo-alpha'); await p2.waitForSelector('main h1');
  const banner = await p2.isVisible('.fictional-strip');
  const name = await p2.textContent('.brand__name');
  const primary = await p2.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
  await c2.close();
  assert(banner && /Alpha/.test(name) && primary.toLowerCase() === '#1d3a5c', `banner=${banner} name=${name} primary=${primary}`);
  return 'fictional banner, own name and own theme';
});

// ── Compliance ───────────────────────────────────────────────────────
await check('Demo disclaimer and noindex on every page', async () => {
  for (const r of ROUTES) {
    await go(r);
    const strip = (await page.textContent('.demo-strip')) + (await page.textContent('.site-footer__legal'));
    assert(strip.includes('Maquette de démonstration non officielle — Projet proposé par Dalal Studio. Aucun service administratif réel n’est fourni sur cette plateforme.'), `disclaimer missing on ${r}`);
    assert((await page.getAttribute('meta[name=robots]', 'content')).includes('noindex'), `noindex missing on ${r}`);
  }
  return `${ROUTES.length} pages`;
});
const external = new Set();
await check('External links: HTTPS and rel="noopener noreferrer"', async () => {
  const bad = [];
  for (const r of ROUTES) {
    await go(r);
    for (const l of await page.$$eval('a[href^="http"]', (as) => as.map((a) => ({ href: a.href, rel: a.rel, target: a.target })))) {
      external.add(l.href);
      if (!l.href.startsWith('https://')) bad.push(l.href);
      if (l.target === '_blank' && !l.rel.includes('noopener')) bad.push(`rel ${l.href}`);
    }
  }
  assert(!bad.length, bad.join(', '));
  return `${external.size} external links`;
});
await check('Accessibility rules on every page', async () => {
  const issues = [];
  for (const r of ROUTES) {
    await go(r);
    const found = await page.evaluate(() => {
      const out = [];
      const nameOf = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim();
      if (document.querySelectorAll('h1').length !== 1) out.push(`h1×${document.querySelectorAll('h1').length}`);
      let prev = 1;
      document.querySelectorAll('main h1, main h2, main h3, main h4').forEach((h) => { const lv = +h.tagName[1]; if (lv > prev + 1) out.push(`skip h${prev}→h${lv} "${h.textContent.trim().slice(0, 25)}"`); prev = lv; });
      document.querySelectorAll('input, select, textarea').forEach((el) => { if (el.type === 'hidden') return; const ok = (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'); if (!ok) out.push(`unlabelled ${el.tagName}#${el.id}`); });
      document.querySelectorAll('button, a[href]').forEach((el) => { if (!nameOf(el)) out.push(`unnamed ${el.outerHTML.slice(0, 50)}`); });
      document.querySelectorAll('img').forEach((el) => { if (!el.hasAttribute('alt')) out.push('img no alt'); });
      document.querySelectorAll('svg').forEach((el) => { if (el.getAttribute('aria-hidden') !== 'true' && !el.closest('[aria-hidden="true"]') && !el.getAttribute('aria-label') && el.getAttribute('role') !== 'img') out.push('svg exposed'); });
      ['main', 'nav', 'header', 'footer'].forEach((tag) => { if (!document.querySelector(tag)) out.push(`no ${tag}`); });
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dup.length) out.push(`dup ids ${[...new Set(dup)].join(',')}`);
      document.querySelectorAll('[aria-controls]').forEach((el) => { const id = el.getAttribute('aria-controls'); if (el.getAttribute('aria-expanded') === 'true' && !document.getElementById(id)) out.push(`aria-controls → missing #${id}`); });
      return out;
    });
    found.forEach((f) => issues.push(`${r}: ${f}`));
  }
  assert(!issues.length, issues.slice(0, 5).join(' | '));
  return `${ROUTES.length} pages, 0 issues`;
});
await check('Contrast measured on rendered text (WCAG AA)', async () => {
  const fails = [];
  let checked = 0;
  for (const r of ROUTES) {
    await go(r);
    const res = await page.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) { const s = c.match(/color\(srgb ([^)]+)\)/); if (!s) return null; const v = s[1].split(/[\s/]+/).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; } const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
      const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bgOf = (el) => { let e = el; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('linear')) return null; const c = parse(cs.backgroundColor); if (c && c[3] > 0.95) return c; e = e.parentElement; } return [255, 255, 255, 1]; };
      const out = []; let n = 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement;
        if (!el || seen.has(el) || !walker.currentNode.textContent.trim()) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('.sr-only, [hidden], [aria-hidden="true"]') || el.offsetParent === null && cs.position !== 'fixed') continue;
        if (el.closest('input, textarea, select, button[disabled], option')) continue;
        const fg = parse(cs.color); const bg = bgOf(el);
        if (!fg || !bg) continue;
        const a = fg[3]; const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
        const [L1, L2] = [lum(mix), lum(bg)].sort((x, y) => y - x);
        const ratio = (L1 + 0.05) / (L2 + 0.05);
        const size = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 600;
        const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
        n++;
        if (ratio < need) out.push(`${ratio.toFixed(2)} "${walker.currentNode.textContent.trim().slice(0, 28)}"`);
      }
      return { n, out };
    });
    checked += res.n;
    res.out.forEach((o) => fails.push(`${r}: ${o}`));
  }
  assert(!fails.length, `${fails.length} failures: ${fails.slice(0, 4).join(' | ')}`);
  return `${checked} text elements on ${ROUTES.length} pages, all ≥ AA`;
});
await check('Keyboard: skip link first, focus moves to main', async () => {
  await go('/');
  await page.keyboard.press('Tab');
  assert((await page.evaluate(() => document.activeElement?.className)) === 'skip', 'skip link not first');
  await page.keyboard.press('Enter');
  assert((await page.evaluate(() => document.activeElement?.id)) === 'contenu', 'focus not on main');
});

// ── Responsive ───────────────────────────────────────────────────────
const widths = [375, 390, 768, 1024, 1440];
await check('No horizontal overflow at 375 / 390 / 768 / 1024 / 1440 px', async () => {
  const over = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const r of ROUTES) {
      await go(r);
      const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 1) over.push(`${r}@${w}(+${o})`);
    }
  }
  assert(!over.length, over.slice(0, 8).join(', '));
  return `${ROUTES.length} pages × ${widths.length} widths`;
});
await check('Mobile menu (390 px): open, language inside, navigate, Escape', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await go('/');
  assert(!(await page.isVisible('.main-nav')), 'desktop nav visible on mobile');
  await page.click('.menu-btn');
  assert((await page.getAttribute('.menu-btn', 'aria-expanded')) === 'true', 'aria-expanded');
  assert(await page.isVisible('#drawer .lang'), 'language switcher missing from drawer');
  await page.click('#drawer a:has-text("Actualités")');
  await page.waitForURL(/actualites/);
  await page.waitForSelector('#drawer', { state: 'hidden', timeout: 2000 }).catch(() => { throw new Error('drawer stayed open'); });
  await page.click('.menu-btn');
  await page.keyboard.press('Escape');
  assert((await page.getAttribute('.menu-btn', 'aria-expanded')) === 'false', 'Escape did not close');
});

// ── Performance budget (Lighthouse not available offline) ────────────
await check('Performance budget: weight, LCP, CLS on home (desktop + mobile)', async () => {
  const out = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const c3 = await browser.newContext({ viewport: { width: w, height: h } });
    const p3 = await c3.newPage();
    let bytes = 0;
    p3.on('response', async (res) => { try { bytes += (await res.body()).length; } catch {} });
    await p3.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await p3.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p3.waitForTimeout(500);
    const m = await p3.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, dcl: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }));
    await c3.close();
    out.push({ w, kb: Math.round(bytes / 1024), lcp: Math.round(m.lcp), cls: +m.cls.toFixed(3), dcl: Math.round(m.dcl) });
  }
  const bad = out.filter((o) => o.kb > 900 || o.lcp > 2500 || o.cls > 0.1);
  assert(!bad.length, JSON.stringify(bad));
  return out.map((o) => `${o.w}px: ${o.kb} kB, LCP ${o.lcp} ms, CLS ${o.cls}`).join(' · ');
});

// ── Screenshots ──────────────────────────────────────────────────────
await check('Screenshots captured', async () => {
  const list = [
    ['01-home-desktop', '/', 1440, true], ['02-home-mobile', '/', 390, false], ['03-home-mobile-full', '/', 390, true],
    ['04-services-desktop', '/services-consulaires', 1440, false], ['05-service-page-desktop', '/services-consulaires/passeport', 1440, false],
    ['06-service-page-mobile', '/services-consulaires/carte-consulaire', 390, false], ['07-finder-desktop', '/trouver-ma-demarche', 1440, false],
    ['08-embassy-desktop', '/l-ambassade', 1440, true], ['09-jurisdiction-tablet', '/l-ambassade/juridiction', 768, false],
    ['10-bilateral-desktop', '/senegal-etats-unis', 1440, true], ['11-article-desktop', '/actualites/ag-onu-accord-de-paris', 1440, false],
    ['12-contact-mobile', '/contact', 390, false], ['13-assistance-desktop', '/assistance', 1440, false],
    ['14-dashboard-desktop', '/demo/tableau-de-bord', 1440, false], ['15-dashboard-mobile', '/demo/tableau-de-bord', 390, false],
    ['16-cms-desktop', '/demo/contenus', 1440, false], ['17-home-tablet', '/', 1024, false],
  ];
  for (const [n, r, w, full] of list) {
    await page.setViewportSize({ width: w, height: w < 500 ? 844 : 900 });
    await go(r); await page.waitForTimeout(200);
    await page.screenshot({ path: `${shots}/${n}.png`, fullPage: full });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await go('/');
  await page.fill('#home-input', 'passeport');
  await page.waitForSelector('[role=option]');
  await page.screenshot({ path: `${shots}/18-search-suggestions.png` });
  return `${list.length + 1} screenshots`;
});
await check('No JavaScript errors in console', async () => { assert(!consoleErrors.length, consoleErrors.slice(0, 3).join(' | ')); });

await browser.close();
server.kill();
writeFileSync(`${root}tests/results.json`, JSON.stringify({ ranAt: new Date().toISOString(), failures, results, externalLinks: [...external].sort() }, null, 2));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
