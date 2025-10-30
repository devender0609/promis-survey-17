
'use client';

import { Suspense } from 'react';
import ResultsView from './results-view';

export const revalidate = false;        // boolean OK
export const dynamic = 'force-dynamic'; // avoid static generation
export const fetchCache = 'force-no-store';

export default function ResultsPage(){
  return (
    <Suspense fallback={<div className="card">Loading results…</div>}>
      <ResultsView />
    </Suspense>
  );
}
