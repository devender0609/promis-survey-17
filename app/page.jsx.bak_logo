"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo_new.png";

/** ---------------- Survey model (simple) ---------------- */
const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"]; // Physical Function, Pain Interference, Fatigue, Anxiety, Depression, Social Roles

const LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F: "Fatigue",
  A: "Anxiety",
  D: "Depression",
  SR: "Social Roles",
};

// For the demo we use 12 items (2 per domain) so progress can reach 100%
const ITEMS = [
  { id: "PF1", domain: "PF", text: "Are you able to climb one flight of stairs without help?" },
  { id: "PF2", domain: "PF", text: "Are you able to walk 100 yards without resting?" },
  { id: "PI1", domain: "PI", text: "In the past 7 days, how much did pain interfere with your day-to-day activities?" },
  { id: "PI2", domain: "PI", text: "In the past 7 days, how much did pain make it hard to sleep?" },
  { id: "F1",  domain: "F",  text: "In the past 7 days, did you run out of energy?" },
  { id: "F2",  domain: "F",  text: "In the past 7 days, did you feel tired?" },
  { id: "A1",  domain: "A",  text: "In the past 7 days, I felt fearful." },
  { id: "A2",  domain: "A",  text: "In the past 7 days, I felt uneasy." },
  { id: "D1",  domain: "D",  text: "In the past 7 days, I felt hopeless." },
  { id: "D2",  domain: "D",  text: "In the past 7 days, I felt worthless." },
  { id: "SR1", domain: "SR", text: "In the past 7 days, I felt I was able to carry out my social roles." },
  { id: "SR2", domain: "SR", text: "In the past 7 days, I felt limited in my social activities." },
];

const CHOICES = [
  { k: 1, label: "Never" },
  { k: 2, label: "Rarely" },
  { k: 3, label: "Sometimes" },
  { k: 4, label: "Often" },
  { k: 5, label: "Always" },
];

// map 1..5 avg into ~PROMIS-like T-score (20–80 clamp) just for the demo
function avgToT(avg, invert = false) {
  const centered = invert ? (6 - avg) : avg;          // some PF/SR items are better when higher
  const t = 50 + (centered - 3) * 10;                // linear map
  return Math.max(20, Math.min(80, Math.round(t)));
}

export default function SurveyPage() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> 1..5

  // which items should invert (higher = better) for T calculation
  const invertByDomain = useMemo(
    () => ({ PF: true, SR: true, PI: false, F: false, A: false, D: false }),
    []
  );

  const pct = Math.round((i / ITEMS.length) * 100);

  const current = ITEMS[i];

  function choose(k) {
    const next = { ...answers, [current.id]: k };
    const nextIdx = i + 1;
    setAnswers(next);

    if (nextIdx < ITEMS.length) {
      setI(nextIdx);
    } else {
      // finished -> compute T-scores per domain, store to localStorage, go to /results
      const byDomain = {};
      for (const d of DOMAINS) byDomain[d] = [];

      for (const it of ITEMS) {
        const kAns = next[it.id];
        if (kAns) byDomain[it.domain].push(kAns);
      }

      const tScores = {};
      for (const d of DOMAINS) {
        const arr = byDomain[d];
        const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 3;
        tScores[d] = avgToT(avg, invertByDomain[d]);
      }

      const record = {
        when: new Date().toISOString(),
        tScores,
        nItems: ITEMS.length,
      };

      try {
        // last
        localStorage.setItem("promis:last", JSON.stringify(record));
        // history (append)
        const prev = JSON.parse(localStorage.getItem("promis:history") || "[]");
        prev.push(record);
        localStorage.setItem("promis:history", JSON.stringify(prev.slice(-20)));
      } catch {}

      router.push("/results");
    }
  }

  return (
    <div className="page-wrap">
      {/* Header with logo */}
      <header className="site-header">
        <Image src={logo} alt="Ascension Seton" className="header-logo" priority />
      </header>

      <main className="card">
        <h1 className="title">PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

        {/* centered progress ring */}
        <div className="ring-wrap">
          <div className="ring">
            <div className="ring-inner">{pct}%</div>
          </div>
        </div>

        {current && (
          <>
            <h2 className="question">{current.text}</h2>

            <div className="answer-row">
              {CHOICES.map((c) => (
                <button
                  key={c.k}
                  className="answer-button"
                  onClick={() => choose(c.k)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}


