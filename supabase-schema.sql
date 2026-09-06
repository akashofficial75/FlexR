-- FlexR Database Schema & Initial Setup
-- Run this complete script in your Supabase SQL Editor

-- 1. Create Tables safely (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL,
  discount_price numeric,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  images text[] DEFAULT '{}'::text[],
  sizes text[] DEFAULT '{}'::text[],
  colors text[] DEFAULT '{}'::text[],
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  store_name text DEFAULT 'FlexR',
  whatsapp_number text DEFAULT '+8801234567890',
  bkash_number text DEFAULT '01234567890',
  delivery_charge_inside integer DEFAULT 100,
  delivery_charge_outside integer DEFAULT 130,
  facebook_url text DEFAULT 'https://facebook.com',
  instagram_url text DEFAULT 'https://instagram.com',
  contact_number text DEFAULT '+880 1234 567890',
  contact_email text DEFAULT 'hello@flexr.com',
  footer_description text DEFAULT 'Premium gym essentials designed for movement, comfort and everyday performance.'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  payment_method text NOT NULL,
  subtotal numeric NOT NULL,
  delivery_charge numeric NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  selected_size text NOT NULL,
  selected_color text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  subtotal numeric NOT NULL
);

-- 2. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true) ON CONFLICT DO NOTHING;

-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Safely Drop and Recreate Policies
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;
CREATE POLICY "Public can read active categories" ON public.categories FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admin can read all categories" ON public.categories;
CREATE POLICY "Admin can read all categories" ON public.categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
CREATE POLICY "Admin can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
CREATE POLICY "Admin can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
CREATE POLICY "Admin can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can read available products" ON public.products;
CREATE POLICY "Public can read available products" ON public.products FOR SELECT USING (available = true);
DROP POLICY IF EXISTS "Admin can read all products" ON public.products;
CREATE POLICY "Admin can read all products" ON public.products FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products" ON public.products FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products" ON public.products FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can read settings" ON public.store_settings;
CREATE POLICY "Public can read settings" ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can update settings" ON public.store_settings;
CREATE POLICY "Admin can update settings" ON public.store_settings FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can insert settings" ON public.store_settings;
CREATE POLICY "Admin can insert settings" ON public.store_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can read orders" ON public.orders;
CREATE POLICY "Admin can read orders" ON public.orders FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can read order items" ON public.order_items;
CREATE POLICY "Admin can read order items" ON public.order_items FOR SELECT TO authenticated USING (true);

-- Storage Policies
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admin can insert product images" ON storage.objects;
CREATE POLICY "Admin can insert product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
CREATE POLICY "Public can view category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
DROP POLICY IF EXISTS "Admin can insert category images" ON storage.objects;
CREATE POLICY "Admin can insert category images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'category-images');
DROP POLICY IF EXISTS "Admin can update category images" ON storage.objects;
CREATE POLICY "Admin can update category images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'category-images');
DROP POLICY IF EXISTS "Admin can delete category images" ON storage.objects;
CREATE POLICY "Admin can delete category images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'category-images');


-- 4. Initial Seed Data
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 5. Reload PostgREST Schema Cache
-- This prevents the "Could not find the table in the schema cache" error
NOTIFY pgrst, 'reload schema';
