// app/lib/survey.js
// Exported helpers USED by app/page.jsx
// Keep strings ASCII-only to avoid weird glyphs.

export const DOMAINS = ["PF","PI","F","A","D","SR"];

const BANK = [
  { id: "PF1", domain: "PF", prompt: "Are you able to climb one flight of stairs without help?", map: [20,35,45,55,65] },
  { id: "PI1", domain: "PI", prompt: "In the past 7 days, pain interfered with your day-to-day activities.", map: [65,60,55,50,45] },
  { id: "F1",  domain: "F",  prompt: "In the past 7 days, I felt fatigued.", map: [65,60,55,50,45] },
  { id: "A1",  domain: "A",  prompt: "In the past 7 days, I felt hopeless.", map: [40,50,55,60,70] },
  { id: "D1",  domain: "D",  prompt: "In the past 7 days, I felt depressed.", map: [40,50,55,60,70] },
  { id: "SR1", domain: "SR", prompt: "I could do my usual social activities.", map: [35,45,50,55,60] },
];

export function firstQuestion() {
  return BANK[0];
}

export function nextQuestion(prevIndex) {
  const i = typeof prevIndex === "number" ? prevIndex + 1 : 0;
  return i < BANK.length ? BANK[i] : null;
}

export function totalQuestions() {
  return BANK.length;
}

// simple scoring: map Likert (0..4) to T using item map, then average by domain
export function scoreSurvey(responses) {
  // responses: { [itemId]: 0..4 }
  const byDomain = {};
  for (const item of BANK) {
    const resp = responses[item.id];
    if (typeof resp !== "number") continue;
    const t = item.map[Math.max(0, Math.min(4, resp))];
    if (!byDomain[item.domain]) byDomain[item.domain] = [];
    byDomain[item.domain].push(t);
  }
  const out = {};
  for (const d of DOMAINS) {
    const arr = byDomain[d] ?? [];
    out[d] = arr.length ? average(arr) : 50;
  }
  return out;
}

function average(a){ return Math.round((a.reduce((x,y)=>x+y,0)/a.length)*10)/10; }

export function categoryFor(domain, tscore){
  // PF & SR: higher is better; others higher is worse
  const higherBetter = (domain === "PF" || domain === "SR");
  const t = Number(tscore);

  if (Number.isNaN(t)) return { label: "—", className: "mild" };

  if (higherBetter) {
    if (t >= 55) return { label: "Normal", className: "ok" };
    if (t >= 45) return { label: "Mild Limitation", className: "mild" };
    if (t >= 35) return { label: "Moderate Limitation", className: "mod" };
    return { label: "Severe Limitation", className: "sev" };
  } else {
    if (t <= 45) return { label: "None–Mild", className: "mild" };
    if (t <= 55) return { label: "Moderate", className: "mod" };
    return { label: "Severe", className: "sev" };
  }
}

export const interpretations = {
  PF: "Higher scores indicate BETTER function/ability.",
  SR: "Higher scores indicate BETTER function/ability.",
  PI: "Higher scores indicate MORE of the symptom/problem.",
  F:  "Higher scores indicate MORE of the symptom/problem.",
  A:  "Higher scores indicate MORE of the symptom/problem.",
  D:  "Higher scores indicate MORE of the symptom/problem.",
};
