import { useState } from 'react';
import { content, mission } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { readStore, writeStore } from '../platform/storage';
import { Icon } from '../components/Icon';
import { PageHeader, useSeo } from '../components/ui';

type State = 'draft' | 'review' | 'published';
interface Draft { title: string; body: string; category: string; state: State }
interface LogLine { at: string; who: string; what: string }

const KEY = `cms:${mission.id}`;
const empty: Draft = { title: '', body: '', category: content.newsCategories[0]?.id ?? '', state: 'draft' };

/**
 * Content-management demonstration. Shows the editorial workflow an authorized
 * team could use (draft → approval → published) with a preview and an action
 * log. Nothing here changes the site; everything stays in this browser.
 */
export function Cms() {
  const { t, l } = useI18n();
  useSeo(t.cms_title, t.cms_intro);
  const saved = readStore<{ draft: Draft; log: LogLine[]; hours: string }>(KEY);
  const [tab, setTab] = useState<'notice' | 'hours' | 'service' | 'faq'>('notice');
  const [draft, setDraft] = useState<Draft>(saved?.draft ?? empty);
  const [log, setLog] = useState<LogLine[]>(saved?.log ?? []);
  const [hours, setHours] = useState(saved?.hours ?? (mission.hours.at(-1)?.slots.join(' · ') ?? ''));
  const [error, setError] = useState('');

  const persist = (d: Draft, lg: LogLine[], h = hours) => writeStore(KEY, { draft: d, log: lg, hours: h });
  const record = (what: string, who: string, d: Draft) => {
    const lg = [{ at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), who, what }, ...log].slice(0, 12);
    setLog(lg); setDraft(d); persist(d, lg);
  };
  const submit = () => {
    if (draft.title.trim().length < 5 || draft.body.trim().length < 20) { setError(t.cms_error); return; }
    setError('');
    record(`${t.cms_state_review} — « ${draft.title.trim()} »`, t.cms_editor, { ...draft, state: 'review' });
  };
  const tabs = [['notice', t.cms_tab_notice], ['hours', t.cms_tab_hours], ['service', t.cms_tab_service], ['faq', t.cms_tab_faq]] as const;
  const stateChip = { draft: 'chip--neutral', review: 'chip--tbc', published: 'chip--ok' }[draft.state];
  const stateLabel = { draft: t.cms_state_draft, review: t.cms_state_review, published: t.cms_state_published }[draft.state];

  return (
    <>
      <PageHeader eyebrow={t.cms_badge} title={t.cms_title} intro={t.cms_intro} crumbs={[{ label: t.cms_title }]}>
        <div className="page-head__meta"><span className="sim-tag">{t.simulation}</span><span className="chip chip--alert"><Icon name="lock" size={14} /> {t.cms_not_secure}</span></div>
      </PageHeader>
      <div className="container section--tight" data-testid="cms">
        <div className="tabs" role="tablist" aria-label={t.cms_title}>
          {tabs.map(([id, label]) => <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}>{label}</button>)}
        </div>

        {tab === 'notice' && (
          <div className="cms" role="tabpanel" id="panel-notice" aria-labelledby="tab-notice">
            <form className="form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
              <p style={{ margin: 0 }}><span className={`chip ${stateChip}`} data-testid="cms-state">{stateLabel}</span></p>
              <div className="field"><label htmlFor="cms-title" className="field__label">{t.cms_field_title}</label><input id="cms-title" value={draft.title} disabled={draft.state !== 'draft'} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
              <div className="field"><label htmlFor="cms-cat" className="field__label">{t.cms_field_category}</label>
                <select id="cms-cat" value={draft.category} disabled={draft.state !== 'draft'} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {content.newsCategories.map((c) => <option key={c.id} value={c.id}>{l(c.label)}</option>)}
                </select></div>
              <div className="field"><label htmlFor="cms-body" className="field__label">{t.cms_field_body}</label><textarea id="cms-body" rows={6} value={draft.body} disabled={draft.state !== 'draft'} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></div>
              {error && <p className="field__error" role="alert">{error}</p>}
              <div className="btn-row">
                {draft.state === 'draft' && <button type="submit" className="btn btn--primary">{t.cms_submit}</button>}
                {draft.state === 'review' && <>
                  <button type="button" className="btn btn--primary" onClick={() => record(`${t.cms_state_published} — « ${draft.title} »`, t.cms_approver, { ...draft, state: 'published' })}>{t.cms_approve}</button>
                  <button type="button" className="btn btn--ghost" onClick={() => record(t.cms_state_draft, t.cms_approver, { ...draft, state: 'draft' })}>{t.cms_reject}</button>
                </>}
                {draft.state === 'published' && <button type="button" className="btn btn--ghost" onClick={() => record(t.cms_new_draft, t.cms_editor, empty)}>{t.cms_new_draft}</button>}
              </div>
            </form>
            <div>
              <p className="kicker kicker--plain">{t.cms_preview}</p>
              <div className="cms__preview">
                <span className="story-meta"><span>{l(content.newsCategories.find((c) => c.id === draft.category)?.label)}</span><span className={`chip ${stateChip}`}>{stateLabel}</span></span>
                <p className="cms__preview-title">{draft.title || t.cms_preview_empty}</p>
                <p className="muted">{draft.body}</p>
              </div>
              <p className="kicker kicker--plain" style={{ marginTop: 24 }}>{t.cms_log}</p>
              <ul className="cms__log" data-testid="cms-log">
                {log.length === 0 && <li className="muted">—</li>}
                {log.map((g, i) => <li key={i}><span className="mono">{g.at}</span><span><b>{g.who}</b> · {g.what}</span></li>)}
              </ul>
            </div>
          </div>
        )}

        {tab === 'hours' && (
          <div className="cms" role="tabpanel" id="panel-hours" aria-labelledby="tab-hours">
            <form className="form" onSubmit={(e) => { e.preventDefault(); const d = draft; const lg = [{ at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), who: t.cms_editor, what: `${t.cms_tab_hours} → ${hours} (${t.cms_state_review})` }, ...log]; setLog(lg); persist(d, lg, hours); }}>
              <div className="field"><label htmlFor="cms-hours" className="field__label">{l(mission.hours.at(-1)?.service)}</label><input id="cms-hours" value={hours} onChange={(e) => setHours(e.target.value)} /></div>
              <p className="field__help">{t.cms_hours_help}</p>
              <button type="submit" className="btn btn--primary">{t.cms_submit}</button>
            </form>
            <div className="cms__preview"><p className="kicker kicker--plain">{t.cms_preview}</p><p className="visit__addr">{hours}</p></div>
          </div>
        )}

        {tab === 'service' && (
          <div role="tabpanel" id="panel-service" aria-labelledby="tab-service" className="card">
            <p>{t.cms_service_text}</p>
            <ul className="doc-list">{content.services.slice(0, 6).map((s) => <li key={s.slug}><Icon name="pen" size={16} /> {l(s.title)} <span className="chip chip--tbc">{t.cms_fields_missing}</span></li>)}</ul>
          </div>
        )}
        {tab === 'faq' && (
          <div role="tabpanel" id="panel-faq" aria-labelledby="tab-faq" className="card">
            <p>{t.cms_faq_text}</p>
            <ul className="doc-list">{content.faq.map((f) => <li key={f.id}><Icon name="chat" size={16} /> {l(f.question)}</li>)}</ul>
          </div>
        )}

        <div className="two-col section--tight">
          <div className="card"><h2 style={{ fontSize: '1.2rem' }}><Icon name="lock" size={18} /> {t.cms_prod_title}</h2><p className="muted">{t.cms_security}</p></div>
          <div className="card"><h2 style={{ fontSize: '1.2rem' }}>{t.cms_images_title}</h2><p className="muted">{t.cms_images}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { writeStore(KEY, null); setDraft(empty); setLog([]); setError(''); }}>{t.cms_reset}</button></div>
        </div>
      </div>
    </>
  );
}
