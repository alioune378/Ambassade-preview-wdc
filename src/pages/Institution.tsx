import { content, mission } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { Icon } from '../components/Icon';
import { Arch } from '../components/Today';
import { ExternalLink, PageHeader, ToConfirm, useSeo, VerifyBadge } from '../components/ui';
import { NotFound } from './Misc';

function useInstLabel() {
  const { t } = useI18n();
  return mission.kind === 'embassy' ? t.nav_embassy : t.nav_consulate;
}

export function Institution() {
  const { t, l } = useI18n();
  const inst = useInstLabel();
  useSeo(inst, t.c_intro);
  const { sections, departments, message, formerHeads } = content.institution;
  const role = sections.find((s) => s.id === 'role');
  const countries = mission.jurisdictionCountries?.value;
  return (
    <>
      <PageHeader title={l(mission.name)} intro={t.c_intro} crumbs={[{ label: inst }]} />
      <div className="container section">
        <div className="two-col two-col--wide">
          <div>
            <p className="kicker">{t.c_role}</p>
            {role ? <>{role.body.map((b, i) => <p key={i} className="prose" style={{ fontSize: '1.15rem' }}>{l(b)}</p>)}<VerifyBadge v={role.verification} /></> : <ToConfirm />}
          </div>
          <div className="card">
            <h2 style={{ fontSize: '1.3rem' }}>{t.c_explore}</h2>
            <ul className="doc-list" style={{ gap: 12 }}>
              {message && <li><Icon name="arrow" size={16} /><Link to="/l-ambassade/ambassadeur">{t.c_head_page}</Link></li>}
              {countries && <li><Icon name="arrow" size={16} /><Link to="/l-ambassade/juridiction">{t.juris_more}</Link></li>}
              {formerHeads && <li><Icon name="arrow" size={16} /><Link to="/l-ambassade/anciens-ambassadeurs">{t.former_title}</Link></li>}
              {mission.nav.includes('bilateral') && <li><Icon name="arrow" size={16} /><Link to="/senegal-etats-unis">{t.nav_bilateral}</Link></li>}
            </ul>
          </div>
        </div>
      </div>
      {message && (
        <section className="section section--surface" aria-labelledby="hm-h">
          <div className="container envoy">
            <div className="envoy__frame">{t.portrait_placeholder}</div>
            <div>
              <p className="kicker">{l(mission.headOfMission.title)}</p>
              <h2 id="hm-h">{mission.headOfMission.name.value ?? t.to_confirm}</h2>
              <blockquote>{l(message.excerpt)}</blockquote>
              <p style={{ marginTop: 18 }}><Link to="/l-ambassade/ambassadeur" className="link-arrow">{t.c_head_page} <Icon name="arrow" size={16} /></Link></p>
            </div>
          </div>
        </section>
      )}
      <section className="section" aria-labelledby="dep-h">
        <div className="container two-col">
          <div>
            <h2 id="dep-h">{t.c_departments}</h2>
            {departments.length ? (
              <ul className="heads" style={{ gridTemplateColumns: '1fr' }}>
                {departments.map((d) => <li key={d.id}><b>{l(d.name)}</b><span>{d.verification.status === 'unverified' ? t.to_confirm_short : '✓'}</span></li>)}
              </ul>
            ) : <ToConfirm />}
          </div>
          <div>
            <h2>{t.c_network}</h2>
            <ul className="heads" style={{ gridTemplateColumns: '1fr' }}>
              {mission.network.map((p) => (
                <li key={p.id}><b>{l(p.name)}</b><span>{p.url && p.linkStatus === 'working' ? <ExternalLink href={p.url}>{t.website}</ExternalLink> : t.to_confirm_short}</span></li>
              ))}
            </ul>
            {mission.secondarySites?.map((s) => <p key={s.url} className="muted small" style={{ marginTop: 16 }}>{l(s.note)}</p>)}
          </div>
        </div>
      </section>
    </>
  );
}

