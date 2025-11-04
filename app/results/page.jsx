"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Expects sessionStorage.promisResults to look like:
 * {
 *   tScores: { PF:number, PI:number, F:number, A:number, D:number, SR:number },
 *   sessionId: string (optional),
 *   completedAt: string ISO (optional)
 * }
 *
 * On mount we append to localStorage.promisHistory = [{tScores, completedAt, sessionId}]
 * Then we render the bar chart (current visit) + the "Trends over time" multi-line SVG.
 */

const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];
const FULL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles",
};
const COLORS = {
  PF: "#2f75ff",
  PI: "#ff4f4f",
  F:  "#7a58ff",
  A:  "#ffa41a",
  D:  "#1bb07a",
  SR: "#e7477d",
};

function categoryFor(domain, t) {
  // PROMIS convention: PF/SR higher is better; others higher is worse.
  if (domain === "PF" || domain === "SR") {
    if (t >= 55) return { label: "Normal", cls: "normal" };
    if (t >= 45) return { label: "Mild Limitation", cls: "mild" };
    if (t >= 35) return { label: "Moderate Limitation", cls: "moderate" };
    return { label: "Severe Limitation", cls: "severe" };
  } else {
    if (t < 45)  return { label: "None–Mild", cls: "mild" };
    if (t < 55)  return { label: "Moderate",  cls: "moderate" };
    return { label: "Severe", cls: "severe" };
  }
}

