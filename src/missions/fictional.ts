import type { Localized, MissionPack, Service, Verification } from '../platform/types';

/**
 * Builder for FICTIONAL demonstration missions. Every place, number and
 * request is invented to show the platform's reuse; every page carries a
 * "Mission fictive" banner. Contact details use reserved, non-working forms
 * (example.org addresses, 555 numbers).
 */
const fic: Verification = { status: 'fictional', note: { fr: 'Donnée inventée pour la démonstration.', en: 'Invented for the demonstration.' } };
const v = <T,>(value: T) => ({ value, ...fic });

interface Spec {
  id: string;
  kind: 'embassy' | 'consulate-general';
  name: Localized;
  city: string;
  country: Localized;
  street: string;
  refPrefix: string;
  theme: MissionPack['config']['theme'];
}

function svc(slug: string, category: string, icon: Service['icon'], title: Localized, summary: Localized, keywords: string[]): Service {
  return {
    slug, category, icon, title, summary, keywords, popular: true,
    availability: 'fictional', audit: 'reviewed',
    description: v(summary),
    eligibility: v({ fr: 'Ressortissants fictifs résidant dans la circonscription fictive.', en: 'Fictional nationals living in the fictional district.' }),
    documents: v([
      { id: `${slug}-1`, text: { fr: 'Pièce fictive n° 1', en: 'Fictional document 1' } },
      { id: `${slug}-2`, text: { fr: 'Pièce fictive n° 2', en: 'Fictional document 2' } },
    ]),
    fees: v([{ label: { fr: 'Frais fictifs', en: 'Fictional fee' }, amount: '0,00' }]),
    processing: v({ fr: 'Délai fictif.', en: 'Fictional delay.' }),
    howTo: v({ fr: 'Procédure fictive, pour illustrer le gabarit.', en: 'Fictional procedure, to illustrate the template.' }),
    presence: v({ fr: 'Modalité fictive.', en: 'Fictional arrangement.' }),
    forms: { value: null, status: 'fictional' },
    hours: ['main'], appointment: 'contact', faq: ['f1'],
  };
}

export function fictionalMission(s: Spec): MissionPack {
  return {
    config: {
      id: s.id,
      fictional: true,
      kind: s.kind,
      name: s.name,
      headerLines: [s.name, { fr: `${s.city} — mission fictive`, en: `${s.city} — fictional mission` }],
      country: s.country,
      city: s.city,
      jurisdiction: v({ fr: 'Circonscription fictive.', en: 'Fictional district.' }),
      officialSite: 'https://example.org/',
      address: v({ lines: [s.street], postalCode: '00000', city: s.city, country: s.country, mapQuery: s.city }),
      phone: v({ display: '+1 555 0100', tel: '+15550100' }),
      email: v(`contact@${s.id}.example.org`),
      hours: [{ id: 'main', service: { fr: 'Accueil (fictif)', en: 'Reception (fictional)' }, days: { fr: 'Du lundi au vendredi', en: 'Monday to Friday' }, slots: ['9h00 – 17h00'], verification: fic }],
      appointment: { value: null, ...fic },
      headOfMission: { title: { fr: 'Chef de mission (fictif)', en: 'Head of mission (fictional)' }, name: { value: null, ...fic } },
      network: [],
      usefulLinks: [],
      languages: [
        { code: 'fr', label: 'Français', status: 'complete' },
        { code: 'en', label: 'English', status: 'partial' },
      ],
      nav: s.kind === 'embassy' ? ['home', 'services', 'appointments', 'embassy', 'news', 'contact'] : ['home', 'services', 'appointments', 'consulate', 'news', 'contact'],
      refPrefix: s.refPrefix,
      agency: 'Dalal Technologies',
      demoLabel: {
        fr: 'Mission fictive — démonstration de la réutilisation de la plateforme par Dalal Technologies. Aucune donnée réelle.',
        en: 'Fictional mission — demonstration of platform reuse by Dalal Technologies. No real data.',
      },
      theme: s.theme,
      strings: {
        fr: { hero_title: `${s.name.fr} (fictif)`, to_confirm: 'Donnée fictive' },
        en: { hero_title: `${s.name.en} (fictional)`, to_confirm: 'Fictional data' },
      },
    },
    content: {
      categories: [
        { id: 'voyage', title: { fr: 'Documents de voyage', en: 'Travel documents' }, blurb: { fr: 'Exemple', en: 'Example' } },
        { id: 'etat-civil', title: { fr: 'État civil', en: 'Civil status' }, blurb: { fr: 'Exemple', en: 'Example' } },
      ],
      services: [
        svc('passeport', 'voyage', 'passport', { fr: 'Passeport (exemple fictif)', en: 'Passport (fictional example)' }, { fr: 'Fiche fictive illustrant le gabarit complet.', en: 'Fictional page showing the full template.' }, ['passeport', 'passport']),
        svc('naissance', 'etat-civil', 'book', { fr: 'Naissance (exemple fictif)', en: 'Birth (fictional example)' }, { fr: 'Fiche fictive illustrant une démarche d’état civil.', en: 'Fictional page showing a civil-status procedure.' }, ['naissance', 'birth']),
      ],
      quickServices: [
        { label: { fr: 'Passeport', en: 'Passport' }, icon: 'passport', to: '/services-consulaires/passeport' },
        { label: { fr: 'Naissance', en: 'Birth' }, icon: 'book', to: '/services-consulaires/naissance' },
        { label: { fr: 'Rendez-vous', en: 'Appointments' }, icon: 'calendar', to: '/rendez-vous' },
        { label: { fr: 'Assistance', en: 'Help' }, icon: 'chat', to: '/assistance' },
      ],
      faq: [{ id: 'f1', topic: { fr: 'Exemple', en: 'Example' }, question: { fr: 'Ceci est-il une vraie mission ?', en: 'Is this a real mission?' }, answer: { fr: 'Non. Tout est fictif.', en: 'No. Everything is fictional.' } }],
      faqSource: fic,
      newsCategories: [{ id: 'exemple', label: { fr: 'Exemple', en: 'Example' } }],
      news: [{ id: 'exemple', date: '2026-10-01', category: 'exemple', title: { fr: 'Actualité fictive', en: 'Fictional news item' }, summary: { fr: 'Article inventé pour montrer la mise en page.', en: 'Invented item to show the layout.' }, verification: fic }],
      finder: {
        id: 'need',
        question: { fr: 'Que souhaitez-vous faire ? (exemple)', en: 'What would you like to do? (example)' },
        options: [
          { label: { fr: 'Passeport', en: 'Passport' }, to: '/services-consulaires/passeport' },
          { label: { fr: 'Naissance', en: 'Birth' }, to: '/services-consulaires/naissance' },
        ],
      },
      institution: { sections: [{ id: 'role', title: { fr: 'Rôle (fictif)', en: 'Role (fictional)' }, body: [{ fr: 'Texte fictif.', en: 'Fictional text.' }], verification: fic }], departments: [] },
      assistance: {
        categories: [{ id: 'general', label: { fr: 'Renseignements', en: 'Enquiries' } }],
        samples: [
          { ref: `${s.refPrefix}-2026-0001`, category: 'general', subject: { fr: 'Demande fictive', en: 'Fictional request' }, received: '2026-10-20', stage: 'answer', priority: 'normal', firstReplyHours: 4, history: [{ stage: 'received', at: '2026-10-20 09:00', by: 'Système' }, { stage: 'answer', at: '2026-10-20 13:00', by: 'Agent fictif' }] },
        ],
      },
    },
  };
}
