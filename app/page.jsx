"use client";

import { useEffect, useMemo, useState } from "react";
import LogoBar from "../components/LogoBar";
import ProgressRing from "../components/ProgressRing";
import AnswerButton from "../components/AnswerButton";
import { DOMAINS, firstQuestion, nextQuestion, isDomainFinished, scoreDomain } from "../lib/survey";

export default function SurveyPage(){
  // state
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState(()=>Object.fromEntries(DOMAINS.map(d=>[d,[]])));
  const [question, setQuestion] = useState(()=>firstQuestion(DOMAINS[0]));
  const totalSteps = DOMAINS.length; // one item per domain in this demo
  const stepsDone = useMemo(()=>DOMAINS.reduce((n,d)=>n+(answers[d].length>0?1:0),0),[answers]);
  const pct = Math.min(100, Math.round((stepsDone/totalSteps)*100));

  useEffect(()=>{ setQuestion(firstQuestion(DOMAINS[domainIdx])); }, [domainIdx]);

  async function handlePick(value){
    const d = DOMAINS[domainIdx];
    setAnswers(prev => ({...prev, [d]: [...prev[d], value]}));

    // single-item-per-domain demo → finish domain immediately
    if(isDomainFinished({domain:d})){
      // next domain or finish survey
      if(domainIdx < DOMAINS.length-1){
        setDomainIdx(i=>i+1);
      }else{
        // FINISH → score all domains and go to results
        const out = {};
        for(const dom of DOMAINS){
          out[label(dom)] = await scoreDomain(dom, answers[dom]);
        }
        sessionStorage.setItem("promis_result", JSON.stringify(out));
        window.location.href = "/results";
      }
    }else{
      const nq = nextQuestion({domain:d});
      setQuestion(nq);
    }
  }

  return (
    <div className="container">
      <LogoBar />

      <div className="card">
        <h1 className="h1" style={{textAlign:"center"}}>
          PROMIS Health Snapshot (Adaptive Short Form)
        </h1>
        <p className="sub">Texas Spine and Scoliosis, Austin TX</p>

        <ProgressRing pct={pct} />

        <div className="q">
          {question?.text ?? "Loading next question…"}
        </div>

        <div className="row">
          {["Not at all","A little bit","Somewhat","Quite a bit","Very much"].map((txt,i)=>(
            <AnswerButton key={i} onClick={()=>handlePick(i)}>{txt}</AnswerButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function label(d){
  return ({
    PF:"Physical Function",
    PI:"Pain Interference",
    F:"Fatigue",
    A:"Anxiety",
    D:"Depression",
    SR:"Social Roles"
  })[d] ?? d;
}
