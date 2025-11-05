// app/results/page.jsx
"use client";

export const revalidate = false;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useState } from "react";

// same domain list/colors so our legend/table are consistent
const DOMAINS = [
  { key: "PF", name: "Physical Function", color: "#3f7de8" },
  { key: "PI", name: "Pain Interference", color: "#e86a3f" },
  { key: "F",  name: "Fatigue",           color: "#a65be8" },
  { key: "SR", name: "Social Roles",      color: "#28a97a" },
  { key: "A",  name: "Anxiety",           color: "#e8a23f" },
  { key: "D",  name: "Depression",        color: "#d6486e" },
];

function fmt(dtISO) {
  try {
    const d = new Date(dtISO);
    return d.toLocaleString();
  } catch {
    return dtISO;
  }
}

export default function ResultsPage() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const l = JSON.parse(localStorage.getItem("promis_latest_run") || "null");
      const h = JSON.parse(localStorage.getItem("promis_history") || "[]");
      setLatest(l);
      // keep most recent first
      setHistory([...h].sort((a, b) => (a.when < b.when ? 1 : -1)));
    } catch {}
  }, []);

  const hasData = !!latest?.scores;

  // build export rows
  const exportRows = useMemo(() => {
    if (!history?.length) return [];
    return history.map((r) => ({
      DateTime: fmt(r.when),
      PF: r.scores?.PF ?? "",
      PI: r.scores?.PI ?? "",
      F: r.scores?.F ?? "",
      SR: r.scores?.SR ?? "",
      A: r.scores?.A ?? "",
      D: r.scores?.D ?? "",
    }));
  }, [history]);

  function exportExcel() {
    // Simple client CSV (Excel opens it)
    const header = ["Date/Time", ...DOMAINS.map(d => d.key)].join(",");
    const rows = exportRows
      .map(r => [r.DateTime, r.PF, r.PI, r.F, r.SR, r.A, r.D].join(","))
      .join("\n");
    const csv = header + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PROMIS_Results_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="results-header">
        <img src="/logo_new.svg" alt="Ascension Seton" className="header-logo" />
        <div>
          <h1 className="title">Your Results</h1>
          <p className="subtitle">Summary and trends over time</p>
        </div>
      </div>

      {!hasData ? (
        <p className="empty-note">
          No results found. Please complete the survey first.
        </p>
      ) : (
        <>
          {/* Current scores as colored bars with values */}
          <div className="chart-card">
            <h3>Current Scores</h3>
            <div className="bars">
              {DOMAINS.map((d) => {
                const v = latest.scores?.[d.key] ?? 50;
                const h = Math.max(0, Math.min(100, (v - 20) * (100 / 60))); // map 20–80 → 0–100%
                return (
                  <div key={d.key} className="bar">
                    <div
                      className="bar-fill"
                      style={{ height: `${h}%`, background: d.color }}
                    >
                      <div className="bar-value">{v}</div>
                    </div>
                    <div className="bar-label">{d.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend over time */}
          <div className="chart-card">
            <h3>Trend Over Time</h3>
            <div className="trend-legend">
              {DOMAINS.map(d => (
                <span key={d.key} className="legend-chip" style={{ background: d.color }}>
                  {d.key}
                </span>
              ))}
            </div>

            <div className="trend-wrap">
              {history.slice(0, 12).map((r, idx) => (
                <div key={r.id} className="trend-row">
                  <div className="trend-date">{fmt(r.when)}</div>
                  <div className="trend-track">
                    {DOMAINS.map((d) => {
                      const v = r.scores?.[d.key] ?? 50;
                      const pos = Math.max(0, Math.min(100, ((v - 20) / 60) * 100));
                      return (
                        <span
                          key={d.key}
                          className="trend-point"
                          style={{ left: `calc(${pos}% - 6px)`, background: d.color }}
                          title={`${d.key}: ${v}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              {history.length === 0 && <div className="empty-note">No history yet.</div>}
            </div>
          </div>

          {/* Centered table */}
          <div className="table-outer-center">
            <div className="table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    {DOMAINS.map(d => (
                      <th key={d.key}>
                        <span className="th-chip" style={{ background: d.color }}>{d.key}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{fmt(r.when)}</td>
                      {DOMAINS.map(d => (
                        <td key={d.key}>{r.scores?.[d.key] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="pill-btn" onClick={exportExcel}>Export to Excel</button>
            <a className="pill-btn" href="https://texasspineandscoliosis.com/">Submit & Finish</a>
          </div>
          <p className="thanks">Thank you for completing the survey.</p>
        </>
      )}
    </div>
  );
}
