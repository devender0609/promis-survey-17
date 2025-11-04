// app/results/ClientResults.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { DOMAINS, DOMAIN_NAMES, labelCategory, normalizeText } from "../lib/survey";

// Helper: safe parse from sessionStorage/localStorage
function readJSON(key, fallback) {
  try { const v = window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key); 
        return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

// Compute bar colors (simple palette)
const COLORS = { PF:"#5AA9E6", PI:"#F4442E", F:"#8B5CF6", A:"#F59E0B", D:"#10B981", SR:"#EC4899" };

export default function ClientResults() {
  // Expect an object like: { sessionId, site, whenISO, scores: {PF:.., PI:.., ...}, categories: {PF:..}, notes?:string }
  const final = useMemo(() => readJSON("promisFinal", null), []);
  const site  = normalizeText(final?.site ?? "Texas Spine and Scoliosis, Austin TX");
  const whenISO = final?.whenISO || new Date().toISOString();
  const sessionId = final?.sessionId || `PROMIS-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

  // Seed trends history
  useEffect(() => {
    if (!final?.scores) return;
    try {
      const key = "promisHistory";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const now  = { date: whenISO, scores: final.scores };
      const next = [...prev, now].slice(-12);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }, [final, whenISO]);

  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("promisHistory") || "[]"); }
    catch { return []; }
  }, []);

  // For the table rows we need a stable list
  const rows = DOMAINS.map(d => {
    const t = Number(final?.scores?.[d] ?? 50);
    // If caller passed a text category, normalize it; else try index mapping
    const catRaw = final?.categories?.[d];
    const cat = typeof catRaw === "string" ? normalizeText(catRaw) : labelCategory(d, catRaw);
    const interp = (d==="PF" || d==="SR")
      ? "Higher scores indicate BETTER function/ability."
      : "Higher scores indicate MORE of the symptom/problem.";
    return { d, name: DOMAIN_NAMES[d], t, cat, interp };
  });

  // Simple SVG line for each domain across history
  const trendSVG = (() => {
    const W = 960, H = 260, P = 40;     // padding
    const pts = history.map((h, i) => ({ x: i, y: h.scores || {} }));
    const N = Math.max(pts.length - 1, 1);
    const scaleX = x => P + (x / Math.max(N,1)) * (W - 2*P);
    const scaleY = t => {
      const min=20, max=80;
      const y = H - P - ((t - min) / (max - min)) * (H - 2*P);
      return Math.max(P, Math.min(H - P, y));
    };
    const guides = [50, 60, 40].map(v => (
      <line key={v} className="guide"
            x1={P} y1={scaleY(v)} x2={W-P} y2={scaleY(v)} />
    ));
    const series = DOMAINS.map(code => {
      const path = [];
      pts.forEach((p, i) => {
        const t = Number(p.y?.[code] ?? 50);
        const x = scaleX(i), y = scaleY(t);
        path.push(`${i===0 ? "M":"L"}${x},${y}`);
      });
      const color = COLORS[code];
      return (
        <g key={code}>
          <path d={path.join(" ")} fill="none" stroke={color} strokeWidth="2.5" />
          {pts.map((p,i)=>{
            const t = Number(p.y?.[code] ?? 50);
            const x = scaleX(i), y = scaleY(t);
            return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
          })}
        </g>
      );
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} aria-label="Trend lines by domain">
        {guides}
        {series}
      </svg>
    );
  })();

  const savePDF = () => window.print();
  const emailResults = () => {
    try {
      const subject = encodeURIComponent("PROMIS Results");
      const body = encodeURIComponent(JSON.stringify(final, null, 2));
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch {}
  };

  return (
    <section className="results-wrap">
      <div className="results-header">
        <p className="meta-line">
          Completed on <strong>{new Date(whenISO).toLocaleString()}</strong> — Session ID: <strong>{sessionId}</strong>
        </p>
        <h1 className="results-title">PROMIS Assessment Results</h1>
        <p className="results-sub">{site}</p>
      </div>

      {/* Table */}
      <div style={{ padding: "8px 16px 0" }}>
        <table className="table" role="table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>T-score</th>
              <th>Category</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.d}>
                <td>{r.name}</td>
                <td style={{ fontWeight: 800 }}>{r.t.toFixed(1)}</td>
                <td><span className="badge">{r.cat || "—"}</span></td>
                <td>{r.interp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <div className="panel">
        <h3>PROMIS T-scores</h3>
        <div className="bars" role="figure" aria-label="T-score bar chart">
          <div className="midline" aria-hidden />
          {rows.map(r => {
            const pctHeight = Math.max(0, Math.min(100, ((r.t - 20) / 60) * 100)); // map 20-80 to 0-100%
            return (
              <div className="barWrap" key={r.d}>
                <div className="bar" style={{ height:`${pctHeight}%`, background: COLORS[r.d] }}>
                  <span className="barValue">{r.t.toFixed(1)}</span>
                </div>
                <div className="barX">{r.d}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize:12, color:"#678", marginTop:8 }}>
          PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone (≈±3 around 50). Mean 50 (solid), ±1 SD (dashed).
        </div>
      </div>

      {/* Trends */}
      <div className="panel">
        <h3>Trends over time</h3>
        <div className="trend">
          {history.length === 0
            ? <div style={{display:"grid",placeItems:"center",height:"100%",color:"#789"}}>No past results yet.</div>
            : trendSVG}
        </div>
        <div style={{ fontSize:12, color:"#678", marginTop:8 }}>
          Y: T-score (20–80). X: Date. One colored line per domain. Hover points for domain, T-score, and date.
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="btn light" onClick={savePDF}>Save as PDF</button>
        <button className="btn secondary" onClick={()=>window.location.assign("/")}>Submit & Finish</button>
        <button className="btn light" onClick={()=>window.print()}>Print</button>
        <button className="btn" onClick={emailResults}>Email Results</button>
      </div>

      <p style={{ textAlign:"center", color:"#567", fontSize:14, margin:"0 0 24px" }}>
        Thank you for completing the survey
      </p>
    </section>
  );
}
