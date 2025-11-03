// app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#f6fafc", margin: 0 }}>
        <header style={{ display:"flex", justifyContent:"center", padding:"18px 0" }}>
          <img
            src="/logo_new.png"
            alt="Ascension Seton"
            style={{
              height: 48,
              objectFit: "contain",
              background: "transparent",
              filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" // no white halo
            }}
          />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
