'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, LogOut, ShoppingBag, Phone, MessageCircle, ArrowRight, Loader2, Leaf, Heart, Download, RotateCcw, Copy, Check, Gift, X } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import Icon from '@/components/ui/AppIcon';


interface Order {
  id: string;
  order_id: string;
  total: number;
  order_status: string;
  created_at: string;
  payment_method: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  stock_count: number;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Paid: 'bg-blue-100 text-blue-700',
  Processing: 'bg-orange-100 text-orange-700',
  Dispatched: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

type ActiveTab = 'orders' | 'wishlist' | 'referral';

export default function CustomerDashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_id, total, order_status, created_at, payment_method')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(10);
      setOrders(data || []);
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'wishlist' || !user) return;
    const loadWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const slugs: string[] = JSON.parse(localStorage.getItem('pjherbal_wishlist') || '[]');
        if (slugs.length === 0) { setWishlistProducts([]); setLoadingWishlist(false); return; }
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, price, image_url, stock_count')
          .in('slug', slugs)
          .eq('is_active', true);
        setWishlistProducts(data || []);
      } catch {}
      setLoadingWishlist(false);
    };
    loadWishlist();
  }, [activeTab, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('id, product_name, quantity, unit_price, product_id')
        .eq('order_id', order.id);

      if (items && items.length > 0) {
        const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
        items.forEach((item: any) => {
          const existing = cart.findIndex((c: any) => c.id === item.product_id);
          if (existing >= 0) {
            cart[existing].quantity = (cart[existing].quantity || 1) + item.quantity;
          } else {
            cart.push({
              id: item.product_id,
              name: item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              slug: item.product_id,
              imageUrl: '',
              category: '',
            });
          }
        });
        localStorage.setItem('pjherbal_cart', JSON.stringify(cart));
        router.push('/cart');
      } else {
        router.push('/shop');
      }
    } catch {
      router.push('/shop');
    }
    setReorderingId(null);
  };

  const handleDownloadInvoice = async (order: Order) => {
    setDownloadingId(order.id);
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, unit_price')
        .eq('order_id', order.id);

      const orderDate = new Date(order.created_at).toLocaleDateString('en-TZ', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const rows = (items || []).map((item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">TZS ${Number(item.unit_price).toLocaleString()}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">TZS ${(item.quantity * item.unit_price).toLocaleString()}</td>
        </tr>`
      ).join('');

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${order.order_id}</title>
      <style>body{font-family:Arial,sans-serif;color:#222;margin:0;padding:24px;}
      .header{background:linear-gradient(135deg,#1b4d3e,#4e9f3d);color:white;padding:24px;border-radius:12px;margin-bottom:24px;}
      .header h1{margin:0;font-size:22px;} .header p{margin:4px 0;font-size:12px;opacity:.8;}
      .meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:13px;}
      .meta div{background:#f9f8f6;padding:12px 16px;border-radius:8px;flex:1;margin:0 4px;}
      .meta div:first-child{margin-left:0;} .meta div:last-child{margin-right:0;}
      .meta label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;}
      .meta p{margin:2px 0;font-weight:bold;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      thead{background:#1b4d3e;color:white;}
      thead th{padding:10px 12px;text-align:left;font-weight:600;}
      thead th:nth-child(2){text-align:center;} thead th:nth-child(3),thead th:nth-child(4){text-align:right;}
      .total-row{background:#f0f7f4;font-weight:bold;}
      .total-row td{padding:10px 12px;}
      .footer{margin-top:24px;text-align:center;font-size:11px;color:#888;}
      </style></head><body>
      <div class="header"><h1>PJHERBAL CLINIC</h1><p>Segerea Branch, Dar es Salaam, Tanzania</p><p>Tel: 0765 754 024 | 0763 963 644</p></div>
      <div class="meta">
        <div><label>Invoice No</label><p>${order.order_id}</p></div>
        <div><label>Date</label><p>${orderDate}</p></div>
        <div><label>Status</label><p>${order.order_status}</p></div>
        <div><label>Payment</label><p>${order.payment_method || 'N/A'}</p></div>
      </div>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row"><td colspan="3" style="text-align:right;padding:10px 12px;">TOTAL</td><td style="text-align:right;padding:10px 12px;">TZS ${order.total.toLocaleString()}</td></tr></tfoot>
      </table>
      <div class="footer"><p>Thank you for choosing PJHERBAL CLINIC. For support: wa.me/255763963644</p></div>
      </body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.order_id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setDownloadingId(null);
  };

  const removeFromWishlist = (slug: string) => {
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('pjherbal_wishlist') || '[]');
      const updated = wishlist.filter(s => s !== slug);
      localStorage.setItem('pjherbal_wishlist', JSON.stringify(updated));
      setWishlistProducts(prev => prev.filter(p => p.slug !== slug));
    } catch {}
  };

  const addWishlistToCart = (product: WishlistProduct) => {
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      const existing = cart.findIndex((i: any) => i.id === product.id);
      if (existing >= 0) {
        cart[existing].quantity = (cart[existing].quantity || 1) + 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, slug: product.slug, imageUrl: product.image_url, category: '' });
      }
      localStorage.setItem('pjherbal_cart', JSON.stringify(cart));
      router.push('/cart');
    } catch {}
  };

  const referralLink = user ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pjherbalad2363.builtwithrocket.new'}/register?ref=${user.id.slice(0, 8)}` : '';

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2500);
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1b4d3e]" />
      </div>
    );
  }

  if (!user) return null;

  const userEmail = user.email || '';
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0];
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><AppLogo size={30} /></Link>
          <h1 className="text-sm font-bold text-[#222]">My Account</h1>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-[#888] hover:text-red-600 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-[#1b4d3e] to-[#4e9f3d] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold">{initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">{userName}</h2>
              <p className="text-white/70 text-xs">{userEmail}</p>
              <p className="text-white/60 text-[10px] mt-0.5">PJHERBAL Member</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/shop" className="bg-white rounded-xl border border-[#e8e4dc] p-4 flex items-center gap-3 hover:border-[#1b4d3e]/30 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#f0f7f4] flex items-center justify-center">
              <ShoppingBag size={16} className="text-[#1b4d3e]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#222]">Shop</p>
              <p className="text-[10px] text-[#888]">Browse products</p>
            </div>
          </Link>
          <a
            href="https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20need%20support."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border border-[#e8e4dc] p-4 flex items-center gap-3 hover:border-[#25D366]/40 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f0fdf4] flex items-center justify-center">
              <MessageCircle size={16} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#222]">Support</p>
              <p className="text-[10px] text-[#888]">WhatsApp us</p>
            </div>
          </a>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#e8e4dc] overflow-hidden">
          <div className="flex border-b border-[#e8e4dc]">
            {[
              { key: 'orders', label: 'My Orders', icon: Package },
              { key: 'wishlist', label: 'Wishlist', icon: Heart },
              { key: 'referral', label: 'Refer & Earn', icon: Gift },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as ActiveTab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                  activeTab === key
                    ? 'text-[#1b4d3e] border-b-2 border-[#1b4d3e] bg-[#f0f7f4]'
                    : 'text-[#888] hover:text-[#555]'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader2 size={18} className="animate-spin text-[#1b4d3e]" />
                  <span className="text-xs text-[#888]">Loading orders…</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Leaf size={32} className="text-[#ccc]" />
                  <p className="text-sm font-semibold text-[#555]">No orders yet</p>
                  <Link href="/shop" className="text-xs text-[#1b4d3e] font-bold hover:underline flex items-center gap-1">
                    Start Shopping <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f0f0f0]">
                  {orders.map(order => (
                    <div key={order.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#222]">{order.order_id}</p>
                          <p className="text-[10px] text-[#888] mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#1b4d3e]">TZS {order.total.toLocaleString()}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0f7f4] text-[#1b4d3e] text-[10px] font-bold hover:bg-[#1b4d3e] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {reorderingId === order.id ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                          Reorder
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={downloadingId === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f9f8f6] border border-[#e8e4dc] text-[#555] text-[10px] font-bold hover:border-[#1b4d3e] hover:text-[#1b4d3e] transition-colors disabled:opacity-50"
                        >
                          {downloadingId === order.id ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <>
              {loadingWishlist ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader2 size={18} className="animate-spin text-[#1b4d3e]" />
                  <span className="text-xs text-[#888]">Loading wishlist…</span>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Heart size={32} className="text-[#ccc]" />
                  <p className="text-sm font-semibold text-[#555]">Your wishlist is empty</p>
                  <Link href="/shop" className="text-xs text-[#1b4d3e] font-bold hover:underline flex items-center gap-1">
                    Browse Products <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f0f0f0]">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="px-5 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Leaf size={16} className="text-white/60" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.slug}`} className="text-xs font-bold text-[#222] hover:text-[#1b4d3e] truncate block">{product.name}</Link>
                        <p className="text-xs text-[#1b4d3e] font-semibold mt-0.5">TZS {product.price.toLocaleString()}</p>
                        {product.stock_count === 0 && <p className="text-[9px] text-red-500 font-semibold">Out of Stock</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {product.stock_count > 0 && (
                          <button
                            onClick={() => addWishlistToCart(product)}
                            className="px-3 py-1.5 rounded-lg bg-[#1b4d3e] text-white text-[10px] font-bold hover:bg-[#4e9f3d] transition-colors"
                          >
                            Add to Cart
                          </button>
                        )}
                        <button
                          onClick={() => removeFromWishlist(product.slug)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#ccc] hover:text-red-500 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Referral Tab */}
          {activeTab === 'referral' && (
            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#f0f7f4] flex items-center justify-center mx-auto mb-3">
                  <Gift size={24} className="text-[#1b4d3e]" />
                </div>
                <h3 className="text-sm font-bold text-[#222]">Refer Friends & Earn</h3>
                <p className="text-xs text-[#888] mt-1">Share your unique link. When a friend registers and orders, you both benefit!</p>
              </div>

              <div className="bg-[#f0f7f4] border border-[#1b4d3e]/20 rounded-xl p-4">
                <p className="text-[10px] text-[#888] font-semibold uppercase tracking-wide mb-2">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[10px] text-[#1b4d3e] font-mono bg-white border border-[#e8e4dc] rounded-lg px-3 py-2 truncate">{referralLink}</p>
                  <button
                    onClick={copyReferral}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      referralCopied ? 'bg-green-500 text-white' : 'bg-[#1b4d3e] text-white hover:bg-[#4e9f3d]'
                    }`}
                  >
                    {referralCopied ? <Check size={11} /> : <Copy size={11} />}
                    {referralCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Share Link', desc: 'Send to friends', step: '1' },
                  { label: 'Friend Registers', desc: 'They sign up', step: '2' },
                  { label: 'Both Benefit', desc: 'Discount on next order', step: '3' },
                ].map(({ label, desc, step }) => (
                  <div key={step} className="bg-[#f9f8f6] rounded-xl p-3">
                    <div className="w-7 h-7 rounded-full bg-[#1b4d3e] text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">{step}</div>
                    <p className="text-[10px] font-bold text-[#222]">{label}</p>
                    <p className="text-[9px] text-[#888] mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Shop natural herbal products at PJHERBAL CLINIC! Use my link: ${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={13} /> Share on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-[#e8e4dc] p-4">
          <p className="text-xs font-bold text-[#222] mb-3">Contact PJHERBAL CLINIC</p>
          <div className="space-y-2">
            {[
              { label: 'Head Office', number: '0763 963 644' },
              { label: 'Alt Line', number: '0750 405 256' },
              { label: 'Specialist', number: '0765 754 024' },
            ].map(({ label, number }) => (
              <a key={number} href={`tel:+255${number.replace(/\s/g, '').slice(1)}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f9f8f6] transition-colors">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#1b4d3e]" />
                  <span className="text-xs text-[#555]">{label}</span>
                </div>
                <span className="text-xs font-bold text-[#1b4d3e]">{number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
