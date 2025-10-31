"use client";

import { Suspense, useEffect, useState } from "react";

export const revalidate = false; // dynamic CSR page

function ResultsInner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("promis_result");
    if (raw) {
      try { setData(JSON.parse(raw)); }
      catch { /* ignore */ }
    }
  }, []);

  if (!data) {
    return (
      <div style={{maxWidth:920, margin:"40px auto", padding:"24px",
        background:"#fff", borderRadius:16, boxShadow:"0 10px 24px rgba(0,0,0,.08)"}}>
        <h2 style={{marginTop:0}}>Results unavailable</h2>
        <p>Please complete the survey to see results.</p>
      </div>
    );
  }

  const rows = Object.entries(data); // [domain, t]

  return (
    <div style={{maxWidth:920, margin:"40px auto", padding:"24px",
      background:"#fff", borderRadius:16, boxShadow:"0 10px 24px rgba(0,0,0,.08)"}}>
      <h2 style={{marginTop:0}}>PROMIS Assessment Results</h2>
      <p style={{marginTop:-8, color:"#5b7287"}}>
        Texas Spine and Scoliosis, Austin TX
      </p>
      <table style={{width:"100%", borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{textAlign:"left", padding:"10px 8px"}}>Domain</th>
            <th style={{textAlign:"right", padding:"10px 8px"}}>T-score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([d, t]) => (
            <tr key={d} style={{borderTop:"1px solid #e6eef5"}}>
              <td style={{padding:"10px 8px"}}>{d}</td>
              <td style={{padding:"10px 8px", textAlign:"right", fontWeight:800}}>{t}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:18}}>
        <button onClick={()=>window.print()}
          style={{padding:"10px 14px", borderRadius:12, border:"0",
                  background:"#0c4a6e", color:"#fff", fontWeight:700}}>
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{padding:24, textAlign:"center"}}>Loading…</div>}>
      <ResultsInner />
    </Suspense>
  );
}