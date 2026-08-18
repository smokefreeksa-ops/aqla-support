import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQla",
  description: "Smoking and nicotine cessation support platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
