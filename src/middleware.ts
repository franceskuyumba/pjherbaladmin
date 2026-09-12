import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

// Admin routes that require authentication
const ADMIN_ROUTES = [
  '/overview-dashboard',
  '/orders-management',
  '/admin/products',
  '/admin/customers',
  '/admin/marketing',
  '/admin/settings',
  '/admin/blog',
  '/admin/inventory',
];

// Routes that are publicly accessible (no auth required)
const PUBLIC_ROUTES = [
  '/admin-login', '/admin/login', '/shop', '/auth',
  '/login', '/register', '/forgot-password',
  '/product', '/cart', '/checkout', '/order-success',
  '/about', '/contact', '/blog', '/privacy-policy', '/terms',
];

// Role-based access control: which roles can access which route prefixes
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    '/overview-dashboard', '/orders-management', '/admin/products',
    '/admin/customers', '/admin/marketing', '/admin/settings',
    '/admin/blog', '/admin/inventory',
  ],
  inventory_manager: ['/admin/products', '/admin/inventory', '/overview-dashboard'],
  orders_specialist: ['/orders-management', '/overview-dashboard'],
  marketing_manager: ['/admin/marketing', '/admin/blog', '/overview-dashboard'],
  customer_support: ['/admin/customers', '/orders-management', '/overview-dashboard'],
};

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function hasRoleAccess(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export async function middleware(request: NextRequest) {
  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Redirect /admin to /overview-dashboard (admin home)
  if (pathname === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/overview-dashboard';
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes — redirect unauthenticated users to /admin-login
  if (isAdminRoute(pathname) && !isPublicRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin-login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC: check role from user metadata or admin_users table
    const role = user.user_metadata?.role as string | undefined;
    if (role && !hasRoleAccess(role, pathname)) {
      // Redirect to dashboard with insufficient permissions
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/overview-dashboard';
      dashboardUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // If authenticated user visits admin login page, redirect to dashboard
  if ((pathname === '/admin-login' || pathname === '/admin/login') && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/overview-dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
