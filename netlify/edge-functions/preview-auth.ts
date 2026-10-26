// Netlify Edge Function: protects the whole preview with HTTP Basic Auth.
// Configure PREVIEW_USER and PREVIEW_PASSWORD in Netlify environment variables.
import { checkAuth } from '../lib/auth-core.ts';

declare const Netlify: { env: { get(name: string): string | undefined } };

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const result = checkAuth(request.headers.get('authorization'), {
    user: Netlify.env.get('PREVIEW_USER'),
    password: Netlify.env.get('PREVIEW_PASSWORD'),
  });

  if (result.ok) {
    const res = await context.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  if (result.status === 503) {
    return new Response('Preview locked: access credentials are not configured.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    });
  }

  return new Response('Accès réservé — démonstration privée Dalal Studio.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dalal Studio private preview", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/*' };
