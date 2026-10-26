import { useState } from 'react';
import type { ChecklistItem } from '../platform/types';
import { mission } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { buildPdf, downloadBytes, slugify } from '../platform/pdf';
import { Icon } from './Icon';

/**
 * Interactive checklist with print, PDF and plain-text download.
 * Ticks live in component state only; nothing is stored or sent.
 */
export function Checklist({ title, items, extra }: { title: string; items: ChecklistItem[]; extra?: string[] }) {
  const { l, t } = useI18n();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = items.filter((i) => done[i.id]).length;
  const notes = [...(extra ?? []), t.not_application, l(mission.demoLabel)];

  const pdf = () => {
    const bytes = buildPdf(title, l(mission.name), items.map((i) => (done[i.id] ? '[x] ' : '') + l(i.text)), notes);
    downloadBytes(bytes, `checklist-${slugify(title)}.pdf`, 'application/pdf');
  };
  const txt = () => {
    const lines = [title, l(mission.name), '', ...items.map((i) => `[${done[i.id] ? 'x' : ' '}] ${l(i.text)}`), '', ...notes];
    downloadBytes(lines.join('\n'), `checklist-${slugify(title)}.txt`, 'text/plain;charset=utf-8');
  };

  return (
    <div className="checklist" data-testid="checklist">
      <div className="checklist__head">
        <p className="checklist__title">{title}</p>
        <p className="checklist__count" aria-live="polite">{t.checked_count(count, items.length)}</p>
      </div>
      <ul className="checklist__list">
        {items.map((i) => (
          <li key={i.id}>
            <label className="check">
              <input type="checkbox" checked={!!done[i.id]} onChange={(e) => setDone({ ...done, [i.id]: e.target.checked })} />
              <span className="check__box" aria-hidden="true"><Icon name="check" size={14} /></span>
              <span className="check__text">{l(i.text)}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="checklist__actions no-print">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}><Icon name="print" size={16} /> {t.print}</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={pdf}><Icon name="download" size={16} /> {t.download_pdf}</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={txt}><Icon name="doc" size={16} /> {t.download}</button>
      </div>
      <p className="checklist__disclaimer">{t.not_application}</p>
    </div>
  );
}
