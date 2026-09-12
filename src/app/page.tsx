'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, Star, Phone, MessageCircle, ChevronRight, Truck, Search, Plus, ArrowRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  description: string;
  imageUrl: string;
  rating?: number;
}

const PROMO_BANNERS = [
  {
    id: 1,
    headline: '🚚 FREE DELIVERY ACROSS TANZANIA',
    sub: 'No Minimum Order — All Regions Covered',
    bg: 'bg-[#1b4d3e]',
    accent: 'text-[#d4af37]',
    cta: 'Shop Now',
    href: '/shop',
  },
  {
    id: 2,
    headline: '🌿 100% Natural Herbal Products',
    sub: 'Trusted by 2,000+ Customers Nationwide',
    bg: 'bg-[#2d6a4f]',
    accent: 'text-[#f0e68c]',
    cta: 'View Products',
    href: '/shop',
  },
  {
    id: 3,
    headline: '💪 Men\'s Health Bestsellers',
    sub: 'ProstaHealth · VitalBoost · StaminaMax',
    bg: 'bg-[#1a3a2a]',
    accent: 'text-[#d4af37]',
    cta: 'Shop Men\'s Health',
    href: '/shop?category=Men%27s+Health',
  },
  {
    id: 4,
    headline: '🌸 Women\'s Wellness Collection',
    sub: 'FemVital · HormoBalance · GlowHerb',
    bg: 'bg-[#3d1a2a]',
    accent: 'text-[#f9c6d0]',
    cta: 'Shop Women\'s',
    href: '/shop?category=Women%27s+Wellness',
  },
];

const CATEGORIES = [
  { name: "Men\'s Health", icon: '💪', href: "/shop?category=Men%27s+Health" },
  { name: "Weight Mgmt", icon: '⚖️', href: "/shop?category=Weight+Management" },
  { name: "Energy", icon: '⚡', href: "/shop?category=Energy+%26+Immunity" },
  { name: "Women\'s", icon: '🌸', href: "/shop?category=Women%27s+Wellness" },
  { name: "Brain", icon: '🧠', href: "/shop?category=Brain+%26+Focus" },
  { name: "Detox", icon: '🌿', href: "/shop?category=Detox+%26+Digestion" },
  { name: "All", icon: '🛒', href: "/shop" },
];

