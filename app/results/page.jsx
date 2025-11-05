// app/results/page.jsx
// SERVER COMPONENT: define route options here
export const revalidate = false;              // no ISR
export const dynamic = "force-dynamic";       // never prerender
export const fetchCache = "force-no-store";   // don't cache fetch()

import ResultsClient from "./ResultsClient";

export default function ResultsPage() {
  return <ResultsClient />;
}
