import { Link } from '../router.jsx';
import { useStore, medStatus, adherence } from '../store.jsx';
import { Icon, TopBar, Chip, Progress, TONES } from '../components/ui.jsx';
import MiniChart from '../components/MiniChart.jsx';
import { DEMO_TODAY } from '../data/simrs.js';
import { patientById, facilityName, LAST7, MODULES, doctorById } from '../data/patients.js';
import { daysBetween, addDays, fmtShort, fmtDayShort, relativeDays } from '../lib/clinical.js';

const fmt1 = (n) => String(n).replace('.', ',');

function ReadOnly({ children = 'Data dari dokter dan faskes · hanya dapat dibaca' }) {
  return <div className="lock-note"><Icon name="lock" size={16} />{children}</div>;
}

function Hero({ tone, icon, eyebrow, title, children }) {
  const t = TONES[tone];
  return (
    <div className="card" style={{ background: t.bg, borderColor: t.bg, gap: 12, padding: 18 }}>
      <span className="row" style={{ gap: 10 }}>
        <span className="menu-ico" style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', color: t.fg }}><Icon name={icon} /></span>
        <span className="stack-sm"><span className="eyebrow" style={{ color: t.fg }}>{eyebrow}</span><b style={{ fontSize: 17, lineHeight: 1.3 }}>{title}</b></span>
      </span>
      {children}
    </div>
  );
}

function TodayMeds({ p, module, note }) {
  const { state, toggleMed } = useStore();
  const meds = medStatus(state, p, DEMO_TODAY).filter((m) => m.module === module);
  if (!meds.length) return null;
  return (
    <div className="card flush">
      <div className="group-head"><b style={{ fontSize: 14 }}>Obat hari ini</b><Link to="/obat" className="small" style={{ fontWeight: 700, color: 'var(--teal)' }}>Semua obat</Link></div>
      {meds.map((m) => (
        <div key={m.id} className="med-row">
          <span className="stack-sm grow">
            <b style={{ fontSize: 14, lineHeight: 1.3 }}>{m.name}</b>
            <span className="small">{m.dose} · {m.time} · {m.note}</span>
            {m.log?.by === 'kader' ? <span className="small" style={{ color: '#7A4300', fontWeight: 700 }}>Disaksikan perawat (PMO)</span> : null}
          </span>
          <button type="button" className="med-btn" aria-pressed={!!m.log} onClick={() => toggleMed(p.id, m.id, DEMO_TODAY, 'pasien')}>
            {m.log ? <><Icon name="check" size={16} stroke={2.6} />Diminum</> : 'Sudah minum'}
          </button>
        </div>
      ))}
      {note ? <div style={{ padding: '10px 16px 14px' }} className="small">{note}</div> : null}
    </div>
  );
}

function Danger({ title, text }) {
  return (
    <div className="card danger">
      <b style={{ fontSize: 16, color: 'var(--danger-ink)' }}>{title}</b>
      <span className="body" style={{ lineHeight: 1.6 }}>{text}</span>
      <Link to="/darurat" className="btn btn-danger"><Icon name="phone" size={18} />Darurat</Link>
    </div>
  );
}

function CareTeam({ p, module }) {
  const { state } = useStore();
  const chosen = (state.personalDoctors[p.id] || {})[module];
  const critical = module === 'jantung' || module === 'stroke';
  return (
    <div className="card" style={{ gap: 8 }}>
      <span className="between"><span className="h-card">Tim dokter</span><Link to="/dokter-pribadi" style={{ fontSize: 13, fontWeight: 700 }}>{chosen ? 'Ubah' : 'Pilih dokter pribadi'}</Link></span>
      {(p.careTeam[module] || []).map((id) => {
        const d = doctorById(id);
        return (
          <div key={id} className="between body-sm">
            <span><b>{d.name}</b><br /><span className="small">{d.specialty} · {facilityName(d.facility ?? 'jih')}</span></span>
            {chosen === id ? <span className="chip chip-new">Dokter pribadi</span> : null}
          </div>
        );
      })}
      {!chosen && critical ? <Chip tone="warn">Wajib pilih dokter pribadi untuk {MODULES[module].name}</Chip> : null}
    </div>
  );
}

const fromDoctor = (state, pid, module) => state.encounters.filter((e) => e.patientId === pid && e.module === module).slice().reverse();

