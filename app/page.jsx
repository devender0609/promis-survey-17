"use client";
import { useEffect, useMemo, useState } from "react";

/** ---------------------------
 *  Minimal in-file components
 *  --------------------------*/
function AscensionLogoBar() {
  return (
    <div style={{display:"flex", justifyContent:"center", padding:"18px 12px 8px"}}>
      <img
        src="/logo_new.png"
        alt="Ascension Seton"
        style={{
          height: 44,
          objectFit: "contain",
          filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
          background: "transparent",
        }}
      />
    </div>
  );
}

function ProgressRing({ pct = 0, size = 84, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(100, pct)) / 100 * c;

  return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"center", margin:"10px 0 14px"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e6f2f8" strokeWidth={stroke} fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="#0d6ea3" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{fontSize:16, fontWeight:800, fill:"#0d5275"}}
        >
          {Math.round(Math.min(100, Math.max(0, pct)))}%
        </text>
      </svg>
    </div>
  );
}

function AnswerButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:"12px 14px",
        borderRadius:12,
        border:"1px solid #cfe4f1",
        background:"#ffffff",
        boxShadow:"0 2px 10px rgba(13,110,163,0.06)",
        cursor:"pointer",
        fontWeight:600,
        flex:"1 1 180px",
        minWidth:180,
        transition:"transform .06s ease, box-shadow .12s ease",
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
}

/** ---------------------------
 *  Survey engine (demo bank)
 *  --------------------------*/
const DOMAINS = ["PF","PI","F","A","D","SR"];

const QUESTION_BANK = {
  PF: [
    "Are you able to climb one flight of stairs without help?",
    "Are you able to carry a laundry basket up stairs?",
    "Are you able to go for a 15-minute walk at a normal pace?"
  ],
  PI: [
    "In the past 7 days, how much did pain interfere with your day-to-day activities?",
    "In the past 7 days, how much did pain interfere with work around the home?",
    "In the past 7 days, how much did pain interfere with your social activities?"
  ],
  F: [
    "In the past 7 days, how run-down did you feel on average?",
    "In the past 7 days, how often were you too tired to do household chores?",
    "In the past 7 days, how often did you feel exhausted?"
  ],
  A: [
    "In the past 7 days, I felt fearful.",
    "In the past 7 days, I felt worried.",
    "In the past 7 days, I felt anxious."
  ],
  D: [
    "In the past 7 days, I felt hopeless.",
    "In the past 7 days, I felt like a failure.",
    "In the past 7 days, I felt unhappy."
  ],
  SR: [
    "I have problems doing regular activities with my family.",
    "I have problems doing regular activities with friends.",
    "I have problems doing social activities outside the home."
  ],
};

const CHOICES = ["Not at all","A little bit","Somewhat","Quite a bit","Very much"];

/** Helpers to step questions */
function firstQuestion(domain) {
  return { domain, index: 0, text: QUESTION_BANK[domain][0] };
}
function nextQuestion(domain, answeredCount) {
  const idx = answeredCount;
  if (idx >= QUESTION_BANK[domain].length) return null;
  return { domain, index: idx, text: QUESTION_BANK[domain][idx] };
}
function isDomainFinished(domain, answeredCount) {
  return answeredCount >= QUESTION_BANK[domain].length;
}

/** Naive scoring to produce a survey_t to feed your API */
async function scoreDomainViaApi(domain, answers) {
  const raw = answers.reduce((s,v)=>s+v, 0);      // higher = “worse” for most
  const max = answers.length * 4;
  const pct = max ? (raw / max) : 0;
  const survey_t = 30 + pct * 40;                 // 30–70 band

  const res = await fetch("/api/model", {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ action:"score", domain, survey_t })
  });
  if (!res.ok) throw new Error(`API score failed for ${domain}`);
  const data = await res.json();
  return data.calibrated_t ?? survey_t;
}

/** ---------------------------
 *  Main Page
 *  --------------------------*/
