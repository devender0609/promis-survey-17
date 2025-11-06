"use client";

import { useEffect, useMemo, useState } from "react";

// ---- helpers to read/write local history (keys & shape you already use) ----
const KEY_LAST = "promis_last_result_v1";
const KEY_HISTORY = "promis_history_v1";

function readJSON(key, fallback) {
  try {
    const raw = (typeof window !== "undefined") ? window.localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function ClientResults() {
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // load once on mount
    setLast(readJSON(KEY_LAST, null));
    const h = readJSON(KEY_HISTORY, []);
    // normalize: ensure each row has a stable timestamp
    const norm = (h || []).map((r, idx) => ({
      ...r,
      when: r.when ?? r.timestamp ?? r.date ?? Date.now() - (h.length - idx) * 60_000,
    }));
    setHistory(norm);
  }, []);

  const domains = useMemo(() => {
    if (!last || !last.scores) return [];
    // expect: last.scores = { PF: number, PI: number, F: number, A: number, D: number, SR: number }
    const ORDER = ["PF", "PI", "F", "A", "D", "SR"];
    const LABEL = {
      PF: "Physical Function",
      PI: "Pain Interference",
      F: "Fatigue",
      A: "Anxiety",
      D: "Depression",
      SR: "Social Roles",
    };
    const COLOR = {
      PF: "#2a7cc7",
      PI: "#c72a5a",
      F: "#6f42c1",
      A: "#1aa179",
      D: "#e38f1a",
      SR: "#2f4858",
    };
    return ORDER.map((k) => ({
      key: k,
      label: LABEL[k],
      value: Number(last.scores?.[k] ?? 0),
      color: COLOR[k],
    }));
  }, [last]);

  if (!last) {
    return (
      <div className="page-wrap">
        <div className="card">
          <h1 className="title">Results</h1>
          <p>We couldn’t find a completed survey in this browser yet.</p>
          <a className="pill-btn" href="/">Start survey</a>
        </div>
      </div>
    );
  }

  const asDate = (t) => {
    try { return new Date(t).toLocaleString(); } catch { return String(t); }
  };

  // compute trend series per domain from history
  const series = useMemo(() => {
    const ORDER = ["PF", "PI", "F", "A", "D", "SR"];
    const out = Object.fromEntries(ORDER.map((k) => [k, []]));
    (history || []).forEach((r) => {
      ORDER.forEach((k) => {
        const v = Number(r?.scores?.[k] ?? NaN);
        if (!Number.isNaN(v)) out[k].push({ when: r.when ?? Date.now(), value: v });
      });
    });
    return out;
  }, [history]);

  return (
    <div className="page-wrap">
      {/* Header + logo row */}
      <header className="site-header">
        <img src="/logo_new.svg" alt="Ascension Seton" className="header-logo" />
      </header>

      <div className="card">
        <h1 className="title">PROMIS T-Scores</h1>
        <p className="subtitle">Your most recent results are shown below.</p>

        {/* Bars with values */}
        <div className="chart-card">
          <h3>By domain</h3>
          <div className="bars">
            {domains.map((d) => {
              const pct = Math.max(0, Math.min(100, ((d.value - 20) / 60) * 100)); // scale 20–80
              return (
                <div className="bar" key={d.key} title={`${d.label}: ${d.value.toFixed(1)}`}>
                  <div className="bar-fill" style={{ height: `${pct}%`, background: d.color }}>
                    <div className="bar-value">{d.value.toFixed(1)}</div>
                  </div>
                  <div className="bar-label">{d.label}</div>
                </div>
              );
            })}
          </div>
          {/* reference lines (mean 50, SD ±10) */}
          <div className="ref-lines">
            <div className="ref mean" />
            <div className="ref sd" />
            <div className="ref sd" />
          </div>
        </div>

        {/* Trend over time */}
        <div className="chart-card">
          <h3>Trend over time</h3>
          <div className="trend-wrap">
            {Object.entries(series).map(([k, arr]) => (
              <div className="trend-line" key={k}>
                <div className="trend-label">{k}</div>
                <div className="trend-track">
                  {arr.map((pt, idx) => {
                    const v = Math.max(20, Math.min(80, Number(pt.value)));
                    const x = (idx / Math.max(1, arr.length - 1)) * 100;
                    const y = ((v - 20) / 60) * 100; // map 20..80 -> 0..100
                    return (
                      <div
                        key={pt.when ?? idx}
                        className="trend-point"
                        title={`${k} • ${v.toFixed(1)} • ${asDate(pt.when)}`}
                        style={{ left: `calc(${x}% - 6px)`, top: `calc(${(100 - y)}% - 6px)` }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="trend-refs">
              <div className="mean" />
              <div className="sd" />
              <div className="sd" />
            </div>
          </div>
        </div>

        {/* Table — centered */}
        <div className="table-wrap" style={{ display: "flex", justifyContent: "center" }}>
          <table className="results-table" style={{ maxWidth: 760 }}>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>PF</th>
                <th>PI</th>
                <th>F</th>
                <th>A</th>
                <th>D</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, idx) => (
                <tr key={r.when ?? idx}>
                  <td>{asDate(r.when)}</td>
                  <td>{Number(r?.scores?.PF ?? "").toFixed?.(1) || ""}</td>
                  <td>{Number(r?.scores?.PI ?? "").toFixed?.(1) || ""}</td>
                  <td>{Number(r?.scores?.F ?? "").toFixed?.(1) || ""}</td>
                  <td>{Number(r?.scores?.A ?? "").toFixed?.(1) || ""}</td>
                  <td>{Number(r?.scores?.D ?? "").toFixed?.(1) || ""}</td>
                  <td>{Number(r?.scores?.SR ?? "").toFixed?.(1) || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="actions">
          <a className="pill-btn" href="/">Do another survey</a>
        </div>
        <p className="thanks">Thank you!</p>
      </div>
    </div>
  );
}
