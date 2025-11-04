// app/layout.jsx
import "./globals.css";
import Image from "next/image";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="logo-wrap">
            <Image
              src="/logo_new.png"
              alt="Ascension Seton"
              width={220}
              height={60}
              priority
              className="site-logo"
            />
          </div>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