export default function SurveyPage() {
  // survey state
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map(d => [d, []]))
  );
  const [question, setQuestion] = useState(() => firstQuestion(DOMAINS[0]));
  const [phase, setPhase] = useState("survey"); // "survey" | "results"
  const totalSteps = DOMAINS.length;
  const stepsDone = useMemo(
    () => DOMAINS.reduce((n, d) => n + (answers[d].length > 0 ? 1 : 0), 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  // computed results
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQuestion(firstQuestion(DOMAINS[domainIdx]));
  }, [domainIdx]);

  async function handlePick(value) {
    const d = DOMAINS[domainIdx];
    // store answer
    setAnswers(prev => {
      const updated = { ...prev, [d]: [...prev[d], value] };
      return updated;
    });

    // advance within domain or move to next
    const answeredCount = answers[d].length + 1; // optimistic
    if (isDomainFinished(d, answeredCount)) {
      // move to next domain or finish
      if (domainIdx < DOMAINS.length - 1) {
        setDomainIdx(i => i + 1);
      } else {
        // FINISH → compute results inline
        try {
          setBusy(true);
          const out = {};
          for (const dom of DOMAINS) {
            const t = await scoreDomainViaApi(
              dom,
              (answers[dom] ?? []).concat(dom === d ? [value] : [])
            );
            out[label(dom)] = Number(t.toFixed(1));
          }
          setResults(out);
          setPhase("results");
          sessionStorage.setItem("promis_result", JSON.stringify(out));
        } finally {
          setBusy(false);
        }
      }
    } else {
      setQuestion(nextQuestion(d, answeredCount));
    }
  }

  function handleSubmitAndFinish() {
    window.location.href = "https://texasspineandscoliosis.com/";
  }

  return (
    <div style={{minHeight:"100dvh", display:"flex", flexDirection:"column"}}>
      {/* Logo above the card */}
      <AscensionLogoBar />

      <main style={{flex:1, display:"flex", justifyContent:"center", padding:"8px 14px 32px"}}>
        <div
          style={{
            width:"100%", maxWidth:960, background:"#fff", borderRadius:18,
            border:"1px solid #dfeff6", boxShadow:"0 10px 34px rgba(13,110,163,0.08)",
            padding:"20px 18px"
          }}
        >
          {/* Header */}
          <h1 style={{textAlign:"center", margin:"4px 0 0", fontSize:24}}>
            PROMIS Health Snapshot <span style={{fontWeight:400}}>(Adaptive Short Form)</span>
          </h1>
          <p style={{textAlign:"center", margin:"6px 0 14px", color:"#3a6a82"}}>
            Texas Spine and Scoliosis, Austin TX
          </p>

          {/* Progress */}
          {phase === "survey" && <ProgressRing pct={pct} />}

          {/* Survey */}
          {phase === "survey" && (
            <>
              <div
                style={{
                  margin:"10px auto 16px",
                  padding:"14px 16px",
                  borderRadius:14,
                  background:"linear-gradient(180deg, #f9fdff, #f4fbff)",
                  border:"1px solid #e3f2f9",
                  fontSize:18,
                  fontWeight:700,
                  textAlign:"center"
                }}
              >
                {question?.text ?? "Loading next question…"}
              </div>

              <div style={{display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center"}}>
                {CHOICES.map((txt, i) => (
                  <AnswerButton key={i} onClick={() => handlePick(i)}>
                    {txt}
                  </AnswerButton>
                ))}
              </div>
            </>
          )}

          {/* Results */}
          {phase === "results" && (
            <div style={{marginTop:8}}>
              <h2 style={{textAlign:"center", margin:"8px 0 2px"}}>PROMIS Assessment Results</h2>
              <p style={{textAlign:"center", margin:"0 0 18px", color:"#3a6a82"}}>
                Texas Spine and Scoliosis, Austin TX
              </p>

              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      <th style={{textAlign:"left", borderBottom:"2px solid #dce8f0", padding:"10px 8px"}}>Domain</th>
                      <th style={{textAlign:"right", borderBottom:"2px solid #dce8f0", padding:"10px 8px"}}>Calibrated T-score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results ?? {}).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{borderBottom:"1px solid #eef4f9", padding:"10px 8px", fontWeight:600}}>{k}</td>
                        <td style={{borderBottom:"1px solid #eef4f9", padding:"10px 8px", textAlign:"right", fontWeight:800, color:"#0d5275"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{display:"flex", gap:10, justifyContent:"center", marginTop:16}}>
                <button
                  onClick={() => window.print()}
                  style={{padding:"10px 14px", borderRadius:10, border:"1px solid #cfe4f1", background:"#fff"}}
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={handleSubmitAndFinish}
                  style={{padding:"10px 14px", borderRadius:10, border:"1px solid #0d6ea3", background:"#0d6ea3", color:"#fff", fontWeight:700}}
                >
                  Submit & Finish
                </button>
              </div>
            </div>
          )}

          {busy && (
            <div style={{textAlign:"center", marginTop:16, color:"#0d6ea3", fontWeight:700}}>
              Scoring…
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function label(d) {
  return ({
    PF: "Physical Function",
    PI: "Pain Interference",
    F:  "Fatigue",
    A:  "Anxiety",
    D:  "Depression",
    SR: "Social Roles"
  })[d] ?? d;
}
