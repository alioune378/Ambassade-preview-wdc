import { useEffect, useState, type ReactNode } from 'react';
import type { FinderQuestion, Service, Verified } from '../platform/types';
import { content, mission } from '../platform/mission';
import { formatDate, useI18n } from '../platform/i18n';
import { Link, useRouter } from '../platform/router';
import { matches } from '../platform/search';
import { AvailChip, FaqList, HoursTable, IndexItem, visitPrepItems } from '../components/blocks';
import { Checklist } from '../components/Checklist';
import { Icon } from '../components/Icon';
import { ExternalLink, PageHeader, ToConfirm, useSeo, VerifyBadge } from '../components/ui';
import { NotFound } from './Misc';

export function ServicesDirectory() {
  const { t, l } = useI18n();
  const { loc, navigate } = useRouter();
  const [q, setQ] = useState(loc.search.get('q') ?? '');
  const [cat, setCat] = useState<string>(loc.search.get('cat') ?? 'all');
  useSeo(t.dir_title, t.dir_intro);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (cat !== 'all') p.set('cat', cat);
    const qs = p.toString();
    navigate(`/services-consulaires${qs ? `?${qs}` : ''}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat]);

  const shown = content.services.filter(
    (s) => (cat === 'all' || s.category === cat) && matches(q, s.title.fr, s.title.en, s.summary.fr, s.summary.en, s.keywords.join(' ')),
  );
  let n = 0;
  return (
    <>
      <PageHeader title={t.dir_title} intro={t.dir_intro} crumbs={[{ label: t.nav_services }]}>
        <div className="page-head__meta"><Link to="/trouver-ma-demarche" className="btn btn--primary">{t.finder_cta} <Icon name="arrow" size={18} /></Link></div>
      </PageHeader>
      <div className="container section--tight">
        <div className="filters">
          <div className="field">
            <label htmlFor="dir-q" className="field__label">{t.dir_search}</label>
            <input id="dir-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search_placeholder} />
          </div>
          <div className="seg" role="group" aria-label={t.dir_filter}>
            <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{t.filter_all}</button>
            {content.categories.map((c) => <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{l(c.title)}</button>)}
          </div>
          <p className="results-count" aria-live="polite" data-testid="results-count">{t.results(shown.length)}</p>
        </div>
        {shown.length === 0 && <p className="empty">{t.no_results}</p>}
        {content.categories.filter((c) => shown.some((s) => s.category === c.id)).map((c) => (
          <section key={c.id} className="dir-group" aria-labelledby={`cat-${c.id}`}>
            <h2 id={`cat-${c.id}`}>{l(c.title)}</h2>
            <div className="index">
              {shown.filter((s) => s.category === c.id).map((s) => {
                n += 1;
                return <IndexItem key={s.slug} n={n} to={`/services-consulaires/${s.slug}`} title={l(s.title)} text={l(s.summary)} chip={<AvailChip s={s} />} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function ServicePage({ slug }: { slug: string }) {
  const svc = content.services.find((s) => s.slug === slug);
  if (!svc) return <NotFound />;
  return <ServiceDetail s={svc} />;
}

type Dot = 'ok' | 'tbc' | 'na';
const has = (f?: Verified<unknown>) => !!f && f.value !== null && !(Array.isArray(f.value) && f.value.length === 0);
const dotOf = (f?: Verified<unknown>): Dot => (!f ? 'na' : has(f) ? (f.status === 'unverified' ? 'tbc' : 'ok') : 'tbc');

function ServiceDetail({ s }: { s: Service }) {
  const { t, l, lang } = useI18n();
  const cat = content.categories.find((c) => c.id === s.category);
  useSeo(l(s.title), l(s.summary));
  const lastChecked = [s.description, s.documents, s.fees, s.processing, s.presence, s.howTo].map((f) => f.checkedOn).filter(Boolean).sort().pop();
  const related = content.faq.filter((f) => s.faq.includes(f.id));

  const blocks: { id: string; title: string; dot: Dot; body: ReactNode }[] = [
    { id: 'description', title: t.s_description, dot: dotOf(s.description), body: has(s.description) ? <><p>{l(s.description.value!)}</p><VerifyBadge v={s.description} /></> : <ToConfirm /> },
    { id: 'eligibilite', title: t.s_eligibility, dot: dotOf(s.eligibility), body: has(s.eligibility) ? <><p>{l(s.eligibility.value!)}</p><VerifyBadge v={s.eligibility} /></> : <ToConfirm /> },
    {
      id: 'documents', title: t.s_documents, dot: dotOf(s.documents),
      body: has(s.documents) ? <><ul className="doc-list">{s.documents.value!.map((d) => <li key={d.id}><Icon name="doc" size={16} /> {l(d.text)}</li>)}</ul><VerifyBadge v={s.documents} /></> : <ToConfirm />,
    },
    {
      id: 'frais', title: t.s_fees, dot: dotOf(s.fees),
      body: has(s.fees) ? <><table className="fee-table"><tbody>{s.fees.value!.map((f) => <tr key={f.label.fr}><th scope="row">{l(f.label)}</th><td>{f.amount}</td></tr>)}</tbody></table><VerifyBadge v={s.fees} /></> : <ToConfirm />,
    },
    { id: 'delai', title: t.s_processing, dot: dotOf(s.processing), body: has(s.processing) ? <><p>{l(s.processing.value!)}</p><VerifyBadge v={s.processing} /></> : <ToConfirm /> },
    { id: 'demande', title: t.s_howto, dot: dotOf(s.howTo), body: has(s.howTo) ? <><p>{l(s.howTo.value!)}</p><VerifyBadge v={s.howTo} /></> : <ToConfirm /> },
    {
      id: 'prise-de-rendez-vous', title: t.s_appointment, dot: s.appointment === 'unknown' || s.appointment === 'contact' ? 'tbc' : 'ok',
      body: s.appointment === 'portal' && mission.appointment.value
        ? <><p><ExternalLink href={mission.appointment.value.url} className="btn btn--primary">{t.portal_cta}</ExternalLink></p><VerifyBadge v={mission.appointment} /></>
        : s.appointment === 'walk-in' ? <p>{t.walk_in}</p>
        : <><ToConfirm note={t.contact_route} /><p style={{ marginTop: 14 }}><Link to="/rendez-vous" className="link-arrow">{t.book_cta}</Link></p></>,
    },
    { id: 'presence', title: t.s_presence, dot: dotOf(s.presence), body: has(s.presence) ? <><p>{l(s.presence.value!)}</p><VerifyBadge v={s.presence} /></> : <ToConfirm /> },
    { id: 'horaires', title: t.s_hours, dot: s.hours.length ? 'ok' : 'tbc', body: s.hours.length ? <HoursTable ids={s.hours} /> : <ToConfirm /> },
    {
      id: 'formulaires', title: t.s_forms, dot: dotOf(s.forms),
      body: has(s.forms) ? <ul className="doc-list">{s.forms.value!.map((f) => <li key={f.url}><Icon name="download" size={16} /> <ExternalLink href={f.url}>{l(f.label)}</ExternalLink></li>)}</ul> : <ToConfirm note={t.forms_none} />,
    },
    {
      id: 'liste', title: t.s_checklist, dot: has(s.documents) ? 'ok' : 'tbc',
      body: has(s.documents)
        ? <Checklist title={l(s.title)} items={s.documents.value!} />
        : <><p className="muted">{t.checklist_generic}</p><Checklist title={`${t.prep_title} — ${l(s.title)}`} items={visitPrepItems()} /></>,
    },
    { id: 'questions', title: t.s_faq, dot: related.length ? 'ok' : 'tbc', body: related.length ? <FaqList ids={s.faq} searchable={false} level={3} /> : <ToConfirm note={t.faq_none_service} /> },
    {
      id: 'source', title: t.s_verified, dot: lastChecked ? 'ok' : 'tbc',
      body: <>
        <p>{lastChecked ? `${t.last_checked} ${formatDate(lastChecked, lang)}` : t.never_checked}</p>
        <p className="muted">{s.audit === 'menu-only' ? t.audit_menu_only : s.audit === 'faq-only' ? t.audit_faq_only : s.audit === 'not-reviewed' ? t.audit_not_reviewed : t.audit_reviewed}</p>
        {s.officialPage && !mission.fictional && <p><ExternalLink href={s.officialPage} className="link-arrow">{t.f_official}</ExternalLink></p>}
      </>,
    },
  ];

  return (
    <>
      <PageHeader eyebrow={l(cat?.title)} title={l(s.title)} intro={l(s.summary)} crumbs={[{ label: t.nav_services, to: '/services-consulaires' }, { label: l(s.title) }]}>
        <div className="page-head__meta"><AvailChip s={s} />{lastChecked && <span className="chip chip--neutral">{t.last_checked} {formatDate(lastChecked, lang)}</span>}</div>
      </PageHeader>
      <div className="container section--tight svc">
        <nav className="toc no-print" aria-label={t.on_this_page}>
          <p>{t.on_this_page}</p>
          <ol>{blocks.map((b) => <li key={b.id}><a href={`#${b.id}`}><span className={`d d--${b.dot}`} aria-hidden="true" />{b.title}<span className="sr-only"> — {b.dot === 'ok' ? t.status_available : t.to_confirm}</span></a></li>)}</ol>
          <p style={{ marginTop: 18, fontSize: '.8rem', letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}><span className="d d--ok" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', marginRight: 6 }} />{t.legend_ok}<br /><span className="d d--tbc" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', marginRight: 6 }} />{t.to_confirm}</p>
        </nav>
        <div>
          {blocks.map((b, i) => (
            <section key={b.id} id={b.id} className="block" aria-labelledby={`${b.id}-h`}>
              <h2 id={`${b.id}-h`}><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{b.title}</h2>
              {b.body}
            </section>
          ))}
          <section className="help-card" aria-labelledby="help-h">
            <h2 id="help-h">{t.s_contact}</h2>
            <p>{t.help_service}</p>
            <div className="btn-row"><Link to="/assistance" className="btn btn--light">{t.a_title}</Link><Link to="/contact" className="btn btn--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>{t.nav_contact}</Link></div>
          </section>
        </div>
      </div>
    </>
  );
}

