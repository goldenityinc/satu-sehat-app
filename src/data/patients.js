// Registri pasien, dokter, faskes, dan kader untuk demo multi-modul.
// Semua nama, nomor, dan angka adalah fiktif. Data klinis per modul mengikuti pedoman umum
// (TBC: Juknis Kemenkes; Jantung/Stroke: target faktor risiko) dan wajib divalidasi tim medis.

export const facilities = [
  { id: 'jih', name: 'RS JIH Solo', type: 'Rumah sakit', partner: false, city: 'Surakarta' },
  { id: 'mitra', name: 'Klinik Pratama Mitra Sehat', type: 'Klinik mitra', partner: true, city: 'Surakarta' },
  { id: 'pkm', name: 'Puskesmas Mitra Banjarsari', type: 'Puskesmas mitra', partner: true, city: 'Surakarta' }
];
export const facilityName = (id) => facilities.find((f) => f.id === id)?.name ?? id;

export const doctors = [
  { id: 'hendra', name: 'dr. Hendra Wibisono, Sp.JP', short: 'dr. Hendra', specialty: 'Jantung & pembuluh darah', unit: 'Poli Jantung', initials: 'HW' },
  { id: 'yusuf', name: 'dr. Yusuf Hidayat, Sp.N', short: 'dr. Yusuf', specialty: 'Saraf', unit: 'Poli Saraf', initials: 'YH' },
  { id: 'laras', name: 'dr. Laras Pramesti, Sp.P', short: 'dr. Laras', specialty: 'Paru', unit: 'Poli Paru', initials: 'LP' },
  { id: 'anindita', name: 'dr. Anindita Prameswari, Sp.OG', short: 'dr. Anindita', specialty: 'Kebidanan & kandungan', unit: 'Poli Kebidanan', initials: 'AP' },
  { id: 'rani', name: 'dr. Maharani Putri, Sp.KFR', short: 'dr. Rani', specialty: 'Rehabilitasi medik', unit: 'Instalasi Rehab Medik', initials: 'MP' },
  { id: 'ayu', name: 'dr. Ayu Lestari', short: 'dr. Ayu', specialty: 'Dokter umum', unit: 'Poli Umum', initials: 'AL', facility: 'mitra' },
  { id: 'dewi', name: 'dr. Dewi Kartikasari, Sp.PD-KEMD', short: 'dr. Dewi', specialty: 'Penyakit dalam (endokrin)', unit: 'Poli Penyakit Dalam', initials: 'DK' },
  { id: 'ratna', name: 'Bd. Ratna Wulandari', short: 'Bd. Ratna', specialty: 'Bidan', unit: 'Poli Kebidanan', initials: 'RW' }
];
export const doctorById = (id) => doctors.find((d) => d.id === id);

// Modul dengan risiko kegawatan tinggi: pasien wajib memilih dokter pribadi.
export const CRITICAL_MODULES = ['jantung', 'stroke'];

// Katalog diagnosis (ICD-10) yang bisa ditambahkan dokter. Diagnosis yang terhubung ke modul akan mengaktifkan modulnya.
export const CONDITION_CATALOG = [
  { code: 'I10', name: 'Hipertensi esensial', module: 'jantung' },
  { code: 'I25.1', name: 'Penyakit jantung koroner (aterosklerotik)', module: 'jantung' },
  { code: 'I50.9', name: 'Gagal jantung', module: 'jantung' },
  { code: 'I63.9', name: 'Stroke iskemik (infark serebral)', module: 'stroke' },
  { code: 'A15.0', name: 'TBC paru terkonfirmasi bakteriologis', module: 'tbc' },
  { code: 'O99.0', name: 'Anemia dalam kehamilan', module: 'kia' },
  { code: 'E11.9', name: 'Diabetes melitus tipe 2', module: 'diabetes' }
];

// Perawat pendamping (home care & pengawas minum obat). Variabel tetap bernama `kader` agar kode lama tidak berubah.
export const kader = { id: 'perawat', name: 'Ns. Sri Sumarni, S.Kep.', short: 'Ns. Sumarni', role: 'Perawat home care · PMO', area: 'Wilayah Banjarsari', initials: 'SS', specialty: 'Perawat', unit: 'Home care', puskesmas: 'RS JIH Solo' };

