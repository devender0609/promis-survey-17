// app/lib/survey.js
// Minimal working demo of domain → questions → scoring.
// You can replace the question text and scoring with your calibrated logic later.

export const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];

const BANK = {
  PF: [
    "Are you able to climb one flight of stairs without help?",
    "Are you able to carry groceries?",
  ],
  PI: [
    "In the past 7 days, how much did pain interfere with your day to day activities?",
    "In the past 7 days, how much did pain interfere with your social activities?",
  ],
  F: [
    "In the past 7 days, I felt fatigued.",
    "In the past 7 days, I had trouble starting things because I was tired.",
  ],
  A: [
    "In the past 7 days, I felt hopeless.",
    "In the past 7 days, I felt fearful.",
  ],
  D: [
    "In the past 7 days, I felt worthless.",
    "In the past 7 days, I felt lonely.",
  ],
  SR: [
    "I have trouble doing regular activities with friends.",
    "I have trouble doing my usual work.",
  ],
};

// map LIKERT 0..4 to demo T-scores (replace w/ real IRT later)
function likertToT(values) {
  if (!values?.length) return 50;
  const mean = values.reduce((a, b) => a + b, 0) / values.length; // 0..4
  // crude demo transformation: 0→40, 2→50, 4→60 (+/- 10 range)
  return Math.round(40 + (mean * 20) / 4);
}

export function firstQuestion(domain) {
  return { domain, index: 0, text: BANK[domain][0] };
}
export function nextQuestion({ domain, index }) {
  const i = index + 1;
  if (i >= BANK[domain].length) return null;
  return { domain, index: i, text: BANK[domain][i] };
}
export function isDomainFinished(q) {
  return q.index >= BANK[q.domain].length - 1;
}
export async function scoreDomain(domain, answers) {
  return likertToT(answers);
}
export function domainCount(domain) {
  return BANK[domain].length;
}
