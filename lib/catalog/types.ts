export type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  enabled: boolean;
  position: number;
  created_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  line: string;
  spec: string;
  short: string;
  description: string;
  price_cents: number;
  stock_count: number;
  visible: boolean;
  image: string;
  gallery: string[];
  compatibility: string[];
  created_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
};

export type ProductCardModel = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryLabel: string;
  line: string;
  spec: string;
  short: string;
  priceCents: number;
  stockCount: number;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
};

export type CategoryShortcutModel = {
  slug: string;
  label: string;
  href: string;
  productCount: number;
  imageUrl: string;
  imageAlt: string;
};

export type HomepageData = {
  categories: CategoryShortcutModel[];
  featuredProducts: ProductCardModel[];
  searchResults: ProductCardModel[];
  activeQuery: string;
  activeCategory: string;
  hasSearch: boolean;
};
