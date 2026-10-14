// Aturan klinis sederhana yang dipakai aplikasi. Wajib divalidasi Komite Medik sebelum produksi.
import { schedule, AGE_LABELS } from '../data/vaccines.js';

const DAY = 86400000;

export const parseDate = (iso) => new Date(iso + 'T00:00:00Z');
export const toIso = (d) => d.toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / DAY);

export function addDays(iso, n) {
  return toIso(new Date(parseDate(iso).getTime() + n * DAY));
}

export function addMonths(iso, n) {
  const d = parseDate(iso);
  d.setUTCMonth(d.getUTCMonth() + n);
  return toIso(d);
}

const fmt = (opts) => new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', ...opts });
export const fmtLong = (iso) => fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(iso));
export const fmtShort = (iso) => fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(iso));
export const fmtDayShort = (iso) => fmt({ weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(iso));
export const fmtWeekdayAbbr = (iso) => fmt({ weekday: 'short' }).format(parseDate(iso)).replace('.', '').toUpperCase();
export const fmtMonthAbbr = (iso) => fmt({ month: 'short' }).format(parseDate(iso)).replace('.', '').toUpperCase();
export const dayOfMonth = (iso) => parseDate(iso).getUTCDate();

// ---------- Kehamilan ----------
export function gestationalAge(hpht, today) {
  const days = daysBetween(hpht, today);
  return { weeks: Math.floor(days / 7), days: days % 7, totalDays: days };
}

// Rumus Naegele: HPL = HPHT + 280 hari.
export const estimatedDueDate = (hpht) => addDays(hpht, 280);

// Pembagian trimester mengikuti Buku KIA: T1 ≤ 12 minggu, T2 13–28 minggu, T3 > 28 minggu.
export function trimester(weeks) {
  if (weeks <= 12) return 1;
  if (weeks <= 28) return 2;
  return 3;
}

const FETAL = [
  { from: 4, size: 'biji beras', length: '±0,6 cm', weight: '<1 g', note: 'Bagian tubuh bayi, termasuk otak, mulai terbentuk.' },
  { from: 12, size: 'jeruk nipis', length: '±10 cm', weight: '±28 g', note: 'Semua organ penting sudah terbentuk.' },
  { from: 16, size: 'apel', length: '±16 cm', weight: '±100 g', note: 'Ibu mungkin mulai merasakan gerakan pertama.' },
  { from: 20, size: 'pisang', length: '±25 cm', weight: '±300 g', note: 'Gerakan bayi makin terasa.' },
  { from: 24, size: 'jagung', length: '±30 cm', weight: '±600 g', note: 'Ia mulai bisa mendengar suara Ibu. Ajak bicara dan sentuh perut Ibu.' },
  { from: 28, size: 'terong', length: '±37 cm', weight: '±1 kg', note: 'Mata bayi mulai bisa membuka dan menutup.' },
  { from: 32, size: 'labu siam', length: '±42 cm', weight: '±1,7 kg', note: 'Bayi menambah lemak tubuh dengan cepat.' },
  { from: 36, size: 'melon', length: '±47 cm', weight: '±2,6 kg', note: 'Bayi mulai turun ke panggul, bersiap lahir.' }
];

export function fetalInfo(weeks) {
  let current = FETAL[0];
  for (const f of FETAL) if (weeks >= f.from) current = f;
  return current;
}

// ---------- Anak ----------
export function ageInMonthsDays(dob, today) {
  const a = parseDate(dob), b = parseDate(today);
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  const anchor = addMonths(dob, months);
  return { months, days: daysBetween(anchor, today) };
}

// Status setiap dosis: done | due | upcoming | catchup | missed | na
export function immunizationStatus(child, records, today) {
  const byDose = Object.fromEntries(records.map((r) => [r.dose, r]));
  return schedule.map((s) => {
    const rec = byDose[s.id];
    const dueDate = addMonths(child.dob, s.ageMonths);
    const lastDate = addMonths(child.dob, s.maxMonths);
    if (rec) {
      const late = daysBetween(dueDate, rec.date) > 31;
      return { ...s, status: 'done', record: rec, dueDate, onTime: !late };
    }
    if (s.endemicOnly && !child.jeEndemicRegion) return { ...s, status: 'na', dueDate };
    const untilDue = daysBetween(today, dueDate);
    if (untilDue > 14) return { ...s, status: 'upcoming', dueDate, untilDue };
    if (daysBetween(today, lastDate) < 0) return { ...s, status: 'missed', dueDate };
    if (untilDue >= -31) return { ...s, status: 'due', dueDate, untilDue };
    return { ...s, status: 'catchup', dueDate, lastDate };
  });
}

export function groupByAge(statuses) {
  const groups = [];
  for (const s of statuses) {
    let g = groups.find((x) => x.ageMonths === s.ageMonths);
    if (!g) { g = { ageMonths: s.ageMonths, label: AGE_LABELS[s.ageMonths] ?? `${s.ageMonths} bulan`, doses: [] }; groups.push(g); }
    g.doses.push(s);
  }
  return groups;
}

export function immunizationSummary(statuses) {
  const counted = statuses.filter((s) => s.status !== 'na');
  const done = counted.filter((s) => s.status === 'done').length;
  const due = counted.filter((s) => s.status === 'due' || s.status === 'catchup');
  return { done, total: counted.length, due };
}

export function relativeDays(n) {
  if (n === 0) return 'hari ini';
  if (n === 1) return 'besok';
  if (n > 1) return `${n} hari lagi`;
  return `terlambat ${-n} hari`;
}
