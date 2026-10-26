import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Priority, SampleRequest, Stage } from '../platform/types';
import { content, mission } from '../platform/mission';
import { advance, findRequest, loadRequests, looksSensitive, makeRef, median, priorities, saveRequest, stages, type SimRequest } from '../platform/assistance';
import { formatDate, useI18n } from '../platform/i18n';
import { Link, useRouter } from '../platform/router';
import { matches } from '../platform/search';
import { Icon } from '../components/Icon';
import { PageHeader, useSeo } from '../components/ui';

export function useStageLabel() {
  const { t } = useI18n();
  return (s: Stage) => ({ received: t.a_stage_received, assigned: t.a_stage_assigned, processing: t.a_stage_processing, answer: t.a_stage_answer, closed: t.a_stage_closed })[s];
}

export function Assistance() {
  const { t, l } = useI18n();
  const { navigate } = useRouter();
  useSeo(t.a_title, t.a_intro);
  const [cat, setCat] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<SimRequest | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!cat) err.cat = t.err_required;
    if (!name.trim()) err.name = t.err_required;
    else if (looksSensitive(name)) err.name = t.err_sensitive;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) err.email = t.err_email;
    if (msg.trim().length < 20) err.msg = t.err_short;
    else if (looksSensitive(msg)) err.msg = t.err_sensitive;
    if (!consent) err.consent = t.err_consent;
    setErrors(err);
    if (Object.keys(err).length) { document.getElementById(`as-${Object.keys(err)[0]}`)?.focus(); return; }
    setBusy(true);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      const req: SimRequest = { ref: makeRef(), category: cat, name: name.trim(), subject: msg.trim().slice(0, 140), createdAt: now, stage: 'received', history: [{ stage: 'received', at: now }] };
      saveRequest(req);
      setBusy(false);
      setDone(req);
    }, 700);
  };

  return (
    <>
      <PageHeader eyebrow={t.a_badge} title={t.a_title} intro={t.a_intro} crumbs={[{ label: t.a_title }]}>
        <div className="page-head__meta"><span className="sim-tag">{t.simulation}</span><span className="chip chip--tbc">{t.a_not_tracker}</span></div>
      </PageHeader>
      <div className="container section--tight two-col two-col--wide">
        <div>
          {done ? (
            <div className="ack" role="status" data-testid="ack">
              <Icon name="check" size={30} />
              <h2 style={{ margin: 0 }}>{t.a_ack_title}</h2>
              <p style={{ margin: 0 }}>{t.a_ack_text}</p>
              <p className="ack__ref" data-testid="ref">{done.ref}</p>
              <p className="muted small">{t.a_ack_note}</p>
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--primary" onClick={() => navigate(`/assistance/suivi?ref=${done.ref}`)}>{t.a_track}</button>
                <button type="button" className="btn btn--ghost" onClick={() => { setDone(null); setMsg(''); setConsent(false); }}>{t.a_new}</button>
              </div>
            </div>
          ) : (
            <form className="form" noValidate onSubmit={submit} data-testid="assist-form" aria-busy={busy}>
              <fieldset className="field">
                <legend className="field__label">{t.a_category}</legend>
                <div className="option-grid">
                  {content.assistance.categories.map((c, i) => (
                    <label key={c.id} className={`option ${cat === c.id ? 'option--on' : ''}`}>
                      <input type="radio" name="cat" value={c.id} checked={cat === c.id} onChange={() => setCat(c.id)} id={i === 0 ? 'as-cat' : undefined} />
                      {l(c.label)}
                    </label>
                  ))}
                </div>
                {errors.cat && <p className="field__error">{errors.cat}</p>}
              </fieldset>
              <div className="two-col" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="as-name" className="field__label">{t.a_name}</label>
                  <input id="as-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'as-name-e' : undefined} />
                  {errors.name && <p id="as-name-e" className="field__error">{errors.name}</p>}
                </div>
                <div className="field">
                  <label htmlFor="as-email" className="field__label">{t.a_email}</label>
                  <input id="as-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.test" autoComplete="off" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'as-email-e' : undefined} />
                  {errors.email && <p id="as-email-e" className="field__error">{errors.email}</p>}
                </div>
              </div>
              <div className="field">
                <label htmlFor="as-msg" className="field__label">{t.a_message}</label>
                <textarea id="as-msg" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} aria-invalid={!!errors.msg} aria-describedby={`as-msg-h${errors.msg ? ' as-msg-e' : ''}`} />
                <p id="as-msg-h" className="field__help">{t.a_message_help}</p>
                {errors.msg && <p id="as-msg-e" className="field__error">{errors.msg}</p>}
              </div>
              <label className="check check--plain">
                <input id="as-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} />
                <span className="check__box" aria-hidden="true"><Icon name="check" size={14} /></span>
                <span className="check__text">{t.a_consent}</span>
              </label>
              {errors.consent && <p className="field__error">{errors.consent}</p>}
              <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? <><span className="spinner" aria-hidden="true" /> {t.a_sending}</> : t.a_submit}</button>
            </form>
          )}
        </div>
        <aside>
          <div className="card">
            <h2 style={{ fontSize: '1.3rem' }}>{t.a_track_title}</h2>
            <TrackForm />
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1.3rem' }}>{t.a_how_title}</h2>
            <ol className="doc-list">{stages.map((s, i) => <li key={s}><span className="mono" style={{ color: 'var(--gold-text)' }}>{i + 1}</span> <StageName s={s} /></li>)}</ol>
            <p style={{ marginTop: 16 }}><Link to="/demo/tableau-de-bord" className="link-arrow">{t.a_dashboard_link} <Icon name="arrow" size={16} /></Link></p>
          </div>
        </aside>
      </div>
    </>
  );
}

