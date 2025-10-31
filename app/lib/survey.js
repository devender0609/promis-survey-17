// ---- Configuration
export const DOMAINS = ["PF","PI","F","A","D","SR"];
const MIN_PER_DOMAIN = 4;     // ask at least this many
const MAX_PER_DOMAIN = 8;     // never exceed this many
const STOP_SE = 2.8;          // stop early if "confident" (simulated)

// ---- Demo item bank (replace with real PROMIS items as needed)
const BANK = {
  PF: [
    "Are you able to carry a laundry basket of clothes up a flight of stairs?",
    "Are you able to walk more than a mile?",
    "Are you able to do chores such as vacuuming or yard work?"
  ],
  PI: [
    "In the past 7 days, did you run out of energy?",
    "In the past 7 days, how much did pain interfere with work at home?",
    "In the past 7 days, how much did pain interfere with your enjoyment of life?"
  ],
  F: [
    "In the past 7 days, how often did you feel tired?",
    "In the past 7 days, to what degree did fatigue interfere with daily activities?"
  ],
  A: [
    "In the past 7 days, I felt nervous.",
    "In the past 7 days, I felt fearful."
  ],
  D: [
    "In the past 7 days, I felt hopeless.",
    "In the past 7 days, I felt like a failure."
  ],
  SR: [
    "In the past 7 days, I felt I had no trouble doing my usual social activities.",
    "In the past 7 days, I could carry out my social roles."
  ]
};

// ---- Flow helpers
export function firstQuestion(domain){ return { domain, text: BANK[domain][0], idx:0 }; }
export function nextQuestion(ctx){
  // very simple: advance within domain bank
  const { domain, idx } = ctx;
  const nxtIdx = Math.min((idx ?? 0) + 1, BANK[domain].length - 1);
  return { domain, text: BANK[domain][nxtIdx], idx: nxtIdx };
}
export function isDomainFinished({domain, answers}){
  const n = (answers?.length ?? 0);
  // stop early if we already reached MIN and "SE" small enough (simulated)
  const estSE = 3.5 - Math.min(n, MAX_PER_DOMAIN)*0.15; // crude demo curve
  return (n >= MAX_PER_DOMAIN) || (n >= MIN_PER_DOMAIN && estSE <= STOP_SE) || (n >= BANK[domain].length);
}

// ---- Scoring hook (replace with your IRT/Calibrate → API if you want)
export async function scoreDomain(domain, ansArray){
  // Map Likert [0..4] to a pseudo T-score around 50 with sensible direction
  const mean = ansArray.reduce((a,b)=>a+b,0) / (ansArray.length || 1);
  const dir = (domain === "PF" || domain === "SR") ? -1 : 1; // PF/SR: higher = better
  const t = 50 + dir * (mean - 2) * 6.5; // shift & scale
  const clamped = Math.max(20, Math.min(80, Math.round(t*10)/10));
  return clamped;
}

export const LABELS = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles"
};
