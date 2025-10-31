// Domains we show in UI order
export const DOMAINS = ["PF","PI","F","A","D","SR"];

// VERY small seed pool per domain for demo. Replace/expand with your bank.
const ITEMS = {
  PF: ["Are you able to carry a laundry basket of clothes up a flight of stairs?"],
  PI: ["In the past 7 days, did you run out of energy?"],
  F:  ["In the past 7 days, how often were you tired?"],
  A:  ["In the past 7 days, I felt hopeless."],
  D:  ["In the past 7 days, I felt depressed."],
  SR: ["In the past 7 days, I had trouble doing my regular social activities."]
};

export function firstQuestion(domain){ return {domain, index:0, text:ITEMS[domain][0]}; }
export function nextQuestion(state){
  // single-item demo → finish the current domain
  return null;
}
export function isDomainFinished(state){ return true; } // one item per domain (demo)

export async function scoreDomain(domain, answersForDomain){
  // call your deployed API model for calibrated T
  try{
    const res = await fetch("/api/model",{
      method:"POST", headers:{"content-type":"application/json"},
      body: JSON.stringify({action:"score", domain, survey_t: roughMap(domain, answersForDomain)})
    });
    if(res.ok){
      const j = await res.json();
      return Math.round((j.calibrated_t ?? 50)*10)/10;
    }
  }catch(e){ console.error(e); }
  // fallback
  return 50.0;
}

// crude mapping from single response → temp T; replace with your router
function roughMap(_domain, answers){
  // answers is an array of 0..4 Likert; map 0->40, 2->50, 4->60
  if(!answers || !answers.length) return 50;
  const v = answers[0];
  return 40 + (v*5);
}
