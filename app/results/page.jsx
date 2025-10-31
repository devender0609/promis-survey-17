"use client";

import LogoBar from "../../components/LogoBar";
import { useEffect, useState } from "react";

/** Ensure this page is always dynamic (no SSG/ISR). */
export const dynamic = "force-dynamic";
export const revalidate = 0;               // must be a number or false
export const fetchCache = "force-no-store";

export default function ResultsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) setData(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!data) {
    return (
      <div className="container">
        <LogoBar />
        <div className="card">
          <h2>Results unavailable</h2>
          <p>Please complete the survey to generate PROMIS Assessment Results.</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data);

  return (
    <div className="container">
      <LogoBar />
      <div className="card">
        <h2 style={{ textAlign: "center", margin: "0 0 4px" }}>
          PROMIS Assessment Results
        </h2>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "2px solid #dce8f0", padding: "10px 8px" }}>Domain</th>
              <th style={{ textAlign: "right", borderBottom: "2px solid #dce8f0", padding: "10px 8px" }}>T-score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k}>
                <td style={{ borderBottom: "1px solid #eef4f9", padding: "10px 8px", fontWeight: 600 }}>{k}</td>
                <td style={{ borderBottom: "1px solid #eef4f9", padding: "10px 8px", textAlign: "right", fontWeight: 800, color: "#0d5275" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
}
