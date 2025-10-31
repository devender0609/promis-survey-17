export const metadata = { title: "PROMIS Survey", description: "Ascension Seton PROMIS Health Snapshot" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
