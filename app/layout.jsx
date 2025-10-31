export const metadata = { title: 'PROMIS Health Snapshot' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

