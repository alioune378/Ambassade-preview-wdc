import { fictionalMission } from '../fictional';

/** FICTIONAL consulate in an invented city — demonstration only. */
export const demoBeta = fictionalMission({
  id: 'demo-beta',
  kind: 'consulate-general',
  name: { fr: 'Consulat de démonstration Bêta', en: 'Beta Demonstration Consulate' },
  city: 'Port-Océane',
  country: { fr: 'Pays fictif', en: 'Fictional country' },
  street: '12 quai des Exemples',
  refPrefix: 'DEMO-BET',
  theme: { primary: '#3F2A4F', secondary: '#5E4175', ivory: '#F8F6F9', gold: '#C8A55B', charcoal: '#25202A', red: '#B83A3A' },
});
