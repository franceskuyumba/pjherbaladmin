'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Truck, CreditCard, Loader2, CheckCircle, AlertCircle, Leaf, User, Phone, MapPin, FileText, Shield, ChevronRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  imageUrl: string;
  category: string;
}

interface AppliedPromo {
  valid: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  code?: string;
}

const TANZANIA_REGIONS = [
  'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro',
  'Tanga', 'Zanzibar', 'Pwani', 'Kilimanjaro', 'Kagera', 'Kigoma',
  'Shinyanga', 'Tabora', 'Lindi', 'Mtwara', 'Ruvuma', 'Iringa',
  'Singida', 'Rukwa', 'Katavi', 'Njombe', 'Simiyu', 'Geita', 'Songwe'
];

const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash Payment',
    sub: 'Pay on delivery or at branch',
    icon: '💵',
    active: true,
    description: 'Your order will be placed with PENDING status. Our team will contact you to confirm delivery and collect payment.',
  },
  { id: 'mpesa', label: 'M-Pesa', sub: 'Coming Soon', icon: '📱', active: false },
  { id: 'mixx', label: 'Mixx by Yas', sub: 'Coming Soon', icon: '💳', active: false },
  { id: 'halopesa', label: 'HaloPesa', sub: 'Coming Soon', icon: '📲', active: false },
  { id: 'airtel', label: 'Airtel Money', sub: 'Coming Soon', icon: '📡', active: false },
  { id: 'nmb', label: 'NMB Bank', sub: 'Coming Soon', icon: '🏦', active: false },
  { id: 'crdb', label: 'CRDB Bank', sub: 'Coming Soon', icon: '🏛️', active: false },
];

const STEPS = ['Cart', 'Details', 'Payment', 'Confirm'];

function generateOrderId() {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `PJH-${num}`;
}

