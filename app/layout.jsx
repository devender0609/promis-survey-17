// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PROMIS Survey | Ascension Seton",
  description: "Adaptive PROMIS assessment and results",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Single, centered, blended logo bar */}
        <header className="brandbar">
          <div className="brand-inner">
            {/* Use a plain <img> so the SVG’s internal colors stay crisp */}
            <img
              src="/logo_new.svg"
              alt="Ascension Seton"
              className="logo-img"
              draggable="false"
            />
          </div>
        </header>

        <main className="page-wrap">{children}</main>
      </body>
    </html>
  );
}
