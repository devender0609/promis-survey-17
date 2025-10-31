"use client";

import { useEffect, useMemo, useState } from "react";
import LogoBar from "./components/LogoBar";
import ProgressRing from "./components/ProgressRing";
import AnswerButton from "./components/AnswerButton";
import { DOMAINS, firstQuestion, nextQuestion, isDomainFinished, scoreDomain, LABELS } from "./lib/survey";

export default function SurveyPage(){
  // per-domain answer arrays
  const [answers, setAnswers] = useState(() => Object.fromEntries(DOMAINS.map(d => [d, []])));

  // which domain + current question
  const [domainIdx, setDomainIdx] = useState(0);
  const [question, setQuestion] = useState(() => firstQuestion(DOMAINS[0]));

  // progress: each domain counts as one “step” when it has ≥1 answer
  const totalSteps = DOMAINS.length;
  const stepsDone = useMemo(() => DOMAINS.reduce((n,d)=> n + (answers[d].length > 0 ? 1 : 0), 0), [answers]);
  const pct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  useEffect(() => { setQuestion(firstQuestion(DOMAINS[domainIdx])); }, [domainIdx]);

  async function handlePick(value){
    const d = DOMAINS[domainIdx];

    setAnswers(prev => {
      const arr = [...prev[d], value];
      const next = { ...prev, [d]: arr };

      // domain-stop rule
      if (isDomainFinished({ domain: d, answers: arr })) {
        // move to next domain or finish all
        if (domainIdx < DOMAINS.length - 1) {
          setDomainIdx(i => i + 1);
        } else {
          finishSurvey(next);
        }
      } else {
        const q = nextQuestion({ domain: d, idx: (question?.idx ?? 0) });
        setQuestion(q);
      }
      return next;
    });
  }

  async function finishSurvey(finalAnswers){
    // score all domains
    const out = {};
    for (const dom of DOMAINS) {
      out[LABELS[dom]] = await scoreDomain(dom, finalAnswers[dom]);
    }
    sessionStorage.setItem("promis_result", JSON.stringify(out));
    window.location.href = "/results";
  }

  return (
    <>
      {/* Logo sits OUTSIDE the card */}
      <LogoBar />

      <div className="card" role="region" aria-label="PROMIS survey">
        <h1 className="h1">PROMIS Health Snapshot (Adaptive Short Form)</h1>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <ProgressRing pct={pct} />

        <div className="q">{question?.text ?? "Loading next question…"}</div>

        <div className="row">
          {["Not at all","A little bit","Somewhat","Quite a bit","Very much"].map((txt, i) => (
            <AnswerButton key={i} onClick={() => handlePick(i)}>{txt}</AnswerButton>
          ))}
        </div>
      </div>
    </>
  );
}
