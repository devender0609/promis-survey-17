// app/layout.jsx
export const metadata = { title: "PROMIS Survey – Ascension Seton" };

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Single logo only */}
        <header className="site-header">
          <img
            src="/logo_new.svg"
            alt="Ascension Seton"
            className="header-logo"
          />
        </header>
        <main className="page-wrap">{children}</main>
      </body>
    </html>
  );
}
