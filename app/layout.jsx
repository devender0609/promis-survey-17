// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PROMIS Health Snapshot",
  description: "Ascension Seton • Texas Spine and Scoliosis, Austin TX",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Single, centered brand row */}
        <header className="brand-wrap">
          {/* Inline SVGs so there’s no white box; replace with transparent PNGs if you prefer */}
          <div className="brand-row">
            <span className="brand">
              {/* Ascension icon+wordmark (simplified/inline) */}
              <svg
                className="logo-svg"
                viewBox="0 0 240 60"
                aria-label="Ascension"
                role="img"
              >
                <defs>
                  <linearGradient id="asc-g" x1="0" x2="1">
                    <stop offset="0" stopColor="#7b5cff" />
                    <stop offset="1" stopColor="#1fb6ff" />
                  </linearGradient>
                </defs>
                <rect width="240" height="60" fill="none" />
                <path d="M20 45 L35 15 L50 45 Z" fill="url(#asc-g)" />
                <text x="65" y="40" fontFamily="Inter, ui-sans-serif" fontWeight="700" fontSize="28" fill="#163c5a">
                  Ascension
                </text>
              </svg>
            </span>
            <span className="divider" />
            <span className="brand">
              {/* Seton icon+wordmark (simplified/inline) */}
              <svg
                className="logo-svg"
                viewBox="0 0 180 60"
                aria-label="Seton"
                role="img"
              >
                <circle cx="30" cy="30" r="20" fill="#0b5fad" />
                <path d="M30 16 v28 M20 26 h20" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                <text x="60" y="40" fontFamily="Inter, ui-sans-serif" fontWeight="800" fontSize="28" fill="#0b1d2f">
                  Seton
                </text>
              </svg>
            </span>
          </div>
        </header>

        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
