'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Leaf, ArrowLeft, ShoppingCart, MessageCircle, AlertTriangle, Loader2,
  Plus, Minus, Shield, Truck, Star, Share2, Heart, ChevronRight, Package
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
  ingredients: string;
  usageInstructions: string;
  warnings: string;
  imageUrl: string;
  isActive: boolean;
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

export default function ProductDetailClient({ slug }: { slug: string }) {
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'usage' | 'warnings'>('description');
  const [addedRelated, setAddedRelated] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products').select('*').eq('slug', slug).eq('is_active', true).single();
      if (data) {
        const p: Product = {
          id: data.id, name: data.name, slug: data.slug, category: data.category,
          price: data.price, stockCount: data.stock_count, description: data.description || '',
          ingredients: data.ingredients || '', usageInstructions: data.usage_instructions || '',
          warnings: data.warnings || '', imageUrl: data.image_url || '', isActive: data.is_active,
        };
        setProduct(p);
        const { data: related } = await supabase
          .from('products')
          .select('id, name, slug, category, price, stock_count, image_url, is_active')
          .eq('is_active', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        if (related) {
          setRelatedProducts(related.map((r: any) => ({
            id: r.id, name: r.name, slug: r.slug, category: r.category,
            price: r.price, stockCount: r.stock_count, description: '',
            ingredients: '', usageInstructions: '', warnings: '',
            imageUrl: r.image_url || '', isActive: r.is_active,
          })));
        }
      }
      setLoading(false);
    };
    fetchProduct();
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
      const wishlist = JSON.parse(localStorage.getItem('pjherbal_wishlist') || '[]');
      setWishlisted(wishlist.includes(slug));
    } catch {}
  }, [slug]);

  const addToCart = (p?: Product) => {
    const target = p || product;
    if (!target) return;
    const qty = p ? 1 : quantity;
    try {
      const cart = JSON.parse(localStorage.getItem('pjherbal_cart') || '[]');
      const existing = cart.findIndex((i: any) => i.id === target.id);
      if (existing >= 0) {
        cart[existing].quantity = (cart[existing].quantity || 1) + qty;
      } else {
        cart.push({ id: target.id, name: target.name, price: target.price, quantity: qty, slug: target.slug, imageUrl: target.imageUrl, category: target.category });
      }
      localStorage.setItem('pjherbal_cart', JSON.stringify(cart));
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
      if (!p) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        setAddedRelated(prev => new Set([...prev, target.id]));
        setTimeout(() => setAddedRelated(prev => { const n = new Set(prev); n.delete(target.id); return n; }), 1500);
      }
    } catch {}
  };

  const toggleWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('pjherbal_wishlist') || '[]');
      const idx = wishlist.indexOf(slug);
      if (idx >= 0) wishlist.splice(idx, 1);
      else wishlist.push(slug);
      localStorage.setItem('pjherbal_wishlist', JSON.stringify(wishlist));
      setWishlisted(idx < 0);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1b4d3e]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center gap-4 px-4">
        <Leaf size={48} className="text-[#ccc]" />
        <h1 className="text-xl font-bold text-[#222]">Product Not Found</h1>
        <p className="text-sm text-[#888]">This product may have been removed or is no longer available.</p>
        <Link href="/shop" className="px-4 py-2 bg-[#1b4d3e] text-white rounded-lg text-sm font-semibold">Back to Shop</Link>
      </div>
    );
  }

  const tabs = [
    { key: 'description', label: 'Description', content: product.description },
    { key: 'ingredients', label: 'Ingredients', content: product.ingredients },
    { key: 'usage', label: 'How to Use', content: product.usageInstructions },
    { key: 'warnings', label: 'Warnings', content: product.warnings },
  ].filter(t => t.content);

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/shop" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium hidden sm:inline">Back to Shop</span>
          </Link>
          <Link href="/"><AppLogo size={28} /></Link>
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-[#f0f0f0] transition-colors">
            <ShoppingCart size={20} className="text-[#222]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1b4d3e] text-white text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-1.5 text-[10px] text-[#888]">
          <Link href="/" className="hover:text-[#1b4d3e]">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-[#1b4d3e]">Shop</Link>
          <ChevronRight size={10} />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1b4d3e]">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-[#555] truncate max-w-[120px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] aspect-square flex items-center justify-center relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={`${product.name} – PJHERBAL herbal supplement`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Leaf size={80} className="text-white/40" />
              )}
              {product.stockCount === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-sm font-bold text-white bg-red-600 px-4 py-2 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={toggleWishlist}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-[#888] hover:text-red-500'}`}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => { if (typeof navigator !== 'undefined' && navigator.share) navigator.share({ title: product.name, url: window.location.href }); }}
                className="w-9 h-9 rounded-full bg-white text-[#888] hover:text-[#1b4d3e] flex items-center justify-center shadow-md transition-all"
                title="Share product"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-600'}`}>
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-[#222] mt-2 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[#d4af37] text-[#d4af37]" />)}
                <span className="text-xs text-[#888] ml-1">(4.8 · 124 reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1b4d3e]">TZS {product.price.toLocaleString()}</span>
              <span className="text-xs text-[#4e9f3d] font-semibold bg-[#f0f7f4] px-2 py-0.5 rounded-full">Free Delivery</span>
            </div>

            {product.stockCount === 0 ? (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-xs text-red-700 font-semibold">Out of Stock – Check back soon</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <Package size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-semibold">
                  {product.stockCount < 10 ? `Only ${product.stockCount} left in stock` : 'In Stock'}
                </span>
              </div>
            )}

            {product.stockCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#e8e4dc] rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-[#f0f0f0] transition-colors">
                    <Minus size={14} className="text-[#555]" />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-[#222] border-x border-[#e8e4dc]">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))} className="px-3 py-2 hover:bg-[#f0f0f0] transition-colors">
                    <Plus size={14} className="text-[#555]" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${added ? 'bg-green-500 text-white' : 'bg-[#1b4d3e] text-white hover:bg-[#4e9f3d]'}`}
                >
                  <ShoppingCart size={16} />
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-[#f9f8f6] rounded-lg">
                <Truck size={13} className="text-[#1b4d3e]" />
                <span className="text-[10px] text-[#555] font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#f9f8f6] rounded-lg">
                <Shield size={13} className="text-[#1b4d3e]" />
                <span className="text-[10px] text-[#555] font-medium">100% Natural</span>
              </div>
            </div>

            <a
              href={`https://wa.me/255763963644?text=Hello%20PJHERBAL%2C%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#25D366] text-[#25D366] text-sm font-bold hover:bg-[#25D366] hover:text-white transition-all"
            >
              <MessageCircle size={16} />
              Order via WhatsApp
            </a>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
            <div className="flex border-b border-[#e8e4dc] overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-shrink-0 px-5 py-3 text-xs font-semibold transition-colors ${activeTab === tab.key ? 'text-[#1b4d3e] border-b-2 border-[#1b4d3e] bg-[#f0f7f4]' : 'text-[#888] hover:text-[#555]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-5">
              <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">
                {tabs.find(t => t.key === activeTab)?.content}
              </p>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-bold text-[#222] mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map(rp => (
                <div key={rp.id} className="bg-white rounded-xl border border-[#e8e4dc] overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/product/${rp.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center overflow-hidden">
                      {rp.imageUrl ? (
                        <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Leaf size={28} className="text-white/40" />
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${rp.slug}`}>
                      <p className="text-xs font-bold text-[#222] leading-tight line-clamp-2 hover:text-[#1b4d3e]">{rp.name}</p>
                    </Link>
                    <p className="text-xs font-bold text-[#1b4d3e] mt-1">TZS {rp.price.toLocaleString()}</p>
                    <button
                      onClick={() => addToCart(rp)}
                      disabled={rp.stockCount === 0}
                      className={`w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${addedRelated.has(rp.id) ? 'bg-green-500 text-white' : rp.stockCount === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#f0f7f4] text-[#1b4d3e] hover:bg-[#1b4d3e] hover:text-white'}`}
                    >
                      {addedRelated.has(rp.id) ? 'Added!' : rp.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
