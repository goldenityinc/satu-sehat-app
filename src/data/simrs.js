// Data contoh yang mensimulasikan isi rekam medis SIMRS RS JIH Solo.
// Semua nama, nomor, dan angka adalah fiktif untuk keperluan demo.
// Field `batch` menandai kapan data dikirim: 'base' = sudah ada sejak awal demo,
// 'k3' = baru masuk saat bidan menyimpan hasil kunjungan K3 (lihat panel demo).

export const DEMO_TODAY = '2026-10-08';

export const facility = {
  name: 'RS JIH Solo',
  igdPhone: '(0271) 000-0000',
  units: { obgyn: 'Poli Kebidanan', peds: 'Poli Anak', lab: 'Laboratorium', pharmacy: 'Farmasi' }
};

export const staff = {
  bidan: { name: 'Bd. Ratna Wulandari', initials: 'RW' },
  spog: { name: 'dr. Anindita Prameswari, Sp.OG', short: 'dr. Anindita P., Sp.OG' },
  spa: { name: 'dr. Bagus Hendrawan, Sp.A' }
};

export const mother = {
  id: 'p-ibu',
  name: 'Rina Kartika',
  short: 'Ibu Rina',
  initials: 'RK',
  rmNo: '00-48-21-03',
  bloodType: 'O',
  rhesus: '+',
  heightCm: 158,
  prePregnancyWeightKg: 54,
  tetanusStatus: 'T4'
};

export const pregnancy = {
  id: 'preg-2',
  hpht: '2026-04-23',
  gravida: 2,
  para: 1,
  abortus: 0,
  datingSource: 'USG trimester 1'
};

