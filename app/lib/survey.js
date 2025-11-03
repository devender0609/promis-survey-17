// Minimal item bank per domain (expand freely). Each domain can have many items.
// Progress ring will reflect the true total number of items answered.
export const DOMAINS = ["PF", "PI", "F", "A", "D", "SR"];

export const QUESTIONS = {
  PF: [
    { id: "pf_1", text: "Are you able to climb one flight of stairs without help?" },
    { id: "pf_2", text: "Are you able to carry groceries?" },
  ],
  PI: [
    { id: "pi_1", text: "In the past 7 days, did pain interfere with your work at home?" },
  ],
  F: [{ id: "f_1", text: "In the past 7 days, did you run out of energy?" }],
  A: [{ id: "a_1", text: "In the past 7 days, I felt nervous." }],
  D: [{ id: "d_1", text: "In the past 7 days, I felt hopeless." }],
  SR: [{ id: "sr_1", text: "I am able to do daily activities with my usual roles." }],
};

export const totalItems = () =>
  DOMAINS.reduce((n, d) => n + QUESTIONS[d].length, 0);

export const firstQuestion = (domain) => QUESTIONS[domain][0];

export const nextQuestion = ({ domain, index }) => {
  const list = QUESTIONS[domain];
  return list[index] ?? null;
};

export const isDomainFinished = ({ domain, count }) =>
  count >= QUESTIONS[domain].length;

// TODO: replace with your scoring API/model. For now returns plausible shells.
export async function scoreDomain(domain, values) {
  const base = { PF: 45, PI: 65, F: 70, A: 60, D: 55, SR: 50 }[domain] ?? 50;
  return base;
}
