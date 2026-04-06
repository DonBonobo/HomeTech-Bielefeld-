import { CartProvider } from "@/components/providers/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";
import "@/app/globals.css";

export const metadata = {
  title: "HomeTech Bielefeld",
  description: "Mobiler Philips Hue Shop fuer HomeTech Bielefeld.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
