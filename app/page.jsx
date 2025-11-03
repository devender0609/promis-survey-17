"use client";

import { useMemo, useState } from "react";
import LogoBar from "./components/LogoBar";
import ProgressRing from "./components/ProgressRing";
import AnswerButton from "./components/AnswerButton";
import {
  DOMAINS,
  QUESTIONS,
  firstQuestion,
  nextQuestion,
  isDomainFinished,
  scoreDomain,
  totalItems,
} from "./lib/survey";

export default function SurveyPage() {
  // answers per domain (arrays of 0..4)
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map((d) => [d, []]))
  );
  const [domainIdx, setDomainIdx] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  const domain = DOMAINS[domainIdx];
  const list = QUESTIONS[domain];
  const question = list[qIndex] || firstQuestion(domain);

  // progress across ALL items
  const doneCount = useMemo(
    () => DOMAINS.reduce((n, d) => n + answers[d].length, 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((doneCount / totalItems()) * 100));

  async function handlePick(value) {
    const d = domain;

    setAnswers((prev) => {
      const next = { ...prev };
      next[d] = [...next[d], value];
      return next;
    });

    // if domain still has items → advance within domain
    const finished = isDomainFinished({ domain: d, count: answers[d].length + 1 });
    if (!finished) {
      setQIndex((i) => i + 1);
      return;
    }

    // otherwise move to next domain
    if (domainIdx < DOMAINS.length - 1) {
      setDomainIdx((i) => i + 1);
      setQIndex(0);
      return;
    }

    // FINISH: score and go to results
    const out = {};
    for (const dom of DOMAINS) {
      out[label(dom)] = await scoreDomain(dom, answers[dom]);
    }
    sessionStorage.setItem("promis_result", JSON.stringify(out));
    window.location.href = "/results";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#eaf3f9,#f6fbff)",
      }}
    >
      <LogoBar />

      <div
        style={{
          maxWidth: 1050,
          margin: "10px auto 32px",
          background: "white",
          borderRadius: 18,
          boxShadow: "0 12px 36px rgba(8,59,102,.12)",
          padding: "26px 28px 34px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: 38,
            lineHeight: 1.15,
            color: "#0b4870",
          }}
        >
          PROMIS Health Snapshot (Adaptive Short Form)
        </h1>
        <p style={{ textAlign: "center", margin: "6px 0 12px", color: "#2b5870" }}>
          Texas Spine and Scoliosis, Austin TX
        </p>

        <ProgressRing pct={pct} />

        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#083b66",
            margin: "8px 0 14px",
            padding: "16px",
            background: "#f3f9fe",
            border: "1px solid #d8ebf8",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          {question?.text ?? "Loading next question…"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
            gap: 16,
            justifyItems: "center",
          }}
        >
          {["Never", "Rarely", "Sometimes", "Often", "Always"].map((txt, i) => (
            <AnswerButton key={i} onClick={() => handlePick(i)}>
              {txt}
            </AnswerButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function label(d) {
  return (
    {
      PF: "Physical Function",
      PI: "Pain Interference",
      F: "Fatigue",
      A: "Anxiety",
      D: "Depression",
      SR: "Social Roles",
    }[d] ?? d
  );
}
