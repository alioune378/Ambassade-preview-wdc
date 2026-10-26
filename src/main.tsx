import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { applyTheme } from './platform/mission';
import { I18nProvider } from './platform/i18n';
import { match, RouterProvider, useRouter } from './platform/router';
import { Home } from './pages/Home';
import { Finder, ServicePage, ServicesDirectory } from './pages/Services';
import { Ambassador, Bilateral, FormerHeads, Institution, Jurisdiction } from './pages/Institution';
import { Article, News } from './pages/NewsPages';
import { Appointments, Contact, FaqPage } from './pages/Contact';
import { Assistance, Dashboard, Tracker } from './pages/Assistance';
import { Cms } from './pages/Cms';
import { AboutDemo, Accessibility, NotFound, Privacy, SearchResults } from './pages/Misc';
import './styles.css';

applyTheme();

function Routes() {
  const { loc } = useRouter();
  const p = loc.path;

  // After in-app navigation, move focus to <main> (not on first load, so the
  // skip link stays the first tab stop). Hash links scroll to their target.
  const first = useRef(true);
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(decodeURIComponent(loc.hash.slice(1)));
      el?.scrollIntoView();
      el?.querySelector<HTMLElement>('button')?.click();
      first.current = false;
      return;
    }
    if (first.current) { first.current = false; return; }
    document.getElementById('contenu')?.focus({ preventScroll: true });
  }, [p, loc.hash]);

  const svc = match('/services-consulaires/:slug', p);
  const art = match('/actualites/:id', p);
  if (p === '/') return <Home />;
  if (p === '/services-consulaires') return <ServicesDirectory />;
  if (svc) return <ServicePage slug={svc.slug} />;
  if (p === '/trouver-ma-demarche') return <Finder />;
  if (p === '/rendez-vous') return <Appointments />;
  if (p === '/l-ambassade') return <Institution />;
  if (p === '/l-ambassade/ambassadeur') return <Ambassador />;
  if (p === '/l-ambassade/juridiction') return <Jurisdiction />;
  if (p === '/l-ambassade/anciens-ambassadeurs') return <FormerHeads />;
  if (p === '/senegal-etats-unis') return <Bilateral />;
  if (p === '/actualites') return <News />;
  if (art) return <Article id={art.id} />;
  if (p === '/contact') return <Contact />;
  if (p === '/questions-frequentes') return <FaqPage />;
  if (p === '/recherche') return <SearchResults />;
  if (p === '/assistance') return <Assistance />;
  if (p === '/assistance/suivi') return <Tracker />;
  if (p === '/demo/tableau-de-bord') return <Dashboard />;
  if (p === '/demo/contenus') return <Cms />;
  if (p === '/accessibilite') return <Accessibility />;
  if (p === '/confidentialite') return <Privacy />;
  if (p === '/a-propos-de-la-demo') return <AboutDemo />;
  return <NotFound />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <I18nProvider>
        <Layout>
          <Routes />
        </Layout>
      </I18nProvider>
    </RouterProvider>
  </StrictMode>,
);
