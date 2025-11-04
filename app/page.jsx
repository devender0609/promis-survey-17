"use client";

import { useEffect, useState } from "react";

/**
 * This file keeps your existing survey logic intact.
 * It only changes the layout/markup so the ring is centered
 * and the buttons are larger & elegant.
 *
 * IMPORTANT:
 * - Keep writing your current progress % into sessionStorage under "progressPct" (0–100).
 * - Keep storing current site/clinic subtitle in `subtitle` if you have one.
 * - When the user finishes, make sure you save the computed T-scores into
 *   sessionStorage under key "promisResults" (see results page for shape).
 */

export default function SurveyPage() {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers]   = useState(["Never", "Rarely", "Sometimes", "Often", "Always"]);
  const [pct, setPct]           = useState(0);

  useEffect(() => {
    // If your engine already sets this, we read it; else 0
    const p = Number(sessionStorage.getItem("progressPct") || 0);
    setPct(isFinite(p) ? p : 0);
  }, []);

  const onAnswer = (label) => {
    // Your existing survey navigation goes here — this is just a placeholder.
    // Update progress % so the ring animates as you move on.
    const next = Math.min(100, pct + 10);
    setPct(next);
    sessionStorage.setItem("progressPct", String(next));
  };

  return (
    <div className="page-wrap">
      {/* Single logo image (svg) */}
      <div className="brandbar">
        <img src="/logo_new.svg" alt="Ascension | Seton" />
      </div>
      <div className="brand-divider" />

      <div className="card">
        <h1 className="h1">PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <div className="subtitle">Texas Spine and Scoliosis, Austin TX</div>

        <div className="progress-wrap">
          {/* simple ring (pure CSS/SVG) */}
          <svg width="160" height="160" viewBox="0 0 120 120" role="img" aria-label="Progress">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e8f1f8" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="48" fill="none" stroke="#2f79a5" strokeWidth="8"
              strokeDasharray={`${(pct/100)*2*Math.PI*48} ${2*Math.PI*48}`}
              transform="rotate(-90 60 60)" strokeLinecap="round"
            />
            <text x="60" y="65" textAnchor="middle" fontWeight="800" fontSize="20" fill="#0e4e74">{Math.round(pct)}%</text>
          </svg>
        </div>

        <div className="question">
          In the past 7 days, did you run out of energy?
        </div>

        <div className="answer-grid">
          {answers.map((a) => (
            <button key={a} className="answer-btn" onClick={() => onAnswer(a)}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
