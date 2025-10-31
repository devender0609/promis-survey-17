export async function GET() {
  return Response.json({ ok: true, msg: "hello from Vercel" });
}

export async function POST(req) {
  const body = await req.json();
  if (body?.action === 'batch' && Array.isArray(body.items)) {
    // Expect [{domain, survey_t}]
    const out = body.items.map(it => ({
      domain: it.domain,
      calibrated_t: Number(it.survey_t) // replace w/ real calibration
    }));
    return Response.json(out);
  }
  if (body?.action === 'score' && body.domain) {
    return Response.json({
      domain: body.domain,
      survey_t: Number(body.survey_t ?? 50),
      calibrated_t: Number(body.survey_t ?? 50),
    });
  }
  return new Response("Bad Request", { status: 400 });
}