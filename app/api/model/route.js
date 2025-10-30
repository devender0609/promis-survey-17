
export async function GET(){ return Response.json({ok:true,msg:'hello from /api/model'}); }
export async function POST(req){
  const b = await req.json().catch(()=>({}));
  const { domain, survey_t } = b || {};
  const bias = {PF:0.0,PI:0.2,F:-0.1,A:-0.2,D:0.1,SR:0.0}[domain] ?? 0;
  return Response.json({ domain, survey_t, calibrated_t: Number(survey_t ?? 50) + bias });
}
