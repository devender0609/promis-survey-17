// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PROMIS Survey",
  description: "Adaptive PROMIS Short Form",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-sky-50/50 text-slate-800">
        {/* Single, centered brand bar (remove any extra logo markup elsewhere) */}
        <header className="w-full py-5">
          <div className="mx-auto max-w-6xl flex items-center justify-center">
            {/* Use a transparent PNG if you have one; this will center & blend */}
            <img
              src="/logo_new.png"
              alt="Ascension Seton"
              className="h-16 w-auto object-contain mix-blend-multiply opacity-95"
              draggable="false"
            />
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
