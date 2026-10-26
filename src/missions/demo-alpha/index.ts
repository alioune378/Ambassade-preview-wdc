import { fictionalMission } from '../fictional';

/** FICTIONAL embassy in an invented city — demonstration only. */
export const demoAlpha = fictionalMission({
  id: 'demo-alpha',
  kind: 'embassy',
  name: { fr: 'Ambassade de démonstration Alpha', en: 'Alpha Demonstration Embassy' },
  city: 'Lumeria',
  country: { fr: 'Pays fictif', en: 'Fictional country' },
  street: '1 avenue Imaginaire',
  refPrefix: 'DEMO-ALP',
  theme: { primary: '#1D3A5C', secondary: '#2C5A88', ivory: '#F6F7F9', gold: '#C8A55B', charcoal: '#1E2530', red: '#B83A3A' },
});
