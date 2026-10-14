import { fmtShort } from '../lib/clinical.js';

// Grafik garis kecil untuk tren (TD, LDL, NIHSS, berat badan). `target` = garis batas target (opsional).
export default function MiniChart({ series, min, max, unit, target, targetLabel, second, label }) {
  const W = 326, H = 162, X0 = 34, X1 = 306, Y0 = 30, Y1 = 128;
  const n = series.length;
  const x = (i) => (n === 1 ? (X0 + X1) / 2 : X0 + (i / (n - 1)) * (X1 - X0));
  const y = (v) => Y1 - ((v - min) / (max - min)) * (Y1 - Y0);
  const line = (key) => series.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const ticks = [min, (min + max) / 2, max].map((t) => Math.round(t));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: 'block' }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} stroke="#EEF1F0" />
          <text x={X0 - 6} y={y(t) + 3.5} fontSize="10" fill="#56635F" textAnchor="end">{t}</text>
        </g>
      ))}
      {target != null ? (
        <g>
          <line x1={X0} x2={X1} y1={y(target)} y2={y(target)} stroke="#E8A33D" strokeDasharray="4 4" />
          <text x={X0 + 4} y={y(target) + 13} fontSize="10" fontWeight="700" fill="#7A4300">{targetLabel}</text>
        </g>
      ) : null}
      {second ? <polyline points={line(second)} fill="none" stroke="#9CC9BE" strokeWidth="2" strokeLinejoin="round" /> : null}
      <polyline points={line('value')} fill="none" stroke="#0B6E5F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((p, i) => (
        <g key={i}>
          {second ? <circle cx={x(i)} cy={y(p[second])} r="3" fill="#fff" stroke="#9CC9BE" strokeWidth="2" /> : null}
          <circle cx={x(i)} cy={y(p.value)} r={i === n - 1 ? 5 : 3} fill={i === n - 1 ? '#0B6E5F' : '#fff'} stroke="#0B6E5F" strokeWidth="2" />
          <text x={x(i)} y={y(p.value) - 9} fontSize="10" fontWeight="700" fill="#14201C" textAnchor="middle">{p.label ?? p.value}</text>
          <text x={x(i)} y={H - 10} fontSize="9.5" fill="#56635F" textAnchor="middle">{fmtShort(p.date).replace(/ \d{4}$/, '')}</text>
        </g>
      ))}
      <text x="2" y="12" fontSize="10" fill="#56635F">{unit}</text>
    </svg>
  );
}
