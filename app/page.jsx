"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LogoBar from "../components/LogoBar";
import ProgressRing from "../components/ProgressRing";
import AnswerButton from "../components/AnswerButton";
import {
  DOMAINS,
  firstQuestion,
  nextQuestion,
  isDomainFinished,
  scoreDomain,
} from "../lib/survey";

export default function SurveyPage() {
  const router = useRouter();

  // survey state
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>(
    () => Object.fromEntries(DOMAINS.map((d) => [d, []])) as Record<string, number[]>
  );
  const [question, setQuestion] = useState(() => firstQuestion(DOMAINS[0]));
  const [submitting, setSubmitting] = useState(false);

  // progress (one step per domain in this version)
  const totalSteps = DOMAINS.length;
  const stepsDone = useMemo(
    () => DOMAINS.reduce((n, d) => n + (answers[d].length > 0 ? 1 : 0), 0),
    [answers]
  );
  const pct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  // when domain changes, reset the first question for that domain
  useEffect(() => {
    setQuestion(firstQuestion(DOMAINS[domainIdx]));
  }, [domainIdx]);

  async function handlePick(value: number) {
    if (submitting) return; // guard against double-click spam

    const d = DOMAINS[domainIdx];

    // Build a fresh answers object *including* this pick.
    // (Do this before setState so the latest click is used for scoring.)
    const newAnswers: Record<string, number[]> = {
      ...answers,
      [d]: [...answers[d], value],
    };
    setAnswers(newAnswers);

    // In this version, each domain completes after one item; keep the call for forward-compat.
    if (isDomainFinished({ domain: d, answers: newAnswers[d] })) {
      // If more domains remain, advance; else finish the survey.
      if (domainIdx < DOMAINS.length - 1) {
        setDomainIdx((i) => i + 1);
      } else {
        // FINISH → compute T-scores for all domains with the *final* answers
        try {
          setSubmitting(true);

          const out: Record<string, number> = {};
          for (const dom of DOMAINS) {
            // scoreDomain should accept (domain, responses[]); adjust if your signature differs
            const t = await scoreDomain(dom, newAnswers[dom]);
            out[label(dom)] = t;
          }

          // Persist to sessionStorage for the /results page
          try {
            sessionStorage.setItem("promis_result", JSON.stringify(out));
          } catch (e) {
            console.error("sessionStorage failed:", e);
          }

          // Navigate using Next.js router (App Router–friendly)
          router.push("/results");
        } finally {
          setSubmitting(false);
        }
      }
    } else {
      // Multi-item domains (future): fetch next question
      const nq = nextQuestion({ domain: d, answers: newAnswers[d] });
      setQuestion(nq);
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

        <div className="q">
          {question?.text ?? "Loading next question…"}
        </div>

        <div className="row" aria-busy={submitting}>
          {["Not at all", "A little bit", "Somewhat", "Quite a bit", "Very much"].map(
            (txt, i) => (
              <AnswerButton key={i} onClick={() => handlePick(i)} disabled={submitting}>
                {txt}
              </AnswerButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function label(d: string) {
  return (
    {
      PF: "Physical Function",
      PI: "Pain Interference",
      F: "Fatigue",
      A: "Anxiety",
      D: "Depression",
      SR: "Social Roles",
    } as Record<string, string>
  )[d] ?? d;
}
