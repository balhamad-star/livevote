import { initStore } from './store.js';
import { t, getLang, setLang, applyLang } from './i18n.js';
import { $, esc, randomCode, joinUrl, qrSvg } from './util.js';
import { renderResults, summarize } from './results.js';

const TYPES = ['mc', 'rank', 'points', 'text'];
const DRAFT_KEY = 'lv-draft', ACTIVE_KEY = 'lv-active';

const SAMPLE = {
  title: 'Workshop pulse check',
  questions: [
    { type: 'mc', text: 'How familiar are you with today’s topic?', options: ['Very familiar', 'Somewhat', 'A little', 'Not at all'] },
    { type: 'rank', text: 'Rank these quality priorities for our department (1 = most important)', options: ['Student learning outcomes', 'Graduate employability', 'Research output', 'Industry partnerships', 'Teaching facilities', 'Staff development'] },
    { type: 'points', text: 'Distribute 100 points across these improvement areas', options: ['Curriculum review', 'Assessment methods', 'Lab equipment', 'Student advising', 'E-learning', 'Community engagement'] },
    { type: 'text', text: 'In one sentence: what should we change first?', options: [] },
  ],
};

let store, draft, code = null, meta = null, state = null, participants = {}, responses = {};
let unsubs = [], respUnsub = null;

// ───────────────── boot ─────────────────
(async function boot() {
  applyLang(); updateLangBtn();
  store = await initStore();
  const badge = $('#modeBadge');
  badge.dataset.t = store.mode === 'live' ? 'liveMode' : 'demoMode';
  badge.classList.toggle('demo', store.mode !== 'live');
  applyLang();

  draft = loadDraft();
  renderEditor();

  const active = localStorage.getItem(ACTIVE_KEY);
  if (active) {
    const m = await store.get(`sessions/${active}/meta`);
    const s = await store.get(`sessions/${active}/state`);
    if (m && s && s.phase !== 'closed') showResume(active);
    else localStorage.removeItem(ACTIVE_KEY);
  }
})();

$('#langBtn').onclick = () => { setLang(getLang() === 'ar' ? 'en' : 'ar'); updateLangBtn(); renderEditor(); if (code) renderStage(); };
function updateLangBtn() { $('#langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية'; }

// ───────────────── editor ─────────────────
function loadDraft() {
  try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY)); if (d && Array.isArray(d.questions)) return d; } catch {}
  return { title: '', questions: [{ type: 'mc', text: '', options: [] }] };
}
const saveDraft = () => localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

function renderEditor() {
  $('#sTitle').value = draft.title || '';
  $('#qList').innerHTML = draft.questions.map((q, i) => `
    <div class="qcard" data-i="${i}">
      <div class="qcard-head">
        <span class="qnum">${i + 1}</span>
        <select class="qtype">${TYPES.map((ty) => `<option value="${ty}"${q.type === ty ? ' selected' : ''}>${t('type_' + ty)}</option>`).join('')}</select>
        <div class="spacer"></div>
        <button class="icon" data-act="up" title="${t('moveUp')}"${i === 0 ? ' disabled' : ''}>↑</button>
        <button class="icon" data-act="down" title="${t('moveDown')}"${i === draft.questions.length - 1 ? ' disabled' : ''}>↓</button>
        <button class="icon danger" data-act="del" title="${t('del')}">✕</button>
      </div>
      <textarea class="qtext" rows="2" dir="auto" placeholder="${t('qTextPh')}">${esc(q.text)}</textarea>
      <textarea class="qopts${q.type === 'text' ? ' hidden' : ''}" rows="${Math.max(3, (q.options || []).length)}" dir="auto" placeholder="${t('optionsPh')}">${esc((q.options || []).join('\n'))}</textarea>
      <p class="hint">${t('hint_' + q.type)}</p>
    </div>`).join('');
}

$('#sTitle').oninput = (e) => { draft.title = e.target.value; saveDraft(); };
$('#qList').addEventListener('input', (e) => {
  const card = e.target.closest('.qcard'); if (!card) return;
  const q = draft.questions[+card.dataset.i];
  if (e.target.classList.contains('qtext')) q.text = e.target.value;
  if (e.target.classList.contains('qopts')) q.options = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
  saveDraft();
});
$('#qList').addEventListener('change', (e) => {
  if (!e.target.classList.contains('qtype')) return;
  draft.questions[+e.target.closest('.qcard').dataset.i].type = e.target.value;
  saveDraft(); renderEditor();
});
$('#qList').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const i = +b.closest('.qcard').dataset.i, qs = draft.questions;
  if (b.dataset.act === 'up') [qs[i - 1], qs[i]] = [qs[i], qs[i - 1]];
  if (b.dataset.act === 'down') [qs[i + 1], qs[i]] = [qs[i], qs[i + 1]];
  if (b.dataset.act === 'del') { if (!confirm(t('confirmDel'))) return; qs.splice(i, 1); }
  saveDraft(); renderEditor();
});
$('#addQ').onclick = () => {
  const last = draft.questions.at(-1);
  draft.questions.push({ type: last ? last.type : 'mc', text: '', options: [] });
  saveDraft(); renderEditor();
  document.querySelectorAll('.qtext').item(draft.questions.length - 1)?.focus();
};
$('#loadSample').onclick = () => {
  const empty = draft.questions.every((q) => !q.text);
  if (!empty && !confirm(t('confirmSample'))) return;
  draft = JSON.parse(JSON.stringify(SAMPLE)); saveDraft(); renderEditor();
};
$('#exportJson').onclick = () => {
  const name = (draft.title || 'livevote-session').replace(/[\\/:*?"<>|]+/g, '').trim() || 'livevote-session';
  download(`${name}.json`, JSON.stringify(draft, null, 2), 'application/json');
};
$('#importJson').onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.questions)) throw 0;
    draft = { title: d.title || '', questions: d.questions.map((q) => ({ type: TYPES.includes(q.type) ? q.type : 'mc', text: String(q.text || ''), options: (q.options || []).map(String) })) };
    saveDraft(); renderEditor();
  } catch { alert('Invalid file'); }
  e.target.value = '';
};

