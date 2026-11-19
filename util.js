export const $ = (s, r = document) => r.querySelector(s);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L confusion
export function randomCode(len = 6) {
  return Array.from(crypto.getRandomValues(new Uint32Array(len)), (x) => ALPHA[x % ALPHA.length]).join('');
}
export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

// Participant page is the site root, so the QR points to  https://your-site/?code=XXXXXX
export function joinUrl(code) {
  const u = new URL('./', location.href);
  if (code) u.searchParams.set('code', code);
  return u.href;
}

export function qrSvg(text, cell = 8) {
  const qr = window.qrcode(0, 'M');
  qr.addData(text); qr.make();
  return qr.createSvgTag({ cellSize: cell, margin: 2, scalable: true });
}