export const ancVisits = [
  {
    id: 'k1', no: 1, batch: 'base', date: '2026-06-04', time: '09.30', gaWeeks: 6,
    title: 'Dokter + USG', unit: facility.units.obgyn,
    examiner: staff.spog.name, doctor: staff.spog.short,
    summary: 'Janin tunggal di dalam rahim, detak jantung sudah terlihat. Perkiraan lahir 28 Januari 2027. Lanjutkan tablet tambah darah 1 kali sehari.',
    weightKg: 54.6,
    results: [
      { label: 'Berat badan', value: '54,6', unit: 'kg', status: 'ok', statusText: 'Sesuai', meaning: 'Naik 0,6 kg dari sebelum hamil.' },
      { label: 'Tekanan darah', value: '110/70', unit: 'mmHg', status: 'ok', statusText: 'Normal', meaning: 'Di bawah 140/90.' },
      { label: 'USG', value: 'Tunggal', unit: '', status: 'ok', statusText: 'Normal', meaning: 'Satu janin di dalam rahim dan detak jantungnya terlihat.' },
      { label: 'Hemoglobin (Hb)', value: '11,8', unit: 'g/dL', status: 'ok', statusText: 'Normal', meaning: 'Di atas 11 g/dL, tidak anemia.' },
      { label: 'HIV, sifilis, hepatitis B', value: 'Non-reaktif', unit: '', status: 'ok', statusText: 'Normal', meaning: 'Hasil skrining tiga penyakit (Triple Eliminasi) negatif.' },
      { label: 'Golongan darah', value: 'O Rh+', unit: '', status: 'ok', statusText: 'Tercatat', meaning: 'Disimpan untuk persiapan persalinan.' }
    ],
    todo: [], meds: [{ name: 'Tablet tambah darah 60 mg', qty: '30 tablet' }]
  },
  {
    id: 'k2', no: 2, batch: 'base', date: '2026-08-06', time: '10.15', gaWeeks: 15,
    title: 'Pemeriksaan rutin', unit: facility.units.obgyn,
    examiner: staff.bidan.name, doctor: staff.spog.short,
    summary: 'Kondisi Ibu dan janin baik. Mual sudah berkurang. Lanjutkan makan porsi kecil tapi sering.',
    weightKg: 56.4,
    results: [
      { label: 'Berat badan', value: '56,4', unit: 'kg', status: 'ok', statusText: 'Sesuai', meaning: 'Naik 1,8 kg sejak kunjungan lalu.' },
      { label: 'Tekanan darah', value: '112/72', unit: 'mmHg', status: 'ok', statusText: 'Normal', meaning: 'Di bawah 140/90.' },
      { label: 'Lingkar lengan atas (LiLA)', value: '24,5', unit: 'cm', status: 'ok', statusText: 'Normal', meaning: 'Di atas 23,5 cm, gizi Ibu cukup.' },
      { label: 'Detak jantung janin', value: '150', unit: 'kali/menit', status: 'ok', statusText: 'Normal', meaning: 'Normalnya 120–160 kali per menit.' }
    ],
    todo: [], meds: [{ name: 'Tablet tambah darah 60 mg', qty: '60 tablet' }]
  },
  {
    id: 'k3', no: 3, batch: 'k3', date: '2026-10-01', time: '14.20', gaWeeks: 23,
    title: 'Pemeriksaan rutin', unit: facility.units.obgyn,
    examiner: staff.bidan.name, doctor: staff.spog.short,
    summary: 'Kondisi Ibu dan janin baik. Hb sedikit rendah, jadi tablet tambah darah dinaikkan menjadi 2 tablet per hari. Lanjutkan makan lauk hewani dan sayur hijau.',
    weightKg: 59.8,
    results: [
      { label: 'Berat badan', value: '59,8', unit: 'kg', status: 'ok', statusText: 'Sesuai', meaning: 'Naik 3,4 kg sejak kunjungan lalu (8 minggu). Kenaikan ini sesuai anjuran.' },
      { label: 'Tekanan darah', value: '118/76', unit: 'mmHg', status: 'ok', statusText: 'Normal', meaning: 'Di bawah 140/90. Tidak ada tanda tekanan darah tinggi atau preeklampsia.' },
      { label: 'Lingkar lengan atas (LiLA)', value: '25', unit: 'cm', status: 'ok', statusText: 'Normal', meaning: 'Di atas 23,5 cm, artinya cadangan gizi Ibu cukup.' },
      { label: 'Tinggi rahim', value: '23', unit: 'cm', status: 'ok', statusText: 'Sesuai', meaning: 'Sesuai usia kehamilan 23 minggu, janin tumbuh dengan baik.' },
      { label: 'Detak jantung janin', value: '142', unit: 'kali/menit', status: 'ok', statusText: 'Normal', meaning: 'Normalnya 120–160 kali per menit.' },
      { label: 'Hemoglobin (Hb)', value: '10,6', unit: 'g/dL', status: 'warn', statusText: 'Perlu perhatian', meaning: 'Sedikit di bawah 11 g/dL, disebut anemia ringan. Bisa membuat Ibu mudah lelah. Diatasi dengan tablet tambah darah 2 kali sehari.' },
      { label: 'Protein urin', value: 'Negatif', unit: '', status: 'ok', statusText: 'Normal', meaning: 'Tidak ada protein di urin. Ginjal baik dan tidak ada tanda preeklampsia.' },
      { label: 'Gula darah sewaktu', value: '96', unit: 'mg/dL', status: 'ok', statusText: 'Normal', meaning: 'Normal. Tes gula darah lengkap tetap dilakukan di usia 24–28 minggu.' }
    ],
    todo: [
      { id: 'ttd', html: 'Minum <b>2 tablet tambah darah</b> setiap malam, bersama air jeruk. Hindari teh, kopi, dan susu di waktu yang sama.' },
      { id: 'ttgo', html: 'Tes gula darah kehamilan <b>Kamis, 22 Okt 2026</b>. Puasa 8 jam sebelumnya.' },
      { id: 'k4', html: 'Kontrol berikutnya (K4) <b>Kamis, 12 Nov 2026</b> di Poli Kebidanan.' }
    ],
    meds: [
      { name: 'Tablet tambah darah 60 mg', qty: '60 tablet' },
      { name: 'Kalsium 500 mg', qty: '30 tablet' }
    ],
    article: 'anemia'
  }
];

export const plannedVisits = [
  { id: 'k4', no: 4, title: 'Pemeriksaan rutin', when: 'Kamis, 12 Nov 2026 · usia 29 minggu', who: 'Sudah dijadwalkan di Poli Kebidanan' },
  { id: 'k5', no: 5, title: 'Dokter + USG trimester 3', when: 'Perkiraan Des 2026 · usia 32–36 minggu', who: 'Rencana persalinan dibahas di sini' },
  { id: 'k6', no: 6, title: 'Persiapan persalinan', when: 'Perkiraan Jan 2027 · usia 37 minggu', who: 'Bawa tas persalinan dan dokumen' }
];

