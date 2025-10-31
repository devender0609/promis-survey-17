'use client';
import { Suspense } from 'react';
import ResultsBody from './results-body';

export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

export default function ResultsPage(){
  return (
    <Suspense fallback={<div className="card">Loading results…</div>}>
      <ResultsBody />
    </Suspense>
  );
}
