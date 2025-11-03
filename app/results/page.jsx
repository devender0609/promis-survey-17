"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

const INTERP = {
  "Physical Function": "Higher scores indicate BETTER function/ability.",
  "Pain Interference": "Higher scores indicate MORE of the symptom/problem.",
  Fatigue: "Higher scores indicate MORE of the symptom/problem.",
  Anxiety: "Higher scores indicate MORE of the symptom/problem.",
  Depression: "Higher scores indicate MORE of the symptom/problem.",
  "Social Roles": "Higher scores indicate BETTER function/ability.",
};

function category(t) {
  if (t >= 70) return { tag: "Severe", tone: "tag-red" };
  if (t >= 60) return { tag: "Moderate", tone: "tag-orange" };
  if (t >= 40) return { tag: "Mild Limitation", tone: "tag-yellow" };
  return { tag: "Within Normal Limits", tone: "tag-green" };
}

export default function ResultsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data) {
    return (
      <div className="page-wrap">
        <section className="card">
          <h1 className="title">PROMIS Assessment Results</h1>
          <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>
          <p style={{ marginTop: 16 }}>
            Results are unavailable. Please complete the survey first.
          </p>
        </section>
      </div>
    );
  }

  const entries = Object.entries(data); // [ [domain, t], ... ]

  return (
    <div className="page-wrap">
      <section className="card">
        <h1 className="title">PROMIS Assessment Results</h1>
        <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

        <div className="results-table">
          <div className="row head">
            <div>Domain</div>
            <div className="right">T-score</div>
            <div>Category</div>
            <div>Interpretation</div>
          </div>

          {entries.map(([domain, t]) => {
            const cat = category(Number(t));
            return (
              <div className="row" key={domain}>
                <div className="strong">{domain}</div>
                <div className="right strong">{Number(t).toFixed(1)}</div>
                <div><span className={`tag ${cat.tone}`}>{cat.tag}</span></div>
                <div>{INTERP[domain] ?? ""}</div>
              </div>
            );
          })}
        </div>

        <div className="actions">
          <button
            className="primary"
            onClick={() =>
              window.print()
            }
          >
            Print / Save PDF
          </button>

          <button
            className="secondary"
            onClick={() =>
              (window.location.href = "https://texasspineandscoliosis.com/")
            }
          >
            Submit & Finish
          </button>
        </div>
      </section>
    </div>
  );
}
