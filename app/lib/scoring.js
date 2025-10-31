export async function scoreDomain(domain, answers) {
  // answers: array of integers 0..4 for that domain
  try {
    // If your scorer expects a single survey_t per domain, you might
    // pass your interim T (e.g., OPTION_TO_T mean). Here, call the batch API.
    const res = await fetch('/api/model', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'batch',
        items: [{ domain, survey_t: answersToT(answers) }]
      }),
    });
    if (!res.ok) throw new Error('api/model failed');
    const data = await res.json();
    // Expect something like [{ domain, calibrated_t }]
    const first = Array.isArray(data) ? data[0] : data;
    return first?.calibrated_t ?? answersToT(answers);
  } catch {
    // Fallback if API unreachable
    return answersToT(answers);
  }
}

function answersToT(answers) {
  // crude fallback: average mapped T
  const OPTION_TO_T = [35,45,50,60,70];
  const vals = answers.map(i => OPTION_TO_T[i]);
  const mean = vals.reduce((a,b)=>a+b,0) / Math.max(1, vals.length);
  return Math.round(mean * 10) / 10;
}