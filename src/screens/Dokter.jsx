import { useEffect, useRef, useState } from 'react';
import { Link, navigate } from '../router.jsx';
import { useStore, adherence, accessInfo, mergedPatient, detectShownQr, actorById } from '../store.jsx';
import { Icon, TopBar, Chip, Avatar, MenuIcon, TONES } from '../components/ui.jsx';
import { DEMO_TODAY, ancVisits } from '../data/simrs.js';
import { patients, patientById, doctorById, MODULES, facilities, facilityName, LAST7, CONDITION_CATALOG, CRITICAL_MODULES } from '../data/patients.js';
import { timelineFor } from '../lib/patientView.js';
import { checkValues } from '../lib/thresholds.js';
import { fmtLong, fmtShort, fmtDayShort, ageInMonthsDays, addDays } from '../lib/clinical.js';

const ageYears = (dob) => Math.floor(ageInMonthsDays(dob, DEMO_TODAY).months / 12);
const hasAccess = (state, pid) => accessInfo(state, pid).ok;

// Modul utama tiap dokter (dari spesialisasi). Dokter umum melihat semua modul.
export const SPECIALTY_MODULE = { hendra: 'jantung', yusuf: 'stroke', rani: 'stroke', laras: 'tbc', anindita: 'kia', ratna: 'kia', dewi: 'diabetes' };

const patientsIn = (state, m) => patients.map((p) => mergedPatient(state, p.id)).filter((p) => p.modules.includes(m));
const openAlertsFor = (state, actorId) => state.doctorAlerts.filter((a) => (actorId === 'perawat' || a.doctorIds.includes(actorId)) && !a.handled[actorId]);

function AlertCard({ a, actorId }) {
  const { state, handleAlert } = useStore();
  const p = patientById(a.patientId);
  const open = accessInfo(state, p.id, actorId).ok;
  const base = actorId === 'perawat' ? '/perawat' : '/dokter';
  const danger = a.level !== 'waspada';
  const handled = a.handled[actorId];
  return (
    <div className={'card ' + (handled ? '' : danger ? 'danger' : 'warn')} style={{ gap: 8, ...(handled || !danger ? {} : { borderWidth: 2, borderColor: 'var(--danger)' }) }} role={handled ? undefined : 'alert'}>
      <span className="between">
        <span className="eyebrow" style={{ color: handled ? 'var(--muted)' : danger ? 'var(--danger)' : 'var(--warn-ink)' }}>
          {a.kind === 'sos' ? 'Tombol darurat pasien' : a.kind === 'values' ? (danger ? 'Nilai di luar batas · darurat' : 'Nilai di luar batas · waspada') : 'Peringatan'}
        </span>
        <span className="small">{fmtShort(a.date)} · {a.time}</span>
      </span>
      <b style={{ fontSize: 15 }}>{p.name}: {a.title}</b>
      <span className="body-sm">{a.detail}</span>
      {handled ? <span className="small">Ditangani pukul {handled}</span> : (
        <div className="btn-row">
          <Link to={open ? `${base}/pasien/${p.id}` : `${base}/scan/${p.id}`} className={'btn ' + (danger ? 'btn-danger' : 'btn-secondary')} style={{ minHeight: 42, fontSize: 13 }}>{open ? 'Buka rekam medis' : 'Scan QR pasien'}</Link>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 42, fontSize: 13 }} onClick={() => handleAlert(a.id, actorId)}>Tandai ditangani</button>
        </div>
      )}
    </div>
  );
}

/* ======================= Notifikasi darurat (dokter & perawat) ======================= */
export function AlertsPage({ actorId, backTo }) {
  const { state } = useStore();
  const [tab, setTab] = useState('open');
  const all = state.doctorAlerts.filter((a) => actorId === 'perawat' || a.doctorIds.includes(actorId));
  const list = tab === 'open' ? all.filter((a) => !a.handled[actorId]) : all;
  return (
    <div className="screen">
      <TopBar title="Notifikasi darurat" backTo={backTo} />
      <div className="content">
        <div className="filter" role="group" aria-label="Saring notifikasi">
          <button type="button" aria-pressed={tab === 'open'} onClick={() => setTab('open')}>Perlu tindakan ({all.filter((a) => !a.handled[actorId]).length})</button>
          <button type="button" aria-pressed={tab === 'all'} onClick={() => setTab('all')}>Semua</button>
        </div>
        <div className="lock-note"><Icon name="lock" size={16} />Nilai pemeriksaan tercantum di peringatan. Rekam medis lengkap tetap dibuka lewat scan QR pasien.</div>
        {list.length ? list.map((a) => <AlertCard key={a.id} a={a} actorId={actorId} />) : (
          <div className="card"><b>Tidak ada peringatan</b><span className="body-sm">Peringatan muncul otomatis saat pasien menekan tombol darurat atau saat hasil pemeriksaan di faskes mana pun melewati batas wajar.</span></div>
        )}
      </div>
    </div>
  );
}

