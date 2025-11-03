// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PROMIS Health Snapshot",
  description: "Ascension Seton – Texas Spine and Scoliosis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Single global logo bar (so it doesn't duplicate on /) */}
        <header className="logo-bar">
          <img src="/logo_new.png" alt="Ascension | Seton" className="logo-img" />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
