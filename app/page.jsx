'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- PROMIS domains & 5-point responses (Likert). Replace/extend items as needed.
const DOMAINS = [
  { key: 'PF',  label: 'Physical Function',    items: [
    'Are you able to carry a laundry basket of clothes up a flight of stairs?',
    'Are you able to run errands and shop?'
  ]},
  { key: 'PI',  label: 'Pain Interference',    items: [
    'In the past 7 days, how much did pain interfere with your daily activities?',
    'In the past 7 days, how much did pain interfere with your enjoyment of life?'
  ]},
  { key: 'F',   label: 'Fatigue',              items: [
    'In the past 7 days, did you run out of energy?',
    'In the past 7 days, how often were you too tired to enjoy the things you like to do?'
  ]},
  { key: 'A',   label: 'Anxiety',              items: [
    'In the past 7 days, I felt fearful.',
    'In the past 7 days, I felt worried.'
  ]},
  { key: 'D',   label: 'Depression',           items: [
    'In the past 7 days, I felt hopeless.',
    'In the past 7 days, I felt depressed.'
  ]},
  { key: 'SR',  label: 'Social Roles',         items: [
    'In the past 7 days, I was able to carry out my usual social activities.',
    'In the past 7 days, I was satisfied with my social activities.'
  ]},
];

// 5-option scale left→right; numbers are generic 1..5 scoring; we map to a T later
const OPTIONS = [
  { v: 1, label: 'Not at all' },
  { v: 2, label: 'A little bit' },
  { v: 3, label: 'Somewhat' },
  { v: 4, label: 'Quite a bit' },
  { v: 5, label: 'Very much' },
];

// very lightweight “T” estimate: linear map by domain, then server calibration will refine
function likertToT(domain, meanScore) {
  // center Likert (1..5) to PROMIS mean 50 SD 10 as a rough prior
  // You already have server calibration; this is only to produce a sensible pre-T.
  const z = (meanScore - 3) / 1;   // mean 3, SD ~1 (rough)
  const t = 50 + 10 * z;
  // some domains are reversed (PF/SR better is higher): keep as-is; PI/F/A/D higher=worse already captured by items wording
  return Math.max(20, Math.min(80, t));
}

export default function SurveyPage() {
  const router = useRouter();

  // flatten the survey into a sequence across domains (interleave or block; here: block by domain)
  const queue = useMemo(() => {
    const q = [];
    for (const d of DOMAINS) {
      for (const text of d.items) q.push({ domain: d.key, domainLabel: d.label, text });
    }
    return q;
  }, []);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // array of {domain, value(1..5)}

  const progressPct = Math.round((answers.length / queue.length) * 100);
  const current = queue[idx];

  async function handleChoose(v) {
    const next = [...answers, { domain: current.domain, value: v }];
    setAnswers(next);

    if (idx < queue.length - 1) {
      setIdx(idx + 1);
      return;
    }

    // finished → compute per-domain mean, convert to preliminary T, then call API to calibrate
    const byDomain = new Map();
    for (const a of next) {
      if (!byDomain.has(a.domain)) byDomain.set(a.domain, []);
      byDomain.get(a.domain).push(a.value);
    }

    const prelimT = {};
    for (const [d, arr] of byDomain.entries()) {
      const mean = arr.reduce((s,x)=>s+x,0) / arr.length;
      prelimT[d] = likertToT(d, mean);
    }

    // Call your serverless calibrator once for all domains (batch) or one-by-one.
    // We’ll do one-by-one to keep it simple and resilient.
    const out = {};
    for (const d of Object.keys(prelimT)) {
      try {
        const r = await fetch('/api/model', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'score', domain: d, survey_t: prelimT[d] })
        });
        const j = await r.json();
        out[d] = Number(j?.calibrated_t ?? prelimT[d]);
      } catch {
        out[d] = prelimT[d]; // fall back
      }
    }

    // Build querystring and go straight to results (no Results tab anywhere)
    const params = new URLSearchParams();
    for (const d of Object.keys(out)) params.set(d, String(out[d]));
    router.replace(`/results?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6 md:p-8">
      <h1 className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-sky-900">
        PROMIS Health Snapshot (Adaptive Short Form)
      </h1>
      <p className="text-slate-600 mt-1">Texas Spine and Scoliosis, Austin TX</p>

      <div className="flex items-center justify-center my-8">
        <div className="relative h-40 w-40 rounded-full border-[12px] border-slate-200 flex items-center justify-center">
          <span className="text-2xl font-bold text-sky-700">{progressPct}%</span>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6">
        {current ? current.text : 'Loading…'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {OPTIONS.map(o => (
          <button
            key={o.v}
            onClick={() => handleChoose(o.v)}
            className="rounded-xl bg-sky-800 hover:bg-sky-700 active:bg-sky-900 text-white py-4 px-4 text-lg shadow-md"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
