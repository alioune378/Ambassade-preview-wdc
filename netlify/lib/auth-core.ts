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
  // Trim configured values: a space or line break pasted into the Netlify
  // dashboard would otherwise make the right password fail.
  const cfgUser = (cfg.user ?? '').trim();
  const cfgPass = (cfg.password ?? '').trim();
  if (!cfgUser || !cfgPass) return { ok: false, status: 503, reason: 'not-configured' };
  if (!header || !header.startsWith('Basic ')) return { ok: false, status: 401, reason: 'missing' };
  let decoded = '';
  try {
    // Browsers send UTF-8 bytes (accents, "é"): decode them as UTF-8.
    const bin = atob(header.slice(6).trim());
    decoded = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return { ok: false, status: 401, reason: 'malformed' };
  }
  const idx = decoded.indexOf(':');
  if (idx < 0) return { ok: false, status: 401, reason: 'malformed' };
  // Username is case-insensitive (phones capitalise the first letter);
  // the password stays exact, apart from surrounding spaces.
  const user = decoded.slice(0, idx).trim().toLowerCase();
  const pass = decoded.slice(idx + 1).trim();
  const okUser = safeEqual(user, cfgUser.toLowerCase());
  const okPass = safeEqual(pass, cfgPass);
  return okUser && okPass ? { ok: true } : { ok: false, status: 401, reason: 'invalid' };
}
