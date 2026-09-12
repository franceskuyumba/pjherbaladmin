-- Migration: Delivery Workflow Expansion
-- Adds full delivery workflow columns to orders table

-- Add delivery workflow columns (idempotent)
DO $$
BEGIN
  -- Delivery status progression: Preparing → Assigned → Dispatched → Delivered
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_status'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_status TEXT DEFAULT 'Preparing';
  END IF;

  -- Delivery address fields (may differ from billing address)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_district'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_district TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_region'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_region TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_notes'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_notes TEXT;
  END IF;

  -- Courier contact fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'courier_phone'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN courier_phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'courier_name'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN courier_name TEXT;
  END IF;

  -- Delivery fee tracking — always 0 per FREE DELIVERY policy
  -- Stored for audit/record purposes; business rule enforced in application layer
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_fee'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_fee INTEGER DEFAULT 0;
  END IF;

  -- Backfill delivery_address from address column for existing orders
  UPDATE public.orders
  SET
    delivery_address = address,
    delivery_district = district,
    delivery_region = region,
    delivery_status = CASE
      WHEN order_status = 'Delivered' THEN 'Delivered'
      WHEN order_status = 'Dispatched' THEN 'Dispatched'
      WHEN order_status IN ('Processing') THEN 'Preparing'
      ELSE 'Preparing'
    END,
    delivery_fee = 0
  WHERE delivery_address IS NULL;

END $$;

-- Add check constraint for delivery_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND constraint_name = 'orders_delivery_status_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_status_check
      CHECK (delivery_status IN ('Preparing', 'Assigned', 'Dispatched', 'Delivered'));
  END IF;
END $$;

-- Add check constraint: delivery_fee must always be 0 (FREE DELIVERY policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND constraint_name = 'orders_delivery_fee_free_policy'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_fee_free_policy
      CHECK (delivery_fee = 0);
  END IF;
END $$;

-- Index for delivery_status queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders(delivery_status);
