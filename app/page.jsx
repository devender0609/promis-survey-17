
'use client';
import { useState } from 'react';
import Link from 'next/link';

const DOMAINS = ['PF','PI','F','A','D','SR'];
const CHOICES = ['Never','Rarely','Sometimes','Often','Always'];
const MAP = {Never:20,Rarely:35,Sometimes:50,Often:65,Always:80};

export default function Page(){
  const [i,setI] = useState(0);
  const [ans,setAns] = useState({});
  const pct = Math.round(Object.keys(ans).length/DOMAINS.length*100);
  const dom = DOMAINS[i];

  const choose = (c)=>{
    const t = MAP[c];
    const next = {...ans, [dom]:t};
    setAns(next);
    if(i<DOMAINS.length-1) setI(i+1);
  };

  const query = new URLSearchParams(Object.entries(ans).map(([k,v])=>[k,String(v)])).toString();

  return (
    <section className="card">
      <h1 className="h1">PROMIS Health Snapshot (Adaptive Short Form)</h1>
      <div className="progress">{pct}%</div>
      <p>In the past 7 days, I felt … ({dom})</p>
      <div className="choices">
        {CHOICES.map(c=> <button key={c} className="btn" onClick={()=>choose(c)}>{c}</button>)}
      </div>
      <div style={{marginTop:16}}>
        <Link className="btn" href={`/results?${query}`}>Go to Results</Link>
      </div>
      <div className="note">Texas Spine and Scoliosis, Austin TX</div>
    </section>
  );
}
