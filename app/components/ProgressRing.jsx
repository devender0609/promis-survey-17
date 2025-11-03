"use client";

export default function ProgressRing({ pct = 0 }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="ring" style={{ ["--p"]: `${p}%` }}>
      <span>{p}%</span>
    </div>
  );
}
