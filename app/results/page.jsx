// app/results/page.jsx
"use client";

export const revalidate = false;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import logo from "@/public/logo_new.svg";

function Header() {
  return (
    <header className="site-header">
      <Image src={logo} alt="Ascension Seton" className="header-logo" priority />
    </header>
  );
}

export default function ResultsPage() {
  const [last, setLast] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("promis_last");
      const hist = window.sessionStorage.getItem("promis_history");
      setLast(raw ? JSON.parse(raw) : null);
      setHistory(hist ? JSON.parse(hist) : []);
    } catch {
      setLast(null);
      setHistory([]);
    }
  }, []);

  const rows = last?.results ?? [];

  return (
    <>
      <Header />
      <main className="page-wrap">
        <section className="card">
          <h1 className="title">PROMIS Assessment Results</h1>
          <p className="subtitle">
            Texas Spine and Scoliosis, Austin TX
            {last?.when ? ` • Completed on ${new Date(last.when).toLocaleString()} — Session ID: ${last.sessionId}` : ""}
          </p>

          {/* Table */}
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>T-score</th>
                  <th>Category</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, idx: number) => (
                  <tr key={r.domain}>
                    <td>{r.label}</td>
                    <td>{r.T}</td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          color: r.catColor,
                          backgroundColor: r.catBg,
                          borderColor: r.catColor + "33",
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td>
                      {r.domain === "PF" || r.domain === "SR"
                        ? "Higher scores indicate BETTER function/ability."
                        : "Higher scores indicate MORE of the symptom/problem."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bars */}
          <div className="chart-card">
            <h3>PROMIS T-scores</h3>
            <div className="bars">
              <div className="ref-lines">
                <div className="ref mean" />
                <div className="ref sd" />
                <div className="ref sd" />
              </div>
              {rows.map((r: any) => {
                const pct = Math.max(8, Math.min(100, (r.T - 20) / 60 * 100));
                return (
                  <div className="bar" key={r.domain}>
                    <div className="bar-fill" style={{ height: `${pct}%` }}>
                      <div className="bar-value">{r.T}</div>
                    </div>
                    <div className="bar-label">{r.domain}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: "#56708a", marginTop: 6 }}>
              PROMIS T-score (mean 50, SD 10). Shaded band indicates MCID zone (≈±3 around 50). Mean 50 (solid), ±1 SD (dashed).
            </div>
          </div>

          {/* Trends over time */}
          <div className="chart-card">
            <h3>Trends over time</h3>
            {history.length === 0 ? (
              <div style={{ color: "#5c748b" }}>No prior sessions yet.</div>
            ) : (
              <>
                <div className="trend-wrap">
                  {/* reference lines */}
                  <div className="trend-refs">
                    <div className="mean" />
                    <div className="sd" />
                    <div className="sd" />
                  </div>

                  {/* one thin “track” per domain with dated points */}
                  {rows.map((r: any, idx: number) => {
                    const series = history.map((h) => {
                      const m = h.results.find((x: any) => x.domain === r.domain);
                      return { when: h.when, T: m?.T ?? 50 };
                    });
                    return (
                      <div key={r.domain} className="trend-line">
                        <div className="trend-label">{r.domain}</div>
                        <div className="trend-track">
                          {series.map((p, i) => {
                            const x = (i / Math.max(series.length - 1, 1)) * 100;
                            const y = (p.T - 20) / 60 * 100;
                            return (
                              <div
                                key={p.when ?? i}
                                className="trend-point"
                                title={`${r.label}: ${p.T} • ${new Date(p.when).toLocaleString()}`}
                                style={{ left: `calc(${x}% - 6px)`, top: `calc(${6 - 0}px)` }} // points ride the track; timestamp in tooltip
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: "#56708a", marginTop: 6 }}>
                  Y: T-score (20–80). X: Date/time. Hover a point to see timestamp & value.
                </div>
              </>
            )}
          </div>

          {/* centered actions */}
          <div className="actions">
            <button className="pill-btn" onClick={() => window.print()}>Print</button>
            <button
              className="pill-btn"
              onClick={() => {
                try {
                  const raw = window.sessionStorage.getItem("promis_last") ?? "{}";
                  const blob = new Blob([raw], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "promis-results.json";
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {}
              }}
            >
              Save as JSON
            </button>
          </div>
          <p className="thanks">Thank you for completing the survey</p>
        </section>
      </main>
    </>
  );
}
