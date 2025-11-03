// app/results/ClientResults.jsx
"use client";

import { useEffect, useState } from "react";

export default function ClientResults() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      const data = raw ? JSON.parse(raw) : {};
      setRows([
        ["Physical Function", round(data["Physical Function"], 1, 50)],
        ["Pain Interference", round(data["Pain Interference"], 1, 50)],
        ["Fatigue",          round(data["Fatigue"], 1, 50)],
        ["Anxiety",          round(data["Anxiety"], 1, 50)],
        ["Depression",       round(data["Depression"], 1, 50)],
        ["Social Roles",     round(data["Social Roles"], 1, 50)],
      ]);
    } catch {
      setRows([]);
    }
  }, []);

  const onExportExcel = async () => {
    const { utils, writeFileXLSX } = await import("xlsx");
    const ws = utils.aoa_to_sheet([["Domain", "T-score"], ...rows]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "PROMIS Results");
    writeFileXLSX(wb, "promis_results.xlsx");
  };

  return (
    <>
      <table className="res">
        <thead>
          <tr>
            <th>Domain</th>
            <th className="num">T-score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([d, t]) => (
            <tr key={d}>
              <td>{d}</td>
              <td className="num">{t}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions">
        <button onClick={() => window.print()} className="btn">Print / Save PDF</button>
        <button onClick={onExportExcel} className="btn" style={{ marginLeft: 12 }}>
          Export Excel
        </button>
      </div>
    </>
  );
}

function round(v, digits = 0, fallback = 50) {
  const n = Number(v);
  if (Number.isFinite(n)) return Number(n.toFixed(digits));
  return fallback;
}
