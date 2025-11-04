// app/results/page.jsx
"use client";

// Never ISR/prerender this route, and don't cache fetches.
// IMPORTANT: `revalidate` must be a number or false (NOT an object).
export const revalidate = false;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Read what the survey saved at finish time
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("promis_result") : null;
      const data = raw ? JSON.parse(raw) : {};

      // Normalize + order the results for the table
      const ordered = [
        ["Physical Function", asInt(data["Physical Function"], 50)],
        ["Pain Interference", asInt(data["Pain Interference"], 50)],
        ["Fatigue",           asInt(data["Fatigue"], 50)],
        ["Anxiety",           asInt(data["Anxiety"], 50)],
        ["Depression",        asInt(data["Depression"], 50)],
        ["Social Roles",      asInt(data["Social Roles"], 50)],
      ];
      setRows(ordered);
    } catch {
      setRows([]);
    }
  }, []);

  const exportExcel = async () => {
    try {
      // Lazy-load to keep the bundle small
      const XLSX = await import("xlsx");
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
      {/* No LogoBar here – the single centered logo should come from app/layout.jsx */}
      <div className="card results" style={{ maxWidth: 900, margin: "24px auto" }}>
        <h1 className="h1" style={{ textAlign: "center", marginBottom: 6 }}>
          PROMIS Assessment Results
        </h1>
        <p className="sub" style={{ textAlign: "center", marginTop: 0 }}>
          Texas Spine and Scoliosis, Austin TX
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr>
              <th style={thLeft}>Domain</th>
              <th style={thRight}>T-score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([domain, t]) => (
              <tr key={domain}>
                <td style={tdLeft}>{domain}</td>
                <td style={tdRight}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <button onClick={() => window.print()} style={btnStyle}>Print / Save PDF</button>
          <button onClick={exportExcel} style={btnStyle}>Export to Excel</button>
        </div>
      </div>
    </main>
  );
}

function asInt(x, fallback) {
  const n = Math.round(Number(x));
  return Number.isFinite(n) ? n : fallback;
}

const thLeft = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "2px solid #dce8f0",
  fontWeight: 700,
};

const thRight = {
  textAlign: "right",
  padding: "10px 8px",
  borderBottom: "2px solid #dce8f0",
  fontWeight: 700,
};

const tdLeft = {
  padding: "10px 8px",
  borderBottom: "1px solid #eef4f9",
  fontWeight: 600,
};

const tdRight = {
  padding: "10px 8px",
  borderBottom: "1px solid #eef4f9",
  textAlign: "right",
  fontWeight: 800,
};

const btnStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #cfe4f1",
  background: "white",
  cursor: "pointer",
};
