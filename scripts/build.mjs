// Production build: bundles src/main.tsx with esbuild into dist/.
// Usage: node scripts/build.mjs        (MISSION=washington PREVIEW=true by default)
//        MISSION=example node scripts/build.mjs
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const mission = process.env.MISSION || 'washington';
const preview = process.env.PREVIEW !== 'false';

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'assets'), { recursive: true });

const result = await build({
  entryPoints: { app: join(root, 'src/main.tsx') },
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  target: ['es2020'],
  outdir: join(out, 'assets'),
  jsx: 'automatic',
  define: {
    __MISSION__: JSON.stringify(mission),
    __PREVIEW__: JSON.stringify(preview),
    'process.env.NODE_ENV': '"production"',
  },
  external: ['/fonts/*', '/assets/*'],
  logLevel: 'warning',
  metafile: true,
});

cpSync(join(root, 'public'), out, { recursive: true });
let html = readFileSync(join(root, 'src/index.html'), 'utf8');
if (!preview) html = html.replace('<meta name="robots" content="noindex, nofollow" />', '');
writeFileSync(join(out, 'index.html'), html);

const sizes = Object.entries(result.metafile.outputs).map(([f, o]) => `${f.replace(root + '/', '')} ${(o.bytes / 1024).toFixed(1)} kB`);
console.log(`Built mission "${mission}" (preview=${preview})\n${sizes.join('\n')}`);
