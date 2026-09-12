-- ============================================================
-- PJHERBAL CLINIC: Schema Patch v3 — Payment Status & Audit
-- ============================================================

-- Add payment_status column if not already added by previous migration
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Add cancelled to payment_status options (text column, no enum constraint needed)
-- Ensure verified_by and verified_at exist
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS verified_by UUID;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add payment_confirmed_notes column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_confirmed_notes TEXT;

-- Create increment_promo_usage function for coupon code usage tracking
CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promo_codes
  SET used_count = used_count + 1
  WHERE code = promo_code AND is_active = true;
END;
$$;

-- Index for payment_status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

-- Ensure audit_log has all needed columns
ALTER TABLE public.audit_log
ADD COLUMN IF NOT EXISTS admin_email TEXT;

-- RLS: Allow public to call increment_promo_usage
GRANT EXECUTE ON FUNCTION public.increment_promo_usage(TEXT) TO public;

-- Ensure orders RLS allows authenticated users to update (for admin cash confirmation)
DROP POLICY IF EXISTS "authenticated_manage_orders" ON public.orders;
CREATE POLICY "authenticated_manage_orders"
  ON public.orders FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Allow authenticated to insert audit_log
DROP POLICY IF EXISTS "public_insert_audit_log" ON public.audit_log;
CREATE POLICY "public_insert_audit_log"
  ON public.audit_log FOR INSERT TO public
  WITH CHECK (true);
