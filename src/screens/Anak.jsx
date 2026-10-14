import { useState } from 'react';
import { Link } from '../router.jsx';
import { useStore } from '../store.jsx';
import { Icon, TopBar, Chip, SourceTag, Avatar, Progress } from '../components/ui.jsx';
import GrowthChart from '../components/GrowthChart.jsx';
import { DEMO_TODAY, child, immunizationRecords, extraImmunizations, growthRecords, supplements, staff, facility } from '../data/simrs.js';
import { PREVENTS, doseNumberText } from '../data/vaccines.js';
import { whoBoys } from '../data/who.js';
import { ageInMonthsDays, immunizationStatus, immunizationSummary, groupByAge, fmtShort, fmtDayShort, relativeDays } from '../lib/clinical.js';

function useImmunization() {
  const statuses = immunizationStatus(child, immunizationRecords, DEMO_TODAY);
  return { statuses, summary: immunizationSummary(statuses), groups: groupByAge(statuses) };
}

const STATUS_TEXT = { done: 'Selesai', due: 'Jatuh tempo', catchup: 'Imunisasi kejar', upcoming: 'Belum waktunya', missed: 'Terlewat', na: 'Tidak berlaku' };

/* ======================= Profil anak ======================= */
export function Anak() {
  const { state, update } = useStore();
  const age = ageInMonthsDays(child.dob, DEMO_TODAY);
  const { summary } = useImmunization();
  const due = summary.due;
  const dueDate = due[0]?.dueDate;
  const latest = growthRecords[growthRecords.length - 1];

  return (
    <div className="screen">
      <TopBar title="Anak" backTo="/" />
      <div className="content">
        <div className="card blue" style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Avatar initials={child.initials} tone="white" size={60} />
          <span className="stack-sm">
            <b style={{ fontSize: 20 }}>{child.name}</b>
            <span className="body-sm">Laki-laki · {age.months} bulan {age.days} hari</span>
            <span className="small">No. RM {child.rmNo} · {facility.name}</span>
          </span>
        </div>

        {due.length ? (
          <div className="card due" style={{ gap: 12, padding: 18 }}>
            <span className="between"><Chip tone="warn">Jatuh tempo {relativeDays(due[0].untilDue)}</Chip><span className="small">Usia {due[0].ageMonths} bulan</span></span>
            <b style={{ fontSize: 18 }}>Imunisasi lanjutan {due[0].ageMonths} bulan</b>
            <div className="stack" style={{ gap: 8 }}>
              {due.map((d) => <span key={d.id} className="row body"><span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--warn)', flex: 'none' }} />{d.name}</span>)}
            </div>
            <span className="body-sm">Disarankan {fmtDayShort(dueDate)}. Masih bisa diberikan sampai usia 59 bulan bila terlewat.</span>
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={() => update((s) => ({ booked: !s.booked }))}>{state.booked ? 'Terjadwal' : 'Pilih jadwal'}</button>
              <Link to="/imunisasi" className="btn btn-secondary">Kartu imunisasi</Link>
            </div>
            {state.booked ? (
              <span className="body-sm fade-in" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--ok-bg)', color: '#0F4A2E' }}>
                Terjadwal {fmtDayShort(dueDate)} · 09.00 · {facility.units.peds}, {staff.spa.name}. Pengingat dikirim H-1.
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="grid2">
          <Link to="/imunisasi" className="tile" style={{ gap: 6 }}>
            <span className="small">Imunisasi rutin</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{summary.done}<span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}> / {summary.total} dosis</span></span>
            <Progress value={(summary.done / summary.total) * 100} />
          </Link>
          <Link to="/tumbuh" className="tile" style={{ gap: 6 }}>
            <span className="small">Status gizi</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>Gizi baik</span>
            <span style={{ fontSize: 12, color: 'var(--ok-ink)', fontWeight: 600 }}>Tinggi badan normal</span>
          </Link>
          <Link to="/tumbuh" className="tile" style={{ gap: 6 }}>
            <span className="small">Vitamin A</span>
            <b style={{ fontSize: 16 }}>{supplements.vitaminA[supplements.vitaminA.length - 1]}</b>
            <span className="small">Berikutnya {supplements.next}</span>
          </Link>
          <Link to="/tumbuh" className="tile" style={{ gap: 6 }}>
            <span className="small">Pengukuran terakhir</span>
            <b style={{ fontSize: 16 }}>{String(latest.weightKg).replace('.', ',')} kg · {String(latest.heightCm).replace('.', ',')} cm</b>
            <span className="small">{fmtShort(latest.date)}</span>
          </Link>
        </div>

        <div className="card">
          <span className="between"><span className="h-card">Catatan kelahiran</span><span className="teal" style={{ fontSize: 11, fontWeight: 800 }}>DARI RS JIH SOLO</span></span>
          <div className="grid3">
            <div className="stack-sm"><span className="small">Berat lahir</span><b>{String(child.birth.weightKg).replace('.', ',')} kg</b></div>
            <div className="stack-sm"><span className="small">Panjang</span><b>{child.birth.lengthCm} cm</b></div>
            <div className="stack-sm"><span className="small">Lingkar kepala</span><b>{child.birth.headCm} cm</b></div>
          </div>
          <span className="body-sm">Lahir {fmtDayShort(child.dob)} · {child.birth.method} · {child.birth.screening}.</span>
        </div>

        <Link to="/artikel/mpasi" className="card blue" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <span className="avatar avatar-white" style={{ width: 48, height: 48, borderRadius: 14 }}><Icon name="book" /></span>
          <span className="stack-sm grow">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>Bacaan untuk usia {child.short}</span>
            <b style={{ fontSize: 14, lineHeight: 1.3 }}>MPASI 12–24 bulan: makanan keluarga kaya protein hewani</b>
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ======================= Kartu imunisasi ======================= */
export function KartuImunisasi() {
  const { summary, groups } = useImmunization();
  return (
    <div className="screen">
      <TopBar title={`Kartu Imunisasi ${child.short}`} backTo="/anak" />
      <div className="content">
        <div className="card teal" style={{ gap: 12, padding: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#CDE8E1' }}>Imunisasi rutin program pemerintah</span>
          <span style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{summary.done} <span style={{ fontSize: 16, fontWeight: 600, color: '#CDE8E1' }}>dari {summary.total} dosis selesai</span></span>
          <span className="progress progress-white"><span style={{ width: (summary.done / summary.total) * 100 + '%' }} /></span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: '#E3F3EF' }}>Semua imunisasi dasar diberikan tepat waktu. Tinggal {summary.total - summary.done} imunisasi lanjutan usia 18 bulan.</span>
        </div>

        <div className="row small" style={{ flexWrap: 'wrap', gap: 14, color: 'var(--ink-2)' }}>
          <span className="row" style={{ gap: 6 }}><span className="dose-dot done" style={{ width: 12, height: 12 }} />Selesai</span>
          <span className="row" style={{ gap: 6 }}><span className="dose-dot due" style={{ width: 12, height: 12 }} />Jatuh tempo</span>
          <span className="row" style={{ gap: 6 }}><span className="dose-dot na" style={{ width: 12, height: 12 }} />Tidak berlaku</span>
        </div>

        {groups.map((g) => {
          const done = g.doses.filter((d) => d.status === 'done');
          const headDate = done.length ? fmtShort(done[0].record.date) : g.doses[0].status === 'na' ? '—' : 'Jatuh tempo ' + fmtShort(g.doses[0].dueDate);
          return (
            <div className="card flush" key={g.ageMonths}>
              <div className="group-head"><b style={{ fontSize: 14 }}>{g.label}</b><span className="small">{headDate}</span></div>
              {g.doses.map((d) => (
                <Link key={d.id} to={'/imunisasi/' + d.id} className="list-row">
                  <span className={'dose-dot ' + d.status}>{d.status === 'done' ? <Icon name="check" size={14} stroke={3} /> : null}</span>
                  <span className="stack-sm grow">
                    <b style={{ fontSize: 14 }}>{d.name}</b>
                    <span className="small">{d.status === 'na' ? 'Tidak berlaku: hanya untuk wilayah endemis' : d.status === 'done' ? 'Mencegah ' + PREVENTS[d.family].join(', ').toLowerCase() : STATUS_TEXT[d.status] + ' ' + fmtDayShort(d.dueDate)}</span>
                  </span>
                  <Icon name="chevron" size={18} style={{ color: '#A9B5B1' }} />
                </Link>
              ))}
            </div>
          );
        })}

        <div className="card" style={{ borderStyle: 'dashed', borderColor: '#B9C4C0' }}>
          <b style={{ fontSize: 14 }}>Imunisasi tambahan anjuran dokter</b>
          {extraImmunizations.map((e) => <div key={e.name} className="between body"><span>{e.name}</span><span className="muted">{fmtShort(e.date)}</span></div>)}
          <span className="small" style={{ lineHeight: 1.45 }}>{extraImmunizations[0].note}</span>
        </div>

        <div className="card teal-tint" style={{ flexDirection: 'row', gap: 12 }}>
          <span style={{ color: 'var(--teal)', flex: 'none' }}><Icon name="hospital" /></span>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Dicatat otomatis dari RS JIH Solo. Imunisasi di Posyandu atau Puskesmas bisa ditambahkan dengan memotret halaman Buku KIA, lalu diverifikasi petugas.</span>
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-primary">Unduh sertifikat (PDF)</button>
          <button type="button" className="btn btn-secondary">Tambah dari Posyandu</button>
        </div>
      </div>
    </div>
  );
}

/* ======================= Detail imunisasi ======================= */
export function DetailVaksin({ id }) {
  const { statuses } = useImmunization();
  const d = statuses.find((s) => s.id === id);
  if (!d) return <div className="screen"><TopBar title="Detail Imunisasi" backTo="/imunisasi" /><div className="content"><div className="card">Data imunisasi tidak ditemukan.</div></div></div>;
  const rec = d.record;
  const ageAt = rec ? ageInMonthsDays(child.dob, rec.date) : null;

  return (
    <div className="screen">
      <TopBar title="Detail Imunisasi" backTo="/imunisasi" />
      <div className="content">
        <div className="card" style={{ padding: 20 }}>
          <Chip tone={d.status === 'done' ? 'ok' : d.status === 'na' ? 'na' : 'warn'}>{d.status === 'done' ? (d.onTime ? 'Selesai · tepat waktu' : 'Selesai') : STATUS_TEXT[d.status]}</Chip>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.4 }}>{d.name}</span>
          <span className="body muted">{doseNumberText[d.id] ?? d.note ?? `Diberikan pada usia ${d.ageMonths} bulan.`}</span>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
            {PREVENTS[d.family].map((p) => <span key={p} className="chip chip-soft">{p}</span>)}
          </div>
        </div>

        {rec ? (
          <div className="card flush">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)' }}><SourceTag>Catatan dari RS JIH Solo</SourceTag></div>
            <div className="kv"><span>Tanggal</span><span>{fmtDayShort(rec.date)}</span></div>
            <div className="kv"><span>Usia saat imunisasi</span><span>{ageAt.months} bulan {ageAt.days} hari</span></div>
            <div className="kv"><span>Tempat</span><span>{rec.unit}, {facility.name}</span></div>
            <div className="kv"><span>Petugas</span><span>{rec.examiner}</span></div>
            <div className="kv"><span>No. batch vaksin</span><span>{rec.batchNo}</span></div>
            <div className="kv"><span>Lokasi pemberian</span><span>{rec.site}</span></div>
            <div className="kv"><span>Diberikan bersama</span><span>{statuses.filter((s) => s.record && s.record.date === rec.date && s.id !== d.id).map((s) => s.name).join(', ') || '—'}</span></div>
          </div>
        ) : (
          <div className="card warn-soft">
            <b>Belum diberikan</b>
            <span className="body-sm">{d.status === 'na' ? 'Imunisasi ini hanya diberikan di wilayah endemis Japanese Encephalitis.' : `Jadwal yang disarankan ${fmtDayShort(d.dueDate)}.`}</span>
            {d.status !== 'na' ? <Link to="/anak" className="btn btn-primary">Pilih jadwal di Poli Anak</Link> : null}
          </div>
        )}

        {rec?.kipi ? (
          <div className="card">
            <span className="h-card">Reaksi setelah imunisasi</span>
            <span className="body">{rec.kipi.text}</span>
            <span className="small">{rec.kipi.review}</span>
          </div>
        ) : null}

        {rec ? (
          <div className="card warn-soft">
            <span className="h-card">Wajar setelah imunisasi</span>
            <span className="body">Demam ringan, rewel, serta bengkak atau kemerahan di bekas suntikan selama 1–2 hari. Berikan ASI lebih sering dan kompres air hangat.</span>
            <span className="h-card" style={{ color: 'var(--danger-ink)', paddingTop: 4 }}>Segera ke IGD bila</span>
            <span className="body">Demam di atas 39°C, kejang, menangis terus lebih dari 3 jam, atau bayi tampak lemas.</span>
          </div>
        ) : null}

        {rec ? (
          <div className="btn-row">
            <button type="button" className="btn btn-primary">Laporkan reaksi</button>
            <button type="button" className="btn btn-secondary"><Icon name="phone" size={18} />Telepon IGD</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ======================= Tumbuh kembang ======================= */
const DEV_ITEMS = ['Berjalan sendiri tanpa terjatuh', 'Menyebut 3–6 kata yang bermakna', 'Mencoret-coret dengan pensil', 'Menunjuk bagian tubuh saat ditanya', 'Minum dari gelas sendiri'];

export function TumbuhKembang() {
  const { state, update } = useStore();
  const [tab, setTab] = useState('weight');
  const ref = whoBoys[tab];
  const latest = growthRecords[growthRecords.length - 1];
  const fmt = (n) => String(n).replace('.', ',');

  return (
    <div className="screen">
      <TopBar title={`Tumbuh Kembang ${child.short}`} backTo="/anak" />
      <div className="content">
        <div className="grid3">
          <div className="tile"><span className="small">Berat</span><b style={{ fontSize: 18 }}>{fmt(latest.weightKg)} kg</b><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok-ink)' }}>Normal</span></div>
          <div className="tile"><span className="small">Tinggi</span><b style={{ fontSize: 18 }}>{fmt(latest.heightCm)} cm</b><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok-ink)' }}>Normal</span></div>
          <div className="tile"><span className="small">Lingkar kepala</span><b style={{ fontSize: 18 }}>{fmt(latest.headCm)} cm</b><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok-ink)' }}>Normal</span></div>
        </div>
        <span className="small" style={{ marginTop: -6 }}>Diukur {fmtDayShort(latest.date)} di {facility.units.peds} {facility.name} · usia {latest.ageMonths} bulan</span>

        <div className="card" style={{ gap: 12 }}>
          <div className="seg dark" role="group" aria-label="Pilih grafik" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {Object.entries(whoBoys).map(([k, r]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{r.label}</button>)}
          </div>
          <GrowthChart reference={ref} records={growthRecords} name={child.short} />
          <div className="row small" style={{ flexWrap: 'wrap', gap: 12, color: 'var(--ink-2)', fontSize: 11 }}>
            <span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 3, borderRadius: 2, background: 'var(--teal)' }} />{child.short}</span>
            <span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 3, background: '#DDEFE9' }} />Rentang normal WHO</span>
            <span className="row" style={{ gap: 6 }}><span style={{ width: 14, borderTop: '1px dashed #7E9690' }} />Rata-rata</span>
          </div>
          <span className="body" style={{ padding: 12, borderRadius: 12, background: 'var(--ok-bg)', color: '#0F4A2E' }}>
            Garis {child.short} selalu berada di dalam pita hijau dan terus naik mengikuti kurva. Artinya {ref.label.toLowerCase()} sesuai usia dan ia tumbuh dengan baik.
          </span>
        </div>

        <div className="card" style={{ gap: 12 }}>
          <span className="between"><span className="h-section">Ceklis perkembangan 18 bulan</span><span className="teal" style={{ fontWeight: 800, fontSize: 13 }}>{state.dev.filter(Boolean).length}/{DEV_ITEMS.length}</span></span>
          <span className="small" style={{ marginTop: -6 }}>Diisi Ibu, ditinjau dokter saat imunisasi 12 Okt.</span>
          {DEV_ITEMS.map((item, i) => (
            <label key={item} className="check" style={{ alignItems: 'center', minHeight: 36 }}>
              <input type="checkbox" checked={state.dev[i]} onChange={() => update((s) => ({ dev: s.dev.map((v, j) => (j === i ? !v : v)) }))} />
              {item}
            </label>
          ))}
        </div>

        <div className="card">
          <span className="h-section">Vitamin A dan obat cacing</span>
          <div className="between body"><span>Vitamin A kapsul merah</span><b>{supplements.vitaminA.join(' · ')}</b></div>
          <div className="between body"><span>Obat cacing</span><b>{supplements.deworming.join(' · ')}</b></div>
          <span className="small">Berikutnya {supplements.next} · diberikan setiap Februari dan Agustus</span>
        </div>
      </div>
    </div>
  );
}
