"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;        // must be number or false
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

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
      <main style={{maxWidth:960,margin:"40px auto",padding:24}}>
        <h2>Results unavailable</h2>
        <p>Please complete the survey to generate PROMIS Assessment Results.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth:960,margin:"40px auto",padding:24}}>
      <h2 style={{textAlign:"center"}}>PROMIS Assessment Results</h2>
      <p style={{textAlign:"center"}}>Texas Spine and Scoliosis, Austin TX</p>
      <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}>
        <thead>
          <tr>
            <th style={{textAlign:"left",borderBottom:"2px solid #dce8f0",padding:"10px 8px"}}>Domain</th>
            <th style={{textAlign:"right",borderBottom:"2px solid #dce8f0",padding:"10px 8px"}}>T-score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([k,v])=>(
            <tr key={k}>
              <td style={{borderBottom:"1px solid #eef4f9",padding:"10px 8px",fontWeight:600}}>{k}</td>
              <td style={{borderBottom:"1px solid #eef4f9",padding:"10px 8px",textAlign:"right",fontWeight:800,color:"#0d5275"}}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{textAlign:"center",marginTop:24}}>
        <button onClick={()=>window.print()} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #cfe4f1"}}>Print / Save PDF</button>
      </div>
    </main>
  );
}
