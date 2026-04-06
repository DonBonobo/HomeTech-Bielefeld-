import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function normalizeCapturedTotalCents(order) {
  const value = order?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
  const cents = Math.round(Number(value || 0) * 100);
  return Number.isFinite(cents) ? cents : 0;
}

export async function persistCapturedOrder(userId, paypalOrder) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !userId || !paypalOrder?.id) {
    return { persisted: false, reason: "unconfigured" };
  }

  const { data: cartRow, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) {
    return { persisted: false, reason: "missing-schema" };
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("paypal_order_id", paypalOrder.id)
    .maybeSingle();

  if (existingOrder) {
    return { persisted: true, orderId: existingOrder.id, reused: true };
  }

  let cartItems = [];
  if (cartRow?.id) {
    const { data: itemRows, error: itemError } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("cart_id", cartRow.id);

    if (!itemError) {
      cartItems = itemRows || [];
    }
  }

  const productIds = [...new Set(cartItems.map((item) => item.product_id))];
  const { data: products, error: productError } = productIds.length
    ? await supabase
        .from("products")
        .select("id, price_cents")
        .in("id", productIds)
    : { data: [], error: null };

  if (productError) {
    return { persisted: false, reason: "missing-schema" };
  }

  const priceMap = new Map((products || []).map((product) => [product.id, product.price_cents]));
  const totalCents = normalizeCapturedTotalCents(paypalOrder);

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: String(paypalOrder.status || "").toLowerCase() || "captured",
      paypal_order_id: paypalOrder.id,
      total_cents: totalCents,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return { persisted: false, reason: "missing-schema" };
  }

  const orderItems = cartItems
    .filter((item) => priceMap.has(item.product_id))
    .map((item) => ({
      order_id: orderRow.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_cents: priceMap.get(item.product_id),
    }));

  if (orderItems.length) {
    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);
    if (orderItemsError) {
      return { persisted: false, reason: "missing-schema" };
    }
  }

  if (cartRow?.id) {
    await supabase.from("cart_items").delete().eq("cart_id", cartRow.id);
  }

  return { persisted: true, orderId: orderRow.id, reused: false };
}
