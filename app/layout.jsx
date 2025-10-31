export const dynamic = 'force-dynamic';
export const revalidate = 0;

import './globals.css';

export const metadata = { title: 'PROMIS Health Snapshot' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-sky-50 min-h-screen">
        <header className="w-full bg-white/70 backdrop-blur border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
            <img src="/logo_new.png" alt="Ascension | Seton" className="h-10 w-auto" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
