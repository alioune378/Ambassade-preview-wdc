import type { ChecklistItem, IconName, Localized, MissionContent, SampleRequest, Service, Verification, Verified } from '../../platform/types';
import { fromPage, fromScreens, OFFICIAL } from './config';

/**
 * Washington content pack. Written by Dalal Studio from the official site
 * (screenshots, then the live pages checked on 26 Oct 2026). Nothing from
 * Paris is reused. Facts are paraphrased from the Embassy's own pages and
 * marked source-reported; where a page is silent, the field stays empty and
 * the UI says "Informations à confirmer auprès de l'Ambassade."
 */

const none = <T,>(): Verified<T> => ({ value: null, status: 'unverified' });
const neutral = (fr: string, en: string): Verified<Localized> => ({
  value: { fr, en },
  status: 'unverified',
  note: {
    fr: 'Description générale rédigée par Dalal Studio, à valider par l’Ambassade.',
    en: 'General description written by Dalal Studio, to be validated by the Embassy.',
  },
});

function service(
  slug: string,
  category: string,
  icon: IconName,
  title: Localized,
  summary: Localized,
  keywords: string[],
  opts: { listed?: boolean; popular?: boolean; faq?: string[] } = {},
): Service {
  return {
    slug,
    category,
    icon,
    title,
    summary,
    keywords,
    popular: opts.popular,
    availability: opts.listed ? 'listed-on-official-site' : 'to-confirm',
    officialPage: opts.listed ? OFFICIAL : undefined,
    audit: opts.listed ? 'menu-only' : 'not-reviewed',
    description: neutral(summary.fr, summary.en ?? summary.fr),
    eligibility: none(),
    documents: none<ChecklistItem[]>(),
    fees: none(),
    processing: none(),
    howTo: none(),
    presence: none(),
    forms: none(),
    hours: opts.listed ? ['consular'] : [],
    appointment: 'contact',
    faq: opts.faq ?? [],
  };
}

const services: Service[] = [
  // Travel documents
  service('passeport', 'voyage', 'passport',
    { fr: 'Passeport : première demande et renouvellement', en: 'Passport: first application and renewal' },
    { fr: 'Obtenir ou renouveler un passeport sénégalais depuis les États-Unis.', en: 'Getting or renewing a Senegalese passport from the United States.' },
    ['passeport', 'passport', 'renouvellement', 'renewal', 'premier', 'first'],
    { listed: true, popular: true, faq: ['horaires-consulaires', 'rendez-vous'] }),
  service('passeport-perdu-deteriore', 'voyage', 'passport',
    { fr: 'Passeport perdu ou détérioré', en: 'Lost or damaged passport' },
    { fr: 'Que faire en cas de perte, de vol ou de détérioration de son passeport.', en: 'What to do if your passport is lost, stolen or damaged.' },
    ['perdu', 'vol', 'volé', 'lost', 'stolen', 'damaged', 'abîmé', 'passeport']),
  service('document-voyage-urgence', 'voyage', 'doc',
    { fr: 'Document de voyage d’urgence', en: 'Emergency travel document' },
    { fr: 'Voyager vers le Sénégal sans passeport valide, en cas d’urgence.', en: 'Travelling to Senegal without a valid passport, in an emergency.' },
    ['urgence', 'sauf-conduit', 'laissez-passer', 'emergency', 'travel']),
  // Identity and registration
  service('carte-consulaire', 'identite', 'card',
    { fr: 'Carte consulaire', en: 'Consular card' },
    { fr: 'La carte qui atteste votre inscription auprès de l’Ambassade.', en: 'The card showing you are registered with the Embassy.' },
    ['carte consulaire', 'consular card', 'carte', 'card'],
    { listed: true, popular: true, faq: ['inscription'] }),
  service('inscription-consulaire', 'identite', 'pen',
    { fr: 'Inscription consulaire', en: 'Consular registration' },
    { fr: 'Se faire connaître de l’Ambassade en tant que Sénégalais résidant aux États-Unis.', en: 'Registering with the Embassy as a Senegalese national living in the United States.' },
    ['inscription', 'immatriculation', 'registration', 'register', 'diaspora'],
    { listed: true, faq: ['inscription'] }),
  service('carte-nationale-identite', 'identite', 'id',
    { fr: 'Carte nationale d’identité', en: 'National ID card' },
    { fr: 'Informations sur la carte d’identité biométrique CEDEAO pour les Sénégalais des États-Unis.', en: 'Information on the ECOWAS biometric ID card for Senegalese nationals in the United States.' },
    ['cni', 'carte identité', 'identity', 'id card', 'cedeao', 'ecowas']),
  // Civil status
  service('transcription-naissance', 'etat-civil', 'book',
    { fr: 'Déclaration et transcription de naissance', en: 'Birth registration and transcription' },
    { fr: 'Faire enregistrer au Sénégal la naissance d’un enfant né aux États-Unis.', en: 'Registering in Senegal the birth of a child born in the United States.' },
    ['naissance', 'birth', 'enfant', 'child', 'transcription', 'état civil'], { popular: true }),
  service('mariage', 'etat-civil', 'ring',
    { fr: 'Documents liés au mariage', en: 'Marriage documents' },
    { fr: 'Transcription d’un mariage célébré aux États-Unis et documents à fournir avant un mariage.', en: 'Recording a marriage held in the United States and documents needed before a wedding.' },
    ['mariage', 'marriage', 'wedding', 'coutume', 'célibat']),
  service('deces-rapatriement', 'etat-civil', 'dove',
    { fr: 'Décès et rapatriement', en: 'Death and repatriation' },
    { fr: 'Formalités en cas de décès d’un ressortissant et rapatriement au Sénégal.', en: 'Formalities after the death of a national and repatriation to Senegal.' },
    ['décès', 'death', 'rapatriement', 'repatriation', 'mortuaire']),
  service('certificats-attestations', 'etat-civil', 'doc',
    { fr: 'Certificats et attestations', en: 'Certificates and attestations' },
    { fr: 'Certificats de vie, de résidence et autres attestations délivrées par l’Ambassade.', en: 'Life certificates, residence certificates and other attestations issued by the Embassy.' },
    ['certificat', 'attestation', 'certificate', 'vie', 'résidence']),
  // Administrative
  service('legalisation', 'administratif', 'stamp',
    { fr: 'Légalisation de documents', en: 'Document legalization' },
    { fr: 'Authentifier une signature ou un document destiné à l’administration sénégalaise.', en: 'Authenticating a signature or document for use with Senegalese authorities.' },
    ['légalisation', 'legalization', 'authentification', 'signature', 'apostille']),
  service('procuration', 'administratif', 'scale',
    { fr: 'Procurations', en: 'Powers of attorney' },
    { fr: 'Établir ou faire légaliser une procuration à utiliser au Sénégal.', en: 'Drawing up or legalizing a power of attorney for use in Senegal.' },
    ['procuration', 'power of attorney', 'mandat']),
  service('autres-services', 'administratif', 'hands',
    { fr: 'Autres services', en: 'Other services' },
    { fr: 'Les autres services consulaires annoncés par l’Ambassade.', en: 'Other consular services announced by the Embassy.' },
    ['autres', 'other', 'services'], { listed: true }),
  // Foreign nationals
  service('visa', 'etrangers', 'visa',
    { fr: 'Demande de visa', en: 'Visa application' },
    { fr: 'Informations pour les citoyens américains et étrangers qui souhaitent se rendre au Sénégal.', en: 'Information for US and foreign citizens planning to travel to Senegal.' },
    ['visa', 'tourisme', 'tourism', 'voyage', 'travel', 'américain', 'american'],
    { listed: true, popular: true }),
  service('conditions-entree', 'etrangers', 'globe',
    { fr: 'Conditions d’entrée et informations de voyage', en: 'Entry requirements and travel information' },
    { fr: 'Ce qu’il faut savoir avant de se rendre au Sénégal.', en: 'What to know before travelling to Senegal.' },
    ['entrée', 'entry', 'santé', 'health', 'voyage', 'travel', 'tourisme']),
];


