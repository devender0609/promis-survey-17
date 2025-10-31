export default function ProgressRing({ pct = 0, size = 160, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  const dash = (p / 100) * c;

  return (
    <div className="progressWrap">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e3eef5" strokeWidth={stroke} fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="#0b84c6" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
              fontSize="28" fontWeight="800" fill="#0b4d73">{Math.round(p)}%</text>
      </svg>
    </div>
  );
}
