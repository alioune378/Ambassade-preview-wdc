import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../platform/i18n';
import { useRouter } from '../platform/router';
import { kindOrder, search, type Hit, type Kind } from '../platform/searchIndex';
import { Icon } from './Icon';

const kindIcon: Record<Kind, Parameters<typeof Icon>[0]['name']> = { service: 'doc', faq: 'chat', news: 'book', page: 'arrow' };

/**
 * Flagship search console — an ARIA 1.2 combobox with a grouped listbox.
 * Arrow keys move, Enter opens, Escape clears. Results come from one index
 * over services, FAQ, news and key pages.
 */
export function SearchConsole({ autoFocus, inline, onDone, idPrefix = 'sc' }: { autoFocus?: boolean; inline?: boolean; onDone?: () => void; idPrefix?: string }) {
  const { t, l } = useI18n();
  const { navigate } = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = `${idPrefix}-list`;
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => search(q), [q]);
  const groups = useMemo(() => kindOrder.map((k) => ({ k, items: hits.filter((h) => h.kind === k) })).filter((g) => g.items.length), [hits]);
  const flat: Hit[] = groups.flatMap((g) => g.items);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (to: string) => { setOpen(false); setQ(''); onDone?.(); navigate(to); };
  const submit = () => {
    const pick = flat.at(active);
    if (open && pick) go(pick.to);
    else if (q.trim()) go(`/recherche?q=${encodeURIComponent(q.trim())}`);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, Math.max(flat.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { if (q) { setQ(''); } else { setOpen(false); onDone?.(); } }
  };

  const kindLabel: Record<Kind, string> = { service: t.search_services, faq: t.search_faq, news: t.search_news, page: t.search_pages };
  const chipLabel = (c?: Hit['chip']) => (c === 'ok' ? t.avail_listed : c === 'tbc' ? t.avail_confirm : c === 'fictional' ? t.avail_fictional : null);
  const showPanel = open && q.trim().length > 0;
  let n = -1;

  return (
    <div className="console" ref={boxRef} data-testid="search-console">
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor={`${idPrefix}-input`} className="sr-only">{t.search_label}</label>
        <div className="console__box">
          <Icon name="search" size={20} />
          <input
            id={`${idPrefix}-input`}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showPanel && flat.length ? `${uid}-o${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={t.search_label}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
          />
          <button type="submit" className="btn btn--primary console__go"><span className="t">{t.search_button}</span><Icon name="arrow" size={18} /></button>
        </div>
      </form>
      <p className="sr-only" aria-live="polite">{showPanel ? t.search_count(flat.length) : ''}</p>
      {showPanel && (
        <div className={`console__panel ${inline ? 'console__panel--inline' : ''}`}>
          {flat.length === 0 ? (
            <p className="console__empty">{t.search_none}</p>
          ) : (
            <ul className="console__list" id={listId} role="listbox" aria-label={t.search_suggest}>
              {groups.map((g) => (
                <li key={g.k} role="presentation">
                  <p className="console__group" role="presentation">{kindLabel[g.k]}</p>
                  <ul role="presentation" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {g.items.map((h) => {
                      n += 1;
                      const i = n;
                      const chip = chipLabel(h.chip);
                      return (
                        <li
                          key={h.kind + h.id}
                          id={`${uid}-o${i}`}
                          role="option"
                          aria-selected={i === active}
                          className="console__opt"
                          onMouseEnter={() => setActive(i)}
                          onMouseDown={(e) => { e.preventDefault(); go(h.to); }}
                        >
                          <span className="ic" aria-hidden="true"><Icon name={kindIcon[h.kind]} size={16} /></span>
                          <span><b>{l(h.title)}</b><small>{l(h.detail).slice(0, 90)}{l(h.detail).length > 90 ? '…' : ''}</small></span>
                          {chip && <span className={`chip chip--${h.chip}`}>{chip}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <div className="console__foot"><span>{t.search_keys}</span><span>{t.search_scope}</span></div>
        </div>
      )}
    </div>
  );
}

/** Header search overlay, opened by the search button or Ctrl/⌘ + K. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('input, button, a[href]');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="overlay__card" role="dialog" aria-modal="true" aria-label={t.search_label} ref={ref}>
        <div className="overlay__head"><p>{t.search_title}</p><button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}><Icon name="close" size={18} /></button></div>
        <SearchConsole autoFocus inline onDone={onClose} idPrefix="ov" />
      </div>
    </div>
  );
}
