import { useMemo, useState } from 'react';
import type { FaqItem, NewsItem, Service } from '../platform/types';
import { content, mission } from '../platform/mission';
import { formatDate, useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { matches } from '../platform/search';
import { Icon } from './Icon';
import { Accordion, VerifyBadge } from './ui';

/** Verification / availability chip for a service. */
export function AvailChip({ s }: { s: Service }) {
  const { t } = useI18n();
  if (s.availability === 'listed-on-official-site') return <span className="chip chip--ok"><span className="dot" />{t.avail_listed}</span>;
  if (s.availability === 'fictional') return <span className="chip chip--fictional">{t.avail_fictional}</span>;
  return <span className="chip chip--tbc"><span className="dot" />{t.avail_confirm}</span>;
}

/** Numbered editorial index row (direction A) carrying a status chip (direction C). */
export function IndexItem({ n, to, title, text, chip }: { n: number; to: string; title: string; text: string; chip?: React.ReactNode }) {
  return (
    <Link to={to} className="index__item">
      <span className="index__n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
      <span className="index__title">{title}</span>
      <Icon name="arrow" size={18} className="index__arrow" />
      <span className="index__text">{text}</span>
      {chip && <span className="index__meta">{chip}</span>}
    </Link>
  );
}

export function FaqList({ ids, searchable = true, level = 3 }: { ids?: string[]; searchable?: boolean; level?: 2 | 3 }) {
  const { l, t } = useI18n();
  const [q, setQ] = useState('');
  const items: FaqItem[] = useMemo(() => (ids ? content.faq.filter((f) => ids.includes(f.id)) : content.faq), [ids]);
  const shown = items.filter((f) => matches(q, f.question.fr, f.answer.fr, f.question.en, f.answer.en, f.topic.fr));
  const topics = Array.from(new Set(shown.map((f) => l(f.topic))));
  const H = level === 2 ? 'h2' : 'h3';
  if (!items.length) return <p className="muted">{t.faq_empty}</p>;
  return (
    <div className="faq" data-testid="faq">
      {searchable && (
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="faq-q" className="field__label">{t.faq_search}</label>
          <input id="faq-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.faq_placeholder} />
        </div>
      )}
      <p className="sr-only" aria-live="polite">{t.search_count(shown.length)}</p>
      {shown.length === 0 && <p className="empty">{t.faq_none}</p>}
      {topics.map((topic) => (
        <div key={topic}>
          {!ids && <H className="faq__topic">{topic}</H>}
          {shown.filter((f) => l(f.topic) === topic).map((f) => (
            <div key={f.id} id={f.id}>
              <Accordion title={l(f.question)} level={ids ? level : ((level + 1) as 3 | 4)}>
                <p>{l(f.answer)}</p>
                {f.service && <p><Link to={`/services-consulaires/${f.service}`} className="link-arrow">{t.read_more} <Icon name="arrow" size={15} /></Link></p>}
              </Accordion>
            </div>
          ))}
        </div>
      ))}
      {content.faqSource && <VerifyBadge v={content.faqSource} />}
    </div>
  );
}

export function NewsMeta({ n }: { n: NewsItem }) {
  const { l, t, lang } = useI18n();
  const cat = content.newsCategories.find((c) => c.id === n.category);
  return (
    <span className="story-meta">
      <span>{n.date ? <time dateTime={n.date}>{formatDate(n.date, lang)}</time> : n.dateNote ? l(n.dateNote) : t.news_undated}</span>
      <span>{l(cat?.label)}</span>
      {n.expired && <span className="chip chip--neutral">{t.news_expired}</span>}
      {n.imageOnly && <span className="chip chip--tbc">{t.news_image_only}</span>}
      {n.pinned && <span className="chip chip--alert">{t.news_pinned}</span>}
    </span>
  );
}

export function LeadStory({ n }: { n: NewsItem }) {
  const { l } = useI18n();
  return (
    <Link to={`/actualites/${n.id}`} className="lead-story">
      {n.image ? (
        <figure style={{ margin: 0 }}>
          <img src={n.image.src} alt={l(n.image.alt)} decoding="async" width={1080} height={720} style={{ objectPosition: n.image.position }} />
          <figcaption className="credit">{l(n.image.credit)}</figcaption>
        </figure>
      ) : <span />}
      <span>
        <NewsMeta n={n} />
        <h3>{l(n.title)}</h3>
        <p className="muted">{l(n.summary)}</p>
      </span>
    </Link>
  );
}

export function StoryList({ items }: { items: NewsItem[] }) {
  const { l, t } = useI18n();
  return (
    <ul className="story-list">
      {items.map((n) => (
        <li key={n.id}>
          <Link to={`/actualites/${n.id}`} className="story">
            <NewsMeta n={n} />
            <span><h3>{l(n.title)}</h3><p>{l(n.summary)}</p></span>
            <Icon name="arrow" size={18} />
            <span className="sr-only">{t.read_article}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HoursTable({ ids }: { ids?: string[] }) {
  const { l, t } = useI18n();
  const rows = mission.hours.filter((h) => !ids || ids.includes(h.id));
  if (!rows.length) return <p className="muted">{t.hours_none}</p>;
  return (
    <table className="hours-table">
      <caption className="sr-only">{t.hours_title}</caption>
      <tbody>
        {rows.map((h) => (
          <tr key={h.id}>
            <th scope="row">{l(h.service)}</th>
            <td>
              {h.slots.length ? <><b>{h.slots.join(' · ')}</b><span className="muted small">{l(h.days)}</span></> : <span className="muted">{t.hours_none}</span>}
              <VerifyBadge v={h.verification} compact />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Generic, non-procedural visit preparation list (safe when procedures are unverified). */
export function visitPrepItems(): { id: string; text: { fr: string; en: string } }[] {
  const addr = mission.address.value;
  return [
    { id: 'prep-id', text: { fr: 'Une pièce d’identité en cours de validité', en: 'A valid identity document' } },
    { id: 'prep-docs', text: { fr: 'Les originaux et les copies des documents demandés sur la fiche de la démarche (une fois confirmés)', en: 'Originals and copies of the documents listed on the service page (once confirmed)' } },
    { id: 'prep-confirm', text: { fr: 'La confirmation de rendez-vous, si l’Ambassade en délivre une', en: 'Your appointment confirmation, if the Embassy issues one' } },
    { id: 'prep-hours', text: { fr: 'Vérifier les horaires d’accueil du public avant de se déplacer', en: 'Check public opening hours before you travel' } },
    ...(addr ? [{ id: 'prep-addr', text: { fr: `Adresse : ${addr.lines.join(', ')}, ${addr.city} ${addr.postalCode}`, en: `Address: ${addr.lines.join(', ')}, ${addr.city} ${addr.postalCode}` } }] : []),
  ];
}
