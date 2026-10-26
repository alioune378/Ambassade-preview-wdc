import type { MissionConfig, Verification } from '../../platform/types';

export const OFFICIAL = 'https://www.ambasenegal-us.org/';
export const CHECKED = '2026-10-26';

/**
 * Facts below come from the official site: first from screenshots supplied to
 * Dalal Studio, then checked against the live pages on 26 Oct 2026. They are
 * "source-reported": shown, labelled, to be reconfirmed by the Embassy.
 */
export const fromScreens = (noteFr?: string, noteEn?: string): Verification => ({
  status: 'source-reported',
  source: OFFICIAL,
  checkedOn: CHECKED,
  note: {
    fr: noteFr ?? 'Publié sur le site officiel (consulté le 26 octobre 2026). À reconfirmer par l’Ambassade.',
    en: noteEn ?? 'Published on the official site (checked 26 October 2026). To be reconfirmed by the Embassy.',
  },
});

/** A fact published on a specific page of the official site. */
export const fromPage = (path: string, pageFr: string, pageEn: string): Verification => ({
  status: 'source-reported',
  source: OFFICIAL + path,
  checkedOn: CHECKED,
  note: {
    fr: `Page « ${pageFr} » du site officiel, consultée le 26 octobre 2026. À reconfirmer par l’Ambassade.`,
    en: `Official “${pageEn}” page, checked 26 October 2026. To be reconfirmed by the Embassy.`,
  },
});

