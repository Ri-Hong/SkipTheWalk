export const metadata = {
  title: "SkipTheWalk",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body style={{padding: "0", margin: "0"}}>{children}</body>
    </html>
  );
}
