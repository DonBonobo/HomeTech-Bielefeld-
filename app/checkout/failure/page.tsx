import { CheckoutStatus } from "@/components/checkout/checkout-status";

type FailurePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutFailurePage({ searchParams }: FailurePageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  return (
    <CheckoutStatus
      tone="danger"
      badge="X"
      title="Zahlung nicht abgeschlossen"
      body="PayPal konnte diese Bestellung nicht bestätigen. Sie ist deshalb ausdrücklich nicht als bezahlt markiert."
      reference={orderId || undefined}
      actions={[
        { href: "/checkout", label: "Erneut versuchen", primary: true },
        { href: "/cart", label: "Zum Warenkorb" }
      ]}
    />
  );
}