export default function HomePage() {
  const supabase = createClient();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setBannerIndex(i => (i + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, category, price, original_price, stock_count, description, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (data) {
        setFeaturedProducts(data.map(r => ({
          id: r.id, name: r.name, slug: r.slug, category: r.category,
          price: r.price, originalPrice: r.original_price || 0,
          stockCount: r.stock_count, description: r.description || '',
          imageUrl: r.image_url || '', rating: 4.8,
        })));
      }
    };
    fetchProducts();

    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    } catch {}
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const addToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      const existing = cart.find((i: any) => i.id === product.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, slug: product.slug });
      }
      localStorage.setItem('pjherbal_cart', JSON.stringify(cart));
      setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    } catch {}
  };

  const banner = PROMO_BANNERS[bannerIndex];

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-2">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <AppLogo size={36} />
            <div>
              <p className="text-[11px] font-extrabold text-[#1b4d3e] leading-tight tracking-wide">PJHERBAL CLINIC</p>
              <p className="text-[8px] text-[#d4af37] font-semibold leading-tight tracking-widest uppercase hidden xs:block">Natural Care · Better Life</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-[#444]">
            <Link href="/shop" className="hover:text-[#1b4d3e] transition-colors">Shop</Link>
            <Link href="/about" className="hover:text-[#1b4d3e] transition-colors">About</Link>
            <Link href="/blog" className="hover:text-[#1b4d3e] transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-[#1b4d3e] transition-colors">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href="/cart" className="relative p-2.5 rounded-xl hover:bg-[#f0f0f0] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
              <ShoppingCart size={20} className="text-[#222]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-[#1b4d3e] text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1b4d3e] text-[#1b4d3e] text-xs font-semibold hover:bg-[#1b4d3e] hover:text-white transition-all min-h-[40px]">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── PROMO BANNER SLIDER ── */}
      <section className="relative overflow-hidden">
        <div className={`${banner.bg} transition-colors duration-500 px-4 py-4 sm:py-7`}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-sm sm:text-xl font-extrabold text-white leading-tight mb-1">
                {banner.headline}
              </p>
              <p className={`text-xs sm:text-sm ${banner.accent} font-medium`}>{banner.sub}</p>
            </div>
            <Link
              href={banner.href}
              className="flex-shrink-0 px-5 py-2.5 bg-[#d4af37] text-[#1a1a1a] font-bold text-xs rounded-xl hover:bg-[#c9a430] transition-all whitespace-nowrap min-h-[40px] flex items-center"
            >
              {banner.cta} →
            </Link>
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PROMO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === bannerIndex ? 'bg-[#d4af37] w-4' : 'bg-white/40 w-1.5'}`}
            />
          ))}
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="bg-white border-b border-[#e8e4dc] px-3 py-2.5">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded-xl focus-within:border-[#1b4d3e] focus-within:ring-2 focus-within:ring-[#1b4d3e]/20 transition-all">
              <Search size={15} className="text-[#999] flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search herbal products…"
                className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#aaa] outline-none min-w-0"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1b4d3e] text-white text-xs font-bold rounded-xl hover:bg-[#163d30] transition-colors whitespace-nowrap min-h-[42px]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── FREE DELIVERY STRIP ── */}
      <div className="bg-[#f0f7f4] border-b border-[#c8e6c9] px-3 py-2 flex items-center justify-center gap-2">
        <Truck size={12} className="text-[#1b4d3e] flex-shrink-0" />
        <p className="text-[11px] font-semibold text-[#1b4d3e] text-center">FREE DELIVERY ACROSS TANZANIA — No Minimum Order</p>
      </div>

      {/* ── CATEGORIES HORIZONTAL SCROLL ── */}
      <section className="bg-white border-b border-[#e8e4dc] py-2.5 px-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-[#e8e4dc] bg-[#f9f8f6] hover:border-[#1b4d3e] hover:bg-[#f0f7f4] active:bg-[#e8f5e9] transition-all text-center min-w-[60px] min-h-[56px] justify-center"
              >
                <span className="text-lg leading-none">{cat.icon}</span>
                <span className="text-[9px] font-semibold text-[#333] leading-tight whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BESTSELLER PRODUCTS ── */}
      <section className="py-4 px-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#1b4d3e]">🔥 Bestsellers</h2>
              <p className="text-[10px] text-[#888] mt-0.5">Most ordered this week</p>
            </div>
            <Link href="/shop" className="text-xs font-semibold text-[#1b4d3e] flex items-center gap-0.5 hover:underline py-1 px-2 -mr-2">
              View All <ChevronRight size={13} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-xl border border-[#e8e4dc] overflow-hidden animate-pulse bg-white">
                  <div className="h-40 bg-[#f0f0f0]" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 bg-[#f0f0f0] rounded w-3/4" />
                    <div className="h-2.5 bg-[#f0f0f0] rounded w-1/2" />
                    <div className="h-8 bg-[#f0f0f0] rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl border border-[#e8e4dc] overflow-hidden hover:shadow-md hover:border-[#1b4d3e]/40 active:scale-[0.98] transition-all duration-200 flex flex-col"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex flex-col flex-1"
                  >
                    {/* Product Image */}
                    <div className="relative h-40 sm:h-44 bg-[#e8f5e9] flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={`${product.name} — PJ Herbal Clinic`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl">🌿</span>
                      )}
                      {product.stockCount === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
                        </div>
                      )}
                      {product.stockCount > 0 && product.stockCount <= 5 && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full">Low Stock</span>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <p className="text-[9px] font-semibold text-[#4e9f3d] mb-0.5 uppercase tracking-wide truncate">{product.category}</p>
                      <h3 className="text-xs font-bold text-[#222] leading-tight line-clamp-2 group-hover:text-[#1b4d3e] transition-colors flex-1 mb-1.5">{product.name}</h3>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={9} className={s <= 4 ? 'fill-[#d4af37] text-[#d4af37]' : 'text-[#ddd]'} />
                        ))}
                        <span className="text-[9px] text-[#888] ml-0.5">(4.8)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <p className="text-sm font-extrabold text-[#1b4d3e]">
                          TZS {product.price.toLocaleString()}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-[10px] text-[#aaa] line-through">
                            {product.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Actions — outside Link to avoid nested <a> */}
                  <div className="px-2.5 pb-2.5 flex gap-1.5">
                    <button
                      onClick={e => addToCart(product, e)}
                      disabled={product.stockCount === 0}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#1b4d3e] text-white text-[10px] font-bold rounded-lg hover:bg-[#163d30] active:bg-[#0f2d22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
                    >
                      <Plus size={11} /> Add to Cart
                    </button>
                    <a
                      href={`https://wa.me/255765754024?text=Hello%20PJHERBAL%2C%20I%20want%20to%20order%3A%20${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-2.5 py-2 bg-[#25D366] text-white text-[10px] font-bold rounded-lg hover:bg-[#1ebe5d] active:bg-[#17a84f] transition-colors min-h-[36px] min-w-[36px]"
                      title="Order via WhatsApp"
                    >
                      <MessageCircle size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b4d3e] text-white font-bold rounded-xl hover:bg-[#163d30] transition-all text-sm min-h-[48px]"
            >
              Browse All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="bg-white border-t border-b border-[#e8e4dc] py-4 px-3">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2">
          {[
            { icon: '🚚', label: 'Free Delivery', sub: 'All Tanzania' },
            { icon: '🌿', label: '100% Natural', sub: 'No chemicals' },
            { icon: '✅', label: 'Certified', sub: 'Quality assured' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1 py-1">
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-bold text-[#222] leading-tight">{label}</p>
              <p className="text-[10px] text-[#888]">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="py-4 px-3 bg-[#1b4d3e]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-white font-bold text-sm">Need Help? Contact Us</p>
            <p className="text-white/70 text-xs mt-0.5">PJHERBAL CLINIC – Segerea Branch, Dar es Salaam</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:+255765754024" className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-medium hover:bg-white/20 transition-colors min-h-[42px]">
              <Phone size={13} /> 0765 754 024
            </a>
            <a
              href="https://wa.me/255765754024"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-[#d4af37] rounded-xl text-[#222] text-xs font-bold hover:bg-[#c9a430] transition-colors min-h-[42px]"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] text-white/60 py-8 px-3 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <AppLogo size={30} />
                <div>
                  <p className="text-white font-bold text-xs leading-tight">PJHERBAL CLINIC</p>
                  <p className="text-[#d4af37] text-[9px] font-semibold leading-tight">Natural Care · Better Life</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed">Natural herbal wellness products for Tanzanian families. Trusted since 2018.</p>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-2">Shop</p>
              <div className="space-y-2">
                {["Men's Health", "Women's Wellness", "Weight Management", "All Products"].map(l => (
                  <Link key={l} href="/shop" className="block text-xs hover:text-white transition-colors py-0.5">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-2">Company</p>
              <div className="space-y-2">
                {[['About Us', '/about'], ['Blog', '/blog'], ['Contact', '/contact'], ['Privacy Policy', '/privacy-policy']].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-xs hover:text-white transition-colors py-0.5">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-2">Contact</p>
              <div className="space-y-2 text-xs">
                <p>Head Office: 0763 963 644</p>
                <p>Alt: 0750 405 256</p>
                <p>Specialist: 0765 754 024</p>
                <p>Segerea Branch, DSM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p>© 2026 PJHERBAL CLINIC – Segerea Branch. All rights reserved.</p>
            <div className="flex gap-3">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}