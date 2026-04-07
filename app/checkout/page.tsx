import { CheckoutPage } from "@/components/checkout/checkout-page";
import { getPayPalClientConfig } from "@/lib/paypal";

export default function CheckoutRoute() {
  return <CheckoutPage paypalConfig={getPayPalClientConfig()} />;
}
