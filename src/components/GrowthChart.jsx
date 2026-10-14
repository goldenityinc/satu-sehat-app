// Grafik pertumbuhan dengan pita normal WHO (-2 SD s.d. +2 SD), median putus-putus, dan titik pengukuran anak.
const W = 326, H = 222, X0 = 34, X1 = 316, Y0 = 10, Y1 = 190, MAX_M = 24;

export default function GrowthChart({ reference, records, name }) {
  const x = (m) => X0 + (m / MAX_M) * (X1 - X0);
  const y = (v) => Y1 - ((v - reference.min) / (reference.max - reference.min)) * (Y1 - Y0);
  const pts = (i) => reference.points.map((p) => `${x(p[0]).toFixed(1)},${y(p[i]).toFixed(1)}`);
  const upper = pts(3), lower = pts(1);
  const band = [...upper, ...lower.slice().reverse()].join(' ');
  const data = records.filter((r) => r[reference.field] != null);
  const last = data[data.length - 1];
  const lastVal = last[reference.field];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Grafik ${reference.label.toLowerCase()} ${name}, berada di dalam rentang normal WHO`} style={{ display: 'block' }}>
      {reference.ticks.map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} stroke="#EEF1F0" />
          <text x={X0 - 6} y={y(t) + 3.5} fontSize="10" fill="#56635F" textAnchor="end">{t}</text>
        </g>
      ))}
      <polygon points={band} fill="#DDEFE9" />
      <polyline points={upper.join(' ')} fill="none" stroke="#9CC9BE" />
      <polyline points={lower.join(' ')} fill="none" stroke="#9CC9BE" />
      <polyline points={pts(2).join(' ')} fill="none" stroke="#7E9690" strokeDasharray="3 3" />
      <polyline points={data.map((r) => `${x(r.ageMonths)},${y(r[reference.field])}`).join(' ')} fill="none" stroke="#0B6E5F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.slice(0, -1).map((r) => (
        <circle key={r.ageMonths} cx={x(r.ageMonths)} cy={y(r[reference.field])} r="3" fill="#fff" stroke="#0B6E5F" strokeWidth="2" />
      ))}
      <circle cx={x(last.ageMonths)} cy={y(lastVal)} r="5.5" fill="#0B6E5F" stroke="#fff" strokeWidth="2" />
      <text x={x(last.ageMonths) + 9} y={y(lastVal) + 4} fontSize="11" fontWeight="700" fill="#0B6E5F">
        {String(lastVal).replace('.', ',')} {reference.unit}
      </text>
      {[0, 6, 12, 18, 24].map((m) => (
        <text key={m} x={x(m)} y={H - 12} fontSize="10" fill="#56635F" textAnchor={m === 24 ? 'end' : 'middle'}>{m === 24 ? '24 bln' : m}</text>
      ))}
      <text x="4" y="12" fontSize="10" fill="#56635F">{reference.unit}</text>
    </svg>
  );
}
