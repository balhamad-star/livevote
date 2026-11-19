import { initStore } from './store.js';
import { t, getLang, setLang, applyLang } from './i18n.js';
import { $, esc, cleanCode } from './util.js';
import { renderResults } from './results.js';

let store, code, pid, meta, state, myAnswer = null, editing = false;
let unsubs = [], ansUnsub = null, resUnsub = null;
const drafts = {}; // per-question local work (rank order / points)

applyLang(); updateLangBtn();
$('#langBtn').onclick = () => { setLang(getLang() === 'ar' ? 'en' : 'ar'); localStorage.setItem('lv-lang-chosen', '1'); updateLangBtn(); render(); };
function updateLangBtn() { $('#langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية'; }

$('#nameIn').value = localStorage.getItem('lv-name') || '';
$('#codeIn').addEventListener('input', (e) => { e.target.value = cleanCode(e.target.value); });

(async function boot() {
  store = await initStore();
  const urlCode = cleanCode(new URLSearchParams(location.search).get('code'));
  if (urlCode) { $('#codeIn').value = urlCode; if (urlCode.length === 6) join(urlCode); }
})();

$('#joinForm').onsubmit = (e) => { e.preventDefault(); join(cleanCode($('#codeIn').value)); };

async function join(c) {
  $('#joinErr').textContent = c.length === 6 ? t('connecting') : t('notFound');
  if (c.length !== 6) return;
  const m = await store.get(`sessions/${c}/meta`);
  const s = await store.get(`sessions/${c}/state`);
  if (!m || !s || s.phase === 'closed') { $('#joinErr').textContent = t('notFound'); return; }
  $('#joinErr').textContent = '';
  code = c;
  meta = m; meta.questions = Object.values(meta.questions || {}).map((q) => ({ ...q, options: Object.values(q.options || {}) }));
  if (!localStorage.getItem('lv-lang-chosen') && meta.lang) { setLang(meta.lang, false); updateLangBtn(); }

  pid = sessionStorage.getItem(`lv-pid-${c}`);
  if (!pid) { pid = 'p' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem(`lv-pid-${c}`, pid); }
  const name = $('#nameIn').value.trim(); localStorage.setItem('lv-name', name);
  await store.set(`sessions/${c}/participants/${pid}`, { name, at: Date.now() });

  history.replaceState(null, '', `?code=${c}`);
  $('#joinView').classList.add('hidden'); $('#liveView').classList.remove('hidden');
  $('#codeTag').textContent = c; $('#codeTag').classList.remove('hidden');

  unsubs.push(store.on(`sessions/${c}/state`, (s) => {
    const prev = state; state = s || { current: -1, phase: 'lobby' };
    if (!prev || prev.current !== state.current) { editing = false; watchMyAnswer(); }
    watchResults(); render();
  }));
}

function watchMyAnswer() {
  if (ansUnsub) ansUnsub(); ansUnsub = null; myAnswer = null;
  if (state.current < 0 || state.current >= meta.questions.length) return;
  const qi = state.current;
  ansUnsub = store.on(`sessions/${code}/responses/${qi}/${pid}`, (a) => { const changed = (a ?? null) !== myAnswer; myAnswer = a ?? null; if (changed && state.phase === 'answer') render(); });
}
function watchResults() {
  if (resUnsub) resUnsub(); resUnsub = null;
  if (state.phase !== 'results') return;
  const qi = state.current, q = meta.questions[qi];
  resUnsub = store.on(`sessions/${code}/responses/${qi}`, (r) => { const el = $('#pResults'); if (el) renderResults(el, q, r || {}); });
}

function render() {
  if (!state || !meta) return;
  const body = $('#pBody'), N = meta.questions.length, cur = state.current;
  $('#pStatus').textContent = cur >= 0 && cur < N ? t('qPos', { i: cur + 1, n: N }) : (meta.title || '');

  if (state.phase === 'closed' || cur >= N) {
    body.innerHTML = `<div class="card center"><div class="bigicon">✓</div><h2>${t(state.phase === 'closed' ? 'sessionClosed' : 'thanks')}</h2></div>`; return;
  }
  if (cur < 0) {
    body.innerHTML = `<div class="card center"><div class="bigicon pulse">●</div><h2>${t('youreIn')}</h2>
      <p class="muted" dir="auto">${esc(meta.title || '')}</p><p class="muted">${t('waitPresenter')}</p></div>`; return;
  }
  const q = meta.questions[cur];
  const head = `<h2 class="ptitle" dir="auto">${esc(q.text)}</h2>`;

  if (state.phase === 'results') {
    body.innerHTML = `<div class="card">${head}<div class="label">${t('results')}</div><div id="pResults" class="results compact"></div></div>`;
    watchResults(); return;
  }
  if (myAnswer !== null && !editing) {
    body.innerHTML = `<div class="card center">${head}<div class="bigicon ok">✓</div><h3>${t('received')}</h3>
      <p class="muted">${t('canChange')}</p><button class="secondary" id="editBtn">${t('changeAnswer')}</button></div>`;
    $('#editBtn').onclick = () => { editing = true; render(); }; return;
  }
  ({ mc: renderMC, rank: renderRank, points: renderPoints, text: renderText })[q.type](body, q, cur, head);
}

async function submit(qi, value) {
  await store.set(`sessions/${code}/responses/${qi}/${pid}`, value);
  myAnswer = value; editing = false; render();
}

// ── multiple choice: tap = answer
function renderMC(body, q, qi, head) {
  body.innerHTML = `<div class="card">${head}<div class="choices">${q.options.map((o, i) =>
    `<button class="choice c${i % 6}${myAnswer === i ? ' sel' : ''}" data-i="${i}" dir="auto">${esc(o)}</button>`).join('')}</div></div>`;
  body.querySelectorAll('.choice').forEach((b) => (b.onclick = () => submit(qi, +b.dataset.i)));
}

// ── ranking: tap options in order of priority
function renderRank(body, q, qi, head) {
  const k = q.options.length;
  let order = drafts[qi] || (Array.isArray(myAnswer) ? [...myAnswer] : []);
  drafts[qi] = order;
  const draw = () => {
    body.innerHTML = `<div class="card">${head}<p class="hint">${t('tapToRank')}</p>
      <div class="ranklist">${q.options.map((o, i) => { const pos = order.indexOf(i);
        return `<button class="rankopt${pos >= 0 ? ' on' : ''}" data-i="${i}"><span class="rnum">${pos >= 0 ? pos + 1 : ''}</span><span dir="auto">${esc(o)}</span></button>`; }).join('')}</div>
      <div class="row"><button class="ghost" id="rReset">${t('reset')}</button><div class="spacer"></div>
      <button class="primary" id="rSubmit"${order.length === k ? '' : ' disabled'}>${t('submit')} (${order.length}/${k})</button></div></div>`;
    body.querySelectorAll('.rankopt').forEach((b) => (b.onclick = () => {
      const i = +b.dataset.i, p = order.indexOf(i);
      if (p >= 0) order.splice(p, 1); else order.push(i);
      draw();
    }));
    $('#rReset').onclick = () => { order.length = 0; draw(); };
    $('#rSubmit').onclick = () => submit(qi, [...order]);
  };
  draw();
}

// ── weighting: split 100 points
function renderPoints(body, q, qi, head) {
  const k = q.options.length;
  let pts = drafts[qi] || (Array.isArray(myAnswer) ? [...myAnswer] : Array(k).fill(0));
  drafts[qi] = pts;
  body.innerHTML = `<div class="card">${head}<p class="hint">${t('splitHint')}</p>
    <div class="ptslist">${q.options.map((o, i) => `
      <div class="ptsrow"><div class="ptslabel" dir="auto">${esc(o)}</div>
        <div class="stepper"><button class="icon" data-d="-5" data-i="${i}">−</button>
        <input type="number" inputmode="numeric" min="0" max="100" value="${pts[i]}" data-i="${i}" dir="ltr">
        <button class="icon" data-d="5" data-i="${i}">+</button></div>
        <div class="ptsbar"><div style="width:${pts[i]}%"></div></div></div>`).join('')}</div>
    <div class="row"><span id="ptsLeft" class="pill"></span><div class="spacer"></div><button class="primary" id="pSubmit">${t('submit')}</button></div></div>`;
  const sync = () => {
    const sum = pts.reduce((a, b) => a + b, 0), left = 100 - sum;
    const lbl = $('#ptsLeft');
    lbl.textContent = left >= 0 ? t('pointsLeft', { n: left }) : t('pointsOver', { n: -left });
    lbl.classList.toggle('bad', left < 0); lbl.classList.toggle('good', left === 0);
    $('#pSubmit').disabled = left !== 0;
    body.querySelectorAll('.ptsrow').forEach((r, i) => { r.querySelector('.ptsbar div').style.width = Math.min(100, pts[i]) + '%'; });
  };
  body.querySelectorAll('.stepper button').forEach((b) => (b.onclick = () => {
    const i = +b.dataset.i; pts[i] = Math.max(0, Math.min(100, pts[i] + +b.dataset.d));
    body.querySelector(`input[data-i="${i}"]`).value = pts[i]; sync();
  }));
  body.querySelectorAll('.stepper input').forEach((inp) => (inp.oninput = () => {
    pts[+inp.dataset.i] = Math.max(0, Math.min(100, Math.round(+inp.value || 0))); sync();
  }));
  $('#pSubmit').onclick = () => submit(qi, [...pts]);
  sync();
}

// ── open text
function renderText(body, q, qi, head) {
  body.innerHTML = `<div class="card">${head}<textarea id="tIn" rows="3" maxlength="200" dir="auto" placeholder="${t('textPh')}">${esc(typeof myAnswer === 'string' ? myAnswer : '')}</textarea>
    <div class="row"><div class="spacer"></div><button class="primary" id="tSubmit">${t('submit')}</button></div></div>`;
  $('#tSubmit').onclick = () => { const v = $('#tIn').value.trim(); if (v) submit(qi, v); };
}