export const config: MissionConfig = {
  id: 'washington',
  kind: 'embassy',
  name: {
    fr: 'Ambassade du Sénégal aux États-Unis d’Amérique',
    en: 'Embassy of Senegal to the United States of America',
  },
  headerLines: [
    { fr: 'Ambassade aux États-Unis d’Amérique', en: 'Embassy to the United States of America' },
    { fr: 'Washington, D.C.', en: 'Washington, D.C.' },
  ],
  country: { fr: 'États-Unis', en: 'United States' },
  city: 'Washington, D.C.',
  jurisdiction: {
    value: {
      fr: 'Outre les États-Unis : Mexique, Bahamas, Barbade, Grenade, Nicaragua, Guatemala, Salvador, Panama, Costa Rica, Honduras, Suriname et Guyana. L’Ambassade suit également les activités des institutions de Bretton Woods (FMI, Banque mondiale).',
      en: 'Besides the United States: Mexico, the Bahamas, Barbados, Grenada, Nicaragua, Guatemala, El Salvador, Panama, Costa Rica, Honduras, Suriname and Guyana. The Embassy also follows the Bretton Woods institutions (IMF, World Bank).',
    },
    ...fromScreens('Page « Juridiction » du site officiel (consultée le 26 octobre 2026). La répartition avec le Consulat de New York reste à préciser.', 'Official “Jurisdiction” page (checked 26 October 2026). The split with the New York Consulate is still to be clarified.'),
  },
  officialSite: OFFICIAL,
  secondarySites: [
    {
      url: 'https://washington.senegaldiplomatie.org/',
      note: {
        fr: 'Second site portant le nom de Washington. Inaccessible lors de l’audit ; son statut officiel n’est pas établi.',
        en: 'A second Washington-branded site. Unreachable during the audit; its official status is not established.',
      },
    },
  ],
  address: {
    value: {
      lines: ['2215 M Street NW'],
      postalCode: 'DC 20037',
      city: 'Washington',
      country: { fr: 'États-Unis', en: 'United States' },
      mapQuery: '2215 M St NW, Washington, DC 20037',
    },
    ...fromScreens(),
  },
  phone: { value: { display: '+1 202 234 0540', tel: '+12022340540' }, ...fromScreens() },
  fax: { value: { display: '+1 202 629 2961', tel: '+12026292961' }, ...fromScreens() },
  email: { value: 'Contact@ambasenegal-us.org', ...fromScreens() },
  hours: [
    {
      id: 'embassy',
      service: { fr: 'Ambassade', en: 'Embassy' },
      days: { fr: 'Du lundi au vendredi', en: 'Monday to Friday' },
      slots: ['9h30 – 16h30'],
      verification: fromScreens(),
    },
    {
      id: 'consular',
      service: { fr: 'Section consulaire — accueil du public', en: 'Consular section — public hours' },
      days: { fr: 'Jours à confirmer (vraisemblablement du lundi au vendredi)', en: 'Days to be confirmed (presumably Monday to Friday)' },
      slots: ['10h00 – 15h00'],
      verification: fromScreens(
        'Horaire publié sans précision des jours. À reconfirmer.',
        'Published without the days of the week. To be reconfirmed.',
      ),
    },
  ],
  transit: {
    value: { fr: 'Métro : ligne rouge, station Dupont Circle.', en: 'Metro: Red Line, Dupont Circle station.' },
    ...fromScreens(),
  },
  schedule: {
    timeZone: 'America/New_York',
    entries: [
      { id: 'embassy', label: { fr: 'Ambassade', en: 'Embassy' }, days: [1, 2, 3, 4, 5], open: '09:30', close: '16:30', verification: fromScreens() },
      { id: 'consular', label: { fr: 'Section consulaire (public)', en: 'Consular section (public)' }, days: null, open: '10:00', close: '15:00', verification: fromScreens('Horaire publié sans les jours de la semaine.', 'Published without the days of the week.') },
    ],
  },
  jurisdictionCountries: {
    value: [
      { fr: 'États-Unis', en: 'United States' }, { fr: 'Mexique', en: 'Mexico' }, { fr: 'Bahamas', en: 'Bahamas' },
      { fr: 'Barbade', en: 'Barbados' }, { fr: 'Grenade', en: 'Grenada' }, { fr: 'Nicaragua', en: 'Nicaragua' },
      { fr: 'Guatemala', en: 'Guatemala' }, { fr: 'Salvador', en: 'El Salvador' }, { fr: 'Panama', en: 'Panama' },
      { fr: 'Costa Rica', en: 'Costa Rica' }, { fr: 'Honduras', en: 'Honduras' }, { fr: 'Suriname', en: 'Suriname' },
      { fr: 'Guyana', en: 'Guyana' },
    ],
    ...fromScreens('Page « Juridiction » du site officiel (consultée le 26 octobre 2026).', 'Official “Jurisdiction” page (checked 26 October 2026).'),
  },
  appointment: {
    value: null,
    status: 'unverified',
    note: {
      fr: 'Aucun portail de rendez-vous en ligne n’a pu être vérifié. En attendant confirmation, la voie de contact est le téléphone ou l’e-mail de l’Ambassade.',
      en: 'No online appointment portal could be verified. Until confirmed, use the Embassy’s phone or email.',
    },
  },
  headOfMission: {
    title: { fr: 'Ambassadeur', en: 'Ambassador' },
    name: {
      value: 'M. Abdoul Wahab Haïdara',
      ...fromScreens(
        'Nom et biographie figurant sur le site officiel (consultée le 26 octobre 2026).',
        'Name and biography shown on the official site (checked 26 October 2026).',
      ),
    },
  },
  network: [
    {
      id: 'washington',
      name: { fr: 'Ambassade du Sénégal à Washington', en: 'Embassy of Senegal in Washington' },
      kind: 'embassy',
      url: OFFICIAL,
      linkStatus: 'working',
      verification: fromScreens(),
    },
    {
      id: 'new-york',
      name: { fr: 'Consulat du Sénégal à New York', en: 'Consulate of Senegal in New York' },
      kind: 'consulate-general',
      linkStatus: 'none',
      verification: fromScreens(
        'Listé dans les liens utiles du site officiel ; adresse et site à confirmer.',
        'Listed in the official site’s useful links; address and website to be confirmed.',
      ),
    },
  ],
  usefulLinks: [
    {
      label: { fr: 'Ministère de l’Intégration africaine et des Affaires étrangères', en: 'Ministry of African Integration and Foreign Affairs' },
      url: 'https://diplomatie.gouv.sn/',
      verification: fromScreens('Listé sur le site officiel ; adresse web vérifiée sur un autre site diplomatique sénégalais.'),
    },
    { label: { fr: 'Gouvernement du Sénégal', en: 'Government of Senegal' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'APIX', en: 'APIX (investment promotion)' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'ASEPEX', en: 'ASEPEX (export promotion)' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'Chambre de Commerce et d’Industrie de Dakar', en: 'Dakar Chamber of Commerce and Industry' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'Ministère du Tourisme', en: 'Ministry of Tourism' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'Consulat du Sénégal à New York', en: 'Consulate of Senegal in New York' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
    { label: { fr: 'Démarches administratives', en: 'Administrative procedures' }, verification: fromScreens('Listé sur le site officiel ; adresse web à confirmer.') },
  ],
  languages: [
    { code: 'fr', label: 'Français', status: 'complete' },
    { code: 'en', label: 'English', status: 'partial' },
    { code: 'wo', label: 'Wolof', status: 'planned' },
  ],
  nav: ['home', 'services', 'appointments', 'embassy', 'bilateral', 'news', 'contact'],
  refPrefix: 'DEMO-WDC',
  agency: 'Dalal Studio',
  demoLabel: {
    fr: 'Maquette de démonstration non officielle — Projet proposé par Dalal Studio. Aucun service administratif réel n’est fourni sur cette plateforme.',
    en: 'Unofficial demonstration mock-up — Project proposed by Dalal Studio. No real administrative service is provided on this platform.',
  },
  // Approved direction: Diplomatic Modernism (midnight, ivory, stone, restrained gold),
  // Senegal green as the accent, red only for genuine alerts.
  theme: {
    primary: '#0F1B2D',
    secondary: '#0E5A43',
    ivory: '#F7F4EC',
    gold: '#B8975A',
    charcoal: '#1C2230',
    red: '#B4231B',
  },
  strings: {
    fr: {
      hero_title: 'L’Ambassade du Sénégal à Washington, à votre service.',
      hero_text: 'Retrouvez les informations essentielles, préparez vos démarches consulaires et accédez facilement aux services de votre ambassade.',
      hero_cta_contact: 'Contacter l’Ambassade',
      to_confirm: 'Informations à confirmer auprès de l’Ambassade.',
      to_confirm_text: 'Cette information n’a pas pu être vérifiée lors de l’audit. L’Ambassade doit la fournir avant toute mise en ligne.',
      book_text: 'Aucun portail de rendez-vous n’a pu être vérifié. Préparez vos documents, puis contactez l’Ambassade pour connaître la procédure.',
      f_about: 'Démonstration réalisée par Dalal Studio. Ce site n’est pas le site officiel de l’Ambassade, ne fournit aucun service et ne résulte d’aucun contrat ni d’aucune autorisation.',
      contact_route: 'Contactez l’Ambassade par téléphone ou e-mail pour connaître la procédure de rendez-vous.',
      rdv_no_portal: 'Aucun portail de rendez-vous en ligne n’a pu être vérifié. La procédure de réservation doit être confirmée par l’Ambassade ; en attendant, utilisez les coordonnées ci-dessous.',
    },
    en: {
      hero_title: 'The Embassy of Senegal in Washington, at your service.',
      hero_text: 'Find essential information, prepare your consular procedures and reach your embassy’s services easily.',
      hero_cta_contact: 'Contact the Embassy',
      to_confirm: 'Information to be confirmed with the Embassy.',
      to_confirm_text: 'This information could not be verified during the audit. The Embassy must supply it before launch.',
      book_text: 'No appointment portal could be verified. Prepare your documents, then contact the Embassy to find out the procedure.',
      f_about: 'Demonstration by Dalal Studio. This is not the Embassy’s official website, provides no services, and results from no contract or authorization.',
      contact_route: 'Contact the Embassy by phone or email to find out how to book.',
      rdv_no_portal: 'No online appointment portal could be verified. The booking procedure must be confirmed by the Embassy; meanwhile, use the contact details below.',
    },
  },
};
