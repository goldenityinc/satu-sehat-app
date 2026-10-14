import { useState } from 'react';
import { Link } from '../router.jsx';
import { useStore } from '../store.jsx';
import { Icon, TopBar, Chip, Avatar, TONES } from '../components/ui.jsx';
import { MODULES, facilityName, doctorById, CRITICAL_MODULES } from '../data/patients.js';
import { fmtShort } from '../lib/clinical.js';

function SatuSehat({ label = 'SATUSEHAT' }) {
  return <span className="ss-badge"><Icon name="cloud" size={13} stroke={2} />{label}</span>;
}

/* ======================= Rekam medis pasien (hanya baca) ======================= */
export function RekamMedis() {
  const { state, patient: p } = useStore();
  const pd = state.personalDoctors[p.id] || {};
  const conditions = p.conditions.filter((c) => !c.synced || state.synced);

  return (
    <div className="screen">
      <TopBar title="Rekam Medis" backTo="/" />
      <div className="content">
        <div className="lock-note"><Icon name="lock" size={16} />Hanya dapat dibaca. Diisi dokter dan tersinkron dengan SATUSEHAT Kemenkes.</div>

        <div className="card" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <Avatar initials={p.initials} tone={p.sex === 'P' ? 'coral' : 'blue'} size={48} />
            <span className="stack-sm"><b style={{ fontSize: 17 }}>{p.name}</b><span className="small">ID Sehat {p.healthId} · SATUSEHAT {p.satusehatId}</span></span>
          </div>
          <div className="grid3">
            <div className="stack-sm"><span className="small">Gol. darah</span><b>{p.bloodType}</b></div>
            <div className="stack-sm"><span className="small">Alergi</span><b>{p.allergies.join(', ')}</b></div>
            <div className="stack-sm"><span className="small">Faskes utama</span><b style={{ fontSize: 13 }}>{facilityName(p.homeFacility)}</b></div>
          </div>
        </div>

        <div className="card flush">
          <div className="group-head"><b style={{ fontSize: 14 }}>Diagnosis aktif</b><span className="small">{conditions.length} diagnosis · ICD-10</span></div>
          {conditions.map((c) => {
            const t = TONES[MODULES[c.module]?.tone ?? 'slate'];
            return (
              <div key={c.code + c.name} className="list-row" style={{ alignItems: 'flex-start' }}>
                <span className="chip" style={{ background: t.bg, color: t.fg, fontSize: 12, minWidth: 52, justifyContent: 'center' }}>{c.code}</span>
                <span className="stack-sm grow">
                  <span className="between"><b style={{ fontSize: 14, lineHeight: 1.35 }}>{c.name}</b>{c.isNew ? <Chip tone="new">Baru</Chip> : null}</span>
                  <span className="small">Sejak {fmtShort(c.since)} · {c.by}</span>
                  <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span className="small">{facilityName(c.facility)}</span>
                    <SatuSehat label="Condition" />
                    {c.module ? <span className="small" style={{ color: t.fg, fontWeight: 700 }}>· Modul {MODULES[c.module].name}</span> : null}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ gap: 12 }}>
          <span className="between"><span className="h-card">Tim dokter</span><Link to="/dokter-pribadi" style={{ fontSize: 13, fontWeight: 700 }}>Atur dokter pribadi</Link></span>
          {p.modules.map((m) => (
            <div key={m} className="stack" style={{ gap: 8, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
              <span className="row" style={{ gap: 8 }}>
                <span className="chip" style={{ background: TONES[MODULES[m].tone].bg, color: TONES[MODULES[m].tone].fg, fontSize: 12 }}>{MODULES[m].long}</span>
                {CRITICAL_MODULES.includes(m) && !pd[m] ? <Chip tone="warn">Dokter pribadi belum dipilih</Chip> : null}
              </span>
              {(p.careTeam[m] || []).map((id) => {
                const d = doctorById(id);
                return (
                  <div key={id} className="row" style={{ gap: 10 }}>
                    <Avatar initials={d.initials} tone="blue" size={36} />
                    <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{d.name}</b><span className="small">{d.specialty} · {facilityName(d.facility ?? 'jih')}</span></span>
                    {pd[m] === id ? <span className="chip chip-new">Dokter pribadi</span> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="card flush">
          <div className="group-head"><b style={{ fontSize: 14 }}>Obat aktif</b><Link to="/obat" className="small" style={{ fontWeight: 700, color: 'var(--teal)' }}>Catat minum obat</Link></div>
          {p.meds.map((m) => (
            <div key={m.id} className="list-row" style={{ minHeight: 0 }}>
              <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{m.name}</b><span className="small">{m.dose} · {m.time} · {m.note}</span></span>
            </div>
          ))}
        </div>
        <Link to="/riwayat" className="btn btn-secondary">Lihat riwayat kunjungan lintas faskes</Link>
      </div>
    </div>
  );
}

/* ======================= Pilih dokter pribadi ======================= */
export function DokterPribadi() {
  const { state, patient: p, setPersonalDoctor } = useStore();
  const pd = state.personalDoctors[p.id] || {};
  const [draft, setDraft] = useState(() => ({ ...pd }));
  const [consent, setConsent] = useState(Object.keys(pd).length > 0);
  const [saved, setSaved] = useState(false);
  const ordered = [...p.modules].sort((a, b) => CRITICAL_MODULES.includes(b) - CRITICAL_MODULES.includes(a));
  const missing = ordered.filter((m) => CRITICAL_MODULES.includes(m) && !draft[m]);

  const save = () => {
    Object.entries(draft).forEach(([m, d]) => { if (d) setPersonalDoctor(p.id, m, d); });
    setSaved(true);
  };

  return (
    <div className="screen">
      <TopBar title="Dokter Pribadi" backTo="/" />
      <div className="content">
        <div className="card teal-tint" style={{ gap: 8 }}>
          <b style={{ fontSize: 15 }}>Dokter pribadi langsung tahu bila terjadi sesuatu</b>
          <ul className="bullets" style={{ fontSize: 14, color: 'var(--teal-ink)' }}>
            <li>Anda menekan tombol <b>Darurat</b></li>
            <li>Anda tercatat di <b>IGD faskes mana pun</b> yang terhubung SATUSEHAT</li>
            <li>Hasil pemeriksaan di faskes mana pun <b>melewati batas wajar</b> (misalnya TD ≥ 180/120)</li>
          </ul>
          <span className="body-sm" style={{ color: 'var(--teal-ink)' }}>Wajib untuk penyakit berisiko tinggi seperti jantung dan stroke. Rekam medis lengkap tetap hanya dibuka lewat scan QR, termasuk oleh dokter pribadi.</span>
        </div>

        {ordered.map((m) => {
          const team = p.careTeam[m] || [];
          const critical = CRITICAL_MODULES.includes(m);
          return (
            <div key={m} className="card" style={{ gap: 10 }} role="radiogroup" aria-label={'Dokter pribadi ' + MODULES[m].long}>
              <span className="between">
                <span className="row" style={{ gap: 8 }}>
                  <span className="menu-ico" style={{ width: 36, height: 36, borderRadius: 12, background: TONES[MODULES[m].tone].bg, color: TONES[MODULES[m].tone].fg }}><Icon name={MODULES[m].icon} size={20} /></span>
                  <b style={{ fontSize: 15 }}>{MODULES[m].long}</b>
                </span>
                {critical ? <Chip tone="warn">Wajib</Chip> : <Chip tone="na">Opsional</Chip>}
              </span>
              {team.map((id) => {
                const d = doctorById(id);
                const on = draft[m] === id;
                return (
                  <button key={id} type="button" role="radio" aria-checked={on} onClick={() => { setDraft({ ...draft, [m]: id }); setSaved(false); }}
                    className="row" style={{ gap: 10, padding: 12, borderRadius: 14, border: on ? '2px solid var(--teal)' : '1px solid var(--line)', background: on ? 'var(--teal-tint)' : '#fff', cursor: 'pointer', font: 'inherit', textAlign: 'left', color: 'var(--ink)' }}>
                    <Avatar initials={d.initials} tone="blue" size={40} />
                    <span className="stack-sm grow"><b style={{ fontSize: 14 }}>{d.name}</b><span className="small">{d.specialty} · {facilityName(d.facility ?? 'jih')}</span></span>
                    <span style={{ width: 22, height: 22, borderRadius: 11, border: on ? '7px solid var(--teal)' : '2px solid #A9B5B1', flex: 'none', background: '#fff' }} />
                  </button>
                );
              })}
              <span className="small">Pilihan dari tim dokter yang menangani Anda untuk penyakit ini.</span>
            </div>
          );
        })}

        <label className="check card" style={{ flexDirection: 'row' }}>
          <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} />
          <span className="body-sm">Saya mengizinkan dokter pribadi menerima notifikasi darurat dan nilai pemeriksaan saya yang melewati batas wajar. Izin bisa dicabut kapan saja.</span>
        </label>
        <button type="button" className="btn btn-primary" style={{ minHeight: 54 }} disabled={!consent || missing.length > 0} onClick={save}>
          {missing.length ? `Pilih dokter untuk ${missing.map((m) => MODULES[m].name).join(' & ')}` : 'Simpan dokter pribadi'}
        </button>
        {saved ? <span className="body-sm fade-in" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--ok-bg)', color: '#0F4A2E' }}>Tersimpan. Dokter pribadi Anda sudah terhubung dan akan menerima peringatan otomatis.</span> : null}
      </div>
    </div>
  );
}