/* ======================= Beranda dokter ======================= */
export function DokterHome() {
  const { state, doctor, update } = useStore();
  const mine = state.encounters.filter((e) => e.doctorId === state.doctorId);
  const alerts = openAlertsFor(state, state.doctorId);
  const spec = SPECIALTY_MODULE[state.doctorId];
  const order = spec ? [spec, ...Object.keys(MODULES).filter((m) => m !== spec)] : Object.keys(MODULES);
  const queue = [
    { time: '09.00', p: 'slamet', reason: 'Kontrol jantung & stroke' },
    { time: '09.30', p: 'dimas', reason: 'Kontrol TBC bulan ke-3' },
    { time: '10.00', p: 'rina', reason: 'Pemeriksaan kehamilan' },
    { time: '10.30', p: 'sri', reason: 'Kontrol diabetes' }
  ];

  return (
    <div className="screen">
      <div className="role-head doctor">
        <div className="between">
          <span className="brand"><span className="brand-mark" style={{ color: '#1E4F8A' }}><Icon name="stethoscope" size={18} stroke={2.2} /></span>JIH Sehat · Dokter</span>
          <Link to="/dokter/notifikasi" className="icon-btn" aria-label={`Notifikasi darurat, ${alerts.length}`}>
            <Icon name="bell" />{alerts.length ? <span className="icon-badge">{alerts.length}</span> : null}
          </Link>
        </div>
        <div className="stack-sm">
          <span style={{ fontSize: 13, color: '#C8DBF2' }}>{fmtLong(DEMO_TODAY)}</span>
          <b style={{ fontSize: 20 }}>{doctor.name}</b>
        </div>
        <label className="row" style={{ gap: 8, fontSize: 13 }}>
          <Icon name="map" size={18} />
          <span className="sr-only">Tempat praktik</span>
          <select className="select" value={state.facilityId} onChange={(e) => update({ facilityId: e.target.value })} style={{ flex: 1, minHeight: 40, fontSize: 14 }}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}{f.partner ? ' (mitra)' : ''}</option>)}
          </select>
        </label>
      </div>

      <div className="content" style={{ paddingTop: 16, gap: 16 }}>
        {alerts.length ? (
          <Link to="/dokter/notifikasi" className="card danger" style={{ flexDirection: 'row', gap: 12, borderWidth: 2, borderColor: 'var(--danger)' }}>
            <span style={{ color: 'var(--danger)', flex: 'none' }}><Icon name="sos" /></span>
            <span className="stack-sm grow"><b style={{ fontSize: 15, color: 'var(--danger-ink)' }}>{alerts.length} notifikasi darurat</b><span className="body-sm" style={{ color: '#4D0F0B' }}>{patientById(alerts[0].patientId).name}: {alerts[0].title}</span></span>
            <Icon name="chevron" size={18} style={{ alignSelf: 'center' }} />
          </Link>
        ) : null}

        <div className="stack" style={{ gap: 12 }}>
          <span className="between"><span className="h-section">Modul penyakit</span><span className="small">{spec ? `Spesialisasi: ${MODULES[spec].name}` : 'Semua modul'}</span></span>
          <div className="menu-grid">
            {order.map((m) => <MenuIcon key={m} to={'/dokter/modul/' + m} icon={MODULES[m].icon} label={MODULES[m].long} tone={MODULES[m].tone} badge={patientsIn(state, m).length} />)}
          </div>
          <span className="small" style={{ lineHeight: 1.45 }}>Pilih modul untuk melihat daftar pasien. Rekam medis terbuka setelah QR pasien dipindai.</span>
        </div>

        <div className="card" style={{ gap: 4 }}>
          <span className="h-card" style={{ paddingBottom: 6 }}>Antrean {doctor.unit} hari ini</span>
          {queue.map((q) => {
            const p = patientById(q.p);
            const open = hasAccess(state, p.id);
            return (
              <Link key={q.p} to={open ? '/dokter/pasien/' + p.id : '/dokter/scan/' + p.id} className="list-row" style={{ padding: '10px 0' }}>
                <b style={{ width: 44, fontSize: 13 }}>{q.time}</b>
                <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{p.name}</b><span className="small">{q.reason}</span></span>
                {open ? <Chip tone="ok">Dibuka</Chip> : <span className="row small" style={{ gap: 4, fontWeight: 700, color: '#1E4F8A' }}><Icon name="lock" size={14} />Scan</span>}
              </Link>
            );
          })}
        </div>

        <div className="card">
          <span className="h-card">Pemeriksaan yang Anda input hari ini</span>
          {mine.length ? mine.map((e) => (
            <div key={e.id} className="between body-sm"><span><b>{patientById(e.patientId).name}</b><br />{e.title}</span><span className="ss-badge"><Icon name="cloud" size={13} />Terkirim</span></div>
          )) : <span className="body-sm">Belum ada. Scan QR pasien untuk mulai.</span>}
        </div>
      </div>
    </div>
  );
}

