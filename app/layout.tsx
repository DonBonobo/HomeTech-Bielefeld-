import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeTech Bielefeld",
  description: "Lokaler Heimwerkerbedarf mit Same-Day-Lieferung in Bielefeld."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
