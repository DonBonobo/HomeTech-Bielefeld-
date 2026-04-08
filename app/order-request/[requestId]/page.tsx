import { OrderRequestConfirmation } from "@/components/checkout/order-request-confirmation";
import { getStoredOrder, parseOrderPayload } from "@/lib/checkout";

type ConfirmationRouteProps = {
  params: Promise<{ requestId: string }>;
};

export default async function OrderRequestConfirmationRoute({ params }: ConfirmationRouteProps) {
  const { requestId } = await params;
  let order = null;
  let payload = null;

  try {
    order = await getStoredOrder(requestId);
    payload = parseOrderPayload(order.paypal_order_id);
  } catch {}

  return <OrderRequestConfirmation requestId={requestId} order={order} payload={payload} />;
}
