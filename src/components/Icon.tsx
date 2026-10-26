import type { IconName } from '../platform/types';

type Name = IconName | 'search' | 'clock' | 'phone' | 'mail' | 'pin' | 'arrow' | 'external' | 'alert' | 'check' | 'info' | 'menu' | 'close' | 'print' | 'download' | 'chevron' | 'chart' | 'up' | 'lock' | 'train' | 'fax';

/** Simple stroke icons drawn for this project (24×24 grid, 1.6 stroke). */
const paths: Record<Name, string> = {
  passport: 'M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM12 8.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM9 17.5h6',
  id: 'M3 6h18v12H3zM8.5 10.5a1.8 1.8 0 1 0 0 .1M6 15.5c.6-1.5 4.4-1.5 5 0M14 10h4M14 13h3',
  card: 'M3 6h18v12H3zM3 10h18M6.5 14.5h4',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10M9 8h5',
  ring: 'M9 14a5 5 0 1 0 0 .1M15 14a5 5 0 1 0 0 .1M10 4l2 2 2-2',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  stamp: 'M9 13V9a3 3 0 1 1 6 0v4M5 13h14v4H5zM6 20h12',
  scale: 'M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z',
  hands: 'M4 13l4-4 3 1 3-3 4 4-6 6-4-1zM8 9l-4-1',
  family: 'M8 7a2 2 0 1 0 0 .1M16 7a2 2 0 1 0 0 .1M5 20v-6a3 3 0 0 1 6 0v6M13 20v-6a3 3 0 0 1 6 0v6',
  people: 'M9 8a3 3 0 1 0 0 .1M3.5 20a5.5 5.5 0 0 1 11 0M16.5 8.5a2.5 2.5 0 1 0 0 .1M16 14a5 5 0 0 1 4.5 6',
  dove: 'M4 15c3 0 6-2 8-6l4-3 4 1-3 2-2 6c-2 3-6 4-11 4zM10 18l-2 3',
  visa: 'M4 4h16v16H4zM8 9h8M8 13h5M15 15.5l1.5 1.5 3-3',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  home: 'M4 11l8-7 8 7v9H4zM10 20v-5h4v5',
  flag: 'M5 21V4M5 4h13l-2 4 2 4H5',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  phone: 'M6 3h3l2 5-2 1.5a12 12 0 0 0 5.5 5.5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.1',
  check: 'M5 12.5l4.5 4.5L19 7',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.1',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  chevron: 'M8 10l4 4 4-4',
  chat: 'M4 5h16v11H9l-5 4z',
  chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  up: 'M6 15l6-6 6 6',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  train: 'M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M9 14h.1M15 14h.1M8 21l2-4M16 21l-2-4',
  fax: 'M7 9V3h8l2 2v4M5 9h14v9H5zM8 13h3M8 16h8',
};

export function Icon({ name, size = 20, className }: { name: Name; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Original mark for the demo: a tricolour band with a five-point star. Not an official emblem. */
export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="13.4" height="40" rx="3" fill="#00853f" />
      <rect x="13.3" y="0" width="13.4" height="40" fill="#fdef42" />
      <rect x="26.6" y="0" width="13.4" height="40" rx="3" fill="#e31b23" />
      <path d="M20 13.2l1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L20 23.6l-4.2 2.6 1.1-4.8-3.7-3.2 4.9-.4z" fill="#00853f" />
    </svg>
  );
}
