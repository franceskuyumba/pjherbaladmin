'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Leaf, Search, Calendar, Tag, Loader2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  published_at: string;
  cover_image_url: string;
}

export default function BlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, author, category, published_at, cover_image_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(p =>
    !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/"><AppLogo size={30} /></Link>
          <h1 className="text-sm font-bold text-[#222]">Wellness Blog</h1>
          <Link href="/shop" className="text-xs font-semibold text-[#1b4d3e] hover:underline">Shop</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1b4d3e] to-[#4e9f3d] py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
          <Leaf size={22} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Herbal Wellness Blog</h2>
        <p className="text-white/70 text-sm mt-1 max-w-md mx-auto">Expert insights on natural health, herbal remedies, and wellness for Tanzanian families</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] bg-white"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={20} className="animate-spin text-[#1b4d3e]" />
            <span className="text-sm text-[#888]">Loading articles…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Leaf size={40} className="text-[#ccc] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#555]">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-xl border border-[#e8e4dc] overflow-hidden hover:shadow-md hover:border-[#1b4d3e]/30 transition-all duration-200">
                <div className="h-44 bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center overflow-hidden">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <Leaf size={40} className="text-white/40" />
                  )}
                </div>
                <div className="p-4">
                  {post.category && (
                    <span className="text-[9px] font-bold text-[#4e9f3d] bg-[#f0f7f4] px-2 py-0.5 rounded-full">{post.category}</span>
                  )}
                  <h3 className="text-sm font-bold text-[#222] mt-2 leading-tight group-hover:text-[#1b4d3e] transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-xs text-[#888] mt-1.5 line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-[#aaa]">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(post.published_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Tag size={10} /> {post.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
