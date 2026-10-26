import type { Priority, Stage } from './types';
import { mission } from './mission';
import { readStore, writeStore } from './storage';

/**
 * Consular Assistance Center — simulation only.
 * Requests live in this browser's localStorage. Nothing is sent anywhere.
 */

export const stages: Stage[] = ['received', 'assigned', 'processing', 'answer', 'closed'];
export const priorities: Priority[] = ['high', 'normal', 'low'];

export interface SimRequest {
  ref: string;
  category: string;
  name: string;
  subject: string;
  createdAt: string;
  stage: Stage;
  history: { stage: Stage; at: string }[];
}

/**
 * Rejects text that looks like personal data: long digit runs, passport-style
 * codes, US SSN patterns and dates. Deliberately strict.
 */
export function looksSensitive(text: string): boolean {
  return [
    /\d{6,}/,
    /\b[A-Z]{1,3}\d{5,}\b/i,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/,
    /\b(19|20)\d{2}-\d{2}-\d{2}\b/,
  ].some((p) => p.test(text));
}

const KEY = `requests:${mission.id}`;

export function loadRequests(): SimRequest[] {
  return readStore<SimRequest[]>(KEY) ?? [];
}

/** Sequential demo reference, e.g. DEMO-WDC-2026-0001. */
export function makeRef(now = new Date()): string {
  const n = loadRequests().length + 1;
  return `${mission.refPrefix}-${now.getFullYear()}-${String(n).padStart(4, '0')}`;
}

export function saveRequest(req: SimRequest): void {
  const all = loadRequests().filter((r) => r.ref !== req.ref);
  writeStore(KEY, [req, ...all].slice(0, 50));
}

export function findRequest(ref: string): SimRequest | undefined {
  const key = ref.trim().toUpperCase();
  return loadRequests().find((r) => r.ref === key);
}

export function advance(req: SimRequest): SimRequest {
  const i = stages.indexOf(req.stage);
  if (i >= stages.length - 1) return req;
  const next = stages.at(i + 1)!;
  const updated = { ...req, stage: next, history: [...req.history, { stage: next, at: new Date().toISOString() }] };
  saveRequest(updated);
  return updated;
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s.at(m)! : (s.at(m - 1)! + s.at(m)!) / 2;
}
