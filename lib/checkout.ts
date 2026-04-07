import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CheckoutCustomer,
  CheckoutRequestBody,
  OrderPayload,
  OrderSnapshotItem
} from "@/lib/checkout-types";

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

type PreparedCheckout = {
  customer: CheckoutCustomer;
  items: OrderSnapshotItem[];
  totalCents: number;
};

type CreateStoredOrderInput = {
  status: string;
  totalCents: number;
  payload: OrderPayload;
  items: OrderSnapshotItem[];
};

type StoredOrder = {
  id: string;
  created_at: string;
  total_cents: number;
  status: string;
  paypal_order_id: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCustomer(body: CheckoutRequestBody): CheckoutCustomer {
  const customer = {
    fullName: cleanText(body.customer?.fullName),
    email: cleanText(body.customer?.email),
    phone: cleanText(body.customer?.phone),
    street: cleanText(body.customer?.street),
    postalCode: cleanText(body.customer?.postalCode),
    city: cleanText(body.customer?.city),
    notes: cleanText(body.customer?.notes).slice(0, 600)
  };

  const requiredFields = [
    customer.fullName,
    customer.email,
    customer.phone,
    customer.street,
    customer.postalCode,
    customer.city
  ];

  if (requiredFields.some((field) => !field)) {
    throw new CheckoutError(
      "Bitte Name, E-Mail, Telefon, Adresse und mindestens einen Artikel angeben.",
      400
    );
  }

  return customer;
}

export async function prepareCheckout(body: CheckoutRequestBody): Promise<PreparedCheckout> {
  const customer = normalizeCustomer(body);
  const requestedItems = body.items ?? [];

  if (!requestedItems.length) {
    throw new CheckoutError(
      "Bitte Name, E-Mail, Telefon, Adresse und mindestens einen Artikel angeben.",
      400
    );
  }

  const supabase = createSupabaseAdminClient();
  const [
    { data: categories, error: categoryError },
    { data: products, error: productError },
    { data: productImages, error: imageError }
  ] = await Promise.all([
    supabase.from("categories").select("slug,label").eq("enabled", true),
    supabase
      .from("products")
      .select("id,slug,title,spec,category_slug,price_cents,stock_count,image")
      .eq("visible", true),
    supabase.from("product_images").select("product_id,image_url").order("position", { ascending: true })
  ]);

  if (categoryError) throw new CheckoutError(categoryError.message, 500);
  if (productError) throw new CheckoutError(productError.message, 500);
  if (imageError) throw new CheckoutError(imageError.message, 500);

  const categoryMap = new Map((categories ?? []).map((entry) => [entry.slug, entry.label]));
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const imageMap = new Map((productImages ?? []).map((image) => [image.product_id, image.image_url]));

  const normalizedItems = requestedItems
    .map((item) => {
      const productId = cleanText(item.productId);
      const product = productMap.get(productId);
      if (!product || product.stock_count < 1) return null;

      return {
        productId,
        slug: product.slug,
        title: product.title,
        spec: product.spec,
        quantity: Math.max(1, Math.min(product.stock_count, Number(item.quantity ?? 1))),
        unitPriceCents: product.price_cents,
        category: categoryMap.get(product.category_slug) ?? product.category_slug,
        image: imageMap.get(productId) ?? product.image,
        stockCount: product.stock_count
      } satisfies OrderSnapshotItem;
    })
    .filter((item): item is OrderSnapshotItem => Boolean(item));

  if (!normalizedItems.length) {
    throw new CheckoutError("Keine gültigen Produkte in der Anfrage.", 400);
  }

  const totalCents = normalizedItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  return {
    customer,
    items: normalizedItems,
    totalCents
  };
}

async function deleteOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("order_items").delete().eq("order_id", orderId);
  await supabase.from("orders").delete().eq("id", orderId);
}

export async function createStoredOrder(input: CreateStoredOrderInput) {
  const supabase = createSupabaseAdminClient();
  const orderInsert = await supabase
    .from("orders")
    .insert({
      status: input.status,
      total_cents: input.totalCents,
      paypal_order_id: JSON.stringify(input.payload)
    })
    .select("id")
    .single();

  if (orderInsert.error || !orderInsert.data) {
    throw new CheckoutError(orderInsert.error?.message ?? "Order insert failed", 500);
  }

  const orderId = orderInsert.data.id;
  const itemsInsert = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price_cents: item.unitPriceCents
    }))
  );

  if (itemsInsert.error) {
    await deleteOrder(orderId);
    throw new CheckoutError(itemsInsert.error.message, 500);
  }

  return orderId;
}

export async function updateStoredOrder(orderId: string, status: string, payload: OrderPayload) {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("orders")
    .update({
      status,
      paypal_order_id: JSON.stringify(payload)
    })
    .eq("id", orderId)
    .select("id")
    .single();

  if (result.error || !result.data) {
    throw new CheckoutError(result.error?.message ?? "Order update failed", 500);
  }

  return result.data.id;
}

export async function getStoredOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("orders")
    .select("id,created_at,total_cents,status,paypal_order_id")
    .eq("id", orderId)
    .single();

  if (result.error || !result.data) {
    throw new CheckoutError("Bestellung nicht gefunden.", 404);
  }

  return result.data as StoredOrder;
}

export function buildOrderPayload(
  mode: OrderPayload["mode"],
  customer: CheckoutCustomer,
  items: OrderSnapshotItem[],
  payment?: OrderPayload["payment"]
): OrderPayload {
  return {
    mode,
    customer,
    items,
    payment
  };
}

export function parseOrderPayload(rawPayload: string | null) {
  if (!rawPayload) return null;

  try {
    return JSON.parse(rawPayload) as OrderPayload;
  } catch {
    return null;
  }
}
