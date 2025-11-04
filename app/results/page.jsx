// app/results/page.jsx
export const revalidate = false;             // no ISR
export const dynamic = "force-dynamic";     // always dynamic
export const fetchCache = "force-no-store"; // no fetch caching

import ClientResults from "./ClientResults";

export default function ResultsPage(){
  return <ClientResults />;
}
