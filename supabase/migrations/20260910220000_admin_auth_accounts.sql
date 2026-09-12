-- ============================================================
-- PJHERBAL CLINIC: Create Supabase Auth accounts for admin users
-- This migration creates auth.users entries for all admin staff
-- and links them to the existing admin_users table rows.
-- ============================================================

DO $$
DECLARE
  v_super_admin_id   UUID := gen_random_uuid();
  v_inventory_id     UUID := gen_random_uuid();
  v_orders_id        UUID := gen_random_uuid();
  v_marketing_id     UUID := gen_random_uuid();
  v_support_id       UUID := gen_random_uuid();
BEGIN

  -- --------------------------------------------------------
  -- 1. Insert into auth.users (skip if email already exists)
  -- --------------------------------------------------------

  -- Super Admin
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at,
    phone, phone_change, phone_change_token, phone_change_sent_at
  ) VALUES (
    v_super_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'superadmin@pjherbal.co.tz',
    crypt('PJHerbal@2026!', gen_salt('bf', 10)),
    now(), now(), now(),
    jsonb_build_object('full_name', 'Dr. Peter Juma', 'role', 'super_admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false,
    '', null, '', null, '', '', null, '', 0, '', null,
    null, '', '', null
  )
  ON CONFLICT (email) DO NOTHING;

  -- Inventory Manager
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at,
    phone, phone_change, phone_change_token, phone_change_sent_at
  ) VALUES (
    v_inventory_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'inventory@pjherbal.co.tz',
    crypt('StockMgr@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    jsonb_build_object('full_name', 'Grace Mwamba', 'role', 'inventory_manager'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false,
    '', null, '', null, '', '', null, '', 0, '', null,
    null, '', '', null
  )
  ON CONFLICT (email) DO NOTHING;

  -- Orders Specialist
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at,
    phone, phone_change, phone_change_token, phone_change_sent_at
  ) VALUES (
    v_orders_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'orders@pjherbal.co.tz',
    crypt('OrdersTeam@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    jsonb_build_object('full_name', 'Hassan Ally', 'role', 'sales_staff'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false,
    '', null, '', null, '', '', null, '', 0, '', null,
    null, '', '', null
  )
  ON CONFLICT (email) DO NOTHING;

  -- Marketing Manager
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at,
    phone, phone_change, phone_change_token, phone_change_sent_at
  ) VALUES (
    v_marketing_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'marketing@pjherbal.co.tz',
    crypt('Marketing@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    jsonb_build_object('full_name', 'Fatuma Rashid', 'role', 'marketing_manager'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false,
    '', null, '', null, '', '', null, '', 0, '', null,
    null, '', '', null
  )
  ON CONFLICT (email) DO NOTHING;

  -- Customer Support
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at,
    phone, phone_change, phone_change_token, phone_change_sent_at
  ) VALUES (
    v_support_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'support@pjherbal.co.tz',
    crypt('Support@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    jsonb_build_object('full_name', 'Baraka Msigwa', 'role', 'customer_support'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false,
    '', null, '', null, '', '', null, '', 0, '', null,
    null, '', '', null
  )
  ON CONFLICT (email) DO NOTHING;

  -- --------------------------------------------------------
  -- 2. Link auth_user_id back to admin_users rows
  --    Use the actual id from auth.users (handles ON CONFLICT case
  --    where the row already existed with a different UUID)
  -- --------------------------------------------------------

  UPDATE public.admin_users
  SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@pjherbal.co.tz' LIMIT 1),
      updated_at   = now()
  WHERE email = 'superadmin@pjherbal.co.tz'
    AND auth_user_id IS NULL;

  UPDATE public.admin_users
  SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'inventory@pjherbal.co.tz' LIMIT 1),
      updated_at   = now()
  WHERE email = 'inventory@pjherbal.co.tz'
    AND auth_user_id IS NULL;

  UPDATE public.admin_users
  SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'orders@pjherbal.co.tz' LIMIT 1),
      updated_at   = now()
  WHERE email = 'orders@pjherbal.co.tz'
    AND auth_user_id IS NULL;

  UPDATE public.admin_users
  SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'marketing@pjherbal.co.tz' LIMIT 1),
      updated_at   = now()
  WHERE email = 'marketing@pjherbal.co.tz'
    AND auth_user_id IS NULL;

  UPDATE public.admin_users
  SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'support@pjherbal.co.tz' LIMIT 1),
      updated_at   = now()
  WHERE email = 'support@pjherbal.co.tz'
    AND auth_user_id IS NULL;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Admin auth account creation failed: %', SQLERRM;
END $$;
