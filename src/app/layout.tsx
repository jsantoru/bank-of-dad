import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "./toast-provider";

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
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

