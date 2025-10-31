"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------- minimalist styles to match your spec ---------- */
const styles = {
  container: { maxWidth: 980, margin: "24px auto", padding: "16px" },
  card: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 6px 20px rgba(13,82,117,0.10)",
    border: "1px solid #e6eef4",
    padding: 24
  },
  h1: { fontSize: 26, margin: 0, textAlign: "center", color: "#0b3a52", letterSpacing: 0.2 },
  sub: { textAlign: "center", marginTop: 6, color: "#406176" },
  row: { display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, marginTop: 16 },
  q: { fontSize: 18, fontWeight: 600, color: "#0d5275", textAlign: "center", marginTop: 18 },
  answerBtn: {
    padding: "12px 10px",
    borderRadius: 12,
    border: "1px solid #dbe9f2",
    background: "#f7fbfe",
    cursor: "pointer",
    fontWeight: 600,
    textAlign: "center"
  },
  logoBar: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 12
  },
  logoImg: {
    height: 42,
    width: "auto",
    borderRadius: 10,
    background: "transparent", // blends into card; no white edge
  },
  ringWrap: { display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 6 },
  small: { fontSize: 12, color: "#5e7a8b", textAlign: "center", marginTop: 4 },
  divider: { height: 1, background: "#e6eef4", margin: "14px 0" },
  printBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #cfe4f1",
    background: "#f3fbff",
    fontWeight: 600,
    cursor: "pointer"
  },
  resultsTbl: { width: "100%", borderCollapse: "collapse", marginTop: 8 }
};

/* ---------- simple circular progress (SVG) ---------- */
function ProgressRing({ pct = 0, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} role="img" aria-label={`Progress ${pct}%`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e9f3f8" strokeWidth={stroke} fill="none"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke="#0d5275" strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        style={{ strokeDasharray: c, strokeDashoffset: offset, transition: "stroke-dashoffset .25s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#0d5275" fontWeight="700">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ---------- survey model (demo) ---------- */
const DOMAINS = ["PF","PI","F","A","D","SR"];
const ANSWERS = ["Not at all","A little bit","Somewhat","Quite a bit","Very much"];

// first question per domain (stub)
function firstQuestion(domain) {
  const map = {
    PF: "Are you able to carry out your usual physical activities?",
    PI: "In the past 7 days, how much did pain interfere with your daily activities?",
    F:  "How run-down did you feel on average in the past 7 days?",
    A:  "In the past 7 days, how often did you feel anxious?",
    D:  "In the past 7 days, how often did you feel depressed?",
    SR: "In the past 7 days, how much did your health limit social activities?"
  };
  return { domain, text: map[domain] ?? "Please answer the question." };
}

// end a domain after one response (you can swap for real stopping rules)
function isDomainFinished(ctx) { return (ctx.answers?.length ?? 0) >= 1; }

// tiny calibration shim (replace with your piecewise / model lookups)
function scoreDomain(domain, rawValue) {
  // Map 0..4 to an example T-band then nudge toward “real” with small domain offset
  const base = [35, 45, 50, 55, 65][rawValue] ?? 50;
  const bias = { PF:+1.2, PI:+0.6, F:+0.4, A:+0.3, D:+0.5, SR:+0.2 }[domain] ?? 0;
  return Number((base + bias).toFixed(1));
}

function label(d){
  return ({ PF:"Physical Function", PI:"Pain Interference", F:"Fatigue", A:"Anxiety", D:"Depression", SR:"Social Roles" })[d] ?? d;
}

/* ---------- page component with inline results ---------- */
export default function SurveyPage(){
  // branding header + circular progress
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState(()=>Object.fromEntries(DOMAINS.map(d=>[d,[]])));
  const [question, setQuestion] = useState(()=>firstQuestion(DOMAINS[0]));
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState(null);

  const totalSteps = DOMAINS.length;
  const stepsDone = useMemo(()=>DOMAINS.reduce((n,d)=>n+(answers[d].length>0?1:0),0),[answers]);
  const pct = Math.min(100, Math.round((stepsDone/totalSteps)*100));

  useEffect(()=>{ setQuestion(firstQuestion(DOMAINS[domainIdx])); }, [domainIdx]);

  function handlePick(value){
    const d = DOMAINS[domainIdx];
    setAnswers(prev => {
      const next = {...prev, [d]: [...prev[d], value]};
      // single-item stop rule; move or finish
      if (isDomainFinished({ domain: d, answers: next[d] })) {
        if (domainIdx < DOMAINS.length - 1) {
          setDomainIdx(i=>i+1);
        } else {
          // FINISH -> compute calibrated T per domain (inline)
          const out = {};
          for (const dom of DOMAINS) {
            const first = next[dom][0]; // first answer index 0..4
            out[label(dom)] = scoreDomain(dom, first);
          }
          setResults(out);
          sessionStorage.setItem("promis_result", JSON.stringify(out));
          setFinished(true); // stay on this page – no /results route
        }
      }
      return next;
    });
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo row */}
        <div style={styles.logoBar}>
          {/* use your embedded asset path /public/logo_new.png */}
          <img src="/logo_new.png" alt="Texas Spine and Scoliosis" style={styles.logoImg}/>
          <div>
            <div style={{fontWeight:700, color:"#0d5275"}}>Texas Spine and Scoliosis, Austin TX</div>
            <div style={{fontSize:12, color:"#5e7a8b"}}>Clinical Outcomes • PROMIS Adaptive Survey</div>
          </div>
        </div>

        <h1 style={styles.h1}>PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <p style={styles.sub}>Complete each prompt below. Your results appear automatically.</p>

        {/* Progress ring */}
        {!finished && (
          <>
            <div style={styles.ringWrap}><ProgressRing pct={pct} /></div>
            <div style={styles.small}>{stepsDone} of {totalSteps} domains</div>
            <div style={styles.divider} />
          </>
        )}

        {/* Inline results view */}
        {finished && results ? (
          <>
            <h2 style={{textAlign:"center", margin:"12px 0 6px", color:"#0d5275"}}>PROMIS Assessment Results</h2>
            <p style={styles.sub}>Automatically generated upon completion</p>
            <table style={styles.resultsTbl}>
              <thead>
                <tr>
                  <th style={{textAlign:"left", borderBottom:"2px solid #dce8f0", padding:"10px 8px"}}>Domain</th>
                  <th style={{textAlign:"right", borderBottom:"2px solid #dce8f0", padding:"10px 8px"}}>T-score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([k,v])=>(
                  <tr key={k}>
                    <td style={{borderBottom:"1px solid #eef4f9", padding:"10px 8px", fontWeight:600}}>{k}</td>
                    <td style={{borderBottom:"1px solid #eef4f9", padding:"10px 8px", textAlign:"right", fontWeight:800, color:"#0d5275"}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{textAlign:"center", marginTop:18}}>
              <button style={styles.printBtn} onClick={()=>window.print()}>Print / Save PDF</button>
            </div>
          </>
        ) : (
          // Survey block
          <>
            <div style={styles.q}>{question?.text ?? "Loading next question…"}</div>
            <div style={styles.row}>
              {ANSWERS.map((txt,i)=>(
                <button key={i} style={styles.answerBtn} onClick={()=>handlePick(i)}>{txt}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
