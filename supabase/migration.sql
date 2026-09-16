-- ====================================================================
-- FEZORENB — Supabase Migration: Add missing columns to products table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ibkchkpqoriinoofzmpu/sql
-- ====================================================================

-- Add missing columns to products table (safe: only adds if not exists)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS case_size TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS complications TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS caliber TEXT;

-- Fix orders table: rename payos_order_id to order_code (or add if not exists)
-- First check if order_code column exists, if not: add it
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Quy Khach';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT 'unknown@fezorenb.com';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Create unique index on order_code (safe)
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_idx ON public.orders(order_code);

-- Fix order_items: rename unit_price to price (or add if not exists)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Update price from unit_price if it exists
UPDATE public.order_items SET price = unit_price WHERE price IS NULL AND unit_price IS NOT NULL;

-- Add service role policy for products (allow upsert via API)
DROP POLICY IF EXISTS "Service role can upsert products" ON public.products;
CREATE POLICY "Service role can upsert products" ON public.products 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage orders" ON public.orders;
CREATE POLICY "Service role manage orders" ON public.orders 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage order items" ON public.order_items;
CREATE POLICY "Service role manage order items" ON public.order_items 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anonymous insert for profiles (for Supabase auth signup flow)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
