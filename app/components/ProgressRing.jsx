// app/components/ProgressRing.jsx
"use client";
export default function ProgressRing({ value = 0 }) {
  const size = 160, stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const dash = ((100 - clamped) / 100) * circ;

  return (
    <svg width={size} height={size} className="progress-ring" role="img" aria-label={`${clamped}% complete`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e7f0f7" strokeWidth={stroke} fill="none"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke="#9ed0ff"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset .25s ease" }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="28" fontWeight="800">{Math.round(clamped)}%</text>
    </svg>
  );
}
