export const shopConfig = {
  businessName: "HomeTech Bielefeld",
  slogan: "Smarter Homes? Das gibt's doch nicht!",
  addressLines: ["Taubenst. 6a", "33607 Bielefeld"],
  email: "hometech.bielefeld@gmail.com",
  shippingRegion: "Europaweit",
  paypalMode: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? "live" : "mock",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseBucket: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images",
};