export default function ResultsPage() {
  const [scores, setScores]       = useState(null); // {PF,PI,F,A,D,SR}
  const [sessionId, setSessionId] = useState("");
  const [when, setWhen]           = useState("");

  // 1) Read current visit from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promisResults");
      if (raw) {
        const parsed = JSON.parse(raw);
        const t = parsed.tScores || parsed; // be lenient
        setScores(t);
        setSessionId(parsed.sessionId || "");
        const ts = parsed.completedAt || new Date().toISOString();
        setWhen(ts);

        // append to local history for the Trends chart
        const rawHist = localStorage.getItem("promisHistory");
        const hist = rawHist ? JSON.parse(rawHist) : [];
        hist.push({ tScores: t, completedAt: ts, sessionId: parsed.sessionId || "" });
        localStorage.setItem("promisHistory", JSON.stringify(hist));
      }
    } catch (e) {
      console.error("Could not parse results from sessionStorage", e);
    }
  }, []);

  // 2) Load history
  const history = useMemo(() => {
    try {
      const raw = localStorage.getItem("promisHistory");
      if (!raw) return [];
      const arr = JSON.parse(raw)
        .filter(x => x && x.tScores)
        .sort((a,b) => new Date(a.completedAt) - new Date(b.completedAt));
      return arr.slice(-12); // last 12 runs
    } catch { return []; }
  }, [when]);

  const niceDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return iso || ""; }
  };

  // Chart helpers
  const YMIN = 20, YMAX = 80;
  const W = 900, H = 240, L = 52, R = 18, T = 18, B = 28;
  const plotW = W - L - R, plotH = H - T - B;
  const y = (t) => T + (1 - (t - YMIN) / (YMAX - YMIN)) * plotH;
  const x = (i, n) => L + (n === 1 ? plotW/2 : (i/(n-1))*plotW);

  return (
    <div className="page-wrap">
      <div className="brandbar">
        <img src="/logo_new.svg" alt="Ascension | Seton" />
      </div>
      <div className="brand-divider" />

      <div className="card" style={{paddingTop: 22}}>
        <h1 className="h1">PROMIS Assessment Results</h1>
        <div className="subtitle">Texas Spine and Scoliosis, Austin TX</div>

        <div style={{fontSize:12, color:"#557e97", margin:"0 2px 12px"}}>
          Completed on <b>{niceDate(when)}</b>{sessionId ? <> — <b>Session ID:</b> {sessionId}</> : null}
        </div>

        {/* RESULTS TABLE */}
        <table className="results-table">
          <thead>
            <tr>
              <th style={{width: "32%"}}>Domain</th>
              <th style={{width: "13%"}}>T-score</th>
              <th style={{width: "18%"}}>Category</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => {
              const t = scores?.[d] ?? 50;
              const cat = categoryFor(d, Number(t));
              const interp = (d === "PF" || d === "SR")
                ? "Higher scores indicate BETTER function/ability."
                : "Higher scores indicate MORE of the symptom/problem.";
              return (
                <tr key={d}>
                  <td>{FULL[d]}</td>
                  <td>{Number.isFinite(t) ? Number(t).toFixed(1) : "—"}</td>
                  <td><span className={`pill ${cat.cls}`}>{cat.label}</span></td>
                  <td>{interp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* BAR CHART (current visit) */}
        <div style={{marginTop: 18}}>
          <div style={{fontWeight:800, margin:"0 0 8px"}}>PROMIS T-scores</div>
          <div className="chart-card">
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="T-score bars">
              {/* grid */}
              <line x1={L} y1={y(40)} x2={W-R} y2={y(40)} className="grid-line" />
              <line x1={L} y1={y(50)} x2={W-R} y2={y(50)} className="grid-line mid" />
              <line x1={L} y1={y(60)} x2={W-R} y2={y(60)} className="grid-line" />

              {DOMAINS.map((d, i) => {
                const t = Number(scores?.[d] ?? 50);
                const w = 72; // bar width
                const cx = L + (i + 0.5) * (plotW / DOMAINS.length);
                const bh = Math.max(2, y(20) - y(t));
                const yTop = y(t);
                return (
                  <g key={d}>
                    <rect
                      x={cx - w/2} y={yTop}
                      width={w} height={bh}
                      className={`bar-${d}`}
                      rx="8" ry="8"
                    />
                    {/* domain code */}
                    <text x={cx} y={H-10} textAnchor="middle" fontSize="12" fill="#395e74">{d}</text>
                    {/* numeric value above bar */}
                    <text x={cx} y={yTop - 8} textAnchor="middle" fontWeight="700" fontSize="14" fill="#213f52">
                      {Number.isFinite(t) ? (Math.round(t * 10) / 10).toString() : ""}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="caption">
              PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone (~±3 around 50). Mean 50 (solid), ±1 SD (dashed).
            </div>
          </div>
        </div>

        {/* TRENDS OVER TIME */}
        <div style={{marginTop: 24}}>
          <div style={{fontWeight:800, margin:"0 0 8px"}}>Trends over time</div>
          <div className="chart-card">
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Trends over time">
              {/* grid */}
              <line x1={L} y1={y(40)} x2={W-R} y2={y(40)} className="grid-line" />
              <line x1={L} y1={y(50)} x2={W-R} y2={y(50)} className="grid-line mid" />
              <line x1={L} y1={y(60)} x2={W-R} y2={y(60)} className="grid-line" />

              {DOMAINS.map((d) => {
                const n = history.length || 1;
                const pts = history.map((h, i) => [x(i, n), y(Number(h.tScores?.[d] ?? 50))]);
                // polyline
                return (
                  <g key={`trend-${d}`}>
                    {pts.length >= 2 && (
                      <polyline
                        points={pts.map(p => p.join(",")).join(" ")}
                        fill="none"
                        stroke={COLORS[d]}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    )}
                    {pts.map((p, i) => (
                      <circle key={i} cx={p[0]} cy={p[1]} r="5" fill={COLORS[d]}>
                        <title>{`${FULL[d]}: ${history[i]?.tScores?.[d]}  •  ${niceDate(history[i]?.completedAt)}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>
            <div className="caption">
              Y: T-score (20–80). X: Date/time. One colored line per domain. Hover points for domain, T-score, & date.
            </div>
          </div>
        </div>

        {/* CENTERED ACTION BUTTONS */}
        <div className="footer-actions">
          <button className="ghost-btn" onClick={() => window.print()}>Save as PDF</button>
          <button className="ghost-btn" onClick={() => alert("Submitted.")}>Submit &amp; Finish</button>
          <button className="ghost-btn" onClick={() => window.print()}>Print</button>
          <button className="ghost-btn" onClick={() => alert("Email sent.")}>Email Results</button>
        </div>

        <div style={{textAlign:"center", marginTop: 14, color:"#557e97"}}>
          Thank you for completing the survey
        </div>
      </div>
    </div>
  );
}
