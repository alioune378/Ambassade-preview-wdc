import { useEffect, useId, useState, type ReactNode } from 'react';
import type { Verification } from '../platform/types';
import { isPreview, mission } from '../platform/mission';
import { formatDate, useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { Icon } from './Icon';

/** Sets a unique title, description and robots metadata for the page. */
export function useSeo(title: string, description: string) {
  const { lang, l } = useI18n();
  useEffect(() => {
    const site = l(mission.name);
    document.title = title ? `${title} — ${site}` : site;
    setMeta('description', description || site);
    setMeta('robots', isPreview ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', description || site, 'property');
  }, [title, description, lang, l]);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({ eyebrow, title, intro, crumbs, children }: { eyebrow?: string; title: string; intro?: string; crumbs?: Crumb[]; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="page-header">
      <div className="container">
        {crumbs && (
          <nav aria-label={t.breadcrumb} className="crumbs">
            <ol>
              <li><Link to="/">{t.nav_home}</Link></li>
              {crumbs.map((c) => (
                <li key={c.label}>{c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/** Badge stating how a fact was verified, with its source. */
export function VerifyBadge({ v, compact }: { v: Verification; compact?: boolean }) {
  const { t, lang, l } = useI18n();
  const label = { verified: t.status_verified, 'source-reported': t.status_reported, unverified: t.status_unverified, fictional: t.status_fictional }[v.status];
  const icon = v.status === 'verified' ? 'check' : v.status === 'unverified' ? 'alert' : 'info';
  return (
    <div className={`verify verify--${v.status}`}>
      <span className="verify__label">
        <Icon name={icon} size={14} />
        {label}
      </span>
      {!compact && v.source && (
        <span className="verify__source">
          <a href={v.source} target="_blank" rel="noopener noreferrer">
            {t.source}
            <span className="sr-only"> ({t.rdv_external})</span>
          </a>
          {v.checkedOn && ` · ${t.checked_on} ${formatDate(v.checkedOn, lang)}`}
        </span>
      )}
      {!compact && v.note && <span className="verify__note">{l(v.note)}</span>}
    </div>
  );
}

export function ToConfirm({ note }: { note?: string }) {
  const { t } = useI18n();
  return (
    <div className="to-confirm" role="note">
      <Icon name="info" size={18} />
      <div>
        <strong>{t.to_confirm}</strong>
        <p>{note ?? t.to_confirm_text}</p>
      </div>
    </div>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <Icon name="external" size={15} className="ext-icon" />
      <span className="sr-only"> ({t.rdv_external})</span>
    </a>
  );
}

/** Accessible disclosure (button + region). */
export function Accordion({ title, children, defaultOpen = false, level = 3 }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; level?: 2 | 3 | 4 }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const H = (`h${level}`) as 'h2' | 'h3' | 'h4';
  return (
    <div className={`acc ${open ? 'acc--open' : ''}`}>
      <H className="acc__heading">
        <button type="button" className="acc__btn" aria-expanded={open} aria-controls={`${id}-panel`} id={`${id}-btn`} onClick={() => setOpen(!open)}>
          <span>{title}</span>
          <Icon name="chevron" size={20} className="acc__chev" />
        </button>
      </H>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} hidden={!open} className="acc__panel">
        {children}
      </div>
    </div>
  );
}

export function LanguageNotice() {
  const { lang, t } = useI18n();
  if (lang === 'fr') return null;
  return (
    <div className={`lang-notice ${lang === 'en' ? 'lang-notice--quiet' : ''}`} role="status">
      <div className="container">
        <Icon name="info" size={16} /> <span lang={lang === 'wo' ? 'fr' : undefined}>{lang === 'wo' ? t.wo_notice : t.en_partial}</span>
      </div>
    </div>
  );
}

/** Floating "back to top" button, shown after scrolling. */
export function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button type="button" className="to-top" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('contenu')?.focus({ preventScroll: true }); }}>
      <Icon name="up" size={20} />
      <span className="sr-only">{t.back_top}</span>
    </button>
  );
}
