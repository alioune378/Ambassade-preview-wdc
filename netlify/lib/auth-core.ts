/**
 * Pure HTTP Basic Auth check, shared by the Netlify edge function and the
 * unit tests. Fails closed: with no credentials configured, nobody gets in.
 */
export interface AuthConfig {
  user?: string;
  password?: string;
}

export type AuthResult = { ok: true } | { ok: false; status: 401 | 503; reason: string };

/** Constant-time string comparison to avoid timing leaks. */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function checkAuth(header: string | null, cfg: AuthConfig): AuthResult {
  if (!cfg.user || !cfg.password) return { ok: false, status: 503, reason: 'not-configured' };
  if (!header || !header.startsWith('Basic ')) return { ok: false, status: 401, reason: 'missing' };
  let decoded = '';
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return { ok: false, status: 401, reason: 'malformed' };
  }
  const idx = decoded.indexOf(':');
  if (idx < 0) return { ok: false, status: 401, reason: 'malformed' };
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  const okUser = safeEqual(user, cfg.user);
  const okPass = safeEqual(pass, cfg.password);
  return okUser && okPass ? { ok: true } : { ok: false, status: 401, reason: 'invalid' };
}