/* ======================= Daftar pasien per modul ======================= */
export function DokterModul({ module, base = '/dokter' }) {
  const { state } = useStore();
  const m = MODULES[module];
  const actorId = base === '/perawat' ? 'perawat' : state.doctorId;
  const list = patientsIn(state, module);
  return (
    <div className="screen">
      <TopBar title={'Modul ' + m.long} backTo={base} />
      <div className="content">
        <div className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', background: TONES[m.tone].bg, borderColor: TONES[m.tone].bg }}>
          <span className="menu-ico" style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', color: TONES[m.tone].fg }}><Icon name={m.icon} /></span>
          <span className="stack-sm"><b style={{ fontSize: 16 }}>{list.length} pasien</b><span className="body-sm" style={{ color: 'var(--ink)' }}>terdaftar di modul {m.name}</span></span>
        </div>
        <div className="lock-note"><Icon name="lock" size={16} />Hanya identitas yang terlihat. Rekam medis terbuka setelah scan QR pasien.</div>
        {list.map((p) => {
          const open = accessInfo(state, p.id, actorId).ok;
          const others = p.modules.filter((x) => x !== module);
          const last = timelineFor(state, p).find((e) => e.module === module);
          const alert = state.doctorAlerts.some((a) => a.patientId === p.id && !a.handled[actorId] && (actorId === 'perawat' || a.doctorIds.includes(actorId)));
          return (
            <Link key={p.id} to={open ? `${base}/pasien/${p.id}` : `${base}/scan/${p.id}`} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={44} />
              <span className="stack-sm grow">
                <b style={{ fontSize: 15 }}>{p.name}</b>
                <span className="small">{p.healthId} · {p.sex === 'P' ? 'P' : 'L'}, {ageYears(p.dob)} th</span>
                <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {others.map((x) => <span key={x} className="chip" style={{ background: TONES[MODULES[x].tone].bg, color: TONES[MODULES[x].tone].fg }}>+ {MODULES[x].name}</span>)}
                  {alert ? <Chip tone="warn">Peringatan</Chip> : null}
                  {last ? <span className="small">Terakhir {fmtShort(last.date)}</span> : null}
                </span>
              </span>
              {open ? <Chip tone="ok">Dibuka</Chip> : <span className="stack-sm" style={{ alignItems: 'center', color: '#1E4F8A' }}><Icon name="lock" size={18} /><span style={{ fontSize: 11, fontWeight: 700 }}>Scan QR</span></span>}
            </Link>
          );
        })}
        <span className="small" style={{ lineHeight: 1.45 }}>Label “+ modul lain” menandakan komplikasi: pasien ditangani di lebih dari satu modul.</span>
      </div>
    </div>
  );
}

