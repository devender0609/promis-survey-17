// app/results/ClientResults.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { DOMAINS, categoryFor, interpretations } from "../lib/survey";

const domainNames = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles",
};

export default function ClientResults(){
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("promis_result");
    if (raw){
      try { setData(JSON.parse(raw)); } catch {}
    }
  }, []);

  const rows = useMemo(() => {
    if (!data?.tScores) return [];
    return DOMAINS.map(d => {
      const t = Number(data.tScores[d]?.toFixed ? data.tScores[d].toFixed(1) : data.tScores[d]);
      const cat = categoryFor(d, t);
      const interp = interpretations[d];
      return { d, name: domainNames[d], t, cat, interp };
    });
  }, [data]);

  const completedOn = useMemo(() => {
    if (!data?.stamp) return "";
    try{
      const dt = new Date(data.stamp);
      return dt.toLocaleString();
    }catch{ return ""; }
  }, [data]);

  if (!data) {
    return (
      <div className="card results-card">
        <h1>PROMIS Assessment Results</h1>
        <div className="subtle">Texas Spine and Scoliosis, Austin TX</div>
        <p className="subtle">No results found. Please complete the survey first.</p>
      </div>
    );
  }

  return (
    <>
      <section className="card results-card">
        <h1>PROMIS Assessment Results</h1>
        <div className="subtle">Texas Spine and Scoliosis, Austin TX</div>
        <div className="meta-small" style={{marginTop:8}}>
          Completed on {completedOn} — <strong>Session ID:</strong> {data.sessionId}
        </div>

        <table className="table" style={{marginTop:14}}>
          <thead>
            <tr>
              <th style={{width:"34%"}}>Domain</th>
              <th style={{width:"12%"}}>T-score</th>
              <th style={{width:"18%"}}>Category</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.d}>
                <td>{r.name}</td>
                <td>{r.t}</td>
                <td><span className={`badge ${r.cat.className}`}>{r.cat.label}</span></td>
                <td>{r.interp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Bar chart (pure SVG, no deps) */}
      <section className="chart-card" style={{marginTop:18}}>
        <h3 className="chart-title">PROMIS T-scores</h3>
        <Bars rows={rows}/>
        <p className="meta-small" style={{marginTop:8}}>
          PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone (~±3 around 50). Mean 50 (solid), ±1 SD (dashed).
        </p>
      </section>

      {/* Trends over time — for demo, we show one point per domain at this date */}
      <section className="chart-card" style={{marginTop:18}}>
        <h3 className="chart-title">Trends over time</h3>
        <Trend rows={rows}/>
        <p className="meta-small" style={{marginTop:8}}>
          Y: T-score (20–80). X: Date. One colored line per domain. Hover points for domain, T-score, and date.
        </p>
        <div className="btn-row">
          <button className="btn ghost" onClick={()=>window.print()}>Save as PDF</button>
          <button className="btn ghost" onClick={()=>alert("Submitting & finishing…")}>Submit & Finish</button>
          <button className="btn ghost" onClick={()=>window.print()}>Print</button>
          <button className="btn ghost" onClick={()=>alert("Email feature can be wired to your backend.")}>Email Results</button>
        </div>
        <div className="subtle" style={{textAlign:"center"}}>Thank you for completing the survey</div>
      </section>
    </>
  );
}

function Bars({ rows }) {
  const w = 900, h = 260, pad = 40;
  const max = 80, min = 20;
  const bandTop = yOf(53), bandBot = yOf(47);
  const mean = yOf(50), sdTop = yOf(60), sdBot = yOf(40);
  const colWidth = (w - pad*2) / rows.length;

  function yOf(t){ 
    const pct = (t - min) / (max - min);
    return h - pad - pct*(h - pad*2);
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      {/* horizontal guides */}
      <rect x={pad} y={bandTop} width={w- pad*2} height={bandBot - bandTop} fill="#e9f5ff"/>
      <line x1={pad} x2={w-pad} y1={mean} y2={mean} stroke="#b2c5d8" strokeWidth="2"/>
      <line x1={pad} x2={w-pad} y1={sdTop} y2={sdTop} stroke="#d9e4ee" strokeDasharray="6 6"/>
      <line x1={pad} x2={w-pad} y1={sdBot} y2={sdBot} stroke="#d9e4ee" strokeDasharray="6 6"/>

      {rows.map((r, i) => {
        const x = pad + i*colWidth + colWidth*0.18;
        const bw = colWidth*0.64;
        const y = yOf(r.t);
        const base = yOf(20);
        const color = ["#3b82f6","#ef4444","#8b5cf6","#f59e0b","#10b981","#ec4899"][i % 6];
        return (
          <g key={r.d}>
            <rect x={x} y={y} width={bw} height={base - y} rx="8" fill={color} />
            <text className="bar-label" x={x + bw/2} y={base + 16}>{r.d}</text>
            <text className="bar-value" x={x + bw/2} y={y - 8}>{r.t}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Trend({ rows }) {
  // For now, draw a single-date “trend” baseline per domain
  const w = 900, h = 260, pad = 40;
  const min = 20, max = 80;
  function yOf(t){ 
    const pct = (t - min) / (max - min);
    return h - pad - pct*(h - pad*2);
  }
  const mean = yOf(50), sdTop = yOf(60), sdBot = yOf(40);

  const x1 = pad+40, x2 = w - pad - 40, mid = (x1+x2)/2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <line x1={pad} x2={w-pad} y1={mean} y2={mean} stroke="#b2c5d8" strokeWidth="2"/>
      <line x1={pad} x2={w-pad} y1={sdTop} y2={sdTop} stroke="#d9e4ee" strokeDasharray="6 6"/>
      <line x1={pad} x2={w-pad} y1={sdBot} y2={sdBot} stroke="#d9e4ee" strokeDasharray="6 6"/>

      {rows.map((r, i) => {
        const color = ["#3b82f6","#ef4444","#8b5cf6","#f59e0b","#10b981","#ec4899"][i % 6];
        const y = yOf(r.t);
        // flat line with a single point (today)
        return (
          <g key={r.d}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="3" opacity=".85"/>
            <circle cx={mid} cy={y} r="6" fill={color}/>
          </g>
        );
      })}
    </svg>
  );
}
