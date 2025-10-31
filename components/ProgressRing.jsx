"use client";
export default function ProgressRing({ pct = 0, size = 160, stroke = 16 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  const dash = (p / 100) * c;

  return (
    <svg width={size} height={size} role="img" aria-label={`Progress ${p}%`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e9f1fa" strokeWidth={stroke} fill="none"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke="#0ea5e9" strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
            fontWeight="800" fontSize="28" fill="#0b3a5b">{Math.round(p)}%</text>
    </svg>
  );
}