export const appointments = [
  { id: 'imun18', who: 'anak', date: '2026-10-12', title: 'Imunisasi 18 bulan Arka', detail: 'DPT-HB-Hib & Campak-Rubela lanjutan · Poli Anak', tone: 'blue' },
  { id: 'ttgo', who: 'ibu', date: '2026-10-22', title: 'Tes gula darah kehamilan', detail: 'Puasa 8 jam sebelumnya · Laboratorium', tone: 'coral' },
  { id: 'k4', who: 'ibu', date: '2026-11-12', title: 'Kontrol kehamilan K4', detail: 'Poli Kebidanan · Bd. Ratna Wulandari', tone: 'coral' }
];

export const child = {
  id: 'p-arka',
  name: 'Arka Pradipta',
  short: 'Arka',
  initials: 'AP',
  sex: 'L',
  dob: '2025-04-12',
  rmNo: '00-48-21-17',
  jeEndemicRegion: false,
  birth: { weightKg: 3.1, lengthCm: 49, headCm: 34, method: 'persalinan normal', screening: 'skrining hipotiroid (SHK) dan jantung bawaan normal' }
};

// Catatan imunisasi dari SIMRS (No. batch fiktif).
export const immunizationRecords = [
  { dose: 'hb0', date: '2025-04-12', batchNo: '2504-HB-0112', examiner: 'Bd. Ratna Wulandari', unit: 'Kamar Bersalin', site: 'Paha kanan' },
  { dose: 'bcg', date: '2025-05-10', batchNo: '2505-BCG-0230', examiner: staff.spa.name, unit: facility.units.peds, site: 'Lengan kanan atas' },
  { dose: 'opv1', date: '2025-05-10', batchNo: '2505-OPV-0418', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'dpt1', date: '2025-06-14', batchNo: '2506-DHH-0251', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kanan' },
  { dose: 'opv2', date: '2025-06-14', batchNo: '2506-OPV-0102', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'pcv1', date: '2025-06-14', batchNo: '2506-PCV-0077', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kiri' },
  { dose: 'rv1', date: '2025-06-14', batchNo: '2506-RV-0019', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'dpt2', date: '2025-07-12', batchNo: '2507-DHH-0333', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kanan' },
  { dose: 'opv3', date: '2025-07-12', batchNo: '2507-OPV-0145', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'pcv2', date: '2025-07-12', batchNo: '2507-PCV-0091', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kiri' },
  { dose: 'rv2', date: '2025-07-12', batchNo: '2507-RV-0026', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'dpt3', date: '2025-08-16', batchNo: '2508-DHH-0417', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kanan',
    kipi: { text: 'Demam ringan 37,9°C selama 1 hari. Dilaporkan Ibu Rina, Minggu 17 Agu 2025.', review: 'Ditinjau dr. Bagus Hendrawan, Sp.A: reaksi wajar, tidak perlu tindakan.' } },
  { dose: 'opv4', date: '2025-08-16', batchNo: '2508-OPV-0188', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'ipv1', date: '2025-08-16', batchNo: '2508-IPV-0064', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kiri' },
  { dose: 'rv3', date: '2025-08-16', batchNo: '2508-RV-0031', examiner: staff.spa.name, unit: facility.units.peds, site: 'Tetes mulut' },
  { dose: 'mr1', date: '2026-01-10', batchNo: '2601-MR-0205', examiner: staff.spa.name, unit: facility.units.peds, site: 'Lengan kiri atas' },
  { dose: 'ipv2', date: '2026-01-10', batchNo: '2601-IPV-0093', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kiri' },
  { dose: 'pcv3', date: '2026-04-18', batchNo: '2604-PCV-0140', examiner: staff.spa.name, unit: facility.units.peds, site: 'Paha kiri' }
];

export const extraImmunizations = [
  { name: 'Influenza dosis 1', date: '2026-08-20', note: 'Mengikuti jadwal IDAI. Tidak memengaruhi status imunisasi rutin lengkap.' }
];

export const growthRecords = [
  { ageMonths: 0, date: '2025-04-12', weightKg: 3.1, heightCm: 49, headCm: 34 },
  { ageMonths: 1, date: '2025-05-10', weightKg: 4.3, heightCm: 53.5, headCm: 36.8 },
  { ageMonths: 2, date: '2025-06-14', weightKg: 5.4, heightCm: 57.2, headCm: 38.6 },
  { ageMonths: 3, date: '2025-07-12', weightKg: 6.2, heightCm: 60.1, headCm: 40.1 },
  { ageMonths: 4, date: '2025-08-16', weightKg: 6.8, heightCm: 62.6, headCm: 41.2 },
  { ageMonths: 6, date: '2025-10-11', weightKg: 7.7, heightCm: 66.8, headCm: 43.0 },
  { ageMonths: 9, date: '2026-01-10', weightKg: 8.6, heightCm: 71.5, headCm: 44.6 },
  { ageMonths: 12, date: '2026-04-18', weightKg: 9.4, heightCm: 75.4, headCm: 45.6 },
  { ageMonths: 16, date: '2026-08-20', weightKg: 10.2, heightCm: 79.5, headCm: 46.5 }
];

export const supplements = {
  vitaminA: ['Feb 2026', 'Agu 2026'],
  deworming: ['Agu 2026'],
  next: 'Februari 2027'
};

// Kotak masuk "Dari RS": setiap catatan yang dikirim SIMRS ke aplikasi.
export const inboxItems = [
  { id: 'in-k3', batch: 'k3', who: 'ibu', date: '2026-10-01', time: '14.20', route: '/kunjungan/k3', title: 'Hasil pemeriksaan kehamilan ke-3 (K3)', detail: 'Berat badan, tekanan darah, tinggi rahim, dan detak jantung janin. Semua dalam batas normal.', source: 'Poli Kebidanan · Bd. Ratna Wulandari' },
  { id: 'in-lab', batch: 'k3', who: 'ibu', date: '2026-10-01', time: '13.05', route: '/kunjungan/k3', title: 'Hasil laboratorium', detail: 'Hemoglobin, protein urin, dan gula darah sewaktu.', source: 'Laboratorium RS JIH Solo', warn: 'Perlu perhatian: Hb 10,6 g/dL' },
  { id: 'in-imun', batch: 'k3', who: 'anak', date: '2026-09-28', time: '09.00', route: '/imunisasi', title: 'Jadwal imunisasi 18 bulan Arka', detail: 'DPT-HB-Hib lanjutan dan Campak-Rubela lanjutan, jatuh tempo Senin, 12 Okt 2026.', source: 'Poli Anak · pengingat otomatis' },
  { id: 'in-tumbuh', batch: 'base', who: 'anak', date: '2026-08-20', time: '10.40', route: '/tumbuh', title: 'Penimbangan, Vitamin A, dan obat cacing Arka', detail: 'Berat 10,2 kg, tinggi 79,5 cm. Pertumbuhan sesuai usia.', source: 'Poli Anak · dr. Bagus Hendrawan, Sp.A' },
  { id: 'in-k2', batch: 'base', who: 'ibu', date: '2026-08-06', time: '10.15', route: '/kunjungan/k2', title: 'Hasil pemeriksaan kehamilan ke-2 (K2)', detail: 'Usia kehamilan 15 minggu. Kondisi Ibu dan janin baik.', source: 'Poli Kebidanan · Bd. Ratna Wulandari' },
  { id: 'in-k1', batch: 'base', who: 'ibu', date: '2026-06-04', time: '09.30', route: '/kunjungan/k1', title: 'Pemeriksaan dokter dan USG trimester 1 (K1)', detail: 'Janin tunggal, detak jantung terlihat. Perkiraan lahir 28 Jan 2027.', source: 'Poli Kebidanan · dr. Anindita Prameswari, Sp.OG' }
];

// Simulasi panggilan API ke jembatan SIMRS: mengembalikan catatan batch tertentu setelah jeda jaringan.
export function fetchSimrsBatch(batch, delayMs = 1400) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        visits: ancVisits.filter((v) => v.batch === batch).map((v) => v.id),
        inbox: inboxItems.filter((i) => i.batch === batch).map((i) => i.id)
      });
    }, delayMs);
  });
}