export function Ambassador() {
  const { t, l } = useI18n();
  const inst = useInstLabel();
  const msg = content.institution.message;
  const bio = content.institution.sections.find((s) => s.id === 'biographie');
  const name = mission.headOfMission.name.value;
  useSeo(t.c_head_page, msg ? l(msg.excerpt) : '');
  if (!msg && !bio) return <NotFound />;
  return (
    <>
      <PageHeader eyebrow={l(mission.headOfMission.title)} title={name ?? t.to_confirm} crumbs={[{ label: inst, to: '/l-ambassade' }, { label: t.c_head_page }]} />
      <div className="container section">
        <div className="envoy" style={{ alignItems: 'start' }}>
          <div className="envoy__frame">{t.portrait_placeholder}</div>
          <div className="prose">
            {msg && (
              <section aria-labelledby="msg-h">
                <h2 id="msg-h">{l(msg.title)}</h2>
                <p className="muted small">{t.message_summary_note}</p>
                {msg.full.map((p, i) => <p key={i}>{l(p)}</p>)}
                <VerifyBadge v={msg.verification} />
              </section>
            )}
            {bio && (
              <section aria-labelledby="bio-h" style={{ marginTop: 48 }}>
                <h2 id="bio-h">{l(bio.title)}</h2>
                {bio.body.map((p, i) => <p key={i}>{l(p)}</p>)}
                <VerifyBadge v={bio.verification} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function Jurisdiction() {
  const { t, l } = useI18n();
  const inst = useInstLabel();
  const countries = mission.jurisdictionCountries;
  const sec = content.institution.sections.find((s) => s.id === 'juridiction');
  useSeo(t.juris_title, t.juris_text);
  if (!countries?.value) return <NotFound />;
  return (
    <>
      <PageHeader title={t.juris_title} intro={t.juris_text} crumbs={[{ label: inst, to: '/l-ambassade' }, { label: t.juris_kicker }]} />
      <div className="container section juris">
        <div>
          <p className="juris__count">{countries.value.length}<small>{t.juris_countries_label}</small></p>
        </div>
        <div>
          <ul className="countries" aria-label={t.juris_list}>
            {countries.value.map((c, i) => <li key={c.fr} className={i === 0 ? 'is-host' : ''}>{l(c)}</li>)}
            <li className="is-inst">{t.juris_imf}</li>
            <li className="is-inst">{t.juris_wb}</li>
          </ul>
          {sec && <div className="prose" style={{ marginTop: 28 }}>{sec.body.map((b, i) => <p key={i}>{l(b)}</p>)}</div>}
          <VerifyBadge v={countries} />
          <ToConfirm note={t.juris_ny_note} />
        </div>
      </div>
    </>
  );
}

export function FormerHeads() {
  const { t, l } = useI18n();
  const inst = useInstLabel();
  const fh = content.institution.formerHeads;
  useSeo(t.former_title, t.former_intro);
  if (!fh) return <NotFound />;
  return (
    <>
      <PageHeader title={t.former_title} intro={t.former_intro} crumbs={[{ label: inst, to: '/l-ambassade' }, { label: t.former_title }]} />
      <div className="container section">
        <ol className="heads" aria-label={t.former_title}>
          {fh.list.map((h) => <li key={h.name}><b>{h.name}</b><span>{h.years}{h.note ? ' *' : ''}</span></li>)}
        </ol>
        {fh.list.filter((h) => h.note).map((h) => <p key={h.name} className="muted small" style={{ marginTop: 14 }}>* {h.name} — {l(h.note)}</p>)}
        <VerifyBadge v={fh.verification} />
        <p className="muted small">{t.former_photos}</p>
      </div>
    </>
  );
}

export function Bilateral() {
  const { t, l } = useI18n();
  const b = content.bilateral;
  useSeo(t.b_title, b ? l(b.intro) : '');
  if (!b) return <NotFound />;
  const photos = content.news.filter((n) => n.image);
  return (
    <>
      <section className="band" style={{ paddingTop: 56 }} aria-labelledby="bi-h">
        <div className="container">
          <nav aria-label={t.breadcrumb} className="crumbs"><ol><li><Link to="/" style={{ color: '#b9c1cd' }}>{t.nav_home}</Link></li><li style={{ color: '#b9c1cd' }}>{t.b_title}</li></ol></nav>
          <div className="band__grid">
            <div>
              <p className="kicker kicker--light">{t.b_kicker}</p>
              <h1 id="bi-h" style={{ color: '#fff' }}>{t.home_dip_title}</h1>
              <p className="band__intro">{l(b.intro)}</p>
            </div>
            <Arch className="no-print" />
          </div>
        </div>
      </section>
      <div className="container section">
        {b.themes.map((th, i) => (
          <section key={th.id} className="block theme-row" aria-labelledby={`th-${th.id}`}>
            <div><p className="essay-label" style={{ color: 'var(--gold-text)' }}>{String(i + 1).padStart(2, '0')}</p><h2 id={`th-${th.id}`}>{l(th.title)}</h2></div>
            <div className="prose">{th.body.map((p, j) => <p key={j}>{l(p)}</p>)}<VerifyBadge v={th.verification} compact /></div>
          </section>
        ))}
      </div>
      {photos.length > 0 && (
        <section className="section section--surface" aria-labelledby="ph-h">
          <div className="container">
            <h2 id="ph-h">{t.b_moments}</h2>
            <div className="photo-grid">
              {photos.map((n) => (
                <Link key={n.id} to={`/actualites/${n.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={n.image!.src} alt={l(n.image!.alt)} loading="lazy" width={1080} height={720} style={{ aspectRatio: '3/2', objectFit: 'cover', objectPosition: n.image!.position, borderRadius: 4 }} />
                  <p style={{ margin: '12px 0 4px', fontFamily: 'var(--serif)', fontSize: '1.15rem', color: 'var(--midnight)' }}>{l(n.title)}</p>
                  <p className="credit">{l(n.image!.credit)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
