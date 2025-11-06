// app/results/page.jsx
export const dynamic = 'force-dynamic';   // DO NOT prerender
export const revalidate = 0;              // numeric or false only

import ResultsClient from './ResultsClient';

export default function ResultsPage() {
  return <ResultsClient />;
}
