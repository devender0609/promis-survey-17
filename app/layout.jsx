// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PROMIS Health Snapshot",
  description: "Ascension Seton | Texas Spine and Scoliosis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient">
        {/* Single logo bar OUTSIDE the survey card */}
        <header className="logo-wrap">
          <img src="/logo_new.png" alt="Ascension | Seton" className="logo-img" />
        </header>
        {children}
      </body>
    </html>
  );
}
