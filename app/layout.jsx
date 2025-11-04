// app/layout.jsx
export const metadata = { title: "PROMIS Health Snapshot" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        {/* Single, centered brand bar (NO DUPLICATES) */}
        <header className="brandbar" role="banner" aria-label="Brand">
          <img src="/ascension.png" alt="Ascension" />
          <div className="divider" aria-hidden />
          <img src="/seton.png" alt="Seton" />
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
