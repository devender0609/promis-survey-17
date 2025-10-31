"use client";

import { useMemo, useState } from "react";
import LogoBar from "@/components/LogoBar";
import ProgressRing from "@/components/ProgressRing";
import AnswerButton from "@/components/AnswerButton";
import { DOMAINS, ITEMS, OPTIONS_5, totalQuestions } from "@/lib/survey";
import { scoreDomain } from "@/lib/scoring";
import "./globals.css";

export default function Page() {
  const [cursor, setCursor] = useState({ dIdx: 0, qIdx: 0 });
  const [answers, setAnswers] = useState(() => {
    const o = {}; for (const d of DOMAINS) o[d] = []; return o;
  });
  const total = useMemo(() => totalQuestions(), []);
  const answered = DOMAINS.reduce((n, d) => n + answers[d].length, 0);
  const pct = Math.min(100, Math.round((answered / total) * 100));

  const domain = DOMAINS[cursor.dIdx];
  const question = ITEMS[domain][cursor.qIdx];

  async function handlePick(choiceIdx) {
    // record
    const copy = structuredClone(answers);
    copy[domain].push(choiceIdx);
    setAnswers(copy);

    // move next
    const moreInDomain = cursor.qIdx + 1 < ITEMS[domain].length;
    if (moreInDomain) {
      setCursor({ dIdx: cursor.dIdx, qIdx: cursor.qIdx + 1 });
      return;
    }
    const moreDomains = cursor.dIdx + 1 < DOMAINS.length;
    if (moreDomains) {
      setCursor({ dIdx: cursor.dIdx + 1, qIdx: 0 });
      return;
    }

    // finished → compute results (call API per domain), then route to /results
    const result = {};
    for (const d of DOMAINS) {
      // score each domain via API (or fallback)
      result[d] = await scoreDomain(d, copy[d]);
    }
    // persist to sessionStorage and go
    sessionStorage.setItem("promis_result", JSON.stringify(result));
    window.location.href = "/results";
  }

  return (
    <>
      <LogoBar />
      <main className="container">
        <div className="card">
          <h1 className="title" style={{textAlign:'center'}}>
            PROMIS Health Snapshot (Adaptive Short Form)
          </h1>
          <div className="subtitle">Texas Spine and Scoliosis, Austin TX</div>

          <div className="progressWrap">
            <ProgressRing pct={pct} />
          </div>

          <div className="qtext">{question}</div>

          <div className="choices">
            {OPTIONS_5.map((lbl, i) => (
              <AnswerButton key={i} onClick={() => handlePick(i)}>
                {lbl}
              </AnswerButton>
            ))}
          </div>

          <div className="footerNote">{answered} of {total} answered</div>
        </div>
      </main>
    </>
  );
}