export const revalidate = 0; // or false
export const dynamic = "force-dynamic";

import ResultsClient from "./ResultsClient";

export default function ResultsPage() {
  return <ResultsClient />;
}
