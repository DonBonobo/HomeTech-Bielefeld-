create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'customer';

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  enabled boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  title text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  line text not null,
  spec text not null,
  short text not null,
  description text not null,
  price_cents integer not null,
  stock_count integer not null default 0,
  visible boolean not null default true,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  compatibility jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, image_url)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unique(cart_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  paypal_order_id text,
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_cents integer not null
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;
alter table public.product_images enable row level security;

create policy if not exists "public read categories" on public.categories for select using (true);
create policy if not exists "public read visible products" on public.products for select using (visible = true);
create policy if not exists "public read product images" on public.product_images for select using (true);

create policy if not exists "user manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists "admin manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
) with check (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
);
create policy if not exists "admin manage products" on public.products for all using (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
) with check (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
);
create policy if not exists "admin manage product images" on public.product_images for all using (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
) with check (
  exists (select 1 from public.profiles where public.profiles.id = auth.uid() and public.profiles.role = 'admin')
);
create policy if not exists "user manage own cart" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "user manage own cart items" on public.cart_items for all using (
  exists (select 1 from public.carts where public.carts.id = cart_items.cart_id and public.carts.user_id = auth.uid())
) with check (
  exists (select 1 from public.carts where public.carts.id = cart_items.cart_id and public.carts.user_id = auth.uid())
);

create policy if not exists "user read own orders" on public.orders for select using (auth.uid() = user_id);
create policy if not exists "user read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where public.orders.id = order_items.order_id and public.orders.user_id = auth.uid())
);

create index if not exists product_images_product_id_position_idx on public.product_images(product_id, position);
