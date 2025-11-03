"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useMemo, useState } from "react";

export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [xlsx, setXlsx] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promis_result");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  // lazy-load xlsx only on client for export button
  useEffect(() => {
    (async () => {
      try {
        const mod = await import("xlsx");
        setXlsx(mod);
      } catch {}
    })();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([domain, t]) => ({
      domain,
      tscore: Number(t),
    }));
  }, [data]);

  function exportExcel() {
    if (!xlsx || !rows.length) return;
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "PROMIS Results");
    xlsx.writeFile(wb, "PROMIS_Assessment_Results.xlsx");
  }

  if (!rows.length) {
    return (
      <div className="s-card">
        <h1 className="h1">PROMIS Assessment Results</h1>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          Results are not available. Please complete the survey first.
        </p>
      </div>
    );
  }

  return (
    <div className="s-card">
      <h1 className="h1">PROMIS Assessment Results</h1>
      <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 10,
          fontSize: "clamp(14px,1.8vw,16px)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "12px 10px",
                borderBottom: "2px solid #d9e8f5",
              }}
            >
              Domain
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "12px 10px",
                borderBottom: "2px solid #d9e8f5",
              }}
            >
              T-score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.domain}>
              <td
                style={{
                  padding: "12px 10px",
                  borderBottom: "1px solid #eaf2f9",
                  fontWeight: 600,
                }}
              >
                {r.domain}
              </td>
              <td
                style={{
                  padding: "12px 10px",
                  borderBottom: "1px solid #eaf2f9",
                  textAlign: "right",
                  fontWeight: 800,
                  color: "#0d5275",
                }}
              >
                {r.tscore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 22,
        }}
      >
        <button className="btn" onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <button className="btn" onClick={exportExcel} disabled={!xlsx}>
          Export Excel
        </button>
        <button
          className="btn"
          onClick={() =>
            (window.location.href = "https://texasspineandscoliosis.com/")
          }
        >
          Submit & Finish
        </button>
      </div>
    </div>
  );
}
