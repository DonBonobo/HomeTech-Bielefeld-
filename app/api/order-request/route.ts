import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RequestBody = {
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    notes?: string;
  };
  items?: Array<{
    productId?: string;
    quantity?: number;
  }>;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const customer = body.customer;
  const items = body.items ?? [];

  const requiredFields = [
    cleanText(customer?.fullName),
    cleanText(customer?.email),
    cleanText(customer?.phone),
    cleanText(customer?.street),
    cleanText(customer?.postalCode),
    cleanText(customer?.city)
  ];

  if (requiredFields.some((field) => !field) || !items.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bitte Name, E-Mail, Telefon, Adresse und mindestens einen Artikel angeben."
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const [{ data: categories, error: categoryError }, { data: products, error: productError }, { data: productImages, error: imageError }] =
      await Promise.all([
        supabase.from("categories").select("slug,label").eq("enabled", true),
        supabase.from("products").select("id,title,category_slug,price_cents,image").eq("visible", true),
        supabase.from("product_images").select("product_id,image_url").order("position", { ascending: true })
      ]);

    if (categoryError) throw categoryError;
    if (productError) throw productError;
    if (imageError) throw imageError;

    const productMap = new Map((products ?? []).map((product) => [product.id, product]));
    const imageMap = new Map((productImages ?? []).map((image) => [image.product_id, image.image_url]));

    const normalizedItems = items
      .map((item) => ({
        productId: cleanText(item.productId),
        quantity: Math.max(1, Number(item.quantity ?? 1))
      }))
      .filter((item) => item.productId && productMap.has(item.productId));

    if (!normalizedItems.length) {
      return NextResponse.json({ ok: false, error: "Keine gültigen Produkte in der Anfrage." }, { status: 400 });
    }

    const totalCents = normalizedItems.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price_cents ?? 0) * item.quantity;
    }, 0);

    const requestPayload = {
      mode: "order_request",
      customer: {
        fullName: cleanText(customer?.fullName),
        email: cleanText(customer?.email),
        phone: cleanText(customer?.phone),
        street: cleanText(customer?.street),
        postalCode: cleanText(customer?.postalCode),
        city: cleanText(customer?.city),
        notes: cleanText(customer?.notes).slice(0, 600)
      },
      items: normalizedItems.map((item) => {
        const product = productMap.get(item.productId);
        const category = (categories ?? []).find((entry) => entry.slug === product?.category_slug);

        return {
          productId: item.productId,
          title: product?.title,
          quantity: item.quantity,
          unitPriceCents: product?.price_cents,
          category: category?.label ?? product?.category_slug,
          image: imageMap.get(item.productId) ?? product?.image
        };
      })
    };

    const orderInsert = await supabase
      .from("orders")
      .insert({
        status: "request_pending",
        total_cents: totalCents,
        paypal_order_id: JSON.stringify(requestPayload)
      })
      .select("id")
      .single();

    if (orderInsert.error || !orderInsert.data) {
      throw orderInsert.error ?? new Error("Order insert failed");
    }

    const orderItemsInsert = await supabase.from("order_items").insert(
      normalizedItems.map((item) => ({
        order_id: orderInsert.data.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_cents: productMap.get(item.productId)?.price_cents ?? 0
      }))
    );

    if (orderItemsInsert.error) {
      throw orderItemsInsert.error;
    }

    return NextResponse.json({
      ok: true,
      orderId: orderInsert.data.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Die Bestellanfrage konnte gerade nicht gespeichert werden."
      },
      { status: 500 }
    );
  }
}
