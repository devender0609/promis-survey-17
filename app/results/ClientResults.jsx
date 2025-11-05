// app/results/ResultsClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

// ----- helpers to read session data safely
function readJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const CAT_COLORS = {
  PF: "#0ea5e9",
  PI: "#ef4444",
  F:  "#10b981",
  SR: "#8b5cf6",
  A:  "#f59e0b",
  D:  "#ec4899",
};

const NICE_LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  SR: "Social Roles",
  A:  "Anxiety",
  D:  "Depression",
};

export default function ResultsClient() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const d = readJSON("promis_results", null);
    const h = readJSON("promis_history", []);
    setData(d);
    setHistory(Array.isArray(h) ? h : []);
  }, []);

  // assure shape + sanitize
  const rows = useMemo(() => {
    if (!data || !data.scores) return [];
    return Object.entries(data.scores).map(([k, v]) => ({
      code: k,
      label: NICE_LABEL[k] ?? k.replace(/[^\w\s-]/g, ""),
      t: typeof v?.t === "number" ? v.t : null,
      mean: typeof v?.mean === "number" ? v.mean : null,
      sd: typeof v?.sd === "number" ? v.sd : null,
      badge: v?.badge || "",
      color: CAT_COLORS[k] ?? "#0e4a6f",
    }));
  }, [data]);

  // ensure a timestamped history entry exists for trend
  useEffect(() => {
    if (!data?.scores) return;
    const when = data.when ?? new Date().toISOString();
    const snapshot = { when, scores: data.scores };
    const h = readJSON("promis_history", []);
    const merged =
      Array.isArray(h) && h.length && h[h.length - 1]?.when === when
        ? h
        : [...(Array.isArray(h) ? h : []), snapshot];
    sessionStorage.setItem("promis_history", JSON.stringify(merged));
    setHistory(merged);
  }, [data]);

  if (!data) {
    return (
      <div className="page-wrap">
        <header className="site-header">
          <img src="/logo_new.svg" alt="Ascension Seton" className="header-logo" />
        </header>
        <div className="card">
          <h1 className="title">Results</h1>
          <p className="subtitle">No results found in this session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <header className="site-header">
        <img src="/logo_new.svg" alt="Ascension Seton" className="header-logo" />
      </header>

      {/* top card with summary */}
      <div className="card">
        <h1 className="title">PROMIS Results</h1>
        <p className="subtitle">
          Completed on{" "}
          {new Date(data.when ?? Date.now()).toLocaleString()}
        </p>

        {/* bars with values + reference lines */}
        <div className="chart-card">
          <h3>Domain T-scores</h3>
          <div className="bars">
            {rows.map((r) => {
              const pct = r.t != null ? Math.min(100, Math.max(0, (r.t / 80) * 100)) : 0;
              return (
                <div key={r.code} className="bar">
                  <div
                    className="bar-fill"
                    style={{ height: `${pct}%`, background: r.color }}
                    title={`${r.label}: ${r.t ?? "—"}`}
                  >
                    <span className="bar-value">{r.t ?? "—"}</span>
                  </div>
                  <div className="bar-label">{r.label}</div>
                </div>
              );
            })}
          </div>
          <div className="ref-lines">
            <div className="ref mean" />
            <div className="ref sd" />
            <div className="ref sd" />
          </div>
        </div>

        {/* trend over time */}
        <div className="chart-card">
          <h3>Trend Over Time</h3>
          <div className="trend-wrap">
            {/* One compact row per domain */}
            {Object.keys(CAT_COLORS).map((code) => {
              const color = CAT_COLORS[code];
              const label = NICE_LABEL[code] ?? code;
              // lay points across the track (sorted by when)
              const points = history
                .filter((h) => h?.scores?.[code]?.t != null)
                .sort((a, b) => new Date(a.when) - new Date(b.when));
              return (
                <div key={label} className="trend-line" aria-label={label}>
                  <div className="trend-label">{label}</div>
                  <div className="trend-track">
                    {points.map((h, i) => {
                      const t = h.scores[code].t;
                      const pct = Math.min(100, Math.max(0, (t / 80) * 100));
                      const x = points.length > 1 ? (i / (points.length - 1)) * 100 : 0;
                      return (
                        <div
                          key={h.when ?? i}
                          className="trend-point"
                          title={`${label} • ${new Date(h.when).toLocaleString()} • T=${t}`}
                          style={{ left: `calc(${x}% - 6px)`, background: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="trend-refs">
              <div className="mean" />
              <div className="sd" />
              <div className="sd" />
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="actions">
          <button className="pill-btn" onClick={() => window.print()}>
            Print
          </button>
          <button
            className="pill-btn"
            onClick={() => {
              // simple CSV export (Excel-openable)
              const header = ["When", ...rows.map((r) => r.label)];
              const lines = [header.join(",")];
              history.forEach((h) => {
                const cols = [new Date(h.when).toLocaleString()];
                rows.forEach((r) => {
                  cols.push(h?.scores?.[r.code]?.t ?? "");
                });
                lines.push(cols.join(","));
              });
              const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "promis_results.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export to Excel (CSV)
          </button>
        </div>
      </div>

      {/* centered results table with color-coded categories */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Detailed Table</h3>
        <div className="table-wrap center">
          <table className="results-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>T-score</th>
                <th>Mean</th>
                <th>SD</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.code ?? idx}>
                  <td>
                    <span
                      className="pill"
                      style={{
                        background: `${r.color}15`,
                        borderColor: `${r.color}55`,
                        color: r.color,
                      }}
                    >
                      {r.label}
                    </span>
                  </td>
                  <td>{r.t ?? "—"}</td>
                  <td>{r.mean ?? "—"}</td>
                  <td>{r.sd ?? "—"}</td>
                  <td>{r.badge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="thanks">Thank you for completing the survey.</p>
      </div>
    </div>
  );
}
