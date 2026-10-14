import { useState } from 'react';
import { Link } from '../router.jsx';
import { useStore } from '../store.jsx';
import { Icon, TopBar } from '../components/ui.jsx';
import { articles, topics, mpasiAges, menus } from '../data/articles.js';
import { DEMO_TODAY, mother, child, pregnancy, staff, growthRecords } from '../data/simrs.js';
import { gestationalAge, ageInMonthsDays } from '../lib/clinical.js';

/* ======================= Pusat edukasi ======================= */
export function Edukasi() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const ga = gestationalAge(pregnancy.hpht, DEMO_TODAY);
  const kid = ageInMonthsDays(child.dob, DEMO_TODAY);
  const featured = state.synced ? articles.find((a) => a.sentBy) : null;
  const match = (a) => !q || (a.title + ' ' + a.topic + ' ' + a.teaser).toLowerCase().includes(q.toLowerCase());
  const list = (aud) => articles.filter((a) => a.audience === aud && a.id !== featured?.id && match(a));

  const section = (aud, title, sub) => {
    const items = list(aud);
    if (!items.length) return null;
    return (
      <div className="stack">
        <span className="between" style={{ alignItems: 'baseline' }}><span className="h-section">{title}</span><span className="small">{sub}</span></span>
        {items.map((a) => (
          <Link key={a.id} to={'/artikel/' + a.id} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 }}>
            <span className={'thumb ' + aud}><Icon name="book" size={24} stroke={1.8} /></span>
            <span className="stack-sm grow">
              <span style={{ fontSize: 12, fontWeight: 700, color: aud === 'ibu' ? 'var(--coral-ink)' : 'var(--blue)' }}>{a.topic}</span>
              <b style={{ fontSize: 14, lineHeight: 1.3 }}>{a.title}</b>
              <span className="small">{a.minutes} menit · Buku KIA hlm. {a.pages}{state.read[a.id] ? ' · sudah dibaca' : ''}</span>
            </span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="screen">
      <TopBar title="Belajar dari Buku KIA" backTo="/" />
      <div className="content" style={{ gap: 16 }}>
        <label className="search">
          <Icon name="search" size={20} stroke={2} />
          <span className="sr-only">Cari artikel</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari: anemia, MPASI, gigi…" />
        </label>

        {featured && match(featured) ? (
          <Link to={'/artikel/' + featured.id} className="card teal fade-in" style={{ padding: 18 }}>
            <span className="row" style={{ gap: 8 }}>
              <span className="avatar" style={{ width: 28, height: 28, background: '#fff', color: 'var(--teal)', fontSize: 11 }}>{staff.bidan.initials}</span>
              <span style={{ fontSize: 12, color: '#CDE8E1' }}>Dikirim {staff.bidan.name} setelah kunjungan K3</span>
            </span>
            <b style={{ fontSize: 20, lineHeight: 1.25 }}>{featured.title}</b>
            <span style={{ fontSize: 13, lineHeight: 1.45, color: '#E3F3EF' }}>{featured.teaser}</span>
            <span style={{ fontSize: 12, color: '#CDE8E1' }}>{featured.minutes} menit baca · Buku KIA hlm. {featured.pages}</span>
          </Link>
        ) : null}

        <div className="filter" role="group" aria-label="Saring artikel">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Semua</button>
          <button type="button" aria-pressed={filter === 'ibu'} onClick={() => setFilter('ibu')}>{mother.short}</button>
          <button type="button" aria-pressed={filter === 'anak'} onClick={() => setFilter('anak')}>{child.short}</button>
        </div>

        {filter !== 'anak' ? section('ibu', `Untuk Ibu · minggu ke-${ga.weeks}`, 'Trimester 2') : null}
        {filter !== 'ibu' ? section('anak', `Untuk ${child.short} · ${kid.months} bulan`, 'Usia 12–24 bulan') : null}
        {q && !articles.some(match) ? <div className="card"><span className="body">Belum ada artikel untuk “{q}”.</span></div> : null}

        <div className="stack">
          <span className="h-section">Semua topik Buku KIA</span>
          <div className="grid2" style={{ gap: 8 }}>
            {topics.map((t) => (
              <button key={t.name} type="button" className="tile" style={{ minHeight: 64, justifyContent: 'center', textAlign: 'left', cursor: 'pointer', font: 'inherit' }} onClick={() => setQ(t.name.split(' ')[0])}>
                <b style={{ fontSize: 14 }}>{t.name}</b><span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.part}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="small" style={{ textAlign: 'center', lineHeight: 1.5 }}>Diringkas dari Buku Kesehatan Ibu dan Anak, Kemenkes RI 2025, dan ditinjau tim medis RS JIH Solo.</span>
      </div>
    </div>
  );
}

/* ======================= Halaman artikel ======================= */
function TtdTracker() {
  const { state, update } = useStore();
  const names = ['Kam', 'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab'];
  return (
    <div className="card ground" style={{ gap: 12 }}>
      <span className="between"><b style={{ fontSize: 15 }}>Catatan minum minggu ini</b><span className="teal" style={{ fontWeight: 800, fontSize: 13 }}>{state.ttd.filter(Boolean).length}/7 hari</span></span>
      <div className="days">
        {names.map((n, i) => (
          <button key={n} type="button" className="day" aria-pressed={state.ttd[i]} aria-label={`${n} ${i + 1} Oktober, ${state.ttd[i] ? 'sudah minum' : 'belum minum'}`}
            onClick={() => update((s) => ({ ttd: s.ttd.map((v, j) => (j === i ? !v : v)) }))}>
            <small>{n}</small><b>{i + 1}</b>
          </button>
        ))}
      </div>
      <span className="small">Sama seperti tabel tablet tambah darah di Buku KIA. Tercatat untuk dilihat bidan saat K4.</span>
    </div>
  );
}

function MpasiAges() {
  const [age, setAge] = useState(2);
  const cur = mpasiAges[age];
  return (
    <div className="card ground" style={{ gap: 12 }}>
      <span className="h-section">Porsi dan tekstur sesuai usia</span>
      <div className="seg" role="group" aria-label="Pilih usia" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {mpasiAges.map((a, i) => <button key={a.label} type="button" aria-pressed={age === i} onClick={() => setAge(i)}>{a.label}</button>)}
      </div>
      {age === 2 ? <span className="chip chip-blue fade-in" style={{ fontSize: 12 }}>Usia {child.short} sekarang</span> : null}
      {[['Tekstur', cur.texture], ['Jumlah', cur.amount], ['Frekuensi', cur.freq]].map(([k, v]) => (
        <div key={k} className="row top" style={{ gap: 12, padding: 12, borderRadius: 12, background: '#fff' }}>
          <span style={{ flex: 'none', width: 80, fontSize: 12, fontWeight: 700, color: 'var(--muted)', paddingTop: 2 }}>{k}</span>
          <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{v}</span>
        </div>
      ))}
      <span className="small">Mangkok ukuran 250 ml. Sesuai tabel pemberian makan di Buku KIA.</span>
    </div>
  );
}

function Menus() {
  const [i, setI] = useState(0);
  const m = menus[i];
  return (
    <div className="card" style={{ gap: 12 }}>
      <span className="between"><span className="eyebrow" style={{ color: 'var(--blue)' }}>Ide menu minggu ini</span><span className="small">{i + 1} dari {menus.length}</span></span>
      <b style={{ fontSize: 20 }}>{m.name}</b>
      <span className="body">{m.desc}</span>
      <div className="stack-sm" style={{ padding: 12, borderRadius: 12, background: 'var(--ground)' }}>
        <b style={{ fontSize: 13 }}>Bahan</b><span className="body-sm">{m.bahan}</span>
        <b style={{ fontSize: 13, paddingTop: 6 }}>Cara membuat</b><span className="body-sm">{m.cara}</span>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={() => setI((i + menus.length - 1) % menus.length)}>Sebelumnya</button>
        <button type="button" className="btn btn-blue" onClick={() => setI((i + 1) % menus.length)}>Menu lain</button>
      </div>
    </div>
  );
}

function Block({ b }) {
  switch (b.type) {
    case 'h': return <h2 className="prose-h">{b.text}</h2>;
    case 'p': return <p className="prose-p">{b.text}</p>;
    case 'steps': return <div className="stack">{b.items.map((t, i) => <div key={i} className="step"><span className="step-n">{i + 1}</span><span dangerouslySetInnerHTML={{ __html: t }} /></div>)}</div>;
    case 'list': return <ul className="bullets">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
    case 'checks': return <div className="stack">{b.items.map((t) => <div key={t} className="row top body" style={{ fontSize: 15 }}><span style={{ color: 'var(--teal)', flex: 'none' }}><Icon name="check" size={20} stroke={2.4} /></span>{t}</div>)}</div>;
    case 'portions': return (
      <div className="stack">
        <div className="card flush">
          {b.items.map((p) => (
            <div key={p.name} className="list-row" style={{ minHeight: 0, padding: '11px 14px' }}>
              <span style={{ flex: 'none', width: 56, textAlign: 'center', fontSize: 15, fontWeight: 800, color: 'var(--teal)' }}>{p.n}</span>
              <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{p.name}</b><span className="small">{p.example}</span></span>
            </div>
          ))}
        </div>
        {b.foot ? <span className="body-sm">{b.foot}</span> : null}
      </div>
    );
    case 'chips': return <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>{b.items.map((c) => <span key={c.label} className={c.tone === 'coral' ? 'pill-coral' : 'pill-green'}>{c.label}</span>)}</div>;
    case 'danger': return (
      <div className="card danger">
        <b style={{ fontSize: 16, color: 'var(--danger-ink)' }}>{b.title}</b>
        <span className="body" style={{ lineHeight: 1.6 }}>{b.text}</span>
        {b.action ? <button type="button" className="btn btn-danger"><Icon name="phone" size={18} />{b.action}</button> : null}
      </div>
    );
    case 'callout': return <div className="card teal-tint"><b style={{ fontSize: 14 }}>{b.title}</b><span className="body-sm" style={{ color: 'var(--teal-ink)' }}>{b.text}</span></div>;
    case 'stat2': return (
      <div className="grid2">{b.items.map((s) => (
        <div key={s.value} className="tile" style={{ border: 'none', background: s.tone === 'blue' ? 'var(--blue-soft)' : 'var(--teal-tint)' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: s.tone === 'blue' ? 'var(--blue)' : 'var(--teal)' }}>{s.value}</span>
          <span className="body-sm" style={{ color: 'var(--ink)' }}>{s.text}</span>
        </div>
      ))}</div>
    );
    case 'plate': return (
      <div className="grid2" style={{ gap: 8 }}>
        <span className="body-sm" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--coral-tint)', color: 'var(--ink)' }}><b>Lauk hewani</b><br />telur, ikan, ayam, hati, daging</span>
        <span className="body-sm" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--warn-bg)', color: 'var(--ink)' }}><b>Makanan pokok</b><br />nasi, kentang, jagung, ubi</span>
        <span className="body-sm" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--ok-bg)', color: 'var(--ink)' }}><b>Sayur & buah</b><br />labu kuning, wortel, bayam, pepaya</span>
        <span className="body-sm" style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--line-soft)', color: 'var(--ink)' }}><b>Lemak tambahan</b><br />minyak, santan, mentega</span>
      </div>
    );
    case 'ttdTracker': return <TtdTracker />;
    case 'mpasiAges': return <MpasiAges />;
    case 'menus': return <Menus />;
    case 'growthLink': {
      const g = growthRecords[growthRecords.length - 1];
      return (
        <Link to="/tumbuh" className="card teal-tint" style={{ flexDirection: 'row', gap: 12 }}>
          <span style={{ color: 'var(--teal)', flex: 'none' }}><Icon name="chart" /></span>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Berat {child.short} {String(g.weightKg).replace('.', ',')} kg dan tumbuh sesuai kurva. Pertahankan pola makan ini. <b>Lihat grafik</b></span>
        </Link>
      );
    }
    default: return null;
  }
}

