"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LogoBar from "./components/LogoBar";
import ProgressRing from "./components/ProgressRing";
import AnswerButton from "./components/AnswerButton";
import {
  DOMAINS,
  firstQuestion,
  nextQuestion,
  isDomainFinished,
  scoreDomain,
} from "./lib/survey";

export default function SurveyPage() {
  const router = useRouter();

  // survey state (JS only, no TS types)
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(DOMAINS.map((d) => [d, []]))
  );
  const [question, setQuestion] = useState(() => firstQuestion(DOMAINS[0]));

  const totalSteps = DOMAINS.length; // one visible step per domain (you can expand later)
  const stepsDone = useMemo(
    () => DOMAINS.reduce((n, d) => n + (answers[d].length > 0 ? 1 : 0), 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  useEffect(() => {
    setQuestion(firstQuestion(DOMAINS[domainIdx]));
  }, [domainIdx]);

  async function handlePick(value) {
    const d = DOMAINS[domainIdx];

    // compute the new answers BEFORE scoring
    const newAnswers = {
      ...answers,
      [d]: [...answers[d], value],
    };
    setAnswers(newAnswers);

    // single-item-per-domain demo → domain is finished after 1 pick
    if (isDomainFinished({ domain: d, answers: newAnswers[d] })) {
      if (domainIdx < DOMAINS.length - 1) {
        setDomainIdx((i) => i + 1);
      } else {
        // FINISH → score all domains with the freshest answers
        const out = {};
        for (const dom of DOMAINS) {
          out[label(dom)] = await scoreDomain(dom, newAnswers[dom]);
        }
        try {
          sessionStorage.setItem("promis_result", JSON.stringify(out));
        } catch {}
        router.push("/results");
      }
    } else {
      setQuestion(nextQuestion({ domain: d, answers: newAnswers[d] }));
    }
  }

  return (
    <div className="container">
      <LogoBar />

      <div className="card">
        <h1 className="h1" style={{ textAlign: "center" }}>
          PROMIS Health Snapshot (Adaptive Short Form)
        </h1>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <ProgressRing pct={pct} />

        <div className="q">{question?.text ?? "Loading next question…"}</div>

        <div className="row">
          {["Not at all", "A little bit", "Somewhat", "Quite a bit", "Very much"].map(
            (txt, i) => (
              <AnswerButton key={i} onClick={() => handlePick(i)}>
                {txt}
              </AnswerButton>
            )
          )}
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
