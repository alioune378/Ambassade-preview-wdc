/**
 * Sénégal Consulaire Digital — platform types.
 *
 * The platform is split in two:
 *   - shared UI (src/components, src/pages, src/platform)
 *   - one "mission pack" per post (src/missions/<id>): configuration + content.
 * Components never hard-code a post. They read the active mission pack.
 */
import type { Strings } from './strings';

export type LangCode = 'fr' | 'en' | 'wo';

/** Text in several languages. French is always required. */
export interface Localized {
  fr: string;
  en?: string;
  wo?: string;
}

/**
 * How far a fact can be trusted.
 * - verified:        read on the official site by the audit, on `checkedOn`.
 * - source-reported: published by the post (site or screenshots of it) but to be
 *                    reconfirmed before use as authoritative instruction.
 * - unverified:      not checked. UI shows "Informations à confirmer".
 * - fictional:       invented demonstration data (fictional missions only).
 */
export type VerificationStatus = 'verified' | 'source-reported' | 'unverified' | 'fictional';

export interface Verification {
  status: VerificationStatus;
  source?: string;
  checkedOn?: string;
  note?: Localized;
}

export interface Verified<T> extends Verification {
  value: T | null;
}

export interface Address {
  lines: string[];
  postalCode: string;
  city: string;
  country: Localized;
  mapQuery: string;
}

export interface HoursEntry {
  id: string;
  service: Localized;
  days: Localized;
  slots: string[];
  verification: Verification;
}

export interface Post {
  id: string;
  name: Localized;
  kind: 'embassy' | 'consulate-general' | 'consular-agency' | 'honorary-consulate';
  url?: string;
  linkStatus: 'working' | 'broken-on-official-site' | 'none';
  verification: Verification;
}

export interface Theme {
  /** Deep primary (headers, footer, buttons). */
  primary: string;
  /** Secondary primary (links, accents). */
  secondary: string;
  /** Page background. */
  ivory: string;
  /** Accent fills only — never small text on white. */
  gold: string;
  /** Body text. */
  charcoal: string;
  /** Alerts, used sparingly. */
  red: string;
}

export type NavKey = 'home' | 'services' | 'appointments' | 'embassy' | 'bilateral' | 'news' | 'consulate' | 'contact';

export interface MissionConfig {
  id: string;
  /** Fictional missions are demonstration-only; a banner says so on every page. */
  fictional?: boolean;
  kind: 'embassy' | 'consulate-general';
  name: Localized;
  /** Header lines under "RÉPUBLIQUE DU SÉNÉGAL". */
  headerLines: Localized[];
  country: Localized;
  city: string;
  jurisdiction: Verified<Localized>;
  officialSite: string;
  secondarySites?: { url: string; note: Localized }[];
  address: Verified<Address>;
  phone: Verified<{ display: string; tel: string }>;
  fax?: Verified<{ display: string; tel: string }>;
  email: Verified<string>;
  hours: HoursEntry[];
  transit?: Verified<Localized>;
  /** Machine-readable opening schedule, used for the live "open now" status. */
  schedule?: {
    timeZone: string;
    entries: { id: string; label: Localized; days: number[] | null; open: string; close: string; verification: Verification }[];
  };
  /** Countries covered, for the jurisdiction display. */
  jurisdictionCountries?: Verified<Localized[]>;
  appointment: Verified<{ url: string; label: Localized }>;
  headOfMission: { title: Localized; name: Verified<string>; portrait?: { src: string; credit: Localized } };
  network: Post[];
  usefulLinks: { label: Localized; url?: string; verification: Verification }[];
  languages: { code: LangCode; label: string; status: 'complete' | 'partial' | 'planned' }[];
  nav: NavKey[];
  /** Prefix for simulated assistance references, e.g. DEMO-WDC. */
  refPrefix: string;
  demoLabel: Localized;
  agency: string;
  theme: Theme;
  /** Mission-specific wording (e.g. "auprès de l'Ambassade" vs "du Consulat"). */
  strings?: { fr?: Partial<Strings>; en?: Partial<Strings> };
}

// ───────────── Content pack ─────────────

export interface ChecklistItem {
  id: string;
  text: Localized;
}

export interface Fee {
  label: Localized;
  amount: string;
}

