import type { MissionPack } from './types';
import { washington } from '../missions/washington';
import { demoAlpha } from '../missions/demo-alpha';
import { demoBeta } from '../missions/demo-beta';

/** Every mission this codebase can build. Add a new post here. */
export const missions: Record<string, MissionPack> = {
  washington,
  'demo-alpha': demoAlpha,
  'demo-beta': demoBeta,
};

// Injected at build time by scripts/build.mjs.
declare const __MISSION__: string;
declare const __PREVIEW__: boolean;

export const isPreview: boolean = __PREVIEW__;

/**
 * In private preview builds, `?mission=demo-alpha` switches the mission for the
 * session so presenters can show the platform's reuse. Production builds are
 * locked to the build-time mission.
 */
function resolve(): MissionPack {
  let id = __MISSION__;
  if (isPreview && typeof window !== 'undefined') {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('mission');
      if (fromUrl && missions[fromUrl]) window.sessionStorage.setItem('dalal-scd:mission', fromUrl);
      const stored = window.sessionStorage.getItem('dalal-scd:mission');
      if (stored && missions[stored]) id = stored;
    } catch {
      /* storage blocked: keep build-time mission */
    }
  }
  return missions[id] ?? washington;
}

export const pack: MissionPack = resolve();
export const mission = pack.config;
export const content = pack.content;

/** Apply the mission's approved palette as CSS variables. */
export function applyTheme(): void {
  const t = mission.theme;
  const r = document.documentElement.style;
  r.setProperty('--primary', t.primary);
  r.setProperty('--secondary', t.secondary);
  r.setProperty('--paper', t.ivory);
  r.setProperty('--gold', t.gold);
  r.setProperty('--ink', t.charcoal);
  r.setProperty('--red', t.red);
}
