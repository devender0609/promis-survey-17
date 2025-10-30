
'use client';
import { useSearchParams } from 'next/navigation';

const LABELS = {PF:'Physical Function',PI:'Pain Interference',F:'Fatigue',A:'Anxiety',D:'Depression',SR:'Social Roles'};

function cat(dom,t){
  const better = (dom==='PF'||dom==='SR');
  if(better){
    if(t>=60) return 'Better than Average';
    if(t>=47) return 'None–Mild';
    if(t>=40) return 'Moderate Limitation';
    return 'Severe Limitation';
  }else{
    if(t<55) return 'None–Mild';
    if(t<65) return 'Moderate';
    return 'Severe';
  }
}

export default function ResultsView(){
  const sp = useSearchParams();
  const domains = ['PF','PI','F','A','D','SR'];
  const rows = domains.map(d=>({d, t: Number(sp.get(d)??50)}));
  return (
    <section className="card">
      <h1 className="h1">PROMIS Assessment Results</h1>
      <table className="table">
        <thead><tr><th>Domain</th><th>T-score</th><th>Category</th><th>Interpretation</th></tr></thead>
        <tbody>
          {rows.map(r=>{
            const b = (r.d==='PF'||r.d==='SR');
            return (
              <tr key={r.d}>
                <td>{LABELS[r.d]}</td>
                <td>{r.t.toFixed(1)}</td>
                <td><span className="badge">{cat(r.d,r.t)}</span></td>
                <td>{b?'Higher scores indicate BETTER function/ability.':'Higher scores indicate MORE of the symptom/problem.'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="note">PROMIS T-score scale: mean 50, SD 10.</p>
    </section>
  );
}
