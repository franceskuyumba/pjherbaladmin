-- ============================================================
-- PJHERBAL CLINIC: Branding & Payment Policy Enforcement
-- Migration: 20260910160000_branding_payment_policy.sql
-- ============================================================

-- Add 'cash' to payment_method_enum if not already present
-- NOTE: ALTER TYPE ADD VALUE cannot be used in a transaction with the new value.
-- We use dynamic SQL (EXECUTE) to set the default AFTER adding the enum value,
-- which forces PostgreSQL to re-evaluate the enum catalog and avoids the
-- "unsafe use of new value" error.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.payment_method_enum'::regtype
      AND enumlabel = 'cash'
  ) THEN
    ALTER TYPE public.payment_method_enum ADD VALUE 'cash';
  END IF;
END $$;

-- Ensure delivery_fee is always 0 (FREE DELIVERY policy)
ALTER TABLE public.orders
  ALTER COLUMN delivery_fee SET DEFAULT 0;

-- Set payment_method default to 'cash' using dynamic SQL to avoid
-- "unsafe use of new value of enum type" error in the same transaction
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT ''cash''::public.payment_method_enum';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not set payment_method default: %', SQLERRM;
END $$;

-- Add index on payment_method for faster cash payment queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Ensure products table has rating column for display
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.8;

-- Update any NULL ratings to default
UPDATE public.products SET rating = 4.8 WHERE rating IS NULL;

-- Ensure is_active default is true for products
ALTER TABLE public.products
  ALTER COLUMN is_active SET DEFAULT true;

-- Add view_count for bestseller tracking
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add order_count for bestseller sorting
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0;

-- Create index for bestseller queries
CREATE INDEX IF NOT EXISTS idx_products_order_count ON public.products(order_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- RLS: ensure products are readable by all (public catalog)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'products' AND policyname = 'products_public_read'
  ) THEN
    CREATE POLICY products_public_read ON public.products
      FOR SELECT USING (is_active = true);
  END IF;
END $$;