function StageName({ s }: { s: Stage }) {
  return <>{useStageLabel()(s)}</>;
}

function TrackForm({ initial = '' }: { initial?: string }) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [ref, setRef] = useState(initial);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ref.trim()) navigate(`/assistance/suivi?ref=${encodeURIComponent(ref.trim())}`); }} style={{ display: 'grid', gap: 10 }}>
      <div className="field">
        <label htmlFor="tr-ref" className="field__label">{t.a_track_label}</label>
        <input id="tr-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder={`${mission.refPrefix}-2026-0001`} className="mono" />
      </div>
      <button type="submit" className="btn btn--ghost">{t.a_track_button}</button>
    </form>
  );
}

export function Tracker() {
  const { t, l } = useI18n();
  const { loc } = useRouter();
  const ref = loc.search.get('ref') ?? '';
  const stageLabel = useStageLabel();
  const [state, setState] = useState<'loading' | 'found' | 'missing'>('loading');
  const [req, setReq] = useState<SimRequest | null>(null);
  useSeo(t.a_track_title, t.a_intro);
  useEffect(() => {
    setState('loading');
    const id = window.setTimeout(() => {
      const r = ref ? findRequest(ref) : undefined;
      setReq(r ?? null);
      setState(r ? 'found' : 'missing');
    }, 450);
    return () => window.clearTimeout(id);
  }, [ref]);
  return (
    <>
      <PageHeader eyebrow={t.a_badge} title={t.a_track_title} crumbs={[{ label: t.a_title, to: '/assistance' }, { label: t.a_track_title }]}>
        <div className="page-head__meta"><span className="sim-tag">{t.simulation}</span><span className="chip chip--tbc">{t.a_not_tracker}</span></div>
      </PageHeader>
      <div className="container section--tight two-col two-col--wide">
        <div aria-live="polite" data-testid="tracker">
          {state === 'loading' && <p className="loading"><span className="spinner" aria-hidden="true" /> {t.a_track_loading}</p>}
          {state === 'missing' && <div className="error-box" role="alert"><Icon name="alert" size={18} /> {t.a_track_notfound}</div>}
          {state === 'found' && req && (
            <div className="card">
              <p className="kicker kicker--plain">{l(content.assistance.categories.find((c) => c.id === req.category)?.label)}</p>
              <p className="ack__ref" style={{ display: 'inline-block' }}>{req.ref}</p>
              <ol className="stages">
                {stages.map((s, i) => {
                  const reached = stages.indexOf(req.stage) >= i;
                  const at = req.history.find((h) => h.stage === s)?.at;
                  return (
                    <li key={s} className={`stages__item ${reached ? 'stages__item--done' : ''}`} aria-current={req.stage === s ? 'step' : undefined}>
                      <span className="stages__dot" aria-hidden="true">{reached ? '✓' : i + 1}</span>
                      <span className="stages__label">{stageLabel(s)}</span>
                      {at && <span className="stages__time">{new Date(at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>}
                    </li>
                  );
                })}
              </ol>
              {req.stage !== 'closed' && <button type="button" className="btn btn--ghost" onClick={() => setReq(advance(req))} data-testid="advance">{t.a_advance}</button>}
              <p className="muted small" style={{ marginTop: 14 }}>{t.a_ack_note}</p>
            </div>
          )}
        </div>
        <aside className="card"><TrackForm initial={ref} /></aside>
      </div>
    </>
  );
}

// ─────────────── Operations console ───────────────


export function Dashboard() {
  const { t, l, lang } = useI18n();
  const stageLabel = useStageLabel();
  useSeo(t.d_title, t.d_intro);
  const [status, setStatus] = useState<Stage | 'all' | 'open'>('open');
  const [cat, setCat] = useState('all');
  const [prio, setPrio] = useState<Priority | 'all'>('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<SampleRequest[]>(() => {
    const local: SampleRequest[] = loadRequests().map((r) => ({
      ref: r.ref, category: r.category, subject: { fr: r.subject, en: r.subject }, received: r.createdAt.slice(0, 10), stage: r.stage, priority: 'normal', firstReplyHours: null,
      history: r.history.map((h) => ({ stage: h.stage, at: h.at.replace('T', ' ').slice(0, 16), by: t.d_citizen })),
    }));
    return [...local, ...content.assistance.samples];
  });

  const catLabel = (id: string) => l(content.assistance.categories.find((c) => c.id === id)?.label) || id;
  const shown = useMemo(() => rows.filter((r) =>
    (status === 'all' || (status === 'open' ? r.stage !== 'closed' : r.stage === status)) &&
    (cat === 'all' || r.category === cat) && (prio === 'all' || r.priority === prio) &&
    matches(q, r.ref, r.subject.fr, r.subject.en)), [rows, status, cat, prio, q]);
  const sel = rows.find((r) => r.ref === (selected ?? shown.at(0)?.ref));

  const open = rows.filter((r) => r.stage !== 'closed').length;
  const high = rows.filter((r) => r.priority === 'high' && r.stage !== 'closed').length;
  const med = median(rows.map((r) => r.firstReplyHours).filter((x): x is number => x !== null));
  const stageCounts = stages.map((s) => rows.filter((r) => r.stage === s).length);
  const stageColors = ['#a9c7ff', '#c7b5ff', '#f1c76e', '#7fe0b4', '#55627a'];

  const act = (next?: Stage, priority?: Priority) => {
    if (!sel) return;
    setRows(rows.map((r) => r.ref !== sel.ref ? r : {
      ...r,
      stage: next ?? r.stage,
      priority: priority ?? r.priority,
      history: next ? [...r.history, { stage: next, at: new Date().toISOString().replace('T', ' ').slice(0, 16), by: t.d_you }] : r.history,
    }));
  };
  const nextStage = sel ? stages.at(stages.indexOf(sel.stage) + 1) : undefined;

  return (
    <div className="ops" data-testid="dashboard">
      <div className="ops__bar">
        <div className="container">
          <h1>{t.d_title}</h1>
          <span className="chip">{t.d_badge}</span>
          <span className="ops__clock" aria-hidden="true">{mission.refPrefix} · {mission.city}</span>
        </div>
      </div>
      <div className="container">
        <p style={{ margin: '14px 0 0', color: '#9aa4b4', fontSize: '.9rem' }}>{t.d_intro} <Link to="/assistance">{t.a_title}</Link></p>
        <div className="kpis" role="group" aria-label={t.d_kpis}>
          <div className="kpi"><div className="kpi__n">{rows.length}</div><div className="kpi__l">{t.d_incoming}</div>
            <div className="kpi__bar" aria-hidden="true">{stageCounts.map((c, i) => <i key={i} style={{ width: `${(c / rows.length) * 100}%`, background: stageColors[i] }} />)}</div></div>
          <div className="kpi"><div className="kpi__n">{open}</div><div className="kpi__l">{t.d_open}</div></div>
          <div className="kpi"><div className="kpi__n" style={{ color: high ? '#f08a7a' : '#fff' }}>{high}</div><div className="kpi__l">{t.d_urgent}</div></div>
          <div className="kpi"><div className="kpi__n">{t.d_hours(med)}</div><div className="kpi__l">{t.d_median}</div></div>
        </div>
        <div className="ops__body">
          <div className="ops__queue">
            <div className="ops__filters">
              <label className="sr-only" htmlFor="ops-q">{t.d_search}</label>
              <input id="ops-q" type="search" placeholder={t.d_search} value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="ops-seg" role="group" aria-label={t.d_filter_status}>
                {(['open', 'all', 'closed'] as const).map((s) => <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>{s === 'open' ? t.d_open : s === 'all' ? t.filter_all : stageLabel('closed')}</button>)}
              </div>
              <label>{t.d_filter_dept}
                <select value={cat} onChange={(e) => setCat(e.target.value)} data-testid="ops-cat">
                  <option value="all">{t.filter_all}</option>
                  {content.assistance.categories.map((c) => <option key={c.id} value={c.id}>{l(c.label)}</option>)}
                </select>
              </label>
              <label>{t.d_filter_priority}
                <select value={prio} onChange={(e) => setPrio(e.target.value as Priority | 'all')} data-testid="ops-prio">
                  <option value="all">{t.filter_all}</option>
                  {priorities.map((p) => <option key={p} value={p}>{t[`p_${p}`]}</option>)}
                </select>
              </label>
            </div>
            <p style={{ fontSize: '.82rem', color: '#9aa4b4', margin: '0 0 8px' }} aria-live="polite"><span data-testid="dash-count">{shown.length}</span> / {rows.length}</p>
            <div className="queue-wrap">
              <div className="queue queue-min">
                <div className="queue__head" aria-hidden="true"><span /><span>{t.d_ref}</span><span>{t.d_subject}</span><span>{t.d_department}</span><span>{t.d_status}</span><span>{t.d_received}</span></div>
                <ul className="queue__list" aria-label={t.d_title}>
                  {shown.map((r) => (
                    <li key={r.ref}>
                      <button type="button" className="row" onClick={() => setSelected(r.ref)} aria-pressed={sel?.ref === r.ref} aria-label={`${r.ref}, ${l(r.subject)}, ${catLabel(r.category)}, ${stageLabel(r.stage)}, ${t.d_priority} ${t[`p_${r.priority}`]}`}>
                        <span className={`prio prio--${r.priority}`} />
                        <span className="ref">{r.ref}</span>
                        <span className="subj">{l(r.subject)}</span>
                        <span className="cat">{catLabel(r.category)}</span>
                        <span className={`st st--${r.stage}`}>{stageLabel(r.stage)}</span>
                        <span className="age">{formatDate(r.received, lang).replace(/ \d{4}$/, '')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {shown.length === 0 && <p style={{ color: '#9aa4b4', padding: '20px 0' }}>{t.d_none}</p>}
            </div>
          </div>
          <aside className="ops__detail detail" aria-live="polite" data-testid="ops-detail">
            {sel ? (
              <>
                <span className="ref" style={{ font: '500 .85rem var(--mono)', color: '#e7c983' }}>{sel.ref}</span>
                <h2>{l(sel.subject)}</h2>
                <dl>
                  <dt>{t.d_department}</dt><dd>{catLabel(sel.category)}</dd>
                  <dt>{t.d_status}</dt><dd><span className={`st st--${sel.stage}`}>{stageLabel(sel.stage)}</span></dd>
                  <dt>{t.d_priority}</dt><dd>{t[`p_${sel.priority}`]}</dd>
                  <dt>{t.d_received}</dt><dd>{formatDate(sel.received, lang)}</dd>
                  <dt>{t.d_first_reply}</dt><dd>{sel.firstReplyHours !== null ? t.d_hours(sel.firstReplyHours) : '—'}</dd>
                </dl>
                <p style={{ font: '600 .7rem var(--sans)', letterSpacing: '.12em', textTransform: 'uppercase', color: '#8d97a8', margin: '18px 0 4px' }}>{t.d_history}</p>
                <ol className="timeline">
                  {sel.history.map((h, i) => <li key={i}><span className="when">{h.at} · {h.by}</span>{stageLabel(h.stage)}{h.note ? ` — ${l(h.note)}` : ''}</li>)}
                </ol>
                <div className="btn-row">
                  {nextStage && <button type="button" className="btn btn--light btn--sm" onClick={() => act(nextStage)} data-testid="ops-advance">{t.d_move_to} {stageLabel(nextStage)}</button>}
                  {sel.priority !== 'high' && sel.stage !== 'closed' && <button type="button" className="btn btn--ghost btn--sm" onClick={() => act(undefined, 'high')}>{t.d_flag}</button>}
                </div>
                <p className="ops-note">{t.d_note}</p>
              </>
            ) : <p>{t.d_none}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
}
