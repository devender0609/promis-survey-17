"use client";

// IMPORTANT: no `export const revalidate = ...` anywhere here
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) {
        const obj = JSON.parse(raw);
        const out = Object.entries(obj).map(([domain, tscore]) => ({
          domain,
          tscore,
        }));
        setRows(out);
      }
    } catch (e) {
      console.error("Failed to parse results:", e);
    }
  }, []);

  if (!rows.length) {
    return (
      <main style={{maxWidth: 960, margin: "40px auto", padding: 24}}>
        <h2>Results unavailable</h2>
        <p>Please complete the survey to generate PROMIS Assessment Results.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth: 1040, margin: "40px auto", padding: 24}}>
      <h1 style={{textAlign:"center", margin:0}}>PROMIS Assessment Results</h1>
      <p style={{textAlign:"center", margin:"4px 0 24px"}}>
        Texas Spine and Scoliosis, Austin TX
      </p>

      <table style={{width:"100%", borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{textAlign:"left", padding:"12px 10px", borderBottom:"2px solid #dbe7f1"}}>Domain</th>
            <th style={{textAlign:"right", padding:"12px 10px", borderBottom:"2px solid #dbe7f1"}}>T-score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.domain}>
              <td style={{padding:"10px", borderBottom:"1px solid #eef5fa", fontWeight:600}}>{r.domain}</td>
              <td style={{padding:"10px", borderBottom:"1px solid #eef5fa", textAlign:"right", fontWeight:800, color:"#0d5275"}}>{r.tscore}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{textAlign:"center", marginTop:24}}>
        <button onClick={() => window.print()} style={{padding:"10px 16px", borderRadius:8, border:"1px solid #cfe3f0"}}>Print / Save PDF</button>
      </div>
    </main>
  );
}