export function Artikel({ id }) {
  const { state, update } = useStore();
  const a = articles.find((x) => x.id === id);
  if (!a) return <div className="screen"><TopBar title="Artikel" backTo="/edukasi" /><div className="content"><div className="card">Artikel tidak ditemukan.</div></div></div>;
  const saved = !!state.saved[a.id];
  const read = !!state.read[a.id];
  const isIbu = a.audience === 'ibu';

  return (
    <div className="screen white">
      <TopBar
        title=""
        backTo="/edukasi"
        right={
          <button type="button" className="icon-btn" aria-pressed={saved} aria-label={saved ? 'Hapus dari simpanan' : 'Simpan artikel'}
            onClick={() => update((s) => ({ saved: { ...s.saved, [a.id]: !saved } }))} style={{ color: saved ? 'var(--teal)' : 'var(--ink)' }}>
            <Icon name="bookmark" size={20} stroke={1.8} fill={saved ? 'currentColor' : 'none'} />
          </button>
        }
      />
      <article className="article-body">
        <div className="stack">
          <span className="eyebrow" style={{ color: isIbu ? 'var(--coral-ink)' : 'var(--blue)' }}>{a.topic} · {isIbu ? 'Untuk Ibu' : 'Untuk ' + child.short}</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.4 }}>{a.title}</h1>
          <span className="small" style={{ fontSize: 13 }}>{a.minutes} menit baca · Diringkas dari Buku KIA hlm. {a.pages}</span>
        </div>

        {a.sentBy && state.synced ? (
          <div className="card warn" style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
            <span className="avatar" style={{ width: 36, height: 36, background: '#fff', color: 'var(--warn-ink)', fontSize: 12 }}>{staff.bidan.initials}</span>
            <span className="stack-sm">
              <b style={{ fontSize: 13 }}>Pesan {staff.bidan.name.replace(' Wulandari', '')} untuk {mother.short}</b>
              <span style={{ fontSize: 13, lineHeight: 1.5 }}>Hb Ibu 10,6 g/dL saat K3. Yuk baca ini dan minum 2 tablet tambah darah setiap malam. Kita cek lagi Hb-nya di K4 tanggal 12 November.</span>
            </span>
          </div>
        ) : null}

        {a.blocks.map((b, i) => <Block key={i} b={b} />)}

        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => update((s) => ({ read: { ...s.read, [a.id]: !read } }))}>{read ? 'Sudah dibaca' : 'Tandai sudah dibaca'}</button>
          {a.id === 'anemia' && state.synced ? <Link to="/kunjungan/k3" className="btn btn-secondary">Lihat hasil K3</Link> : <button type="button" className="btn btn-secondary">{isIbu ? 'Tanya bidan' : 'Tanya ahli gizi'}</button>}
        </div>
        <span className="small" style={{ textAlign: 'center', lineHeight: 1.5 }}>Ditinjau tim medis RS JIH Solo. Bukan pengganti konsultasi dengan dokter atau bidan.</span>
      </article>
    </div>
  );
}
