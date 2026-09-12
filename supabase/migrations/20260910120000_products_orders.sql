-- ============================================================
-- PJHERBAL CLINIC: Products & Orders Schema
-- ============================================================

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.order_status_enum CASCADE;
CREATE TYPE public.order_status_enum AS ENUM (
  'Pending', 'Paid', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'
);

DROP TYPE IF EXISTS public.payment_method_enum CASCADE;
CREATE TYPE public.payment_method_enum AS ENUM (
  'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa', 'CRDB Bank', 'NMB Bank', 'Selcom'
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  stock_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  ingredients TEXT,
  usage_instructions TEXT,
  warnings TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock_count ON public.products(stock_count);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  payment_method public.payment_method_enum NOT NULL,
  payment_ref TEXT,
  order_status public.order_status_enum NOT NULL DEFAULT 'Pending',
  courier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. ENABLE RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES — Products: public read, authenticated write
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
  ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_products" ON public.products;
CREATE POLICY "authenticated_manage_products"
  ON public.products FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 8. RLS POLICIES — Orders: authenticated only
DROP POLICY IF EXISTS "authenticated_manage_orders" ON public.orders;
CREATE POLICY "authenticated_manage_orders"
  ON public.orders FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_manage_order_items" ON public.order_items;
CREATE POLICY "authenticated_manage_order_items"
  ON public.order_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 9. MOCK DATA
DO $$
BEGIN
  -- Products
  INSERT INTO public.products (id, name, slug, category, price, stock_count, description, is_active) VALUES
    (gen_random_uuid(), 'Moringa Plus Capsules', 'moringa-plus-capsules', 'Men''s Health', 35000, 48, 'Premium moringa extract capsules for overall wellness and vitality.', true),
    (gen_random_uuid(), 'SlimFit Herbal Tea', 'slimfit-herbal-tea', 'Weight Management', 17500, 7, 'Natural herbal tea blend to support healthy weight management.', true),
    (gen_random_uuid(), 'ProstaHealth Formula', 'prostahealth-formula', 'Men''s Health', 45000, 22, 'Targeted herbal formula for prostate health and urinary function.', true),
    (gen_random_uuid(), 'FemVital Wellness Blend', 'femvital-wellness-blend', 'Women''s Wellness', 32000, 5, 'Holistic herbal blend formulated for women''s hormonal balance.', true),
    (gen_random_uuid(), 'BrainBoost Nootropic', 'brainboost-nootropic', 'Brain & Focus', 30000, 31, 'Herbal nootropic blend to enhance focus, memory and mental clarity.', true),
    (gen_random_uuid(), 'EnergyMax Daily Boost', 'energymax-daily-boost', 'Energy & Immunity', 27000, 9, 'Daily energy and immunity booster with adaptogenic herbs.', true),
    (gen_random_uuid(), 'DetoxPure 7-Day Cleanse', 'detoxpure-7-day-cleanse', 'Detox & Digestion', 38500, 14, 'Complete 7-day herbal detox and digestive cleanse program.', true),
    (gen_random_uuid(), 'JointFlex Herbal Rub', 'jointflex-herbal-rub', 'Pain Relief', 22000, 3, 'Topical herbal rub for joint pain and muscle soreness relief.', true)
  ON CONFLICT (slug) DO NOTHING;

  -- Orders
  INSERT INTO public.orders (id, order_id, customer, phone, email, region, district, address, subtotal, delivery_fee, total, payment_method, payment_ref, order_status, courier, notes) VALUES
    (gen_random_uuid(), 'PJH-2847', 'Amina Juma', '+255 712 345 678', 'amina.juma@gmail.com', 'Dar es Salaam', 'Segerea', 'Mtaa wa Segerea, Nyumba Na. 14B', 87500, 3000, 90500, 'M-Pesa', 'MP240805001', 'Pending', '', 'Please deliver before 6 PM'),
    (gen_random_uuid(), 'PJH-2846', 'Hassan Mwangi', '+255 754 987 321', 'hassan.mwangi@yahoo.com', 'Dar es Salaam', 'Kinondoni', 'Sinza Mori, Block C, Apt 3', 45000, 3000, 48000, 'Tigo Pesa', 'TP240805002', 'Paid', '', ''),
    (gen_random_uuid(), 'PJH-2845', 'Fatuma Ally', '+255 763 456 789', 'fatuma.ally@hotmail.com', 'Dar es Salaam', 'Ilala', 'Kariakoo, Msimbazi Street No. 22', 126000, 3500, 129500, 'M-Pesa', 'MP240804003', 'Processing', 'Ali Express Courier', 'Customer requested bubble wrap packaging'),
    (gen_random_uuid(), 'PJH-2844', 'Juma Rashid', '+255 789 654 321', 'juma.rashid@gmail.com', 'Pwani', 'Kibaha', 'Kibaha Town, Uvumba Road', 54000, 5000, 59000, 'Airtel Money', 'AM240804004', 'Dispatched', 'G4S Tanzania', ''),
    (gen_random_uuid(), 'PJH-2843', 'Neema Kileo', '+255 715 222 333', 'neema.kileo@gmail.com', 'Dar es Salaam', 'Kinondoni', 'Mwananyamala, Sekta Ya 11', 38500, 3000, 41500, 'CRDB Bank', 'CRDB240803005', 'Delivered', 'Salama Express', ''),
    (gen_random_uuid(), 'PJH-2842', 'Baraka Msigwa', '+255 744 888 999', 'baraka.msigwa@gmail.com', 'Mwanza', 'Nyamagana', 'Mwanza City, Capri Point Road', 70000, 8000, 78000, 'Selcom', 'SC240803006', 'Processing', 'DHL Tanzania', 'Mwanza delivery — allow 3 business days'),
    (gen_random_uuid(), 'PJH-2841', 'Zawadi Otieno', '+255 767 111 222', 'zawadi.otieno@gmail.com', 'Arusha', 'Arusha Urban', 'Arusha, Sokoine Road, Plot 7', 30000, 7000, 37000, 'M-Pesa', 'MP240802007', 'Cancelled', '', 'Customer cancelled — refund processed'),
    (gen_random_uuid(), 'PJH-2840', 'Omari Salehe', '+255 756 333 444', 'omari.salehe@yahoo.com', 'Dar es Salaam', 'Temeke', 'Temeke, Chang''ombe Road', 117000, 3000, 120000, 'NMB Bank', 'NMB240802008', 'Delivered', 'Salama Express', ''),
    (gen_random_uuid(), 'PJH-2839', 'Rehema Lukwaro', '+255 712 555 666', 'rehema.lukwaro@gmail.com', 'Dodoma', 'Dodoma Urban', 'Dodoma, Mtaa wa Chamwino', 64000, 9000, 73000, 'HaloPesa', 'HP240801009', 'Dispatched', 'Precision Air Cargo', 'Gift wrap requested')
  ON CONFLICT (order_id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
