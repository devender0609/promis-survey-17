// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo_new.svg";

// ----- simple survey model (JS only) -----
const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];
const LABEL = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F: "Fatigue",
  A: "Anxiety",
  D: "Depression",
  SR: "Social Roles",
};

// Minimal fixed bank. Add more items anytime.
const BANK = [
  { id: "pf1", domain: "PF", prompt: "Are you able to climb one flight of stairs without help?" },
  { id: "pi1", domain: "PI", prompt: "In the past 7 days, did you run out of energy?" },
  { id: "f1",  domain: "F",  prompt: "In the past 7 days, how fatigued did you feel?" },
  { id: "a1",  domain: "A",  prompt: "In the past 7 days, I felt nervous." },
  { id: "d1",  domain: "D",  prompt: "In the past 7 days, I felt hopeless." },
  { id: "sr1", domain: "SR", prompt: "In the past 7 days, I had trouble doing my regular work." },
];

// 1–5 responses
const RESP = [
  { v: 1, label: "Never" },
  { v: 2, label: "Rarely" },
  { v: 3, label: "Sometimes" },
  { v: 4, label: "Often" },
  { v: 5, label: "Always" },
];

// Map mean raw -> PROMIS-like T (20–80), with direction by domain
function toT(domain, meanRaw) {
  const centered = meanRaw - 3; // around "Sometimes"
  const slope = 5;
  const sign = domain === "PF" || domain === "SR" ? -1 : 1;
  const t = 50 + 10 * (sign * slope * centered) / 10;
  return Math.max(20, Math.min(80, Math.round(t)));
}

function category(domain, t) {
  const worse = domain === "PF" || domain === "SR" ? 50 - t : t - 50;
  if (worse >= 20) return { text: "Severe", color: "#f87171", bg: "#fdecec" };
  if (worse >= 10) return { text: "Moderate", color: "#fb923c", bg: "#fff0e6" };
  if (Math.abs(worse) < 5) return { text: "Normal", color: "#22c55e", bg: "#eaf8f0" };
  const mildText = domain === "PF" || domain === "SR" ? "Mild Limitation" : "None–Mild";
  return { text: mildText, color: "#fbbf24", bg: "#fff9e6" };
}

export default function SurveyPage() {
  const router = useRouter();

  const [ix, setIx] = useState(0);
  const [answers, setAnswers] = useState([]); // {id, domain, v}

  const pct = useMemo(() => Math.round((ix / BANK.length) * 100), [ix]);
  const current = BANK[ix];

  function Header() {
    return (
      <header className="site-header">
        <Image src={logo} alt="Ascension Seton" className="header-logo" priority />
      </header>
    );
  }

  function onAnswer(v) {
    if (!current) return;
    const next = [...answers, { id: current.id, domain: current.domain, v }];
    setAnswers(next);

    if (ix + 1 < BANK.length) {
      setIx(ix + 1);
      return;
    }

    // compute per-domain T scores, persist to sessionStorage, go to results
    const by = { PF: [], PI: [], F: [], A: [], D: [], SR: [] };
    next.forEach((a) => by[a.domain].push(a.v));

    const results = DOMAINS.map((d) => {
      const arr = by[d];
      const mean = arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 3;
      const T = toT(d, mean);
      const cat = category(d, T);
      return { domain: d, label: LABEL[d], mean, T, category: cat.text, catColor: cat.color, catBg: cat.bg };
    });

    const payload = {
      when: new Date().toISOString(),
      sessionId: `PROMIS-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      results,
    };

    try {
      const histKey = "promis_history";
      const raw = window.sessionStorage.getItem(histKey);
      const hist = raw ? JSON.parse(raw) : [];
      hist.push(payload);
      window.sessionStorage.setItem(histKey, JSON.stringify(hist));
      window.sessionStorage.setItem("promis_last", JSON.stringify(payload));
    } catch {}

    router.push("/results");
  }

  return (
    <>
      <Header />

      <main className="page-wrap">
        <section className="card">
          <h1 className="title">PROMIS Health Snapshot (Adaptive Short Form)</h1>
          <p className="subtitle">Texas Spine and Scoliosis, Austin TX</p>

          {/* Ring */}
          <div className="ring-wrap">
            <div className="ring">
              <div className="ring-inner">{pct}%</div>
            </div>
          </div>

          {/* Prompt & answers */}
          {current && (
            <>
              <h2 className="question">{current.prompt}</h2>
              <div className="answer-row">
                {RESP.map((o) => (
                  <button key={o.v} className="answer-button" onClick={() => onAnswer(o.v)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
