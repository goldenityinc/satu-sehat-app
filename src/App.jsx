import { useEffect } from 'react';
import { RouterProvider, useRoute, navigate, Link } from './router.jsx';
import { StoreProvider, useStore, detectShownQr } from './store.jsx';
import { BottomNav, Icon } from './components/ui.jsx';
import { KiaHub, Kehamilan, Kunjungan } from './screens/Ibu.jsx';
import { Anak, KartuImunisasi, DetailVaksin, TumbuhKembang } from './screens/Anak.jsx';
import { Edukasi, Artikel } from './screens/Edukasi.jsx';
import { Home, Notifikasi, Kartu, Obat, Riwayat, RiwayatDetail, Faskes, Darurat, Jadwal, Akun } from './screens/Pasien.jsx';
import { Tbc, Jantung, Stroke, ModulBaru } from './screens/Modul.jsx';
import { RekamMedis, DokterPribadi } from './screens/RekamMedis.jsx';
import { DokterHome, DokterModul, DokterSesi, Scanner, DokterPasien, DokterInput, AlertsPage } from './screens/Dokter.jsx';
import { PerawatHome, PerawatPasien } from './screens/Kader.jsx';
import { patients, patientById, doctors, facilities, MODULES } from './data/patients.js';

function PatientScreen({ a, b }) {
  const { patient } = useStore();
  const kiaOnly = ['kia', 'kehamilan', 'kunjungan', 'anak', 'imunisasi', 'tumbuh'];
  if (kiaOnly.includes(a) && !patient.modules.includes('kia')) return <Home />;
  if (a === 'modul' && !patient.modules.includes(b)) return <Home />;
  switch (a) {
    case undefined: return <Home />;
    case 'notifikasi': case 'inbox': return <Notifikasi />;
    case 'kartu': return <Kartu />;
    case 'obat': return <Obat />;
    case 'riwayat': return b ? <RiwayatDetail key={b} id={b} /> : <Riwayat />;
    case 'jadwal': return <Jadwal />;
    case 'faskes': return <Faskes />;
    case 'darurat': return <Darurat />;
    case 'kia': return <KiaHub />;
    case 'kehamilan': return <Kehamilan />;
    case 'kunjungan': return <Kunjungan key={b} id={b ?? 'k3'} />;
    case 'anak': return <Anak />;
    case 'imunisasi': return b ? <DetailVaksin key={b} id={b} /> : <KartuImunisasi />;
    case 'tumbuh': return <TumbuhKembang />;
    case 'edukasi': return <Edukasi />;
    case 'artikel': return <Artikel key={b} id={b} />;
    case 'rekam-medis': return <RekamMedis />;
    case 'dokter-pribadi': return <DokterPribadi />;
    case 'modul': {
      const own = { slamet: ['jantung', 'stroke'], dimas: ['tbc'] }[patient.id] || [];
      if (!own.includes(b)) return <ModulBaru key={b} module={b} />;
      return b === 'tbc' ? <Tbc /> : b === 'jantung' ? <Jantung /> : <Stroke />;
    }
    default: return <Home />;
  }
}

// Rute dokter (/dokter/...) dan perawat (/perawat/...) memakai pola yang sama.
function StaffScreen({ base, b, c, d }) {
  const { state } = useStore();
  const isDoctor = base === '/dokter';
  if (b === 'scan') return <Scanner key={c ?? 'any'} base={base} expect={c} />;
  if (b === 'modul' && c) return <DokterModul key={c} module={c} base={base} />;
  if (b === 'notifikasi') return <AlertsPage actorId={isDoctor ? state.doctorId : 'perawat'} backTo={base} />;
  if (b === 'pasien' && c) {
    if (!isDoctor) return <PerawatPasien key={c} id={c} />;
    return d === 'input' ? <DokterInput key={c} id={c} /> : <DokterPasien key={c} id={c} />;
  }
  if (b === 'pasien') return <DokterSesi base={base} />;
  return isDoctor ? <DokterHome /> : <PerawatHome />;
}

function Screen() {
  const { parts } = useRoute();
  const { state } = useStore();
  const [a, b, c, d] = parts;
  if (a === 'akun') return <Akun />;
  if (state.role === 'dokter') return <StaffScreen base="/dokter" b={a === 'dokter' ? b : undefined} c={c} d={d} />;
  if (state.role === 'kader') return <StaffScreen base="/perawat" b={a === 'perawat' ? b : undefined} c={c} d={d} />;
  return <PatientScreen a={a} b={b} />;
}

function Toast() {
  const { toast, setToast } = useStore();
  if (!toast) return null;
  return (
    <button type="button" className="toast" onClick={() => { setToast(null); navigate(toast.route); }}>
      <span className="ico"><Icon name="hospital" size={20} /></span>
      <span className="stack-sm grow">
        <b style={{ fontSize: 14 }}>{toast.title}</b>
        <span style={{ fontSize: 12, color: '#C9D3D0' }}>{toast.text}</span>
      </span>
    </button>
  );
}

