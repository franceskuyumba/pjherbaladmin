'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Truck, MessageCircle, Leaf, Tag, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  imageUrl: string;
  category: string;
}

interface PromoResult {
  valid: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  message?: string;
  code?: string;
}

export default function CartPage() {
  const supabase = createClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoResult | null>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      setCart(stored);
    } catch {}
    // Restore applied promo from session
    try {
      const savedPromo = sessionStorage.getItem('pjherbal_promo');
      if (savedPromo) setAppliedPromo(JSON.parse(savedPromo));
    } catch {}
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('pjherbal_cart', JSON.stringify(newCart));
  };

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedPromo(null);
    sessionStorage.removeItem('pjherbal_promo');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const discount = appliedPromo?.valid
    ? appliedPromo.discountType === 'percentage'
      ? Math.round(subtotal * (appliedPromo.discountValue! / 100))
      : appliedPromo.discountValue!
    : 0;

  const total = Math.max(0, subtotal - discount);

  const applyPromo = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponError('Invalid or expired coupon code.');
        setAppliedPromo(null);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError('This coupon has expired.');
        setAppliedPromo(null);
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        setCouponError('This coupon has reached its usage limit.');
        setAppliedPromo(null);
        return;
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        setCouponError(`Minimum order of TZS ${data.min_order_amount.toLocaleString()} required for this coupon.`);
        setAppliedPromo(null);
        return;
      }

      const promo: PromoResult = {
        valid: true,
        discountType: data.discount_type as 'percentage' | 'fixed',
        discountValue: data.discount_value,
        code: data.code,
        message: `Coupon "${data.code}" applied!`,
      };
      setAppliedPromo(promo);
      sessionStorage.setItem('pjherbal_promo', JSON.stringify(promo));
      setCouponInput('');
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    sessionStorage.removeItem('pjherbal_promo');
    setCouponError('');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/shop" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Continue Shopping</span>
          </Link>
          <Link href="/"><AppLogo size={28} /></Link>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#222]">
            <ShoppingCart size={18} />
            <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-[#222]">Your Cart</h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-[#f0f7f4] flex items-center justify-center">
              <ShoppingCart size={36} className="text-[#1b4d3e]/40" />
            </div>
            <p className="text-lg font-semibold text-[#444]">Your cart is empty</p>
            <p className="text-sm text-[#888]">Add some herbal products to get started</p>
            <Link href="/shop" className="px-6 py-3 bg-[#1b4d3e] text-white rounded-xl font-semibold text-sm hover:bg-[#163d30] transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-[#e8e4dc] p-4 flex gap-4">
                  <Link href={`/product/${item.slug}`} className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <Leaf size={24} className="text-white/50" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="text-sm font-bold text-[#222] hover:text-[#1b4d3e] transition-colors line-clamp-2">{item.name}</Link>
                    <p className="text-[10px] text-[#888] mt-0.5">{item.category}</p>
                    <p className="text-sm font-bold text-[#1b4d3e] mt-1 font-tabular">TZS {item.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#e0e0e0] rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="px-2.5 py-1.5 hover:bg-[#f0f0f0] transition-colors">
                          <Minus size={12} className="text-[#555]" />
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-[#222] border-x border-[#e0e0e0]">{item.quantity || 1}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-2.5 py-1.5 hover:bg-[#f0f0f0] transition-colors">
                          <Plus size={12} className="text-[#555]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#222] font-tabular">TZS {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#ccc] hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Coupon Code */}
              <div className="bg-white rounded-xl border border-[#e8e4dc] p-4">
                <h3 className="text-sm font-bold text-[#222] mb-3 flex items-center gap-2">
                  <Tag size={14} className="text-[#1b4d3e]" /> Coupon Code
                </h3>
                {appliedPromo?.valid ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#f0f7f4] border border-[#c8e6c9] rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-[#4e9f3d]" />
                      <div>
                        <p className="text-xs font-bold text-[#1b4d3e]">{appliedPromo.code}</p>
                        <p className="text-[10px] text-[#4e9f3d]">
                          {appliedPromo.discountType === 'percentage'
                            ? `${appliedPromo.discountValue}% off`
                            : `TZS ${appliedPromo.discountValue?.toLocaleString()} off`}
                        </p>
                      </div>
                    </div>
                    <button onClick={removePromo} className="p-1 rounded hover:bg-red-50 text-[#aaa] hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] uppercase"
                      />
                      <button
                        onClick={applyPromo}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-3 py-2 bg-[#1b4d3e] text-white rounded-lg text-xs font-bold hover:bg-[#163d30] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {couponLoading ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-600">
                        <AlertCircle size={11} /> {couponError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
                <h2 className="text-base font-bold text-[#222] mb-4">Order Summary</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-[#222] font-tabular">TZS {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4e9f3d]">Discount ({appliedPromo?.code})</span>
                      <span className="font-bold text-[#4e9f3d] font-tabular">− TZS {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Delivery</span>
                    <span className="font-bold text-[#4e9f3d]">FREE</span>
                  </div>
                  <div className="border-t border-[#e8e4dc] pt-2.5 flex justify-between">
                    <span className="font-bold text-[#222]">Total</span>
                    <span className="font-bold text-[#1b4d3e] text-lg font-tabular">TZS {total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 p-2.5 bg-[#f0f7f4] rounded-lg flex items-center gap-2">
                  <Truck size={14} className="text-[#1b4d3e]" />
                  <span className="text-xs font-medium text-[#1b4d3e]">Free delivery across all Tanzania</span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-4 w-full py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm text-center block hover:bg-[#163d30] transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <a
                  href={`https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20want%20to%20order:%0A${cart.map(i => `- ${i.name} x${i.quantity || 1} (TZS ${(i.price * (i.quantity || 1)).toLocaleString()})`).join('%0A')}%0ATotal:%20TZS%20${total.toLocaleString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle size={15} /> Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}