function validate() {
  const qs = draft.questions.filter((q) => q.text.trim() || (q.options || []).length);
  if (!qs.length) return t('errNoQuestions');
  for (let i = 0; i < qs.length; i++) {
    if (!qs[i].text.trim()) return t('errQText', { n: i + 1 });
    if (qs[i].type !== 'text' && (qs[i].options || []).length < 2) return t('errQOpts', { n: i + 1 });
  }
  return null;
}

$('#startBtn').onclick = async () => {
  const err = validate(); $('#editorErr').textContent = err || '';
  if (err) return;
  const btn = $('#startBtn'); btn.disabled = true;
  try {
    let c; do { c = randomCode(); } while (await store.get(`sessions/${c}/state`));
    const questions = draft.questions.filter((q) => q.text.trim()).map((q) => ({ type: q.type, text: q.text.trim(), options: q.type === 'text' ? [] : q.options }));
    await store.set(`sessions/${c}`, {
      meta: { title: draft.title.trim(), lang: getLang(), createdAt: Date.now(), questions },
      state: { current: -1, phase: 'lobby' },
    });
    localStorage.setItem(ACTIVE_KEY, c);
    await openSession(c);
  } catch (e) { $('#editorErr').textContent = String(e.message || e); }
  btn.disabled = false;
};

function showResume(c) {
  const box = $('#resumeBox');
  box.innerHTML = `<span>${t('resumeMsg', { code: `<b dir="ltr">${c}</b>` })}</span><div class="spacer"></div>
    <button class="primary small" id="resumeBtn">${t('resume')}</button><button class="ghost small" id="discardBtn">${t('discard')}</button>`;
  box.classList.remove('hidden');
  $('#resumeBtn').onclick = () => { box.classList.add('hidden'); openSession(c); };
  $('#discardBtn').onclick = async () => { await closeSession(c); box.classList.add('hidden'); };
}

