// app/results/page.jsx
"use client";

// Never ISR/prerender this route, and don't cache fetches
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      const data = raw ? JSON.parse(raw) : {};

      // Normalize rows in the order you want printed
      setRows([
        ["Physical Function", Math.round(Number(data["Physical Function"] ?? 50))],
        ["Pain Interference", Math.round(Number(data["Pain Interference"] ?? 50))],
        ["Fatigue",           Math.round(Number(data["Fatigue"] ?? 50))],
        ["Anxiety",           Math.round(Number(data["Anxiety"] ?? 50))],
        ["Depression",        Math.round(Number(data["Depression"] ?? 50))],
        ["Social Roles",      Math.round(Number(data["Social Roles"] ?? 50))],
      ]);
    } catch {
      setRows([]);
    }
  }, []);

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx"); // on-demand to keep bundle lean
      const ws = XLSX.utils.aoa_to_sheet([["Domain", "T-score"], ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PROMIS Results");
      XLSX.writeFile(wb, "promis_results.xlsx");
    } catch (e) {
      console.error(e);
      alert("Export failed. Please try again.");
    }
  };

  return (
    <main className="page">
      {/* Intentionally NO LogoBar here — logo comes from app/layout.jsx */}
      <div className="card results">
        <h1 className="h1" style={{ textAlign: "center", marginBottom: 4 }}>
          PROMIS Assessment Results
        </h1>
        <p className="sub" style={{ textAlign: "center", marginTop: 0 }}>
          Texas Spine and Scoliosis, Austin TX
        </p>

        <table className="res" style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "2px solid #dce8f0" }}>
                Domain
              </th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #dce8f0" }}>
                T-score
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([d, t]) => (
              <tr key={d}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eef4f9", fontWeight: 600 }}>{d}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eef4f9", textAlign: "right", fontWeight: 800 }}>
                  {t}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="actions" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <button onClick={() => window.print()} className="btn" style={btnStyle}>
            Print / Save PDF
          </button>
          <button onClick={exportExcel} className="btn" style={btnStyle}>
            Export to Excel
          </button>
        </div>
      </div>
    </main>
  );
}

const btnStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #cfe4f1",
  background: "white",
  cursor: "pointer",
};
