"use client";

import { useEffect, useMemo, useState } from "react";

/** --------- SIMPLE ITEM BANK (edit freely) ---------- */
const DOMAINS = ["PF","PI","F","A","D","SR"];
const ITEMS = {
  PF: [
    "Are you able to climb one flight of stairs without help?",
    "Are you able to carry a laundry basket of clothes up a flight of stairs?",
  ],
  PI: ["In the past 7 days, did you have pain interfere with your daily activities?"],
  F:  ["In the past 7 days, did you run out of energy?"],
  A:  ["In the past 7 days, I felt nervous or anxious."],
  D:  ["In the past 7 days, I felt hopeless."],
  SR: ["In the past 7 days, I had trouble doing my usual social activities."]
};
const CHOICES = ["Not at all","A little bit","Somewhat","Quite a bit","Very much"];

/** toy T-score mapping per choice; replace with your model */
function choiceToT(choiceIdx, domain) {
  const base = { PF:50, PI:50, F:50, A:50, D:50, SR:50 }[domain] ?? 50;
  const dir  = { PF:-1, PI:+1, F:+1, A:+1, D:+1, SR:-1 }[domain] ?? +1;
  return Math.round((base + dir * (choiceIdx*5 + 0)) * 10) / 10;
}

export default function SurveyPage(){
  // answers is a map of domain -> array of choice indexes
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map(d => [d, []]))
  );
  const [domainIdx, setDomainIdx] = useState(0);

  const domain = DOMAINS[domainIdx];
  const qIdx   = answers[domain].length;          // next question index for this domain
  const question = ITEMS[domain][qIdx];

  // progress = answered items / total items
  const totalItems = useMemo(
    () => DOMAINS.reduce((n,d)=>n + ITEMS[d].length, 0),
    []
  );
  const answeredItems = useMemo(
    () => DOMAINS.reduce((n,d)=>n + answers[d].length, 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((answeredItems / totalItems) * 100));

  function handlePick(choiceIdx){
    // compute the next snapshot first (avoids stale state)
    const next = {
      ...answers,
      [domain]: [...answers[domain], choiceIdx]
    };
    setAnswers(next);

    // if domain finished, move forward or finish
    const finishedDomain = next[domain].length >= ITEMS[domain].length;
    if (finishedDomain) {
      if (domainIdx < DOMAINS.length - 1) {
        setDomainIdx(domainIdx + 1);
      } else {
        // FINISH → compute simple T-scores and go to /results
        const out = {};
        for (const d of DOMAINS) {
          const lastChoice = next[d][next[d].length - 1] ?? 2; // center if missing
          out[d] = choiceToT(lastChoice, d);
        }
        sessionStorage.setItem("promis_result", JSON.stringify(out));
        window.location.href = "/results";
      }
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1 className="title">PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

        {/* progress ring */}
        <div className="ring">
          <svg viewBox="0 0 120 120" className="ring-svg" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <circle
              cx="60" cy="60" r="52"
              className="ring-fg"
              style={{ strokeDasharray: `${pct*3.27} 1000` }}
            />
          </svg>
          <div className="ring-label">{pct}%</div>
        </div>

        {/* question */}
        <div className="question">{question ?? "Loading…"}</div>

        {/* choices */}
        <div className="choice-row">
          {CHOICES.map((txt, i) => (
            <button key={i} className="choice" onClick={() => handlePick(i)}>
              {txt}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
