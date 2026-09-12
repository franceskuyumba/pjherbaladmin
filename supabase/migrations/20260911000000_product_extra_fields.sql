-- Migration: Add extra product fields for admin photo/price management
-- Adds: original_price, image_url_2, image_url_3, is_featured

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS original_price numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url_2 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url_3 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Index for featured products query on homepage
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured) WHERE is_featured = true;
