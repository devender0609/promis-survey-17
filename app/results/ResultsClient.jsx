@'
"use client";
import { useEffect, useState } from "react";

const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];
const LABELS = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F: "Fatigue",
  A: "Anxiety",
  D: "Depression",
  SR: "Social Roles",
};
// brand colors per domain
const COLORS = {
  PF: "#3b82f6",
  PI: "#ef4444",
  F: "#a855f7",
  A: "#22c55e",
  D: "#f59e0b",
  SR: "#06b6d4",
};

export default function ResultsClient() {
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("promis_history_v1");
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        setHistory(arr);
        if (arr.length) setLast(arr[arr.length - 1]);
      }
    } catch (e) {
      console.error("Failed to read history from localStorage", e);
    }
  }, []);

  if (!last) {
    return (
      <div className="card">
        <h2 className="title">Your PROMIS Results</h2>
        <p style={{ textAlign: "center", margin: "12px 0" }}>
          No results found yet. Please complete the survey first.
        </p>
      </div>
    );
  }

  const clampPct = (v) => Math.max(0, Math.min(100, v ?? 0));

  return (
    <div>
      {/* Bars */}
      <section className="card">
        <h2 className="title">Your PROMIS Results</h2>
        <div className="bars">
          {DOMAINS.map((d) => {
            const v = Math.round(last?.t?.[d] ?? 50);
            return (
              <div className="bar" key={d}>
                <div
                  className="bar-fill"
                  style={{ height: `${clampPct(v)}%`, background: COLORS[d] }}
                >
                  <span className="bar-value">{v}</span>
                </div>
                <div className="bar-label">{LABELS[d]}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trend over time */}
      <section className="card">
        <h3 className="subtitle" style={{ textAlign: "center" }}>
          Trend over time
        </h3>
        <div className="trend-wrap">
          {history.map((r, idx) => (
            <div className="trend-line" key={r.when ?? idx}>
              <div className="trend-label">
                {new Date(r.when ?? Date.now()).toLocaleDateString()}
              </div>
              <div className="trend-track">
                {DOMAINS.map((d) => {
                  const v = Math.round(r?.t?.[d] ?? 50);
                  const left = `${clampPct(v)}%`;
                  return (
                    <div
                      key={d}
                      className="trend-point"
                      style={{ left, background: COLORS[d] }}
                      title={`${LABELS[d]}: ${v}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Centered table */}
      <section className="card">
        <div
          className="table-wrap"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <table className="results-table" style={{ maxWidth: 900 }}>
            <thead>
              <tr>
                <th>Date & Time</th>
                {DOMAINS.map((d) => (
                  <th key={d}>{LABELS[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((r, idx) => (
                <tr key={r.when ?? idx}>
                  <td>{new Date(r.when ?? Date.now()).toLocaleString()}</td>
                  {DOMAINS.map((d) => (
                    <td key={d}>{Math.round(r?.t?.[d] ?? 50)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
'@ | Set-Content -Path .\app\results\ResultsClient.jsx -Encoding UTF8
