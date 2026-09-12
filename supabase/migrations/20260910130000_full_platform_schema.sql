-- ============================================================
-- PJHERBAL CLINIC: Full Platform Schema Extension
-- ============================================================

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.admin_role_enum CASCADE;
CREATE TYPE public.admin_role_enum AS ENUM (
  'super_admin', 'admin', 'sales_staff', 'inventory_manager', 'customer_support', 'marketing_manager'
);

DROP TYPE IF EXISTS public.payment_status_enum CASCADE;
CREATE TYPE public.payment_status_enum AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);

DROP TYPE IF EXISTS public.blog_status_enum CASCADE;
CREATE TYPE public.blog_status_enum AS ENUM (
  'draft', 'published', 'archived'
);

-- 2. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.admin_role_enum NOT NULL DEFAULT 'sales_staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  region TEXT,
  district TEXT,
  address TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_referral_code ON public.customers(referral_code);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 4. REFERRAL TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  converted BOOLEAN NOT NULL DEFAULT false,
  order_id UUID,
  clicked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON public.referral_clicks(referral_code);

-- 5. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_state JSONB,
  new_state JSONB,
  notes TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON public.audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at);

-- 6. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value INTEGER NOT NULL DEFAULT 0,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);

-- 7. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  author TEXT NOT NULL DEFAULT 'PJHERBAL Team',
  category TEXT,
  tags TEXT[],
  status public.blog_status_enum NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- 8. CART ITEMS TABLE (session-based, no auth required)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.cart_items(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_session_product ON public.cart_items(session_id, product_id);

-- 9. ADD PAYMENT STATUS TO ORDERS (if not exists)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status public.payment_status_enum NOT NULL DEFAULT 'pending';

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS verified_by UUID;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 10. UPDATED_AT TRIGGER FUNCTION (already exists, skip if present)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_users_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS promo_codes_updated_at ON public.promo_codes;
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS cart_items_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 11. ENABLE RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 12. RLS POLICIES

-- Admin users: authenticated read/write
DROP POLICY IF EXISTS "authenticated_manage_admin_users" ON public.admin_users;
CREATE POLICY "authenticated_manage_admin_users"
  ON public.admin_users FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Customers: public insert (for checkout), authenticated full access
DROP POLICY IF EXISTS "public_insert_customers" ON public.customers;
CREATE POLICY "public_insert_customers"
  ON public.customers FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_manage_customers" ON public.customers;
CREATE POLICY "authenticated_manage_customers"
  ON public.customers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Referral clicks: public insert, authenticated read
DROP POLICY IF EXISTS "public_insert_referral_clicks" ON public.referral_clicks;
CREATE POLICY "public_insert_referral_clicks"
  ON public.referral_clicks FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_referral_clicks" ON public.referral_clicks;
CREATE POLICY "authenticated_read_referral_clicks"
  ON public.referral_clicks FOR SELECT TO authenticated
  USING (true);

-- Audit log: authenticated only
DROP POLICY IF EXISTS "authenticated_manage_audit_log" ON public.audit_log;
CREATE POLICY "authenticated_manage_audit_log"
  ON public.audit_log FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Promo codes: public read active, authenticated manage
DROP POLICY IF EXISTS "public_read_active_promo_codes" ON public.promo_codes;
CREATE POLICY "public_read_active_promo_codes"
  ON public.promo_codes FOR SELECT TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_manage_promo_codes" ON public.promo_codes;
CREATE POLICY "authenticated_manage_promo_codes"
  ON public.promo_codes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Blog posts: public read published, authenticated manage
DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_published_blog_posts"
  ON public.blog_posts FOR SELECT TO public
  USING (status = 'published');

DROP POLICY IF EXISTS "authenticated_manage_blog_posts" ON public.blog_posts;
CREATE POLICY "authenticated_manage_blog_posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Cart items: public full access (session-based)
DROP POLICY IF EXISTS "public_manage_cart_items" ON public.cart_items;
CREATE POLICY "public_manage_cart_items"
  ON public.cart_items FOR ALL TO public
  USING (true) WITH CHECK (true);

-- Orders: allow public insert (for checkout without auth)
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
CREATE POLICY "public_insert_orders"
  ON public.orders FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_order_items" ON public.order_items;
CREATE POLICY "public_insert_order_items"
  ON public.order_items FOR INSERT TO public
  WITH CHECK (true);

-- 13. MOCK DATA
DO $$
BEGIN
  -- Admin users
  INSERT INTO public.admin_users (email, full_name, role, is_active) VALUES
    ('superadmin@pjherbal.co.tz', 'Dr. Peter Juma', 'super_admin', true),
    ('inventory@pjherbal.co.tz', 'Grace Mwamba', 'inventory_manager', true),
    ('orders@pjherbal.co.tz', 'Hassan Ally', 'sales_staff', true),
    ('marketing@pjherbal.co.tz', 'Fatuma Rashid', 'marketing_manager', true),
    ('support@pjherbal.co.tz', 'Baraka Msigwa', 'customer_support', true)
  ON CONFLICT (email) DO NOTHING;

  -- Customers
  INSERT INTO public.customers (full_name, email, phone, region, district, total_orders, total_spent, referral_code) VALUES
    ('Amina Juma', 'amina.juma@gmail.com', '+255712345678', 'Dar es Salaam', 'Segerea', 3, 270000, 'AMINA001'),
    ('Hassan Mwangi', 'hassan.mwangi@yahoo.com', '+255754987321', 'Dar es Salaam', 'Kinondoni', 1, 48000, 'HASSAN002'),
    ('Fatuma Ally', 'fatuma.ally@hotmail.com', '+255763456789', 'Dar es Salaam', 'Ilala', 2, 258000, 'FATUMA003'),
    ('Juma Rashid', 'juma.rashid@gmail.com', '+255789654321', 'Pwani', 'Kibaha', 1, 59000, 'JUMA004'),
    ('Neema Kileo', 'neema.kileo@gmail.com', '+255715222333', 'Dar es Salaam', 'Kinondoni', 2, 83000, 'NEEMA005'),
    ('Baraka Msigwa', 'baraka.msigwa@gmail.com', '+255744888999', 'Mwanza', 'Nyamagana', 1, 78000, 'BARAKA006'),
    ('Zawadi Otieno', 'zawadi.otieno@gmail.com', '+255767111222', 'Arusha', 'Arusha Urban', 1, 37000, 'ZAWADI007'),
    ('Omari Salehe', 'omari.salehe@yahoo.com', '+255756333444', 'Dar es Salaam', 'Temeke', 2, 240000, 'OMARI008'),
    ('Rehema Lukwaro', 'rehema.lukwaro@gmail.com', '+255712555666', 'Dodoma', 'Dodoma Urban', 1, 73000, 'REHEMA009'),
    ('Salma Khamis', 'salma.khamis@gmail.com', '+255768999111', 'Zanzibar', 'Urban West', 4, 320000, 'SALMA010')
  ON CONFLICT (referral_code) DO NOTHING;

  -- Promo codes
  INSERT INTO public.promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active) VALUES
    ('WELCOME10', 'percentage', 10, 20000, 100, 23, true),
    ('SAVE5000', 'fixed', 5000, 50000, 50, 12, true),
    ('HEALTH20', 'percentage', 20, 100000, 30, 8, true),
    ('FREESHIP', 'fixed', 3000, 0, NULL, 45, false)
  ON CONFLICT (code) DO NOTHING;

  -- Blog posts
  INSERT INTO public.blog_posts (title, slug, excerpt, content, author, category, status, published_at) VALUES
    (
      '5 Herbal Remedies for Better Sleep',
      '5-herbal-remedies-better-sleep',
      'Discover natural herbal solutions that can help you achieve deeper, more restful sleep without side effects.',
      'Getting quality sleep is essential for overall health and wellness. At PJHERBAL CLINIC, we believe in the power of nature to support your body''s natural rhythms. Here are five proven herbal remedies that can help you sleep better tonight...',
      'Dr. Peter Juma',
      'Wellness Tips',
      'published',
      NOW() - INTERVAL '5 days'
    ),
    (
      'Understanding Moringa: Tanzania''s Superfood',
      'understanding-moringa-tanzanias-superfood',
      'Moringa oleifera has been used for centuries in East Africa. Learn why this remarkable plant is considered a nutritional powerhouse.',
      'Moringa oleifera, locally known as "Mzunze" in Swahili, is one of the most nutrient-dense plants on earth. Native to Tanzania and East Africa, this remarkable tree has been used for generations in traditional medicine...',
      'Grace Mwamba',
      'Herbal Education',
      'published',
      NOW() - INTERVAL '12 days'
    ),
    (
      'Men''s Health: Natural Approaches to Prostate Wellness',
      'mens-health-natural-prostate-wellness',
      'Prostate health is a critical concern for men over 40. Explore how herbal medicine can support prostate function naturally.',
      'Prostate health becomes increasingly important as men age. Statistics show that prostate issues affect a significant percentage of Tanzanian men over 40. At PJHERBAL CLINIC, we offer natural, evidence-based herbal solutions...',
      'Dr. Peter Juma',
      'Men''s Health',
      'published',
      NOW() - INTERVAL '20 days'
    ),
    (
      'Weight Management the Natural Way',
      'weight-management-natural-way',
      'Struggling with weight? Discover how our herbal weight management products work with your body, not against it.',
      'Weight management is one of the most common health concerns we see at PJHERBAL CLINIC. Many of our customers have tried conventional diets without lasting success. Our herbal approach focuses on supporting your metabolism naturally...',
      'Fatuma Rashid',
      'Weight Management',
      'draft',
      NULL
    )
  ON CONFLICT (slug) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
