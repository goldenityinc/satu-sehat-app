import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Link, navigate } from '../router.jsx';
import { useStore, medStatus, adherence, QR_TTL_MS, nowTime, actorById } from '../store.jsx';
import { Icon, TopBar, Chip, MenuIcon, Avatar, Progress, TONES } from '../components/ui.jsx';
import { DEMO_TODAY, child } from '../data/simrs.js';
import { MODULES, facilities, facilityName, patients, doctors, doctorById, kader, LAST7, CRITICAL_MODULES } from '../data/patients.js';
import { upcoming, alertsFor, timelineFor, moduleStatus } from '../lib/patientView.js';
import { fmtLong, fmtShort, fmtDayShort, fmtWeekdayAbbr, fmtMonthAbbr, dayOfMonth, ageInMonthsDays, daysBetween, relativeDays } from '../lib/clinical.js';

const TIMES = [['pagi', 'Pagi'], ['siang', 'Siang'], ['malam', 'Malam']];
const ageYears = (dob) => Math.floor(ageInMonthsDays(dob, DEMO_TODAY).months / 12);

function SatuSehat() {
  return <span className="ss-badge"><Icon name="cloud" size={13} stroke={2} />SATUSEHAT</span>;
}

/* ======================= Beranda ======================= */
export function Home() {
  const { state, patient: p, newCount, kiaNew } = useStore();
  const meds = medStatus(state, p, DEMO_TODAY);
  const taken = meds.filter((m) => m.log).length;
  const alerts = alertsFor(state, p);
  const agenda = upcoming(p).slice(0, 2);
  const hour = 'pagi';
  const pd = state.personalDoctors[p.id] || {};
  const missingPd = p.modules.filter((m) => CRITICAL_MODULES.includes(m) && !pd[m]);
  const emergency = state.notifications.find((n) => n.patientId === p.id && n.kind === 'emergency' && n.date === DEMO_TODAY);

  return (
    <div className="screen">
      <div className="home-head">
        <div className="between">
          <span className="brand"><span className="brand-mark"><Icon name="heartPulse" size={18} stroke={2.2} /></span>JIH Sehat</span>
          <span className="row" style={{ gap: 8 }}>
            <Link to="/notifikasi" className="icon-btn" aria-label={`Notifikasi, ${newCount} baru`}>
              <Icon name="bell" stroke={1.8} />
              {newCount ? <span className="icon-badge">{newCount}</span> : null}
            </Link>
            <Link to="/akun" className="icon-btn" aria-label="Akun"><Icon name="user" stroke={1.8} /></Link>
          </span>
        </div>
        <div className="stack-sm">
          <span style={{ fontSize: 13, color: '#CDE8E1' }}>{fmtLong(DEMO_TODAY)}</span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>Selamat {hour}, {p.greet}</span>
        </div>
      </div>

      <Link to="/kartu" className="member-card">
        <div className="between">
          <span className="row" style={{ gap: 12 }}>
            <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={44} />
            <span className="stack-sm">
              <b style={{ fontSize: 16 }}>{p.name}</b>
              <span className="small">ID Sehat {p.healthId}</span>
            </span>
          </span>
          <span className="icon-btn" style={{ background: 'var(--teal-tint)', borderColor: 'var(--teal-tint)', color: 'var(--teal)' }}><Icon name="qr" /></span>
        </div>
        <div className="between">
          <span className="small">Faskes utama: <b style={{ color: 'var(--ink)' }}>{facilityName(p.homeFacility)}</b></span>
          <SatuSehat />
        </div>
      </Link>

      <div className="content" style={{ paddingTop: 16, gap: 18 }}>
        {emergency ? (
          <Link to="/notifikasi" className="card danger fade-in" style={{ flexDirection: 'row', gap: 12, borderWidth: 2, borderColor: 'var(--danger)' }} role="alert">
            <span style={{ color: 'var(--danger)', flex: 'none' }}><Icon name="sos" /></span>
            <span className="stack-sm grow">
              <b style={{ fontSize: 15, color: 'var(--danger-ink)' }}>{emergency.title}</b>
              <span style={{ fontSize: 13, lineHeight: 1.45 }}>{emergency.detail}</span>
            </span>
            <Icon name="chevron" size={18} style={{ alignSelf: 'center' }} />
          </Link>
        ) : null}

        <div className="stack" style={{ gap: 10 }}>
          <span className="between"><span className="h-section">Modul penyakit saya</span><span className="small">{p.modules.length} modul aktif</span></span>
          {p.modules.map((id) => {
            const m = MODULES[id];
            const t = TONES[m.tone];
            const st = moduleStatus(state, p, id);
            return (
              <Link key={id} to={m.route} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <span className="menu-ico" style={{ width: 48, height: 48, borderRadius: 16, background: t.bg, color: t.fg }}>
                  <Icon name={m.icon} size={24} />
                  {id === 'kia' && kiaNew ? <span className="menu-badge">{kiaNew}</span> : null}
                </span>
                <span className="stack-sm grow">
                  <span className="between"><b style={{ fontSize: 15 }}>{m.long}</b>{st.flag ? <Chip tone={st.flag === 'Darurat' ? 'danger' : 'warn'}>{st.flag}</Chip> : null}</span>
                  <span className="small" style={{ color: 'var(--ink-2)' }}>{st.line}</span>
                  <span className="small">Dokter pribadi: {pd[id] ? doctorById(pd[id]).short : CRITICAL_MODULES.includes(id) ? <b style={{ color: 'var(--danger)' }}>belum dipilih</b> : '—'}</span>
                </span>
                <Icon name="chevron" size={18} style={{ color: '#A9B5B1' }} />
              </Link>
            );
          })}
          {p.id === 'rina' ? (
            <Link to="/anak" className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <span className="menu-ico" style={{ width: 48, height: 48, borderRadius: 16, background: TONES.blue.bg, color: TONES.blue.fg }}><Icon name="child" size={24} /></span>
              <span className="stack-sm grow"><b style={{ fontSize: 15 }}>Anak: {child.name}</b><span className="small" style={{ color: 'var(--ink-2)' }}>Imunisasi 18 bulan jatuh tempo 12 Okt</span></span>
              <Icon name="chevron" size={18} style={{ color: '#A9B5B1' }} />
            </Link>
          ) : null}
          <span className="small" style={{ lineHeight: 1.45 }}>{p.modules.length > 1 ? 'Anda ditangani di beberapa modul sekaligus (komplikasi). Setiap dokter melihat data modul lain saat memindai QR Anda.' : 'Modul baru diaktifkan dokter saat ada diagnosis baru dan akan muncul di sini.'}</span>
        </div>

        {missingPd.length ? (
          <Link to="/dokter-pribadi" className="card danger" style={{ flexDirection: 'row', gap: 12, borderWidth: 2 }}>
            <span style={{ color: 'var(--danger)', flex: 'none' }}><Icon name="stethoscope" /></span>
            <span className="stack-sm grow">
              <b style={{ fontSize: 15, color: 'var(--danger-ink)' }}>Wajib: pilih dokter pribadi</b>
              <span style={{ fontSize: 13, lineHeight: 1.45 }}>Untuk {missingPd.map((m) => MODULES[m].name).join(' dan ')}. Dokter pribadi langsung diberi tahu bila Anda dalam keadaan darurat atau masuk IGD.</span>
            </span>
            <Icon name="chevron" size={18} style={{ alignSelf: 'center' }} />
          </Link>
        ) : null}
        <Link to="/obat" className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <span className="menu-ico" style={{ width: 44, height: 44, borderRadius: 14, background: TONES.teal.bg, color: TONES.teal.fg }}><Icon name="pill" /></span>
          <span className="stack-sm grow">
            <b style={{ fontSize: 14 }}>Obat hari ini: {taken} dari {meds.length} diminum</b>
            <Progress value={(taken / meds.length) * 100} />
          </span>
          <Icon name="chevron" size={18} style={{ color: '#A9B5B1' }} />
        </Link>

        <div className="stack" style={{ gap: 12 }}>
          <span className="h-section">Menu</span>
          <div className="menu-grid">
            <MenuIcon to="/kartu" icon="qr" label="Kartu QR" tone="teal" />
            <MenuIcon to="/obat" icon="pill" label="Obat Saya" tone="teal" />
            <MenuIcon to="/rekam-medis" icon="clipboard" label="Rekam Medis" tone="blue" />
            <MenuIcon to="/dokter-pribadi" icon="stethoscope" label="Dokter Pribadi" tone="blue" badge={missingPd.length ? '!' : null} />
            <MenuIcon to="/jadwal" icon="calendar" label="Jadwal Kontrol" tone="slate" />
            <MenuIcon to="/faskes" icon="map" label="Faskes Mitra" tone="slate" />
            <MenuIcon to="/edukasi" icon="book" label="Edukasi" tone="amber" />
            <MenuIcon to="/darurat" icon="sos" label="Darurat" tone="red" />
          </div>
        </div>

        {alerts.length ? (
          <div className="stack">
            <span className="h-section">Perlu perhatian</span>
            {alerts.map((a) => (
              <Link key={a.title} to={a.route} className="card warn" style={{ flexDirection: 'row', gap: 12 }}>
                <span style={{ color: 'var(--warn-ink)', flex: 'none' }}><Icon name="alert" /></span>
                <span className="stack-sm"><b style={{ fontSize: 14 }}>{a.title}</b><span style={{ fontSize: 13, lineHeight: 1.45 }}>{a.text}</span></span>
              </Link>
            ))}
          </div>
        ) : null}

        {agenda.length ? (
          <div className="card">
            <span className="between"><span className="h-card">Jadwal berikutnya</span><Link to="/jadwal" style={{ fontSize: 13, fontWeight: 700 }}>Semua</Link></span>
            {agenda.map((a, i) => (
              <div key={a.id} className="stack">
                {i > 0 ? <div className="divider" /> : null}
                <AgendaRow a={a} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AgendaRow({ a }) {
  const t = TONES[a.tone] ?? TONES.blue;
  return (
    <Link to={a.route} className="row" style={{ color: 'var(--ink)', gap: 12 }}>
      <span className="date-badge" style={{ background: t.bg, color: t.fg }}><span>{fmtWeekdayAbbr(a.date)}</span><b>{dayOfMonth(a.date)}</b><span>{fmtMonthAbbr(a.date)}</span></span>
      <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{a.title}</b><span className="small">{a.detail}</span></span>
      <span className="small" style={{ fontWeight: 700 }}>{relativeDays(daysBetween(DEMO_TODAY, a.date))}</span>
    </Link>
  );
}

/* ======================= Jadwal ======================= */
export function Jadwal() {
  const { patient: p } = useStore();
  const list = upcoming(p);
  return (
    <div className="screen">
      <TopBar title="Jadwal Kontrol" backTo="/" />
      <div className="content">
        <div className="card">{list.map((a, i) => <div key={a.id} className="stack">{i > 0 ? <div className="divider" /> : null}<AgendaRow a={a} /></div>)}</div>
        <span className="small" style={{ lineHeight: 1.5 }}>Jadwal dibuat oleh dokter atau faskes. Pengingat dikirim H-1 melalui notifikasi.</span>
      </div>
    </div>
  );
}

/* ======================= Notifikasi ======================= */
export function Notifikasi() {
  const { myNotifs, inbox, kiaNew, update, state } = useStore();
  const [tab, setTab] = useState('all');
  const [firstSeen] = useState(() => ({ ...state.seenNotif }));
  const [kiaWasNew] = useState(kiaNew > 0);
  // Tandai semua terbaca sekali saat layar dibuka; label "Baru" tetap tampil selama layar ini terbuka.
  useEffect(() => {
    update((s) => ({
      inboxSeen: true,
      seenNotif: { ...s.seenNotif, ...Object.fromEntries(s.notifications.filter((n) => n.patientId === s.patientId).map((n) => [n.id, true])) }
    }));
  }, [update]);

  const items = [
    ...myNotifs.map((n) => (n.kind === 'emergency' ? { ...n, isNew: !firstSeen[n.id], source: null } : { ...n, isNew: !firstSeen[n.id], source: n.detail, detail: null })),
    ...inbox.map((i) => ({ ...i, isNew: kiaWasNew && i.batch === 'k3', kind: 'kia' }))
  ].filter((it) => tab === 'all' || it.kind === 'emergency' || it.kind === 'security');
  const emergencyCount = myNotifs.filter((n) => n.kind === 'emergency').length;

  return (
    <div className="screen">
      <TopBar title="Notifikasi" backTo="/" />
      <div className="content">
        <div className="card teal-tint" style={{ flexDirection: 'row', gap: 12 }}>
          <span style={{ color: 'var(--teal)', flex: 'none' }}><Icon name="shield" /></span>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Catatan dikirim langsung dari rekam medis faskes setiap kali Anda diperiksa. Anda tidak perlu mencatat ulang.</span>
        </div>
        <div className="filter" role="group" aria-label="Saring notifikasi">
          <button type="button" aria-pressed={tab === 'all'} onClick={() => setTab('all')}>Semua</button>
          <button type="button" aria-pressed={tab === 'darurat'} onClick={() => setTab('darurat')}>Darurat{emergencyCount ? ` (${emergencyCount})` : ''}</button>
        </div>
        {items.length === 0 ? <div className="card"><span className="body">{tab === 'darurat' ? 'Tidak ada notifikasi darurat. Notifikasi muncul otomatis bila hasil pemeriksaan Anda melewati batas wajar.' : 'Belum ada notifikasi.'}</span></div> : null}
        {items.map((it) => (
          <Link key={it.id} to={it.route} className={'card fade-in' + (it.kind === 'emergency' ? (it.level === 'waspada' ? ' warn' : ' danger') : '')} style={{ flexDirection: 'row', gap: 12 }}>
            <span className="avatar" style={{ width: 40, height: 40, background: it.kind === 'emergency' ? '#fff' : it.kind === 'access' ? '#E6F0FB' : it.kind === 'kader' ? '#FFF1D6' : 'var(--teal-tint)', color: it.kind === 'emergency' ? '#B3261E' : it.kind === 'access' ? '#1E4F8A' : it.kind === 'kader' ? '#7A4300' : 'var(--teal)' }}>
              <Icon name={it.kind === 'emergency' ? 'sos' : it.kind === 'access' ? 'lock' : it.kind === 'kader' ? 'users' : 'hospital'} size={20} />
            </span>
            <span className="stack-sm grow">
              <span className="between"><span className="small">{fmtDayShort(it.date)} · {it.time}</span>{it.isNew ? <Chip tone="new">Baru</Chip> : null}</span>
              <b style={{ fontSize: 15, lineHeight: 1.3 }}>{it.title}</b>
              {it.detail ? <span className="body-sm">{it.detail}</span> : null}
              {it.source ? <span className="small">{it.source}</span> : null}
              {it.warn ? <span style={{ marginTop: 4 }}><Chip tone="warn">{it.warn}</Chip></span> : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ======================= Kartu QR ======================= */
export function Kartu() {
  const { state, patient: p, issueQr, showQr, revokeAccess } = useStore();
  const q = state.qr[p.id];
  const [now, setNow] = useState(Date.now());
  const [svg, setSvg] = useState('');

  // QR dinamis: token baru setiap 10 menit, langsung diganti setelah dipindai. Membuka layar ini = QR sedang ditampilkan.
  useEffect(() => { showQr(p.id); }, [p.id, showQr]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!q || q.exp <= now) issueQr(p.id); }, [q, now, p.id, issueQr]);
  useEffect(() => {
    if (!q) return;
    QRCode.toString(`JIHSEHAT|v1|${p.healthId}|${q.token}|${q.exp}`, { type: 'svg', margin: 0, color: { dark: '#14201C', light: '#FFFFFF' }, errorCorrectionLevel: 'M' })
      .then(setSvg);
  }, [q?.token, p.healthId]);

  const left = q ? Math.max(0, Math.ceil((q.exp - now) / 1000)) : QR_TTL_MS / 1000;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const sessions = state.access.filter((a) => a.patientId === p.id && a.active && a.date === DEMO_TODAY);
  const pd = state.personalDoctors[p.id] || {};
  const personal = [...new Set(Object.values(pd))];

  return (
    <div className="screen">
      <TopBar title="Kartu Saya" backTo="/" />
      <div className="content" style={{ gap: 16 }}>
        <div className="card" style={{ alignItems: 'stretch', gap: 14, padding: 20 }}>
          <div className="row" style={{ gap: 12 }}>
            <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={48} />
            <span className="stack-sm">
              <b style={{ fontSize: 18 }}>{p.name}</b>
              <span className="small">{p.sex === 'P' ? 'Perempuan' : 'Laki-laki'} · {ageYears(p.dob)} tahun · Gol. darah {p.bloodType}</span>
            </span>
          </div>
          <div className="qr-box" dangerouslySetInnerHTML={{ __html: svg }} aria-label="Kode QR pasien sekali pakai" role="img" />
          <div className="stack-sm" style={{ alignItems: 'center' }}>
            <span className="row" style={{ gap: 8 }}>
              <span className="ss-badge" style={{ background: 'var(--teal-tint)', color: 'var(--teal)' }}>Sesi {q ? q.token.slice(0, 4) + '-' + q.token.slice(4) : '…'}</span>
              <b style={{ fontSize: 14, color: left <= 60 ? 'var(--warn-ink)' : 'var(--ink)' }}>Berganti dalam {mmss}</b>
            </span>
            <span style={{ width: 200 }}><Progress value={(left * 1000 / QR_TTL_MS) * 100} tone={left <= 60 ? 'coral' : 'teal'} /></span>
          </div>
          <span className="body" style={{ textAlign: 'center' }}>Tunjukkan QR ini ke dokter atau petugas di faskes mitra. QR berlaku 10 menit dan sekali pakai, jadi tangkapan layar tidak bisa dipakai orang lain.</span>
          <div className="grid2">
            <div className="stack-sm"><span className="small">ID Sehat</span><b style={{ fontSize: 14 }}>{p.healthId}</b></div>
            <div className="stack-sm"><span className="small">ID SATUSEHAT</span><b style={{ fontSize: 14 }}>{p.satusehatId}</b></div>
            <div className="stack-sm"><span className="small">NIK</span><b style={{ fontSize: 14 }}>{p.nik}</b></div>
            <div className="stack-sm"><span className="small">Alergi</span><b style={{ fontSize: 14 }}>{p.allergies.join(', ')}</b></div>
          </div>
        </div>
        <div className="card" style={{ gap: 10 }}>
          <span className="between"><span className="h-card">Sesi akses aktif</span><span className="small">{sessions.length} sesi</span></span>
          {sessions.length ? sessions.map((a) => (
            <div key={a.id} className="row" style={{ gap: 10, paddingTop: 8, borderTop: '1px solid var(--line-soft)' }}>
              <span className="stack-sm grow">
                <b style={{ fontSize: 14 }}>{actorById(a.doctorId).name}</b>
                <span className="small">{facilityName(a.facilityId)} · mulai {a.time} · s.d. {a.until}</span>
              </span>
              <button type="button" className="med-btn" onClick={() => revokeAccess(a.id)}>Akhiri</button>
            </div>
          )) : <span className="body-sm">Belum ada dokter yang membuka rekam medis Anda hari ini.</span>}
          {personal.length ? (
            <span className="small" style={{ lineHeight: 1.45, paddingTop: 6, borderTop: '1px solid var(--line-soft)' }}>
              Dokter pribadi Anda ({personal.map((d) => doctorById(d).short).join(', ')}) menerima notifikasi darurat Anda. Rekam medis tetap dibuka lewat scan QR. <Link to="/dokter-pribadi" style={{ fontWeight: 700 }}>Atur</Link>
            </span>
          ) : null}
        </div>
        <div className="card teal-tint" style={{ gap: 8 }}>
          <span className="row" style={{ gap: 8 }}><Icon name="lock" size={18} /><b style={{ fontSize: 14 }}>Cara QR melindungi data Anda</b></span>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Setiap QR berisi token sesi yang ditandatangani server, berlaku 10 menit, dan hangus setelah dipindai. Dokter yang memindai mendapat sesi akses 24 jam yang bisa Anda akhiri kapan saja. Upaya memakai QR lama ditolak dan dilaporkan ke Anda.</span>
        </div>
      </div>
    </div>
  );
}

/* ======================= Obat Saya ======================= */
export function Obat() {
  const { state, patient: p, toggleMed } = useStore();
  const meds = medStatus(state, p, DEMO_TODAY);
  const pct = adherence(state, p, LAST7);
  const taken = meds.filter((m) => m.log).length;

  return (
    <div className="screen">
      <TopBar title="Obat Saya" backTo="/" />
      <div className="content">
        <div className="card teal" style={{ gap: 10 }}>
          <span style={{ fontSize: 13, color: '#CDE8E1' }}>{fmtLong(DEMO_TODAY)}</span>
          <b style={{ fontSize: 22 }}>{taken} dari {meds.length} obat sudah diminum</b>
          <span className="progress progress-white"><span style={{ width: (taken / meds.length) * 100 + '%' }} /></span>
        </div>
        <div className="lock-note"><Icon name="lock" size={16} />Hanya catatan minum obat yang bisa Anda ubah. Resep diatur oleh dokter.</div>

        {TIMES.map(([t, label]) => {
          const list = meds.filter((m) => m.time === t);
          if (!list.length) return null;
          return (
            <div key={t} className="card flush">
              <div className="group-head"><b style={{ fontSize: 14 }}>{label}</b><span className="small">{list.filter((m) => m.log).length}/{list.length}</span></div>
              {list.map((m) => (
                <div key={m.id} className="med-row">
                  <span className="menu-ico" style={{ width: 40, height: 40, borderRadius: 12, background: TONES[MODULES[m.module].tone].bg, color: TONES[MODULES[m.module].tone].fg }}><Icon name="pill" size={20} /></span>
                  <span className="stack-sm grow">
                    <b style={{ fontSize: 14, lineHeight: 1.3 }}>{m.name}</b>
                    <span className="small">{m.dose} · {m.note}</span>
                    {m.log?.by === 'kader' ? <span className="small" style={{ color: '#7A4300', fontWeight: 700 }}>Disaksikan perawat (PMO)</span> : null}
                  </span>
                  <button type="button" className="med-btn" aria-pressed={!!m.log} onClick={() => toggleMed(p.id, m.id, DEMO_TODAY, 'pasien')}>
                    {m.log ? <><Icon name="check" size={16} stroke={2.6} />Diminum</> : 'Sudah minum'}
                  </button>
                </div>
              ))}
            </div>
          );
        })}

        <div className="card" style={{ gap: 12 }}>
          <span className="between"><span className="h-card">Kepatuhan 7 hari</span><b style={{ color: pct >= 90 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{pct}%</b></span>
          <div className="adh-grid">
            <span />
            {LAST7.map((d) => <span key={d} className="small" style={{ textAlign: 'center', fontSize: 10 }}>{dayOfMonth(d)}</span>)}
            {p.meds.map((m) => (
              <AdhRow key={m.id} m={m} p={p} state={state} />
            ))}
          </div>
          <div className="row small" style={{ flexWrap: 'wrap', gap: 12, fontSize: 11 }}>
            <span className="row" style={{ gap: 6 }}><span className="adh-cell ok" style={{ width: 14, height: 10 }} />Diminum</span>
            {p.id === 'dimas' ? <span className="row" style={{ gap: 6 }}><span className="adh-cell kader" style={{ width: 14, height: 10 }} />Disaksikan perawat</span> : null}
            <span className="row" style={{ gap: 6 }}><span className="adh-cell miss" style={{ width: 14, height: 10 }} />Terlewat</span>
            <span className="row" style={{ gap: 6 }}><span className="adh-cell wait" style={{ width: 14, height: 10 }} />Hari ini</span>
          </div>
          <span className="small" style={{ lineHeight: 1.45 }}>Catatan ini terlihat oleh dokter Anda{p.id === 'dimas' ? ' dan perawat pendamping (PMO)' : ''} saat kontrol.</span>
        </div>
      </div>
    </div>
  );
}

function AdhRow({ m, p, state }) {
  const short = m.name.split(' (')[0].replace(/ \d.*$/, '');
  return (
    <>
      <span className="small" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink-2)' }} title={m.name}>{short}</span>
      {LAST7.map((d) => {
        const log = state.medLogs[`${p.id}:${m.id}:${d}`];
        const cls = log ? (log.by === 'kader' ? 'kader' : 'ok') : d === DEMO_TODAY ? 'wait' : 'miss';
        return <span key={d} className={'adh-cell ' + cls} />;
      })}
    </>
  );
}

/* ======================= Riwayat ======================= */
export function Riwayat() {
  const { state, patient: p } = useStore();
  const [mod, setMod] = useState('all');
  const items = timelineFor(state, p).filter((e) => mod === 'all' || e.module === mod);
  const access = state.access.filter((a) => a.patientId === p.id);

  return (
    <div className="screen">
      <TopBar title="Riwayat Medis" backTo="/" />
      <div className="content">
        <div className="lock-note"><Icon name="lock" size={16} />Hanya dapat dibaca. Diisi oleh dokter dan faskes, tersinkron dengan SATUSEHAT Kemenkes.</div>
        <div className="filter" role="group" aria-label="Saring modul">
          <button type="button" aria-pressed={mod === 'all'} onClick={() => setMod('all')}>Semua</button>
          {p.modules.map((m) => <button key={m} type="button" aria-pressed={mod === m} onClick={() => setMod(m)}>{MODULES[m].name}</button>)}
        </div>
        {items.map((e) => {
          const m = MODULES[e.module];
          const t = TONES[e.kind === 'kader' ? 'amber' : m?.tone ?? 'teal'];
          const to = e.route ?? (e.dynamic ? '/riwayat/' + e.id : null);
          const body = (
            <>
              <span className="menu-ico" style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, color: t.fg, flex: 'none' }}><Icon name={e.kind === 'kader' ? 'users' : m?.icon ?? 'hospital'} size={20} /></span>
              <span className="stack-sm grow">
                <span className="between"><span className="small">{fmtDayShort(e.date)}{e.time ? ' · ' + e.time : ''}</span>{e.dynamic ? <Chip tone="new">Baru</Chip> : <SatuSehat />}</span>
                <b style={{ fontSize: 15, lineHeight: 1.3 }}>{e.title}</b>
                <span className="body-sm">{e.summary}</span>
                <span className="small">{e.doctor} · {e.unit}, {facilityName(e.facility)}</span>
              </span>
            </>
          );
          return to
            ? <Link key={e.id} to={to} className="card" style={{ flexDirection: 'row', gap: 12 }}>{body}</Link>
            : <div key={e.id} className="card" style={{ flexDirection: 'row', gap: 12 }}>{body}</div>;
        })}

        <div className="card" style={{ gap: 8 }}>
          <span className="row" style={{ gap: 8 }}><Icon name="lock" size={18} /><span className="h-card">Siapa yang membuka rekam medis saya</span></span>
          {access.length ? access.map((a) => (
            <div key={a.id} className="between body-sm">
              <span>{actorById(a.doctorId)?.name}<br /><span className="small">{facilityName(a.facilityId)} · scan QR {fmtShort(a.date)} {a.time}</span></span>
              {a.active ? <Chip tone="ok">Aktif</Chip> : <Chip tone="na">Diakhiri {a.endedAt}</Chip>}
            </div>
          )) : <span className="body-sm">Belum ada akses baru. Akses dokter melalui scan QR akan tercatat di sini.</span>}
          <Link to="/kartu" className="small" style={{ fontWeight: 700 }}>Kelola sesi akses di Kartu QR</Link>
        </div>
      </div>
    </div>
  );
}

export function RiwayatDetail({ id }) {
  const { state, patient: p } = useStore();
  const e = state.encounters.find((x) => x.id === id && x.patientId === p.id);
  if (!e) return <div className="screen"><TopBar title="Riwayat" backTo="/riwayat" /><div className="content"><div className="card">Catatan tidak ditemukan.</div></div></div>;
  return (
    <div className="screen">
      <TopBar title={e.title} backTo="/riwayat" />
      <div className="content">
        <div className="card">
          <div className="between"><span className="source-tag"><Icon name="hospital" size={18} />{facilityName(e.facility)}</span><SatuSehat /></div>
          <div className="grid2" style={{ gap: '10px 12px' }}>
            <div className="stack-sm"><span className="small">Tanggal</span><b style={{ fontSize: 14 }}>{fmtDayShort(e.date)} · {e.time}</b></div>
            <div className="stack-sm"><span className="small">Dokter</span><b style={{ fontSize: 14 }}>{e.doctor}</b></div>
          </div>
        </div>
        <div className="card flush">
          {e.fields.map((f) => <div key={f.label} className="kv"><span>{f.label}</span><span>{f.value}</span></div>)}
        </div>
        <div className="card teal-tint"><b style={{ fontSize: 13, color: 'var(--teal)' }}>Catatan dokter</b><span style={{ fontSize: 15, lineHeight: 1.55 }}>{e.summary}</span></div>
        {e.plan ? <div className="card warn-soft"><span className="h-card">Anjuran</span><span className="body">{e.plan}</span></div> : null}
        {e.nextControl ? <div className="card"><span className="small">Kontrol berikutnya</span><b>{fmtDayShort(e.nextControl)}</b></div> : null}
        <div className="lock-note"><Icon name="lock" size={16} />Hanya dapat dibaca. Untuk koreksi, hubungi dokter yang memeriksa.</div>
      </div>
    </div>
  );
}

/* ======================= Faskes mitra ======================= */
export function Faskes() {
  return (
    <div className="screen">
      <TopBar title="Faskes Mitra" backTo="/" />
      <div className="content">
        <div className="card teal-tint"><span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Bawa aplikasi ini ke dokter mana pun di faskes mitra. Dokter cukup memindai Kartu QR Anda, dan riwayat dari semua faskes langsung terlihat lewat SATUSEHAT.</span></div>
        {facilities.map((f) => (
          <div key={f.id} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <span className="menu-ico" style={{ width: 44, height: 44, borderRadius: 14, background: TONES.slate.bg, color: TONES.slate.fg }}><Icon name="hospital" /></span>
            <span className="stack-sm grow"><b style={{ fontSize: 15 }}>{f.name}</b><span className="small">{f.type} · {f.city}</span></span>
            <SatuSehat />
          </div>
        ))}
        <span className="small" style={{ lineHeight: 1.5 }}>[Daftar faskes mitra dari tim kerja sama RS JIH Solo]</span>
      </div>
    </div>
  );
}

/* ======================= Darurat ======================= */
const DANGER = {
  kia: { title: 'Kehamilan', text: 'Perdarahan, keluar cairan dari jalan lahir, nyeri perut hebat, demam tinggi, sakit kepala berat dengan pandangan kabur, gerak janin berkurang.' },
  jantung: { title: 'Jantung', text: 'Nyeri dada seperti ditekan lebih dari 20 menit, menjalar ke lengan kiri atau rahang, sesak napas berat, berdebar disertai pingsan.' },
  stroke: { title: 'Stroke: SeGeRa ke RS', text: 'Senyum tidak simetris, Gerak separuh tubuh melemah, bicaRa pelo, Kebas separuh tubuh, Rabun mendadak, Sakit kepala hebat.' },
  tbc: { title: 'TBC', text: 'Batuk darah, sesak napas berat, kulit atau mata kuning, ruam kulit luas, muntah terus-menerus setelah minum obat.' },
  diabetes: { title: 'Diabetes', text: 'Gemetar, keringat dingin, dan lemas (gula darah rendah); atau sangat haus, sering kencing, mual, muntah, dan mengantuk berat (gula darah sangat tinggi); luka di kaki yang bernanah atau menghitam.' }
};

const SYMPTOMS = {
  jantung: ['Nyeri dada', 'Sesak napas berat', 'Berdebar dan mau pingsan'],
  stroke: ['Wajah mencong', 'Lemah separuh tubuh', 'Bicara pelo', 'Sakit kepala hebat'],
  kia: ['Perdarahan', 'Keluar cairan', 'Gerak janin berkurang'],
  tbc: ['Batuk darah', 'Sesak berat', 'Mata/kulit kuning'],
  diabetes: ['Gemetar & keringat dingin', 'Sangat lemas/mengantuk', 'Luka kaki memburuk']
};

export function Darurat() {
  const { state, patient: p, raiseAlert } = useStore();
  const pd = state.personalDoctors[p.id] || {};
  const withPd = p.modules.filter((m) => pd[m]);
  const [picked, setPicked] = useState({});
  const [sent, setSent] = useState(null);
  const symptoms = p.modules.flatMap((m) => SYMPTOMS[m]);
  const chosen = symptoms.filter((s) => picked[s]);

  const send = () => {
    const to = raiseAlert(p.id, { kind: 'sos', modules: withPd, title: 'Pasien menekan tombol darurat', detail: chosen.length ? 'Gejala: ' + chosen.join(', ') : 'Tanpa keterangan gejala' });
    setSent({ to, time: nowTime() });
  };

  return (
    <div className="screen">
      <TopBar title="Darurat" backTo="/" />
      <div className="content">
        <div className="card danger" style={{ gap: 12 }}>
          <b style={{ fontSize: 17, color: 'var(--danger-ink)' }}>Kirim tanda darurat ke dokter pribadi</b>
          {withPd.length ? (
            <>
              <span className="body-sm" style={{ color: '#4D0F0B' }}>Diterima langsung oleh {[...new Set(withPd.map((m) => pd[m]))].map((d) => doctorById(d).name).join(' dan ')}, beserta ringkasan rekam medis Anda.</span>
              <span className="small" style={{ fontWeight: 700, color: 'var(--danger-ink)' }}>Apa yang Anda rasakan?</span>
              <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                {symptoms.map((s) => (
                  <button key={s} type="button" className="med-btn" aria-pressed={!!picked[s]} onClick={() => setPicked({ ...picked, [s]: !picked[s] })} style={picked[s] ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : null}>{s}</button>
                ))}
              </div>
              <button type="button" className="btn btn-danger" style={{ minHeight: 56, fontSize: 16 }} onClick={send} disabled={!!sent}><Icon name="sos" />{sent ? 'Tanda darurat terkirim' : 'Kirim tanda darurat'}</button>
              {sent ? <span className="body-sm fade-in" style={{ padding: '10px 12px', borderRadius: 10, background: '#fff', color: 'var(--ink)' }}><b>Terkirim pukul {sent.time}.</b> {sent.to.map((d) => doctorById(d).short).join(' dan ')} sudah menerima peringatan. Tetap telepon IGD bila gejala berat.</span> : null}
            </>
          ) : (
            <>
              <span className="body-sm" style={{ color: '#4D0F0B' }}>Anda belum memilih dokter pribadi, jadi belum ada dokter yang bisa langsung diberi tahu.</span>
              <Link to="/dokter-pribadi" className="btn btn-danger">Pilih dokter pribadi</Link>
            </>
          )}
        </div>
        <button type="button" className="btn btn-secondary" style={{ minHeight: 56, fontSize: 15, borderColor: 'var(--danger)', color: 'var(--danger)' }}><Icon name="phone" />Telepon IGD RS JIH Solo</button>
        <span className="small">Atau hubungi 119 (layanan gawat darurat nasional).</span>
        {p.modules.map((m) => (
          <div key={m} className="card danger">
            <b style={{ fontSize: 16, color: 'var(--danger-ink)' }}>{DANGER[m].title}</b>
            <span className="body" style={{ lineHeight: 1.6 }}>{DANGER[m].text}</span>
          </div>
        ))}
        <span className="small" style={{ lineHeight: 1.5 }}>Jangan menunggu jadwal kontrol bila mengalami tanda di atas.</span>
      </div>
    </div>
  );
}

/* ======================= Akun (termasuk ganti peran untuk demo) ======================= */
export function Akun() {
  const { state, update, patient, doctor, reset } = useStore();
  const setRole = (role) => { update({ role }); navigate(role === 'pasien' ? '/' : role === 'kader' ? '/perawat' : '/dokter'); };
  return (
    <div className="screen">
      <TopBar title="Akun" />
      <div className="content">
        <div className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          {state.role === 'pasien' ? <Avatar initials={patient.initials} size={48} tone={patient.sex === 'P' ? 'coral' : 'blue'} /> : state.role === 'dokter' ? <Avatar initials={doctor.initials} size={48} tone="blue" /> : <Avatar initials={kader.initials} size={48} />}
          <span className="stack-sm">
            <b style={{ fontSize: 16 }}>{state.role === 'pasien' ? patient.name : state.role === 'dokter' ? doctor.name : kader.name}</b>
            <span className="small">{state.role === 'pasien' ? 'Pasien · ' + patient.healthId : state.role === 'dokter' ? doctor.specialty + ' · ' + facilityName(state.facilityId) : kader.role}</span>
          </span>
        </div>

        <div className="card" style={{ gap: 12 }}>
          <span className="eyebrow" style={{ color: 'var(--teal)' }}>Mode demo</span>
          <span className="h-card">Masuk sebagai</span>
          <div className="seg dark" role="group" aria-label="Pilih peran" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <button type="button" aria-pressed={state.role === 'pasien'} onClick={() => setRole('pasien')}>Pasien</button>
            <button type="button" aria-pressed={state.role === 'dokter'} onClick={() => setRole('dokter')}>Dokter</button>
            <button type="button" aria-pressed={state.role === 'kader'} onClick={() => setRole('kader')}>Perawat</button>
          </div>
          {state.role === 'pasien' ? (
            <label className="form-field"><span>Akun pasien</span>
              <select value={state.patientId} onChange={(e) => update({ patientId: e.target.value })}>
                {patients.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.modules.map((m) => MODULES[m].name).join(' + ')}</option>)}
              </select>
            </label>
          ) : null}
          {state.role === 'dokter' ? (
            <>
              <label className="form-field"><span>Akun dokter</span>
                <select value={state.doctorId} onChange={(e) => update({ doctorId: e.target.value })}>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label className="form-field"><span>Tempat praktik hari ini</span>
                <select value={state.facilityId} onChange={(e) => update({ facilityId: e.target.value })}>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
            </>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={() => { reset(); navigate('/'); }}>Reset semua data demo</button>
        </div>
        <span className="small" style={{ lineHeight: 1.5 }}>Di aplikasi sebenarnya, setiap peran masuk dengan akunnya sendiri. Tanggal demo dikunci ke Kamis, 8 Oktober 2026.</span>
      </div>
    </div>
  );
}
