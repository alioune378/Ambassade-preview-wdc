import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LangCode, NavKey } from '../platform/types';
import { mission, missions } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link, useRouter } from '../platform/router';
import { Icon } from './Icon';
import { SearchOverlay } from './Search';
import { BackToTop, ExternalLink, LanguageNotice } from './ui';

export const navPath: Record<NavKey, string> = {
  home: '/',
  services: '/services-consulaires',
  appointments: '/rendez-vous',
  embassy: '/l-ambassade',
  consulate: '/l-ambassade',
  bilateral: '/senegal-etats-unis',
  news: '/actualites',
  contact: '/contact',
};

export function useNav() {
  const { t } = useI18n();
  const label: Record<NavKey, string> = {
    home: t.nav_home, services: t.nav_services, appointments: t.nav_appointments, embassy: t.nav_embassy,
    consulate: t.nav_consulate, bilateral: t.nav_bilateral, news: t.nav_news, contact: t.nav_contact,
  };
  return mission.nav.map((k) => ({ key: k, to: navPath[k], label: label[k] }));
}

export function Flag() {
  return (
    <span className="flag" aria-hidden="true">
      <i />
      <i><svg width="9" height="9" viewBox="0 0 24 24"><path d="M12 2l2.9 7.1 7.6.6-5.8 4.9 1.8 7.4L12 18l-6.5 4 1.8-7.4L1.5 9.7l7.6-.6z" fill="#00853f" /></svg></i>
      <i />
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <SkipLink />
      <DemoStrip />
      <Header onSearch={() => setSearchOpen(true)} />
      <LanguageNotice />
      <main id="contenu" tabIndex={-1}>{children}</main>
      <Footer />
      <BackToTop />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function SkipLink() {
  const { t } = useI18n();
  return <a className="skip" href="#contenu">{t.skip}</a>;
}

function DemoStrip() {
  const { l, t } = useI18n();
  return (
    <>
      <div className="demo-strip" role="note">
        <div className="container">
          <span className="demo-strip__pill">{t.demoBadge}</span>
          <span className="long">{l(mission.demoLabel)}</span>
          <span className="short">{t.demo_short}</span>
          <Link to="/a-propos-de-la-demo">{t.f_demo}</Link>
        </div>
      </div>
      {mission.fictional && (
        <div className="fictional-strip" role="note"><div className="container"><strong>{t.fictionalBadge}.</strong> {t.fictionalText}</div></div>
      )}
    </>
  );
}

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang" role="group" aria-label={t.language}>
      {mission.languages.map((lg) => (
        <button key={lg.code} type="button" aria-pressed={lang === lg.code} onClick={() => setLang(lg.code as LangCode)} lang={lg.code} title={lg.label}>
          {lg.code.toUpperCase()}<span className="sr-only"> — {lg.label}</span>
        </button>
      ))}
    </div>
  );
}

function Header({ onSearch }: { onSearch: () => void }) {
  const { l, t } = useI18n();
  const items = useNav();
  const { loc } = useRouter();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [loc.path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const [line1, line2] = mission.headerLines;
  return (
    <header className="site-header">
      <div className="container site-header__top">
        <Link to="/" className="brand" aria-label={`${l(mission.name)} — ${t.nav_home}`}>
          <Flag />
          <span className="brand__text">
            <span className="brand__kicker">{t.republic}</span>
            <span className="brand__name">{l(line1)}</span>
            {line2 && <span className="brand__city">{l(line2)}</span>}
          </span>
        </Link>
        <div className="header-tools">
          <button type="button" className="search-trigger" onClick={onSearch} aria-label={t.search_title}>
            <Icon name="search" size={18} /><span className="t">{t.search_short}</span><kbd>Ctrl K</kbd>
          </button>
          <LangSwitch />
          <Link to="/rendez-vous" className="btn btn--primary btn--sm header-cta">{t.nav_appointments}</Link>
          <button ref={btn} type="button" className="menu-btn" aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={22} /><span className="sr-only">{open ? t.close : t.menu}</span>
          </button>
        </div>
      </div>
      <nav className="main-nav" aria-label={t.nav_label}>
        <ul className="container">
          {items.map((it) => <li key={it.key}><Link to={it.to} nav>{it.label}</Link></li>)}
        </ul>
      </nav>
      <div id="drawer" className={`drawer ${open ? 'drawer--open' : ''}`} hidden={!open}>
        <nav className="container" aria-label={t.nav_label_mobile}>
          <ul>
            {items.map((it) => <li key={it.key}><Link to={it.to} nav>{it.label}<Icon name="arrow" size={18} /></Link></li>)}
          </ul>
          <div className="drawer__lang">{t.language} <LangSwitch /></div>
          <div className="drawer__quick">
            <Link to="/trouver-ma-demarche"><Icon name="search" size={16} /> {t.finder_title}</Link>
            <Link to="/assistance"><Icon name="chat" size={16} /> {t.a_short}</Link>
          </div>
        </nav>
      </div>
      <div className="tricolour" aria-hidden="true"><i /><i /><i /></div>
    </header>
  );
}

function Footer() {
  const { l, t } = useI18n();
  const addr = mission.address.value;
  const linked = mission.usefulLinks.filter((u) => u.url);
  const others = Object.keys(missions).filter((id) => id !== mission.id);
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Flag />
          <p className="site-footer__name">{l(mission.name)}</p>
          {addr && <p>{addr.lines.join(', ')}<br />{addr.city}, {addr.postalCode}</p>}
          {mission.phone.value && <p><a href={`tel:${mission.phone.value.tel}`}>{mission.phone.value.display}</a></p>}
        </div>
        <div>
          <h2>{t.f_services}</h2>
          <ul>
            <li><Link to="/services-consulaires">{t.all_services}</Link></li>
            <li><Link to="/trouver-ma-demarche">{t.finder_title}</Link></li>
            <li><Link to="/rendez-vous">{t.nav_appointments}</Link></li>
            <li><Link to="/questions-frequentes">{t.faq_title}</Link></li>
            <li><Link to="/assistance">{t.a_title}</Link></li>
          </ul>
        </div>
        <div>
          <h2>{t.f_institution}</h2>
          <ul>
            <li><Link to="/l-ambassade">{mission.kind === 'embassy' ? t.nav_embassy : t.nav_consulate}</Link></li>
            {mission.nav.includes('bilateral') && <li><Link to="/senegal-etats-unis">{t.nav_bilateral}</Link></li>}
            <li><Link to="/actualites">{t.nav_news}</Link></li>
            <li><Link to="/contact">{t.nav_contact}</Link></li>
            {linked.map((u) => <li key={u.url}><ExternalLink href={u.url!}>{l(u.label)}</ExternalLink></li>)}
          </ul>
        </div>
        <div>
          <h2>{t.f_information}</h2>
          <ul>
            <li><Link to="/accessibilite">{t.f_accessibility}</Link></li>
            <li><Link to="/confidentialite">{t.f_privacy}</Link></li>
            <li><Link to="/a-propos-de-la-demo">{t.f_demo}</Link></li>
            <li><Link to="/demo/tableau-de-bord">{t.d_title}</Link></li>
            <li><Link to="/demo/contenus">{t.f_cms}</Link></li>
            {mission.officialSite && !mission.fictional && <li><ExternalLink href={mission.officialSite}>{t.f_official}</ExternalLink></li>}
          </ul>
        </div>
      </div>
      <div className="container site-footer__legal">
        <span><strong>{t.demoBadge}.</strong> {l(mission.demoLabel)}</span>
        <span>{t.f_platform} · {others.length + 1} {t.f_missions}</span>
      </div>
    </footer>
  );
}
