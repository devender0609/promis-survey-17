// app/results/page.jsx
"use client";

// Force runtime rendering, never ISR/prerender, never cache
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_history");
      const arr = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(arr) ? arr : []);
      setLast(Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null);
    } catch (e) {
      console.error("history parse error", e);
      setHistory([]);
      setLast(null);
    }
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#10486d" }}>
        PROMIS Results
      </h1>
      <p style={{ marginTop: 6, color: "#3a5a70" }}>
        This page is fully dynamic (no ISR) and fetchCache is disabled.
      </p>

      <div style={{
        marginTop: 14,
        background: "#fff",
        border: "1px solid #e7eff7",
        borderRadius: 14,
        padding: 16
      }}>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify({ last, historyLen: history.length }, null, 2)}
        </pre>
      </div>
    </main>
  );
}
