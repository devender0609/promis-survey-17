"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useState } from "react";
import LogoBar from "../components/LogoBar";

const DEST = "https://texasspineandscoliosis.com/";

export default function ResultsPage(){
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const entries = useMemo(() => data ? Object.entries(data) : [], [data]);

  if (!data) {
    return (
      <>
        <LogoBar />
        <div className="card">
          <h2 className="resultsHdr">Results unavailable</h2>
          <p className="sub">Complete the survey to generate PROMIS Assessment Results.</p>
        </div>
      </>
    );
  }

  // helper to get a category/badge & interpretation per domain
  function categorize(label, t){
    const highIsBetter = (label === "Physical Function" || label === "Social Roles");
    const z = t - 50;

    let cat, badgeClass;
    if (highIsBetter) {
      if (t < 35) { cat = "Severe Limitation"; badgeClass = "lim"; }
      else if (t < 45) { cat = "Moderate Limitation"; badgeClass = "mod"; }
      else { cat = "—"; badgeClass = "lim"; }
    } else {
      if (t >= 65) { cat = "Severe"; badgeClass = ""; }
      else if (t >= 55) { cat = "Moderate"; badgeClass = "mod"; }
      else { cat = "—"; badgeClass = "lim"; }
    }
    const interp = highIsBetter
      ? "Higher scores indicate BETTER function/ability."
      : "Higher scores indicate MORE of the symptom/problem.";
    return { cat, badgeClass, interp };
  }

  // mini bar SVG chart (no extra deps)
  function Bars(){
    const labels = Object.keys(data);
    const vals = Object.values(data);
    const max = 80, min = 20;
    const W=640, H=220, gap=20, bw=60;
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:"#fff"}}>
        {/* reference lines */}
        {[50,60,40].map((t,i)=>(<line key={i} x1="0" x2={W} y1={scale(t)} y2={scale(t)} stroke={i===0?"#b8d2e0":"#e6eef4"} strokeDasharray={i===0?"4 4":"6 6"} />))}
        {labels.map((lb, i) => {
          const x = 40 + i * (bw + gap);
          const t = vals[i];
          const y = scale(t);
          return (
            <g key={lb}>
              <rect x={x} y={y} width={bw} height={H-30-y} fill={pick(i)} rx="6" />
              <text x={x+bw/2} y={H-10} textAnchor="middle" fontSize="11" fill="#375d74">{abbr(lb)}</text>
              <text x={x+bw/2} y={y-6} textAnchor="middle" fontSize="11" fill="#375d74">{t}</text>
            </g>
          );
        })}
      </svg>
    );
    function scale(t){ return 20 + (max - t) / (max - min) * (H - 60); }
    function abbr(lb){ return { "Physical Function":"PF","Pain Interference":"PI","Fatigue":"F","Anxiety":"A","Depression":"D","Social Roles":"SR" }[lb] || lb; }
    function pick(i){ return ["#2a7bd6","#e35252","#7b64e2","#ffb027","#27a37a","#d6519d"][i%6]; }
  }

  return (
    <>
      <LogoBar />
      <div className="card">
        <h2 className="resultsHdr">PROMIS Assessment Results</h2>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <table className="table" role="table" aria-label="PROMIS summary table">
          <thead>
            <tr>
              <th>Domain</th><th>T-score</th><th>Category</th><th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([label, t])=>{
              const { cat, badgeClass, interp } = categorize(label, t);
              return (
                <tr key={label}>
                  <td style={{fontWeight:800}}>{label}</td>
                  <td style={{textAlign:"right", fontWeight:800, color:"#0b5e86"}}>{t}</td>
                  <td><span className={`badge ${badgeClass}`}>{cat}</span></td>
                  <td>{interp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{marginTop:16, borderRadius:16, background:"#f6fbff", padding:"12px"}}>
          <strong style={{display:"block", margin:"6px 8px 8px"}}>PROMIS T-scores</strong>
          <Bars/>
          <div style={{fontSize:12, color:"#49697f", margin:"6px 8px 0"}}>
            PROMIS T-score (mean 50, SD 10). Shaded lines show mean (50) and ±1 SD.
          </div>
        </div>

        {/* CTA row */}
        <div className="ctaRow">
          <button className="btn ghost" onClick={()=>window.print()}>Save as PDF</button>
          <button className="btn" onClick={()=>{ window.location.href = DEST; }}>Submit & Finish</button>
        </div>
        <div className="printNote">Thank you for completing the survey</div>
      </div>
    </>
  );
}
