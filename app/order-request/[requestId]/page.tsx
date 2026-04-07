import { OrderRequestConfirmation } from "@/components/checkout/order-request-confirmation";

type ConfirmationRouteProps = {
  params: Promise<{ requestId: string }>;
};

export default async function OrderRequestConfirmationRoute({ params }: ConfirmationRouteProps) {
  const { requestId } = await params;

  return <OrderRequestConfirmation requestId={requestId} />;
}
