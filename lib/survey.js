export const DOMAINS = ["PF","PI","F","A","D","SR"];

export const OPTIONS_5 = [
  "Not at all",
  "A little bit",
  "Somewhat",
  "Quite a bit",
  "Very much",
];

// Minimal—replace with your true item bank or short-form composites
export const ITEMS = {
  PF: [
    "Are you able to carry a laundry basket of clothes up a flight of stairs?",
    "Are you able to run errands and shop?"
  ],
  PI: [
    "In the past 7 days, did pain interfere with your day-to-day activities?",
    "In the past 7 days, how much did pain interfere with your enjoyment of life?"
  ],
  F: [
    "In the past 7 days, did you run out of energy?",
    "In the past 7 days, how often were you tired?"
  ],
  A: [
    "In the past 7 days, I felt fearful.",
    "In the past 7 days, I felt nervous."
  ],
  D: [
    "In the past 7 days, I felt hopeless.",
    "In the past 7 days, I felt depressed."
  ],
  SR: [
    "In the past 7 days, how satisfied were you with your social activities?",
    "In the past 7 days, how often did you feel isolated?"
  ],
};

// map option index (0..4) to provisional T increments (placeholder)
// You likely already convert via IRT or your /api/model scorer. This is only for demo when API is down.
export const OPTION_TO_T = [35, 45, 50, 60, 70];

export function totalQuestions() {
  return DOMAINS.reduce((n, d) => n + ITEMS[d].length, 0);
}