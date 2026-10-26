import { useState, type FormEvent } from 'react';
import { content, mission } from '../platform/mission';
import { looksSensitive } from '../platform/assistance';
import { useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { writeStore, readStore } from '../platform/storage';
import { FaqList, HoursTable, visitPrepItems } from '../components/blocks';
import { Checklist } from '../components/Checklist';
import { Icon } from '../components/Icon';
import { ExternalLink, PageHeader, ToConfirm, useSeo, VerifyBadge } from '../components/ui';

export function Contact() {
  const { t, l } = useI18n();
  useSeo(t.ct_title, t.ct_intro);
  const a = mission.address.value;
  const mapUrl = a ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(a.mapQuery)}` : '';
  const dirUrl = a ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a.mapQuery)}` : '';
  return (
    <>
      <PageHeader title={t.ct_title} intro={t.ct_intro} crumbs={[{ label: t.nav_contact }]} />
      <div className="container section--tight">
        <div className="visit" style={{ marginBottom: 56 }}>
          <div>
            <h2 className="kicker kicker--plain" style={{ fontFamily: 'var(--sans)' }}>{t.ct_address}</h2>
            {a ? <p className="visit__addr">{a.lines.join(', ')}<br />{a.city}, {a.postalCode}</p> : <ToConfirm />}
            {mission.transit?.value && <p className="muted"><Icon name="train" size={16} /> {l(mission.transit.value)}</p>}
            {a && <p className="btn-row" style={{ marginTop: 14 }}><ExternalLink href={mapUrl} className="btn btn--ghost btn--sm">{t.ct_map}</ExternalLink><ExternalLink href={dirUrl} className="btn btn--ghost btn--sm">{t.ct_directions}</ExternalLink></p>}
          </div>
          <div>
            <h2 className="kicker kicker--plain" style={{ fontFamily: 'var(--sans)' }}>{t.ct_reach}</h2>
            {mission.phone.value && <p><span className="muted small">{t.ct_phone}</span><br /><a className="big" href={`tel:${mission.phone.value.tel}`}>{mission.phone.value.display}</a></p>}
            {mission.fax?.value && <p><span className="muted small">{t.ct_fax}</span><br />{mission.fax.value.display}</p>}
            {mission.email.value && <p><span className="muted small">{t.ct_email}</span><br /><a href={`mailto:${mission.email.value}`}>{mission.email.value}</a></p>}
          </div>
          <div>
            <h2 className="kicker kicker--plain" style={{ fontFamily: 'var(--sans)' }}>{t.hours_title}</h2>
            <HoursTable />
          </div>
        </div>
        <VerifyBadge v={mission.address} />

        <div className="two-col two-col--wide section">
          <section aria-labelledby="ct-faq">
            <h2 id="ct-faq">{t.faq_title}</h2>
            <FaqList level={3} />
          </section>
          <section aria-labelledby="ct-form">
            <h2 id="ct-form">{t.ct_form_title} <span className="sim-tag">{t.simulation}</span></h2>
            <p className="muted">{t.ct_form_note}</p>
            <ContactForm />
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '1.15rem' }}>{t.a_title}</h3>
              <p className="muted">{t.a_teaser}</p>
              <Link to="/assistance" className="link-arrow">{t.a_open} <Icon name="arrow" size={16} /></Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function ContactForm() {
  const { t, l } = useI18n();
  const [cat, setCat] = useState('');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!cat) err.cat = t.err_required;
    if (subject.trim().length < 3) err.subject = t.err_required;
    else if (looksSensitive(subject)) err.subject = t.err_sensitive;
    if (msg.trim().length < 20) err.msg = t.err_short;
    else if (looksSensitive(msg)) err.msg = t.err_sensitive;
    setErrors(err);
    if (Object.keys(err).length) { document.getElementById(`cf-${Object.keys(err)[0]}`)?.focus(); return; }
    const log = readStore<unknown[]>(`contact:${mission.id}`) ?? [];
    writeStore(`contact:${mission.id}`, [{ cat, subject, at: new Date().toISOString() }, ...log].slice(0, 20));
    setSent(true);
  };
  if (sent) {
    return (
      <div className="ack" role="status" data-testid="contact-ack">
        <Icon name="check" size={28} />
        <p style={{ margin: 0 }}><strong>{t.simulation}.</strong> {t.ct_sent}</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setSent(false); setMsg(''); setSubject(''); setCat(''); }}>{t.a_new}</button>
      </div>
    );
  }
  return (
    <form className="form" noValidate onSubmit={submit} data-testid="contact-form">
      <div className="field">
        <label htmlFor="cf-cat" className="field__label">{t.d_department}</label>
        <select id="cf-cat" value={cat} onChange={(e) => setCat(e.target.value)} aria-invalid={!!errors.cat} aria-describedby={errors.cat ? 'cf-cat-e' : undefined}>
          <option value="">{t.a_category}</option>
          {content.assistance.categories.map((c) => <option key={c.id} value={c.id}>{l(c.label)}</option>)}
        </select>
        {errors.cat && <p id="cf-cat-e" className="field__error">{errors.cat}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-subject" className="field__label">{t.ct_subject}</label>
        <input id="cf-subject" value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'cf-subject-e' : undefined} />
        {errors.subject && <p id="cf-subject-e" className="field__error">{errors.subject}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-msg" className="field__label">{t.a_message}</label>
        <textarea id="cf-msg" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} aria-invalid={!!errors.msg} aria-describedby={`cf-msg-h${errors.msg ? ' cf-msg-e' : ''}`} />
        <p id="cf-msg-h" className="field__help">{t.a_message_help}</p>
        {errors.msg && <p id="cf-msg-e" className="field__error">{errors.msg}</p>}
      </div>
      <button type="submit" className="btn btn--primary">{t.ct_send}</button>
    </form>
  );
}

