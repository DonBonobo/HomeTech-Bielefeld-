import { CheckoutStatus } from "@/components/checkout/checkout-status";

type CancelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutCancelPage({ searchParams }: CancelPageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  return (
    <CheckoutStatus
      tone="warning"
      badge="!"
      title="PayPal Zahlung abgebrochen"
      body="Es wurde nichts als bezahlt markiert. Dein Warenkorb bleibt lokal erhalten und du kannst den Checkout erneut starten."
      reference={orderId || undefined}
      actions={[
        { href: "/checkout", label: "Zurück zum Checkout", primary: true },
        { href: "/cart", label: "Warenkorb prüfen" }
      ]}
    />
  );
}
