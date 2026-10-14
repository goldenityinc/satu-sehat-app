// Jadwal imunisasi rutin bayi dan baduta — Buku KIA Kemenkes 2025, hlm. 124–125.
// ageMonths = usia tepat; maxMonths = batas usia masih boleh diberikan (imunisasi kejar).

export const PREVENTS = {
  hb: ['Hepatitis B'],
  bcg: ['Tuberkulosis (TBC)'],
  opv: ['Polio'],
  ipv: ['Polio'],
  dpt: ['Difteri', 'Batuk rejan', 'Tetanus', 'Hepatitis B', 'Meningitis', 'Pneumonia'],
  pcv: ['Pneumonia (radang paru)'],
  rv: ['Diare berat karena rotavirus'],
  mr: ['Campak', 'Rubela'],
  je: ['Japanese Encephalitis']
};

export const schedule = [
  { id: 'hb0', family: 'hb', name: 'Hepatitis B0', ageMonths: 0, maxMonths: 1, note: 'Diberikan kurang dari 24 jam setelah lahir' },
  { id: 'bcg', family: 'bcg', name: 'BCG', ageMonths: 1, maxMonths: 12 },
  { id: 'opv1', family: 'opv', name: 'Polio tetes 1', ageMonths: 1, maxMonths: 59 },
  { id: 'dpt1', family: 'dpt', name: 'DPT-HB-Hib 1', ageMonths: 2, maxMonths: 59 },
  { id: 'opv2', family: 'opv', name: 'Polio tetes 2', ageMonths: 2, maxMonths: 59 },
  { id: 'pcv1', family: 'pcv', name: 'PCV 1', ageMonths: 2, maxMonths: 24 },
  { id: 'rv1', family: 'rv', name: 'Rotavirus 1', ageMonths: 2, maxMonths: 7, note: 'Rotavirus dilengkapi sebelum usia 7 bulan' },
  { id: 'dpt2', family: 'dpt', name: 'DPT-HB-Hib 2', ageMonths: 3, maxMonths: 59 },
  { id: 'opv3', family: 'opv', name: 'Polio tetes 3', ageMonths: 3, maxMonths: 59 },
  { id: 'pcv2', family: 'pcv', name: 'PCV 2', ageMonths: 3, maxMonths: 24 },
  { id: 'rv2', family: 'rv', name: 'Rotavirus 2', ageMonths: 3, maxMonths: 7 },
  { id: 'dpt3', family: 'dpt', name: 'DPT-HB-Hib 3', ageMonths: 4, maxMonths: 59 },
  { id: 'opv4', family: 'opv', name: 'Polio tetes 4', ageMonths: 4, maxMonths: 59 },
  { id: 'ipv1', family: 'ipv', name: 'Polio suntik (IPV) 1', ageMonths: 4, maxMonths: 59 },
  { id: 'rv3', family: 'rv', name: 'Rotavirus 3', ageMonths: 4, maxMonths: 7 },
  { id: 'mr1', family: 'mr', name: 'Campak-Rubela (MR) 1', ageMonths: 9, maxMonths: 59 },
  { id: 'ipv2', family: 'ipv', name: 'Polio suntik (IPV) 2', ageMonths: 9, maxMonths: 59 },
  { id: 'je', family: 'je', name: 'Japanese Encephalitis', ageMonths: 10, maxMonths: 59, endemicOnly: true },
  { id: 'pcv3', family: 'pcv', name: 'PCV 3', ageMonths: 12, maxMonths: 24 },
  { id: 'dpt4', family: 'dpt', name: 'DPT-HB-Hib lanjutan', ageMonths: 18, maxMonths: 59 },
  { id: 'mr2', family: 'mr', name: 'Campak-Rubela (MR) lanjutan', ageMonths: 18, maxMonths: 59 }
];

export const AGE_LABELS = {
  0: 'Lahir (0–24 jam)', 1: '1 bulan', 2: '2 bulan', 3: '3 bulan', 4: '4 bulan',
  9: '9 bulan', 10: '10 bulan', 12: '12 bulan', 18: '18 bulan'
};

export const doseNumberText = {
  dpt3: 'Dosis ke-3 dari 3 dosis dasar, ditambah 1 dosis lanjutan di usia 18 bulan.'
};
