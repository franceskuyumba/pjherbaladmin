'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Search, Leaf, AlertTriangle, Loader2, MessageCircle, ShoppingCart, X,
  SlidersHorizontal, ChevronDown, Star, Truck, Filter
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stockCount: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  badge?: 'bestseller' | 'new' | 'low_stock';
}

function toProduct(row: any): Product {
  const createdAt = row.created_at || '';
  const isNew = createdAt && (Date.now() - new Date(createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000;
  const isLowStock = row.stock_count > 0 && row.stock_count < 10;
  return {
    id: row.id, name: row.name, slug: row.slug, category: row.category,
    price: row.price, stockCount: row.stock_count, description: row.description || '',
    imageUrl: row.image_url || '', isActive: row.is_active, createdAt,
    badge: isLowStock ? 'low_stock' : isNew ? 'new' : undefined,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Men's Health": 'bg-emerald-50 text-emerald-700',
  "Women's Wellness": 'bg-pink-50 text-pink-700',
  "Weight Management": 'bg-orange-50 text-orange-700',
  "Brain & Focus": 'bg-purple-50 text-purple-700',
  "Energy & Immunity": 'bg-yellow-50 text-yellow-700',
  "Detox & Digestion": 'bg-teal-50 text-teal-700',
  "Pain Relief": 'bg-red-50 text-red-700',
  "General Wellness": 'bg-green-50 text-green-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  "Men's Health": '💪',
  "Women's Wellness": '🌸',
  "Weight Management": '⚖️',
  "Brain & Focus": '🧠',
  "Energy & Immunity": '⚡',
  "Detox & Digestion": '🌿',
  "Pain Relief": '💊',
  "General Wellness": '🍃',
};

const CATEGORIES = [
  "Men\'s Health", "Women\'s Wellness", "Weight Management",
  "Energy & Immunity", "Brain & Focus", "Detox & Digestion", "Pain Relief", "General Wellness"
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'popular', label: 'Popular' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under TZS 30,000', min: 0, max: 30000 },
  { label: 'TZS 30,000 – 60,000', min: 30000, max: 60000 },
  { label: 'TZS 60,000 – 100,000', min: 60000, max: 100000 },
  { label: 'Above TZS 100,000', min: 100000, max: Infinity },
];

function BadgeChip({ badge }: { badge: 'bestseller' | 'new' | 'low_stock' }) {
  if (badge === 'bestseller') return (
    <span className="absolute top-2 left-2 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">⭐ Bestseller</span>
  );
  if (badge === 'new') return (
    <span className="absolute top-2 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full">✨ New</span>
  );
  if (badge === 'low_stock') return (
    <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
      <AlertTriangle size={8} /> Low Stock
    </span>
  );
  return null;
}

function ShopContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [cartCount, setCartCount] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data || []).map(toProduct));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase.channel('shop_products_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
    } catch {}
  }, []);

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      const existing = cart.findIndex((i: any) => i.id === product.id);
      if (existing >= 0) {
        cart[existing].quantity = (cart[existing].quantity || 1) + 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, slug: product.slug, imageUrl: product.imageUrl, category: product.category });
      }
      localStorage.setItem('pjherbal_cart', JSON.stringify(cart));
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
      setAddedIds(prev => new Set([...prev, product.id]));
      setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
    } catch {}
  };

  const selectedPriceRange = PRICE_RANGES[priceRange];

  const filtered = useMemo(() => {
    let data = [...products];
    if (categoryFilter !== 'all') data = data.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (priceRange > 0) {
      data = data.filter(p => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max);
    }
    if (availabilityFilter === 'in_stock') data = data.filter(p => p.stockCount > 0);
    if (availabilityFilter === 'out_of_stock') data = data.filter(p => p.stockCount === 0);

    switch (sortBy) {
      case 'price_asc': data.sort((a, b) => a.price - b.price); break;
      case 'price_desc': data.sort((a, b) => b.price - a.price); break;
      case 'name_asc': data.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: break;
    }
    return data;
  }, [products, search, categoryFilter, sortBy, priceRange, availabilityFilter]);

  const activeFilterCount = [
    categoryFilter !== 'all',
    priceRange > 0,
    availabilityFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCategoryFilter('all');
    setPriceRange(0);
    setAvailabilityFilter('all');
    setSortBy('newest');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <AppLogo size={32} />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#222]">PJHERBAL CLINIC</p>
              <p className="text-[9px] text-[#888]">Segerea Branch</p>
            </div>
          </Link>
          <div className="flex-1 max-w-sm relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search herbal products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-[#e0e0e0] bg-[#f9f8f6] focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X size={12} className="text-[#999]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors md:hidden ${
                activeFilterCount > 0 ? 'border-[#1b4d3e] bg-[#f0f7f4] text-[#1b4d3e]' : 'border-[#e0e0e0] text-[#555]'
              }`}
            >
              <Filter size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1b4d3e] text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-[#f0f0f0] transition-colors">
              <ShoppingCart size={20} className="text-[#222]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1b4d3e] text-white text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1b4d3e] to-[#4e9f3d] py-5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Herbal Shop</h1>
            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1.5">
              <Truck size={11} /> FREE delivery across Tanzania · No minimum order
            </p>
          </div>
          <a
            href="https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20need%20help%20choosing%20a%20product."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            <MessageCircle size={13} />
            <span className="hidden sm:inline">Need Help?</span>
          </a>
        </div>
      </div>

      {/* Category Slider */}
      <div className="bg-white border-b border-[#e8e4dc] px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              categoryFilter === 'all' ? 'bg-[#1b4d3e] text-white' : 'bg-[#f0f0f0] text-[#555] hover:bg-[#e8e8e8]'
            }`}
          >
            All Products
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                categoryFilter === cat ? 'bg-[#1b4d3e] text-white' : 'bg-[#f0f0f0] text-[#555] hover:bg-[#e8e8e8]'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Desktop Filters + Sort Bar */}
        <div className="hidden md:flex items-center justify-between gap-4 mb-5 bg-white rounded-xl border border-[#e8e4dc] px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-[#555] flex items-center gap-1.5">
              <SlidersHorizontal size={13} /> Filters:
            </span>
            <div className="relative">
              <select
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="text-xs border border-[#e0e0e0] rounded-lg px-3 py-1.5 bg-white text-[#444] focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] appearance-none pr-7"
              >
                {PRICE_RANGES.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value as any)}
                className="text-xs border border-[#e0e0e0] rounded-lg px-3 py-1.5 bg-white text-[#444] focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] appearance-none pr-7"
              >
                <option value="all">All Availability</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[#888]">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs border border-[#e0e0e0] rounded-lg px-3 py-1.5 bg-white text-[#444] focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] appearance-none pr-7"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Sort Bar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <p className="text-xs text-[#888]">
            {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs border border-[#e0e0e0] rounded-lg px-3 py-1.5 bg-white text-[#444] focus:outline-none appearance-none pr-7"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[#e8e4dc] overflow-hidden animate-pulse">
                <div className="h-40 bg-[#f0f0f0]" />
                <div className="p-3 space-y-2">
                  <div className="h-2.5 bg-[#f0f0f0] rounded w-1/2" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-3/4" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
                  <div className="h-8 bg-[#f0f0f0] rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#f0f7f4] flex items-center justify-center">
              <Search size={28} className="text-[#1b4d3e]/30" />
            </div>
            <p className="text-base font-semibold text-[#555]">No products found</p>
            <p className="text-xs text-[#888]">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="text-xs text-[#1b4d3e] font-semibold hover:underline flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          </div>
        ) : (
          <>
            <p className="hidden md:block text-xs text-[#888] mb-4">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} {categoryFilter !== 'all' ? `in ${categoryFilter}` : 'available'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(product => (
                <div key={product.id} className="group bg-white rounded-xl border border-[#e8e4dc] overflow-hidden hover:shadow-md hover:border-[#1b4d3e]/30 transition-all duration-200 flex flex-col">
                  <Link href={`/product/${product.slug}`} className="block">
                    <div className="h-40 bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={`${product.name} herbal supplement`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Leaf size={32} className="text-white/50" />
                      )}
                      {product.stockCount === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
                        </div>
                      )}
                      {product.badge && product.stockCount > 0 && <BadgeChip badge={product.badge} />}
                    </div>
                    <div className="p-3 flex-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-600'}`}>
                        {product.category}
                      </span>
                      <h3 className="text-xs font-bold text-[#222] mt-1.5 leading-tight line-clamp-2 group-hover:text-[#1b4d3e] transition-colors">{product.name}</h3>
                      {product.description && (
                        <p className="text-[10px] text-[#888] mt-1 line-clamp-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={9} className="fill-[#d4af37] text-[#d4af37]" />
                        ))}
                        <span className="text-[9px] text-[#aaa] ml-1">(4.8)</span>
                      </div>
                      <p className="text-sm font-bold text-[#1b4d3e] mt-1.5">TZS {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-auto">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stockCount === 0}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          product.stockCount === 0
                            ? 'bg-[#f0f0f0] text-[#bbb] cursor-not-allowed'
                            : addedIds.has(product.id)
                            ? 'bg-[#4e9f3d] text-white'
                            : 'bg-[#1b4d3e] text-white hover:bg-[#163d30]'
                        }`}
                      >
                        {product.stockCount === 0 ? 'Out of Stock' : addedIds.has(product.id) ? '✓ Added!' : 'Add to Cart'}
                      </button>
                      <a
                        href={`https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20want%20to%20inquire%20about%20${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#f0fdf4] border border-[#dcfce7] text-[#25D366] hover:bg-[#dcfce7] transition-colors"
                        title="WhatsApp inquiry"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#222]">Filters & Sort</h2>
              <button onClick={() => setFilterDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-[#f0f0f0]">
                <X size={18} className="text-[#555]" />
              </button>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-[#444] mb-2.5 uppercase tracking-wide">Sort By</p>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors text-left ${
                      sortBy === opt.value ? 'border-[#1b4d3e] bg-[#f0f7f4] text-[#1b4d3e]' : 'border-[#e0e0e0] text-[#555]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-[#444] mb-2.5 uppercase tracking-wide">Price Range</p>
              <div className="space-y-2">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setPriceRange(i)}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors text-left ${
                      priceRange === i ? 'border-[#1b4d3e] bg-[#f0f7f4] text-[#1b4d3e]' : 'border-[#e0e0e0] text-[#555]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-[#444] mb-2.5 uppercase tracking-wide">Availability</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'in_stock', label: 'In Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAvailabilityFilter(opt.value as any)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      availabilityFilter === opt.value ? 'border-[#1b4d3e] bg-[#f0f7f4] text-[#1b4d3e]' : 'border-[#e0e0e0] text-[#555]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { clearFilters(); setFilterDrawerOpen(false); }}
                className="flex-1 py-3 rounded-xl border border-[#e0e0e0] text-sm font-semibold text-[#555]"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#1b4d3e] text-white text-sm font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center"><Loader2 size={28} className="animate-spin text-[#1b4d3e]" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
