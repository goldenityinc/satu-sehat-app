// Turunan tampilan per pasien: agenda, peringatan, dan riwayat gabungan (data statis + input demo).
import { DEMO_TODAY, appointments } from '../data/simrs.js';
import { MODULES, facilityName } from '../data/patients.js';
import { daysBetween, fmtShort } from './clinical.js';
import { adherence } from '../store.jsx';
import { LAST7 } from '../data/patients.js';

export function agendaFor(p) {
  if (p.id === 'rina') return appointments.map((a) => ({ ...a, route: a.who === 'anak' ? '/anak' : '/kehamilan' }));
  if (p.id === 'slamet') return [
    { id: 'fisio', date: p.stroke.rehab.next, title: 'Fisioterapi sesi ke-49', detail: 'Instalasi Rehab Medik · 08.00', tone: 'purple', route: '/modul/stroke' },
    { id: 'pj', date: p.jantung.nextControl.date, title: 'Kontrol Poli Jantung', detail: p.jantung.nextControl.doctor, tone: 'red', route: '/modul/jantung' }
  ];
  if (p.id === 'dimas') return [
    { id: 'pickup', date: p.tbc.nextPickup.date, title: 'Ambil obat TBC bulan ke-3', detail: facilityName(p.tbc.nextPickup.facility), tone: 'amber', route: '/modul/tbc' },
    { id: 'bta', date: '2026-12-21', title: 'Periksa dahak (BTA) bulan ke-5', detail: 'Laboratorium klinik mitra', tone: 'amber', route: '/modul/tbc' }
  ];
  if (p.id === 'sri') return [
    { id: 'mata', date: '2026-10-15', title: 'Pemeriksaan mata (retina)', detail: 'Poli Mata RS JIH Solo · skrining diabetes', tone: 'blue', route: '/modul/diabetes' },
    { id: 'pd', date: p.diabetes.nextControl.date, title: 'Kontrol Poli Penyakit Dalam', detail: p.diabetes.nextControl.doctor, tone: 'blue', route: '/modul/diabetes' }
  ];
  return [];
}

export function upcoming(p) {
  return agendaFor(p).filter((a) => daysBetween(DEMO_TODAY, a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
}

export function alertsFor(state, p) {
  const out = [];
  if (p.id === 'rina') {
    if (state.synced) out.push({ tone: 'warn', title: 'Hb Ibu 10,6 g/dL: anemia ringan', text: 'Tablet tambah darah dinaikkan menjadi 2 tablet per hari.', route: '/kunjungan/k3' });
    out.push({ tone: 'warn', title: 'Imunisasi 18 bulan Arka jatuh tempo', text: 'DPT-HB-Hib & Campak-Rubela lanjutan, Senin 12 Okt.', route: '/anak' });
  }
  if (p.id === 'slamet') {
    out.push({ tone: 'warn', title: 'LDL 78 mg/dL masih di atas target', text: 'Target untuk jantung koroner dan pasca stroke di bawah 55 mg/dL. Minum atorvastatin setiap malam.', route: '/modul/jantung' });
  }
  if (p.id === 'dimas') {
    const pct = adherence(state, p, LAST7);
    out.push({ tone: 'warn', title: `Kepatuhan minum obat 7 hari: ${pct}%`, text: 'Ada dosis terlewat tanggal 3 dan 6 Oktober. Obat TBC harus diminum setiap hari tanpa putus.', route: '/obat' });
  }
  if (p.id === 'sri') {
    out.push({ tone: 'warn', title: 'HbA1c 7,8%: membaik, belum di target', text: 'Target HbA1c di bawah 7%. Minum obat teratur dan jaga pola makan.', route: '/modul/diabetes' });
  }
  return out;
}

// Riwayat lintas faskes: input dokter di demo + kunjungan perawat + data statis.
export function timelineFor(state, p) {
  const dyn = state.encounters.filter((e) => e.patientId === p.id).map((e) => ({ ...e, kind: 'encounter', dynamic: true }));
  const kader = state.kaderVisits.filter((v) => v.patientId === p.id).map((v) => ({
    id: v.id, date: v.date, time: v.time, kind: 'kader', module: v.module, facility: 'pkm', unit: 'Kunjungan rumah', doctor: 'Ns. Sumarni (perawat)',
    title: 'Kunjungan rumah perawat', summary: v.note || v.items.join(' · ')
  }));
  const kiaK3 = p.id === 'rina' && state.synced && !dyn.some((e) => e.module === 'kia')
    ? [{ id: 'r-k3', date: '2026-10-01', facility: 'jih', unit: 'Poli Kebidanan', doctor: 'Bd. Ratna Wulandari', module: 'kia', title: 'Pemeriksaan kehamilan K3', summary: 'Kondisi baik. Hb 10,6 g/dL, tablet tambah darah dinaikkan.', route: '/kunjungan/k3' }]
    : [];
  return [...dyn, ...kader, ...kiaK3, ...p.encounters].sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
}

export const moduleOf = (id) => MODULES[id];

// Ringkasan satu baris per modul untuk beranda pasien + penanda bila perlu perhatian.
export function moduleStatus(state, p, m) {
  const enc = state.encounters.filter((e) => e.patientId === p.id);
  const emergency = state.notifications.some((n) => n.patientId === p.id && n.kind === 'emergency' && n.module === m && n.date === DEMO_TODAY);
  let line = 'Pemantauan aktif';
  let flag = null;
  if (m === 'kia') {
    line = 'Hamil 24 minggu · kontrol K4 12 Nov';
    if (state.synced) flag = 'Hb rendah';
  } else if (m === 'jantung' && p.jantung) {
    const bp = enc.find((e) => e.sys) ?? { sys: p.jantung.bp.at(-1).sys, dia: p.jantung.bp.at(-1).dia };
    line = `TD terakhir ${bp.sys}/${bp.dia} · kontrol ${fmtShort(p.jantung.nextControl.date)}`;
  } else if (m === 'stroke' && p.stroke) {
    const n = enc.find((e) => e.module === 'stroke' && e.nihss != null)?.nihss ?? p.stroke.nihss.at(-1).value;
    line = `NIHSS ${n} · fisioterapi ${fmtShort(p.stroke.rehab.next)}`;
  } else if (m === 'tbc' && p.tbc) {
    line = `Hari ke-${daysBetween(p.tbc.start, DEMO_TODAY) + 1} dari ${p.tbc.totalDays} · fase lanjutan`;
    if (adherence(state, p, LAST7) < 90) flag = 'Obat terlewat';
  } else if (m === 'diabetes' && p.diabetes) {
    const a1c = enc.find((e) => e.module === 'diabetes' && e.hba1c != null)?.hba1c ?? p.diabetes.hba1c.at(-1).value;
    const gd = enc.find((e) => e.module === 'diabetes' && e.gd != null)?.gd ?? p.diabetes.glucose.at(-1).value;
    line = `HbA1c ${String(a1c).replace('.', ',')}% · gula darah ${gd} mg/dL`;
  } else {
    const c = p.conditions.find((x) => x.module === m);
    if (c) line = `${c.name} · sejak ${fmtShort(c.since)}`;
  }
  if (emergency) flag = 'Darurat';
  return { line, flag };
}

// Nilai terbaru per modul, menggabungkan input dokter di demo.
export function latestFields(state, p, module) {
  return state.encounters.filter((e) => e.patientId === p.id && e.module === module);
}
