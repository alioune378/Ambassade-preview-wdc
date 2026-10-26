import { useState } from 'react';
import { mission, missions, isPreview } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link, useRouter } from '../platform/router';
import { kindOrder, search } from '../platform/searchIndex';
import { Icon } from '../components/Icon';
import { PageHeader, useSeo } from '../components/ui';

export function NotFound() {
  const { t } = useI18n();
  useSeo(t.not_found, t.not_found_text);
  return (
    <>
      <PageHeader title={t.not_found} intro={t.not_found_text} />
      <div className="container section--tight btn-row">
        <Link to="/" className="btn btn--primary">{t.back_home}</Link>
        <Link to="/services-consulaires" className="btn btn--ghost">{t.all_services}</Link>
      </div>
    </>
  );
}

export function SearchResults() {
  const { t, l } = useI18n();
  const { loc, navigate } = useRouter();
  const q0 = loc.search.get('q') ?? '';
  const [q, setQ] = useState(q0);
  const hits = search(q0, 20);
  const label = { service: t.search_services, faq: t.search_faq, news: t.search_news, page: t.search_pages };
  useSeo(t.search_title, t.search_for(q0));
  return (
    <>
      <PageHeader title={q0 ? t.search_for(q0) : t.search_title} crumbs={[{ label: t.search_title }]}>
        <form role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/recherche?q=${encodeURIComponent(q.trim())}`); }} style={{ display: 'flex', gap: 10, maxWidth: 620, marginTop: 18 }}>
          <label htmlFor="sr-q" className="sr-only">{t.search_label}</label>
          <input id="sr-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="btn btn--primary">{t.search_button}</button>
        </form>
      </PageHeader>
      <div className="container section--tight" data-testid="search-results">
        <p className="results-count" aria-live="polite">{t.search_count(hits.length)}</p>
        {hits.length === 0 && <p className="empty">{t.search_none}</p>}
        {kindOrder.filter((k) => hits.some((h) => h.kind === k)).map((k) => (
          <section key={k} className="dir-group" aria-labelledby={`r-${k}`}>
            <h2 id={`r-${k}`}>{label[k]}</h2>
            <ul className="story-list">
              {hits.filter((h) => h.kind === k).map((h) => (
                <li key={h.id}><Link to={h.to} className="story" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><span><h3>{l(h.title)}</h3><p>{l(h.detail)}</p></span><Icon name="arrow" size={18} /></Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function TextPage({ title, intro, sections }: { title: string; intro: string; sections: [string, string][] }) {
  useSeo(title, intro);
  return (
    <>
      <PageHeader title={title} intro={intro} crumbs={[{ label: title }]} />
      <div className="container section--tight prose">
        {sections.map(([h, p]) => <section key={h} style={{ marginBottom: 28 }}><h2 style={{ fontSize: '1.4rem' }}>{h}</h2><p>{p}</p></section>)}
      </div>
    </>
  );
}

export function Privacy() {
  const { t } = useI18n();
  return <TextPage title={t.privacy_title} intro={t.privacy_intro} sections={t.privacy_sections} />;
}

export function Accessibility() {
  const { t } = useI18n();
  return <TextPage title={t.accessibility_title} intro={t.accessibility_intro} sections={t.accessibility_sections} />;
}

export function AboutDemo() {
  const { t, l } = useI18n();
  useSeo(t.demo_title, l(mission.demoLabel));
  return (
    <>
      <PageHeader title={t.demo_title} intro={l(mission.demoLabel)} crumbs={[{ label: t.demo_title }]} />
      <div className="container section--tight">
        <div className="two-col">
          {t.demo_rows.map(([h, p]) => <section key={h} className="card"><h2 style={{ fontSize: '1.25rem' }}>{h}</h2><p className="muted" style={{ margin: 0 }}>{p}</p></section>)}
        </div>
        {isPreview && (
          <section className="section--tight" aria-labelledby="mm-h">
            <h2 id="mm-h">{t.mission_switch}</h2>
            <p className="muted">{t.mission_switch_text}</p>
            <ul className="doc-list">
              {Object.entries(missions).map(([id, p]) => (
                <li key={id}><Icon name="arrow" size={16} /><a href={`/?mission=${id}`}>{l(p.config.name)}</a>{p.config.fictional && <span className="chip chip--fictional">{t.fictionalBadge}</span>}{id === mission.id && <span className="chip chip--dark">{t.current}</span>}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
