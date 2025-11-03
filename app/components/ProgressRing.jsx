"use client";
export default function ProgressRing({ pct = 0, size = 164, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 18px" }}>
      <svg width={size} height={size} role="img" aria-label={`Progress ${pct}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#e6eef5"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#0d5275"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dy="0.35em"
          textAnchor="middle"
          style={{ fontWeight: 800, fontSize: 24, fill: "#0d5275" }}
        >
          {pct}%
        </text>
      </svg>
    </div>
  );
}
