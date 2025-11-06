"use client";

export const revalidate = false; // IMPORTANT: number or false only

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo_new.png";

const LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F: "Fatigue",
  A: "Anxiety",
  D: "Depression",
  SR: "Social Roles",
};

// color-coded category pill by T score
function category(t, domain) {
  // PF/SR: higher = better. Others: higher = worse.
  const higherIsBetter = domain === "PF" || domain === "SR";
  const val = Number(t || 50);

  if (higherIsBetter) {
    if (val >= 60) return { tag: "Normal", cls: "pill ok" };
    if (val >= 50) return { tag: "Mild Limitation", cls: "pill mild" };
    return { tag: "Moderate Limitation", cls: "pill mod" };
  } else {
    if (val >= 65) return { tag: "Severe", cls: "pill sev" };
    if (val >= 55) return { tag: "Moderate", cls: "pill mod" };
    return { tag: "Mild", cls: "pill mild" };
  }
}

export default function ResultsPage() {
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const l = JSON.parse(localStorage.getItem("promis:last") || "null");
      const h = JSON.parse(localStorage.getItem("promis:history") || "[]");
      setLast(l);
      setHistory(Array.isArray(h) ? h : []);
    } catch {
      setLast(null);
      setHistory([]);
    }
  }, []);

  if (!last) {
    return (
      <div className="page-wrap">
        <header className="site-header">
          <Image src="/logo_new.png" alt="Ascension Seton" className="header-logo" priority />
        </header>

        <div className="card">
          <h1 className="title">Results</h1>
          <p className="subtitle">We couldn’t find a completed survey in this browser yet.</p>
          <Link href="/" className="pill-btn">Start survey</Link>
        </div>
      </div>
    );
  }

  const when = new Date(last.when).toLocaleString();

  return (
    <div className="page-wrap">
      <header className="site-header">
        <Image src="/logo_new.png" alt="Ascension Seton" className="header-logo" priority />
      </header>

      <div className="card">
        <h1 className="title">PROMIS Assessment Results</h1>
        <p className="subtitle">Completed on {when}</p>

        {/* table */}
        <div className="table-wrap" style={{ display: "flex", justifyContent: "center" }}>
          <table className="results-table" style={{ maxWidth: 960 }}>
            <thead>
              <tr>
                <th>Domain</th>
                <th>T-score</th>
                <th>Category</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(last.tScores).map(([k, v]) => {
                const cat = category(v, k);
                const interp =
                  k === "PF" || k === "SR"
                    ? "Higher scores indicate BETTER function/ability."
                    : "Higher scores indicate MORE of the symptom/problem.";
                return (
                  <tr key={k}>
                    <td>{LABEL[k]}</td>
                    <td>{v}</td>
                    <td><span className={cat.cls}>{cat.tag}</span></td>
                    <td>{interp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* simple trends line (dots only) */}
        <div className="chart-card">
          <h3>Trends over time</h3>
          <div className="trend-refs">
            <div className="mean"></div>
            <div className="sd"></div>
            <div className="sd"></div>
          </div>

          {["PF", "PI", "F", "A", "D", "SR"].map((d) => (
            <div className="trend-line" key={d}>
              <div className="trend-label">{d}</div>
              <div className="trend-track">
                {(history || []).map((r, idx) => {
                  const t = r?.tScores?.[d] ?? 50;
                  // map 20..80 -> 0..100%
                  const x = ((t - 20) / 60) * 100;
                  return (
                    <div
                      key={r.when ?? idx}
                      className="trend-point"
                      title={`${new Date(r.when).toLocaleString()} — ${t}`}
                      style={{ left: `${x}%` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <Link href="/" className="pill-btn">Start a new survey</Link>
          <button className="pill-btn" onClick={() => window.print()}>Print</button>
        </div>
        <p className="thanks">Thank you for completing the survey</p>
      </div>
    </div>
  );
}