/** Guided service finder: one or two questions, then the right page. */
export function Finder() {
  const { t, l } = useI18n();
  const { navigate } = useRouter();
  useSeo(t.finder_title, t.finder_intro);
  const [path, setPath] = useState<FinderQuestion[]>([content.finder]);
  const current = path.at(-1)!;
  return (
    <>
      <PageHeader title={t.finder_title} intro={t.finder_intro} crumbs={[{ label: t.nav_services, to: '/services-consulaires' }, { label: t.finder_title }]} />
      <div className="container section--tight">
        <div className="finder" data-testid="finder">
          <div className="finder__progress" aria-hidden="true"><i className="on" /><i className={path.length > 1 ? 'on' : ''} /><i /></div>
          <p className="kicker kicker--plain">{t.finder_step(path.length)}</p>
          <h2 className="finder__q" id="fq" tabIndex={-1}>{l(current.question)}</h2>
          <div className="finder__opts" role="list" aria-labelledby="fq">
            {current.options.map((o) => (
              <button
                key={o.label.fr}
                type="button"
                role="listitem"
                className="finder__opt"
                onClick={() => {
                  if (o.next) { setPath([...path, o.next]); window.setTimeout(() => document.getElementById('fq')?.focus(), 0); }
                  else if (o.to) navigate(o.to);
                }}
              >
                <span><b>{l(o.label)}</b>{o.hint && <small>{l(o.hint)}</small>}</span>
                <Icon name="arrow" size={20} />
              </button>
            ))}
          </div>
          <div className="finder__nav">
            {path.length > 1 && <button type="button" className="btn btn--ghost" onClick={() => setPath(path.slice(0, -1))}>{t.finder_back}</button>}
            <Link to="/services-consulaires" className="link-arrow" style={{ alignSelf: 'center' }}>{t.all_services}</Link>
          </div>
          <p className="muted small" style={{ marginTop: 28 }}>{t.finder_note}</p>
        </div>
      </div>
    </>
  );
}