/* ── Content published on the official service pages (checked 26 Oct 2026) ── */
const L = (fr: string, en: string): Localized => ({ fr, en });
const items = (prefix: string, list: [string, string][]): ChecklistItem[] => list.map(([fr, en], i) => ({ id: `${prefix}-${i + 1}`, text: { fr, en } }));
const patch = (slug: string, p: Partial<Service>) => Object.assign(services.find((x) => x.slug === slug)!, { audit: 'reviewed' as const }, p);
const src = (path: string, fr: string, en: string) => fromPage(path, fr, en);

const passeport = src('passeport/', 'Passeport', 'Passport');
patch('passeport', {
  officialPage: OFFICIAL + 'passeport/',
  faq: ['frais-passeport', 'horaires-consulaires', 'rendez-vous'],
  eligibility: { value: L('La délivrance comme le renouvellement exigent la présentation de la carte d’identité CEDEAO.', 'Both issue and renewal require you to present your ECOWAS identity card.'), ...passeport },
  documents: { value: items('pp', [
    ['Première demande : une copie de la carte d’identité CEDEAO', 'First application: one copy of your ECOWAS identity card'],
    ['Renouvellement : une copie du passeport à renouveler', 'Renewal: one copy of the passport being renewed'],
    ['Renouvellement : une copie de la carte d’identité CEDEAO', 'Renewal: one copy of your ECOWAS identity card'],
    ['Un money order de 45 $ (timbre)', 'One $45 money order (stamp duty)'],
    ['La carte d’identité CEDEAO originale, à présenter sur place', 'Your original ECOWAS identity card, to show in person'],
  ]), ...passeport },
  fees: { value: [{ label: L('Timbre, première demande ou renouvellement — par money order', 'Stamp duty, first application or renewal — by money order'), amount: '45 $' }], ...passeport },
  presence: { value: L('Comparution personnelle obligatoire.', 'You must appear in person.'), ...passeport },
});

const carte = src('cartes-consulaires/', 'Cartes consulaires', 'Consular cards');
patch('carte-consulaire', {
  officialPage: OFFICIAL + 'cartes-consulaires/',
  summary: L('L’immatriculation consulaire, attestée par la carte consulaire.', 'Consular registration, shown by the consular card.'),
  description: { value: L('Les Sénégalais résidant aux États-Unis doivent s’immatriculer auprès de l’Ambassade ou du Consulat dont relève leur lieu de résidence. L’immatriculation enregistre leur présence dans la circonscription ; elle donne lieu à la remise d’une carte consulaire.', 'Senegalese nationals living in the United States must register with the Embassy or Consulate covering their place of residence. Registration records their presence in the consular district and leads to the issue of a consular card.'), ...carte },
  eligibility: { value: L('Sénégalais résidant dans la juridiction de l’Ambassade. Les enfants mineurs peuvent être immatriculés.', 'Senegalese nationals living in the Embassy’s jurisdiction. Minor children can be registered.'), ...carte },
  documents: { value: items('cc', [
    ['Le formulaire de demande de carte consulaire, rempli', 'The completed consular card application form'],
    ['Une copie d’une pièce sénégalaise : carte d’identité, passeport, certificat de nationalité ou livret militaire', 'A copy of a Senegalese document: ID card, passport, nationality certificate or military booklet'],
    ['Trois photos d’identité', 'Three passport-style photos'],
    ['Pour un enfant mineur : un extrait de naissance et une copie de la pièce sénégalaise d’un parent', 'For a minor: a birth certificate and a copy of a parent’s Senegalese ID document'],
  ]), ...carte },
  fees: { value: [{ label: L('Frais de timbre', 'Stamp duty'), amount: '5 $' }], ...carte },
  forms: { value: [{ label: L('Formulaire de carte consulaire et fiche d’immatriculation (page officielle)', 'Consular card form and registration sheet (official page)'), url: OFFICIAL + 'cartes-consulaires/' }], ...carte },
});

const inscr = src('inscription/', 'Inscription', 'Registration');
patch('inscription-consulaire', {
  officialPage: OFFICIAL + 'inscription/',
  description: { value: L('Le site officiel propose deux démarches distinctes : l’immatriculation consulaire, qui donne lieu à la carte consulaire, et une page « Inscription » (« S’inscrire pour mieux vous servir ») où l’on laisse son nom, son e-mail et son adresse. L’usage fait de ces données n’est pas précisé.', 'The official site offers two separate steps: consular registration, which leads to the consular card, and a “Registration” page (“Sign up so we can serve you better”) where you leave your name, email and address. How that data is used is not stated.'), ...inscr },
  howTo: { value: L('Pour l’immatriculation consulaire, suivez la fiche « Carte consulaire ». La page « Inscription » est un simple formulaire en ligne.', 'For consular registration, follow the “Consular card” page. The “Registration” page is a simple online form.'), ...inscr },
});

