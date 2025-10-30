
import "../styles/globals.css";

export const metadata = { title: "PROMIS Health Snapshot", description: "Ascension | Seton" };

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body>
        <header className="header">
          <img src="/logo_new.png" alt="Ascension | Seton" height="56" />
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
