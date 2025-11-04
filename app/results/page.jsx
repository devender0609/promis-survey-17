// app/results/page.jsx
export const revalidate = false;                // no ISR
export const dynamic = "force-dynamic";        // always dynamic
export const fetchCache = "force-no-store";    // don't cache fetches

import ClientResults from "./ClientResults";

export default function ResultsPage() {
  // Server component just shells out to the client component
  return <ClientResults />;
}
