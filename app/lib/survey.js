// app/lib/survey.js
export function normalizeText(s) {
  if (!s) return s;
  return String(s)
    .replace(/â€“/g, "–")              // mojibake -> en dash
    .replace(/&ndash;|&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

// Preferred labels (with true en dashes)
export const CATEGORY_LABELS = {
  PF: ["Severe Limitation", "Moderate Limitation", "Mild Limitation", "Normal"],
  PI: ["Severe", "Moderate", "None–Mild"],
  F:  ["Severe", "Moderate", "None–Mild"],
  A:  ["Severe", "Moderate", "None–Mild"],
  D:  ["Severe", "Moderate", "None–Mild"],
  SR: ["Severe Limitation", "Moderate Limitation", "Mild Limitation", "Normal"],
};

export function labelCategory(domain, value){
  if (typeof value === "string") return normalizeText(value);
  const list = CATEGORY_LABELS[domain] || [];
  return normalizeText(list[value] ?? "");
}

// Domains in the order we show
export const DOMAINS = ["PF","PI","F","A","D","SR"];
export const DOMAIN_NAMES = {
  PF: "Physical Function",
  PI: "Pain Interference",
  F:  "Fatigue",
  A:  "Anxiety",
  D:  "Depression",
  SR: "Social Roles",
};
