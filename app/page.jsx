"use client";

import { useEffect, useMemo, useState } from "react";

// ---- Domain list + a few demo questions per domain (edit freely) ----
const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];
const QUESTION_BANK = {
  PF: [
    "Are you able to climb one flight of stairs without help?",
    "Are you able to carry a laundry basket up a flight of stairs?",
  ],
  PI: [
    "In the past 7 days, did pain interfere with your day-to-day activities?",
    "In the past 7 days, did pain make it hard to sleep?",
  ],
  F: [
    "In the past 7 days, did you run out of energy?",
    "In the past 7 days, how often did you feel fatigued?",
  ],
  A: [
    "In the past 7 days, I felt nervous.",
    "In the past 7 days, I felt hopeless.",
  ],
  D: [
    "In the past 7 days, I felt sad.",
    "In the past 7 days, I felt like nothing could cheer me up.",
  ],
  SR: [
    "In the past 7 days, I had trouble doing my regular social activities.",
    "In the past 7 days, my health limited time with friends or family.",
  ],
};

// label for results table
const LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F: "Fatigue",
  A: "Anxiety",
  D: "Depression",
  SR: "Social Roles",
};

// simple 5-point scoring  (0..4) -> mock T-score mapping
function scoreDomain(domain, vals) {
  if (!vals.length) return 50;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length; // 0..4
  // very lightweight mapping just to demo a spread ~20..80
  return Math.round(20 + mean * 15 + Math.random() * 3); // 20..~83
}

export default function SurveyPage() {
  // positions
  const [domainIdx, setDomainIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);

  // answers: { PF: number[], ... }
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map((d) => [d, []]))
  );

  const activeDomain = DOMAINS[domainIdx];
  const activeQuestions = QUESTION_BANK[activeDomain];
  const questionText = activeQuestions[qIdx];

  // progress: total answered / total questions
  const totalQuestions = useMemo(
    () =>
      DOMAINS.reduce((n, d) => n + (QUESTION_BANK[d]?.length ?? 0), 0),
    []
  );
  const answeredCount = useMemo(
    () => DOMAINS.reduce((n, d) => n + (answers[d]?.length ?? 0), 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));

  // pick a response 0..4
  function handlePick(val) {
    setAnswers((prev) => {
      const next = { ...prev };
      next[activeDomain] = [...next[activeDomain], val];
      return next;
    });

    // advance question → domain → finish
    if (qIdx < activeQuestions.length - 1) {
      setQIdx((i) => i + 1);
      return;
    }

    // last question of this domain
    if (domainIdx < DOMAINS.length - 1) {
      setDomainIdx((i) => i + 1);
      setQIdx(0);
      return;
    }

    // FINISH: score + stash + go to results
    const result = {};
    for (const d of DOMAINS) result[LABEL[d]] = scoreDomain(d, answers[d]);
    // also include the last answer we just clicked
    result[LABEL[activeDomain]] = scoreDomain(activeDomain, [
      ...answers[activeDomain],
      val,
    ]);

    sessionStorage.setItem("promis_result", JSON.stringify(result));
    window.location.href = "/results";
  }

  return (
    <div className="page-wrap">
      <section className="card">
        <h1 className="title">PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

        {/* Progress ring */}
        <div className="ring">
          <svg viewBox="0 0 120 120" className="ring-svg">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="ring-fg"
              style={{
                strokeDasharray: `${(pct / 100) * 327} 327`,
              }}
            />
            <text x="60" y="66" textAnchor="middle" className="ring-text">
              {pct}%
            </text>
          </svg>
        </div>

        {/* Question */}
        <div className="question">{questionText ?? "Loading…"}</div>

        {/* Answers */}
        <div className="answers">
          {["Not at all", "A little bit", "Somewhat", "Quite a bit", "Very much"].map(
            (label, i) => (
              <button key={i} className="answer-btn" onClick={() => handlePick(i)}>
                {label}
              </button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
