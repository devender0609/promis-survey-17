"use client";
export const revalidate = false;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// app/results/page.jsx
// Never ISR/prerender this route, and don't cache fetches
        // âœ… valid (number or false)



import { useEffect, useMemo, useState } from "react";

// ---------- helpers
const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];
const NAME = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles",
};

function categoryAndInterpretation(domain, t) {
  // Basic, readable bucketization; tweak thresholds if youâ€™d like.
  // PF & SR: higher = BETTER function/ability
  // PI/A/D/F: higher = MORE symptom/problem
  const better = domain === "PF" || domain === "SR";
  const interp = better
    ? "Higher scores indicate BETTER function/ability."
    : "Higher scores indicate MORE of the symptom/problem.";

  let cat;
  if (better) {
    // lower scores => limitation
    if (t < 35) cat = "Severe Limitation";
    else if (t < 45) cat = "Moderate Limitation";
    else if (t < 50) cat = "Mild Limitation";
    else cat = "Normal";
  } else {
    // higher => worse symptoms
    if (t >= 70) cat = "Severe";
    else if (t >= 60) cat = "Moderate";
    else if (t >= 55) cat = "Mild";
    else cat = "Noneâ€“Mild";
  }

  return { cat, interp };
}

function fmt(n) {
  return typeof n === "number" && isFinite(n) ? Number(n.toFixed(1)) : "â€”";
}

// simple id + date for the header
function ensureSessionMeta() {
  let id = sessionStorage.getItem("promis_session_id");
  if (!id) {
    id = "PROMIS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    sessionStorage.setItem("promis_session_id", id);
  }
  let completed = sessionStorage.getItem("promis_completed_at");
  if (!completed) {
    completed = new Date().toLocaleString();
    sessionStorage.setItem("promis_completed_at", completed);
  }
  return { id, completed };
}

// Trend history: store last few submissions
function pushHistory(scores) {
  const key = "promis_history";
  const now = new Date().toISOString();
  let arr = [];
  try {
    arr = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {}
  arr.push({ at: now, scores });
  // keep last 10
  if (arr.length > 10) arr = arr.slice(-10);
  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem("promis_history") || "[]");
  } catch {
    return [];
  }
}

// ---------- tiny SVG chart utils
const CH = {
  // T-score domain is 20â€“80 for scaling on both charts
  T_MIN: 20,
  T_MAX: 80,
  MEAN: 50,
  SD: 10,
  MCID: 3, // shaded band around 50
};

function tToY(t, height, padding = 24) {
  const usable = height - padding * 2;
  const ratio = (t - CH.T_MIN) / (CH.T_MAX - CH.T_MIN);
  // y grows downward; highest T -> smaller y
  return padding + (1 - ratio) * usable;
}

function makeMailBody(data, sessionMeta) {
  const lines = [
    `PROMIS Assessment Results`,
    `Location: Texas Spine and Scoliosis, Austin TX`,
    `Completed: ${sessionMeta.completed}`,
    `Session ID: ${sessionMeta.id}`,
    ``,
    `Domain,T-score,Category,Interpretation`,
  ];
  for (const d of DOMAINS) {
    const t = data[d];
    const { cat, interp } = categoryAndInterpretation(d, t);
    lines.push(`${NAME[d]},${fmt(t)},${cat},${interp}`);
  }
  return encodeURIComponent(lines.join("\n"));
}

