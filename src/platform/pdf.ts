/**
 * Minimal dependency-free PDF writer for checklists (A4, Helvetica, WinAnsi).
 * Enough for a one- or two-page text document with headings and tick boxes.
 */

interface Line {
  text: string;
  size: number;
  bold?: boolean;
  box?: boolean;
  gap?: number;
}

/** Map text to WinAnsi bytes; characters outside it become "?". */
function winAnsi(s: string): string {
  const map: Record<string, string> = { '’': "'", '‘': "'", '“': '"', '”': '"', '—': '-', '–': '-', '…': '...', ' ': ' ', '€': 'EUR' };
  let out = '';
  for (const ch of s) {
    const c = map[ch] ?? ch;
    for (const cc of c) {
      const code = cc.charCodeAt(0);
      out += code < 256 ? cc : '?';
    }
  }
  return out.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Rough Helvetica width: average 0.5 em per character. */
function wrap(text: string, size: number, maxWidth: number): string[] {
  const maxChars = Math.max(10, Math.floor(maxWidth / (size * 0.5)));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export function buildPdf(title: string, subtitle: string, items: string[], notes: string[]): Uint8Array<ArrayBuffer> {
  const W = 595, H = 842, M = 56, maxW = W - 2 * M;
  const lines: Line[] = [
    { text: title, size: 18, bold: true, gap: 8 },
    { text: subtitle, size: 10, gap: 18 },
    ...items.flatMap((it) => wrap(it, 11, maxW - 22).map((t, i) => ({ text: t, size: 11, box: i === 0, gap: 4 }))),
    { text: '', size: 8, gap: 10 },
    ...notes.flatMap((n) => wrap(n, 9, maxW).map((t) => ({ text: t, size: 9, gap: 3 }))),
  ];

  const pages: string[] = [];
  let ops = '';
  let y = H - M;
  for (const ln of lines) {
    const h = ln.size + (ln.gap ?? 4);
    if (y - h < M) {
      pages.push(ops);
      ops = '';
      y = H - M;
    }
    y -= ln.size;
    if (ln.box) ops += `0.4 w ${M} ${y - 1} 10 10 re S\n`;
    const x = ln.box || ln.text.startsWith('  ') ? M + 22 : M;
    const font = ln.bold ? '/F2' : '/F1';
    if (ln.text) ops += `BT ${font} ${ln.size} Tf ${x} ${y} Td (${winAnsi(ln.text)}) Tj ET\n`;
    y -= ln.gap ?? 4;
  }
  pages.push(ops);

  const objs: string[] = [];
  objs.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ');
  objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  pages.forEach((content, i) => {
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objs.push(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  });

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (out += `${String(o).padStart(10, '0')} 00000 n \n`));
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

export function downloadBytes(bytes: Uint8Array<ArrayBuffer> | string, filename: string, type: string): void {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
