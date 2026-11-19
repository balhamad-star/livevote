import { t } from './i18n.js';
import { esc } from './util.js';

// Turn raw responses {pid: answer} into display rows.
export function summarize(q, resp) {
  const ans = Object.values(resp || {}).filter((a) => a !== null && a !== undefined);
  const n = ans.length, opts = q.options || [], k = opts.length;
  if (q.type === 'text') return { n, texts: ans.map(String) };

  if (q.type === 'mc') {
    const c = opts.map(() => 0);
    ans.forEach((a) => { if (c[a] !== undefined) c[a]++; });
    const max = Math.max(1, ...c);
    return { n, rows: opts.map((label, i) => ({
      label, count: c[i], pct: n ? (c[i] / n) * 100 : 0, bar: n ? (c[i] / n) * 100 : 0, top: c[i] === max && c[i] > 0,
      main: `${n ? Math.round((c[i] / n) * 100) : 0}%`, sub: `${c[i]}`,
    })) };
  }

  if (q.type === 'rank') {
    const score = opts.map(() => 0), rankSum = opts.map(() => 0), firsts = opts.map(() => 0), cnt = opts.map(() => 0);
    ans.forEach((order) => (Array.isArray(order) ? order : Object.values(order)).forEach((oi, pos) => {
      if (score[oi] === undefined) return;
      score[oi] += k - pos; rankSum[oi] += pos + 1; cnt[oi]++; if (pos === 0) firsts[oi]++;
    }));
    const max = Math.max(1, ...score);
    const rows = opts.map((label, i) => ({
      label, score: score[i], avgRank: cnt[i] ? rankSum[i] / cnt[i] : null, firsts: firsts[i],
      bar: (score[i] / max) * 100, main: `${score[i]} ${t('pts')}`,
      sub: `${t('avgRank')} ${cnt[i] ? (rankSum[i] / cnt[i]).toFixed(1) : '–'} · ${t('firstVotes', { n: firsts[i] })}`,
    })).sort((a, b) => b.score - a.score);
    if (rows[0]) rows[0].top = rows[0].score > 0;
    return { n, rows, note: t('bordaNote', { k }) };
  }

  if (q.type === 'points') {
    const tot = opts.map(() => 0);
    ans.forEach((arr) => (Array.isArray(arr) ? arr : Object.values(arr)).forEach((v, i) => { if (tot[i] !== undefined) tot[i] += Number(v) || 0; }));
    const avg = tot.map((x) => (n ? x / n : 0));
    const max = Math.max(1, ...avg);
    const rows = opts.map((label, i) => ({
      label, total: tot[i], avg: avg[i], bar: (avg[i] / max) * 100,
      main: `${avg[i].toFixed(1)}%`, sub: t('totalPts', { n: tot[i] }),
    })).sort((a, b) => b.avg - a.avg);
    if (rows[0]) rows[0].top = rows[0].avg > 0;
    return { n, rows, note: t('weightNote') };
  }
  return { n, rows: [] };
}

export function renderResults(el, q, resp) {
  const s = summarize(q, resp);
  if (!s.n) { el.innerHTML = `<div class="empty">${t('noResponses')}</div>`; return; }
  if (q.type === 'text') {
    el.innerHTML = `<div class="wall">${s.texts.map((x) => `<div class="note" dir="auto">${esc(x)}</div>`).join('')}</div>
      <div class="results-foot">${s.n} ${t('responses')}</div>`;
    return;
  }
  const ranked = q.type !== 'mc';
  el.innerHTML = `<div class="bars">${s.rows.map((r, i) => `
    <div class="bar-row${r.top ? ' top' : ''}">
      <div class="bar-label" dir="auto">${ranked ? `<span class="rk">${i + 1}</span>` : ''}<span>${esc(r.label)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(r.bar, 0.5).toFixed(1)}%"></div></div>
      <div class="bar-val"><b>${r.main}</b><small>${r.sub}</small></div>
    </div>`).join('')}</div>
    <div class="results-foot">${s.n} ${t('responses')}${s.note ? ' · ' + s.note : ''}</div>`;
}
