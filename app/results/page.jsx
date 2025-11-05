"use client";
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function ResultsPage() {
  return (
    <main style={{padding:"24px",fontFamily:"system-ui"}}>
      <h1>Results – smoke test</h1>
      <p>If you can see this in prod, revalidate is fixed.</p>
    </main>
  );
}
