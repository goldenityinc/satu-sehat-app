import { useEffect, useState } from 'react';
import { Link } from '../router.jsx';
import { useStore } from '../store.jsx';
import { Icon, TopBar, Chip, SourceTag, Avatar, Progress } from '../components/ui.jsx';
import { DEMO_TODAY, mother, pregnancy, child, plannedVisits, appointments, facility } from '../data/simrs.js';
import {
  gestationalAge, estimatedDueDate, trimester, fetalInfo, fmtLong, fmtShort, fmtDayShort,
  fmtWeekdayAbbr, fmtMonthAbbr, dayOfMonth, ageInMonthsDays, daysBetween
} from '../lib/clinical.js';

const fmtKg = (n) => n.toFixed(1).replace('.', ',');

function usePregnancy() {
  const ga = gestationalAge(pregnancy.hpht, DEMO_TODAY);
  const hpl = estimatedDueDate(pregnancy.hpht);
  const weeksLeft = Math.ceil((280 - ga.totalDays) / 7);
  return { ga, hpl, weeksLeft, tri: trimester(ga.weeks), fetal: fetalInfo(ga.weeks), pct: (ga.totalDays / 280) * 100 };
}

/* ======================= Beranda ======================= */
export function KiaHub() {
  const { state, update, syncing, newCount, inbox } = useStore();
  const p = usePregnancy();
  const kid = ageInMonthsDays(child.dob, DEMO_TODAY);
  const nextAgenda = appointments.filter((a) => daysBetween(DEMO_TODAY, a.date) >= 0).slice(0, 2);
  const latest = inbox[0];

  return (
    <div className="screen">
      <TopBar
        title="Kesehatan Ibu & Anak"
        backTo="/"
        right={
          <Link to="/notifikasi" className="icon-btn" aria-label={`Kotak masuk, ${newCount} catatan baru`}>
            <Icon name="bell" stroke={1.8} />
            {newCount ? <span className="icon-badge">{newCount}</span> : null}
          </Link>
        }
      />
      <div className="content">
        <span className="body-sm">Buku KIA digital untuk {mother.short} dan {child.short}. Data dari rekam medis RS JIH Solo, mengikuti Buku KIA Kemenkes 2025.</span>

        <div className="row">
          <Link to="/kehamilan" className="tile grow row" style={{ flexDirection: 'row', borderColor: 'var(--teal)', borderWidth: 1.5 }}>
            <Avatar initials={mother.initials} />
            <span className="stack-sm"><b style={{ fontSize: 14 }}>{mother.short}</b><span className="small">Hamil {p.ga.weeks} minggu</span></span>
          </Link>
          <Link to="/anak" className="tile grow row" style={{ flexDirection: 'row' }}>
            <Avatar initials={child.initials} tone="blue" />
            <span className="stack-sm"><b style={{ fontSize: 14 }}>{child.short}</b><span className="small">{kid.months} bulan</span></span>
          </Link>
        </div>

        {syncing ? (
          <div className="card teal-tint row" style={{ flexDirection: 'row' }}>
            <Icon name="refresh" className="spin" />
            <span className="body">Menerima data terbaru dari RS JIH Solo…</span>
          </div>
        ) : newCount ? (
          <Link to="/notifikasi" className="card teal fade-in" style={{ flexDirection: 'row', gap: 12 }}>
            <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="hospital" stroke={1.8} /></span>
            <span className="stack-sm grow">
              <b style={{ fontSize: 16 }}>{newCount} catatan baru dari RS JIH Solo</b>
              <span style={{ fontSize: 13, lineHeight: 1.45, color: '#D6ECE7' }}>Hasil kunjungan hamil ke-3, hasil laboratorium, dan pengingat imunisasi Arka.</span>
              <span style={{ fontSize: 12, color: '#B4DBD2' }}>Dari rekam medis · {fmtShort(latest.date)} {latest.time}</span>
            </span>
            <Icon name="chevron" stroke={2} style={{ alignSelf: 'center' }} />
          </Link>
        ) : (
          <Link to="/notifikasi" className="card row" style={{ flexDirection: 'row' }}>
            <span style={{ color: 'var(--teal)' }}><Icon name="shield" /></span>
            <span className="stack-sm grow">
              <b style={{ fontSize: 14 }}>Catatan dari RS sudah terbaru</b>
              <span className="small">Terakhir masuk {fmtShort(latest.date)} · {latest.title}</span>
            </span>
            <Icon name="chevron" size={18} style={{ color: '#A9B5B1' }} />
          </Link>
        )}

        <Link to="/kehamilan" className="card" style={{ gap: 14, padding: 18 }}>
          <span className="between"><span className="eyebrow" style={{ color: 'var(--coral-ink)' }}>Kehamilan</span><span className="small" style={{ fontWeight: 600 }}>Trimester {p.tri}</span></span>
          <span className="between" style={{ alignItems: 'flex-end' }}>
            <span className="stack-sm">
              <span className="big-num">{p.ga.weeks} <span style={{ fontSize: 18, fontWeight: 700 }}>minggu</span></span>
              <span className="body-sm" style={{ marginTop: 4 }}>Perkiraan lahir {fmtDayShort(p.hpl)}</span>
            </span>
            <span className="teal" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{p.weeksLeft} minggu<br />lagi</span>
          </span>
          <Progress value={p.pct} tone="coral" />
          <span className="row" style={{ padding: 12, borderRadius: 12, background: 'var(--coral-soft)', gap: 12 }}>
            <span className="avatar avatar-coral" style={{ width: 40, height: 40 }}><Icon name="heart" size={20} /></span>
            <span className="body-sm" style={{ color: 'var(--ink)' }}>Janin sebesar <b>{p.fetal.size}</b>, panjang {p.fetal.length} dan berat {p.fetal.weight}.</span>
          </span>
        </Link>

        {state.synced ? (
          <Link to="/kunjungan/k3" className="card warn fade-in" style={{ flexDirection: 'row', gap: 12 }}>
            <span style={{ color: 'var(--warn-ink)', flex: 'none' }}><Icon name="alert" size={24} /></span>
            <span className="stack-sm">
              <b style={{ fontSize: 15 }}>Hb Ibu 10,6 g/dL: anemia ringan</b>
              <span style={{ fontSize: 13, lineHeight: 1.45 }}>Dokter menambah tablet tambah darah menjadi 2 tablet per hari. Lihat penjelasan lengkapnya.</span>
            </span>
          </Link>
        ) : null}

        <div className="card">
          <span className="h-card">Agenda berikutnya</span>
          {nextAgenda.map((a, i) => (
            <div key={a.id} className="stack">
              {i > 0 ? <div className="divider" /> : null}
              <Link to={a.who === 'anak' ? '/anak' : '/kehamilan'} className="row" style={{ color: 'var(--ink)', gap: 12 }}>
                <span className={'date-badge ' + a.tone}><span>{fmtWeekdayAbbr(a.date)}</span><b>{dayOfMonth(a.date)}</b><span>{fmtMonthAbbr(a.date)}</span></span>
                <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{a.title}</b><span className="small">{a.detail}</span></span>
              </Link>
            </div>
          ))}
        </div>

        <Link to="/edukasi" className="card">
          <span className="between"><span className="h-card">Bacaan minggu ini</span><span className="teal" style={{ fontSize: 13, fontWeight: 700 }}>Lihat semua</span></span>
          <span className="row" style={{ alignItems: 'stretch' }}>
            <span className="grow stack-sm" style={{ padding: 12, borderRadius: 12, background: 'var(--coral-soft)' }}><span className="eyebrow" style={{ fontSize: 11, color: 'var(--coral-ink)' }}>Untuk Ibu</span><b style={{ fontSize: 13, lineHeight: 1.35 }}>{state.synced ? 'Mencegah anemia saat hamil' : 'Trimester 2: rencanakan kelahiran'}</b></span>
            <span className="grow stack-sm" style={{ padding: 12, borderRadius: 12, background: 'var(--blue-soft)' }}><span className="eyebrow" style={{ fontSize: 11, color: 'var(--blue)' }}>Untuk Arka</span><b style={{ fontSize: 13, lineHeight: 1.35 }}>MPASI 12–24 bulan</b></span>
          </span>
        </Link>

        <div className="card">
          <span className="h-card">Hari ini</span>
          <span className="body-sm">Sudah minum {state.synced ? '2 tablet' : '1 tablet'} tambah darah? Minum malam hari bersama air jeruk, hindari teh, kopi, dan susu.</span>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => update((s) => ({ ttdToday: !s.ttdToday }))}>{state.ttdToday ? 'Tercatat hari ini' : 'Sudah minum'}</button>
            <Link to="/artikel/tanda-bahaya-t2" className="btn btn-secondary">Cek tanda bahaya</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= Kotak masuk ======================= */
export function Inbox() {
  const { inbox, newCount, update } = useStore();
  const [wasNew] = useState(newCount > 0);
  const [who, setWho] = useState('all');
  useEffect(() => { if (newCount) update({ inboxSeen: true }); }, [newCount, update]);
  const items = inbox.filter((i) => who === 'all' || i.who === who);

  return (
    <div className="screen">
      <TopBar title="Dari RS JIH Solo" backTo="/" />
      <div className="content">
        <div className="card teal-tint" style={{ flexDirection: 'row', gap: 12 }}>
          <span style={{ color: 'var(--teal)', flex: 'none' }}><Icon name="shield" /></span>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Catatan di bawah dikirim langsung dari rekam medis RS JIH Solo setiap kali Ibu dan Arka diperiksa. Ibu tidak perlu mencatat ulang di buku.</span>
        </div>
        <div className="filter" role="group" aria-label="Saring catatan">
          <button type="button" aria-pressed={who === 'all'} onClick={() => setWho('all')}>Semua</button>
          <button type="button" aria-pressed={who === 'ibu'} onClick={() => setWho('ibu')}>{mother.short}</button>
          <button type="button" aria-pressed={who === 'anak'} onClick={() => setWho('anak')}>{child.short}</button>
        </div>
        {items.map((it) => (
          <Link key={it.id} to={it.route} className="card fade-in" style={{ flexDirection: 'row', gap: 12 }}>
            <span className={'avatar ' + (it.who === 'ibu' ? 'avatar-coral' : 'avatar-blue')} style={{ width: 40, height: 40 }}><Icon name={it.who === 'ibu' ? 'heart' : 'child'} size={20} /></span>
            <span className="stack-sm grow">
              <span className="between"><span className="small">{fmtDayShort(it.date)} · {it.time}</span>{wasNew && it.batch === 'k3' ? <Chip tone="new">Baru</Chip> : null}</span>
              <b style={{ fontSize: 15, lineHeight: 1.3 }}>{it.title}</b>
              <span className="body-sm">{it.detail}</span>
              <span className="small">{it.source}</span>
              {it.warn ? <span style={{ marginTop: 4 }}><Chip tone="warn">{it.warn}</Chip></span> : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ======================= Kehamilan ======================= */
export function Kehamilan() {
  const { visits, state } = useStore();
  const p = usePregnancy();
  const k3Pending = !state.synced;
  const weights = [{ label: 'Sebelum hamil', kg: mother.prePregnancyWeightKg }, ...visits.map((v) => ({ label: `K${v.no} · ${v.gaWeeks} mgg`, kg: v.weightKg }))];
  const gain = weights[weights.length - 1].kg - mother.prePregnancyWeightKg;
  const bmi = mother.prePregnancyWeightKg / (mother.heightCm / 100) ** 2;
  const maxKg = Math.max(...weights.map((w) => w.kg));

  return (
    <div className="screen">
      <TopBar title="Kehamilan" backTo="/" />
      <div className="content">
        <div className="card coral" style={{ gap: 14, padding: 20 }}>
          <span className="stack-sm">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--coral-ink)' }}>Usia kehamilan</span>
            <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: -1 }}>{p.ga.weeks} mgg {p.ga.days} hr</span>
            <span className="small">Dihitung dari HPHT {fmtShort(pregnancy.hpht)}, sesuai {pregnancy.datingSource}</span>
          </span>
          <span className="stack-sm">
            <Progress value={p.pct} tone="coral" />
            <span className="between small" style={{ fontWeight: 600, fontSize: 11 }}><span>Trimester 1</span><span>Trimester 2</span><span>Trimester 3</span></span>
          </span>
          <div className="grid2">
            <div className="tile" style={{ border: 'none' }}><span className="small">Perkiraan lahir</span><b>{fmtShort(p.hpl)}</b></div>
            <div className="tile" style={{ border: 'none' }}><span className="small">Ukuran janin</span><b>{p.fetal.length} · {p.fetal.weight}</b></div>
          </div>
          <span className="body">{p.fetal.note}</span>
        </div>

        <div className="card" style={{ gap: 4, paddingBottom: 6 }}>
          <span className="between" style={{ paddingBottom: 6 }}><span className="h-section">Pemeriksaan kehamilan</span><span className="teal" style={{ fontWeight: 800, fontSize: 13 }}>{visits.length} dari 6</span></span>
          <span className="small" style={{ paddingBottom: 10, lineHeight: 1.45 }}>Standar Kemenkes: minimal 6 kali, 2 di antaranya dengan dokter dan USG.</span>
          {visits.map((v) => (
            <Link key={v.id} to={'/kunjungan/' + v.id} className="timeline-item">
              <span className="tl-rail"><span className="tl-dot done"><Icon name="check" size={16} stroke={2.6} /></span><span className="tl-line" /></span>
              <span className="tl-body">
                <span className="between"><b style={{ fontSize: 15 }}>K{v.no} · {v.title}</b>{v.batch === 'k3' ? <Chip tone="new">Baru dari RS</Chip> : null}</span>
                <span className="body-sm">{fmtDayShort(v.date)} · usia {v.gaWeeks} minggu</span>
                <span className="small">{v.examiner} · lihat hasil</span>
              </span>
            </Link>
          ))}
          {k3Pending ? (
            <div className="timeline-item">
              <span className="tl-rail"><span className="tl-dot wait">K3</span><span className="tl-line" /></span>
              <span className="tl-body">
                <b style={{ fontSize: 15 }}>K3 · Pemeriksaan rutin</b>
                <span className="body-sm">{fmtDayShort('2026-10-01')} · usia 23 minggu</span>
                <span className="small">Sudah diperiksa. Hasil sedang diproses RS dan akan muncul otomatis.</span>
              </span>
            </div>
          ) : null}
          {plannedVisits.map((v, i) => (
            <div key={v.id} className="timeline-item">
              <span className="tl-rail"><span className="tl-dot plan">K{v.no}</span>{i < plannedVisits.length - 1 ? <span className="tl-line" /> : null}</span>
              <span className="tl-body"><b style={{ fontSize: 15 }}>K{v.no} · {v.title}</b><span className="body-sm">{v.when}</span><span className="small">{v.who}</span></span>
            </div>
          ))}
        </div>

        <div className="card">
          <span className="h-section">Kenaikan berat badan</span>
          <div className="bars" aria-label="Grafik berat badan per kunjungan">
            {weights.map((w, i) => (
              <div className="bar" key={w.label}>
                <b style={{ fontSize: 12 }}>{fmtKg(w.kg)}</b>
                <i style={{ height: 30 + ((w.kg - 50) / (maxKg - 50)) * 50, background: i === weights.length - 1 ? 'var(--teal)' : i === 0 ? '#E3E8E6' : '#9CC9BE' }} />
              </div>
            ))}
          </div>
          <div className="row" style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
            {weights.map((w) => <span key={w.label} className="grow">{w.label}</span>)}
          </div>
          <span className="body-sm" style={{ padding: 12, borderRadius: 12, background: 'var(--ok-bg)', color: '#0F4A2E' }}>
            Naik {fmtKg(gain)} kg sejauh ini. Sesuai anjuran untuk IMT normal ({fmtKg(bmi)}): total 11,5–16 kg sampai melahirkan.
          </span>
        </div>

        <div className="grid2">
          <div className="tile"><span className="small">Imunisasi tetanus</span><b style={{ fontSize: 16 }}>Status {mother.tetanusStatus}</b><span style={{ fontSize: 12, color: 'var(--ok-ink)', fontWeight: 600 }}>Terlindungi 10 tahun</span></div>
          <div className="tile"><span className="small">Golongan darah</span><b style={{ fontSize: 16 }}>{mother.bloodType} Rhesus {mother.rhesus}</b><span className="small">Dari lab K1</span></div>
        </div>
        <Link to="/artikel/tanda-bahaya-t2" className="btn btn-primary" style={{ minHeight: 52 }}>Cek tanda bahaya minggu ini</Link>
      </div>
    </div>
  );
}

/* ======================= Detail kunjungan ======================= */
export function Kunjungan({ id }) {
  const { visits, state, update } = useStore();
  const v = visits.find((x) => x.id === id);
  const [simple, setSimple] = useState(true);

  if (!v) {
    return (
      <div className="screen">
        <TopBar title={`Kunjungan ${id.toUpperCase()}`} backTo="/kehamilan" />
        <div className="content">
          <div className="card teal-tint"><b>Hasil belum dikirim RS</b><span className="body-sm">Hasil pemeriksaan akan muncul otomatis setelah bidan menyimpannya di rekam medis.</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title={`Kunjungan ke-${v.no} (K${v.no})`} backTo="/kehamilan" />
      <div className="content">
        <div className="card">
          <SourceTag />
          <div className="grid2" style={{ gap: '10px 12px' }}>
            <div className="stack-sm"><span className="small">Tanggal</span><b style={{ fontSize: 14 }}>{fmtDayShort(v.date)}</b></div>
            <div className="stack-sm"><span className="small">Usia kehamilan</span><b style={{ fontSize: 14 }}>{v.gaWeeks} minggu</b></div>
            <div className="stack-sm"><span className="small">Pemeriksa</span><b style={{ fontSize: 14 }}>{v.examiner}</b></div>
            <div className="stack-sm"><span className="small">Dokter penanggung jawab</span><b style={{ fontSize: 14 }}>{v.doctor}</b></div>
          </div>
        </div>

        <div className="card teal-tint">
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Ringkasan dari dokter</span>
          <span style={{ fontSize: 15, lineHeight: 1.55 }}>{v.summary}</span>
        </div>

        <div className="between" style={{ padding: '4px 2px 0' }}>
          <span className="h-section">Hasil pemeriksaan</span>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 36, borderRadius: 18, fontSize: 12, padding: '0 12px' }} aria-pressed={simple} onClick={() => setSimple(!simple)}>
            {simple ? 'Sembunyikan penjelasan' : 'Tampilkan penjelasan'}
          </button>
        </div>
        <div className="card flush">
          {v.results.map((r) => (
            <div className="result-row" key={r.label}>
              <span className="between"><span className="body-sm muted">{r.label}</span><Chip tone={r.status}>{r.statusText}</Chip></span>
              <span className="result-value">{r.value} <small>{r.unit}</small></span>
              {simple ? <span className="body-sm">{r.meaning}</span> : null}
            </div>
          ))}
        </div>

        {v.todo.length ? (
          <div className="card warn-soft" style={{ gap: 12 }}>
            <span className="h-section">Yang perlu Ibu lakukan</span>
            {v.todo.map((t) => (
              <label className="check" key={t.id}>
                <input type="checkbox" checked={!!state.todo[t.id]} onChange={() => update((s) => ({ todo: { ...s.todo, [t.id]: !s.todo[t.id] } }))} />
                <span dangerouslySetInnerHTML={{ __html: t.html }} />
              </label>
            ))}
            {v.article ? (
              <Link to={'/artikel/' + v.article} className="between" style={{ minHeight: 44, padding: '0 12px', borderRadius: 12, background: '#fff', fontWeight: 700, fontSize: 14 }}>
                Baca: Mencegah anemia saat hamil <Icon name="chevron" size={18} stroke={2} />
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="card">
          <span className="h-card">Obat yang diberikan</span>
          {v.meds.map((m) => <div key={m.name} className="between body"><span>{m.name}</span><b>{m.qty}</b></div>)}
          <span className="small">Dari {facility.units.pharmacy} {facility.name} · {fmtShort(v.date)}</span>
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-primary">Simpan ke kalender</button>
          <button type="button" className="btn btn-secondary">Tanya bidan</button>
        </div>
        <span className="small" style={{ textAlign: 'center', lineHeight: 1.5 }}>Tercatat juga di Buku KIA halaman 96–97. Penjelasan ini tidak menggantikan konsultasi dengan dokter.</span>
      </div>
    </div>
  );
}