const ec = src('etat-civil/', 'État civil', 'Civil status');
patch('transcription-naissance', {
  availability: 'listed-on-official-site', officialPage: OFFICIAL + 'etat-civil/', hours: ['consular'],
  description: { value: L('La transcription reporte l’acte de naissance américain dans les registres de l’Ambassade, ce qui lui donne effet au Sénégal.', 'Transcription copies the US birth record into the Embassy’s registers, which gives it legal effect in Senegal.'), ...ec },
  eligibility: { value: L('Tout enfant né aux États-Unis d’un ou de parents sénégalais doit être déclaré à l’Ambassade ou au Consulat général. La transcription est imprescriptible : il n’y a pas de délai.', 'Any child born in the United States to one or two Senegalese parents must be declared to the Embassy or Consulate General. There is no time limit for transcription.'), ...ec },
  documents: { value: items('nai', [
    ['L’acte de naissance original délivré par les autorités américaines', 'The original birth certificate issued by US authorities'],
    ['Une copie du passeport, de la carte d’identité ou du certificat de nationalité sénégalaise d’un parent', 'A copy of a parent’s Senegalese passport, ID card or nationality certificate'],
    ['Pour un envoi postal : une enveloppe retour timbrée', 'If applying by mail: a stamped return envelope'],
  ]), ...ec },
  fees: { value: [{ label: L('Transcription de naissance', 'Birth transcription'), amount: 'Gratuit / Free' }], ...ec },
  presence: { value: L('Possible par courrier, avec une enveloppe retour timbrée.', 'Can be done by mail, with a stamped return envelope.'), ...ec },
});
patch('mariage', {
  availability: 'listed-on-official-site', officialPage: OFFICIAL + 'etat-civil/', hours: ['consular'],
  title: L('Mariage : célébration et transcription', 'Marriage: ceremony and transcription'),
  summary: L('Célébrer un mariage entre Sénégalais à l’Ambassade, ou transcrire un mariage célébré aux États-Unis.', 'Marrying two Senegalese nationals at the Embassy, or transcribing a marriage held in the United States.'),
  description: { value: L('L’Ambassadeur, officier d’état civil, peut célébrer selon la loi sénégalaise le mariage de deux Sénégalais. L’Ambassade transcrit aussi les actes de mariage délivrés par les autorités américaines. Avant la publication d’un mariage, le dossier est vérifié pendant quinze jours.', 'The Ambassador, as civil registrar, can marry two Senegalese nationals under Senegalese law. The Embassy also transcribes marriage certificates issued by US authorities. Before a marriage is published, the file is checked over fifteen days.'), ...ec },
  documents: { value: items('mar', [
    ['Célébration : copies des pièces d’identité des deux époux', 'Ceremony: copies of both spouses’ identity documents'],
    ['Célébration : copies des pièces d’identité des deux témoins', 'Ceremony: copies of the two witnesses’ identity documents'],
    ['Célébration : le formulaire à remplir, téléchargeable sur le site officiel', 'Ceremony: the form, downloadable from the official site'],
    ['Transcription : l’acte de mariage américain original', 'Transcription: the original US marriage certificate'],
    ['Transcription : copies des passeports, cartes d’identité ou certificats de nationalité des époux', 'Transcription: copies of the spouses’ passports, ID cards or nationality certificates'],
  ]), ...ec },
  processing: { value: L('Vérification du dossier pendant quinze jours avant la publication du mariage. Autres délais : non précisés.', 'The file is checked for fifteen days before the marriage is published. Other timeframes: not stated.'), ...ec },
});
patch('deces-rapatriement', {
  availability: 'listed-on-official-site', officialPage: OFFICIAL + 'etat-civil/', hours: ['consular'],
  description: { value: L('À la demande des parents du défunt, l’Ambassade transcrit l’acte de décès dans ses registres, délivre un certificat de décès et une autorisation de transfert du corps vers le Sénégal.', 'At the request of the deceased’s family, the Embassy transcribes the death certificate into its registers and issues a certificate of death and an authorization to transfer the body to Senegal.'), ...ec },
  documents: { value: items('dec', [
    ['L’acte ou le certificat de décès original délivré par les autorités médicales ou municipales', 'The original death record or certificate from the medical or municipal authorities'],
    ['Une copie de la pièce d’identité sénégalaise du défunt', 'A copy of the deceased’s Senegalese identity document'],
  ]), ...ec },
});

const visa = src('demande-de-visa/', 'Demande de visa', 'Visa application');
patch('visa', {
  officialPage: OFFICIAL + 'demande-de-visa/',
  faq: ['visa-americains'],
  description: { value: L('Les ressortissants des États-Unis sont exemptés de visa d’entrée et de court séjour. De nombreuses autres nationalités le sont aussi pour moins de trois mois. Les autres voyageurs déposent une demande, gratuite, à l’Ambassade ou par courrier.', 'US nationals are exempt from entry and short-stay visas, as are many other nationalities for stays under three months. Other travellers apply, free of charge, at the Embassy or by mail.'), ...visa },
  eligibility: { value: L('Visa exigé des voyageurs dont la nationalité ne figure pas sur la liste d’exemption publiée par l’Ambassade, ainsi que des titulaires de titres de voyage de réfugié. Certaines demandes suivent une procédure spéciale plus longue : écrivez à l’Ambassade en précisant le pays qui a délivré votre passeport. Séjour de 90 jours au plus, sauf exceptions.', 'A visa is required for travellers whose nationality is not on the Embassy’s exemption list, and for refugee travel document holders. Some applications follow a longer special procedure: write to the Embassy giving the country that issued your passport. Stays of up to 90 days, with exceptions.'), ...visa },
  documents: { value: items('visa', [
    ['Le document de voyage original, valable au moins six mois à compter de l’entrée', 'Original travel document, valid at least six months from entry'],
    ['Deux copies de la page d’identité du passeport', 'Two copies of the passport photo page'],
    ['Le formulaire de demande rempli et signé, en deux exemplaires originaux', 'The completed, signed application form, in two original copies'],
    ['Deux photos d’identité couleur sur fond blanc, de moins de six mois', 'Two colour passport photos on a white background, under six months old'],
    ['Une copie de la réservation d’hôtel ou de la lettre d’invitation', 'A copy of the hotel booking or invitation letter'],
    ['Deux copies du billet ou de la réservation d’avion', 'Two copies of the flight ticket or booking'],
  ]), ...visa },
  fees: { value: [{ label: L('Visa', 'Visa'), amount: 'Gratuit / Free' }], ...visa },
  processing: { value: L('Deux à trois jours ouvrables au plus, pour un dossier complet et sauf problème technique. Les dossiers incomplets ne sont pas traités.', 'Two to three working days at most, for a complete file and barring technical problems. Incomplete files are not processed.'), ...visa },
  howTo: { value: L('Sur place : dépôt du lundi au vendredi de 10h30 à 13h30, retrait le même jour de 14h30 à 16h00 ; les urgences peuvent être reçues l’après-midi. Un tiers peut déposer ou retirer avec une procuration signée. Par courrier : envoi recommandé à l’Ambassade avec une enveloppe retour recommandée et affranchie.', 'In person: drop-off Monday to Friday 10:30–13:30, collection the same day 14:30–16:00; urgent cases may be seen in the afternoon. Someone else can drop off or collect with a signed power of attorney. By mail: registered post to the Embassy, with a prepaid registered return envelope.'), ...visa },
  presence: { value: L('Sur place ou par courrier recommandé.', 'In person or by registered mail.'), ...visa },
  forms: { value: [{ label: L('Formulaire de demande de visa (PDF, site officiel)', 'Visa application form (PDF, official site)'), url: 'https://www.ambasenegal-us.org/wp-content/uploads/2025/03/Visa_form.pdf' }], ...visa },
});
patch('conditions-entree', {
  availability: 'listed-on-official-site', officialPage: OFFICIAL + 'demande-de-visa/', faq: ['visa-americains'],
  description: { value: L('Passeport valable au moins six mois à la date d’entrée, y compris pour les voyageurs exemptés de visa. La vaccination n’est pas obligatoire, mais celle contre la fièvre jaune est vivement recommandée.', 'Passport valid at least six months on the date of entry, including for visa-exempt travellers. Vaccination is not compulsory, but yellow fever vaccination is strongly recommended.'), ...visa },
});

