import type { Localized } from './types';
import { content, mission } from './mission';
import { normalize } from './search';

/**
 * One search index for the whole site: services, FAQ, news and key pages.
 * Scoring: title matches weigh more than body matches; every query word must
 * appear somewhere. Accent- and case-insensitive (French users type
 * "etat civil" as often as "état civil").
 */

export type Kind = 'service' | 'faq' | 'news' | 'page';

export interface Entry {
  kind: Kind;
  id: string;
  to: string;
  title: Localized;
  detail: Localized;
  keywords: string;
  chip?: 'ok' | 'tbc' | 'neutral' | 'fictional';
}

const pages: Entry[] = [
  { kind: 'page', id: 'rdv', to: '/rendez-vous', title: { fr: 'Rendez-vous : comment ça marche', en: 'Appointments: how it works' }, detail: { fr: 'Préparer sa visite, canal officiel', en: 'Preparing your visit, official channel' }, keywords: 'rendez-vous rdv appointment booking réserver visite' },
  { kind: 'page', id: 'contact', to: '/contact', title: { fr: 'Contact, horaires et accès', en: 'Contact, hours and access' }, detail: { fr: 'Adresse, téléphone, e-mail, métro', en: 'Address, phone, email, metro' }, keywords: 'contact adresse address téléphone phone email horaires hours métro metro dupont circle fax' },
  { kind: 'page', id: 'juridiction', to: '/l-ambassade/juridiction', title: { fr: 'Juridiction de l’Ambassade', en: 'Embassy jurisdiction' }, detail: { fr: 'Pays couverts, FMI, Banque mondiale', en: 'Countries covered, IMF, World Bank' }, keywords: 'juridiction jurisdiction pays countries mexique mexico bahamas barbade barbados grenade grenada nicaragua guatemala salvador panama costa rica honduras suriname guyana fmi imf banque mondiale world bank' },
  { kind: 'page', id: 'ambassadeur', to: '/l-ambassade/ambassadeur', title: { fr: 'L’Ambassadeur : message et biographie', en: 'The Ambassador: message and biography' }, detail: { fr: 'Mot de l’Ambassadeur, parcours', en: 'Message, career' }, keywords: 'ambassadeur ambassador haidara haïdara biographie biography message' },
  { kind: 'page', id: 'anciens', to: '/l-ambassade/anciens-ambassadeurs', title: { fr: 'Anciens ambassadeurs', en: 'Former ambassadors' }, detail: { fr: 'Depuis 1960', en: 'Since 1960' }, keywords: 'anciens ambassadeurs former ambassadors histoire history' },
  { kind: 'page', id: 'finder', to: '/trouver-ma-demarche', title: { fr: 'Trouver ma démarche en deux questions', en: 'Find your service in two questions' }, detail: { fr: 'Orientation guidée', en: 'Guided orientation' }, keywords: 'aide help trouver find guide orientation' },
  { kind: 'page', id: 'assistance', to: '/assistance', title: { fr: 'Centre d’assistance consulaire (démo)', en: 'Consular Assistance Center (demo)' }, detail: { fr: 'Poser une question, suivre une réponse', en: 'Ask a question, follow the reply' }, keywords: 'assistance question aide help suivi tracking demande request' },
  { kind: 'page', id: 'bilateral', to: '/senegal-etats-unis', title: { fr: 'Relations Sénégal–États-Unis', en: 'Senegal–United States relations' }, detail: { fr: 'Diplomatie, agriculture, commerce, diaspora', en: 'Diplomacy, agriculture, trade, diaspora' }, keywords: 'coopération cooperation investissement investment commerce trade apix asepex tourisme tourism diaspora culture agriculture usda' },
];

let cache: Entry[] | null = null;

export function index(): Entry[] {
  if (cache) return cache;
  const svc: Entry[] = content.services.map((s) => ({
    kind: 'service',
    id: s.slug,
    to: `/services-consulaires/${s.slug}`,
    title: s.title,
    detail: s.summary,
    keywords: s.keywords.join(' '),
    chip: s.availability === 'listed-on-official-site' ? 'ok' : s.availability === 'fictional' ? 'fictional' : 'tbc',
  }));
  const faq: Entry[] = content.faq.map((f) => ({
    kind: 'faq',
    id: f.id,
    to: `/questions-frequentes#${f.id}`,
    title: f.question,
    detail: f.answer,
    keywords: `${f.topic.fr} ${f.topic.en ?? ''}`,
    chip: 'neutral',
  }));
  const news: Entry[] = content.news.map((n) => ({
    kind: 'news',
    id: n.id,
    to: `/actualites/${n.id}`,
    title: n.title,
    detail: n.summary,
    keywords: n.category,
    chip: 'neutral',
  }));
  const relevantPages = pages.filter((p) => (p.id === 'bilateral' ? !!content.bilateral : p.id === 'juridiction' || p.id === 'anciens' ? mission.kind === 'embassy' && !mission.fictional : true));
  cache = [...svc, ...faq, ...news, ...relevantPages];
  return cache;
}

export interface Hit extends Entry {
  score: number;
}

export function search(query: string, limitPerKind = 5): Hit[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ').filter((w) => w.length > 1 || q.length === 1);
  const hits: Hit[] = [];
  for (const e of index()) {
    const title = normalize(`${e.title.fr} ${e.title.en ?? ''}`);
    const body = normalize(`${e.detail.fr} ${e.detail.en ?? ''} ${e.keywords}`);
    let score = 0;
    let all = true;
    for (const w of words) {
      const inTitle = title.includes(w);
      const inBody = body.includes(w);
      if (!inTitle && !inBody) { all = false; break; }
      score += inTitle ? (title.split(' ').some((t) => t.startsWith(w)) ? 6 : 4) : 1;
    }
    if (!all) continue;
    if (e.kind === 'service') score += 2;
    hits.push({ ...e, score });
  }
  hits.sort((a, b) => b.score - a.score);
  const counts: Record<string, number> = {};
  return hits.filter((h) => (counts[h.kind] = (counts[h.kind] ?? 0) + 1) <= limitPerKind);
}

export const kindOrder: Kind[] = ['service', 'page', 'faq', 'news'];