// Modul layanan. Hanya modul yang diikuti pasien yang tampil di beranda.
export const MODULES = {
  kia: { id: 'kia', name: 'KIA', long: 'Kesehatan Ibu & Anak', icon: 'baby', tone: 'coral', route: '/kia' },
  tbc: { id: 'tbc', name: 'TBC', long: 'Pengobatan TBC', icon: 'lungs', tone: 'amber', route: '/modul/tbc' },
  jantung: { id: 'jantung', name: 'Jantung', long: 'Penyakit jantung', icon: 'heartPulse', tone: 'red', route: '/modul/jantung' },
  stroke: { id: 'stroke', name: 'Stroke', long: 'Pemulihan stroke', icon: 'brain', tone: 'purple', route: '/modul/stroke' },
  diabetes: { id: 'diabetes', name: 'Diabetes', long: 'Diabetes', icon: 'drop', tone: 'blue', route: '/modul/diabetes' }
};

export const patients = [
  {
    id: 'rina', name: 'Rina Kartika', short: 'Ibu Rina', greet: 'Ibu Rina', initials: 'RK', sex: 'P', dob: '1997-02-19',
    nik: '3372••••••••0003', healthId: 'JIH-0048-2103', satusehatId: 'P02478193301', bloodType: 'O+', allergies: ['Tidak ada'],
    modules: ['kia'], homeFacility: 'jih',
    conditions: [
      { code: 'Z34.8', name: 'Kehamilan normal, 24 minggu (G2P1A0)', module: 'kia', since: '2026-05-20', by: 'Bd. Siti Aminah', facility: 'pkm' },
      { code: 'O99.0', name: 'Anemia ringan dalam kehamilan', module: 'kia', since: '2026-10-01', by: 'Bd. Ratna Wulandari', facility: 'jih', synced: true }
    ],
    careTeam: { kia: ['anindita', 'ratna'] },
    meds: [
      { id: 'ttd', name: 'Tablet tambah darah 60 mg', dose: '2 tablet', time: 'malam', note: 'Bersama air jeruk, jangan dengan teh/susu', module: 'kia' },
      { id: 'kalsium', name: 'Kalsium 500 mg', dose: '1 tablet', time: 'pagi', note: 'Setelah sarapan', module: 'kia' }
    ],
    encounters: [
      { id: 'r-k2', date: '2026-08-06', facility: 'jih', unit: 'Poli Kebidanan', doctor: 'Bd. Ratna Wulandari', module: 'kia', title: 'Pemeriksaan kehamilan K2', summary: 'Kondisi ibu dan janin baik. Usia kehamilan 15 minggu.' },
      { id: 'r-k1', date: '2026-06-04', facility: 'jih', unit: 'Poli Kebidanan', doctor: 'dr. Anindita Prameswari, Sp.OG', module: 'kia', title: 'Pemeriksaan dokter + USG K1', summary: 'Janin tunggal, perkiraan lahir 28 Jan 2027.' },
      { id: 'r-pkm', date: '2026-05-20', facility: 'pkm', unit: 'Poli KIA', doctor: 'Bd. Siti Aminah', module: 'kia', title: 'Tes kehamilan & pendaftaran Buku KIA', summary: 'Tes kehamilan positif. Dirujuk ke RS JIH Solo untuk USG.' }
    ]
  },
  {
    id: 'slamet', name: 'Slamet Riyadi', short: 'Pak Slamet', greet: 'Pak Slamet', initials: 'SR', sex: 'L', dob: '1962-05-07',
    nik: '3372••••••••0011', healthId: 'JIH-0031-7740', satusehatId: 'P02478193318', bloodType: 'A+', allergies: ['Tidak ada'],
    modules: ['jantung', 'stroke'], homeFacility: 'jih',
    conditions: [
      { code: 'I25.1', name: 'Penyakit jantung koroner, pasca pemasangan stent', module: 'jantung', since: '2025-11-20', by: 'dr. Hendra Wibisono, Sp.JP', facility: 'jih' },
      { code: 'I10', name: 'Hipertensi', module: 'jantung', since: '2019-06-01', by: 'dr. Ayu Lestari', facility: 'mitra' },
      { code: 'I63.9', name: 'Stroke iskemik, lemah sisi kanan (fase pemulihan)', module: 'stroke', since: '2026-03-14', by: 'dr. Yusuf Hidayat, Sp.N', facility: 'jih' }
    ],
    careTeam: { jantung: ['hendra', 'ayu'], stroke: ['yusuf', 'rani'] },
    meds: [
      { id: 'aspirin', name: 'Aspirin 80 mg', dose: '1 tablet', time: 'pagi', note: 'Setelah makan', module: 'jantung' },
      { id: 'clopidogrel', name: 'Clopidogrel 75 mg', dose: '1 tablet', time: 'pagi', note: 'Jangan berhenti tanpa izin dokter', module: 'jantung' },
      { id: 'bisoprolol', name: 'Bisoprolol 2,5 mg', dose: '1 tablet', time: 'pagi', note: 'Pengatur detak jantung', module: 'jantung' },
      { id: 'ramipril', name: 'Ramipril 5 mg', dose: '1 tablet', time: 'pagi', note: 'Penurun tekanan darah', module: 'jantung' },
      { id: 'atorva', name: 'Atorvastatin 40 mg', dose: '1 tablet', time: 'malam', note: 'Penurun kolesterol', module: 'stroke' }
    ],
    encounters: [
      { id: 's-6', date: '2026-10-02', facility: 'jih', unit: 'Instalasi Rehab Medik', doctor: 'dr. Yusuf Hidayat, Sp.N', module: 'stroke', title: 'Evaluasi rehabilitasi stroke', summary: 'Kekuatan tangan kanan membaik. Lanjut fisioterapi 2x seminggu.' },
      { id: 's-5', date: '2026-09-15', facility: 'mitra', unit: 'Poli Umum', doctor: 'dr. Ayu Lestari', module: 'jantung', title: 'Kontrol tekanan darah (klinik mitra)', summary: 'TD 136/82. Obat dilanjutkan, kontrol ke Sp.JP bulan depan.' },
      { id: 's-4', date: '2026-08-11', facility: 'jih', unit: 'Poli Jantung', doctor: 'dr. Hendra Wibisono, Sp.JP', module: 'jantung', title: 'Kontrol jantung', summary: 'Tidak ada nyeri dada. LDL 78 mg/dL, masih di atas target.' },
      { id: 's-3', date: '2026-06-10', facility: 'jih', unit: 'Poli Saraf', doctor: 'dr. Yusuf Hidayat, Sp.N', module: 'stroke', title: 'Kontrol saraf', summary: 'Bicara sudah jelas, berjalan dengan tongkat.' },
      { id: 's-2', date: '2026-03-20', facility: 'jih', unit: 'Rawat Inap Stroke', doctor: 'dr. Yusuf Hidayat, Sp.N', module: 'stroke', title: 'Pulang rawat inap', summary: 'Stroke iskemik, lemah sisi kanan. Rehab medik dimulai.' },
      { id: 's-1', date: '2026-03-14', facility: 'jih', unit: 'IGD', doctor: 'dr. Rizal Fahmi', module: 'stroke', title: 'IGD: serangan stroke', summary: 'Tiba 90 menit setelah gejala. CT scan: stroke iskemik.' }
    ],
    jantung: {
      bp: [
        { date: '2026-03-14', sys: 162, dia: 98 }, { date: '2026-05-12', sys: 148, dia: 90 },
        { date: '2026-08-11', sys: 136, dia: 84 }, { date: '2026-09-15', sys: 136, dia: 82 }, { date: '2026-10-02', sys: 132, dia: 80 }
      ],
      ldl: [{ date: '2026-03-15', value: 142 }, { date: '2026-05-12', value: 96 }, { date: '2026-08-11', value: 78 }],
      ef: { value: 48, date: '2025-11-20' },
      stent: 'Stent di pembuluh koroner kiri (LAD), 20 Nov 2025',
      nextControl: { date: '2026-10-20', unit: 'Poli Jantung', doctor: 'dr. Hendra Wibisono, Sp.JP' }
    },
    stroke: {
      onset: '2026-03-14',
      type: 'Stroke iskemik (sumbatan), sisi kanan lemah',
      nihss: [{ date: '2026-03-14', value: 8 }, { date: '2026-04-02', value: 5 }, { date: '2026-06-10', value: 3 }, { date: '2026-10-02', value: 2 }],
      mrs: [{ date: '2026-03-20', value: 4 }, { date: '2026-04-02', value: 3 }, { date: '2026-06-10', value: 2 }, { date: '2026-10-02', value: 2 }],
      rehab: { sessions: 48, schedule: 'Selasa & Jumat, 08.00', next: '2026-10-09', unit: 'Instalasi Rehab Medik RS JIH Solo' },
      risks: [
        { label: 'Tekanan darah', value: '132/80', target: '< 130/80', ok: false },
        { label: 'LDL kolesterol', value: '78 mg/dL', target: '< 55 mg/dL', ok: false },
        { label: 'Gula darah puasa', value: '104 mg/dL', target: '< 126 mg/dL', ok: true },
        { label: 'Merokok', value: 'Berhenti sejak Mar 2026', target: 'Tidak merokok', ok: true }
      ]
    }
  },
  {
    id: 'dimas', name: 'Dimas Prasetyo', short: 'Dimas', greet: 'Mas Dimas', initials: 'DP', sex: 'L', dob: '1998-01-23',
    nik: '3372••••••••0027', healthId: 'JIH-0052-1186', satusehatId: 'P02478193325', bloodType: 'B+', allergies: ['Tidak ada'],
    modules: ['tbc'], homeFacility: 'mitra',
    conditions: [{ code: 'A15.0', name: 'TBC paru terkonfirmasi bakteriologis, sensitif obat', module: 'tbc', since: '2026-07-24', by: 'dr. Laras Pramesti, Sp.P', facility: 'jih' }],
    careTeam: { tbc: ['laras', 'ayu'] },
    meds: [
      { id: 'oat', name: 'OAT 2FDC (Rifampisin 150 mg + Isoniazid 75 mg)', dose: '3 tablet', time: 'pagi', note: 'Saat perut kosong, 1 jam sebelum sarapan', module: 'tbc' },
      { id: 'b6', name: 'Vitamin B6 10 mg', dose: '1 tablet', time: 'pagi', note: 'Mencegah kesemutan', module: 'tbc' }
    ],
    encounters: [
      { id: 'd-4', date: '2026-09-21', facility: 'mitra', unit: 'Poli TBC', doctor: 'dr. Ayu Lestari', module: 'tbc', title: 'Akhir fase intensif', summary: 'BTA negatif (konversi). Masuk fase lanjutan, obat diganti 2FDC.' },
      { id: 'd-3', date: '2026-08-24', facility: 'mitra', unit: 'Poli TBC', doctor: 'dr. Ayu Lestari', module: 'tbc', title: 'Kontrol bulan ke-1', summary: 'Batuk berkurang, BB naik 1,5 kg. Urine merah wajar karena obat.' },
      { id: 'd-2', date: '2026-07-27', facility: 'jih', unit: 'Poli Paru', doctor: 'dr. Laras Pramesti, Sp.P', module: 'tbc', title: 'Mulai pengobatan TBC', summary: 'TCM: MTB terdeteksi, sensitif rifampisin. Mulai 4FDC. Pengobatan lanjut di klinik mitra.' },
      { id: 'd-1', date: '2026-07-24', facility: 'jih', unit: 'Poli Paru', doctor: 'dr. Laras Pramesti, Sp.P', module: 'tbc', title: 'Pemeriksaan batuk 3 minggu', summary: 'Rontgen dada: infiltrat paru kanan atas. Dahak diperiksa TCM.' }
    ],
    tbc: {
      start: '2026-07-27', intensiveDays: 56, totalDays: 183, phaseSwitch: '2026-09-21',
      regimen: { intensive: '4FDC (RHZE) 3 tablet/hari', continuation: '2FDC (RH) 3 tablet/hari' },
      weights: [{ date: '2026-07-27', value: 49 }, { date: '2026-08-24', value: 50.5 }, { date: '2026-09-21', value: 51.5 }],
      sputum: [
        { date: '2026-07-24', test: 'TCM (tes cepat molekuler)', result: 'MTB terdeteksi, rifampisin sensitif', ok: false },
        { date: '2026-09-21', test: 'BTA akhir bulan ke-2', result: 'Negatif (konversi)', ok: true },
        { date: '2026-12-21', test: 'BTA bulan ke-5', result: 'Dijadwalkan', planned: true },
        { date: '2027-01-25', test: 'BTA akhir pengobatan', result: 'Dijadwalkan', planned: true }
      ],
      screening: [{ label: 'Tes HIV', value: 'Non-reaktif' }, { label: 'Gula darah', value: 'Normal (98 mg/dL)' }],
      contacts: { total: 3, screened: 3, tpt: 1, note: '1 anak (4 tahun) mendapat terapi pencegahan TBC (TPT)' },
      pmo: 'Ns. Sumarni (perawat home care)',
      nextPickup: { date: '2026-10-19', facility: 'mitra' },
      missed: ['2026-10-03', '2026-10-06']
    }
  },
  {
    id: 'sri', name: 'Sri Wahyuni', short: 'Bu Sri', greet: 'Bu Sri', initials: 'SW', sex: 'P', dob: '1968-08-14',
    nik: '3372••••••••0034', healthId: 'JIH-0047-5521', satusehatId: 'P02478193332', bloodType: 'AB+', allergies: ['Tidak ada'],
    modules: ['diabetes'], homeFacility: 'jih',
    conditions: [{ code: 'E11.9', name: 'Diabetes melitus tipe 2', module: 'diabetes', since: '2021-03-10', by: 'dr. Ayu Lestari', facility: 'mitra' }],
    careTeam: { diabetes: ['dewi', 'ayu'] },
    meds: [
      { id: 'metformin', name: 'Metformin 500 mg', dose: '1 tablet', time: 'pagi & malam', note: 'Sesudah makan', module: 'diabetes' },
      { id: 'glimepiride', name: 'Glimepiride 2 mg', dose: '1 tablet', time: 'pagi', note: 'Sebelum sarapan, jangan lewatkan makan', module: 'diabetes' }
    ],
    encounters: [
      { id: 'sr-3', date: '2026-09-24', facility: 'jih', unit: 'Poli Penyakit Dalam', doctor: 'dr. Dewi Kartikasari, Sp.PD-KEMD', module: 'diabetes', title: 'Kontrol diabetes', summary: 'HbA1c 7,8%, turun dari 8,2%. Glimepiride ditambahkan. Kesemutan ringan di kaki kiri, pemeriksaan mata dijadwalkan.' },
      { id: 'sr-2', date: '2026-06-18', facility: 'mitra', unit: 'Poli Umum', doctor: 'dr. Ayu Lestari', module: 'diabetes', title: 'Kontrol gula darah (klinik mitra)', summary: 'Gula darah puasa 156 mg/dL. Dirujuk ke Sp.PD RS JIH Solo untuk evaluasi.' },
      { id: 'sr-1', date: '2026-03-12', facility: 'jih', unit: 'Laboratorium', doctor: 'Laboratorium RS JIH Solo', module: 'diabetes', title: 'Pemeriksaan lab diabetes', summary: 'HbA1c 8,6%. Fungsi ginjal normal.' }
    ],
    diabetes: {
      type: 'Diabetes melitus tipe 2',
      hba1c: [{ date: '2025-12-10', value: 9.1 }, { date: '2026-03-12', value: 8.6 }, { date: '2026-06-18', value: 8.2 }, { date: '2026-09-24', value: 7.8 }],
      // Gula darah puasa dari glukometer di rumah (terkirim otomatis ke aplikasi).
      glucose: [
        { date: '2026-10-02', value: 142 }, { date: '2026-10-03', value: 138 }, { date: '2026-10-04', value: 151 }, { date: '2026-10-05', value: 129 },
        { date: '2026-10-06', value: 134 }, { date: '2026-10-07', value: 126 }, { date: '2026-10-08', value: 118 }
      ],
      device: 'Glukometer di rumah, terhubung ke aplikasi',
      body: { weight: 68, height: 155, waist: 92, bp: '134/84' },
      checks: [
        { label: 'Fungsi ginjal (eGFR & albumin urin)', date: '2026-09-24', result: 'Normal · eGFR 92', ok: true },
        { label: 'Pemeriksaan kaki (saraf & luka)', date: '2026-09-24', result: 'Kesemutan ringan di kaki kiri, tidak ada luka', ok: false },
        { label: 'LDL kolesterol', date: '2026-09-24', result: '108 mg/dL · target < 100', ok: false },
        { label: 'Pemeriksaan mata (retina)', date: '2026-10-15', result: 'Dijadwalkan di Poli Mata', planned: true }
      ],
      nextControl: { date: '2026-10-22', unit: 'Poli Penyakit Dalam', doctor: 'dr. Dewi Kartikasari, Sp.PD-KEMD' }
    }
  }
];

export const patientById = (id) => patients.find((p) => p.id === id);

// Catatan minum obat 7 hari terakhir (sebelum hari demo). true = diminum.
export function seedMedLogs() {
  const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
  const logs = {};
  for (const p of patients) {
    for (const m of p.meds) {
      for (const d of days) {
        let taken = true;
        if (p.id === 'dimas' && p.tbc.missed.includes(d)) taken = false;
        if (p.id === 'slamet' && m.id === 'atorva' && d === '2026-10-05') taken = false;
        if (p.id === 'rina' && m.id === 'ttd' && d >= '2026-10-05') taken = false;
        if (p.id === 'sri' && m.id === 'metformin' && d === '2026-10-04') taken = false;
        logs[`${p.id}:${m.id}:${d}`] = taken ? { by: p.id === 'dimas' && d !== '2026-10-04' ? 'kader' : 'pasien' } : null;
      }
    }
  }
  return logs;
}

export const LAST7 = ['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'];
