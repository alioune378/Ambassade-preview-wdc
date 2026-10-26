import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LangCode, Localized } from './types';
import { en, fr, type Strings } from './strings';
import { mission } from './mission';
import { readStore, writeStore } from './storage';

interface I18n {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  /** Interface strings with mission overrides applied. */
  t: Strings;
  /** Pick the right language from a content object. */
  l: (text: Localized | undefined | null) => string;
}

const Ctx = createContext<I18n | null>(null);

function stringsFor(lang: LangCode): Strings {
  // Wolof has no reviewed strings yet; never mix half-translated labels.
  if (lang === 'en') return { ...en, ...(mission.strings?.en ?? {}) } as Strings;
  return { ...fr, ...(mission.strings?.fr ?? {}) } as Strings;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const stored = readStore<LangCode>('lang');
    return stored === 'en' || stored === 'wo' ? stored : 'fr';
  });

  useEffect(() => {
    // Wolof content is displayed in French, so declare French on the document.
    document.documentElement.lang = lang === 'en' ? 'en' : 'fr';
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const t = stringsFor(lang);
    const l = (text: Localized | undefined | null) => {
      if (!text) return '';
      if (lang === 'en' && text.en) return text.en;
      return text.fr;
    };
    return {
      lang,
      setLang: (next) => {
        setLangState(next);
        writeStore('lang', next);
      },
      t,
      l,
    };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n outside provider');
  return ctx;
}

export function formatDate(iso: string, lang: LangCode): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
