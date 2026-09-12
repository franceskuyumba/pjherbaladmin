-- ============================================================
-- PJHERBAL CLINIC: Fix admin auth — insert auth.users + auth.identities
-- Root cause: Previous migration inserted auth.users but NOT auth.identities.
-- Supabase signInWithPassword requires a matching row in auth.identities
-- for email/password authentication to succeed.
-- ============================================================

DO $$
DECLARE
  v_super_admin_id   UUID;
  v_inventory_id     UUID;
  v_orders_id        UUID;
  v_marketing_id     UUID;
  v_support_id       UUID;
BEGIN

  -- --------------------------------------------------------
  -- Helper: resolve or create UUID for each admin email
  -- If auth.users row already exists (from failed prior migration),
  -- reuse its id; otherwise generate a fresh one.
  -- --------------------------------------------------------

  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'superadmin@pjherbal.co.tz' LIMIT 1),
    gen_random_uuid()
  ) INTO v_super_admin_id;

  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'inventory@pjherbal.co.tz' LIMIT 1),
    gen_random_uuid()
  ) INTO v_inventory_id;

  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'orders@pjherbal.co.tz' LIMIT 1),
    gen_random_uuid()
  ) INTO v_orders_id;

  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'marketing@pjherbal.co.tz' LIMIT 1),
    gen_random_uuid()
  ) INTO v_marketing_id;

  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'support@pjherbal.co.tz' LIMIT 1),
    gen_random_uuid()
  ) INTO v_support_id;

  -- --------------------------------------------------------
  -- 1. Insert auth.users rows (one at a time to avoid ON CONFLICT issues)
  --    Update password/metadata if row already exists.
  -- --------------------------------------------------------

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    phone, phone_change, phone_change_token
  )
  SELECT
    v_super_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'superadmin@pjherbal.co.tz',
    crypt('PJHerbal@2026!', gen_salt('bf', 10)),
    now(), now(), now(),
    '{"full_name":"Dr. Peter Juma","role":"super_admin"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, false,
    '', '', '', '', '', 0, '',
    null, '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@pjherbal.co.tz');

  UPDATE auth.users
  SET encrypted_password = crypt('PJHerbal@2026!', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now(),
      raw_user_meta_data = '{"full_name":"Dr. Peter Juma","role":"super_admin"}'::jsonb,
      raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb
  WHERE email = 'superadmin@pjherbal.co.tz';

  -- inventory
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    phone, phone_change, phone_change_token
  )
  SELECT
    v_inventory_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'inventory@pjherbal.co.tz',
    crypt('StockMgr@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    '{"full_name":"Grace Mwamba","role":"inventory_manager"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, false,
    '', '', '', '', '', 0, '',
    null, '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'inventory@pjherbal.co.tz');

  UPDATE auth.users
  SET encrypted_password = crypt('StockMgr@2026', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now(),
      raw_user_meta_data = '{"full_name":"Grace Mwamba","role":"inventory_manager"}'::jsonb,
      raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb
  WHERE email = 'inventory@pjherbal.co.tz';

  -- orders
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    phone, phone_change, phone_change_token
  )
  SELECT
    v_orders_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'orders@pjherbal.co.tz',
    crypt('OrdersTeam@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    '{"full_name":"Hassan Ally","role":"sales_staff"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, false,
    '', '', '', '', '', 0, '',
    null, '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'orders@pjherbal.co.tz');

  UPDATE auth.users
  SET encrypted_password = crypt('OrdersTeam@2026', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now(),
      raw_user_meta_data = '{"full_name":"Hassan Ally","role":"sales_staff"}'::jsonb,
      raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb
  WHERE email = 'orders@pjherbal.co.tz';

  -- marketing
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    phone, phone_change, phone_change_token
  )
  SELECT
    v_marketing_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'marketing@pjherbal.co.tz',
    crypt('Marketing@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    '{"full_name":"Fatuma Rashid","role":"marketing_manager"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, false,
    '', '', '', '', '', 0, '',
    null, '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marketing@pjherbal.co.tz');

  UPDATE auth.users
  SET encrypted_password = crypt('Marketing@2026', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now(),
      raw_user_meta_data = '{"full_name":"Fatuma Rashid","role":"marketing_manager"}'::jsonb,
      raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb
  WHERE email = 'marketing@pjherbal.co.tz';

  -- support
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    phone, phone_change, phone_change_token
  )
  SELECT
    v_support_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'support@pjherbal.co.tz',
    crypt('Support@2026', gen_salt('bf', 10)),
    now(), now(), now(),
    '{"full_name":"Baraka Msigwa","role":"customer_support"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, false,
    '', '', '', '', '', 0, '',
    null, '', ''
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'support@pjherbal.co.tz');

  UPDATE auth.users
  SET encrypted_password = crypt('Support@2026', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now(),
      raw_user_meta_data = '{"full_name":"Baraka Msigwa","role":"customer_support"}'::jsonb,
      raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb
  WHERE email = 'support@pjherbal.co.tz';

  -- --------------------------------------------------------
  -- 2. Insert auth.identities rows (CRITICAL — missing in prior migration)
  --    Without these rows, signInWithPassword always returns "Invalid credentials"
  -- --------------------------------------------------------

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    v_super_admin_id,
    'superadmin@pjherbal.co.tz',
    'email',
    jsonb_build_object('sub', v_super_admin_id::text, 'email', 'superadmin@pjherbal.co.tz', 'email_verified', true, 'provider', 'email'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider = 'email' AND provider_id = 'superadmin@pjherbal.co.tz'
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    v_inventory_id,
    'inventory@pjherbal.co.tz',
    'email',
    jsonb_build_object('sub', v_inventory_id::text, 'email', 'inventory@pjherbal.co.tz', 'email_verified', true, 'provider', 'email'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider = 'email' AND provider_id = 'inventory@pjherbal.co.tz'
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    v_orders_id,
    'orders@pjherbal.co.tz',
    'email',
    jsonb_build_object('sub', v_orders_id::text, 'email', 'orders@pjherbal.co.tz', 'email_verified', true, 'provider', 'email'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider = 'email' AND provider_id = 'orders@pjherbal.co.tz'
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    v_marketing_id,
    'marketing@pjherbal.co.tz',
    'email',
    jsonb_build_object('sub', v_marketing_id::text, 'email', 'marketing@pjherbal.co.tz', 'email_verified', true, 'provider', 'email'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider = 'email' AND provider_id = 'marketing@pjherbal.co.tz'
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    v_support_id,
    'support@pjherbal.co.tz',
    'email',
    jsonb_build_object('sub', v_support_id::text, 'email', 'support@pjherbal.co.tz', 'email_verified', true, 'provider', 'email'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider = 'email' AND provider_id = 'support@pjherbal.co.tz'
  );

  -- --------------------------------------------------------
  -- 3. Link auth_user_id back to admin_users rows
  -- --------------------------------------------------------

  UPDATE public.admin_users
  SET auth_user_id = v_super_admin_id, updated_at = now()
  WHERE email = 'superadmin@pjherbal.co.tz';

  UPDATE public.admin_users
  SET auth_user_id = v_inventory_id, updated_at = now()
  WHERE email = 'inventory@pjherbal.co.tz';

  UPDATE public.admin_users
  SET auth_user_id = v_orders_id, updated_at = now()
  WHERE email = 'orders@pjherbal.co.tz';

  UPDATE public.admin_users
  SET auth_user_id = v_marketing_id, updated_at = now()
  WHERE email = 'marketing@pjherbal.co.tz';

  UPDATE public.admin_users
  SET auth_user_id = v_support_id, updated_at = now()
  WHERE email = 'support@pjherbal.co.tz';

  RAISE NOTICE 'Admin auth accounts created/updated successfully.';
  RAISE NOTICE 'Super Admin id: %', v_super_admin_id;
  RAISE NOTICE 'Inventory id:   %', v_inventory_id;
  RAISE NOTICE 'Orders id:      %', v_orders_id;
  RAISE NOTICE 'Marketing id:   %', v_marketing_id;
  RAISE NOTICE 'Support id:     %', v_support_id;

END $$;
