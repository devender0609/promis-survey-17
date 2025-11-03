export async function POST(req) {
  try {
    const body = await req.json();
    const { action, domain, survey_t } = body || {};
    if (action !== "score" || !domain || typeof survey_t !== "number") {
      return new Response(JSON.stringify({ ok:false, error:"bad_request" }), { status: 400 });
    }
    // passthrough: pretend it's already calibrated
    const calibrated_t = survey_t;
    return new Response(JSON.stringify({ domain, survey_t, calibrated_t }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status: 500 });
  }
}
