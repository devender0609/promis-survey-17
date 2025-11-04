// app/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import ProgressRing from "./components/ProgressRing";
import AnswerButton from "./components/AnswerButton";
import { firstQuestion, nextQuestion, totalQuestions, scoreSurvey } from "./lib/survey";

export default function SurveyPage(){
  const [idx, setIdx] = useState(0);
  const [item, setItem] = useState(firstQuestion());
  const [answers, setAnswers] = useState({}); // { itemId: 0..4 }
  const total = useMemo(() => totalQuestions(), []);
  const asked = Object.keys(answers).length;
  const pct = Math.round((asked/total)*100);

  useEffect(() => {
    // ensure we always have the first item
    if (!item) setItem(firstQuestion());
  }, [item]);

  function choose(value /* 0..4 */) {
    if (!item) return;
    const next = nextQuestion(idx);
    const updated = { ...answers, [item.id]: value };
    setAnswers(updated);
    if (next){
      setIdx(idx+1);
      setItem(next);
    } else {
      // finished — compute and stash results in sessionStorage
      const tScores = scoreSurvey(updated);
      const stamp = new Date().toISOString();
      const sessionId = `PROMIS-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
      sessionStorage.setItem("promis_result", JSON.stringify({ tScores, stamp, sessionId }));
      window.location.href = "/results";
    }
  }

  return (
    <div className="card">
      <h1>PROMIS Health Snapshot (Adaptive Short Form)</h1>
      <div className="subtle">Texas Spine and Scoliosis, Austin TX</div>

      <div className="progress-wrap">
        <ProgressRing value={pct} />
      </div>

      {item && (
        <>
          <div className="prompt">{item.prompt}</div>
          <div className="answers">
            <AnswerButton onClick={()=>choose(0)}>Never</AnswerButton>
            <AnswerButton onClick={()=>choose(1)}>Rarely</AnswerButton>
            <AnswerButton onClick={()=>choose(2)}>Sometimes</AnswerButton>
            <AnswerButton onClick={()=>choose(3)}>Often</AnswerButton>
            <AnswerButton onClick={()=>choose(4)}>Always</AnswerButton>
          </div>
        </>
      )}
    </div>
  );
}
