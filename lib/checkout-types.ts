export type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  notes: string;
};

export type CheckoutItemInput = {
  productId?: string;
  quantity?: number;
};

export type CheckoutRequestBody = {
  customer?: Partial<CheckoutCustomer>;
  items?: CheckoutItemInput[];
};

export type OrderSnapshotItem = {
  productId: string;
  slug: string;
  title: string;
  spec: string;
  quantity: number;
  unitPriceCents: number;
  category: string;
  image: string;
  stockCount: number;
};

export type OrderPaymentPayload = {
  provider: "paypal";
  environment: "sandbox" | "live";
  currency: "EUR";
  paypalOrderId?: string;
  captureId?: string;
  amountCents?: number;
  status?: string;
  paidAt?: string;
  lastEventAt?: string;
  lastError?: string;
  rawCreateOrder?: unknown;
  rawCaptureOrder?: unknown;
};

export type OrderPayload = {
  mode: "order_request" | "paypal_checkout";
  customer: CheckoutCustomer;
  items: OrderSnapshotItem[];
  payment?: OrderPaymentPayload;
};

export type PayPalClientConfig = {
  enabled: boolean;
  clientId: string;
  currency: "EUR";
  intent: "capture";
  environment: "sandbox" | "live";
};
