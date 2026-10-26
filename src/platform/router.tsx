import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/**
 * Minimal history-API router. Clean URLs (/demarches/sauf-conduit) are served
 * by the SPA fallback in netlify.toml. Kept dependency-free on purpose.
 */

interface Loc {
  path: string;
  search: URLSearchParams;
  hash: string;
}

const RouterCtx = createContext<{ loc: Loc; navigate: (to: string, opts?: { replace?: boolean }) => void } | null>(null);

function read(): Loc {
  return {
    path: window.location.pathname.replace(/\/+$/, '') || '/',
    search: new URLSearchParams(window.location.search),
    hash: window.location.hash,
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<Loc>(read);

  useEffect(() => {
    const onPop = () => setLoc(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (opts?.replace) window.history.replaceState(null, '', to);
    else window.history.pushState(null, '', to);
    setLoc(read());
    const hash = to.split('#')[1];
    if (!hash) window.scrollTo({ top: 0 });
  }, []);

  return <RouterCtx.Provider value={{ loc, navigate }}>{children}</RouterCtx.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterCtx);
  if (!ctx) throw new Error('useRouter outside provider');
  return ctx;
}

/** Match "/demarches/:slug" against a path. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const part = p.at(i)!;
    const seg = s.at(i)!;
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(seg);
    else if (part !== seg) return null;
  }
  return params;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; nav?: boolean };

/** Internal link. With `nav`, marks itself aria-current="page" when active. */
export function Link({ to, nav, onClick, children, ...rest }: LinkProps) {
  const { navigate, loc } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  const current = to === '/' ? loc.path === '/' : loc.path === to || loc.path.startsWith(`${to}/`);
  return (
    <a href={to} onClick={handle} aria-current={nav && current ? 'page' : undefined} {...rest}>
      {children}
    </a>
  );
}
