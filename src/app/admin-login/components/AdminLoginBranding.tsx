import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { ShieldCheck, Package, Users, TrendingUp } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const features = [
  { id: 'feat-orders', icon: Package, label: 'Orders Management', desc: 'Process Cash, M-Pesa & bank orders in real-time' },
  { id: 'feat-inventory', icon: ShieldCheck, label: 'Inventory Control', desc: 'Track stock levels and get low-stock alerts instantly' },
  { id: 'feat-customers', icon: Users, label: 'Customer CRM', desc: 'Manage customers and send WhatsApp campaigns' },
  { id: 'feat-analytics', icon: TrendingUp, label: 'Sales Analytics', desc: 'Monitor TZS revenue trends and category performance' },
];

export default function AdminLoginBranding() {
  return (
    <div className="hidden lg:flex flex-col gradient-emerald w-[480px] xl:w-[520px] 2xl:w-[560px] flex-shrink-0 p-10 xl:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 blob-gold pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 blob-emerald pointer-events-none opacity-50" />
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 relative z-10">
        <AppLogo size={48} />
        <div>
          <p className="text-base font-extrabold text-white leading-tight tracking-wide">PJHERBAL CLINIC</p>
          <p className="text-xs text-[#d4af37] font-semibold leading-tight tracking-widest uppercase">Natural Care · Better Life</p>
          <p className="text-[10px] text-white/60 mt-0.5">Segerea Branch · Admin Portal</p>
        </div>
      </div>
      {/* Headline */}
      <div className="mb-10 relative z-10">
        <h1 className="text-3xl xl:text-4xl font-extrabold text-primary-foreground leading-tight mb-3">
          Manage your herbal clinic from one dashboard
        </h1>
        <p className="text-sm text-primary-foreground/70 leading-relaxed">
          Complete control over orders, inventory, customers, and marketing — optimised for Tanzania's mobile-first market.
        </p>
      </div>
      {/* Feature list */}
      <div className="space-y-4 relative z-10">
        {features?.map((f) => {
          const Icon = f?.icon;
          return (
            <div key={f?.id} className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary-foreground/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={18} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{f?.label}</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5 leading-relaxed">{f?.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="mt-auto pt-8 relative z-10">
        <p className="text-xs text-primary-foreground/40">
          © 2026 PJHERBAL CLINIC – Segerea Branch. All rights reserved.
        </p>
      </div>
    </div>
  );
}