// Panel di samping ponsel untuk presenter. Tidak tampil di layar HP (di HP pakai menu Akun).
function DemoPanel() {
  const { state, update, syncing, sendK3, reset, newCount, simulateIgd, showQr, scanQr } = useStore();
  const go = (patch, path) => { update(patch); navigate(path); };
  const shown = detectShownQr(state);
  const staff = state.role !== 'pasien';

  return (
    <aside className="demo-panel" aria-label="Panel demo">
      <div className="stack-sm">
        <span className="eyebrow" style={{ color: 'var(--teal)' }}>Panel demo</span>
        <h2>Masuk sebagai</h2>
      </div>
      <div className="seg dark" role="group" aria-label="Pilih peran" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <button type="button" aria-pressed={state.role === 'pasien'} onClick={() => go({ role: 'pasien' }, '/')}>Pasien</button>
        <button type="button" aria-pressed={state.role === 'dokter'} onClick={() => go({ role: 'dokter' }, '/dokter')}>Dokter</button>
        <button type="button" aria-pressed={state.role === 'kader'} onClick={() => go({ role: 'kader' }, '/perawat')}>Perawat</button>
      </div>

      {state.role === 'pasien' ? (
        <div className="stack">
          {patients.map((p) => (
            <button key={p.id} type="button" className={'demo-pick' + (state.patientId === p.id ? ' on' : '')} onClick={() => go({ patientId: p.id }, '/')}>
              <b>{p.name}</b><span>{p.modules.map((m) => MODULES[m].long).join(' + ')}</span>
            </button>
          ))}
          {newCount ? <span className="small" style={{ fontWeight: 700, color: '#C2410C' }}>{newCount} notifikasi baru untuk pasien ini</span> : null}
        </div>
      ) : null}

      {state.role === 'dokter' ? (
        <div className="stack">
          <label className="form-field"><span>Akun dokter</span>
            <select value={state.doctorId} onChange={(e) => update({ doctorId: e.target.value })}>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </label>
          <label className="form-field"><span>Tempat praktik</span>
            <select value={state.facilityId} onChange={(e) => update({ facilityId: e.target.value })}>{facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
          </label>
        </div>
      ) : null}

      {staff ? (
        <div className="stack">
          <span className="small" style={{ fontWeight: 700 }}>Simulasi pasien menunjukkan HP</span>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {patients.map((p) => (
              <button key={p.id} type="button" className="med-btn" aria-pressed={shown?.patientId === p.id} onClick={() => showQr(p.id)}>QR {p.short}</button>
            ))}
          </div>
          <span className="small" style={{ lineHeight: 1.45 }}>
            {shown ? `QR ${patientById(shown.patientId).name} sedang ditampilkan. Buka Scan QR: kamera mendeteksinya otomatis.` : 'Tidak ada QR yang ditampilkan. Tekan salah satu tombol di atas, lalu buka Scan QR.'}
          </span>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 40, fontSize: 13 }} onClick={() => { const r = scanQr(shown?.patientId ?? 'slamet', 'SCREENSHOT-LAMA'); window.alert(r === 'rejected' ? 'QR lama (tangkapan layar) ditolak. Pasien menerima notifikasi keamanan.' : 'Diterima'); }}>
            Coba scan QR lama (tangkapan layar)
          </button>
        </div>
      ) : null}

      <div className="divider" />
      <div className="stack">
        <span className="small" style={{ fontWeight: 700 }}>Skenario notifikasi darurat</span>
        <button type="button" className="btn btn-secondary" onClick={() => simulateIgd('slamet')}><Icon name="sos" size={18} />Pak Slamet di IGD mitra: TD 186/104</button>
        <span className="small" style={{ lineHeight: 1.45 }}>Melewati batas krisis hipertensi → notifikasi darurat ke Pak Slamet, dokter pribadi, dan tim dokter Jantung. Atau isi nilai di luar batas saat dokter input pemeriksaan.</span>
      </div>
      <div className="stack">
        <span className="small" style={{ fontWeight: 700 }}>Skenario KIA (tanpa dokter)</span>
        <button type="button" className="btn btn-secondary" disabled={state.synced || syncing} onClick={sendK3}>
          {syncing ? <Icon name="refresh" size={18} className="spin" /> : <Icon name="hospital" size={18} />}
          {state.synced ? 'Hasil K3 sudah terkirim' : 'Bidan simpan hasil K3 di SIMRS'}
        </button>
      </div>
      <button type="button" className="btn btn-secondary" onClick={() => { reset(); navigate('/'); }}>Reset demo ke awal</button>
      <span className="small" style={{ lineHeight: 1.5 }}>Semua nama dan angka adalah data contoh. Tanggal demo dikunci ke Kamis, 8 Oktober 2026. <Link to="/akun">Menu Akun</Link> berisi pengaturan yang sama untuk layar HP.</span>
    </aside>
  );
}

function ScrollTop() {
  const { path } = useRoute();
  useEffect(() => { document.querySelector('.screen')?.scrollTo({ top: 0 }); }, [path]);
  return null;
}

export default function App() {
  return (
    <RouterProvider>
      <StoreProvider>
        <ScrollTop />
        <div className="shell">
          <div className="phone">
            <Toast />
            <Screen />
            <BottomNav />
          </div>
          <DemoPanel />
        </div>
      </StoreProvider>
    </RouterProvider>
  );
}
