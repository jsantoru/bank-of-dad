import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bank of Dad",
  description: "A family banking app for compound interest lessons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