export function FaqPage() {
  const { t } = useI18n();
  useSeo(t.faq_title, t.help_text);
  return (
    <>
      <PageHeader title={t.faq_title} intro={t.help_text} crumbs={[{ label: t.faq_title }]} />
      <div className="container section--tight prose" style={{ maxWidth: 820 }}><FaqList level={2} /></div>
    </>
  );
}

export function Appointments() {
  const { t, l } = useI18n();
  useSeo(t.rdv_title, t.rdv_intro);
  const appt = mission.appointment;
  const listed = content.services.filter((s) => s.availability !== 'to-confirm');
  return (
    <>
      <PageHeader title={t.rdv_title} intro={t.rdv_intro} crumbs={[{ label: t.nav_appointments }]} />
      <div className="container section--tight">
        <h2>{t.rdv_steps_title}</h2>
        <ol className="steps">
          {[t.rdv_step1, t.rdv_step2, t.rdv_step3].map((s, i) => <li key={s}><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{s}</p></li>)}
        </ol>
        <div className="two-col section--tight">
          <section className="card" aria-labelledby="ch-h">
            <h2 id="ch-h" style={{ fontSize: '1.4rem' }}>{t.rdv_portal_title}</h2>
            {appt.value ? (
              <><p><ExternalLink href={appt.value.url} className="btn btn--primary">{t.portal_cta}</ExternalLink></p><VerifyBadge v={appt} /></>
            ) : (
              <>
                <ToConfirm note={t.rdv_no_portal} />
                <ul className="doc-list" style={{ marginTop: 16 }}>
                  {mission.phone.value && <li><Icon name="phone" size={16} /> <a href={`tel:${mission.phone.value.tel}`}>{mission.phone.value.display}</a></li>}
                  {mission.email.value && <li><Icon name="mail" size={16} /> <a href={`mailto:${mission.email.value}`}>{mission.email.value}</a></li>}
                </ul>
              </>
            )}
            <h3 style={{ fontSize: '1.1rem', marginTop: 24 }}>{t.rdv_needs_title}</h3>
            <ul className="doc-list">{listed.map((s) => <li key={s.slug}><Icon name="arrow" size={16} /><Link to={`/services-consulaires/${s.slug}`}>{l(s.title)}</Link></li>)}</ul>
          </section>
          <section aria-labelledby="ex-h">
            <h2 id="ex-h" style={{ fontSize: '1.4rem' }}>{t.rdv_expect_title}</h2>
            <p className="muted">{t.rdv_expect}</p>
            <HoursTable />
            <div style={{ marginTop: 20 }}><Checklist title={t.prep_title} items={visitPrepItems()} /></div>
          </section>
        </div>
      </div>
    </>
  );
}