const S = (stage: SampleRequest['stage'], at: string, by: string, note?: Localized) => ({ stage, at, by, note });

const samples: SampleRequest[] = [
  { ref: 'DEMO-WDC-2026-0101', category: 'passeport', subject: { fr: 'Pièces pour un renouvellement de passeport', en: 'Documents for a passport renewal' }, received: '2026-10-19', stage: 'closed', priority: 'normal', firstReplyHours: 5, history: [S('received', '2026-10-19 09:12', 'Système'), S('assigned', '2026-10-19 09:40', 'Superviseur', { fr: 'Affectée à la section passeports', en: 'Assigned to passports' }), S('processing', '2026-10-19 11:00', 'Agent A'), S('answer', '2026-10-19 14:10', 'Agent A'), S('closed', '2026-10-21 10:00', 'Système')] },
  { ref: 'DEMO-WDC-2026-0102', category: 'visa', subject: { fr: 'Visa pour une mission universitaire', en: 'Visa for a university trip' }, received: '2026-10-20', stage: 'answer', priority: 'normal', firstReplyHours: 22, history: [S('received', '2026-10-20 15:30', 'Système'), S('assigned', '2026-10-21 09:05', 'Superviseur'), S('processing', '2026-10-21 10:00', 'Agent B'), S('answer', '2026-10-21 13:30', 'Agent B')] },
  { ref: 'DEMO-WDC-2026-0103', category: 'carte-consulaire', subject: { fr: 'Carte consulaire après un déménagement', en: 'Consular card after moving' }, received: '2026-10-21', stage: 'processing', priority: 'low', firstReplyHours: 8, history: [S('received', '2026-10-21 08:50', 'Système'), S('assigned', '2026-10-21 10:15', 'Superviseur'), S('processing', '2026-10-21 16:40', 'Agent C')] },
  { ref: 'DEMO-WDC-2026-0104', category: 'etat-civil', subject: { fr: 'Transcription d’une naissance à Baltimore', en: 'Transcribing a birth in Baltimore' }, received: '2026-10-21', stage: 'assigned', priority: 'normal', firstReplyHours: null, history: [S('received', '2026-10-21 17:02', 'Système'), S('assigned', '2026-10-22 09:20', 'Superviseur')] },
  { ref: 'DEMO-WDC-2026-0105', category: 'passeport', subject: { fr: 'Passeport perdu avant un départ urgent', en: 'Lost passport before an urgent trip' }, received: '2026-10-22', stage: 'answer', priority: 'high', firstReplyHours: 2, history: [S('received', '2026-10-22 08:10', 'Système'), S('assigned', '2026-10-22 08:25', 'Superviseur', { fr: 'Marquée prioritaire : départ imminent', en: 'Flagged high priority: imminent departure' }), S('processing', '2026-10-22 09:00', 'Agent A'), S('answer', '2026-10-22 10:05', 'Agent A')] },
  { ref: 'DEMO-WDC-2026-0106', category: 'rendez-vous', subject: { fr: 'Comment réserver un créneau ?', en: 'How do I book a slot?' }, received: '2026-10-22', stage: 'closed', priority: 'low', firstReplyHours: 3, history: [S('received', '2026-10-22 11:25', 'Système'), S('assigned', '2026-10-22 12:00', 'Superviseur'), S('answer', '2026-10-22 14:25', 'Agent D'), S('closed', '2026-10-23 09:00', 'Système')] },
  { ref: 'DEMO-WDC-2026-0107', category: 'autre', subject: { fr: 'Contacts pour un projet d’investissement', en: 'Contacts for an investment project' }, received: '2026-10-22', stage: 'processing', priority: 'normal', firstReplyHours: 26, history: [S('received', '2026-10-22 13:00', 'Système'), S('assigned', '2026-10-23 09:30', 'Superviseur', { fr: 'Transmise au service économique', en: 'Forwarded to the economic office' }), S('processing', '2026-10-23 15:00', 'Agent E')] },
  { ref: 'DEMO-WDC-2026-0108', category: 'etat-civil', subject: { fr: 'Rapatriement d’un proche', en: 'Repatriating a relative' }, received: '2026-10-23', stage: 'processing', priority: 'high', firstReplyHours: 1, history: [S('received', '2026-10-23 07:45', 'Système'), S('assigned', '2026-10-23 08:00', 'Superviseur'), S('processing', '2026-10-23 08:40', 'Agent F')] },
  { ref: 'DEMO-WDC-2026-0109', category: 'visa', subject: { fr: 'Durée de séjour pour un touriste', en: 'Length of stay for a tourist' }, received: '2026-10-23', stage: 'closed', priority: 'low', firstReplyHours: 6, history: [S('received', '2026-10-23 10:30', 'Système'), S('assigned', '2026-10-23 11:00', 'Superviseur'), S('answer', '2026-10-23 16:30', 'Agent B'), S('closed', '2026-10-24 09:00', 'Système')] },
  { ref: 'DEMO-WDC-2026-0110', category: 'carte-consulaire', subject: { fr: 'Première carte consulaire pour un étudiant', en: 'First consular card for a student' }, received: '2026-10-24', stage: 'received', priority: 'normal', firstReplyHours: null, history: [S('received', '2026-10-24 10:05', 'Système')] },
  { ref: 'DEMO-WDC-2026-0111', category: 'autre', subject: { fr: 'Association de la diaspora : partenariat culturel', en: 'Diaspora association: cultural partnership' }, received: '2026-10-24', stage: 'assigned', priority: 'low', firstReplyHours: null, history: [S('received', '2026-10-24 11:30', 'Système'), S('assigned', '2026-10-24 15:15', 'Superviseur')] },
  { ref: 'DEMO-WDC-2026-0112', category: 'rendez-vous', subject: { fr: 'Report d’un rendez-vous', en: 'Rescheduling an appointment' }, received: '2026-10-25', stage: 'received', priority: 'normal', firstReplyHours: null, history: [S('received', '2026-10-25 09:40', 'Système')] },
];

const sw: Verification = { status: 'unverified', note: { fr: 'Contenu à fournir par l’Ambassade.', en: 'Content to be supplied by the Embassy.' } };