// ---------- main component
export default function ResultsPage() {
  const [scores, setScores] = useState(null);
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState({ id: "", completed: "" });

  useEffect(() => {
    // Pull the scores saved by the survey page
    let parsed = null;
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) parsed = JSON.parse(raw);
    } catch {}
    // Fallback example (only if truly empty) so page doesnâ€™t look blank in dev
    if (!parsed) {
      parsed = { PF: 45, PI: 65, F: 70, A: 60, D: 55, SR: 50 };
    }
    setScores(parsed);

    // header info
    setMeta(ensureSessionMeta());

    // persist on timeline & read
    const h = pushHistory(parsed);
    setHistory(h);
  }, []);

  const rows = useMemo(() => {
    if (!scores) return [];
    return DOMAINS.map((d) => {
      const t = scores[d];
      const { cat, interp } = categoryAndInterpretation(d, t);
      return { key: d, name: NAME[d], t: fmt(t), cat, interp };
    });
  }, [scores]);

  if (!scores) {
    return (
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "16px" }}>
        <h2>Results unavailable</h2>
        <p>Please complete the survey to generate PROMIS Assessment Results.</p>
      </main>
    );
  }

  const emailHref = `mailto:?subject=${encodeURIComponent(
    "PROMIS Assessment Results"
  )}&body=${makeMailBody(scores, meta)}`;

  const onPrint = () => window.print();
  const onSavePDF = () => window.print();
  const onFinish = () =>
    (window.location.href = "https://texasspineandscoliosis.com/");

  // ---------- styles
  const card = {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    boxShadow: "0 10px 24px rgba(2,44,74,0.10)",
    border: "1px solid #e8f0f7",
  };

  // ---------- render
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #e9f4fb 0%, #f5fbff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Top brand row */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            justifyContent: "center",
            paddingBottom: 8,
            borderBottom: "1px solid rgba(4,55,86,0.15)",
          }}
        >
          {/* Ensure /public/logo_new.png has transparent background */}
          <img
            src="/logo_new.png"
            alt="Ascension | Seton"
            style={{
              height: 64,
              objectFit: "contain",
              mixBlendMode: "multiply",
              filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.6))",
            }}
          />
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
        <section style={{ ...card, padding: 24 }}>
          <h1
            style={{
              margin: "0 0 6px",
              textAlign: "center",
              color: "#0a4466",
              fontSize: 32,
              letterSpacing: 0.2,
            }}
          >
            PROMIS Assessment Results
          </h1>
          <p
            style={{
              margin: 0,
              textAlign: "center",
              color: "#3d667f",
              fontWeight: 500,
            }}
          >
            Texas Spine and Scoliosis, Austin TX
          </p>

          <div
            style={{
              marginTop: 10,
              marginBottom: 16,
              color: "#577a90",
              fontSize: 12,
            }}
          >
            Completed on <strong>{meta.completed}</strong> â€” Session ID:{" "}
            <strong>{meta.id}</strong>
          </div>

          {/* --- Table */}
          <div
            style={{
              overflow: "hidden",
              borderRadius: 12,
              border: "1px solid #e6eef6",
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead
                style={{
                  background: "#f4f9fd",
                  color: "#2a5872",
                  textTransform: "none",
                }}
              >
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid #e6eef6",
                    }}
                  >
                    Domain
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid #e6eef6",
                    }}
                  >
                    T-score
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid #e6eef6",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid #e6eef6",
                    }}
                  >
                    Interpretation
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.key} style={{ background: i % 2 ? "#fbfeff" : "#fff" }}>
                    <td style={{ padding: "12px 12px", fontWeight: 600 }}>
                      {r.name}
                    </td>
                    <td style={{ padding: "12px 12px" }}>{r.t}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background:
                            r.cat.includes("Severe")
                              ? "#ffe9ec"
                              : r.cat.includes("Moderate")
                              ? "#fff6d8"
                              : r.cat.includes("Mild")
                              ? "#eef8ff"
                              : "#ecf7ee",
                          color:
                            r.cat.includes("Severe")
                              ? "#c23b4a"
                              : r.cat.includes("Moderate")
                              ? "#a07800"
                              : r.cat.includes("Mild")
                              ? "#0b67a3"
                              : "#1d7a3a",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {r.cat}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px" }}>{r.interp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Bar chart with MCID band + mean + Â±1SD */}
          <div style={{ marginTop: 20 }}>
            <h3
              style={{
                margin: "0 0 10px",
                color: "#1d4d6a",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              PROMIS T-scores
            </h3>

            <BarChart scores={scores} />
            <div
              style={{
                color: "#6a8799",
                fontSize: 11,
                marginTop: 6,
              }}
            >
              PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone
              (Â±3 around 50). Mean 50 (solid), Â±1 SD (dashed).
            </div>
          </div>
        </section>

        {/* --- Trends over time */}
        <section style={{ ...card, padding: 24, marginTop: 18 }}>
          <h3
            style={{
              textAlign: "center",
              margin: "0 0 12px",
              color: "#1d4d6a",
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Trends over time
          </h3>

          <TrendChart history={history} />
          <div
            style={{
              color: "#6a8799",
              fontSize: 11,
              marginTop: 6,
            }}
          >
            Y: T-score (20â€“80). X: Date. One colored line per domain. Hover
            points for T-score & date.
          </div>
        </section>

        {/* --- Actions */}
        <section
          style={{
            ...card,
            padding: 16,
            marginTop: 18,
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button className="pill-btn" onClick={onSavePDF}>
            Save as PDF
          </button>
          <button className="pill-btn" onClick={onFinish}>
            Submit &amp; Finish
          </button>
          <button className="pill-btn" onClick={onPrint}>
            Print
          </button>
          <a className="pill-btn" href={emailHref}>
            Email Results
          </a>
          <style jsx>{`
            .pill-btn {
              background: #0b5c82;
              color: #fff;
              border: none;
              border-radius: 999px;
              padding: 10px 16px;
              font-weight: 700;
              cursor: pointer;
              text-decoration: none;
            }
            .pill-btn:hover {
              background: #0a4f70;
            }
            @media print {
              .pill-btn {
                display: none;
              }
            }
          `}</style>
        </section>

        <p
          style={{
            textAlign: "center",
            color: "#3a6177",
            fontSize: 13,
            marginTop: 10,
          }}
        >
          Thank you for completing the survey
        </p>
      </main>
    </div>
  );
}

// ---------- Charts (pure SVG, no deps)

function BarChart({ scores }) {
  const W = 880;
  const H = 260;
  const paddingX = 40;
  const barW = 80;
  const gap = (W - paddingX * 2 - barW * DOMAINS.length) / (DOMAINS.length - 1);

  const colors = {
    PF: "#2f7bd1",
    PI: "#e05454",
    F: "#6c54e0",
    A: "#f0a12a",
    D: "#1fa182",
    SR: "#d84c7c",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e6eef6",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="PROMIS bar chart">
        {/* MCID shaded band (Â±3 around 50) */}
        <rect
          x={8}
          y={tToY(CH.MEAN + CH.MCID, H)}
          width={W - 16}
          height={tToY(CH.MEAN - CH.MCID, H) - tToY(CH.MEAN + CH.MCID, H)}
          fill="#eaf5ff"
          opacity="0.7"
          rx="6"
        />

        {/* mean 50 (solid) */}
        <line
          x1="8"
          x2={W - 8}
          y1={tToY(CH.MEAN, H)}
          y2={tToY(CH.MEAN, H)}
          stroke="#d03232"
          strokeWidth="2"
        />
        {/* Â±1 SD (dashed) */}
        {[CH.MEAN - CH.SD, CH.MEAN + CH.SD].map((t, i) => (
          <line
            key={i}
            x1="8"
            x2={W - 8}
            y1={tToY(t, H)}
            y2={tToY(t, H)}
            stroke="#d03232"
            strokeDasharray="6 6"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}

        {/* Bars */}
        {DOMAINS.map((d, i) => {
          const t = Number(scores[d] ?? 50);
          const x = paddingX + i * (barW + gap);
          const y = tToY(t, H);
          const base = tToY(CH.T_MIN, H);
          return (
            <g key={d}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={base - y}
                rx="6"
                fill={colors[d]}
              />
              {/* label */}
              <text
                x={x + barW / 2}
                y={base + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#4a6a7c"
              >
                {d}
              </text>
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#263a44"
                fontWeight="700"
              >
                {fmt(t)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TrendChart({ history }) {
  // history: [{ at, scores: {PF,PI,F,A,D,SR}}]
  const W = 880;
  const H = 260;
  const paddingX = 40;
  const paddingY = 24;

  // Build per-domain series
  const domainsSeries = DOMAINS.map((d) => ({
    d,
    points: history.map((h, idx) => ({
      x: paddingX + (idx / Math.max(1, history.length - 1)) * (W - paddingX * 2),
      y: tToY(Number(h.scores?.[d] ?? 50), H, paddingY),
      at: h.at,
      t: Number(h.scores?.[d] ?? 50),
    })),
  }));

  const colors = {
    PF: "#2f7bd1",
    PI: "#e05454",
    F: "#6c54e0",
    A: "#f0a12a",
    D: "#1fa182",
    SR: "#d84c7c",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e6eef6",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="PROMIS trends line chart">
        {/* reference lines */}
        <line
          x1="8"
          x2={W - 8}
          y1={tToY(CH.MEAN, H, paddingY)}
          y2={tToY(CH.MEAN, H, paddingY)}
          stroke="#d03232"
          strokeWidth="2"
        />
        {[CH.MEAN - CH.SD, CH.MEAN + CH.SD].map((t, i) => (
          <line
            key={i}
            x1="8"
            x2={W - 8}
            y1={tToY(t, H, paddingY)}
            y2={tToY(t, H, paddingY)}
            stroke="#d03232"
            strokeDasharray="6 6"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}

        {/* series */}
        {domainsSeries.map(({ d, points }) => (
          <g key={d}>
            {/* polyline */}
            {points.length >= 2 && (
              <polyline
                fill="none"
                stroke={colors[d]}
                strokeWidth="2.5"
                points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                opacity="0.9"
              />
            )}
            {/* points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4.5" fill={colors[d]} opacity="0.95">
                  <title>
                    {NAME[d]} â€” {fmt(p.t)} ( {new Date(p.at).toLocaleDateString()} )
                  </title>
                </circle>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

