// Tiny storage layer: Firebase Realtime Database when configured,
// otherwise a same-browser demo store (localStorage + BroadcastChannel).
import { firebaseConfig } from './firebase-config.js';

export async function initStore() {
  if (firebaseConfig && firebaseConfig.databaseURL) return firebaseStore();
  return demoStore();
}

async function firebaseStore() {
  const V = '10.12.2';
  const appM = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const dbM = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
  const app = appM.initializeApp(firebaseConfig);
  const db = dbM.getDatabase(app);
  const r = (p) => dbM.ref(db, p);
  return {
    mode: 'live',
    set: (p, v) => dbM.set(r(p), v),
    update: (p, v) => dbM.update(r(p), v),
    get: async (p) => (await dbM.get(r(p))).val(),
    remove: (p) => dbM.remove(r(p)),
    on: (p, cb) => dbM.onValue(r(p), (snap) => cb(snap.val())), // returns unsubscribe
  };
}

function demoStore() {
  const KEY = 'livevote-demo-db';
  const ch = 'BroadcastChannel' in window ? new BroadcastChannel('livevote-demo') : null;
  const listeners = new Set();
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const notify = () => listeners.forEach((fn) => fn());
  const write = (db) => { localStorage.setItem(KEY, JSON.stringify(db)); notify(); ch && ch.postMessage(1); };
  const parts = (p) => p.split('/').filter(Boolean);
  const getAt = (db, p) => parts(p).reduce((o, k) => (o == null ? undefined : o[k]), db);
  const setAt = (db, p, v) => {
    const ks = parts(p); let o = db;
    ks.slice(0, -1).forEach((k) => { if (typeof o[k] !== 'object' || o[k] === null) o[k] = {}; o = o[k]; });
    if (v === null || v === undefined) delete o[ks.at(-1)]; else o[ks.at(-1)] = v;
  };
  const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
  if (ch) ch.onmessage = notify;
  window.addEventListener('storage', (e) => { if (e.key === KEY) notify(); });
  return {
    mode: 'demo',
    async set(p, v) { const db = read(); setAt(db, p, clone(v)); write(db); },
    async update(p, obj) { const db = read(); for (const [k, v] of Object.entries(obj)) setAt(db, `${p}/${k}`, clone(v)); write(db); },
    async get(p) { return clone(getAt(read(), p)); },
    async remove(p) { const db = read(); setAt(db, p, null); write(db); },
    on(p, cb) {
      let last;
      const fn = () => { const v = JSON.stringify(getAt(read(), p) ?? null); if (v !== last) { last = v; cb(JSON.parse(v)); } };
      listeners.add(fn); fn();
      return () => listeners.delete(fn);
    },
  };
}
