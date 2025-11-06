// NO "use client" here — this must be a Server Component file.

export const dynamic = 'force-dynamic';
export const revalidate = 0;         // or: false
export const fetchCache = 'force-no-store';

import ClientResults from "./ClientResults";

export default function ResultsPage() {
  // You can pass server-side props later if needed.
  return <ClientResults />;
}
