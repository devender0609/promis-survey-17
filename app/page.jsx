// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * LOCAL-ONLY SURVEY ENGINE
 * - Keep this tiny: a few example items per domain.
 * - Replace/expand as you wish; progress and storage auto-adapt.
 */
const DOMAINS = [
  { key: "PF", name: "Physical Function", color: "#3f7de8" },
  { key: "PI", name: "Pain Interference", color: "#e86a3f" },
  { key: "F",  name: "Fatigue",           color: "#a65be8" },
  { key: "SR", name: "Social Roles",      color: "#28a97a" },
  { key: "A",  name: "Anxiety",           color: "#e8a23f" },
  { key: "D",  name: "Depression",        color: "#d6486e" },
];

// 5-point answers mapped to simple T-score deltas (demo purpose)
const ANSWERS = [
  { label: "Never",        val: 0 },
  { label: "Rarely",       val: 1 },
  { label: "Sometimes",    val: 2 },
  { label: "Often",        val: 3 },
  { label: "Always",       val: 4 },
];

// small demo item bank (3 per domain). Replace with your own as needed.
const BANK = {
  PF: [
    "Are you able to carry a laundry basket up a flight of stairs?",
    "Are you able to stand for 15 minutes?",
    "Are you able to do yardwork like raking leaves?",
  ],
  PI: [
    "How much did pain interfere with your day-to-day activities?",
    "How much did pain interfere with work around the home?",
    "How much did pain interfere with your social activities?",
  ],
  F: [
    "How often did you run out of energy?",
    "How often did you feel tired?",
    "How often did you feel too tired to take a bath or shower?",
  ],
  SR: [
    "I have trouble doing my regular social activities with family or friends.",
    "I have trouble doing all of my usual work.",
    "I have trouble doing all the leisure activities I like to do.",
  ],
  A: [
    "I felt fearful.",
    "I felt worried.",
    "I felt anxious.",
  ],
  D: [
    "I felt worthless.",
    "I felt helpless.",
    "I felt depressed.",
  ],
};

// naive T-score calculator: start at 50 and add small domain-specific shifts
function computeTScores(responses) {
  // responses: { PF: [0-4,...], PI: [...], ... }
  const scores = {};
  for (const d of DOMAINS) {
    const arr = responses[d.key] || [];
    const mean = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    // demo transform: 50 baseline, scale to ~40–60
    let t = Math.round(50 + (mean - 2) * 4.5); // center at "Sometimes"=2
    if (t < 20) t = 20;
    if (t > 80) t = 80;
    scores[d.key] = t;
  }
  return scores;
}

export default function SurveyPage() {
  const router = useRouter();

  // current position in [domainIndex, itemIndex]
  const [di, setDi] = useState(0);
  const [qi, setQi] = useState(0);

  // answers bucket: { PF:[0..4], PI:[..], ... }
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map(d => [d.key, []]))
  );

  // total items = sum of each domain's item count
  const totalItems = useMemo(
    () => DOMAINS.reduce((sum, d) => sum + (BANK[d.key]?.length || 0), 0),
    []
  );
  const answeredCount = useMemo(
    () => DOMAINS.reduce((sum, d) => sum + (answers[d.key]?.length || 0), 0),
    [answers]
  );

  const progressPct = Math.round((answeredCount / totalItems) * 100);

  const domain = DOMAINS[di];
  const itemsForDomain = BANK[domain.key] || [];
  const question = itemsForDomain[qi];

  function handleAnswer(val) {
    setAnswers(prev => {
      const next = { ...prev };
      next[domain.key] = [...(next[domain.key] || []), val];
      return next;
    });

    // advance
    const nextQi = qi + 1;
    if (nextQi < itemsForDomain.length) {
      setQi(nextQi);
    } else {
      // move to next domain
      const nextDi = di + 1;
      if (nextDi < DOMAINS.length) {
        setDi(nextDi);
        setQi(0);
      } else {
        // finished
        onFinish();
      }
    }
  }

  function onFinish() {
    const tScores = computeTScores(answers);
    const nowISO = new Date().toISOString();
    const run = {
      id: `${Date.now()}`,
      when: nowISO,
      scores: tScores, // {PF:xx, PI:xx, ...}
    };

    try {
      // latest (for immediate Results render)
      localStorage.setItem("promis_latest_run", JSON.stringify(run));

      // history
      const hist = JSON.parse(localStorage.getItem("promis_history") || "[]");
      hist.push(run);
      localStorage.setItem("promis_history", JSON.stringify(hist));
    } catch {}

    router.push("/results");
  }

  return (
    <div className="card">
      <h1 className="title">PROMIS Survey</h1>
      <p className="subtitle">Ascension Seton • Complete all questions</p>

      {/* progress ring */}
      <div className="ring-wrap">
        <div className="ring" role="progressbar" aria-valuenow={progressPct}>
          <div className="ring-inner">{progressPct}%</div>
        </div>
      </div>

      {/* current domain pill */}
      <div className="pill-row">
        {DOMAINS.map((d, idx) => (
          <span
            key={d.key}
            className={`pill ${idx === di ? "pill-active" : ""}`}
            style={{ borderColor: d.color, color: d.color }}
          >
            {d.name}
          </span>
        ))}
      </div>

      {/* question */}
      <div className="question">{question}</div>

      {/* answers */}
      <div className="answer-row">
        {ANSWERS.map((a) => (
          <button
            key={a.label}
            className="answer-button"
            onClick={() => handleAnswer(a.val)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
