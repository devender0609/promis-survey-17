// app/results/page.jsx
"use client";

// Never prerender/cache this route
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles",
};

export default function ResultsPage() {
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const l = window.sessionStorage.getItem("promis_last");
      const h = window.sessionStorage.getItem("promis_history");
      if (l) setLast(JSON.parse(l));
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  const rows = last?.results || [];
  const tByDomain = useMemo(() => {
    const map = { PF: [], PI: [], F: [], A: [], D: [], SR: [] };
    history.forEach((r) => {
      (r.results || []).forEach((x) => {
        map[x.domain].push({ when: r.when, T: x.T });
      });
    });
    return map;
  }, [history]);

  return (
    <>
      <header className="site-header">
        <Image src="/logo_new.svg" alt="Ascension Seton" className="header-logo" width={260} height={54} priority />
      </header>

      <main className="page-wrap">
        <section className="card">
          <h1 className="title">PROMIS Assessment Results</h1>
          <p className="subtitle">
            Texas Spine and Scoliosis, Austin TX
            {last?.sessionId ? <> — <strong>Session ID:</strong> {last.sessionId}</> : null}
          </p>

          {/* Results table */}
          <div className="table-wrap" style={{ display: "flex", justifyContent: "center" }}>
            <table className="results-table" style={{ maxWidth: 980 }}>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>T-score</th>
                  <th>Category</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const interp =
                    r.domain === "PF" || r.domain === "SR"
                      ? "Higher scores indicate BETTER function/ability."
                      : "Higher scores indicate MORE of the symptom/problem.";
                return (
                  <tr key={r.label + idx}>
                    <td>{r.label}</td>
                    <td>{r.T}</td>
                    <td>
                      <span
                        className="pill"
                        style={{ color: r.catColor, background: r.catBg, borderColor: r.catColor + "22" }}
                        title={r.category}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td>{interp}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>

          {/* Simple bar chart */}
          <div className="chart-card">
            <h3>PROMIS T-scores</h3>
            <div className="bars">
              <div className="ref-lines">
                <div className="ref mean" />
                <div className="ref sd" />
                <div className="ref sd" />
              </div>
              {rows.map((r) => {
                // Bar height: map T 20–80 onto 20–100%
                const h = 20 + ((r.T - 20) / 60) * 80;
                return (
                  <div className="bar" key={r.label}>
                    <div className="bar-fill" style={{ height: `${h}%` }}>
                      <span className="bar-value">{r.T}</span>
                    </div>
                    <div className="bar-label">{r.domain}</div>
                  </div>
                );
              })}
            </div>
            <small>PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone (~±3 around 50). Mean 50 (solid), ±1 SD (dashed).</small>
          </div>

          {/* Trends over time */}
          <div className="chart-card">
            <h3>Trends over time</h3>
            <div className="trend-wrap">
              {/* reference lines */}
              <div className="trend-refs">
                <div className="mean" />
                <div className="sd" />
                <div className="sd" />
              </div>

              {Object.keys(tByDomain).map((d, idx) => {
                const arr = tByDomain[d];
                if (!arr.length) return null;
                // Sort by date
                const sorted = [...arr].sort((a, b) => new Date(a.when) - new Date(b.when));
                // Position each point horizontally (even spacing)
                return (
                  <div key={d + idx} className="trend-line">
                    <div className="trend-label">{d}</div>
                    <div className="trend-track">
                      {sorted.map((pt, i) => {
                        const left = (i / Math.max(1, sorted.length - 1)) * 100;
                        return <div key={(pt.when || i) + d} className="trend-point" style={{ left: `${left}%` }} title={`${LABEL[d]} — ${pt.T} — ${new Date(pt.when).toLocaleString()}`} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <small>Y: T-score (20–80). X: Date. One colored line per domain. Hover points for domain, T-score, and date.</small>
          </div>

          <div className="actions">
            <button className="pill-btn" onClick={() => window.print()}>Print</button>
          </div>
          <p className="thanks">Thank you for completing the survey</p>
        </section>
      </main>
    </>
  );
}