export default function CheckoutPage() {
  const supabase = createClient();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [step, setStep] = useState(1); // 1=Details, 2=Payment, 3=Review
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    region: 'Dar es Salaam', district: '', address: '', notes: '',
  });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      setCart(stored);
      const savedPromo = sessionStorage.getItem('pjherbal_promo');
      if (savedPromo) setAppliedPromo(JSON.parse(savedPromo));
    } catch {}
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const discount = appliedPromo?.valid
    ? appliedPromo.discountType === 'percentage'
      ? Math.round(subtotal * (appliedPromo.discountValue! / 100))
      : appliedPromo.discountValue!
    : 0;
  const total = Math.max(0, subtotal - discount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) { setError('Full name is required.'); return false; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return false; }
    if (form.phone.trim().length < 9) { setError('Please enter a valid phone number.'); return false; }
    if (!form.district.trim()) { setError('District is required.'); return false; }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    setStep(s => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { setError('Your cart is empty.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const orderId = generateOrderId();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          customer: form.fullName,
          phone: form.phone,
          email: form.email || null,
          region: form.region,
          district: form.district,
          address: form.address || null,
          subtotal,
          delivery_fee: 0,
          total,
          payment_method: 'M-Pesa', // DB enum default; cash is tracked via payment_status
          payment_ref: paymentMethod === 'cash' ? 'CASH_PENDING' : null,
          order_status: 'Pending',
          payment_status: 'pending',
          notes: form.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const items = cart.map(item => ({
        order_id: order.id,
        product_name: item.name,
        category: item.category,
        quantity: item.quantity || 1,
        unit_price: item.price,
        total: item.price * (item.quantity || 1),
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;

      // Increment promo code usage if applied
      if (appliedPromo?.valid && appliedPromo.code) {
        await supabase.rpc('increment_promo_usage', { promo_code: appliedPromo.code }).catch(() => {});
      }

      // Clear cart and promo
      localStorage.removeItem('pjherbal_cart');
      sessionStorage.removeItem('pjherbal_promo');

      router.push(`/order-success?order=${orderId}&total=${total}&method=${paymentMethod}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center gap-4 px-4">
        <Leaf size={48} className="text-[#ccc]" />
        <p className="text-lg font-semibold text-[#444]">Your cart is empty</p>
        <Link href="/shop" className="px-6 py-3 bg-[#1b4d3e] text-white rounded-xl font-semibold text-sm">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/cart')} className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium hidden sm:inline">{step > 1 ? 'Back' : 'Back to Cart'}</span>
          </button>
          <Link href="/"><AppLogo size={28} /></Link>
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#4e9f3d]" />
            <span className="text-xs text-[#888] hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-[#e8e4dc] px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < step + 1;
              const isCurrent = stepNum === step + 1;
              const isLast = i === STEPS.length - 1;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted ? 'bg-[#1b4d3e] text-white' : isCurrent ? 'bg-[#1b4d3e] text-white ring-2 ring-[#1b4d3e]/30' : 'bg-[#f0f0f0] text-[#aaa]'
                    }`}>
                      {isCompleted ? <CheckCircle size={14} /> : stepNum}
                    </div>
                    <span className={`text-[9px] font-semibold ${isCurrent ? 'text-[#1b4d3e]' : isCompleted ? 'text-[#4e9f3d]' : 'text-[#aaa]'}`}>{s}</span>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 w-8 sm:w-16 mx-1 mb-4 transition-all ${isCompleted ? 'bg-[#1b4d3e]' : 'bg-[#e0e0e0]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Steps */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Delivery Details */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
                <h2 className="text-base font-bold text-[#222] mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#1b4d3e]" /> Delivery Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#444] mb-1">Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g. Amina Juma" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#444] mb-1">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+255 7XX XXX XXX" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#444] mb-1">Email (Optional)</label>
                    <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="your@email.com" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#444] mb-1">Region *</label>
                    <select name="region" value={form.region} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] bg-white">
                      {TANZANIA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#444] mb-1">District *</label>
                    <input name="district" value={form.district} onChange={handleChange} required placeholder="e.g. Segerea, Kinondoni" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#444] mb-1">Street Address (Optional)</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Street, house number, landmark" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#444] mb-1">Order Notes (Optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any special instructions for delivery…" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
                <h2 className="text-base font-bold text-[#222] mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-[#1b4d3e]" /> Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => method.active && setPaymentMethod(method.id)}
                      disabled={!method.active}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        !method.active
                          ? 'border-[#f0f0f0] bg-[#fafafa] opacity-60 cursor-not-allowed'
                          : paymentMethod === method.id
                          ? 'border-[#1b4d3e] bg-[#f0f7f4]'
                          : 'border-[#e8e4dc] hover:border-[#1b4d3e]/40'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#222]">{method.label}</p>
                        <p className={`text-[10px] ${method.active ? 'text-[#888]' : 'text-[#bbb]'}`}>{method.sub}</p>
                      </div>
                      {method.active && paymentMethod === method.id && (
                        <CheckCircle size={16} className="text-[#1b4d3e] flex-shrink-0" />
                      )}
                      {!method.active && (
                        <span className="flex-shrink-0 text-[9px] font-bold text-[#bbb] bg-[#f0f0f0] px-1.5 py-0.5 rounded-full">Soon</span>
                      )}
                    </button>
                  ))}
                </div>
                {paymentMethod === 'cash' && (
                  <div className="mt-4 p-3.5 bg-[#f0f7f4] border border-[#c8e6c9] rounded-xl">
                    <p className="text-xs text-[#1b4d3e] font-medium leading-relaxed">
                      💵 <strong>Cash Payment:</strong> Your order will be placed with PENDING status. Our team will contact you within 24 hours to confirm delivery details and collect payment on delivery or at our Segerea Branch.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
                <h2 className="text-base font-bold text-[#222] mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-[#1b4d3e]" /> Review Your Order
                </h2>
                {/* Delivery Summary */}
                <div className="p-3.5 bg-[#f9f8f6] rounded-xl border border-[#e8e4dc] mb-4">
                  <p className="text-xs font-bold text-[#444] mb-2 flex items-center gap-1.5"><MapPin size={12} /> Delivery To</p>
                  <p className="text-sm font-semibold text-[#222]">{form.fullName}</p>
                  <p className="text-xs text-[#666] mt-0.5">{form.phone}{form.email ? ` · ${form.email}` : ''}</p>
                  <p className="text-xs text-[#666] mt-0.5">{form.district}, {form.region}{form.address ? ` · ${form.address}` : ''}</p>
                  {form.notes && <p className="text-xs text-[#888] mt-1 italic">Note: {form.notes}</p>}
                  <button onClick={() => setStep(1)} className="text-[10px] text-[#1b4d3e] font-semibold mt-2 hover:underline">Edit</button>
                </div>
                {/* Payment Summary */}
                <div className="p-3.5 bg-[#f9f8f6] rounded-xl border border-[#e8e4dc] mb-4">
                  <p className="text-xs font-bold text-[#444] mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Payment</p>
                  <p className="text-sm font-semibold text-[#222]">
                    {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                  </p>
                  <button onClick={() => setStep(2)} className="text-[10px] text-[#1b4d3e] font-semibold mt-1 hover:underline">Change</button>
                </div>
                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-[#444] mb-2">Items ({cartCount})</p>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-[#555] truncate flex-1">{item.name} × {item.quantity || 1}</span>
                        <span className="font-semibold text-[#222] font-tabular ml-2">TZS {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-[#e0e0e0] text-sm font-semibold text-[#555] hover:bg-[#f9f8f6] transition-colors"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3 rounded-xl bg-[#1b4d3e] text-white text-sm font-bold hover:bg-[#163d30] transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#1b4d3e] text-white text-sm font-bold hover:bg-[#163d30] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Placing Order…</>
                  ) : (
                    <><CheckCircle size={15} /> Place Order</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-[#e8e4dc] p-5 sticky top-20">
              <h2 className="text-sm font-bold text-[#222] mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Leaf size={14} className="text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#222] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#888]">× {item.quantity || 1}</p>
                    </div>
                    <span className="text-xs font-bold text-[#222] font-tabular flex-shrink-0">TZS {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e8e4dc] pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="font-semibold font-tabular">TZS {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4e9f3d]">Discount</span>
                    <span className="font-bold text-[#4e9f3d] font-tabular">− TZS {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Delivery</span>
                  <span className="font-bold text-[#4e9f3d]">FREE</span>
                </div>
                <div className="border-t border-[#e8e4dc] pt-2 flex justify-between">
                  <span className="text-sm font-bold text-[#222]">Total</span>
                  <span className="text-base font-bold text-[#1b4d3e] font-tabular">TZS {total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 p-2.5 bg-[#f0f7f4] rounded-lg flex items-center gap-2">
                <Truck size={13} className="text-[#1b4d3e]" />
                <span className="text-[10px] font-medium text-[#1b4d3e]">Free delivery across Tanzania</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}
