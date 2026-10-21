// Aturan batas wajar untuk notifikasi darurat otomatis.
// Nilai ambang adalah usulan demo dan WAJIB divalidasi Komite Medik sebelum dipakai.
// level: 'darurat' (merah, kirim ke pasien + dokter pribadi + tim dokter) | 'waspada' (kuning).

export const RULES = [
  { id: 'krisis-ht', label: 'Krisis hipertensi', limit: 'TD ≥ 180/120 mmHg', level: 'darurat', test: (v) => v.sys >= 180 || v.dia >= 120 },
  { id: 'ht-hamil-berat', label: 'Hipertensi berat dalam kehamilan', limit: 'TD ≥ 160/110 mmHg (hamil)', level: 'darurat', test: (v, m) => m === 'kia' && (v.sys >= 160 || v.dia >= 110) },
  { id: 'ht-hamil', label: 'Tekanan darah tinggi dalam kehamilan (risiko preeklampsia)', limit: 'TD ≥ 140/90 mmHg (hamil)', level: 'waspada', test: (v, m) => m === 'kia' && v.sys < 160 && v.dia < 110 && (v.sys >= 140 || v.dia >= 90) },
  { id: 'nadi', label: 'Nadi tidak normal', limit: 'Nadi > 120 atau < 50 x/menit', level: 'darurat', test: (v) => v.nadi != null && (v.nadi > 120 || v.nadi < 50) },
  { id: 'djj', label: 'Detak jantung janin tidak normal', limit: 'DJJ < 110 atau > 160 x/menit', level: 'darurat', test: (v, m) => m === 'kia' && v.djj != null && (v.djj < 110 || v.djj > 160) },
  { id: 'hb-berat', label: 'Anemia berat', limit: 'Hb < 8 g/dL', level: 'darurat', test: (v) => v.hb != null && v.hb < 8 },
  { id: 'nihss-naik', label: 'Perburukan defisit saraf (curiga stroke berulang)', limit: 'NIHSS naik ≥ 2 poin', level: 'darurat', test: (v) => v.nihss != null && v.prevNihss != null && v.nihss - v.prevNihss >= 2 },
  { id: 'bb-turun', label: 'Berat badan turun selama pengobatan TBC', limit: 'BB turun > 5%', level: 'waspada', test: (v, m) => m === 'tbc' && v.weight != null && v.prevWeight != null && v.weight < v.prevWeight * 0.95 },
  { id: 'hipoglikemia', label: 'Gula darah terlalu rendah (hipoglikemia)', limit: 'Gula darah < 70 mg/dL', level: 'darurat', test: (v) => v.gd != null && v.gd < 70 },
  { id: 'hiperglikemia', label: 'Gula darah sangat tinggi', limit: 'Gula darah ≥ 300 mg/dL', level: 'darurat', test: (v) => v.gd != null && v.gd >= 300 },
  { id: 'hba1c-tinggi', label: 'Diabetes belum terkendali', limit: 'HbA1c ≥ 9%', level: 'waspada', test: (v, m) => m === 'diabetes' && v.hba1c != null && v.hba1c >= 9 },
  { id: 'hepatotoksik', label: 'Curiga efek samping obat ke hati', limit: 'Mata/kulit kuning saat minum OAT', level: 'darurat', test: (v, m) => m === 'tbc' && /kuning/i.test(v.efek || '') }
];

// Mengembalikan daftar pelanggaran batas untuk satu set nilai pemeriksaan.
export function checkValues(values, module) {
  return RULES.filter((r) => {
    try { return r.test(values, module); } catch { return false; }
  }).map((r) => ({ id: r.id, label: r.label, limit: r.limit, level: r.level }));
}

export function describeValues(v) {
  const parts = [];
  if (v.sys) parts.push(`TD ${v.sys}/${v.dia}`);
  if (v.nadi) parts.push(`nadi ${v.nadi}`);
  if (v.djj) parts.push(`DJJ ${v.djj}`);
  if (v.hb) parts.push(`Hb ${String(v.hb).replace('.', ',')}`);
  if (v.nihss != null) parts.push(`NIHSS ${v.nihss}`);
  if (v.gd) parts.push(`gula darah ${v.gd} mg/dL`);
  if (v.hba1c) parts.push(`HbA1c ${String(v.hba1c).replace('.', ',')}%`);
  if (v.weight) parts.push(`BB ${String(v.weight).replace('.', ',')} kg`);
  return parts.join(' · ');
}
