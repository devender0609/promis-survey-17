"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;              // number (not an object)
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Image from "next/image";

export default function ResultsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([domain, t]) => ({
      Domain: domain,
      "T-score": Number(t).toFixed(0),
    }));
  }, [data]);

  function exportCSV() {
    const header = "Domain,T-score\n";
    const body = rows.map((r) => `${r["Domain"]},${r["T-score"]}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promis_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportXLSX() {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PROMIS Results");
    XLSX.writeFile(wb, "promis_results.xlsx");
  }

  if (!data) {
    return (
      <main style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
        <h3>Results unavailable</h3>
        <p>Please complete the survey first.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#eaf3f9,#f6fbff)",
        paddingBottom: 32,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
        <Image
          src="/logo_new.png"
          alt="Ascension | Seton"
          width={420}
          height={70}
          priority
          style={{
            width: "min(420px, 80vw)",
            height: "auto",
            objectFit: "contain",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "12px auto 0",
          background: "white",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(8,59,102,0.08)",
          padding: "22px 26px",
        }}
      >
        <h1 style={{ textAlign: "center", margin: 0 }}>PROMIS Assessment Results</h1>
        <p style={{ textAlign: "center", margin: "4px 0 18px", color: "#2b5870" }}>
          Texas Spine and Scoliosis, Austin TX
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thL}>Domain</th>
              <th style={thR}>T-score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.Domain}>
                <td style={tdL}>{r.Domain}</td>
                <td style={tdR}>{r["T-score"]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22 }}>
          <button className="btn" onClick={() => window.print()} style={btn}>
            Save as PDF
          </button>
          <button
            className="btn"
            style={btn}
            onClick={() => (window.location.href = "https://texasspineandscoliosis.com/")}
          >
            Submit & Finish
          </button>
          <button className="btn" style={btn} onClick={exportXLSX}>
            Export Excel
          </button>
          <button className="btn" style={{ ...btn, background: "white", color: "#0d5275", border: "1px solid #cfe4f1" }} onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>
    </main>
  );
}

const thL = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "2px solid #d7e7f1",
  color: "#0d5275",
  fontWeight: 700,
  fontSize: 15,
};
const thR = { ...thL, textAlign: "right" };
const tdBase = {
  padding: "12px 10px",
  borderBottom: "1px solid #eef4f9",
  fontSize: 15,
};
const tdL = { ...tdBase, fontWeight: 600 };
const tdR = { ...tdBase, textAlign: "right", fontWeight: 800, color: "#0d5275" };
const btn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #0d5275",
  background: "linear-gradient(180deg,#0e5c85,#0a3e5a)",
  color: "white",
  fontWeight: 700,
};
