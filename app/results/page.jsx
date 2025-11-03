"use client";

// prevent SSG no matter what the parent does
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

const LABEL = { PF:"Physical Function", PI:"Pain Interference", F:"Fatigue", A:"Anxiety", D:"Depression", SR:"Social Roles" };

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
      <main className="container">
        <div className="card">
          <h2>Results unavailable</h2>
          <p>Please complete the survey first.</p>
        </div>
      </main>
    );
  }

  const rows = Object.entries(data).map(([k,v]) => ({ domain: LABEL[k] ?? k, score: v }));

  return (
    <main className="container">
      <div className="card">
        <h1 className="title">PROMIS Assessment Results</h1>
        <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

        <table className="table">
          <thead>
            <tr><th>Domain</th><th style={{textAlign:"right"}}>T-score</th></tr>
          </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.domain}>
              <td>{r.domain}</td>
              <td style={{textAlign:"right", fontWeight:700}}>{r.score}</td>
            </tr>
          ))}
        </tbody>
        </table>

        <div className="btn-row">
          <button onClick={() => window.print()} className="outline">Save as PDF</button>
          <button
            className="primary"
            onClick={() => (window.location.href = "https://texasspineandscoliosis.com/")}
          >
            Submit &amp; Finish
          </button>
        </div>
      </div>
    </main>
  );
}
