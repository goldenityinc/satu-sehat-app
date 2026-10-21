import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ancVisits, inboxItems, fetchSimrsBatch, DEMO_TODAY } from './data/simrs.js';
import { seedMedLogs, patientById, doctors, doctorById, facilityName, MODULES, kader } from './data/patients.js';
import { checkValues, describeValues } from './lib/thresholds.js';

// Pelaku akses: dokter, atau perawat (id 'perawat').
export const actorById = (id) => (id === 'perawat' ? { ...kader, id: 'perawat' } : doctorById(id));
const actorOf = (s) => actorById(s.role === 'kader' ? 'perawat' : s.doctorId);

// Satu browser = satu "server" demo: semua peran (pasien, dokter, kader) berbagi state ini.
const KEY = 'jih-sehat-demo-v4';
export const QR_TTL_MS = 10 * 60_000; // QR berganti setiap 10 menit

const defaults = () => ({
  role: 'pasien',
  patientId: 'rina',
  doctorId: 'hendra',
  facilityId: 'jih',
  synced: false, inboxSeen: false,
  read: {}, saved: {},
  ttd: [true, true, true, true, false, false, false],
  booked: false,
  dev: [true, true, true, false, false],
  todo: {},
  medLogs: seedMedLogs(),
  encounters: [],
  notifications: [],
  kaderVisits: [],
  access: [],            // sesi akses dokter: { id, patientId, doctorId, facilityId, via, token, date, time, until, active }
  qr: {},                // QR aktif per pasien: { token, exp }
  personalDoctors: {},   // { [pasien]: { [modul]: doctorId } }
  doctorAlerts: [],      // peringatan ke dokter pribadi
  addedConditions: [],   // diagnosis yang ditambahkan dokter di demo
  seenNotif: {}
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

let seq = 0;
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;
// Jam demo dikunci ke pagi hari praktik (menit mengikuti jam asli agar urutan tetap terlihat).
export const nowTime = () => '10.' + String(new Date().getMinutes()).padStart(2, '0');
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');

// Pasien + diagnosis/modul tambahan dari dokter.
export function mergedPatient(state, id) {
  const base = patientById(id);
  if (!base) return null;
  const added = state.addedConditions.filter((c) => c.patientId === id);
  const modules = [...base.modules];
  for (const c of added) if (c.module && !modules.includes(c.module)) modules.push(c.module);
  const careTeam = { ...base.careTeam };
  for (const c of added) if (c.module && !careTeam[c.module]) careTeam[c.module] = [c.doctorId];
  return { ...base, modules, careTeam, conditions: [...base.conditions, ...added] };
}

// Akses rekam medis hanya lewat sesi scan QR yang masih aktif (dokter pribadi pun tetap scan).
// `doctorId` juga dipakai untuk akun perawat ('perawat').
export function accessInfo(state, patientId, doctorId = state.role === 'kader' ? 'perawat' : state.doctorId) {
  const session = state.access.find((a) => a.patientId === patientId && a.doctorId === doctorId && a.active && a.date === DEMO_TODAY);
  const personalFor = Object.entries(state.personalDoctors[patientId] || {}).filter(([, d]) => d === doctorId).map(([m]) => m);
  return { session, personalFor, ok: !!session };
}

// QR yang sedang ditampilkan pasien dan masih berlaku → dipakai kamera untuk deteksi otomatis.
export function detectShownQr(state) {
  const now = Date.now();
  const shown = Object.entries(state.qr).filter(([, q]) => q.shown && q.exp > now).sort((a, b) => b[1].issuedAt - a[1].issuedAt);
  return shown.length ? { patientId: shown[0][0], token: shown[0][1].token } : null;
}

// Penerima peringatan: dokter pribadi + tim dokter dari modul terkait.
export function alertRecipients(state, patientId, modules) {
  const p = mergedPatient(state, patientId);
  const pd = state.personalDoctors[patientId] || {};
  const mods = modules && modules.length ? modules : p.modules;
  return [...new Set(mods.flatMap((m) => [pd[m], ...(p.careTeam[m] || [])]).filter(Boolean))];
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* mode privat */ }
  }, [state]);

  const update = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);

  const showToast = useCallback((t) => {
    clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const pushNotif = (s, patientId, n) => [{ id: uid('n'), patientId, date: DEMO_TODAY, time: nowTime(), ...n }, ...s.notifications];

  const sendK3 = useCallback(async () => {
    if (syncing || state.synced) return;
    setSyncing(true);
    const res = await fetchSimrsBatch('k3');
    setSyncing(false);
    update({ synced: true, inboxSeen: false });
    if (state.role === 'pasien' && state.patientId === 'rina') {
      showToast({ title: `${res.inbox.length} catatan baru dari RS JIH Solo`, text: 'Hasil kunjungan kehamilan ke-3 dan hasil lab sudah masuk.', route: '/notifikasi' });
    }
  }, [syncing, state.synced, state.role, state.patientId, update, showToast]);

  const toggleMed = useCallback((patientId, medId, date, by) => {
    const k = `${patientId}:${medId}:${date}`;
    update((s) => ({ medLogs: { ...s.medLogs, [k]: s.medLogs[k] ? null : { by, time: nowTime() } } }));
  }, [update]);

  // ---------- QR dinamis ----------
  // Pasien membuka Kartu QR → token baru 10 menit, berstatus "sedang ditampilkan" agar bisa dideteksi kamera.
  const issueQr = useCallback((patientId) => {
    const q = { token: newToken(), exp: Date.now() + QR_TTL_MS, issuedAt: Date.now(), shown: true };
    update((s) => ({ qr: { ...s.qr, [patientId]: q } }));
    return q;
  }, [update]);

  const showQr = useCallback((patientId) => {
    update((s) => {
      const cur = s.qr[patientId];
      if (cur && cur.exp > Date.now()) return { qr: { ...s.qr, [patientId]: { ...cur, shown: true, issuedAt: Date.now() } } };
      return { qr: { ...s.qr, [patientId]: { token: newToken(), exp: Date.now() + QR_TTL_MS, issuedAt: Date.now(), shown: true } } };
    });
  }, [update]);

  // Dokter/perawat memindai QR. Token harus sama dengan QR aktif dan belum kedaluwarsa; setelah dipakai QR langsung diganti.
  const scanQr = useCallback((patientId, token) => {
    const s0 = ref.current;
    const cur = s0.qr[patientId];
    const actor = actorOf(s0);
    if (!cur || cur.token !== token || cur.exp < Date.now()) {
      update((s) => ({ notifications: pushNotif(s, patientId, { kind: 'security', title: 'Upaya akses dengan QR tidak valid ditolak', detail: `${actor.short} di ${facilityName(s.facilityId)} memindai QR yang sudah kedaluwarsa atau terpakai. Rekam medis Anda tetap aman.`, route: '/kartu' }) }));
      return 'rejected';
    }
    const time = nowTime();
    update((s) => {
      const entry = { id: uid('a'), patientId, doctorId: actor.id, facilityId: s.facilityId, via: 'qr', token, date: DEMO_TODAY, time, until: `besok ${time}`, active: true };
      return {
        access: [entry, ...s.access.filter((a) => !(a.patientId === patientId && a.doctorId === actor.id && a.active))],
        qr: { ...s.qr, [patientId]: { token: newToken(), exp: Date.now() + QR_TTL_MS, issuedAt: Date.now(), shown: false } },
        notifications: pushNotif(s, patientId, { kind: 'access', title: `${actor.short} membuka rekam medis Anda`, detail: `Scan QR di ${facilityName(s.facilityId)} · sesi ${token.slice(0, 4)}… berlaku sampai besok ${time}.`, route: '/kartu' })
      };
    });
    return 'ok';
  }, [update]);

  const revokeAccess = useCallback((accessId) => {
    update((s) => ({ access: s.access.map((a) => (a.id === accessId ? { ...a, active: false, endedAt: nowTime() } : a)) }));
  }, [update]);

  // ---------- Dokter pribadi & peringatan ----------
  const setPersonalDoctor = useCallback((patientId, module, doctorId) => {
    update((s) => ({ personalDoctors: { ...s.personalDoctors, [patientId]: { ...(s.personalDoctors[patientId] || {}), [module]: doctorId } } }));
  }, [update]);

  // Tombol darurat pasien → dokter pribadi + tim dokter.
  const raiseAlert = useCallback((patientId, alert) => {
    const sentTo = alertRecipients(ref.current, patientId, alert.modules);
    const a = { id: uid('al'), patientId, date: DEMO_TODAY, time: nowTime(), doctorIds: sentTo, handled: {}, level: 'darurat', ...alert };
    update((s) => ({ doctorAlerts: [a, ...s.doctorAlerts] }));
    return sentTo;
  }, [update]);

  const handleAlert = useCallback((alertId, doctorId) => {
    update((s) => ({ doctorAlerts: s.doctorAlerts.map((a) => (a.id === alertId ? { ...a, handled: { ...a.handled, [doctorId]: nowTime() } } : a)) }));
  }, [update]);

  // Nilai di luar batas → peringatan ke pasien dan dokter (kecuali dokter yang menginput).
  const valueAlerts = (s, patientId, module, values, flags, source, exclude, time) => {
    if (!flags.length) return { doctorAlerts: s.doctorAlerts, notifications: s.notifications };
    const worst = flags.some((f) => f.level === 'darurat') ? 'darurat' : 'waspada';
    const to = alertRecipients(s, patientId, [module]).filter((d) => d !== exclude);
    const detail = `${describeValues(values)}. ${flags.map((f) => `${f.label} (${f.limit})`).join('; ')}.`;
    const alert = { id: uid('al'), patientId, date: DEMO_TODAY, time, doctorIds: to, handled: {}, kind: 'values', level: worst, modules: [module], title: flags[0].label, detail: `${detail} Sumber: ${source}.`, flags };
    const n = {
      id: uid('n'), patientId, date: DEMO_TODAY, time, kind: 'emergency', level: worst, module,
      title: `${worst === 'darurat' ? 'Peringatan darurat' : 'Perlu perhatian'}: ${flags[0].label}`,
      detail: `${describeValues(values)}. ${to.length ? `Dokter Anda (${to.map((d) => actorById(d).short).join(', ')}) sudah diberi tahu. ` : ''}${worst === 'darurat' ? 'Segera hubungi dokter atau ke IGD.' : 'Ikuti anjuran dokter.'}`,
      route: '/notifikasi'
    };
    return { doctorAlerts: [alert, ...s.doctorAlerts], notifications: [n, ...s.notifications] };
  };

  // Simulasi: pasien tercatat di IGD faskes lain dengan TD sangat tinggi.
  const simulateIgd = useCallback((patientId) => {
    const time = nowTime();
    update((s) => {
      const values = { sys: 186, dia: 104, nadi: 92 };
      const flags = checkValues(values, 'jantung');
      const e = { id: uid('e'), patientId, date: DEMO_TODAY, time, facility: 'mitra', unit: 'IGD', doctor: 'dr. Ayu Lestari', doctorId: 'ayu', module: 'jantung', title: 'IGD: tekanan darah sangat tinggi', summary: 'Pusing berat dan tengkuk tegang. TD 186/104, tidak ada kelemahan anggota gerak baru.', fields: [{ label: 'Tekanan darah (mmHg)', value: '186/104' }, { label: 'Nadi (x/menit)', value: '92' }], sys: 186, dia: 104, satusehat: true, flags };
      const out = valueAlerts(s, patientId, 'jantung', values, flags, 'IGD Klinik Pratama Mitra Sehat via SATUSEHAT', null, time);
      return { encounters: [e, ...s.encounters], ...out };
    });
  }, [update]);

  // ---------- Input dokter ----------
  const addEncounter = useCallback((enc) => {
    update((s) => {
      const doc = doctorById(s.doctorId);
      const e = { id: uid('e'), date: DEMO_TODAY, time: nowTime(), facility: s.facilityId, doctor: doc.name, doctorId: doc.id, unit: doc.unit, satusehat: true, ...enc };
      let notifs = pushNotif(s, enc.patientId, { kind: 'encounter', module: enc.module, title: `Hasil pemeriksaan baru: ${enc.title}`, detail: `${doc.name} · ${facilityName(s.facilityId)}`, route: '/riwayat/' + e.id });
      let addedConditions = s.addedConditions;
      if (enc.newCondition) {
        const before = mergedPatient(s, enc.patientId);
        const c = { ...enc.newCondition, patientId: enc.patientId, since: DEMO_TODAY, by: doc.name, doctorId: doc.id, facility: s.facilityId, isNew: true };
        addedConditions = [...addedConditions, c];
        const activated = c.module && !before.modules.includes(c.module);
        notifs = [{ id: uid('n'), patientId: enc.patientId, date: DEMO_TODAY, time: e.time, kind: 'condition', title: `Diagnosis baru: ${c.name} (${c.code})`, detail: activated ? `Modul ${MODULES[c.module].long} diaktifkan di beranda Anda.` : 'Tercatat di rekam medis Anda.', route: '/rekam-medis' }, ...notifs];
      }
      const out = valueAlerts({ ...s, notifications: notifs }, enc.patientId, enc.module, enc.values || {}, enc.flags || [], `${doc.name}, ${facilityName(s.facilityId)}`, doc.id, e.time);
      return { encounters: [e, ...s.encounters], ...out, addedConditions, ...(enc.module === 'kia' ? { synced: true, inboxSeen: false } : {}) };
    });
  }, [update]);

  const addKaderVisit = useCallback((visit) => {
    update((s) => {
      const v = { id: uid('k'), date: DEMO_TODAY, time: nowTime(), ...visit };
      return { kaderVisits: [v, ...s.kaderVisits], notifications: pushNotif(s, visit.patientId, { kind: 'kader', title: 'Kunjungan rumah oleh perawat', detail: `${kader.short} mencatat kunjungan hari ini.`, route: '/riwayat' }) };
    });
  }, [update]);

  const reset = useCallback(() => { setToast(null); setState(defaults()); }, []);

  const value = useMemo(() => {
    const patient = mergedPatient(state, state.patientId);
    const visible = (x) => x.batch !== 'k3' || state.synced;
    const visits = ancVisits.filter(visible);
    const kiaInbox = state.patientId === 'rina' ? inboxItems.filter(visible) : [];
    const kiaNew = state.patientId === 'rina' && state.synced && !state.inboxSeen ? inboxItems.filter((i) => i.batch === 'k3').length : 0;
    const myNotifs = state.notifications.filter((n) => n.patientId === state.patientId);
    const newCount = kiaNew + myNotifs.filter((n) => !state.seenNotif[n.id]).length;
    const doctor = doctors.find((d) => d.id === state.doctorId);
    return {
      state, update, syncing, toast, setToast, showToast, sendK3, reset, toggleMed, addEncounter, addKaderVisit,
      issueQr, showQr, scanQr, revokeAccess, setPersonalDoctor, raiseAlert, handleAlert, simulateIgd,
      patient, doctor, visits, inbox: kiaInbox, kiaNew, myNotifs, newCount
    };
  }, [state, update, syncing, toast, showToast, sendK3, reset, toggleMed, addEncounter, addKaderVisit, issueQr, showQr, scanQr, revokeAccess, setPersonalDoctor, raiseAlert, handleAlert, simulateIgd]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

export function medStatus(state, patient, date) {
  return patient.meds.map((m) => ({ ...m, log: state.medLogs[`${patient.id}:${m.id}:${date}`] || null }));
}

export function adherence(state, patient, dates) {
  let total = 0, taken = 0;
  for (const d of dates) {
    for (const m of patient.meds) {
      const log = state.medLogs[`${patient.id}:${m.id}:${d}`];
      if (d === DEMO_TODAY && !log) continue; // dosis hari ini belum dihitung sampai dicentang
      total++;
      if (log) taken++;
    }
  }
  return total ? Math.round((taken / total) * 100) : 100;
}
