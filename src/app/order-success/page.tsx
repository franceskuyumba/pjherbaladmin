'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Phone, MessageCircle, ArrowRight, Truck, Loader2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order') || 'PJH-XXXX';
  const total = parseInt(searchParams?.get('total') || '0', 10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
          <Link href="/"><AppLogo size={32} /></Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-[#f0f7f4] border-4 border-[#4e9f3d] flex items-center justify-center">
              <CheckCircle size={48} className="text-[#4e9f3d]" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#222]">Order Placed Successfully!</h1>
            <p className="text-[#888] text-sm mt-2">Thank you for your order. Our team will contact you shortly to confirm delivery.</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-[#e8e4dc] p-5 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888]">Order ID</span>
              <span className="text-sm font-bold text-[#1b4d3e]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888]">Total Amount</span>
              <span className="text-sm font-bold text-[#222] font-tabular">TZS {total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888]">Delivery Fee</span>
              <span className="text-sm font-bold text-[#4e9f3d]">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888]">Payment</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Cash on Delivery</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888]">Status</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pending Confirmation</span>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-[#f0f7f4] rounded-xl border border-[#c8e6c9] p-4 text-left">
            <p className="text-xs font-bold text-[#1b4d3e] mb-2 flex items-center gap-1.5">
              <Truck size={13} /> What happens next?
            </p>
            <ol className="space-y-1.5 text-xs text-[#555]">
              <li className="flex gap-2"><span className="font-bold text-[#1b4d3e]">1.</span> Our team reviews your order</li>
              <li className="flex gap-2"><span className="font-bold text-[#1b4d3e]">2.</span> We call you to confirm delivery details</li>
              <li className="flex gap-2"><span className="font-bold text-[#1b4d3e]">3.</span> Products are dispatched to your location</li>
              <li className="flex gap-2"><span className="font-bold text-[#1b4d3e]">4.</span> Pay cash on delivery — FREE across Tanzania</li>
            </ol>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20just%20placed%20order%20${orderId}.%20Please%20confirm%20my%20delivery.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle size={15} /> Confirm via WhatsApp
            </a>
            <a href="tel:+255763963644" className="w-full py-3 bg-white border border-[#e8e4dc] text-[#222] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#f9f8f6] transition-colors">
              <Phone size={15} /> Call Us: 0763 963 644
            </a>
          </div>

          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b4d3e] hover:underline">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1b4d3e]" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