// ───────────────── session / stage ─────────────────
async function openSession(c) {
  code = c;
  meta = await store.get(`sessions/${c}/meta`);
  meta.questions = Object.values(meta.questions || {}).map((q) => ({ ...q, options: Object.values(q.options || {}) }));
  $('#editor').classList.add('hidden'); $('#stage').classList.remove('hidden');
  document.body.classList.add('presenting');

  const url = joinUrl(c);
  $('#joinHost').textContent = url.replace(/^https?:\/\//, '').replace(/\?.*$/, '').replace(/\/$/, '');
  $('#joinUrlTxt').textContent = url.replace(/^https?:\/\//, '').replace(/\?.*$/, '').replace(/\/$/, '');
  $('#codeSmall').textContent = c; $('#codeBig').textContent = c;
  $('#bigQr').innerHTML = qrSvg(url); $('#miniQr').innerHTML = qrSvg(url);
  $('#lobbyTitle').textContent = meta.title || t('appName');

  unsubs.forEach((u) => u()); unsubs = [];
  unsubs.push(store.on(`sessions/${c}/state`, (s) => {
    const prev = state; state = s || { current: -1, phase: 'lobby' };
    if (!prev || prev.current !== state.current) watchResponses();
    renderStage();
  }));
  unsubs.push(store.on(`sessions/${c}/participants`, (p) => { participants = p || {}; renderCounts(); }));
}

function watchResponses() {
  if (respUnsub) respUnsub();
  responses = {};
  if (state.current < 0 || state.current >= meta.questions.length) { respUnsub = null; return; }
  respUnsub = store.on(`sessions/${code}/responses/${state.current}`, (r) => {
    responses = r || {}; renderCounts();
    if (state.phase === 'results') renderResults($('#resultsArea'), meta.questions[state.current], responses);
  });
}

function renderCounts() {
  const n = Object.keys(participants).length;
  $('#pCount').textContent = n; $('#pCount2').textContent = n;
  $('#aCount').textContent = Object.keys(responses).length;
}

function renderStage() {
  if (!state || !meta) return;
  const N = meta.questions.length, cur = state.current;
  const inLobby = cur < 0, ended = cur >= N;
  $('#lobby').classList.toggle('hidden', !inLobby);
  $('#qView').classList.toggle('hidden', inLobby || ended);
  $('#endView').classList.toggle('hidden', !ended);
  $('#miniQr').classList.toggle('hidden', inLobby);

  if (!inLobby && !ended) {
    const q = meta.questions[cur];
    $('#qPos').textContent = t('qPos', { i: cur + 1, n: N });
    $('#qTypeLbl').textContent = t('type_' + q.type);
    $('#qText').textContent = q.text;
    const showing = state.phase === 'results';
    $('#optPreview').classList.toggle('hidden', showing || q.type === 'text');
    $('#optPreview').innerHTML = q.options.map((o) => `<li dir="auto">${esc(o)}</li>`).join('');
    $('#resultsArea').classList.toggle('hidden', !showing);
    if (showing) renderResults($('#resultsArea'), q, responses);
  }
  $('#prevBtn').disabled = inLobby;
  $('#revealBtn').classList.toggle('hidden', inLobby || ended);
  $('#revealBtn').textContent = state.phase === 'results' ? t('hideResults') : t('showResults');
  $('#nextBtn').classList.toggle('hidden', ended);
  $('#nextBtn').textContent = inLobby ? t('startFirst') : cur === N - 1 ? t('finish') : t('next');
  renderCounts();
}

const go = (current, phase) => store.set(`sessions/${code}/state`, { current, phase });
function next() { if (!state) return; const N = meta.questions.length; if (state.current < N) go(state.current + 1, state.current + 1 >= N ? 'end' : 'answer'); }
function prev() { if (!state || state.current < 0) return; const c = Math.min(state.current - 1, meta.questions.length - 1); go(c, c < 0 ? 'lobby' : 'results'); }
function toggleReveal() { if (!state || state.current < 0 || state.current >= meta.questions.length) return; go(state.current, state.phase === 'results' ? 'answer' : 'results'); }

$('#nextBtn').onclick = next; $('#prevBtn').onclick = prev; $('#revealBtn').onclick = toggleReveal;
document.addEventListener('keydown', (e) => {
  if (!code || $('#stage').classList.contains('hidden') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  else if (e.key.toLowerCase() === 'r') toggleReveal();
});

$('#exitBtn').onclick = async () => { if (!confirm(t('confirmExit'))) return; await closeSession(code); };
async function closeSession(c) {
  await store.update(`sessions/${c}/state`, { phase: 'closed' });
  localStorage.removeItem(ACTIVE_KEY);
  unsubs.forEach((u) => u()); unsubs = []; if (respUnsub) respUnsub(); respUnsub = null;
  code = null; state = null; meta = null;
  document.body.classList.remove('presenting');
  $('#stage').classList.add('hidden'); $('#editor').classList.remove('hidden');
}

// ───────────────── CSV export ─────────────────
$('#exportCsv').onclick = async () => {
  const all = (await store.get(`sessions/${code}/responses`)) || {};
  const ppl = (await store.get(`sessions/${code}/participants`)) || {};
  const rows = [['Session', meta.title || '', 'Code', code, 'Exported', new Date().toLocaleString()], [], ['SUMMARY'],
    ['Q#', 'Question', 'Type', 'Rank/Order', 'Option', 'Result', 'Detail', 'Responses']];
  meta.questions.forEach((q, i) => {
    const s = summarize(q, all[i]);
    if (q.type === 'text') s.texts.forEach((x, j) => rows.push([i + 1, q.text, q.type, j + 1, '', x, '', s.n]));
    else s.rows.forEach((r, j) => rows.push([i + 1, q.text, q.type, j + 1, r.label,
      q.type === 'mc' ? r.count : q.type === 'rank' ? r.score : r.avg.toFixed(2),
      q.type === 'mc' ? `${r.pct.toFixed(1)}%` : q.type === 'rank' ? `avg rank ${r.avgRank?.toFixed(2) ?? ''}; #1 votes ${r.firsts}` : `total ${r.total}`, s.n]));
  });
  rows.push([], ['RAW RESPONSES'], ['Q#', 'Question', 'Participant ID', 'Name', 'Answer']);
  meta.questions.forEach((q, i) => Object.entries(all[i] || {}).forEach(([pid, a]) => {
    const arr = a && typeof a === 'object' ? Object.values(a) : a;
    let txt;
    if (q.type === 'mc') txt = q.options[a] ?? a;
    else if (q.type === 'rank') txt = arr.map((oi, pos) => `${pos + 1}. ${q.options[oi]}`).join(' | ');
    else if (q.type === 'points') txt = arr.map((v, oi) => `${q.options[oi]}: ${v}`).join(' | ');
    else txt = a;
    rows.push([i + 1, q.text, pid, ppl[pid]?.name || '', txt]);
  }));
  const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  download(`livevote-${code}.csv`, csv, 'text/csv;charset=utf-8');
};

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
