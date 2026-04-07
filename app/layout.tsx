import type { Metadata } from "next";
import { CartProvider } from "@/components/providers/cart-provider";
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
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
