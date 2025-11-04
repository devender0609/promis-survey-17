// app/components/ProgressRing.jsx
"use client";

export default function ProgressRing({ answered=0, total=0, size=160, stroke=14 }) {
  const pct = total > 0 ? Math.round((answered/total)*100) : 0;
  const r   = (size - stroke)/2;
  const C   = 2 * Math.PI * r;
  const dash = C - (C * pct) / 100;

  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r}
                stroke="#e7f1f8" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r}
                stroke="#79a8c9" strokeWidth={stroke} fill="none"
                strokeLinecap="round"
                strokeDasharray={`${C} ${C}`} strokeDashoffset={dash} />
      </svg>
      <div style={{
        position:"absolute", inset:0, display:"grid", placeItems:"center",
        fontWeight:800, color:"#0f3e5a", fontSize: size<140? "20px" : "28px"
      }}>
        {pct}%
      </div>
    </div>
  );
}
