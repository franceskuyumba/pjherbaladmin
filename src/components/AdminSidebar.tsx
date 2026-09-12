'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  BadgeAlert,
  FileText,
  Boxes,
  Monitor,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';


interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navGroups = [
  {
    label: 'Core',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', href: '/overview-dashboard', icon: LayoutDashboard },
      { id: 'nav-orders', label: 'Orders', href: '/orders-management', icon: ShoppingCart, badge: 8 },
      { id: 'nav-products', label: 'Products', href: '/admin/products', icon: Package, badge: 3 },
      { id: 'nav-inventory', label: 'Inventory', href: '/admin/inventory', icon: Boxes },
      { id: 'nav-pos', label: 'POS', href: '/admin/pos', icon: Monitor },
    ],
  },
  {
    label: 'CRM',
    items: [
      { id: 'nav-customers', label: 'Customers', href: '/admin/customers', icon: Users },
      { id: 'nav-marketing', label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
      { id: 'nav-blog', label: 'Blog', href: '/admin/blog', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'nav-settings', label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  currentPath?: string;
}

export default function AdminSidebar({ currentPath = '/' }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin-login');
    } catch {
      router.push('/admin-login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/overview-dashboard' && currentPath === '/') return true;
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const userEmail = user?.email || 'admin@pjherbal.co.tz';
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={36} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight truncate">PJHerbal</p>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight truncate">Segerea Branch</p>
          </div>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed ? 'justify-center px-2' : ''} relative group`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-accent-light text-accent'}`}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                        {item.label}
                        {item.badge && <span className="ml-1 text-accent">({item.badge})</span>}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Low Stock Alert */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <BadgeAlert size={14} className="text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-700">Low Stock Alert</p>
              <p className="text-[10px] text-red-500 truncate">Check /admin/products</p>
            </div>
          </div>
        </div>
      )}

      {/* View Storefront */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary-light transition-all duration-150"
          >
            <ExternalLink size={14} />
            View Storefront
          </Link>
        </div>
      )}

      {/* User + Collapse */}
      <div className={`border-t border-border px-3 py-3 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {!collapsed && (
          <>
            <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors duration-150"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border sidebar-transition flex-shrink-0 shadow-sidebar ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ willChange: 'width' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 lg:hidden sidebar-transition flex flex-col shadow-modal ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}