/* ======================= TBC ======================= */
export function Tbc() {
  const { state } = useStore();
  const p = patientById('dimas');
  const t = p.tbc;
  const day = daysBetween(t.start, DEMO_TODAY) + 1;
  const end = addDays(t.start, t.totalDays - 1);
  const intensive = day <= t.intensiveDays;
  const pct = adherence(state, p, LAST7);
  const extra = fromDoctor(state, p.id, 'tbc');
  const weights = [...t.weights, ...extra.filter((e) => e.weight).map((e) => ({ date: e.date, value: e.weight }))].map((w) => ({ ...w, label: fmt1(w.value) }));

  return (
    <div className="screen">
      <TopBar title="Pengobatan TBC" backTo="/" />
      <div className="content">
        <Hero tone="amber" icon="lungs" eyebrow={intensive ? 'Fase intensif' : 'Fase lanjutan'} title={p.conditions[0].name}>
          <span className="between"><b style={{ fontSize: 30, letterSpacing: -0.5 }}>Hari ke-{day}</b><span className="body-sm" style={{ textAlign: 'right' }}>dari {t.totalDays} hari<br />selesai {fmtShort(end)}</span></span>
          <Progress value={(day / t.totalDays) * 100} tone="coral" />
          <span className="between small" style={{ fontSize: 11, fontWeight: 600 }}><span>Intensif · 2 bulan</span><span>Lanjutan · 4 bulan</span></span>
        </Hero>

        <CareTeam p={p} module="tbc" />
        <TodayMeds p={p} module="tbc" note={`Pengawas minum obat (PMO): ${t.pmo}. Perawat dapat mencatat obat yang diminum di depannya.`} />

        <Link to="/obat" className={'card ' + (pct >= 90 ? 'teal-tint' : 'warn')} style={{ flexDirection: 'row', gap: 12 }}>
          <span style={{ flex: 'none' }}><Icon name={pct >= 90 ? 'check' : 'alert'} /></span>
          <span className="stack-sm">
            <b style={{ fontSize: 15 }}>Kepatuhan 7 hari: {pct}%</b>
            <span style={{ fontSize: 13, lineHeight: 1.45 }}>Obat TBC harus diminum setiap hari sampai tuntas. Putus obat bisa membuat kuman kebal (TBC resisten obat).</span>
          </span>
        </Link>

        <ReadOnly />
        <div className="card">
          <span className="h-card">Hasil pemeriksaan dahak</span>
          {t.sputum.map((s, i) => (
            <div key={s.date} className="timeline-item">
              <span className="tl-rail"><span className={'tl-dot ' + (s.planned ? 'plan' : s.ok ? 'done' : 'wait')}>{s.planned ? '' : s.ok ? <Icon name="check" size={16} stroke={2.6} /> : '!'}</span>{i < t.sputum.length - 1 ? <span className="tl-line" /> : null}</span>
              <span className="tl-body">
                <b style={{ fontSize: 14 }}>{s.test}</b>
                <span className="body-sm">{s.result}</span>
                <span className="small">{fmtDayShort(s.date)}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <span className="between"><span className="h-card">Berat badan</span><Chip tone="ok">Naik {fmt1(weights[weights.length - 1].value - weights[0].value)} kg</Chip></span>
          <MiniChart series={weights} min={46} max={56} unit="kg" label="Grafik berat badan selama pengobatan TBC" />
          <span className="body-sm">Berat badan yang naik adalah tanda pengobatan berjalan baik.</span>
        </div>

        <div className="card">
          <span className="h-card">Panduan obat</span>
          <div className="kv" style={{ padding: '6px 0' }}><span>Fase intensif (2 bln)</span><span>{t.regimen.intensive}</span></div>
          <div className="kv" style={{ padding: '6px 0' }}><span>Fase lanjutan (4 bln)</span><span>{t.regimen.continuation}</span></div>
          <div className="kv" style={{ padding: '6px 0' }}><span>Ambil obat berikutnya</span><span>{fmtShort(t.nextPickup.date)} · {facilityName(t.nextPickup.facility)}</span></div>
        </div>

        <div className="card">
          <span className="h-card">Skrining & kontak serumah</span>
          {t.screening.map((s) => <div key={s.label} className="between body"><span>{s.label}</span><b>{s.value}</b></div>)}
          <div className="between body"><span>Kontak serumah diperiksa</span><b>{t.contacts.screened}/{t.contacts.total} orang</b></div>
          <span className="body-sm">{t.contacts.note}.</span>
        </div>

        <div className="card warn-soft">
          <span className="h-card">Wajar selama pengobatan</span>
          <span className="body">Urine, keringat, atau air mata berwarna merah oranye karena rifampisin. Mual ringan: minum obat menjelang tidur atau konsultasikan ke dokter.</span>
        </div>
        <Danger title="Segera ke faskes bila" text="Batuk darah, sesak napas berat, kulit atau mata kuning, ruam kulit luas, muntah terus-menerus setelah minum obat." />
      </div>
    </div>
  );
}

/* ======================= Jantung ======================= */
export function Jantung() {
  const { state } = useStore();
  const p = patientById('slamet');
  const j = p.jantung;
  const extra = [...fromDoctor(state, p.id, 'jantung'), ...fromDoctor(state, p.id, 'stroke')].filter((e) => e.sys).sort((a, b) => a.date.localeCompare(b.date));
  const bp = [...j.bp, ...extra.map((e) => ({ date: e.date, sys: e.sys, dia: e.dia }))].map((b) => ({ date: b.date, value: b.sys, dia: b.dia, label: `${b.sys}/${b.dia}` }));
  const ldlExtra = fromDoctor(state, p.id, 'jantung').filter((e) => e.ldl).map((e) => ({ date: e.date, value: e.ldl }));
  const ldl = [...j.ldl, ...ldlExtra];
  const lastBp = bp[bp.length - 1];
  const lastLdl = ldl[ldl.length - 1];

  return (
    <div className="screen">
      <TopBar title="Jantung" backTo="/" />
      <div className="content">
        <Hero tone="red" icon="heartPulse" eyebrow="Penyakit jantung" title="Jantung koroner pasca stent & hipertensi">
          <span className="body-sm" style={{ color: 'var(--ink)' }}>{j.stent}. Fungsi pompa jantung (EF) {j.ef.value}% pada ekokardiografi {fmtShort(j.ef.date)}.</span>
        </Hero>
        <CareTeam p={p} module="jantung" />
        <ReadOnly />

        <div className="grid2">
          <div className="tile"><span className="small">Tekanan darah terakhir</span><b style={{ fontSize: 20 }}>{lastBp.label}</b><span style={{ fontSize: 12, fontWeight: 700, color: lastBp.value < 130 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{lastBp.value < 130 ? 'Sesuai target' : 'Sedikit di atas target'}</span></div>
          <div className="tile"><span className="small">LDL kolesterol</span><b style={{ fontSize: 20 }}>{lastLdl.value} <small style={{ fontSize: 12 }}>mg/dL</small></b><span style={{ fontSize: 12, fontWeight: 700, color: lastLdl.value < 55 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{lastLdl.value < 55 ? 'Sesuai target' : 'Target < 55'}</span></div>
        </div>

        <div className="card">
          <span className="h-card">Tekanan darah saat kontrol</span>
          <MiniChart series={bp} second="dia" min={60} max={180} unit="mmHg" target={130} targetLabel="Target sistolik < 130" label="Grafik tekanan darah Pak Slamet" />
          <span className="body-sm">Garis hijau tua = sistolik (angka atas), hijau muda = diastolik (angka bawah). Turun dari 162/98 saat serangan stroke.</span>
        </div>

        <div className="card">
          <span className="h-card">LDL kolesterol</span>
          <MiniChart series={ldl} min={40} max={160} unit="mg/dL" target={55} targetLabel="Target < 55" label="Grafik LDL kolesterol" />
          <span className="body-sm">Untuk risiko sangat tinggi (jantung koroner dan stroke), target LDL di bawah 55 mg/dL. Target ditetapkan dokter.</span>
        </div>

        <TodayMeds p={p} module="jantung" note="Aspirin dan clopidogrel menjaga stent tetap terbuka. Jangan berhenti tanpa izin dokter jantung." />

        <div className="card">
          <span className="small">Kontrol berikutnya</span>
          <b style={{ fontSize: 16 }}>{fmtDayShort(j.nextControl.date)} · {relativeDays(daysBetween(DEMO_TODAY, j.nextControl.date))}</b>
          <span className="body-sm">{j.nextControl.unit} · {j.nextControl.doctor}</span>
        </div>
        <Danger title="Segera ke IGD bila" text="Nyeri dada seperti ditekan lebih dari 20 menit, menjalar ke lengan kiri atau rahang, sesak napas berat, atau berdebar disertai pingsan." />
      </div>
    </div>
  );
}

/* ======================= Stroke ======================= */
const MRS = {
  0: 'Tidak ada gejala.',
  1: 'Ada gejala, tapi bisa melakukan semua aktivitas seperti biasa.',
  2: 'Disabilitas ringan: belum bisa semua aktivitas seperti dulu, tapi mengurus diri sendiri tanpa bantuan.',
  3: 'Disabilitas sedang: butuh sedikit bantuan, tapi bisa berjalan tanpa dibantu orang.',
  4: 'Disabilitas cukup berat: tidak bisa berjalan atau mengurus diri tanpa bantuan.',
  5: 'Disabilitas berat: perlu perawatan terus-menerus.'
};

export function Stroke() {
  const { state } = useStore();
  const p = patientById('slamet');
  const s = p.stroke;
  const extra = fromDoctor(state, p.id, 'stroke');
  const nihss = [...s.nihss, ...extra.filter((e) => e.nihss != null).map((e) => ({ date: e.date, value: e.nihss }))];
  const mrs = [...s.mrs, ...extra.filter((e) => e.mrs != null).map((e) => ({ date: e.date, value: e.mrs }))];
  const curMrs = mrs[mrs.length - 1].value;
  const since = daysBetween(s.onset, DEMO_TODAY);

  return (
    <div className="screen">
      <TopBar title="Pemulihan Stroke" backTo="/" />
      <div className="content">
        <Hero tone="purple" icon="brain" eyebrow={`${since} hari sejak serangan`} title={s.type}>
          <span className="body-sm" style={{ color: 'var(--ink)' }}>Serangan {fmtDayShort(s.onset)}. Rehabilitasi berjalan {s.rehab.sessions} sesi.</span>
        </Hero>
        <CareTeam p={p} module="stroke" />
        <ReadOnly />

        <div className="card">
          <span className="between"><span className="h-card">Skor defisit saraf (NIHSS)</span><Chip tone="ok">Membaik</Chip></span>
          <MiniChart series={nihss} min={0} max={10} unit="skor" label="Grafik skor NIHSS menurun" />
          <span className="body-sm">Semakin kecil skornya, semakin sedikit gangguan saraf. Turun dari {nihss[0].value} menjadi {nihss[nihss.length - 1].value}.</span>
        </div>

        <div className="card">
          <span className="h-card">Kemandirian (skala Rankin)</span>
          <div className="row" style={{ gap: 6 }}>
            {mrs.map((m, i) => (
              <span key={m.date + i} className="grow stack-sm" style={{ alignItems: 'center', padding: '10px 4px', borderRadius: 12, background: i === mrs.length - 1 ? 'var(--teal)' : 'var(--ground)', color: i === mrs.length - 1 ? '#fff' : 'var(--ink)' }}>
                <b style={{ fontSize: 20 }}>{m.value}</b><span style={{ fontSize: 10 }}>{fmtShort(m.date).replace(/ \d{4}$/, '')}</span>
              </span>
            ))}
          </div>
          <span className="body-sm"><b>Skor {curMrs}:</b> {MRS[curMrs]}</span>
        </div>

        <div className="card">
          <span className="h-card">Rehabilitasi</span>
          <div className="between body"><span>Jadwal fisioterapi</span><b>{s.rehab.schedule}</b></div>
          <div className="between body"><span>Sesi berikutnya</span><b>{fmtDayShort(s.rehab.next)}</b></div>
          <span className="small">{s.rehab.unit}</span>
        </div>

        <div className="card flush">
          <div className="group-head"><b style={{ fontSize: 14 }}>Faktor risiko stroke berulang</b><span className="small">Target</span></div>
          {s.risks.map((r) => (
            <div key={r.label} className="list-row">
              <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{r.label}</b><span className="small">{r.value}</span></span>
              <Chip tone={r.ok ? 'ok' : 'warn'}>{r.target}</Chip>
            </div>
          ))}
        </div>

        <TodayMeds p={p} module="stroke" note="Atorvastatin menurunkan kolesterol untuk mencegah stroke berulang." />

        <div className="card">
          <span className="h-card">Latihan di rumah</span>
          <ul className="bullets" style={{ fontSize: 14 }}>
            <li>Latihan menggenggam bola karet dengan tangan kanan, 3 × 10 kali sehari.</li>
            <li>Jalan pelan didampingi keluarga 10–15 menit pagi dan sore.</li>
            <li>Gunakan tangan kanan untuk aktivitas ringan seperti makan dan menyisir.</li>
          </ul>
          <span className="small">Dari fisioterapis. Hentikan bila pusing atau nyeri dada.</span>
        </div>
        <Danger title="SeGeRa ke RS bila muncul" text="Senyum tidak simetris · Gerak separuh tubuh melemah · bicaRa pelo · Kebas · Rabun mendadak · Sakit kepala hebat. Stroke berulang perlu ditangani dalam hitungan jam." />
      </div>
    </div>
  );
}

/* ======================= Diabetes ======================= */
export function Diabetes() {
  const { state } = useStore();
  const p = patientById('sri');
  const d = p.diabetes;
  const extra = fromDoctor(state, p.id, 'diabetes');
  const a1c = [...d.hba1c, ...extra.filter((e) => e.hba1c != null).map((e) => ({ date: e.date, value: e.hba1c }))].map((x) => ({ ...x, label: fmt1(x.value) }));
  const gd = [...d.glucose, ...extra.filter((e) => e.gd != null).map((e) => ({ date: e.date, value: e.gd }))].slice(-7);
  const lastA1c = a1c[a1c.length - 1];
  const lastGd = gd[gd.length - 1];
  const inRange = gd.filter((g) => g.value >= 80 && g.value <= 130).length;
  const bmi = d.body.weight / (d.body.height / 100) ** 2;

  return (
    <div className="screen">
      <TopBar title="Diabetes" backTo="/" />
      <div className="content">
        <Hero tone="blue" icon="drop" eyebrow={`Sejak ${fmtShort(p.conditions[0].since)}`} title={d.type}>
          <span className="body-sm" style={{ color: 'var(--ink)' }}>HbA1c turun dari {fmt1(a1c[0].value)}% menjadi {fmt1(lastA1c.value)}%. Gula darah dari glukometer di rumah ikut terpantau dokter.</span>
        </Hero>
        <CareTeam p={p} module="diabetes" />
        <ReadOnly />

        <div className="grid2">
          <div className="tile"><span className="small">HbA1c terakhir</span><b style={{ fontSize: 20 }}>{fmt1(lastA1c.value)}%</b><span style={{ fontSize: 12, fontWeight: 700, color: lastA1c.value < 7 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{lastA1c.value < 7 ? 'Sesuai target' : 'Target < 7%'}</span></div>
          <div className="tile"><span className="small">Gula darah puasa</span><b style={{ fontSize: 20 }}>{lastGd.value} <small style={{ fontSize: 12 }}>mg/dL</small></b><span style={{ fontSize: 12, fontWeight: 700, color: lastGd.value <= 130 ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>{lastGd.value <= 130 ? 'Sesuai target' : 'Target 80–130'}</span></div>
        </div>

        <div className="card">
          <span className="between"><span className="h-card">HbA1c (rata-rata gula 3 bulan)</span><Chip tone="ok">Membaik</Chip></span>
          <MiniChart series={a1c} min={6} max={10} unit="%" target={7} targetLabel="Target < 7%" label="Grafik HbA1c menurun" />
          <span className="body-sm">HbA1c menggambarkan rata-rata gula darah selama 3 bulan. Semakin mendekati target, semakin kecil risiko komplikasi.</span>
        </div>

        <div className="card">
          <span className="between"><span className="h-card">Gula darah puasa 7 hari</span><Chip tone={inRange >= 5 ? 'ok' : 'warn'}>{inRange}/7 hari sesuai target</Chip></span>
          <MiniChart series={gd} min={60} max={200} unit="mg/dL" target={130} targetLabel="Batas atas 130" label="Grafik gula darah puasa 7 hari" />
          <span className="row small" style={{ gap: 6 }}><Icon name="refresh" size={14} />{d.device}. Tidak perlu dicatat manual.</span>
        </div>

        <TodayMeds p={p} module="diabetes" note="Glimepiride dapat menurunkan gula darah terlalu rendah bila makan terlewat. Selalu bawa permen atau gula." />

        <div className="card flush">
          <div className="group-head"><b style={{ fontSize: 14 }}>Cek komplikasi</b><span className="small">Setiap tahun</span></div>
          {d.checks.map((c) => (
            <div key={c.label} className="list-row">
              <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{c.label}</b><span className="small">{c.result} · {fmtShort(c.date)}</span></span>
              <Chip tone={c.planned ? 'new' : c.ok ? 'ok' : 'warn'}>{c.planned ? 'Dijadwalkan' : c.ok ? 'Baik' : 'Perhatian'}</Chip>
            </div>
          ))}
        </div>

        <div className="card">
          <span className="h-card">Berat badan & tekanan darah</span>
          <div className="between body"><span>Berat / tinggi badan</span><b>{d.body.weight} kg · {d.body.height} cm</b></div>
          <div className="between body"><span>Indeks massa tubuh</span><b>{fmt1(bmi.toFixed(1))}</b></div>
          <div className="between body"><span>Lingkar perut</span><b>{d.body.waist} cm</b></div>
          <div className="between body"><span>Tekanan darah</span><b>{d.body.bp}</b></div>
          <span className="body-sm">Turun berat badan 5% saja sudah membantu gula darah lebih terkendali.</span>
        </div>

        <div className="card">
          <span className="small">Kontrol berikutnya</span>
          <b style={{ fontSize: 16 }}>{fmtDayShort(d.nextControl.date)} · {relativeDays(daysBetween(DEMO_TODAY, d.nextControl.date))}</b>
          <span className="body-sm">{d.nextControl.unit} · {d.nextControl.doctor}</span>
        </div>

        <div className="card">
          <span className="h-card">Sehari-hari</span>
          <ul className="bullets" style={{ fontSize: 14 }}>
            <li>Isi piring: ½ sayur, ¼ lauk, ¼ nasi. Kurangi minuman manis.</li>
            <li>Jalan kaki 30 menit, 5 kali seminggu.</li>
            <li>Periksa telapak kaki setiap malam. Pakai alas kaki, juga di dalam rumah.</li>
          </ul>
        </div>
        <Danger title="Segera ke faskes bila" text="Gemetar, keringat dingin, dan lemas (gula darah terlalu rendah); sangat haus, mual, muntah, atau mengantuk berat (gula darah sangat tinggi); luka di kaki yang bernanah atau menghitam." />
      </div>
    </div>
  );
}

/* ======================= Modul yang baru diaktifkan dokter ======================= */


export function ModulBaru({ module }) {
  const { state, patient: p } = useStore();
  const m = MODULES[module];
  const dx = p.conditions.filter((c) => c.module === module);
  const encs = state.encounters.filter((e) => e.patientId === p.id && e.module === module);
  return (
    <div className="screen">
      <TopBar title={m.long} backTo="/" />
      <div className="content">
        <Hero tone={m.tone} icon={m.icon} eyebrow="Modul baru diaktifkan dokter" title={dx.map((c) => c.name).join(', ')}>
          <span className="body-sm" style={{ color: 'var(--ink)' }}>Didiagnosis {dx[0] ? `${fmtShort(dx[0].since)} oleh ${dx[0].by}` : ''}. Data pemantauan akan bertambah setiap kali Anda kontrol.</span>
        </Hero>
        <ReadOnly />
        <div className="card">
          <span className="h-card">Tim dokter</span>
          {(p.careTeam[module] || []).map((id) => <span key={id} className="body">{doctorById(id).name}</span>)}
          <Link to="/dokter-pribadi" className="btn btn-secondary">Pilih dokter pribadi</Link>
        </div>
        <div className="card">
          <span className="h-card">Hasil pemeriksaan</span>
          {encs.length ? encs.map((e) => (
            <Link key={e.id} to={'/riwayat/' + e.id} className="stack-sm" style={{ color: 'var(--ink)' }}>
              <b style={{ fontSize: 14 }}>{e.title}</b>
              <span className="body-sm">{e.fields.map((f) => `${f.label}: ${f.value}`).join(' · ')}</span>
              <span className="small">{fmtDayShort(e.date)} · {e.doctor}</span>
            </Link>
          )) : <span className="body-sm">Belum ada pemeriksaan untuk modul ini.</span>}
        </div>
      </div>
    </div>
  );
}
