import { useMemo, useState } from 'react';
import { content } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { matches } from '../platform/search';
import { NewsMeta, StoryList } from '../components/blocks';
import { Icon } from '../components/Icon';
import { ExternalLink, PageHeader, useSeo, VerifyBadge } from '../components/ui';
import { NotFound } from './Misc';

export function News() {
  const { t, l } = useI18n();
  useSeo(t.news_title, t.news_intro);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const shown = useMemo(
    () => content.news.filter((n) => (cat === 'all' || n.category === cat) && matches(q, n.title.fr, n.title.en, n.summary.fr, n.summary.en)),
    [q, cat],
  );
  const current = shown.filter((n) => !n.expired);
  const archive = shown.filter((n) => n.expired);
  return (
    <>
      <PageHeader title={t.news_title} intro={t.news_intro} crumbs={[{ label: t.nav_news }]} />
      <div className="container section--tight">
        <div className="filters">
          <div className="field">
            <label htmlFor="news-q" className="field__label">{t.news_search}</label>
            <input id="news-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="seg" role="group" aria-label={t.news_filter}>
            <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{t.filter_all}</button>
            {content.newsCategories.map((c) => <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{l(c.label)}</button>)}
          </div>
          <p className="results-count" aria-live="polite" data-testid="news-count">{t.news_results(shown.length)}</p>
        </div>
        {shown.length === 0 && <p className="empty">{t.news_none}</p>}
        {current.length > 0 && <><h2 className="sr-only">{t.news_recent}</h2><StoryList items={current} /></>}
        {archive.length > 0 && (
          <section style={{ marginTop: 48 }} aria-labelledby="arch-h">
            <h2 id="arch-h">{t.news_archive}</h2>
            <p className="muted">{t.news_archive_note}</p>
            <StoryList items={archive} />
          </section>
        )}
      </div>
    </>
  );
}

export function Article({ id }: { id: string }) {
  const { t, l } = useI18n();
  const n = content.news.find((x) => x.id === id);
  useSeo(n ? l(n.title) : t.not_found, n ? l(n.summary) : '');
  if (!n) return <NotFound />;
  const related = content.news.filter((x) => x.id !== n.id && (x.category === n.category || !x.expired)).slice(0, 3);
  return (
    <>
      <PageHeader title={l(n.title)} crumbs={[{ label: t.nav_news, to: '/actualites' }, { label: l(n.title).slice(0, 48) + (l(n.title).length > 48 ? '…' : '') }]}>
        <NewsMeta n={n} />
      </PageHeader>
      <article className="container section--tight">
        <div className="prose">
          {n.image && (
            <figure className="article-hero">
              <img src={n.image.src} alt={l(n.image.alt)} width={1080} height={720} style={{ objectPosition: n.image.position }} />
              <figcaption className="credit">{l(n.image.credit)}</figcaption>
            </figure>
          )}
          <p style={{ fontSize: '1.2rem', color: 'var(--midnight)' }}>{l(n.summary)}</p>
          {n.body?.map((p, i) => <p key={i}>{l(p)}</p>)}
          {n.expired && <p className="to-confirm"><Icon name="info" size={18} /><span>{t.news_expired_note}</span></p>}
          <VerifyBadge v={n.verification} />
          {n.source && <p style={{ marginTop: 18 }}><ExternalLink href={n.source} className="link-arrow">{t.news_source}</ExternalLink></p>}
        </div>
        {related.length > 0 && (
          <section style={{ marginTop: 56 }} aria-labelledby="rel-h">
            <h2 id="rel-h">{t.news_related}</h2>
            <StoryList items={related} />
          </section>
        )}
        <p style={{ marginTop: 28 }}><Link to="/actualites" className="link-arrow">← {t.news_back}</Link></p>
      </article>
    </>
  );
}
