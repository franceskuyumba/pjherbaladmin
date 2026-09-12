'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, X, ChevronDown, ExternalLink, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminTopbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 'notif-1', type: 'order', message: 'New order #PJH-2847 from Amina Juma', time: '2 min ago', unread: true },
    { id: 'notif-2', type: 'stock', message: 'Moringa Plus capsules — only 4 units left', time: '18 min ago', unread: true },
    { id: 'notif-3', type: 'payment', message: 'M-Pesa payment confirmed for #PJH-2845', time: '1 hr ago', unread: true },
    { id: 'notif-4', type: 'order', message: 'Order #PJH-2843 delivered to Kinondoni', time: '3 hr ago', unread: false },
    { id: 'notif-5', type: 'stock', message: 'SlimFit Tea — only 6 units left', time: '5 hr ago', unread: false },
  ];

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  return (
    <header className="bg-card border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between flex-shrink-0 z-30">
      {/* Left: Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">PJHERBAL</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">Admin</span>
        </div>
      </div>
      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, products, customers… (⌘K)"
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all duration-150"
          />
        </div>
      </div>
      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Mobile search */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search size={18} />
        </button>

        {/* View Storefront */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary-light border border-border transition-all duration-150"
        >
          <ExternalLink size={13} />
          Storefront
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-modal z-50 scale-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications?.map((n) => (
                  <div
                    key={n?.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors duration-150 cursor-pointer ${n?.unread ? 'bg-primary-light/30' : ''}`}
                  >
                    <p className="text-xs font-medium text-foreground leading-snug">{n?.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n?.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-xs font-medium text-primary hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-muted transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-full gradient-emerald flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">SA</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-modal z-50 scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Super Admin</p>
                <p className="text-xs text-muted-foreground">admin@pjherbal.co.tz</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-150">
                  <User size={14} className="text-muted-foreground" />
                  My Profile
                </button>
                <Link href="/admin/settings" className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-150">
                  <Settings size={14} className="text-muted-foreground" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <Link href="/admin-login" className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                  <LogOut size={14} />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border px-4 py-3 z-40 md:hidden fade-in">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders, products, customers…"
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-muted border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}