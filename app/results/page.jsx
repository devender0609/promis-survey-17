// app/results/page.jsx
// STATIC: no ISR. Must be a number or false — never an object.
export const revalidate = 0;

import ResultsTable from "../components/ResultsTable"; // if you have one; otherwise remove
import { Suspense } from "react";

export default function ResultsPage() {
  // Get result from sessionStorage on client (SSR-safe shell + client read)
  return (
    <main className="page">
      {/* Intentionally NO <LogoBar/> here — logo comes from layout */}
      <div className="card results">
        <h1 className="h1">PROMIS Assessment Results</h1>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <Suspense fallback={<div style={{padding:'2rem'}}>Loading…</div>}>
          <ClientResults />
        </Suspense>
      </div>
    </main>
  );
}

// ---- client-only reader of sessionStorage
"use client";
function ClientResults() {
  let data = {};
  try {
    const raw = sessionStorage.getItem("promis_result");
    if (raw) data = JSON.parse(raw);
  } catch {}

  const rows = [
    ["Physical Function", data["Physical Function"] ?? 50],
    ["Pain Interference", data["Pain Interference"] ?? 50],
    ["Fatigue",          data["Fatigue"] ?? 50],
    ["Anxiety",          data["Anxiety"] ?? 50],
    ["Depression",       data["Depression"] ?? 50],
    ["Social Roles",     data["Social Roles"] ?? 50],
  ];

  return (
    <>
      <table className="res">
        <thead>
          <tr><th>Domain</th><th className="num">T-score</th></tr>
        </thead>
        <tbody>
          {rows.map(([d, t]) => (
            <tr key={d}><td>{d}</td><td className="num">{Math.round(Number(t))}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="actions">
        <button onClick={() => window.print()} className="btn">Print / Save PDF</button>
      </div>
    </>
  );
}
