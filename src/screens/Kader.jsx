import { useState } from 'react';
import { Link } from '../router.jsx';
import { useStore, medStatus, adherence, accessInfo, mergedPatient } from '../store.jsx';
import { Icon, TopBar, Chip, Avatar, MenuIcon, TONES } from '../components/ui.jsx';
import { DEMO_TODAY } from '../data/simrs.js';
import { patients, patientById, MODULES, kader, LAST7 } from '../data/patients.js';
import { upcoming } from '../lib/patientView.js';
import { fmtLong, fmtShort, fmtDayShort } from '../lib/clinical.js';

// Perawat pendamping: PMO, kunjungan rumah, dan pemantauan ringkas. Pemantauan pasien terbuka setelah scan QR.
export function PerawatHome() {
  const { state, toggleMed } = useStore();
  const dimas = patientById('dimas');
  const pmo = medStatus(state, dimas, DEMO_TODAY);
  const witnessed = pmo.every((m) => m.log);
  const visitsToday = state.kaderVisits.filter((v) => v.date === DEMO_TODAY).length;
  const alerts = state.doctorAlerts.filter((a) => !a.handled.perawat);
  const witness = () => pmo.filter((m) => !m.log).forEach((m) => toggleMed(dimas.id, m.id, DEMO_TODAY, 'kader'));
  const lowAdh = patients.filter((p) => adherence(state, p, LAST7) < 90);

  return (
    <div className="screen">
      <div className="role-head kader">
        <div className="between">
          <span className="brand"><span className="brand-mark" style={{ color: '#7A4300' }}><Icon name="users" size={18} stroke={2.2} /></span>Ruang Perawat</span>
          <Link to="/perawat/notifikasi" className="icon-btn" aria-label={`Notifikasi darurat, ${alerts.length}`}>
            <Icon name="bell" />{alerts.length ? <span className="icon-badge">{alerts.length}</span> : null}
          </Link>
        </div>
        <div className="stack-sm">
          <span style={{ fontSize: 13, color: '#F6DDB5' }}>{fmtLong(DEMO_TODAY)}</span>
          <b style={{ fontSize: 20 }}>{kader.name}</b>
          <span style={{ fontSize: 13, color: '#F6DDB5' }}>{kader.role} · {kader.area}</span>
        </div>
        <div className="grid3">
          <div className="stat"><b>{patients.length}</b><span>Pasien binaan</span></div>
          <div className="stat"><b>{witnessed ? 0 : 1}</b><span>PMO belum hari ini</span></div>
          <div className="stat"><b>{visitsToday}</b><span>Kunjungan hari ini</span></div>
        </div>
      </div>

      <div className="content" style={{ paddingTop: 16, gap: 16 }}>
        {alerts.length ? (
          <Link to="/perawat/notifikasi" className="card danger" style={{ flexDirection: 'row', gap: 12, borderWidth: 2, borderColor: 'var(--danger)' }}>
            <span style={{ color: 'var(--danger)', flex: 'none' }}><Icon name="sos" /></span>
            <span className="stack-sm grow"><b style={{ fontSize: 15, color: 'var(--danger-ink)' }}>{alerts.length} notifikasi darurat pasien binaan</b><span className="body-sm" style={{ color: '#4D0F0B' }}>{patientById(alerts[0].patientId).name}: {alerts[0].title}</span></span>
          </Link>
        ) : null}

        <div className="card" style={{ gap: 12, border: witnessed ? '1px solid var(--line)' : '2px solid var(--warn)' }}>
          <span className="between"><span className="eyebrow" style={{ color: '#7A4300' }}>PMO hari ini</span>{witnessed ? <Chip tone="ok">Sudah disaksikan</Chip> : <Chip tone="warn">Belum</Chip>}</span>
          <span className="row" style={{ gap: 12 }}>
            <Avatar initials={dimas.initials} tone="blue" size={42} />
            <span className="stack-sm"><b style={{ fontSize: 15 }}>{dimas.name}</b><span className="small">TBC · fase lanjutan · {pmo.map((m) => m.dose + ' ' + m.name.split(' (')[0]).join(', ')}</span></span>
          </span>
          <button type="button" className="btn" style={{ background: '#7A4300', color: '#fff' }} disabled={witnessed} onClick={witness}>
            <Icon name="check" size={18} stroke={2.4} />{witnessed ? 'Tercatat disaksikan perawat' : 'Saksikan & catat minum obat'}
          </button>
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <span className="h-section">Modul penyakit</span>
          <div className="menu-grid">
            {Object.keys(MODULES).map((m) => <MenuIcon key={m} to={'/perawat/modul/' + m} icon={MODULES[m].icon} label={MODULES[m].long} tone={MODULES[m].tone} badge={patients.filter((p) => mergedPatient(state, p.id).modules.includes(m)).length} />)}
          </div>
        </div>

        {lowAdh.length ? (
          <div className="card warn-soft" style={{ gap: 8 }}>
            <span className="h-card">Perlu kunjungan rumah</span>
            {lowAdh.map((p) => <span key={p.id} className="row body-sm" style={{ gap: 8 }}><Icon name="alert" size={16} /><b>{p.name}</b> · kepatuhan obat {adherence(state, p, LAST7)}% minggu ini</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const CHECKS = ['Obat diminum sesuai jadwal', 'Ada efek samping obat', 'Ada tanda bahaya', 'Edukasi sudah diberikan', 'Keluarga mendampingi'];

export function PerawatPasien({ id }) {
  const { state, addKaderVisit } = useStore();
  const p = mergedPatient(state, id);
  const [checks, setChecks] = useState({ 'Obat diminum sesuai jadwal': true, 'Edukasi sudah diberikan': true });
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (!accessInfo(state, id, 'perawat').ok) {
    return (
      <div className="screen"><TopBar title="Pemantauan pasien" backTo="/perawat" />
        <div className="content"><div className="card"><b>Pemantauan terkunci</b><span className="body-sm">Pindai Kartu QR {p.name} saat kunjungan untuk membuka pemantauan dan mencatat kunjungan.</span><Link to={'/perawat/scan/' + id} className="btn" style={{ background: '#7A4300', color: '#fff' }}><Icon name="scan" size={18} />Scan QR</Link></div></div>
      </div>
    );
  }

  const pct = adherence(state, p, LAST7);
  const visits = state.kaderVisits.filter((v) => v.patientId === p.id);
  const today = medStatus(state, p, DEMO_TODAY);
  const submit = (e) => {
    e.preventDefault();
    addKaderVisit({ patientId: p.id, module: p.modules[0], items: CHECKS.filter((c) => checks[c]), note });
    setSaved(true);
    setNote('');
  };

  return (
    <div className="screen">
      <TopBar title="Pemantauan pasien" backTo="/perawat" />
      <div className="content">
        <div className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={48} />
          <span className="stack-sm"><b style={{ fontSize: 17 }}>{p.name}</b>
            <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{p.modules.map((m) => <span key={m} className="chip" style={{ background: TONES[MODULES[m].tone].bg, color: TONES[MODULES[m].tone].fg }}>{MODULES[m].name}</span>)}</span>
          </span>
        </div>
        <div className="lock-note"><Icon name="lock" size={16} />Perawat melihat ringkasan pemantauan, bukan rekam medis lengkap.</div>

        <div className="card">
          <span className="between"><span className="h-card">Minum obat</span><b style={{ color: pct >= 90 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{pct}% (7 hari)</b></span>
          {today.map((m) => <div key={m.id} className="between body-sm"><span>{m.name}</span>{m.log ? <Chip tone="ok">Hari ini diminum</Chip> : <Chip tone="warn">Belum hari ini</Chip>}</div>)}
        </div>

        <div className="card">
          <span className="h-card">Jadwal berikutnya</span>
          {upcoming(patientById(id)).map((a) => <div key={a.id} className="between body-sm"><span>{a.title}</span><b>{fmtShort(a.date)}</b></div>)}
        </div>

        <form className="card warn-soft" style={{ gap: 12 }} onSubmit={submit}>
          <span className="h-section">Catat kunjungan rumah</span>
          {CHECKS.map((c) => (
            <label key={c} className="check"><input type="checkbox" checked={!!checks[c]} onChange={() => setChecks({ ...checks, [c]: !checks[c] })} />{c}</label>
          ))}
          <label className="form-field"><span>Catatan</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: pasien semangat, minta diingatkan ambil obat 19 Okt." /></label>
          <button type="submit" className="btn" style={{ background: '#7A4300', color: '#fff' }}>Simpan kunjungan</button>
          {saved ? <span className="body-sm fade-in" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--ok-bg)', color: '#0F4A2E' }}>Tersimpan. Pasien dan dokter dapat melihat catatan ini.</span> : null}
        </form>

        {visits.length ? (
          <div className="card">
            <span className="h-card">Riwayat kunjungan perawat</span>
            {visits.map((v) => <span key={v.id} className="body-sm"><b>{fmtDayShort(v.date)} · {v.time}</b><br />{v.items.join(' · ')}{v.note ? ` — ${v.note}` : ''}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