export type IconName =
  | 'passport' | 'id' | 'card' | 'book' | 'ring' | 'globe' | 'stamp' | 'scale'
  | 'hands' | 'family' | 'people' | 'dove' | 'visa' | 'doc' | 'home' | 'flag'
  | 'calendar' | 'chat' | 'pen';

export interface Category {
  id: string;
  title: Localized;
  blurb: Localized;
}

export interface Service {
  slug: string;
  category: string;
  icon: IconName;
  title: Localized;
  summary: Localized;
  keywords: string[];
  popular?: boolean;
  /** Whether the post's own site lists this service. */
  availability: 'listed-on-official-site' | 'to-confirm' | 'fictional';
  officialPage?: string;
  audit: 'reviewed' | 'faq-only' | 'menu-only' | 'not-reviewed';
  description: Verified<Localized>;
  eligibility: Verified<Localized>;
  documents: Verified<ChecklistItem[]>;
  fees: Verified<Fee[]>;
  processing: Verified<Localized>;
  howTo: Verified<Localized>;
  presence: Verified<Localized>;
  forms: Verified<{ label: Localized; url: string }[]>;
  hours: string[];
  appointment: 'portal' | 'walk-in' | 'contact' | 'unknown';
  faq: string[];
  guide?: 'passport-renewal';
}

export interface FaqItem {
  id: string;
  topic: Localized;
  question: Localized;
  answer: Localized;
  service?: string;
}

export interface NewsCategory {
  id: string;
  label: Localized;
}

export interface NewsItem {
  id: string;
  /** ISO date; omitted when the source shows none. */
  date?: string;
  dateNote?: Localized;
  category: string;
  title: Localized;
  summary: Localized;
  /** Longer body for the article page (Dalal Technologies's own summary). */
  body?: Localized[];
  imageOnly?: boolean;
  image?: { src: string; alt: Localized; credit: Localized; position?: string };
  /** Current alert shown in the home banner. */
  pinned?: boolean;
  /** Older notice that must not be presented as current. */
  expired?: boolean;
  source?: string;
  verification: Verification;
}

export interface FinderOption {
  label: Localized;
  hint?: Localized;
  /** Go to a path… */
  to?: string;
  /** …or ask a follow-up question. */
  next?: FinderQuestion;
}

export interface FinderQuestion {
  id: string;
  question: Localized;
  options: FinderOption[];
}

export interface Section {
  id: string;
  title: Localized;
  body: Localized[];
  verification: Verification;
}

export interface PassportScenario {
  id: string;
  label: Localized;
  hint: Localized;
  stamp: string;
  items: ChecklistItem[];
}

export interface MissionContent {
  categories: Category[];
  services: Service[];
  /** Slugs (or app paths starting with "/") shown as home quick-service cards. */
  quickServices: { label: Localized; icon: IconName; to: string }[];
  faq: FaqItem[];
  faqSource?: Verification;
  newsCategories: NewsCategory[];
  news: NewsItem[];
  finder: FinderQuestion;
  passportGuide?: { scenarios: PassportScenario[]; minor: ChecklistItem; verification: Verification };
  /** Embassy / consulate presentation pages. */
  institution: {
    message?: { title: Localized; excerpt: Localized; full: Localized[]; signedBy: string; verification: Verification; source?: string };
    sections: Section[];
    departments: { id: string; name: Localized; verification: Verification }[];
    formerHeads?: { list: { name: string; years: string; note?: Localized }[]; verification: Verification };
  };
  bilateral?: { intro: Localized; themes: Section[] };
  assistance: {
    categories: { id: string; label: Localized }[];
    /** Synthetic requests for the staff dashboard. Must be fictional. */
    samples: SampleRequest[];
  };
}

export type Stage = 'received' | 'assigned' | 'processing' | 'answer' | 'closed';
export type Priority = 'high' | 'normal' | 'low';

export interface SampleRequest {
  ref: string;
  category: string;
  subject: Localized;
  received: string;
  stage: Stage;
  priority: Priority;
  firstReplyHours: number | null;
  history: { stage: Stage; at: string; by: string; note?: Localized }[];
}

export interface MissionPack {
  config: MissionConfig;
  content: MissionContent;
}
