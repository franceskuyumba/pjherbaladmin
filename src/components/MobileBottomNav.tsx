'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Grid3X3, ShoppingCart, User } from 'lucide-react';

interface MobileBottomNavProps {
  cartCount?: number;
}

export default function MobileBottomNav({ cartCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/overview-dashboard') || pathname.startsWith('/orders-management')) {
    return null;
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: '/shop?view=categories', icon: Grid3X3, label: 'Categories' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/customer-dashboard', icon: User, label: 'Account' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#e8e4dc] shadow-[0_-2px_12px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5 h-16">
          {navItems.map(({ href, icon: NavIcon, label, badge }) => {
            const active = isActive(href);
            const IconComponent = NavIcon as React.ElementType;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors touch-manipulation ${
                  active ? 'text-[#1b4d3e]' : 'text-[#999] hover:text-[#1b4d3e]'
                }`}
              >
                <div className="relative">
                  <IconComponent size={21} strokeWidth={active ? 2.5 : 1.8} />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-[#1b4d3e] text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#1b4d3e]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
