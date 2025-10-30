'use client';

import { Suspense } from 'react';
import ResultsView from './results-view';

// ✅ Only primitives here (no objects)
export const dynamic = 'force-dynamic';
export const revalidate = false;          // valid: boolean
export const fetchCache = 'force-no-store';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="card">Loading results…</div>}>
      <ResultsView />
    </Suspense>
  );
}
