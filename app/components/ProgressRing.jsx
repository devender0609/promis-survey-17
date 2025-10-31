export default function ProgressRing({ pct = 0, size = 140 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(100, pct)) / 100 * c;

  return (
    <div className="ringWrap">
      <svg width={size} height={size} role="img" aria-label={`Progress ${pct}%`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e7f0f6" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r}
                stroke="#0b5e86" strokeWidth={stroke} fill="none"
                strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
              fontSize="22" fontWeight="800" fill="#0b5e86">{Math.round(Math.max(0, Math.min(100,pct)))}%</text>
      </svg>
    </div>
  );
}
