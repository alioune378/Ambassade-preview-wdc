// Unit tests for the preview access gate. Run: npm run test:auth
import assert from 'node:assert/strict';
import { checkAuth, safeEqual } from '../netlify/lib/auth-core.ts';

const cfg = { user: 'dalal', password: 'S3cret-preview' };
const basic = (u, p) => `Basic ${btoa(`${u}:${p}`)}`;
let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`PASS  ${name}`); };

t('fails closed when credentials are not configured', () => assert.deepEqual(checkAuth(basic('a', 'b'), {}), { ok: false, status: 503, reason: 'not-configured' }));
t('rejects a missing header', () => assert.equal(checkAuth(null, cfg).status, 401));
t('rejects a non-Basic scheme', () => assert.equal(checkAuth('Bearer abc', cfg).status, 401));
t('rejects malformed base64', () => assert.equal(checkAuth('Basic %%%', cfg).status, 401));
t('rejects a wrong password', () => assert.equal(checkAuth(basic('dalal', 'nope'), cfg).status, 401));
t('rejects a wrong user', () => assert.equal(checkAuth(basic('other', 'S3cret-preview'), cfg).status, 401));
t('accepts correct credentials', () => assert.deepEqual(checkAuth(basic('dalal', 'S3cret-preview'), cfg), { ok: true }));
t('accepts passwords containing colons', () => assert.ok(checkAuth(basic('u', 'a:b:c'), { user: 'u', password: 'a:b:c' }).ok));
t('safeEqual compares length and content', () => { assert.ok(safeEqual('abc', 'abc')); assert.ok(!safeEqual('abc', 'abd')); assert.ok(!safeEqual('abc', 'abcd')); });
const utf8 = (u, p) => `Basic ${Buffer.from(`${u}:${p}`, 'utf8').toString('base64')}`;
t('accepts accented (UTF-8) passwords', () => assert.ok(checkAuth(utf8('u', 'Téranga-2026'), { user: 'u', password: 'Téranga-2026' }).ok));
t('username is case-insensitive (phone auto-capitalisation)', () => assert.ok(checkAuth(basic('Dalal', 'S3cret-preview'), cfg).ok));
t('password stays case-sensitive', () => assert.equal(checkAuth(basic('dalal', 's3cret-preview'), cfg).status, 401));
t('ignores stray spaces in configured values', () => assert.ok(checkAuth(basic('dalal', 'S3cret-preview'), { user: ' dalal ', password: 'S3cret-preview\n' }).ok));
console.log(`\n${n}/${n} auth checks passed`);