export const content: MissionContent = {
  categories: [
    { id: 'voyage', title: { fr: 'Documents de voyage', en: 'Travel documents' }, blurb: { fr: 'Passeport, document d’urgence', en: 'Passport, emergency document' } },
    { id: 'identite', title: { fr: 'Identité et inscription', en: 'Identity and registration' }, blurb: { fr: 'Carte consulaire, inscription, CNI', en: 'Consular card, registration, ID card' } },
    { id: 'etat-civil', title: { fr: 'État civil', en: 'Civil status' }, blurb: { fr: 'Naissance, mariage, décès, certificats', en: 'Birth, marriage, death, certificates' } },
    { id: 'administratif', title: { fr: 'Services administratifs', en: 'Administrative services' }, blurb: { fr: 'Légalisation, procurations', en: 'Legalization, powers of attorney' } },
    { id: 'etrangers', title: { fr: 'Citoyens étrangers', en: 'Foreign nationals' }, blurb: { fr: 'Visa, conditions d’entrée', en: 'Visa, entry requirements' } },
  ],
  services,
  quickServices: [
    { label: { fr: 'Passeport', en: 'Passport' }, icon: 'passport', to: '/services-consulaires/passeport' },
    { label: { fr: 'Carte consulaire', en: 'Consular card' }, icon: 'card', to: '/services-consulaires/carte-consulaire' },
    { label: { fr: 'Visa', en: 'Visa' }, icon: 'visa', to: '/services-consulaires/visa' },
    { label: { fr: 'État civil', en: 'Civil status' }, icon: 'book', to: '/services-consulaires?cat=etat-civil' },
    { label: { fr: 'Rendez-vous', en: 'Appointments' }, icon: 'calendar', to: '/rendez-vous' },
    { label: { fr: 'Assistance', en: 'Help' }, icon: 'chat', to: '/assistance' },
  ],
  faqSource: fromScreens('Réponses rédigées par Dalal Studio à partir du site officiel (consulté le 26 octobre 2026).', 'Answers written by Dalal Studio from the official site (checked 26 October 2026).'),
  faq: [
    {
      id: 'horaires-consulaires',
      topic: { fr: 'Horaires et accès', en: 'Hours and access' },
      question: { fr: 'Quand la section consulaire reçoit-elle le public ?', en: 'When is the consular section open to the public?' },
      answer: { fr: 'Le site officiel indique un accueil du public de 10h00 à 15h00. L’Ambassade est ouverte du lundi au vendredi, de 9h30 à 16h30.', en: 'The official site gives public hours of 10:00 to 15:00. The Embassy is open Monday to Friday, 9:30 to 16:30.' },
    },
    {
      id: 'adresse',
      topic: { fr: 'Horaires et accès', en: 'Hours and access' },
      question: { fr: 'Où se trouve l’Ambassade et comment s’y rendre ?', en: 'Where is the Embassy and how do I get there?' },
      answer: { fr: 'Au 2215 M Street NW, Washington, DC 20037. En métro : ligne rouge, station Dupont Circle.', en: 'At 2215 M Street NW, Washington, DC 20037. By Metro: Red Line, Dupont Circle station.' },
    },
    {
      id: 'contact',
      topic: { fr: 'Contacter l’Ambassade', en: 'Contacting the Embassy' },
      question: { fr: 'Comment joindre l’Ambassade ?', en: 'How do I reach the Embassy?' },
      answer: { fr: 'Par téléphone au +1 202 234 0540, par fax au +1 202 629 2961 ou par e-mail à Contact@ambasenegal-us.org.', en: 'By phone on +1 202 234 0540, by fax on +1 202 629 2961 or by email at Contact@ambasenegal-us.org.' },
    },
    {
      id: 'rendez-vous',
      topic: { fr: 'Contacter l’Ambassade', en: 'Contacting the Embassy' },
      question: { fr: 'Faut-il un rendez-vous ?', en: 'Do I need an appointment?' },
      answer: { fr: 'La procédure de rendez-vous n’a pas pu être vérifiée. Contactez l’Ambassade avant de vous déplacer.', en: 'The appointment procedure could not be verified. Contact the Embassy before you travel there.' },
    },
    {
      id: 'inscription',
      topic: { fr: 'Inscription et carte consulaire', en: 'Registration and consular card' },
      question: { fr: 'Comment s’immatriculer et obtenir la carte consulaire ?', en: 'How do I register and get a consular card?' },
      answer: { fr: 'Les Sénégalais résidant aux États-Unis s’immatriculent auprès du poste dont relève leur lieu de résidence, avec le formulaire, une copie d’une pièce sénégalaise, trois photos et 5 $ de timbre. L’immatriculation donne lieu à la carte consulaire.', en: 'Senegalese nationals in the United States register with the post covering where they live, with the form, a copy of a Senegalese ID document, three photos and a $5 stamp fee. Registration leads to the consular card.' },
      service: 'carte-consulaire',
    },
    {
      id: 'visa-americains',
      topic: { fr: 'Visa et voyage', en: 'Visas and travel' },
      question: { fr: 'Les citoyens américains ont-ils besoin d’un visa pour le Sénégal ?', en: 'Do US citizens need a visa for Senegal?' },
      answer: { fr: 'Non pour l’entrée et le court séjour : le Gouvernement du Sénégal a exempté de visa les ressortissants des États-Unis. Le passeport doit être valable au moins six mois à la date d’entrée.', en: 'Not for entry and short stays: the Government of Senegal has exempted US nationals from visas. The passport must be valid at least six months on the date of entry.' },
      service: 'visa',
    },
    {
      id: 'frais-passeport',
      topic: { fr: 'Passeport', en: 'Passport' },
      question: { fr: 'Combien coûte un passeport et comment payer ?', en: 'How much is a passport and how do I pay?' },
      answer: { fr: 'L’Ambassade indique un timbre de 45 $, payé par money order, pour une première demande comme pour un renouvellement. La carte d’identité CEDEAO est obligatoire.', en: 'The Embassy states a $45 stamp fee, paid by money order, for both first applications and renewals. The ECOWAS identity card is required.' },
      service: 'passeport',
    },
    {
      id: 'new-york',
      topic: { fr: 'Réseau consulaire', en: 'Consular network' },
      question: { fr: 'Le Sénégal a-t-il un consulat à New York ?', en: 'Does Senegal have a consulate in New York?' },
      answer: { fr: 'Oui, le site de l’Ambassade renvoie vers le Consulat du Sénégal à New York. La répartition des États entre les deux postes est à confirmer.', en: 'Yes, the Embassy’s site links to the Consulate of Senegal in New York. How states are split between the two posts is to be confirmed.' },
    },
    {
      id: 'billets-coupe-du-monde',
      topic: { fr: 'Avis publics', en: 'Public notices' },
      question: { fr: 'L’Ambassade vend-elle des billets pour la Coupe du monde ?', en: 'Does the Embassy sell World Cup tickets?' },
      answer: { fr: 'Non. Dans un avis daté du 28 mai 2026, l’Ambassade précisait ne disposer d’aucun billet pour la Coupe du monde de football.', en: 'No. In a notice dated 28 May 2026, the Embassy said it had no tickets for the football World Cup.' },
    },
  ],
  newsCategories: [
    { id: 'diplomatie', label: { fr: 'Diplomatie', en: 'Diplomacy' } },
    { id: 'cooperation', label: { fr: 'Coopération économique', en: 'Economic cooperation' } },
    { id: 'consulaire', label: { fr: 'Annonces consulaires', en: 'Consular announcements' } },
    { id: 'avis', label: { fr: 'Avis publics', en: 'Public notices' } },
    { id: 'culture', label: { fr: 'Culture et diaspora', en: 'Culture and diaspora' } },
  ],
  news: [
    {
      id: 'ag-onu-accord-de-paris',
      category: 'diplomatie',
      image: { src: '/assets/photo-onu.jpg', alt: { fr: 'Intervention du président de la République à la tribune de l’Assemblée générale des Nations unies', en: 'The President of the Republic speaking at the UN General Assembly rostrum' }, credit: { fr: 'Photo publiée par l’Ambassade · usage autorisé pour cette démonstration', en: 'Photo published by the Embassy · use approved for this demonstration' }, position: 'center 30%' },
      date: '2025-09-25',
      dateNote: { fr: '80e session de l’Assemblée générale des Nations unies', en: '80th session of the UN General Assembly' },
      title: { fr: 'Climat : le Sénégal renouvelle son attachement à l’Accord de Paris', en: 'Climate: Senegal renews its commitment to the Paris Agreement' },
      summary: {
        fr: 'À la tribune des Nations unies, le président Bassirou Diomaye Faye a réaffirmé l’attachement du Sénégal à l’Accord de Paris et appelé à une transition climatique « juste et équitable ».',
        en: 'Speaking at the United Nations, President Bassirou Diomaye Faye reaffirmed Senegal’s commitment to the Paris Agreement and called for a “just and equitable” climate transition.',
      },
      body: [
        { fr: 'Le chef de l’État a rappelé que l’Afrique, qui représente moins de 4 % des émissions mondiales, subit durement sécheresses, inondations, érosion côtière et insécurité alimentaire.', en: 'The head of state noted that Africa, which accounts for less than 4% of global emissions, is hit hard by droughts, floods, coastal erosion and food insecurity.' },
        { fr: 'Il a plaidé pour des financements conséquents pour l’adaptation, un accès simplifié aux fonds climatiques et des transferts de technologie, et salué le fonds consacré aux pertes et dommages.', en: 'He called for substantial adaptation finance, simpler access to climate funds and technology transfers, and welcomed the loss and damage fund.' },
        { fr: 'Pour lui, l’obstacle principal est la volonté politique de faire du multilatéralisme un instrument de solidarité. Résumé rédigé par Dalal Studio à partir de l’article publié par l’Ambassade.', en: 'In his view, the main obstacle is the political will to make multilateralism an instrument of solidarity. Summary written by Dalal Studio from the article published by the Embassy.' },
      ],
      source: OFFICIAL,
      verification: fromScreens('Article publié sur le site officiel (rubrique Diplomatie), transmis le 26 octobre 2026.'),
    },
    {
      id: 'tripoli-position-africaine-commune',
      date: '2026-10-15',
      image: { src: '/assets/photo-tripoli.jpg', alt: { fr: 'Photo de groupe des délégations du Comité des dix sur la réforme du Conseil de sécurité, à Tripoli', en: 'Group photo of the Committee of Ten delegations on Security Council reform, Tripoli' }, credit: { fr: 'Photo publiée par l’Ambassade · usage autorisé pour cette démonstration', en: 'Photo published by the Embassy · use approved for this demonstration' }, position: 'center' },
      dateNote: { fr: 'Réunion des 10 et 11 octobre 2026', en: 'Meeting of 10–11 October 2026' },
      category: 'diplomatie',
      title: { fr: 'À Tripoli, le Sénégal réaffirme son attachement à la Position africaine commune', en: 'In Tripoli, Senegal reaffirms its commitment to the Common African Position' },
      summary: {
        fr: 'Les 10 et 11 octobre 2026, le ministre de l’Intégration africaine, des Affaires étrangères et des Sénégalais de l’Extérieur, M. Cheikh Niang, a pris part à Tripoli aux travaux du Comité des dix chefs d’État et de gouvernement sur la réforme du Conseil de sécurité des Nations unies.',
        en: 'On 10–11 October 2026, the Minister of African Integration, Foreign Affairs and Senegalese Abroad, Mr Cheikh Niang, took part in Tripoli in the work of the Committee of Ten Heads of State and Government on reforming the UN Security Council.',
      },
      body: [
        { fr: 'La réunion portait sur la réforme du Conseil de sécurité des Nations unies, sujet sur lequel l’Union africaine défend une position commune. Le Sénégal y a réaffirmé son soutien à cette position.', en: 'The meeting dealt with reform of the UN Security Council, on which the African Union holds a common position. Senegal reaffirmed its support for that position.' },
        { fr: 'Résumé rédigé par Dalal Studio à partir de l’article publié sur le site officiel.', en: 'Summary written by Dalal Studio from the article published on the official site.' },
      ],
      source: OFFICIAL,
      verification: fromScreens(),
    },
    {
      id: 'washington-boeing-mcc-fmi',
      category: 'cooperation',
      image: { src: '/assets/photo-fmi.jpg', alt: { fr: 'Rencontre au siège du Fonds monétaire international, à Washington (contexte à confirmer)', en: 'Meeting at International Monetary Fund headquarters, Washington (context to be confirmed)' }, credit: { fr: 'Photo publiée par l’Ambassade · usage autorisé pour cette démonstration', en: 'Photo published by the Embassy · use approved for this demonstration' }, position: 'center 20%' },
      dateNote: { fr: 'Date à confirmer', en: 'Date to be confirmed' },
      title: { fr: 'À Washington, le Président Faye rencontre Boeing, le MCC et des cadres sénégalais du FMI', en: 'In Washington, President Faye meets Boeing, the MCC and Senegalese IMF staff' },
      summary: { fr: 'Titre publié dans les articles récents du site officiel. Le contenu de l’article reste à consulter et à résumer.', en: 'Title listed among recent articles on the official site. The article itself is still to be read and summarized.' },
      source: OFFICIAL,
      verification: fromScreens('Titre seul, vu dans la liste des articles récents.'),
    },
    {
      id: 'rencontre-masae-usda',
      category: 'cooperation',
      dateNote: { fr: 'Date non visible sur la source', en: 'Date not visible in the source' },
      title: { fr: 'Rencontre entre le MASAE et le Département de l’Agriculture des États-Unis (USDA)', en: 'Meeting between MASAE and the US Department of Agriculture (USDA)' },
      summary: {
        fr: 'Le site officiel présente, en tête de page d’accueil, une rencontre entre le MASAE et l’USDA, illustrée par des photos. Le compte rendu écrit n’a pas pu être consulté.',
        en: 'The official home page features a meeting between MASAE and the USDA, illustrated with photos. The written report could not be consulted.',
      },
      body: [
        { fr: 'Cette rencontre illustre la coopération agricole entre les deux pays. Date, participants et conclusions : à fournir par l’Ambassade, en texte, pour que l’article soit lisible par tous.', en: 'This meeting illustrates agricultural cooperation between the two countries. Date, participants and outcomes: to be supplied by the Embassy as text so the article is accessible to everyone.' },
      ],
      imageOnly: true,
      source: OFFICIAL,
      verification: fromScreens(),
    },
    {
      id: 'billets-coupe-du-monde-2026',
      date: '2026-05-28',
      category: 'avis',
      title: { fr: 'Billets de la Coupe du monde : l’Ambassade n’en dispose pas', en: 'World Cup tickets: the Embassy has none' },
      summary: {
        fr: 'Avis du 28 mai 2026 : l’Ambassade précisait ne disposer d’aucun billet pour la Coupe du monde de football. Cet avis est toujours affiché en page d’accueil du site officiel.',
        en: 'Notice of 28 May 2026: the Embassy said it had no tickets for the football World Cup. The notice is still shown on the official home page.',
      },
      expired: true,
      source: OFFICIAL,
      verification: fromScreens(),
    },
  ],
  finder: {
    id: 'need',
    question: { fr: 'Que souhaitez-vous faire ?', en: 'What would you like to do?' },
    options: [
      {
        label: { fr: 'Obtenir ou renouveler un passeport', en: 'Get or renew a passport' },
        next: {
          id: 'passport-case',
          question: { fr: 'Quelle est votre situation ?', en: 'What is your situation?' },
          options: [
            { label: { fr: 'Première demande ou renouvellement', en: 'First application or renewal' }, to: '/services-consulaires/passeport' },
            { label: { fr: 'Passeport perdu, volé ou abîmé', en: 'Passport lost, stolen or damaged' }, to: '/services-consulaires/passeport-perdu-deteriore' },
            { label: { fr: 'Je dois voyager très bientôt sans passeport valide', en: 'I must travel very soon without a valid passport' }, to: '/services-consulaires/document-voyage-urgence' },
          ],
        },
      },
      { label: { fr: 'Faire une demande de visa', en: 'Apply for a visa' }, hint: { fr: 'Les citoyens américains en sont exemptés pour un court séjour', en: 'US citizens are exempt for short stays' }, to: '/services-consulaires/visa' },
      {
        label: { fr: 'Obtenir une carte consulaire', en: 'Get a consular card' },
        next: {
          id: 'card-case',
          question: { fr: 'Êtes-vous déjà inscrit(e) auprès de l’Ambassade ?', en: 'Are you already registered with the Embassy?' },
          options: [
            { label: { fr: 'Oui', en: 'Yes' }, to: '/services-consulaires/carte-consulaire' },
            { label: { fr: 'Non, ou je ne sais pas', en: 'No, or I am not sure' }, to: '/services-consulaires/inscription-consulaire' },
          ],
        },
      },
      { label: { fr: 'Déclarer une naissance', en: 'Register a birth' }, to: '/services-consulaires/transcription-naissance' },
      { label: { fr: 'Faire légaliser un document', en: 'Have a document legalized' }, to: '/services-consulaires/legalisation' },
      { label: { fr: 'Contacter un service', en: 'Contact an office' }, to: '/contact' },
    ],
  },
  institution: {
    message: {
      title: { fr: 'Mot de l’Ambassadeur', en: 'Message from the Ambassador' },
      excerpt: {
        fr: 'L’Ambassadeur présente le site comme un point d’accès aux activités de l’Ambassade : démarches consulaires pour les Sénégalais, informations pratiques sur le visa, le tourisme et les affaires pour les visiteurs.',
        en: 'The Ambassador presents the site as a gateway to the Embassy’s activities: consular procedures for Senegalese nationals, and practical information on visas, tourism and business for visitors.',
      },
      full: [
        { fr: 'Dans son message d’accueil, l’Ambassadeur souhaite la bienvenue aux internautes et précise l’objectif du site : rendre accessibles les informations sur les activités de l’Ambassade.', en: 'In his welcome message, the Ambassador greets visitors and sets out the site’s purpose: making information about the Embassy’s activities accessible.' },
        { fr: 'Il s’adresse d’abord aux Sénégalais, qui doivent y trouver les renseignements nécessaires pour obtenir leurs documents consulaires.', en: 'He first addresses Senegalese nationals, who should find there the information they need to obtain consular documents.' },
        { fr: 'Il s’adresse ensuite aux Américains et aux autres étrangers qui s’intéressent au « pays de la Teranga » : ils doivent y trouver des indications pratiques sur le visa, le tourisme et les opportunités d’affaires.', en: 'He then addresses Americans and other foreigners interested in the “land of Teranga”: they should find practical guidance on visas, tourism and business opportunities.' },
      ],
      signedBy: 'M. Abdoul Wahab Haïdara',
      source: OFFICIAL,
      verification: fromScreens('Résumé du message visible sur le site officiel (consulté le 26 octobre 2026), rédigé par Dalal Studio.', 'Summary of the message visible on the official site (checked 26 October 2026), written by Dalal Studio.'),
    },
    sections: [
      {
        id: 'role',
        title: { fr: 'Rôle de l’Ambassade', en: 'Role of the Embassy' },
        body: [
          { fr: 'L’Ambassade représente la République du Sénégal auprès des États-Unis d’Amérique. Elle conduit la relation diplomatique, accompagne la coopération économique, culturelle et éducative, et rend des services consulaires aux Sénégalais résidant dans sa juridiction.', en: 'The Embassy represents the Republic of Senegal to the United States of America. It conducts the diplomatic relationship, supports economic, cultural and educational cooperation, and provides consular services to Senegalese nationals living in its jurisdiction.' },
        ],
        verification: { status: 'unverified', note: { fr: 'Présentation générale rédigée par Dalal Studio, à valider par l’Ambassade.', en: 'General presentation written by Dalal Studio, to be validated by the Embassy.' } },
      },
      {
        id: 'juridiction',
        title: { fr: 'Juridiction', en: 'Jurisdiction' },
        body: [
          { fr: 'Outre les États-Unis, l’Ambassade couvre douze pays : Mexique, Bahamas, Barbade, Grenade, Nicaragua, Guatemala, Salvador, Panama, Costa Rica, Honduras, Suriname et Guyana.', en: 'Besides the United States, the Embassy covers twelve countries: Mexico, the Bahamas, Barbados, Grenada, Nicaragua, Guatemala, El Salvador, Panama, Costa Rica, Honduras, Suriname and Guyana.' },
          { fr: 'Elle suit également les activités des institutions de Bretton Woods : le Fonds monétaire international et la Banque mondiale.', en: 'It also follows the Bretton Woods institutions: the International Monetary Fund and the World Bank.' },
        ],
        verification: fromScreens('Page « Juridiction » du site officiel (consulté le 26 octobre 2026).'),
      },
      {
        id: 'biographie',
        title: { fr: 'Biographie de l’Ambassadeur', en: 'Ambassador’s biography' },
        body: [
          { fr: 'M. Abdoul Wahab Haïdara a occupé plusieurs fonctions dans la diplomatie sénégalaise, notamment : Ambassadeur en Inde et aux Maldives ; Ambassadeur au Kenya et au Rwanda ; Ministre-Conseiller à l’Ambassade du Sénégal à Paris ; Ministre-Conseiller à la Mission permanente auprès de l’Office des Nations unies à Genève.', en: 'Mr Abdoul Wahab Haïdara has held several posts in Senegalese diplomacy, including: Ambassador to India and the Maldives; Ambassador to Kenya and Rwanda; Minister-Counsellor at the Embassy of Senegal in Paris; Minister-Counsellor at the Permanent Mission to the United Nations Office at Geneva.' },
          { fr: 'Conseiller principal des Affaires étrangères, il est breveté de l’École nationale d’administration (ENA) et titulaire d’une maîtrise en sciences économiques. Il est ancien participant du programme IVLP du Département d’État américain (2010).', en: 'A Principal Counsellor of Foreign Affairs, he holds the diploma of the École nationale d’administration (ENA) and a master’s degree in economics. He is an alumnus of the US State Department’s IVLP program (2010).' },
        ],
        verification: fromScreens('Page « Biographie de l’Ambassadeur » du site officiel (consulté le 26 octobre 2026). Portrait à fournir par l’Ambassade avec droits d’usage.'),
      },
    ],
    formerHeads: {
      list: [
        { name: 'Mansour Elimane Kane', years: '2019 – 2025', note: { fr: 'Première année peu lisible sur la capture : à vérifier.', en: 'First year hard to read on the screenshot: to be checked.' } },
        { name: 'Dr Momar Diop', years: '2018 – 2019' },
        { name: 'Babacar Diagne', years: '2014 – 2018' },
        { name: 'Cheikh Niang', years: '2012 – 2014' },
        { name: 'Fatou Danielle Diagne', years: '2010 – 2012' },
        { name: 'Amadou Lamine Ba', years: '2002 – 2010' },
        { name: 'Général Mamadou Mansour Seck', years: '1992 – 2002' },
        { name: 'Ibra Déguène Ka', years: '1986 – 1992' },
        { name: 'Falilou Kane', years: '1984 – 1986' },
        { name: 'Abdourahmane Dia', years: '1982 – 1984' },
        { name: 'André Coulbary', years: '1971 – 1982' },
        { name: 'Cheikh Ibrahima Fall', years: '1968 – 1971' },
        { name: 'Ousmane Socé Diop', years: '1960 – 1968' },
      ],
      verification: fromScreens('Page « Anciens ambassadeurs » du site officiel (consulté le 26 octobre 2026).', 'Official “Former ambassadors” page (checked 26 October 2026).'),
    },
    departments: [
      { id: 'consulaire', name: { fr: 'Section consulaire', en: 'Consular section' }, verification: fromScreens('Mentionnée avec ses horaires sur le site officiel.') },
      { id: 'autres', name: { fr: 'Autres services (chancellerie, économique, culturel…) : liste à fournir', en: 'Other offices (chancery, economic, cultural…): list to be supplied' }, verification: sw },
    ],
  },
  bilateral: {
    intro: {
      fr: 'Les grands axes de la relation entre le Sénégal et les États-Unis. Chaque thème indique ce qui provient du site officiel et ce qui reste à fournir par l’Ambassade.',
      en: 'The main areas of the relationship between Senegal and the United States. Each theme shows what comes from the official site and what the Embassy still needs to supply.',
    },
    themes: [
      {
        id: 'diplomatie',
        title: { fr: 'Diplomatie et action multilatérale', en: 'Diplomacy and multilateral action' },
        body: [{ fr: 'L’Ambassade relaie l’action diplomatique du Sénégal, y compris dans les enceintes multilatérales — par exemple la participation du ministre des Affaires étrangères aux travaux sur la réforme du Conseil de sécurité (Tripoli, octobre 2026).', en: 'The Embassy relays Senegal’s diplomatic action, including in multilateral forums — for example the Foreign Minister’s participation in work on Security Council reform (Tripoli, October 2026).' }],
        verification: fromScreens(),
      },
      {
        id: 'agriculture',
        title: { fr: 'Agriculture et sécurité alimentaire', en: 'Agriculture and food security' },
        body: [{ fr: 'Une rencontre entre le MASAE et le Département de l’Agriculture des États-Unis (USDA) figure en page d’accueil du site officiel. Programmes et accords : à fournir par l’Ambassade.', en: 'A meeting between MASAE and the US Department of Agriculture (USDA) is featured on the official home page. Programs and agreements: to be supplied by the Embassy.' }],
        verification: fromScreens(),
      },
      {
        id: 'commerce',
        title: { fr: 'Commerce et investissement', en: 'Trade and investment' },
        body: [{ fr: 'Le site officiel oriente les investisseurs vers l’APIX (promotion des investissements), l’ASEPEX (promotion des exportations) et la Chambre de Commerce et d’Industrie de Dakar. Une rubrique dédiée pourrait accueillir opportunités, contacts du service économique et événements.', en: 'The official site points investors to APIX (investment promotion), ASEPEX (export promotion) and the Dakar Chamber of Commerce and Industry. A dedicated section could host opportunities, economic-office contacts and events.' }],
        verification: fromScreens(),
      },
      {
        id: 'tourisme',
        title: { fr: 'Tourisme', en: 'Tourism' },
        body: [{ fr: 'Le site officiel comporte une rubrique « Visitez le Sénégal » et un lien vers le ministère du Tourisme. Contenus et visuels sous licence : à sélectionner avec l’Ambassade.', en: 'The official site has a “Visit Senegal” section and a link to the Ministry of Tourism. Content and licensed visuals: to be selected with the Embassy.' }],
        verification: fromScreens(),
      },
      {
        id: 'education-culture',
        title: { fr: 'Éducation et culture', en: 'Education and culture' },
        body: [{ fr: 'Échanges universitaires, bourses et événements culturels : contenu à fournir par l’Ambassade.', en: 'Academic exchanges, scholarships and cultural events: content to be supplied by the Embassy.' }],
        verification: sw,
      },
      {
        id: 'diaspora',
        title: { fr: 'Diaspora', en: 'Diaspora' },
        body: [{ fr: 'Inscription consulaire, associations, entrepreneuriat et investissement de la diaspora : contenu et programmes à fournir par l’Ambassade.', en: 'Consular registration, associations, diaspora entrepreneurship and investment: content and programs to be supplied by the Embassy.' }],
        verification: sw,
      },
    ],
  },
  assistance: {
    categories: [
      { id: 'passeport', label: { fr: 'Passeport', en: 'Passport' } },
      { id: 'carte-consulaire', label: { fr: 'Carte consulaire', en: 'Consular card' } },
      { id: 'visa', label: { fr: 'Visa', en: 'Visa' } },
      { id: 'etat-civil', label: { fr: 'État civil', en: 'Civil status' } },
      { id: 'rendez-vous', label: { fr: 'Rendez-vous', en: 'Appointment' } },
      { id: 'autre', label: { fr: 'Autre demande', en: 'Other inquiry' } },
    ],
    samples,
  },
};