/* ======================= Pasien yang sedang dibuka ======================= */
export function DokterSesi({ base = '/dokter' }) {
  const { state } = useStore();
  const actorId = base === '/perawat' ? 'perawat' : state.doctorId;
  const sessions = state.access.filter((a) => a.doctorId === actorId && a.date === DEMO_TODAY);
  return (
    <div className="screen">
      <TopBar title="Pasien hari ini" backTo={base} />
      <div className="content">
        {sessions.length ? sessions.map((a) => {
          const p = patientById(a.patientId);
          return (
            <Link key={a.id} to={a.active ? `${base}/pasien/${p.id}` : `${base}/scan/${p.id}`} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={42} />
              <span className="stack-sm grow"><b style={{ fontSize: 15 }}>{p.name}</b><span className="small">Scan {a.time} · {facilityName(a.facilityId)}</span></span>
              {a.active ? <Chip tone="ok">Sesi aktif</Chip> : <Chip tone="na">Diakhiri {a.endedAt}</Chip>}
            </Link>
          );
        }) : <div className="card"><b>Belum ada pasien</b><span className="body-sm">Pasien yang QR-nya Anda pindai hari ini akan muncul di sini.</span></div>}
        <Link to={base + '/scan'} className="btn btn-blue"><Icon name="scan" size={18} />Scan QR pasien</Link>
      </div>
    </div>
  );
}

/* ======================= Scan QR otomatis ======================= */
// Kamera terus membaca; QR yang sedang ditampilkan pasien dan masih berlaku langsung terdeteksi (tanpa memilih pasien).
export function Scanner({ base = '/dokter', expect }) {
  const { state, scanQr } = useStore();
  const [, tick] = useState(0);
  const detected = detectShownQr(state);
  const expected = expect ? patientById(expect) : null;

  // Cek ulang tiap detik (QR bisa kedaluwarsa atau baru ditampilkan).
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  // QR terdeteksi → verifikasi token ke server (simulasi 1,4 detik) → buka rekam medis.
  useEffect(() => {
    if (!detected) return undefined;
    const t = setTimeout(() => {
      if (scanQr(detected.patientId, detected.token) === 'ok') navigate(`${base}/pasien/${detected.patientId}`);
    }, 1400);
    return () => clearTimeout(t);
  }, [detected?.token, detected?.patientId]);

  const fp = detected ? patientById(detected.patientId) : null;
  return (
    <div className="screen">
      <TopBar title="Scan QR pasien" backTo={base} />
      <div className="content">
        <div className="viewfinder">
          <div className="vf-frame"><i /><i /><i /><i />{fp ? null : <span className="vf-line" />}</div>
          <span style={{ position: 'absolute', bottom: 16, left: 12, right: 12, textAlign: 'center', color: fp ? '#5FD0BC' : '#CFE3DE', fontSize: 14, fontWeight: fp ? 700 : 400 }} aria-live="polite">
            {fp ? `QR terdeteksi: ${fp.name}. Memverifikasi sesi…` : 'Mencari QR pasien…'}
          </span>
        </div>
        {!fp ? (
          <div className="card" style={{ gap: 8 }}>
            <b>{expected ? `Minta ${expected.name} menampilkan Kartu QR` : 'Minta pasien membuka menu Kartu QR'}</b>
            <span className="body-sm">Arahkan kamera ke layar HP pasien. Sistem otomatis mengenali QR milik siapa, tanpa perlu memilih pasien. QR berlaku 10 menit dan sekali pakai.</span>
            <span className="small" style={{ lineHeight: 1.45 }}>Demo: buka akun pasien lalu menu Kartu QR, atau tekan tombol “QR nama pasien” di panel demo.</span>
          </div>
        ) : null}
        <div className="access-banner"><Icon name="lock" size={20} />QR yang valid membuka sesi 24 jam. Pasien menerima notifikasi dan bisa mengakhiri sesi kapan saja.</div>
      </div>
    </div>
  );
}

