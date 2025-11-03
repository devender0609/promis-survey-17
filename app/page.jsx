"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressRing from "./components/ProgressRing";
import AnswerButton from "./components/AnswerButton";
import {
  DOMAINS,
  firstQuestion,
  nextQuestion,
  isDomainFinished,
  scoreDomain,
  domainCount,
} from "./lib/survey";

export default function SurveyPage() {
  const [domainIdx, setDomainIdx] = useState(0);
  const [question, setQuestion] = useState(() => firstQuestion(DOMAINS[0]));
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map((d) => [d, []]))
  );

  // total steps = total number of questions across domains
  const totalSteps = useMemo(
    () => DOMAINS.reduce((n, d) => n + domainCount(d), 0),
    []
  );
  const stepsDone = useMemo(
    () => DOMAINS.reduce((n, d) => n + answers[d].length, 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  useEffect(() => {
    setQuestion(firstQuestion(DOMAINS[domainIdx]));
  }, [domainIdx]);

  async function handlePick(val) {
    const d = DOMAINS[domainIdx];

    // compute nextAnswers first (don’t rely on async state)
    const nextAnswersForD = [...answers[d], val];
    const nextAnswers = { ...answers, [d]: nextAnswersForD };
    setAnswers(nextAnswers);

    if (isDomainFinished({ domain: d, index: nextAnswersForD.length - 1 })) {
      // finished a domain → next domain or finish survey
      if (domainIdx < DOMAINS.length - 1) {
        setDomainIdx((i) => i + 1);
      } else {
        // score all
        const out = {};
        for (const dom of DOMAINS) {
          out[label(dom)] = await scoreDomain(dom, nextAnswers[dom]);
        }
        try {
          sessionStorage.setItem("promis_result", JSON.stringify(out));
        } catch {}
        window.location.href = "/results";
      }
    } else {
      setQuestion(nextQuestion({ domain: d, index: nextAnswersForD.length - 1 }));
    }
  }

  return (
    <div className="s-card">
      <h1 className="h1">PROMIS Health Snapshot (Adaptive Short Form)</h1>
      <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

      <ProgressRing pct={pct} />

      <div className="qbox">{question?.text ?? "Loading question…"}</div>

      <div className="answers">
        {["Never", "Rarely", "Sometimes", "Often", "Always"].map((txt, i) => (
          <AnswerButton key={i} onClick={() => handlePick(i)}>
            {txt}
          </AnswerButton>
        ))}
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
