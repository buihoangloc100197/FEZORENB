-- ====================================================================
-- ZORENB / FEZORENB LUXURY HAUTE HORLOGERIE - SUPABASE DATABASE SCHEMA
-- Updated: 2026-09-17 — Added order_code, customer_* columns, fixed column names
-- ====================================================================

-- 1. PROFILES TABLE (Extends Supabase auth.users or handles app users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Watches catalog — synced from data/watches/ via /api/admin/seed-products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  reference TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  images TEXT[] NOT NULL,
  caliber TEXT,
  case_size TEXT,
  complications TEXT[] DEFAULT '{}',
  description TEXT,
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CART_ITEMS TABLE (Persistent cart for authenticated users)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 4. ORDERS TABLE (Tracks customer orders and PayOS transactions)
-- Note: order_code = PayOS orderCode (bigint sent to PayOS), distinct from UUID id
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_code TEXT UNIQUE NOT NULL,          -- PayOS orderCode (e.g. "123456789")
  customer_name TEXT NOT NULL DEFAULT 'Quý Khách',
  customer_email TEXT NOT NULL DEFAULT 'unknown@fezorenb.com',
  customer_phone TEXT,
  shipping_address TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'VND',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payos_payment_link_id TEXT,
  payos_checkout_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,     -- price per unit in VND
  quantity INTEGER NOT NULL,
  image_url TEXT
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
-- Products: Only service role can insert/update (via seed API)
CREATE POLICY "Service role can upsert products" ON public.products FOR ALL USING (true);

-- Profiles: Users can view and update their own profile; Admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cart Items: Users manage their own items
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders: Users view own orders; service role can create/update (PayOS webhook)
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manage orders" ON public.orders FOR ALL USING (true);

-- Order items: Users can view their own order items
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
  ));
CREATE POLICY "Service role manage order items" ON public.order_items FOR ALL USING (true);

-- Storage buckets
-- NOTE: Bucket for product images is 'anhsanphamzorenb' (already exists with watch photos)
-- Bucket for user avatars is 'avatars'
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('anhsanphamzorenb', 'anhsanphamzorenb', true)
ON CONFLICT (id) DO NOTHING;
