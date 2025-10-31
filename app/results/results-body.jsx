'use client';
import { useSearchParams } from 'next/navigation';

const LABELS = { PF:'Physical Function', PI:'Pain Interference', F:'Fatigue', A:'Anxiety', D:'Depression', SR:'Social Roles' };

function category(dom,t){
  const better = dom==='PF'||dom==='SR';
  if (better){
    if (t>=60) return 'Better than Average';
    if (t>=47) return 'None–Mild';
    if (t>=40) return 'Moderate Limitation';
    return 'Severe Limitation';
  } else {
    if (t<55) return 'None–Mild';
    if (t<65) return 'Moderate';
    return 'Severe';
  }
}

export default function ResultsBody(){
  const sp = useSearchParams();
  const domains = ['PF','PI','F','A','D','SR'];
  const rows = domains
    .map(d => ({ d, t: Number(sp.get(d) ?? 50) }))
    .filter(r => !Number.isNaN(r.t));

  return (
    <section className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6 md:p-8">
      <h1 className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-sky-900">
        PROMIS Assessment Results
      </h1>
      <p className="text-slate-600 mt-1">Texas Spine and Scoliosis, Austin TX</p>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2 pr-4">Domain</th>
              <th className="py-2 pr-4">T-score</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>{
              const better = r.d==='PF'||r.d==='SR';
              return (
                <tr key={r.d} className="border-t border-slate-200">
                  <td className="py-3 pr-4">{LABELS[r.d]}</td>
                  <td className="py-3 pr-4 font-semibold">{r.t.toFixed(1)}</td>
                  <td className="py-3 pr-4"><span className="inline-block rounded-xl bg-amber-100 text-amber-700 px-2 py-1 text-sm">{category(r.d,r.t)}</span></td>
                  <td className="py-3">{better ? 'Higher scores indicate BETTER function/ability.' : 'Higher scores indicate MORE of the symptom/problem.'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-slate-500 text-sm mt-4">PROMIS T-score scale: mean 50, SD 10.</p>
    </section>
  );
}