/* ======================= Ringkasan rekam medis (dokter) ======================= */
export function DokterPasien({ id, base = '/dokter' }) {
  const { state } = useStore();
  const p = mergedPatient(state, id);
  if (!p) return null;
  const actorId = base === '/perawat' ? 'perawat' : state.doctorId;
  const acc = accessInfo(state, id, actorId);
  if (!acc.ok) {
    const ended = state.access.find((a) => a.patientId === id && a.doctorId === actorId && !a.active);
    return (
      <div className="screen"><TopBar title="Rekam medis" backTo={base} />
        <div className="content"><div className="card"><b>{ended ? 'Sesi akses diakhiri pasien' : 'Rekam medis terkunci'}</b><span className="body-sm">{ended ? `Pasien mengakhiri sesi pukul ${ended.endedAt}.` : ''} Pindai Kartu QR {p.name} untuk membuka rekam medis.</span><Link to={`${base}/scan/${id}`} className="btn btn-blue"><Icon name="scan" size={18} />Scan QR</Link></div></div>
      </div>
    );
  }
  const pd = state.personalDoctors[p.id] || {};
  const pct = adherence(state, p, LAST7);
  const timeline = timelineFor(state, p).slice(0, 5);
  const visits = state.kaderVisits.filter((v) => v.patientId === p.id);
  const conditions = p.conditions.filter((c) => !c.synced || state.synced);
  const alerts = state.doctorAlerts.filter((a) => a.patientId === p.id);

  return (
    <div className="screen">
      <TopBar title="Rekam medis pasien" backTo={base} />
      <div className="content">
        <div className="card" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={52} />
            <span className="stack-sm grow">
              <b style={{ fontSize: 18 }}>{p.name}</b>
              <span className="small">{p.sex === 'P' ? 'Perempuan' : 'Laki-laki'} · {ageYears(p.dob)} th · Gol. darah {p.bloodType}</span>
              <span className="small">{p.healthId} · SATUSEHAT {p.satusehatId}</span>
            </span>
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {p.modules.map((m) => <span key={m} className="chip" style={{ background: TONES[MODULES[m].tone].bg, color: TONES[MODULES[m].tone].fg, fontSize: 12 }}>{MODULES[m].long}</span>)}
            <span className="chip chip-ok" style={{ fontSize: 12 }}>Alergi: {p.allergies.join(', ')}</span>
          </div>
        </div>
        <div className="access-banner"><Icon name="lock" size={20} />Sesi QR {acc.session.token.slice(0, 4)}… dibuka {acc.session.time} di {facilityName(acc.session.facilityId)} · berlaku s.d. {acc.session.until}.</div>

        {base === '/dokter' ? <Link to={`/dokter/pasien/${p.id}/input`} className="btn btn-blue" style={{ minHeight: 54, fontSize: 15 }}><Icon name="clipboard" size={20} />Input pemeriksaan hari ini</Link> : null}

        {alerts.length ? (
          <div className="card danger" style={{ gap: 6 }}>
            <span className="h-card" style={{ color: 'var(--danger-ink)' }}>Peringatan terbaru</span>
            {alerts.map((a) => <span key={a.id} className="body-sm"><b>{a.time}</b> · {a.title}. {a.detail}</span>)}
          </div>
        ) : null}

        <div className="card">
          <span className="h-card">Diagnosis aktif (ICD-10)</span>
          {conditions.map((c) => (
            <div key={c.code + c.name} className="row body" style={{ alignItems: 'flex-start' }}>
              <span className="chip" style={{ background: TONES[MODULES[c.module]?.tone ?? 'slate'].bg, color: TONES[MODULES[c.module]?.tone ?? 'slate'].fg, minWidth: 50, justifyContent: 'center' }}>{c.code}</span>
              <span className="stack-sm"><span>{c.name}</span><span className="small">Sejak {fmtShort(c.since)} · {c.by}</span></span>
            </div>
          ))}
        </div>

        <div className="card" style={{ gap: 8 }}>
          <span className="h-card">Tim dokter</span>
          {p.modules.map((m) => (
            <div key={m} className="body-sm">
              <b>{MODULES[m].long}:</b> {(p.careTeam[m] || []).map((d) => doctorById(d).short + (pd[m] === d ? ' (dokter pribadi)' : '')).join(', ')}
              {CRITICAL_MODULES.includes(m) && !pd[m] ? <span style={{ color: 'var(--warn-ink)', fontWeight: 700 }}> · dokter pribadi belum dipilih</span> : null}
            </div>
          ))}
        </div>

        <div className="card flush">
          <div className="group-head"><b style={{ fontSize: 14 }}>Obat aktif</b><span className="small">Kepatuhan 7 hari: <b style={{ color: pct >= 90 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{pct}%</b></span></div>
          {p.meds.map((m) => <div key={m.id} className="list-row" style={{ minHeight: 0 }}><span className="stack-sm grow"><b style={{ fontSize: 14 }}>{m.name}</b><span className="small">{m.dose} · {m.time}</span></span></div>)}
        </div>

        <div className="card">
          <span className="h-card">Riwayat lintas faskes</span>
          {timeline.map((e) => (
            <div key={e.id} className="stack-sm" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line-soft)' }}>
              <span className="between"><b style={{ fontSize: 14 }}>{e.title}</b><span className="small">{fmtShort(e.date)}</span></span>
              <span className="body-sm">{e.summary}</span>
              <span className="small">{facilityName(e.facility)} · {e.doctor}</span>
            </div>
          ))}
        </div>

        {p.id === 'rina' ? (
          <div className="card">
            <span className="h-card">KIA: pemeriksaan kehamilan</span>
            {ancVisits.filter((v) => v.batch !== 'k3' || state.synced).map((v) => <div key={v.id} className="between body-sm"><span>K{v.no} · {v.gaWeeks} mgg</span><span>BB {String(v.weightKg).replace('.', ',')} kg · {v.results[1].value}</span></div>)}
          </div>
        ) : null}

        {visits.length ? (
          <div className="card warn-soft">
            <span className="h-card">Catatan perawat</span>
            {visits.map((v) => <span key={v.id} className="body-sm"><b>{fmtShort(v.date)}:</b> {v.items.join(' · ')}{v.note ? ` — ${v.note}` : ''}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ======================= Input pemeriksaan ======================= */
const FORMS = {
  kia: {
    title: 'Pemeriksaan kehamilan K3',
    fields: [['bb', 'Berat badan (kg)', '59.8'], ['td', 'Tekanan darah (mmHg)', '118/76'], ['lila', 'LiLA (cm)', '25'], ['tfu', 'Tinggi rahim (cm)', '23'], ['djj', 'Detak jantung janin (x/menit)', '142'], ['hb', 'Hemoglobin (g/dL)', '10.6']],
    note: 'Kondisi ibu dan janin baik. Hb 10,6 g/dL (anemia ringan).',
    plan: 'Tablet tambah darah 2x sehari. Tes gula darah 22 Okt. Kontrol K4.',
    next: '2026-11-12'
  },
  jantung: {
    title: 'Kontrol jantung',
    fields: [['td', 'Tekanan darah (mmHg)', '128/78'], ['nadi', 'Nadi (x/menit)', '66'], ['bb', 'Berat badan (kg)', '70'], ['ldl', 'LDL (mg/dL, bila ada)', '']],
    note: 'Tidak ada nyeri dada atau sesak. Tekanan darah sesuai target.',
    plan: 'Lanjutkan obat. Kurangi garam, jalan kaki 30 menit 5x seminggu.',
    next: '2026-11-17'
  },
  stroke: {
    title: 'Evaluasi stroke',
    fields: [['td', 'Tekanan darah (mmHg)', '128/78'], ['nihss', 'Skor NIHSS', '1'], ['mrs', 'Skala Rankin (mRS)', '1']],
    note: 'Kekuatan tangan kanan hampir normal. Berjalan tanpa tongkat di dalam rumah.',
    plan: 'Fisioterapi dikurangi menjadi 1x seminggu. Lanjutkan latihan di rumah.',
    next: '2026-11-05'
  },
  tbc: {
    title: 'Kontrol TBC bulan ke-3',
    fields: [['bb', 'Berat badan (kg)', '52.5'], ['keluhan', 'Keluhan', 'Batuk hilang, nafsu makan baik'], ['efek', 'Efek samping obat', 'Tidak ada']],
    note: 'Respons pengobatan baik. Ada 2 dosis terlewat minggu lalu, sudah diberi edukasi.',
    plan: 'Lanjutkan 2FDC 3 tablet setiap pagi. Perawat PMO tetap mendampingi.',
    next: '2026-11-16'
  },
  diabetes: {
    title: 'Kontrol diabetes',
    fields: [['gd', 'Gula darah puasa (mg/dL)', '124'], ['hba1c', 'HbA1c (%, bila ada)', ''], ['td', 'Tekanan darah (mmHg)', '130/80'], ['bb', 'Berat badan (kg)', '67']],
    note: 'Gula darah puasa membaik. Kesemutan kaki kiri tidak bertambah, tidak ada luka.',
    plan: 'Lanjutkan metformin dan glimepiride. Jalan kaki 30 menit 5x seminggu. Periksa mata 15 Okt.',
    next: '2026-12-17'
  }
};

function previous(state, p, module) {
  const base = patientById(p.id);
  const enc = state.encounters.filter((e) => e.patientId === p.id && e.module === module);
  const lastNihss = enc.find((e) => e.nihss != null)?.nihss ?? base.stroke?.nihss.at(-1).value;
  const lastWeight = enc.find((e) => e.weight != null)?.weight ?? base.tbc?.weights.at(-1).value;
  return { prevNihss: lastNihss, prevWeight: lastWeight };
}

export function DokterInput({ id }) {
  const { state, addEncounter, doctor } = useStore();
  const p = mergedPatient(state, id);
  const spec = SPECIALTY_MODULE[state.doctorId];
  const [module, setModule] = useState(p.modules.includes(spec) ? spec : p.modules[0]);
  const [newCode, setNewCode] = useState('');
  const form = FORMS[module] ?? FORMS.jantung;
  const existingCodes = p.conditions.map((c) => c.code);
  const visitDx = p.conditions.filter((c) => c.module === module && (!c.synced || state.synced));
  const [values, setValues] = useState(() => Object.fromEntries(form.fields.map(([k, , v]) => [k, v])));
  const [note, setNote] = useState(form.note);
  const [plan, setPlan] = useState(form.plan);
  const [next, setNext] = useState(form.next);
  const [step, setStep] = useState(0);

  const switchModule = (m) => {
    const f = FORMS[m] ?? FORMS.jantung;
    setModule(m);
    setValues(Object.fromEntries(f.fields.map(([k, , v]) => [k, v])));
    setNote(f.note); setPlan(f.plan); setNext(f.next);
  };

  if (!hasAccess(state, id)) return <DokterPasien id={id} />;

  const num = (k) => (values[k] ? Number(String(values[k]).replace(',', '.')) : undefined);
  const [sys, dia] = (values.td || '').split('/').map(Number);
  const vals = { sys: sys || undefined, dia: dia || undefined, nadi: num('nadi'), djj: num('djj'), hb: num('hb'), nihss: num('nihss'), weight: num('bb'), gd: num('gd'), hba1c: num('hba1c'), efek: values.efek, ...previous(state, p, module) };
  const flags = checkValues(vals, module);

  const submit = (e) => {
    e.preventDefault();
    addEncounter({
      patientId: p.id, module, title: form.title, summary: note, plan, nextControl: next,
      fields: form.fields.filter(([k]) => values[k]).map(([k, label]) => ({ label, value: values[k] })),
      sys: vals.sys, dia: vals.dia, weight: vals.weight, nihss: vals.nihss, mrs: num('mrs'), ldl: num('ldl'), gd: num('gd'), hba1c: num('hba1c'),
      values: vals, flags,
      diagnoses: visitDx.map((c) => c.code),
      newCondition: newCode ? CONDITION_CATALOG.find((c) => c.code === newCode) : undefined
    });
    setStep(1);
    setTimeout(() => setStep(2), 700);
    setTimeout(() => setStep(3), 1400);
  };

  if (step) {
    const steps = [`Tersimpan di rekam medis ${facilityName(state.facilityId)}`, `Terkirim ke SATUSEHAT Kemenkes (Encounter, Observation${newCode ? ', Condition' : ''})`, `Muncul di aplikasi ${p.short}`];
    if (flags.length) steps.push('Notifikasi darurat dikirim ke pasien dan tim dokter');
    return (
      <div className="screen">
        <TopBar title="Pemeriksaan disimpan" backTo={`/dokter/pasien/${p.id}`} />
        <div className="content">
          <div className="card" style={{ gap: 16, padding: 20 }}>
            <b style={{ fontSize: 18 }}>{form.title}</b>
            {steps.map((s, i) => (
              <div key={s} className={'step-line' + (step > Math.min(i, 2) ? ' done' : '')}>
                <span className="dot">{step > Math.min(i, 2) ? <Icon name="check" size={16} stroke={2.6} /> : <Icon name="refresh" size={16} className="spin" />}</span>{s}
              </div>
            ))}
          </div>
          {step >= 3 ? (
            <>
              <div className="card teal-tint fade-in"><span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Ganti peran ke <b>Pasien · {p.name}</b> untuk melihat hasil{flags.length ? ' dan notifikasi daruratnya' : ''} di HP pasien.</span></div>
              <Link to={`/dokter/pasien/${p.id}`} className="btn btn-blue">Kembali ke rekam medis</Link>
              <Link to="/dokter/scan" className="btn btn-secondary">Scan pasien berikutnya</Link>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Input pemeriksaan" backTo={`/dokter/pasien/${p.id}`} />
      <form className="content" onSubmit={submit}>
        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
          <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={40} />
          <span className="stack-sm"><b>{p.name}</b><span className="small">{doctor.name} · {fmtShort(DEMO_TODAY)}</span></span>
        </div>
        <span className="small" style={{ fontWeight: 700 }}>Modul kunjungan</span>
        <div className="seg dark" role="group" aria-label="Pilih modul" style={{ gridTemplateColumns: `repeat(${p.modules.length}, minmax(0, 1fr))` }}>
          {p.modules.map((m) => <button key={m} type="button" aria-pressed={module === m} onClick={() => switchModule(m)}>{MODULES[m].name}</button>)}
        </div>
        <div className="card" style={{ gap: 12 }}>
          <span className="h-card">{form.title}</span>
          <div className="grid2">
            {form.fields.map(([k, label]) => (
              <label key={k} className="form-field" style={k === 'keluhan' || k === 'efek' ? { gridColumn: '1 / -1' } : null}>
                <span>{label}</span>
                <input value={values[k] ?? ''} onChange={(e) => setValues({ ...values, [k]: e.target.value })} inputMode={['keluhan', 'efek', 'td'].includes(k) ? 'text' : 'decimal'} />
              </label>
            ))}
          </div>
          {flags.length ? (
            <div className="card danger fade-in" style={{ gap: 6, padding: 12 }} role="alert">
              <b style={{ color: 'var(--danger-ink)', fontSize: 14 }}>Melebihi batas wajar</b>
              {flags.map((f) => <span key={f.id} className="body-sm">{f.level === 'darurat' ? 'Darurat' : 'Waspada'}: {f.label} ({f.limit})</span>)}
              <span className="small">Saat disimpan, pasien dan tim dokter otomatis menerima notifikasi darurat.</span>
            </div>
          ) : null}
          <div className="form-field">
            <span>Diagnosis kunjungan (ICD-10)</span>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {visitDx.map((c) => <span key={c.code} className="chip chip-blue" style={{ fontSize: 12 }}>{c.code} · {c.name}</span>)}
            </div>
          </div>
          <label className="form-field"><span>Tambah diagnosis baru (opsional)</span>
            <select value={newCode} onChange={(e) => setNewCode(e.target.value)}>
              <option value="">Tidak ada</option>
              {CONDITION_CATALOG.filter((c) => !existingCodes.includes(c.code) && !(c.code.startsWith('O') && p.sex !== 'P')).map((c) => (
                <option key={c.code} value={c.code}>{c.code} · {c.name}{c.module && !p.modules.includes(c.module) ? ` (aktifkan modul ${MODULES[c.module].name})` : ''}</option>
              ))}
            </select>
          </label>
          <label className="form-field"><span>Catatan / asesmen</span><textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <label className="form-field"><span>Anjuran untuk pasien</span><textarea value={plan} onChange={(e) => setPlan(e.target.value)} /></label>
          <label className="form-field"><span>Kontrol berikutnya</span><input type="date" value={next} min={addDays(DEMO_TODAY, 1)} onChange={(e) => setNext(e.target.value)} /></label>
        </div>
        <div className="lock-note"><Icon name="cloud" size={16} />Setelah disimpan, data dikirim ke SATUSEHAT dan pasien hanya bisa membacanya.</div>
        <button type="submit" className="btn btn-blue" style={{ minHeight: 54, fontSize: 15 }}>Simpan & kirim ke pasien</button>
      </form>
    </div>
  );
}

export { actorById };
