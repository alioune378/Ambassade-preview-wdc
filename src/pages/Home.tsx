import { content, mission } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { IndexItem, LeadStory, Portrait, StoryList } from '../components/blocks';
import { Icon } from '../components/Icon';
import { SearchConsole } from '../components/Search';
import { TodayPanel } from '../components/Today';
import { useSeo } from '../components/ui';

export function Home() {
  const { t, l } = useI18n();
  useSeo('', t.hero_text);

  const quick = content.quickServices;
  const svcBySlug = (to: string) => content.services.find((s) => to.endsWith(`/${s.slug}`));
  // The first photographed item is featured in the diplomacy band; the next one
  // leads the news section, so no photograph appears twice on the page.
  const current = content.news.filter((n) => !n.expired);
  const withImage = current.filter((n) => n.image);
  const featured = withImage.at(0);
  const featurePhoto = featured?.image;
  const lead = withImage.at(1) ?? current.find((n) => n !== featured);
  const rest = current.filter((n) => n !== lead && n !== featured).slice(0, 2);
  const countries = mission.jurisdictionCountries?.value ?? [];
  const msg = content.institution.message;
  const announcements = content.news.filter((n) => !n.expired).slice(0, 2);

  return (
    <>
      {/* Hero: flagship search (C) inside an institutional frame (A); live info panel */}
      <section className="hero" aria-labelledby="hero-h">
        <div className="container hero__grid">
          <div>
            <p className="kicker">{l(mission.headerLines.at(-1))} · {l(mission.name)}</p>
            <h1 id="hero-h">{t.hero_title_a} <em>{t.hero_title_b}</em></h1>
            <p className="hero__lede">{t.hero_text}</p>
            <SearchConsole idPrefix="home" />
            <div className="console__chips" aria-label={t.search_suggest}>
              {t.hero_chips.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
            </div>
            <div className="hero__ctas">
              <Link to="/services-consulaires" className="link-arrow">{t.hero_cta_services} <Icon name="arrow" size={16} /></Link>
              <Link to="/rendez-vous" className="link-arrow">{t.hero_cta_rdv} <Icon name="arrow" size={16} /></Link>
              <Link to="/contact" className="link-arrow">{t.hero_cta_contact} <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
          <TodayPanel />
        </div>
      </section>

      {/* Announcements */}
      <section className="announce" aria-labelledby="ann-h">
        <div className="container">
          <h2 id="ann-h" className="announce__label"><Icon name="alert" size={16} /> {t.notices_title}</h2>
          <div className="announce__items">
            {content.news.some((n) => n.pinned)
              ? content.news.filter((n) => n.pinned).map((n) => <Link key={n.id} to={`/actualites/${n.id}`}>{l(n.title)}</Link>)
              : <span><span className="chip chip--neutral">{t.alert_demo_label}</span> {t.alert_demo_text}</span>}
            {announcements.map((n) => <Link key={n.id} to={`/actualites/${n.id}`}>{l(n.title)}</Link>)}
          </div>
          <Link to="/actualites" className="link-arrow">{t.see_all_news}</Link>
        </div>
      </section>

      {/* Consular services: editorial index with verification chips */}
      <section className="section" aria-labelledby="svc-h">
        <div className="container">
          <div className="section-head">
            <div><p className="kicker">{t.nav_services}</p><h2 id="svc-h">{t.home_services_title}</h2></div>
            <p>{t.home_services_text}</p>
          </div>
          <div className="index">
            {quick.map((q, i) => {
              const s = svcBySlug(q.to);
              const chip = s ? (s.availability === 'listed-on-official-site' ? <span className="chip chip--ok"><span className="dot" />{t.avail_listed}</span> : s.availability === 'fictional' ? <span className="chip chip--fictional">{t.avail_fictional}</span> : <span className="chip chip--tbc"><span className="dot" />{t.avail_confirm}</span>) : undefined;
              return <IndexItem key={q.to} n={i + 1} to={q.to} title={l(q.label)} text={s ? l(s.summary) : t.quick_text[q.to] ?? ''} chip={chip} />;
            })}
          </div>
          <div className="pathway">
            <strong>{t.pathway_title}</strong>
            <span>{t.pathway_text}</span>
            <Link to="/trouver-ma-demarche" className="btn btn--primary">{t.finder_cta} <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
      </section>

      {/* Diplomatic storytelling (A) with arch-framed authentic photograph (B) */}
      {content.bilateral && (
        <section className="band" aria-labelledby="dip-h">
          <div className="container">
            <div className="band__grid">
              <div>
                <p className="kicker kicker--light">{t.nav_bilateral}</p>
                <h2 id="dip-h">{t.home_dip_title}</h2>
                <p className="band__intro">{l(content.bilateral.intro)}</p>
                <Link to="/senegal-etats-unis" className="link-arrow link-arrow--light">{t.coop_more} <Icon name="arrow" size={16} /></Link>
              </div>
              {featurePhoto && (
                <figure className="arch-photo">
                  <div className="arch-photo__frame"><img src={featurePhoto.src} alt={l(featurePhoto.alt)} loading="lazy" width={1080} height={720} style={{ objectPosition: featurePhoto.position }} /></div>
                  <figcaption><b>{l(featurePhoto.alt)}</b>{l(featurePhoto.credit)}</figcaption>
                </figure>
              )}
            </div>
            <div className="essays">
              {content.bilateral.themes.slice(0, 3).map((th, i) => (
                <article key={th.id}>
                  <p className="essay-label">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{l(th.title)}</h3>
                  <p>{l(th.body.at(0))}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Jurisdiction (C information design, A typography) */}
      {countries.length > 0 && (
        <section className="section section--surface" aria-labelledby="jur-h">
          <div className="container juris">
            <div>
              <p className="kicker">{t.juris_kicker}</p>
              <h2 id="jur-h">{t.juris_title}</h2>
              <p className="juris__count">{countries.length}<small>{t.juris_text}</small></p>
            </div>
            <div>
              <ul className="countries" aria-label={t.juris_list}>
                {countries.map((c, i) => <li key={c.fr} className={i === 0 ? 'is-host' : ''}>{l(c)}</li>)}
                <li className="is-inst">{t.juris_imf}</li>
                <li className="is-inst">{t.juris_wb}</li>
              </ul>
              <p style={{ marginTop: 20 }}><Link to="/l-ambassade/juridiction" className="link-arrow">{t.juris_more} <Icon name="arrow" size={16} /></Link></p>
            </div>
          </div>
        </section>
      )}

      {/* The Ambassador — respectful, never above the services */}
      {msg && (
        <section className="section" aria-labelledby="env-h">
          <div className="container envoy">
            <Portrait />
            <div>
              <p className="kicker">{l(msg.title)}</p>
              <h2 id="env-h" className="sr-only">{l(msg.title)}</h2>
              <blockquote>{l(msg.excerpt)}</blockquote>
              <p className="envoy__who"><b>{msg.signedBy}</b><span>{l(mission.headOfMission.title)} · {l(mission.name)}</span></p>
              <div className="btn-row"><Link to="/l-ambassade/ambassadeur" className="btn btn--ghost">{t.message_read} <Icon name="arrow" size={16} /></Link></div>
              <p className="envoy__note">{t.message_summary_note}</p>
            </div>
          </div>
        </section>
      )}

      {/* News */}
      <section className="section section--surface" aria-labelledby="news-h">
        <div className="container">
          <div className="section-head section-head--split">
            <div><p className="kicker">{t.nav_news}</p><h2 id="news-h">{t.home_news_title}</h2></div>
            <Link to="/actualites" className="link-arrow">{t.see_all_news} <Icon name="arrow" size={16} /></Link>
          </div>
          {lead && <LeadStory n={lead} />}
          <StoryList items={rest} />
        </div>
      </section>

      {/* Practical information */}
      <section className="section" aria-labelledby="visit-h">
        <div className="container">
          <div className="section-head"><div><p className="kicker">{t.practical_title}</p><h2 id="visit-h">{t.visit_title}</h2></div><p>{t.visit_text}</p></div>
          <div className="visit">
            <div>
              <h3>{t.ct_address}</h3>
              {mission.address.value && <p className="visit__addr">{mission.address.value.lines.join(', ')}<br />{mission.address.value.city}, {mission.address.value.postalCode}</p>}
              {mission.transit?.value && <p className="muted">{l(mission.transit.value)}</p>}
            </div>
            <div>
              <h3>{t.hours_title}</h3>
              {mission.hours.map((h) => <p key={h.id}>{l(h.service)}<br /><span className="big">{h.slots.join(' · ') || t.hours_none}</span></p>)}
            </div>
            <div>
              <h3>{t.ct_contact}</h3>
              {mission.phone.value && <p className="big"><a href={`tel:${mission.phone.value.tel}`}>{mission.phone.value.display}</a></p>}
              {mission.email.value && <p><a href={`mailto:${mission.email.value}`}>{mission.email.value}</a></p>}
              <p style={{ marginTop: 16 }}><Link to="/contact" className="btn btn--ghost">{t.hero_cta_contact}</Link></p>
            </div>
          </div>
          <p className="muted small" style={{ marginTop: 22 }}>{mission.fictional ? t.status_fictional : t.today_source}</p>
        </div>
      </section>
    </>
  );
}
